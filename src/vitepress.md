# VitePress

VitePress erzeugt aus Markdown-Dateien eine schnelle, statische Dokumentations-Webseite. Es basiert auf Vite und Vue, bringt ein fertiges Design mit Seitenleiste, Suche und dunklem Modus mit und aktualisiert die Vorschau beim Schreiben ohne Verzögerung.

## Vorbemerkungen

- **Kein apt-Paket:** VitePress ist nicht in den Ubuntu-Paketquellen enthalten. Es wird nicht systemweit installiert, sondern **pro Projekt** über `npm`, den Paketmanager von Node.js. Aus den Ubuntu-Paketquellen kommen nur Node.js und npm.
- **Version:** Diese Anleitung verwendet die stabile Version VitePress 1 (derzeit 1.6). An Version 2 wird noch gearbeitet.
- **Node.js-Version:** VitePress 1 braucht Node.js 18 oder neuer. Ubuntu 26.04 liefert Node.js 22, das passt.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Node.js und npm aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt VitePress aus, `npm` lädt VitePress herunter. Das Paket `npm` bringt auch den Befehl `npx` mit. Ist beides schon vorhanden (z. B. aus der [Docusaurus-Anleitung](docusaurus.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Ausgabe ist eine Versionsnummer ab `v18`, z. B. `v22.22.1`.

```bash
node --version
```

Hast du Node.js zusätzlich über den Versionsmanager `nvm` installiert, wird dessen Version angezeigt. Das ist in Ordnung, solange sie mindestens `v18` ist.

## Erstes Projekt

### 3. Projektordner anlegen

Ein eigener Ordner für die Dokumentation. Hier als Beispiel `~/meine-vitepress`.

```bash
mkdir ~/meine-vitepress
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/meine-vitepress
```

### 5. VitePress im Projekt installieren

Lädt VitePress in den Ordner `node_modules` und legt die Datei `package.json` an, in der npm festhält, welche Pakete das Projekt braucht. `-D` markiert VitePress als Entwicklungswerkzeug: Es wird zum Bauen gebraucht, ist aber nicht Teil der fertigen Webseite.

```bash
npm add -D vitepress
```

**Prüfen:** Die Ausgabe zeigt die installierte Version, z. B. `vitepress@1.6.4`.

```bash
npm ls vitepress
```

### 6. Grundgerüst mit dem Assistenten anlegen

Der Assistent legt Einstellungsdatei, Startseite und zwei Beispielseiten an. Er stellt sechs Fragen, die du mit den Pfeiltasten und <kbd>Enter</kbd> beantwortest. Du kannst überall den Vorschlag mit <kbd>Enter</kbd> übernehmen, Titel und Beschreibung werden in Schritt 8 ohnehin ersetzt:

| Frage | Antwort | Bedeutung |
|---|---|---|
| Where should VitePress initialize the config? | `./` | Die Seiten liegen direkt im Projektordner |
| Site title | beliebig | Titel der Webseite |
| Site description | beliebig | Kurzbeschreibung für Suchmaschinen |
| Theme | Default Theme | Das fertige VitePress-Design |
| Use TypeScript for config and theme files? | Yes | Die Einstellungsdatei heißt dann `config.mts` |
| Add VitePress npm scripts to package.json? | Yes | Legt Kurzbefehle wie `npm run docs:dev` an |

```bash
npx vitepress init
```

**Prüfen:** Der Assistent endet mit `Done! Now run npm run docs:dev and start writing.` Im Ordner liegen jetzt `index.md`, zwei Beispielseiten und der versteckte Ordner `.vitepress` mit der Datei `config.mts`.

```bash
ls -a . .vitepress
```

### 7. Vorschau starten

Startet einen Entwicklungsserver. Jede gespeicherte Änderung erscheint sofort im Browser. Das Terminal bleibt dabei belegt, öffne für die nächsten Schritte ein zweites Terminal (ebenfalls im Ordner `~/meine-vitepress`).

```bash
npm run docs:dev
```

**Prüfen:** Im Terminal steht `Local: http://localhost:5173/`. Öffne <http://localhost:5173> im Browser: Es erscheint die Beispiel-Startseite „My Awesome Project“.

## Projekt anpassen

### 8. Einstellungen auf Deutsch schreiben

Ersetzt die Einstellungsdatei. Die Angaben bewirken Folgendes:

- `lang`, `title`, `description` – Sprache, Titel und Beschreibung der Webseite
- `nav` – Links in der Kopfleiste
- `sidebar` – Aufbau der Seitenleiste
- `search` – eingebaute Suche, die ohne externen Dienst funktioniert
- die restlichen Angaben – deutsche Beschriftungen für fest eingebaute Texte wie „Nächste Seite“

```bash
nano .vitepress/config.mts
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'de-DE',
  title: 'Meine Dokumentation',
  description: 'Eine Dokumentation mit VitePress',
  themeConfig: {
    nav: [
      { text: 'Start', link: '/' },
      { text: 'Erste Seite', link: '/erste-seite' }
    ],
    sidebar: [
      {
        text: 'Anleitung',
        items: [
          { text: 'Erste Seite', link: '/erste-seite' }
        ]
      }
    ],
    search: { provider: 'local' },
    outline: { label: 'Auf dieser Seite' },
    docFooter: { prev: 'Vorherige Seite', next: 'Nächste Seite' },
    darkModeSwitchLabel: 'Design',
    sidebarMenuLabel: 'Menü',
    returnToTopLabel: 'Nach oben'
  }
})
```

Die Vorschau lädt die geänderten Einstellungen von selbst neu.

### 9. Startseite ersetzen

Die Startseite besteht nur aus Angaben zwischen den `---`-Zeilen. `layout: home` erzeugt daraus eine Titelseite mit großer Überschrift und einer Schaltfläche.

```bash
nano index.md
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```markdown
---
layout: home

hero:
  name: Meine Dokumentation
  tagline: Erstellt mit VitePress
  actions:
    - theme: brand
      text: Los geht's
      link: /erste-seite
---
```

### 10. Eine eigene Seite anlegen

Legt die Seite `erste-seite.md` an. Der Kasten mit `::: tip` ist ein Hinweiskasten, eine Besonderheit von VitePress.

```bash
nano erste-seite.md
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

~~~markdown
# Erste Seite

Diese Seite ist in **Markdown** geschrieben.

::: tip Tipp
Änderungen erscheinen sofort im Browser, solange `npm run docs:dev` läuft.
:::

## Ein Codebeispiel

```js
console.log('Hallo VitePress')
```
~~~

**Prüfen:** In der Vorschau führt die Schaltfläche „Los geht's“ zur neuen Seite. Sie hat einen grünen Hinweiskasten, und rechts steht „Auf dieser Seite“.

### 11. Beispielseiten entfernen

Die zwei Beispielseiten des Assistenten werden nicht mehr gebraucht und sind in den neuen Einstellungen auch nicht mehr verlinkt.

```bash
rm api-examples.md markdown-examples.md
```

### 12. Vorschau beenden

Beendet den Entwicklungsserver aus Schritt 7. Wechsle dazu in dessen Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

### 13. Fertige Webseite bauen

Erzeugt die fertige Webseite im Ordner `.vitepress/dist`. Diesen Ordner kannst du auf einen beliebigen Webserver hochladen, z. B. auf einen Server mit [nginx](nginx.md). Findet VitePress dabei Links auf Seiten, die es nicht gibt, bricht der Vorgang mit einer Fehlermeldung ab.

```bash
npm run docs:build
```

**Prüfen:** Die Ausgabe endet mit `build complete in …`.

### 14. Fertige Webseite ansehen

Startet einen einfachen Webserver für den fertigen Ordner. So siehst du die Seite genauso, wie sie später veröffentlicht wird.

```bash
npm run docs:preview
```

**Prüfen:** <http://localhost:4173> zeigt die fertige Seite. Mit <kbd>Strg</kbd>+<kbd>C</kbd> beendest du den Webserver.

## Aktualisieren

VitePress wird pro Projekt aktualisiert. Im Projektordner holt dieser Befehl die neueste Version innerhalb von VitePress 1:

```bash
npm update vitepress
```

**Prüfen:**

```bash
npm ls vitepress
```

## Deinstallieren

### 1. Projekt entfernen

Löscht das Beispielprojekt samt `node_modules`. **Achtung:** Alles in `~/meine-vitepress` geht verloren.

```bash
rm -rf ~/meine-vitepress
```

### 2. Optional: Node.js und npm entfernen

Nur ausführen, wenn kein anderes Programm Node.js braucht (z. B. Antora oder Docusaurus).

```bash
sudo apt purge nodejs npm
```

```bash
sudo apt autoremove
```

**Prüfen:** Der Projektordner existiert nicht mehr.

```bash
ls ~/meine-vitepress
```
