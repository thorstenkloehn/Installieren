# nginx auf dem Produktionsserver

Auf einem Server im Internet liefert nginx Websites dauerhaft und verschlüsselt an Besucher aus. Diese Anleitung richtet nginx auf einem frischen Ubuntu-Server für den echten Betrieb ein: mit Firewall, automatischen Sicherheitsupdates, Wildcard-Zertifikat von Let's Encrypt und einer abgesicherten Grundkonfiguration. Als Beispiel dient die Domain `wissen-ahrensburg.de`.

## Vorbemerkungen

- **Unterschied zur Anleitung [nginx](nginx.md):** Dort läuft nginx auf dem eigenen Rechner zum Testen. Hier ist der Server aus dem Internet erreichbar. Deshalb kommen Firewall, HTTPS und Schutz vor fremden Anfragen dazu.
- **Voraussetzungen:**
  - Ein Server mit Ubuntu 26.04 LTS, auf den du per SSH mit einem Benutzer mit `sudo`-Rechten zugreifst.
  - Die Domain `wissen-ahrensburg.de` zeigt per `A`-Eintrag (IPv4) und, falls vorhanden, `AAAA`-Eintrag (IPv6) auf den Server. Dasselbe gilt für `www` oder für `*`, wenn beliebige Subdomains auf den Server zeigen sollen.
- **Eigene Domain:** Ersetze `wissen-ahrensburg.de` in allen Befehlen und Dateien durch deine Domain.
- **apt statt Snap:** Certbot gibt es auch als Snap-Paket. Ubuntu 26.04 bringt Certbot aber selbst mit. Das `apt`-Paket bekommt Sicherheitsupdates zusammen mit dem restlichen System, und `snapd` wird dafür nicht gebraucht.
- **Alle Befehle laufen auf dem Server**, also in der SSH-Sitzung, nicht auf deinem eigenen Rechner.

## System vorbereiten

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aller Pakete kennt.

```bash
sudo apt update
```

### 2. Installierte Pakete aktualisieren

Ein Server im Internet sollte vor der Einrichtung auf dem neuesten Stand sein, damit keine bekannten Sicherheitslücken offen sind.

```bash
sudo apt upgrade
```

**Prüfen:** Die Frage nach der Installation mit <kbd>J</kbd> bzw. <kbd>Y</kbd> bestätigen. Meldet `apt` danach, dass ein Neustart nötig ist (Datei `/var/run/reboot-required` existiert), starte den Server mit `sudo reboot` neu und melde dich wieder an.

### 3. Automatische Sicherheitsupdates installieren

`unattended-upgrades` spielt Sicherheitsupdates jeden Tag von selbst ein, auch für nginx und Certbot. Auf Ubuntu-Servern ist das Paket meist schon vorhanden, der Befehl schadet dann nicht.

```bash
sudo apt install unattended-upgrades
```

### 4. Automatische Updates einschalten

Der Dialog fragt, ob Updates automatisch installiert werden sollen. Wähle **Ja**.

```bash
sudo dpkg-reconfigure -plow unattended-upgrades
```

