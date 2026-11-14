# project-based-learning

Diese Sammlung verlinkt Projektanleitungen zum selbstständigen Programmieren.

Für Ubuntu 26.04 LTS (amd64). Das Klonen legt eine lokale Kopie der Linkliste an. Die verlinkten Projekte werden dadurch weder heruntergeladen noch installiert.

## Einrichtung

### 1. Paketlisten aktualisieren

Bereitet die Git-Installation vor.

````bash
sudo apt update
````

### 2. Git installieren

Wird für die lokale Sammlung benötigt.

````bash
sudo apt install git
````

### 3. Sammlung klonen

Verwende einen noch nicht vorhandenen Zielordner.

````bash
git clone https://github.com/practical-tutorials/project-based-learning.git ~/projektideen
````

### 4. Sammlung öffnen

Wechselt in die heruntergeladene Sammlung.

````bash
cd ~/projektideen
````

### 5. Übersicht lesen

Zeigt die README-Datei im Terminal. Beende less mit q; zum Öffnen der Links ist die GitHub-Ansicht im Browser meist bequemer.

````bash
less README.md
````

### 6. Projekt auswählen

Öffne einen passenden Link auf der ursprünglichen GitHub-Seite. Installiere anschließend nur die dort tatsächlich benötigten Werkzeuge nach ihrer eigenen Anleitung. Bewerte die Aktualität des Projekts, bevor du alte Installationsbefehle übernimmst.

## Installation prüfen

### 1. Quellstand anzeigen

Bestätigt, dass die Sammlung als Git-Arbeitskopie vorliegt.

````bash
git log -1 --oneline
````

### 2. README prüfen

Die Ausgabe muss bestätigen, dass die Übersicht vorhanden ist.

````bash
test -s README.md && echo 'Projektübersicht vorhanden'
````

## Aktualisieren

### 1. Sammlung aktualisieren

Holt neue Links, solange keine abweichenden lokalen Änderungen vorliegen.

````bash
git pull --ff-only
````

## Deinstallieren

### 1. Sammlung entfernen

Sichere eigene Notizen vorher; der ganze Beispielordner wird gelöscht.

````bash
rm -rf -- ~/projektideen
````

### 2. Entfernung prüfen

Bestätigt die Entfernung.

````bash
test ! -e ~/projektideen && echo 'Sammlung entfernt'
````

## Quellen und Lizenz

[Offizielles Repository](https://github.com/practical-tutorials/project-based-learning). Die Sammlung steht unter MIT. Die verlinkten Anleitungen, Videos und Quelltexte haben eigene Rechte; die Lizenz der Linkliste erstreckt sich nicht automatisch auf sie.
