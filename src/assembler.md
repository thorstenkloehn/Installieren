# Assembler (NASM)

Assembler ist die Programmiersprache, die dem Prozessor am nächsten ist: Jede Zeile entspricht einem Maschinenbefehl. Man arbeitet direkt mit Registern, Speicheradressen und Systemaufrufen. Heute schreibt man ganze Programme selten in Assembler, aber er hilft zu verstehen, was ein Compiler erzeugt, und wird für besonders zeitkritische Teile, Betriebssysteme und die Fehlersuche gebraucht. Diese Anleitung verwendet den Netwide Assembler (NASM) für 64-Bit-Prozessoren von Intel und AMD (x86-64).

## Vorbemerkungen

- **Nur für x86-64:** Assembler ist an den Prozessor gebunden. Die Beispiele laufen auf Rechnern mit Intel- oder AMD-Prozessor unter 64-Bit-Linux, nicht auf ARM-Rechnern wie dem Raspberry Pi.
- **Installation über apt:** Ubuntu 26.04 liefert **NASM 3.01**. Zum Verbinden der übersetzten Teile (Linken) dienen `ld` aus den GNU Binutils und `gcc`, zur Fehlersuche `gdb`. Ist [C](c.md) schon eingerichtet, ist davon alles vorhanden.
- **Intel-Schreibweise:** NASM schreibt Befehle als `mov ziel, quelle`. Der GNU-Assembler und viele Ausgaben von Linux-Werkzeugen verwenden dagegen die umgekehrte AT&T-Schreibweise.
- **Version:** Getestet mit NASM **3.01**, GNU Binutils 2.46 und gcc 15 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. NASM, gcc und gdb installieren

Sind `gcc` und `gdb` schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install nasm gcc gdb
```

**Prüfen:** Die Ausgabe lautet `NASM version 3.01`.

```bash
nasm -v
```

## Ein Programm nur mit Systemaufrufen

### 3. Übungsordner anlegen

```bash
mkdir ~/asm-uebung
```

### 4. In den Ordner wechseln

```bash
cd ~/asm-uebung
```

### 5. Quelltext anlegen

Das Programm gibt einen Text aus und beendet sich. Es benutzt keine Bibliothek, sondern bittet den Linux-Kern direkt per Systemaufruf darum.

```bash
nano hallo.asm
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```nasm
; Gibt einen Text aus und beendet sich – nur mit Systemaufrufen von Linux
section .data
    text    db  "Hallo aus Assembler!", 10   ; 10 = Zeilenumbruch
    laenge  equ $ - text                      ; Länge des Texts in Bytes

section .text
    global _start

_start:
    mov     rax, 1          ; Systemaufruf 1: write
    mov     rdi, 1          ; Ausgabekanal 1: Standardausgabe
    mov     rsi, text       ; Adresse des Texts
    mov     rdx, laenge     ; Anzahl der Bytes
    syscall

    mov     rax, 60         ; Systemaufruf 60: exit
    xor     rdi, rdi        ; Rückgabewert 0
    syscall
```

- **Abschnitte** – `section .data` enthält Daten, `section .text` den Code.
- **`db`** – legt Bytes im Speicher ab, hier den Text. `equ $ - text` berechnet beim Übersetzen die Länge: `$` ist die aktuelle Adresse.
- **Register** – `rax`, `rdi`, `rsi`, `rdx` sind 64-Bit-Speicherplätze im Prozessor. Für einen Systemaufruf stehen in `rax` seine Nummer und in `rdi`, `rsi`, `rdx` die Werte, die er braucht.
- **`syscall`** – übergibt an den Linux-Kern. `write` (Nummer 1) schreibt die Bytes, `exit` (Nummer 60) beendet das Programm.
- **`xor rdi, rdi`** – setzt ein Register auf 0, ein üblicher Kniff, weil der Befehl kürzer ist als `mov rdi, 0`.
- **`_start`** – an dieser Stelle beginnt das Programm. `global` macht den Namen für den Linker sichtbar.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Übersetzen

`-f elf64` erzeugt eine Objektdatei im 64-Bit-Format von Linux, hier `hallo.o`.

```bash
nasm -f elf64 hallo.asm
```

### 7. Linken

`ld` macht aus der Objektdatei ein ausführbares Programm.

```bash
ld -o hallo hallo.o
```

### 8. Programm starten

```bash
./hallo
```

**Prüfen:** Die Ausgabe lautet `Hallo aus Assembler!`. Das Programm ist knapp 9 KB groß, und `file hallo` meldet `statically linked`.

## Eine Assembler-Funktion für C

Häufiger als ganze Programme schreibt man einzelne Funktionen in Assembler und ruft sie aus [C](c.md) auf. Die Funktion hier berechnet den Lagerwert aus zwei Listen mit Preisen und Anzahlen.

### 9. Funktion in Assembler anlegen

```bash
nano lagerwert.asm
```

Füge diesen Inhalt ein:

```nasm
; long lagerwert(const int *preis, const int *anzahl, long n)
; Summe aus preis[i] * anzahl[i] für i = 0 … n-1
; Die Parameter kommen nach der System-V-Aufrufkonvention in rdi, rsi, rdx,
; das Ergebnis geht in rax zurück.

section .text
    global lagerwert

lagerwert:
    xor     rax, rax                ; Summe = 0
    xor     rcx, rcx                ; i = 0
.schleife:
    cmp     rcx, rdx                ; i < n ?
    jge     .fertig
    movsxd  r8, dword [rdi + rcx*4] ; preis[i] laden (4 Byte, mit Vorzeichen erweitern)
    movsxd  r9, dword [rsi + rcx*4] ; anzahl[i] laden
    imul    r8, r9                  ; preis[i] * anzahl[i]
    add     rax, r8                 ; zur Summe addieren
    inc     rcx                     ; i++
    jmp     .schleife
.fertig:
    ret

section .note.GNU-stack noalloc noexec nowrite progbits
```

- **Aufrufkonvention** – Linux legt fest, in welchen Registern eine Funktion ihre Parameter bekommt (`rdi`, `rsi`, `rdx`, …) und wo sie das Ergebnis abliefert (`rax`). Nur deshalb kann C die Funktion aufrufen.
- **Schleife** – `cmp` vergleicht, `jge` springt bei „größer oder gleich“ zum Ende, `jmp` springt zurück an den Anfang. Namen mit Punkt wie `.schleife` gelten nur innerhalb der Funktion.
- **`[rdi + rcx*4]`** – liest aus dem Speicher: die Startadresse der Liste plus Position mal 4, denn ein `int` belegt 4 Bytes. `dword` sagt, dass 4 Bytes gelesen werden. `movsxd` erweitert sie auf 64 Bit.
- **`ret`** – kehrt zum Aufrufer zurück.
- **Letzte Zeile** – kennzeichnet, dass der Code keinen ausführbaren Stapelspeicher braucht. Ohne sie können manche Linker eine Warnung ausgeben oder den Stapel ausführbar machen, was ein Sicherheitsrisiko wäre.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Hauptprogramm in C anlegen

```bash
nano lager.c
```

Füge diesen Inhalt ein:

```c
#include <stdio.h>

long lagerwert(const int *preis, const int *anzahl, long n);

int main(void) {
    const char *modell[] = {"Citybike", "Trekkingrad", "Lastenrad"};
    int preis[] = {699, 899, 3490};
    int anzahl[] = {4, 0, 1};

    for (int i = 0; i < 3; i++)
        printf("%-12s %5d Euro, %d auf Lager\n", modell[i], preis[i], anzahl[i]);
    printf("Lagerwert: %ld Euro\n", lagerwert(preis, anzahl, 3));
    return 0;
}
```

Die Zeile `long lagerwert(…);` sagt dem C-Compiler, wie die Assembler-Funktion aufgerufen wird. Ihren Code findet erst der Linker.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Funktion übersetzen

`-g -F dwarf` schreibt Informationen für den Debugger mit hinein, damit gdb später die Zeilen des Quelltexts zeigen kann.

```bash
nasm -f elf64 -g -F dwarf lagerwert.asm
```

### 12. Alles zusammen übersetzen und linken

`gcc` übersetzt `lager.c` und verbindet es mit `lagerwert.o` und der C-Bibliothek.

```bash
gcc -g -Wall -o lager lager.c lagerwert.o
```

### 13. Programm starten

```bash
./lager
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike       699 Euro, 4 auf Lager
Trekkingrad    899 Euro, 0 auf Lager
Lastenrad     3490 Euro, 1 auf Lager
Lagerwert: 6286 Euro
```

### 14. In die Register schauen

gdb hält das Programm an der Marke `.fertig` an, kurz bevor die Funktion zurückkehrt, und zeigt zwei Register. `-batch` führt die Befehle nach `-ex` der Reihe nach aus und beendet gdb danach.

```bash
gdb -q -batch -ex 'break lagerwert.fertig' -ex run -ex 'info registers rax rcx' ./lager
```

**Prüfen:** Die letzten Zeilen lauten:

```text
rax            0x188e              6286
rcx            0x3                 3
```

`rax` enthält das Ergebnis 6286, hexadezimal `0x188e`, und `rcx` den Zähler, der bei 3 stehen geblieben ist.

## Wie geht es weiter?

- **Sehen, was der Compiler erzeugt:** `gcc -O2 -S -masm=intel lager.c` schreibt den Assemblercode zu `lager.c` in die Datei `lager.s`. `objdump -d -M intel lagerwert.o` zeigt die Maschinenbefehle einer Objektdatei.
- **Schritt für Schritt:** In gdb ohne `-batch` geht `stepi` einen Maschinenbefehl weiter, `layout asm` zeigt den Code und `layout regs` die Register laufend an.
- **Systemaufrufe:** Die Nummern aller Systemaufrufe stehen in `/usr/include/x86_64-linux-gnu/asm/unistd_64.h`.
- **Andere Prozessoren:** Für ARM-Rechner gibt es eigene Assembler-Werkzeuge, z. B. im Paket `binutils-aarch64-linux-gnu`.
- **Dokumentation:** Das Handbuch zu NASM steht unter <https://www.nasm.us/docs.html>.

## Deinstallieren

### 1. Übungsordner entfernen

```bash
rm -rf ~/asm-uebung
```

### 2. NASM entfernen

`gcc` und `gdb` bleiben installiert, weil sie meist auch für anderes gebraucht werden.

```bash
sudo apt purge nasm
```

**Prüfen:** Der Befehl `nasm` wird nicht mehr gefunden.

```bash
nasm -v
```
