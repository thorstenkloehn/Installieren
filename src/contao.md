# Contao

Contao ist ein Open-Source-Content-Management-System aus Deutschland. Es eignet sich für Firmen-, Vereins- und Behördenwebsites und legt großen Wert auf Barrierefreiheit und Datenschutz. Neuigkeiten, Termine, FAQ, Formulare und Newsletter sind schon eingebaut.

## Vorbemerkungen

- **Kein apt-Paket:** Contao ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit **Composer** installiert, dem Paketmanager für PHP. Composer, PHP, MariaDB und nginx kommen aus den Ubuntu-Paketquellen.
- **Datenbank:** Contao läuft nur mit **MariaDB** oder MySQL, nicht mit PostgreSQL. Diese Anleitung installiert MariaDB aus den Ubuntu-Paketquellen mit. Ein vorhandenes PostgreSQL stört dabei nicht.
- **Voraussetzung:** [nginx](nginx.md) ist installiert und läuft.
- **Adresse:** Contao läuft hier unter <http://localhost:8094>, nur vom eigenen Rechner aus erreichbar. Die Verwaltung (bei Contao „Backend“ genannt) liegt unter `/contao`.
- **Eigentümer:** Alle Dateien gehören dem Webserver-Benutzer `www-data`, und auch Composer und die Contao-Befehle laufen als `www-data`. So können Webserver und Befehlszeile dieselben Dateien schreiben.
- **Version:** Getestet mit Contao **5.7.13** (Langzeitversion), PHP 8.5, Composer 2.9 und MariaDB 11.8 unter Ubuntu 26.04. Die neuere Reihe Contao 6.0 bekommt neue Funktionen zuerst, 5.7 wird dafür länger mit Sicherheitsupdates versorgt.

## Pakete installieren

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. MariaDB, PHP, Erweiterungen und Composer installieren

- `mariadb-server` ist die Datenbank. Sie startet nach der Installation von selbst und lauscht nur auf dem eigenen Rechner.
- `php-fpm` führt PHP-Dateien für nginx aus, `php-mysql` verbindet PHP mit MariaDB.
- `gd`, `intl`, `zip`, `xml`, `mbstring` und `curl` braucht Contao für Bilder, Sprachen, Pakete, XML-Dateien, Umlaute und Downloads.
- `composer` lädt Contao und alle PHP-Bibliotheken, die es braucht.

Sind Pakete schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install mariadb-server php-fpm php-mysql php-gd php-intl php-zip php-xml php-mbstring php-curl composer
```

**Prüfen:** Die Ausgabe enthält `11.8` und `MariaDB`.

```bash
mariadb --version
```

Und diese Ausgabe beginnt mit `Composer version 2`:

```bash
composer --version
```

### 3. Ordner für Contao und den Composer-Zwischenspeicher anlegen

`/var/www/contao` nimmt die Website auf. Composer legt heruntergeladene Pakete im Home-Verzeichnis des Benutzers ab, das ist bei `www-data` der Ordner `/var/www`. Weil `/var/www` selbst `root` gehört, bekommt `www-data` dort einen eigenen Ordner `.cache`. `-p` sorgt dafür, dass es keinen Fehler gibt, wenn `.cache` von einer anderen Anleitung (z. B. [TYPO3](typo3.md)) schon existiert.

```bash
sudo mkdir -p /var/www/contao /var/www/.cache
```

### 4. Ordner dem Webserver-Benutzer übergeben

```bash
sudo chown www-data:www-data /var/www/contao /var/www/.cache
```

## Contao herunterladen

### 5. Contao-Projekt anlegen

`create-project` lädt die „Managed Edition“ von Contao in Version 5.7 samt aller Bibliotheken nach `/var/www/contao`. Zum Schluss legt Contao selbst die nötigen Unterordner an und füllt den Zwischenspeicher. `cd /tmp` davor ist nötig, weil `www-data` nicht in deinem Home-Verzeichnis arbeiten darf.

```bash
cd /tmp && sudo -u www-data composer create-project contao/managed-edition /var/www/contao 5.7
```

Das Herunterladen dauert einige Minuten.

**Prüfen:** Kurz vor dem Ende steht `Done! Please run the contao:migrate command`, die letzte Zeile lautet `No security vulnerability advisories found.`

Bricht der Befehl ab, muss der Ordner `/var/www/contao` vor dem nächsten Versuch wieder ganz leer sein, sonst meldet Composer `Project directory "/var/www/contao" is not empty.` Lösche ihn dann mit `sudo rm -r /var/www/contao` und beginne wieder bei Schritt 3.

### 6. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd /var/www/contao
```

