# Hyperbook

Hyperbook baut interaktive Arbeitshefte aus Markdown-Dateien.

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
mkdir ~/hyperbook-lab
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/hyperbook-lab
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

### 7. Hyperbook installieren

Installiert die CLI im übergeordneten Projektordner. Sie bleibt dadurch auch im Unterordner buch über npx erreichbar.

````bash
npm install --save-dev hyperbook
````

### 8. Buch erzeugen

Der Assistent fragt nach Beschreibung, Autor, Lizenz und Sprache. Gib für die Sprache de an. Wähle die Lizenz für deine eigenen Inhalte bewusst; sie ist von Hyperbooks MIT-Lizenz getrennt.

````bash
npx hyperbook new buch
````

### 9. Buchordner öffnen

Wechselt zum erzeugten Arbeitsheft. Die Paketverwaltung liegt eine Ebene darüber; hier ist kein weiteres npm install nötig.

````bash
cd buch
````

### 10. Vorschau starten

Öffne die vom Terminal angezeigte Adresse, üblicherweise localhost:8080. Prüfe die Navigation und ändere eine Markdown-Seite im Ordner book. Strg + C beendet die Vorschau.

````bash
npx hyperbook dev
````

### 11. Arbeitsheft bauen

Erzeugt die statische Ausgabe. Der Befehl muss ohne Fehler enden; das Terminal nennt den Ausgabeordner.

````bash
npx hyperbook build
````

## Installation prüfen

### 1. Paketstand anzeigen

Dokumentiert die installierte Hyperbook-Version. Bewahre package-lock.json für spätere Neuinstallationen auf.

````bash
npm ls hyperbook
````

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/hyperbook-lab
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/hyperbook-lab && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[Einstieg](https://hyperbook.openpatch.org/) und [Quellcode](https://github.com/openpatch/hyperbook). Lizenz: MIT. Einzelne eingebundene Laufzeiten können eigene Lizenzen haben.