**Prüfen:** Die Datei enthält zwei Zeilen, die beide mit `"1";` enden.

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
```

## nginx installieren

### 5. nginx installieren

Installiert nginx aus den Ubuntu-Paketquellen. Der Dienst startet sofort und beim Hochfahren des Servers automatisch.

```bash
sudo apt install nginx
```

**Prüfen:** Die Versionsnummer wird angezeigt.

```bash
nginx -v
```

### 6. Autostart prüfen

Auf einem Produktionsserver muss nginx nach jedem Neustart von selbst laufen.

```bash
systemctl is-enabled nginx
```

**Prüfen:** Die Ausgabe lautet `enabled`. Steht dort `disabled`, schalte den Autostart mit `sudo systemctl enable nginx` ein.

### 7. Standardseite ausschalten

Die mitgelieferte Seite „Welcome to nginx!“ würde sonst jedem angezeigt, der die IP-Adresse des Servers aufruft. Gelöscht wird nur der Link in `sites-enabled`. Das Original in `sites-available` bleibt als Vorlage erhalten.

```bash
sudo rm /etc/nginx/sites-enabled/default
```

## Firewall einrichten

### 8. SSH in der Firewall erlauben

**Wichtig:** Dieser Schritt muss vor dem Einschalten der Firewall kommen. Sonst sperrt `ufw` die laufende SSH-Verbindung, und du kommst nicht mehr auf den Server.

```bash
sudo ufw allow OpenSSH
```

### 9. HTTP und HTTPS in der Firewall erlauben

Das Profil `Nginx Full` wurde mit nginx installiert und öffnet Port 80 (HTTP) und Port 443 (HTTPS).

```bash
sudo ufw allow 'Nginx Full'
```

### 10. Firewall einschalten

Ab jetzt sind nur noch SSH, HTTP und HTTPS von außen erreichbar. Die Rückfrage mit <kbd>y</kbd> bestätigen.

```bash
sudo ufw enable
```

**Prüfen:** Die Liste enthält `OpenSSH` und `Nginx Full`, jeweils mit `ALLOW`.

```bash
sudo ufw status
```

## Grundkonfiguration absichern

### 11. Eigene Einstellungen für alle Websites anlegen

Dateien in `/etc/nginx/conf.d/` gelten für alle Websites auf dem Server. Eine eigene Datei ist besser, als `nginx.conf` direkt zu ändern, weil ein Update von nginx sie nicht anfasst.

- `server_tokens off` blendet die Versionsnummer von nginx in Fehlerseiten und im Header `Server` aus. Angreifer sehen so nicht sofort, welche Version läuft.
- `client_max_body_size` begrenzt, wie groß hochgeladene Daten sein dürfen. `10m` reicht für Formulare und kleine Uploads.
- Die `gzip`-Zeilen komprimieren Text, CSS, JavaScript und JSON. Seiten laden dadurch schneller. `gzip on` steht bei Ubuntu schon in `nginx.conf` und fehlt deshalb hier.

```bash
sudo nano /etc/nginx/conf.d/produktion.conf
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
# Gilt für alle Websites auf diesem Server
server_tokens off;
client_max_body_size 10m;

gzip_vary on;
gzip_proxied any;
gzip_comp_level 5;
gzip_types text/plain text/css text/xml application/json application/javascript application/xml image/svg+xml;
```

### 12. Konfiguration testen

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Meldet nginx `"gzip_types" directive is duplicate` (oder eine andere `gzip`-Zeile), ist diese Zeile in `/etc/nginx/nginx.conf` schon aktiv. Lösche sie dann in `produktion.conf`.

## Wildcard-Zertifikat holen

Die Einzelheiten zum Nachweis über DNS stehen in der Anleitung [Wildcard-Zertifikat mit Certbot](certbot-wildcard.md). Hier folgt die Kurzfassung für den Server.

### 13. Certbot installieren

`certbot` beantragt das Zertifikat, `bind9-dnsutils` liefert den Befehl `dig` zum Prüfen der DNS-Einträge.

```bash
sudo apt install certbot bind9-dnsutils
```

**Prüfen:** Die Version wird angezeigt.

```bash
certbot --version
```

### 14. Zertifikat anfordern

nginx muss dafür **nicht** gestoppt werden. Der Nachweis läuft über `TXT`-Einträge im DNS und nicht über den Webserver. Anhalten müsste man nginx nur beim Verfahren `--standalone`, bei dem Certbot selbst Port 80 belegt.

- `--cert-name` legt den Ordner fest: `/etc/letsencrypt/live/wissen-ahrensburg.de/`.
- `'*.wissen-ahrensburg.de'` steht in einfachen Anführungszeichen, damit die Shell den Stern nicht als Dateimuster auswertet.

```bash
sudo certbot certonly --manual --preferred-challenges dns --cert-name wissen-ahrensburg.de -d wissen-ahrensburg.de -d '*.wissen-ahrensburg.de'
```

Beim ersten Aufruf fragt Certbot nach einer E-Mail-Adresse und den Nutzungsbedingungen (mit <kbd>Y</kbd> zustimmen).

### 15. Die beiden TXT-Einträge anlegen

Certbot zeigt nacheinander zwei Werte für den Namen `_acme-challenge.wissen-ahrensburg.de`. Lege beim Domain-Anbieter für **jeden** Wert einen eigenen `TXT`-Eintrag mit dem Namen `_acme-challenge` an. Beide Einträge müssen gleichzeitig bestehen. Drücke nach dem zweiten Wert noch **nicht** <kbd>Enter</kbd>.

### 16. TXT-Einträge prüfen

In einem zweiten Terminal (zweite SSH-Sitzung) fragst du einen öffentlichen DNS-Server, ob die Einträge schon sichtbar sind.

```bash
dig +short TXT _acme-challenge.wissen-ahrensburg.de @1.1.1.1
```

**Prüfen:** Beide Werte erscheinen. Wenn nicht, einige Minuten warten und erneut fragen. Danach im ersten Terminal <kbd>Enter</kbd> drücken.

**Prüfen:** Certbot meldet `Successfully received certificate.` Die `TXT`-Einträge kannst du danach beim Anbieter wieder löschen.

### 17. Zertifikat als Baustein anlegen

Die Pfade zum Zertifikat kommen in eine eigene Datei. Jede Website unter der Domain bindet sie mit einer Zeile ein.

```bash
sudo nano /etc/nginx/snippets/ssl-wissen-ahrensburg.de.conf
```

Füge diesen Inhalt ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
# Wildcard-Zertifikat für wissen-ahrensburg.de und *.wissen-ahrensburg.de
ssl_certificate     /etc/letsencrypt/live/wissen-ahrensburg.de/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/wissen-ahrensburg.de/privkey.pem;
```

