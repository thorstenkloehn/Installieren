# PHP

PHP ist eine weit verbreitete Skriptsprache für die Webentwicklung. Auf dem Entwicklungsrechner dient sie dazu, serverseitige Skripte auszuführen und dynamische Webanwendungen lokal zu testen.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketversionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. PHP (CLI) installieren

Installiert den PHP-Kommandozeileninterpreter. Damit kannst du PHP-Skripte direkt im Terminal ausführen oder den integrierten Webserver starten.

```bash
sudo apt install php-cli
```

**Prüfen:** Die Versionsnummer wird angezeigt (unter Ubuntu 26.04 ist dies PHP 8.5).

```bash
php -v
```

### 3. PHP-FPM für Webserver installieren

Installiert PHP-FPM (FastCGI Process Manager). Dieser Dienst verarbeitet PHP-Anfragen im Hintergrund für Webserver wie nginx.

```bash
sudo apt install php-fpm
```

### 4. Prüfen, ob der PHP-FPM-Dienst läuft

PHP-FPM läuft als Hintergrunddienst (systemd). Hier siehst du, ob er aktiv ist.

```bash
systemctl status php8.5-fpm
```

**Prüfen:** In der Ausgabe steht `Active: active (running)`. Mit der Taste `q` verlässt du die Anzeige.

### 5. Häufig benötigte Erweiterungen installieren

Die meisten modernen PHP-Projekte und Frameworks (wie Laravel oder Symfony) benötigen zusätzliche Module für Netzwerkabfragen, Textverarbeitung, XML, ZIP-Archive und SQLite-Datenbanken.

```bash
sudo apt install php-curl php-mbstring php-xml php-zip php-sqlite3
```

**Prüfen:** Listet alle aktiven PHP-Module auf.

```bash
php -m
```

## PHP testen

### 6. Skript auf der Kommandozeile ausführen

Prüft mit einem kurzen Einzeiler, ob der PHP-Interpreter Code fehlerfrei ausführt.

```bash
php -r 'echo "PHP funktioniert!\n";'
```

**Prüfen:** Im Terminal wird `PHP funktioniert!` ausgegeben.

### 7. Integrierten Entwicklungsserver testen

PHP bringt einen schlanken Webserver mit. Damit kannst du Webseiten sofort lokal im Browser testen, ohne einen externen Server konfigurieren zu müssen.

```bash
php -S 127.0.0.1:8000
```

**Prüfen:** Im Browser unter <http://localhost:8000> ist der Server erreichbar. Zum Beenden des Servers drückst du im Terminal `Strg + C`.

## Erstes Programm

### 8. Arbeitsordner anlegen

Ein eigener Ordner für die Übungsdateien.

```bash
mkdir -p ~/php-uebung
```

### 9. In den Ordner wechseln

Alle folgenden Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/php-uebung
```

### 10. Skript anlegen

Legt `hallo.php` an. Jede PHP-Datei beginnt mit `<?php`. `declare(strict_types=1)` sorgt dafür, dass PHP die angegebenen Typen (hier `string`) streng prüft, statt Werte stillschweigend umzuwandeln. Variablen beginnen in PHP immer mit `$`.

```bash
nano hallo.php
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```php
<?php

declare(strict_types=1);

function begruessung(string $name): string
{
    return "Hallo $name!";
}

$sprachen = ['Go', 'Rust', 'PHP', 'Kotlin', 'TypeScript'];

echo begruessung('Ubuntu'), PHP_EOL;
echo 'PHP-Version: ', PHP_VERSION, PHP_EOL;

foreach ($sprachen as $i => $sprache) {
    printf("%d. %s\n", $i + 1, $sprache);
}
```

### 11. Skript ausführen

Der Interpreter `php` liest die Datei und führt sie sofort aus.

```bash
php hallo.php
```

**Prüfen:** Die Ausgabe beginnt mit `Hallo Ubuntu!` und `PHP-Version: 8.5.…`, danach folgen fünf nummerierte Zeilen.

### 12. Syntax prüfen

`php -l` untersucht eine Datei auf Syntaxfehler, ohne sie auszuführen. Praktisch vor dem Hochladen auf einen Server.

```bash
php -l hallo.php
```

**Prüfen:** Die Meldung lautet `No syntax errors detected in hallo.php`.

## Bibliotheken mit Composer

Composer ist der Paketmanager für PHP. Er lädt Bibliotheken aus dem Verzeichnis Packagist in den Projektordner `vendor` und erzeugt eine Datei, die sie automatisch einbindet.

