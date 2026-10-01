# Swift

Swift ist eine Programmiersprache von Apple, die schnelle, übersetzte Programme mit einer gut lesbaren Schreibweise verbindet. Bekannt ist sie vor allem für Apps auf iPhone und Mac, sie läuft aber auch unter Linux, etwa für Kommandozeilenprogramme und Serverdienste.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **Swift 6.1** im Paket `swiftlang`. Es enthält den Compiler `swiftc`, den Paketmanager (`swift build`, `swift run`), die interaktive Konsole (REPL), den Debugger LLDB und das Formatierwerkzeug `swift format`. Das Paket ist groß: Der Download dauert eine Weile, installiert belegt es rund 2,4 GB.
- **Rückfrage bei der Installation:** Ein älteres Paket `python3-swiftclient` (ein Werkzeug für den Cloud-Speicher OpenStack Swift) bringt ebenfalls einen Befehl `swift` mit. Deshalb fragt die Installation, ob `/usr/bin/swift` auf die Programmiersprache zeigen soll. Siehe Schritt 3.
- **Ohne Apple-Bibliotheken:** Die Oberflächenbibliotheken für iPhone und Mac (SwiftUI, UIKit, AppKit) gibt es unter Linux nicht. Die Standardbibliothek und Foundation sind aber vorhanden.
- **Pakete:** Bibliotheken kommen als Git-Repositorys, meist von GitHub. Der Paketmanager lädt sie selbst. `git` muss dafür installiert sein.
- **Version:** Getestet mit Swift **6.1.3** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Swift und Git installieren

`git` braucht der Paketmanager, um Bibliotheken herunterzuladen. Ist es schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install swiftlang git
```

### 3. Rückfrage zum Befehl `swift` beantworten

Während der Installation erscheint ein blauer Dialog mit der Frage **„Möchten Sie den empfohlenen symbolischen Link /usr/bin/swift erstellen?“**. Wähle **Ja** und drücke <kbd>Enter</kbd>. Nur wer das Werkzeug `python3-swiftclient` für OpenStack braucht, antwortet mit Nein und übersetzt dann ausschließlich mit `swiftc`.

**Prüfen:** Die Ausgabe beginnt mit `Swift version 6.1.3`.

```bash
swift --version
```

## Erstes Programm

### 4. Projektordner anlegen

```bash
mkdir ~/lager
```

### 5. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt. Der Name des Ordners wird zum Namen des Projekts.

```bash
cd ~/lager
```

### 6. Projekt anlegen

Legt ein Projekt für ein ausführbares Programm an: die Beschreibung `Package.swift` und den Quelltext `Sources/main.swift`.

```bash
swift package init --type executable
```

**Prüfen:** Die Ausgabe beginnt mit `Creating executable package: lager` und endet mit `Creating Sources/main.swift`.

### 7. Quelltext schreiben

Ersetzt das mitgelieferte „Hello, world!“ durch ein kleines Programm, das den Lagerbestand eines Fahrradladens auswertet.

```bash
nano Sources/main.swift
```

Lösche den bisherigen Inhalt (mehrmals <kbd>Strg</kbd>+<kbd>K</kbd>) und füge diesen ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```swift
struct Fahrrad {
  let modell: String
  let preis: Double
  var aufLager: Int
}

let bestand = [
  Fahrrad(modell: "Citybike", preis: 699, aufLager: 4),
  Fahrrad(modell: "Trekkingrad", preis: 899, aufLager: 0),
  Fahrrad(modell: "Lastenrad", preis: 3490, aufLager: 1),
]

for rad in bestand {
  let status = rad.aufLager > 0 ? "\(rad.aufLager) auf Lager" : "ausverkauft"
  print("\(rad.modell): \(Int(rad.preis)) Euro, \(status)")
}

let verfuegbar = bestand.filter { $0.aufLager > 0 }.map(\.modell)
print("Sofort lieferbar:", verfuegbar.joined(separator: ", "))

