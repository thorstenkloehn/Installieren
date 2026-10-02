# ClickHouse

ClickHouse ist eine Datenbank für Auswertungen über sehr große Datenmengen. Sie speichert die Werte einer Tabelle spaltenweise und stark gepackt. Deshalb muss sie bei einer Abfrage nur die benötigten Spalten lesen und kann Summen, Mittelwerte oder Zählungen über viele Millionen Zeilen in Sekundenbruchteilen berechnen. Typische Einsätze sind Messwerte, Protokolldaten von Servern und Besucherstatistiken von Websites. Diese Anleitung installiert ClickHouse als Dienst, erzeugt fünf Jahre Wetterdaten mit über zehn Millionen Zeilen und wertet sie mit SQL aus.

## Vorbemerkungen

- **Warum nicht apt aus Ubuntu:** Ubuntu 26.04 enthält kein Paket für ClickHouse. Der Hersteller betreibt aber ein eigenes apt-Archiv. Nach dem Einbinden installiert und aktualisiert `apt` ClickHouse wie jedes andere Paket.
- **LTS oder stable:** Das Archiv hat zwei Bereiche. `stable` bekommt jeden Monat eine neue Version, `lts` nur zweimal im Jahr eine, die dann ein Jahr lang Fehlerbehebungen erhält. Diese Anleitung nimmt `lts`, weil eine Datenbank selten jede Neuerung sofort braucht.
- **DuckDB oder ClickHouse:** [DuckDB](duckdb.md) läuft ohne Server direkt in einem Programm und ist ideal für Auswertungen am eigenen Rechner. ClickHouse läuft als Dienst, nimmt laufend neue Daten an und bedient viele Benutzer und Programme gleichzeitig.
- **Nur lokal erreichbar:** ClickHouse lauscht nach der Installation nur auf `127.0.0.1` und `::1`. Die wichtigsten Ports sind **8123** (HTTP) und **9000** (eigenes Protokoll für `clickhouse-client`).
- **Arbeitsspeicher:** Der laufende Dienst belegt schon ohne Daten rund 800 MB.
- **Version:** Getestet mit ClickHouse **26.8.15** (LTS) am 2. Oktober 2026.

## Paketquelle einbinden

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramme installieren

`wget` lädt den Schlüssel herunter, `ca-certificates` enthält die Zertifikate für die verschlüsselte Verbindung zum Archiv. Meist sind beide schon vorhanden.

```bash
sudo apt install wget ca-certificates
```

### 3. Signaturschlüssel herunterladen

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich von ClickHouse stammen und unterwegs nicht verändert wurden. Der Hersteller legt denselben Schlüssel für alle Paketarten im Ordner `rpm` ab, er gilt aber auch für die Pakete für Ubuntu. Mit der Endung `.asc` kann `apt` ihn direkt lesen.

```bash
sudo wget -O /etc/apt/keyrings/clickhouse.asc https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key
```

**Prüfen:** Die erste Zeile lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -n 1 /etc/apt/keyrings/clickhouse.asc
```

### 4. Paketquelle eintragen

Legt eine neue Datei an, die `apt` als zusätzliche Paketquelle liest.

```bash
sudo nano /etc/apt/sources.list.d/clickhouse.sources
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://packages.clickhouse.com/deb
Suites: lts
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/clickhouse.asc
```

- `Suites: lts` – der Bereich mit den lange gepflegten Versionen. Wer immer die neueste Version möchte, schreibt `stable`.
- `Signed-By` – Pakete aus dieser Quelle werden nur mit dem Schlüssel aus Schritt 3 angenommen.

### 5. Paketlisten neu einlesen

Erst jetzt lädt `apt` das Paketverzeichnis von ClickHouse herunter.

```bash
sudo apt update
```

**Prüfen:** Der Installationskandidat ist eine Version wie `26.8.15.10`.

```bash
apt policy clickhouse-server
```

## Installation

### 6. ClickHouse installieren

Installiert den Server, das Kommandozeilenprogramm `clickhouse-client` und das gemeinsame Programm `clickhouse-common-static`, in dem alle Teile stecken. Der Download ist rund 250 MB groß.

```bash
sudo apt install clickhouse-server clickhouse-client
```

Gegen Ende der Installation erscheint im Terminal die Frage `Set up the password for the default user:`. Gib ein eigenes, langes Passwort ein und drücke <kbd>Enter</kbd>. Die Eingabe ist nicht zu sehen und wird nicht wiederholt, tippe also sorgfältig.

**Prüfen:** Danach erscheint `Password for the default user is saved in file /etc/clickhouse-server/users.d/default-password.xml.` In dieser Datei steht nur eine Prüfsumme des Passworts, nicht das Passwort selbst.

### 7. Version prüfen

```bash
clickhouse-client --version
```

**Prüfen:** Es erscheint z. B. `ClickHouse client version 26.8.15.10 (official build).`

## Vor dem ersten Start einrichten

Das Paket meldet den Dienst für den Systemstart an, startet ihn aber noch nicht.

### 8. Absturzberichte abschalten

ClickHouse schickt in der Grundeinstellung nach einem Absturz einen anonymisierten Bericht an die Entwickler. Wer das nicht möchte, legt eine Ergänzungsdatei an. Dateien im Ordner `config.d` ergänzen die große Hauptdatei `config.xml`, die bei Updates ersetzt werden kann.

```bash
sudo nano /etc/clickhouse-server/config.d/keine-absturzberichte.xml
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```xml
<clickhouse>
    <send_crash_reports>
        <enabled>false</enabled>
    </send_crash_reports>
</clickhouse>
```

