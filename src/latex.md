# LaTeX (TeX Live)

LaTeX ist das klassische Satzsystem für wissenschaftliche Arbeiten, Bücher und Dokumente mit vielen Formeln. Man schreibt den Text mit Befehlen in eine Textdatei, und LaTeX setzt daraus ein PDF in Buchdruckqualität. TeX Live ist die Sammlung, die LaTeX samt Schriften und Erweiterungspaketen unter Linux bereitstellt.

## Vorbemerkungen

- **Pakete aus Ubuntu:** TeX Live ist in den Ubuntu-Paketquellen enthalten und in viele Pakete aufgeteilt. Diese Anleitung installiert eine mittlere Auswahl mit etwa 300 MB. Sie reicht für Briefe, Berichte und Abschlussarbeiten auf Deutsch.
- **Größere Auswahl bei Bedarf:** Meldet LaTeX später, dass eine Datei `….sty` fehlt, steckt das Erweiterungspaket meist in `texlive-latex-extra` (Schritt 4). Das Paket `texlive-full` enthält alles, braucht aber mehrere GB.
- **Leichtere Alternative:** Wer nur ab und zu ein Dokument setzt, kommt mit [Typst](typst.md) schneller zum Ziel.
- **Version:** Getestet mit TeX Live 2025 (pdfTeX 1.40.28, LuaHBTeX 1.22.0) und latexmk 4.87 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. TeX Live installieren

Installiert drei Pakete samt Abhängigkeiten:

- `texlive-latex-recommended` – LaTeX selbst mit häufig gebrauchten Erweiterungen, z. B. KOMA-Script für deutsche Dokumente, `booktabs` für Tabellen und die Schrift Latin Modern.
- `texlive-lang-german` – deutsche Silbentrennung und deutsche Beschriftungen wie „Inhaltsverzeichnis“.
- `latexmk` – ein Hilfsprogramm, das LaTeX so oft aufruft, bis Inhaltsverzeichnis und Verweise stimmen.

```bash
sudo apt install texlive-latex-recommended texlive-lang-german latexmk
```

Das Herunterladen und Einrichten dauert einige Minuten.

**Prüfen:** Die erste Zeile beginnt mit `pdfTeX` und enthält `TeX Live 2025`.

```bash
pdflatex --version
```

### 3. latexmk prüfen

**Prüfen:** Die letzte Zeile lautet `Latexmk, John Collins, …` mit einer Versionsnummer.

```bash
latexmk --version
```

### 4. Weitere Erweiterungen installieren (optional)

Nur nötig, wenn ein Dokument eine Erweiterung braucht, die in der Auswahl aus Schritt 2 fehlt. Das erkennst du an der Meldung `! LaTeX Error: File '….sty' not found.` Das Paket bringt mehrere Hundert weitere Erweiterungen mit, z. B. `csquotes`, und belegt etwa 400 MB zusätzlich.

```bash
sudo apt install texlive-latex-extra
```

## Ein Dokument setzen

### 5. Arbeitsordner anlegen

LaTeX erzeugt beim Übersetzen mehrere Hilfsdateien. Ein eigener Ordner hält sie beisammen.

```bash
mkdir ~/meinlatex
```

### 6. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinlatex
```

### 7. Dokument anlegen

LaTeX-Dateien enden auf `.tex`.

```bash
nano dokument.tex
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```latex
\documentclass[a4paper,11pt]{scrartcl}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[ngerman]{babel}
\usepackage{amsmath}
\usepackage{booktabs}

\title{Mein erstes Dokument}
\author{Dein Name}
\date{\today}

\begin{document}
\maketitle
\tableofcontents

\section{Einleitung}
Dieses Dokument wurde mit \textbf{LaTeX} gesetzt. Mit babel trennt LaTeX
deutsche Wörter richtig und beschriftet Inhaltsverzeichnis und Tabellen auf Deutsch.

\section{Eine Formel}
Der Satz des Pythagoras lautet $a^2 + b^2 = c^2$. Abgesetzt:
\begin{equation}
  \sum_{k=1}^{n} k = \frac{n(n+1)}{2}
\end{equation}

\section{Eine Tabelle}
\begin{table}[h]
  \centering
  \begin{tabular}{ll}
    \toprule
    Werkzeug & Eingabeformat \\
    \midrule
    LaTeX & LaTeX-Markup \\
    Typst & Typst-Markup \\
    \bottomrule
  \end{tabular}
  \caption{Zwei Satzsysteme}
\end{table}

\section{Eine Liste}
\begin{enumerate}
  \item Text schreiben
  \item Mit \texttt{latexmk} übersetzen
  \item PDF ansehen
\end{enumerate}

\end{document}
```

