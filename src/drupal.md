# Drupal

Drupal ist ein flexibles, modulares Open-Source-Content-Management-System (CMS) und Web-Framework. Auf dem Entwicklungsrechner dient es zum Aufbau komplexer Websites und Webanwendungen, die lokal mit Composer, nginx, PHP und PostgreSQL entwickelt und getestet werden.

## Vorbereitung und PHP-Module

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketdaten aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Benötigte PHP-Erweiterungen und Composer installieren

Drupal benötigt Composer sowie spezifische PHP-Erweiterungen für PostgreSQL (`php-pgsql`), mathematische Berechnungen (`php-bcmath`), Bildverarbeitung (`php-gd`), Unicode-Verarbeitung (`php-intl`), Caching (`php-apcu`), XML-Parsing und ZIP-Archive.

```bash
sudo apt install -y composer php-pgsql php-bcmath php-gd php-intl php-apcu php-curl php-mbstring php-xml php-zip
```

**Prüfen:** Listet die geladenen Module auf.

```bash
php -m | grep -E "pgsql|bcmath|gd|intl"
```

## Datenbank in PostgreSQL einrichten

PostgreSQL sollte bereits installiert sein und laufen (siehe [PostgreSQL-Anleitung](postgresql.md)).

### 3. PostgreSQL-Benutzer für Drupal anlegen

Erstellt einen dedizierten Datenbankbenutzer `drupaluser` mit einem sicheren Passwort.

```bash
sudo -u postgres psql -c "CREATE USER drupaluser WITH PASSWORD 'geheimes_passwort';"
```

### 4. Drupal-Datenbank anlegen

Erstellt die Datenbank `drupaldb` mit UTF-8-Zeichensatz und weist `drupaluser` als Eigentümer zu.

```bash
sudo -u postgres psql -c "CREATE DATABASE drupaldb OWNER drupaluser ENCODING 'UTF8';"
```

### 5. PostgreSQL-Erweiterung pg_trgm aktivieren

Drupal setzt für Volltext- und Ähnlichkeitsabfragen in PostgreSQL die Erweiterung `pg_trgm` voraus.

```bash
sudo -u postgres psql -d drupaldb -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

**Prüfen:** Die Erweiterung ist in der Datenbank aktiv.

```bash
sudo -u postgres psql -d drupaldb -c "\dx pg_trgm"
```

## Drupal mit Composer herunterladen und einrichten

### 6. Drupal-Projekt mit Composer erstellen

Erstellt über das offizielle Template `drupal/recommended-project` eine neue Drupal-Installation im Verzeichnis `/var/www/drupal`. Dabei werden automatisch alle PHP-Abhängigkeiten in `vendor/` und das Web-Verzeichnis in `web/` angelegt.

```bash
sudo composer create-project drupal/recommended-project /var/www/drupal
```

**Prüfen:** Das Verzeichnis `/var/www/drupal/web` existiert.

```bash
ls -ld /var/www/drupal/web
```

### 7. Drush als Befehlszeilenwerkzeug hinzufügen (optional)

Installiert Drush (The Drupal Shell) als Abhängigkeit im Projekt, um administrative Aufgaben und Installationen im Terminal durchzuführen.

```bash
sudo composer require --working-dir=/var/www/drupal drush/drush
```

### 8. Dateirechte für den Webserver anpassen

Überträgt die Eigentümerschaft des Drupal-Ordners an den Benutzer `www-data`, damit Drupal Dateien hochladen und Konfigurationen verwalten kann.

```bash
sudo chown -R www-data:www-data /var/www/drupal
```

## nginx für Drupal konfigurieren

### 9. Konfiguration für Drupal anlegen

Erstellt einen Server-Block auf Port `8090`, der nur vom eigenen Rechner aus erreichbar ist und auf das Web-Stammverzeichnis `/var/www/drupal/web` zeigt. nginx prüft die Blöcke mit regulären Ausdrücken (`~`) von oben nach unten und nimmt den ersten Treffer. Deshalb stehen die Sperren **vor** dem Block, der PHP ausführt:

- **Sperren:** versteckte Dateien wie `.git` und `.env`, interne Drupal-Dateien (z. B. `.yml`-Einstellungen, `.twig`-Vorlagen) und PHP-Dateien im Upload-Ordner `sites/…/files`. So kann niemand eine hochgeladene Datei als Programm starten.
- **PHP:** Alle `.php`-Dateien gehen an PHP-FPM. `(/|$)` erlaubt auch Adressen wie `/update.php/selection`, die Drupal bei Aktualisierungen verwendet.
- **Bilder, CSS, JavaScript:** Der Browser darf sie 30 Tage zwischenspeichern. Fehlt eine Datei, reicht nginx die Anfrage an Drupal weiter. Drupal erzeugt verkleinerte Bilder und zusammengefasste CSS- und JavaScript-Dateien erst beim ersten Abruf.
- **Alles andere:** Adressen wie `/node/1` gibt es nicht als Datei. `try_files` reicht sie an `index.php` weiter, und Drupal entscheidet, welche Seite erscheint.

```bash
sudo nano /etc/nginx/sites-available/drupal
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 127.0.0.1:8090;
    server_name localhost;

    root /var/www/drupal/web;
    index index.php;

    client_max_body_size 20m;

    # Versteckte Dateien und Ordner (z. B. .git, .env) sperren
    location ~ /\.(?!well-known/) {
        return 403;
    }

    # Interne Drupal-Dateien sperren (Konfiguration, Vorlagen, Module)
    location ~* \.(engine|inc|install|module|profile|theme|twig|yml|yaml|sql|lock|log|md)$ {
        return 403;
    }

    # Hochgeladene Dateien dürfen nie als PHP ausgeführt werden
    location ~ ^/sites/[^/]+/files/.*\.php$ {
        return 403;
    }

    # PHP über PHP-FPM ausführen, auch mit Pfad dahinter (update.php/...)
    location ~ \.php(/|$) {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    # Bilder, CSS und JavaScript: fehlt eine Datei, erzeugt Drupal sie
    location ~* \.(css|js|png|jpe?g|gif|ico|svg|webp|woff2?)$ {
        try_files $uri /index.php?$query_string;
        expires 30d;
        access_log off;
    }

    # Alle übrigen Adressen beantwortet Drupal über index.php
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
}
```

### 10. Konfiguration aktivieren

Erstellt einen symbolischen Link in `sites-enabled`.

```bash
sudo ln -s /etc/nginx/sites-available/drupal /etc/nginx/sites-enabled/drupal
```

### 11. nginx-Konfiguration prüfen

Prüft alle Konfigurationsdateien auf Syntaxfehler.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 12. nginx neu laden

Aktiviert die neue Seite im Webserver.

```bash
sudo systemctl reload nginx
```

## Drupal initialisieren und testen

### 13. Drupal über Drush auf der Befehlszeile installieren

Richtet Drupal mit dem Standard-Profil, der PostgreSQL-Datenbank und einem Administrator-Konto ein.

```bash
sudo -u www-data /var/www/drupal/vendor/bin/drush site:install standard \
  --db-url='pgsql://drupaluser:geheimes_passwort@127.0.0.1/drupaldb' \
  --site-name='Mein Entwicklungs-Drupal' \
  --account-name='admin' \
  --account-pass='AdminPasswort123' \
  --yes \
  --root=/var/www/drupal/web
