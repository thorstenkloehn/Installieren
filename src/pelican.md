# Pelican

Pelican ist ein Generator für statische Websites in Python. Er baut aus Beiträgen in Markdown oder reStructuredText einen fertigen Blog mit Kategorien, Schlagwörtern, Archiv und Feeds. Die Ausgabe ist reines HTML, das jeder Webserver ohne Datenbank ausliefern kann.

## Vorbemerkungen

- **Warum nicht die Version aus apt:** Ubuntu 26.04 enthält Pelican 4.11.0. Dem Paket fehlt aber das Standard-Design `notmyidea`. Es enthält nur das Design `simple`, und das ist reines HTML ohne Gestaltung. Diese Anleitung installiert Pelican deshalb mit `pip` in eine **virtuelle Umgebung** (venv), einen eigenen Ordner nur für dieses Projekt, siehe [Python](python.md). So bekommst du die aktuelle Version mit beiden Designs.
- **Version:** Getestet mit Pelican **4.12.0** und Python 3.14 aus Ubuntu 26.04.
- **Port:** Die Vorschau läuft auf Port **8000**, nur vom eigenen Rechner aus erreichbar. Läuft dort schon ein anderes Programm, z. B. aus der [Django-Anleitung](django.md), hängst du an den Befehl in Schritt 11 `--port 8001` an.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von `python3-venv` kennt.

```bash
sudo apt update
```

### 2. Werkzeug für virtuelle Umgebungen installieren

`python3-venv` enthält das Werkzeug, mit dem Python virtuelle Umgebungen anlegt. Python selbst ist unter Ubuntu schon installiert.

```bash
sudo apt install python3-venv
```

### 3. Projektordner anlegen

In diesem Ordner liegen später die virtuelle Umgebung, die Einstellungen und alle Beiträge des Blogs.

```bash
mkdir ~/meinblog
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinblog
```

### 5. Virtuelle Umgebung anlegen

Legt die Umgebung im Unterordner `.venv` an.

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung einschalten

Danach verwenden `pip` und `pelican` in diesem Terminal die Programme aus `.venv`. In einem neuen Terminal wiederholst du die Schritte 4 und 6.

```bash
source .venv/bin/activate
```

**Prüfen:** Vor der Eingabeaufforderung steht jetzt `(.venv)`.

### 7. Pelican installieren

`[markdown]` installiert zusätzlich die Bibliothek, mit der Pelican Markdown-Dateien liest. Ohne sie versteht Pelican nur reStructuredText.

```bash
pip install "pelican[markdown]"
```

**Prüfen:** Die Ausgabe lautet `4.12.0` (oder eine neuere Nummer).

```bash
pelican --version
```

## Einen Blog anlegen

### 8. Grundgerüst erzeugen

Der Assistent fragt einige Angaben ab und legt daraus die Einstellungsdatei `pelicanconf.py`, den leeren Ordner `content` für die Beiträge und Hilfsdateien an.

```bash
pelican-quickstart
```

Beantworte die Fragen so:

| Frage | Eingabe |
|---|---|
| `Where do you want to create your new web site?` | <kbd>Enter</kbd> (aktueller Ordner) |
| `What will be the title of this web site?` | `Mein Blog` |
| `Who will be the author of this web site?` | dein Name |
| `What will be the default language of this web site?` | `de` |
| `Do you want to specify a URL prefix?` | `n` |
| `Do you want to enable article pagination?` | <kbd>Enter</kbd> (ja) |
| `How many articles per page do you want?` | <kbd>Enter</kbd> (10) |
| `What is your time zone?` | `Europe/Berlin` |
| `Do you want to generate a tasks.py/Makefile …?` | <kbd>Enter</kbd> (ja) |
| alle Fragen `Do you want to upload your website using …?` | <kbd>Enter</kbd> (nein) |

**Prüfen:** Die Ausgabe endet mit `Done. Your new project is available at …/meinblog`.

### 9. Einen Beitrag schreiben

Beiträge sind Markdown-Dateien im Ordner `content`. Den Dateinamen kannst du frei wählen.

```bash
nano content/erster-beitrag.md
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```markdown
Title: Mein erster Beitrag
Date: 2026-09-26 10:00
Category: Allgemeines
Tags: pelican, blog

Diese Seite wurde mit **Pelican** gebaut.
```

Die Zeilen oben bis zur ersten Leerzeile sind **Metadaten**: Titel, Datum, Kategorie und Schlagwörter. Aus `Title` erzeugt Pelican auch den Dateinamen der fertigen Seite (`mein-erster-beitrag.html`). Darunter folgt normales Markdown.

### 10. Website bauen

Liest alle Dateien aus `content` und schreibt die fertige Website in den Ordner `output`.

```bash
pelican content
```

**Prüfen:** Die Ausgabe beginnt mit `Done: Processed 1 article`. Im Ordner `output` liegen `index.html`, `mein-erster-beitrag.html` und der Ordner `theme` mit den Stylesheets.

```bash
ls output
```

### 11. Vorschau starten

`--listen` startet einen kleinen Webserver für den Ordner `output`. `--autoreload` baut die Website bei jeder gespeicherten Änderung in `content` oder `pelicanconf.py` neu.

```bash
pelican --autoreload --listen
```

**Prüfen:** Die Ausgabe enthält `Serving site at: http://127.0.0.1:8000`. Öffne <http://localhost:8000> im Browser. Oben steht „Mein Blog“, darunter der Beitrag mit Kategorie und Schlagwörtern.

Beende die Vorschau mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 12. Beispiel-Links entfernen (optional)

Das Design zeigt unten die Blöcke „links“ und „social“ mit Beispieleinträgen aus `pelicanconf.py`.

```bash
nano pelicanconf.py
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `LINKS =`. Ersetze die Einträge in den eckigen Klammern durch eigene Links oder lösche die Zeilen mit den Einträgen (<kbd>Strg</kbd>+<kbd>K</kbd> löscht eine Zeile), sodass nur `LINKS = [` und die schließende `]` übrig bleiben. Mache dasselbe bei `SOCIAL =`. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

Den Inhalt von `output` kann jeder Webserver ausliefern, zum Beispiel wie in [Statische Website mit nginx](nginx-statisch.md) beschrieben.

## Aktualisieren

### 1. In den Projektordner wechseln

```bash
cd ~/meinblog
```

### 2. Virtuelle Umgebung einschalten

```bash
source .venv/bin/activate
```

### 3. Neue Version installieren

Einstellungen und Beiträge bleiben erhalten.

```bash
pip install --upgrade "pelican[markdown]"
```

**Prüfen:** `pelican --version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Virtuelle Umgebung ausschalten

Falls sie im aktuellen Terminal noch eingeschaltet ist.

```bash
deactivate
```

### 2. Projektordner löschen

Entfernt Pelican, die Einstellungen und alle Beiträge. **Achtung:** Wer die Beiträge behalten will, kopiert vorher den Ordner `~/meinblog/content`.

```bash
rm -r ~/meinblog
```

`python3-venv` bleibt installiert, weil andere Anleitungen es ebenfalls verwenden.

**Prüfen:** Der Ordner ist verschwunden.

```bash
ls ~/meinblog
```
