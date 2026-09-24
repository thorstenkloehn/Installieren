# WordPress mit nginx unter eigener Domain

WordPress ist das meistgenutzte Programm für Websites und Blogs. Beiträge, Seiten, Bilder, Designs und Erweiterungen verwaltet man bequem im Browser. Diese Anleitung installiert WordPress mit nginx, PHP-FPM und MariaDB und macht es unter einer eigenen Domain erreichbar, hier am Beispiel `start.de`.

## Vorbemerkungen

- **Voraussetzung:** [nginx](nginx.md) und [PHP](php.md) mit PHP-FPM sind nach den jeweiligen Anleitungen installiert und laufen.
- **Warum nicht das apt-Paket?** Ubuntu 26.04 enthält zwar ein Paket `wordpress`, aber nur in Version 6.7 aus dem Bereich „universe“, für den Ubuntu keine Sicherheitsupdates zusagt. Aktuell ist WordPress 7.1. Weil eine Website aus dem Internet erreichbar ist, installiert diese Anleitung das offizielle deutsche Paket von wordpress.org. WordPress hält sich danach selbst mit Sicherheitsupdates aktuell.
- **Datenbank:** WordPress braucht MySQL oder MariaDB. PostgreSQL wird nicht unterstützt. MariaDB kommt aus den Ubuntu-Paketquellen.
- **Version:** Die Befehle verwenden WordPress **7.1.2**. Ist eine neuere Version erschienen, ersetzt du die Versionsnummer in den Schritten 8 und 9. Die aktuelle Version steht auf <https://de.wordpress.org/download/>.
- **Passwörter:** `geheimes_passwort` ist ein Beispiel. Ersetze es durch ein eigenes Passwort.

> **Zum Beispiel `start.de`:** Die Domain ist nur ein Beispiel. Ersetze `start.de` in allen Befehlen durch deine eigene Domain. Zum Ausprobieren auf dem eigenen Rechner leitet Schritt 19 `start.de` auf den eigenen Rechner um. Die echte Website unter diesem Namen ist dann auf diesem Rechner nicht mehr erreichbar, bis der Eintrag wieder entfernt ist.

## Pakete installieren

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von MariaDB und den PHP-Modulen kennt.

```bash
sudo apt update
```

### 2. MariaDB installieren

Installiert den Datenbankserver. Der Dienst startet automatisch.

```bash
sudo apt install mariadb-server
```

**Prüfen:** Die Ausgabe lautet `active`.

```bash
systemctl is-active mariadb
```

### 3. PHP-Module für WordPress installieren

- `php-mysql` – Verbindung zu MariaDB
- `php-gd` und `php-imagick` – verkleinern hochgeladene Bilder und erzeugen Vorschaubilder
- `php-curl` – Anfragen an andere Server, z. B. für Updates
- `php-intl`, `php-mbstring` – Umgang mit Sprachen und Sonderzeichen
- `php-xml`, `php-zip` – lesen XML-Daten und entpacken Updates, Designs und Erweiterungen

```bash
sudo apt install php-mysql php-gd php-imagick php-curl php-intl php-mbstring php-xml php-zip
```

### 4. Größere Uploads erlauben

PHP nimmt ohne weitere Einstellung nur Dateien bis 2 MB an. Für Fotos ist das zu wenig. Die Datei im Ordner `conf.d` hebt die Grenze für PHP-FPM auf 64 MB an. `post_max_size` muss mindestens so groß sein, weil die Datei im Formular mitgeschickt wird.

```bash
sudo nano /etc/php/8.5/fpm/conf.d/99-wordpress.ini
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
upload_max_filesize = 64M
post_max_size = 64M
```

### 5. PHP-FPM neu starten

PHP-FPM lädt neue Module und Einstellungen erst nach einem Neustart.

```bash
sudo systemctl restart php8.5-fpm
```

**Prüfen:** Die Liste enthält `mysqli` und `imagick`.

```bash
php -m | grep -E 'mysqli|imagick'
```

## Datenbank anlegen

### 6. Datenbank erstellen

