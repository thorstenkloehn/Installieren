# SQLite

SQLite ist eine kleine SQL-Datenbank, die ohne Server auskommt: Die ganze Datenbank steckt in einer einzigen Datei. Sie eignet sich für Übungen, Werkzeuge, Desktop-Programme und kleinere Webseiten. Viele Programme bringen SQLite bereits mit, etwa Browser oder [Python](python.md). Diese Anleitung installiert das Kommandozeilenprogramm `sqlite3` und zeigt, wie man damit Datenbanken anlegt, abfragt und sichert.

## Vorbemerkungen

- **Kein Dienst, kein Passwort:** Anders als bei [PostgreSQL](postgresql.md) oder [MariaDB](mariadb.md) läuft im Hintergrund nichts. Wer eine Datenbankdatei lesen und schreiben darf, darf auch die Daten lesen und ändern. Die Rechte regelt also allein das Dateisystem.
- **Bibliothek schon vorhanden:** Die Bibliothek `libsqlite3-0` ist auf Ubuntu fast immer schon installiert, weil viele Programme sie nutzen. Neu kommt nur das Paket `sqlite3` mit dem Kommandozeilenprogramm dazu.
- **Zwei Eigenheiten:** SQLite prüft Fremdschlüssel nur, wenn man es ausdrücklich einschaltet. Außerdem nimmt es in normalen Tabellen auch Werte des falschen Typs an, etwa Text in einer Zahlenspalte. Beides lässt sich abstellen. Die Anleitung zeigt, wie.
- **Version:** Getestet mit SQLite **3.46.1** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. SQLite installieren

Installiert das Kommandozeilenprogramm `sqlite3`.

```bash
sudo apt install sqlite3
```

**Prüfen:** Die Ausgabe beginnt mit `3.46.1`.

```bash
sqlite3 --version
```

## Einstellungen für die Konsole

Beim Start liest `sqlite3` die Datei `~/.sqliterc` und führt die Befehle darin aus. Dort legen wir eine übersichtliche Tabellenanzeige fest und schalten die Prüfung der Fremdschlüssel ein.

### 3. Einstellungsdatei anlegen

```bash
nano ~/.sqliterc
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```text
.headers on
.mode box
PRAGMA foreign_keys = ON;
```

- **`.headers on`** – zeigt über den Ergebnissen die Spaltennamen.
- **`.mode box`** – zeichnet Ergebnisse als Tabelle mit Rahmen. Ohne diese Zeile trennt `sqlite3` die Spalten nur mit `|`.
- **`PRAGMA foreign_keys = ON;`** – lässt SQLite prüfen, ob Verweise zwischen Tabellen stimmen. Die Einstellung gilt nur für die laufende Sitzung und muss deshalb bei jedem Start gesetzt werden.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

## Datenbank anlegen und füllen

### 4. Übungsordner anlegen

```bash
mkdir ~/sqlite-uebung
```

### 5. In den Ordner wechseln

```bash
cd ~/sqlite-uebung
```

### 6. SQL-Datei anlegen

Die Datei beschreibt zwei Tabellen für einen kleinen Fahrradladen, Modelle und Verkäufe, und füllt sie mit Beispieldaten.

```bash
nano laden.sql
```

Füge diesen Inhalt ein:

```sql
-- Tabellen für einen kleinen Fahrradladen

CREATE TABLE modell (
    id     INTEGER PRIMARY KEY,
    name   TEXT NOT NULL UNIQUE,
    preis  REAL NOT NULL,
    lager  INTEGER NOT NULL DEFAULT 0
) STRICT;

CREATE TABLE verkauf (
    id         INTEGER PRIMARY KEY,
    modell_id  INTEGER NOT NULL REFERENCES modell(id),
    anzahl     INTEGER NOT NULL,
    datum      TEXT NOT NULL
) STRICT;

