# MediaWiki

MediaWiki ist eine leistungsfähige Open-Source-Wiki-Software, die unter anderem die freie Enzyklopädie Wikipedia antreibt. Auf dem Entwicklungsrechner dient sie dazu, Wissenssammlungen, Dokumentationen oder eigene Erweiterungen lokal mit nginx, PHP und PostgreSQL einzurichten und zu testen.

## Vorbemerkungen

- **Voraussetzungen:** [nginx](nginx.md), [PHP](php.md) mit PHP-FPM und [PostgreSQL](postgresql.md) sind nach den jeweiligen Anleitungen installiert und laufen.
- **Installation über Git:** Ubuntu enthält zwar ein Paket `mediawiki`, diese Anleitung holt MediaWiki aber direkt aus dem Git-Repository des Projekts. So lässt sich der Quellcode leicht untersuchen, auf neue Versionen umstellen und für eigene Erweiterungen nutzen.
- **Version:** Verwendet wird die Version mit Langzeitunterstützung (LTS) **1.43** (Git-Zweig `REL1_43`). Sie läuft auch mit PHP 8.5 aus Ubuntu 26.04 ohne Fehlermeldungen.
- **Passwörter:** `geheimes_passwort` und `AdminPasswort123` sind Beispiele. Ersetze sie überall durch eigene Passwörter.

## Vorbereitung und Abhängigkeiten

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketstände der Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. PHP-Erweiterungen, Git und Composer installieren

MediaWiki braucht neben `git` und dem PHP-Paketmanager `composer` Module für die PostgreSQL-Anbindung (`php-pgsql`), Unicode-Verarbeitung (`php-intl`), Bildbearbeitung (`php-gd`), Zwischenspeicher (`php-apcu`), Netzwerkzugriffe (`php-curl`), Zeichenketten (`php-mbstring`) und XML (`php-xml`).

```bash
sudo apt install git composer php-pgsql php-intl php-gd php-apcu php-curl php-mbstring php-xml
```

**Prüfen:** Die Liste enthält `apcu`, `gd`, `intl` und `pgsql`.

```bash
php -m | grep -E "^(pgsql|intl|gd|apcu)$"
```

### 3. PHP-FPM neu starten

PHP-FPM lädt neu installierte Module erst nach einem Neustart. Ohne diesen Schritt kennt der Webserver z. B. die PostgreSQL-Anbindung noch nicht.

```bash
sudo systemctl restart php8.5-fpm
```

## Datenbank in PostgreSQL einrichten

### 4. Datenbankbenutzer für MediaWiki anlegen

Erstellt einen eigenen Benutzer `wikiuser` in PostgreSQL. MediaWiki meldet sich mit diesem Benutzer und Passwort an der Datenbank an.

```bash
sudo -u postgres psql -c "CREATE USER wikiuser WITH PASSWORD 'geheimes_passwort';"
```

### 5. Datenbank für MediaWiki anlegen

Erstellt die leere Datenbank `wikidb` und macht `wikiuser` zu ihrem Eigentümer.

```bash
sudo -u postgres psql -c "CREATE DATABASE wikidb OWNER wikiuser;"
```

**Prüfen:** Die Datenbank wird in der Datenbankliste aufgeführt.

```bash
sudo -u postgres psql -l | grep wikidb
```

## MediaWiki per Git herunterladen und einrichten

### 6. MediaWiki per Git klonen

Klont die LTS-Version in das Verzeichnis `/var/www/mediawiki`. Mit `--depth 1` wird nur der aktuelle Stand ohne die gesamte Versionsgeschichte geladen, das spart Zeit und Speicherplatz.

```bash
sudo git clone -b REL1_43 --depth 1 https://gerrit.wikimedia.org/r/mediawiki/core.git /var/www/mediawiki
```

**Prüfen:** Das Verzeichnis enthält unter anderem `index.php` und `composer.json`.

```bash
ls /var/www/mediawiki
```

### 7. Standard-Design (Vector) per Git klonen

MediaWiki trennt den Kern von den Designs (Skins). Das bekannte Design Vector wird separat in den Ordner `skins/Vector` geklont. Der Git-Zweig muss zur Version von MediaWiki passen.

```bash
sudo git clone -b REL1_43 --depth 1 https://gerrit.wikimedia.org/r/mediawiki/skins/Vector /var/www/mediawiki/skins/Vector
```

### 8. Eigentümer auf deinen Benutzer ändern

Die Dateien gehören nach dem Klonen `root`. Als Entwickler sollst du sie ohne `sudo` bearbeiten, mit Git aktualisieren und Composer ausführen können. Der Webserver braucht nur Lesezugriff, der ohnehin besteht. Schreibrechte bekommt er in Schritt 12 gezielt für zwei Ordner.

