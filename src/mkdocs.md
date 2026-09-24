# MkDocs

MkDocs erzeugt aus Markdown-Dateien eine statische Dokumentations-Webseite mit Navigation und Suche. Zusammen mit dem Design **Material for MkDocs** entsteht daraus eine moderne Seite mit hellem und dunklem Modus, Hinweiskästen und Kopier-Schaltflächen für Codebeispiele.

## Vorbemerkungen

- **Installation über apt:** MkDocs und Material for MkDocs sind beide in den Ubuntu-Paketquellen enthalten. Eine Installation mit `pip` ist nicht nötig.
- **Einstellungen im YAML-Format:** Alle Einstellungen stehen in einer Datei `mkdocs.yml`. In YAML zählt die Einrückung: Sie wird immer mit Leerzeichen gemacht, nie mit Tabulatoren.
- **Weiterentwicklung:** Das Team hinter Material for MkDocs arbeitet inzwischen an einem Nachfolger namens Zensical. Material for MkDocs wird weiterhin gepflegt, bekommt aber vor allem Fehlerkorrekturen und keine großen neuen Funktionen mehr.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von MkDocs und Material for MkDocs aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. MkDocs installieren

Installiert den Befehl `mkdocs`, mit dem Projekte angelegt, in einer Vorschau angezeigt und gebaut werden.

```bash
sudo apt install mkdocs
```

**Prüfen:** Die Ausgabe beginnt mit `mkdocs, version 1.6.1`.

```bash
mkdocs --version
```

### 3. Material for MkDocs installieren

Installiert das Design. Die nötigen Markdown-Erweiterungen (Paket `python3-pymdownx`) werden automatisch mitinstalliert.

```bash
sudo apt install mkdocs-material
```

**Prüfen:** Die Ausgabe zeigt `Status: install ok installed`.

```bash
dpkg -s mkdocs-material | grep Status
```

## Erstes Projekt

### 4. Projekt anlegen

`mkdocs new` legt einen Ordner mit einer Einstellungsdatei `mkdocs.yml` und einem Unterordner `docs` an. In `docs` liegen die Markdown-Seiten, zu Beginn nur die Startseite `index.md`.

```bash
mkdocs new ~/mkdocs-test
```

### 5. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/mkdocs-test
```

**Prüfen:** Es werden `docs` und `mkdocs.yml` angezeigt.

```bash
ls
```

### 6. Vorschau starten

`mkdocs serve` baut die Seite und startet einen kleinen Webserver. Bei jeder gespeicherten Änderung wird neu gebaut und der Browser lädt die Seite von selbst neu. Das Terminal bleibt dabei belegt, öffne für die nächsten Schritte ein zweites Terminal (ebenfalls im Ordner `~/mkdocs-test`).

```bash
mkdocs serve
```

**Prüfen:** Im Terminal steht `Serving on http://127.0.0.1:8000/`. Öffne <http://127.0.0.1:8000> im Browser: Es erscheint die Startseite im einfachen Standard-Design von MkDocs.

## Material for MkDocs einrichten

### 7. Einstellungsdatei für Material schreiben

Ersetzt den Inhalt von `mkdocs.yml`. Die Einstellungen bewirken Folgendes:

- `theme: name: material` – schaltet das Material-Design ein
- `language: de` – deutsche Beschriftungen, z. B. „Suche“
- `palette` – zwei Farbschemata (hell und dunkel) mit Umschalter oben rechts
- `features` – schnelleres Laden der Seiten, Suchvorschläge und eine Kopier-Schaltfläche an Codeblöcken
- `markdown_extensions` – Hinweiskästen, aufklappbare Abschnitte und Syntaxhervorhebung
- `nav` – legt Reihenfolge und Titel der Seiten in der Navigation fest

```bash
nano mkdocs.yml
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```yaml
site_name: Meine Dokumentation

theme:
  name: material
  language: de
  palette:
    - scheme: default
      toggle:
        icon: material/brightness-7
        name: Dunkles Design einschalten
    - scheme: slate
      toggle:
        icon: material/brightness-4
        name: Helles Design einschalten
  features:
    - navigation.instant
    - search.suggest
    - content.code.copy

markdown_extensions:
  - admonition
  - pymdownx.details
  - pymdownx.highlight
  - pymdownx.superfences

nav:
  - Start: index.md
  - Erste Seite: erste-seite.md
```

**Prüfen:** Das Terminal mit `mkdocs serve` zeigt eine Warnung, dass `erste-seite.md` fehlt. Das ist richtig, die Seite folgt im nächsten Schritt.

### 8. Eine neue Seite anlegen

Legt die Seite `erste-seite.md` im Ordner `docs` an. Sie zeigt zwei typische Material-Funktionen: einen Hinweiskasten (`!!! note`) und einen Codeblock mit Kopier-Schaltfläche.

```bash
nano docs/erste-seite.md
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

~~~markdown
# Erste Seite

Diese Seite nutzt Funktionen von Material for MkDocs.

!!! note "Hinweis"
    Das ist ein hervorgehobener Hinweiskasten.

```python
print("Hallo MkDocs")
```
~~~

**Prüfen:** Im Browser unter <http://127.0.0.1:8000> hat die Seite jetzt das Material-Design. In der Navigation steht „Erste Seite“ mit einem blauen Hinweiskasten, und oben rechts gibt es den Umschalter für hell und dunkel.

### 9. Vorschau beenden

Beendet den Webserver aus Schritt 6. Wechsle dazu in dessen Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

### 10. Fertige Webseite bauen

Erzeugt die fertige Webseite im Ordner `site`. Diesen Ordner kannst du auf einen beliebigen Webserver hochladen, z. B. nach `/var/www/...` auf einem Server mit [nginx](nginx.md). `--strict` bricht bei Fehlern wie fehlenden Seiten ab, statt nur zu warnen.

```bash
mkdocs build --strict
```

**Prüfen:** Die Ausgabe endet mit `Documentation built in …`, und im Ordner `site` liegt eine `index.html`.

```bash
ls site/index.html
```

## Deinstallieren

### 1. Testprojekt entfernen

Löscht den Beispielordner aus Schritt 4. **Achtung:** Alles in `~/mkdocs-test` geht verloren.

```bash
rm -rf ~/mkdocs-test
```

### 2. MkDocs und Material entfernen

`purge` entfernt auch die Konfigurationsdateien der Pakete.

```bash
sudo apt purge mkdocs mkdocs-material
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten, die nur für MkDocs installiert wurden, z. B. `python3-pymdownx` und `mkdocs-material-extensions`.

```bash
sudo apt autoremove
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
mkdocs --version
```
