# Sphinx

Sphinx ist ein Werkzeug, mit dem man aus einfachen Textdateien eine Dokumentation als Webseite, PDF oder E-Book erzeugt. Es wird vor allem für Software-Dokumentation eingesetzt, etwa die von Python selbst, und kann Dokumentation direkt aus Python-Quellcode übernehmen.

## Vorbemerkungen

- **Textformate:** Sphinx verwendet standardmäßig **reStructuredText** (Dateiendung `.rst`). Mit der Erweiterung **MyST** lassen sich Seiten auch in **Markdown** (`.md`) schreiben. Diese Anleitung richtet beides ein.
- **Installation über apt:** Sphinx und die hier genutzten Erweiterungen sind in den Ubuntu-Paketquellen enthalten. Eine Installation mit `pip` ist nicht nötig.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von Sphinx aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Sphinx installieren

Installiert Sphinx mit den Befehlen `sphinx-quickstart` (neues Projekt anlegen) und `sphinx-build` (Dokumentation bauen).

```bash
sudo apt install python3-sphinx
```

**Prüfen:** Die Ausgabe nennt die Version, z. B. `sphinx-build 8.2.3`.

```bash
sphinx-build --version
```

### 3. Zusatzpakete installieren

Diese drei Pakete sind optional, werden aber im weiteren Verlauf verwendet:

- `python3-sphinx-rtd-theme` – ein verbreitetes, übersichtliches Aussehen mit Navigationsleiste („Read the Docs“-Design)
- `python3-myst-parser` – erlaubt Seiten in Markdown
- `python3-sphinx-autobuild` – baut die Dokumentation bei jeder Änderung neu und zeigt sie sofort im Browser an

```bash
sudo apt install python3-sphinx-rtd-theme python3-myst-parser python3-sphinx-autobuild
```

**Prüfen:** Der Befehl zeigt seine Version an.

```bash
sphinx-autobuild --version
```

## Erstes Projekt

### 4. Projektordner anlegen

Ein eigener Ordner für die Dokumentation. Hier als Beispiel `~/sphinx-test`.

```bash
mkdir ~/sphinx-test
```

### 5. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/sphinx-test
```

### 6. Projekt anlegen

`sphinx-quickstart` erzeugt das Grundgerüst. Ohne Zusatzangaben stellt es Fragen im Terminal. Mit den folgenden Angaben läuft es ohne Rückfragen durch:

- `--sep` trennt Quelltexte (Ordner `source`) und fertige Ausgabe (Ordner `build`)
- `-p` Name des Projekts, `-a` Name des Autors
- `-l de` stellt die Sprache auf Deutsch, damit Texte wie „Suche“ oder „Inhalt“ deutsch erscheinen

```bash
sphinx-quickstart --quiet --sep -p "Meine Dokumentation" -a "Dein Name" -l de
```

**Prüfen:** Im Ordner `source` liegen die Dateien `conf.py` (Einstellungen) und `index.rst` (Startseite).

```bash
ls source
```

### 7. Dokumentation zum ersten Mal bauen

Erzeugt aus den Quelltexten in `source` eine Webseite im Ordner `build/html`.

```bash
sphinx-build -M html source build
```

**Prüfen:** Die Ausgabe endet mit `The HTML pages are in build/html.`. Die Startseite öffnest du mit:

```bash
xdg-open build/html/index.html
```

`sphinx-quickstart` legt außerdem ein `Makefile` an. Ist das Paket `make` installiert, bewirkt `make html` dasselbe wie der Befehl oben.

## Optional: Design und Markdown einrichten

### 8. Read-the-Docs-Design einschalten

Ersetzt in `conf.py` das Standard-Design `alabaster` durch das in Schritt 3 installierte Design.

```bash
nano source/conf.py
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `html_theme` und drücke <kbd>Enter</kbd>. Die Zeile lautet `html_theme = 'alabaster'`. Ändere die gefundene Zeile so, dass sie lautet:

```python
html_theme = 'sphinx_rtd_theme'
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Ausgabe lautet `html_theme = 'sphinx_rtd_theme'`.

```bash
grep '^html_theme' source/conf.py
```

### 9. Markdown-Unterstützung einschalten

Trägt die Erweiterung MyST in die (anfangs leere) Liste `extensions` in `conf.py` ein. Danach erkennt Sphinx neben `.rst`- auch `.md`-Dateien.

```bash
nano source/conf.py
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `extensions` und drücke <kbd>Enter</kbd>. Die Zeile lautet `extensions = []`. Ändere die gefundene Zeile so, dass sie lautet:

```python
extensions = ['myst_parser']
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Ausgabe lautet `extensions = ['myst_parser']`.

```bash
grep '^extensions' source/conf.py
```

### 10. Eine Seite in Markdown anlegen

Legt eine neue Seite `erste-seite.md` an. Die Überschrift mit `#` wird zum Seitentitel.

```bash
nano source/erste-seite.md
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

~~~markdown
# Erste Seite

Diese Seite ist in **Markdown** geschrieben.

## Ein Codebeispiel

```python
print("Hallo Sphinx")
```
~~~

### 11. Seite ins Inhaltsverzeichnis aufnehmen

Sphinx zeigt nur Seiten an, die in einem Inhaltsverzeichnis (`toctree`) stehen. Öffne die Startseite in einem Editor:

```bash
nano source/index.rst
```

Suche den Block, der mit `.. toctree::` beginnt. Füge nach den Zeilen, die mit `:` beginnen (die Beschriftung `Contents:` darfst du auch in `Inhalt:` ändern), eine Leerzeile und dann den Seitennamen ohne Dateiendung ein. Er muss genauso weit eingerückt sein wie die Zeilen darüber (drei Leerzeichen):

```rst
.. toctree::
   :maxdepth: 2
   :caption: Contents:

   erste-seite
```

Speichern mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd>, beenden mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Mit automatischer Vorschau arbeiten

`sphinx-autobuild` baut die Dokumentation und startet einen kleinen Webserver. Bei jeder gespeicherten Änderung wird neu gebaut und der Browser lädt die Seite von selbst neu.

```bash
sphinx-autobuild source build/html
```

**Prüfen:** Öffne <http://127.0.0.1:8000> im Browser. Die Seite hat die Navigationsleiste des Read-the-Docs-Designs, und links steht der Eintrag „Erste Seite“. Mit <kbd>Strg</kbd>+<kbd>C</kbd> im Terminal beendest du die Vorschau.

## Deinstallieren

### 1. Testprojekt entfernen

Löscht den Beispielordner aus Schritt 4. **Achtung:** Alles in `~/sphinx-test` geht verloren.

```bash
rm -rf ~/sphinx-test
```

### 2. Sphinx und Zusatzpakete entfernen

`purge` entfernt auch die Konfigurationsdateien der Pakete.

```bash
sudo apt purge python3-sphinx python3-sphinx-rtd-theme python3-myst-parser python3-sphinx-autobuild
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten, die nur für Sphinx installiert wurden, z. B. `python3-docutils` und das Design `alabaster`.

```bash
sudo apt autoremove
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
sphinx-build --version
```
