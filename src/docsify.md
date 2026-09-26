# Docsify

Docsify macht aus einem Ordner mit Markdown-Dateien eine Dokumentations-Website mit Seitenleiste und Suche. Es erzeugt dabei keine HTML-Dateien: Eine einzige `index.html` lädt die Markdown-Dateien erst im Browser und stellt sie dort dar.

## Vorbemerkungen

- **Kein apt-Paket:** Docsify ist nicht in den Ubuntu-Paketquellen enthalten. Das Hilfsprogramm `docsify-cli` wird über `npm`, den Paketmanager von Node.js, geladen. Aus den Ubuntu-Paketquellen kommen nur Node.js und npm.
- **Ohne globale Installation:** `docsify-cli` wird nicht mit `sudo npm install -g` systemweit installiert, sondern bei Bedarf mit `npx` gestartet. Es wird nur zum Anlegen des Projekts und für die Vorschau gebraucht.
- **Kein Bauschritt:** Anders als bei [mdBook](mdbook.md) oder [Hugo](hugo.md) gibt es keinen Befehl, der die Website baut. Der Projektordner ist schon die fertige Website.
- **Internet nötig:** Die `index.html` lädt Docsify selbst, das Design und die Suche vom Dienst jsDelivr (`cdn.jsdelivr.net`). Beim Aufruf der Website überträgt der Browser dabei die IP-Adresse des Besuchers an jsDelivr. Wer das vermeiden will, muss die Dateien selbst auf dem Server ablegen. Das zeigt diese Anleitung nicht.
- **Version:** Getestet mit Docsify **5.0.0** und docsify-cli 5.0.0 unter Node.js 22 aus Ubuntu 26.04. Beide brauchen Node.js 20.11 oder neuer.
- **Port:** Die Vorschau soll hier auf Port **3001** laufen. Der voreingestellte Port 3000 ist oft schon belegt, z. B. durch [Martin](martin.md).

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Node.js und npm kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt `docsify-cli` aus, `npm` lädt es herunter und bringt den Befehl `npx` mit. Sind beide schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Ausgabe ist eine Versionsnummer ab `v20.11`, z. B. `v22.22.1`.

```bash
node --version
```

Hast du Node.js zusätzlich über den Versionsmanager `nvm` installiert, wird dessen Version angezeigt. Das ist in Ordnung, solange sie mindestens `v20.11` ist.

## Eine Dokumentation anlegen

### 3. Projekt erzeugen

`npx` lädt `docsify-cli` vorübergehend herunter und führt es aus. `init` legt den Ordner `~/meindocsify/docs` an und schreibt drei Dateien hinein: `index.html` (die Seite, die Docsify startet), `README.md` (die Startseite) und `.nojekyll` (verhindert, dass GitHub Pages Dateien mit `_` am Anfang weglässt).

```bash
npx docsify-cli init ~/meindocsify/docs
```

Die Frage `Need to install the following packages: docsify-cli … Ok to proceed? (y)` beantwortest du mit <kbd>Enter</kbd>.

**Prüfen:** Die Ausgabe enthält `Initialization succeeded!`.

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/meindocsify
```

**Prüfen:** Die Ausgabe zeigt `index.html` und `README.md`.

```bash
ls docs
```

### 5. Docsify einstellen

In `index.html` stehen die Einstellungen im Block `window.$docsify`. Hier werden der Name der Website, die deutsche Sprache, die Seitenleiste und die Suche eingerichtet.

```bash
nano docs/index.html
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Meine Dokumentation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@5/dist/themes/core.min.css">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@5/dist/themes/addons/vue.min.css">
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: 'Meine Dokumentation',
      loadSidebar: true,
      subMaxLevel: 2,
      search: {
        placeholder: 'Suchen …',
        noData: 'Keine Treffer'
      }
    }
  </script>
  <script src="//cdn.jsdelivr.net/npm/docsify@5"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify@5/dist/plugins/search.min.js"></script>
</body>
</html>
```

- `name` – steht oben in der Seitenleiste.
- `loadSidebar: true` – Docsify baut die Seitenleiste aus der Datei `_sidebar.md` (Schritt 8).
- `subMaxLevel: 2` – unter der geöffneten Seite zeigt die Seitenleiste zusätzlich deren Zwischenüberschriften (`##`).
- `search` – deutsche Texte für das Suchfeld. Die letzte `<script>`-Zeile lädt die Suche dazu.
- `docsify@5` – lädt immer die neueste Version 5.x.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Startseite schreiben