**Prüfen:** Die Ausgabe beginnt mit `Contao Managed Edition 5.7`.

```bash
sudo -u www-data vendor/bin/contao-console --version
```

### 7. Datenbank-Bibliothek auf Version 4.4 festhalten

Contao spricht über die Bibliothek **Doctrine DBAL** mit der Datenbank. Mit deren Version 4.5 (Stand September 2026) scheitert die Einrichtung der Tabellen in Schritt 13 an der Tabelle `tl_message_queue` mit dem Fehler `You have an error in your SQL syntax … near ''`. Das betrifft Contao 5.7 und 6.0 gleichermaßen. Mit Version 4.4 läuft alles fehlerfrei.

Der Befehl trägt die Einschränkung in die Datei `composer.json` ein und tauscht die Bibliothek aus.

```bash
sudo -u www-data composer require "doctrine/dbal:~4.4.0" --with-all-dependencies
```

**Prüfen:** Die Ausgabe enthält `Downgrading doctrine/dbal (4.5.0 => 4.4.5)` oder eine ähnliche Zeile mit `4.4`.

Wie man die Einschränkung später wieder aufhebt, steht im Abschnitt „Aktualisieren“.

## Datenbank in MariaDB einrichten

Auf Ubuntu meldet sich `root` ohne Passwort an MariaDB an, wenn der Befehl mit `sudo` läuft. Das nutzen die nächsten drei Schritte.

### 8. Datenbank anlegen

`utf8mb4` speichert alle Zeichen, auch Emojis. Contao erwartet genau diese Einstellung.

```bash
sudo mariadb -e "CREATE DATABASE contao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Prüfen:** Der Befehl gibt nichts aus. Eine Fehlermeldung erscheint nur, wenn etwas schiefgeht.

### 9. Datenbankbenutzer anlegen

Contao meldet sich mit diesem Benutzer bei MariaDB an. Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 11. Verwende nur Buchstaben, Ziffern, `-` und `_`. Zeichen wie `@`, `:`, `/` oder `#` stören in Schritt 11, weil das Passwort dort Teil einer Adresse ist.

```bash
sudo mariadb -e "CREATE USER 'contao'@'localhost' IDENTIFIED BY 'geheimes_passwort';"
```

### 10. Dem Benutzer die Datenbank freigeben

Der Benutzer darf nur in der Datenbank `contao` arbeiten, dort aber alles.

```bash
sudo mariadb -e "GRANT ALL PRIVILEGES ON contao.* TO 'contao'@'localhost';"
```

**Prüfen:** Die Ausgabe enthält die Zeile ``GRANT ALL PRIVILEGES ON `contao`.* TO `contao`@`localhost` ``.

```bash
sudo mariadb -e "SHOW GRANTS FOR 'contao'@'localhost';"
```

## Contao einrichten

### 11. Datenbankverbindung eintragen

Eigene Einstellungen stehen in der Datei `.env.local`. Composer hat sie in Schritt 5 schon mit einem geheimen Schlüssel (`APP_SECRET`) angelegt.

```bash
sudo nano .env.local
```

