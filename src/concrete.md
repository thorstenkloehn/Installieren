# Concrete CMS

Concrete CMS ist ein Open-Source-Content-Management-System, bei dem man Seiten direkt im Browser bearbeitet: Man klickt auf einen Textblock, ändert ihn an Ort und Stelle und veröffentlicht die Seite. Neue Inhalte setzt man per Drag-and-drop als Blöcke auf die Seite. Concrete steht unter der freien MIT-Lizenz. Früher hieß es „concrete5“.

## Vorbemerkungen

- **Kein apt-Paket:** Concrete ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit **Composer** installiert, dem Paketmanager für PHP. Composer, PHP, MariaDB und nginx kommen aus den Ubuntu-Paketquellen.
- **Datenbank:** Concrete läuft nur mit **MariaDB** oder MySQL. Diese Anleitung installiert MariaDB aus den Ubuntu-Paketquellen mit.
- **Voraussetzung:** [nginx](nginx.md) ist installiert und läuft.
- **Adresse:** Concrete läuft hier unter <http://localhost:8096>, nur vom eigenen Rechner aus erreichbar.
- **Eigentümer:** Alle Dateien gehören dem Webserver-Benutzer `www-data`, und auch Composer und die Concrete-Befehle laufen als `www-data`.
- **Google Fonts:** Das mitgelieferte Theme „Atomik“ lädt Schriften von Servern von Google. Dabei erfährt Google die IP-Adresse jedes Besuchers. Für eine öffentliche Website in der EU solltest du die Schriften selbst ausliefern oder ein anderes Theme verwenden.
- **Version:** Getestet mit Concrete **9.5.3**, PHP 8.5, Composer 2.9 und MariaDB 11.8 unter Ubuntu 26.04.

## Pakete installieren

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. MariaDB, PHP, Erweiterungen und Composer installieren

- `mariadb-server` ist die Datenbank. Sie startet nach der Installation von selbst und lauscht nur auf dem eigenen Rechner.
- `php-fpm` führt PHP-Dateien für nginx aus, `php-mysql` verbindet PHP mit MariaDB.
- `gd`, `intl`, `zip`, `xml`, `mbstring` und `curl` braucht Concrete für Bilder, Sprachen, Pakete, XML-Dateien, Umlaute und Downloads.
- `composer` lädt Concrete und alle PHP-Bibliotheken, die es braucht.

Sind Pakete schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install mariadb-server php-fpm php-mysql php-gd php-intl php-zip php-xml php-mbstring php-curl composer
```

**Prüfen:** Die Ausgabe beginnt mit `Composer version 2`.

```bash
composer --version
```

### 3. Ordner für Concrete und den Composer-Zwischenspeicher anlegen

`/var/www/concrete` nimmt die Website auf. Composer legt heruntergeladene Pakete im Home-Verzeichnis des Benutzers ab, das ist bei `www-data` der Ordner `/var/www`. Weil `/var/www` selbst `root` gehört, bekommt `www-data` dort einen eigenen Ordner `.cache`. `-p` verhindert einen Fehler, falls `.cache` von einer anderen Anleitung schon existiert.

```bash
sudo mkdir -p /var/www/concrete /var/www/.cache
```

### 4. Ordner dem Webserver-Benutzer übergeben

```bash
sudo chown www-data:www-data /var/www/concrete /var/www/.cache
```

## Concrete herunterladen

### 5. Concrete-Projekt anlegen

`create-project` lädt die offizielle Projektvorlage `concretecms/composer` mit der aktuellen Version 9 von Concrete nach `/var/www/concrete`. `cd /tmp` davor ist nötig, weil `www-data` nicht in deinem Home-Verzeichnis arbeiten darf.

```bash
cd /tmp && sudo -u www-data composer create-project concretecms/composer /var/www/concrete
```

**Prüfen:** Die Ausgabe enthält mehrere Zeilen `Applying patch …` und endet mit `No security vulnerability advisories found.`

### 6. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd /var/www/concrete
```

