# Statische Website mit nginx

nginx liefert eine statische Website (HTML, CSS, Bilder, JavaScript ohne Server-Programm) sehr schnell und mit wenig Speicher aus. Diese Anleitung richtet als Beispiel die Website `start.de` ein.

**Voraussetzung:** nginx ist installiert und läuft (siehe [nginx](nginx.md)).

> **Zum Beispiel `start.de`:** Die Domain ist nur ein Beispiel. Ersetze `start.de` in allen Befehlen durch deine eigene Domain. Zum Ausprobieren auf dem eigenen Rechner zeigt Schritt 11, wie der Rechner `start.de` auf sich selbst umleitet. Die echte Website unter diesem Namen ist dann auf diesem Rechner nicht mehr erreichbar, bis der Eintrag wieder entfernt ist.

## Dateien der Website anlegen

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von nginx kennt, falls es noch nachinstalliert oder aktualisiert werden muss.

```bash
sudo apt update
```

### 2. Ordner für die Website anlegen

Jede Website bekommt einen eigenen Ordner unter `/var/www`. Der Unterordner `html` enthält nur die Dateien, die Besucher sehen dürfen. Andere Dateien (z. B. Notizen oder Quelldateien) kann man daneben in `/var/www/start.de` ablegen, ohne dass nginx sie ausliefert.

```bash
sudo mkdir -p /var/www/start.de/html
```

### 3. Den Ordner deinem Benutzer geben

So kannst du die Dateien der Website ohne `sudo` bearbeiten. nginx läuft als Benutzer `www-data` und braucht nur Leserechte, die es über die normalen Rechte (`755` für Ordner, `644` für Dateien) bekommt.

```bash
sudo chown -R "$USER":"$USER" /var/www/start.de
```

**Prüfen:** Als Besitzer steht dein Benutzername.

```bash
ls -ld /var/www/start.de/html
```

### 4. Startseite anlegen

`index.html` ist die Seite, die nginx zeigt, wenn nur die Domain aufgerufen wird. Sie bindet ein Stylesheet ein, damit man später sieht, dass auch weitere Dateien ausgeliefert werden.

```bash
nano /var/www/start.de/html/index.html
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>start.de</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <h1>Willkommen auf start.de</h1>
  <p>Diese Seite liefert nginx als statische Datei aus.</p>
</body>
</html>
```

### 5. Stylesheet anlegen

Eine kleine CSS-Datei als Beispiel für zusätzliche Dateien wie Bilder oder Skripte.

```bash
nano /var/www/start.de/html/style.css
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```css
body { font-family: sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; }
h1 { color: #2a6f4f; }
```

### 6. Eigene Fehlerseite anlegen

Diese Seite erscheint, wenn jemand eine Adresse aufruft, die es nicht gibt. Ohne sie zeigt nginx eine schlichte Standardseite.

```bash
nano /var/www/start.de/html/404.html
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```html
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Nicht gefunden</title><link rel="stylesheet" href="/style.css"></head>
<body><h1>Seite nicht gefunden</h1><p><a href="/">Zur Startseite</a></p></body>
</html>
```

## nginx einrichten

### 7. Konfiguration für start.de anlegen

Jede Website bekommt in `sites-available` eine eigene Datei mit einem `server`-Block. Die wichtigsten Zeilen:

- `listen 80` und `listen [::]:80` – nimmt Anfragen auf Port 80 an, über IPv4 und IPv6.
- `server_name` – nginx wählt diesen Block nur, wenn der Browser `start.de` oder `www.start.de` aufruft. So können mehrere Websites denselben Port nutzen.
- `root` – der Ordner, aus dem die Dateien kommen.
- `access_log` und `error_log` – eigene Logdateien, damit die Einträge dieser Website nicht mit anderen vermischt sind.
- `try_files` – liefert die angefragte Datei oder den Ordner aus. Gibt es beides nicht, antwortet nginx mit dem Fehler 404.
- `error_page 404` – zeigt dann die Fehlerseite aus Schritt 6.
- `expires 7d` – der Browser darf CSS, Skripte, Bilder und Schriften sieben Tage zwischenspeichern und lädt sie nicht bei jedem Seitenaufruf neu.

```bash
sudo nano /etc/nginx/sites-available/start.de
```

Steht aus einer anderen Anleitung schon Inhalt in der Datei, lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name start.de www.start.de;

    root /var/www/start.de/html;
    index index.html;

    access_log /var/log/nginx/start.de.access.log;
    error_log  /var/log/nginx/start.de.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;

    location ~* \.(css|js|png|jpe?g|gif|svg|webp|ico|woff2?)$ {
        expires 7d;
    }
}
```

Mehr zum Aufbau der Konfiguration, zu späteren Änderungen und zur Fehlersuche steht in der Anleitung [nginx-Konfiguration mit nano bearbeiten](nginx-nano.md).

### 8. Website einschalten

nginx lädt nur Konfigurationen aus `sites-enabled`. Ein Link dorthin schaltet die Website ein. Die Datei selbst bleibt in `sites-available`, so kann man die Website später durch Löschen des Links wieder ausschalten.

```bash
sudo ln -s /etc/nginx/sites-available/start.de /etc/nginx/sites-enabled/start.de
```

### 9. Konfiguration testen

Findet Tippfehler, bevor nginx neu geladen wird.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 10. nginx neu laden

Übernimmt die neue Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

## Auf dem eigenen Rechner testen

### 11. start.de auf den eigenen Rechner umleiten

Normalerweise fragt der Rechner im Internet (DNS) nach, wohin `start.de` gehört. Ein Eintrag in `/etc/hosts` hat Vorrang und schickt die Anfragen stattdessen an den eigenen Rechner (`127.0.0.1`). So lässt sich die Website testen, bevor die Domain wirklich auf einen Server zeigt.

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

### 12. Startseite abrufen

```bash
curl http://start.de
```

**Prüfen:** Die Ausgabe enthält `<h1>Willkommen auf start.de</h1>`. Im Browser: <http://start.de>. Die Überschrift ist dort grün, das Stylesheet wird also mitgeladen.

### 13. Zwischenspeichern für CSS prüfen

`-I` zeigt nur die Kopfzeilen der Antwort.

```bash
curl -I http://start.de/style.css
```

**Prüfen:** In der Ausgabe stehen `Content-Type: text/css` und `Cache-Control: max-age=604800` (sieben Tage in Sekunden).

### 14. Fehlerseite prüfen

Ruft eine Adresse auf, die es nicht gibt.

```bash
curl -i http://start.de/gibt-es-nicht
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 404 Not Found`, darunter folgt der Inhalt der eigenen Fehlerseite mit `Seite nicht gefunden`.

### 15. Die Logdatei ansehen

Hier steht jede Anfrage an start.de mit Zeit, Adresse und Statuscode.

```bash
sudo tail -n 5 /var/log/nginx/start.de.access.log
```

## Website ändern

Neue oder geänderte Dateien einfach in `/var/www/start.de/html` ablegen. nginx liefert sie sofort aus, ein Neuladen ist nicht nötig. Neu laden (Schritte 9 und 10) muss man nur nach Änderungen an `/etc/nginx/sites-available/start.de`.

Der Browser kann CSS- und Bilddateien bis zu sieben Tage aus seinem Zwischenspeicher nehmen. Nach einer Änderung an `style.css` im Browser deshalb mit `Strg`+`Shift`+`R` neu laden.

## Optional: Im Internet veröffentlichen

Ein Zertifikat, das auch für alle Subdomains wie `blog.start.de` gilt, beschreibt die Anleitung [Wildcard-Zertifikat mit Certbot](certbot-wildcard.md).

Diese Schritte gehen nur auf einem Server, der aus dem Internet erreichbar ist, und nur mit einer Domain, die dir gehört.

### 1. Den Testeintrag entfernen

Der Eintrag aus Schritt 11 würde sonst weiter auf den eigenen Rechner zeigen.

```bash
sudo nano /etc/hosts
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `start.de` und drücke <kbd>Enter</kbd>. Lösche die Zeile `127.0.0.1 start.de www.start.de` mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 2. Die Domain auf den Server zeigen lassen

