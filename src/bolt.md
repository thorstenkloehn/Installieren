# Bolt CMS

Bolt ist ein schlankes Open-Source-Content-Management-System auf Basis des PHP-Frameworks Symfony. Welche Inhaltstypen es gibt (Seiten, Blogeinträge, Produkte …) und welche Felder sie haben, legt man in einer übersichtlichen YAML-Datei fest. Das Aussehen bestimmen Twig-Vorlagen. Bolt steht unter der freien MIT-Lizenz.

## Vorbemerkungen

- **Kein apt-Paket:** Bolt ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit **Composer** installiert, dem Paketmanager für PHP. Composer, PHP und nginx kommen aus den Ubuntu-Paketquellen.
- **Datenbank:** Diese Anleitung verwendet **SQLite**, die Voreinstellung von Bolt. Die ganze Datenbank ist dann eine Datei im Projektordner, ein Datenbankserver ist nicht nötig. Das reicht für kleine und mittlere Websites. Mit PostgreSQL bricht die Einrichtung von Bolt 6 ab (`Schema »public« existiert bereits`).
- **Voraussetzung:** [nginx](nginx.md) ist installiert und läuft.
- **Adresse:** Bolt läuft hier unter <http://localhost:8097>, nur vom eigenen Rechner aus erreichbar. Die Verwaltung liegt unter `/bolt`.
- **Eigentümer:** Alle Dateien gehören dem Webserver-Benutzer `www-data`, und auch Composer und die Bolt-Befehle laufen als `www-data`.
- **Datenschutz:** Das mitgelieferte Theme lädt Schriften von Google Fonts, ein Skript von jsDelivr und bindet eine Karte von Google Maps ein. Dabei erfahren diese Dienste die IP-Adresse jedes Besuchers. Für eine öffentliche Website in der EU solltest du ein eigenes Theme verwenden oder diese Teile entfernen.
- **Version:** Getestet mit Bolt **6.1.8**, Symfony 6.4, PHP 8.5, Composer 2.9 und SQLite 3.46 unter Ubuntu 26.04.

## Pakete installieren

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. PHP, Erweiterungen und Composer installieren

- `php-fpm` führt PHP-Dateien für nginx aus, `php-sqlite3` verbindet PHP mit SQLite.
- `gd`, `intl`, `zip`, `xml`, `mbstring` und `curl` braucht Bolt für Bilder, Sprachen, Pakete, XML-Dateien, Umlaute und Downloads.
- `composer` lädt Bolt und alle PHP-Bibliotheken, die es braucht.

Sind Pakete schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install php-fpm php-sqlite3 php-gd php-intl php-zip php-xml php-mbstring php-curl composer
```

**Prüfen:** Die Ausgabe enthält `pdo_sqlite` und `sqlite3`.

```bash
php -m | grep -i sqlite
```

### 3. PHP-FPM neu laden

PHP-FPM läuft schon, falls eine andere Anleitung es installiert hat. Damit es die neue SQLite-Erweiterung kennt, muss es neu geladen werden.

```bash
sudo systemctl reload php8.5-fpm
```

### 4. Ordner für Bolt und den Composer-Zwischenspeicher anlegen

`/var/www/bolt` nimmt die Website auf. Composer legt heruntergeladene Pakete im Home-Verzeichnis des Benutzers ab, das ist bei `www-data` der Ordner `/var/www`. Weil `/var/www` selbst `root` gehört, bekommt `www-data` dort einen eigenen Ordner `.cache`. `-p` verhindert einen Fehler, falls `.cache` von einer anderen Anleitung schon existiert.

```bash
sudo mkdir -p /var/www/bolt /var/www/.cache
```

### 5. Ordner dem Webserver-Benutzer übergeben

```bash
sudo chown www-data:www-data /var/www/bolt /var/www/.cache
```

## Bolt herunterladen

### 6. Bolt-Projekt anlegen

`create-project` lädt die offizielle Projektvorlage `bolt/project` samt aller Bibliotheken nach `/var/www/bolt`. Dabei erzeugt Bolt einen geheimen Schlüssel (`APP_SECRET`) in der Datei `.env`. `cd /tmp` davor ist nötig, weil `www-data` nicht in deinem Home-Verzeichnis arbeiten darf.

```bash
cd /tmp && sudo -u www-data composer create-project bolt/project /var/www/bolt
```

Das Herunterladen dauert einige Minuten.

**Prüfen:** Die Ausgabe enthält `No security vulnerability advisories found.` und endet mit `Running composer "post-create-project-cmd" scripts`.

### 7. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd /var/www/bolt
```

