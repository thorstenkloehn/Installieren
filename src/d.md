# D

D ist eine Systemprogrammiersprache, die die Geschwindigkeit von [C](c.md) und [C++](cpp.md) mit dem Komfort moderner Sprachen verbinden will. Sie übersetzt in schnellen Maschinencode, hat aber eine automatische Speicherverwaltung, Bereichs- und Bibliotheksfunktionen im Stil funktionaler Sprachen und eingebaute Tests direkt im Quelltext.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert den Compiler **LDC 1.41**, der auf LLVM aufbaut, und den Paketmanager **dub**. Zusammen sind das sechs Pakete. Daneben gibt es `gdc` aus der GNU Compiler Collection. Der Referenzcompiler DMD ist nicht in den Paketquellen.
- **Befehle:** Der Compiler heißt `ldc2`. `dub` legt Projekte an, baut sie, führt Tests aus und lädt Bibliotheken vom Paketverzeichnis <https://code.dlang.org>.
- **Standardbibliothek:** Die Standardbibliothek Phobos wird fest in jedes Programm eingebunden. Die fertigen Programme brauchen deshalb keine weiteren Bibliotheken.
- **Version:** Getestet mit LDC **1.41.0** und dub 1.40.0 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. LDC und dub installieren

```bash
sudo apt install ldc dub
```

**Prüfen:** Die erste Zeile lautet `LDC - the LLVM D compiler (1.41.0):`.

```bash
ldc2 --version
```

## Ein einzelnes Programm

### 3. Übungsordner anlegen

```bash
mkdir ~/d-uebung
```

### 4. In den Ordner wechseln

```bash
cd ~/d-uebung
```

### 5. Quelltext anlegen

```bash
nano lager.d
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```d
import std.stdio;
import std.algorithm : filter, map, sum;
import std.array : join;

struct Fahrrad
{
    string modell;
    int preis;
    int anzahl;

    string status() const
    {
        import std.conv : to;
        return anzahl > 0 ? anzahl.to!string ~ " auf Lager" : "ausverkauft";
    }
}

void main()
{
    auto bestand = [
        Fahrrad("Citybike", 699, 4),
        Fahrrad("Trekkingrad", 899, 0),
        Fahrrad("Lastenrad", 3490, 1),
    ];

    foreach (i, rad; bestand)
        writefln("%d. %-12s %5d Euro, %s", i + 1, rad.modell, rad.preis, rad.status);

    auto lieferbar = bestand.filter!(r => r.anzahl > 0).map!(r => r.modell);
    writeln("Sofort lieferbar: ", lieferbar.join(", "));
    writeln("Lagerwert: ", bestand.map!(r => r.preis * r.anzahl).sum, " Euro");
}
```

- **`import`** – bindet Module der Standardbibliothek ein. `: filter, map, sum` holt nur die genannten Funktionen.
- **`struct`** – fasst Felder und Methoden zusammen. `const` hinter `status()` sagt, dass die Methode das Fahrrad nicht verändert.
- **`anzahl.to!string`** – wandelt die Zahl in Text um. Das `!` übergibt den Zieltyp als sogenannten Template-Parameter.
- **`~`** – hängt Texte aneinander.
- **`foreach (i, rad; bestand)`** – geht die Liste durch und liefert dabei die Position mit, beginnend bei 0.
- **Ketten** – `bestand.filter!(…).map!(…)` filtert und formt um. `r => r.anzahl > 0` ist eine kurze namenlose Funktion. Aufrufe ohne Argumente dürfen ohne Klammern stehen, deshalb `rad.status` und `.sum`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Programm direkt ausführen

`-run` übersetzt das Programm und startet es gleich.

```bash
ldc2 -run lager.d
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

`-O` schaltet die Optimierungen ein. Es entstehen das Programm `lager` und die Zwischendatei `lager.o`.

```bash
ldc2 -O lager.d
```

**Prüfen:** Das Programm liefert dieselbe Ausgabe wie in Schritt 6 und ist rund 1 MB groß.

```bash
./lager
```

## Ein Projekt mit dub

### 8. In das Home-Verzeichnis wechseln

```bash
cd ~
```

### 9. Projekt anlegen

`-n` übernimmt alle Vorgaben, ohne nachzufragen. Es entstehen die Projektbeschreibung `dub.json` und das Programm `source/app.d`.

```bash
dub init umsatz-d -n
```

**Prüfen:** Die letzte Zeile lautet `Package successfully created in umsatz-d`.

### 10. In den Projektordner wechseln

```bash
cd ~/umsatz-d
```

### 11. Modul mit Test anlegen

```bash
nano source/umsatz.d
```

Die Datei ist neu. Füge diesen Inhalt ein:

```d
module umsatz;

import std.algorithm : splitter;
import std.array : array;
import std.conv : to;

/// Zählt den Umsatz je Modell zusammen.
/// Jede Zeile hat die Form "Modell;Anzahl;Preis".
int[string] summen(string[] zeilen)
{
    int[string] ergebnis;
    foreach (zeile; zeilen)
    {
        auto teile = zeile.splitter(';').array;
        ergebnis[teile[0]] += teile[1].to!int * teile[2].to!int;
    }
    return ergebnis;
}

unittest
{
    auto s = summen(["A;2;10", "B;1;50", "A;1;10"]);
    assert(s["A"] == 30);
    assert(s["B"] == 50);
    assert(s.length == 2);
}
```

- **`module umsatz;`** – der Name des Moduls. Andere Dateien laden es mit `import umsatz;`.
- **`int[string]`** – ein assoziatives Feld, also ein Wörterbuch von Text auf Zahl. `ergebnis[name] += …` legt fehlende Einträge mit 0 an.
- **`///`** – ein Kommentar für die Dokumentation.
- **`unittest`** – ein Test direkt neben dem Code. Er wird nur übersetzt, wenn man Tests ausführt. `assert` bricht ab, wenn eine Bedingung nicht stimmt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Hauptprogramm schreiben

```bash
nano source/app.d
```

Lösche den bisherigen Inhalt (mehrmals <kbd>Strg</kbd>+<kbd>K</kbd>) und füge diesen ein:

```d
import std.stdio;
import std.algorithm : sort;
import std.array : array;
import std.file : readText;
import std.string : lineSplitter;
import umsatz;

int main(string[] args)
{
    if (args.length != 2)
    {
        stderr.writeln("Aufruf: umsatz-d DATEI");
        return 1;
    }

    auto tabelle = summen(readText(args[1]).lineSplitter.array);
    auto modelle = tabelle.keys;
    modelle.sort!((a, b) => tabelle[a] > tabelle[b]);

    foreach (modell; modelle)
        writefln("%-12s %5d Euro", modell, tabelle[modell]);
    return 0;
}
```

- **`int main(string[] args)`** – `args[0]` ist der Programmname, `args[1]` der Dateiname. Der Rückgabewert wird zum Rückgabewert des Programms.
- **`readText` und `lineSplitter`** – lesen die ganze Datei und zerlegen sie in Zeilen.
- **`tabelle.keys`** – die Schlüssel des Wörterbuchs. `sort!` sortiert sie nach dem Umsatz, absteigend.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Tests ausführen

```bash
dub test
```

**Prüfen:** Die Ausgabe endet mit `1 modules passed unittests`.

### 14. Datei mit Verkäufen anlegen

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

### 15. Programm starten

`dub run` baut das Projekt und startet es. Alles nach `--` geht an das Programm.

```bash
dub run -- verkauf.csv
```

**Prüfen:** Nach den Meldungen von dub lautet die Ausgabe:

```text
Citybike      4144 Euro
Lastenrad     3490 Euro
Trekkingrad    899 Euro
```

### 16. Optimiert bauen

`-b release` baut mit Optimierungen und ohne Prüfungen zur Fehlersuche. Das Programm `umsatz-d` liegt danach im Projektordner.

```bash
dub build -b release
```

**Prüfen:** Ohne Dateiname meldet das Programm `Aufruf: umsatz-d DATEI`.

```bash
./umsatz-d
```

## Wie geht es weiter?

- **Bibliotheken:** `dub add NAME` trägt eine Bibliothek von <https://code.dlang.org> in `dub.json` ein. dub lädt sie beim nächsten Bauen selbst nach `~/.dub`.
- **Mit C zusammenarbeiten:** D kann Funktionen aus C-Bibliotheken direkt aufrufen. Mit `extern(C)` deklariert man sie, oder man bindet eine C-Headerdatei mit `import` über ImportC ein.
- **Zur Übersetzungszeit rechnen:** Mit `enum` und `static if` berechnet D Werte schon beim Übersetzen, statt erst beim Programmlauf.
- **Editor:** Der Sprachserver serve-d bringt Autovervollständigung in [Visual Studio Code](vscode.md) (Erweiterung „code-d“) und [Neovim](neovim.md).
- **Dokumentation:** Eine Einführung mit Beispielen zum Ausprobieren unter <https://tour.dlang.org>, die Referenz unter <https://dlang.org>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/d-uebung ~/umsatz-d
```

### 2. Zwischenspeicher von dub entfernen

```bash
rm -rf ~/.dub
```

### 3. LDC und dub entfernen

```bash
sudo apt purge ldc dub
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Pakete, die nur für LDC mitinstalliert wurden, z. B. LLVM 19 und die Standardbibliothek Phobos. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `ldc2` wird nicht mehr gefunden.

```bash
ldc2 --version
```
