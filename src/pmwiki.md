# PmWiki

PmWiki ist ein schlankes Wiki in PHP, das ohne Datenbank auskommt: Jede Seite wird als einfache Textdatei gespeichert. Es eignet sich für kleine und mittlere Wikis, die mit wenig Wartung über viele Jahre laufen sollen. Diese Anleitung richtet PmWiki mit [nginx](nginx.md) und PHP-FPM auf dem eigenen Rechner ein.

## Vorbemerkungen

- **Keine Installation über apt:** Ubuntu hat kein Paket für PmWiki. Das Projekt veröffentlicht ein Archiv, das man nur auspacken muss.
- **Version:** Getestet mit PmWiki **2.7.6**, PHP 8.5 und nginx aus Ubuntu 26.04.
- **Voraussetzung:** nginx und PHP-FPM sind installiert, wie in der Anleitung [DokuWiki](dokuwiki.md) oder [MediaWiki](mediawiki.md). Schritt 2 installiert sie sonst nach.
- **Port:** Die Ports 8085 bis 8087 sind im Buch schon vergeben. PmWiki läuft auf Port **8088**, nur vom eigenen Rechner aus erreichbar.
- **Passwörter:** PmWiki hat keine Benutzerkonten, sondern Passwörter für Tätigkeiten: eins zum Bearbeiten von Seiten, eins für die Verwaltung. `EditPasswort123` und `AdminPasswort123` sind Beispiele. Ersetze sie durch eigene Passwörter.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von nginx und PHP kennt.

```bash
sudo apt update
```

### 2. nginx, PHP-FPM und unzip installieren

nginx liefert die Seiten aus, PHP-FPM führt PmWiki aus, `unzip` packt das deutsche Sprachpaket aus. Ist alles schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install nginx php-fpm unzip
```

### 3. PmWiki herunterladen

Lädt immer die neueste Version (etwa 1 MB) in den Ordner `/tmp`.

```bash
wget -O /tmp/pmwiki.tgz https://www.pmwiki.org/pub/pmwiki/pmwiki-latest.tgz
```

### 4. Archiv auspacken

Packt PmWiki nach `/var/www`. Der entstandene Ordner trägt die Versionsnummer im Namen, z. B. `pmwiki-2.7.6`.

```bash
sudo tar xzf /tmp/pmwiki.tgz -C /var/www
```

### 5. Ordner umbenennen

Ein Ordnername ohne Versionsnummer bleibt auch nach Aktualisierungen gleich. Passe die Nummer an, falls in Schritt 4 eine neuere Version ausgepackt wurde.

```bash
sudo mv /var/www/pmwiki-2.7.6 /var/www/pmwiki
```

**Prüfen:** Die Ausgabe enthält die Versionsnummer, z. B. `pmwiki-2.7.6`.

```bash
grep -o "pmwiki-[0-9.]*" /var/www/pmwiki/scripts/version.php
```

### 6. Deutsches Sprachpaket herunterladen

Das Sprachpaket enthält die Übersetzung der Oberfläche und die deutsche Hilfe.

```bash
wget -O /tmp/i18n-de.zip https://www.pmwiki.org/pub/pmwiki/i18n/i18n-de.zip
```

### 7. Sprachpaket auspacken

Die Seiten des Sprachpakets gehören in den Ordner `wikilib.d`, in dem auch die mitgelieferten englischen Seiten liegen. Im Archiv stecken sie im Unterordner `UTF-8/wikilib.d`. `-j` lässt diese Ordnerangaben weg und legt die Dateien direkt im Zielordner ab.

```bash
sudo unzip -j /tmp/i18n-de.zip 'UTF-8/wikilib.d/*' -d /var/www/pmwiki/wikilib.d
```

**Prüfen:** Die Zahl der deutschen Seiten ist größer als 100.

```bash
ls /var/www/pmwiki/wikilib.d | grep -c PmWikiDe
```

## Einrichten

### 8. Ordner für die Wiki-Seiten anlegen

In `wiki.d` speichert PmWiki jede Seite, die du anlegst oder änderst, als eigene Datei.

```bash
sudo mkdir /var/www/pmwiki/wiki.d
```

### 9. Schreibrechte für den Webserver vergeben

PHP-FPM läuft als Benutzer `www-data` und muss in `wiki.d` schreiben dürfen. Alle übrigen Dateien bleiben im Besitz von `root`, PmWiki kann sein eigenes Programm also nicht verändern.

```bash
sudo chown www-data:www-data /var/www/pmwiki/wiki.d
```

### 10. Einstellungsdatei anlegen

Alle eigenen Einstellungen stehen in `local/config.php`. Das Archiv enthält diese Datei nicht, damit eine Aktualisierung sie nie überschreibt.

```bash
sudo nano /var/www/pmwiki/local/config.php
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```php
<?php if (!defined('PmWiki')) exit();

$WikiTitle = 'Mein PmWiki';

# Passwörter: admin darf alles, edit darf Seiten bearbeiten
$DefaultPasswords['admin'] = pmcrypt('AdminPasswort123');
$DefaultPasswords['edit'] = pmcrypt('EditPasswort123');

# Zeichensatz UTF-8 und deutsche Oberfläche
include_once("scripts/xlpage-utf-8.php");
XLPage('de', 'PmWikiDe.XLPage');
```

