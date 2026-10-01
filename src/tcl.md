# Tcl

Tcl (Tool Command Language, gesprochen wie „tickle“) ist eine kleine Skriptsprache, in der alles ein Befehl mit Wörtern ist. Sie ist leicht in andere Programme einzubauen und steckt deshalb in vielen Werkzeugen, etwa in Programmen für den Chipentwurf, in Testautomaten und in der Datenbank SQLite, deren Tests in Tcl geschrieben sind. Mit Tk gehört außerdem eine einfache Bibliothek für grafische Oberflächen dazu.

## Vorbemerkungen

- **Meist schon installiert:** Ubuntu 26.04 bringt **Tcl 8.6** oft schon mit, weil Systemprogramme wie `usb-modeswitch` es brauchen. Der Befehl heißt `tclsh`. Die neue Version 9.0 gibt es zusätzlich im Paket `tcl9.0` mit dem Befehl `tclsh9.0`. Die Beispiele dieser Anleitung laufen mit beiden Versionen.
- **tcllib:** Die Standardbibliothek von Tcl ist klein. Die Sammlung tcllib ergänzt viele Pakete, etwa für CSV und JSON. Sie kommt als einziges zusätzliches Paket dazu.
- **Tcl nicht entfernen:** Weil `usb-modeswitch` von Tcl abhängt, entfernt die Deinstallation am Ende nur tcllib. Ohne `usb-modeswitch` funktionieren manche USB-Modems und -Sticks nicht mehr.
- **Version:** Getestet mit Tcl **8.6.17** und 9.0.3 sowie tcllib 2.0 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Tcl und tcllib installieren

Ist Tcl schon vorhanden, installiert `apt` nur tcllib.

```bash
sudo apt install tcl tcllib
```

**Prüfen:** Die Ausgabe lautet `8.6.17` oder eine neuere Version 8.6.

```bash
echo 'puts [info patchlevel]' | tclsh
```

## Erste Schritte

### 3. Konsole starten

Die Eingabezeile ist ein `%`.

```bash
tclsh
```

### 4. Etwas ausprobieren

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>:

```tcl
set preis 699
```

```tcl
expr {$preis * 4}
```

```tcl
puts "Vier Citybikes kosten [expr {$preis * 4}] Euro"
```

**Prüfen:** Die Antworten lauten `699`, `2796` und `Vier Citybikes kosten 2796 Euro`. `$preis` liest den Wert einer Variablen, eckige Klammern führen einen Befehl aus und setzen sein Ergebnis ein. Beende die Konsole mit `exit`.

## Ein einzelnes Skript

### 5. Übungsordner anlegen

```bash
mkdir ~/tcl-uebung
```

### 6. In den Ordner wechseln

```bash
cd ~/tcl-uebung
```

### 7. Skript anlegen

```bash
nano lager.tcl
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```tcl
# Lagerbestand eines Fahrradladens

set bestand {
    {Citybike     699 4}
    {Trekkingrad  899 0}
    {Lastenrad   3490 1}
}

proc status {anzahl} {
    if {$anzahl > 0} {
        return "$anzahl auf Lager"
    }
    return "ausverkauft"
}

set nummer 0
set wert 0
set lieferbar {}
foreach rad $bestand {
    lassign $rad modell preis anzahl
    incr nummer
    puts [format "%d. %-12s %5d Euro, %s" $nummer $modell $preis [status $anzahl]]
    incr wert [expr {$preis * $anzahl}]
    if {$anzahl > 0} {
        lappend lieferbar $modell
    }
}

puts "Sofort lieferbar: [join $lieferbar {, }]"
puts "Lagerwert: $wert Euro"
```

- **Alles ist ein Befehl** – jede Zeile beginnt mit einem Befehl wie `set`, `proc` oder `puts`, danach folgen seine Wörter.
- **Listen** – der Bestand ist eine Liste aus Listen, geschrieben in geschweiften Klammern. Leerzeichen trennen die Elemente.
- **Geschweifte Klammern** – schützen ihren Inhalt vor dem sofortigen Auswerten. Deshalb stehen der Rumpf von `proc` und die Bedingung von `if` darin.
- **`lassign`** – verteilt die Elemente einer Liste auf Variablen.
- **`incr` und `lappend`** – erhöhen eine Zahl bzw. hängen ein Element an eine Liste an.
- **`expr {…}`** – rechnet. Die geschweiften Klammern gehören dazu und machen die Rechnung schneller und sicherer.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Skript ausführen

```bash
tclsh lager.tcl
```

**Prüfen:** Die Ausgabe lautet:

```text
1. Citybike       699 Euro, 4 auf Lager
2. Trekkingrad    899 Euro, ausverkauft
3. Lastenrad     3490 Euro, 1 auf Lager
Sofort lieferbar: Citybike, Lastenrad
Lagerwert: 6286 Euro
```

## Namensraum, tcllib und Tests

### 9. Projektordner anlegen

```bash
mkdir ~/umsatz-tcl
```

### 10. In den Projektordner wechseln

```bash
cd ~/umsatz-tcl
```

### 11. Funktion in einem Namensraum anlegen

```bash
nano umsatz.tcl
```

Füge diesen Inhalt ein:

```tcl
package require csv

