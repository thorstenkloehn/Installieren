# Backdrop CMS

Backdrop CMS ist ein Open-Source-Content-Management-System für kleine und mittlere Organisationen wie Vereine, Schulen oder Firmen. Es ist aus [Drupal](drupal.md) 7 hervorgegangen, bleibt aber bewusst einfacher und sparsamer im Betrieb. Beiträge, Seiten, Menüs, Layouts und Benutzerrechte verwaltet man im Browser. Backdrop steht unter der freien Lizenz GPL-2.0.

## Vorbemerkungen

- **Kein apt-Paket:** Backdrop ist nicht in den Ubuntu-Paketquellen enthalten. Es wird als ZIP-Datei von GitHub heruntergeladen und über ein mitgeliefertes Skript installiert. Composer ist nicht nötig. PHP, MariaDB und nginx kommen aus den Ubuntu-Paketquellen.
- **Datenbank:** Backdrop läuft nur mit **MariaDB** oder MySQL. Diese Anleitung installiert MariaDB aus den Ubuntu-Paketquellen mit.
- **Voraussetzung:** [nginx](nginx.md) ist installiert und läuft.
- **Adresse:** Backdrop läuft hier unter <http://localhost:8098>, nur vom eigenen Rechner aus erreichbar. Rufe es immer über `localhost` auf und nicht über `127.0.0.1`: Schritt 15 lässt nur diesen Namen zu, alles andere beantwortet Backdrop mit einem Fehler.
- **Eigentümer:** Alle Dateien gehören dem Webserver-Benutzer `www-data`, und auch das Installationsskript läuft als `www-data`.
- **Version:** Getestet mit Backdrop **1.35.1**, PHP 8.5 und MariaDB 11.8 unter Ubuntu 26.04.

## Pakete installieren

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. MariaDB, PHP und Erweiterungen installieren

- `mariadb-server` ist die Datenbank. Sie startet nach der Installation von selbst und lauscht nur auf dem eigenen Rechner.
- `php-fpm` führt PHP-Dateien für nginx aus, `php-mysql` verbindet PHP mit MariaDB.
- `gd`, `intl`, `zip`, `xml`, `mbstring` und `curl` braucht Backdrop für Bilder, Sprachen, Pakete, XML-Dateien, Umlaute und Downloads.
- `unzip` entpackt die ZIP-Datei von Backdrop.

Sind Pakete schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install mariadb-server php-fpm php-mysql php-gd php-intl php-zip php-xml php-mbstring php-curl unzip
```

**Prüfen:** Die Ausgabe enthält `11.8` und `MariaDB`.

```bash
mariadb --version
```

### 3. PHP-FPM neu laden

PHP-FPM läuft schon, falls eine andere Anleitung es installiert hat. Damit es die neue MariaDB-Erweiterung kennt, muss es neu geladen werden.

```bash
sudo systemctl reload php8.5-fpm
```

## Backdrop herunterladen

### 4. ZIP-Datei herunterladen

Lädt Backdrop 1.35.1 von GitHub in den Ordner `/tmp`. Die aktuelle Version findest du unter <https://github.com/backdrop/backdrop/releases>. Ersetze dann in diesem und dem nächsten Befehl die Versionsnummer.

```bash
cd /tmp && wget https://github.com/backdrop/backdrop/releases/download/1.35.1/backdrop.zip
```

**Prüfen:** Die letzte Zeile enthält `‘backdrop.zip’ gespeichert`.

### 5. Nach /var/www entpacken

Die ZIP-Datei enthält einen Ordner `backdrop`. `-d /var/www` legt ihn dort ab, er heißt dann `/var/www/backdrop`. `-q` unterdrückt die lange Liste der entpackten Dateien.

```bash
sudo unzip -q backdrop.zip -d /var/www
```

### 6. ZIP-Datei löschen

```bash
rm backdrop.zip
```

### 7. Dateien dem Webserver-Benutzer übergeben

`-R` ändert den Eigentümer aller Dateien und Unterordner. Backdrop muss in den Ordner `files` schreiben und schreibt bei der Installation auch `settings.php`.

```bash
sudo chown -R www-data:www-data /var/www/backdrop
```

## Deutsche Übersetzung bereitstellen

Das Installationsskript kann Deutsch nur einrichten, wenn die Übersetzungsdatei schon im Ordner liegt.

### 8. Ordner für Übersetzungen anlegen

```bash
sudo -u www-data mkdir /var/www/backdrop/files/translations
```

### 9. Deutsche Übersetzung herunterladen

Lädt die Übersetzung vom Übersetzungsserver des Backdrop-Projekts. `1.x` steht für alle Versionen der Reihe 1.

```bash
sudo -u www-data wget -O /var/www/backdrop/files/translations/backdropcms-1.x.de.po https://localize.backdropcms.org/files/l10n_packager/all/backdropcms/backdropcms-1.x.de.po
```

**Prüfen:** Die Datei ist knapp 1 MB groß (etwa `939843`).

```bash
ls -l /var/www/backdrop/files/translations
```

## Datenbank in MariaDB einrichten

Auf Ubuntu meldet sich `root` ohne Passwort an MariaDB an, wenn der Befehl mit `sudo` läuft. Das nutzen die nächsten drei Schritte.

### 10. Datenbank anlegen

`utf8mb4` speichert alle Zeichen, auch Emojis.

```bash
sudo mariadb -e "CREATE DATABASE backdrop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 11. Datenbankbenutzer anlegen