Drücke <kbd>Strg</kbd>+<kbd>Ende</kbd>, um ans Ende der Datei zu springen, und füge in einer neuen Zeile ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```ini
DATABASE_URL=mysql://contao:geheimes_passwort@localhost:3306/contao
```

Die Adresse ist so aufgebaut: `mysql://BENUTZER:PASSWORT@RECHNER:PORT/DATENBANK`. Setze statt `geheimes_passwort` dein Passwort aus Schritt 9 ein. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Datei mit dem Passwort schützen

Die Datei ist zunächst für alle Benutzer des Rechners lesbar. Danach darf nur noch `www-data` sie lesen.

```bash
sudo chmod 600 .env.local
```

**Prüfen:** Die Zeile beginnt mit `-rw-------` und nennt zweimal `www-data`.

```bash
ls -l .env.local
```

### 13. Tabellen anlegen

`contao:migrate` legt alle Tabellen in der Datenbank an. Denselben Befehl brauchst du auch nach jedem Update. Vorher sichert Contao die Datenbank automatisch in den Ordner `var/backups`.

```bash
sudo -u www-data vendor/bin/contao-console contao:migrate -n
```

`-n` beantwortet die Sicherheitsfrage „Execute the listed database updates?“ automatisch mit Ja.

**Prüfen:** Die letzte Zeile lautet `[OK] All migrations completed.` Ein zweiter Aufruf meldet nur noch `Database dump skipped because there are no migrations to execute.` und `[OK] All migrations completed.`, ohne `Pending database migrations`.

### 14. Administratorkonto anlegen

Legt das erste Konto für die Verwaltung an. `--language=de` stellt die Verwaltung für dieses Konto auf Deutsch, `--admin` gibt ihm alle Rechte. Setze deinen Namen, deine E-Mail-Adresse und ein eigenes Passwort ein. Das Passwort landet dabei in der Befehlschronik des Terminals. Ändere es nach der ersten Anmeldung in der Verwaltung unter „Profil“.

```bash
sudo -u www-data vendor/bin/contao-console contao:user:create -n --username=admin --name="Dein Name" --email=admin@example.com --password='Ein-langes-Passwort-2026' --language=de --admin
```

**Prüfen:** Die Ausgabe lautet `[OK] User admin with admin permissions created.`

## nginx einrichten

### 15. Konfiguration für Contao anlegen

