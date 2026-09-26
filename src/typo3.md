# TYPO3

TYPO3 ist ein Content-Management-System für große und mehrsprachige Websites mit fein abgestuften Rechten für Redakteure. Im deutschsprachigen Raum ist es besonders bei Hochschulen, Behörden und Unternehmen verbreitet. Inhalte werden im Browser gepflegt, das Aussehen bestimmen Themes und Vorlagen.

## Vorbemerkungen

- **Kein apt-Paket:** TYPO3 ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit **Composer** installiert, dem Paketmanager für PHP. Composer, PHP, PostgreSQL und nginx kommen aus den Ubuntu-Paketquellen.
- **Voraussetzungen:** [nginx](nginx.md) und [PostgreSQL](postgresql.md) sind installiert und laufen. TYPO3 kann auch MySQL/MariaDB verwenden, diese Anleitung nutzt PostgreSQL wie die Anleitungen für [Drupal](drupal.md) und [Joomla](joomla.md).
- **Adresse:** TYPO3 läuft hier unter <http://localhost:8092>, nur vom eigenen Rechner aus erreichbar. Rufe es immer über `localhost` auf und nicht über `127.0.0.1`. TYPO3 prüft den Hostnamen und zeigt bei einem unerwarteten Namen nur „Oops, an error occurred!“.
- **Eigentümer:** Alle Dateien gehören dem Webserver-Benutzer `www-data`, und auch Composer und die TYPO3-Befehle laufen als `www-data`. So können Webserver und Befehlszeile dieselben Dateien schreiben.
- **Version:** Getestet mit TYPO3 **14.3.7** (Langzeitversion mit Pflege bis Mitte 2029), PHP 8.5, Composer 2.9 und PostgreSQL 18 unter Ubuntu 26.04.

## PHP und Composer vorbereiten

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. PHP, Erweiterungen und Composer installieren

- `php-fpm` führt PHP-Dateien für nginx aus, `php-pgsql` verbindet PHP mit PostgreSQL.
- `gd`, `intl`, `zip`, `xml`, `mbstring` und `curl` braucht TYPO3 für Bilder, Sprachen, Pakete, XML-Dateien, Umlaute und Downloads.
- `composer` lädt TYPO3 und alle PHP-Bibliotheken, die es braucht.

Sind Pakete schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install php-fpm php-pgsql php-gd php-intl php-zip php-xml php-mbstring php-curl composer
```

**Prüfen:** Die Ausgabe beginnt mit `Composer version 2`.

```bash
composer --version
```

### 3. Ordner für TYPO3 und den Composer-Zwischenspeicher anlegen

`/var/www/typo3` nimmt die Website auf. Composer legt heruntergeladene Pakete im Home-Verzeichnis des Benutzers ab, das ist bei `www-data` der Ordner `/var/www`. Weil `/var/www` selbst `root` gehört, bekommt `www-data` dort einen eigenen Ordner `.cache`.

```bash
sudo mkdir /var/www/typo3 /var/www/.cache
```

### 4. Ordner dem Webserver-Benutzer übergeben

```bash
sudo chown www-data:www-data /var/www/typo3 /var/www/.cache
```

## TYPO3 herunterladen

### 5. TYPO3-Projekt anlegen

`create-project` lädt die offizielle Grundausstattung `typo3/cms-base-distribution` in Version 14 samt aller Bibliotheken nach `/var/www/typo3`. `cd /tmp` davor ist nötig, weil `www-data` nicht in deinem Home-Verzeichnis arbeiten darf.

```bash
cd /tmp && sudo -u www-data composer create-project "typo3/cms-base-distribution:^14" /var/www/typo3
```

**Prüfen:** Die Ausgabe endet mit `No security vulnerability advisories found.` Hinweise auf „funding“ kannst du ignorieren.

### 6. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd /var/www/typo3
```

**Prüfen:** Die Ausgabe beginnt mit `TYPO3 CMS 14.3.7`.

```bash
sudo -u www-data vendor/bin/typo3 --version
```

### 7. Theme „Camino“ hinzufügen

Camino ist das Standard-Theme von TYPO3 14. Es bringt ein fertiges Design und eine Beispielwebsite mit, die beim Einrichten in Schritt 12 automatisch angelegt wird. Ohne Theme bliebe die Website zunächst leer.

```bash
sudo -u www-data composer require typo3/theme-camino:^14.3
```

## Datenbank in PostgreSQL einrichten

### 8. Datenbankbenutzer anlegen

Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 12. Benutzer und Datenbank heißen beide `typo3`. Das ist wichtig, denn das Einrichtungsprogramm von TYPO3 meldet sich zuerst bei der Datenbank an, die denselben Namen wie der Benutzer hat.