Backdrop meldet sich mit diesem Benutzer bei MariaDB an. Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 14. Verwende nur Buchstaben, Ziffern, `-` und `_`, weil das Passwort in Schritt 14 Teil einer Adresse ist.

```bash
sudo mariadb -e "CREATE USER 'backdrop'@'localhost' IDENTIFIED BY 'geheimes_passwort';"
```

### 12. Dem Benutzer die Datenbank freigeben

```bash
sudo mariadb -e "GRANT ALL PRIVILEGES ON backdrop.* TO 'backdrop'@'localhost';"
```

**Prüfen:** Die Ausgabe enthält die Zeile ``GRANT ALL PRIVILEGES ON `backdrop`.* TO `backdrop`@`localhost` ``.

```bash
sudo mariadb -e "SHOW GRANTS FOR 'backdrop'@'localhost';"
```

## Backdrop einrichten

### 13. In den Backdrop-Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd /var/www/backdrop
```

### 14. Backdrop installieren

Das Skript `install.sh` legt die Tabellen an, schreibt die Datenbankverbindung in `settings.php`, erzeugt das Administratorkonto und importiert die deutsche Übersetzung. Es ist ein PHP-Skript und wird deshalb mit `php` aufgerufen. Passe vorher die Werte an:

- `--db-url` – die Datenbank aus Schritt 10 bis 12, aufgebaut als `mysql://BENUTZER:PASSWORT@RECHNER/DATENBANK`. Setze dein Passwort ein.
- `--account-name`, `--account-pass` und `--account-mail` – die Anmeldedaten für die Verwaltung. Das Passwort landet dabei in der Befehlschronik des Terminals. Ändere es nach der ersten Anmeldung unter „Mein Konto“ → „Bearbeiten“. Ohne `--account-pass` erzeugt das Skript ein zufälliges Passwort, das es nicht anzeigt.
- `--site-name` und `--site-mail` – Name der Website und Absender für E-Mails der Website.
- `--langcode=de` – Deutsch als Sprache der Website und der Verwaltung.

```bash
sudo -u www-data php core/scripts/install.sh --db-url=mysql://backdrop:geheimes_passwort@localhost/backdrop --account-name=admin --account-pass='Ein-langes-Passwort-2026' --account-mail=admin@example.com --site-name="Meine Website" --site-mail=admin@example.com --langcode=de
```

Das dauert etwa 20 Sekunden.

**Prüfen:** Die Ausgabe lautet `Backdrop installed successfully.`

### 15. Erlaubte Adresse festlegen

Backdrop beantwortet sonst Anfragen mit jedem beliebigen Rechnernamen. Das kann ein Angreifer ausnutzen, etwa um gefälschte Links in E-Mails zum Zurücksetzen von Passwörtern unterzubringen. Der Statusbericht warnt deshalb, solange die Einstellung fehlt.

```bash
sudo nano settings.php
```

