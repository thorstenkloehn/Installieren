# Racket

Racket ist eine Programmiersprache aus der Familie von Lisp und Scheme. Sie ist bekannt für ihren Einsatz in der Lehre, etwa mit dem Buch „How to Design Programs“, und dafür, dass man mit ihr leicht eigene kleine Sprachen baut. Jede Racket-Datei beginnt deshalb mit einer Zeile `#lang`, die sagt, in welcher Sprache sie geschrieben ist. Racket bringt eine umfangreiche Standardbibliothek mit, unter anderem für JSON, Webserver und Tests.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **Racket 8.18**. Die Pakete sind groß, installiert rund 440 MB.
- **Ohne grafische Oberfläche:** Racket empfiehlt GTK-Bibliotheken für die Entwicklungsumgebung DrRacket und für Grafik, außerdem die Dokumentation. Diese Anleitung arbeitet im Terminal und installiert mit `--no-install-recommends`, das sind 2 statt 9 Pakete. DrRacket startet dann nicht.
- **Befehle:** `racket` führt Programme aus und startet die Konsole. `raco` ist das Werkzeug für alles andere: Tests (`raco test`), eigenständige Programme (`raco exe`) und Pakete (`raco pkg`).
- **Version:** Getestet mit Racket **8.18** (Chez-Scheme-Fassung „cs“) aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Racket installieren

```bash
sudo apt install --no-install-recommends racket
```

**Prüfen:** Die Ausgabe lautet `Welcome to Racket v8.18 [cs].`

```bash
racket --version
```

## Erste Schritte

### 3. Konsole starten

Die Eingabezeile ist ein `>`.

```bash
racket
```

### 4. Etwas ausprobieren

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>:

```racket
(+ 1 2 3)
```

```racket
(map (lambda (x) (* x x)) (list 1 2 3 4))
```

**Prüfen:** Die Antworten lauten `6` und `'(1 4 9 16)`. Das Hochkomma zeigt, dass das Ergebnis eine Liste ist. Beende die Konsole mit <kbd>Strg</kbd>+<kbd>D</kbd>.

## Ein einzelnes Programm

### 5. Übungsordner anlegen

```bash
mkdir ~/racket-uebung
```

### 6. In den Ordner wechseln

```bash
cd ~/racket-uebung
```

### 7. Quelltext anlegen

```bash
nano lager.rkt
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```racket
#lang racket

(struct fahrrad (modell preis anzahl))

(define bestand
  (list (fahrrad "Citybike" 699 4)
        (fahrrad "Trekkingrad" 899 0)
        (fahrrad "Lastenrad" 3490 1)))

(define (status rad)
  (if (> (fahrrad-anzahl rad) 0)
      (format "~a auf Lager" (fahrrad-anzahl rad))
      "ausverkauft"))

