# Common Lisp (SBCL)

Common Lisp ist eine der ältesten noch genutzten Programmiersprachen und zugleich sehr wandelbar. Programme bestehen aus Ausdrücken in Klammern, die selbst wieder Daten sind. Deshalb lässt sich die Sprache mit Makros um eigene Sprachmittel erweitern. Typisch ist das interaktive Arbeiten: Man ändert ein laufendes Programm Stück für Stück, ohne es neu zu starten. SBCL (Steel Bank Common Lisp) ist der verbreitetste freie Compiler und erzeugt schnellen Maschinencode.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **SBCL 2.6** und viele Lisp-Bibliotheken als Pakete mit dem Namen `cl-…`, etwa `cl-ppcre` für reguläre Ausdrücke oder `cl-yason` für JSON. Sie liegen unter `/usr/share/common-lisp` und werden über **ASDF** geladen, das Bauwerkzeug von Common Lisp, das in SBCL eingebaut ist.
- **Ein Packfehler:** Das Paket `cl-yason` braucht die Bibliothek alexandria, zieht das Paket `cl-alexandria` aber nicht selbst mit. Ohne sie meldet ASDF `Component :ALEXANDRIA not found`. Die Anleitung installiert es deshalb ausdrücklich.
- **Quicklisp:** Viele Anleitungen im Netz verwenden Quicklisp, einen Paketmanager, der Bibliotheken aus dem Internet lädt. Er ist nicht in den Ubuntu-Paketquellen. Für den Einstieg reichen die Bibliotheken aus `apt`.
- **Version:** Getestet mit SBCL **2.6.0** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. SBCL und Bibliotheken installieren

- `sbcl` – der Compiler samt Konsole
- `cl-ppcre` – reguläre Ausdrücke, hier zum Zerlegen von Zeilen
- `cl-yason` und `cl-alexandria` – JSON samt der fehlenden Abhängigkeit

```bash
sudo apt install sbcl cl-ppcre cl-yason cl-alexandria
```

**Prüfen:** Die Ausgabe lautet `SBCL 2.6.0.debian`.

```bash
sbcl --version
```

## Erste Schritte

### 3. Konsole starten

Die Eingabezeile ist ein Sternchen `*`.

```bash
sbcl
```

### 4. Etwas ausprobieren

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>. In Lisp steht die Funktion immer am Anfang der Klammer:

```lisp
(+ 1 2 3)
```

```lisp
(mapcar (lambda (x) (* x x)) (list 1 2 3 4))
```

**Prüfen:** Die Antworten lauten `6` und `(1 4 9 16)`. `mapcar` wendet die namenlose Funktion (`lambda`) auf jedes Element der Liste an. Beende die Konsole mit `(exit)`.

## Ein Skript

### 5. Übungsordner anlegen

```bash
mkdir ~/lisp-uebung
```

### 6. In den Ordner wechseln

```bash
cd ~/lisp-uebung
```

### 7. Skript anlegen

```bash
nano lager.lisp
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```lisp
;;;; Lagerbestand eines Fahrradladens

(defstruct fahrrad modell preis anzahl)

(defparameter *bestand*
  (list (make-fahrrad :modell "Citybike"    :preis 699  :anzahl 4)
        (make-fahrrad :modell "Trekkingrad" :preis 899  :anzahl 0)
        (make-fahrrad :modell "Lastenrad"   :preis 3490 :anzahl 1)))

(defun status (rad)
  (if (plusp (fahrrad-anzahl rad))
      (format nil "~D auf Lager" (fahrrad-anzahl rad))
      "ausverkauft"))

(defun lagerwert (raeder)
  (loop for rad in raeder
        sum (* (fahrrad-preis rad) (fahrrad-anzahl rad))))

(dolist (rad *bestand*)
  (format t "~12A ~5D Euro, ~A~%" (fahrrad-modell rad) (fahrrad-preis rad) (status rad)))