let gesamtwert = bestand.reduce(0) { $0 + $1.preis * Double($1.aufLager) }
print("Lagerwert: \(Int(gesamtwert)) Euro")
```

- **`struct`** – fasst zusammengehörige Werte zu einem eigenen Typ zusammen. `let` ist unveränderlich, `var` veränderlich.
- **`"\(…)"`** – setzt einen Wert direkt in einen Text ein.
- **`filter`, `map`, `reduce`** – bearbeiten alle Elemente einer Liste. `$0` und `$1` sind die Parameter der kurzen Funktion in den geschweiften Klammern. `\.modell` holt aus jedem Fahrrad nur das Modell.
- **Typen:** Swift erkennt die meisten Typen selbst, prüft sie aber streng. Deshalb muss `aufLager` mit `Double(…)` umgewandelt werden, bevor es mit dem Preis malgenommen wird.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Programm übersetzen und starten

`swift run` übersetzt das Projekt im Ordner `.build` und startet es. Beim ersten Mal dauert das einige Sekunden.

```bash
swift run
```

**Prüfen:** Nach den Meldungen des Compilers lautet die Ausgabe:

```text
Citybike: 699 Euro, 4 auf Lager
Trekkingrad: 899 Euro, ausverkauft
Lastenrad: 3490 Euro, 1 auf Lager
Sofort lieferbar: Citybike, Lastenrad
Lagerwert: 6286 Euro
```

### 9. Code prüfen

`swift format lint` meldet Stellen, die vom üblichen Stil abweichen, z. B. eine falsche Einrückung oder zu lange Zeilen. `-r` durchsucht den Ordner mit allen Unterordnern. Mit `swift format -i -r Sources` korrigiert es die Stellen selbst.

```bash
swift format lint -r Sources
```

**Prüfen:** Der Befehl gibt nichts aus. `swift format` rückt mit zwei Leerzeichen ein. Mit vier Leerzeichen eingerückter Code führt zu Warnungen wie `[Indentation] unindent by 2 spaces`.

## Eine Bibliothek verwenden

Als Beispiel dient swift-argument-parser von Apple. Damit versteht das Programm Optionen auf der Kommandozeile und bekommt eine Hilfe.

### 10. Paketbeschreibung anpassen

```bash
nano Package.swift
```

Lösche den bisherigen Inhalt und füge diesen ein:

```swift
// swift-tools-version: 6.1
import PackageDescription

let package = Package(
  name: "lager",
  dependencies: [
    .package(url: "https://github.com/apple/swift-argument-parser.git", from: "1.5.0")
  ],
  targets: [
    .executableTarget(
      name: "lager",
      dependencies: [.product(name: "ArgumentParser", package: "swift-argument-parser")]
    )
  ]
)
```

- **Erste Zeile:** Der Kommentar `swift-tools-version` ist Pflicht. Er sagt, welche Version des Paketmanagers die Datei mindestens braucht.
- **`dependencies`** – die Bibliothek mit ihrer Git-Adresse. `from: "1.5.0"` erlaubt jede Version ab 1.5.0 bis vor 2.0.
- **`executableTarget`** – das Programm. Es benutzt das Produkt `ArgumentParser` aus der Bibliothek.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Alte Programmdatei entfernen

Programme mit dem Kennzeichen `@main` dürfen keine Datei namens `main.swift` haben, denn diese legt den Startpunkt bereits fest.

```bash
rm Sources/main.swift
```

### 12. Neues Programm schreiben

```bash
nano Sources/Lager.swift
```

Füge diesen Inhalt ein:

```swift
import ArgumentParser

@main
struct Lager: ParsableCommand {
  static let configuration = CommandConfiguration(
    abstract: "Zeigt den Lagerbestand eines Fahrradladens.")

  @Option(name: [.customShort("p"), .long], help: "Nur Räder bis zu diesem Preis anzeigen.")
  var hoechstpreis: Int?

  @Flag(help: "Ausverkaufte Räder weglassen.")
  var nurLieferbar = false