Legt die leere Datenbank `wordpress` an. `utf8mb4` speichert alle Zeichen, auch Emojis. Unter Ubuntu meldet sich `sudo mariadb` ohne Passwort als Datenbank-Administrator an, weil MariaDB den Ubuntu-Benutzer `root` erkennt.

```bash
sudo mariadb -e "CREATE DATABASE wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 7. Datenbankbenutzer anlegen

WordPress bekommt einen eigenen Benutzer, der nur auf diese eine Datenbank zugreifen darf. So kann eine Lücke in WordPress keine anderen Datenbanken gefährden.

```bash
sudo mariadb -e "CREATE USER 'wpuser'@'localhost' IDENTIFIED BY 'geheimes_passwort'; GRANT ALL PRIVILEGES ON wordpress.* TO 'wpuser'@'localhost';"
```

**Prüfen:** Die Anmeldung mit dem neuen Benutzer klappt, und die Liste enthält `wordpress`.

```bash
mariadb -u wpuser -p'geheimes_passwort' -e "SHOW DATABASES;"
```

## WordPress herunterladen

### 8. In den Download-Ordner wechseln

Das Paket wird hier abgelegt und nach dem Entpacken gelöscht.

```bash
cd ~/Downloads
```

### 9. Paket und Prüfsumme herunterladen

Lädt die deutsche Ausgabe von WordPress (etwa 43 MB) und die zugehörige SHA-1-Prüfsumme.

```bash
wget https://de.wordpress.org/wordpress-7.1.2-de_DE.tar.gz https://de.wordpress.org/wordpress-7.1.2-de_DE.tar.gz.sha1
```

### 10. Paket prüfen

Die `.sha1`-Datei enthält nur die Prüfsumme. `sha1sum -c` erwartet dahinter noch den Dateinamen, den `echo` ergänzt. So erkennst du, ob die Datei vollständig und unverändert angekommen ist.

```bash
echo "$(cat wordpress-7.1.2-de_DE.tar.gz.sha1)  wordpress-7.1.2-de_DE.tar.gz" | sha1sum -c
```

**Prüfen:** Die Ausgabe lautet `wordpress-7.1.2-de_DE.tar.gz: OK`. Bei `FEHLSCHLAG` die Datei löschen und neu herunterladen.

### 11. Entpacken

Das Archiv enthält einen Ordner `wordpress`, der direkt nach `/var/www` entpackt wird.

```bash
sudo tar -xzf wordpress-7.1.2-de_DE.tar.gz -C /var/www
```

**Prüfen:** Im Ordner liegen unter anderem `wp-config-sample.php` und `wp-admin`.

```bash
ls /var/www/wordpress
```

### 12. Heruntergeladene Dateien löschen

```bash
rm wordpress-7.1.2-de_DE.tar.gz wordpress-7.1.2-de_DE.tar.gz.sha1
```

### 13. Dateien dem Webserver übergeben

WordPress lädt Bilder hoch, installiert Designs und Erweiterungen und spielt Updates selbst ein. Dafür muss PHP-FPM, das als Benutzer `www-data` läuft, in den Ordner schreiben dürfen. Der Nachteil: Eine Lücke in einer Erweiterung könnte ebenfalls Dateien verändern. Halte WordPress und alle Erweiterungen deshalb immer aktuell.

```bash
sudo chown -R www-data:www-data /var/www/wordpress
```

## nginx einrichten

### 14. WordPress-Regeln als Baustein anlegen

Die Regeln kommen in eine eigene Datei unter `snippets`, die der `server`-Block in Schritt 15 mit `include` einbindet. nginx prüft Blöcke mit regulären Ausdrücken (`~`) von oben nach unten und nimmt den ersten Treffer. Deshalb stehen die Sperren **vor** dem Block, der PHP ausführt:

- **Sperren:** versteckte Dateien (z. B. `.htaccess`), PHP-Dateien im Upload-Ordner `wp-content/uploads` und `xmlrpc.php`. Diese alte Schnittstelle nutzen Angreifer gern, um Passwörter durchzuprobieren. Brauchst du sie, etwa für die WordPress-App auf dem Handy, lösche diesen Block.
- **PHP:** Alle übrigen `.php`-Dateien gehen an PHP-FPM.
- **Bilder, CSS, JavaScript:** Der Browser darf sie 30 Tage zwischenspeichern.
- **Alles andere:** Schöne Adressen wie `/hallo-welt/` gibt es nicht als Datei. `try_files` reicht sie an `index.php` weiter. WordPress liest die gewünschte Seite aus der ursprünglichen Adresse.

```bash
sudo nano /etc/nginx/snippets/wordpress.conf
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
# Versteckte Dateien sperren, außer .well-known (für HTTPS-Zertifikate)
location ~ /\.(?!well-known/) {
    return 403;
}

