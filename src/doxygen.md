# Doxygen

Doxygen erzeugt aus Kommentaren im Quellcode eine Dokumentation als Website. Es liest die Beschreibungen von Funktionen, Parametern und Rückgabewerten direkt aus den Quelldateien und zeichnet auf Wunsch Diagramme, welche Funktion welche aufruft. Es eignet sich vor allem für C und C++, versteht aber auch Java, Python, C#, PHP und weitere Sprachen.

## Vorbemerkungen

- **Pakete aus Ubuntu:** Doxygen und Graphviz sind in den Ubuntu-Paketquellen enthalten und werden mit `apt` installiert. Graphviz liefert das Programm `dot`, mit dem Doxygen die Diagramme zeichnet.
- **Kein Compiler nötig:** Doxygen liest den Quellcode nur, es übersetzt ihn nicht. Das Beispiel ist in C geschrieben. Wie man C-Programme übersetzt, steht in der Anleitung [C](c.md).
- **Version:** Getestet mit Doxygen **1.15.0** und Graphviz 14.1.2 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Doxygen und Graphviz installieren

```bash
sudo apt install doxygen graphviz
```

**Prüfen:** Der erste Befehl zeigt `1.15.0`, der zweite `dot - graphviz version 14.1.2` (oder jeweils eine neuere Nummer).

```bash
doxygen --version
```

```bash
dot -V
```

## Ein Projekt dokumentieren

### 3. Projektordner anlegen

`-p` legt den Ordner `~/meinrechner` und darin den Unterordner `src` für den Quellcode in einem Schritt an.

```bash
mkdir -p ~/meinrechner/src
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinrechner
```

### 5. Header-Datei mit Kommentaren anlegen

In der Header-Datei stehen die Funktionen, die das Programm anbietet, zusammen mit ihrer Beschreibung.

```bash
nano src/rechner.h
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```c
/**
 * @file rechner.h
 * @brief Einfache Rechenfunktionen.
 */

#ifndef RECHNER_H
#define RECHNER_H

/**
 * @brief Addiert zwei ganze Zahlen.
 *
 * @param a Erster Summand.
 * @param b Zweiter Summand.
 * @return Die Summe von @p a und @p b.
 */
int addiere(int a, int b);

/**
 * @brief Berechnet das Quadrat einer Zahl.
 *
 * @param x Die Zahl.
 * @return @p x mal @p x.
 */
int quadrat(int x);

/**
 * @brief Berechnet a² + b².
 *
 * Nutzt dafür quadrat() und addiere().
 *
 * @param a Erste Zahl.
 * @param b Zweite Zahl.
 * @return Die Summe der Quadrate.
 */
int summe_der_quadrate(int a, int b);

#endif
```

So liest Doxygen die Kommentare:

- Nur Kommentare, die mit `/**` beginnen, gehören zur Dokumentation. Normale Kommentare mit `/*` oder `//` übergeht Doxygen.
- `@file` meldet die Datei bei Doxygen an. Ohne diese Zeile erscheinen Funktionen, die nur in einer Datei stehen, nicht in der Dokumentation.
- `@brief` ist die Kurzbeschreibung für Übersichten. Der Text nach der Leerzeile ist die ausführliche Beschreibung.
- `@param` beschreibt einen Parameter, `@return` den Rückgabewert, `@p` hebt einen Parameternamen im Text hervor.
- Schreibt man im Text einen Funktionsnamen mit `()`, z. B. `quadrat()`, setzt Doxygen einen Link auf deren Beschreibung.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Quelldatei anlegen

Hier stehen die eigentlichen Funktionen. Die Beschreibungen stehen schon in der Header-Datei und werden nicht wiederholt. Nur der `@file`-Kommentar ist nötig. Ohne ihn fehlt der Aufrufgraph in Schritt 9.

```bash
nano src/rechner.c
```

Füge diesen Inhalt ein:

```c
/**
 * @file rechner.c
 * @brief Umsetzung der Rechenfunktionen.
 */

#include "rechner.h"

int addiere(int a, int b)
{
    return a + b;
}

int quadrat(int x)
{
    return x * x;
}

int summe_der_quadrate(int a, int b)
{
    return addiere(quadrat(a), quadrat(b));
}
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. Konfigurationsdatei anlegen

