# Astro Starlight

Starlight macht aus Astro, einem Werkzeug zum Bauen von Webseiten, ein fertiges System für Dokumentationen. Aus Markdown-Dateien entsteht damit eine schnelle, statische Webseite mit Seitenleiste, eingebauter Suche, hellem und dunklem Modus sowie Unterstützung für mehrere Sprachen.

## Vorbemerkungen

- **Kein apt-Paket:** Astro und Starlight sind nicht in den Ubuntu-Paketquellen enthalten. Sie werden nicht systemweit installiert, sondern **pro Projekt** über `npm`, den Paketmanager von Node.js. Aus den Ubuntu-Paketquellen kommen nur Node.js und npm.
- **Node.js-Version:** Astro 7 braucht Node.js 22.12 oder neuer. Ubuntu 26.04 liefert Node.js 22.22, das passt.
- **Junge Software:** Starlight hat noch eine Versionsnummer unter 1 (derzeit 0.42). Zwischen Versionen ändern sich gelegentlich Einstellungen. Die Beispiele hier passen zu Astro 7 und Starlight 0.42.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Node.js und npm aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt Astro aus, `npm` lädt Astro und Starlight herunter. Ist beides schon vorhanden (z. B. aus der [Docusaurus-Anleitung](docusaurus.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Ausgabe ist eine Versionsnummer ab `v22.12`, z. B. `v22.22.1`.

```bash
node --version
```

Hast du Node.js zusätzlich über den Versionsmanager `nvm` installiert, wird dessen Version angezeigt. Das ist in Ordnung, solange sie mindestens `v22.12` ist.

## Erstes Projekt

### 3. Projekt anlegen

`npm create astro` lädt das Einrichtungsprogramm von Astro herunter und erzeugt damit ein neues Projekt im Ordner `~/meine-starlight`. Die Angaben nach `--` bedeuten:

- `--template starlight` – verwendet die Starlight-Vorlage statt einer leeren Astro-Seite
- `--install` – installiert die benötigten Pakete gleich mit
- `--no-git` – legt kein Git-Repository an (das kannst du später jederzeit mit `git init` nachholen)
- `--yes` – beantwortet alle weiteren Fragen mit dem Vorschlag

Der Vorgang dauert je nach Internetverbindung etwa eine Minute.

```bash
npm create --yes astro@latest -- ~/meine-starlight --template starlight --install --no-git --yes
```

**Prüfen:** Die Ausgabe enthält `Project initialized!`.

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/meine-starlight
```

**Prüfen:** Unter anderem werden die Einstellungsdatei `astro.config.mjs` und der Ordner `src` angezeigt. Die Seiten der Dokumentation liegen in `src/content/docs`.

```bash
ls
```

### 5. Vorschau starten

Startet einen Entwicklungsserver. Jede gespeicherte Änderung erscheint sofort im Browser. Das Terminal bleibt dabei belegt, öffne für die nächsten Schritte ein zweites Terminal (ebenfalls im Ordner `~/meine-starlight`).

```bash
npm run dev
```

**Prüfen:** Im Terminal steht `Local http://localhost:4321/`. Öffne <http://localhost:4321> im Browser: Es erscheint die englische Beispielseite „Welcome to Starlight“.

## Projekt anpassen

### 6. Einstellungen auf Deutsch schreiben

Ersetzt die Einstellungsdatei. Die Angaben bewirken Folgendes:

- `title` – Titel der Webseite, erscheint oben links
- `defaultLocale` und `locales` – die Seite ist einsprachig auf Deutsch. Dadurch erscheinen fest eingebaute Beschriftungen wie „Suchen“ oder „Auf dieser Seite“ auf Deutsch.
- `sidebar` – die Seitenleiste enthält eine Gruppe „Anleitungen“, die automatisch alle Seiten aus dem Ordner `anleitungen` auflistet

```bash
nano astro.config.mjs
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'Meine Dokumentation',
			defaultLocale: 'root',
			locales: {
				root: { label: 'Deutsch', lang: 'de' },
			},
			sidebar: [
				{
					label: 'Anleitungen',
					items: [{ autogenerate: { directory: 'anleitungen' } }],
				},
			],
		}),
	],
});
```

In der Vorschau ist die Seitenleiste jetzt leer, weil es den Ordner `anleitungen` noch nicht gibt. Das ändert sich in den nächsten Schritten.

### 7. Beispielseiten entfernen

Die Vorlage enthält zwei Beispielordner, die in den neuen Einstellungen nicht mehr vorkommen.

```bash
rm -r src/content/docs/guides src/content/docs/reference
```

### 8. Ordner für die eigenen Seiten anlegen

In diesem Ordner sucht die Seitenleiste nach Seiten (siehe Schritt 6).

```bash
mkdir src/content/docs/anleitungen
```

### 9. Eine eigene Seite anlegen

Legt die Seite `erste-seite.md` an. Jede Seite beginnt mit Angaben zwischen `---`-Zeilen: `title` ist Pflicht und wird zur Überschrift der Seite, `description` erscheint in Suchmaschinen. Der Kasten mit `:::tip` ist ein Hinweiskasten, eine Besonderheit von Starlight.

```bash
nano src/content/docs/anleitungen/erste-seite.md
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

~~~markdown
---
title: Erste Seite
description: Eine erste Seite mit Starlight
---

Diese Seite ist in **Markdown** geschrieben. Den Titel oben setzt Starlight aus der Angabe `title`.

:::tip[Tipp]
Änderungen erscheinen sofort im Browser, solange `npm run dev` läuft.
:::

## Ein Codebeispiel

```js
console.log('Hallo Starlight');
```
~~~

### 10. Startseite ersetzen

Die Startseite der Vorlage ist englisch und verlinkt auf die gelöschten Beispielseiten. `template: splash` erzeugt eine Titelseite ohne Seitenleiste mit großer Überschrift und einer Schaltfläche.

```bash
nano src/content/docs/index.mdx
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```markdown
---
title: Meine Dokumentation
description: Startseite der Dokumentation
template: splash
hero:
  tagline: Erstellt mit Astro Starlight
  actions:
    - text: Los geht's
      link: /anleitungen/erste-seite/
      icon: right-arrow
---
```

**Prüfen:** Lade <http://localhost:4321> im Browser neu. Die Schaltfläche „Los geht's“ führt zur neuen Seite. Links steht die Gruppe „Anleitungen“, rechts „Auf dieser Seite“, und oben gibt es ein Suchfeld „Suchen“.

### 11. Vorschau beenden

Beendet den Entwicklungsserver aus Schritt 5. Wechsle dazu in dessen Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

### 12. Fertige Webseite bauen

Erzeugt die fertige Webseite im Ordner `dist`, einschließlich des Suchindex. Diesen Ordner kannst du auf einen beliebigen Webserver hochladen, z. B. auf einen Server mit [nginx](nginx.md).

```bash
npm run build
```

**Prüfen:** Die Ausgabe endet mit `[build] Complete!`. Die Warnung, dass für die Sitemap die Einstellung `site` fehlt, kannst du hier ignorieren. Vor einer echten Veröffentlichung trägst du in `astro.config.mjs` vor `integrations` die spätere Adresse ein, z. B. `site: 'https://docs.example.org',`.

### 13. Fertige Webseite ansehen

Startet einen einfachen Webserver für den Ordner `dist`. So siehst du die Seite genauso, wie sie später veröffentlicht wird. Anders als in der Vorschau funktioniert hier auch die Suche.

```bash
npm run preview
```

**Prüfen:** <http://localhost:4321> zeigt die fertige Seite. Die Suche oben findet die „Erste Seite“. Mit <kbd>Strg</kbd>+<kbd>C</kbd> beendest du den Webserver.

## Aktualisieren

Astro und Starlight werden pro Projekt aktualisiert. Im Projektordner bringt dieser Befehl Astro, Starlight und passende Erweiterungen gemeinsam auf den neuesten Stand. Er zeigt vorher an, was sich ändert, und fragt nach.

```bash
npx @astrojs/upgrade
```

Weil Starlight noch unter Version 1 ist, lohnt vor größeren Sprüngen ein Blick in die Versionshinweise von Starlight.

## Deinstallieren

### 1. Projekt entfernen

Löscht das Beispielprojekt samt `node_modules`. **Achtung:** Alles in `~/meine-starlight` geht verloren.

```bash
rm -rf ~/meine-starlight
```

### 2. Zwischengespeichertes Einrichtungsprogramm entfernen

`npm create` und `npx` haben Programme in einem Zwischenspeicher abgelegt. Dieser Befehl leert ihn. Andere Projekte sind davon nicht betroffen, die Programme werden beim nächsten Aufruf einfach neu geladen.

```bash
rm -rf ~/.npm/_npx
```

### 3. Optional: Node.js und npm entfernen

Nur ausführen, wenn kein anderes Programm Node.js braucht (z. B. Antora, Docusaurus oder VitePress).

```bash
sudo apt purge nodejs npm
```

```bash
sudo apt autoremove
```

**Prüfen:** Der Projektordner existiert nicht mehr.

```bash
ls ~/meine-starlight
```