```bash
sudo -u postgres psql -c "CREATE USER typo3 WITH PASSWORD 'geheimes_passwort';"
```

**Prüfen:** Die Ausgabe lautet `CREATE ROLE`.

### 9. Datenbank anlegen

```bash
sudo -u postgres psql -c "CREATE DATABASE typo3 OWNER typo3 ENCODING 'UTF8';"
```

**Prüfen:** Die Ausgabe lautet `CREATE DATABASE`.

## nginx einrichten

### 10. Konfiguration für TYPO3 anlegen

```bash
sudo nano /etc/nginx/sites-available/typo3
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```nginx
server {
    listen 127.0.0.1:8092;
    server_name localhost;

    root /var/www/typo3/public;
    index index.php index.html;

    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location = /typo3 {
        rewrite ^ /typo3/;
    }

    location /typo3/ {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/(fileadmin/_recycler_|fileadmin/user_upload/_temp_|typo3temp/var)/ {
        deny all;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

- `root /var/www/typo3/public` – nur der Unterordner `public` ist über das Web erreichbar. Einstellungen, Bibliotheken und Protokolle liegen außerhalb.
- `try_files … /index.php` – alle Adressen ohne passende Datei gehen an TYPO3, auch die Verwaltung unter `/typo3/`.
- `deny all` – sperrt den Papierkorb, temporäre Uploads und Zwischendateien. Der Block steht vor dem PHP-Block, weil nginx solche Regeln der Reihe nach prüft und die erste passende nimmt.
- Der letzte Block sperrt versteckte Dateien.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Konfiguration aktivieren, prüfen und laden

```bash
sudo ln -s /etc/nginx/sites-available/typo3 /etc/nginx/sites-enabled/typo3
```

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Nur dann weiter.

```bash
sudo systemctl reload nginx
```

## TYPO3 einrichten

### 12. TYPO3 über die Befehlszeile einrichten

`setup` legt die Tabellen in der Datenbank an, schreibt die Einstellungen nach `config/system/settings.php`, legt das Administratorkonto an und importiert die Beispielwebsite von Camino.

Passe vorher die Werte an:

- `--password` – das Datenbankpasswort aus Schritt 8.
- `--admin-username`, `--admin-user-password` und `--admin-email` – deine Anmeldedaten für die Verwaltung. Das Passwort muss mindestens 8 Zeichen lang sein und Groß- und Kleinbuchstaben, eine Ziffer und ein Sonderzeichen enthalten.
- `--project-name` – der Name der Installation, er erscheint in der Verwaltung.

```bash
sudo -u www-data vendor/bin/typo3 setup -n --driver=postgres --host=localhost --port=5432 --dbname=typo3 --username=typo3 --password=geheimes_passwort --admin-username=admin --admin-user-password='Ein-langes-Passwort-2026!' --admin-email=admin@example.com --project-name="Meine TYPO3-Website" --server-type=other
```

**Prüfen:** Die letzte Zeile lautet `✓ Congratulations - TYPO3 Setup is done.`

Bricht der Befehl mit einer Fehlermeldung ab, behebe die Ursache, lösche die Datenbank und lege sie neu an (Schritt 9 und Abschnitt „Deinstallieren“, Schritt 6). Hänge beim erneuten Aufruf `--force` an, damit TYPO3 die schon geschriebene `settings.php` überschreibt.

### 13. Website auf Deutsch und die Startadresse umstellen

Die Beispielwebsite ist auf Englisch eingestellt und liegt unter `/camino/`. In der Site-Konfiguration stellst du Sprache, Adresse und Titel um.

```bash
sudo nano config/sites/camino/config.yaml
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein:

```yaml
base: /
dependencies:
  - typo3/theme-camino
languages:
  -
    title: Deutsch
    enabled: '1'
    locale: de-DE
    hreflang: de-DE
    base: /
    websiteTitle: 'Meine TYPO3-Website'
    navigationTitle: Deutsch
    flag: de
    languageId: '0'
rootPageId: 1
websiteTitle: 'Meine TYPO3-Website'
```

- `base: /` – die Website erscheint direkt unter <http://localhost:8092/>.
- `locale: de-DE` – Datumsangaben, feste Texte des Themes und die Sprachangabe im HTML werden deutsch.
- `websiteTitle` – steht im Titel jedes Browser-Tabs.

Die Einrückung mit Leerzeichen gehört zum Format YAML und muss genau so bleiben. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. Deutsch für die Verwaltung freischalten

TYPO3 lädt Übersetzungen für die Verwaltung nur für Sprachen, die in den Einstellungen freigeschaltet sind. Eigene Einstellungen gehören in die Datei `additional.php`. Die Datei `settings.php` verwaltet TYPO3 selbst.

```bash
sudo nano config/system/additional.php
```

Füge diesen Inhalt ein:

```php
<?php

$GLOBALS['TYPO3_CONF_VARS']['LANG']['availableLocales'] = ['de'];
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. Deutsches Sprachpaket herunterladen

Lädt die deutschen Übersetzungen für alle installierten Erweiterungen nach `var/labels/de`.

```bash
sudo -u www-data vendor/bin/typo3 language:update de
```

**Prüfen:** Die Ausgabe listet Zeilen wie `Fetching new pack for language "de" for extension "backend"`. Die Meldung `Language iso code de not available or active` bedeutet, dass Schritt 14 fehlt oder einen Tippfehler enthält.

### 16. Zwischenspeicher leeren

TYPO3 hält Einstellungen und Seiten im Zwischenspeicher. Nach den Änderungen in Schritt 13 und 14 muss er geleert werden. Das ist auch nach jeder späteren Änderung an `config.yaml` nötig.

```bash
sudo -u www-data vendor/bin/typo3 cache:flush
```

### 17. Website ansehen

Öffne <http://localhost:8092> im Browser.

**Prüfen:** Die Beispielwebsite von Camino erscheint mit der Überschrift „Walk the Camino de Compostela“. Die Texte der Beispielseiten bleiben englisch, weil es Inhalte sind. Du bearbeitest oder löschst sie in der Verwaltung.

### 18. An der Verwaltung anmelden

Öffne <http://localhost:8092/typo3/> und melde dich mit dem Benutzernamen und Passwort aus Schritt 12 an.

**Prüfen:** Die Verwaltung öffnet sich. Links steht die Modulleiste, daneben der Seitenbaum mit der Seite „Camino“.

### 19. Verwaltung auf Deutsch umstellen

Die Sprache der Verwaltung stellt jeder Benutzer für sich ein. Klicke oben rechts auf deinen Benutzernamen und wähle **User Settings**. Wähle im Feld **Language** den Eintrag für Deutsch („German“) und klicke oben auf **Save**.

**Prüfen:** Nach dem Neuladen der Seite (<kbd>F5</kbd>) sind Menüs und Beschriftungen deutsch, z. B. „Benutzereinstellungen“.

## Aktualisieren

TYPO3 wird mit Composer aktualisiert. Lege vorher eine Sicherung an, mindestens der Datenbank und des Ordners `/var/www/typo3`.

### 1. In den Projektordner wechseln

```bash
cd /var/www/typo3
```

### 2. Neue Versionen anzeigen

Listet die Pakete auf, für die es neuere Versionen gibt. `Everything up to date` bedeutet, dass nichts zu tun ist.

```bash
sudo -u www-data composer outdated "typo3/*"
```

### 3. Pakete aktualisieren

Aktualisiert TYPO3 innerhalb der Version 14. Für den Sprung auf eine neue Hauptversion liest man vorher die Hinweise unter <https://docs.typo3.org>.

```bash
sudo -u www-data composer update "typo3/*" --with-all-dependencies
```

### 4. Datenbank anpassen und Sprachpakete erneuern

Neue Versionen bringen manchmal geänderte Tabellen und neue Übersetzungen mit. `extension:setup` passt die Datenbank an, `language:update` lädt die passenden Übersetzungen, `cache:flush` leert den Zwischenspeicher.

```bash
sudo -u www-data vendor/bin/typo3 extension:setup
```

```bash
sudo -u www-data vendor/bin/typo3 language:update de
```

```bash
sudo -u www-data vendor/bin/typo3 cache:flush
```

**Prüfen:** `sudo -u www-data vendor/bin/typo3 --version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Seite in nginx deaktivieren

```bash
sudo rm /etc/nginx/sites-enabled/typo3
```

### 2. nginx-Konfigurationsdatei löschen

```bash
sudo rm /etc/nginx/sites-available/typo3
```

### 3. nginx prüfen und neu laden

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

### 4. TYPO3-Dateien löschen

**Achtung:** Damit sind auch alle hochgeladenen Bilder und Dateien gelöscht. Der Befehl `cd /tmp` sorgt dafür, dass du nicht mehr im gelöschten Ordner stehst.

```bash
cd /tmp && sudo rm -r /var/www/typo3
```

### 5. Composer-Zwischenspeicher von www-data löschen

```bash
sudo rm -r /var/www/.cache
```

### 6. Datenbank löschen

**Achtung:** Damit sind alle Seiten, Inhalte und Benutzer der Website gelöscht.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS typo3;"
```

### 7. Datenbankbenutzer löschen

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS typo3;"
```

**Prüfen:** Die Seite ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:8092
```

### 8. Composer entfernen (optional)

Nur wenn kein anderes Projekt Composer braucht. PHP, PostgreSQL und nginx bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.

```bash
sudo apt purge composer
```

```bash
sudo apt autoremove --purge
```
