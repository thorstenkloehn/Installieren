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

## Beispiel: mdBook unter eigener Domain veröffentlichen

So wird dieses Buch veröffentlicht: mdBook baut die Seiten in den Ordner `book`, gh-pages schiebt sie in den Branch `gh-pages`, und GitHub liefert sie unter der Domain `wissen-ahrensburg.de` aus. Die Schritte setzen voraus, dass gh-pages wie oben im Projekt installiert ist und `origin` auf das GitHub-Repository zeigt.

### 1. Kurzbefehl in package.json eintragen

Der Kurzbefehl heißt hier `ver` (für „veröffentlichen“) und bündelt alle Optionen.

```bash
nano package.json
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `"scripts"` und bestätige mit <kbd>Enter</kbd>. Füge in der Zeile darunter diese Zeile ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Steht danach noch ein weiterer Eintrag wie `"test"`, muss die Zeile mit einem Komma enden. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```json
    "ver": "gh-pages -d book --nojekyll --cname wissen-ahrensburg.de --no-history"
```

Die Optionen bedeuten:

- `-d book` – veröffentlicht den Ordner `book`, in den `mdbook build` schreibt
- `--nojekyll` – verhindert, dass GitHub die Seite mit Jekyll aufbereitet (siehe Schritt 10 oben)
- `--cname wissen-ahrensburg.de` – legt die Datei `CNAME` mit dieser Domain in den Branch. Daran erkennt GitHub, unter welcher Domain es die Seite ausliefern soll. Ersetze die Domain durch deine eigene.
- `--no-history` – ersetzt den Branch `gh-pages` bei jeder Veröffentlichung durch einen einzigen neuen Commit, statt einen weiteren anzuhängen. Das Repository wächst dadurch nicht mit jeder Veröffentlichung. Ältere Stände der Webseite sind danach nicht mehr im Branch `gh-pages` gespeichert; die Quelltexte in `main` bleiben unberührt.

Der Abschnitt `scripts` sieht danach z. B. so aus:

```json
  "scripts": {
    "ver": "gh-pages -d book --nojekyll --cname wissen-ahrensburg.de --no-history"
  },
```

**Prüfen:** npm listet den Kurzbefehl `ver` auf.

```bash
npm run
```

### 2. Ordner book von Git ausschließen

`book` wird bei jedem Bauen neu erzeugt und gehört nicht in den Branch `main`. Öffne dazu `.gitignore`:

```bash
nano .gitignore
```

Füge diese Zeile ein, falls sie noch fehlt, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
book
```

### 3. DNS-Einträge für die Domain setzen

Einmalig beim Anbieter deiner Domain: Die Domain muss auf die Server von GitHub Pages zeigen. Lege für `wissen-ahrensburg.de` vier A-Einträge mit diesen Adressen an:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Prüfen:** Nach einiger Zeit (je nach Anbieter Minuten bis Stunden) gibt dieser Befehl die vier Adressen aus.

```bash
dig +short wissen-ahrensburg.de
```

Fehlt `dig`, installierst du es mit `sudo apt install bind9-dnsutils`.

### 4. Buch bauen

Erzeugt den Ordner `book` mit der aktuellen Fassung aller Anleitungen. Ohne diesen Schritt würde gh-pages einen veralteten oder gar keinen Stand veröffentlichen.

```bash
mdbook build
```

**Prüfen:** Im Ordner `book` liegt eine `index.html`.

```bash
ls book/index.html
```

### 5. Buch veröffentlichen

Führt den Kurzbefehl aus Schritt 1 aus.

```bash
npm run ver
```

**Prüfen:** Die Ausgabe endet mit `Published`. Der Branch `gh-pages` enthält jetzt genau einen Commit:

```bash
git fetch origin gh-pages
```

```bash
git log --oneline origin/gh-pages
```

### 6. Eigene Domain in GitHub bestätigen

Einmalig im Browser: Öffne im Repository **Settings** → **Pages**. Stelle wie in Schritt 13 oben den Branch `gh-pages` ein. Unter **Custom domain** steht nun `wissen-ahrensburg.de` (aus der Datei `CNAME`). Setze, sobald GitHub es anbietet, den Haken bei **Enforce HTTPS**, damit die Seite verschlüsselt ausgeliefert wird.

**Prüfen:** <https://wissen-ahrensburg.de/> zeigt das Buch.

Bei jeder späteren Änderung genügen die Schritte 4 und 5. Weil die Seite direkt unter der Domain liegt und nicht unter `/meine-seite/`, ist in mdBook keine zusätzliche Pfadangabe nötig.

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

Die Einträge `deploy` bzw. `ver` funktionieren ohne gh-pages nicht mehr.

```bash
nano package.json
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `"deploy"` (bzw. `"ver"`), lösche die Zeile mit <kbd>Strg</kbd>+<kbd>K</kbd>, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

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
