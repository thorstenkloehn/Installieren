# C++

C++ erweitert C um Klassen, Vorlagen (Templates) und eine umfangreiche Standardbibliothek. Die Sprache wird überall dort eingesetzt, wo hohe Geschwindigkeit zählt: in Spielen, Browsern, Datenbanken, Grafikprogrammen und eingebetteten Systemen.

## Vorbemerkungen

- **Compiler:** Unter Ubuntu übersetzt meist `g++` aus der GNU Compiler Collection (Version 15 in Ubuntu 26.04) den Quelltext. Alternativ gibt es `clang++` (Version 21).
- **Sprachstandard:** C++ erscheint etwa alle drei Jahre in einer neuen Fassung (C++17, C++20, C++23 …). Diese Anleitung nutzt **C++23**, weil es die bequeme Ausgabefunktion `std::println` mitbringt. Der Standard wird beim Übersetzen mit `-std=c++23` gewählt.
- **CMake:** Größere C++-Projekte beschreibt man nicht mit handgeschriebenen Compiler-Aufrufen, sondern mit **CMake**. CMake erzeugt daraus die eigentlichen Bauanweisungen und wird von den meisten Entwicklungsumgebungen direkt verstanden.
- **Grundlagen aus C:** Das Paket `build-essential` ist dasselbe wie in der Anleitung [C](c.md). Wer die schon durchgearbeitet hat, kann Schritt 2 überspringen.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Compiler und Build-Werkzeuge installieren

Installiert `g++`, `gcc`, `make` und die Header-Dateien der Standardbibliotheken.

```bash
sudo apt install build-essential
```

**Prüfen:** Die Versionsnummer wird angezeigt, z. B. `g++ (Ubuntu 15.2.0-…) 15.2.0`.

```bash
g++ --version
```

### 3. CMake installieren

Installiert das Build-System CMake.

```bash
sudo apt install cmake
```

**Prüfen:**

```bash
cmake --version
```

### 4. Debugger installieren

Mit `gdb` lässt sich ein Programm schrittweise ausführen, um Fehler zu finden.

```bash
sudo apt install gdb
```

**Prüfen:**

```bash
gdb --version
```

### 5. Optional: Clang und Hilfswerkzeuge installieren

`clang` bringt den Compiler `clang++` mit, `clang-format` rückt Quelltext einheitlich ein und `clangd` liefert Editoren wie [Visual Studio Code](vscode.md) oder [Neovim](neovim.md) Autovervollständigung und Fehlerhinweise.

```bash
sudo apt install clang clang-format clangd
```

**Prüfen:**

```bash
clang++ --version
```

## Erstes Programm

### 6. Arbeitsordner anlegen

Ein eigener Ordner für die Übungsdateien.

```bash
mkdir -p ~/cpp-uebung
```

### 7. In den Ordner wechseln

Alle folgenden Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/cpp-uebung
```

### 8. Quelltext anlegen

Legt die Datei `main.cpp` an. Das Programm speichert einige Namen in einem `std::vector`, gibt sie nacheinander aus und zählt sie.

```bash
nano main.cpp
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```cpp
#include <print>
#include <string>
#include <vector>

int main()
{
    std::vector<std::string> sprachen{"C", "C++", "Java", "Python"};

    for (const auto& sprache : sprachen) {
        std::println("Ich lerne {}", sprache);
    }
    std::println("Anzahl: {}", sprachen.size());
}
```

### 9. Programm übersetzen

Übersetzt `main.cpp` nach dem Standard C++23 mit eingeschalteten Warnungen in die Datei `hallo`.

```bash
g++ -std=c++23 -Wall -Wextra -g -o hallo main.cpp
```

**Prüfen:** Es erscheint keine Fehlermeldung. Meldet der Compiler `print: No such file or directory`, fehlt der Schalter `-std=c++23`.

### 10. Programm starten

```bash
./hallo
```

**Prüfen:** Die Ausgabe lautet:

```text
Ich lerne C
Ich lerne C++
Ich lerne Java
Ich lerne Python
Anzahl: 4
```

## Projekt mit CMake bauen

### 11. CMake-Beschreibung anlegen

Die Datei `CMakeLists.txt` sagt CMake, wie das Projekt heißt, welcher Sprachstandard gilt und aus welchen Quelldateien das Programm entsteht.

```bash
nano CMakeLists.txt
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```cmake
cmake_minimum_required(VERSION 3.28)
project(hallo LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(hallo main.cpp)
```

### 12. Build-Ordner einrichten

CMake prüft den Compiler und legt im Unterordner `build` alle Bauanweisungen ab. So bleiben die erzeugten Dateien vom Quelltext getrennt.

```bash
cmake -S . -B build
```

**Prüfen:** Die letzte Zeile lautet `-- Build files have been written to: …/cpp-uebung/build`.

### 13. Projekt bauen

Übersetzt das Projekt. Nach Änderungen am Quelltext genügt es, diesen Befehl erneut auszuführen.

```bash
cmake --build build
```

**Prüfen:** Die Meldung `[100%] Built target hallo` erscheint.

### 14. Programm starten

Das fertige Programm liegt im Build-Ordner.

```bash
./build/hallo
```

**Prüfen:** Die Ausgabe ist dieselbe wie in Schritt 10.

## Wie geht es weiter?

- **Entwicklungsumgebung:** [Visual Studio Code](vscode.md) mit den Erweiterungen „C/C++“ und „CMake Tools“ öffnet CMake-Projekte direkt. Auch CLion von JetBrains arbeitet mit CMake.
- **Bibliotheken:** Viele verbreitete C++-Bibliotheken gibt es als Pakete mit der Endung `-dev`, z. B. `libboost-all-dev` für Boost oder `libfmt-dev`. CMake findet sie über `find_package(...)`.
- **Speicherfehler finden:** Die Schalter `-fsanitize=address,undefined` machen falsche Speicherzugriffe und undefiniertes Verhalten beim Ausführen sichtbar.

## Deinstallieren

### 1. Übungsordner entfernen

Löscht Quelltext und Build-Ordner.

```bash
rm -rf ~/cpp-uebung
```

### 2. Zusatzwerkzeuge entfernen

Entfernt CMake, den Debugger und die Clang-Werkzeuge.

```bash
sudo apt purge cmake gdb clang clang-format clangd
```

### 3. Optional: Compiler entfernen

Nur ausführen, wenn nichts anderes den Compiler braucht, z. B. die Anleitung [C](c.md) oder Treiber, die über DKMS übersetzt werden.

```bash
sudo apt purge build-essential
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

Räumt Pakete auf, die nur für die entfernten Programme installiert wurden.

```bash
sudo apt autoremove
```

**Prüfen:** Die Meldung lautet `cmake: Befehl nicht gefunden` bzw. `command not found`.

```bash
cmake --version
```
