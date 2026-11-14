# Eigener Kurs-Prüfer mit VS-Code-Erweiterung

Dieser kleine Kurs-Prüfer bewertet eine Python-Aufgabe im Terminal und über einen eigenen VS-Code-Befehl.

Die Anleitung gilt für Ubuntu 26.04 LTS (amd64). Voraussetzung für die Editorintegration ist [Visual Studio Code](vscode.md). Die Tests laufen direkt mit deinen Benutzerrechten. Das Beispiel ist für eigene lokale Übungen gedacht und keine Sandbox für fremden Code.

## Installation

### 1. Paketlisten aktualisieren

Lädt die verfügbaren Paketinformationen.

````bash
sudo apt update
````

### 2. Werkzeuge installieren

Python führt die Tests aus; Node.js und npm bauen die Erweiterung. unzip entpackt den Kurs.

````bash
sudo apt install python3 nodejs npm unzip
````

### 3. Node.js prüfen

Ubuntu 26.04 liefert Node.js 22.22.1. Verwende für das Paketwerkzeug mindestens Node.js 22.12.

````bash
node --version
````

### 4. Kursdateien herunterladen

Lade das [Beispielarchiv](downloads/kurs-pruefer.zip) über den Browser nach ~/Downloads herunter. Es enthält den vollständigen eigenen Quellcode, die Aufgabe und ihre Tests. Der Zielordner ~/kurs-pruefer soll noch nicht existieren.

### 5. Kurs entpacken

Erzeugt ~/kurs-pruefer mit Aufgabe, Tests und Erweiterungsquellen.

````bash
unzip ~/Downloads/kurs-pruefer.zip -d ~
````

### 6. Kursordner öffnen

Prüfungen werden immer aus diesem Ordner gestartet.

````bash
cd ~/kurs-pruefer
````

### 7. Ausgangszustand prüfen

Die Aufgabe ist absichtlich unvollständig. Erwartet wird ein Fehler wegen NotImplementedError und ein von null verschiedener Rückgabewert.

````bash
python3 -m unittest discover -s tests -p test_aufgabe.py -v
````

### 8. Aufgabe bearbeiten

Implementiere quadratsumme(werte): Quadriere jede Zahl und addiere die Ergebnisse. Für eine leere Eingabe ist das Ergebnis 0. Auch Generatoren müssen funktionieren; die Eingabe darf nicht verändert werden. Bearbeite nur aufgabe.py und speichere die Datei.

````bash
code aufgabe.py
````

### 9. Lösung prüfen

Bei einer richtigen Lösung müssen fünf Tests mit OK enden. Derselbe Befehl wird später von der Erweiterung gestartet.

````bash
python3 -m unittest discover -s tests -p test_aufgabe.py -v
````

### 10. Erweiterungsordner öffnen

Hier liegt die Paketbeschreibung für VS Code.

````bash
cd ~/kurs-pruefer/erweiterung
````

### 11. Paketwerkzeug installieren

Installiert vsce nur in diesem Projekt, ohne sudo. Die Erweiterung selbst benötigt keine npm-Laufzeitpakete.

````bash
npm install --save-dev @vscode/vsce
````

### 12. VSIX bauen

Erzeugt ein lokal installierbares Paket. Die Optionen erlauben einen lokalen Eigenbau ohne Repositoryadresse und ohne festgelegte Weitergabelizenz; es wird nichts im Marketplace veröffentlicht.

````bash
npx vsce package --allow-missing-repository --skip-license --out kurs-pruefer-0.1.0.vsix
````

### 13. Erweiterung installieren

Registriert das lokale Paket im aktiven VS-Code-Profil. Ein Marketplace-Konto ist nicht erforderlich.

````bash
code --install-extension ./kurs-pruefer-0.1.0.vsix
````

### 14. Kurs im Editor öffnen

Öffnet ausdrücklich den Kursordner, nicht nur den Unterordner erweiterung. Bestätige das Workspace-Vertrauen nur für diesen selbst geprüften Kurs.

````bash
code --new-window ~/kurs-pruefer
````

### 15. Kursprüfung starten

Öffne Strg + Umschalt + P und wähle Kurs: Aufgabe prüfen. Die Erweiterung speichert offene Dateien und öffnet einen Python-Testtask. Bei mehreren Arbeitsordnern wird der Zielordner ausgewählt. Im Terminal sollen dieselben fünf Testergebnisse wie zuvor erscheinen.

## Installation prüfen

### 1. Erweiterung anzeigen

Die Ausgabe muss lokale-kurse.kurs-pruefer@0.1.0 enthalten.

````bash
code --list-extensions --show-versions
````

### 2. Fehlererkennung testen

Baue vorübergehend einen falschen Rückgabewert in aufgabe.py ein. Starte Kurs: Aufgabe prüfen erneut; die Tests müssen scheitern. Stelle danach deine richtige Lösung wieder her und prüfe sie erneut.

## Quellcode verstehen

Die Datei tests/test_aufgabe.py enthält fünf Fälle: positive Werte, negative Werte, leere Eingabe, Generator und unveränderte Eingabe. VS Code startet Python über ProcessExecution mit einer festen Argumentliste und dem gewählten Kursordner. Dadurch funktionieren auch Ordnernamen mit Leerzeichen. Die Erweiterung wertet keine Shellbefehle aus Kursbeschreibungen aus. Die Python-Tests selbst führen den Aufgabencode aus.

Der vollständige Quellcode steht im Archiv. Eine zusätzliche fertige [VSIX-Datei](downloads/kurs-pruefer-0.1.0.vsix) liegt zum lokalen Installieren bei; die Schritte oben zeigen den eigenen Bau. Der Platzhalter-Herausgeber lokale-kurse ist keine Marketplace-Registrierung. Vor einer Weitergabe eigener Änderungen legst du Lizenz, Herausgeber und Versionspflege selbst fest.

## Deinstallieren

### 1. Erweiterung entfernen

Entfernt die lokale Erweiterung aus dem aktiven Profil.

````bash
code --uninstall-extension lokale-kurse.kurs-pruefer
````

### 2. Projekt optional entfernen

Sichere vorher deine Lösung. Löscht Aufgabe, Tests und lokale npm-Werkzeuge.

````bash
rm -rf -- ~/kurs-pruefer
````

### 3. Entfernung prüfen

lokale-kurse.kurs-pruefer darf nicht mehr in der Liste erscheinen.

````bash
code --list-extensions
````

## Quellen und Lizenz

Eigener Beispielcode für dieses Buch. Technische Referenzen: [VS-Code-Task-API](https://code.visualstudio.com/api/references/vscode-api#ProcessExecution), [Paketierung als VSIX](https://code.visualstudio.com/api/working-with-extensions/publishing-extension), [Workspace Trust](https://code.visualstudio.com/api/extension-guides/workspace-trust) und [Python unittest](https://docs.python.org/3/library/unittest.html). Es wird keine Fremdlizenz automatisch auf deinen eigenen Kurs übertragen.
