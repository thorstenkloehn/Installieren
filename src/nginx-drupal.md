# Drupal mit nginx unter eigener Domain

Diese Anleitung macht eine vorhandene Drupal-Installation unter einer eigenen Domain erreichbar, hier am Beispiel `start.de`. nginx nimmt die Anfragen auf Port 80 an, führt PHP über PHP-FPM aus und leitet `www.start.de` auf `start.de` um.

**Voraussetzung:** Drupal ist nach der Anleitung [Drupal](drupal.md) vollständig eingerichtet (Dateien in `/var/www/drupal`, Datenbank installiert, Test unter <http://localhost:8090> erfolgreich).

> **Zum Beispiel `start.de`:** Die Domain ist nur ein Beispiel. Ersetze `start.de` in allen Befehlen durch deine eigene Domain. Zum Ausprobieren auf dem eigenen Rechner leitet Schritt 9 `start.de` auf den eigenen Rechner um. Die echte Website unter diesem Namen ist dann auf diesem Rechner nicht mehr erreichbar, bis der Eintrag wieder entfernt ist.

## nginx einrichten

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von nginx und PHP-FPM kennt, falls sie noch aktualisiert werden müssen.

```bash
sudo apt update
```

### 2. Drupal-Regeln als Baustein anlegen

Die Regeln, die Drupal braucht, kommen in eine eigene Datei unter `snippets`. Der `server`-Block in Schritt 3 bindet sie mit einer einzigen `include`-Zeile ein. So lassen sich die Regeln auch für weitere Drupal-Websites wiederverwenden.

nginx prüft Blöcke mit regulären Ausdrücken (`~`) von oben nach unten und nimmt den ersten Treffer. Deshalb stehen die Sperren **vor** dem Block, der PHP ausführt:

- **Sperren:** versteckte Dateien wie `.git`, interne Drupal-Dateien wie `.yml` und `.twig` sowie PHP-Dateien im Upload-Ordner `sites/…/files`. Eine hochgeladene Datei lässt sich so nie als Programm starten.
- **PHP:** Alle `.php`-Dateien gehen an PHP-FPM, auch mit angehängtem Pfad wie `/update.php/selection`.
- **Bilder, CSS, JavaScript:** Der Browser darf sie 30 Tage zwischenspeichern. Fehlt eine Datei, erzeugt Drupal sie, z. B. verkleinerte Bilder.
- **Alles andere:** Adressen wie `/node/1` beantwortet Drupal über `index.php`.

```bash
sudo nano /etc/nginx/snippets/drupal.conf
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
# Versteckte Dateien und Ordner sperren, außer .well-known (für HTTPS-Zertifikate)
location ~ /\.(?!well-known/) {
    return 403;
}

# Interne Drupal-Dateien sperren
location ~* \.(engine|inc|install|module|profile|theme|twig|yml|yaml|sql|lock|log|md)$ {
    return 403;
}

# Hochgeladene Dateien nie als PHP ausführen
location ~ ^/sites/[^/]+/files/.*\.php$ {
    return 403;
}

# PHP über PHP-FPM ausführen
location ~ \.php(/|$) {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/run/php/php-fpm.sock;
}

# Statische Dateien zwischenspeichern, fehlende von Drupal erzeugen lassen
location ~* \.(css|js|png|jpe?g|gif|ico|svg|webp|woff2?)$ {
    try_files $uri /index.php?$query_string;
    expires 30d;
    access_log off;
}

# Alle übrigen Adressen beantwortet Drupal
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

### 3. Konfiguration für start.de anlegen

Die Datei enthält zwei `server`-Blöcke:

- **Der erste** beantwortet nur Anfragen an `www.start.de` und leitet sie dauerhaft (Status `301`) auf `start.de` um. So gibt es jede Seite nur unter einer Adresse, was auch Suchmaschinen bevorzugen. `$scheme` behält `http` oder `https` bei, `$request_uri` den Pfad.
- **Der zweite** ist die eigentliche Website. `root` zeigt auf den Ordner `web` der Drupal-Installation. `client_max_body_size` erlaubt Uploads bis 20 MB, ohne diese Zeile lehnt nginx alles über 1 MB ab. Die eigenen Logdateien halten die Einträge dieser Website getrennt.

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

    root /var/www/drupal/web;
    index index.php;

    client_max_body_size 20m;

    access_log /var/log/nginx/start.de.access.log;
    error_log  /var/log/nginx/start.de.error.log;

    include snippets/drupal.conf;
}
```

### 4. Website einschalten

nginx lädt nur Konfigurationen aus `sites-enabled`. Der Link schaltet die Website ein, die Datei selbst bleibt in `sites-available`.

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

## Drupal einstellen

### 7. Erlaubte Hostnamen festlegen

Drupal beantwortet sonst Anfragen mit jedem beliebigen Hostnamen. Das nutzen Angreifer, um gefälschte Links zu erzeugen, etwa in E-Mails zum Zurücksetzen von Passwörtern. `trusted_host_patterns` legt fest, unter welchen Namen die Website antworten darf. `localhost` bleibt erlaubt, damit der Zugang über <http://localhost:8090> aus der Drupal-Anleitung weiter funktioniert. Die Punkte sind mit `\` geschützt, weil die Angaben reguläre Ausdrücke sind.

Die Datei `settings.php` ist nach der Installation schreibgeschützt. Mit `sudo` darf nano sie trotzdem speichern. Die erste Zeile des neuen Abschnitts ist ein Kommentar, an dem er sich beim Deinstallieren wiederfinden lässt.

```bash
sudo nano /var/www/drupal/web/sites/default/settings.php
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei, füge nach einer Leerzeile diesen Abschnitt ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```php
// start.de: erlaubte Hostnamen
$settings['trusted_host_patterns'] = [
  '^start\.de$',
  '^www\.start\.de$',
  '^localhost$',
];
```

**Prüfen:** PHP meldet `No syntax errors detected`.

```bash
sudo php -l /var/www/drupal/web/sites/default/settings.php
```

### 8. Drupal-Zwischenspeicher leeren

Drupal liest `settings.php` zwar bei jeder Anfrage neu, hat aber fertige Seiten im Zwischenspeicher. Nach dem Leeren entstehen alle Seiten neu.

```bash
sudo -u www-data /var/www/drupal/vendor/bin/drush cache:rebuild --root=/var/www/drupal/web
```

**Prüfen:** Die Ausgabe lautet `[success] Cache rebuild complete.`

## Auf dem eigenen Rechner testen

### 9. start.de auf den eigenen Rechner umleiten

Ein Eintrag in `/etc/hosts` hat Vorrang vor dem DNS im Internet und schickt die Anfragen an den eigenen Rechner. So lässt sich die Website testen, bevor die Domain auf einen Server zeigt.

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

### 10. Startseite abrufen

`-I` zeigt nur die Kopfzeilen der Antwort.

```bash
curl -I http://start.de/
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 200 OK`, weiter unten steht `X-Generator: Drupal`. Im Browser: <http://start.de>.

### 11. Anmeldeseite abrufen

Eine Adresse, die es nicht als Datei gibt. nginx muss sie an Drupal weiterreichen.

```bash
curl -sI http://start.de/user/login | head -n 1
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 200 OK`. Im Browser kannst du dich unter <http://start.de/user/login> mit dem Administrator-Konto aus der Drupal-Anleitung anmelden.

### 12. Umleitung von www prüfen

```bash
curl -sI http://www.start.de/user/login | grep -E '^HTTP|^Location'
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 301 Moved Permanently` und `Location: http://start.de/user/login`.

### 13. Sperren prüfen

Stichprobe, ob interne Dateien wirklich gesperrt sind. `core.services.yml` ist eine Einstellungsdatei aus dem Drupal-Kern.

```bash
curl -sI http://start.de/core/core.services.yml | head -n 1
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 403 Forbidden`.

### 14. Erlaubte Hostnamen prüfen

Schickt eine Anfrage mit einem fremden Hostnamen an den Zugang auf Port 8090 aus der Drupal-Anleitung. Über Port 80 geht das nicht, weil nginx dort nur die Namen `start.de` und `www.start.de` an Drupal weitergibt.

```bash
curl -s -H 'Host: boese.example' http://127.0.0.1:8090/ | head -n 1
```

**Prüfen:** Drupal antwortet mit `The provided host name is not valid for this server.` Ohne Schritt 7 käme stattdessen die normale Startseite.

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

Certbot besorgt kostenlose Zertifikate von Let's Encrypt. Das Zusatzpaket trägt sie direkt in die nginx-Konfiguration ein.

```bash
sudo apt install certbot python3-certbot-nginx
```

### 5. HTTPS einschalten

Certbot fragt beim ersten Aufruf nach einer E-Mail-Adresse und den Nutzungsbedingungen. Danach ergänzt es beide `server`-Blöcke in `/etc/nginx/sites-available/start.de` um HTTPS und leitet HTTP auf HTTPS um. Drupal erkennt HTTPS selbst und erzeugt danach Links mit `https://`.

```bash
sudo certbot --nginx -d start.de -d www.start.de
```

**Prüfen:** Die erste Zeile lautet `HTTP/2 200` oder `HTTP/1.1 200 OK`.

```bash
curl -sI https://start.de/ | head -n 1
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
sudo nginx -T 2>/dev/null | grep 'include snippets/drupal.conf'
```

**Prüfen:** Der erste Befehl zeigt die Version von nginx, der zweite die `include`-Zeile aus Schritt 3.

## Deinstallieren

Drupal selbst bleibt erhalten und ist weiter unter <http://localhost:8090> erreichbar. Wie man Drupal ganz entfernt, steht in der Anleitung [Drupal](drupal.md).

### 1. Website ausschalten

Löscht den Link in `sites-enabled`.

```bash
sudo rm /etc/nginx/sites-enabled/start.de
```

### 2. Konfiguration und Baustein löschen

```bash
sudo rm /etc/nginx/sites-available/start.de /etc/nginx/snippets/drupal.conf
```

### 3. nginx testen und neu laden

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Erlaubte Hostnamen aus Drupal entfernen

Löscht den Abschnitt aus Schritt 7, vom Kommentar bis zur schließenden Klammer `];`.

```bash
sudo nano /var/www/drupal/web/sites/default/settings.php
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `start.de: erlaubte Hostnamen` und drücke <kbd>Enter</kbd>. Der Cursor steht in der Kommentarzeile. Drücke sechsmal <kbd>Strg</kbd>+<kbd>K</kbd>. Das entfernt den Kommentar, die Zeile mit `trusted_host_patterns`, die drei Namen und die schließende Klammer `];`. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Ausgabe ist leer, und PHP meldet keinen Syntaxfehler.

```bash
sudo grep -n "start" /var/www/drupal/web/sites/default/settings.php
```

```bash
sudo php -l /var/www/drupal/web/sites/default/settings.php
```

### 5. Logdateien löschen

```bash
sudo rm /var/log/nginx/start.de.*
```

### 6. Testeintrag aus `/etc/hosts` entfernen

Nur nötig, wenn der Eintrag aus Schritt 9 noch besteht.

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
