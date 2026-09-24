# C

C ist eine schlanke, maschinennahe Programmiersprache, in der Betriebssysteme, Treiber und viele Grundprogramme von Linux geschrieben sind. Wer C lernt, versteht, wie Speicher und Prozessor tatsächlich arbeiten.

## Vorbemerkungen

- **Compiler:** C-Quelltext wird vor dem Start in ein ausführbares Programm übersetzt. Unter Ubuntu ist dafür der **GCC** (GNU Compiler Collection) üblich, in Ubuntu 26.04 in Version 15. Als Alternative gibt es **Clang** (Version 21), das oft verständlichere Fehlermeldungen ausgibt.
- **Paket `build-essential`:** Dieses Sammelpaket enthält alles, was man zum Übersetzen braucht: `gcc`, `g++`, `make` und die Header-Dateien der C-Standardbibliothek. Es ist auch die Grundlage für die Anleitung [C++](cpp.md).
- **Editor:** Zum Schreiben reicht jeder Texteditor, z. B. [GNU nano](nano.md), [Vim](vim.md) oder [Visual Studio Code](vscode.md) mit der Erweiterung „C/C++“.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Compiler und Build-Werkzeuge installieren

Installiert GCC, `make` und die Header-Dateien der Standardbibliothek. Ohne diese Dateien kennt der Compiler z. B. `printf` nicht.

```bash
sudo apt install build-essential
```

**Prüfen:** Die Versionsnummer von GCC wird angezeigt, z. B. `gcc (Ubuntu 15.2.0-…) 15.2.0`.

```bash
gcc --version
```

### 3. Debugger installieren

`gdb` lässt ein Programm Zeile für Zeile ablaufen und zeigt dabei die Werte der Variablen. Das hilft enorm bei der Fehlersuche, gerade bei Abstürzen durch falsche Speicherzugriffe.

```bash
sudo apt install gdb
```

**Prüfen:**

```bash
gdb --version
```

### 4. Optional: Clang installieren

Ein zweiter Compiler ist nützlich, um zu prüfen, ob der eigene Code nicht nur mit GCC funktioniert. Der Befehl heißt danach `clang`.

```bash
sudo apt install clang
```

**Prüfen:**

```bash
clang --version
```

## Erstes Programm

### 5. Arbeitsordner anlegen

Ein eigener Ordner hält die Übungsdateien zusammen.

```bash
mkdir -p ~/c-uebung
```

### 6. In den Ordner wechseln

Alle folgenden Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/c-uebung
```

### 7. Quelltext anlegen

Legt die Datei `hallo.c` an. Das Programm gibt einen Gruß aus und addiert in einer Schleife die Zahlen von 1 bis 10.

```bash
nano hallo.c
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```c
#include <stdio.h>

int main(void)
{
    const char *name = "Ubuntu";
    int summe = 0;

    for (int i = 1; i <= 10; i++) {
        summe += i;
    }

    printf("Hallo %s!\n", name);
    printf("Summe von 1 bis 10: %d\n", summe);
    return 0;
}
```

### 8. Programm übersetzen

Erzeugt aus `hallo.c` die ausführbare Datei `hallo`. Die Schalter bedeuten:

- `-Wall -Wextra` – Warnungen bei verdächtigem Code einschalten; für Einsteiger sehr zu empfehlen.
- `-g` – Informationen für den Debugger einbauen.
- `-o hallo` – Name der erzeugten Datei.

```bash
gcc -Wall -Wextra -g -o hallo hallo.c
```

**Prüfen:** Der Befehl gibt nichts aus, und im Ordner liegt jetzt die Datei `hallo`.

```bash
ls -l hallo
```

### 9. Programm starten

Das `./` sagt der Shell, dass das Programm im aktuellen Ordner liegt.

```bash
./hallo
```

**Prüfen:** Die Ausgabe lautet:

```text
Hallo Ubuntu!
Summe von 1 bis 10: 55
```

### 10. Optional: Mit dem Debugger untersuchen