### 18. Sicherheits-Header als Baustein anlegen

Diese Header weisen den Browser an, sich vorsichtiger zu verhalten:

- `Strict-Transport-Security` (HSTS): Der Browser ruft die Domain ein Jahr lang nur noch über HTTPS auf, auch wenn jemand `http://` eintippt. **Achtung:** Diese Zusage lässt sich nicht einfach zurücknehmen. Lass den Header weg, solange HTTPS noch nicht zuverlässig läuft.
- `X-Content-Type-Options`: Der Browser hält sich an den angegebenen Dateityp und rät nicht selbst.
- `X-Frame-Options`: Fremde Seiten dürfen deine Seite nicht in einem Rahmen einbetten (Schutz vor untergeschobenen Klicks).
- `Referrer-Policy`: Beim Klick auf fremde Links wird nur die Domain weitergegeben, nicht die ganze Adresse.

`always` sorgt dafür, dass die Header auch bei Fehlerseiten mitgeschickt werden.

```bash
sudo nano /etc/nginx/snippets/sicherheitsheader.conf
```

Füge diesen Inhalt ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
add_header Strict-Transport-Security "max-age=31536000" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

> **Hinweis:** Steht in einem `location`-Block eine eigene `add_header`-Zeile, gelten dort die Header aus dem `server`-Block **nicht** mehr. Binde den Baustein dann zusätzlich in diesem `location`-Block ein.

## Fremde Anfragen abweisen

### 19. Standard-Server anlegen

Viele automatische Scanner rufen Server nur über die IP-Adresse oder mit erfundenen Domainnamen auf. Ohne passenden Eintrag würde nginx ihnen die erste Website zeigen. Dieser Standard-Server fängt alle Anfragen ab, deren Name zu keiner deiner Websites passt:

- Auf Port 80 beendet `return 444` die Verbindung ohne Antwort.
- Auf Port 443 lehnt `ssl_reject_handshake on` die verschlüsselte Verbindung ab, bevor ein Zertifikat gezeigt wird. So verrät der Server nicht, welche Domains auf ihm liegen.

Die `000` am Anfang des Dateinamens sorgt dafür, dass die Datei als Erstes geladen wird und leicht zu finden ist.

