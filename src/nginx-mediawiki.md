# MediaWiki mit nginx unter eigener Domain

Diese Anleitung macht ein vorhandenes MediaWiki unter einer eigenen Domain erreichbar, hier am Beispiel `start.de`. nginx nimmt die Anfragen auf Port 80 an, führt PHP über PHP-FPM aus und sorgt für kurze Adressen wie `start.de/Hauptseite`. Aufrufe von `www.start.de` leitet es auf `start.de` um.

**Voraussetzung:** MediaWiki ist nach der Anleitung [MediaWiki](mediawiki.md) vollständig eingerichtet (Dateien in `/var/www/mediawiki`, kurze Adressen eingeschaltet, Test unter <http://localhost:8085> erfolgreich).

> **Zum Beispiel `start.de`:** Die Domain ist nur ein Beispiel. Ersetze `start.de` in allen Befehlen durch deine eigene Domain. Zum Ausprobieren auf dem eigenen Rechner leitet Schritt 10 `start.de` auf den eigenen Rechner um. Die echte Website unter diesem Namen ist dann auf diesem Rechner nicht mehr erreichbar, bis der Eintrag wieder entfernt ist.

## nginx einrichten

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von nginx und PHP-FPM kennt, falls sie noch aktualisiert werden müssen.

```bash
sudo apt update
```

### 2. MediaWiki-Regeln als Baustein anlegen

Die Regeln, die MediaWiki braucht, kommen in eine eigene Datei unter `snippets`. Der `server`-Block in Schritt 3 bindet sie mit einer `include`-Zeile ein.

nginx prüft Blöcke mit regulären Ausdrücken (`~`) von oben nach unten und nimmt den ersten Treffer. Deshalb stehen die Sperren **vor** dem Block, der PHP ausführt:

- **Sperren:** versteckte Dateien wie `.git`, die internen Ordner von MediaWiki (z. B. `includes`, `maintenance`, `vendor`) und Dateien wie `composer.json`. Aus diesen Ordnern ruft der Browser nie etwas ab, sie enthalten nur Programmcode und Werkzeuge.
- **Upload-Ordner `images`:** `^~` sorgt dafür, dass für Adressen unter `/images/` keine der Regeln mit regulären Ausdrücken gilt, also auch nicht der PHP-Block. Der innere Block lehnt PHP-Dateien dort ausdrücklich ab. So lässt sich eine hochgeladene Datei nie als Programm starten.
- **PHP:** `index.php`, `load.php` (liefert CSS und JavaScript) und die übrigen Einstiegsdateien von MediaWiki gehen an PHP-FPM.
- **Bilder, CSS, JavaScript:** Der Browser darf sie 7 Tage zwischenspeichern. Gibt es eine solche Datei nicht, ist die Adresse eine Wiki-Seite, deren Name nur auf `.png` o. Ä. endet, z. B. die Dateiseite `/Datei:Bild.png`. Dann ist MediaWiki zuständig.
- **Kurze Adressen:** `/Hauptseite` gibt es nicht als Datei. `try_files` übergibt solche Anfragen an `index.php`, hängt aber nichts an. nginx reicht die ursprüngliche Adresse als `REQUEST_URI` an PHP weiter. MediaWiki vergleicht sie mit `$wgArticlePath = "/$1"` aus der Anleitung [MediaWiki](mediawiki.md) und erkennt so, dass die Seite `Hauptseite` gemeint ist. Auch Seitennamen mit Sonderzeichen wie `&` kommen so unverändert an.

```bash
sudo nano /etc/nginx/snippets/mediawiki.conf
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
# Versteckte Dateien und Ordner sperren, außer .well-known (für HTTPS-Zertifikate)
location ~ /\.(?!well-known/) {
    return 403;
}

# Interne Ordner und Dateien von MediaWiki sperren
location ~ ^/(cache|includes|languages|maintenance|serialized|tests|vendor)/ {
    return 403;
}

location ~ \.(lock|json|yml|yaml|md)$ {
    return 403;
}

# Upload-Ordner: Dateien ausliefern, aber nie als PHP ausführen
location ^~ /images/ {
    location ~ \.php$ {
        return 403;
    }
}

# PHP über PHP-FPM ausführen
location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/run/php/php-fpm.sock;
}

# Statische Dateien eine Woche im Browser zwischenspeichern.
# Gibt es die Datei nicht, ist es eine Wiki-Seite wie /Datei:Bild.png
location ~* \.(js|css|png|jpe?g|gif|ico|svg|webp|woff2?)$ {
    try_files $uri /index.php?$args;
    expires 7d;
    access_log off;
}

# Kurze Adressen: Was es nicht als Datei gibt, bekommt index.php.
# MediaWiki liest den Seitennamen selbst aus der ursprünglichen Adresse.
location / {
    try_files $uri $uri/ /index.php?$args;
}
```

### 3. Konfiguration für start.de anlegen

Die Datei enthält zwei `server`-Blöcke:

- **Der erste** beantwortet nur Anfragen an `www.start.de` und leitet sie dauerhaft (Status `301`) auf `start.de` um. `$scheme` behält `http` oder `https` bei, `$request_uri` den Pfad.
- **Der zweite** ist das Wiki. `root` zeigt auf den MediaWiki-Ordner. `client_max_body_size` erlaubt hochgeladene Dateien bis 20 MB, ohne diese Zeile lehnt nginx alles über 1 MB ab. Eigene Logdateien halten die Einträge des Wikis getrennt.

```bash
sudo nano /etc/nginx/sites-available/start.de
```

Steht aus einer anderen Anleitung schon Inhalt in der Datei, lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name www.start.de;

    return 301 $scheme://start.de$request_uri;
}