# Hochgeladene Dateien nie als PHP ausführen
location ~* ^/wp-content/uploads/.*\.php$ {
    return 403;
}

# Alte Schnittstelle, beliebtes Angriffsziel
location = /xmlrpc.php {
    return 403;
}

# PHP über PHP-FPM ausführen
location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/run/php/php-fpm.sock;
}

# Statische Dateien 30 Tage im Browser zwischenspeichern
location ~* \.(css|js|png|jpe?g|gif|ico|svg|webp|avif|woff2?)$ {
    expires 30d;
    access_log off;
}

# Schöne Adressen an WordPress weiterreichen
location / {
    try_files $uri $uri/ /index.php?$args;
}
```

### 15. Konfiguration für start.de anlegen

- **Der erste Block** leitet `www.start.de` dauerhaft (Status `301`) auf `start.de` um. `$scheme` behält `http` oder `https` bei.
- **Der zweite Block** ist die Website. `client_max_body_size 64m` passt zur PHP-Grenze aus Schritt 4. Ohne diese Zeile lehnt nginx Uploads über 1 MB ab, bevor PHP sie überhaupt sieht.

```bash
sudo nano /etc/nginx/sites-available/start.de
```

Steht aus einer anderen Anleitung schon Inhalt in der Datei, lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name www.start.de;

    return 301 $scheme://start.de$request_uri;
}

server {
    listen 80;
    listen [::]:80;
    server_name start.de;

    root /var/www/wordpress;
    index index.php;

    client_max_body_size 64m;

    access_log /var/log/nginx/start.de.access.log;
    error_log  /var/log/nginx/start.de.error.log;

    include snippets/wordpress.conf;
}
```

**Achtung:** Gibt es `/etc/nginx/sites-available/start.de` schon aus einer anderen Anleitung dieses Buchs, ersetzt du damit ihren Inhalt und die bisherige Website ist unter `start.de` nicht mehr erreichbar. Eine Domain kann immer nur zu einer Website gehören.

### 16. Website einschalten

Der Link in `sites-enabled` schaltet die Website ein. Meldet der Befehl `Die Datei existiert bereits`, ist sie schon eingeschaltet.

```bash
sudo ln -s /etc/nginx/sites-available/start.de /etc/nginx/sites-enabled/start.de
```

### 17. Konfiguration testen

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 18. nginx neu laden

```bash
sudo systemctl reload nginx
```

## WordPress einrichten

### 19. start.de auf den eigenen Rechner umleiten

Ein Eintrag in `/etc/hosts` hat Vorrang vor dem DNS im Internet. So lässt sich WordPress einrichten und testen, bevor die Domain auf einen Server zeigt. Steht der Eintrag schon aus einer anderen Anleitung in der Datei, diesen Schritt überspringen.

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

### 20. Einrichtungsassistenten öffnen

WordPress merkt sich die Adresse, unter der es eingerichtet wird, als Adresse der Website. Rufe den Assistenten deshalb unbedingt über `start.de` auf und nicht über `localhost`.

```bash
xdg-open http://start.de
```

**Prüfen:** Es erscheint die Seite „Willkommen bei WordPress“ mit der Liste der benötigten Angaben.

### 21. Datenbank-Zugang eintragen

Klicke auf **Los geht's!** und trage ein:

| Feld | Eingabe |
|---|---|
| Datenbank-Name | `wordpress` |
| Benutzername | `wpuser` |
| Passwort | das Passwort aus Schritt 7 |
| Datenbank-Host | `localhost` |
| Tabellen-Präfix | `wp_` (unverändert lassen) |

