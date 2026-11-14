# Pyodide-MkDocs-Theme

Pyodide-MkDocs-Theme ergänzt MkDocs-Seiten um Python-Übungen, die im Browser laufen.

Für Ubuntu 26.04 LTS auf amd64.  Verwende einen neuen Projektordner; bestehende Dateien werden bei den Beispielen teilweise überschrieben.

## Installation

### 1. Paketlisten aktualisieren

Lädt die Paketinformationen für die Installation.

````bash
sudo apt update
````

### 2. Grundwerkzeuge installieren

Installiert die Laufzeit und deren Paketwerkzeuge aus Ubuntu.

````bash
sudo apt install python3 python3-venv nano
````

### 3. Projektordner anlegen

Hält Dateien und Abhängigkeiten dieses Beispiels zusammen.

````bash
mkdir ~/pyodide-mkdocs-lab
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/pyodide-mkdocs-lab
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

### 7. Theme installieren

Lädt auch die benötigten MkDocs-Erweiterungen in die virtuelle Umgebung.

````bash
.venv/bin/python -m pip install pyodide-mkdocs-theme
````

### 8. Projektvorlage erzeugen

Verwendet die zum installierten Theme passende Konfiguration und Beispielübungen.

````bash
.venv/bin/python -m pyodide_mkdocs_theme --new buch
````

### 9. Buchordner öffnen

Die virtuelle Umgebung bleibt eine Ebene darüber.

````bash
cd buch
````

### 10. Konfiguration öffnen

Setze in mkdocs.yml site_name auf Ubuntu-Labor, site_url auf http://127.0.0.1:8000/ und unter plugins → pyodide_macros → project den Wert id auf ubuntu-labor. Prüfe außerdem den vorgegebenen copyright-Block: Er darf für deine eigenen Inhalte keine ungeprüften Rechteangaben enthalten. Erhalte die übrigen technischen Einstellungen. Speichere mit Strg + O und beende mit Strg + X.

````bash
nano mkdocs.yml
````

### 11. Vorschau starten

Öffne http://127.0.0.1:8000. Führe die mitgelieferte Python-Übung aus; beim ersten Laden wird die Browserlaufzeit aus dem Netz geladen. Strg + C beendet die Vorschau.

````bash
../.venv/bin/mkdocs serve --dev-addr 127.0.0.1:8000
````

## Installation prüfen

### 1. Seiten bauen

Erzeugt site/. Der Bau und anschließend die Ausführung einer Übung in der Vorschau müssen funktionieren.

````bash
../.venv/bin/mkdocs build
````

### 2. Paketstand anzeigen

Zeigt Theme und Abhängigkeiten für eine spätere Fehlersuche.

````bash
../.venv/bin/python -m pip show pyodide-mkdocs-theme
````

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/pyodide-mkdocs-lab
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/pyodide-mkdocs-lab && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[Installation und Projektvorlage](https://frederic-zinelli.gitlab.io/pyodide-mkdocs-theme/installation/) und [Paket](https://pypi.org/project/pyodide-mkdocs-theme/). Lizenz: GPLv3; zusätzliche Bibliotheken haben eigene Lizenzbedingungen.