```bash
sudo nano /etc/nginx/sites-available/contao
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```nginx
server {
    listen 127.0.0.1:8094;
    server_name localhost;

    root /var/www/contao/public;
    index index.php;

    client_max_body_size 64M;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/(index|preview)\.php(/|$) {
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

- `root /var/www/contao/public` – nur der Unterordner `public` ist über das Web erreichbar. Einstellungen, Bibliotheken und Sicherungen liegen außerhalb.
- `try_files … /index.php` – alle Adressen ohne passende Datei gehen an Contao, auch die Verwaltung unter `/contao`.
- Contao braucht nur die beiden PHP-Dateien `index.php` und `preview.php` (für die Vorschau in der Verwaltung). Alle anderen PHP-Dateien liefert nginx nicht aus (`return 404`).
- Der letzte Block sperrt versteckte Dateien.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Konfiguration aktivieren

```bash
sudo ln -s /etc/nginx/sites-available/contao /etc/nginx/sites-enabled/contao
```

### 17. Konfiguration prüfen

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Nur dann weiter.

### 18. nginx neu laden

```bash
sudo systemctl reload nginx
```

## Contao verwenden

### 19. An der Verwaltung anmelden

Öffne <http://localhost:8094/contao> im Browser und melde dich mit dem Benutzernamen und Passwort aus Schritt 14 an. Die Anmeldeseite erscheint in der Sprache deines Browsers.

**Prüfen:** Die Startseite der Verwaltung zeigt „Willkommen bei Contao!“. Links stehen die Bereiche „Inhalte“, „Layout“, „Benutzerverwaltung“ und „System“.

Die Website selbst unter <http://localhost:8094> zeigt noch einen Fehler („Not Found“). Das ist richtig: Es gibt noch keine Seite. Die legen die nächsten Schritte an.

### 20. Theme und Seitenlayout anlegen

Ein **Theme** bündelt das Aussehen der Website, ein **Seitenlayout** legt fest, welche Bereiche eine Seite hat (Kopf, Spalten, Fuß).

1. Klicke links unter **Layout** auf **Themes** und dann oben auf **Neu**.
2. Gib als **Titel** `Mein Theme` und als **Autor** deinen Namen ein und klicke auf **Speichern und schließen**.
3. Klicke in der Zeile von „Mein Theme“ auf das Symbol **Seitenlayouts** und dann auf **Neu**.
4. Gib als **Titel** `Standard` ein. Lass **Art des Layouts** auf „Standardlayout“. Unter „Eingebundene Elemente“ ist „Artikel“ in der Hauptspalte schon eingetragen.
5. Klicke auf **Speichern und schließen**.

### 21. Startpunkt der Website anlegen

Jede Website in Contao beginnt mit einer Seite vom Typ „Startpunkt einer Webseite“. Sie legt Sprache, Adresse und Layout für alle Seiten darunter fest.

1. Klicke links unter **Inhalte** auf **Seiten** und dann oben auf **Neu**. Contao zeigt jetzt Einfüge-Symbole: Klicke auf das Symbol neben dem obersten Eintrag des Seitenbaums („Einfügen in“).
2. **Seitenname:** `Meine Website`
3. **Seitentyp:** „Startpunkt einer Webseite“
4. **Sprache:** `de`
5. **Protokoll:** `http://` – wichtig, weil die Website hier ohne HTTPS läuft. Mit `https://` leitet Contao auf `https://localhost` um, und der Browser meldet einen Fehler.
6. Setze die Haken bei **Sprachen-Fallback** und **Ein Layout zuweisen** und wähle als **Seitenlayout** „Standard“.
7. Setze den Haken bei **Seite veröffentlichen**.
8. Klicke auf **Speichern und schließen**.

### 22. Startseite anlegen

1. Klicke wieder auf **Neu** und dann beim Eintrag „Meine Website“ auf das Symbol **Einfügen in**. So wird die neue Seite eine Unterseite des Startpunkts.
2. **Seitenname:** `Startseite`, **Seitentyp:** „Reguläre Seite“.
3. Setze den Haken bei **Seite veröffentlichen** und klicke auf **Speichern und schließen**.

Contao legt für die neue Seite automatisch einen leeren **Artikel** mit dem gleichen Namen an. Artikel sind die Behälter für die eigentlichen Inhalte.

### 23. Text auf die Startseite schreiben

1. Klicke links unter **Inhalte** auf **Artikel**.
2. Klicke beim Artikel „Startseite“ auf das Bearbeiten-Symbol (Stift) und dann auf **Neu**.
3. **Elementtyp:** „Text“. Gib eine **Überschrift** und einen **Text** ein.
4. Klicke auf **Speichern und schließen**.

### 24. Website ansehen

Öffne <http://localhost:8094> im Browser. Contao leitet auf die Adresse der Startseite weiter, z. B. <http://localhost:8094/startseite>.

**Prüfen:** Überschrift und Text aus Schritt 23 erscheinen. Im Tab des Browsers steht „Startseite - Meine Website“. Das Aussehen ist noch schlicht, weil das Theme keine eigenen Stylesheets hat.

## Aktualisieren

Contao wird mit Composer aktualisiert. Lege vorher eine Sicherung an, mindestens der Datenbank und des Ordners `/var/www/contao`. Eine Sicherung der Datenbank erzeugt `sudo -u www-data vendor/bin/contao-console contao:backup:create`.

### 1. In den Projektordner wechseln

```bash
cd /var/www/contao
```

### 2. Pakete aktualisieren

Aktualisiert Contao innerhalb der Version 5.7 und alle Bibliotheken. Am Ende richtet Contao den Zwischenspeicher neu ein.

```bash
sudo -u www-data composer update
```

**Prüfen:** Die letzte Zeile lautet `No security vulnerability advisories found.`

### 3. Datenbank anpassen

Neue Versionen bringen manchmal neue oder geänderte Tabellen mit.

```bash
sudo -u www-data vendor/bin/contao-console contao:migrate -n
```

**Prüfen:** `sudo -u www-data vendor/bin/contao-console --version` zeigt die neue Versionsnummer.

### Einschränkung für Doctrine DBAL aufheben

Sobald Contao den Fehler aus Schritt 7 behoben hat, entfernst du die Einschränkung wieder. Der erste Befehl löscht sie aus `composer.json`, der zweite zeigt ohne Änderungen, ob die Datenbank danach noch zu Contao passt:

```bash
sudo -u www-data composer remove doctrine/dbal
```

Die Meldung `Removal failed, doctrine/dbal is still present` ist hier richtig: Contao braucht die Bibliothek weiterhin, nur die Einschränkung auf 4.4 ist weg. Darüber steht `Upgrading doctrine/dbal (4.4.5 => …)`.

```bash
sudo -u www-data vendor/bin/contao-console contao:migrate -n --dry-run
```

Enthält die Ausgabe wieder `ALTER TABLE tl_message_queue ENGINE =` ohne Wert dahinter, ist der Fehler noch nicht behoben. Setze die Einschränkung dann mit Schritt 7 wieder.

Den Sprung auf eine neue Hauptversion (z. B. 6.0) macht man, indem man in `composer.json` die Versionsangaben ändert. Lies dafür vorher die Hinweise unter <https://docs.contao.org>.

## Deinstallieren

### 1. Seite in nginx deaktivieren

```bash
sudo rm /etc/nginx/sites-enabled/contao
```

### 2. nginx-Konfigurationsdatei löschen

```bash
sudo rm /etc/nginx/sites-available/contao
```

### 3. nginx prüfen und neu laden

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

### 4. Contao-Dateien löschen

**Achtung:** Damit sind auch alle hochgeladenen Bilder und Dateien und die Datenbanksicherungen in `var/backups` gelöscht. Der Befehl `cd /tmp` sorgt dafür, dass du nicht mehr im gelöschten Ordner stehst.

```bash
cd /tmp && sudo rm -r /var/www/contao
```

### 5. Composer-Zwischenspeicher von www-data löschen

Nur wenn keine andere Anleitung (z. B. [TYPO3](typo3.md)) ihn noch braucht.

```bash
sudo rm -r /var/www/.cache
```

### 6. Datenbank löschen

**Achtung:** Damit sind alle Seiten, Inhalte und Benutzer der Website gelöscht.

```bash
sudo mariadb -e "DROP DATABASE IF EXISTS contao;"
```

### 7. Datenbankbenutzer löschen

```bash
sudo mariadb -e "DROP USER IF EXISTS 'contao'@'localhost';"
```

**Prüfen:** Die Seite ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:8094
```

### 8. MariaDB und Composer entfernen (optional)

Nur wenn kein anderes Programm MariaDB oder Composer braucht. **Achtung:** `purge` löscht auch alle übrigen Datenbanken in MariaDB. PHP und nginx bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.

```bash
sudo apt purge mariadb-server mariadb-common php-mysql composer
```

Fragt ein blauer Dialog, ob alle MariaDB-Datenbanken entfernt werden sollen, wähle **Ja**.

Der nächste Befehl entfernt die Pakete, die nur für MariaDB und Composer mitinstalliert wurden (z. B. `galera-4`, `php-symfony-console`). Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Die Ausgabe lautet `mariadb: Kommando nicht gefunden` (oder `command not found`).

```bash
mariadb --version
```
