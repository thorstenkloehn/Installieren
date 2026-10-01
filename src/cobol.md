# COBOL

COBOL (Common Business Oriented Language) wurde 1959 für die Datenverarbeitung in Unternehmen entworfen. Die Sprache liest sich fast wie Englisch, rechnet mit Dezimalzahlen ohne Rundungsfehler und verarbeitet große Dateien Satz für Satz. Bis heute laufen in Banken, Versicherungen und Behörden viele Kernsysteme in COBOL.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert den freien Compiler **GnuCOBOL 3.2**. Er übersetzt COBOL zunächst in C und lässt dann gcc daraus ein Programm erzeugen. Zusammen mit den Abhängigkeiten sind das sechs Pakete.
- **Feste Spalten:** COBOL-Quelltext hat traditionell ein festes Format. Die Spalten 1 bis 6 sind für Zeilennummern reserviert, Spalte 7 für Sonderzeichen wie `*` für Kommentare. Der eigentliche Code steht in den Spalten 8 bis 72, alles ab Spalte 73 wird ignoriert. Die Beispiele sind deshalb mit sieben Leerzeichen eingerückt.
- **Harmlose Warnung:** Beim Übersetzen meldet gcc jedes Mal `warning: ‘_FORTIFY_SOURCE’ redefined`. GnuCOBOL gibt eine Sicherheitseinstellung mit, die Ubuntu bei gcc schon in anderer Stufe voreingestellt hat. Das Programm ist trotzdem in Ordnung.
- **Version:** Getestet mit GnuCOBOL **3.2.0** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. GnuCOBOL installieren

```bash
sudo apt install gnucobol
```

**Prüfen:** Die erste Zeile lautet `cobc (GnuCOBOL) 3.2.0`.

```bash
cobc --version
```

## Ein erstes Programm

### 3. Übungsordner anlegen

```bash
mkdir ~/cobol-uebung
```

### 4. In den Ordner wechseln

```bash
cd ~/cobol-uebung
```

### 5. Quelltext anlegen

```bash
nano lager.cob
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Die Einrückung muss erhalten bleiben:

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LAGER.

       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SPECIAL-NAMES.
           DECIMAL-POINT IS COMMA.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  BESTAND.
           05  RAD OCCURS 3 TIMES.
               10  MODELL     PIC X(12).
               10  PREIS      PIC 9(5).
               10  ANZAHL     PIC 9(3).
       01  I                  PIC 9.
       01  WERT               PIC 9(7) VALUE 0.
       01  AUS-PREIS          PIC ZZ.ZZ9.
       01  AUS-ANZAHL         PIC ZZ9.
       01  AUS-WERT           PIC Z.ZZZ.ZZ9.

       PROCEDURE DIVISION.
           MOVE "Citybike"    TO MODELL(1)
           MOVE 699           TO PREIS(1)
           MOVE 4             TO ANZAHL(1)
           MOVE "Trekkingrad" TO MODELL(2)
           MOVE 899           TO PREIS(2)
           MOVE 0             TO ANZAHL(2)
           MOVE "Lastenrad"   TO MODELL(3)
           MOVE 3490          TO PREIS(3)
           MOVE 1             TO ANZAHL(3)

           PERFORM VARYING I FROM 1 BY 1 UNTIL I > 3
               MOVE PREIS(I) TO AUS-PREIS
               IF ANZAHL(I) > 0
                   MOVE ANZAHL(I) TO AUS-ANZAHL
                   DISPLAY MODELL(I) AUS-PREIS " Euro," AUS-ANZAHL
                           " auf Lager"
               ELSE
                   DISPLAY MODELL(I) AUS-PREIS " Euro, ausverkauft"
               END-IF
               COMPUTE WERT = WERT + PREIS(I) * ANZAHL(I)
           END-PERFORM

           MOVE WERT TO AUS-WERT
           DISPLAY "Lagerwert:  " AUS-WERT " Euro"
           STOP RUN.
```

- **Divisions** – ein COBOL-Programm hat vier Teile: `IDENTIFICATION` (Name), `ENVIRONMENT` (Umgebung, z. B. Dateien und Zahlenformat), `DATA` (alle Variablen) und `PROCEDURE` (die Anweisungen).
- **`DECIMAL-POINT IS COMMA`** – Zahlen werden wie in Deutschland mit Komma als Dezimalzeichen und Punkt als Tausendertrennzeichen geschrieben.
- **`PIC`** – beschreibt das Format einer Variablen. `X(12)` sind zwölf beliebige Zeichen, `9(5)` fünf Ziffern. Druckformate wie `ZZ.ZZ9` unterdrücken führende Nullen (`Z`) und setzen Tausenderpunkte.
- **Stufennummern** – `01` beginnt einen Datensatz, `05` und `10` sind Unterfelder. `OCCURS 3 TIMES` macht daraus eine Tabelle mit drei Einträgen.
- **`MOVE`, `COMPUTE`, `PERFORM VARYING`** – Wert übertragen, rechnen, Schleife mit Zähler. `MOVE PREIS(I) TO AUS-PREIS` bringt die Zahl dabei in das Druckformat.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Programm übersetzen