Startet `gdb` mit dem Programm. Innerhalb von `gdb` setzt `break main` einen Haltepunkt am Anfang von `main`, `run` startet, `next` geht eine Zeile weiter, `print summe` zeigt den Wert der Variablen und `quit` beendet den Debugger.

```bash
gdb ./hallo
```

## Mehrere Dateien mit make übersetzen

Sobald ein Projekt aus mehreren Dateien besteht, ist es mühsam, `gcc` jedes Mal von Hand aufzurufen. `make` liest die Bauanleitung aus einer Datei `Makefile` und übersetzt nur, was sich geändert hat.

### 11. Makefile anlegen

Legt ein einfaches `Makefile` für `hallo.c` an. Wichtig: Die eingerückten Zeilen müssen mit einem **Tabulator** beginnen, nicht mit Leerzeichen. Sonst bricht `make` mit `missing separator` ab.

```bash
nano Makefile
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Beim Einfügen bleiben die Tabulatoren erhalten. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

Willst du den Inhalt lieber abtippen und hast in `~/.nanorc` die Einstellungen aus der Anleitung [GNU nano](nano.md), schalte vorher zwei davon für diese Sitzung ab. <kbd>Alt</kbd>+<kbd>O</kbd> sorgt dafür, dass die Taste <kbd>Tab</kbd> einen echten Tabulator statt Leerzeichen einfügt. <kbd>Alt</kbd>+<kbd>I</kbd> verhindert, dass nano die Einrückung in die nächste Zeile übernimmt und so auch `clean:` einrückt. Drücke dann vor `$(CC)` und vor `rm` jeweils <kbd>Tab</kbd>.

```makefile
CFLAGS = -Wall -Wextra -g

hallo: hallo.c
	$(CC) $(CFLAGS) -o hallo hallo.c

clean:
	rm -f hallo
```

**Prüfen:** Vor `$(CC)` und `rm` steht `^I`, das Zeichen für einen Tabulator.

```bash
cat -A Makefile
```

### 12. Mit make bauen

Löscht zuerst die alte Programmdatei und übersetzt dann neu.

```bash
make clean && make
```

**Prüfen:** `make` zeigt den ausgeführten Befehl an (`cc` ist unter Ubuntu ein anderer Name für `gcc`), und `./hallo` läuft wie in Schritt 9. Ein zweiter Aufruf von `make` meldet `„hallo“ ist bereits aktuell`, weil sich nichts geändert hat.

## Wie geht es weiter?

- **Größere Projekte:** Für Projekte mit vielen Dateien und Bibliotheken ist CMake verbreitet; ein Beispiel steht in der Anleitung [C++](cpp.md).
- **Speicherfehler finden:** Der Schalter `-fsanitize=address` beim Übersetzen lässt das Programm bei falschen Speicherzugriffen sofort mit einer genauen Meldung abbrechen. Das Paket `valgrind` leistet Ähnliches ohne neues Übersetzen.
- **Handbuchseiten:** Zu fast jeder Funktion der Standardbibliothek gibt es eine Beschreibung im Terminal, z. B. `man 3 printf`. Dafür das Paket `manpages-dev` installieren.

## Deinstallieren

### 1. Übungsordner entfernen

Löscht die Beispieldateien.

```bash
rm -rf ~/c-uebung
```

### 2. Debugger und Clang entfernen

Entfernt die Zusatzwerkzeuge aus dieser Anleitung.

```bash
sudo apt purge gdb clang
```

### 3. Optional: Compiler entfernen

Nur ausführen, wenn nichts anderes den Compiler braucht. Auch die Anleitung [C++](cpp.md) sowie Programme, die bei der Installation Code übersetzen (z. B. Treiber über DKMS oder Python-Pakete mit C-Erweiterungen), sind darauf angewiesen.

```bash
sudo apt purge build-essential
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

Räumt Pakete auf, die nur für die entfernten Programme installiert wurden, z. B. `gcc` und `make`.

```bash
sudo apt autoremove
```

**Prüfen:** Die Meldung lautet `gdb: Befehl nicht gefunden` bzw. `command not found`.

```bash
gdb --version
```