### 9. Dienst starten

```bash
sudo systemctl start clickhouse-server
```

### 10. Prüfen, ob der Dienst läuft

```bash
systemctl status clickhouse-server
```

**Prüfen:** In der Ausgabe steht `active (running)` und weiter unten `Merging configuration file '/etc/clickhouse-server/config.d/keine-absturzberichte.xml'`. Die Ergänzung aus Schritt 8 wurde also gelesen. Beende die Anzeige mit <kbd>q</kbd>.

### 11. Prüfen, dass ClickHouse nur lokal lauscht

```bash
sudo ss -ltnp | grep clickhouse
```

**Prüfen:** Alle Zeilen enthalten `127.0.0.1` oder `[::1]`. Neben 8123 und 9000 erscheinen die Ports 9004 und 9005: Über sie verstehen auch Programme für MySQL und PostgreSQL ClickHouse. Port 9009 dient dem Austausch zwischen mehreren ClickHouse-Servern.

### 12. Lebenszeichen abfragen

Die Adresse `/ping` antwortet auch ohne Anmeldung.

```bash
curl http://127.0.0.1:8123/ping
```

**Prüfen:** Die Antwort lautet `Ok.`

## Anmeldedaten hinterlegen

`clickhouse-client` fragt sonst bei jedem Aufruf nach dem Passwort. Er liest aber eine Einstellungsdatei im eigenen Home-Ordner, in der das Passwort stehen kann.

### 13. Ordner anlegen

```bash
mkdir -p ~/.clickhouse-client
```

### 14. Einstellungsdatei anlegen

```bash
nano ~/.clickhouse-client/config.xml
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>) und ersetze `DEIN-PASSWORT` durch das Passwort aus Schritt 6. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

```xml
<config>
    <user>default</user>
    <password>DEIN-PASSWORT</password>
</config>
```

### 15. Datei schützen

Nur du darfst die Datei lesen und ändern.

```bash
chmod 600 ~/.clickhouse-client/config.xml
```

### 16. Anmeldung testen

`-q` übergibt eine einzelne Abfrage und beendet den Client danach wieder.

```bash
clickhouse-client -q "SELECT version()"
```

**Prüfen:** Es erscheint die Versionsnummer, z. B. `26.8.15.10`. Erscheint `Authentication failed`, stimmt das Passwort in der Datei nicht.

## Wetterdaten erzeugen

Statt Daten herunterzuladen, lässt das Beispiel ClickHouse selbst Messwerte erfinden: für vier Orte jede Minute einen Wert für Temperatur und Regen, fünf Jahre lang. Das ergibt gut 10,5 Millionen Zeilen.

### 17. Übungsordner anlegen

```bash
mkdir -p ~/clickhouse-uebung
```

### 18. In den Ordner wechseln

```bash
cd ~/clickhouse-uebung
```

### 19. SQL-Datei anlegen

```bash
nano wetter.sql
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```sql
CREATE DATABASE IF NOT EXISTS uebung;

CREATE TABLE IF NOT EXISTS uebung.wetter
(
    zeit       DateTime,
    station    LowCardinality(String),
    temperatur Float32,
    regen      Float32
)
ENGINE = MergeTree
ORDER BY (station, zeit);

INSERT INTO uebung.wetter
SELECT
    toDateTime('2021-01-01 00:00:00') + intDiv(number, 4) * 60 AS zeit,
    ['Ahrensburg', 'Bargteheide', 'Hamburg', 'Lübeck'][number % 4 + 1] AS station,
    round(10 - 9 * cos(2 * pi() * toDayOfYear(zeit) / 365)
             - 4 * cos(2 * pi() * (toHour(zeit) - 3) / 24)
             + randNormal(0, 1), 1) AS temperatur,
    if(rand() % 100 = 0, round(randExponential(7), 1), 0) AS regen
FROM numbers(4 * 60 * 24 * 1826);
```