(format t "Sofort lieferbar: ~{~A~^, ~}~%"
        (mapcar #'fahrrad-modell (remove-if-not #'plusp *bestand* :key #'fahrrad-anzahl)))
(format t "Lagerwert: ~D Euro~%" (lagerwert *bestand*))
```

- **`defstruct`** – legt eine Struktur mit benannten Feldern an. Lisp erzeugt dazu von selbst `make-fahrrad` zum Anlegen und `fahrrad-preis` usw. zum Lesen.
- **`defparameter`** – eine globale Variable. Die Sternchen im Namen sind Brauch für globale Variablen.
- **`defun`** – definiert eine Funktion. `plusp` prüft, ob eine Zahl größer als 0 ist.
- **`loop … sum`** – eine Schleife, die gleich mitzählt.
- **`format`** – gibt formatiert aus. `t` schreibt ins Terminal, `nil` liefert den Text zurück. `~A` ist ein beliebiger Wert, `~D` eine ganze Zahl, `~%` ein Zeilenumbruch. `~{~A~^, ~}` gibt eine Liste mit Kommas dazwischen aus.
- **`#'`** – verweist auf eine Funktion, damit man sie an eine andere Funktion übergeben kann, wie bei `remove-if-not`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Skript ausführen

`--script` führt die Datei aus und beendet SBCL danach.

```bash
sbcl --script lager.lisp
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike       699 Euro, 4 auf Lager
Trekkingrad    899 Euro, ausverkauft
Lastenrad     3490 Euro, 1 auf Lager
Sofort lieferbar: Citybike, Lastenrad
Lagerwert: 6286 Euro
```

## Ein Projekt mit ASDF

ASDF findet Projekte von selbst, wenn sie im Ordner `~/common-lisp` liegen. Das Projekt liest Verkäufe aus einer Datei, zählt den Umsatz je Modell zusammen und schreibt ihn als JSON.

### 9. Projektordner anlegen

```bash
mkdir -p ~/common-lisp/umsatz
```

### 10. In den Projektordner wechseln

```bash
cd ~/common-lisp/umsatz
```

### 11. Systembeschreibung anlegen

Die Datei mit der Endung `.asd` beschreibt das Projekt für ASDF.

```bash
nano umsatz.asd
```

Füge diesen Inhalt ein:

```lisp
(defsystem "umsatz"
  :description "Zählt Umsätze je Modell zusammen"
  :depends-on ("cl-ppcre" "yason")
  :components ((:file "umsatz"))
  :build-operation "program-op"
  :build-pathname "umsatz"
  :entry-point "umsatz:main")
```

- **`:depends-on`** – die Bibliotheken, die ASDF vorher lädt. Sie kommen aus den Ubuntu-Paketen.
- **`:components`** – die Quelldateien, hier nur `umsatz.lisp`.
- **`:build-operation "program-op"`** – beim Bauen entsteht ein eigenständiges Programm namens `umsatz`, das mit der Funktion `umsatz:main` startet.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Programm anlegen

```bash
nano umsatz.lisp
```

Füge diesen Inhalt ein:

```lisp
(defpackage :umsatz
  (:use :cl)
  (:export #:main #:summen))

(in-package :umsatz)

(defun zeile-zerlegen (zeile)
  "\"Citybike;2;699\" -> (\"Citybike\" 2 699)"
  (destructuring-bind (modell anzahl preis) (cl-ppcre:split ";" zeile)
    (list modell (parse-integer anzahl) (parse-integer preis))))

(defun summen (verkaeufe)
  "Liefert eine Hash-Tabelle Modell -> Umsatz."
  (let ((tabelle (make-hash-table :test #'equal)))
    (loop for (modell anzahl preis) in verkaeufe
          do (incf (gethash modell tabelle 0) (* anzahl preis)))
    tabelle))

(defun main ()
  (let ((datei (second sb-ext:*posix-argv*)))
    (unless datei
      (format t "Aufruf: umsatz DATEI~%")
      (sb-ext:exit :code 1))
    (let* ((zeilen (with-open-file (ein datei)
                     (loop for zeile = (read-line ein nil) while zeile collect zeile)))
           (tabelle (summen (mapcar #'zeile-zerlegen zeilen)))
           (liste (loop for modell being the hash-keys of tabelle using (hash-value betrag)
                        collect (cons modell betrag))))
      (dolist (eintrag (sort liste #'> :key #'cdr))
        (format t "~12A ~5D Euro~%" (car eintrag) (cdr eintrag)))
      (with-open-file (aus "umsatz.json" :direction :output :if-exists :supersede)
        (yason:encode tabelle aus))
      (format t "Gespeichert: umsatz.json~%"))))
```

- **`defpackage` und `in-package`** – ein Paket ist ein eigener Namensraum. `:export` macht `main` und `summen` von außen als `umsatz:main` und `umsatz:summen` erreichbar.
- **`destructuring-bind`** – zerlegt die Liste aus `cl-ppcre:split` in drei Namen.
- **Hash-Tabelle** – `(gethash modell tabelle 0)` liest einen Eintrag oder liefert 0. `incf` erhöht ihn. `:test #'equal` sorgt dafür, dass Texte nach ihrem Inhalt verglichen werden.
- **`sb-ext:*posix-argv*`** – die Argumente beim Aufruf. Das erste ist der Programmname, das zweite der Dateiname.
- **`with-open-file`** – öffnet eine Datei und schließt sie am Ende des Blocks sicher wieder.
- **`yason:encode`** – schreibt die Hash-Tabelle als JSON-Objekt.

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

### 14. Programm bauen

SBCL lädt ASDF, übersetzt das Projekt samt Bibliotheken und speichert das Ergebnis als Programm. `--non-interactive` beendet SBCL danach. Die vielen Zeilen mit `;` am Anfang sind Meldungen des Compilers.

```bash
sbcl --non-interactive --eval '(require :asdf)' --eval '(asdf:make "umsatz")'
```

**Prüfen:** Im Ordner liegt das Programm `umsatz`. Es ist rund 37 MB groß, weil es das ganze Lisp-System enthält, und läuft auch auf Rechnern ohne SBCL.

### 15. Programm starten

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

### 16. Projekt in der Konsole ausprobieren

So arbeitet man in Lisp meist: Man lädt das Projekt in die Konsole und ruft einzelne Funktionen auf. Starte dazu `sbcl` und gib ein:

```lisp
(require :asdf)
```

```lisp
(asdf:load-system "umsatz")
```

```lisp
(gethash "A" (umsatz:summen (list (list "A" 2 10) (list "B" 1 50) (list "A" 1 10))))
```

**Prüfen:** Die letzte Antwort lautet `30` und `T`. Das zweite Ergebnis `T` bedeutet, dass der Eintrag gefunden wurde. Beende die Konsole mit `(exit)`.

## Wie geht es weiter?

- **Bequemer arbeiten:** [Emacs](emacs.md) mit SLIME (Paket `slime`) oder SLY verbindet den Editor mit einer laufenden Lisp-Konsole. Man schickt einzelne Funktionen per Tastendruck an Lisp und sieht das Ergebnis sofort.
- **Weitere Bibliotheken:** `apt search cl-` listet die Lisp-Bibliotheken von Ubuntu. Eingetragen werden sie in der `.asd`-Datei unter `:depends-on`.
- **Makros:** Mit `defmacro` schreibt man eigene Sprachmittel, etwa eine eigene Schleifenform. Das ist die bekannteste Besonderheit von Lisp.
- **Dokumentation:** Das Nachschlagewerk zum Sprachstandard heißt HyperSpec, ein freies Lehrbuch ist „Practical Common Lisp“. Eine Übersicht bietet <https://lisp-lang.org>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/lisp-uebung ~/common-lisp/umsatz
```

Ist `~/common-lisp` danach leer, entfernt `rmdir` auch diesen Ordner. Liegen dort noch andere Projekte, meldet der Befehl nur, dass der Ordner nicht leer ist.

```bash
rmdir ~/common-lisp
```

### 2. Zwischenspeicher von ASDF entfernen

ASDF legt übersetzte Dateien in `~/.cache/common-lisp` ab.

```bash
rm -rf ~/.cache/common-lisp
```

### 3. SBCL und Bibliotheken entfernen

```bash
sudo apt purge sbcl cl-ppcre cl-yason cl-alexandria
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

`apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `sbcl` wird nicht mehr gefunden.

```bash
sbcl --version
```