Klicke auf **Senden** und dann auf **Installation durchführen**. WordPress schreibt dabei die Einstellungsdatei `wp-config.php` mit dem Datenbank-Zugang und zufälligen Sicherheitsschlüsseln.

### 22. Website und Administrator anlegen

Gib einen Titel der Website, einen Benutzernamen, ein starkes Passwort und deine E-Mail-Adresse ein. Nimm als Benutzernamen nicht `admin`, weil Angreifer diesen Namen zuerst ausprobieren. Klicke auf **WordPress installieren**.

**Prüfen:** Es erscheint „Installation erfolgreich“. Mit **Anmelden** gelangst du unter <http://start.de/wp-admin/> in die Verwaltung.

### 23. Einstellungsdatei schützen

`wp-config.php` enthält das Datenbank-Passwort. Mit `640` darf nur `www-data` sie lesen und schreiben, alle anderen Benutzer des Rechners haben keinen Zugriff.

```bash
sudo chmod 640 /var/www/wordpress/wp-config.php
```

**Prüfen:** Die Rechte lauten `-rw-r-----`, Besitzer ist `www-data`.

```bash
ls -l /var/www/wordpress/wp-config.php
```

### 24. Schöne Adressen einschalten

Öffne in der Verwaltung **Einstellungen → Permalinks**, wähle **Beitragsname** und klicke auf **Änderungen speichern**. Beiträge heißen danach z. B. `/hallo-welt/` statt `/?p=1`. Anders als bei Apache ist dafür keine Datei `.htaccess` nötig, das erledigt der `location /`-Block aus Schritt 14.

## Testen

### 25. Startseite abrufen

```bash
curl -sI http://start.de/ | head -n 1
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 200 OK`. Im Browser zeigt <http://start.de> die Website mit dem Beispielbeitrag „Hallo Welt!“.

### 26. Schöne Adresse abrufen

Der Beispielbeitrag ist nach Schritt 24 unter `/hallo-welt/` erreichbar. Die Adresse gibt es nicht als Datei, nginx muss sie an WordPress weiterreichen.

```bash
curl -sI http://start.de/hallo-welt/ | head -n 1
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 200 OK`.

### 27. Umleitung von www prüfen

```bash
curl -sI http://www.start.de/hallo-welt/ | grep -E '^HTTP|^Location'
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 301 Moved Permanently` und `Location: http://start.de/hallo-welt/`.

### 28. Sperren prüfen

```bash
curl -sI http://start.de/xmlrpc.php | head -n 1
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 403 Forbidden`.

### 29. Website-Zustand in WordPress prüfen

Öffne in der Verwaltung **Werkzeuge → Website-Zustand**. WordPress prüft dort unter anderem PHP-Module, Upload-Grenze und Verbindungen.

**Prüfen:** Unter **Info → Medienverarbeitung** steht bei der maximalen Upload-Dateigröße `64 MB`. Hinweise zu HTTPS verschwinden erst mit dem optionalen Teil unten.

## Optional: Im Internet veröffentlichen

Diese Schritte gehen nur auf einem Server, der aus dem Internet erreichbar ist, und nur mit einer Domain, die dir gehört.

### 1. Testeintrag entfernen

```bash
sudo nano /etc/hosts
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `start.de` und drücke <kbd>Enter</kbd>. Lösche die Zeile `127.0.0.1 start.de www.start.de` mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 2. Domain auf den Server zeigen lassen

In der Weboberfläche des Domain-Anbieters für `start.de` und `www.start.de` je einen `A`-Eintrag mit der öffentlichen IPv4-Adresse des Servers anlegen, bei IPv6 zusätzlich einen `AAAA`-Eintrag.

**Prüfen:** Nach einigen Minuten bis Stunden erscheint die Adresse des Servers.

```bash
getent hosts start.de
```

### 3. Firewall öffnen

Nur nötig, wenn `ufw` eingeschaltet ist. Das Profil `Nginx Full` öffnet Port 80 und 443.

```bash
sudo ufw allow 'Nginx Full'
```

### 4. Certbot installieren

```bash
sudo apt install certbot python3-certbot-nginx
```

### 5. HTTPS einschalten

Certbot fragt nach einer E-Mail-Adresse und den Nutzungsbedingungen, holt ein Zertifikat von Let's Encrypt und ergänzt beide `server`-Blöcke um HTTPS.

```bash
sudo certbot --nginx -d start.de -d www.start.de
```

### 6. WordPress auf HTTPS umstellen

WordPress speichert seine Adresse in der Datenbank und erzeugt sonst weiter Links mit `http://`. Öffne **Einstellungen → Allgemein** und ändere bei **WordPress-Adresse (URL)** und **Website-Adresse (URL)** jeweils `http://` in `https://`. Nach dem Speichern meldet WordPress dich ab. Melde dich unter <https://start.de/wp-admin/> neu an.

