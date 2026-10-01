# Crystal

Crystal ist eine übersetzte Programmiersprache mit einer Schreibweise, die stark an [Ruby](ruby.md) erinnert. Anders als Ruby prüft Crystal alle Typen schon beim Übersetzen, erkennt sie aber fast immer selbst, sodass man sie selten hinschreiben muss. Heraus kommen schnelle Programme in Maschinencode, gebaut mit LLVM.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **Crystal 1.18**. Mit den empfohlenen Entwicklerbibliotheken, die Teile der Standardbibliothek brauchen (z. B. für XML, YAML oder verschlüsselte Verbindungen), sind das 14 Pakete.
- **Ohne shards:** Der Paketmanager `shards`, mit dem man fremde Bibliotheken einbindet, ist nicht in den Ubuntu-Paketquellen. Diese Anleitung kommt ohne ihn aus, weil sie nur die Standardbibliothek verwendet. Sie enthält schon vieles, etwa JSON, HTTP und Tests.
- **Version:** Getestet mit Crystal **1.18.2** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Crystal installieren

```bash
sudo apt install crystal
```

**Prüfen:** Die erste Zeile lautet `Crystal 1.18.2 (2025-11-25)`.

```bash
crystal --version
```

## Ein einzelnes Programm

### 3. Übungsordner anlegen

```bash
mkdir ~/crystal-uebung
```

### 4. In den Ordner wechseln

```bash
cd ~/crystal-uebung
```

### 5. Quelltext anlegen

```bash
nano lager.cr
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```crystal
record Fahrrad, modell : String, preis : Int32, anzahl : Int32 do
  def status
    anzahl > 0 ? "#{anzahl} auf Lager" : "ausverkauft"
  end
end

bestand = [
  Fahrrad.new("Citybike", 699, 4),
  Fahrrad.new("Trekkingrad", 899, 0),
  Fahrrad.new("Lastenrad", 3490, 1),
]

bestand.each_with_index(1) do |rad, nummer|
  puts "#{nummer}. #{rad.modell.ljust(12)} #{rad.preis.to_s.rjust(5)} Euro, #{rad.status}"
end

lieferbar = bestand.select { |rad| rad.anzahl > 0 }.map(&.modell)
puts "Sofort lieferbar: #{lieferbar.join(", ")}"
puts "Lagerwert: #{bestand.sum { |rad| rad.preis * rad.anzahl }} Euro"
```

- **`record`** – legt kurz einen unveränderlichen Datentyp mit festen Feldern an. `String` und `Int32` sind die Typen der Felder. Im `do`-Block stehen eigene Methoden.
- **`def status`** – eine Methode ohne Klammern. Der letzte Ausdruck ist das Ergebnis.
- **`"#{…}"`** – setzt Werte in einen Text ein. `ljust` und `rjust` füllen auf eine feste Breite auf.
- **`each_with_index(1)`** – geht die Liste durch und zählt dabei ab 1.
- **`select`, `map`, `sum`** – filtern, umformen, zusammenzählen. `&.modell` ist die Kurzform für `{ |rad| rad.modell }`.
- **Typen erkennen** – `bestand` ist ohne Angabe ein `Array(Fahrrad)`. Crystal weiß das und prüft jeden Zugriff.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Programm übersetzen und starten

`crystal run` übersetzt und startet in einem Schritt.

```bash
crystal run lager.cr
```

**Prüfen:** Die Ausgabe lautet:

```text
1. Citybike       699 Euro, 4 auf Lager
2. Trekkingrad    899 Euro, ausverkauft
3. Lastenrad     3490 Euro, 1 auf Lager
Sofort lieferbar: Citybike, Lastenrad
Lagerwert: 6286 Euro
```

### 7. Eigenständiges Programm erzeugen

`--release` schaltet die Optimierungen ein. Das Übersetzen dauert dadurch etwas länger.

```bash
crystal build --release lager.cr
```

**Prüfen:** Im Ordner liegt das Programm `lager`, knapp 1 MB groß. Es liefert dieselbe Ausgabe wie in Schritt 6.

```bash
./lager
```

## Ein Projekt mit Tests

### 8. In das Home-Verzeichnis wechseln

```bash
cd ~
```

### 9. Projekt anlegen

`crystal init app` legt den Ordner `umsatz` mit der Projektbeschreibung `shard.yml`, dem Quelltext in `src` und Tests in `spec` an. Außerdem richtet es ein Git-Repository ein und übernimmt Name und E-Mail aus den Git-Einstellungen.

```bash
crystal init app umsatz
```

**Prüfen:** Die Meldungen nennen unter anderem `create … src/umsatz.cr` und `create … spec/umsatz_spec.cr`.

### 10. In den Projektordner wechseln

```bash
cd ~/umsatz
```

### 11. Modul schreiben

Das Modul enthält die eigentliche Rechnung. Das Programm, das Dateien liest, kommt in eine eigene Datei. So können die Tests das Modul laden, ohne das Programm zu starten.

```bash
nano src/umsatz.cr
```

Lösche den bisherigen Inhalt (mehrmals <kbd>Strg</kbd>+<kbd>K</kbd>) und füge diesen ein:

```crystal
require "json"

module Umsatz
  VERSION = "0.1.0"

  # Zählt den Umsatz je Modell zusammen.
  # Jede Zeile hat die Form "Modell;Anzahl;Preis".
  def self.summen(zeilen : Array(String)) : Hash(String, Int32)
    ergebnis = Hash(String, Int32).new(0)
    zeilen.each do |zeile|
      modell, anzahl, preis = zeile.split(';')
      ergebnis[modell] += anzahl.to_i * preis.to_i
    end
    ergebnis
  end