Was die Teile bewirken:

- `LowCardinality(String)` – für Spalten mit wenigen verschiedenen Texten. ClickHouse speichert jeden Ortsnamen nur einmal und in der Tabelle nur eine kleine Nummer.
- `ENGINE = MergeTree` – die übliche Speicherart von ClickHouse für große Tabellen.
- `ORDER BY (station, zeit)` – die Zeilen liegen nach Ort und Zeit sortiert auf der Festplatte. Abfragen, die nach Ort oder Zeitraum filtern, müssen dadurch nur einen kleinen Teil lesen.
- `numbers(…)` – liefert die Zahlen 0, 1, 2 … bis zur angegebenen Anzahl. Daraus werden Zeit und Ort berechnet: 4 Orte × 60 Minuten × 24 Stunden × 1826 Tage.
- `temperatur` – im Jahresverlauf zwischen etwa 1 °C im Januar und 19 °C im Juli, nachts kühler als nachmittags, dazu etwas Zufall.
- `regen` – in etwa jeder hundertsten Minute fällt eine zufällige Regenmenge, im Jahr kommen so gut 700 mm zusammen.

### 20. SQL-Datei ausführen

`--multiquery` erlaubt mehrere Befehle hintereinander. `<` gibt den Inhalt der Datei an den Client weiter.

```bash
clickhouse-client --multiquery < wetter.sql
```

Das dauert nur ein bis zwei Sekunden.

### 21. Zeilen zählen

```bash
clickhouse-client -q "SELECT count() FROM uebung.wetter"
```

**Prüfen:** Die Antwort lautet `10517760`.

### 22. Platzbedarf ansehen

Die Tabelle `system.parts` beschreibt, wie ClickHouse die Daten auf der Festplatte abgelegt hat.

```bash
clickhouse-client -q "SELECT formatReadableSize(sum(data_compressed_bytes)) AS gepackt, formatReadableSize(sum(data_uncompressed_bytes)) AS entpackt FROM system.parts WHERE database = 'uebung' AND active"
```

**Prüfen:** Es erscheinen zwei Größen, etwa `68 MiB` gepackt und `91 MiB` entpackt. Die Zufallswerte lassen sich schlecht packen. Echte Messwerte, die sich von Minute zu Minute wenig ändern, schrumpfen meist auf einen Bruchteil.

## Auswerten

Ab hier weichen die Zahlen bei dir leicht ab, weil die Messwerte zufällig erzeugt wurden.

### 23. Kommandozeile öffnen

Ohne `-q` öffnet `clickhouse-client` eine Eingabezeile. Ergebnisse erscheinen dort als Tabelle, darunter steht, wie lange die Abfrage gedauert hat.

```bash
clickhouse-client
```

**Prüfen:** Es erscheint `Connected to ClickHouse server version 26.8.15.` und darunter die Eingabezeile mit dem Rechnernamen und `:)`. Eine Warnung zu `Delay accounting` kannst du übergehen. Sie betrifft nur eine Messgröße für Wartezeiten der Festplatte.

Die Abfragen der nächsten Schritte fügst du jeweils komplett ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>) und drückst dann <kbd>Enter</kbd>.

### 24. Kennzahlen je Ort berechnen

ClickHouse rechnet hier über alle 10,5 Millionen Zeilen.

```sql
SELECT station,
       round(avg(temperatur), 1) AS mittel,
       min(temperatur)           AS tiefster,
       max(temperatur)           AS hoechster,
       round(sum(regen) / 5)     AS regen_pro_jahr
FROM uebung.wetter
GROUP BY station
ORDER BY station;
```

