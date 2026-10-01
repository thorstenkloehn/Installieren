# Fortran

Fortran ist die älteste noch verbreitete Programmiersprache und wurde für Berechnungen in Wissenschaft und Technik geschaffen. Heutiges Fortran hat mit den Lochkarten der 1950er-Jahre wenig gemein: Es bietet Module, Rechnen mit ganzen Feldern auf einmal und Parallelisierung. Wettermodelle, Strömungs- und Klimasimulationen und viele Rechenbibliotheken sind in Fortran geschrieben.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert den GNU-Fortran-Compiler **gfortran 15** und den Fortran Package Manager **fpm** als Pakete. Zusammen sind das sechs Pakete.
- **fpm:** Er legt Projekte an, übersetzt sie, führt Tests aus und lädt Bibliotheken aus Git-Repositorys. Die Version aus Ubuntu meldet sich als `0.8.0, alpha`, obwohl das Paket die Nummer 0.12.0 trägt. Das ist nur eine falsche Angabe im Programm.
- **Git:** `fpm new` legt für jedes neue Projekt ein Git-Repository an und übernimmt Name und E-Mail aus den Git-Einstellungen in die Projektdatei.
- **Version:** Getestet mit gfortran **15.2.0** und fortran-fpm 0.12.0 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. gfortran, fpm und Git installieren

Ist `git` schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install gfortran fortran-fpm git
```

**Prüfen:** Die erste Zeile lautet `GNU Fortran (Ubuntu 15.2.0-16ubuntu1) 15.2.0`.

```bash
gfortran --version
```

## Ein einzelnes Programm

### 3. Übungsordner anlegen

```bash
mkdir ~/fortran-uebung
```

### 4. In den Ordner wechseln

```bash
cd ~/fortran-uebung
```

### 5. Quelltext anlegen

Die Endung `.f90` steht für Fortran in freier Schreibweise, wie es seit Fortran 90 üblich ist.

```bash
nano lager.f90
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```fortran
program lager
  implicit none

  character(len=12) :: modell(3) = [character(len=12) :: "Citybike", "Trekkingrad", "Lastenrad"]
  integer :: preis(3) = [699, 899, 3490]
  integer :: anzahl(3) = [4, 0, 1]
  integer :: i

  do i = 1, size(modell)
    if (anzahl(i) > 0) then
      print '(A12, I6, " Euro", I4, " auf Lager")', modell(i), preis(i), anzahl(i)
    else
      print '(A12, I6, " Euro", "  ausverkauft")', modell(i), preis(i)
    end if
  end do

  print '(A, I0, A)', "Lagerwert: ", sum(preis * anzahl), " Euro"
  print '(A, A)', "Teuerstes Modell: ", trim(modell(maxloc(preis, dim=1)))
end program lager
```

- **`implicit none`** – jede Variable muss angelegt werden. Ohne diese Zeile würde Fortran nach altem Brauch Variablen, die mit `i` bis `n` beginnen, als ganze Zahlen annehmen. Das verursacht leicht Fehler.
- **Felder** – `preis(3)` ist ein Feld mit drei Werten. Die Zählung beginnt bei 1.
- **Rechnen mit ganzen Feldern** – `preis * anzahl` multipliziert die Felder Element für Element, `sum` addiert das Ergebnis. Eine Schleife ist dafür nicht nötig.
- **`maxloc`** – liefert die Position des größten Werts. `trim` entfernt die Leerzeichen, mit denen ein Text auf 12 Zeichen aufgefüllt ist.
- **Ausgabeformat** – `'(A12, I6, …)'` legt fest, wie die Werte erscheinen: `A12` ist ein Text mit 12 Zeichen, `I6` eine ganze Zahl mit 6 Stellen, `I0` eine ganze Zahl ohne führende Leerzeichen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Programm übersetzen

`-Wall` schaltet die Warnungen ein, `-o lager` legt den Namen des Programms fest.

```bash
gfortran -Wall -o lager lager.f90
```

**Prüfen:** Der Befehl gibt nichts aus.

### 7. Programm starten

```bash
./lager
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike       699 Euro   4 auf Lager
Trekkingrad    899 Euro  ausverkauft
Lastenrad     3490 Euro   1 auf Lager
Lagerwert: 6286 Euro
Teuerstes Modell: Lastenrad
```

## Ein Projekt mit fpm

### 8. In das Home-Verzeichnis wechseln

`fpm new` legt den Projektordner im aktuellen Ordner an.

```bash
cd ~
```

### 9. Projekt anlegen

Legt den Ordner `statistik` mit der Projektdatei `fpm.toml`, einem Modul in `src`, einem Hauptprogramm in `app` und einem Test in `test` an.

```bash
fpm new statistik
```

**Prüfen:** Die letzte Zeile lautet `Leeres Git-Repository in /home/…/statistik/.git/ initialisiert`. Hinweise von Git zum Namen des Hauptzweigs davor sind harmlos.

### 10. In den Projektordner wechseln

```bash
cd ~/statistik
```

### 11. Modul schreiben

Ein Modul fasst Funktionen zusammen, die andere Programmteile mit `use` einbinden.

```bash
nano src/statistik.f90
```

Lösche den bisherigen Inhalt (mehrmals <kbd>Strg</kbd>+<kbd>K</kbd>) und füge diesen ein:

