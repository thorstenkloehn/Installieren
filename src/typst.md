# Typst

Typst ist ein Satzsystem, das aus einer Textdatei mit einfacher Auszeichnung ein sauber gesetztes PDF macht, ähnlich wie LaTeX. Es ist deutlich schlanker, übersetzt in Sekundenbruchteilen und meldet Fehler verständlich. Deshalb eignet es sich gut für Briefe, Berichte, Abschlussarbeiten und Dokumente mit Formeln.

## Vorbemerkungen

- **Kein apt-Paket:** Typst ist nicht in den Ubuntu-Paketquellen enthalten. Die Anleitung verwendet das Snap-Paket, das der Hersteller Typst GmbH selbst im Snap Store veröffentlicht. Snap-Pakete aktualisieren sich automatisch.
- **Nur im Home-Verzeichnis:** Das Snap läuft in einer abgeschotteten Umgebung. Es darf nur Dateien in deinem Home-Verzeichnis lesen und schreiben, aber nicht in versteckten Ordnern wie `~/.irgendwas`, nicht unter `/tmp` und zunächst nicht auf USB-Sticks. Sonst erscheint `access denied` oder `input file not found`. Für USB-Sticks gibt es eine Freigabe (siehe Schritt 3).
- **Alles dabei:** Typst bringt eigene Schriften für Text und Formeln mit. LaTeX ist nicht nötig.
- **Version:** Getestet mit Typst **0.15.1** unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Das Snap selbst braucht diesen Schritt nicht. Er sorgt aber dafür, dass `apt` die aktuellen Versionen kennt, falls du danach noch etwas installierst, z. B. einen PDF-Betrachter für Schritt 8.

```bash
sudo apt update
```

### 2. Typst installieren

Lädt Typst aus dem Snap Store (etwa 21 MB).

```bash
sudo snap install typst
```

**Prüfen:** Die Ausgabe lautet `typst 0.15.1 (…)` (oder eine neuere Nummer).

```bash
typst --version
```

### 3. Zugriff auf USB-Sticks erlauben (optional)

Nur nötig, wenn du Dokumente auf einem USB-Stick oder einer externen Festplatte unter `/media` bearbeiten willst.

```bash
sudo snap connect typst:removable-media
```

**Prüfen:** In der Zeile `removable-media` steht in der Spalte „Slot“ jetzt `:removable-media` statt `-`.

```bash
snap connections typst
```

## Ein Dokument setzen

### 4. Arbeitsordner anlegen

Der Ordner muss im Home-Verzeichnis liegen und darf nicht versteckt sein (siehe Vorbemerkungen).

```bash
mkdir ~/meintypst
```

### 5. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meintypst
```

### 6. Dokument anlegen

Typst-Dateien enden auf `.typ`.

```bash
nano dokument.typ
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```text
#set document(title: "Mein erstes Dokument", author: "Dein Name")
#set page(paper: "a4", numbering: "1")
#set text(lang: "de", size: 11pt)
#set heading(numbering: "1.")

#align(center, text(20pt, weight: "bold")[Mein erstes Dokument])
#align(center)[Dein Name]

#outline()

= Einleitung

Dieses Dokument wurde mit *Typst* gesetzt. Typst trennt deutsche Wörter
automatisch und setzt "Anführungszeichen" richtig.

= Eine Formel

Der Satz des Pythagoras lautet $a^2 + b^2 = c^2$. Abgesetzt:

$ sum_(k=1)^n k = (n(n+1)) / 2 $

= Eine Tabelle

#figure(
  table(
    columns: 2,
    [*Werkzeug*], [*Eingabeformat*],
    [Typst], [Typst-Markup],
    [LaTeX], [LaTeX-Markup],
  ),
  caption: [Zwei Satzsysteme],
)

= Eine Liste

+ Text schreiben
+ Mit `typst compile` umwandeln
+ PDF ansehen
```

So ist die Datei aufgebaut:

- Zeilen mit `#set` legen Regeln für das ganze Dokument fest:
  - `document` trägt Titel und Autor in die PDF-Eigenschaften ein.
  - `page` wählt A4 und Seitenzahlen.
  - `text(lang: "de")` schaltet deutsche Silbentrennung, deutsche Anführungszeichen und deutsche Beschriftungen wie „Inhaltsverzeichnis“ und „Tabelle 1“ ein.
  - `heading(numbering: "1.")` nummeriert die Überschriften.
- `#outline()` setzt an dieser Stelle das Inhaltsverzeichnis.
- `=` am Zeilenanfang ist eine Überschrift, `*…*` fett, `+` eine nummerierte Liste.
- Zwischen `$…$` steht eine Formel. Mit Leerzeichen innen (`$ … $`) wird sie abgesetzt in eine eigene Zeile gestellt.
- `#figure` umgibt die Tabelle mit einer nummerierten Beschriftung.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. PDF erzeugen

Übersetzt `dokument.typ` in `dokument.pdf` im selben Ordner.

```bash
typst compile dokument.typ
```

**Prüfen:** Der Befehl gibt nichts aus, wenn alles in Ordnung ist. Bei einem Fehler nennt Typst Zeile und Spalte und markiert die Stelle, z. B. bei einer vergessenen Klammer.

### 8. PDF ansehen

Öffnet die Datei im Standard-PDF-Betrachter.

```bash
xdg-open dokument.pdf
```

**Prüfen:** Oben stehen Titel und Name, darunter das „Inhaltsverzeichnis“ mit vier nummerierten Einträgen. Im Text stehen deutsche Anführungszeichen „ “, die Formeln sind gesetzt und unter der Tabelle steht „Tabelle 1: Zwei Satzsysteme“. Unten auf der Seite steht die Seitenzahl.

### 9. Automatisch neu übersetzen (optional)

`watch` beobachtet die Datei und erzeugt das PDF bei jedem Speichern neu. Die meisten PDF-Betrachter, z. B. der Dokumentenbetrachter von Ubuntu, laden die Anzeige dann von selbst neu. So siehst du jede Änderung sofort.

```bash
typst watch dokument.typ
```

**Prüfen:** Die Ausgabe zeigt `compiled successfully`. Nach jedem Speichern in nano (in einem zweiten Terminal) erscheint die Meldung erneut mit neuer Uhrzeit.

Beende das Beobachten mit <kbd>Strg</kbd>+<kbd>C</kbd>.

## Aktualisieren

Snap-Pakete aktualisieren sich mehrmals täglich von selbst. Wer nicht warten will, stößt die Aktualisierung von Hand an.

```bash
sudo snap refresh typst
```

**Prüfen:** `typst --version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Typst entfernen

`--purge` entfernt das Snap ohne die automatische Sicherung, die Snap sonst beim Entfernen anlegt.

```bash
sudo snap remove --purge typst
```

**Prüfen:** Die Ausgabe enthält `Kommando nicht gefunden` bzw. `No such file or directory`.

```bash
typst --version
```

### 2. Zwischenspeicher löschen

Typst legt Vorlagen und Erweiterungen, die es aus dem Internet lädt, in `~/.cache/typst` ab. Hast du keine verwendet, gibt es den Ordner nicht und `rm` meldet das nur.

```bash
rm -r ~/.cache/typst
```

### 3. Arbeitsordner löschen (optional)

**Achtung:** Damit sind auch deine Dokumente gelöscht.

```bash
rm -r ~/meintypst
```