namespace eval umsatz {
    namespace export summen

    # Zählt den Umsatz je Modell zusammen.
    # Jede Zeile hat die Form "Modell;Anzahl;Preis".
    proc summen {zeilen} {
        set ergebnis [dict create]
        foreach zeile $zeilen {
            lassign [csv::split $zeile ";"] modell anzahl preis
            dict incr ergebnis $modell [expr {$anzahl * $preis}]
        }
        return $ergebnis
    }
}
```

- **`package require csv`** – lädt das CSV-Paket aus tcllib. `csv::split` zerlegt eine Zeile und beachtet dabei auch Anführungszeichen.
- **`namespace eval`** – legt den Namensraum `umsatz` an. Die Funktion heißt von außen `umsatz::summen`.
- **`dict`** – ein Wörterbuch. `dict incr` erhöht einen Eintrag und legt ihn an, falls es ihn noch nicht gibt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Hauptprogramm anlegen

```bash
nano main.tcl
```

Füge diesen Inhalt ein:

```tcl
package require json::write
source [file join [file dirname [info script]] umsatz.tcl]

if {$argc != 1} {
    puts stderr "Aufruf: tclsh main.tcl DATEI"
    exit 1
}

set kanal [open [lindex $argv 0]]
set zeilen [split [string trim [read $kanal]] "\n"]
close $kanal

set tabelle [umsatz::summen $zeilen]
foreach {modell betrag} [lsort -stride 2 -index 1 -integer -decreasing $tabelle] {
    puts [format "%-12s %5d Euro" $modell $betrag]
}

set felder {}
dict for {modell betrag} $tabelle {
    lappend felder $modell $betrag
}
json::write indented 0
set aus [open umsatz.json w]
puts $aus [json::write object {*}$felder]
close $aus
puts "Gespeichert: umsatz.json"
```

- **`source`** – lädt die Datei `umsatz.tcl` aus demselben Ordner wie das Skript.
- **`$argc` und `$argv`** – Anzahl und Liste der Argumente beim Aufruf.
- **`open`, `read`, `close`** – öffnen, lesen und schließen eine Datei. `split … "\n"` zerlegt den Inhalt in Zeilen.
- **`lsort -stride 2 -index 1`** – sortiert das Wörterbuch paarweise nach dem zweiten Wert, dem Umsatz, absteigend.
- **`json::write object`** – aus tcllib, baut ein JSON-Objekt. `{*}` breitet die Liste in einzelne Wörter aus.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Datei mit Verkäufen anlegen

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

### 14. Programm starten

```bash
tclsh main.tcl verkauf.csv
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike      4144 Euro
Lastenrad     3490 Euro
Trekkingrad    899 Euro
Gespeichert: umsatz.json
```

Die Datei `umsatz.json` enthält `{"Citybike":4144,"Lastenrad":3490,"Trekkingrad":899}`.

### 15. Tests anlegen

Tcl bringt das Testpaket `tcltest` schon mit.

```bash
nano umsatz.test
```

Füge diesen Inhalt ein:

```tcl
package require tcltest
namespace import tcltest::*
source [file join [file dirname [info script]] umsatz.tcl]

test summen-1 {Umsatz je Modell zusammenzählen} -body {
    umsatz::summen {A;2;10 B;1;50 A;1;10}
} -result {A 30 B 50}

test summen-2 {leere Eingabe} -body {
    umsatz::summen {}
} -result {}

cleanupTests
```

- **`test NAME BESCHREIBUNG -body … -result …`** – führt den Rumpf aus und vergleicht sein Ergebnis mit dem erwarteten Wert. Ein Wörterbuch ist dabei einfach eine Liste aus Schlüsseln und Werten.
- **`cleanupTests`** – gibt am Ende die Zusammenfassung aus.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Tests ausführen

```bash
tclsh umsatz.test
```

**Prüfen:** Die Ausgabe lautet `umsatz.test:	Total	2	Passed	2	Skipped	0	Failed	0`.

## Wie geht es weiter?

- **Grafische Oberflächen:** `sudo apt install tk` installiert Tk. Mit `wish` statt `tclsh` und wenigen Zeilen wie `button .b -text Hallo -command exit; pack .b` entsteht ein Fenster.
- **Tcl 9.0:** `sudo apt install tcl9.0` installiert die neue Version zusätzlich. Sie startet mit `tclsh9.0`, `tclsh` bleibt bei 8.6.
- **Weitere Pakete:** Eine Übersicht über die mehr als 100 Module von tcllib steht unter <https://core.tcl-lang.org/tcllib>.
- **Dokumentation:** Handbuch und Einführungen unter <https://www.tcl-lang.org/doc/>. In der Konsole zeigt `info commands` alle verfügbaren Befehle.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/tcl-uebung ~/umsatz-tcl
```

### 2. tcllib entfernen

Tcl selbst bleibt installiert, weil Systemprogramme es brauchen.

```bash
sudo apt purge tcllib
```

**Prüfen:** Das CSV-Paket wird nicht mehr gefunden, die Meldung lautet `can't find package csv`.

```bash
echo 'package require csv' | tclsh
```
