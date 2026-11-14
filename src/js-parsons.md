# js-parsons

js-parsons ist eine JavaScript-Bibliothek für Aufgaben, bei denen Codeblöcke geordnet werden.

Für Ubuntu 26.04 LTS (amd64). Die Demo läuft lokal im Browser. Python dient nur als HTTP-Server; das hier gewählte Beispiel prüft die Reihenfolge der Zeilen und führt kein Python-Programm aus.

## Einrichtung

### 1. Paketlisten aktualisieren

Bereitet die Werkzeuginstallation vor.

````bash
sudo apt update
````

### 2. Werkzeuge installieren

Git lädt die Bibliothek; Python liefert die Demoseite lokal aus.

````bash
sudo apt install git python3
````

### 3. Quellen laden

Der Zielordner soll noch nicht existieren.

````bash
git clone https://github.com/js-parsons/js-parsons.git ~/js-parsons-lab
````

### 4. Projekt öffnen

Die mitgelieferten Abhängigkeiten bleiben im Unterordner lib.

````bash
cd ~/js-parsons-lab
````

### 5. Eigenes Beispiel schreiben

Legt eine zusätzliche Datei an und lässt die vorhandenen Beispiele unverändert.

````bash
cat > ubuntu-demo.html <<'EOF'
<!doctype html>
<html lang="de">
<meta charset="utf-8">
<title>Codezeilen ordnen</title>
<link rel="stylesheet" href="parsons.css">
<h1>Eine Summe berechnen</h1>
<p>Ordne die drei Zeilen: Werte anlegen, Summe bilden, Ergebnis ausgeben.</p>
<div id="vorrat" class="sortable-code"></div>
<div id="loesung" class="sortable-code"></div>
<p style="clear:both"><button id="pruefen">Prüfen</button></p>
<p id="meldung" role="status"></p>
<script src="lib/jquery.min.js"></script>
<script src="lib/jquery-ui.min.js"></script>
<script src="lib/jquery.ui.touch-punch.min.js"></script>
<script src="lib/underscore-min.js"></script>
<script src="lib/lis.js"></script>
<script src="parsons.js"></script>
<script>
const widget = new ParsonsWidget({
  sortableId: 'loesung', trashId: 'vorrat', can_indent: false,
  feedback_cb: feedback => {
    document.getElementById('meldung').textContent = feedback.errors.length
      ? 'Die Reihenfolge stimmt noch nicht.' : 'Richtig geordnet.';
  }
});
widget.init('werte = [4, 9, 2]\ngesamt = sum(werte)\nprint(gesamt)');
widget.shuffleLines();
document.getElementById('pruefen').addEventListener('click', () => widget.getFeedback());
</script>
</html>
EOF
````

### 6. Vorschau starten

Öffne http://127.0.0.1:8000/ubuntu-demo.html und verschiebe alle Zeilen vom Vorrat in die Lösung. Strg + C beendet den Server.

````bash
python3 -m http.server 8000 --bind 127.0.0.1
````

## Installation prüfen

### 1. Falsche Reihenfolge prüfen

Klicke mit vertauschten Zeilen auf Prüfen. Es muss eine Rückmeldung über die falsche Reihenfolge erscheinen.

### 2. Richtige Reihenfolge prüfen

Ordne erst die Liste, dann die Summe, dann print an. Prüfen soll Richtig geordnet melden.

### 3. Quellstand dokumentieren

Zeigt den geladenen Commit für eine spätere Wiederholung der Einrichtung.

````bash
git rev-parse HEAD
````

## Deinstallieren

### 1. Projekt entfernen

Beende zuerst den Server. Sichere eigene Aufgaben vor dem Löschen.

````bash
rm -rf -- ~/js-parsons-lab
````

### 2. Entfernung prüfen

Bestätigt das Entfernen des Projektordners.

````bash
test ! -e ~/js-parsons-lab && echo 'js-parsons entfernt'
````

## Quellen und Lizenz

[Offizielles Repository](https://github.com/js-parsons/js-parsons) und [Einbindung](https://js-parsons.github.io/documentation/). Lizenz: MIT. Mitgelieferte Bibliotheken haben eigene Lizenzhinweise, die bei Weitergabe erhalten bleiben müssen.
