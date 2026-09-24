# Python

Python ist eine leicht lesbare Programmiersprache, die sich gleichermaßen für kleine Skripte, Datenanalyse, Webanwendungen und künstliche Intelligenz eignet. Wegen ihrer klaren Syntax ist sie auch eine beliebte erste Programmiersprache.

## Vorbemerkungen

- **Bereits vorinstalliert:** Ubuntu 26.04 bringt **Python 3.14** mit, weil viele Systemprogramme darauf aufbauen. Der Befehl heißt `python3`. Es fehlen nur die Werkzeuge, um zusätzliche Pakete zu installieren.
- **Systempython nicht entfernen:** Das Paket `python3` darf nicht deinstalliert werden, sonst funktionieren Teile von Ubuntu nicht mehr (u. a. Paketverwaltung und Desktop-Werkzeuge).
- **Virtuelle Umgebungen:** Ubuntu verhindert, dass `pip` Pakete aus dem Internet direkt in das Systempython schreibt. Ein Versuch endet mit der Meldung `externally-managed-environment`. Stattdessen legt man pro Projekt eine **virtuelle Umgebung** (venv) an: einen Ordner mit eigenem Python und eigenen Paketen, der das System nicht berührt.
- **Pakete aus apt:** Viele verbreitete Bibliotheken gibt es auch als Ubuntu-Paket mit dem Präfix `python3-`, z. B. `python3-requests`. Diese sind für das ganze System verfügbar, aber oft etwas älter als die Fassung auf PyPI.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Vorhandenes Python prüfen

Zeigt, welche Python-Version bereits installiert ist.

```bash
python3 --version
```

**Prüfen:** Die Ausgabe lautet `Python 3.14.…`.

### 3. pip und venv installieren

`python3-venv` erstellt virtuelle Umgebungen, `python3-pip` installiert Pakete aus dem Python-Paketverzeichnis PyPI. `python3-dev` enthält Header-Dateien, die manche Pakete zum Übersetzen von C-Erweiterungen brauchen.

```bash
sudo apt install python3-venv python3-pip python3-dev
```

**Prüfen:**

```bash
pip3 --version
```

### 4. Optional: Befehl `python` einrichten

Viele Anleitungen im Internet schreiben `python` statt `python3`. Dieses kleine Paket legt den Befehl `python` als Verweis auf `python3` an.

```bash
sudo apt install python-is-python3
```

**Prüfen:** Die Ausgabe ist dieselbe wie bei `python3 --version`.

```bash
python --version
```

## Erstes Programm

### 5. Arbeitsordner anlegen

Ein eigener Ordner für das Übungsprojekt.

```bash
mkdir -p ~/python-uebung
```

### 6. In den Ordner wechseln

Alle folgenden Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/python-uebung
```

### 7. Skript anlegen

Legt `hallo.py` an. Das Skript nummeriert eine Liste von Programmiersprachen und gibt das heutige Datum im deutschen Format aus.

```bash
nano hallo.py
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```python
from datetime import date

sprachen = ["C", "C++", "Java", "Python", "C#", "JavaScript"]

for nummer, sprache in enumerate(sprachen, start=1):
    print(f"{nummer}. {sprache}")

print(f"Heute ist der {date.today():%d.%m.%Y}.")
```

### 8. Skript ausführen

Python übersetzt nichts vorab, sondern führt den Quelltext direkt aus.

```bash
python3 hallo.py
```

**Prüfen:** Es erscheinen sechs nummerierte Zeilen von `1. C` bis `6. JavaScript` und danach das heutige Datum.

## Virtuelle Umgebung und Pakete

### 9. Virtuelle Umgebung anlegen

Erstellt im Projektordner den Unterordner `.venv` mit einer eigenen Python-Installation.

```bash
python3 -m venv .venv
```

### 10. Virtuelle Umgebung aktivieren

Sorgt dafür, dass `python` und `pip` im aktuellen Terminal aus `.venv` kommen. Das muss in jedem neuen Terminal wiederholt werden.

```bash
source .venv/bin/activate
```

**Prüfen:** Vor der Eingabeaufforderung steht jetzt `(.venv)`, und der folgende Befehl zeigt einen Pfad innerhalb von `~/python-uebung/.venv`.

```bash
which python
```

### 11. Paket installieren

Installiert als Beispiel die Bibliothek `requests` für HTTP-Anfragen. Sie landet nur in dieser virtuellen Umgebung, `sudo` ist deshalb nicht nötig.

```bash
pip install requests
```

**Prüfen:** Die installierte Version wird angezeigt.

```bash
python -c "import requests; print(requests.__version__)"
```

### 12. Abhängigkeiten festhalten

Schreibt alle installierten Pakete mit Versionsnummer in `requirements.txt`. Mit dieser Datei lässt sich die Umgebung auf einem anderen Rechner per `pip install -r requirements.txt` genauso wieder aufbauen.

```bash
pip freeze > requirements.txt
```

### 13. Virtuelle Umgebung verlassen

Schaltet wieder auf das Systempython um. `(.venv)` verschwindet aus der Eingabeaufforderung.

```bash
deactivate
```

## Wie geht es weiter?

- **Interaktiv ausprobieren:** `python3` ohne Dateiname startet eine Eingabezeile, in der jede Anweisung sofort ausgeführt wird. Beenden mit `exit()` oder <kbd>Strg</kbd>+<kbd>D</kbd>.
- **Programme mit Kommandozeile:** Werkzeuge, die als Befehl genutzt werden sollen (z. B. `mkdocs`), installiert man am besten mit `pipx` (`sudo apt install pipx`). Jedes bekommt automatisch eine eigene virtuelle Umgebung.
- **Webanwendungen:** Die Anleitung [Django](django.md) baut auf dieser Grundlage auf.
- **Editor:** [Visual Studio Code](vscode.md) mit der Erweiterung „Python“ erkennt `.venv` im Projektordner automatisch.

## Deinstallieren

### 1. Übungsordner entfernen

Löscht das Skript und die virtuelle Umgebung samt installierter Pakete.

```bash
rm -rf ~/python-uebung
```

### 2. Zusatzpakete entfernen

Entfernt die Werkzeuge aus dieser Anleitung. Das vorinstallierte `python3` bleibt erhalten und darf **nicht** entfernt werden.

```bash
sudo apt purge python3-venv python3-pip python3-dev python-is-python3
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Räumt Pakete auf, die nur für die entfernten Werkzeuge installiert wurden.

```bash
sudo apt autoremove
```

**Prüfen:** `pip3` ist nicht mehr vorhanden (`Befehl nicht gefunden`), `python3 --version` funktioniert aber weiterhin.

```bash
pip3 --version
```
