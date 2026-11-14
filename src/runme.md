# Runme

Runme führt Befehlsblöcke aus Markdown als lokale Arbeitsabläufe aus.

Für Ubuntu 26.04 LTS auf amd64. Die Befehle laufen mit deinen Benutzerrechten auf Ubuntu. Lies fremde Notizbücher vor dem Ausführen. Verwende einen neuen Projektordner; bestehende Dateien werden bei den Beispielen teilweise überschrieben.

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
mkdir ~/runme-lab
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/runme-lab
````

### 5. Go prüfen

Aktuelle Runme-Versionen können ein neueres Go benötigen. Go kann bei Bedarf eine passende Toolchain nachladen, sofern die Netzwerk- und Go-Konfiguration dies erlauben.

````bash
go version
````

### 6. Zielordner anlegen

Der eigene bin-Ordner hält Runme vom Systempfad getrennt.

````bash
mkdir bin
````

### 7. Runme bauen

Installiert die v3-CLI aus dem offiziellen Go-Modul in dieses Beispielprojekt.

````bash
GOBIN="$PWD/bin" go install github.com/runmedev/runme/v3@latest
````

### 8. Labor schreiben

Enthält nur einen harmlosen Testbefehl. Die runme-Markierung gibt dem Block einen Namen.

````bash
cat > README.md <<'EOF'
# Lokales Ubuntu-Labor

## Arbeitsordner prüfen

```sh { name=ordner-pruefen }
pwd
```
EOF
````

### 9. Aufgaben auswählen

Wähle den Block ordner-pruefen aus. Die Ausgabe soll den Ordner runme-lab zeigen. Beende die Oberfläche über deren Quit-Funktion beziehungsweise Strg + C.

````bash
./bin/runme tui
````

## Installation prüfen

### 1. CLI prüfen

Zeigt die verfügbaren Befehle. Bei Installation aus Go kann eine generische Versionsnummer angezeigt werden.

````bash
./bin/runme --help
````

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/runme-lab
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/runme-lab && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[Offizielle CLI-Installation](https://docs.runme.dev/installation/cli/) und [Go-Modul](https://github.com/runmedev/runme/blob/main/go.mod). Lizenz: Apache-2.0.