  func run() {
    let bestand: [(modell: String, preis: Int, aufLager: Int)] = [
      ("Citybike", 699, 4),
      ("Trekkingrad", 899, 0),
      ("Lastenrad", 3490, 1),
    ]
    for rad in bestand {
      if let grenze = hoechstpreis, rad.preis > grenze { continue }
      if nurLieferbar && rad.aufLager == 0 { continue }
      print("\(rad.modell): \(rad.preis) Euro, \(rad.aufLager) auf Lager")
    }
  }
}
```

- **`@main`** – kennzeichnet den Startpunkt des Programms. `ParsableCommand` macht aus dem Typ ein Kommandozeilenprogramm, dessen Methode `run` ausgeführt wird.
- **`@Option`** – eine Option mit Wert, hier `--hoechstpreis` bzw. kurz `-p`. `Int?` bedeutet: Die Angabe darf fehlen.
- **`@Flag`** – ein Schalter ohne Wert. Aus `nurLieferbar` wird automatisch `--nur-lieferbar`.
- **`if let`** – prüft, ob ein Höchstpreis angegeben wurde, und gibt ihm für den Vergleich den Namen `grenze`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Hilfe anzeigen

Beim ersten Aufruf lädt der Paketmanager die Bibliothek von GitHub und übersetzt sie, das dauert etwa eine Viertelminute. Alles nach dem Programmnamen `lager` geht an das Programm statt an `swift run`.

```bash
swift run lager --help
```

**Prüfen:** Am Ende der Ausgabe steht:

```text
OVERVIEW: Zeigt den Lagerbestand eines Fahrradladens.

USAGE: lager [--hoechstpreis <hoechstpreis>] [--nur-lieferbar]

OPTIONS:
  -p, --hoechstpreis <hoechstpreis>
                          Nur Räder bis zu diesem Preis anzeigen.
  --nur-lieferbar         Ausverkaufte Räder weglassen.
  -h, --help              Show help information.
```

Im Projektordner liegt jetzt die Datei `Package.resolved`. Darin hält der Paketmanager fest, welche Version der Bibliothek er genau verwendet.

### 14. Mit Optionen aufrufen

```bash
swift run lager -p 900 --nur-lieferbar
```

**Prüfen:** Die Ausgabe lautet `Citybike: 699 Euro, 4 auf Lager`. Das Trekkingrad ist ausverkauft, das Lastenrad zu teuer.

## Eigenständiges Programm erzeugen

### 15. Optimiert übersetzen

`-c release` übersetzt mit allen Optimierungen. `--static-swift-stdlib` baut die Swift-Bibliotheken in das Programm ein. Ohne diese Angabe läuft es nur auf Rechnern, auf denen Swift installiert ist.

```bash
swift build -c release --static-swift-stdlib
```

### 16. Programm direkt starten

```bash
.build/release/lager --nur-lieferbar
```

**Prüfen:** Die Ausgabe nennt Citybike und Lastenrad. Die Datei ist rund 23 MB groß, weil sie die Swift-Bibliotheken enthält, und lässt sich auf andere Rechner mit Ubuntu kopieren.

```bash
ls -lh .build/release/lager
```

## Wie geht es weiter?

- **Interaktive Konsole:** `swift repl` startet eine Konsole, in der man Swift-Zeilen direkt ausprobiert. Beenden mit `:quit`.
- **Tests:** `swift package init --type executable` legt keine Tests an. Ein Projekt mit `--type library` bringt einen Ordner `Tests` mit, `swift test` führt die Tests aus.
- **Serverdienste:** Webframeworks wie Vapor oder Hummingbird werden wie swift-argument-parser in `Package.swift` eingetragen.
- **Editor:** Das Paket enthält `sourcekit-lsp`. Die Erweiterung „Swift“ für [Visual Studio Code](vscode.md) nutzt es für Autovervollständigung und Fehleranzeige. Auch [Neovim](neovim.md) kann es einbinden.
- **Dokumentation:** <https://www.swift.org/documentation>

## Deinstallieren

### 1. Projekt entfernen

Löscht den Projektordner samt übersetzter Dateien und heruntergeladener Bibliotheken.

```bash
rm -rf ~/lager
```

### 2. Zwischenspeicher und Einstellungen entfernen

Der Paketmanager hebt Bibliotheken in `~/.cache/org.swift.swiftpm` auf und legt Einstellungen in `~/.swiftpm` ab.

```bash
rm -rf ~/.swiftpm ~/.cache/org.swift.swiftpm ~/.cache/org.swift.foundation.URLCache
```

### 3. Swift entfernen

Entfernt Swift samt der Verknüpfung `/usr/bin/swift`.

```bash
sudo apt purge swiftlang
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Bibliotheken, die nur für Swift mitinstalliert wurden. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `swift` wird nicht mehr gefunden.

```bash
swift --version
```
