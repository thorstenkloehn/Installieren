# Nim

Nim ist eine übersetzte Programmiersprache mit einer Schreibweise, die an [Python](python.md) erinnert: Blöcke werden durch Einrückung gebildet, Typen erkennt der Compiler meist selbst. Nim übersetzt zuerst nach C und lässt dann gcc ein schnelles, kleines Programm daraus machen. Makros erlauben es, die Sprache selbst zu erweitern.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **Nim 2.2** in einem einzigen Paket. Es enthält den Compiler `nim`, den Paketmanager `nimble` und das Formatierwerkzeug `nimpretty`.
- **Braucht einen C-Compiler:** Nim erzeugt C-Code. Deshalb muss `gcc` installiert sein. Ist [C](c.md) schon eingerichtet, ist es vorhanden.
- **Ordner im Home-Verzeichnis:** Nim legt übersetzte Zwischenstände in `~/.cache/nim` ab, nimble seine Daten und heruntergeladene Pakete in `~/.nimble`.
- **Version:** Getestet mit Nim **2.2.4** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Nim und gcc installieren

Ist `gcc` schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install nim gcc
```

**Prüfen:** Die erste Zeile lautet `Nim Compiler Version 2.2.4 [Linux: amd64]`.

```bash
nim --version
```

## Ein einzelnes Programm

### 3. Übungsordner anlegen

```bash
mkdir ~/nim-uebung
```

### 4. In den Ordner wechseln

```bash
cd ~/nim-uebung
```

### 5. Quelltext anlegen

```bash
nano lager.nim
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Die Einrückung mit zwei Leerzeichen gehört zur Sprache:

```nim
import std/[strformat, sequtils, strutils]

type
  Fahrrad = object
    modell: string
    preis: int
    anzahl: int

proc status(rad: Fahrrad): string =
  if rad.anzahl > 0: &"{rad.anzahl} auf Lager"
  else: "ausverkauft"

let bestand = @[
  Fahrrad(modell: "Citybike", preis: 699, anzahl: 4),
  Fahrrad(modell: "Trekkingrad", preis: 899, anzahl: 0),
  Fahrrad(modell: "Lastenrad", preis: 3490, anzahl: 1),
]

for i, rad in bestand:
  echo &"{i + 1}. {rad.modell:<12} {rad.preis:>5} Euro, {rad.status}"

let lieferbar = bestand.filterIt(it.anzahl > 0).mapIt(it.modell)
echo "Sofort lieferbar: ", lieferbar.join(", ")
echo "Lagerwert: ", bestand.mapIt(it.preis * it.anzahl).foldl(a + b), " Euro"
```

- **`import std/[…]`** – lädt mehrere Module der Standardbibliothek auf einmal.
- **`object`** – ein eigener Typ mit Feldern. Angelegt wird er mit `Fahrrad(modell: …, preis: …)`.
- **`proc`** – definiert eine Funktion. Der letzte Ausdruck ist das Ergebnis, ein `return` ist nicht nötig. Man kann sie auch wie eine Eigenschaft aufrufen: `rad.status` statt `status(rad)`.
- **`&"…"`** – setzt Werte in geschweiften Klammern in einen Text ein. `:<12` füllt linksbündig auf 12 Zeichen auf, `:>5` rechtsbündig auf 5.
- **`@[…]`** – eine Folge (seq), also eine Liste, die wachsen kann. `let` legt einen unveränderlichen Wert an.
- **`filterIt`, `mapIt`, `foldl`** – filtern, umformen und zusammenfassen. `it` steht für das jeweilige Element, `a + b` in `foldl` für das Zusammenzählen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Programm übersetzen und starten

`nim r` übersetzt und startet in einem Schritt. `--hints:off` blendet die vielen Hinweise des Compilers aus.

```bash
nim r --hints:off lager.nim
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

`nim c` übersetzt nur, `-d:release` schaltet die Optimierungen ein.

```bash
nim c -d:release --hints:off lager.nim
```

**Prüfen:** Im Ordner liegt das Programm `lager`, rund 100 KB groß. Es braucht außer der C-Bibliothek nichts.

```bash
./lager
```

## Ein Projekt mit nimble

### 8. Projektordner anlegen

Der Name des Ordners wird zum Namen des Pakets. Bindestriche ersetzt nimble durch Unterstriche, weil sie in Modulnamen von Nim nicht erlaubt sind. Deshalb heißt der Ordner hier gleich `umsatz_nim`.

```bash
mkdir ~/umsatz_nim
```

### 9. In den Projektordner wechseln

```bash
cd ~/umsatz_nim
```

### 10. Projekt anlegen

`-y` beantwortet alle Fragen mit der Vorgabe. Es entsteht ein Bibliotheksprojekt mit der Beschreibung `umsatz_nim.nimble`, der Bibliothek in `src` und einem Test in `tests`. Den Namen des Autors übernimmt nimble aus den Git-Einstellungen.

```bash
nimble init -y
```

**Prüfen:** Die letzte Zeile lautet `Success: Package umsatz_nim created successfully`.

### 11. Beispielmodul entfernen

Die Vorlage enthält ein Untermodul, das hier nicht gebraucht wird.

```bash
rm -r src/umsatz_nim
```

### 12. Programm in der Projektbeschreibung eintragen

```bash
nano umsatz_nim.nimble
```

Füge unter der Zeile `srcDir        = "src"` diese Zeile ein:

```text
bin           = @["umsatz"]
```

Damit baut nimble zusätzlich zur Bibliothek das Programm `umsatz` aus `src/umsatz.nim`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Bibliothek schreiben

```bash
nano src/umsatz_nim.nim
```

Lösche den bisherigen Inhalt (mehrmals <kbd>Strg</kbd>+<kbd>K</kbd>) und füge diesen ein:

```nim
import std/[tables, strutils]

