# Pandoc

Pandoc wandelt Dokumente zwischen vielen Formaten um, zum Beispiel von Markdown nach HTML, Word (`.docx`), LibreOffice (`.odt`) oder PDF und von Word zurück nach Markdown. Es läuft im Terminal und eignet sich deshalb gut, um viele Dateien auf einmal oder immer wieder gleich umzuwandeln.

## Vorbemerkungen

- **Paket aus Ubuntu:** Pandoc ist in den Ubuntu-Paketquellen enthalten und wird mit `apt` installiert.
- **PDF ohne LaTeX:** Pandoc erzeugt PDF-Dateien nicht selbst, sondern über ein weiteres Programm. Üblich ist LaTeX, das aber mehrere Hundert MB groß ist. Diese Anleitung verwendet stattdessen das kleinere **WeasyPrint** aus den Ubuntu-Paketquellen. Es setzt die Seite wie ein Browser aus HTML und CSS.
- **Verhältnis zu Quarto:** [Quarto](quarto.md) bringt ein eigenes Pandoc mit und baut darauf ganze Websites. Pandoc allein ist das schlankere Werkzeug für einzelne Dateien.
- **Version:** Getestet mit Pandoc **3.7.0.2** und WeasyPrint 67.0 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Pandoc installieren

```bash
sudo apt install pandoc
```

**Prüfen:** Die erste Zeile lautet `pandoc 3.7.0.2` (oder eine neuere Nummer).

```bash
pandoc --version
```

### 3. WeasyPrint für PDF installieren (optional)

Nur nötig, wenn du PDF-Dateien erzeugen willst (Schritt 12).

```bash
sudo apt install weasyprint
```

**Prüfen:** Die Ausgabe lautet `WeasyPrint version 67.0` (oder eine neuere Nummer).

```bash
weasyprint --version
```

## Dokumente umwandeln

### 4. Arbeitsordner anlegen

Ein eigener Ordner hält den Ausgangstext und die erzeugten Dateien zusammen.

```bash
mkdir ~/meinpandoc
```

### 5. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinpandoc
```

### 6. Ausgangstext in Markdown schreiben

```bash
nano text.md
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```markdown
---
title: Mein erstes Dokument
author: Dein Name
lang: de
toc-title: Inhalt
---

# Einleitung

Dieser Text wurde mit **Pandoc** umgewandelt.

# Eine Tabelle

| Format | Endung |
|--------|--------|
| Markdown | .md |
| Word | .docx |

# Eine Liste

1. Text schreiben
2. Umwandeln
3. Ergebnis prüfen
```

Der Block zwischen den `---`-Zeilen enthält Angaben zum Dokument (Metadaten). Pandoc übernimmt sie in jedes Ausgabeformat:

- `title` und `author` erscheinen als Kopf des Dokuments.
- `lang: de` sagt HTML, Word und LibreOffice, dass der Text deutsch ist. Das ist z. B. für die Silbentrennung und die Rechtschreibprüfung wichtig.
- `toc-title` ist die Überschrift des Inhaltsverzeichnisses. Ohne diese Zeile fehlt sie in HTML, in Word stünde dort „Table of Contents“.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. In HTML umwandeln

Pandoc erkennt Eingabe- und Ausgabeformat an den Dateiendungen. `-o` nennt die Ausgabedatei. `-s` (standalone) erzeugt eine vollständige HTML-Seite mit Kopf und Gestaltung statt nur eines HTML-Schnipsels. `--toc` fügt ein Inhaltsverzeichnis ein.

```bash
pandoc text.md -s --toc -o text.html
```

**Prüfen:** Der Befehl gibt nichts aus, wenn alles in Ordnung ist.

### 8. HTML-Seite ansehen

Öffnet die Datei im Standardbrowser.

```bash
xdg-open text.html
```

**Prüfen:** Oben stehen der Titel und „Dein Name“, darunter das Inhaltsverzeichnis „Inhalt“ mit drei Einträgen. Danach folgen der Text, die Tabelle und die Liste.

### 9. In ein Word-Dokument umwandeln