**Prüfen:** Die Ausgabe lautet `concrete 9.5.3` oder nennt eine neuere Version.

```bash
sudo -u www-data public/concrete/bin/concrete --version
```

Der Befehl `vendor/bin/concrete`, den manche Anleitungen nennen, bricht in dieser Projektvorlage mit `Failed opening required …/concrete/dispatcher.php` ab. Verwende immer `public/concrete/bin/concrete`.

### 7. Ordner für hochgeladene Dateien anlegen

Concrete speichert Bilder und Dokumente in `public/application/files`. Die Projektvorlage bringt den Ordner nicht mit. Ohne ihn bricht die Installation in Schritt 11 mit `This directory must exist and it must be writable … application/files/` ab.

```bash
sudo -u www-data mkdir public/application/files
```

## Datenbank in MariaDB einrichten

Auf Ubuntu meldet sich `root` ohne Passwort an MariaDB an, wenn der Befehl mit `sudo` läuft. Das nutzen die nächsten drei Schritte.

### 8. Datenbank anlegen

`utf8mb4` speichert alle Zeichen, auch Emojis.

```bash
sudo mariadb -e "CREATE DATABASE concrete CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 9. Datenbankbenutzer anlegen

Concrete meldet sich mit diesem Benutzer bei MariaDB an. Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 11.

```bash
sudo mariadb -e "CREATE USER 'concrete'@'localhost' IDENTIFIED BY 'geheimes_passwort';"
```

### 10. Dem Benutzer die Datenbank freigeben

```bash
sudo mariadb -e "GRANT ALL PRIVILEGES ON concrete.* TO 'concrete'@'localhost';"
```

**Prüfen:** Die Ausgabe enthält die Zeile ``GRANT ALL PRIVILEGES ON `concrete`.* TO `concrete`@`localhost` ``.

```bash
sudo mariadb -e "SHOW GRANTS FOR 'concrete'@'localhost';"
```

## Concrete einrichten

### 11. Concrete installieren

`c5:install` prüft die Voraussetzungen, legt die Tabellen an, erzeugt das Administratorkonto und füllt die Website mit Beispielseiten. `-n` beantwortet alle Rückfragen automatisch. Passe vorher die Werte an:

- `--db-…` – die Datenbank aus Schritt 8 bis 10. Setze bei `--db-password` dein Passwort ein.
- `--timezone` – die Zeitzone für Datums- und Zeitangaben.
- `--site` – der Name der Website, er erscheint im Titel jeder Seite.
- `--canonical-url` – die Adresse der Website. Sie muss mit `/` enden.
- `--starting-point=atomik_full` – Beispielwebsite mit dem Theme „Atomik“, mehreren Seiten und einem Blog. `atomik_blank` legt nur eine leere Startseite an.
- `--admin-email` und `--admin-password` – die Anmeldedaten des Kontos `admin`. Das Passwort landet dabei in der Befehlschronik des Terminals. Ändere es nach der ersten Anmeldung unter „Profil bearbeiten“.
- `--language` und `--site-locale` – Sprache der Verwaltung und der Website.
- `--disable-marketplace-connect` – Concrete verbindet sich nicht automatisch mit dem Online-Marktplatz des Herstellers.

```bash
sudo -u www-data public/concrete/bin/concrete c5:install -n --db-server=localhost --db-username=concrete --db-password=geheimes_passwort --db-database=concrete --timezone=Europe/Berlin --site="Meine Website" --canonical-url=http://localhost:8096/ --starting-point=atomik_full --admin-email=admin@example.com --admin-password='Ein-langes-Passwort-2026' --language=de_DE --site-locale=de_DE --disable-marketplace-connect
```

Das dauert etwa eine halbe Minute. Die Ausgabe listet zuerst alle geprüften Voraussetzungen mit `passed` und dann den Fortschritt in Prozent.

**Prüfen:** Die letzte Zeile lautet `Installation Complete!`

Steht stattdessen `One or more precondition failed!` da, nennt eine Zeile ohne `passed` darüber die Ursache.

### 12. Datei mit dem Datenbankpasswort schützen

Concrete hat die Zugangsdaten in `public/application/config/database.php` geschrieben. Die Datei ist zunächst für alle Benutzer des Rechners lesbar. Danach darf nur noch `www-data` sie lesen. Über das Web ist sie nicht abrufbar, weil nginx außer `index.php` keine PHP-Dateien ausliefert (Schritt 16).

```bash
sudo chmod 600 public/application/config/database.php
```

### 13. Deutsches Sprachpaket installieren

Die Übersetzungen sind nicht in Concrete enthalten. Der Befehl lädt sie für Deutsch herunter und legt sie in `public/application/languages/de_DE` ab.

```bash
sudo -u www-data public/concrete/bin/concrete c5:language-install --add de_DE
```

**Prüfen:** Die Ausgabe enthält `Adding language de_DE` und `Number of language files added: 1`.

### 14. Kurze Adressen einschalten

Ohne diese Einstellung enthalten alle Adressen `index.php`, z. B. `http://localhost:8096/index.php/about`. Danach heißen sie `http://localhost:8096/about`. Die nginx-Konfiguration in Schritt 16 leitet solche Adressen an Concrete weiter.