proc summen*(zeilen: seq[string]): CountTable[string] =
  ## Zählt den Umsatz je Modell zusammen.
  ## Jede Zeile hat die Form "Modell;Anzahl;Preis".
  for zeile in zeilen:
    let teile = zeile.split(';')
    result.inc(teile[0], parseInt(teile[1]) * parseInt(teile[2]))
```

- **`*` hinter dem Namen** – macht `summen` außerhalb des Moduls sichtbar.
- **`##`** – ein Kommentar für die Dokumentation.
- **`CountTable`** – eine Tabelle, die für jeden Schlüssel eine Zahl führt. `inc` erhöht sie und legt fehlende Einträge an.
- **`result`** – der Rückgabewert, den Nim in jeder Funktion schon bereitstellt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. Programm schreiben

```bash
nano src/umsatz.nim
```

Die Datei ist neu. Füge diesen Inhalt ein:

```nim
import std/[os, strformat, strutils, tables]
import umsatz_nim

if paramCount() != 1:
  quit("Aufruf: umsatz DATEI", 1)

var tabelle = summen(readFile(paramStr(1)).strip.splitLines)
tabelle.sort()   # absteigend nach Umsatz
for modell, betrag in tabelle:
  echo &"{modell:<12} {betrag:>5} Euro"
```

- **`paramCount` und `paramStr`** – Anzahl und Inhalt der Argumente beim Aufruf. `quit` beendet das Programm mit einer Meldung und dem Rückgabewert 1.
- **`readFile(…).strip.splitLines`** – liest die Datei, entfernt den Zeilenumbruch am Ende und zerlegt sie in Zeilen.
- **`sort`** – ordnet eine `CountTable` nach den Zahlen, die größte zuerst.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. Test schreiben

```bash
nano tests/test1.nim
```

Lösche den bisherigen Inhalt und füge diesen ein:

```nim
import std/[unittest, tables]
import umsatz_nim

test "Umsatz je Modell zusammenzählen":
  let s = summen(@["A;2;10", "B;1;50", "A;1;10"])
  check s["A"] == 30
  check s["B"] == 50
  check s.len == 2
```

`test` legt einen benannten Test an, `check` prüft eine Bedingung und meldet bei einem Fehler beide Seiten des Vergleichs.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Tests ausführen

```bash
nimble test
```

**Prüfen:** Die Ausgabe enthält `[OK] Umsatz je Modell zusammenzählen` und endet mit `Success: All tests passed`.

### 17. Datei mit Verkäufen anlegen

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

### 18. Programm bauen

```bash
nimble build -d:release
```

**Prüfen:** Die Meldung lautet `Building umsatz_nim/umsatz using c backend`, und im Projektordner liegt das Programm `umsatz`.

### 19. Programm starten

```bash
./umsatz verkauf.csv
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike      4144 Euro
Lastenrad     3490 Euro
Trekkingrad    899 Euro
```

## Wie geht es weiter?

- **Bibliotheken:** `nimble install NAME` lädt Pakete aus dem Verzeichnis <https://nimble.directory> nach `~/.nimble`. In der `.nimble`-Datei trägt man sie unter `requires` ein.
- **Code formatieren:** `nimpretty datei.nim` bringt den Quelltext in die übliche Form.
- **Nach JavaScript übersetzen:** `nim js datei.nim` erzeugt JavaScript für den Browser statt eines Programms.
- **Editor:** Der Sprachserver nimlangserver bringt Autovervollständigung in [Visual Studio Code](vscode.md) (Erweiterung „Nim“) und [Neovim](neovim.md).
- **Dokumentation:** Lernpfad, Handbuch und Bibliotheksreferenz unter <https://nim-lang.org/documentation.html>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/nim-uebung ~/umsatz_nim
```

### 2. Zwischenspeicher und Daten von nimble entfernen

```bash
rm -rf ~/.cache/nim ~/.nimble
```

### 3. Nim entfernen

`gcc` bleibt installiert, weil es meist auch für anderes gebraucht wird.

```bash
sudo apt purge nim
```

**Prüfen:** Der Befehl `nim` wird nicht mehr gefunden.

```bash
nim --version
```
