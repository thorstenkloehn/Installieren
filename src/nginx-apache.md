# nginx als Proxy vor Apache

nginx nimmt die Anfragen auf Port 80 an und reicht sie an Apache weiter. Apache lauscht dabei nur lokal auf Port 8080. So laufen beide Webserver auf demselben Rechner, und Programme, die Apache brauchen (z. B. der [Tileserver](tileserver.md) mit `mod_tile`), sind trotzdem ohne `:8080` in der Adresse erreichbar.

```text
Browser ──► nginx (Port 80) ──► Apache (127.0.0.1:8080)
```

**Voraussetzung:** nginx ist installiert und läuft (siehe [nginx](nginx.md)).

> **Warum kein Unix-Socket?** Apache kann nur auf TCP-Ports lauschen, nicht auf einem Unix-Socket. Die Anweisung `Listen` nimmt nur eine IP-Adresse und einen Port an. Mit `127.0.0.1` ist Apache trotzdem nur vom eigenen Rechner aus erreichbar.

## Apache auf Port 8080 einrichten

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von Apache aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Apache installieren

Ist Apache schon installiert (z. B. durch den Tileserver), meldet `apt` nur, dass das Paket bereits die neueste Version hat.

```bash
sudo apt install apache2
```

Belegt nginx schon Port 80, kann Apache nach der Installation nicht starten. Dann erscheint `Address already in use`. Das ist an dieser Stelle normal und wird in den nächsten Schritten behoben.

### 3. Apache nur lokal auf Port 8080 lauschen lassen

Ändert in `ports.conf` die Zeile `Listen 80` (oder `Listen 8080`) zu `Listen 127.0.0.1:8080`. Danach ist Port 80 für nginx frei, und Apache nimmt nur noch Verbindungen vom eigenen Rechner an. Von außen kommt man nur noch über nginx an Apache heran.

```bash
sudo nano /etc/apache2/ports.conf
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `Listen` und drücke <kbd>Enter</kbd>. Die erste Fundstelle ist die Zeile `Listen 80` oder `Listen 8080`, die Zeilen mit `Listen 443` weiter unten bleiben unverändert. Ändere die gefundene Zeile so, dass sie lautet:

```apache
Listen 127.0.0.1:8080
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Ausgabe lautet `Listen 127.0.0.1:8080`.

```bash
grep '^Listen' /etc/apache2/ports.conf
```

### 4. Die Standardseite von Apache auf Port 8080 umstellen

Der `VirtualHost` muss zum neuen Port passen. Sonst findet Apache für Anfragen auf Port 8080 keine passende Seite. 
```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `VirtualHost` und drücke <kbd>Enter</kbd>. Steht dort schon `*:8080`, ist nichts zu tun. Ändere die gefundene Zeile so, dass sie lautet:

```apache
<VirtualHost *:8080>
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Ausgabe lautet `<VirtualHost *:8080>`.

```bash
grep '<VirtualHost' /etc/apache2/sites-available/000-default.conf
```

### 5. Das Modul `remoteip` einschalten

Alle Anfragen kommen jetzt von nginx, also von `127.0.0.1`. Ohne dieses Modul stünde in Apaches Logdateien bei jeder Anfrage diese Adresse. Mit `remoteip` übernimmt Apache die echte Adresse des Besuchers, die nginx mitschickt.

```bash
sudo a2enmod remoteip
```

### 6. `remoteip` konfigurieren

`RemoteIPHeader` gibt an, in welchem Header nginx die echte Adresse mitschickt. Wegen `RemoteIPInternalProxy` glaubt Apache diesem Header nur, wenn die Anfrage von `127.0.0.1` kommt. Sonst könnte jeder Besucher eine falsche Adresse vortäuschen.

```bash
sudo nano /etc/apache2/conf-available/remoteip.conf
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```apache
RemoteIPHeader X-Forwarded-For
RemoteIPInternalProxy 127.0.0.1
```

### 7. Die Konfiguration einbinden

Schaltet die Datei aus Schritt 6 ein. Apache liest nur Dateien aus `conf-enabled`.

```bash
sudo a2enconf remoteip
```

### 8. Die Apache-Konfiguration testen

Findet Tippfehler, bevor Apache neu startet.

```bash
sudo apache2ctl configtest
```

**Prüfen:** Die Ausgabe endet mit `Syntax OK`.

### 9. Apache neu starten

Erst nach einem Neustart gilt die neue `Listen`-Adresse. `reload` reicht dafür nicht.

```bash
sudo systemctl restart apache2
```

**Prüfen:** In der Ausgabe steht `127.0.0.1:8080` (nicht `*:8080` oder `0.0.0.0:8080`) mit dem Prozess `apache2`.

```bash
sudo ss -tlnp | grep ':8080'
```

### 10. Apache direkt aufrufen

Zeigt, dass Apache auf Port 8080 antwortet, noch ohne nginx.

```bash
curl -I http://127.0.0.1:8080
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 200 OK`, weiter unten steht `Server: Apache`.

## nginx als Proxy einrichten

### 11. Proxy-Einstellungen als Baustein anlegen

Die Einstellungen kommen in eine eigene Datei unter `snippets`. So kann man sie in jedem `location`-Block mit einer einzigen Zeile einbinden.

- `proxy_pass` gibt an, wohin nginx die Anfrage weiterreicht.
- Die `proxy_set_header`-Zeilen schicken den ursprünglichen Hostnamen, die Adresse des Besuchers und das Protokoll (`http` oder `https`) an Apache mit. Ohne diese Zeilen sähe Apache nur `127.0.0.1`.
- `proxy_read_timeout` lässt Apache bis zu 120 Sekunden Zeit für eine Antwort. Der Standardwert von 60 Sekunden reicht nicht immer, zum Beispiel wenn der Tileserver eine Kachel erst noch zeichnen muss.

```bash
sudo nano /etc/nginx/snippets/apache-proxy.conf
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
proxy_pass http://127.0.0.1:8080;
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_read_timeout 120s;
```

### 12. Die Standardseite von nginx öffnen

In dieser Datei legt man fest, welche Adressen nginx an Apache weiterreicht.

```bash
sudo nano /etc/nginx/sites-available/default
```

### 13. Die Weiterleitung eintragen

Suche im Block `server { … }` den Abschnitt `location / { … }`. Es gibt zwei Möglichkeiten.

**Variante A – alles an Apache:** Ersetze die Zeile `try_files $uri $uri/ =404;` durch die `include`-Zeile. nginx liefert danach selbst keine Dateien mehr aus, sondern reicht jede Anfrage an Apache weiter.

```nginx
	location / {
		include snippets/apache-proxy.conf;
	}