```

*(Alternativ kann die Ersteinrichtung über den grafischen Installationsassistenten im Browser unter <http://localhost:8090> aufgerufen werden.)*

### 14. Website im Browser aufrufen

Prüft, ob Drupal Webanfragen beantwortet.

```bash
curl -sI http://localhost:8090/
```

**Prüfen:** Die Antwort liefert `HTTP/1.1 200 OK`. Im Browser erreichst du deine Drupal-Website unter <http://localhost:8090>.

Soll die Website unter einer eigenen Domain erreichbar sein, geht es weiter mit [Drupal mit nginx unter eigener Domain](nginx-drupal.md).

## Deinstallieren

### 1. Seite in nginx deaktivieren

Löscht die Verknüpfung aus `sites-enabled`.

```bash
sudo rm -f /etc/nginx/sites-enabled/drupal
```

### 2. nginx-Konfigurationsdatei löschen

Entfernt die Datei aus `sites-available`.

```bash
sudo rm -f /etc/nginx/sites-available/drupal
```

### 3. nginx neu laden

Übernimmt die Deaktivierung des Serverblocks.

```bash
sudo systemctl reload nginx
```

### 4. Drupal-Dateien löschen

Entfernt das gesamte Drupal-Projektverzeichnis.

```bash
sudo rm -rf /var/www/drupal
```

### 5. Drupal-Datenbank in PostgreSQL löschen

Löscht die Datenbank `drupaldb`. **Achtung:** Alle Inhalte und Tabellen gehen dabei verloren.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS drupaldb;"
```

### 6. Datenbankbenutzer in PostgreSQL löschen

Entfernt den PostgreSQL-Benutzer `drupaluser`.

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS drupaluser;"
```

### 7. Nicht mehr benötigte Pakete entfernen (optional)

Entfernt Composer und zusätzliche Module, falls sie nicht anderweitig gebraucht werden.

```bash
sudo apt purge composer php-bcmath
```

### 8. Verwaiste Abhängigkeiten bereinigen

Entfernt nicht mehr benötigte Systempakete.

```bash
sudo apt autoremove
```

**Prüfen:** Unter <http://localhost:8090> antwortet kein Webserver mehr.
