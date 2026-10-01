# OCaml

OCaml ist eine funktionale Programmiersprache mit einem strengen, aber unauffälligen Typsystem: Der Compiler erkennt die Typen fast immer selbst und findet trotzdem viele Fehler vor dem ersten Start. OCaml übersetzt in schnellen Maschinencode. Eingesetzt wird es etwa für Compiler, Werkzeuge zur Programmprüfung und im Finanzhandel.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **OCaml 5.4** im Paket `ocaml`, das Bauwerkzeug **dune** im Paket `ocaml-dune` und viele Bibliotheken als Pakete mit dem Namen `lib…-ocaml-dev`. Diese Anleitung kommt damit vollständig aus.
- **opam:** Viele Anleitungen im Netz verwenden opam, den Paketmanager der OCaml-Gemeinschaft. Er lädt Compiler und Bibliotheken in den Home-Ordner und übersetzt sie dort. Er ist bei Ubuntu ebenfalls als Paket erhältlich, für den Einstieg aber nicht nötig.
- **Bausteine:** `ocaml` ist die interaktive Konsole, `ocamlopt` der Compiler für Maschinencode, `ocamlfind` findet installierte Bibliotheken, `dune` baut Projekte.
- **Version:** Getestet mit OCaml **5.4.0**, dune 3.20.2 und yojson 3.0 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. OCaml, dune und die JSON-Bibliothek installieren

- `ocaml` – Compiler und Konsole
- `ocaml-dune` – das Bauwerkzeug `dune`
- `ocaml-findlib` – das Werkzeug `ocamlfind`, über das dune die Bibliotheken findet
- `libyojson-ocaml-dev` – die Bibliothek yojson zum Lesen und Schreiben von JSON

```bash
sudo apt install ocaml ocaml-dune ocaml-findlib libyojson-ocaml-dev
```

**Prüfen:** Die Ausgabe lautet `The OCaml toplevel, version 5.4.0`.

```bash
ocaml -version
```

## Erste Schritte

### 3. Konsole starten

Die Eingabezeile beginnt mit `#`.

```bash
ocaml
```

### 4. Etwas ausprobieren

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>. In der Konsole endet jede Eingabe mit zwei Semikolons.

```ocaml
let quadrat x = x * x;;
```

```ocaml
List.map quadrat [1; 2; 3; 4];;
```

**Prüfen:** Die Antworten lauten `val quadrat : int -> int = <fun>` und `- : int list = [1; 4; 9; 16]`. OCaml hat selbst erkannt, dass `quadrat` eine ganze Zahl bekommt und liefert. Beende die Konsole mit `#quit;;`.

## Ein einzelnes Programm

### 5. Übungsordner anlegen

```bash
mkdir ~/ocaml-uebung
```

### 6. In den Ordner wechseln

```bash
cd ~/ocaml-uebung
```

### 7. Quelltext anlegen

```bash
nano lager.ml
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```ocaml
type fahrrad = { modell : string; preis : int; anzahl : int }

let bestand =
  [
    { modell = "Citybike"; preis = 699; anzahl = 4 };
    { modell = "Trekkingrad"; preis = 899; anzahl = 0 };
    { modell = "Lastenrad"; preis = 3490; anzahl = 1 };
  ]

let status rad =
  match rad.anzahl with
  | 0 -> "ausverkauft"
  | n -> string_of_int n ^ " auf Lager"

let lagerwert raeder =
  List.fold_left (fun summe rad -> summe + (rad.preis * rad.anzahl)) 0 raeder

let () =
  List.iter
    (fun rad -> Printf.printf "%-12s %5d Euro, %s\n" rad.modell rad.preis (status rad))
    bestand;
  let lieferbar =
    bestand |> List.filter (fun rad -> rad.anzahl > 0) |> List.map (fun rad -> rad.modell)
  in
  Printf.printf "Sofort lieferbar: %s\n" (String.concat ", " lieferbar);
  Printf.printf "Lagerwert: %d Euro\n" (lagerwert bestand)
