# DokuWiki

DokuWiki ist eine schlanke Wiki-Software in PHP, die ihre Seiten als einfache Textdateien speichert und deshalb keine Datenbank braucht. Sie eignet sich gut für Dokumentationen, Notizen und kleine Teams. Diese Anleitung installiert DokuWiki aus den Paketquellen von Ubuntu und bindet es in nginx ein.

## Vorbemerkungen

- **Voraussetzungen:** [nginx](nginx.md) und [PHP](php.md) mit PHP-FPM sind nach den jeweiligen Anleitungen installiert und laufen.
- **Installation über apt:** Ubuntu 26.04 liefert DokuWiki im Paket `dokuwiki` (Version 2025-05-14b „Librarian“). Das Projekt selbst ist schon eine Version weiter. Dafür bekommt man über `apt` Sicherheitsupdates automatisch mit dem restlichen System.
- **Aufteilung der Dateien:** Das Paket legt den Programmcode nach `/usr/share/dokuwiki`, die Einstellungen nach `/etc/dokuwiki` und die Wiki-Seiten nach `/var/lib/dokuwiki/data`. Einstellungen und Seiten liegen damit außerhalb des Ordners, den nginx ausliefert.
- **Vorsicht mit Apache:** Das Paket richtet DokuWiki normalerweise ungefragt in Apache ein. Auf diesem Rechner läuft Apache aber schon für den [Tileserver](tileserver.md). Schritt 3 zeigt deshalb alle Fragen des Pakets an, damit du Apache abwählen kannst.
- **Port:** Das Wiki läuft unter nginx auf Port **8086** und ist nur vom eigenen Rechner aus erreichbar.
- **Getestet:** mit nginx 1.28 und PHP 8.5 unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketstände der Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Paketinformationen ansehen (optional)

Zeigt Version und Abhängigkeiten des Pakets. Unter `Recommends` stehen die PHP-Module `php-gd` (Bilder verkleinern), `php-intl` (Sprachen und Sortierung) und `php-mbstring` (Umlaute und andere Sonderzeichen). `apt` installiert sie automatisch mit.

```bash
apt show dokuwiki
```

### 3. DokuWiki installieren und alle Fragen anzeigen

Das Paket stellt bei der Installation mehrere Fragen, zeigt die meisten davon aber nur auf Wunsch. `DEBIAN_PRIORITY=low` sorgt dafür, dass du alle zu sehen bekommst, auch die Frage nach dem Webserver.

```bash
sudo DEBIAN_PRIORITY=low apt install dokuwiki
```

In den Dialogen wechselst du mit der <kbd>Tab</kbd>-Taste zwischen Feld und Schaltflächen und bestätigst mit <kbd>Enter</kbd>. So beantwortest du die Fragen (die Texte erscheinen auf Deutsch, wenn das System auf Deutsch eingestellt ist):

- **Automatisch einzurichtende(r) Webserver** – `apache2` ist vorausgewählt. Entferne mit der <kbd>Leertaste</kbd> das Sternchen, sodass nichts mehr ausgewählt ist, und bestätige mit **Ok**. nginx richtest du in Schritt 4 selbst ein.
- **Wiki-Speicherort** – `/dokuwiki` einfach bestätigen. Die Angabe gilt nur für Apache.
- **Zugelassenes Netzwerk** – `nur lokaler Rechner` bestätigen. Auch das gilt nur für Apache.
- **Seiten beim vollständigen Entfernen des Pakets löschen?** – **Nein**. So gehen deine Seiten nicht verloren, wenn du das Paket einmal entfernst.
- **Einstellungen für den Webserver schreibbar machen?** – **Nein**. Einstellungen änderst du dann mit nano wie in Schritt 10. Bei **Ja** kann der Administrator sie auch im Browser ändern. Dafür darf der Webserver aber in `/etc/dokuwiki` schreiben.
- **Verzeichnis der Plugins für den Webserver schreibbar machen?** – **Nein**. Bei **Ja** kann man Erweiterungen im Browser installieren, der Webserver darf dafür aber Programmcode ablegen.
- **Wiki-Titel** – ein Name für dein Wiki, z. B. `Mein Wiki`.
- **Wiki-Lizenz** – unter welcher Lizenz die Inhalte stehen. Für ein privates Wiki reicht `keine`.
- **ACL aktivieren?** – **Ja**. Nur mit der Zugriffssteuerung (ACL) gibt es Benutzerkonten und Rechte.
- **Benutzername**, **Echter Name** und **E-Mail-Adresse des Administrators** – die Angaben für das Administratorkonto, z. B. `admin`.
- **Passwort des Administrators** – das Passwort für dieses Konto, danach noch einmal zur Kontrolle.
- **Anfängliche ACL-Richtlinie** – `öffentlich` bedeutet: Alle dürfen lesen, nur angemeldete Benutzer dürfen schreiben. `offen` erlaubt allen das Schreiben, `geschlossen` erlaubt nur angemeldeten Benutzern überhaupt den Zugriff.

**Prüfen:** In der Ausgabe stehen `Creating config file /etc/dokuwiki/local.php with new version` und keine Zeile, die `apache2` neu lädt. Die Einstellungsdatei enthält den gewählten Titel:

```bash
cat /etc/dokuwiki/local.php
```

## nginx konfigurieren

### 4. Konfiguration für DokuWiki anlegen

Legt einen eigenen Server-Block auf Port 8086 an. Die Ordner `bin`, `inc` und `vendor` enthalten Programmcode, der nie direkt aufgerufen werden soll. Sie werden gesperrt, ebenso versteckte Dateien wie `.htaccess.dist`. Der Block für PHP-Dateien reicht Anfragen an PHP-FPM weiter. Das Snippet `fastcgi-php.conf` von Ubuntu prüft dabei selbst, ob die Datei existiert.

