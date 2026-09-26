# Asciidoctor

Asciidoctor wandelt Texte im Format AsciiDoc in HTML-Seiten und PDF-Dateien um. AsciiDoc ähnelt Markdown, kennt aber von Haus aus Inhaltsverzeichnisse, Hinweiskästen, nummerierte Tabellen, Querverweise und das Einbinden anderer Dateien. Es eignet sich deshalb gut für längere technische Dokumente.

## Vorbemerkungen

- **Paket aus Ubuntu:** Asciidoctor und die PDF-Erweiterung sind in den Ubuntu-Paketquellen enthalten und werden mit `apt` installiert. Ruby kommt dabei automatisch mit.
- **Einzelne Dokumente:** Asciidoctor wandelt jeweils eine Datei um. Für eine ganze Dokumentations-Website aus vielen Dateien und mehreren Git-Repositorys gibt es [Antora](antora.md), das intern ebenfalls Asciidoctor verwendet.
- **Version:** Getestet mit Asciidoctor **2.0.26** und Asciidoctor PDF 2.3.19 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Asciidoctor installieren

Installiert den Befehl `asciidoctor`, der AsciiDoc in HTML umwandelt, zusammen mit Ruby.

```bash
sudo apt install asciidoctor
```

**Prüfen:** Die erste Zeile beginnt mit `Asciidoctor 2.0.26` (oder einer neueren Nummer).

```bash
asciidoctor --version
```

### 3. PDF-Erweiterung installieren (optional)

Installiert den Befehl `asciidoctor-pdf`. Er erzeugt PDF-Dateien direkt, ohne LaTeX und ohne Browser. Wer nur HTML braucht, lässt diesen Schritt weg.

```bash
sudo apt install asciidoctor-pdf
```

**Prüfen:** Die Ausgabe beginnt mit `Asciidoctor PDF 2.3.19`.

```bash
asciidoctor-pdf --version
```

## Ein Dokument schreiben

### 4. Arbeitsordner anlegen

Ein eigener Ordner hält das Dokument und die erzeugten Dateien zusammen.

```bash
mkdir ~/meinasciidoc
```

### 5. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinasciidoc
```

### 6. Dokument anlegen

AsciiDoc-Dateien enden auf `.adoc`.

```bash
nano dokument.adoc
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```text
= Mein erstes Dokument
Dein Name
:lang: de
:toc:
:toc-title: Inhalt
:tip-caption: Tipp
:note-caption: Hinweis
:warning-caption: Warnung
:table-caption: Tabelle
:last-update-label: Zuletzt aktualisiert
:webfonts!:

Dieses Dokument wurde mit *Asciidoctor* erstellt.

== Ein Hinweis

TIP: AsciiDoc kennt Hinweise für Tipps, Anmerkungen und Warnungen.

== Eine Tabelle

.Werkzeuge
|===
|Werkzeug |Eingabeformat

|Asciidoctor
|AsciiDoc

|mdBook
|Markdown
|===

== Eine Liste

. Datei schreiben
. Mit `asciidoctor` umwandeln
. Im Browser ansehen
```

Was die Zeilen bedeuten:

- `= …` in der ersten Zeile ist der Titel, die Zeile darunter der Name des Autors.
- Die Zeilen mit Doppelpunkten sind **Attribute**, also Einstellungen für das ganze Dokument. Sie müssen direkt unter dem Titel stehen, ohne Leerzeile dazwischen.
  - `:lang: de` schreibt die Sprache ins HTML.
  - `:toc:` erzeugt ein Inhaltsverzeichnis.
  - Die Attribute mit `-caption` und `-title` bzw. `-label` ersetzen die englischen Beschriftungen, z. B. „Table of Contents“ oder „Last updated“, durch deutsche.
  - `:webfonts!:` schaltet das Laden von Schriften bei Google Fonts ab. Sonst würde jeder Besucher der Seite eine Anfrage an Google schicken. Der Browser nimmt dann seine eigenen Schriften.
- `== …` ist eine Überschrift der zweiten Ebene.
- `TIP:` am Zeilenanfang macht einen Hinweiskasten. Es gibt auch `NOTE:`, `IMPORTANT:`, `CAUTION:` und `WARNING:`.
- `|===` beginnt und beendet eine Tabelle, `.Werkzeuge` davor ist ihre Beschriftung.
- `. ` am Zeilenanfang ergibt eine nummerierte Liste.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. In HTML umwandeln

Erzeugt die Datei `dokument.html` im selben Ordner. Die Gestaltung (CSS) steht mit in der Datei, sie braucht also keine weiteren Dateien.

```bash
asciidoctor dokument.adoc
```

**Prüfen:** Der Befehl gibt nichts aus, wenn alles in Ordnung ist. Warnungen beginnen mit `asciidoctor: WARNING` und nennen die Zeile, z. B. bei einer nicht geschlossenen Tabelle.

```bash
ls
```

Neben `dokument.adoc` liegt jetzt `dokument.html`.

### 8. Ergebnis ansehen

Öffnet die HTML-Datei im Standardbrowser.

```bash
xdg-open dokument.html
```

**Prüfen:** Oben stehen der Titel, dein Name und das Inhaltsverzeichnis „Inhalt“. Darunter folgen ein Kasten „TIPP“, die Tabelle mit der Beschriftung „Tabelle 1. Werkzeuge“ und die nummerierte Liste. Ganz unten steht „Zuletzt aktualisiert“ mit Datum und Uhrzeit.

Nach jeder Änderung an `dokument.adoc` führst du Schritt 7 erneut aus und lädst die Seite im Browser neu (<kbd>F5</kbd>).

### 9. In PDF umwandeln (optional)

Nur möglich, wenn Schritt 3 ausgeführt wurde. Erzeugt die Datei `dokument.pdf` mit Inhaltsverzeichnis und Seitenzahlen.

```bash
asciidoctor-pdf dokument.adoc
```

**Prüfen:** Die Datei öffnet sich im PDF-Betrachter.

```bash
xdg-open dokument.pdf
```

Die HTML-Datei kann jeder Webserver ausliefern, zum Beispiel wie in [Statische Website mit nginx](nginx-statisch.md) beschrieben.

## Aktualisieren

Asciidoctor kommt aus den Ubuntu-Paketquellen und wird mit den normalen Systemupdates aktualisiert.

```bash
sudo apt update && sudo apt upgrade
```

## Deinstallieren

### 1. Asciidoctor entfernen

`purge` entfernt die Programme samt ihrer Systemdateien. Hast du Schritt 3 ausgelassen, meldet `apt` für `asciidoctor-pdf` nur, dass das Paket nicht installiert ist.

```bash
sudo apt purge asciidoctor asciidoctor-pdf
```

### 2. Nicht mehr benötigte Pakete entfernen

Entfernt Ruby und die Bibliotheken, die mit Asciidoctor installiert wurden, sofern kein anderes Programm sie braucht. Lies vor dem Bestätigen die Liste.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Die Ausgabe enthält `Kommando nicht gefunden`.

```bash
asciidoctor --version
```

### 3. Arbeitsordner löschen (optional)

**Achtung:** Damit ist auch dein Dokument gelöscht. Wer es behalten will, kopiert vorher `dokument.adoc`.

```bash
rm -r ~/meinasciidoc
```
