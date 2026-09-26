# ProcessWire

ProcessWire ist ein Open-Source-Content-Management-System, das Entwicklern freie Hand beim Aussehen lässt: Es gibt keine Themes im üblichen Sinn, sondern einfache PHP-Vorlagen, in denen man Inhalte über eine übersichtliche Programmierschnittstelle abruft. Redakteure pflegen Seiten in einem aufgeräumten Seitenbaum. ProcessWire steht unter der freien Mozilla Public License 2.0.

## Vorbemerkungen

- **Kein apt-Paket:** ProcessWire ist nicht in den Ubuntu-Paketquellen enthalten. Es wird als ZIP-Datei von GitHub heruntergeladen und im Browser installiert. Composer ist nicht nötig. PHP, MariaDB und nginx kommen aus den Ubuntu-Paketquellen.
- **Datenbank:** ProcessWire läuft nur mit **MariaDB** oder MySQL. Diese Anleitung installiert MariaDB aus den Ubuntu-Paketquellen mit.
- **Voraussetzung:** [nginx](nginx.md) ist installiert und läuft.
- **Adresse:** ProcessWire läuft hier unter <http://localhost:8099>, nur vom eigenen Rechner aus erreichbar. Die Verwaltung liegt unter `/processwire/`.
- **Eigentümer:** Alle Dateien gehören dem Webserver-Benutzer `www-data`.
- **Sprache:** Installer und Verwaltung sind zunächst englisch. Die Verwaltung wird mit einem deutschen Sprachpaket aus der Community übersetzt (Schritt 22 bis 24).
- **Version:** Getestet mit ProcessWire **3.0.259** (stabiler Zweig `master`), dem Beispielprofil „Regular“, PHP 8.5 und MariaDB 11.8 unter Ubuntu 26.04.

## Pakete installieren

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. MariaDB, PHP und Erweiterungen installieren

- `mariadb-server` ist die Datenbank. Sie startet nach der Installation von selbst und lauscht nur auf dem eigenen Rechner.
- `php-fpm` führt PHP-Dateien für nginx aus, `php-mysql` verbindet PHP mit MariaDB.
- `gd`, `intl`, `zip`, `xml`, `mbstring` und `curl` braucht ProcessWire für Bilder, Sprachen, ZIP-Dateien, XML-Dateien, Umlaute und Downloads.
- `unzip` entpackt die ZIP-Dateien.

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

## ProcessWire herunterladen

### 4. ZIP-Datei herunterladen

Lädt ProcessWire 3.0.259 von GitHub in den Ordner `/tmp`. Welche Version gerade stabil ist, zeigt der Zweig `master` unter <https://github.com/processwire/processwire>: Die Datei `wire/core/ProcessWire.php` nennt sie in `versionRevision`. Der Zweig `dev` enthält Entwicklungsversionen. Ersetze dann in diesem und im übernächsten Befehl die Versionsnummer.

```bash
cd /tmp && wget -O processwire.zip https://github.com/processwire/processwire/archive/refs/tags/3.0.259.zip
```

### 5. Nach /var/www entpacken

Die ZIP-Datei enthält einen Ordner `processwire-3.0.259`. `-d /var/www` legt ihn dort ab.

```bash
sudo unzip -q processwire.zip -d /var/www
```

### 6. Ordner umbenennen

Ein Ordnername ohne Versionsnummer bleibt auch nach Updates gleich.

```bash
sudo mv /var/www/processwire-3.0.259 /var/www/processwire
```

### 7. ZIP-Datei löschen

```bash
rm processwire.zip
```

## Beispielprofil bereitstellen

ProcessWire bringt nur das Profil „Blank“ mit, eine fast leere Website. Das offizielle Profil „Regular“ enthält eine fertige Beispielwebsite mit Blog, Suche und Sitemap. Es eignet sich gut zum Kennenlernen.

### 8. Profil herunterladen

```bash
wget -O site-regular.zip https://github.com/processwire/site-regular/archive/refs/heads/main.zip
```

### 9. Profil entpacken

Legt den Ordner `site-regular-main` in `/var/www/processwire` ab.

```bash
sudo unzip -q site-regular.zip -d /var/www/processwire
```

### 10. Profilordner umbenennen

