# Monaco Editor

Monaco Editor ist eine unter MIT lizenzierte JavaScript-Komponente zum Bearbeiten von Quellcode im Browser.

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
mkdir ~/monaco-demo
```

### 5. Projektordner öffnen

Die folgenden relativen Dateipfade beziehen sich auf diesen Ordner.

```bash
cd ~/monaco-demo
```

### 6. npm-Projekt initialisieren

Erzeugt package.json als Verzeichnis der Projektabhängigkeiten.

```bash
npm init -y
```

Monaco unterstützt laut Hersteller keine Mobilbrowser. Das Beispiel verwendet einen Desktopbrowser. Der Editor bearbeitet Quellcode; zum Ausführen wäre ein getrennt eingerichteter Dienst wie [Judge0](judge0.md) nötig.

### 7. Vite installieren

Vite verarbeitet JavaScript-Module und baut die fertige Browseranwendung.

```bash
npm install --save-dev vite
```

### 8. Editor installieren

Lädt die geprüfte Editorversion 0.57.0 in dieses Projekt. Die Importpfade unten passen zu dieser Version.

```bash
npm install monaco-editor@0.57.0
```

### 9. HTML-Seite anlegen

Legt ein beschriftetes Element für den Editor und den Einstiegspunkt an.

```bash
cat > index.html <<'EOF'
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Monaco Editor lokal</title>
</head>
<body>
  <h1>Mein Quelltext</h1>
  <div id="editor" aria-label="Quelltexteditor"></div>
  <script type="module" src="/main.js"></script>
</body>
</html>
EOF
```

### 10. Editor einrichten

Bindet Monaco mit JavaScript-Färbung und dem allgemeinen Editor-Worker ein. Umfangreiche Sprachdienste wie TypeScript-Diagnosen sind in diesem kleinen Beispiel nicht eingerichtet.

```bash
cat > main.js <<'EOF'
import * as monaco from 'monaco-editor/editor/editor.api.js';
import 'monaco-editor/basic-languages/monaco.contribution.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';

self.MonacoEnvironment = {
  getWorker() { return new EditorWorker(); }
};
const container = document.querySelector('#editor');
container.style.height = '65vh';
monaco.editor.create(container, {
  value: '// Hier kannst du JavaScript schreiben.\nconst gruss = "Hallo Ubuntu";\n',
  language: 'javascript',
  automaticLayout: true,
  minimap: { enabled: false }
});
EOF
```

### 11. Entwicklungsvorschau starten

Öffne http://127.0.0.1:5173. Prüfe Texteingabe, Syntaxfarben und Rückgängig mit Strg + Z. Die Browserkonsole soll keine Ladefehler zeigen. Beende Vite danach mit Strg + C.

```bash
npx vite --host 127.0.0.1 --port 5173 --strictPort
```

### 12. Browseranwendung bauen

Erzeugt den Ordner dist. Ein erfolgreicher Bau bestätigt, dass die Module aufgelöst werden können.

```bash
npx vite build
```

### 13. Fertige Anwendung prüfen

Öffne http://127.0.0.1:4173 und wiederhole die Eingabeprüfung. Lade die Seite über HTTP, damit auch Monacos Worker funktionieren. Strg + C beendet die Vorschau.

```bash
npx vite preview --host 127.0.0.1 --port 4173 --strictPort
```

## Installation prüfen

### 1. Paketstände anzeigen

Zeigt die tatsächlich installierten Versionen. Bewahre package-lock.json auf; mit npm ci lässt sich derselbe Paketstand erneut installieren.

```bash
npm ls monaco-editor vite
```

## Deinstallieren

Beende zuerst eine laufende Vorschau mit **Strg + C**. Node.js und npm bleiben für andere Projekte verfügbar.

### 1. Beispielprojekt entfernen

Löscht das gesamte Beispiel einschließlich eigener Änderungen. Sichere benötigte Dateien vorher.

```bash
rm -rf -- ~/monaco-demo
```

### 2. Entfernung prüfen

Bei erfolgreicher Entfernung erscheint die Bestätigung.

```bash
test ! -e ~/monaco-demo && echo 'Projekt entfernt'
```

## Quellen und Lizenz

[Monaco-Projekt und MIT-Lizenz](https://github.com/microsoft/monaco-editor), [Einbindung als ES-Modul](https://github.com/microsoft/monaco-editor/blob/main/docs/integrate-esm.md) und [Vite](https://vite.dev/guide/). Die Konfiguration beschränkt sich bewusst auf den allgemeinen Worker. Bei Weitergabe die mitgelieferten Lizenzhinweise erhalten.
