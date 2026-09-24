# Yjs und Automerge

Yjs und Automerge sind Programmbibliotheken für JavaScript, mit denen mehrere Geräte oder Personen gleichzeitig dasselbe Dokument bearbeiten können, auch ohne ständige Verbindung. Änderungen werden später automatisch und ohne Konflikte zusammengeführt. Sie bilden den Kern vieler kollaborativer Editoren und Local-First-Anwendungen.

## Vorbemerkungen

- **Was ist ein CRDT?** Beide Bibliotheken beruhen auf **CRDTs** (Conflict-free Replicated Data Types, konfliktfreie replizierte Datentypen). Jedes Gerät hat eine vollständige Kopie des Dokuments und ändert sie lokal. Tauschen die Geräte ihre Änderungen aus, kommen alle garantiert zum selben Ergebnis, egal in welcher Reihenfolge die Änderungen eintreffen. Ein zentraler Server, der Konflikte entscheidet, ist nicht nötig.
- **Keine Programme, sondern Bibliotheken:** Yjs und Automerge haben keine eigene Oberfläche. Man baut sie in eigene Anwendungen ein. Diese Anleitung richtet deshalb ein kleines Testprojekt ein und zeigt an zwei Beispielen, wie sie arbeiten.
- **Installation:** Die Bibliotheken sind nicht in den Ubuntu-Paketquellen enthalten. Sie werden **pro Projekt** über `npm` installiert. Aus den Ubuntu-Paketquellen kommen nur Node.js und npm.
- **Versionen:** Yjs 13.6 und Automerge 3.5.

## Die beiden Bibliotheken im Vergleich