INSERT INTO modell (name, preis, lager) VALUES
    ('Citybike', 699.00, 4),
    ('Trekkingrad', 899.00, 0),
    ('Lastenrad', 3490.00, 1);

INSERT INTO verkauf (modell_id, anzahl, datum) VALUES
    (1, 2, '2026-09-01'),
    (3, 1, '2026-09-02'),
    (1, 3, '2026-09-02'),
    (2, 1, '2026-09-05'),
    (1, 1, '2026-09-08');
```

- **`INTEGER PRIMARY KEY`** – SQLite vergibt für jede neue Zeile selbst eine fortlaufende Nummer.
- **`STRICT`** – die Tabelle nimmt nur Werte des angegebenen Typs an. Ohne diesen Zusatz würde SQLite zum Beispiel den Text `'teuer'` als Preis speichern.
- **`REFERENCES modell(id)`** – jeder Verkauf muss auf ein vorhandenes Modell verweisen (Fremdschlüssel).
- **Datum als `TEXT`** – SQLite hat keinen eigenen Datumstyp. Daten in der Form `JJJJ-MM-TT` lassen sich trotzdem richtig sortieren und vergleichen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. Datenbank erzeugen

Gibt es die Datei `laden.db` noch nicht, legt `sqlite3` sie an. `<` reicht die SQL-Datei als Eingabe weiter.

```bash
sqlite3 laden.db < laden.sql
```

**Prüfen:** Es erscheint keine Meldung, und im Ordner liegt jetzt die Datei `laden.db`.

```bash
ls -l laden.db
```

## Mit der Datenbank arbeiten

### 8. Konsole öffnen

```bash
sqlite3 laden.db
```

**Prüfen:** Die Eingabezeile lautet `sqlite>`.

### 9. Tabellen anzeigen

Befehle, die mit einem Punkt beginnen, sind Befehle der Konsole selbst und brauchen kein Semikolon.

```text
.tables
```

**Prüfen:** Die Ausgabe nennt `modell` und `verkauf`.

### 10. Lieferbare Modelle abfragen

SQL-Befehle enden dagegen mit einem Semikolon.

```sql
SELECT name, preis, lager FROM modell WHERE lager > 0 ORDER BY preis;
```

**Prüfen:** Die Tabelle nennt Citybike (699.0, 4) und Lastenrad (3490.0, 1).

### 11. Umsatz je Modell berechnen

`JOIN` verbindet die Verkäufe mit den Modellen, `GROUP BY` fasst die Zeilen je Modell zusammen.

```sql
SELECT m.name, SUM(v.anzahl) AS stueck, SUM(v.anzahl * m.preis) AS umsatz
FROM verkauf v JOIN modell m ON m.id = v.modell_id
GROUP BY m.name ORDER BY umsatz DESC;
```

**Prüfen:** Die Ausgabe lautet:

```text
┌─────────────┬────────┬────────┐
│    name     │ stueck │ umsatz │
├─────────────┼────────┼────────┤
│ Citybike    │ 6      │ 4194.0 │
│ Lastenrad   │ 1      │ 3490.0 │
│ Trekkingrad │ 1      │ 899.0  │
└─────────────┴────────┴────────┘
```

### 12. Fremdschlüssel ausprobieren

Ein Verkauf zu einem Modell mit der Nummer 99, das es nicht gibt:

```sql
INSERT INTO verkauf (modell_id, anzahl, datum) VALUES (99, 1, '2026-09-10');
```

**Prüfen:** SQLite lehnt ab mit `FOREIGN KEY constraint failed`. Fehlt die Zeile `PRAGMA foreign_keys = ON;` in `~/.sqliterc`, wird der falsche Verkauf ohne Meldung gespeichert.

### 13. Falschen Typ ausprobieren

Ein Preis aus Buchstaben statt einer Zahl:

```sql
INSERT INTO modell (name, preis) VALUES ('Rennrad', 'teuer');
```

**Prüfen:** SQLite lehnt ab mit `cannot store TEXT value in REAL column modell.preis`. Das bewirkt der Zusatz `STRICT`.

### 14. Konsole verlassen

```text
.quit
```

## Ohne Konsole abfragen

### 15. Einen Befehl direkt ausführen

Steht der SQL-Befehl in Anführungszeichen hinter dem Dateinamen, führt `sqlite3` nur ihn aus und beendet sich. Das ist praktisch in Skripten.

```bash
sqlite3 laden.db "SELECT COUNT(*) AS verkaeufe FROM verkauf;"
```

**Prüfen:** Die Ausgabe zeigt die Zahl `5`.

### 16. Tabelle als CSV-Datei ausgeben

`-csv` schreibt die Spalten durch Kommas getrennt. So lassen sich Daten zum Beispiel in LibreOffice Calc öffnen. `>` leitet die Ausgabe in eine Datei um.

```bash
sqlite3 -csv laden.db "SELECT * FROM modell;" > modelle.csv
```

**Prüfen:** Die erste Zeile der Datei enthält die Spaltennamen `id,name,preis,lager`.

```bash
head -2 modelle.csv
```

## Sichern und wiederherstellen

### 17. Datenbank als Kopie sichern

`.backup` erstellt eine vollständige Kopie der Datenbank. Anders als ein einfaches `cp` ist das auch dann sicher, wenn gerade ein anderes Programm in die Datenbank schreibt.

```bash
sqlite3 laden.db ".backup sicherung.db"
```

**Prüfen:** Die Kopie enthält dieselben Tabellen.

```bash
sqlite3 sicherung.db ".tables"
```

### 18. Datenbank als SQL-Text sichern

`.dump` schreibt Tabellen und Inhalte als SQL-Befehle. Diese Form lässt sich mit jedem Texteditor lesen und gut mit Git verwalten.

```bash
sqlite3 laden.db ".dump" > sicherung.sql
```

**Prüfen:** Die Datei enthält acht Befehle `INSERT INTO`, einen für jede Zeile.

```bash
grep -c "INSERT INTO" sicherung.sql
```

### 19. Aus der SQL-Sicherung wiederherstellen

Legt aus der Textsicherung eine neue Datenbankdatei an.

```bash
sqlite3 wiederhergestellt.db < sicherung.sql
```

**Prüfen:** Die neue Datenbank enthält wieder fünf Verkäufe.

```bash
sqlite3 wiederhergestellt.db "SELECT COUNT(*) FROM verkauf;"
```

## Wie geht es weiter?

- **Aus Programmen zugreifen:** [Python](python.md) bringt das Modul `sqlite3` schon mit (`import sqlite3`), für [PHP](php.md) gibt es das Paket `php-sqlite3`. Auch dort muss `PRAGMA foreign_keys = ON` nach jedem Öffnen gesetzt werden, denn `~/.sqliterc` gilt nur für die Konsole.
- **Grafisches Werkzeug:** Das Programm „DB Browser for SQLite“ (`sudo apt install sqlitebrowser`) zeigt Tabellen im Fenster und lässt sie bearbeiten.
- **Hilfe in der Konsole:** `.help` listet alle Punkt-Befehle auf, `man sqlite3` zeigt die Optionen des Programms.
- **Dokumentation:** SQL-Referenz und Hinweise zu den Eigenheiten von SQLite unter <https://sqlite.org/docs.html>.

## Deinstallieren

### 1. Übungsordner entfernen

```bash
rm -rf ~/sqlite-uebung
```

### 2. Einstellungsdatei entfernen

```bash
rm -f ~/.sqliterc
```

### 3. SQLite entfernen

Entfernt nur das Kommandozeilenprogramm. Die Bibliothek `libsqlite3-0` bleibt installiert, weil viele andere Programme sie brauchen.

```bash
sudo apt purge sqlite3
```

**Prüfen:** Der Befehl `sqlite3` wird nicht mehr gefunden.

```bash
sqlite3 --version
```