`-x` erzeugt ein ausführbares Programm statt eines Moduls zum Nachladen.

```bash
cobc -x lager.cob
```

**Prüfen:** Außer der harmlosen Warnung zu `_FORTIFY_SOURCE` erscheint keine Meldung, und im Ordner liegt das Programm `lager`.

### 7. Programm starten

```bash
./lager
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike       699 Euro,  4 auf Lager
Trekkingrad    899 Euro, ausverkauft
Lastenrad    3.490 Euro,  1 auf Lager
Lagerwert:      6.286 Euro
```

## Eine Datei verarbeiten

Das zweite Programm liest Verkäufe aus einer Datei, rechnet Beträge mit Cent genau aus, schlägt die Umsatzsteuer auf und schreibt einen Bericht in eine neue Datei.

### 8. Datei mit Verkäufen anlegen

```bash
nano verkauf.csv
```

Füge diesen Inhalt ein:

```text
Citybike;2;699,00
Lastenrad;1;3490,00
Citybike;3;699,00
Trekkingrad;1;899,00
Fahrradschloss;4;49,90
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Programm anlegen

```bash
nano bericht.cob
```

Füge diesen Inhalt ein:

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. BERICHT.

       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SPECIAL-NAMES.
           DECIMAL-POINT IS COMMA.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT VERKAUFSDATEI ASSIGN TO "verkauf.csv"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT BERICHTSDATEI ASSIGN TO "bericht.txt"
               ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.
       FD  VERKAUFSDATEI.
       01  VERKAUFSSATZ           PIC X(80).
       FD  BERICHTSDATEI.
       01  BERICHTSZEILE          PIC X(60).

       WORKING-STORAGE SECTION.
       01  DATEIENDE              PIC X VALUE "N".
       01  FELDER.
           05  F-MODELL           PIC X(20).
           05  F-ANZAHL           PIC X(5).
           05  F-PREIS            PIC X(12).
       01  ANZAHL                 PIC 9(3).
       01  PREIS                  PIC 9(5)V99.
       01  BETRAG                 PIC 9(7)V99.
       01  NETTO                  PIC 9(7)V99 VALUE 0.
       01  STEUER                 PIC 9(7)V99.
       01  BRUTTO                 PIC 9(7)V99.
       01  POSTEN                 PIC 99 VALUE 0.
       01  AUS-POSTEN             PIC Z9.
       01  ZEILE.
           05  Z-MODELL           PIC X(16).
           05  Z-ANZAHL           PIC ZZ9.
           05  FILLER             PIC X(3) VALUE " x ".
           05  Z-PREIS            PIC Z.ZZ9,99.
           05  FILLER             PIC X(3) VALUE " = ".
           05  Z-BETRAG           PIC ZZZ.ZZ9,99.
       01  SUMMENZEILE.
           05  S-TEXT             PIC X(33).
           05  S-BETRAG           PIC ZZZ.ZZ9,99.

       PROCEDURE DIVISION.
           OPEN INPUT VERKAUFSDATEI
           OPEN OUTPUT BERICHTSDATEI

           PERFORM UNTIL DATEIENDE = "J"
               READ VERKAUFSDATEI
                   AT END
                       MOVE "J" TO DATEIENDE
                   NOT AT END
                       PERFORM POSTEN-VERARBEITEN
               END-READ
           END-PERFORM

           COMPUTE STEUER ROUNDED = NETTO * 0,19
           COMPUTE BRUTTO = NETTO + STEUER
           MOVE "Summe netto" TO S-TEXT
           MOVE NETTO TO S-BETRAG
           WRITE BERICHTSZEILE FROM SUMMENZEILE
           MOVE "zzgl. 19 % Umsatzsteuer" TO S-TEXT
           MOVE STEUER TO S-BETRAG
           WRITE BERICHTSZEILE FROM SUMMENZEILE
           MOVE "Summe brutto" TO S-TEXT
           MOVE BRUTTO TO S-BETRAG
           WRITE BERICHTSZEILE FROM SUMMENZEILE

           CLOSE VERKAUFSDATEI BERICHTSDATEI
           MOVE POSTEN TO AUS-POSTEN
           DISPLAY AUS-POSTEN " Posten, Bericht in bericht.txt"
           STOP RUN.

       POSTEN-VERARBEITEN.
           UNSTRING VERKAUFSSATZ DELIMITED BY ";"
               INTO F-MODELL F-ANZAHL F-PREIS
           END-UNSTRING
           COMPUTE ANZAHL = FUNCTION NUMVAL(F-ANZAHL)
           COMPUTE PREIS = FUNCTION NUMVAL(F-PREIS)
           COMPUTE BETRAG = ANZAHL * PREIS
           ADD BETRAG TO NETTO
           ADD 1 TO POSTEN
           MOVE F-MODELL TO Z-MODELL
           MOVE ANZAHL TO Z-ANZAHL
           MOVE PREIS TO Z-PREIS
           MOVE BETRAG TO Z-BETRAG
           WRITE BERICHTSZEILE FROM ZEILE.
```