```

- **`type fahrrad = { … }`** – ein Verbund mit drei benannten Feldern. Listen schreibt man mit eckigen Klammern und trennt die Elemente mit Semikolons.
- **`match … with`** – unterscheidet Fälle nach dem Wert. `n` fängt alle übrigen Zahlen ab und gibt ihnen einen Namen.
- **`^`** – hängt Texte aneinander.
- **`List.fold_left`** – geht die Liste durch und sammelt dabei einen Wert auf, hier die Summe, beginnend bei 0.
- **`|>`** – reicht ein Ergebnis an die nächste Funktion weiter. So liest sich die Kette von links nach rechts: filtern, dann die Modellnamen herausziehen.
- **`let () = …`** – der Startpunkt des Programms. Befehle mit Nebenwirkungen wie Ausgaben trennt man mit `;`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Programm direkt ausführen

`ocaml` mit einem Dateinamen führt die Datei aus, ohne ein Programm zu erzeugen.

```bash
ocaml lager.ml
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike       699 Euro, 4 auf Lager
Trekkingrad    899 Euro, ausverkauft
Lastenrad     3490 Euro, 1 auf Lager
Sofort lieferbar: Citybike, Lastenrad
Lagerwert: 6286 Euro
```

### 9. In Maschinencode übersetzen

`ocamlopt` erzeugt ein eigenständiges Programm. Daneben legt es Zwischendateien mit den Endungen `.cmi`, `.cmx` und `.o` an.

```bash
ocamlopt -o lager lager.ml
```

**Prüfen:** Das Programm liefert dieselbe Ausgabe wie in Schritt 8.

```bash
./lager
```

## Ein Projekt mit dune

### 10. In das Home-Verzeichnis wechseln

```bash
cd ~
```

### 11. Projekt anlegen

Legt den Ordner `umsatz` mit drei Teilen an: einer Bibliothek in `lib`, einem Programm in `bin` und einem Test in `test`. Jeder Teil hat eine Datei `dune`, die beschreibt, was dort gebaut wird.

```bash
dune init project umsatz
```

**Prüfen:** Die Meldung lautet `Success: initialized project component named umsatz`.

### 12. In den Projektordner wechseln

```bash
cd ~/umsatz
```

### 13. Bibliothek schreiben

```bash
nano lib/umsatz.ml
```

Die Datei ist neu. Füge diesen Inhalt ein:

```ocaml
(* Verkäufe zusammenzählen *)

type verkauf = { modell : string; anzahl : int; preis : int }

(* Liefert eine Liste von (Modell, Umsatz), nach Umsatz absteigend sortiert *)
let umsatz_je_modell verkaeufe =
  let tabelle = Hashtbl.create 8 in
  List.iter
    (fun v ->
      let bisher = Option.value (Hashtbl.find_opt tabelle v.modell) ~default:0 in
      Hashtbl.replace tabelle v.modell (bisher + (v.anzahl * v.preis)))
    verkaeufe;
  Hashtbl.to_seq tabelle |> List.of_seq
  |> List.sort (fun (_, a) (_, b) -> compare b a)

let als_json umsaetze =
  `Assoc (List.map (fun (modell, betrag) -> (modell, `Int betrag)) umsaetze)
```

- **Modul aus Dateinamen:** Die Datei `umsatz.ml` wird automatisch zum Modul `Umsatz`.
- **`Hashtbl`** – eine Tabelle zum schnellen Nachschlagen. `find_opt` liefert `Some wert` oder `None`. `Option.value … ~default:0` macht daraus eine Zahl.
- **`(_, a)`** – nimmt ein Paar auseinander, `_` steht für einen Wert, der nicht gebraucht wird.
- **`` `Assoc `` und `` `Int ``** – so beschreibt yojson ein JSON-Objekt und eine Zahl.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. Bibliothek mit yojson verbinden

```bash
nano lib/dune
```

Ersetze den Inhalt durch:

```text
(library
 (name umsatz)
 (libraries yojson))
```

`(libraries yojson)` sagt dune, dass die Bibliothek yojson verwendet. dune findet sie über `ocamlfind` unter den installierten Ubuntu-Paketen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. Programm schreiben

```bash
nano bin/main.ml
```

Ersetze den Inhalt durch:

```ocaml
open Umsatz

