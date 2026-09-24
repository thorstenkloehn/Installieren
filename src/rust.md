# Rust

Rust ist eine Programmiersprache für schnelle und zugleich sichere Programme: Der Compiler verhindert schon beim Übersetzen typische Fehler wie ungültige Speicherzugriffe oder gleichzeitige Schreibzugriffe mehrerer Threads. Rust wird für Systemprogramme, Kommandozeilenwerkzeuge, Webdienste und WebAssembly eingesetzt.

## Vorbemerkungen

- **Compiler und Cargo:** Der Compiler heißt `rustc`. Im Alltag ruft man ihn aber fast nie selbst auf, sondern nutzt **Cargo**: Cargo legt Projekte an, lädt Bibliotheken (in Rust **Crates** genannt) von crates.io, übersetzt, testet und erstellt Dokumentation.
- **Installation über apt:** Ubuntu 26.04 liefert **Rust 1.93**. Dazu gibt es passende Pakete für die Werkzeuge **Clippy** (findet verbesserungswürdigen Code) und **rustfmt** (formatiert Quelltext einheitlich). Für die Anleitung [Axum und Actix-web](rust-web.md) genügt diese Version.
- **Alternative rustup:** Rust erscheint alle sechs Wochen in einer neuen Version. Wer immer die neueste Version oder mehrere Versionen nebeneinander braucht, installiert Rust mit dem Werkzeug **rustup** (ebenfalls als apt-Paket vorhanden) in den eigenen Benutzerordner. Beide Wege sollte man nicht mischen; siehe Schritt 4.
- **Ordner `~/.cargo`:** Hier speichert Cargo heruntergeladene Crates und mit `cargo install` installierte Programme (`~/.cargo/bin`).

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Rust und Cargo installieren

Installiert Compiler und Cargo. Den C-Compiler `gcc`, den Rust zum Zusammenfügen (Linken) der Programme braucht, installiert `apt` automatisch mit.

```bash
sudo apt install rustc cargo
```

**Prüfen:** Die Ausgabe nennt die Version, z. B. `rustc 1.93.1`.

```bash
rustc --version
```

### 3. Clippy und rustfmt installieren

Installiert die beiden Werkzeuge, die danach als `cargo clippy` und `cargo fmt` aufgerufen werden.

```bash
sudo apt install rust-clippy rustfmt
```

**Prüfen:**

```bash
cargo clippy --version
```

### 4. Prüfen, welches Rust gefunden wird

Ist Rust zusätzlich über `rustup` installiert, liegen dessen Befehle in `~/.cargo/bin` und haben meist Vorrang. Dieser Befehl zeigt, welcher `cargo` tatsächlich benutzt wird.

```bash
which cargo
```

**Prüfen:** `/usr/bin/cargo` bedeutet: die Version aus apt. `~/.cargo/bin/cargo` bedeutet: die Version aus rustup. Beides funktioniert, die Versionsnummern unterscheiden sich dann aber von denen in dieser Anleitung.

## Erstes Programm

### 5. Projekt anlegen

`cargo new` erzeugt den Ordner `~/hallo-rust` mit der Projektbeschreibung `Cargo.toml`, dem Quelltext `src/main.rs` und einem leeren Git-Repository.

```bash
cargo new ~/hallo-rust
```

### 6. In den Projektordner wechseln

Cargo-Befehle arbeiten immer mit dem Projekt im aktuellen Ordner.

```bash
cd ~/hallo-rust
```

### 7. Quelltext ersetzen

Überschreibt das vorgegebene „Hello, world!“. Das Programm enthält eine eigene Funktion `lange_namen` und einen Test dafür, der mit `#[test]` markiert ist.

```bash
nano src/main.rs
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```rust
fn lange_namen<'a>(namen: &[&'a str], mindestens: usize) -> Vec<&'a str> {
    namen.iter().copied().filter(|n| n.len() >= mindestens).collect()
}

fn main() {
    let sprachen = ["Go", "Rust", "PHP", "Kotlin", "TypeScript"];

    for (i, s) in sprachen.iter().enumerate() {
        println!("{}. {s}", i + 1);
    }
    println!("Lange Namen: {}", lange_namen(&sprachen, 4).join(", "));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn filtert_kurze_namen() {
        assert_eq!(lange_namen(&["Go", "Rust", "C"], 3), vec!["Rust"]);
    }
}
```

### 8. Programm übersetzen und starten

`cargo run` übersetzt das Projekt in den Ordner `target/debug` und startet es.

```bash
cargo run
```

**Prüfen:** Nach der Meldung `Running target/debug/hallo-rust` erscheint:

```text
1. Go
2. Rust
3. PHP
4. Kotlin
5. TypeScript
Lange Namen: Rust, Kotlin, TypeScript
```

### 9. Tests ausführen

Übersetzt das Projekt mit den Tests und führt sie aus.

```bash
cargo test
```

**Prüfen:** Die Ausgabe enthält `test tests::filtert_kurze_namen ... ok` und `test result: ok. 1 passed`.

### 10. Code prüfen lassen

Clippy kennt Hunderte Regeln für besseren Rust-Code und schlägt konkrete Änderungen vor.

```bash
cargo clippy
```

**Prüfen:** Es erscheinen keine Warnungen (`warning: …`).

### 11. Fertiges Programm erstellen

Übersetzt mit allen Optimierungen. Das Ergebnis ist deutlich schneller als die Debug-Fassung und liegt in `target/release`.

```bash
cargo build --release
```

**Prüfen:**

```bash
./target/release/hallo-rust
```

## Wie geht es weiter?

- **Crates hinzufügen:** `cargo add <Name>` trägt eine Bibliothek in `Cargo.toml` ein, z. B. `cargo add rand`. Beim nächsten Übersetzen lädt Cargo sie herunter.
- **Dokumentation offline:** `cargo doc --open` erzeugt die Dokumentation des eigenen Projekts und aller benutzten Crates und öffnet sie im Browser.
- **Lernmaterial:** Das kostenlose Buch „The Rust Programming Language“ gibt es online auf rust-lang.org; es ist selbst mit mdBook erstellt.
- **Editor:** [Visual Studio Code](vscode.md) mit der Erweiterung „rust-analyzer“. Das gleichnamige Werkzeug gibt es auch für [Neovim](neovim.md).
- **Webanwendungen:** Die Anleitung [Axum und Actix-web](rust-web.md) baut darauf auf.

## Deinstallieren

### 1. Übungsprojekt entfernen

Löscht den Projektordner samt `target` mit allen übersetzten Dateien.

```bash
rm -rf ~/hallo-rust
```

### 2. Rust-Pakete entfernen

Nur ausführen, wenn Rust auch nicht mehr für andere Projekte gebraucht wird.

```bash
sudo apt purge rustc cargo rust-clippy rustfmt
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Räumt Bibliotheken auf, die nur für Rust installiert wurden.

```bash
sudo apt autoremove
```

### 4. Zwischenspeicher von Cargo löschen

Entfernt heruntergeladene Crates. Gelöscht werden bewusst nur diese beiden Unterordner und nicht ganz `~/.cargo`: In `~/.cargo/bin` liegen Programme, die mit `cargo install` oder rustup installiert wurden, auf diesem Rechner z. B. `mdbook`.

```bash
rm -rf ~/.cargo/registry ~/.cargo/git
```

**Prüfen:** Der Befehl meldet `rustc: Befehl nicht gefunden` bzw. `command not found`. Erscheint stattdessen eine Version, stammt sie aus rustup in `~/.cargo/bin`.

```bash
rustc --version
```
