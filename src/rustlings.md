# Rustlings

Rustlings bietet kleine Rust-Aufgaben, die im Terminal geprüft werden.

Die Anleitung gilt für Ubuntu 26.04 LTS (amd64). Diese Anleitung verwendet Rustlings 6.5.0 mit Mindestversion Rust 1.88. Ubuntu 26.04 liefert einen ausreichend neuen Compiler. Ein neuer Ordner ~/rustlings-lab wird verwendet.

## Installation

### 1. Paketlisten aktualisieren

Lädt die verfügbaren Paketstände.

````bash
sudo apt update
````

### 2. Rust-Werkzeuge installieren

Cargo baut Rustlings; die Build-Werkzeuge stellen den Linker bereit.

````bash
sudo apt install rustc cargo build-essential
````

### 3. Compiler prüfen

Erwartet wird mindestens Rust 1.88. Eine zusätzliche rustup-Installation kann im Suchpfad Vorrang vor apt haben; prüfe dann die tatsächlich angezeigte Version.

````bash
rustc --version
````

### 4. Rustlings installieren

Baut den festgelegten Stand mit seinen gesperrten Abhängigkeiten im Benutzerkonto.

````bash
cargo install rustlings --version 6.5.0 --locked
````

### 5. Installationsordner in den Suchpfad aufnehmen

Gilt für dieses Terminal. In einem neuen Terminal erneut ausführen, falls rustlings sonst nicht gefunden wird.

````bash
export PATH="$HOME/.cargo/bin:$PATH"
````

### 6. Arbeitsordner anlegen

Der Zielordner soll noch nicht existieren.

````bash
mkdir ~/rustlings-lab
````

### 7. Arbeitsordner öffnen

Hier wird der Übungssatz angelegt.

````bash
cd ~/rustlings-lab
````

### 8. Übungen erzeugen

Erzeugt den Unterordner rustlings.

````bash
rustlings init
````

### 9. Übungsordner öffnen

Rustlings sucht hier seine Aufgaben.

````bash
cd rustlings
````

### 10. Lernmodus starten

Lies die im Terminal angezeigte Aufgabe und bearbeite die genannte Datei mit deinem Editor. Die Oberfläche zeigt den Prüfstatus; beende sie über q beziehungsweise Strg + C.

````bash
rustlings
````

## Installation prüfen

### 1. Version anzeigen

Die Ausgabe soll Rustlings 6.5.0 nennen.

````bash
rustlings --version
````

### 2. Prüfbefehle anzeigen

Zeigt die tatsächlich verfügbaren Befehle dieser Version. Für eine frisch erzeugte Sammlung sind noch nicht bestandene Übungen normal.

````bash
rustlings --help
````

## Deinstallieren

### 1. Rustlings entfernen

Entfernt die mit Cargo installierte Binärdatei.

````bash
cargo uninstall rustlings
````

### 2. Übungen optional löschen

Löscht auch eigene Lösungen im Beispielordner; sichere sie vorher.

````bash
rm -rf -- ~/rustlings-lab
````

### 3. Entfernung prüfen

Im Installationsverzeichnis darf keine rustlings-Binärdatei mehr liegen.

````bash
test ! -e ~/.cargo/bin/rustlings && echo 'Rustlings entfernt'
````

## Quellen und Lizenz

[Offizielle Einrichtung](https://rustlings.rust-lang.org/setup/) und [Paketstand 6.5.0](https://github.com/rust-lang/rustlings/blob/v6.5.0/Cargo.toml). Lizenz: MIT. Rust und Cargo bleiben für andere Projekte installiert.