```bash
sudo nano /etc/nginx/sites-available/dokuwiki
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 127.0.0.1:8086;
    server_name localhost;

    root /usr/share/dokuwiki;
    index doku.php;

    client_max_body_size 20m;

    # Programmcode und versteckte Dateien sperren
    location ~ /\. {
        return 403;
    }

    location ~ ^/(bin|inc|vendor)/ {
        return 403;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 5. Konfiguration aktivieren

Ein Link in `sites-enabled` sorgt dafür, dass nginx die neue Seite lädt.

```bash
sudo ln -s /etc/nginx/sites-available/dokuwiki /etc/nginx/sites-enabled/dokuwiki
```

### 6. nginx-Konfiguration testen

Findet Tippfehler, bevor nginx neu geladen wird.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Steht dort ein Fehler, lädt nginx im nächsten Schritt die neue Konfiguration nicht. Die bisherigen Seiten laufen dann unverändert weiter.

### 7. nginx neu laden

Übernimmt die Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

## Testen

### 8. Startseite abrufen

Prüft, ob das Wiki antwortet.

```bash
curl -sI http://localhost:8086/
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 200 OK`. Im Browser zeigt <http://localhost:8086> die noch leere Startseite deines Wikis. Oben rechts meldest du dich mit dem Administratorkonto aus Schritt 3 an.

### 9. Sperren prüfen

Stichprobe, ob der Programmcode wirklich gesperrt ist.

```bash
curl -sI http://localhost:8086/inc/init.php
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 403 Forbidden`.

## Oberfläche auf Deutsch umstellen

### 10. Sprache in der Einstellungsdatei setzen

Die Oberfläche ist zunächst englisch. Die Sprache legst du in der lokalen Einstellungsdatei fest.

```bash
sudo nano /etc/dokuwiki/local.php
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `lang` und bestätige mit <kbd>Enter</kbd>. Ändere die gefundene Zeile

```php
#$conf['lang'] = 'en';
```

so ab (Raute am Anfang entfernen, `en` durch `de` ersetzen):

```php
$conf['lang'] = 'de';
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. DokuWiki liest die Datei bei jedem Aufruf neu, ein Neustart ist nicht nötig.

**Prüfen:** Oben rechts steht jetzt **Anmelden** statt **Log In**.

```bash
curl -s http://localhost:8086/doku.php | grep -o Anmelden | head -1
```

## Wo liegt was?

- `/var/lib/dokuwiki/data/pages` – die Wiki-Seiten als Textdateien, eine Datei pro Seite.
- `/var/lib/dokuwiki/data/media` – hochgeladene Bilder und Dateien.
- `/var/lib/dokuwiki/data/attic` – ältere Fassungen der Seiten.
- `/var/lib/dokuwiki/acl` – Benutzerkonten (`users.auth.php`) und Zugriffsrechte (`acl.auth.php`).
- `/etc/dokuwiki/local.php` – deine Einstellungen.

Für eine Sicherung reicht es, die Ordner `/var/lib/dokuwiki` und `/etc/dokuwiki` zu kopieren.

Soll das Wiki unter einer eigenen Domain erreichbar sein, passt man `listen` und `server_name` an und richtet ein Zertifikat ein, wie in der Anleitung [MediaWiki mit nginx unter eigener Domain](nginx-mediawiki.md) beschrieben.

## Aktualisieren

DokuWiki kommt aus den Ubuntu-Paketquellen und wird mit dem restlichen System aktualisiert.

### 1. Paketlisten aktualisieren

Holt die aktuellen Paketlisten.

```bash
sudo apt update
```

### 2. Pakete aktualisieren

Installiert neue Versionen, darunter DokuWiki. Seiten und Einstellungen bleiben erhalten.

```bash
sudo apt upgrade
```

## Deinstallieren

### 1. Seite in nginx deaktivieren

Löscht den Link aus `sites-enabled`.

```bash
sudo rm -f /etc/nginx/sites-enabled/dokuwiki
```

### 2. nginx-Konfigurationsdatei löschen

Löscht die Konfigurationsdatei der Seite.

```bash
sudo rm -f /etc/nginx/sites-available/dokuwiki
```

### 3. nginx neu laden

Übernimmt das Abschalten der Seite.

```bash
sudo systemctl reload nginx
```

### 4. DokuWiki entfernen

`purge` entfernt das Paket samt Einstellungen in `/etc/dokuwiki`. Die Seiten bleiben erhalten, wenn du in Schritt 3 der Installation das Löschen abgelehnt hast. `dpkg` meldet dann, dass einige Ordner nicht leer sind und deshalb bleiben.

```bash
sudo apt purge dokuwiki
```

### 5. Nicht mehr benötigte Pakete entfernen

Entfernt Bibliotheken, die nur für DokuWiki installiert wurden. PHP-FPM und die übrigen PHP-Module bleiben, weil sie eigenständig installiert sind.

```bash
sudo apt autoremove
```

### 6. Wiki-Seiten löschen (optional)

Entfernt die übrig gebliebenen Seiten, Anhänge und Benutzerkonten. **Achtung:** Alle Inhalte des Wikis gehen dabei unwiderruflich verloren.

```bash
sudo rm -rf /var/lib/dokuwiki
```

**Prüfen:** Unter Port 8086 antwortet nichts mehr, `curl` meldet einen Verbindungsfehler.

```bash
curl -sI http://localhost:8086/
```