Der Installer erkennt Profile nur an Ordnernamen, die mit `site-` beginnen und keinen weiteren Zusatz haben.

```bash
sudo mv /var/www/processwire/site-regular-main /var/www/processwire/site-regular
```

### 11. ZIP-Datei löschen

```bash
rm site-regular.zip
```

### 12. Dateien dem Webserver-Benutzer übergeben

`-R` ändert den Eigentümer aller Dateien und Unterordner. Der Installer muss den Profilordner umbenennen, `site/config.php` schreiben und sich am Ende selbst löschen.

```bash
sudo chown -R www-data:www-data /var/www/processwire
```

## Datenbank in MariaDB einrichten

Auf Ubuntu meldet sich `root` ohne Passwort an MariaDB an, wenn der Befehl mit `sudo` läuft. Das nutzen die nächsten drei Schritte.

### 13. Datenbank anlegen

`utf8mb4` speichert alle Zeichen, auch Emojis.

```bash
sudo mariadb -e "CREATE DATABASE processwire CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 14. Datenbankbenutzer anlegen

ProcessWire meldet sich mit diesem Benutzer bei MariaDB an. Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 20.

```bash
sudo mariadb -e "CREATE USER 'processwire'@'localhost' IDENTIFIED BY 'geheimes_passwort';"
```

### 15. Dem Benutzer die Datenbank freigeben

```bash
sudo mariadb -e "GRANT ALL PRIVILEGES ON processwire.* TO 'processwire'@'localhost';"
```

**Prüfen:** Die Ausgabe enthält die Zeile ``GRANT ALL PRIVILEGES ON `processwire`.* TO `processwire`@`localhost` ``.

```bash
sudo mariadb -e "SHOW GRANTS FOR 'processwire'@'localhost';"
```

## nginx einrichten

nginx wird vor der Installation eingerichtet, weil der Installer im Browser läuft.

### 16. Konfiguration für ProcessWire anlegen

```bash
sudo nano /etc/nginx/sites-available/processwire
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```nginx
server {
    listen 127.0.0.1:8099;
    server_name localhost;

    root /var/www/processwire;
    index index.php;

    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php?it=$uri&$args;
    }

    location ~ ^/(index|install)\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    location ~ \.php$ {
        return 404;
    }

    location ~ ^/site/assets/(cache|logs|backups|sessions|config|install|tmp)/ {
        deny all;
    }

    location ~* \.(inc|module|info|sql|json|md|txt|yml|latte|twig|tpl)$ {
        deny all;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

- `try_files … /index.php?it=$uri&$args` – alle Adressen ohne passende Datei gehen an ProcessWire. Den Pfad bekommt es im Parameter `it` übergeben, so erwartet es ProcessWire.
- `index` und `install` – die einzigen PHP-Dateien, die über das Web erreichbar sind. `install.php` löscht sich nach der Installation selbst. Vorlagen, Module und `site/config.php` liefert nginx nicht aus (`return 404`).
- `site/assets/(cache|logs|…)` – sperrt Zwischenspeicher, Protokolle, Sicherungen und Sitzungsdaten.
- Die Endungen `inc`, `module`, `json`, `sql` usw. – sperrt Quelltexte, Übersetzungsdateien und Datenbankabzüge. Diese Regeln übernehmen bei nginx die Aufgabe der Datei `.htaccess`, die ProcessWire für den Webserver Apache mitbringt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 17. Konfiguration aktivieren

```bash
sudo ln -s /etc/nginx/sites-available/processwire /etc/nginx/sites-enabled/processwire
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

## ProcessWire installieren

### 20. Installer im Browser durchlaufen

Öffne <http://localhost:8099/install.php> im Browser. Bleib bis zum Ende im selben Browserfenster: Der Installer merkt sich den Zwischenstand nur innerhalb der laufenden Sitzung.

