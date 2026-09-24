# TypeScript

TypeScript ist JavaScript mit Typangaben: Man legt fest, welche Art von Werten Variablen und Funktionen erwarten, und der Compiler meldet Fehler, bevor das Programm überhaupt läuft. Heraus kommt gewöhnliches JavaScript, das in jedem Browser und in Node.js läuft.

## Vorbemerkungen

- **Grundlage:** TypeScript baut auf [JavaScript](javascript.md) auf und braucht **Node.js** mit **npm**. Die Anleitung installiert beides aus den Ubuntu-Paketquellen (Node.js 22).
- **Pro Projekt über npm:** Ubuntu enthält zwar das Paket `node-typescript`, aber nur in Version 5.2 von 2023. Üblich und empfohlen ist, TypeScript **pro Projekt** mit npm zu installieren. Dann legt jedes Projekt seine TypeScript-Version selbst fest, und alle Beteiligten übersetzen mit derselben. Aktuell ist **TypeScript 7**, dessen Compiler für deutlich kürzere Übersetzungszeiten neu geschrieben wurde.
- **Compiler `tsc`:** Er prüft die Typen und erzeugt aus `.ts`-Dateien `.js`-Dateien. Die Einstellungen stehen in der Datei `tsconfig.json`.
- **Direkt ausführen:** Node.js kann `.ts`-Dateien auch ohne Übersetzen starten, indem es die Typangaben einfach entfernt. Die Typen prüft dabei aber niemand; dafür bleibt `tsc` zuständig.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Installiert die Laufzeitumgebung und den Paketmanager. Sind sie aus einer anderen Anleitung schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Ausgabe beginnt mit `v22.`.

```bash
node --version
```

## Erstes Projekt

### 3. Projektordner anlegen

Ein eigener Ordner für das Übungsprojekt, mit Unterordner `src` für den Quelltext.

```bash
mkdir -p ~/hallo-ts/src
```

### 4. In den Ordner wechseln

Alle folgenden Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/hallo-ts
```

### 5. npm-Projekt anlegen

Erzeugt `package.json` und stellt das Projekt auf ES-Module (`import … from …`) um.

```bash
npm init -y && npm pkg set type=module
```

### 6. TypeScript installieren

Installiert den Compiler und die Typbeschreibungen für Node.js (z. B. für `process`) als **Entwicklungsabhängigkeit** (`--save-dev`). Sie werden nur beim Entwickeln gebraucht, nicht im fertigen Programm.

```bash
npm install --save-dev typescript @types/node
```

**Prüfen:** `npx` startet den Compiler aus `node_modules` des Projekts. Die Ausgabe lautet z. B. `Version 7.0.2`.

```bash
npx tsc --version
```

### 7. Compiler-Einstellungen anlegen

Legt `tsconfig.json` an. Die wichtigsten Angaben:

- `rootDir` / `outDir` – TypeScript-Quelltext liegt in `src`, das erzeugte JavaScript landet in `dist`.
- `module: nodenext` – Module so behandeln, wie Node.js es tut.
- `strict` – alle strengen Prüfungen einschalten; für neue Projekte dringend empfohlen.

```bash
nano tsconfig.json
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "types": ["node"]
  }
}
```

### 8. Quelltext anlegen

Legt `src/hallo.ts` an. Das `interface` beschreibt, wie ein Eintrag aussehen muss; die Funktion `beschreibe` nimmt nur solche Einträge an und gibt garantiert einen Text zurück.

```bash
nano src/hallo.ts
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```typescript
interface Sprache {
  name: string;
  jahr: number;
}

const sprachen: Sprache[] = [
  { name: 'Go', jahr: 2009 },
  { name: 'Rust', jahr: 2015 },
  { name: 'TypeScript', jahr: 2012 },
];

function beschreibe(s: Sprache): string {
  return `${s.name} erschien ${s.jahr}.`;
}

for (const s of sprachen) {
  console.log(beschreibe(s));
}
console.log(`Node.js ${process.version}`);
```

### 9. Übersetzen

`tsc` liest `tsconfig.json`, prüft alle Typen und schreibt das Ergebnis nach `dist`.

```bash
npx tsc
```

**Prüfen:** Der Befehl gibt nichts aus, und die Datei `dist/hallo.js` ist entstanden.

```bash
ls dist
```

### 10. Programm starten

Führt das erzeugte JavaScript mit Node.js aus.

```bash
node dist/hallo.js
```

**Prüfen:** Die Ausgabe lautet:

```text
Go erschien 2009.
Rust erschien 2015.
TypeScript erschien 2012.
Node.js v22.…
```

### 11. Typprüfung ausprobieren

Ändert absichtlich die Jahreszahl von Rust in einen Text (`'2015'` statt `2015`) und übersetzt erneut.

```bash
nano src/hallo.ts
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `2015` und drücke <kbd>Enter</kbd>. Setze die Zahl in Anführungszeichen. Ändere die gefundene Zeile so, dass sie lautet:

```typescript
  { name: 'Rust', jahr: '2015' },
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

Dann erneut übersetzen:

```bash
npx tsc
```

**Prüfen:** Der Compiler bricht ab mit `src/hallo.ts(8,19): error TS2322: Type 'string' is not assignable to type 'number'.` Genau solche Fehler würden in reinem JavaScript erst beim Ausführen – oder gar nicht – auffallen.

### 12. Fehler wieder beheben

Stellt die Zahl wieder her.

```bash
nano src/hallo.ts
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `2015` und drücke <kbd>Enter</kbd>. Entferne die Anführungszeichen wieder. Ändere die gefundene Zeile so, dass sie lautet:

```typescript
  { name: 'Rust', jahr: 2015 },
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

Dann erneut übersetzen:

```bash
npx tsc
```

**Prüfen:** Der Befehl läuft wieder ohne Meldung durch.

### 13. Optional: Direkt ausführen

Node.js entfernt die Typangaben und startet den Quelltext ohne `dist`. Je nach Node.js-Version erscheint dazu ein Hinweis `ExperimentalWarning: Type Stripping…`, der sich ignorieren lässt.

```bash
node src/hallo.ts
```

## Wie geht es weiter?

- **Laufend prüfen:** `npx tsc --watch` übersetzt bei jedem Speichern neu und zeigt Fehler sofort an.
- **Skripte in package.json:** Mit `npm pkg set scripts.build=tsc` genügt künftig `npm run build`.
- **Webentwicklung:** Werkzeuge wie Vite, [VitePress](vitepress.md), [Astro Starlight](starlight.md) und [Docusaurus](docusaurus.md) verstehen TypeScript ohne weitere Einrichtung. Auch [Express.js](express.md) lässt sich mit TypeScript nutzen.
- **Editor:** [Visual Studio Code](vscode.md) ist selbst in TypeScript geschrieben und zeigt Typfehler schon beim Tippen an.

## Deinstallieren

### 1. Übungsprojekt entfernen

Löscht das Projekt samt `node_modules`. Weil TypeScript nur in diesem Projekt installiert war, ist es damit vollständig entfernt.

```bash
rm -rf ~/hallo-ts
```

### 2. Optional: Node.js und npm entfernen

Nur ausführen, wenn kein anderes Programm Node.js braucht (siehe Anleitung [JavaScript](javascript.md)).

```bash
sudo apt purge nodejs npm
```

```bash
sudo apt autoremove
```

**Prüfen:** Der Projektordner existiert nicht mehr (`Datei oder Verzeichnis nicht gefunden`).

```bash
ls ~/hallo-ts
```