| | Yjs | Automerge |
|---|---|---|
| Schwerpunkt | Echtzeit-Zusammenarbeit an Texten, sehr schnell und sparsam | Dokumente als JSON-ähnliche Daten mit vollständigem Verlauf |
| Datenmodell | Gemeinsame Typen: `Y.Text`, `Y.Array`, `Y.Map`, `Y.XmlFragment` | Ein gewöhnliches JavaScript-Objekt, das über `change()` geändert wird |
| Verlauf | Nur der aktuelle Stand (Verlauf optional über Snapshots) | Jede Änderung bleibt mit Beschreibung erhalten, ähnlich wie Commits in Git |
| Speicherformat | Kompaktes Binärformat (Updates) | Kompaktes Binärformat |
| Umsetzung | Reines JavaScript | Kern in Rust, im Browser und in Node.js als WebAssembly |
| Typische Einsätze | Editoren wie Tiptap, ProseMirror, CodeMirror, Monaco | Local-First-Apps, Offline-Synchronisation |

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Node.js und npm aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt die Beispielprogramme aus, `npm` lädt die Bibliotheken herunter. Ist beides schon vorhanden (z. B. aus der [Docusaurus-Anleitung](docusaurus.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Versionsnummer wird angezeigt, z. B. `v22.22.1`.

```bash
node --version
```

## Testprojekt einrichten

### 3. Projektordner anlegen

Ein eigener Ordner für die Beispiele.

```bash
mkdir ~/crdt-test
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/crdt-test
```

### 5. Projekt anlegen

Legt die Datei `package.json` an. Darin hält npm fest, welche Bibliotheken das Projekt braucht. `-y` übernimmt alle Vorgaben, ohne nachzufragen.

```bash
npm init -y
```

### 6. Moderne Modul-Schreibweise einschalten

Erlaubt in den Beispielen die Schreibweise `import … from …`, die heute in JavaScript üblich ist.

```bash
npm pkg set type=module
```

### 7. Yjs und Automerge installieren

Lädt beide Bibliotheken in den Ordner `node_modules` und trägt sie in `package.json` ein.

```bash
npm install yjs @automerge/automerge
```

**Prüfen:** Die Ausgabe zeigt `@automerge/automerge@3.5.0` und `yjs@13.6.33` (oder neuere Versionen).

```bash
npm ls --depth=0
```

## Beispiel mit Yjs

### 8. Beispielprogramm anlegen

Das Programm spielt zwei Geräte durch, Laptop und Handy. Beide haben dieselbe Notiz „Einkauf: Brot“ und ergänzen sie **gleichzeitig**, ohne voneinander zu wissen: das eine um „Milch“, das andere um „Käse“. Danach tauschen sie ihre Änderungen aus. Die wichtigsten Funktionen:

- `new Y.Doc()` – ein Dokument, also eine Kopie auf einem Gerät
- `getText('notiz')` – ein gemeinsamer Text mit dem Namen `notiz` innerhalb des Dokuments
- `Y.encodeStateAsUpdate()` – packt den Stand eines Dokuments in ein kompaktes Binärpaket (Update)
- `Y.applyUpdate()` – spielt ein solches Paket in ein anderes Dokument ein

Am Ende wird der Stand als Datei `notiz.yjs` gespeichert und in ein neues Dokument geladen.

```bash
nano yjs-demo.mjs
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```javascript
import * as Y from 'yjs'
import { writeFileSync, readFileSync } from 'node:fs'

// Zwei Geräte mit je einer eigenen Kopie des Dokuments
const laptop = new Y.Doc()
const handy = new Y.Doc()

// Gemeinsamer Ausgangsstand: laptop schreibt, handy übernimmt den Stand
laptop.getText('notiz').insert(0, 'Einkauf: Brot')
Y.applyUpdate(handy, Y.encodeStateAsUpdate(laptop))

// Beide ändern gleichzeitig, ohne voneinander zu wissen
laptop.getText('notiz').insert(13, ', Milch')
handy.getText('notiz').insert(13, ', Käse')

// Änderungen in beide Richtungen austauschen
Y.applyUpdate(handy, Y.encodeStateAsUpdate(laptop))
Y.applyUpdate(laptop, Y.encodeStateAsUpdate(handy))

console.log('Laptop:', laptop.getText('notiz').toString())
console.log('Handy: ', handy.getText('notiz').toString())
console.log('Gleich:', laptop.getText('notiz').toString() === handy.getText('notiz').toString())

// Als kompakte Binärdatei speichern und in ein neues Dokument laden
writeFileSync('notiz.yjs', Y.encodeStateAsUpdate(laptop))
const geladen = new Y.Doc()
Y.applyUpdate(geladen, readFileSync('notiz.yjs'))
console.log('Geladen:', geladen.getText('notiz').toString())
```

### 9. Beispiel ausführen

Startet das Programm mit Node.js.

```bash
node yjs-demo.mjs
```

**Prüfen:** Beide Geräte zeigen denselben Text mit beiden Ergänzungen, z. B. `Einkauf: Brot, Milch, Käse`, und `Gleich: true`. Die Reihenfolge von Milch und Käse kann bei jedem Start anders sein, weil jedes Dokument eine zufällige Kennung bekommt. Entscheidend ist, dass beide Geräte **immer** dasselbe Ergebnis haben. Die Datei `notiz.yjs` ist nur etwa 60 Byte groß.

## Beispiel mit Automerge

### 10. Beispielprogramm anlegen

Dasselbe Szenario mit einer Aufgabenliste. Bei Automerge ist das Dokument ein gewöhnliches JavaScript-Objekt. Die wichtigsten Funktionen:

- `Automerge.init()` – ein leeres Dokument
- `Automerge.change(dokument, 'Beschreibung', d => { … })` – ändert das Dokument. Innerhalb der Klammern arbeitest du mit `d` wie mit einem normalen Objekt. Das Ergebnis ist ein **neuer** Stand, deshalb wird es wieder zugewiesen.
- `Automerge.clone()` – eine unabhängige Kopie für ein zweites Gerät
- `Automerge.merge()` – übernimmt die Änderungen eines anderen Stands
- `Automerge.getHistory()` – alle Änderungen mit ihrer Beschreibung
- `Automerge.save()` / `Automerge.load()` – Speichern als Binärdaten und Laden

```bash
nano automerge-demo.mjs
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```javascript
import * as Automerge from '@automerge/automerge'
import { writeFileSync, readFileSync } from 'node:fs'

// Gemeinsamer Ausgangsstand mit einer ersten, beschriebenen Änderung
let laptop = Automerge.change(Automerge.init(), 'Liste angelegt', d => {
  d.aufgaben = ['Brot kaufen']
})
let handy = Automerge.clone(laptop)

// Beide ändern gleichzeitig, ohne voneinander zu wissen
laptop = Automerge.change(laptop, 'Milch ergänzt', d => { d.aufgaben.push('Milch kaufen') })
handy = Automerge.change(handy, 'Käse ergänzt', d => { d.aufgaben.push('Käse kaufen') })

// Änderungen zusammenführen
laptop = Automerge.merge(laptop, handy)
handy = Automerge.merge(handy, laptop)

console.log('Laptop:', laptop.aufgaben)
console.log('Handy: ', handy.aufgaben)
console.log('Gleich:', JSON.stringify(laptop) === JSON.stringify(handy))

// Verlauf: jede Änderung bleibt mit ihrer Beschreibung erhalten
for (const eintrag of Automerge.getHistory(laptop)) {
  console.log('Änderung:', eintrag.change.message)
}

// Als kompakte Binärdatei speichern und wieder laden
writeFileSync('einkauf.automerge', Automerge.save(laptop))
const geladen = Automerge.load(readFileSync('einkauf.automerge'))
console.log('Geladen:', geladen.aufgaben)
```

### 11. Beispiel ausführen

Startet das Programm mit Node.js.

```bash
node automerge-demo.mjs
```

**Prüfen:** Beide Listen enthalten alle drei Aufgaben in derselben Reihenfolge, und es erscheint `Gleich: true`. Darunter stehen die drei Änderungen „Liste angelegt“, „Milch ergänzt“ und „Käse ergänzt“ aus dem Verlauf, zum Schluss die aus der Datei geladene Liste.

## Wie geht es weiter?

Die Beispiele tauschen Änderungen direkt im selben Programm aus. In echten Anwendungen übernehmen das Zusatzbibliotheken, die ebenfalls über `npm` installiert werden:

- **Yjs:** `y-websocket` synchronisiert über einen WebSocket-Server, `y-webrtc` direkt zwischen Browsern, `y-indexeddb` speichert Dokumente im Browser. Für Editoren gibt es fertige Anbindungen, z. B. `y-prosemirror`, `y-codemirror.next` und `y-monaco`.
- **Automerge:** `@automerge/automerge-repo` verwaltet viele Dokumente, speichert sie und synchronisiert sie über Netzwerkadapter, z. B. über WebSocket oder zwischen Browser-Tabs.

## Deinstallieren

### 1. Testprojekt entfernen

Löscht den Projektordner mit den Beispielen, den gespeicherten Dateien und den installierten Bibliotheken.

```bash
rm -rf ~/crdt-test
```

### 2. Optional: Node.js und npm entfernen

Nur ausführen, wenn kein anderes Programm Node.js braucht (z. B. Antora, Docusaurus, VitePress, Starlight oder Excalidraw).

```bash
sudo apt purge nodejs npm
```

```bash
sudo apt autoremove
```

**Prüfen:** Der Projektordner existiert nicht mehr.

```bash
ls ~/crdt-test
```