1. **Welcome:** Klicke auf **Get Started**.
2. **Site Installation Profile:** Wähle **Regular Uikit 3.x site/blog profile** und klicke auf **Continue**.
3. **Compatibility Check:** Alle Punkte sind grün bis auf den Hinweis `Unable to determine if Apache mod_rewrite … is installed`. Er betrifft nur den Webserver Apache, nicht nginx. Klicke auf **Continue To Next Step**.
4. **MySQL Database:** Trage bei **DB Name** `processwire`, bei **DB User** `processwire` und bei **DB Pass** dein Passwort aus Schritt 14 ein. Wähle bei **Time Zone** `Europe/Berlin`. Unter **HTTP Host Names** stehen schon `localhost:8099` und `localhost`, das passt. Lass bei **Debug mode?** die Auswahl **OFF** stehen und klicke auf **Continue**.
5. **Admin Panel und Admin Account:** Lass bei **Admin Login URL** `processwire` stehen, dann liegt die Verwaltung unter `/processwire/`. Gib bei **User** deinen Benutzernamen, zweimal ein **Password** und eine **Email Address** ein. Das Passwort kann ProcessWire später nicht anzeigen, merke es dir gut.
6. **Cleanup:** Lass alle Haken gesetzt. Der Installer löscht dann `install.php`, die Installationsdateien des Profils und das ungenutzte Profil „Blank“. Klicke auf **Continue**.

**Prüfen:** Die letzte Seite meldet `User account saved` und `Your admin URL is /processwire/`.

### 21. site/config.php schützen

In `site/config.php` stehen das Datenbankpasswort und ein geheimer Schlüssel für die Passwörter der Benutzer. Der Installer empfiehlt selbst, die Datei schreibzuschützen. Danach darf nur noch `www-data` sie lesen, und niemand darf sie ändern.

```bash
sudo chmod 400 /var/www/processwire/site/config.php
```

**Prüfen:** Die Zeile beginnt mit `-r--------` und nennt zweimal `www-data`.

```bash
ls -l /var/www/processwire/site/config.php
```

Willst du `site/config.php` später ändern, gib vorher mit `sudo chmod 600 /var/www/processwire/site/config.php` das Schreibrecht zurück und setze es danach wieder auf `400`.

## Verwaltung auf Deutsch umstellen

### 22. Deutsches Sprachpaket herunterladen

Das Sprachpaket wird von der deutschsprachigen Community auf GitHub gepflegt und verwendet die Anrede „Sie“. Der Befehl legt die ZIP-Datei in deinem Home-Verzeichnis ab. Von dort lädst du sie im Browser hoch.

```bash
wget -O ~/pw-lang-de.zip https://github.com/jmartsch/pw-lang-de/archive/refs/heads/master.zip
```

### 23. Modul für Sprachen installieren

Öffne <http://localhost:8099/processwire/> und melde dich an.

1. Klicke oben auf **Modules** und dann auf den Reiter **Core**.
2. Suche in der Liste den Eintrag **Languages Support** (`LanguageSupport`) und klicke daneben auf **Install**.

**Prüfen:** ProcessWire meldet unter anderem `Created Default Language Page: /processwire/setup/languages/default/` und `Language Support Installed!`.

### 24. Sprachpaket in die Standardsprache laden

Die Standardsprache heißt zunächst „default“ und ist englisch. Mit dem Sprachpaket wird sie deutsch.

1. Klicke oben auf **Setup** → **Languages** und dann auf **default**.
2. Ändere das Feld **Title** in `Deutsch`.
3. Klicke im Feld **Core Translation Files** auf den Link zum Auswählen von Dateien (oder ziehe die Datei mit der Maus hinein) und wähle `pw-lang-de.zip` aus deinem Home-Verzeichnis. ProcessWire entpackt sie selbst und listet danach die einzelnen `.json`-Dateien.
4. Klicke auf **Save**.
5. Melde dich ab (oben rechts unter deinem Namen) und wieder an.

Nimm das Feld **Core Translation Files** und nicht „Site Translation Files“. Das zweite Feld ist für Übersetzungen deiner eigenen Vorlagen gedacht.

**Prüfen:** Die Anmeldeseite zeigt „Benutzername“, „Passwort“ und „Einloggen“. Oben stehen die Menüpunkte „Seiten“, „Verwaltung“, „Module“ und „Zugriff“.

Die ZIP-Datei in deinem Home-Verzeichnis brauchst du danach nicht mehr:

```bash
rm ~/pw-lang-de.zip
```

## ProcessWire verwenden

### 25. Website ansehen

Öffne <http://localhost:8099> im Browser.