```

**Variante B – nur einen Pfad an Apache:** Lass `location / { … }` unverändert und füge darunter einen eigenen Block ein. Nur Adressen, die mit diesem Pfad beginnen, gehen an Apache, alles andere liefert nginx wie bisher selbst aus. Beim [Tileserver](tileserver.md) ist das der Kachelpfad `/osm/`.

```nginx
	location /osm/ {
		include snippets/apache-proxy.conf;
	}
```

Speichern mit `Strg`+`O` und `Enter`, beenden mit `Strg`+`X`.

### 14. Die nginx-Konfiguration testen

Findet Tippfehler, bevor nginx neu geladen wird.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 15. nginx neu laden

Übernimmt die neue Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

## Prüfen

### 16. Eine Anfrage über nginx schicken

Die Anfrage geht an Port 80, also an nginx. Bei Variante B hängst du den Pfad an, beim Tileserver zum Beispiel `http://localhost/osm/0/0/0.png`.

```bash
curl -I http://localhost/
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 200 OK`, und bei `Server:` steht `nginx`, denn nach außen antwortet immer nginx.

### 17. Im Log von Apache nachsehen

Hier sieht man, ob die Anfrage aus Schritt 16 wirklich bei Apache angekommen ist.

```bash
sudo tail -n 3 /var/log/apache2/access.log
```

**Prüfen:** Die letzte Zeile enthält die Anfrage aus Schritt 16 (z. B. `"HEAD / HTTP/1.1"`) mit `curl` als Programmnamen. Am Zeilenanfang steht die Adresse des Besuchers, die nginx mitgeschickt hat. Bei einem Test auf dem eigenen Rechner ist das `::1` oder `127.0.0.1`, bei einem anderen Rechner im Netz dessen IP-Adresse. Fehlt sie, hat nginx die Anfrage selbst beantwortet. Dann den `location`-Block aus Schritt 13 prüfen.

### 18. Prüfen, dass Apache von außen nicht erreichbar ist

Ersetze `192.168.1.10` durch die IP-Adresse deines Rechners im Netzwerk (anzeigen mit `hostname -I`).

```bash
curl -I --max-time 5 http://192.168.1.10:8080
```

**Prüfen:** Der Befehl meldet `Connection refused` oder `Failed to connect`. Apache ist also nur über nginx erreichbar.

## Fehlersuche

- **`502 Bad Gateway`:** nginx erreicht Apache nicht. Meist läuft Apache nicht oder lauscht auf einem anderen Port. Prüfen mit `systemctl status apache2` und `sudo ss -tlnp | grep ':8080'`.
- **`504 Gateway Timeout`:** Apache antwortet zu langsam. Den Wert `proxy_read_timeout` in `/etc/nginx/snippets/apache-proxy.conf` erhöhen, danach nginx neu laden.
- **Port 8080 ist schon belegt:** Apache startet nicht und meldet `Address already in use`. Ein anderes Programm lauscht dann schon auf 8080. Welches, zeigt `sudo ss -tlnp | grep ':8080'`. Dann für Apache einen freien Port wählen und ihn in `ports.conf`, `000-default.conf` und `apache-proxy.conf` eintragen.

## Rückgängig machen

### 1. Die Weiterleitung aus nginx entfernen

Öffne die Datei wieder und mache die Änderung aus Schritt 13 rückgängig: Bei Variante A kommt `try_files $uri $uri/ =404;` zurück an die Stelle der `include`-Zeile, bei Variante B wird der zusätzliche `location`-Block gelöscht.

```bash
sudo nano /etc/nginx/sites-available/default
```

### 2. Den Proxy-Baustein löschen

Die Datei wird nicht mehr gebraucht.

```bash
sudo rm /etc/nginx/snippets/apache-proxy.conf
```

### 3. nginx testen und neu laden

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 4. `remoteip` in Apache ausschalten

Ohne nginx davor wird das Modul nicht mehr gebraucht.

```bash
sudo a2disconf remoteip && sudo a2dismod remoteip
```

```bash
sudo rm /etc/apache2/conf-available/remoteip.conf
```

### 5. Apache wieder auf allen Adressen lauschen lassen

Apache bleibt auf Port 8080, ist aber wieder aus dem Netzwerk erreichbar. Port 80 bleibt für nginx frei.

```bash
sudo nano /etc/apache2/ports.conf
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `Listen 127` und drücke <kbd>Enter</kbd>. Ändere die gefundene Zeile so, dass sie lautet:

```apache
Listen 8080
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

```bash
sudo systemctl restart apache2
```

**Prüfen:** In der Ausgabe steht `*:8080`.

```bash
sudo ss -tlnp | grep ':8080'
```

Soll Apache ganz verschwinden: `sudo apt purge apache2` und danach `sudo apt autoremove`. Das aber nur, wenn kein anderes Programm (z. B. der Tileserver) Apache noch braucht.
