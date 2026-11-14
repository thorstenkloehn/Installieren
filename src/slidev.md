# Slidev

Slidev erzeugt Präsentationen mit interaktiven Elementen aus Markdown.

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
mkdir ~/slidev-lab
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/slidev-lab
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

### 7. Slidev installieren

Richtet CLI und Standarddesign lokal ein.

````bash
npm install --save-dev @slidev/cli @slidev/theme-default
````

### 8. Folien schreiben

Erzeugt zwei eigene Folien; die Trennlinie beginnt eine neue Folie.

````bash
cat > slides.md <<'EOF'
---
theme: default
title: Ubuntu-Labor
---

# Unser Ubuntu-Labor

Software direkt auf dem Rechner installieren

---

# Ergebnis prüfen

- Versionsnummer anzeigen
- Ein kleines Beispiel ausführen
EOF
````

### 9. Präsentation starten

Öffne http://localhost:3030 und wechsle mit der Pfeiltaste zur zweiten Folie. Strg + C beendet den Server.

````bash
npx slidev slides.md
````

## Installation prüfen

### 1. Präsentation bauen

Erstellt dist/ für die spätere statische Bereitstellung. Dies exportiert keine PDF-Datei.

````bash
npx slidev build slides.md
````

### 2. Version anzeigen

Zeigt den verwendeten CLI-Stand.

````bash
npx slidev --version
````

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/slidev-lab
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/slidev-lab && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[Slidev-Einstieg](https://sli.dev/guide/) und [CLI](https://sli.dev/builtin/cli). Lizenz: MIT.
