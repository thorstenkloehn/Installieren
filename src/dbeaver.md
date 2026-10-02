# DBeaver

DBeaver ist ein grafisches Programm zum Arbeiten mit Datenbanken. Mit ihm sieht man Tabellen und ihre Inhalte, schreibt SQL-Abfragen mit Hilfe der automatischen Ergänzung, ändert Daten wie in einer Tabellenkalkulation und exportiert Ergebnisse als CSV oder Excel-Datei. Die freie *Community Edition* versteht fast alle verbreiteten Datenbanken, darunter [PostgreSQL](postgresql.md), [MariaDB](mariadb.md), [MySQL](mysql.md), [SQLite](sqlite.md), [DuckDB](duckdb.md) und [ClickHouse](clickhouse.md). So genügt ein Werkzeug für alle Datenbanken in diesem Buch.

## Vorbemerkungen

- **Warum nicht apt aus Ubuntu:** Ubuntu 26.04 enthält kein Paket für DBeaver. Der Hersteller betreibt aber ein eigenes, signiertes apt-Archiv. Nach dem Einbinden installiert und aktualisiert `apt` DBeaver wie jedes andere Paket. Daneben gibt es DBeaver als Snap (`dbeaver-ce`), diese Anleitung nimmt das apt-Archiv.
- **Java ist dabei:** DBeaver ist in Java geschrieben, bringt aber eine eigene Java-Laufzeit mit. Ein vorhandenes Java aus der Anleitung [Java](java.md) wird weder gebraucht noch verändert.
- **Treiber aus dem Internet:** Für jede Datenbankart braucht DBeaver einen Treiber. Er lädt ihn beim ersten Verbinden mit dieser Datenbankart aus dem Internet nach.
- **Teilweise deutsch:** Viele Menüs und Dialoge sind übersetzt, manche erscheinen auf Englisch. Die Anleitung nennt bei Bedarf beide Bezeichnungen.
- **Version:** Installation getestet mit DBeaver Community **26.2.1** am 2. Oktober 2026. Die Bedienung der Oberfläche ab Schritt 9 ist nicht selbst getestet, sie beruht auf der Dokumentation und den Texten im Programm.

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

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich vom Hersteller stammen und unterwegs nicht verändert wurden. Mit der Endung `.asc` kann `apt` ihn direkt lesen.

```bash
sudo wget -O /etc/apt/keyrings/dbeaver.asc https://dbeaver.io/debs/dbeaver.gpg.key
```

**Prüfen:** Die erste Zeile lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -n 1 /etc/apt/keyrings/dbeaver.asc
```

### 4. Paketquelle eintragen

Legt eine neue Datei an, die `apt` als zusätzliche Paketquelle liest.

```bash
sudo nano /etc/apt/sources.list.d/dbeaver.sources
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://dbeaver.io/debs/dbeaver-ce
Suites: /
Architectures: amd64
Signed-By: /etc/apt/keyrings/dbeaver.asc
```

Das Archiv von DBeaver ist ein sogenanntes *flaches Archiv*: Alle Pakete liegen direkt in einem Ordner, ohne Unterteilung nach Ubuntu-Versionen. Deshalb steht bei `Suites` nur ein Schrägstrich, und die sonst übliche Zeile `Components` entfällt.

### 5. Paketlisten neu einlesen

Erst jetzt lädt `apt` das Paketverzeichnis von DBeaver herunter.

```bash
sudo apt update
```

**Prüfen:** In der Ausgabe erscheint eine Zeile mit `https://dbeaver.io/debs/dbeaver-ce  InRelease`, und der Installationskandidat ist eine Version wie `26.2.1`.

```bash
apt policy dbeaver-ce
```

## Installation

### 6. DBeaver installieren

Das Paket ist rund 130 MB groß und belegt ausgepackt etwa 200 MB. Es hat keine weiteren Abhängigkeiten.

```bash
sudo apt install dbeaver-ce
```

### 7. Version prüfen

DBeaver legt keinen Befehl im Suchpfad an, sondern installiert sich nach `/usr/share/dbeaver-ce`. Die Versionsnummer steht in einer kleinen Textdatei.

