# LiaScript mit devserver

LiaScript stellt Markdown-Kurse mit interaktiven Aufgaben im Browser dar.

Für Ubuntu 26.04 LTS auf amd64. Der devserver dient der lokalen Vorschau. Verwende einen neuen Projektordner; bestehende Dateien werden bei den Beispielen teilweise überschrieben.

## Installation

### 1. Paketlisten aktualisieren

Lädt die Paketinformationen für die Installation.

````bash
sudo apt update
````

### 2. Grundwerkzeuge installieren

Installiert die Laufzeit und deren Paketwerkzeuge aus Ubuntu.

````bash
sudo apt install nodejs npm
````

### 3. Projektordner anlegen

Hält Dateien und Abhängigkeiten dieses Beispiels zusammen.

````bash
mkdir ~/liascript-kurs
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/liascript-kurs
````

### 5. Node.js prüfen

Ubuntu 26.04 liefert Node.js 22.22.1. Für diese Beispiele mindestens 22.12 verwenden; bei einer älteren aktiven Installation hier anhalten.

````bash
node --version
````

### 6. Paketverwaltung vorbereiten

Erzeugt die Liste der Projektabhängigkeiten. npm-Befehle ohne sudo ausführen.

````bash
npm init -y
````

### 7. devserver installieren

Hält den Entwicklungsserver im Projekt statt ihn systemweit einzurichten.

````bash
npm install --save-dev @liascript/devserver
````

### 8. Kurs anlegen

Schreibt einen kleinen Kurs mit einer Auswahlfrage.

````bash
cat > README.md <<'EOF'
<!--
version: 0.0.1
language: de
-->

# Ubuntu kennenlernen

## Paketverwaltung

Welcher Befehl aktualisiert die Paketlisten?

[(X)] sudo apt update
[( )] pwd
EOF
````

### 9. Kursvorschau starten

Öffne die im Terminal angezeigte lokale Adresse. Prüfe, ob die erste Antwort als richtig erkannt wird. Der Server kann auch im lokalen Netz lauschen; verwende ihn nur für deine Entwicklungsdateien. Strg + C beendet ihn.

````bash
npx liascript-devserver --input README.md --port 3000 --live
````

## Installation prüfen

### 1. Versionsstand anzeigen

Die Ausgabe nennt devserver und eingebundenen Interpreter getrennt.

````bash
npx liascript-devserver --version
````

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/liascript-kurs
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/liascript-kurs && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[devserver](https://github.com/LiaScript/LiaScript-DevServer) und [LiaScript-Lizenz](https://github.com/LiaScript/LiaScript/blob/master/LICENSE). Interpreter: BSD-3-Clause; devserver: MIT.