Beim Anbieter der Domain für `start.de` und `www.start.de` je einen `A`-Eintrag mit der öffentlichen IPv4-Adresse des Servers anlegen (bei IPv6 zusätzlich einen `AAAA`-Eintrag). Das geschieht in der Weboberfläche des Anbieters, nicht auf dem Server.

**Prüfen:** Nach einigen Minuten bis Stunden erscheint die IP-Adresse des Servers.

```bash
getent hosts start.de
```

### 3. Die Firewall für nginx öffnen

Nur nötig, wenn die Firewall `ufw` eingeschaltet ist. `Nginx Full` öffnet die Ports 80 (HTTP) und 443 (HTTPS).

```bash
sudo ufw allow 'Nginx Full'
```

### 4. Certbot installieren

Certbot holt kostenlose HTTPS-Zertifikate von Let's Encrypt. Das Zusatzpaket für nginx trägt die Zertifikate auch gleich in die Konfiguration ein.

```bash
sudo apt install certbot python3-certbot-nginx
```

### 5. Zertifikat holen und HTTPS einschalten

Certbot fragt beim ersten Aufruf nach einer E-Mail-Adresse und den Nutzungsbedingungen. Danach ergänzt es die Datei `/etc/nginx/sites-available/start.de` um HTTPS und leitet HTTP-Aufrufe auf HTTPS um.

```bash
sudo certbot --nginx -d start.de -d www.start.de
```

**Prüfen:** Die erste Zeile lautet `HTTP/2 200` oder `HTTP/1.1 200 OK`.

```bash
curl -I https://start.de
```

Das Zertifikat gilt 90 Tage. Das Paket richtet eine automatische Verlängerung ein. Ob sie funktioniert, zeigt ein Probelauf:

```bash
sudo certbot renew --dry-run
```

## Prüfen der Installation

```bash
nginx -v
```

```bash
sudo nginx -T 2>/dev/null | grep 'server_name start.de'
```

**Prüfen:** Der erste Befehl zeigt die Version von nginx, der zweite die Zeile `server_name start.de www.start.de;`.

## Deinstallieren

nginx selbst bleibt installiert. Wie man nginx ganz entfernt, steht in der Anleitung [nginx](nginx.md).

### 1. Website ausschalten

Löscht den Link in `sites-enabled`. nginx lädt die Konfiguration danach nicht mehr.

```bash
sudo rm /etc/nginx/sites-enabled/start.de
```

### 2. Konfiguration löschen

```bash
sudo rm /etc/nginx/sites-available/start.de
```

### 3. nginx testen und neu laden

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Dateien der Website löschen

**Achtung:** Alles in `/var/www/start.de` geht verloren. Vorher bei Bedarf sichern.

```bash
sudo rm -r /var/www/start.de
```

### 5. Logdateien löschen

```bash
sudo rm /var/log/nginx/start.de.*
```

### 6. Testeintrag aus `/etc/hosts` entfernen

Nur nötig, wenn der Eintrag aus Schritt 11 noch besteht. Danach ist die echte Website `start.de` wieder erreichbar.

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