```bash
grep version /usr/share/dbeaver-ce/.eclipseproduct
```

**Prüfen:** Es erscheint `version=26.2.1` oder eine höhere Nummer.

### 8. Mitgeliefertes Java prüfen (optional)

```bash
/usr/share/dbeaver-ce/jre/bin/java -version
```

**Prüfen:** Die erste Zeile nennt `openjdk version "25…"`. Diese Java-Version gehört nur zu DBeaver.

## Erste Schritte (nicht getestet)

Das Beispiel legt eine SQLite-Datenbank an. Dafür ist kein Datenbankserver nötig, und es gibt kein Passwort.

### 9. DBeaver starten

Öffne die Programmübersicht von Ubuntu, tippe `dbeaver` und klicke auf **dbeaver-ce**. Alternativ startet dieser Befehl DBeaver aus dem Terminal:

```bash
/usr/share/dbeaver-ce/dbeaver &
```

Das `&` am Ende gibt das Terminal sofort wieder frei.

### 10. Datenweitergabe ablehnen

Beim ersten Start fragt ein Dialog, ob DBeaver anonyme Nutzungsstatistiken senden darf (*Statistics collection* bzw. *Data collection*). Wähle **Do not share data** bzw. **Do not share anonymous usage statistics** und bestätige. Die Einstellung lässt sich später in den Einstellungen unter *General → Usage Statistics* ändern (englisch *Window → Preferences*, auf Deutsch je nach Übersetzung **Fenster → Einstellungen**).

Fragt DBeaver außerdem, ob eine Beispieldatenbank angelegt werden soll, kannst du das ablehnen.

### 11. Neue Verbindung beginnen

Klicke im Menü **Datenbank** auf **Neue Verbindung** (englisch *Database → New Database Connection*). Alternativ klickst du links oben im Bereich **Datenbanknavigator** auf das Steckersymbol mit dem Pluszeichen.

### 12. Datenbankart wählen

Es öffnet sich eine Liste mit Datenbanken. Tippe oben in das Suchfeld `SQLite`, markiere **SQLite** und klicke auf **Weiter**.

### 13. Datei für die Datenbank angeben

Trage bei **Pfad** (englisch *Path*) diese Datei ein und ersetze `BENUTZER` durch deinen Benutzernamen:

```text
/home/BENUTZER/dbeaver-uebung.db
```

Den eigenen Benutzernamen zeigt der Befehl `whoami` im Terminal. Gibt es die Datei noch nicht, legt SQLite sie beim ersten Verbinden an.

### 14. Treiber herunterladen

Klicke auf **Verbindung testen …** (*Test Connection*). Beim ersten Mal meldet DBeaver, dass Treiberdateien fehlen (**Datenbanktreiber herunterladen**). Bestätige mit **Herunterladen** (*Download*).

**Prüfen:** Nach dem Download meldet DBeaver eine erfolgreiche Verbindung (*Connected*). Schließe die Meldung und klicke auf **Fertigstellen** (*Finish*).

### 15. SQL-Editor öffnen

Markiere die neue Verbindung im Datenbanknavigator und drücke <kbd>Strg</kbd>+<kbd>]</kbd>. Alternativ wählst du im Menü **SQL-Editor → Neues SQL-Skript**.

### 16. Tabelle anlegen und füllen

Füge diesen Text in den SQL-Editor ein (<kbd>Strg</kbd>+<kbd>V</kbd>):

```sql
CREATE TABLE ausflug (
    id      INTEGER PRIMARY KEY,
    ziel    TEXT NOT NULL,
    km      REAL,
    datum   TEXT
);

INSERT INTO ausflug (ziel, km, datum) VALUES
    ('Hamfelder Hof',        6.5, '2026-09-06'),
    ('Großensee',           12.0, '2026-09-13'),
    ('Wildpark Schwarze Berge', 48.0, '2026-09-20');

SELECT ziel, km FROM ausflug ORDER BY km DESC;
```

Führe den ganzen Text als Skript aus: <kbd>Alt</kbd>+<kbd>X</kbd>.

**Prüfen:** Unten erscheint ein Ergebnisbereich mit den drei Zielen, das weiteste zuerst.

