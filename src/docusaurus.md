# Docusaurus

Docusaurus ist ein Werkzeug von Meta, mit dem man Dokumentations-Webseiten aus Markdown-Dateien erstellt. Es bringt Seitennavigation, Suche, Versionierung, mehrsprachige Seiten und auf Wunsch einen Blog mit. Die Seiten basieren auf React und lassen sich deshalb mit eigenen Komponenten erweitern.

## Vorbemerkungen

- **Kein apt-Paket:** Docusaurus ist nicht in den Ubuntu-Paketquellen enthalten. Es wird nicht systemweit installiert, sondern **pro Projekt** über `npm`, den Paketmanager von Node.js. Aus den Ubuntu-Paketquellen kommen nur Node.js und npm.
- **Node.js-Version:** Docusaurus 3 braucht Node.js 20 oder neuer. Ubuntu 26.04 liefert Node.js 22, das passt.
- **Speicherplatz:** Jedes Docusaurus-Projekt lädt seine Abhängigkeiten in einen eigenen Ordner `node_modules`. Er ist etwa 350 MB groß.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Node.js und npm aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt Docusaurus aus, `npm` lädt Docusaurus und seine Abhängigkeiten herunter. Das Paket `npm` bringt auch den Befehl `npx` mit, der im nächsten Schritt gebraucht wird. Ist beides schon vorhanden (z. B. aus der [Antora-Anleitung](antora.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Ausgabe ist eine Versionsnummer ab `v20`, z. B. `v22.22.1`.

```bash
node --version
```

Hast du Node.js zusätzlich über den Versionsmanager `nvm` installiert, wird dessen Version angezeigt. Das ist in Ordnung, solange sie mindestens `v20` ist.

## Erstes Projekt

### 3. Projekt anlegen

`npx create-docusaurus` lädt das Einrichtungsprogramm von Docusaurus herunter und erzeugt damit ein neues Projekt im Ordner `~/meine-doku`. Die Angaben bedeuten:

- `classic` – die Standardvorlage mit Dokumentation, Blog und Startseite
- `--javascript` – das Projekt verwendet JavaScript statt TypeScript (sonst wird nachgefragt)
- `--package-manager npm` – die Abhängigkeiten werden mit npm installiert

Der Vorgang dauert je nach Internetverbindung ein bis zwei Minuten. Fragt `npx`, ob `create-docusaurus` installiert werden soll, mit `y` bestätigen.

```bash
npx create-docusaurus@latest ~/meine-doku classic --javascript --package-manager npm
```

**Prüfen:** Die Ausgabe enthält `[SUCCESS] Created`.

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/meine-doku
```

**Prüfen:** Unter anderem werden die Ordner `docs` (Dokumentationsseiten), `blog` und `src` sowie die Einstellungsdatei `docusaurus.config.js` angezeigt.

```bash
ls
```

### 5. Vorschau starten

Startet einen Entwicklungsserver. Bei jeder gespeicherten Änderung aktualisiert sich die Seite im Browser von selbst. Das Terminal bleibt dabei belegt, öffne für die nächsten Schritte ein zweites Terminal (ebenfalls im Ordner `~/meine-doku`).

```bash
npm start
```

**Prüfen:** Im Terminal steht `Docusaurus website is running at: http://localhost:3000/`. Der Browser öffnet sich meist von selbst, sonst <http://localhost:3000> aufrufen. Es erscheint die Beispielseite „My Site“.

## Projekt anpassen

### 6. Titel ändern

Ersetzt den Beispieltitel „My Site“ in der Einstellungsdatei durch einen eigenen. Er erscheint im Browser-Tab und oben links in der Navigationsleiste.

```bash
nano docusaurus.config.js
```

`title: 'My Site',` steht zweimal in der Datei: oben als Titel der Webseite und weiter unten beim Abschnitt `navbar` als Titel in der Navigationsleiste. Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `title: 'My Site'` und drücke <kbd>Enter</kbd>. Ersetze `My Site` durch `Meine Dokumentation`. Springe dann mit <kbd>Alt</kbd>+<kbd>W</kbd> zur zweiten Fundstelle und ändere sie genauso. Beide Zeilen lauten danach (mit unterschiedlicher Einrückung):

```javascript
title: 'Meine Dokumentation',
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** In der Vorschau steht oben links „Meine Dokumentation“.

### 7. Sprache auf Deutsch stellen

Stellt die Sprache der Webseite von Englisch auf Deutsch um. Dadurch erscheinen fest eingebaute Beschriftungen wie „Weiter“ oder „Zurück“ auf Deutsch. Die Beispieltexte der Vorlage bleiben englisch, sie werden durch deine eigenen Seiten ersetzt.

```bash
nano docusaurus.config.js
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `defaultLocale` und drücke <kbd>Enter</kbd>. Ändere in dieser und der Zeile darunter jeweils `'en'` in `'de'`, sodass beide Zeilen so lauten:

```javascript
    defaultLocale: 'de',
    locales: ['de'],
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Ausgabe zeigt `defaultLocale: 'de'` und `locales: ['de']`.

```bash
grep -E "defaultLocale|locales:" docusaurus.config.js
```

Die Spracheinstellung wird erst nach einem Neustart der Vorschau wirksam: Im Terminal mit `npm start` <kbd>Strg</kbd>+<kbd>C</kbd> drücken und `npm start` erneut ausführen.

### 8. Eine eigene Seite anlegen

Legt die Seite `erste-seite.md` im Ordner `docs` an. Der Block zwischen den `---`-Zeilen enthält Angaben für Docusaurus: `sidebar_position: 2` setzt die Seite an die zweite Stelle der Seitenleiste. Der Kasten mit `:::tip` ist ein Hinweiskasten, eine Besonderheit von Docusaurus.

```bash
nano docs/erste-seite.md
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```markdown
---
sidebar_position: 2
---

# Erste Seite

Diese Seite ist in **Markdown** geschrieben.

:::tip Tipp
Änderungen erscheinen sofort im Browser, solange `npm start` läuft.
:::
```

**Prüfen:** In der Vorschau unter **Tutorial** erscheint in der linken Seitenleiste „Erste Seite“ mit einem grünen Hinweiskasten.

### 9. Vorschau beenden

Beendet den Entwicklungsserver aus Schritt 5. Wechsle dazu in dessen Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

### 10. Fertige Webseite bauen

Erzeugt die fertige, optimierte Webseite im Ordner `build`. Diesen Ordner kannst du auf einen beliebigen Webserver hochladen, z. B. auf einen Server mit [nginx](nginx.md). Findet Docusaurus dabei defekte Links, bricht der Vorgang mit einer Fehlermeldung ab.

```bash
npm run build
```

**Prüfen:** Die Ausgabe enthält `[SUCCESS] Generated static files in "build".`

### 11. Fertige Webseite ansehen

Startet einen einfachen Webserver für den Ordner `build`. So siehst du die Seite genauso, wie sie später veröffentlicht wird.

```bash
npm run serve
```

**Prüfen:** <http://localhost:3000> zeigt die fertige Seite. Mit <kbd>Strg</kbd>+<kbd>C</kbd> beendest du den Webserver.

## Aktualisieren

Docusaurus wird pro Projekt aktualisiert. Im Projektordner zeigt dieser Befehl, ob neuere Versionen der Docusaurus-Pakete verfügbar sind:

```bash
npm outdated
```

Die Pakete, die mit `@docusaurus/` beginnen, sollten immer alle dieselbe Version haben. Hinweise zum Umstieg auf eine neue Hauptversion stehen in den Versionshinweisen von Docusaurus.

## Deinstallieren

### 1. Projekt entfernen

Löscht das Beispielprojekt samt `node_modules`. **Achtung:** Alles in `~/meine-doku` geht verloren.

```bash
rm -rf ~/meine-doku
```

### 2. Zwischengespeichertes Einrichtungsprogramm entfernen

`npx` hat `create-docusaurus` in einem Zwischenspeicher abgelegt. Dieser Befehl leert ihn. Andere Projekte sind davon nicht betroffen, `npx` lädt benötigte Programme beim nächsten Aufruf einfach neu.

```bash
rm -rf ~/.npm/_npx
```

### 3. Optional: Node.js und npm entfernen

Nur ausführen, wenn kein anderes Programm Node.js braucht (z. B. Antora).

```bash
sudo apt purge nodejs npm
```

```bash
sudo apt autoremove
```

**Prüfen:** Der Projektordner existiert nicht mehr.

```bash
ls ~/meine-doku
```