Erzeugt `text.docx`. Die Datei lässt sich mit Microsoft Word und LibreOffice Writer öffnen. Bei `.docx` ist `-s` nicht nötig, das Ergebnis ist immer ein vollständiges Dokument.

```bash
pandoc text.md --toc -o text.docx
```

**Prüfen:** Die Datei öffnet sich in LibreOffice Writer (falls installiert) mit Titel, Inhaltsverzeichnis und Tabelle.

```bash
xdg-open text.docx
```

### 10. In ein LibreOffice-Dokument umwandeln

Erzeugt `text.odt` im offenen Format von LibreOffice.

```bash
pandoc text.md -o text.odt
```

**Prüfen:** Die Ausgabe enthält `OpenDocument Text`.

```bash
file text.odt
```

### 11. Word-Dokument zurück in Markdown umwandeln

Pandoc kann auch Word-Dateien lesen, z. B. um sie in eine Dokumentation zu übernehmen. `-t gfm` wählt Markdown in der Schreibweise von GitHub. Tabellen erscheinen dann mit senkrechten Strichen wie im Ausgangstext.

```bash
pandoc text.docx -t gfm -o zurueck.md
```

**Prüfen:** Die Datei enthält die Überschriften mit `#`, das fett gedruckte `**Pandoc**`, die Tabelle und die Liste.

```bash
cat zurueck.md
```

Titel und Autor aus dem Kopf gehen bei diesem Weg verloren, weil Word sie nicht im Text, sondern in den Dokumenteigenschaften speichert.

### 12. In PDF umwandeln (optional)

Nur möglich, wenn Schritt 3 ausgeführt wurde. `--pdf-engine=weasyprint` sagt Pandoc, dass es WeasyPrint statt LaTeX verwenden soll.

```bash
pandoc text.md --toc --pdf-engine=weasyprint -o text.pdf
```

Meldungen wie `WARNING: Ignored … unknown property` betreffen nur CSS-Angaben, die WeasyPrint nicht kennt. Sie stören das Ergebnis nicht.

**Prüfen:** Die Datei öffnet sich im PDF-Betrachter mit Titel, Inhaltsverzeichnis und Tabelle.

```bash
xdg-open text.pdf
```

Eine Liste aller Formate, die Pandoc lesen bzw. schreiben kann, zeigen `pandoc --list-input-formats` und `pandoc --list-output-formats`.

## Aktualisieren

Pandoc und WeasyPrint kommen aus den Ubuntu-Paketquellen und werden mit den normalen Systemupdates aktualisiert.

```bash
sudo apt update && sudo apt upgrade
```

## Deinstallieren

### 1. Pandoc und WeasyPrint entfernen

`purge` entfernt die Programme samt ihrer Systemdateien. Hast du Schritt 3 ausgelassen, meldet `apt` für `weasyprint` nur, dass das Paket nicht installiert ist.

```bash
sudo apt purge pandoc weasyprint
```

### 2. Nicht mehr benötigte Pakete entfernen

Entfernt die Bibliotheken, die mit Pandoc und WeasyPrint installiert wurden, sofern kein anderes Programm sie braucht. Lies vor dem Bestätigen die Liste.

```bash
sudo apt autoremove --purge
```

Das kleine Paket `python3-brotli`, das mit WeasyPrint kam, bleibt dabei manchmal zurück: Ein anderes Python-Paket schlägt es vor, braucht es aber nicht. Du kannst es so lassen. Wer es entfernen will, prüft zuerst mit `-s` (nur simulieren), dass `apt` wirklich nur dieses eine Paket entfernen würde.

```bash
sudo apt purge -s python3-brotli
```

Steht in der Ausgabe nur die Zeile `Purg python3-brotli`, entfernst du es mit:

```bash
sudo apt purge python3-brotli
```

**Prüfen:** Die Ausgabe enthält `Kommando nicht gefunden`.

```bash
pandoc --version
```

### 3. Arbeitsordner löschen (optional)

**Achtung:** Damit sind auch der Ausgangstext und alle erzeugten Dateien gelöscht.

```bash
rm -r ~/meinpandoc
```
