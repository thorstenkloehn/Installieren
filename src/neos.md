# Neos

Neos ist ein Open-Source-Content-Management-System aus dem Umfeld von TYPO3. Redakteure bearbeiten Texte und Bilder direkt in der Vorschau der Seite und sehen sofort, wie sie aussehen. Änderungen landen zuerst in einem persönlichen Arbeitsbereich und gehen erst nach dem Veröffentlichen online. Neos steht unter der freien Lizenz GPL-3.0.

## Vorbemerkungen

- **Kein apt-Paket:** Neos ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit **Composer** installiert, dem Paketmanager für PHP. Composer, PHP, MariaDB und nginx kommen aus den Ubuntu-Paketquellen.
- **Datenbank:** Neos 9 speichert Inhalte nur in **MariaDB** oder MySQL. Mit PostgreSQL bricht die Einrichtung mit `Cannot build content graph for non mariadb/mysql connection` ab. Diese Anleitung installiert MariaDB aus den Ubuntu-Paketquellen mit.
- **Voraussetzung:** [nginx](nginx.md) ist installiert und läuft.
- **Adresse:** Neos läuft hier unter <http://localhost:8095>, nur vom eigenen Rechner aus erreichbar. Die Verwaltung liegt unter `/neos`.
- **Eigentümer:** Alle Dateien gehören dem Webserver-Benutzer `www-data`, und auch Composer und die Neos-Befehle laufen als `www-data`.
- **Betriebsart:** Neos kennt die Betriebsarten („Kontexte“) `Development` und `Production`. Diese Anleitung verwendet `Production`: schneller und ohne technische Fehlerdetails auf der Website. Deshalb beginnen alle Neos-Befehle mit `FLOW_CONTEXT=Production`, und nginx gibt denselben Wert an PHP weiter.
- **Version:** Getestet mit Neos **9.1.9**, PHP 8.5, Composer 2.9 und MariaDB 11.8 unter Ubuntu 26.04.

## Pakete installieren

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. MariaDB, PHP, Erweiterungen und Composer installieren

- `mariadb-server` ist die Datenbank. Sie startet nach der Installation von selbst und lauscht nur auf dem eigenen Rechner.
- `php-fpm` führt PHP-Dateien für nginx aus, `php-mysql` verbindet PHP mit MariaDB.
- `gd` bearbeitet Bilder (Vorschaubilder, Zuschnitte). `intl`, `zip`, `xml`, `mbstring` und `curl` braucht Neos für Sprachen, Pakete, XML-Dateien, Umlaute und Downloads.
- `composer` lädt Neos und alle PHP-Bibliotheken, die es braucht.

Sind Pakete schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install mariadb-server php-fpm php-mysql php-gd php-intl php-zip php-xml php-mbstring php-curl composer
```

**Prüfen:** Die Ausgabe beginnt mit `Composer version 2`.

```bash
composer --version
```

### 3. Ordner für Neos und den Composer-Zwischenspeicher anlegen

`/var/www/neos` nimmt die Website auf. Composer legt heruntergeladene Pakete im Home-Verzeichnis des Benutzers ab, das ist bei `www-data` der Ordner `/var/www`. Weil `/var/www` selbst `root` gehört, bekommt `www-data` dort einen eigenen Ordner `.cache`. `-p` verhindert einen Fehler, falls `.cache` von einer anderen Anleitung schon existiert.

```bash
sudo mkdir -p /var/www/neos /var/www/.cache
```

### 4. Ordner dem Webserver-Benutzer übergeben

```bash
sudo chown www-data:www-data /var/www/neos /var/www/.cache
```

## Neos herunterladen

### 5. Neos-Projekt anlegen

`create-project` lädt die Grundausstattung `neos/neos-base-distribution` in Version 9.1 samt aller Bibliotheken nach `/var/www/neos`. Dazu gehört die Demo-Website `Neos.Demo`. `cd /tmp` davor ist nötig, weil `www-data` nicht in deinem Home-Verzeichnis arbeiten darf.

```bash
cd /tmp && sudo -u www-data composer create-project neos/neos-base-distribution /var/www/neos "^9.1"
```

Das Herunterladen dauert einige Minuten.

**Prüfen:** Die Ausgabe endet mit `Please configure your database in the settings …` und `Neos setup not complete.` Das ist richtig, die Datenbank folgt in den nächsten Schritten.

### 6. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd /var/www/neos
```

