# gh-pages

gh-pages ist ein kleines npm-Werkzeug, das einen fertig gebauten Ordner (z. B. `dist`) mit einem einzigen Befehl in den Branch `gh-pages` eines Git-Repositorys schiebt. GitHub Pages veröffentlicht diesen Branch dann als Webseite.

## Vorbemerkungen

- **Kein apt-Paket:** gh-pages gibt es nicht in den Ubuntu-Paketquellen. Es wird **pro Projekt** mit `npm` installiert. Aus den Ubuntu-Paketquellen kommen nur Git, Node.js und npm.
- **Version:** Diese Anleitung verwendet gh-pages 6 (derzeit 6.3). Es läuft mit jeder Node.js-Version ab 10, das Node.js 22 aus Ubuntu 26.04 passt also.
- **Voraussetzung:** Du hast ein Repository auf GitHub, und `git push` funktioniert von deinem Rechner aus (per SSH-Schlüssel oder Zugangstoken). gh-pages nutzt genau diesen Zugang.
- **Was gh-pages nicht tut:** Es baut die Webseite nicht. Den Ordner mit den fertigen Dateien erzeugt vorher dein Werkzeug, z. B. [VitePress](vitepress.md), [Docusaurus](docusaurus.md) oder [mdBook](mdbook.md).

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Git, Node.js und npm kennt.

```bash
sudo apt update
```

### 2. Git, Node.js und npm installieren

Git überträgt die Dateien zu GitHub, Node.js führt gh-pages aus und npm lädt es herunter. Ist schon alles vorhanden, meldet `apt` das nur.

```bash
sudo apt install git nodejs npm
```

**Prüfen:** Beide Befehle geben eine Versionsnummer aus.

```bash
node --version
```

```bash
git --version
```

## Beispielprojekt

Die folgenden Schritte zeigen gh-pages an einem kleinen Projekt. Hast du schon ein Projekt, beginne in dessen Ordner bei Schritt 6.

### 3. Repository von GitHub holen

Lädt ein bestehendes GitHub-Repository auf deinen Rechner. Ersetze `BENUTZER` und `meine-seite` durch deinen GitHub-Namen und den Namen des Repositorys. Das Repository sollte schon mindestens einen Commit haben (z. B. eine `README.md`, die GitHub beim Anlegen erzeugt).

```bash
git clone git@github.com:BENUTZER/meine-seite.git ~/meine-seite
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/meine-seite
```

**Prüfen:** Unter `origin` steht die Adresse deines GitHub-Repositorys. An diese Adresse schickt gh-pages später die Dateien.

```bash
git remote -v
```

### 5. package.json anlegen

npm braucht die Datei `package.json`, um festzuhalten, welche Pakete das Projekt verwendet. `-y` übernimmt alle Vorschläge, ohne nachzufragen.

```bash
npm init -y
```

### 6. gh-pages installieren

Lädt gh-pages in den Ordner `node_modules` und trägt es in `package.json` ein. `-D` kennzeichnet es als Entwicklungswerkzeug, das nicht zur Webseite selbst gehört.

```bash
npm add -D gh-pages
```

**Prüfen:** Die Ausgabe zeigt die installierte Version, z. B. `gh-pages@6.3.0`.

```bash
npm ls gh-pages
```

### 7. node_modules von Git ausschließen

Der Ordner `node_modules` lässt sich jederzeit mit `npm install` wiederherstellen und gehört nicht ins Repository. gh-pages legt dort außerdem seinen Zwischenspeicher ab.

```bash
nano .gitignore
```

Füge diese Zeile ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
node_modules
```

### 8. Ordner für die fertige Webseite anlegen

In einem echten Projekt erzeugt dein Werkzeug diesen Ordner beim Bauen. Für das Beispiel legst du ihn selbst an.

```bash
mkdir dist
```

### 9. Eine Testseite anlegen

Eine einfache HTML-Seite, an der du erkennst, ob die Veröffentlichung geklappt hat.

```bash
nano dist/index.html
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Meine Seite</title>
</head>
<body>
  <h1>Hallo von GitHub Pages</h1>
</body>
</html>
```

### 10. Kurzbefehl in package.json eintragen

Ein Eintrag unter `scripts` erspart dir, die Optionen jedes Mal abzutippen. Danach genügt `npm run deploy`.

```bash
nano package.json
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `"test"` und bestätige mit <kbd>Enter</kbd>. Lösche diese Zeile mit <kbd>Strg</kbd>+<kbd>K</kbd> und füge an ihrer Stelle diese Zeile ein. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```json
    "deploy": "gh-pages -d dist --nojekyll"
```

