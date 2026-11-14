# CodeRoad

CodeRoad spielt interaktive Programmierkurse in VS Code ab.

Die Anleitung gilt für Ubuntu 26.04 LTS (amd64). Installiere zunächst [Visual Studio Code](vscode.md). Die Erweiterung verwendet Git; weitere Laufzeiten hängen vom gewählten Kurs ab.

## Installation

### 1. Paketlisten aktualisieren

Bereitet die Git-Installation vor.

````bash
sudo apt update
````

### 2. Git installieren

CodeRoad verwendet Git-basierte Kursstände.

````bash
sudo apt install git
````

### 3. VS Code prüfen

Falls der Befehl fehlt, folge zuerst der VS-Code-Anleitung.

````bash
code --version
````

### 4. Erweiterung installieren

Verwendet die genaue Marketplace-Kennung CodeRoad.coderoad, ohne sudo.

````bash
code --install-extension CodeRoad.coderoad
````

### 5. Kursordner anlegen

Für den Einstieg einen neuen leeren Ordner verwenden.

````bash
mkdir ~/coderoad-lab
````

### 6. Kursordner öffnen

Öffnet VS Code in einem eigenen Fenster.

````bash
code --new-window ~/coderoad-lab
````

### 7. CodeRoad starten

Öffne mit Strg + Umschalt + P die Befehlspalette und wähle CodeRoad: Start.

### 8. Kurs laden

Wähle Start New Tutorial und lade eine tutorial.json eines vertrauenswürdigen CodeRoad-Kurses. Die [offizielle Anleitung](https://coderoad.github.io/docs/create-a-practice-tutorial/) beschreibt auch die Erstellung. Prüfe die vom Kurs verlangten Laufzeiten; Hooks können Befehle direkt auf deinem Rechner starten. Ein leerer Ordner allein enthält noch keinen Kurs.

## Installation prüfen

### 1. Installierten Stand anzeigen

Die Ausgabe muss CodeRoad.coderoad mit einer Versionsnummer enthalten.

````bash
code --list-extensions --show-versions
````

### 2. Kursprüfung kontrollieren

Nach dem Laden muss die Oberfläche die erste Aufgabe zeigen. Starte deren Tests und kontrolliere, dass Rückmeldungen erscheinen. Ohne konkreten Kurs ist nur die Erweiterungsinstallation geprüft.

## Deinstallieren

### 1. Erweiterung entfernen

Entfernt CodeRoad aus dem aktiven VS-Code-Profil.

````bash
code --uninstall-extension CodeRoad.coderoad
````

### 2. Beispielordner optional löschen

Sichere vorher eigene Kurslösungen; der ganze Ordner wird gelöscht.

````bash
rm -rf -- ~/coderoad-lab
````

### 3. Entfernung prüfen

CodeRoad.coderoad darf nicht mehr in der Liste erscheinen.

````bash
code --list-extensions
````

## Quellen und Lizenz

[Marketplace](https://marketplace.visualstudio.com/items?itemName=CodeRoad.coderoad), [Einrichtung](https://coderoad.github.io/docs/setup/) und [Quellcode](https://github.com/coderoad/coderoad-vscode). Lizenz: AGPL-3.0.