```bash
sudo -u www-data public/concrete/bin/concrete c5:config set concrete.seo.url_rewriting true
```

### 15. Zwischenspeicher leeren

Damit Concrete die neue Sprache und die kurzen Adressen sofort verwendet.

```bash
sudo -u www-data public/concrete/bin/concrete c5:clear-cache
```

**Prüfen:** Die Ausgabe lautet `Clearing the cache... done.`

## nginx einrichten

### 16. Konfiguration für Concrete anlegen

```bash
sudo nano /etc/nginx/sites-available/concrete
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```nginx
server {
    listen 127.0.0.1:8096;
    server_name localhost;

    root /var/www/concrete/public;
    index index.php;

    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php$is_args$args;
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

- `root /var/www/concrete/public` – nur der Unterordner `public` ist über das Web erreichbar. Bibliotheken und Composer-Dateien liegen außerhalb.
- `try_files … /index.php` – alle Adressen ohne passende Datei gehen an Concrete. Hochgeladene Bilder in `application/files` liefert nginx direkt aus.
- Concrete braucht nur die Datei `index.php`. Alle anderen PHP-Dateien, auch die Einstellungen in `application/config`, liefert nginx nicht aus (`return 404`). Der letzte Block sperrt versteckte Dateien.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 17. Konfiguration aktivieren

```bash
sudo ln -s /etc/nginx/sites-available/concrete /etc/nginx/sites-enabled/concrete
```

### 18. Konfiguration prüfen

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Nur dann weiter.

### 19. nginx neu laden

```bash
sudo systemctl reload nginx
```

## Concrete verwenden

### 20. Website ansehen

Öffne <http://localhost:8096> im Browser.

**Prüfen:** Die Beispielwebsite erscheint mit dem Schriftzug „MEINE WEBSITE“ oben links und den Menüpunkten „Info“, „Ressourcen“ und „Dokumente“. Die Texte der Beispielseiten sind englisch. Der Tab des Browsers zeigt „Home :: Meine Website“.

### 21. Anmelden

Öffne <http://localhost:8096/login> und melde dich mit dem Benutzernamen `admin` und dem Passwort aus Schritt 11 an.

Danach fragt ein Dialog „Tell us a little about your site“, wofür du Concrete verwendest. **Send** schickt die Antworten an den Hersteller. Klicke auf **Skip**, dann erscheint der Dialog nicht wieder.

**Prüfen:** Oben erscheint die Werkzeugleiste von Concrete mit einem Stift, einem Zahnrad und einem Pluszeichen links und einer Suche rechts.

### 22. Einen Text bearbeiten und veröffentlichen

1. Öffne die Seite <http://localhost:8096/about>. Im Menü der Website heißt sie „Info“.
2. Klicke oben links in der Werkzeugleiste auf den **Stift**. Die Seite wechselt in den Bearbeitungsmodus, alle Blöcke bekommen einen Rahmen. Beim ersten Mal erscheint eine Einführung, die du mit **Got It!** schließt.
3. Klicke auf einen Textblock, z. B. „WHAT WE DO“, und wähle im Menü **Block bearbeiten**.
4. Ändere den Text direkt auf der Seite. Über der Seite erscheint eine Leiste zum Formatieren. Klicke dort auf **OK**.
5. Klicke oben links wieder auf den Stift. Es öffnet sich eine Leiste mit **Veröffentlichen**, **Änderungen speichern** und **Änderungen verwerfen**. Klicke auf **Veröffentlichen**.

„Änderungen speichern“ sichert die Änderungen als Entwurf, ohne sie Besuchern zu zeigen. Mit dem Pluszeichen in der Werkzeugleiste fügst du im Bearbeitungsmodus neue Blöcke wie Text, Bild oder Formular hinzu.

**Prüfen:** Öffne <http://localhost:8096/about> in einem privaten Fenster (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>P</kbd> in Firefox, <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>N</kbd> in Chrome). Dort bist du nicht angemeldet und siehst die Seite wie ein Besucher, mit deinem geänderten Text.

## Aktualisieren

Concrete wird mit Composer aktualisiert. Lege vorher eine Sicherung an, mindestens der Datenbank und des Ordners `/var/www/concrete`.

### 1. In den Projektordner wechseln

```bash
cd /var/www/concrete
```

### 2. Pakete aktualisieren

Aktualisiert Concrete innerhalb der Version 9 und alle Bibliotheken.

```bash
sudo -u www-data composer update
```

**Prüfen:** Die letzte Zeile lautet `No security vulnerability advisories found.`

### 3. Datenbank anpassen

`c5:update` passt die Tabellen an die neue Version an. Gibt es nichts zu tun, gibt der Befehl nichts aus.

```bash
sudo -u www-data public/concrete/bin/concrete c5:update -n
```

### 4. Sprachpaket aktualisieren

```bash
sudo -u www-data public/concrete/bin/concrete c5:language-install --update
```

### 5. Zwischenspeicher leeren

```bash
sudo -u www-data public/concrete/bin/concrete c5:clear-cache
```

**Prüfen:** `sudo -u www-data public/concrete/bin/concrete --version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Seite in nginx deaktivieren

```bash
sudo rm /etc/nginx/sites-enabled/concrete
```

### 2. nginx-Konfigurationsdatei löschen

```bash
sudo rm /etc/nginx/sites-available/concrete
```

### 3. nginx prüfen und neu laden

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

### 4. Concrete-Dateien löschen

**Achtung:** Damit sind auch alle hochgeladenen Bilder und Dateien gelöscht. Der Befehl `cd /tmp` sorgt dafür, dass du nicht mehr im gelöschten Ordner stehst.

```bash
cd /tmp && sudo rm -r /var/www/concrete
```

### 5. Composer-Zwischenspeicher von www-data löschen

Nur wenn keine andere Anleitung (z. B. [TYPO3](typo3.md), [Contao](contao.md) oder [Neos](neos.md)) ihn noch braucht.

```bash
sudo rm -r /var/www/.cache
```

### 6. Datenbank löschen

**Achtung:** Damit sind alle Seiten, Inhalte und Benutzer der Website gelöscht.

```bash
sudo mariadb -e "DROP DATABASE IF EXISTS concrete;"
```

### 7. Datenbankbenutzer löschen

```bash
sudo mariadb -e "DROP USER IF EXISTS 'concrete'@'localhost';"
```

**Prüfen:** Die Seite ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:8096
```

### 8. MariaDB und Composer entfernen (optional)

Nur wenn kein anderes Programm MariaDB oder Composer braucht, z. B. [Contao](contao.md) oder [Neos](neos.md). **Achtung:** `purge` löscht auch alle übrigen Datenbanken in MariaDB. PHP und nginx bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.

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
