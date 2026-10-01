# Ada

Ada ist eine Programmiersprache für Software, die zuverlässig funktionieren muss. Sie steckt in Flugzeugen, Zügen, Satelliten und Medizingeräten. Typen mit festgelegten Wertebereichen, Prüfungen zur Laufzeit und Vor- und Nachbedingungen an Funktionen fangen Fehler früh ab. Die Schreibweise ist ausführlich und erinnert an Pascal.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert den Ada-Compiler **GNAT 14**, einen Teil der GNU Compiler Collection, und das Bauwerkzeug **gprbuild**. Zusammen sind das 17 Pakete.
- **Sprachstand:** GNAT 14 übersetzt ohne Zusatzschalter nach dem Standard Ada 2012. Der Schalter `-gnat2022` schaltet Ada 2022 ein.
- **Bauwerkzeuge:** `gnatmake` übersetzt kleine Programme direkt. Für Projekte beschreibt eine Datei mit der Endung `.gpr` Quellordner, Ausgabeordner und Schalter. `gprbuild` baut danach.
- **Alire:** Für Bibliotheken gibt es den Paketmanager Alire (Paket `alire`). Für den Einstieg ist er nicht nötig.
- **Version:** Getestet mit GNAT **14.3.0** und gprbuild 2025.0 aus Ubuntu 26.04. gprbuild nennt sich in seiner Versionsausgabe `GPRBUILD Pro 18.0w`. Das ist eine ungenaue Angabe des Pakets.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. GNAT und gprbuild installieren

```bash
sudo apt install gnat gprbuild
```

**Prüfen:** Die erste Zeile lautet `GNAT 14.3.0`.

```bash
gnat --version
```

## Ein einzelnes Programm

### 3. Übungsordner anlegen

```bash
mkdir ~/ada-uebung
```

### 4. In den Ordner wechseln

```bash
cd ~/ada-uebung
```

### 5. Quelltext anlegen

Ada-Dateien mit einem Programm oder dem Rumpf eines Pakets enden auf `.adb`. Der Dateiname muss zum Namen der Prozedur passen, klein geschrieben.

```bash
nano lager.adb
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```ada
with Ada.Text_IO;           use Ada.Text_IO;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;

procedure Lager is

   function "+" (S : String) return Unbounded_String renames To_Unbounded_String;

   type Fahrrad is record
      Modell : Unbounded_String;
      Preis  : Positive;
      Anzahl : Natural;
   end record;

   type Bestandsliste is array (Positive range <>) of Fahrrad;

   Bestand : constant Bestandsliste :=
     ((Modell => +"Citybike", Preis => 699, Anzahl => 4),
      (Modell => +"Trekkingrad", Preis => 899, Anzahl => 0),
      (Modell => +"Lastenrad", Preis => 3490, Anzahl => 1));

   Wert : Natural := 0;