**Prüfen:** Die Beispielwebsite erscheint mit den Menüpunkten „About“, „Blog“ und „Site Map“. Die Texte sind englisch, weil sie Inhalte des Profils sind.

### 26. Eine Seite bearbeiten

1. Klicke in der Verwaltung auf **Seiten**. Der Seitenbaum zeigt „Home“ mit den Unterseiten „About“, „Blog“, „Categories“ usw.
2. Klicke auf **Home** und dann auf **Bearbeiten**.
3. Ändere im Reiter **Inhalt** das Feld **Titel**, z. B. in `Willkommen`. Darunter liegen die Felder des Profils wie „Headline“, „Body“ und „Images“.
4. Klicke auf **Speichern**.

**Prüfen:** ProcessWire meldet „Gespeichert: /“. Lädst du <http://localhost:8099> neu, erscheint der neue Titel.

## Aktualisieren

Bei einem Update ersetzt man nur den Ordner `wire`. Deine Website mit Vorlagen, Modulen, Dateien und `site/config.php` liegt im Ordner `site` und bleibt erhalten. Lege vorher eine Sicherung der Datenbank und des Ordners `/var/www/processwire` an.

### 1. Neue Version herunterladen

Ersetze `3.0.259` durch die neue stabile Versionsnummer.

```bash
cd /tmp && wget -O processwire.zip https://github.com/processwire/processwire/archive/refs/tags/3.0.259.zip
```

### 2. Neue Version entpacken

Entpackt die Dateien nach `/tmp/processwire-3.0.259`.

```bash
unzip -q processwire.zip
```

### 3. Alten Kern löschen

```bash
sudo rm -r /var/www/processwire/wire
```

### 4. Neuen Kern einsetzen

```bash
sudo cp -r /tmp/processwire-3.0.259/wire /var/www/processwire/
```

### 5. Neuen Kern dem Webserver-Benutzer übergeben

```bash
sudo chown -R www-data:www-data /var/www/processwire/wire
```

### 6. Heruntergeladene Dateien löschen

```bash
rm -r /tmp/processwire-3.0.259 /tmp/processwire.zip
```

### 7. In der Verwaltung anmelden

Öffne <http://localhost:8099/processwire/> und melde dich an. ProcessWire passt die Datenbank beim ersten Aufruf der Verwaltung selbst an und meldet das oben auf der Seite.

**Prüfen:** Unten in der Verwaltung steht die neue Versionsnummer, z. B. „ProcessWire 3.0.259 © 2026“.

Nach einem Update kann das Sprachpaket einzelne neue Texte noch nicht enthalten, sie erscheinen dann englisch. Eine neue Fassung des Pakets lädst du wie in Schritt 22 und 24 hoch.

## Deinstallieren

### 1. Seite in nginx deaktivieren

```bash
sudo rm /etc/nginx/sites-enabled/processwire
```

### 2. nginx-Konfigurationsdatei löschen

```bash
sudo rm /etc/nginx/sites-available/processwire
```

### 3. nginx prüfen und neu laden

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

### 4. ProcessWire-Dateien löschen

**Achtung:** Damit sind auch alle Vorlagen und hochgeladenen Bilder und Dateien gelöscht. Der Befehl `cd /tmp` sorgt dafür, dass du nicht mehr im gelöschten Ordner stehst.

```bash
cd /tmp && sudo rm -r /var/www/processwire
```

### 5. Datenbank löschen

**Achtung:** Damit sind alle Seiten, Inhalte und Benutzer der Website gelöscht.

```bash
sudo mariadb -e "DROP DATABASE IF EXISTS processwire;"
```

### 6. Datenbankbenutzer löschen

```bash
sudo mariadb -e "DROP USER IF EXISTS 'processwire'@'localhost';"
```

**Prüfen:** Die Seite ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:8099
```

### 7. MariaDB entfernen (optional)

Nur wenn kein anderes Programm MariaDB braucht, z. B. [Contao](contao.md), [Neos](neos.md), [Concrete CMS](concrete.md) oder [Backdrop CMS](backdrop.md). **Achtung:** `purge` löscht auch alle übrigen Datenbanken in MariaDB. PHP, `unzip` und nginx bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.

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
