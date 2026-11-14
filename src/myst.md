# MyST

MyST erzeugt wissenschaftliche Dokumentationen aus Markdown und Jupyter-Notizbüchern.

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
sudo apt install nodejs npm
````

### 3. Projektordner anlegen

Hält Dateien und Abhängigkeiten dieses Beispiels zusammen.

````bash
mkdir ~/myst-lab
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/myst-lab
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

### 7. MyST installieren

Installiert die CLI und npm 11 im Projekt. Aktuelles MyST benötigt npm ab Version 10; Ubuntu 26.04 liefert npm 9. npx verwendet für MyST die lokale neuere npm-Version. Das apt-Paket wird dabei nicht ersetzt.

````bash
npm install --save-dev mystmd npm@11
````

### 8. Startseite schreiben

Erzeugt den eigenen Beispielinhalt.

````bash
cat > index.md <<'EOF'
# Mein Rechenbuch

Dieses Buch erklärt Versuche unter Ubuntu.

## Erste Beobachtung

Eine Rechnung wird zusammen mit ihrem Ergebnis dokumentiert.
EOF
````

### 9. Buch konfigurieren

Legt die Startseite und das Buchdesign fest.

````bash
cat > myst.yml <<'EOF'
version: 1
project:
  title: Ubuntu-Rechenbuch
  toc:
    - file: index.md
site:
  template: book-theme
EOF
````

### 10. Vorschau starten

Das Design wird beim ersten Start geladen. Öffne die im Terminal genannte Adresse, normalerweise http://localhost:3000. Prüfe die Überschrift. Strg + C beendet die Vorschau.

````bash
npx myst start
````

## Installation prüfen

### 1. HTML bauen

Erzeugt die statische Ausgabe unter _build/html. Ein erfolgreicher Bau führt noch keine neuen Python-Zellen aus.

````bash
npx myst build --html
````

### 2. Version anzeigen

Dokumentiert den installierten CLI-Stand.

````bash
npx myst --version
````

## Notizbücher ausführen

Für ein vollständiges Beispiel mit einer lokalen Jupyter-Umgebung und Verweisen auf Binder, JupyterHub und Colab siehe [Jupyter Book](jupyter-book.md). Der statische Buchbau allein stellt keinen Rechenserver bereit.

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/myst-lab
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/myst-lab && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[MyST-Einstieg](https://mystmd.org/guide/quickstart) und [MyST-Projekt](https://github.com/jupyter-book/mystmd). Lizenz: MIT.