server {
    listen 80;
    listen [::]:80;
    server_name start.de;

    root /var/www/mediawiki;
    index index.php;

    client_max_body_size 20m;

    access_log /var/log/nginx/start.de.access.log;
    error_log  /var/log/nginx/start.de.error.log;

    include snippets/mediawiki.conf;
}
```

**Achtung:** Gibt es `/etc/nginx/sites-available/start.de` schon, z. B. aus der Anleitung [Statische Website mit nginx](nginx-statisch.md) oder [Drupal mit nginx unter eigener Domain](nginx-drupal.md), ersetzt du damit ihren Inhalt und die bisherige Website ist unter `start.de` nicht mehr erreichbar. Eine Domain kann immer nur zu einer Website gehören.

### 4. Website einschalten

nginx lädt nur Konfigurationen aus `sites-enabled`. Der Link schaltet die Website ein. Meldet der Befehl `File exists`, ist die Website schon eingeschaltet.

```bash
sudo ln -s /etc/nginx/sites-available/start.de /etc/nginx/sites-enabled/start.de
```

### 5. Konfiguration testen

Findet Tippfehler in beiden neuen Dateien, bevor nginx neu geladen wird.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 6. nginx neu laden

Übernimmt die neue Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

## MediaWiki einstellen

### 7. Einstellungsdatei sichern

Die nächsten Schritte ändern `LocalSettings.php`. Die Kopie erlaubt, jederzeit zum alten Stand zurückzukehren. `-p` übernimmt Besitzer und Rechte, damit auch die Kopie das Datenbank-Passwort schützt.

```bash
sudo cp -p /var/www/mediawiki/LocalSettings.php /var/www/mediawiki/LocalSettings.php.vor-start.de
```

### 8. Adresse des Wikis ändern

MediaWiki baut vollständige Adressen aus `$wgServer` zusammen, z. B. für die Weiterleitung von `/` auf die Hauptseite, für Links in E-Mails und für die Angabe der „kanonischen“ Adresse an Suchmaschinen. Bei der Installation wurde dort `http://localhost:8085` eingetragen, jetzt kommt `http://start.de` hinein.

Die Datei gehört nach der Anleitung [MediaWiki](mediawiki.md) deinem Benutzer, deshalb ist `sudo` nicht nötig. nano schreibt beim Speichern in die vorhandene Datei, Gruppe `www-data` und Rechte bleiben erhalten.

```bash
nano /var/www/mediawiki/LocalSettings.php
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `$wgServer` und drücke <kbd>Enter</kbd>. Die Zeile lautet `$wgServer = "http://localhost:8085";`. Ändere die gefundene Zeile so, dass sie lautet:

```php
$wgServer = "http://start.de";
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Ausgabe lautet `$wgServer = "http://start.de";`, und die Gruppe ist weiterhin `www-data`.