Doxygen liest seine Einstellungen aus der Datei `Doxyfile`. Der Befehl `doxygen -g` würde eine Vorlage mit über 3000 Zeilen erzeugen. Das ist nicht nötig: Es reicht, nur die Einstellungen einzutragen, die vom Standard abweichen.

```bash
nano Doxyfile
```

Füge diesen Inhalt ein:

```text
PROJECT_NAME          = "Mein Rechner"
OUTPUT_LANGUAGE       = German
INPUT                 = src
RECURSIVE             = YES
OUTPUT_DIRECTORY      = doku
OPTIMIZE_OUTPUT_FOR_C = YES
GENERATE_LATEX        = NO
HAVE_DOT              = YES
CALL_GRAPH            = YES
```

- `PROJECT_NAME` – steht oben auf jeder Seite.
- `OUTPUT_LANGUAGE = German` – Überschriften wie „Funktionen“, „Parameter“ und „Rückgabe“ erscheinen auf Deutsch.
- `INPUT` und `RECURSIVE` – Doxygen liest den Ordner `src` samt Unterordnern.
- `OUTPUT_DIRECTORY` – die fertige Dokumentation landet im Ordner `doku`.
- `OPTIMIZE_OUTPUT_FOR_C` – Beschriftungen passend für C statt für C++ (z. B. keine „Klassen“).
- `GENERATE_LATEX = NO` – nur HTML erzeugen, keine LaTeX-Dateien für ein PDF.
- `HAVE_DOT` und `CALL_GRAPH` – mit Graphviz Diagramme zeichnen, auch dazu, welche Funktion welche aufruft.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Dokumentation erzeugen

Ohne weitere Angabe liest `doxygen` die Datei `Doxyfile` im aktuellen Ordner.

```bash
doxygen
```

**Prüfen:** Die Ausgabe endet mit `finished...`. Zeilen mit `warning:` weisen auf Fehler in den Kommentaren hin, z. B. einen falsch geschriebenen Parameternamen, und nennen Datei und Zeile. Die Zeile `Warn for undocumented namespaces...` ist keine Warnung, sondern nur eine Fortschrittsmeldung.

### 9. Dokumentation ansehen

Öffnet die Startseite im Standardbrowser.

```bash
xdg-open doku/html/index.html
```

**Prüfen:** Oben steht „Mein Rechner“ mit dem Suchfeld „Suchen“. Klicke links auf „Dateien“ und dann auf `rechner.h`. Die Seite „rechner.h-Dateireferenz“ listet unter „Funktionen“ die drei Funktionen mit ihren Kurzbeschreibungen. Weiter unten stehen bei jeder Funktion „Parameter“ und „Rückgabe“. Bei `summe_der_quadrate()` zeigt ein Diagramm die Aufrufe von `addiere` und `quadrat`.

Nach jeder Änderung an den Kommentaren führst du Schritt 8 erneut aus und lädst die Seite im Browser neu (<kbd>F5</kbd>).

Der Ordner `doku/html` ist eine fertige statische Website. Jeder Webserver kann ihn ausliefern, zum Beispiel wie in [Statische Website mit nginx](nginx-statisch.md) beschrieben.

## Aktualisieren

Doxygen und Graphviz kommen aus den Ubuntu-Paketquellen und werden mit den normalen Systemupdates aktualisiert.

```bash
sudo apt update && sudo apt upgrade
```

## Deinstallieren

### 1. Doxygen und Graphviz entfernen

`purge` entfernt die Programme samt ihrer Systemdateien. Wer Graphviz für andere Programme weiter braucht, lässt `graphviz` im Befehl weg.

```bash
sudo apt purge doxygen graphviz
```

### 2. Nicht mehr benötigte Pakete entfernen

Entfernt die Bibliotheken, die mit Doxygen und Graphviz installiert wurden, sofern kein anderes Programm sie braucht. Lies vor dem Bestätigen die Liste.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Die Ausgabe enthält `Kommando nicht gefunden`.

```bash
doxygen --version
```

### 3. Projektordner löschen (optional)

**Achtung:** Damit sind auch der Quellcode und die erzeugte Dokumentation gelöscht.

```bash
rm -r ~/meinrechner
```
