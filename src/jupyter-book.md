# Jupyter Book

Jupyter Book verbindet erklärende Texte mit ausführbaren Jupyter-Notizbüchern.

Für Ubuntu 26.04 LTS auf amd64. Diese Anleitung verwendet Version 2 auf Basis von MyST. Anleitungen für Version 1 mit _config.yml und _toc.yml sind damit nicht austauschbar. Verwende einen neuen Projektordner; bestehende Dateien werden bei den Beispielen teilweise überschrieben.

## Installation

### 1. Paketlisten aktualisieren

Lädt die Paketinformationen für die Installation.

````bash
sudo apt update
````

### 2. Grundwerkzeuge installieren

Installiert die Laufzeit und deren Paketwerkzeuge aus Ubuntu.

````bash
sudo apt install python3 python3-venv
````

### 3. Projektordner anlegen

Hält Dateien und Abhängigkeiten dieses Beispiels zusammen.

````bash
mkdir ~/jupyter-book-lab
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/jupyter-book-lab
````

### 5. Python-Umgebung anlegen

Die Bibliotheken bleiben vom Ubuntu-Python getrennt.

````bash
python3 -m venv .venv
````

### 6. Paketwerkzeug aktualisieren

Verwendet ausdrücklich pip aus der neuen Umgebung.

````bash
.venv/bin/python -m pip install --upgrade pip
````

### 7. Node.js installieren

Die MyST-Engine von Jupyter Book 2 benötigt zusätzlich Node.js.

````bash
sudo apt install nodejs npm
````

### 8. Buch- und Notebookwerkzeuge installieren

JupyterLab dient als lokale Oberfläche; ipykernel führt die Python-Zellen aus.

````bash
.venv/bin/python -m pip install "jupyter-book>=2,<3" jupyterlab ipykernel
````

### 9. Beispielnotizbuch schreiben

Erzeugt ein gültiges .ipynb mit einer eigenen kleinen Rechnung.

````bash
.venv/bin/python - <<'EOF'
import nbformat as nbf
book = nbf.v4.new_notebook()
book.cells = [
    nbf.v4.new_markdown_cell('# Mein Ubuntu-Versuch'),
    nbf.v4.new_code_cell('messwerte = [10, 12, 14]\nsum(messwerte) / len(messwerte)')
]
book.metadata.kernelspec = {
    'display_name': 'Python 3', 'language': 'python', 'name': 'python3'
}
nbf.write(book, 'versuch.ipynb')
EOF
````

### 10. Buch konfigurieren

Nimmt das Notizbuch als Startseite auf.

````bash
cat > myst.yml <<'EOF'
version: 1
project:
  title: Ubuntu-Notizbuch
  toc:
    - file: versuch.ipynb
site:
  template: book-theme
EOF
````

### 11. Notizbuch lokal öffnen

Öffne die angezeigte Adresse mit Token. Wähle versuch.ipynb und führe die Rechenzelle aus. Erwartet wird 12.0. Speichere und beende JupyterLab mit Strg + C.

````bash
.venv/bin/jupyter lab --ip=127.0.0.1 --no-browser
````

### 12. Buchvorschau starten

Öffne die angezeigte Adresse, normalerweise http://localhost:3000. Die zuvor gespeicherte Ausgabe soll im Buch erscheinen. Strg + C beendet die Vorschau.

````bash
.venv/bin/jupyter book start
````

## Installation prüfen

### 1. HTML bauen

Schreibt die statischen Buchseiten nach _build/html.

````bash
.venv/bin/jupyter book build --html
````

### 2. Version anzeigen

Die Ausgabe soll Hauptversion 2 zeigen.

````bash
.venv/bin/jupyter book --version
````

## Binder, JupyterHub und Colab

Diese Dienste sind getrennte Ausführungsumgebungen. Es wird hier kein externer Dienst eingerichtet oder etwas hochgeladen.

1. Für Binder lege das Notizbuch und eine Datei mit seinen Python-Abhängigkeiten in ein öffentlich erreichbares Repository. Erzeuge anschließend auf [mybinder.org](https://mybinder.org/) einen Startlink für dieses Repository und füge ihn als normalen Markdown-Link in die Buchseite ein. Das öffentliche Angebot baut seine Umgebung extern mit Containern; auf deinem Ubuntu-Rechner wird dadurch kein Docker installiert.

2. Für einen vorhandenen JupyterHub verwende dessen bereitgestellte Notebook- oder nbgitpuller-Links. Die genaue URL hängt vom Hub deiner Einrichtung ab. Ein Buch erzeugt keine Benutzerkonten und keine Hub-Infrastruktur.

3. Für Colab öffne [Google Colab](https://colab.research.google.com/), importiere versuch.ipynb über den Dateidialog und führe die Zelle erneut aus. Ein öffentlicher Link setzt eine bewusst freigegebene Notebookdatei voraus.

Die .ipynb-Datei ist die übertragbare Einheit; eine MyST-Markdown-Seite wird von Colab nicht automatisch als Notizbuch ausgeführt.

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/jupyter-book-lab
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/jupyter-book-lab && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[Jupyter Book 2 installieren](https://executablebooks.github.io/jupyter-book-myst/install), [Website erstellen](https://jupyterbook.org/stable/build-and-publish/website/), [Binder](https://mybinder.readthedocs.io/en/latest/introduction.html), [JupyterHub](https://jupyterhub.readthedocs.io/en/stable/) und [Colab](https://research.google.com/colaboratory/faq.html). Jupyter Book steht unter BSD-3-Clause; Dienste haben eigene Nutzungsbedingungen.