(for ([rad bestand] [nummer (in-naturals 1)])
  (printf "~a. ~a ~a Euro, ~a\n"
          nummer
          (~a (fahrrad-modell rad) #:min-width 12)
          (~a (fahrrad-preis rad) #:min-width 5 #:align 'right)
          (status rad)))

(define lieferbar
  (map fahrrad-modell (filter (λ (rad) (> (fahrrad-anzahl rad) 0)) bestand)))
(printf "Sofort lieferbar: ~a\n" (string-join lieferbar ", "))
(printf "Lagerwert: ~a Euro\n"
        (for/sum ([rad bestand]) (* (fahrrad-preis rad) (fahrrad-anzahl rad))))
```

- **`#lang racket`** – die Datei ist in der vollen Sprache Racket geschrieben.
- **`struct`** – legt einen Datentyp mit Feldern an. Racket erzeugt dazu von selbst den Konstruktor `fahrrad` und Zugriffsfunktionen wie `fahrrad-preis`.
- **`define`** – legt einen Wert oder eine Funktion an. `(define (status rad) …)` ist eine Funktion mit dem Parameter `rad`.
- **`for` mit zwei Folgen** – geht Bestand und `in-naturals 1` (1, 2, 3, …) gleichzeitig durch.
- **`~a`** – wandelt einen Wert in Text um. `#:min-width` und `#:align` sind benannte Argumente zum Auffüllen.
- **`λ`** – eine namenlose Funktion, gleichbedeutend mit `lambda`.
- **`for/sum`** – eine Schleife, die die Ergebnisse gleich addiert.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Programm ausführen

```bash
racket lager.rkt
```

**Prüfen:** Die Ausgabe lautet:

```text
1. Citybike       699 Euro, 4 auf Lager
2. Trekkingrad    899 Euro, ausverkauft
3. Lastenrad     3490 Euro, 1 auf Lager
Sofort lieferbar: Citybike, Lastenrad
Lagerwert: 6286 Euro
```

## Module, Tests und ein eigenständiges Programm

### 9. Projektordner anlegen

```bash
mkdir ~/umsatz-rkt
```

### 10. In den Projektordner wechseln

```bash
cd ~/umsatz-rkt
```

### 11. Modul mit Tests anlegen

Jede Racket-Datei ist ein Modul. Die Tests stehen in einem Untermodul in derselben Datei.

```bash
nano umsatz.rkt
```

Füge diesen Inhalt ein:

```racket
#lang racket

(provide summen)

;; Zählt den Umsatz je Modell zusammen.
;; Jede Zeile hat die Form "Modell;Anzahl;Preis".
(define (summen zeilen)
  (for/fold ([tabelle (hash)])
            ([zeile zeilen])
    (match-define (list modell anzahl preis) (string-split zeile ";"))
    (hash-update tabelle modell
                 (λ (alt) (+ alt (* (string->number anzahl) (string->number preis))))
                 0)))

(module+ test
  (require rackunit)
  (define s (summen '("A;2;10" "B;1;50" "A;1;10")))
  (check-equal? (hash-ref s "A") 30)
  (check-equal? (hash-ref s "B") 50)
  (check-equal? (hash-count s) 2))
```

- **`provide`** – macht `summen` für andere Dateien sichtbar.
- **`for/fold`** – eine Schleife, die einen Wert mitführt, hier die Tabelle. Sie beginnt mit der leeren Tabelle `(hash)` und liefert am Ende die gefüllte.
- **Unveränderliche Tabelle** – `hash-update` verändert die Tabelle nicht, sondern liefert eine neue mit dem erhöhten Eintrag. Fehlt der Eintrag, beginnt er bei 0.
- **`match-define`** – zerlegt die Liste aus `string-split` in drei Namen.
- **`module+ test`** – ein Untermodul nur für Tests. Es wird ausgeführt, wenn man `raco test` aufruft, nicht beim normalen Laden. `check-equal?` aus `rackunit` vergleicht zwei Werte.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Tests ausführen

```bash
raco test umsatz.rkt
```

**Prüfen:** Die Ausgabe endet mit `3 tests passed`.

### 13. Hauptprogramm anlegen

```bash
nano main.rkt
```

Füge diesen Inhalt ein:

```racket
#lang racket

(require json "umsatz.rkt")

(module+ main
  (define datei
    (command-line #:args (datei) datei))
  (define tabelle (summen (file->lines datei)))
  (for ([eintrag (sort (hash->list tabelle) > #:key cdr)])
    (printf "~a ~a Euro\n"
            (~a (car eintrag) #:min-width 12)
            (~a (cdr eintrag) #:min-width 5 #:align 'right)))
  (with-output-to-file "umsatz.json" #:exists 'replace
    (λ () (write-json (for/hasheq ([(modell betrag) tabelle])
                        (values (string->symbol modell) betrag)))))
  (displayln "Gespeichert: umsatz.json"))
```

- **`require`** – lädt die JSON-Bibliothek und das eigene Modul.
- **`module+ main`** – dieser Teil läuft nur, wenn die Datei als Programm gestartet wird.
- **`command-line`** – wertet die Argumente aus. Fehlt der Dateiname, meldet Racket das selbst.
- **`file->lines`** – liest eine Datei als Liste von Zeilen.
- **`write-json`** – erwartet Schlüssel als Symbole. `string->symbol` wandelt die Modellnamen deshalb um.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

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

```bash
racket main.rkt verkauf.csv
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike      4144 Euro
Lastenrad     3490 Euro
Trekkingrad    899 Euro
Gespeichert: umsatz.json
```

Die Datei `umsatz.json` enthält `{"Citybike":4144,"Lastenrad":3490,"Trekkingrad":899}`. Ohne Dateiname meldet das Programm `expects 1 <datei> on the command line, given 0 arguments`.

### 16. Eigenständiges Programm erzeugen

`raco exe` übersetzt das Programm samt Modulen in eine einzige Datei `umsatz`, rund 13 MB groß. Sie verwendet die installierte Racket-Laufzeit.

```bash
raco exe -o umsatz main.rkt
```

**Prüfen:** Die Ausgabe gleicht der aus Schritt 15.

```bash
./umsatz verkauf.csv
```

### 17. Für andere Rechner zusammenpacken (optional)

`raco distribute` legt den Ordner `paket` an, der zusätzlich die Racket-Laufzeit enthält, zusammen rund 58 MB. Den ganzen Ordner kann man auf einen Rechner ohne Racket kopieren und dort `paket/bin/umsatz` starten.

```bash
raco distribute paket umsatz
```

## Wie geht es weiter?

- **Entwicklungsumgebung:** Mit `sudo apt install racket` samt Empfehlungen kommen GTK und die Dokumentation dazu. Dann startet `drracket` die grafische Entwicklungsumgebung mit Editor, Konsole und Schritt-für-Schritt-Ausführung.
- **Lehrsprachen:** `#lang htdp/bsl` und weitere Lehrsprachen gehören zum Buch „How to Design Programs“, das unter <https://htdp.org> frei lesbar ist.
- **Pakete:** `raco pkg install NAME` lädt Pakete aus dem Verzeichnis <https://pkgs.racket-lang.org>.
- **Eigene Sprachen:** Mit Makros (`define-syntax`) und `#lang` lassen sich eigene Sprachen bauen. Das Buch „Beautiful Racket“ zeigt das an Beispielen.
- **Dokumentation:** Leitfaden und Referenz unter <https://docs.racket-lang.org>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/racket-uebung ~/umsatz-rkt
```

### 2. Racket entfernen

```bash
sudo apt purge racket racket-common
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

`apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

### 4. Einstellungen entfernen (optional)

Racket kann Einstellungen und mit `raco pkg` installierte Pakete in diesem Ordner ablegen.

```bash
rm -rf ~/.local/share/racket
```

**Prüfen:** Der Befehl `racket` wird nicht mehr gefunden.

```bash
racket --version
```
