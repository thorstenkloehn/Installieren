# mdBook

Mit mdBook wird aus einer Sammlung von Markdown-Dateien eine Website im Buchformat, mit Kapitelverzeichnis am Rand und Volltextsuche. Auf dem Entwicklungsrechner dient es dazu, Anleitungen und technische Dokumentationen als strukturierte, durchsuchbare HTML-Webseite lokal zu bauen und im Browser zu testen.

## Installation (bevorzugt über apt)

Unter Ubuntu 26.04 ist mdBook direkt in den offiziellen Paketquellen enthalten.

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketdaten aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. mdBook installieren

Installiert das `mdbook`-Paket auf deinem System.

```bash
sudo apt install mdbook
```

**Prüfen:** Die Versionsnummer von mdBook wird angezeigt.

```bash
mdbook --version
```

## Alternative: Installation über Rust (Cargo)

Falls du die neueste Entwicklerversion benötigst oder mdBook im Benutzerverzeichnis (`~/.cargo/bin`) verwalten möchtest, kannst du die Installation über den Rust-Paketmanager Cargo durchführen.

### 3. Cargo installieren (falls nicht vorhanden)

Installiert den Rust-Paketmanager Cargo aus den Ubuntu-Paketquellen.

```bash
sudo apt install cargo
```

### 4. mdBook über Cargo installieren

Lädt den Quellcode von crates.io herunter, kompiliert mdBook und legt die ausführbare Datei unter `~/.cargo/bin/mdbook` ab.

```bash
cargo install mdbook
```

**Prüfen:** Die Version der Cargo-Installation wird angezeigt.

```bash
~/.cargo/bin/mdbook --version
```

## Verwendung und Test

### 5. Neues Buchprojekt initialisieren

Erstellt einen neuen Ordner `mein-buch` mit der grundlegenden Konfiguration (`book.toml`) und der Inhaltsstruktur (`src/SUMMARY.md`).

```bash
mdbook init mein-buch --title "Mein Handbuch" --ignore=none
```

**Prüfen:** Der Ordner `mein-buch` mit `book.toml` und `src/` wurde angelegt.

```bash
ls -la mein-buch
```

### 6. Buch bauen

Erzeugt aus den Markdown-Dateien eine statische HTML-Webseite im Verzeichnis `mein-buch/book/`.

```bash
mdbook build mein-buch
```

**Prüfen:** Die generierte Einstiegsseite `mein-buch/book/index.html` existiert.

```bash
ls -lh mein-buch/book/index.html
```

### 7. Lokalen Entwicklungsserver starten

Startet einen Webserver auf <http://localhost:3000>, der Änderungen an Markdown-Dateien automatisch erkennt und die Seite im Browser live neu lädt.

```bash
mdbook serve mein-buch --open
```

**Prüfen:** Im Terminal läuft der Webserver und im Browser öffnet sich das Buch. Zum Beenden drückst du im Terminal `Strg + C`.

## Deinstallieren

### Wenn über apt installiert:

### 1. mdBook-Paket entfernen

`purge` entfernt das Programm vollständig aus dem System.

```bash
sudo apt purge mdbook
```

### 2. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt eventuell verbliebene Paketabhängigkeiten.

```bash
sudo apt autoremove
```

### Wenn über Cargo installiert:

Entfernt die Binärdatei aus `~/.cargo/bin/`:

```bash
cargo uninstall mdbook
```

**Prüfen:** Der Befehl wird nicht mehr im System gefunden.

```bash
mdbook --version
```
