# Quarto

Quarto macht aus Markdown-Dateien Websites, Bücher, Präsentationen und PDF-Dokumente. Es baut auf Pandoc auf, bringt Hinweiskästen, Querverweise und eine Suche mit und kann Code in Python, R oder Julia ausführen und die Ergebnisse gleich in die Seite schreiben.

## Vorbemerkungen

- **Kein apt- oder Snap-Paket:** Quarto ist weder in den Ubuntu-Paketquellen noch im Snap Store enthalten. Die Anleitung verwendet die offizielle `.deb`-Datei von GitHub. Sie wird bei Updates von `apt` nicht erfasst und muss von Hand erneuert werden.
- **Alles dabei:** Das Paket bringt Pandoc, Dart Sass, Deno und Typst in eigenen Versionen mit. Es braucht keine weiteren Pakete aus Ubuntu und stört ein vorhandenes `pandoc` nicht.
- **PDF ohne LaTeX:** Für PDF-Dateien verwendet diese Anleitung Typst, das schon im Paket steckt. Das Format `pdf` bräuchte dagegen eine LaTeX-Installation.
- **Version:** Getestet mit Quarto **1.10.18** unter Ubuntu 26.04. Das Paket belegt nach der Installation etwa 450 MB.
- **Port:** Die Vorschau soll hier auf Port **4200** laufen, nur vom eigenen Rechner aus erreichbar.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` beim Installieren der `.deb`-Datei auf dem aktuellen Stand ist.

```bash
sudo apt update
```

### 2. Quarto herunterladen

Lädt das Paket (etwa 150 MB) in den Ordner `/tmp`. Die aktuelle Versionsnummer steht auf <https://github.com/quarto-dev/quarto-cli/releases/latest>. Bei einer neueren Version ersetzt du `1.10.18` an beiden Stellen im Befehl.

```bash
wget -O /tmp/quarto.deb https://github.com/quarto-dev/quarto-cli/releases/download/v1.10.18/quarto-1.10.18-linux-amd64.deb
```

### 3. Prüfsummen herunterladen

Die Datei enthält die SHA-256-Prüfsummen aller Pakete dieser Version. Damit lässt sich feststellen, ob der Download vollständig und unverändert ist.

```bash
wget -O /tmp/quarto-checksums.txt https://github.com/quarto-dev/quarto-cli/releases/download/v1.10.18/quarto-1.10.18-checksums.txt
```

### 4. Prüfsumme vergleichen

Der erste Befehl zeigt die erwartete Prüfsumme, der zweite berechnet die Prüfsumme der heruntergeladenen Datei.

```bash
grep linux-amd64.deb /tmp/quarto-checksums.txt
```

```bash
sha256sum /tmp/quarto.deb
```

**Prüfen:** Die lange Zeichenfolge am Anfang ist in beiden Ausgaben gleich. Weicht sie ab, lösche die Datei und lade sie noch einmal herunter.

### 5. Quarto installieren

Der Pfad mit `/` am Anfang sagt `apt`, dass es eine lokale Datei installieren soll. Das Paket legt das Programm nach `/opt/quarto` und den Befehl `quarto` nach `/usr/local/bin`.

```bash
sudo apt install /tmp/quarto.deb
```

**Prüfen:** Die Ausgabe ist die Versionsnummer, z. B. `1.10.18`.

```bash
quarto --version
```

### 6. Heruntergeladene Dateien löschen

Das Paket ist installiert, die beiden Dateien werden nicht mehr gebraucht.

```bash
rm /tmp/quarto.deb /tmp/quarto-checksums.txt
```

### 7. Installation durchprüfen

`quarto check` testet die mitgelieferten Programme und rendert zur Probe ein kleines Dokument. Außerdem sucht es nach LaTeX, Python mit Jupyter, R und Julia.

```bash
quarto check
```

**Prüfen:** Die Zeilen `Checking Quarto installation` und `Checking basic markdown render` enden mit `OK`. Meldungen wie `Unable to locate an installed version of R` oder `Jupyter is not available` bedeuten nur, dass diese Sprachen nicht eingerichtet sind. Für diese Anleitung werden sie nicht gebraucht.

## Eine Website anlegen

### 8. Projekt erzeugen

`create project website` legt den Ordner `~/meinquarto` mit einer kleinen Website an: die Einstellungsdatei `_quarto.yml`, die Seiten `index.qmd` und `about.qmd` und die Datei `styles.css` für eigene Gestaltung. `.qmd` sind Markdown-Dateien mit Quarto-Erweiterungen. `--no-prompt` unterdrückt Rückfragen, `--no-open` verhindert, dass ein Editor startet.

```bash
quarto create project website ~/meinquarto "Meine Website" --no-prompt --no-open
```

**Prüfen:** Die Ausgabe listet `Created _quarto.yml`, `Created index.qmd`, `Created about.qmd` und `Created styles.css`.

### 9. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinquarto
```

### 10. Sprache und Menü einstellen

In `_quarto.yml` stehen die Einstellungen der Website im YAML-Format.

```bash
nano _quarto.yml
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```yaml
project:
  type: website

lang: de