let verkaeufe =
  [
    { modell = "Citybike"; anzahl = 2; preis = 699 };
    { modell = "Lastenrad"; anzahl = 1; preis = 3490 };
    { modell = "Citybike"; anzahl = 3; preis = 699 };
    { modell = "Trekkingrad"; anzahl = 1; preis = 899 };
    { modell = "Citybike"; anzahl = 1; preis = 649 };
  ]

let () =
  let umsaetze = umsatz_je_modell verkaeufe in
  List.iter (fun (modell, betrag) -> Printf.printf "%-12s %5d Euro\n" modell betrag) umsaetze;
  Yojson.Safe.to_file "umsatz.json" (als_json umsaetze);
  print_endline "Gespeichert: umsatz.json"
```

`open Umsatz` macht alle Namen aus der Bibliothek direkt verfügbar, sodass man `umsatz_je_modell` statt `Umsatz.umsatz_je_modell` schreiben kann. Die Datei `bin/dune` verweist schon auf die Bibliothek.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Programm bauen und starten

`dune exec umsatz` baut das Projekt im Ordner `_build` und startet das Programm.

```bash
dune exec umsatz
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike      4144 Euro
Lastenrad     3490 Euro
Trekkingrad    899 Euro
Gespeichert: umsatz.json
```

Die Datei `umsatz.json` enthält `{"Citybike":4144,"Lastenrad":3490,"Trekkingrad":899}`.

### 17. Test schreiben

```bash
nano test/test_umsatz.ml
```

Ersetze den Inhalt durch:

```ocaml
open Umsatz

let () =
  let ergebnis =
    umsatz_je_modell
      [
        { modell = "A"; anzahl = 2; preis = 10 };
        { modell = "B"; anzahl = 1; preis = 50 };
        { modell = "A"; anzahl = 1; preis = 10 };
      ]
  in
  assert (ergebnis = [ ("B", 50); ("A", 30) ]);
  print_endline "Alle Tests bestanden."
```

`assert` bricht das Programm ab, wenn die Bedingung nicht stimmt. Hier wird geprüft, dass A zusammengezählt wird (30) und B mit dem größeren Umsatz vorne steht.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 18. Test mit der Bibliothek verbinden

Anders als das Programm kennt der Test die Bibliothek noch nicht. Ohne diesen Schritt meldet dune `Unbound module Umsatz`.

```bash
nano test/dune
```

Ersetze den Inhalt durch:

```text
(test
 (name test_umsatz)
 (libraries umsatz))
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 19. Test ausführen

```bash
dune test
```

**Prüfen:** Die Ausgabe lautet `Alle Tests bestanden.` Stimmt das Ergebnis nicht, meldet dune `Assertion failed` mit Datei und Zeile.

## Wie geht es weiter?

- **Bessere Konsole:** `sudo apt install utop` installiert `utop`, eine Konsole mit Farben, Verlauf und Autovervollständigung.
- **Code formatieren:** Nach `sudo apt install ocamlformat` und einer leeren Datei `.ocamlformat` im Projektordner bringt `dune fmt` den Code in eine einheitliche Form.
- **Weitere Bibliotheken:** `apt search ocaml-dev` listet die Bibliotheken von Ubuntu. Eingetragen werden sie in der Datei `dune` unter `libraries`.
- **opam:** Für neuere Versionen oder Bibliotheken, die Ubuntu nicht hat, richtet `sudo apt install opam` und danach `opam init` eine eigene Umgebung im Home-Ordner ein.
- **Editor:** Mit dem Sprachserver ocaml-lsp und der Erweiterung „OCaml Platform“ für [Visual Studio Code](vscode.md) gibt es Typanzeige und Autovervollständigung.
- **Dokumentation:** Einführung und Bibliotheken unter <https://ocaml.org/docs>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/ocaml-uebung ~/umsatz
```

### 2. Zwischenspeicher von dune entfernen

dune hebt Übersetzungsergebnisse in `~/.cache/dune` auf, um spätere Builds zu beschleunigen.

```bash
rm -rf ~/.cache/dune
```

### 3. OCaml und Bibliotheken entfernen

```bash
sudo apt purge ocaml ocaml-dune ocaml-findlib libyojson-ocaml-dev
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

`apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `ocaml` wird nicht mehr gefunden.

```bash
ocaml -version
```
