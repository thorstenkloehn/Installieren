# DuckDB

DuckDB ist eine Datenbank für Auswertungen, die ohne Server auskommt. Sie läuft als einzelnes Programm, liest CSV-, JSON- und Parquet-Dateien direkt ein und rechnet auch über Millionen Zeilen in kurzer Zeit Summen, Mittelwerte und Kreuztabellen aus. Damit eignet sie sich gut, um Messwerte, Exporte oder Statistiken mit SQL zu untersuchen, ohne vorher eine Datenbank einzurichten.

## Vorbemerkungen

- **Warum nicht apt:** Ubuntu 26.04 enthält kein Paket für DuckDB. Diese Anleitung nimmt deshalb die fertige Programmdatei, die das DuckDB-Projekt auf GitHub veröffentlicht, und legt sie nach `/usr/local/bin`. Dort liegen selbst installierte Programme getrennt von den Paketen aus apt. Das Installationsskript von der DuckDB-Website erledigt dasselbe, ist aber nicht nötig.
- **Kein Dienst:** DuckDB startet keinen Hintergrunddienst und öffnet keinen Port. Eine Datenbank ist eine einzelne Datei, ähnlich wie bei [SQLite](sqlite.md).
- **SQLite oder DuckDB:** SQLite ist für viele kleine Lese- und Schreibzugriffe gebaut, etwa als Speicher einer Anwendung. DuckDB ist für Auswertungen gebaut, bei denen wenige Abfragen große Datenmengen durchrechnen.
- **Version:** Getestet mit DuckDB **1.5.6**. Steht auf der [Release-Seite](https://github.com/duckdb/duckdb/releases/latest) eine neuere Version, ersetzt du `v1.5.6` in den Befehlen durch die neue Nummer.

## Installation

### 1. Paketlisten aktualisieren

So kennt `apt` die neuesten Paketversionen.

```bash
sudo apt update
```

### 2. curl und unzip installieren

`curl` lädt die Datei herunter, `unzip` packt sie aus. Sind beide schon vorhanden, meldet `apt` nur, dass sie bereits in der neuesten Version installiert sind.

```bash
sudo apt install curl unzip
```

### 3. Archiv herunterladen

Lädt die Fassung für Linux auf 64-Bit-Intel/AMD-Prozessoren nach `/tmp`. `-L` sorgt dafür, dass `curl` der Weiterleitung von GitHub zur eigentlichen Datei folgt.

```bash
curl -L -o /tmp/duckdb.zip https://github.com/duckdb/duckdb/releases/download/v1.5.6/duckdb_cli-linux-amd64.zip
```

**Prüfen:** Die Datei ist rund 21 MB groß.

```bash
ls -lh /tmp/duckdb.zip
```

### 4. Prüfsumme kontrollieren

Mit der Prüfsumme stellst du fest, ob die Datei vollständig und unverändert angekommen ist.

```bash
sha256sum /tmp/duckdb.zip
```

**Prüfen:** Bei Version 1.5.6 lautet der Wert `6e89deac1ebbc36eed0291caf8b567b030c7b86ac35998f71854e22b3c5d5e2f`. Bei einer neueren Version vergleichst du ihn mit dem Wert `sha256:…`, den GitHub auf der Release-Seite unter „Assets“ neben `duckdb_cli-linux-amd64.zip` anzeigt.

### 5. Programm auspacken

Das Archiv enthält nur die Programmdatei `duckdb`. `-d` gibt den Zielordner an.

```bash
sudo unzip /tmp/duckdb.zip duckdb -d /usr/local/bin
```

**Prüfen:** Die Versionsnummer `v1.5.6` erscheint.

```bash
duckdb --version
```

### 6. Archiv löschen

```bash
rm /tmp/duckdb.zip
```

## Eine CSV-Datei auswerten

Als Beispiel dienen Stromzählerstände eines Haushalts: täglicher Verbrauch in Kilowattstunden für das Haus und eine Garage mit Wallbox.

### 7. Übungsordner anlegen

```bash
mkdir ~/duckdb-uebung
```

### 8. In den Ordner wechseln

```bash
cd ~/duckdb-uebung
```

### 9. CSV-Datei anlegen

```bash
nano strom.csv
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```text
datum,zaehler,kwh
2026-07-01,Haus,9.4
2026-07-01,Garage,2.1
2026-07-02,Haus,8.7
2026-07-02,Garage,0.0
2026-08-01,Haus,7.9
2026-08-01,Garage,3.5
2026-08-02,Haus,8.2
2026-08-02,Garage,1.2
2026-09-01,Haus,10.6
2026-09-01,Garage,2.8
2026-09-02,Haus,11.3
2026-09-02,Garage,0.4
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Datei direkt abfragen

`-c` führt einen einzelnen SQL-Befehl aus und beendet DuckDB danach. Der Dateiname in einfachen Anführungszeichen wird wie eine Tabelle behandelt; ein Import ist nicht nötig.

```bash
duckdb -c "SELECT * FROM 'strom.csv' LIMIT 3;"
```

**Prüfen:** Es erscheinen die ersten drei Zeilen. Unter den Spaltennamen steht, welchen Typ DuckDB selbst erkannt hat: `date` für das Datum, `varchar` für Text und `double` für die Kommazahlen.

### 11. Verbrauch je Monat berechnen

`strftime` macht aus dem Datum einen Monat wie `2026-07`. `GROUP BY ALL` gruppiert nach allen Spalten, die nicht zusammengerechnet werden, `ORDER BY ALL` sortiert nach allen Spalten. `round(…, 1)` rundet auf eine Nachkommastelle, denn Kommazahlen vom Typ `double` hinterlassen beim Addieren sonst Reste wie `3.1999999999999997`.

```bash
duckdb -c "SELECT strftime(datum, '%Y-%m') AS monat, zaehler, round(sum(kwh), 1) AS kwh FROM 'strom.csv' GROUP BY ALL ORDER BY ALL;"
```

**Prüfen:** Die Ausgabe enthält sechs Zeilen, beginnend mit `2026-07 │ Garage │ 2.1` und `2026-07 │ Haus │ 18.1`.

## Eine Datenbankdatei verwenden

Für wiederholte Auswertungen lohnt es sich, die Daten in eine Datenbankdatei zu übernehmen. DuckDB legt sie beim ersten Aufruf selbst an.

### 12. Tabelle aus der CSV-Datei erzeugen

`haushalt.duckdb` ist der Name der Datenbankdatei. `CREATE TABLE … AS SELECT` legt eine Tabelle an und füllt sie mit dem Ergebnis der Abfrage.

```bash
duckdb haushalt.duckdb -c "CREATE TABLE strom AS SELECT * FROM 'strom.csv';"
```

**Prüfen:** Im Ordner liegt jetzt die Datei `haushalt.duckdb`.

```bash
ls -l
```

### 13. Konsole öffnen

Ohne `-c` startet DuckDB eine Konsole. Die Eingabezeile beginnt mit `D`.

```bash
duckdb haushalt.duckdb
```

### 14. Tabellen anzeigen

Befehle mit einem Punkt am Anfang steuern die Konsole selbst und brauchen kein Semikolon.

```text
.tables
```

**Prüfen:** Ein Kasten zeigt die Tabelle `strom` mit den Spalten `datum`, `zaehler`, `kwh` und `12 rows`.

### 15. Kreuztabelle erstellen

`PIVOT` macht aus den Werten der Spalte `zaehler` eigene Spalten. So stehen Haus und Garage nebeneinander.

```sql
PIVOT (SELECT strftime(datum, '%Y-%m') AS monat, zaehler, kwh FROM strom)
ON zaehler USING round(sum(kwh), 1) ORDER BY monat;
```

**Prüfen:** Die Ausgabe lautet:

```text
┌─────────┬────────┬────────┐
│  monat  │ Garage │  Haus  │
│ varchar │ double │ double │
├─────────┼────────┼────────┤
│ 2026-07 │    2.1 │   18.1 │
│ 2026-08 │    4.7 │   16.1 │
│ 2026-09 │    3.2 │   21.9 │
└─────────┴────────┴────────┘
```

### 16. Ergebnis als Parquet-Datei speichern

Parquet ist ein kompaktes Dateiformat für Tabellen, das viele Analysewerkzeuge lesen können, etwa Python mit pandas oder Polars. `COPY … TO` schreibt das Ergebnis einer Abfrage in eine Datei.

```sql
COPY (SELECT * FROM strom WHERE zaehler = 'Haus') TO 'haus.parquet' (FORMAT parquet);
```

### 17. Konsole verlassen

```text
.quit
```

### 18. Parquet-Datei abfragen

Auch Parquet-Dateien lassen sich direkt mit SQL lesen.

```bash
duckdb -c "SELECT round(avg(kwh), 2) AS schnitt, max(kwh) AS hoechster FROM 'haus.parquet';"
```

**Prüfen:** Die Ausgabe nennt `9.35` als Durchschnitt und `11.3` als höchsten Tagesverbrauch des Hauses.

## Aktualisieren

### 1. Neue Version herunterladen

Ersetze `v1.5.6` durch die Nummer der neuen Version.

```bash
curl -L -o /tmp/duckdb.zip https://github.com/duckdb/duckdb/releases/download/v1.5.6/duckdb_cli-linux-amd64.zip
```

### 2. Prüfsumme kontrollieren

Vergleiche den Wert mit der Angabe auf der Release-Seite.

```bash
sha256sum /tmp/duckdb.zip
```

### 3. Programm ersetzen

`-o` überschreibt die vorhandene Datei ohne Rückfrage.

```bash
sudo unzip -o /tmp/duckdb.zip duckdb -d /usr/local/bin
```

**Prüfen:** `duckdb --version` zeigt die neue Nummer. Datenbankdateien älterer Versionen kann eine neuere Version in der Regel öffnen. Umgekehrt klappt das nicht immer. Sichere wichtige Datenbanken deshalb vorher, zum Beispiel mit `EXPORT DATABASE 'sicherung';` in der Konsole.

### 4. Archiv löschen

```bash
rm /tmp/duckdb.zip
```

## Wie geht es weiter?

- **Python:** In einer [virtuellen Umgebung](python.md) installiert `pip install duckdb` die Bibliothek. Damit lassen sich SQL-Abfragen und pandas-Tabellen mischen.
- **Erweiterungen:** Für weitere Formate und Quellen, etwa Excel-Dateien, Dateien aus dem Internet oder eine [PostgreSQL](postgresql.md)-Datenbank, lädt DuckDB beim ersten Gebrauch Erweiterungen aus dem Internet nach. Sie landen im Ordner `~/.duckdb`.
- **Dokumentation:** Handbuch und SQL-Referenz unter <https://duckdb.org/docs/>.

## Deinstallieren

### 1. Programm löschen

DuckDB besteht nur aus dieser einen Datei.

```bash
sudo rm /usr/local/bin/duckdb
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
duckdb --version
```

### 2. Übungsordner löschen

```bash
rm -rf ~/duckdb-uebung
```

### 3. Erweiterungen und Verlauf löschen (optional)

`~/.duckdb` enthält nachgeladene Erweiterungen, `~/.duckdb_history` die in der Konsole eingegebenen Befehle. Beide gibt es nur, wenn sie entstanden sind; sonst meldet `rm` nichts.

```bash
rm -rf ~/.duckdb ~/.duckdb_history
```