**Prüfen:** Es erscheinen vier Zeilen mit einem Mittel von etwa 10 °C und rund 730 mm Regen pro Jahr. Unter der Tabelle steht `Elapsed:` mit einer Zeit von meist unter 0,1 Sekunden.

### 25. Monatsmittel für einen Ort berechnen

`toMonth` macht aus jedem Zeitpunkt die Nummer des Monats.

```sql
SELECT toMonth(zeit) AS monat,
       round(avg(temperatur), 1) AS mittel
FROM uebung.wetter
WHERE station = 'Ahrensburg'
GROUP BY monat
ORDER BY monat;
```

**Prüfen:** Das Mittel steigt von etwa 1,4 °C im Januar auf etwa 18,6 °C im Juni und Juli und fällt danach wieder. Unter der Tabelle steht `Processed 2.63 million rows`: ClickHouse hat nur ein Viertel der Tabelle gelesen. Weil die Zeilen nach Ort sortiert gespeichert sind (`ORDER BY` in Schritt 19), findet es die Werte für Ahrensburg, ohne die anderen Orte durchzusehen.

### 26. Sommertage im Jahr 2025 zählen

Ein Sommertag ist ein Tag mit mindestens 25 °C. Die innere Abfrage ermittelt den Höchstwert jedes Tages, die äußere zählt mit `countIf` nur die Tage, die die Bedingung erfüllen.

```sql
SELECT station,
       countIf(hoechst >= 25) AS sommertage
FROM
(
    SELECT station, toDate(zeit) AS tag, max(temperatur) AS hoechst
    FROM uebung.wetter
    WHERE toYear(zeit) = 2025
    GROUP BY station, tag
)
GROUP BY station
ORDER BY station;
```

**Prüfen:** Je Ort erscheinen etwa 40 bis 55 Sommertage.

### 27. Kommandozeile verlassen

```text
exit
```

## Daten aus einer CSV-Datei laden

### 28. CSV-Datei anlegen

```bash
nano stationen.csv
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
station,kreis,hoehe
Ahrensburg,Stormarn,25
Bargteheide,Stormarn,41
Hamburg,Hamburg,6
Lübeck,Lübeck,13
```

### 29. Tabelle für die Stationen anlegen

`UInt16` ist eine ganze Zahl ohne Vorzeichen bis 65535, das reicht für die Höhe in Metern.

```bash
clickhouse-client -q "CREATE TABLE uebung.stationen (station String, kreis String, hoehe UInt16) ENGINE = MergeTree ORDER BY station"
```

### 30. CSV-Datei laden

`FORMAT CSVWithNames` sagt ClickHouse, dass die Daten als CSV mit einer Kopfzeile kommen.

```bash
clickhouse-client -q "INSERT INTO uebung.stationen FORMAT CSVWithNames" < stationen.csv
```

### 31. Beide Tabellen verbinden

`JOIN` verknüpft jede Messung über den Ortsnamen mit den Angaben zur Station.

```bash
clickhouse-client -q "SELECT s.kreis, w.station, s.hoehe, round(sum(w.regen) / 5) AS regen_pro_jahr FROM uebung.wetter AS w JOIN uebung.stationen AS s ON w.station = s.station GROUP BY s.kreis, w.station, s.hoehe ORDER BY s.kreis, w.station" --format PrettyCompact
```

**Prüfen:** Es erscheinen vier Zeilen. Ahrensburg und Bargteheide stehen beide beim Kreis `Stormarn`. `--format PrettyCompact` zeichnet die Tabelle mit Rahmen, ohne die Angabe gibt `-q` die Werte nur durch Tabulatoren getrennt aus.

## Weboberfläche

### 32. SQL-Seite im Browser öffnen

ClickHouse bringt eine einfache Seite mit, auf der man Abfragen eingeben und als Tabelle ansehen kann. Öffne im Browser:

```text
http://127.0.0.1:8123/play
```

Trage oben rechts als Benutzer `default` und das Passwort aus Schritt 6 ein. Gib dann z. B. `SELECT * FROM uebung.stationen` ein und klicke auf **Run**.

**Prüfen:** Unter dem Eingabefeld erscheinen die vier Stationen.

## Sichern und wiederherstellen

Eine einfache Sicherung ist der Export einer Tabelle in eine Datei im Format *Parquet*. Das Format ist verbreitet und gepackt, [DuckDB](duckdb.md), Python mit pandas und viele andere Programme können es direkt lesen.

