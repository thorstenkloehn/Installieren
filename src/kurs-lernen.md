# kurs-lernen.js

kurs-lernen.js ist ein eigener kleiner Lernkurs mit Ausgabevorhersage, Parsons-Aufgabe, Lernkarten und Lernpfad.

Für Ubuntu 26.04 LTS (amd64). Der Nachbau verwendet eigene Texte und Beispiele. Er übernimmt keine Kursinhalte oder Oberfläche eines Anbieters. Alle Funktionen laufen lokal; die Karten verwenden einen einfachen Wiederholungsplan und kein FSRS.

## Einrichtung

### 1. Paketlisten aktualisieren

Lädt die Paketinformationen für die lokalen Werkzeuge.

````bash
sudo apt update
````

### 2. Werkzeuge installieren

Python liefert die Dateien per HTTP aus; unzip entpackt das Beispiel. Node.js oder npm werden für die Nutzung nicht benötigt.

````bash
sudo apt install python3 unzip
````

### 3. Beispiel herunterladen

Speichere das [Quellcodearchiv](downloads/kurs-lernen.zip) mit dem Browser unter ~/Downloads/kurs-lernen.zip. Der Ordner ~/kurs-lernen darf noch nicht existieren.

### 4. Beispiel entpacken

Legt HTML, CSS und kurs-lernen.js im Benutzerverzeichnis ab.

````bash
unzip ~/Downloads/kurs-lernen.zip -d ~
````

### 5. Projektordner öffnen

Von hier aus wird die lokale Vorschau gestartet.

````bash
cd ~/kurs-lernen
````

### 6. Lernkurs starten

Öffne http://127.0.0.1:8000 im Browser. Verwende immer dieselbe Adresse und denselben Port, damit derselbe lokale Lernstand geladen wird. Strg + C beendet den Server.

````bash
python3 -m http.server 8000 --bind 127.0.0.1
````

### 7. Ausgabe vorhersagen

Berechne die Ausgabe des angezeigten JavaScript-Beispiels und gib sie ein. Eine richtige Antwort schaltet die Parsons-Aufgabe frei. Die Seite führt dabei keinen beliebigen eingegebenen Programmcode aus.

### 8. Codezeilen ordnen

Verschiebe die fünf Zeilen über Nach oben und Nach unten. Eine richtige Reihenfolge schaltet die Karten frei. Die Bedienung funktioniert auch per Tastatur.

### 9. Karten wiederholen

Zeige zunächst die Antwort und bewerte dann ehrlich. Noch einmal setzt die Karte auf eine Minute später. Gewusst verwendet nacheinander 1, 3 und 7 Tage; die nächste Fälligkeit wird beim Neuladen geprüft.

## Installation prüfen

### 1. Fehlerrückmeldungen prüfen

Gib eine falsche Vorhersage ein und prüfe eine falsche Zeilenfolge. In beiden Fällen muss eine Rückmeldung erscheinen, ohne den nächsten noch gesperrten Schritt freizuschalten.

### 2. Fortschritt prüfen

Löse die Aufgaben und bewerte die Karten. Lade die Seite neu: Freischaltungen, Reihenfolge und Fälligkeiten müssen erhalten bleiben. Wenn der Browser die Speicherung blockiert, weist die Seite darauf hin.

### 3. Zurücksetzen prüfen

Verwende Lernstand zurücksetzen und bestätige die Rückfrage. Danach muss der Lernpfad wieder am Anfang stehen.

## Eigene Inhalte ergänzen

In kurs-lernen.js liegen die Fragen, der Erwartungswert der Vorhersage, die geordnete Codefolge und der Wiederholungsplan. Passe bei neuen Aufgaben auch die zugehörigen Prüfregeln an. Die aktuelle Version enthält nur einen kleinen Kurs und speichert ausschließlich im lokalen Browserspeicher. Sie bietet keinen Login, keine Synchronisierung und keinen allgemeinen Code-Ausführungsdienst. Vor dem Löschen der Website-Daten geht der Lernstand verloren; eine Exportfunktion ist nicht enthalten.

## Deinstallieren

### 1. Lokalen Lernstand entfernen

Setze den Lernstand in der Oberfläche zurück oder entferne die Website-Daten für http://127.0.0.1:8000 im Browser. Auf derselben Adresse können auch andere lokale Beispiele gespeichert sein.

### 2. Projekt entfernen

Beende zuerst den HTTP-Server. Sichere eigene Änderungen vor dem Löschen.

````bash
rm -rf -- ~/kurs-lernen
````

### 3. Entfernung prüfen

Bestätigt, dass der Projektordner entfernt wurde.

````bash
test ! -e ~/kurs-lernen && echo 'Lernkurs entfernt'
````

## Quellen und Lizenz

Eigener Beispielcode und eigene Lerninhalte für dieses Buch. Eine Weitergabelizenz für einen eigenen abgeleiteten Kurs legst du selbst fest. Es wurden keine Bibliotheken von Anki, Execute Program, js-parsons oder roadmap.sh eingebunden.
