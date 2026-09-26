# Joomla

Joomla ist ein Content-Management-System für Websites mit Beiträgen, Menüs, Benutzerverwaltung und vielen Erweiterungen. Inhalte werden im Browser über eine Verwaltungsoberfläche gepflegt, ohne HTML-Kenntnisse. Es eignet sich für Vereins- und Firmenwebsites ebenso wie für mehrsprachige Portale.

## Vorbemerkungen

- **Kein apt-Paket:** Joomla ist nicht in den Ubuntu-Paketquellen enthalten. Die Anleitung lädt das offizielle Paket von GitHub. PHP, PostgreSQL und nginx kommen aus den Ubuntu-Paketquellen.
- **Voraussetzungen:** [nginx](nginx.md) und [PostgreSQL](postgresql.md) sind installiert und laufen. Joomla kann auch MySQL/MariaDB verwenden, diese Anleitung nutzt PostgreSQL wie die Anleitung für [Drupal](drupal.md).
- **Adresse:** Joomla läuft hier unter <http://localhost:8091>, nur vom eigenen Rechner aus erreichbar. Port 8091 wurde gewählt, damit Joomla nicht mit anderen Websites auf Port 80 oder Drupal auf Port 8090 zusammenstößt. Für eine öffentliche Website mit eigener Domain passt man die nginx-Konfiguration an, wie in [nginx auf dem Produktionsserver](nginx-produktion.md) beschrieben.
- **Version:** Getestet mit Joomla **6.1.3**, PHP 8.5 und PostgreSQL 18 unter Ubuntu 26.04. Joomla 6 braucht mindestens PHP 8.3.
- **Sprache:** Joomla wird auf Englisch installiert. Die deutsche Sprache kommt in Schritt 15 dazu.

## PHP vorbereiten

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. PHP und benötigte Erweiterungen installieren

- `php-fpm` führt PHP-Dateien für nginx aus.
- `php-pgsql` verbindet PHP mit PostgreSQL.
- Die übrigen Erweiterungen braucht Joomla für Bilder (`gd`), Sprachen und Zahlenformate (`intl`), Pakete (`zip`), XML-Dateien (`xml`), Umlaute (`mbstring`) und Downloads, z. B. von Sprachpaketen und Updates (`curl`).

Sind die Pakete schon vorhanden, etwa durch die Drupal-Anleitung, meldet `apt` das nur.

```bash
sudo apt install php-fpm php-pgsql php-gd php-intl php-zip php-xml php-mbstring php-curl
```

**Prüfen:** Die Ausgabe beginnt mit `PHP 8.3` oder höher, z. B. `PHP 8.5.4`.

```bash
php --version
```

## Joomla herunterladen

### 3. Joomla herunterladen

Lädt das vollständige Paket (etwa 28 MB) nach `/tmp`. Die aktuelle Version steht auf <https://github.com/joomla/joomla-cms/releases/latest>. Bei einer neueren Version ersetzt du `6.1.3` an allen drei Stellen im Befehl.

```bash
wget -O /tmp/joomla.tar.gz https://github.com/joomla/joomla-cms/releases/download/6.1.3/Joomla_6.1.3-Stable-Full_Package.tar.gz
```

### 4. Prüfsumme vergleichen

Berechnet die SHA-256-Prüfsumme der Datei. So lässt sich feststellen, ob der Download vollständig und unverändert ist.

```bash
sha256sum /tmp/joomla.tar.gz
```

**Prüfen:** Vergleiche die Ausgabe mit dem Wert in der Tabelle „Installation Packages“ auf der Release-Seite in der Zeile „GNU Zip Archive (.tar.gz)“. Für 6.1.3 lautet er `184f8c582cde5981693de7c28547c6e834c48c50cb377c7b8421bbfd33bbdf6f`. Weicht er ab, lösche die Datei und lade sie neu.

### 5. Verzeichnis für Joomla anlegen

Hier liegen später alle Dateien der Website.

```bash
sudo mkdir /var/www/joomla
```

### 6. Joomla entpacken

`-C` entpackt das Archiv in das neue Verzeichnis.

```bash
sudo tar -xzf /tmp/joomla.tar.gz -C /var/www/joomla
```

**Prüfen:** Die Ausgabe enthält unter anderem `administrator`, `installation` und `index.php`.

```bash
ls /var/www/joomla
```

### 7. Dateien dem Webserver übergeben