```bash
sudo chown -R "$USER":"$USER" /var/www/mediawiki
```

### 9. Externe PHP-Bibliotheken mit Composer installieren

Installiert alle in `composer.json` festgelegten Bibliotheken in den Ordner `vendor/`. `--no-dev` lässt Werkzeuge weg, die nur zum Testen von MediaWiki selbst gebraucht werden.

```bash
composer install --no-dev -d /var/www/mediawiki
```

**Prüfen:** Der Ordner `vendor` enthält jetzt Unterordner, z. B. `wikimedia`.

```bash
ls /var/www/mediawiki/vendor
```

## MediaWiki installieren

### 10. MediaWiki über die Kommandozeile installieren

Das Installationsskript legt die Tabellen in PostgreSQL an, erstellt das Administratorkonto `WikiAdmin` und schreibt die zentrale Einstellungsdatei `LocalSettings.php`. Die wichtigsten Angaben:

- `--server` – Adresse, unter der das Wiki erreichbar ist (mit Port, sonst zeigen Links ins Leere)
- `--scriptpath ""` – das Wiki liegt direkt unter `/`, nicht in einem Unterordner
- `--lang de` – Oberfläche und Seitennamen auf Deutsch (z. B. „Hauptseite“)
- die beiden letzten Angaben – Name des Wikis und Name des Administratorkontos

Das Skript erkennt das Design Vector im Ordner `skins` von selbst und trägt es in `LocalSettings.php` ein.

```bash
php /var/www/mediawiki/maintenance/run.php install \
  --dbtype postgres \
  --dbserver 127.0.0.1 \
  --dbname wikidb \
  --dbuser wikiuser \
  --dbpass 'geheimes_passwort' \
  --pass 'AdminPasswort123' \
  --server http://localhost:8085 \
  --scriptpath "" \
  --lang de \
  "Mein Entwicklungs-Wiki" \
  WikiAdmin
```

**Prüfen:** Die Ausgabe endet mit `MediaWiki wurde erfolgreich installiert.` In `LocalSettings.php` stehen die Adresse und das Design:

```bash
grep -E "wgServer|wfLoadSkin" /var/www/mediawiki/LocalSettings.php
```

### 11. Kurze Adressen einschalten

Ohne diese Einstellung erzeugt MediaWiki Links wie `/index.php?title=Hauptseite`. Mit ihr heißen sie einfach `/Hauptseite`. Die nginx-Konfiguration in Schritt 14 ist darauf abgestimmt.