### 33. Tabelle exportieren

```bash
clickhouse-client -q "SELECT * FROM uebung.wetter FORMAT Parquet" > wetter.parquet
```

**Prüfen:** Die Datei ist rund 54 MB groß.

```bash
ls -lh wetter.parquet
```

### 34. Tabelle leeren

Nur zum Ausprobieren der Wiederherstellung: `TRUNCATE` löscht alle Zeilen, die Tabelle selbst bleibt bestehen.

```bash
clickhouse-client -q "TRUNCATE TABLE uebung.wetter"
```

### 35. Sicherung zurückspielen

```bash
clickhouse-client -q "INSERT INTO uebung.wetter FORMAT Parquet" < wetter.parquet
```

**Prüfen:** Der Befehl aus Schritt 21 meldet wieder `10517760`.

Die Tabellenbeschreibung ist in der Parquet-Datei nicht vollständig enthalten. Für eine neue Datenbank legst du die Tabelle deshalb zuerst wie in Schritt 19 an und spielst dann die Daten ein.

## Optional: Autostart ausschalten

Wer ClickHouse nur ab und zu braucht, nimmt es aus dem Systemstart heraus und startet es bei Bedarf mit `sudo systemctl start clickhouse-server`.

```bash
sudo systemctl disable --now clickhouse-server
```

## Wie geht es weiter?

- **Eigene Benutzer:** Für Programme legt man mit `CREATE USER` eigene Benutzer an und gibt ihnen mit `GRANT` nur die nötigen Rechte, statt überall `default` zu verwenden.
- **Ohne Server:** `clickhouse-local` (im Paket enthalten) wertet CSV-, JSON- oder Parquet-Dateien mit derselben SQL-Sprache aus, ohne dass der Dienst laufen muss.
- **Aus Programmen zugreifen:** Es gibt offizielle Bibliotheken für [Python](python.md) (`clickhouse-connect`), [Go](go.md), [Java](java.md) und [JavaScript](javascript.md). Alle nutzen Port 8123 oder 9000.
- **Zugriff aus dem Netz:** Dafür wird in einer Datei in `config.d` die Einstellung `listen_host` geändert. Die Ports sollten dann per Firewall nur für bekannte Rechner offen sein.
- **Dokumentation:** Die SQL-Befehle und Funktionen sind unter <https://clickhouse.com/docs/sql-reference> beschrieben.

## Deinstallieren

### 1. Übungsordner und Einstellungsdatei löschen

```bash
rm -rf ~/clickhouse-uebung ~/.clickhouse-client
```

### 2. Dienst anhalten

```bash
sudo systemctl stop clickhouse-server
```

### 3. ClickHouse entfernen

```bash
sudo apt purge clickhouse-server clickhouse-client clickhouse-common-static
```

### 4. Übrige Dateien löschen

Die Pakete von ClickHouse räumen beim Entfernen nicht vollständig auf. `apt` meldet deshalb, dass `/etc/clickhouse-server` nicht leer ist. Dieser Befehl löscht die Konfiguration, die Datenbanken, die Protokolle, die Einstellung für die Zahl offener Dateien und zwei Verknüpfungen in `/usr/bin`, die bei der Installation angelegt wurden. **Achtung:** Alle Daten in ClickHouse sind danach unwiderruflich weg.

```bash
sudo rm -rf /etc/clickhouse-server /etc/clickhouse-keeper /var/lib/clickhouse /var/log/clickhouse-server /var/log/clickhouse-keeper /etc/security/limits.d/clickhouse.conf /usr/bin/clickhouse-disks /usr/bin/clickhouse-git-import
```

### 5. Systembenutzer entfernen

Die Installation hat für den Dienst den Benutzer `clickhouse` und eine gleichnamige Gruppe angelegt. Die Gruppe wird mit dem Benutzer entfernt.

```bash
sudo deluser clickhouse
```

### 6. Paketquelle und Schlüssel löschen

```bash
sudo rm /etc/apt/sources.list.d/clickhouse.sources /etc/apt/keyrings/clickhouse.asc
```

### 7. Paketlisten aktualisieren

Danach kennt `apt` die Pakete von ClickHouse nicht mehr.

```bash
sudo apt update
```

**Prüfen:** Der Befehl `clickhouse-client` wird nicht mehr gefunden.

```bash
clickhouse-client --version
```
