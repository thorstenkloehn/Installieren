# marimo

marimo ist ein reaktives Python-Notizbuch mit einer Oberfläche im Browser.

Für Ubuntu 26.04 LTS auf amd64. Beim lokalen Editor läuft Python auf Ubuntu. Ein zusätzlicher WebAssembly-Export führt geeignete Notizbücher vollständig im Browser aus. Verwende einen neuen Projektordner; bestehende Dateien werden bei den Beispielen teilweise überschrieben.

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
mkdir ~/marimo-lab
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/marimo-lab
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

### 7. marimo installieren

Installiert marimo und uv in der eigenen Umgebung. Der aktuelle WebAssembly-Export benötigt uv zur Auflösung lokaler Importe.

````bash
.venv/bin/python -m pip install marimo uv
````

### 8. Notizbuch erstellen

Öffne die angezeigte lokale Adresse. Füge eine Python-Zelle mit print(sum([4, 8, 15])) ein und führe sie aus: erwartet wird 27. Speichere das Notizbuch und beende den Server mit Strg + C.

````bash
.venv/bin/marimo edit labor.py --host 127.0.0.1
````

### 9. Browserfassung exportieren

Erzeugt dist/ für die Ausführung über Pyodide. Native Systemprogramme und beliebige Python-Erweiterungen sind dort nicht verfügbar.

````bash
PATH="$PWD/.venv/bin:$PATH" .venv/bin/marimo export html-wasm labor.py -o dist --mode edit
````

### 10. Browserfassung testen

Öffne http://127.0.0.1:8000. Starte die Zelle erneut; dafür ist nun kein laufender marimo-Server nötig. Internet wird zum Laden von Laufzeit und Paketen benötigt. Strg + C beendet den HTTP-Server.

````bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
````

## Installation prüfen

### 1. Version anzeigen

Bestätigt die Installation im Projekt.

````bash
.venv/bin/marimo --version
````

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/marimo-lab
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/marimo-lab && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[Installation](https://docs.marimo.io/getting_started/installation/) und [WebAssembly-Export](https://docs.marimo.io/guides/exporting/webassembly_html/). marimo steht unter Apache-2.0.
