# CodeTour

CodeTour führt Schritt für Schritt durch Dateien eines Projekts in VS Code.

Die Anleitung gilt für Ubuntu 26.04 LTS (amd64). Voraussetzung ist [Visual Studio Code](vscode.md). Das Beispiel benötigt keine Cloud und keine automatische Bewertung.

## Installation

### 1. Paketlisten aktualisieren

Aktualisiert die Paketinformationen für Python.

````bash
sudo apt update
````

### 2. Python installieren

Wird für das kleine Projektbeispiel gebraucht.

````bash
sudo apt install python3
````

### 3. Erweiterung installieren

Verwendet die offizielle Marketplace-Kennung.

````bash
code --install-extension vsls-contrib.codetour
````

### 4. Projektordner anlegen

Verwende einen noch nicht vorhandenen Zielordner.

````bash
mkdir ~/codetour-lab
````

### 5. Projektordner öffnen

Die folgenden Dateien gehören zu diesem Projekt.

````bash
cd ~/codetour-lab
````

### 6. Beispielprogramm schreiben

Zwei Zeilen genügen, um Navigation und Erläuterung zu erproben.

````bash
cat > beispiel.py <<'EOF'
orte = ["Bremen", "Ulm", "Jena"]
print(sorted(orte))
EOF
````

### 7. Tourordner anlegen

CodeTour findet gespeicherte Touren im Verzeichnis .tours.

````bash
mkdir .tours
````

### 8. Tour schreiben

Die zwei Schritte zeigen auf vorhandene Zeilen des eigenen Beispiels.

````bash
cat > .tours/einstieg.tour <<'EOF'
{
  "title": "Ortsliste verstehen",
  "steps": [
    {
      "file": "beispiel.py",
      "line": 1,
      "description": "Hier wird die Liste angelegt. Ergänze einen vierten Ort."
    },
    {
      "file": "beispiel.py",
      "line": 2,
      "description": "Die Ausgabe ist alphabetisch sortiert. Prüfe sie anschließend im Terminal."
    }
  ]
}
EOF
````

### 9. Projekt in VS Code öffnen

CodeTour erkennt die Tour im geöffneten Ordner.

````bash
code --new-window .
````

### 10. Tour starten

Wähle im CodeTour-Bereich des Explorers Ortsliste verstehen und starte die Tour. Kontrolliere, dass beide Schritte die passenden Zeilen öffnen. Falls der Bereich fehlt, lade das Fenster mit Developer: Reload Window neu.

## Installation prüfen

### 1. Erweiterung anzeigen

Die Ausgabe muss vsls-contrib.codetour mit Versionsnummer enthalten.

````bash
code --list-extensions --show-versions
````

### 2. Beispiel ausführen

Zeigt die sortierte Liste; dies ist ein manuell gestarteter Befehl und keine automatische CodeTour-Bewertung.

````bash
python3 beispiel.py
````

## Deinstallieren

### 1. Erweiterung entfernen

Entfernt CodeTour aus dem aktiven VS-Code-Profil.

````bash
code --uninstall-extension vsls-contrib.codetour
````

### 2. Projekt optional entfernen

Löscht auch die eigene Tour und das Beispielprogramm.

````bash
rm -rf -- ~/codetour-lab
````

### 3. Entfernung prüfen

vsls-contrib.codetour soll nicht mehr in der Ausgabe stehen.

````bash
code --list-extensions
````

## Quellen und Lizenz

[CodeTour-Projekt](https://github.com/microsoft/codetour), [Paketkennung](https://github.com/microsoft/codetour/blob/main/package.json) und [Tourformat](https://github.com/microsoft/codetour/blob/main/schema.json). Lizenz: MIT.
