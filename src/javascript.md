# JavaScript

JavaScript ist die Programmiersprache des Webs: Jeder Browser führt sie aus, um Webseiten interaktiv zu machen. Mit **Node.js** läuft JavaScript auch außerhalb des Browsers, etwa für Kommandozeilenwerkzeuge, Webserver und Build-Werkzeuge.

## Vorbemerkungen

- **Browser oder Node.js:** Zum Ausprobieren reicht die Entwicklerkonsole jedes Browsers (in Firefox und Chromium mit <kbd>F12</kbd>). Für Programme auf dem Rechner und für fast alle Werkzeuge der Webentwicklung braucht man aber **Node.js**. Diese Anleitung richtet Node.js ein.
- **Versionen:** Ubuntu 26.04 liefert **Node.js 22** (LTS) und **npm 9**. Für die Anleitungen in diesem Buch reicht das aus.
- **npm:** Der Paketmanager `npm` lädt Bibliotheken aus dem npm-Verzeichnis und speichert sie **pro Projekt** im Ordner `node_modules`. Welche Pakete ein Projekt braucht, steht in der Datei `package.json`.
- **Grundlage für andere Anleitungen:** Node.js wird u. a. für [Express.js](express.md), [Yjs und Automerge](crdt.md), [Docusaurus](docusaurus.md), [VitePress](vitepress.md) und [Astro Starlight](starlight.md) gebraucht.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Installiert die JavaScript-Laufzeitumgebung `node` und den Paketmanager `npm`.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Ausgabe beginnt mit `v22.`.

```bash
node --version
```

**Prüfen:** Auch `npm` meldet seine Version.

```bash
npm --version
```

## Erstes Programm

### 3. Arbeitsordner anlegen

Ein eigener Ordner für das Übungsprojekt.

```bash
mkdir -p ~/js-uebung
```

### 4. In den Ordner wechseln

Alle folgenden Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/js-uebung
```

### 5. Skript anlegen

Legt `hallo.js` an. Das Skript filtert aus einer Liste alle Namen mit mehr als zwei Zeichen heraus und gibt sie zusammen mit der Node.js-Version aus.

```bash
nano hallo.js
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```javascript
const sprachen = ['C', 'C++', 'Java', 'Python', 'C#', 'JavaScript'];
const lang = sprachen.filter((s) => s.length > 2);

console.log(`Hallo aus Node.js ${process.version}!`);
console.log('Lange Namen:', lang.join(', '));
```

### 6. Skript ausführen

`node` liest die Datei und führt sie sofort aus, ein Übersetzungsschritt ist nicht nötig.

```bash
node hallo.js
```

**Prüfen:** Die Ausgabe lautet:

```text
Hallo aus Node.js v22.…!
Lange Namen: C++, Java, Python, JavaScript
```

## Projekt mit npm

### 7. Projekt anlegen

Erzeugt die Datei `package.json` mit Standardwerten. Sie beschreibt das Projekt und listet später die benötigten Pakete auf.

```bash
npm init -y
```

**Prüfen:** Die Datei `package.json` wird im Terminal angezeigt.

### 8. Moderne Modulschreibweise einschalten

Stellt das Projekt auf ES-Module um. Dann können Dateien andere Dateien und Pakete mit `import … from …` einbinden, so wie es auch im Browser üblich ist.

```bash
npm pkg set type=module
```

### 9. Paket installieren

Installiert als Beispiel die Bibliothek `dayjs` zum Rechnen mit Datum und Uhrzeit. Sie landet in `node_modules`, und `package.json` erhält einen Eintrag unter `dependencies`.

```bash
npm install dayjs
```

**Prüfen:** Das Paket erscheint in der Liste.

```bash
npm ls
```

### 10. Skript mit dem Paket anlegen

Legt `datum.js` an. Das Skript bindet `dayjs` ein und rechnet aus, welches Datum in 100 Tagen ist.

```bash
nano datum.js
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```javascript
import dayjs from 'dayjs';

const heute = dayjs();
const spaeter = heute.add(100, 'day');

console.log(`Heute:        ${heute.format('DD.MM.YYYY')}`);
console.log(`In 100 Tagen: ${spaeter.format('DD.MM.YYYY')}`);
```

### 11. Skript ausführen

```bash
node datum.js
```

**Prüfen:** Es erscheinen zwei Zeilen mit dem heutigen Datum und dem Datum in 100 Tagen.

### 12. Optional: Bei Änderungen automatisch neu starten

Mit `--watch` startet Node.js das Skript bei jedem Speichern neu. Das ist praktisch während der Entwicklung. Beenden mit <kbd>Strg</kbd>+<kbd>C</kbd>.

```bash
node --watch datum.js
```

## Wie geht es weiter?

- **Interaktiv ausprobieren:** `node` ohne Dateiname öffnet eine Eingabezeile für einzelne Anweisungen. Beenden mit `.exit`.
- **Neuere Node.js-Version:** Wer eine aktuellere Version als 22 braucht, kann mit dem Versionsverwalter `nvm` weitere Versionen im eigenen Benutzerordner installieren, ohne die Ubuntu-Pakete zu verändern.
- **TypeScript:** TypeScript ergänzt JavaScript um Typangaben und findet so viele Fehler schon beim Schreiben. Es wird pro Projekt mit `npm install --save-dev typescript` eingebunden.
- **Webserver:** Die Anleitung [Express.js](express.md) baut darauf auf.
- **Editor:** [Visual Studio Code](vscode.md) unterstützt JavaScript und TypeScript ohne zusätzliche Erweiterung.

## Deinstallieren

### 1. Übungsordner entfernen

Löscht das Projekt samt `node_modules`.

```bash
rm -rf ~/js-uebung
```

### 2. Node.js und npm entfernen

Nur ausführen, wenn kein anderes Programm Node.js braucht (siehe Vorbemerkungen).

```bash
sudo apt purge nodejs npm
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Räumt Pakete auf, die nur für Node.js und npm installiert wurden.

```bash
sudo apt autoremove
```

### 4. Zwischenspeicher von npm löschen

`npm` speichert heruntergeladene Pakete in `~/.npm`.

```bash
rm -rf ~/.npm
```

**Prüfen:** Die Meldung lautet `node: Befehl nicht gefunden` bzw. `command not found`.

```bash
node --version
```