end
```

- **`def self.summen`** – eine Methode des Moduls, aufrufbar als `Umsatz.summen`.
- **Typangaben** – `zeilen : Array(String)` und `: Hash(String, Int32)` legen Parameter und Ergebnis fest. Hier sind sie zur Dokumentation hingeschrieben, Crystal prüft sie beim Übersetzen.
- **`Hash(String, Int32).new(0)`** – ein Wörterbuch, das für fehlende Schlüssel 0 liefert. Deshalb funktioniert `+=` sofort.
- **`modell, anzahl, preis = …`** – verteilt die drei Teile der Zeile auf drei Variablen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Programm schreiben

```bash
nano src/cli.cr
```

Die Datei ist neu. Füge diesen Inhalt ein:

```crystal
require "./umsatz"

if ARGV.size != 1
  STDERR.puts "Aufruf: umsatz DATEI"
  exit 1
end

tabelle = Umsatz.summen(File.read_lines(ARGV[0]))
tabelle.to_a.sort_by { |_, betrag| -betrag }.each do |modell, betrag|
  puts "#{modell.ljust(12)} #{betrag.to_s.rjust(5)} Euro"
end

File.write("umsatz.json", tabelle.to_json)
puts "Gespeichert: umsatz.json"
```

- **`ARGV`** – die Argumente beim Aufruf. `exit 1` beendet mit dem Rückgabewert 1.
- **`File.read_lines`** – liest eine Datei als Liste von Zeilen.
- **`sort_by { |_, betrag| -betrag }`** – sortiert nach dem Umsatz, das Minus kehrt die Reihenfolge um.
- **`to_json`** – kommt aus `require "json"` im Modul und schreibt das Wörterbuch als JSON.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Test schreiben

```bash
nano spec/umsatz_spec.cr
```

Lösche den bisherigen Inhalt und füge diesen ein:

```crystal
require "./spec_helper"

describe Umsatz do
  it "zählt den Umsatz je Modell zusammen" do
    summen = Umsatz.summen(["A;2;10", "B;1;50", "A;1;10"])
    summen["A"].should eq(30)
    summen["B"].should eq(50)
    summen.size.should eq(2)
  end
end
```

`describe` fasst Tests zusammen, `it` beschreibt einen Test, `should eq` prüft einen Wert. Die Datei `spec_helper.cr` aus der Vorlage lädt das Modul.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. Tests ausführen

```bash
crystal spec
```

**Prüfen:** Die letzte Zeile lautet `1 examples, 0 failures, 0 errors, 0 pending`.

### 15. Datei mit Verkäufen anlegen

```bash
nano verkauf.csv
```

Füge diesen Inhalt ein:

```text
Citybike;2;699
Lastenrad;1;3490
Citybike;3;699
Trekkingrad;1;899
Citybike;1;649
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Programm bauen

`-o umsatz` legt den Namen des Programms fest.

```bash
crystal build --release src/cli.cr -o umsatz
```

### 17. Programm starten

```bash
./umsatz verkauf.csv
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike      4144 Euro
Lastenrad     3490 Euro
Trekkingrad    899 Euro
Gespeichert: umsatz.json
```

Die Datei `umsatz.json` enthält `{"Citybike":4144,"Lastenrad":3490,"Trekkingrad":899}`.

### 18. Typprüfung ausprobieren (optional)

Ändere in `src/cli.cr` den Aufruf `Umsatz.summen(File.read_lines(ARGV[0]))` in `Umsatz.summen(File.read(ARGV[0]))`. `File.read` liefert einen einzigen Text statt einer Liste von Zeilen. Übersetze dann neu wie in Schritt 16.

**Prüfen:** Crystal bricht ab mit `Error: expected argument #1 to 'Umsatz.summen' to be Array(String), not String`. Der Fehler fällt also schon beim Übersetzen auf, nicht erst, wenn das Programm läuft. Mache die Änderung danach wieder rückgängig.

## Wie geht es weiter?

- **Code formatieren:** `crystal tool format` bringt alle Dateien in die übliche Form, `crystal tool format --check` prüft nur.
- **Webserver:** Die Standardbibliothek enthält `HTTP::Server`. Ein kleiner Webdienst braucht damit keine fremden Bibliotheken.
- **Fremde Bibliotheken:** Dafür braucht man `shards`. Es ist nicht bei Ubuntu enthalten, lässt sich aber aus dem Quelltext unter <https://github.com/crystal-lang/shards> bauen. Bibliotheken trägt man dann in `shard.yml` unter `dependencies` ein.
- **Dokumentation:** Sprachbeschreibung und Referenz unter <https://crystal-lang.org/reference/>, die Standardbibliothek unter <https://crystal-lang.org/api/>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/crystal-uebung ~/umsatz
```

### 2. Zwischenspeicher entfernen

Crystal legt übersetzte Zwischenstände in `~/.cache/crystal` ab.

```bash
rm -rf ~/.cache/crystal
```

### 3. Crystal entfernen

```bash
sudo apt purge crystal
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Pakete, die nur für Crystal mitinstalliert wurden, z. B. LLVM 19 und die Entwicklerbibliotheken. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `crystal` wird nicht mehr gefunden.

```bash
crystal --version
```
