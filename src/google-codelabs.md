# Google Codelabs Tools

Google Codelabs Tools wandelt schrittweise Lernanleitungen mit claat in Webseiten um.

Für Ubuntu 26.04 LTS auf amd64. Das offizielle Repository ist seit dem 16. Dezember 2025 archiviert. Dieser Weg dient dem Arbeiten mit bestehenden Codelabs; das Projekt erhält dort keine regulären Änderungen mehr. Verwende einen neuen Projektordner; bestehende Dateien werden bei den Beispielen teilweise überschrieben.

## Installation

### 1. Paketlisten aktualisieren

Lädt die Paketinformationen für die Installation.

````bash
sudo apt update
````

### 2. Grundwerkzeuge installieren

Installiert die Laufzeit und deren Paketwerkzeuge aus Ubuntu.

````bash
sudo apt install golang-go ca-certificates
````

### 3. Projektordner anlegen

Hält Dateien und Abhängigkeiten dieses Beispiels zusammen.

````bash
mkdir ~/codelabs-lab
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/codelabs-lab
````

### 5. Binärordner anlegen

Speichert claat ausschließlich im Beispielprojekt.

````bash
mkdir bin
````

### 6. claat installieren

Baut die CLI aus dem archivierten offiziellen Modul. Bei einem Abhängigkeitsfehler nicht auf alte go-get-Installationsbefehle ausweichen, sondern die konkrete Fehlermeldung prüfen.

````bash
GOBIN="$PWD/bin" go install github.com/googlecodelabs/tools/claat@latest
````

### 7. Codelab schreiben

Legt Metadaten, Kennung und zwei Lernschritte an.

````bash
cat > labor.md <<'EOF'
author: Ubuntu-Labor
summary: Eine erste lokale Lernanleitung
id: ubuntu-einstieg
categories: ubuntu
environments: Web
status: Draft

# Ubuntu schrittweise erkunden

## Arbeitsordner anzeigen
Duration: 0:02:00

Öffne ein Terminal und führe `pwd` aus.

## Ergebnis verstehen
Duration: 0:01:00

Die Ausgabe nennt den aktuellen Arbeitsordner.
EOF
````

### 8. HTML exportieren

Erzeugt den Ordner ubuntu-einstieg mit der Lernanleitung.

````bash
./bin/claat export labor.md
````

### 9. HTTP-Werkzeug installieren

Python liefert die erzeugten Dateien lokal aus.

````bash
sudo apt install python3
````

### 10. Codelab ansehen

Öffne http://127.0.0.1:8000/ubuntu-einstieg/ und prüfe beide Schritte. Die erzeugte Oberfläche kann externe Ressourcen nachladen. Strg + C beendet den Server.

````bash
python3 -m http.server 8000 --bind 127.0.0.1
````

## Installation prüfen

### 1. CLI-Hilfe anzeigen

Bestätigt, dass claat gebaut wurde und ausführbar ist.

````bash
./bin/claat help
````

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/codelabs-lab
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/codelabs-lab && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[Archivstatus](https://github.com/googlecodelabs/tools), [claat-Installation](https://github.com/googlecodelabs/tools/blob/main/claat/README.md) und [Eingabeformat](https://github.com/googlecodelabs/tools/blob/main/sample/codelab.md). Lizenz: Apache-2.0.