**Prüfen:** Die erste Zeile lautet `HTTP/2 200` oder `HTTP/1.1 200 OK`.

```bash
curl -sI https://start.de/ | head -n 1
```

Das Zertifikat gilt 90 Tage und wird automatisch verlängert. Einen Probelauf startet dieser Befehl:

```bash
sudo certbot renew --dry-run
```

## Aktualisieren

WordPress spielt Sicherheitsupdates von selbst ein. Größere Updates, Designs und Erweiterungen aktualisierst du in der Verwaltung unter **Dashboard → Aktualisierungen**. MariaDB, PHP und nginx kommen aus apt und werden mit `sudo apt upgrade` aktualisiert.

## Prüfen der Installation

```bash
grep "wp_version =" /var/www/wordpress/wp-includes/version.php
```

```bash
sudo nginx -T 2>/dev/null | grep 'include snippets/wordpress.conf'
```

**Prüfen:** Der erste Befehl zeigt die Version von WordPress, z. B. `$wp_version = '7.1.2';`, der zweite die `include`-Zeile aus Schritt 15.

## Deinstallieren

### 1. Website ausschalten

```bash
sudo rm /etc/nginx/sites-enabled/start.de
```

### 2. nginx-Konfiguration löschen

```bash
sudo rm /etc/nginx/sites-available/start.de /etc/nginx/snippets/wordpress.conf
```

### 3. nginx testen und neu laden

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 4. WordPress-Dateien löschen

**Achtung:** Löscht auch alle hochgeladenen Bilder und Dateien in `wp-content/uploads`. Vorher bei Bedarf sichern.

```bash
sudo rm -rf /var/www/wordpress
```

### 5. Datenbank und Benutzer löschen

**Achtung:** Alle Beiträge, Seiten, Kommentare und Einstellungen gehen verloren.

```bash
sudo mariadb -e "DROP DATABASE wordpress; DROP USER 'wpuser'@'localhost';"
```

### 6. PHP-Einstellung entfernen und PHP-FPM neu starten

```bash
sudo rm /etc/php/8.5/fpm/conf.d/99-wordpress.ini
```

```bash
sudo systemctl restart php8.5-fpm
```

### 7. Logdateien löschen

```bash
sudo rm /var/log/nginx/start.de.*
```

### 8. Testeintrag aus `/etc/hosts` entfernen

Nur nötig, wenn der Eintrag aus Schritt 19 noch besteht und keine andere Anleitung ihn braucht.

```bash
sudo nano /etc/hosts
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `start.de` und drücke <kbd>Enter</kbd>. Lösche die Zeile `127.0.0.1 start.de www.start.de` mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Zertifikat löschen

Nur nötig, wenn im optionalen Teil ein Zertifikat geholt wurde.

```bash
sudo certbot delete --cert-name start.de
```

### 10. Optional: MariaDB und PHP-Module entfernen

Nur ausführen, wenn kein anderes Programm MariaDB oder diese PHP-Module braucht. **Achtung:** `purge` bei `mariadb-server` fragt, ob alle Datenbanken gelöscht werden sollen.

```bash
sudo apt purge mariadb-server php-mysql php-imagick
```

```bash
sudo apt autoremove
```

**Prüfen:** Unter <http://start.de> antwortet kein WordPress mehr, und die Datenbank ist entfernt, falls MariaDB noch installiert ist:

```bash
sudo mariadb -e "SHOW DATABASES;" | grep -c wordpress
```

Die Ausgabe `0` bedeutet: Die Datenbank ist entfernt.
