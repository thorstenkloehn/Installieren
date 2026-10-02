# Adminer

Adminer ist eine Weboberfläche für Datenbanken, die aus einem einzigen PHP-Programm besteht. Im Browser sieht man damit Tabellen und ihre Inhalte, legt Tabellen an, ändert Datensätze, führt SQL-Befehle aus und exportiert Daten. Adminer versteht [MariaDB](mariadb.md), [MySQL](mysql.md) und [PostgreSQL](postgresql.md), außerdem SQLite, Oracle und MS SQL. Es ist eine schlanke Alternative zu [DBeaver](dbeaver.md), weil kein eigenes Programmfenster nötig ist. Diese Anleitung startet Adminer bei Bedarf mit dem eingebauten Webserver von PHP, nur für diesen Rechner.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Adminer **5.4.1** im Paket `adminer`.
- **Ohne Apache:** Das Paket empfiehlt den Webserver Apache und würde ihn ohne weitere Angaben mitinstallieren. Er wäre danach dauerhaft auf Port 80 erreichbar. Schritt 2 verhindert das mit `--no-install-recommends` und installiert nur die nötigen PHP-Teile.
- **Nur bei Bedarf und nur lokal:** Adminer läuft in dieser Anleitung nur, solange das Terminal aus Schritt 8 geöffnet ist, und nur unter `127.0.0.1`. Andere Rechner im Netz erreichen es nicht.
- **Keine Abfrage nach Updates:** Die Ubuntu-Fassung fragt nicht beim Hersteller nach neuen Versionen. Updates kommen über `apt`.
- **Anmeldung mit Passwort:** Adminer meldet sich wie jedes andere Programm über das Netzwerk an der Datenbank an. Der Datenbankbenutzer braucht daher ein Passwort. Für PostgreSQL legen die Schritte 4 bis 6 einen solchen Benutzer an.
- **Version:** Getestet mit Adminer **5.4.1** und PHP 8.5 am 2. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Adminer installieren

- `adminer` – das Programm selbst.
- `libjs-jush` – färbt SQL-Befehle in Adminer farbig ein.
- `php-cli` – enthält den eingebauten Webserver von PHP.
- `php-cgi` – erfüllt die Abhängigkeit des Pakets von einer PHP-Ausführung, ohne einen Dienst zu starten.
- `php-mysql` und `php-pgsql` – die Treiber für MariaDB/MySQL und PostgreSQL.
- `--no-install-recommends` – verhindert, dass Apache mitinstalliert wird.

```bash
sudo apt install --no-install-recommends adminer libjs-jush php-cli php-cgi php-mysql php-pgsql
```

**Prüfen:** In der Liste der neuen Pakete taucht `apache2` nicht auf. Erscheint es doch, brich mit <kbd>n</kbd> ab und prüfe den Befehl.

### 3. Prüfen, ob Adminer da ist

Das Programm liegt in `/usr/share/adminer`, die Datei zum Starten in `/etc/adminer`.

```bash
ls /etc/adminer
```

**Prüfen:** Es erscheint `conf.php`.

## PostgreSQL-Benutzer mit Passwort anlegen

Nur nötig, wenn du Adminer mit PostgreSQL verwenden willst. Die Anleitung [PostgreSQL](postgresql.md) muss vorher durchlaufen sein. Für MariaDB und MySQL legen die dortigen Anleitungen bereits Benutzer mit Passwort an.

### 4. Benutzer anlegen

`createuser` legt einen neuen Datenbankbenutzer namens `uebung` an. `--pwprompt` fragt zweimal nach seinem Passwort. Der Befehl läuft als Verwalter `postgres`.

```bash
sudo -u postgres createuser --pwprompt uebung
```

### 5. Datenbank für den Benutzer anlegen

`--owner uebung` macht den neuen Benutzer zum Besitzer. Er darf in dieser Datenbank dann alles, in anderen Datenbanken nichts.

```bash
sudo -u postgres createdb --owner uebung uebung
```

### 6. Anmeldung mit Passwort testen

`-h localhost` erzwingt die Verbindung über das Netzwerk, wie Adminer sie nutzt. `psql` fragt nach dem Passwort aus Schritt 4.

```bash
psql -h localhost -U uebung -d uebung -c "SELECT current_user"
```

**Prüfen:** Die Ausgabe zeigt `uebung`.

## Adminer starten

### 7. Freien Port prüfen

Adminer soll auf Port 8090 laufen. Der Befehl prüft, ob ein anderes Programm ihn schon belegt.

```bash
ss -ltn | grep ':8090 '
```

**Prüfen:** Der Befehl gibt nichts aus. Erscheint eine Zeile, wähle in Schritt 8 eine andere Zahl, z. B. `8091`.

### 8. Adminer starten

`php -S` startet den eingebauten Webserver von PHP. `127.0.0.1:8090` ist die Adresse, `/etc/adminer/conf.php` beantwortet jede Anfrage. Der Webserver läuft mit deinen Benutzerrechten, solange das Terminal geöffnet ist.

```bash
php -S 127.0.0.1:8090 /etc/adminer/conf.php
```