- **`SELECT … ASSIGN TO`** – verbindet einen Namen im Programm mit einer Datei. `LINE SEQUENTIAL` bedeutet: eine Textdatei mit einem Satz pro Zeile.
- **`FD`** – beschreibt den Aufbau eines Satzes der Datei, hier eine Zeile mit bis zu 80 bzw. 60 Zeichen.
- **`PIC 9(5)V99`** – eine Zahl mit fünf Stellen vor und zwei nach dem Komma. `V` markiert das gedachte Komma. COBOL rechnet damit genau, ohne die Rundungsfehler von Gleitkommazahlen.
- **`READ … AT END`** – liest den nächsten Satz. Am Dateiende wird `DATEIENDE` auf „J“ gesetzt und die Schleife beendet.
- **`UNSTRING … DELIMITED BY ";"`** – zerlegt die Zeile an den Semikolons. `FUNCTION NUMVAL` wandelt den Text in eine Zahl um und beachtet dabei das Komma als Dezimalzeichen.
- **`COMPUTE … ROUNDED`** – rechnet die Umsatzsteuer und rundet auf zwei Nachkommastellen.
- **`PERFORM POSTEN-VERARBEITEN`** – ruft den gleichnamigen Abschnitt (Paragraph) am Ende auf.
- **`WRITE … FROM`** – schreibt eine aufbereitete Zeile in die Berichtsdatei. `FILLER` sind feste Textstücke ohne eigenen Namen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Programm übersetzen

```bash
cobc -x bericht.cob
```

**Prüfen:** Außer der Warnung zu `_FORTIFY_SOURCE` erscheint keine Meldung. Ist eine Zeile länger als 72 Zeichen, schneidet COBOL sie ab und meldet einen Fehler wie `continuation character expected`.

### 11. Programm starten

```bash
./bericht
```

**Prüfen:** Die Ausgabe lautet ` 5 Posten, Bericht in bericht.txt`.

### 12. Bericht ansehen

```bash
cat bericht.txt
```

**Prüfen:** Der Bericht lautet:

```text
Citybike          2 x   699,00 =   1.398,00
Lastenrad         1 x 3.490,00 =   3.490,00
Citybike          3 x   699,00 =   2.097,00
Trekkingrad       1 x   899,00 =     899,00
Fahrradschloss    4 x    49,90 =     199,60
Summe netto                        8.083,60
zzgl. 19 % Umsatzsteuer            1.535,88
Summe brutto                       9.619,48
```

## Wie geht es weiter?

- **Freies Format:** Mit `cobc -x -free datei.cob` gelten die festen Spalten nicht mehr, und Zeilen dürfen beliebig lang sein. In älterem Code und in Unternehmen ist das feste Format aber üblich.
- **Programme aufteilen:** Unterprogramme stehen in eigenen Dateien und werden mit `CALL "NAME" USING …` aufgerufen. `cobc -x haupt.cob unter.cob` übersetzt beide zusammen.
- **Weitergeben:** Die Programme brauchen zur Laufzeit die Bibliothek `libcob`. Auf einem anderen Rechner mit Ubuntu genügt dafür das Paket `libcob4t64`.
- **Editor:** Für [Visual Studio Code](vscode.md) gibt es Erweiterungen für COBOL, die Syntax hervorheben und die Spalte 72 markieren.
- **Dokumentation:** Handbuch und Beispiele unter <https://gnucobol.sourceforge.io>.

## Deinstallieren

### 1. Übungsordner entfernen

```bash
rm -rf ~/cobol-uebung
```

### 2. GnuCOBOL entfernen

```bash
sudo apt purge gnucobol gnucobol3
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Pakete, die nur für GnuCOBOL mitinstalliert wurden, z. B. `libcob4t64`. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `cobc` wird nicht mehr gefunden.

```bash
cobc --version
```