```bash
sudo nano /etc/nginx/sites-available/000-standard
```

Füge diesen Inhalt ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
# Anfragen ohne bekannten Domainnamen abweisen
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    return 444;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name _;

    ssl_reject_handshake on;
}
```

### 20. Standard-Server einschalten

```bash
sudo ln -s /etc/nginx/sites-available/000-standard /etc/nginx/sites-enabled/000-standard
```

## Website einrichten

### 21. Ordner für die Website anlegen

Die Dateien der Website liegen im Unterordner `html`. Der Ordner gehört deinem Benutzer, damit du ohne `sudo` Dateien hochladen kannst. nginx braucht nur Leserechte.

```bash
sudo mkdir -p /var/www/wissen-ahrensburg.de/html
```

```bash
sudo chown -R "$USER":"$USER" /var/www/wissen-ahrensburg.de
```

### 22. Startseite anlegen

Eine einfache Seite zum Testen. Später ersetzt du sie durch die echte Website.

```bash
nano /var/www/wissen-ahrensburg.de/html/index.html
```

Füge diese Zeile ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```html
<h1>wissen-ahrensburg.de läuft</h1>
```

### 23. Konfiguration der Website anlegen

Die Datei enthält drei `server`-Blöcke:

- **Der erste** leitet alle HTTP-Anfragen für die Domain und jede Subdomain dauerhaft auf HTTPS um.
- **Der zweite** leitet `www.wissen-ahrensburg.de` auf die Adresse ohne `www` um. So hat jede Seite genau eine Adresse, was auch Suchmaschinen bevorzugen.
- **Der dritte** ist die eigentliche Website. `http2 on` schaltet das schnellere Protokoll HTTP/2 ein. Eigene Log-Dateien pro Website erleichtern die Fehlersuche.

```bash
sudo nano /etc/nginx/sites-available/wissen-ahrensburg.de
```

Füge diesen Inhalt ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
# HTTP: alles auf HTTPS umleiten
server {
    listen 80;
    listen [::]:80;
    server_name wissen-ahrensburg.de *.wissen-ahrensburg.de;

    return 301 https://$host$request_uri;
}

# HTTPS: www auf die Adresse ohne www umleiten
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name www.wissen-ahrensburg.de;

    include snippets/ssl-wissen-ahrensburg.de.conf;

    return 301 https://wissen-ahrensburg.de$request_uri;
}

# HTTPS: die Website
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name wissen-ahrensburg.de;

    include snippets/ssl-wissen-ahrensburg.de.conf;
    include snippets/sicherheitsheader.conf;

    root /var/www/wissen-ahrensburg.de/html;
    index index.html;

    access_log /var/log/nginx/wissen-ahrensburg.de.access.log;
    error_log  /var/log/nginx/wissen-ahrensburg.de.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    # Versteckte Dateien wie .git oder .env nie ausliefern
    location ~ /\. {
        deny all;
    }
}
```

### 24. Website einschalten

```bash
sudo ln -s /etc/nginx/sites-available/wissen-ahrensburg.de /etc/nginx/sites-enabled/wissen-ahrensburg.de
```

### 25. Konfiguration testen und nginx neu laden

`&&` sorgt dafür, dass nginx nur neu geladen wird, wenn der Test erfolgreich war. Eine fehlerhafte Konfiguration legt die laufenden Websites so nicht lahm.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**Prüfen:** Die Ausgabe enthält `test is successful`. Meldet nginx `cannot load certificate`, stimmt der Pfad in Schritt 17 nicht mit dem Ordner unter `/etc/letsencrypt/live/` überein.

## Testen

Diese Befehle funktionieren auf dem Server und auf jedem anderen Rechner mit Internetzugang.

### 26. Umleitung auf HTTPS prüfen

```bash
curl -sI http://wissen-ahrensburg.de/ | grep -E '^HTTP|^Location'
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 301 Moved Permanently` und `Location: https://wissen-ahrensburg.de/`.

### 27. Umleitung von www prüfen