**Prüfen:** Die erste Zeile endet mit `9.1.9 ("Production" context)` oder einer neueren Version.

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow help | head -1
```

## Datenbank in MariaDB einrichten

Auf Ubuntu meldet sich `root` ohne Passwort an MariaDB an, wenn der Befehl mit `sudo` läuft. Das nutzen die nächsten drei Schritte.

### 7. Datenbank anlegen

`utf8mb4` speichert alle Zeichen, auch Emojis.

```bash
sudo mariadb -e "CREATE DATABASE neos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 8. Datenbankbenutzer anlegen

Neos meldet sich mit diesem Benutzer bei MariaDB an. Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 10.

```bash
sudo mariadb -e "CREATE USER 'neos'@'localhost' IDENTIFIED BY 'geheimes_passwort';"
```

### 9. Dem Benutzer die Datenbank freigeben

```bash
sudo mariadb -e "GRANT ALL PRIVILEGES ON neos.* TO 'neos'@'localhost';"
```

**Prüfen:** Die Ausgabe enthält die Zeile ``GRANT ALL PRIVILEGES ON `neos`.* TO `neos`@`localhost` ``.

```bash
sudo mariadb -e "SHOW GRANTS FOR 'neos'@'localhost';"
```

## Neos einrichten

### 10. Einstellungen anlegen

Eigene Einstellungen stehen in `Configuration/Settings.yaml`. Sie gelten für alle Betriebsarten.

```bash
sudo nano Configuration/Settings.yaml
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>) und setze bei `password` dein Passwort aus Schritt 8 ein:

```yaml
Neos:
  Flow:
    persistence:
      backendOptions:
        driver: pdo_mysql
        host: localhost
        dbname: neos
        user: neos
        password: geheimes_passwort
        charset: utf8mb4
  Neos:
    userInterface:
      defaultLanguage: de
```

- `persistence` – die Verbindung zur Datenbank aus Schritt 7 bis 9.
- `defaultLanguage: de` – die Verwaltung erscheint auf Deutsch. Jeder Benutzer kann das später für sich ändern.

Die Einrückung mit Leerzeichen gehört zum Format YAML und muss genau so bleiben. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Einstellungsdatei dem Webserver-Benutzer übergeben

nano hat die Datei als `root` angelegt. Neos soll sie als `www-data` lesen.

```bash
sudo chown www-data:www-data Configuration/Settings.yaml
```

### 12. Datei mit dem Passwort schützen

Danach darf nur noch `www-data` die Datei lesen.

```bash
sudo chmod 600 Configuration/Settings.yaml
```

**Prüfen:** Die Zeile beginnt mit `-rw-------` und nennt zweimal `www-data`.

```bash
ls -l Configuration/Settings.yaml
```

### 13. Zwischenspeicher leeren

Neos liest geänderte Einstellungen erst nach dem Leeren des Zwischenspeichers. Das ist auch nach jeder späteren Änderung an `Settings.yaml` nötig.

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow flow:cache:flush
```

**Prüfen:** Die Ausgabe lautet `Flushed all caches for "Production" context.`

### 14. Tabellen anlegen

Legt die Tabellen für Benutzer, Medien und Einstellungen an.

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow doctrine:migrate
```

**Prüfen:** Die Ausgabe beginnt mit `Migrating up to …` und listet viele Zeilen mit `CREATE TABLE`. Ein zweiter Aufruf meldet nur noch `Already at the latest version`.

### 15. Content Repository einrichten

Das Content Repository speichert alle Seiten und Inhalte samt ihrer Änderungsgeschichte. Der Befehl legt die Tabellen dafür an.

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow cr:setup
```

