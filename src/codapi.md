# Codapi

Codapi ergänzt Webseiten um bearbeitbare und ausführbare Codebeispiele.

Für Ubuntu 26.04 LTS auf amd64. Hier wird das Browser-Widget mit JavaScript eingerichtet; ein eigener Ausführungsserver ist dafür nicht nötig. Verwende einen neuen Projektordner; bestehende Dateien werden bei den Beispielen teilweise überschrieben.

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
mkdir ~/codapi-demo
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/codapi-demo
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

### 7. Widget installieren

Speichert JavaScript und CSS lokal im Projekt.

````bash
npm install @antonz/codapi@0.20.0
````

### 8. Webserver installieren

Python liefert die Demo per HTTP aus.

````bash
sudo apt install python3
````

### 9. Demoseite schreiben

Das Browser-Attribut führt JavaScript auf dem Gerät des Lesers aus. Die Dateien werden aus dem lokal installierten Paket geladen.

````bash
cat > index.html <<'EOF'
<!doctype html>
<html lang="de">
<meta charset="utf-8">
<title>Codapi unter Ubuntu</title>
<link rel="stylesheet" href="./node_modules/@antonz/codapi/dist/snippet.css">
<h1>Rechnen im Browser</h1>
<pre><code>const preise = [4, 7, 12];
console.log(preise.reduce((summe, preis) => summe + preis, 0));</code></pre>
<codapi-snippet engine="browser" sandbox="javascript" editor="basic"></codapi-snippet>
<script src="./node_modules/@antonz/codapi/dist/snippet.js"></script>
</html>
EOF
````

### 10. Demo starten

Öffne http://127.0.0.1:8000. Mit Run soll die Ausgabe 23 erscheinen. Ändere einen Preis über Edit und führe erneut aus. Strg + C beendet den Server.

````bash
python3 -m http.server 8000 --bind 127.0.0.1
````

## Server und Cloud

Der offizielle selbst betriebene Server verwendet Docker für seine Sandboxes. Unter der Vorgabe dieses Buchs wird er nicht eingerichtet. Die Cloud kann alternativ serverseitige Sprachen ausführen; dabei wird der Quellcode an einen externen Dienst übertragen. Der Anbieter nennt am Prüfdatum ein Gratis-Kontingent von 1000 Ausführungen pro Monat. Prüfe die aktuellen Bedingungen vor der Nutzung. Die Browserdemo oben nutzt dieses Kontingent nicht.

### 1. Installation prüfen

Zeigt den lokal installierten Widgetstand.

````bash
npm ls @antonz/codapi
````

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/codapi-demo
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/codapi-demo && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[Widget-Einbindung](https://github.com/nalgeon/codapi-js/blob/main/docs/html.md), [JavaScript im Browser](https://codapi.org/javascript/), [Cloud](https://codapi.org/) und [Serverinstallation](https://github.com/nalgeon/codapi/blob/main/docs/install.md). Widget: MIT; Server: Apache-2.0.