```bash
curl -sI https://www.wissen-ahrensburg.de/ | grep -E '^HTTP|^location'
```

**Prüfen:** Die Ausgabe lautet `HTTP/2 301` und `location: https://wissen-ahrensburg.de/`.

### 28. Website und Header prüfen

```bash
curl -sI https://wissen-ahrensburg.de/
```

**Prüfen:** Die erste Zeile lautet `HTTP/2 200`. Die Zeile `server:` zeigt nur `nginx` ohne Versionsnummer. Außerdem stehen dort die vier Header aus Schritt 18, z. B. `strict-transport-security: max-age=31536000`.

### 29. Abweisung über die IP-Adresse prüfen

Ersetze `203.0.113.10` durch die IPv4-Adresse deines Servers.

```bash
curl -sI http://203.0.113.10/
```

**Prüfen:** Es kommt keine Ausgabe. Ohne `-s` meldet curl `Empty reply from server`. Der Standard-Server aus Schritt 19 hat die Verbindung beendet.

### 30. Log-Dateien ansehen

Hier siehst du jeden Aufruf der Website. Mit <kbd>Strg</kbd>+<kbd>C</kbd> beendest du die Anzeige. Die Log-Dateien werden von `logrotate` täglich gewechselt und nach 14 Tagen gelöscht, damit die Festplatte nicht voll läuft.

```bash
sudo tail -f /var/log/nginx/wissen-ahrensburg.de.access.log
```

## Zertifikat verlängern

Ein manuell beantragtes Zertifikat verlängert sich **nicht** von selbst. Es gilt derzeit 90 Tage. Trage dir etwa 30 Tage vor Ablauf einen Termin ein. Das genaue Vorgehen steht in der Anleitung [Wildcard-Zertifikat mit Certbot](certbot-wildcard.md) im Abschnitt „Verlängern“: Schritt 14 wiederholen, neue `TXT`-Einträge setzen und danach nginx neu laden.

```bash
sudo systemctl reload nginx
```

**Prüfen:** Das Ablaufdatum steht bei `Expiry Date`.

```bash
sudo certbot certificates
```

## Prüfen der Installation

```bash
nginx -v
```

```bash
systemctl is-active nginx
```

```bash
sudo ufw status
```

**Prüfen:** Der erste Befehl zeigt die Version, der zweite `active`, der dritte `OpenSSH` und `Nginx Full` mit `ALLOW`.

## Deinstallieren

### 1. Websites ausschalten und Konfiguration löschen

```bash
sudo rm /etc/nginx/sites-enabled/wissen-ahrensburg.de /etc/nginx/sites-available/wissen-ahrensburg.de
```

```bash
sudo rm /etc/nginx/sites-enabled/000-standard /etc/nginx/sites-available/000-standard
```

### 2. Bausteine und eigene Einstellungen löschen

```bash
sudo rm /etc/nginx/snippets/ssl-wissen-ahrensburg.de.conf /etc/nginx/snippets/sicherheitsheader.conf /etc/nginx/conf.d/produktion.conf
```

### 3. Dateien der Website löschen

**Achtung:** Alles in `/var/www/wissen-ahrensburg.de` geht verloren. Sichere die Website vorher, wenn du sie noch brauchst.

```bash
sudo rm -r /var/www/wissen-ahrensburg.de
```

### 4. Zertifikat löschen

Entfernt Zertifikat und Schlüssel unter `/etc/letsencrypt`. Certbot fragt zur Sicherheit nach.

```bash
sudo certbot delete --cert-name wissen-ahrensburg.de
```

### 5. HTTP und HTTPS in der Firewall schließen

Die Regel für SSH bleibt bestehen, sonst sperrst du dich aus.

```bash
sudo ufw delete allow 'Nginx Full'
```

### 6. nginx und Certbot entfernen

`purge` entfernt auch die Konfigurationsdateien unter `/etc/nginx`.

```bash
sudo apt purge nginx nginx-common certbot
```

### 7. Nicht mehr benötigte Pakete entfernen

```bash
sudo apt autoremove
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
nginx -v
```
