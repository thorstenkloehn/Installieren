# Quarto Live

Quarto Live ergänzt Quarto-Dokumente um R- und Python-Zellen, die im Browser ausgeführt werden.

Für Ubuntu 26.04 LTS auf amd64. Installiere zunächst Quarto nach der [Quarto-Anleitung](quarto.md). Hier wird eine Python-Seite eingerichtet. Verwende einen neuen Projektordner; bestehende Dateien werden bei den Beispielen teilweise überschrieben.

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
mkdir ~/quarto-live-lab
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/quarto-live-lab
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

### 7. Jupyter-Werkzeuge installieren

Stellt die beim Rendern verwendete Python-Engine bereit. Die spätere Übung läuft über Pyodide.

````bash
.venv/bin/python -m pip install jupyter
````

### 8. Quarto-Erweiterung hinzufügen

Lädt die Erweiterung in dieses Projekt. Bestätige die Rückfrage nach dem vertrauenswürdigen Herausgeber.

````bash
quarto add r-wasm/quarto-live
````

### 9. Dokument schreiben

Die Kennzeichnung pyodide richtet eine interaktive Python-Zelle ein.

````bash
cat > index.qmd <<'EOF'
---
title: "Python-Labor im Browser"
format: live-html
---

Ändere die Werte und starte die Rechnung erneut.

```{pyodide}
werte = [3, 6, 12]
print(sum(werte))
```
EOF
````

### 10. Vorschau starten

Öffne http://127.0.0.1:4200. Starte die Python-Zelle: erwartet wird 21. Die virtuelle Umgebung wird für den Bau gewählt; Browserlaufzeit und zusätzliche Pakete benötigen beim Laden Internet. Strg + C beendet die Vorschau.

````bash
QUARTO_PYTHON="$PWD/.venv/bin/python" quarto preview index.qmd --host 127.0.0.1 --port 4200 --no-browser
````

## Installation prüfen

### 1. Dokument bauen

Erzeugt index.html und benötigte Begleitdateien. Bewahre sie zusammen auf.

````bash
QUARTO_PYTHON="$PWD/.venv/bin/python" quarto render index.qmd
````

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/quarto-live-lab
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/quarto-live-lab && echo 'Projekt entfernt'
````

Quarto selbst wird bei Bedarf nach der [Quarto-Anleitung](quarto.md) entfernt.

## Quellen und Lizenz

[Quarto Live installieren](https://r-wasm.github.io/quarto-live/getting_started/installation.html) und [Browserpakete](https://r-wasm.github.io/quarto-live/getting_started/packages.html). Die Lizenz der Erweiterung und der eingebundenen Laufzeiten ist bei Weitergabe gesondert zu beachten.
