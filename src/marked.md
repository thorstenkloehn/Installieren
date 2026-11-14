# Eigener Generator mit marked

Mit marked lässt sich ein kleiner Generator bauen, der eine Markdown-Datei in eine vollständige HTML-Seite umwandelt. Marked steht unter der MIT-Lizenz.

Die Anleitung gilt für Ubuntu 26.04 LTS (amd64). Node.js kommt über apt, die JavaScript-Pakete werden im eigenen Projekt ohne sudo installiert. Verwende einen noch nicht vorhandenen Projektordner.

## Installation

### 1. Paketlisten aktualisieren

Lädt die verfügbaren Paketstände.

```bash
sudo apt update
```

### 2. Werkzeuge installieren

Node.js führt die Werkzeuge aus; npm verwaltet die Projektpakete. Python stellt später die lokale Vorschau bereit.

```bash
sudo apt install nodejs npm python3
```

### 3. Node.js prüfen

Verwende Node.js 22.12 oder neuer innerhalb einer unterstützten LTS-Version. Ubuntu 26.04 liefert Node.js 22.22.1. Bei einer älteren Ausgabe hier anhalten und die aktive Node.js-Installation prüfen.

```bash
node --version
```

### 4. Projektordner anlegen

Trennt die Beispieldateien von anderen Projekten.

```bash
mkdir ~/marked-doku
```

### 5. Projektordner öffnen

Die folgenden relativen Dateipfade beziehen sich auf diesen Ordner.

```bash
cd ~/marked-doku
```

### 6. npm-Projekt initialisieren

Erzeugt package.json als Verzeichnis der Projektabhängigkeiten.

```bash
npm init -y
```

### 7. Bibliotheken installieren

Marked übersetzt Markdown; sanitize-html filtert das erzeugte HTML, da marked selbst keine Bereinigung durchführt.

```bash
npm install marked sanitize-html
```

### 8. Markdown-Datei schreiben

Legt den Inhalt der Beispielseite an.

```bash
cat > start.md <<'EOF'
# Mein Ubuntu-Handbuch

Diese Seite entsteht mit meinem eigenen Generator.

- Pakete einrichten
- Ergebnis kontrollieren
EOF
```

### 9. Generator schreiben

Das eigene Skript liest start.md, bereinigt das HTML und schreibt dist/index.html. Es verarbeitet genau eine Seite; Navigation, Suche und weitere Seiten müssten ergänzt werden.

```bash
cat > build.mjs <<'EOF'
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const markdown = await readFile('start.md', 'utf8');
const body = sanitizeHtml(await marked.parse(markdown));
const page = `<!doctype html>
<html lang="de">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ubuntu-Handbuch</title>
<main>${body}</main>
</html>`;
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', page, 'utf8');
console.log('Erstellt: dist/index.html');
EOF
```

### 10. Seite erzeugen

Führt den Generator aus. Erwartet wird die Meldung Erstellt: dist/index.html.

```bash
node build.mjs
```

### 11. Vorschau starten

Öffne http://127.0.0.1:8000 im Browser. Die Seite soll die Überschrift und zwei Listeneinträge zeigen. Mit Strg + C endet die Vorschau.

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

## Installation prüfen

### 1. Paketstände anzeigen

Zeigt die tatsächlich installierten Versionen. Bewahre package-lock.json auf; mit npm ci lässt sich derselbe Paketstand erneut installieren.

```bash
npm ls marked sanitize-html
```

## Deinstallieren

Beende zuerst eine laufende Vorschau mit **Strg + C**. Node.js und npm bleiben für andere Projekte verfügbar.

### 1. Beispielprojekt entfernen

Löscht das gesamte Beispiel einschließlich eigener Änderungen. Sichere benötigte Dateien vorher.

```bash
rm -rf -- ~/marked-doku
```

### 2. Entfernung prüfen

Bei erfolgreicher Entfernung erscheint die Bestätigung.

```bash
test ! -e ~/marked-doku && echo 'Projekt entfernt'
```

## Quellen und Lizenz

Technische Grundlage: [Marked-Dokumentation](https://marked.js.org/) und [sanitize-html](https://github.com/apostrophecms/sanitize-html). Beide Bibliotheken stehen unter MIT. Der Generator oben wurde für diese Anleitung geschrieben; eine Lizenz für den Eigenbau legst du als Rechteinhaber selbst fest. Die MIT-Lizenz von marked gilt nicht automatisch für deinen gesamten Generator. Bei Weitergabe der Bibliotheken ihre Lizenz- und Copyright-Hinweise beilegen.