```fortran
module statistik
  implicit none
  private

  public :: mittelwert, standardabweichung

  integer, parameter, public :: dp = kind(1.0d0)

contains

  pure function mittelwert(werte) result(m)
    real(dp), intent(in) :: werte(:)
    real(dp) :: m
    m = sum(werte) / size(werte)
  end function mittelwert

  pure function standardabweichung(werte) result(s)
    real(dp), intent(in) :: werte(:)
    real(dp) :: s
    s = sqrt(sum((werte - mittelwert(werte))**2) / (size(werte) - 1))
  end function standardabweichung

end module statistik
```

- **`private` und `public`** – nur die ausdrücklich freigegebenen Namen sind außerhalb des Moduls sichtbar.
- **`dp = kind(1.0d0)`** – die Art für Kommazahlen mit doppelter Genauigkeit (etwa 15 Stellen). `real(dp)` verwendet sie.
- **`pure function`** – eine Funktion ohne Nebenwirkungen. Der Compiler darf sie deshalb besser optimieren.
- **`werte(:)`** – ein Feld beliebiger Länge. `intent(in)` sagt, dass die Funktion es nur liest.
- **`werte - mittelwert(werte)`** – zieht den Mittelwert von jedem Element ab. `**2` quadriert.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Hauptprogramm schreiben

```bash
nano app/main.f90
```

Lösche den bisherigen Inhalt und füge diesen ein:

```fortran
program main
  use statistik, only: dp, mittelwert, standardabweichung
  implicit none

  ! Tageshöchsttemperaturen einer Woche in Grad Celsius (Beispielwerte)
  real(dp), parameter :: temperatur(7) = [18.5_dp, 21.0_dp, 19.5_dp, 23.0_dp, 24.5_dp, 20.0_dp, 17.5_dp]

  print '(A, F6.2, A)', "Mittelwert:          ", mittelwert(temperatur), " Grad"
  print '(A, F6.2, A)', "Standardabweichung:  ", standardabweichung(temperatur), " Grad"
  print '(A, I0)', "Tage über dem Mittel: ", count(temperatur > mittelwert(temperatur))
end program main
```

- **`use statistik, only: …`** – bindet nur die genannten Namen aus dem Modul ein.
- **`18.5_dp`** – die Endung `_dp` macht die Zahl zu einer Zahl doppelter Genauigkeit.
- **`count(temperatur > …)`** – der Vergleich liefert für jedes Element wahr oder falsch, `count` zählt die wahren.
- **`F6.2`** – eine Kommazahl mit 6 Zeichen, davon 2 Nachkommastellen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Projekt übersetzen und starten

`fpm run` übersetzt Modul und Hauptprogramm im Ordner `build` und startet das Programm.

```bash
fpm run
```

**Prüfen:** Nach `Project compiled successfully.` lautet die Ausgabe:

```text
Mittelwert:           20.57 Grad
Standardabweichung:    2.47 Grad
Tage über dem Mittel: 3
```

### 14. Test schreiben

```bash
nano test/check.f90
```

Lösche den bisherigen Inhalt und füge diesen ein:

```fortran
program check
  use statistik, only: dp, mittelwert, standardabweichung
  implicit none

  real(dp), parameter :: werte(4) = [2.0_dp, 4.0_dp, 4.0_dp, 6.0_dp]
  real(dp), parameter :: genauigkeit = 1.0e-12_dp

  if (abs(mittelwert(werte) - 4.0_dp) > genauigkeit) error stop "Mittelwert falsch"
  if (abs(standardabweichung(werte) - sqrt(8.0_dp / 3.0_dp)) > genauigkeit) error stop "Standardabweichung falsch"

  print '(A)', "Alle Tests bestanden."
end program check
```

- **Kommazahlen vergleichen** – wegen Rundungen prüft man nicht auf Gleichheit, sondern ob die Abweichung kleiner als eine Genauigkeit ist.
- **`error stop`** – beendet das Programm mit einer Fehlermeldung. fpm wertet den Test dann als fehlgeschlagen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. Tests ausführen

```bash
fpm test
```

**Prüfen:** Die letzte Zeile lautet `Alle Tests bestanden.`

### 16. Optimiert übersetzen

Ohne weitere Angabe übersetzt fpm mit Prüfungen zur Fehlersuche. `--profile release` schaltet stattdessen die Optimierungen ein. Für große Berechnungen ist das deutlich schneller.

```bash
fpm run --profile release
```

## Wie geht es weiter?

- **Programm installieren:** `fpm install` kopiert das Programm nach `~/.local/bin`, sodass es überall als `statistik` aufrufbar ist.
- **Bibliotheken:** In `fpm.toml` lassen sich unter `[dependencies]` Git-Repositorys eintragen, z. B. die Standardbibliothek stdlib von Fortran-Lang. fpm lädt und übersetzt sie selbst. Rechenbibliotheken wie BLAS und LAPACK gibt es als Ubuntu-Pakete (`libopenblas-dev`, `liblapack-dev`).
- **Parallel rechnen:** gfortran beherrscht OpenMP. Mit `-fopenmp` verteilen Anweisungen wie `!$omp parallel do` Schleifen auf alle Prozessorkerne.
- **Editor:** Der Sprachserver fortls bringt Autovervollständigung in [Visual Studio Code](vscode.md) und [Neovim](neovim.md).
- **Dokumentation:** Einstieg, Übersicht über Bibliotheken und fpm unter <https://fortran-lang.org>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/fortran-uebung ~/statistik
```

### 2. gfortran und fpm entfernen

`git` bleibt installiert, weil es meist auch für anderes gebraucht wird.

```bash
sudo apt purge gfortran fortran-fpm
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Pakete, die nur für gfortran mitinstalliert wurden, z. B. `gfortran-15`. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `gfortran` wird nicht mehr gefunden.

```bash
gfortran --version
```