### 17. Eine einzelne Abfrage ausführen

Setze den Cursor in die Zeile mit `SELECT` und drücke <kbd>Strg</kbd>+<kbd>Enter</kbd>. Damit führt DBeaver nur die Anweisung aus, in der der Cursor steht.

### 18. Tabelle im Navigator ansehen

Klappe im Datenbanknavigator die Verbindung auf und öffne **Tabellen**. Ist `ausflug` noch nicht zu sehen, markiere die Verbindung und drücke <kbd>F5</kbd> zum Aktualisieren. Ein Doppelklick auf `ausflug` öffnet die Tabelle. Im Reiter **Daten** (*Data*) lassen sich Werte direkt ändern. Änderungen werden erst mit **Speichern** (*Save*) unten im Fenster in die Datenbank geschrieben.

### 19. Ergebnis exportieren

Klicke im Ergebnisbereich mit der rechten Maustaste und wähle **Daten exportieren …** (*Export data …*). Der Assistent bietet unter anderem CSV, Excel (XLSX), JSON und SQL-Anweisungen an.

## Verbindungen zu Datenbankservern

Für Server wie PostgreSQL, MariaDB oder ClickHouse gehst du wie in den Schritten 11 bis 14 vor und gibst statt eines Dateipfads diese Angaben ein:

- **Host:** `localhost`
- **Port:** z. B. `5432` für PostgreSQL, `3306` für MariaDB und MySQL, `8123` für ClickHouse
- **Datenbank**, **Benutzername** und **Passwort:** die Werte, die du in der jeweiligen Anleitung angelegt hast

DBeaver verbindet sich immer über das Netzwerk, auch auf demselben Rechner. Bei PostgreSQL funktioniert die Anmeldung ohne Passwort über den Benutzer `postgres` deshalb nicht. Lege dort einen Benutzer mit Passwort an, wie es der Abschnitt [PostgreSQL-Benutzer mit Passwort anlegen](adminer.md#postgresql-benutzer-mit-passwort-anlegen) in der Anleitung zu Adminer beschreibt.

Passwörter speichert DBeaver verschlüsselt in deinem Home-Ordner. Wer das nicht möchte, entfernt beim Einrichten der Verbindung den Haken bei **Passwort speichern** (*Save password*) und gibt es bei jeder Verbindung neu ein.

## Wie geht es weiter?

- **Aktualisieren:** Neue Versionen kommen mit `sudo apt update` und `sudo apt upgrade` wie bei allen anderen Paketen.
- **Mehr Speicher:** Bei sehr großen Ergebnissen kann DBeaver an seine Speichergrenze von 1 GB stoßen. Sie steht in der Zeile `-Xmx1024m` in `/usr/share/dbeaver-ce/dbeaver.ini`. Diese Datei wird bei jedem Update überschrieben.
- **Dokumentation:** <https://dbeaver.com/docs/dbeaver/>

## Deinstallieren

### 1. DBeaver schließen

Beende DBeaver, falls es noch läuft.

### 2. DBeaver entfernen

```bash
sudo apt purge dbeaver-ce
```

### 3. Paketquelle und Schlüssel löschen

```bash
sudo rm /etc/apt/sources.list.d/dbeaver.sources /etc/apt/keyrings/dbeaver.asc
```

### 4. Paketlisten aktualisieren

Danach kennt `apt` die Pakete von DBeaver nicht mehr.

```bash
sudo apt update
```

### 5. Eigene Einstellungen löschen (optional)

DBeaver legt Verbindungen, gespeicherte Passwörter, heruntergeladene Treiber und Skripte im Home-Ordner ab. **Achtung:** Alle Verbindungen und SQL-Skripte in DBeaver sind danach weg.

```bash
rm -rf ~/.local/share/DBeaverData
```

### 6. Übungsdatenbank löschen (optional)

```bash
rm -f ~/dbeaver-uebung.db
```

**Prüfen:** Der Programmordner ist verschwunden.

```bash
ls /usr/share/dbeaver-ce
```

`ls` meldet, dass es den Ordner nicht gibt (`Datei oder Verzeichnis nicht gefunden`).