So ist die Datei aufgebaut:

- **Vorspann** (bis `\begin{document}`): Hier stehen die Einstellungen.
  - `scrartcl` ist die Dokumentklasse „Artikel“ aus KOMA-Script, die auf deutsche Gepflogenheiten und A4 ausgelegt ist.
  - `fontenc` und `lmodern` sorgen dafür, dass Umlaute richtig gesetzt werden und sich im PDF suchen und kopieren lassen.
  - `babel` mit `ngerman` schaltet die neue deutsche Rechtschreibung für Silbentrennung und Beschriftungen ein.
  - `amsmath` erweitert den Formelsatz, `booktabs` liefert die Linien `\toprule`, `\midrule` und `\bottomrule` für Tabellen.
- **Textteil** (zwischen `\begin{document}` und `\end{document}`):
  - `\maketitle` setzt Titel, Autor und Datum.
  - `\tableofcontents` setzt das Inhaltsverzeichnis.
  - `\section` beginnt einen nummerierten Abschnitt.
  - Zwischen `$…$` steht eine Formel im Text, `equation` setzt eine nummerierte Formel in eine eigene Zeile.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. PDF erzeugen

`-pdf` erzeugt ein PDF mit `pdflatex`. LaTeX muss mehrmals laufen, denn erst beim zweiten Durchgang kennt es die Seitenzahlen für das Inhaltsverzeichnis. `latexmk` übernimmt das selbst.

```bash
latexmk -pdf dokument.tex
```

**Prüfen:** Die Ausgabe endet mit `Latexmk: All targets (dokument.pdf) are up-to-date` oder einer Zeile `Output written on dokument.pdf (2 pages, …)`.

Bei einem Fehler hält LaTeX mit einer Zeile an, die mit `!` beginnt, und wartet auf eine Eingabe hinter `?`. Tippe dann <kbd>X</kbd> und <kbd>Enter</kbd>, um abzubrechen. Die Zeilennummer steht in der Meldung hinter `l.`, z. B. `l.17`.

### 9. PDF ansehen

Öffnet die Datei im Standard-PDF-Betrachter.

```bash
xdg-open dokument.pdf
```

**Prüfen:** Oben stehen Titel, Name und das heutige Datum auf Deutsch, darunter das „Inhaltsverzeichnis“ mit vier Einträgen. Die Summenformel trägt rechts die Nummer (1), unter der Tabelle steht „Tabelle 1: Zwei Satzsysteme“. Die Liste steht auf Seite 2.

### 10. Hilfsdateien entfernen

Neben dem PDF liegen jetzt Dateien wie `dokument.aux`, `dokument.log` und `dokument.toc`. `-c` löscht sie, das PDF und die `.tex`-Datei bleiben erhalten.

```bash
latexmk -c
```

**Prüfen:** Im Ordner liegen nur noch `dokument.tex` und `dokument.pdf`.

```bash
ls
```

## Aktualisieren

TeX Live kommt aus den Ubuntu-Paketquellen und wird mit den normalen Systemupdates aktualisiert. Den Paketmanager `tlmgr` von TeX Live verwendet man bei dieser Installation nicht.

```bash
sudo apt update && sudo apt upgrade
```

## Deinstallieren

### 1. TeX Live entfernen

`purge` entfernt die Pakete samt ihrer Systemdateien. Hast du Schritt 4 ausgelassen, meldet `apt` für `texlive-latex-extra` nur, dass das Paket nicht installiert ist.

```bash
sudo apt purge texlive-latex-recommended texlive-lang-german latexmk texlive-latex-extra
```

### 2. Nicht mehr benötigte Pakete entfernen

Entfernt die Grundpakete, Schriften und Bibliotheken, die mit TeX Live installiert wurden, sofern kein anderes Programm sie braucht. Lies vor dem Bestätigen die Liste.

```bash
sudo apt autoremove --purge
```

Ist auf dem Rechner auch [Sphinx](sphinx.md) installiert, bleibt dabei ein Teil von TeX Live zurück, z. B. `texlive-base`, `texlive-binaries` und `dvisvgm`. Sphinx schlägt diese Pakete für seine PDF-Ausgabe vor, und `apt` behält vorgeschlagene Pakete. Das ist kein Fehler. Die Reste belegen nur Speicherplatz und stören nicht.

**Prüfen:** Die Ausgabe enthält `Kommando nicht gefunden`. Bleiben wegen Sphinx Reste zurück, kann `pdflatex` noch vorhanden sein.

```bash
pdflatex --version
```

### 3. Arbeitsordner löschen (optional)

**Achtung:** Damit sind auch deine Dokumente gelöscht.

```bash
rm -r ~/meinlatex
```