PHP-FPM läuft als Benutzer `www-data`. Joomla muss eigene Dateien schreiben können, etwa beim Installieren von Erweiterungen und bei Updates. Deshalb gehören alle Dateien diesem Benutzer.

```bash
sudo chown -R www-data:www-data /var/www/joomla
```

### 8. Heruntergeladene Datei löschen

```bash
rm /tmp/joomla.tar.gz
```

## Datenbank in PostgreSQL einrichten

### 9. Datenbankbenutzer anlegen

Joomla meldet sich mit diesem Benutzer bei PostgreSQL an. Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 13.

```bash
sudo -u postgres psql -c "CREATE USER joomlauser WITH PASSWORD 'geheimes_passwort';"
```

**Prüfen:** Die Ausgabe lautet `CREATE ROLE`.

### 10. Datenbank anlegen

Legt die Datenbank `joomladb` an, die dem neuen Benutzer gehört.

```bash
sudo -u postgres psql -c "CREATE DATABASE joomladb OWNER joomlauser ENCODING 'UTF8';"
```

**Prüfen:** Die Ausgabe lautet `CREATE DATABASE`.

## nginx einrichten

### 11. Konfiguration für Joomla anlegen

```bash
sudo nano /etc/nginx/sites-available/joomla
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```nginx
server {
    listen 127.0.0.1:8091;
    server_name localhost;

    root /var/www/joomla;
    index index.php index.html;

    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ ^/(administrator/logs|cli|logs|tmp)/ {
        deny all;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

- `listen 127.0.0.1:8091` – nginx nimmt nur Anfragen vom eigenen Rechner auf Port 8091 an.
- `client_max_body_size 64M` – erlaubt größere Uploads, z. B. für Erweiterungen und Bilder.
- `try_files … /index.php?$args` – Adressen, zu denen es keine Datei gibt, gehen an Joomla. Das braucht Joomla für suchmaschinenfreundliche Adressen.
- `deny all` bei `administrator/logs`, `cli`, `logs` und `tmp` – diese Ordner enthalten Protokolle, Befehlszeilenprogramme und Zwischendateien, die niemand über den Browser abrufen soll. Der Block muss **vor** dem PHP-Block stehen. nginx prüft solche Regeln der Reihe nach und nimmt die erste passende, sonst würde `cli/joomla.php` doch ausgeführt.
- Der letzte Block sperrt versteckte Dateien wie `.htaccess`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Konfiguration aktivieren, prüfen und laden

Der erste Befehl aktiviert die Seite über einen Link in `sites-enabled`. Der zweite prüft die Konfiguration auf Tippfehler, der dritte lädt sie, ohne laufende Verbindungen zu unterbrechen.

```bash
sudo ln -s /etc/nginx/sites-available/joomla /etc/nginx/sites-enabled/joomla
```

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Nur dann weiter.

```bash
sudo systemctl reload nginx
```

## Joomla installieren

### 13. Joomla über die Befehlszeile installieren

Joomla bringt ein Installationsprogramm für die Befehlszeile mit. Es richtet die Datenbank ein, schreibt die Einstellungen in `configuration.php` und löscht danach den Ordner `installation`. `sudo -u www-data` führt es als Webserver-Benutzer aus, damit alle neuen Dateien diesem gehören.

Passe vorher die Werte an:

- `--admin-user` – dein Name, `--admin-username` – der Anmeldename für die Verwaltung, `--admin-email` – deine E-Mail-Adresse.
- `--admin-password` – ein Passwort mit **mindestens 12 Zeichen**.
- `--db-pass` – das Passwort aus Schritt 9.
- `--db-prefix` – eine Vorsilbe für alle Tabellennamen. Sie erlaubt mehrere Joomla-Installationen in einer Datenbank.

```bash
cd /var/www/joomla && sudo -u www-data php installation/joomla.php install --site-name="Meine Joomla-Website" --admin-user="Dein Name" --admin-username=admin --admin-password='Ein-langes-Passwort-2026' --admin-email=admin@example.com --db-type=pgsql --db-host=localhost --db-user=joomlauser --db-pass=geheimes_passwort --db-name=joomladb --db-prefix=jml_ -n
```

**Prüfen:** Alle Zeilen enden mit `OK`, die letzte lautet `[OK] Joomla has been installed`.

Wer lieber im Browser installiert, lässt diesen Schritt weg und ruft stattdessen <http://localhost:8091> auf. Der Browser führt dann durch dieselben Angaben. Als Datenbanktyp wählt man dort „PostgreSQL (PDO)“.

### 14. An der Verwaltung anmelden

Öffne <http://localhost:8091/administrator> im Browser und melde dich mit dem Anmeldenamen und Passwort aus Schritt 13 an.

**Prüfen:** Das Dashboard „Home Dashboard“ erscheint. Links steht das Menü mit **Content**, **Menus**, **Components**, **Users** und **System**.

### 15. Deutsches Sprachpaket installieren

Klicke links auf **System**. Im Bereich **Install** klickst du auf **Languages**. Tippe in das Suchfeld `German` und drücke <kbd>Enter</kbd>. Klicke in der Zeile „German“ mit dem Kürzel `de-DE` auf **Install**. Joomla lädt das Sprachpaket herunter und meldet danach, dass die Installation erfolgreich war.

### 16. Deutsch als Standardsprache festlegen

Klicke links auf **System**. Im Bereich **Manage** klickst du auf **Languages**.

1. Oben ist im Auswahlfeld **Site** eingestellt, also die öffentliche Website. Klicke in der Zeile „German (Germany)“ in der Spalte **Default** auf den Stern (**Set default**).
2. Stelle das Auswahlfeld auf **Administrator** um und klicke auch dort in der Zeile „German (Germany)“ auf den Stern.

Nach dem zweiten Klick erscheint die Verwaltung auf Deutsch.

**Prüfen:** Beide Male erscheint die Meldung „Default Language Saved“ bzw. „Die Standardsprache wurde gespeichert.“. In der Spalte **Default** bzw. **Standard** leuchtet der Stern jetzt bei „German (Germany)“.

### 17. Website ansehen

Öffne <http://localhost:8091> im Browser.

**Prüfen:** Die Startseite mit dem Design „Cassiopeia“ erscheint. Rechts steht ein Anmeldeformular mit „Benutzername“, „Passwort“ und „Anmelden“. Die Überschriften „Home“, „Main Menu“ und „Login Form“ bleiben englisch, weil es Inhalte sind, die bei der Installation angelegt wurden. Du änderst sie in der Verwaltung unter **Menüs** und **Inhalt → Site Module**.

## Aktualisieren

Joomla aktualisiert sich über die Verwaltung. Lege vorher eine Sicherung an, mindestens der Datenbank und des Ordners `/var/www/joomla`.

### 1. Nach Updates suchen

Führt die Suche als Webserver-Benutzer auf der Befehlszeile aus.

```bash
cd /var/www/joomla && sudo -u www-data php cli/joomla.php core:update:check
```

**Prüfen:** Die Ausgabe nennt entweder eine neue Version oder meldet `You already have the latest Joomla version`.

### 2. Update einspielen

Die Verwaltung zeigt ein verfügbares Update auch auf dem Dashboard an. Klicke in der Verwaltung links auf **System**, im Bereich **Updates** auf **Joomla** und folge den Anweisungen.

Alternativ spielt dieser Befehl das Update auf der Befehlszeile ein:

```bash
cd /var/www/joomla && sudo -u www-data php cli/joomla.php core:update
```

### 3. Sprachpaket aktualisieren

Nach einem Joomla-Update gibt es meist auch ein neues deutsches Sprachpaket. Klicke auf **System**, im Bereich **Updates** auf **Erweiterungen** und aktualisiere dort „German (DE)“.

## Deinstallieren

### 1. Seite in nginx deaktivieren

Entfernt nur den Link in `sites-enabled`, die Konfigurationsdatei bleibt zunächst erhalten.

```bash
sudo rm /etc/nginx/sites-enabled/joomla
```

### 2. nginx-Konfigurationsdatei löschen

```bash
sudo rm /etc/nginx/sites-available/joomla
```

### 3. nginx prüfen und neu laden

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

### 4. Joomla-Dateien löschen

**Achtung:** Damit sind auch alle hochgeladenen Bilder und Dateien gelöscht.

```bash
sudo rm -r /var/www/joomla
```

### 5. Datenbank löschen

**Achtung:** Damit sind alle Beiträge, Menüs und Benutzer der Website gelöscht.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS joomladb;"
```

### 6. Datenbankbenutzer löschen

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS joomlauser;"
```

**Prüfen:** Die Seite ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:8091
```

PHP, PostgreSQL und nginx bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden. Wer PHP nicht mehr braucht, entfernt die Pakete aus Schritt 2 mit `sudo apt purge` und danach `sudo apt autoremove --purge`.