`README.md` ist die Seite, die beim Aufruf der Website erscheint.

```bash
nano docs/README.md
```

Ersetze den englischen Beispieltext wie in Schritt 5 durch:

```markdown
# Willkommen

Diese Dokumentation wurde mit **Docsify** erstellt.
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. Eine zweite Seite anlegen

Jede weitere Markdown-Datei im Ordner `docs` wird eine eigene Seite.

```bash
nano docs/installation.md
```

Füge diesen Inhalt ein:

```markdown
# Installation

## Voraussetzungen

Ein Rechner mit Ubuntu.

## Schritte

Erst installieren, dann starten.
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Seitenleiste anlegen

Ohne diese Datei zeigt die Seitenleiste nur die Überschriften der aktuellen Seite. Jede Zeile ist ein Link auf eine Seite. `/` steht für die Startseite.

```bash
nano docs/_sidebar.md
```

Füge diesen Inhalt ein:

```markdown
- [Startseite](/)
- [Installation](installation.md)
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Vorschau starten

`serve` startet einen kleinen Webserver für den Ordner `docs`. `-p 3001` wählt Port 3001. Der Server lädt die Seite im Browser neu, sobald du eine Datei speicherst.

```bash
npx docsify-cli serve docs -p 3001
```

**Prüfen:** Die Ausgabe enthält `Listening at http://localhost:3001`. Öffne <http://localhost:3001> im Browser. Links stehen das Suchfeld „Suchen …“, „Meine Dokumentation“ und die beiden Seiten. Nach einem Klick auf „Installation“ erscheinen darunter „Voraussetzungen“ und „Schritte“.

Die Vorschau selbst ist nur vom eigenen Rechner aus erreichbar. Das automatische Neuladen läuft aber über Port **35729** und ist im ganzen Netzwerk offen. Starte die Vorschau deshalb nur in einem vertrauenswürdigen Netz und beende sie mit <kbd>Strg</kbd>+<kbd>C</kbd>, wenn du sie nicht mehr brauchst.

### 10. Website veröffentlichen

Einen Bauschritt gibt es nicht: Der Ordner `docs` ist die Website. Ihn kann jeder Webserver ausliefern, zum Beispiel wie in [Statische Website mit nginx](nginx-statisch.md) beschrieben. Kopiere dafür den Inhalt von `docs` in den Ordner der Website.

Die Seiten haben Adressen wie `…/#/installation`. Der Teil nach `#` wird nur im Browser ausgewertet, deshalb braucht der Webserver keine besonderen Einstellungen.

Ein Doppelklick auf `index.html` im Dateimanager reicht dagegen nicht: Der Browser öffnet die Datei dann ohne Webserver und darf die Markdown-Dateien nicht nachladen. Die Seite bleibt leer.

## Aktualisieren

### 1. Docsify auf der Website

Durch `docsify@5` in `index.html` lädt der Browser automatisch die neueste Version 5.x. Du musst dafür nichts tun. Für eine neue Hauptversion (z. B. Docsify 6) änderst du die Zahl in allen vier Zeilen mit `docsify@5`, nachdem du die Hinweise unter <https://github.com/docsifyjs/docsify/releases> gelesen hast.

### 2. docsify-cli

`npx` verwendet die Version, die es beim ersten Aufruf zwischengespeichert hat. Mit `@latest` lädt es die neueste Version.

```bash
npx docsify-cli@latest --version
```

**Prüfen:** Die Ausgabe zeigt die neue Versionsnummer, z. B. `5.0.0` oder höher.

## Deinstallieren

### 1. Projektordner löschen

Das Projekt besteht nur aus den eigenen Dateien. **Achtung:** Damit sind auch alle Seiten der Dokumentation gelöscht. Wer sie behalten will, kopiert vorher den Ordner `~/meindocsify/docs`.

```bash
rm -r ~/meindocsify
```

**Prüfen:** `ls` meldet, dass es den Ordner nicht gibt.

```bash
ls ~/meindocsify
```

### 2. npm-Zwischenspeicher leeren (optional)

npm bewahrt das vorübergehend geladene `docsify-cli` in `~/.npm` auf. Dieser Befehl leert den ganzen Speicher. Das betrifft alle Node.js-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
npm cache clean --force
```

Node.js und npm bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.