- Die erste Zeile verhindert, dass jemand die Datei direkt im Browser aufruft.
- `$WikiTitle` ist der Name des Wikis, der im Browser-Tab erscheint.
- `pmcrypt` speichert die Passwörter verschlüsselt. Ohne `edit`-Passwort dürfte jeder Besucher alle Seiten ändern.
- Ohne die Zeile mit `xlpage-utf-8.php` verwendet PmWiki den alten Zeichensatz ISO-8859-1. Umlaute aus dem Sprachpaket und in deinen Seiten würden dann falsch angezeigt.

## nginx konfigurieren

### 11. Konfiguration für PmWiki anlegen

Legt einen eigenen Server-Block auf Port 8088 an. Nur `pmwiki.php` und der Ordner `pub` (Designs und Bilder) sollen von außen erreichbar sein. Die Seiten in `wiki.d` und `wikilib.d`, die Einstellungen in `local` sowie der Programmcode in `scripts` und `cookbook` werden gesperrt.

```bash
sudo nano /etc/nginx/sites-available/pmwiki
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 127.0.0.1:8088;
    server_name localhost;

    root /var/www/pmwiki;
    index pmwiki.php;

    # Versteckte Dateien, Seitenspeicher, Einstellungen und Programmcode sperren
    location ~ /\. {
        return 403;
    }

    location ~ ^/(wiki\.d|wikilib\.d|local|cookbook|scripts|docs)/ {
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

### 12. Konfiguration aktivieren

Ein Link in `sites-enabled` sorgt dafür, dass nginx die neue Seite lädt.

```bash
sudo ln -s /etc/nginx/sites-available/pmwiki /etc/nginx/sites-enabled/pmwiki
```

### 13. nginx-Konfiguration testen

Findet Tippfehler, bevor nginx neu geladen wird.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 14. nginx neu laden

Übernimmt die Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

## Testen

### 15. Startseite abrufen

Prüft, ob PmWiki antwortet und UTF-8 verwendet.

```bash
curl -sI http://localhost:8088/pmwiki.php
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 200 OK`, und die Zeile `Content-Type` endet mit `charset=UTF-8`.

### 16. Sperren prüfen

Die Einstellungsdatei mit den Passwörtern darf nicht abrufbar sein.

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8088/local/config.php
```

**Prüfen:** Die Ausgabe lautet `403`.

## Erste Schritte

### 17. Eine Seite anlegen

Öffne <http://localhost:8088/pmwiki.php?n=Main.Spielwiese&action=edit> im Browser. PmWiki fragt nach dem Passwort. Gib das `edit`-Passwort aus Schritt 10 ein. Schreibe einen Text, z. B. `Grüße aus Ahrensburg`, und klicke auf **Speichern**.

Links zu anderen Seiten schreibst du in doppelten eckigen Klammern, z. B. `[[Einkaufsliste]]`. Klickst du auf einen Link zu einer Seite, die es noch nicht gibt, kannst du sie gleich anlegen. Die Startseite `Main.HomePage` ist anfangs englisch. Über **Bearbeiten** änderst du sie wie jede andere Seite.

**Prüfen:** Die neue Seite liegt als Datei im Ordner `wiki.d`.

```bash
ls /var/www/pmwiki/wiki.d
```

Die deutsche Hilfe zur Bearbeitung findest du unter <http://localhost:8088/pmwiki.php?n=PmWikiDe.DocumentationIndex>.

## Aktualisieren

### 1. Neue Version herunterladen

```bash
wget -O /tmp/pmwiki.tgz https://www.pmwiki.org/pub/pmwiki/pmwiki-latest.tgz
```

### 2. Über die vorhandene Installation auspacken

`--strip-components=1` lässt den Ordner mit der Versionsnummer weg und packt die Dateien direkt nach `/var/www/pmwiki`. Das Archiv enthält weder `wiki.d` noch `local/config.php`. Deine Seiten und Einstellungen bleiben deshalb erhalten.

```bash
sudo tar xzf /tmp/pmwiki.tgz -C /var/www/pmwiki --strip-components=1
```

**Prüfen:** Die Versionsnummer ist gestiegen.

```bash
grep -o "pmwiki-[0-9.]*" /var/www/pmwiki/scripts/version.php
```

## Deinstallieren

### 1. Seite in nginx deaktivieren

Entfernt den Link aus Schritt 12.

```bash
sudo rm /etc/nginx/sites-enabled/pmwiki
```

### 2. nginx-Konfigurationsdatei löschen

```bash
sudo rm /etc/nginx/sites-available/pmwiki
```

### 3. nginx neu laden

```bash
sudo systemctl reload nginx
```

### 4. PmWiki und alle Seiten löschen

**Achtung:** Damit sind auch alle Wiki-Seiten weg. Wer sie behalten will, kopiert vorher den Ordner `/var/www/pmwiki/wiki.d`.

```bash
sudo rm -r /var/www/pmwiki
```

### 5. Heruntergeladene Dateien löschen

```bash
rm /tmp/pmwiki.tgz /tmp/i18n-de.zip
```

nginx, PHP-FPM und unzip bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.

**Prüfen:** Unter Port 8088 antwortet nichts mehr.

```bash
curl -sI http://localhost:8088/
```