### 8. Produktionsmodus einstellen

Bolt startet im Entwicklungsmodus (`dev`). Er zeigt Besuchern bei Fehlern technische Details und ist langsamer. Eigene Einstellungen gehören in die Datei `.env.local`.

```bash
sudo nano .env.local
```

Die Datei enthält nur Kommentare mit Beispielen. Drücke <kbd>Strg</kbd>+<kbd>Ende</kbd>, um ans Ende zu springen, und füge in einer neuen Zeile ein:

```ini
APP_ENV=prod
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Ausgabe endet mit `(env: prod, debug: false)`.

```bash
sudo -u www-data bin/console --version
```

## Bolt einrichten

### 9. Datenbank, Konto und Beispielinhalte anlegen

`bolt:setup` legt die SQLite-Datenbank in `var/data/bolt.sqlite` an, erzeugt die Tabellen und einen neuen geheimen Schlüssel. `--fixtures` füllt die Website mit Beispielseiten, Blogeinträgen und Bildern. Die Bilder lädt Bolt dafür von einem Server des Projekts herunter.

```bash
sudo -u www-data bin/console bolt:setup --fixtures
```

Bolt fragt nacheinander nach dem ersten Konto. Es bekommt die höchste Rolle „Developer“ und darf alles.

- `Username` – dein Benutzername, z. B. `admin`.
- `Password (input is hidden)` – dein Passwort. Die Eingabe bleibt unsichtbar. Drückst du nur <kbd>Enter</kbd>, setzt Bolt ein zufälliges Passwort, das du nicht kennst. Gib also unbedingt ein eigenes ein.
- `Email` – deine E-Mail-Adresse.
- `Display Name` – der Name, der in der Verwaltung erscheint.

**Prüfen:** Die Ausgabe enthält `User was successfully created` und endet mit `Bolt was set up successfully!`. Der Hinweis auf `server:start` darunter betrifft den eingebauten Testserver, den du hier nicht brauchst.

Die Beispielinhalte legen zusätzlich fünf Demo-Konten an (z. B. `jane_chief`, `tom_admin`). Sie haben zufällige Passwörter, die niemand kennt. Lösche sie nicht, solange die Beispielinhalte da sind: Die Inhalte verweisen auf sie als Autoren, und die Startseite zeigt sonst einen Fehler.

### 10. Zwischenspeicher neu aufbauen

Das Setup hinterlässt einen unvollständigen Zwischenspeicher. Ohne diesen Schritt zeigt die Startseite einen Fehler (`500 :: Internal Server Error`).

```bash
sudo -u www-data bin/console cache:clear
```

**Prüfen:** Die Ausgabe lautet `Cache for the "prod" environment (debug=false) was successfully cleared.`

### 11. Datenbankdatei schützen

Die Datenbank enthält unter anderem die Passwort-Hashes der Konten und ist zunächst für alle Benutzer des Rechners lesbar. Danach darf nur noch `www-data` sie lesen und schreiben. Über das Web ist sie nicht erreichbar, weil sie außerhalb des Ordners `public` liegt.

```bash
sudo chmod 600 var/data/bolt.sqlite
```

## nginx einrichten

### 12. Konfiguration für Bolt anlegen

```bash
sudo nano /etc/nginx/sites-available/bolt
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```nginx
server {
    listen 127.0.0.1:8097;
    server_name localhost;

    root /var/www/bolt/public;
    index index.php;

    client_max_body_size 64M;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location = /index.php {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    location ~ \.php$ {
        return 404;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

- `root /var/www/bolt/public` – nur der Unterordner `public` ist über das Web erreichbar. Einstellungen, Datenbank und Bibliotheken liegen außerhalb.
- `try_files … /index.php` – alle Adressen ohne passende Datei gehen an Bolt, auch die Verwaltung unter `/bolt`. Bilder in `public/files` und `public/thumbs` liefert nginx direkt aus.
- Bolt braucht nur die Datei `index.php`. Andere PHP-Dateien liefert nginx nicht aus (`return 404`). Der letzte Block sperrt versteckte Dateien.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Konfiguration aktivieren

```bash
sudo ln -s /etc/nginx/sites-available/bolt /etc/nginx/sites-enabled/bolt
```

### 14. Konfiguration prüfen

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Nur dann weiter.

### 15. nginx neu laden

```bash
sudo systemctl reload nginx
```

## Bolt verwenden

### 16. Website ansehen

Öffne <http://localhost:8097> im Browser.

**Prüfen:** Die Beispielwebsite erscheint mit der Überschrift „Welcome to your new site“ und darunter „Introduction“. Die übrigen Texte sind Blindtext in Pseudo-Latein.

### 17. An der Verwaltung anmelden

Öffne <http://localhost:8097/bolt> und melde dich mit Benutzername und Passwort aus Schritt 9 an.

**Prüfen:** Das Dashboard begrüßt dich mit „Hey, Dein Name!“. Links stehen die Inhaltstypen „Homepage“, „Pages“, „Entries“, „People“, „Blocks“ und „Products“ und darunter „Configuration“, „Maintenance“ und „File management“.

### 18. Verwaltung auf Deutsch umstellen

Die Sprache der Verwaltung stellt jeder Benutzer für sich ein.

1. Klicke oben rechts auf deinen Namen und dann auf **Edit Profile**, oder öffne <http://localhost:8097/bolt/profile-edit>.
2. Wähle im Feld **Locale** den Eintrag **🇩🇪 German (Deutsch, de)**.
3. Klicke auf **Save changes**.

**Prüfen:** Menüpunkte wie „Konfiguration“, „Wartung“ und „Dateiverwaltung“ sind jetzt deutsch. Die Namen der Inhaltstypen („Pages“, „Entries“ …) bleiben englisch. Sie stehen in `config/bolt/contenttypes.yaml` und lassen sich dort mit `name` und `singular_name` umbenennen.

Ändere nicht die Einstellung `locale` in `config/services.yaml` auf `de`: Die Inhaltstypen der Vorlage kennen die Sprache `de` nicht, und die Startseite leitet dann endlos auf sich selbst um.

### 19. Eine Seite bearbeiten

1. Klicke links auf **Homepage**. Der Inhaltstyp hat nur einen Eintrag, deshalb öffnet sich gleich der Editor.
2. Ändere das Feld **Title**.
3. Klicke rechts auf **Speichern**.

Über **Vorschau** siehst du die Seite vor dem Speichern. Unter **Status** legst du fest, ob ein Eintrag veröffentlicht, ein Entwurf oder zurückgezogen ist.

**Prüfen:** Lädst du <http://localhost:8097> neu, steht der geänderte Titel auf der Startseite.

## Aktualisieren

Bolt wird mit Composer aktualisiert. Lege vorher eine Sicherung des Ordners `/var/www/bolt` an. Darin liegt auch die Datenbank (`var/data/bolt.sqlite`).

### 1. In den Projektordner wechseln

```bash
cd /var/www/bolt
```

### 2. Pakete aktualisieren

Aktualisiert Bolt und alle Bibliotheken innerhalb der erlaubten Versionen. Danach passt Bolt die Datenbank an und kopiert neue Dateien für die Verwaltung nach `public`.

```bash
sudo -u www-data composer update
```

**Prüfen:** Die Ausgabe enthält `No security vulnerability advisories found.`

### 3. Zwischenspeicher neu aufbauen

```bash
sudo -u www-data bin/console cache:clear
```

**Prüfen:** Die Ausgabe enthält `Bolt version:` mit der neuen Versionsnummer.

```bash
sudo -u www-data bin/console bolt:info
```

## Deinstallieren

### 1. Seite in nginx deaktivieren

```bash
sudo rm /etc/nginx/sites-enabled/bolt
```

### 2. nginx-Konfigurationsdatei löschen

```bash
sudo rm /etc/nginx/sites-available/bolt
```

### 3. nginx prüfen und neu laden

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

### 4. Bolt löschen

**Achtung:** Damit sind auch die Datenbank mit allen Inhalten und Konten und alle hochgeladenen Dateien gelöscht. Der Befehl `cd /tmp` sorgt dafür, dass du nicht mehr im gelöschten Ordner stehst.

```bash
cd /tmp && sudo rm -r /var/www/bolt
```

**Prüfen:** Die Seite ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:8097
```

### 5. Composer-Zwischenspeicher von www-data löschen

Nur wenn keine andere Anleitung (z. B. [TYPO3](typo3.md), [Contao](contao.md) oder [Neos](neos.md)) ihn noch braucht.

```bash
sudo rm -r /var/www/.cache
```

### 6. SQLite-Erweiterung und Composer entfernen (optional)

Nur wenn kein anderes Programm sie braucht. PHP und nginx bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.

```bash
sudo apt purge php-sqlite3 composer
```

Der nächste Befehl entfernt die Pakete, die nur dafür mitinstalliert wurden (z. B. `php8.5-sqlite3`, `php-symfony-console`). Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```