Drücke <kbd>Strg</kbd>+<kbd>Ende</kbd>, um ans Ende der Datei zu springen, und füge in einer neuen Zeile ein:

```php
$settings['trusted_host_patterns'] = array('^localhost(:8098)?$');
```

Das Muster erlaubt `localhost` mit und ohne Port 8098. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. settings.php schützen

Die Datei enthält das Datenbankpasswort. Danach darf nur noch `www-data` sie lesen, und niemand darf sie ändern. Über das Web ist sie nicht abrufbar, weil nginx außer den Einstiegsdateien von Backdrop keine PHP-Dateien ausliefert (Schritt 17).

```bash
sudo chmod 400 settings.php
```

**Prüfen:** Die Zeile beginnt mit `-r--------` und nennt zweimal `www-data`.

```bash
ls -l settings.php
```

Willst du `settings.php` später ändern, gib vorher mit `sudo chmod 600 settings.php` das Schreibrecht zurück und setze es danach wieder auf `400`.

## nginx einrichten

### 17. Konfiguration für Backdrop anlegen

```bash
sudo nano /etc/nginx/sites-available/backdrop
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```nginx
server {
    listen 127.0.0.1:8098;
    server_name localhost;

    root /var/www/backdrop;
    index index.php;

    client_max_body_size 64M;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/(index|core/update|core/authorize)\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_param PHP_VALUE "max_input_vars=10000";
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    location ~ \.php$ {
        return 404;
    }

    location ~ ^/files/.*\.(po|htaccess)$ {
        deny all;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

- `try_files … /index.php` – alle Adressen ohne passende Datei gehen an Backdrop. So entstehen kurze Adressen wie `/posts/mein-beitrag`.
- `index`, `core/update` und `core/authorize` – die einzigen PHP-Dateien, die Backdrop über das Web braucht: die Website selbst, die Aktualisierung der Datenbank nach einem Update und die Installation von Erweiterungen. Alle anderen PHP-Dateien, auch `settings.php`, liefert nginx nicht aus (`return 404`).
- `max_input_vars=10000` – PHP nimmt sonst nur 1000 Felder pro Formular an. Große Formulare der Verwaltung, etwa die Berechtigungen, brauchen mehr, und der Statusbericht warnt. PHP-FPM behält den Wert in seinen Arbeitsprozessen, sodass ihn auch andere Websites auf dem Rechner bekommen können. Das schadet nicht.
- `files/…(po|htaccess)` – sperrt die Übersetzungsdateien und die Schutzdateien im Upload-Ordner. Der letzte Block sperrt versteckte Dateien.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 18. Konfiguration aktivieren

```bash
sudo ln -s /etc/nginx/sites-available/backdrop /etc/nginx/sites-enabled/backdrop
```

### 19. Konfiguration prüfen

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Nur dann weiter.

### 20. nginx neu laden

```bash
sudo systemctl reload nginx
```

## Backdrop verwenden

### 21. Website ansehen

Öffne <http://localhost:8098> im Browser.

**Prüfen:** Die Startseite zeigt „Welcome to Meine Website!“ und darunter Kärtchen wie „Organisieren Sie Ihre Inhalte“. Im Tab des Browsers steht „Startseite | Meine Website“.

### 22. Anmelden

Öffne <http://localhost:8098/user/login> und melde dich mit Benutzername und Passwort aus Schritt 14 an.

**Prüfen:** Backdrop öffnet das Dashboard. Oben steht die Verwaltungsleiste mit „Dashboard“, „Inhalt“, „Benutzerkonten“, „Design“, „Funktionalität“, „Struktur“, „Konfiguration“ und „Berichte“.

### 23. Einen Beitrag schreiben

1. Klicke in der Verwaltungsleiste auf **Inhalt** und dann auf **Inhalt hinzufügen**. Zur Auswahl stehen „Beitrag“, „Card“ und „Seite“.
2. Wähle **Beitrag**.
3. Gib einen **Title** und im Feld **Body** einen Text ein.
4. Lass unter „Veröffentlichungsaktion“ die Auswahl **Jetzt veröffentlichen** stehen und klicke unten auf **Speichern**.

**Prüfen:** Backdrop zeigt den Beitrag unter einer Adresse wie `http://localhost:8098/posts/mein-titel` und meldet „Beitrag … wurde erstellt.“ Einige Feldnamen wie „Title“ und „Body“ bleiben englisch, weil sie als Namen der Felder gespeichert sind. Du kannst sie unter **Struktur** → **Inhaltstypen** umbenennen.

### 24. Statusbericht ansehen

Öffne **Berichte** → **Statusbericht** (<http://localhost:8098/admin/reports/status>). Hier zeigt Backdrop, ob alles in Ordnung ist und ob Updates bereitstehen.

**Prüfen:** Keine Zeile ist als „Warnung“ oder „Fehler“ markiert.

## Aktualisieren

Bei einem Update ersetzt man nur den Ordner `core`. Eigene Module, Themes, Layouts, hochgeladene Dateien und `settings.php` liegen außerhalb und bleiben erhalten. Lege vorher eine Sicherung der Datenbank und des Ordners `/var/www/backdrop` an. Der Statusbericht zeigt, wenn eine neue Version bereitsteht.

### 1. Neue Version herunterladen

Ersetze `1.35.1` durch die neue Versionsnummer von <https://github.com/backdrop/backdrop/releases>.

```bash
cd /tmp && wget https://github.com/backdrop/backdrop/releases/download/1.35.1/backdrop.zip
```

### 2. Neue Version entpacken

Entpackt die Dateien nach `/tmp/backdrop`.

```bash
unzip -q backdrop.zip
```

### 3. Alten Kern löschen

```bash
sudo rm -r /var/www/backdrop/core
```

### 4. Neuen Kern einsetzen

```bash
sudo cp -r /tmp/backdrop/core /var/www/backdrop/
```

### 5. Neuen Kern dem Webserver-Benutzer übergeben

```bash
sudo chown -R www-data:www-data /var/www/backdrop/core
```

### 6. Heruntergeladene Dateien löschen

```bash
rm -r /tmp/backdrop /tmp/backdrop.zip
```

### 7. Datenbank im Browser aktualisieren

Melde dich an und öffne <http://localhost:8098/core/update.php>. Klicke auf **Continue** und folge den Schritten. Gibt es nichts zu tun, meldet Backdrop „Keine ausstehenden Aktualisierungen.“

**Prüfen:** Der Statusbericht nennt unter „Backdrop CMS“ die neue Versionsnummer.

## Deinstallieren

### 1. Seite in nginx deaktivieren

```bash
sudo rm /etc/nginx/sites-enabled/backdrop
```

### 2. nginx-Konfigurationsdatei löschen

```bash
sudo rm /etc/nginx/sites-available/backdrop
```

### 3. nginx prüfen und neu laden

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

### 4. Backdrop-Dateien löschen

**Achtung:** Damit sind auch alle hochgeladenen Bilder und Dateien gelöscht. Der Befehl `cd /tmp` sorgt dafür, dass du nicht mehr im gelöschten Ordner stehst.

```bash
cd /tmp && sudo rm -r /var/www/backdrop
```

### 5. Datenbank löschen

**Achtung:** Damit sind alle Inhalte und Benutzer der Website gelöscht.

```bash
sudo mariadb -e "DROP DATABASE IF EXISTS backdrop;"
```

### 6. Datenbankbenutzer löschen

```bash
sudo mariadb -e "DROP USER IF EXISTS 'backdrop'@'localhost';"
```

**Prüfen:** Die Seite ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:8098
```

### 7. MariaDB entfernen (optional)

Nur wenn kein anderes Programm MariaDB braucht, z. B. [Contao](contao.md), [Neos](neos.md) oder [Concrete CMS](concrete.md). **Achtung:** `purge` löscht auch alle übrigen Datenbanken in MariaDB. PHP, `unzip` und nginx bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.

```bash
sudo apt purge mariadb-server mariadb-common php-mysql
```

Fragt ein blauer Dialog, ob alle MariaDB-Datenbanken entfernt werden sollen, wähle **Ja**.

Der nächste Befehl entfernt die Pakete, die nur für MariaDB mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Die Ausgabe lautet `mariadb: Kommando nicht gefunden` (oder `command not found`).

```bash
mariadb --version
```