**Prüfen:** Die Ausgabe lautet `Content repository "default" was set up`.

### 16. Demo-Website importieren

Importiert die Beispielwebsite mit Seiten, Bildern und einem Blog. Sie zeigt, was Neos kann, und dient als Vorlage für eigene Websites. Ihre Texte sind englisch.

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow site:importall --package-key Neos.Demo
```

**Prüfen:** Die Ausgabe endet mit `Import finished.`

### 17. Dateien der Website veröffentlichen

Kopiert Bilder, Stylesheets und Skripte in den Ordner `Web/_Resources`, aus dem nginx sie ausliefert.

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow resource:publish
```

**Prüfen:** Die Ausgabe endet mit einer Zeile wie `Published 22`.

### 18. Administratorkonto anlegen

Die Werte bedeuten der Reihe nach: Rolle, Benutzername, Passwort, Vorname, Nachname. Setze ein eigenes Passwort ein. Es landet dabei in der Befehlschronik des Terminals. Ändere es nach der ersten Anmeldung in der Verwaltung unter „Benutzereinstellungen“.

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow user:create --roles Administrator admin 'Ein-langes-Passwort-2026' Dein Name
```

**Prüfen:** Die Ausgabe lautet `Created user "admin" and assigned the following role: Neos.Neos:Administrator.`

## nginx einrichten

### 19. Konfiguration für Neos anlegen

```bash
sudo nano /etc/nginx/sites-available/neos
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```nginx
server {
    listen 127.0.0.1:8095;
    server_name localhost;

    root /var/www/neos/Web;
    index index.php;

    client_max_body_size 64M;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location = /index.php {
        include snippets/fastcgi-php.conf;
        fastcgi_param FLOW_CONTEXT Production;
        fastcgi_param FLOW_REWRITEURLS 1;
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

- `root /var/www/neos/Web` – nur der Unterordner `Web` ist über das Web erreichbar. Einstellungen, Bibliotheken und Daten liegen außerhalb.
- `try_files … /index.php` – alle Adressen ohne passende Datei gehen an Neos, auch die Verwaltung unter `/neos`.
- `FLOW_CONTEXT Production` – dieselbe Betriebsart wie bei den Befehlen.
- `FLOW_REWRITEURLS 1` – Neos erzeugt kurze Adressen wie `/features` statt `/index.php/features`.
- Neos braucht nur die Datei `index.php`. Andere PHP-Dateien liefert nginx nicht aus (`return 404`). Der letzte Block sperrt versteckte Dateien.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 20. Konfiguration aktivieren

```bash
sudo ln -s /etc/nginx/sites-available/neos /etc/nginx/sites-enabled/neos
```

### 21. Konfiguration prüfen

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Nur dann weiter.

### 22. nginx neu laden

```bash
sudo systemctl reload nginx
```

## Neos verwenden

### 23. Website ansehen

Öffne <http://localhost:8095> im Browser. Der erste Aufruf dauert etwa eine Sekunde, danach kommt die Seite aus dem Zwischenspeicher.

**Prüfen:** Die Demo-Website erscheint mit der Überschrift „Welcome to the Neos CMS 9.1 demo“ und einem Bild eines Bergsees.

### 24. An der Verwaltung anmelden

Öffne <http://localhost:8095/neos> und melde dich mit Benutzername und Passwort aus Schritt 18 an. Der Aufbau der Verwaltung dauert beim ersten Mal einige Sekunden.

**Prüfen:** Links stehen „Dokumentbaum“ und „Inhaltsbaum“, in der Mitte die Startseite, rechts die Eigenschaften der Seite. Oben rechts steht in Grün „Veröffentlicht - Public live workspace“.

### 25. Eine Seite bearbeiten und veröffentlichen

1. Ändere rechts unter **Dokument** den **Titel** von „Home“ in `Startseite`.
2. Klicke unten rechts auf **Übernehmen**. Die Änderung liegt jetzt in deinem persönlichen Arbeitsbereich. Besucher sehen sie noch nicht.
3. Oben rechts steht jetzt **Nach Public live workspace veröffentlichen** mit der Zahl der Änderungen. Klicke darauf.

Texte in der Vorschau in der Mitte kannst du direkt anklicken und bearbeiten. Auch sie werden erst mit dem Veröffentlichen sichtbar.

**Prüfen:** Oben rechts steht wieder „Veröffentlicht - Public live workspace“. Lädst du <http://localhost:8095> neu, steht im Menü „Startseite“.

## Aktualisieren

Neos wird mit Composer aktualisiert. Lege vorher eine Sicherung an, mindestens der Datenbank und des Ordners `/var/www/neos`.

### 1. In den Projektordner wechseln

```bash
cd /var/www/neos
```

### 2. Pakete aktualisieren

Aktualisiert Neos innerhalb der Version 9.1 und alle Bibliotheken.

```bash
sudo -u www-data composer update
```

**Prüfen:** Die letzte Zeile lautet `No security vulnerability advisories found.`

### 3. Zwischenspeicher leeren

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow flow:cache:flush
```