```bash
grep '^\$wgServer' /var/www/mediawiki/LocalSettings.php
```

```bash
ls -l /var/www/mediawiki/LocalSettings.php
```

Das Wiki ist danach auch weiterhin über <http://localhost:8085> erreichbar. Die Weiterleitung von `/` und alle vollständigen Links führen aber jetzt zu `start.de`.

### 9. Prüfen, ob die Datei gültig ist

Ein Tippfehler in `LocalSettings.php` legt das ganze Wiki lahm. MediaWiki leert seinen Seitenzwischenspeicher von selbst, sobald sich die Datei ändert.

```bash
sudo php -l /var/www/mediawiki/LocalSettings.php
```

**Prüfen:** Die Ausgabe lautet `No syntax errors detected in /var/www/mediawiki/LocalSettings.php`.

## Auf dem eigenen Rechner testen

### 10. start.de auf den eigenen Rechner umleiten

Ein Eintrag in `/etc/hosts` hat Vorrang vor dem DNS im Internet und schickt die Anfragen an den eigenen Rechner. So lässt sich das Wiki testen, bevor die Domain auf einen Server zeigt. Steht der Eintrag schon aus einer anderen Anleitung in der Datei, diesen Schritt überspringen.

```bash
sudo nano /etc/hosts
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei und füge in einer eigenen Zeile diesen Eintrag ein. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
127.0.0.1 start.de www.start.de
```

**Prüfen:** Als Adresse erscheint `127.0.0.1`.

```bash
getent hosts start.de
```

### 11. Adresse des Wikis prüfen

Die Spezialseite „Zufällige Seite“ antwortet immer mit einer Weiterleitung auf eine vollständige Adresse. Daran lässt sich ablesen, ob MediaWiki die neue Adresse aus Schritt 8 verwendet. `%C3%A4` ist die Schreibweise für `ä` in einer Adresse.

```bash
curl -sI http://start.de/Spezial:Zuf%C3%A4llige_Seite | grep -E '^HTTP|^Location'
```

**Prüfen:** Die erste Zeile enthält `302`, und `Location` beginnt mit `http://start.de/`, z. B. `Location: http://start.de/Hauptseite`. Steht dort noch `localhost:8085`, hat Schritt 8 nicht gegriffen.

### 12. Hauptseite abrufen

Die kurze Adresse gibt es nicht als Datei. nginx muss sie an MediaWiki weiterreichen.

```bash
curl -sI http://start.de/Hauptseite | head -n 1
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 200 OK`. Im Browser zeigt <http://start.de> die Hauptseite im Vector-Design. Oben rechts kannst du dich mit `WikiAdmin` anmelden.

### 13. Umleitung von www prüfen

```bash
curl -sI http://www.start.de/Hauptseite | grep -E '^HTTP|^Location'
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 301 Moved Permanently` und `Location: http://start.de/Hauptseite`.

### 14. Sperren prüfen

Stichprobe für zwei gesperrte Bereiche: den Git-Ordner, der sonst die Versionsgeschichte preisgeben würde, und `composer.json`.

```bash
curl -sI http://start.de/.git/config | head -n 1
```

```bash
curl -sI http://start.de/composer.json | head -n 1
```

**Prüfen:** Beide Male lautet die Ausgabe `HTTP/1.1 403 Forbidden`.

### 15. Logdatei ansehen

Hier steht jede Anfrage an start.de mit Zeit, Adresse und Statuscode.

```bash
sudo tail -n 5 /var/log/nginx/start.de.access.log
```

## Optional: Im Internet veröffentlichen

Diese Schritte gehen nur auf einem Server, der aus dem Internet erreichbar ist, und nur mit einer Domain, die dir gehört.

### 1. Testeintrag entfernen

Sonst zeigt `start.de` auf diesem Rechner weiter auf `127.0.0.1`.