Die Optionen bedeuten:

- `-d dist` – dieser Ordner wird veröffentlicht
- `--nojekyll` – legt eine leere Datei `.nojekyll` an. Sonst bereitet GitHub die Seite mit Jekyll auf und lässt dabei Ordner weg, die mit `_` beginnen (das betrifft z. B. VitePress und Sphinx).

Der Abschnitt `scripts` sieht danach so aus:

```json
  "scripts": {
    "deploy": "gh-pages -d dist --nojekyll"
  },
```

### 11. Projektdateien committen

Sichert `package.json`, `package-lock.json` und `.gitignore` im Branch `main`. Der Ordner `dist` wird hier mit übernommen, das ist für das Beispiel in Ordnung.

```bash
git add .
```

```bash
git commit -m "gh-pages einrichten"
```

```bash
git push
```

### 12. Webseite veröffentlichen

gh-pages kopiert den Inhalt von `dist` in den Branch `gh-pages`, erstellt dort einen Commit und schiebt ihn zu GitHub. Den Branch legt es beim ersten Mal selbst an.

```bash
npm run deploy
```

**Prüfen:** Die Ausgabe endet mit `Published`. Auf GitHub gibt es jetzt den Branch `gh-pages` mit den Dateien `index.html` und `.nojekyll`.

```bash
git ls-remote origin gh-pages
```

### 13. GitHub Pages einschalten

Einmalig im Browser: GitHub muss wissen, aus welchem Branch es die Webseite liefern soll.

1. Öffne dein Repository auf GitHub.
2. Klicke auf **Settings** und links auf **Pages**.
3. Wähle unter **Source** den Eintrag **Deploy from a branch**.
4. Wähle unter **Branch** den Eintrag `gh-pages` und den Ordner `/ (root)` und klicke auf **Save**.

**Prüfen:** Nach ein bis zwei Minuten zeigt <https://BENUTZER.github.io/meine-seite/> die Überschrift „Hallo von GitHub Pages“.

## Mit anderen Werkzeugen verwenden

Bei einem echten Projekt ersetzt du in Schritt 10 nur `dist` durch den Ordner, in den dein Werkzeug baut, und baust vor `npm run deploy` die Seite neu:

| Werkzeug | Ordner für `-d` |
|---|---|
| [mdBook](mdbook.md) | `book` |
| [VitePress](vitepress.md) | `.vitepress/dist` |
| [Docusaurus](docusaurus.md) | `build` |
| [Astro Starlight](starlight.md) | `dist` |

Weil die Seite unter `/meine-seite/` liegt und nicht direkt unter der Domain, muss dein Werkzeug das wissen. In VitePress trägst du dazu z. B. `base: '/meine-seite/'` in `.vitepress/config.mts` ein, in Docusaurus `baseUrl`. Ohne diese Angabe fehlen auf der veröffentlichten Seite Stile und Bilder.

## Aktualisieren

gh-pages wird pro Projekt aktualisiert. Im Projektordner holt dieser Befehl die neueste Version innerhalb von gh-pages 6:

```bash
npm update gh-pages
```

**Prüfen:**

```bash
npm ls gh-pages
```

## Fehlerbehebung

Meldet gh-pages `Remote url mismatch`, hat sich die Adresse von `origin` geändert, seit der Zwischenspeicher angelegt wurde. Dieser Befehl leert den Zwischenspeicher, danach funktioniert `npm run deploy` wieder:

```bash
npx gh-pages-clean
```

## Deinstallieren

### 1. gh-pages aus dem Projekt entfernen

Löscht gh-pages aus `node_modules` und aus `package.json`.

```bash
npm uninstall gh-pages
```

**Prüfen:** Die Ausgabe zeigt `(empty)`.

```bash
npm ls gh-pages
```

### 2. Kurzbefehl entfernen

Der Eintrag `deploy` funktioniert ohne gh-pages nicht mehr.

```bash
nano package.json
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `"deploy"`, lösche die Zeile mit <kbd>Strg</kbd>+<kbd>K</kbd>, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 3. Optional: Veröffentlichte Webseite löschen

Entfernt den Branch `gh-pages` auf GitHub. **Achtung:** Die Webseite ist danach nicht mehr erreichbar.

```bash
git push origin --delete gh-pages
```

### 4. Optional: Node.js und npm entfernen

Nur ausführen, wenn kein anderes Programm Node.js braucht (z. B. VitePress oder Docusaurus).

```bash
sudo apt purge nodejs npm
```

```bash
sudo apt autoremove
```