### 13. Composer installieren

Installiert Composer aus den Ubuntu-Paketquellen.

```bash
sudo apt install composer
```

**Prüfen:** Die Ausgabe nennt die Version, z. B. `Composer version 2.9.5`.

```bash
composer --version
```

### 14. Bibliothek hinzufügen

Installiert als Beispiel `ramsey/uuid`, eine Bibliothek zum Erzeugen eindeutiger Kennungen. Composer legt dabei `composer.json` (gewünschte Pakete), `composer.lock` (genau installierte Versionen) und den Ordner `vendor` an.

```bash
composer require ramsey/uuid
```

**Prüfen:** Die Ausgabe enthält `Using version ^4.… for ramsey/uuid`.

### 15. Skript mit der Bibliothek anlegen

Legt `uuid.php` an. Die Zeile mit `vendor/autoload.php` bindet alle über Composer installierten Bibliotheken ein; `use` macht die Klasse unter ihrem kurzen Namen verfügbar.

```bash
nano uuid.php
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```php
<?php

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Ramsey\Uuid\Uuid;

$id = Uuid::uuid4();
echo "Neue ID: $id", PHP_EOL;
echo 'Version: ', $id->getFields()->getVersion(), PHP_EOL;
```

### 16. Skript ausführen

```bash
php uuid.php
```

**Prüfen:** Es erscheint eine zufällige Kennung wie `Neue ID: d227883a-79b7-4e80-825f-e60098dc7e3e` und darunter `Version: 4`. Bei jedem Aufruf ist die Kennung eine andere.

## Zusammenspiel mit nginx (optional)

Wenn du nginx nach der nginx-Anleitung eingerichtet hast, kannst du PHP über PHP-FPM anbinden.

### 17. PHP in der nginx-Konfiguration aktivieren

Ergänzt in der bestehenden Konfiguration `/etc/nginx/sites-available/dev` die Startdatei `index.php` und den `location ~ \.php$`-Block für PHP-FPM.

```bash
sudo nano /etc/nginx/sites-available/dev
```

Die Datei hat schon Inhalt, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 127.0.0.1:8081;
    server_name localhost;

    root /var/www/dev;
    index index.php index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }
}
```

### 18. nginx-Konfiguration testen

Stellt sicher, dass die neue Konfiguration fehlerfrei ist.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 19. nginx neu laden

Aktiviert die geänderte Konfiguration im Webserver.

```bash
sudo systemctl reload nginx
```

### 20. PHP-Testdatei anlegen

Erstellt eine PHP-Informationsseite im Entwicklungsordner `/var/www/dev`.

```bash
nano /var/www/dev/info.php
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```php
<?php phpinfo(); ?>
```

### 21. Testseite aufrufen

Fragt die PHP-Testseite über nginx ab.

```bash
curl -s http://localhost:8081/info.php | head -n 10
```

**Prüfen:** Im Browser siehst du unter <http://localhost:8081/info.php> die ausführliche PHP-Konfiguration.

## Optional: Autostart ausschalten

Auf einem Entwicklungsrechner muss PHP-FPM nicht zwingend bei jedem Rechnerstart im Hintergrund laufen.

Autostart ausschalten:

```bash
sudo systemctl disable php8.5-fpm
```

Bei Bedarf von Hand starten und stoppen:

```bash
sudo systemctl start php8.5-fpm
```

```bash
sudo systemctl stop php8.5-fpm
```

## Deinstallieren

### 1. Testdatei entfernen

Löscht die PHP-Testdatei aus dem Entwicklungsverzeichnis, falls sie angelegt wurde.

```bash
rm -f /var/www/dev/info.php
```

### 2. Übungsordner entfernen

Löscht die Beispielskripte und den Ordner `vendor`.

```bash
rm -rf ~/php-uebung
```

### 3. Composer entfernen

Entfernt Composer sowie seinen Zwischenspeicher und seine Einstellungen im Benutzerordner.

```bash
sudo apt purge composer
```

```bash
rm -rf ~/.cache/composer ~/.config/composer
```

### 4. PHP und Erweiterungen entfernen

`purge` entfernt die Pakete sowie deren Konfigurationsdateien unter `/etc/php`.

```bash
sudo apt purge "php*"
```

### 5. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten und Bibliotheken, die nur für PHP installiert wurden.

```bash
sudo apt autoremove
```

**Prüfen:** Der PHP-Befehl ist nicht mehr vorhanden.

```bash
php -v
```