```bash
sudo nano /etc/hosts
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `start.de` und drücke <kbd>Enter</kbd>. Lösche die Zeile `127.0.0.1 start.de www.start.de` mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 2. Domain auf den Server zeigen lassen

In der Weboberfläche des Domain-Anbieters für `start.de` und `www.start.de` je einen `A`-Eintrag mit der öffentlichen IPv4-Adresse des Servers anlegen, bei IPv6 zusätzlich einen `AAAA`-Eintrag.

**Prüfen:** Nach einigen Minuten bis Stunden erscheint die Adresse des Servers.

```bash
getent hosts start.de
```

### 3. Firewall öffnen

Nur nötig, wenn `ufw` eingeschaltet ist. Das Profil `Nginx Full` öffnet Port 80 und 443.

```bash
sudo ufw allow 'Nginx Full'
```

### 4. Certbot installieren

Certbot besorgt kostenlose Zertifikate von Let's Encrypt und trägt sie direkt in die nginx-Konfiguration ein.

```bash
sudo apt install certbot python3-certbot-nginx
```

### 5. HTTPS einschalten

Certbot fragt beim ersten Aufruf nach einer E-Mail-Adresse und den Nutzungsbedingungen. Danach ergänzt es beide `server`-Blöcke um HTTPS und leitet HTTP auf HTTPS um.

```bash
sudo certbot --nginx -d start.de -d www.start.de
```

### 6. MediaWiki auf HTTPS umstellen

Anders als nginx weiß MediaWiki nichts vom neuen Zertifikat. Ohne diesen Schritt würden Weiterleitungen und vollständige Links weiter auf `http://` zeigen.

```bash
nano /var/www/mediawiki/LocalSettings.php
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `$wgServer` und drücke <kbd>Enter</kbd>. Ändere die gefundene Zeile so, dass sie lautet:

```php
$wgServer = "https://start.de";
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Weiterleitung beginnt jetzt mit `https://start.de/`.

```bash
curl -sI https://start.de/Spezial:Zuf%C3%A4llige_Seite | grep -i '^location'
```

Das Zertifikat gilt 90 Tage und wird automatisch verlängert. Einen Probelauf der Verlängerung startet dieser Befehl:

```bash
sudo certbot renew --dry-run
```

## Prüfen der Installation

```bash
nginx -v
```

```bash
sudo nginx -T 2>/dev/null | grep 'include snippets/mediawiki.conf'
```

```bash
grep '^\$wgServer' /var/www/mediawiki/LocalSettings.php
```

**Prüfen:** Der erste Befehl zeigt die Version von nginx, der zweite die `include`-Zeile aus Schritt 3, der dritte die Adresse `start.de`.

## Deinstallieren

MediaWiki selbst bleibt erhalten und ist danach wieder wie vorher unter <http://localhost:8085> erreichbar. Wie man MediaWiki ganz entfernt, steht in der Anleitung [MediaWiki](mediawiki.md).

### 1. Website ausschalten

Löscht den Link in `sites-enabled`.

```bash
sudo rm /etc/nginx/sites-enabled/start.de
```

### 2. Konfiguration und Baustein löschen

```bash
sudo rm /etc/nginx/sites-available/start.de /etc/nginx/snippets/mediawiki.conf
```

### 3. nginx testen und neu laden

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Alte Einstellungsdatei zurückholen

Ersetzt `LocalSettings.php` durch die Sicherung aus Schritt 7. Damit steht dort wieder `http://localhost:8085`. Hast du seit Schritt 7 weitere Einstellungen geändert, trage sie danach erneut ein. Alternativ änderst du nur die Zeile mit `$wgServer` von Hand zurück.

```bash
sudo mv /var/www/mediawiki/LocalSettings.php.vor-start.de /var/www/mediawiki/LocalSettings.php
```

**Prüfen:** Die Ausgabe lautet `$wgServer = "http://localhost:8085";`.

```bash
grep '^\$wgServer' /var/www/mediawiki/LocalSettings.php
```

### 5. Logdateien löschen

```bash
sudo rm /var/log/nginx/start.de.*
```

### 6. Testeintrag aus `/etc/hosts` entfernen

Nur nötig, wenn der Eintrag aus Schritt 10 noch besteht und keine andere Anleitung ihn braucht.

```bash
sudo nano /etc/hosts
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `start.de` und drücke <kbd>Enter</kbd>. Lösche die Zeile `127.0.0.1 start.de www.start.de` mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Es erscheint nicht mehr `127.0.0.1`.

```bash
getent hosts start.de
```

### 7. Zertifikat löschen

Nur nötig, wenn im optionalen Teil ein Zertifikat geholt wurde.

```bash
sudo certbot delete --cert-name start.de
```