**Prüfen:** Es erscheint `Development Server (http://127.0.0.1:8090) started`. Lass das Terminal offen. Jede Anfrage des Browsers erscheint dort als eigene Zeile.

### 9. Adminer im Browser öffnen

```text
http://127.0.0.1:8090/
```

**Prüfen:** Es erscheint die Seite **Login** mit den Feldern **Datenbank System**, **Server**, **Benutzer**, **Passwort** und **Datenbank**. Die Sprache stellt Adminer nach dem Browser ein, oben links lässt sie sich unter **Sprache** ändern.

## Mit einer Datenbank arbeiten

### 10. Anmelden

Trage ein:

- **Datenbank System:** `PostgreSQL` (für MariaDB oder MySQL: `MySQL / MariaDB`)
- **Server:** `localhost`
- **Benutzer:** `uebung`
- **Passwort:** das Passwort aus Schritt 4
- **Datenbank:** `uebung`

Klicke auf **Login**. Den Haken bei **Passwort speichern** lässt du weg, dann merkt sich Adminer das Passwort nur bis zum Schließen des Browsers.

**Prüfen:** Die Überschrift lautet `Schema: public`, links stehen unter anderem **SQL-Kommando** und **Tabelle erstellen**.

### 11. SQL-Kommando öffnen

Klicke links auf **SQL-Kommando**.

### 12. Tabelle anlegen, füllen und abfragen

Füge diesen Text in das Eingabefeld ein (<kbd>Strg</kbd>+<kbd>V</kbd>) und klicke auf **Ausführen**:

```sql
CREATE TABLE ausflug (
    id    serial PRIMARY KEY,
    ziel  text NOT NULL,
    km    numeric
);

INSERT INTO ausflug (ziel, km) VALUES
    ('Hamfelder Hof', 6.5),
    ('Großensee', 12);

SELECT ziel, km FROM ausflug ORDER BY km DESC;
```

**Prüfen:** Unter dem Eingabefeld erscheint für jeden der drei Befehle eine Meldung, zuletzt eine Tabelle mit `Großensee` und `Hamfelder Hof`.

### 13. Tabelle ansehen und bearbeiten

Klicke links auf `ausflug` und dann auf **Daten auswählen**. Über **Bearbeiten** neben einer Zeile änderst du einen Datensatz, über **Neuer Datensatz** legst du einen weiteren an.

### 14. Daten exportieren

Klicke links auf **Exportieren**. Wähle bei **Ergebnis** die Möglichkeit **Datei** und bei **Format** `SQL` oder `CSV`, dann klicke unten auf **Exportieren**. Der Browser lädt die Datei herunter.

### 15. Abmelden

Klicke oben rechts auf **Abmelden**.

### 16. Adminer beenden

Wechsle in das Terminal aus Schritt 8 und drücke <kbd>Strg</kbd>+<kbd>C</kbd>. Danach ist Adminer nicht mehr erreichbar.

## Wie geht es weiter?

- **SQLite:** Adminer lässt aus Sicherheitsgründen keine Anmeldung ohne Passwort zu. Für SQLite ist deshalb ein Zusatz nötig (`/usr/share/adminer/plugins/login-password-less.php`). Einfacher geht es mit [DBeaver](dbeaver.md) oder dem Kommandozeilenprogramm aus der Anleitung [SQLite](sqlite.md).
- **Dauerhaft über nginx:** Statt `php -S` kann Adminer auch über [nginx](nginx.md) und PHP-FPM laufen. Dann sollte der Zugang mit `allow 127.0.0.1; deny all;` oder einem Passwortschutz auf bekannte Rechner beschränkt sein, weil sonst jeder im Netz die Anmeldeseite erreicht.
- **Apache:** Das Paket legt die Datei `/etc/apache2/conf-available/adminer.conf` ab, aktiviert sie aber nicht. Sie erlaubt den Zugriff von überall und sollte nicht ungeprüft mit `a2enconf` eingeschaltet werden.
- **Dokumentation:** <https://www.adminer.org/>

## Deinstallieren

### 1. PostgreSQL-Übungsdatenbank löschen (falls angelegt)

**Achtung:** Die Tabelle aus Schritt 12 ist danach weg.

```bash
sudo -u postgres dropdb uebung
```

### 2. PostgreSQL-Übungsbenutzer löschen (falls angelegt)

```bash
sudo -u postgres dropuser uebung
```

### 3. Adminer entfernen

Entfernt Adminer und die Pakete aus Schritt 2. Brauchst du PHP noch für andere Anleitungen, z. B. [PHP](php.md), lässt du `php-cli` und die Treiber in der Liste weg.

```bash
sudo apt purge adminer libjs-jush php-cgi php-mysql php-pgsql php-cli
```

### 4. Übrige Abhängigkeiten entfernen

`apt` listet die Pakete auf und fragt vor dem Löschen nach. Ist ein Paket dabei, das du noch brauchst, brich mit <kbd>n</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Ordner `/etc/adminer` ist verschwunden.

```bash
ls /etc/adminer
```

`ls` meldet, dass es den Ordner nicht gibt (`Datei oder Verzeichnis nicht gefunden`).