### 4. Tabellen anpassen

Gibt es keine Änderungen, meldet der Befehl `Already at the latest version`.

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow doctrine:migrate
```

### 5. Content Repository anpassen

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow cr:setup
```

### 6. Dateien der Website neu veröffentlichen

```bash
sudo -u www-data FLOW_CONTEXT=Production ./flow resource:publish
```

**Prüfen:** `sudo -u www-data FLOW_CONTEXT=Production ./flow help | head -1` zeigt die neue Versionsnummer.

Für den Sprung auf eine neue Neos-Version (z. B. 9.2) änderst du die Versionsangaben in `composer.json`. Lies dafür vorher die Hinweise unter <https://docs.neos.io>.

## Deinstallieren

### 1. Seite in nginx deaktivieren

```bash
sudo rm /etc/nginx/sites-enabled/neos
```

### 2. nginx-Konfigurationsdatei löschen

```bash
sudo rm /etc/nginx/sites-available/neos
```

### 3. nginx prüfen und neu laden

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

### 4. Neos-Dateien löschen

**Achtung:** Damit sind auch alle hochgeladenen Bilder und Dateien gelöscht. Der Befehl `cd /tmp` sorgt dafür, dass du nicht mehr im gelöschten Ordner stehst.

```bash
cd /tmp && sudo rm -r /var/www/neos
```

### 5. Composer-Zwischenspeicher von www-data löschen

Nur wenn keine andere Anleitung (z. B. [TYPO3](typo3.md) oder [Contao](contao.md)) ihn noch braucht.

```bash
sudo rm -r /var/www/.cache
```

### 6. Datenbank löschen

**Achtung:** Damit sind alle Seiten, Inhalte und Benutzer der Website gelöscht.

```bash
sudo mariadb -e "DROP DATABASE IF EXISTS neos;"
```

### 7. Datenbankbenutzer löschen

```bash
sudo mariadb -e "DROP USER IF EXISTS 'neos'@'localhost';"
```

**Prüfen:** Die Seite ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:8095
```

### 8. MariaDB und Composer entfernen (optional)

Nur wenn kein anderes Programm MariaDB oder Composer braucht, z. B. [Contao](contao.md). **Achtung:** `purge` löscht auch alle übrigen Datenbanken in MariaDB. PHP und nginx bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.

```bash
sudo apt purge mariadb-server mariadb-common php-mysql composer
```

Fragt ein blauer Dialog, ob alle MariaDB-Datenbanken entfernt werden sollen, wähle **Ja**.

Der nächste Befehl entfernt die Pakete, die nur für MariaDB und Composer mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Die Ausgabe lautet `mariadb: Kommando nicht gefunden` (oder `command not found`).

```bash
mariadb --version
```