begin
   for Rad of Bestand loop
      Put (To_String (Rad.Modell));
      Set_Col (14);
      Put (Rad.Preis'Image & " Euro,");
      if Rad.Anzahl > 0 then
         Put_Line (Rad.Anzahl'Image & " auf Lager");
      else
         Put_Line (" ausverkauft");
      end if;
      Wert := Wert + Rad.Preis * Rad.Anzahl;
   end loop;
   Put_Line ("Lagerwert:" & Wert'Image & " Euro");
end Lager;
```

- **`with` und `use`** – `with` bindet ein Paket ein, `use` erlaubt seine Namen ohne Vorsilbe, also `Put_Line` statt `Ada.Text_IO.Put_Line`.
- **Zeichenketten** – ein normaler `String` hat in Ada eine feste Länge. `Unbounded_String` kann beliebig lang sein. Die Funktion `"+"` ist eine Abkürzung für die Umwandlung.
- **`Positive` und `Natural`** – vordefinierte Wertebereiche: ganze Zahlen ab 1 bzw. ab 0. Ein negativer Lagerbestand ist damit gar nicht möglich.
- **`array (Positive range <>)`** – ein Feld, dessen Länge erst beim Anlegen feststeht.
- **`'Image`** – ein Attribut, das eine Zahl in Text umwandelt. Für positive Zahlen beginnt der Text mit einem Leerzeichen.
- **`:=` und `=`** – `:=` weist zu, `=` vergleicht.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Programm übersetzen

`gnatmake` übersetzt die Datei, findet benötigte Pakete selbst und erzeugt das Programm `lager`. `-q` unterdrückt die Fortschrittsmeldungen.

```bash
gnatmake -q lager.adb
```

**Prüfen:** Der Befehl gibt nichts aus. Neben dem Programm liegen die Zwischendateien `lager.ali` und `lager.o`.

### 7. Programm starten

```bash
./lager
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike      699 Euro, 4 auf Lager
Trekkingrad   899 Euro, ausverkauft
Lastenrad     3490 Euro, 1 auf Lager
Lagerwert: 6286 Euro
```

## Ein Projekt mit geprüften Wertebereichen

Das Projekt berechnet einen Preis nach Rabatt. Der Rabatt darf nur zwischen 0 und 50 Prozent liegen. Ada prüft das selbst.

### 8. Projektordner anlegen

```bash
mkdir -p ~/rabatt/src
```

### 9. In den Projektordner wechseln

```bash
cd ~/rabatt
```

### 10. Projektdatei anlegen

```bash
nano rabatt.gpr
```

Füge diesen Inhalt ein:

```ada
project Rabatt is
   for Source_Dirs use ("src");
   for Object_Dir use "obj";
   for Exec_Dir use "bin";
   for Main use ("haupt.adb");

   package Compiler is
      for Default_Switches ("Ada") use ("-gnatwa", "-gnata", "-gnat2022");
   end Compiler;
end Rabatt;
```

- **`Source_Dirs`, `Object_Dir`, `Exec_Dir`** – Quelltexte liegen in `src`, Zwischendateien in `obj`, das fertige Programm in `bin`. gprbuild legt die beiden Ausgabeordner selbst an.
- **`Main`** – die Datei mit dem Hauptprogramm.
- **Schalter** – `-gnatwa` schaltet fast alle Warnungen ein, `-gnata` prüft Vor- und Nachbedingungen zur Laufzeit, `-gnat2022` erlaubt Ada 2022.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Paketspezifikation anlegen

Die Spezifikation (Endung `.ads`) beschreibt, was ein Paket nach außen anbietet.

```bash
nano src/preise.ads
```

Füge diesen Inhalt ein:

```ada
package Preise is

   --  Ein Rabatt liegt immer zwischen 0 und 50 Prozent
   subtype Prozent is Natural range 0 .. 50;

   --  Preis in Cent, damit keine Rundungsfehler entstehen
   subtype Cent is Natural;

   function Nach_Rabatt (Preis : Cent; Rabatt : Prozent) return Cent
     with Post => Nach_Rabatt'Result <= Preis;

   function Als_Text (Betrag : Cent) return String;

end Preise;
```

- **`subtype Prozent is Natural range 0 .. 50`** – ein eigener Wertebereich. Jede Zuweisung eines Werts außerhalb davon löst zur Laufzeit den Fehler `Constraint_Error` aus.
- **`with Post => …`** – eine Nachbedingung: Der Preis nach Rabatt ist nie höher als vorher. Mit `-gnata` prüft das Programm das bei jedem Aufruf.
- **Kommentare** beginnen mit `--`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Paketrumpf anlegen

Der Rumpf (Endung `.adb`) enthält den Code zu den Funktionen der Spezifikation.

```bash
nano src/preise.adb
```

Füge diesen Inhalt ein:

```ada
package body Preise is

   function Nach_Rabatt (Preis : Cent; Rabatt : Prozent) return Cent is
   begin
      return Preis - Preis * Rabatt / 100;
   end Nach_Rabatt;

   function Als_Text (Betrag : Cent) return String is
      --  'Image liefert eine Zahl mit führendem Leerzeichen, z. B. " 699"
      Euro : constant String := Natural'Image (Betrag / 100);
      --  100 addieren, damit der Cent-Teil immer zwei Ziffern hat: 5 -> " 105"
      Rest : constant String := Natural'Image (Betrag mod 100 + 100);
   begin
      return Euro (Euro'First + 1 .. Euro'Last) & "," & Rest (Rest'Last - 1 .. Rest'Last) & " Euro";
   end Als_Text;

end Preise;
```

- **Ganzzahlrechnung** – `/` teilt ganze Zahlen ohne Rest, `mod` liefert den Rest. Aus 59 415 Cent werden so 594 Euro und 15 Cent.
- **Ausschnitte** – `Euro (Euro'First + 1 .. Euro'Last)` schneidet das führende Leerzeichen ab, `Rest (Rest'Last - 1 .. Rest'Last)` nimmt die letzten zwei Ziffern.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Hauptprogramm anlegen

```bash
nano src/haupt.adb
```

Füge diesen Inhalt ein:

```ada
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Command_Line;
with Preise;      use Preise;

procedure Haupt is
   Preis  : constant Cent := 69_900;
   Rabatt : Prozent;
begin
   if Ada.Command_Line.Argument_Count /= 1 then
      Put_Line ("Aufruf: haupt RABATT");
      return;
   end if;

   Rabatt := Prozent'Value (Ada.Command_Line.Argument (1));
   Put_Line ("Listenpreis:   " & Als_Text (Preis));
   Put_Line ("Rabatt:       " & Rabatt'Image & " %");
   Put_Line ("Endpreis:      " & Als_Text (Nach_Rabatt (Preis, Rabatt)));
exception
   when Constraint_Error =>
      Put_Line ("Ungültiger Rabatt: erlaubt sind 0 bis 50 Prozent.");
end Haupt;
```

- **`69_900`** – Unterstriche in Zahlen dienen nur der Lesbarkeit.
- **`Prozent'Value (…)`** – wandelt den Text des ersten Arguments in eine Zahl um. Ist er keine Zahl oder liegt er außerhalb von 0 bis 50, löst das einen `Constraint_Error` aus.
- **`exception … when`** – fängt den Fehler am Ende der Prozedur ab und gibt eine verständliche Meldung aus.
- **`/=`** – bedeutet „ungleich“.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. Projekt bauen

`-P` nennt die Projektdatei.

```bash
gprbuild -q -P rabatt.gpr
```

**Prüfen:** Der Befehl gibt nichts aus, auch keine Warnungen. Das Programm liegt in `bin/haupt`.

### 15. Mit gültigem Rabatt starten

```bash
bin/haupt 15
```

**Prüfen:** Die Ausgabe lautet:

```text
Listenpreis:   699,00 Euro
Rabatt:        15 %
Endpreis:      594,15 Euro
```

### 16. Mit ungültigem Rabatt starten

```bash
bin/haupt 75
```

**Prüfen:** Die Ausgabe lautet `Ungültiger Rabatt: erlaubt sind 0 bis 50 Prozent.` Dasselbe erscheint bei einer Eingabe wie `abc`.

### 17. Nachbedingung ausprobieren (optional)

Ändere in `src/preise.adb` in der Funktion `Nach_Rabatt` das Minus in ein Plus (`return Preis + Preis * Rabatt / 100;`), baue neu und starte erneut mit `bin/haupt 15`. Der Preis wäre jetzt höher als vorher, und das Programm bricht mit `raised ADA.ASSERTIONS.ASSERTION_ERROR : failed postcondition from preise.ads:10` ab. Mache die Änderung danach wieder rückgängig.

### 18. Zwischendateien entfernen

`gprclean` löscht alles, was gprbuild erzeugt hat, in `obj` und `bin`.

```bash
gprclean -q -P rabatt.gpr
```

## Wie geht es weiter?

- **Beweisen statt testen:** Mit SPARK, einer Teilmenge von Ada, lassen sich Eigenschaften wie „kein Überlauf möglich“ mathematisch nachweisen. Das Werkzeug dafür heißt GNATprove.
- **Bibliotheken:** Alire (`sudo apt install alire`, Befehl `alr`) legt Projekte an und lädt Bibliotheken aus seinem Verzeichnis <https://alire.ada.dev>.
- **Nebenläufigkeit:** Ada hat eingebaute Tasks und geschützte Objekte für Programme, die mehrere Dinge gleichzeitig tun.
- **Editor:** Die Erweiterung „Ada & SPARK“ für [Visual Studio Code](vscode.md) bringt Autovervollständigung und Fehleranzeige.
- **Dokumentation:** Ein Lernpfad mit Beispielen zum Ausprobieren unter <https://learn.adacore.com>, der Sprachstandard unter <https://ada-lang.io>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/ada-uebung ~/rabatt
```

### 2. GNAT und gprbuild entfernen

```bash
sudo apt purge gnat gprbuild
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Pakete, die nur für Ada mitinstalliert wurden, z. B. `gnat-14` und `gcc-14`. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `gnat` wird nicht mehr gefunden.

```bash
gnat --version
```