```bash
nano /var/www/mediawiki/LocalSettings.php
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei und füge in einer eigenen Zeile an (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```php
$wgArticlePath = "/$1";
```

### 12. Schreibrechte für den Webserver vergeben

Der Webserver läuft als Benutzer `www-data`. Er muss hochgeladene Dateien im Ordner `images` speichern und im Ordner `cache` Zwischenergebnisse ablegen können.

```bash
sudo chown -R www-data:www-data /var/www/mediawiki/images /var/www/mediawiki/cache
```

### 13. Einstellungsdatei schützen

`LocalSettings.php` enthält das Datenbank-Passwort. Diese beiden Befehle erlauben das Lesen nur noch dir und der Gruppe `www-data`, also dem Webserver.

```bash
sudo chgrp www-data /var/www/mediawiki/LocalSettings.php
```

```bash
chmod 640 /var/www/mediawiki/LocalSettings.php
```

**Prüfen:** Die Rechte lauten `-rw-r-----`, die Gruppe ist `www-data`.

```bash
ls -l /var/www/mediawiki/LocalSettings.php
```

## nginx konfigurieren

### 14. Konfiguration für MediaWiki anlegen

Erstellt einen eigenen Server-Block auf Port `8085`, der nur vom eigenen Rechner aus erreichbar ist. Die Reihenfolge der Blöcke ist wichtig: nginx prüft Blöcke mit regulären Ausdrücken (`~`) von oben nach unten und nimmt den ersten Treffer. Deshalb stehen die Sperren für interne Ordner, versteckte Dateien (z. B. den Ordner `.git`) und Konfigurationsdateien **vor** dem Block, der PHP-Dateien ausführt. Für kurze Adressen wie `/Hauptseite` gibt es keine Datei. `try_files` übergibt sie deshalb an `index.php`. MediaWiki liest den Seitennamen aus der ursprünglichen Adresse, die nginx als `REQUEST_URI` mitschickt, und vergleicht sie mit `$wgArticlePath` aus Schritt 11.

```bash
sudo nano /etc/nginx/sites-available/mediawiki
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 127.0.0.1:8085;
    server_name localhost;

    root /var/www/mediawiki;
    index index.php;

    client_max_body_size 20m;

    # Interne Ordner und versteckte Dateien (z. B. .git) sperren
    location ~ /\. {
        return 403;
    }

    location ~ ^/(cache|includes|languages|maintenance|serialized|tests|vendor)/ {
        return 403;
    }

    location ~ \.(lock|json|yml|yaml|md)$ {
        return 403;
    }

    # Im Upload-Ordner keine PHP-Dateien ausführen
    location ^~ /images/ {
        location ~ \.php$ {
            return 403;
        }
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    # Statische Dateien zwischenspeichern; fehlt die Datei, ist es eine
    # Wiki-Seite wie /Datei:Bild.png
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
}
```

### 15. Konfiguration aktivieren

Ein Link in `sites-enabled` sorgt dafür, dass nginx die neue Seite lädt.

```bash
sudo ln -s /etc/nginx/sites-available/mediawiki /etc/nginx/sites-enabled/mediawiki
```

### 16. nginx-Konfiguration testen

Findet Tippfehler, bevor nginx neu geladen wird.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 17. nginx neu laden

Übernimmt die Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

## Testen

### 18. Hauptseite abrufen

Prüft, ob das Wiki unter der kurzen Adresse antwortet.

```bash
curl -sI http://localhost:8085/Hauptseite
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 200 OK`. Im Browser leitet <http://localhost:8085> auf die Hauptseite deines Wikis im Vector-Design weiter. Oben rechts kannst du dich mit `WikiAdmin` und dem Administrator-Passwort anmelden.

### 19. Sperren prüfen

Stichprobe, ob interne Dateien wirklich gesperrt sind. Hier am Beispiel des Git-Ordners, der sonst die Versionsgeschichte preisgeben würde.

```bash
curl -sI http://localhost:8085/.git/config
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 403 Forbidden`.

Soll das Wiki unter einer eigenen Domain erreichbar sein, geht es weiter mit [MediaWiki mit nginx unter eigener Domain](nginx-mediawiki.md).

## Aktualisieren

Innerhalb der Version 1.43 erscheinen regelmäßig Fehler- und Sicherheitskorrekturen. So holst du sie:

### 1. Neuen Stand von MediaWiki holen

Lädt die Änderungen des Git-Zweigs `REL1_43` herunter.

```bash
git -C /var/www/mediawiki pull
```

### 2. Neuen Stand des Designs holen

Das Design Vector ist ein eigenes Git-Repository und wird getrennt aktualisiert.

```bash
git -C /var/www/mediawiki/skins/Vector pull
```

### 3. Bibliotheken angleichen

Bringt die Bibliotheken in `vendor/` auf den Stand, den die neue MediaWiki-Version erwartet.

```bash
composer update --no-dev -d /var/www/mediawiki
```

### 4. Datenbank anpassen

Passt die Tabellen an die neue Version an, falls nötig. `--quick` überspringt die Wartezeit vor dem Start.

```bash
php /var/www/mediawiki/maintenance/run.php update --quick
```

**Prüfen:** Die Ausgabe endet mit `Done`. Die Seite `http://localhost:8085/Spezial:Version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Seite in nginx deaktivieren

Löscht den Link aus `sites-enabled`.

```bash
sudo rm -f /etc/nginx/sites-enabled/mediawiki
```

### 2. nginx-Konfigurationsdatei löschen

Löscht die Konfigurationsdatei der Seite.

```bash
sudo rm -f /etc/nginx/sites-available/mediawiki
```

### 3. nginx neu laden

Übernimmt das Abschalten der Seite.

```bash
sudo systemctl reload nginx
```

### 4. MediaWiki-Dateien löschen

Entfernt den gesamten MediaWiki-Ordner. **Achtung:** Auch hochgeladene Dateien im Ordner `images` gehen verloren.

```bash
sudo rm -rf /var/www/mediawiki
```

### 5. MediaWiki-Datenbank löschen

Löscht die Datenbank `wikidb`. **Achtung:** Alle Seiten und Daten des Wikis werden dabei unwiderruflich gelöscht.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS wikidb;"
```

### 6. Datenbankbenutzer löschen

Löscht den Benutzer `wikiuser`.

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS wikiuser;"
```

### 7. Nicht mehr benötigte Pakete entfernen (optional)

Entfernt Composer und den PHP-Zwischenspeicher, falls sie nicht für andere Projekte gebraucht werden. Die übrigen PHP-Module aus Schritt 2 brauchen oft auch andere PHP-Anwendungen und bleiben deshalb erhalten.

```bash
sudo apt purge composer php-apcu
```

```bash
sudo apt autoremove
```

**Prüfen:** Unter <http://localhost:8085> antwortet kein Webserver mehr, `curl` meldet einen Verbindungsfehler.

```bash
curl -sI http://localhost:8085/
```