website:
  title: "Meine Website"
  navbar:
    left:
      - href: index.qmd
        text: Startseite
      - about.qmd

format:
  html:
    theme:
      - cosmo
      - brand
    css: styles.css
    toc: true
```

- `lang: de` – feste Beschriftungen wie „Suche“, „Auf dieser Seite“ und „Tipp“ erscheinen auf Deutsch.
- `navbar` – die Menüleiste oben. Beim ersten Eintrag steht der Text fest, beim zweiten nimmt Quarto den Titel der Seite.
- `theme` – `cosmo` ist eines der mitgelieferten Designs.
- `toc: true` – rechts erscheint ein Inhaltsverzeichnis der aktuellen Seite.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Startseite schreiben

```bash
nano index.qmd
```

Ersetze den ganzen Inhalt wie in Schritt 10 durch:

```markdown
---
title: "Meine Website"
---

Diese Seite wurde mit **Quarto** gebaut.

## Ein Hinweiskasten

::: {.callout-tip}
Quarto kennt Hinweiskästen für Tipps, Warnungen und Hinweise.
:::

## Eine Tabelle

| Werkzeug | Sprache |
|----------|---------|
| Quarto   | Markdown |
| mdBook   | Markdown |
```

Oben zwischen den `---`-Zeilen steht der Titel der Seite. Der Block mit `:::` ist ein Hinweiskasten. Statt `callout-tip` gibt es z. B. auch `callout-note` und `callout-warning`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Zweite Seite schreiben

```bash
nano about.qmd
```

Ersetze den ganzen Inhalt wie in Schritt 10 durch:

```markdown
---
title: "Über diese Seite"
---

Hier steht, wer die Website betreibt.
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Vorschau starten

`preview` baut die Website, startet einen kleinen Webserver auf `127.0.0.1` und baut jede gespeicherte Änderung sofort neu. `--port 4200` legt den Port fest, sonst wählt Quarto jedes Mal einen zufälligen. `--no-browser` verhindert, dass sich der Browser von selbst öffnet.

```bash
quarto preview --port 4200 --no-browser
```

**Prüfen:** Die Ausgabe enthält `Browse at http://localhost:4200/`. Öffne <http://localhost:4200> im Browser. Oben stehen „Startseite“ und „Über diese Seite“ und rechts die Lupe für die Suche. Die Startseite zeigt einen grünen Kasten „Tipp“ und die Tabelle.

Beende die Vorschau mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 14. Website bauen

Schreibt die fertige Website in den Ordner `_site`.

```bash
quarto render
```

**Prüfen:** Die Ausgabe endet mit `Output created: _site/index.html`. Im Ordner liegen unter anderem `index.html`, `about.html` und `search.json` für die Suche.

```bash
ls _site
```

Den Inhalt von `_site` kann jeder Webserver ausliefern, zum Beispiel wie in [Statische Website mit nginx](nginx-statisch.md) beschrieben.

### 15. Eine Seite als PDF ausgeben (optional)

`--to typst` setzt die Seite mit dem mitgelieferten Typst als PDF. LaTeX ist dafür nicht nötig.

```bash
quarto render index.qmd --to typst
```

**Prüfen:** Die Ausgabe endet mit `Output created: _site/index.pdf`. Öffne die Datei mit einem PDF-Betrachter.

```bash
xdg-open _site/index.pdf
```

## Aktualisieren

Das Paket kommt nicht aus einer Paketquelle, deshalb bietet `apt upgrade` keine neuen Versionen an.

### 1. Neue Version herunterladen und prüfen

Wiederhole die Schritte 1 bis 4 der Installation mit der neuen Versionsnummer von <https://github.com/quarto-dev/quarto-cli/releases/latest>.

### 2. Neue Version installieren

`apt` ersetzt die alte Version durch die neue. Projekte in deinem Home-Verzeichnis bleiben unverändert.

```bash
sudo apt install /tmp/quarto.deb
```

**Prüfen:** `quarto --version` zeigt die neue Versionsnummer.

```bash
quarto --version
```

Lösche danach die heruntergeladenen Dateien wie in Schritt 6.

## Deinstallieren

### 1. Quarto entfernen

`purge` entfernt das Paket samt `/opt/quarto` und dem Befehl `quarto`.

```bash
sudo apt purge quarto
```

**Prüfen:** Die Ausgabe enthält `Kommando nicht gefunden` (oder `No such file or directory`, wenn das Terminal den alten Pfad noch kennt).

```bash
quarto --version
```

### 2. Zwischenspeicher löschen

Quarto legt beim Arbeiten Dateien in `~/.cache/quarto` und `~/.local/share/quarto` ab. Sie werden ohne Quarto nicht mehr gebraucht.

```bash
rm -r ~/.cache/quarto ~/.local/share/quarto
```

### 3. Projektordner löschen (optional)

**Achtung:** Damit sind alle Seiten der Website gelöscht. Wer sie behalten will, lässt diesen Schritt weg oder kopiert vorher die `.qmd`-Dateien.

```bash
rm -r ~/meinquarto
```

**Prüfen:** `ls` meldet, dass es den Ordner nicht gibt.

```bash
ls ~/meinquarto
```
