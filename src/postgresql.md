# PostgreSQL

PostgreSQL ist eine freie Datenbank, die Daten in Tabellen ablegt und per SQL abfragen lässt. Auf dem Entwicklungsrechner dient es als robuste Datenbank für Webanwendungen und lokale Softwareprojekte. Mit der Erweiterung **pgvector** kann PostgreSQL außerdem Vektoren speichern und nach Ähnlichkeit durchsuchen, etwa für KI-Anwendungen mit Embeddings.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert PostgreSQL **18** und die Erweiterung pgvector direkt in den eigenen Paketquellen. Für die meisten Fälle reicht das.
- **Offizielles PostgreSQL-Archiv (optional):** Das PostgreSQL-Projekt betreibt ein eigenes apt-Archiv (PGDG). Es liefert Fehlerbehebungen oft früher als Ubuntu und bietet auch ältere Hauptversionen wie 16 oder 17 an. Wer das braucht, bindet es vor der Installation ein, siehe den nächsten Abschnitt (mit nano) oder [Plan B](#plan-b-offizielles-archiv-per-befehl-einbinden) (per Befehl, ohne Editor). Sonst direkt mit [Installation](#installation) weitermachen.
- **Versionsnummer im Paketnamen:** Erweiterungen wie pgvector gibt es passend zu jeder PostgreSQL-Hauptversion, deshalb heißt das Paket `postgresql-18-pgvector`.

## Optional: Offizielles PostgreSQL-Archiv einbinden

Diese Schritte sind nur nötig, wenn du die Pakete direkt vom PostgreSQL-Projekt beziehen willst. Danach geht es wie gewohnt mit dem Abschnitt [Installation](#installation) weiter; `apt` nimmt dann automatisch die Pakete aus dem neuen Archiv.

### 1. Paketlisten aktualisieren

Sorgt dafür, dass `apt` die aktuellen Versionen der Hilfsprogramme aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramme installieren

`curl` lädt den Signaturschlüssel herunter, `ca-certificates` enthält die Zertifikate, mit denen die HTTPS-Verbindung zum Archiv geprüft wird.

```bash
sudo apt install -y curl ca-certificates
```

### 3. Ordner für den Schlüssel anlegen

Legt das Verzeichnis an, in dem der Signaturschlüssel des Archivs abgelegt wird. `install -d` erzeugt den Ordner samt fehlender Elternordner und stört sich nicht daran, wenn er schon existiert.

```bash
sudo install -d /usr/share/postgresql-common/pgdg
```

### 4. Signaturschlüssel herunterladen

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich vom PostgreSQL-Projekt stammen und unterwegs nicht verändert wurden. `--fail` sorgt dafür, dass bei einem Fehler keine kaputte Datei gespeichert wird.

```bash
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc
```

**Prüfen:** Die erste Zeile lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -1 /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
```

### 5. Codenamen der Ubuntu-Version ermitteln

Das Archiv hat für jede Ubuntu-Version einen eigenen Bereich, der nach dem Codenamen benannt ist. Diesen Namen brauchst du im nächsten Schritt.

```bash
grep VERSION_CODENAME /etc/os-release
```

**Prüfen:** Bei Ubuntu 26.04 erscheint `VERSION_CODENAME=resolute`.

### 6. Paketquelle eintragen

Öffnet eine neue Datei, in der die Adresse des Archivs steht. Alle Dateien mit der Endung `.sources` in `/etc/apt/sources.list.d/` liest `apt` automatisch als zusätzliche Paketquellen ein. Ubuntu 26.04 verwendet dieses Format auch für seine eigenen Paketquellen (`ubuntu.sources`).

```bash
sudo nano /etc/apt/sources.list.d/pgdg.sources
```

Füge diesen Inhalt ein (Strg+Umschalt+V), speichere mit Strg+O und Enter und beende nano mit Strg+X. Der Teil vor `-pgdg` in der Zeile `Suites` muss zu dem Namen aus Schritt 5 passen, sonst findet `apt` im Archiv nichts.

```text
Types: deb
URIs: https://apt.postgresql.org/pub/repos/apt
Suites: resolute-pgdg
Components: main
Architectures: amd64
Signed-By: /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
```

Was die Felder bedeuten:

- `Types: deb` – aus dieser Quelle werden fertige Programmpakete geladen, keine Quelltexte.
- `URIs` – die Internetadresse des Archivs.
- `Suites` – der Bereich des Archivs für deine Ubuntu-Version.
- `Components: main` – der Teil des Archivs mit den PostgreSQL-Paketen.
- `Architectures: amd64` – nur Pakete für 64-Bit-PCs mit Intel- oder AMD-Prozessor werden geladen.
- `Signed-By` – Pakete aus dieser Quelle werden nur mit dem Schlüssel aus Schritt 4 akzeptiert.

### 7. Paketlisten neu einlesen

Erst jetzt lädt `apt` das Paketverzeichnis des neuen Archivs herunter.

```bash
sudo apt update
```

**Prüfen:** Unter den Versionen taucht eine Zeile mit `apt.postgresql.org` auf, und die Version beim `Installationskandidat` enthält `pgdg26.04`, z. B. `18.6-1.pgdg26.04+2`.

```bash
apt policy postgresql-18
```

Weiter geht es mit dem Abschnitt [Installation](#installation). Möchtest du eine ältere Hauptversion, ersetze dort `18` durch die gewünschte Zahl, z. B. `sudo apt install postgresql-17` und `sudo apt install postgresql-17-pgvector`.

## Plan B: Offizielles Archiv per Befehl einbinden

Dieser Weg führt zum selben Ziel wie der vorige Abschnitt, kommt aber ohne Editor aus: Die Paketquelle wird mit einem einzigen Befehl in die Datei `/etc/apt/sources.list.d/pgdg.list` geschrieben, und der Codename der Ubuntu-Version wird automatisch eingesetzt. Das ist praktisch, wenn das Eintragen mit nano nicht klappt oder wenn du die Schritte in ein Skript übernehmen willst.

**Wichtig:** Nutze entweder den vorigen Abschnitt oder Plan B, nicht beide. Gibt es schon die Datei `/etc/apt/sources.list.d/pgdg.sources`, lösche sie vorher mit `sudo rm /etc/apt/sources.list.d/pgdg.sources`. Sonst meldet `apt update`, dass dieselbe Quelle mehrfach eingetragen ist.

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramme installieren

`curl` holt den Signaturschlüssel aus dem Internet, `ca-certificates` wird gebraucht, damit die HTTPS-Verbindung zum Archiv als vertrauenswürdig erkannt wird. `-y` beantwortet die Rückfrage von `apt` automatisch mit Ja.

```bash
sudo apt install -y curl ca-certificates
```

### 3. Ordner für den Schlüssel anlegen

Erzeugt das Verzeichnis, in dem der Schlüssel liegen soll. Ist es schon vorhanden, passiert nichts.

```bash
sudo install -d /usr/share/postgresql-common/pgdg
```

### 4. Signaturschlüssel herunterladen

Speichert den öffentlichen Schlüssel des PostgreSQL-Projekts. `apt` prüft damit später jedes Paket aus dem Archiv. Schlägt der Download fehl, bricht `--fail` ab, statt eine Fehlerseite als Schlüssel abzulegen.

```bash
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc
```

**Prüfen:** Die Ausgabe lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -1 /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
```

### 5. Angaben zur Ubuntu-Version laden

Die Datei `/etc/os-release` enthält Name, Versionsnummer und Codename des Systems als Variablen. Der Punkt am Anfang liest sie in das aktuelle Terminal ein, sodass der nächste Schritt den Codenamen über `$VERSION_CODENAME` verwenden kann. Führe Schritt 6 deshalb im selben Terminalfenster aus.

```bash
. /etc/os-release
```

**Prüfen:** Bei Ubuntu 26.04 erscheint `resolute`.

```bash
echo $VERSION_CODENAME
```

### 6. Paketquelle eintragen

Schreibt eine Zeile mit der Adresse des Archivs in die Datei `pgdg.list`. Dabei setzt die Shell den Codenamen aus Schritt 5 für `$VERSION_CODENAME` ein. Der Umweg über `sudo sh -c "…"` ist nötig, weil die Umleitung `>` sonst mit deinen normalen Rechten ausgeführt würde und die Datei unter `/etc` nicht angelegt werden dürfte.

```bash
sudo sh -c "echo 'deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $VERSION_CODENAME-pgdg main' > /etc/apt/sources.list.d/pgdg.list"
```

**Prüfen:** Die Datei enthält eine Zeile, die mit `deb [signed-by=` beginnt und `resolute-pgdg main` enthält. Steht dort nur `-pgdg main` ohne Codenamen, wurde Schritt 5 übersprungen oder in einem anderen Terminal ausgeführt. Dann Schritt 5 und 6 wiederholen.

```bash
cat /etc/apt/sources.list.d/pgdg.list
```

### 7. Paketlisten neu einlesen

Jetzt lädt `apt` das Paketverzeichnis des PostgreSQL-Archivs herunter.

```bash
sudo apt update
```

**Prüfen:** Beim `Installationskandidat` steht eine Version mit `pgdg26.04`, z. B. `18.6-1.pgdg26.04+2`.

```bash
apt policy postgresql-18
```

Weiter geht es mit dem Abschnitt [Installation](#installation).

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von PostgreSQL aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. PostgreSQL installieren

Installiert den Datenbankserver, die Client-Programme wie `psql` und richtet einen ersten Datenbank-Cluster namens `18/main` ein. Der Dienst wird dabei automatisch gestartet.

```bash
sudo apt install postgresql
```

**Prüfen:** Die Version des Befehlszeilen-Clients wird angezeigt, z. B. `psql (PostgreSQL) 18.6`.

```bash
psql --version
```

### 3. Prüfen, ob der Datenbankdienst läuft

PostgreSQL läuft als Hintergrunddienst (systemd). `pg_lsclusters` zeigt alle Datenbank-Cluster mit ihrem Zustand.

```bash
pg_lsclusters
```

**Prüfen:** In der Zeile `18 main 5432` steht in der Spalte `Status` der Wert `online`.

## Erste Schritte

### 4. Verbindung zur Datenbank testen

Bei der Installation wird der Verwaltungsbenutzer `postgres` eingerichtet. Mit ihm testest du die Verbindung.

```bash
sudo -u postgres psql -c "SELECT version();"
```

**Prüfen:** Die Ausgabe beginnt mit `PostgreSQL 18`.

### 5. Eigenen Datenbank-Benutzer anlegen

Erstellt einen PostgreSQL-Benutzer mit dem Namen deines Ubuntu-Benutzers. Danach kannst du ohne `sudo` mit der Datenbank arbeiten. `--superuser` gibt ihm volle Rechte, das ist auf einem Entwicklungsrechner praktisch, aber auf einem Server nicht zu empfehlen.

```bash
sudo -u postgres createuser --superuser "$USER"
```

### 6. Entwicklungsdatenbank anlegen

Erstellt eine erste eigene Datenbank mit dem Namen `devdb`.

```bash
createdb devdb
```

**Prüfen:** Die Verbindung klappt, und die Ausgabe zeigt `devdb`.

```bash
psql -d devdb -c "SELECT current_database();"
```

Interaktiv öffnest du die Datenbank mit `psql -d devdb`. Mit `\q` verlässt du die Konsole wieder.

## pgvector einrichten

### 7. pgvector installieren

Installiert die Erweiterung passend zu PostgreSQL 18. Ein Neustart des Datenbankdienstes ist nicht nötig.

```bash
sudo apt install postgresql-18-pgvector
```

### 8. Erweiterung in der Datenbank einschalten

Erweiterungen werden in PostgreSQL pro Datenbank eingeschaltet. Dieser Befehl macht den Datentyp `vector` in `devdb` verfügbar. Er braucht Superuser-Rechte, die dein Benutzer aus Schritt 5 hat.

```bash
psql -d devdb -c "CREATE EXTENSION vector;"
```

**Prüfen:** Die Tabelle zeigt die Erweiterung `vector` mit Version `0.8.1`.

```bash
psql -d devdb -c "\dx vector"
```

### 9. Beispieltabelle mit Vektoren anlegen

Legt eine Tabelle an, in der jede Zeile einen Text und einen Vektor mit drei Werten enthält. In echten Anwendungen stammen die Vektoren von einem Embedding-Modell und haben meist mehrere hundert Werte, z. B. `vector(768)`. Zum Ausprobieren reichen drei.

```bash
psql -d devdb <<'EOF'
CREATE TABLE notizen (
    id      bigserial PRIMARY KEY,
    text    text,
    vektor  vector(3)
);
INSERT INTO notizen (text, vektor) VALUES
    ('Apfel', '[1, 0, 0]'),
    ('Birne', '[0.9, 0.1, 0]'),
    ('Auto',  '[0, 0, 1]');
EOF
```

**Prüfen:** Die Ausgabe endet mit `INSERT 0 3`.

### 10. Ähnlichkeitssuche ausprobieren

Sucht die zwei Einträge, deren Vektor dem Suchvektor am ähnlichsten ist. Der Operator `<=>` berechnet den Kosinus-Abstand: Je kleiner der Wert, desto ähnlicher. Weitere Operatoren sind `<->` (euklidischer Abstand) und `<#>` (negatives Skalarprodukt).

```bash
psql -d devdb -c "SELECT text, vektor <=> '[1, 0.05, 0]' AS abstand FROM notizen ORDER BY abstand LIMIT 2;"
```

**Prüfen:** Es erscheinen `Apfel` und `Birne` mit sehr kleinen Abständen. `Auto` liegt weit entfernt und fehlt deshalb.

### 11. Index für schnelle Suche anlegen

Ohne Index vergleicht PostgreSQL den Suchvektor mit jeder Zeile. Ein HNSW-Index beschleunigt die Suche bei vielen Einträgen deutlich. `vector_cosine_ops` passt zum Operator `<=>` aus dem vorigen Schritt.

```bash
psql -d devdb -c "CREATE INDEX ON notizen USING hnsw (vektor vector_cosine_ops);"
```

**Prüfen:** Unter `Indexes` steht ein Eintrag mit `hnsw (vektor vector_cosine_ops)`.

```bash
psql -d devdb -c "\d notizen"
```

## Optional: Autostart ausschalten

Auf einem Entwicklungsrechner muss der Datenbankdienst nicht bei jedem Rechnerstart laufen.

Autostart ausschalten:

```bash
sudo systemctl disable postgresql
```

Bei Bedarf von Hand starten und stoppen:

```bash
sudo systemctl start postgresql
```

```bash
sudo systemctl stop postgresql
```

## Deinstallieren

### 1. PostgreSQL-Dienst stoppen

Beendet den laufenden Dienst vor der Deinstallation.

```bash
sudo systemctl stop postgresql
```

### 2. PostgreSQL und pgvector entfernen

`purge` entfernt die Pakete samt Konfigurationsdateien. Beim Paket `postgresql-18` fragt `apt`, ob auch die Datenbank-Verzeichnisse gelöscht werden sollen. Wähle **Ja**, wenn die Daten weg können, sonst **Nein**.

```bash
sudo apt purge postgresql postgresql-18 postgresql-18-pgvector postgresql-client-18 postgresql-common postgresql-client-common
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt Bibliotheken, die nur für PostgreSQL installiert wurden.

```bash
sudo apt autoremove
```

### 4. Datenbankdateien löschen (optional)

Entfernt verbliebene Datenbank- und Konfigurationsverzeichnisse, falls du in Schritt 2 **Nein** gewählt hast. **Achtung:** Alle gespeicherten Daten gehen dabei unwiderruflich verloren.

```bash
sudo rm -rf /var/lib/postgresql /etc/postgresql
```

**Prüfen:** Der Befehl `psql` wird nicht mehr gefunden.

```bash
psql --version
```

### 5. Offizielles PostgreSQL-Archiv entfernen (falls eingebunden)

Nur nötig, wenn du den optionalen Abschnitt oder Plan B zum PostgreSQL-Archiv ausgeführt hast. Der Befehl löscht die Paketquelle (`pgdg.sources` bzw. bei Plan B `pgdg.list`) und den Signaturschlüssel. `-f` sorgt dafür, dass keine Fehlermeldung erscheint, wenn eine der beiden Quelldateien nicht existiert.

```bash
sudo rm -f /etc/apt/sources.list.d/pgdg.sources /etc/apt/sources.list.d/pgdg.list /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
```

### 6. Paketlisten aktualisieren

Damit `apt` das entfernte Archiv vergisst.

```bash
sudo apt update
```

**Prüfen:** In der Ausgabe kommt `apt.postgresql.org` nicht mehr vor.
