# Hexo

Hexo ist ein Blog-Generator auf Basis von Node.js. Er macht aus Beiträgen in Markdown einen fertigen statischen Blog mit Archiv, Schlagwörtern und Kategorien und bringt dafür das Design „landscape“ gleich mit.

## Vorbemerkungen

- **Kein apt-Paket:** Hexo ist nicht in den Ubuntu-Paketquellen enthalten. Es wird **pro Projekt** über `npm`, den Paketmanager von Node.js, installiert. Aus den Ubuntu-Paketquellen kommen nur Node.js, npm und Git.
- **Ohne globale Installation:** Viele Anleitungen installieren das Hilfsprogramm `hexo-cli` mit `sudo npm install -g` systemweit. Das ist nicht nötig. Hier wird es mit `npx` nur einmal zum Anlegen des Projekts geladen, danach steckt Hexo im Projektordner.
- **Version:** Getestet mit Hexo **8.1.2** und hexo-cli 4.3.2 unter Node.js 22 aus Ubuntu 26.04. Hexo 8 braucht Node.js 20.19 oder neuer.
- **Port:** Die Vorschau läuft auf Port **4000**, nur vom eigenen Rechner aus erreichbar.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Node.js, npm und Git kennt.

```bash
sudo apt update
```

### 2. Node.js, npm und Git installieren

Node.js führt Hexo aus, `npm` lädt es herunter und bringt den Befehl `npx` mit. Git braucht Hexo, um die Projektvorlage herunterzuladen. Ist alles schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install nodejs npm git
```

**Prüfen:** Die Ausgabe ist eine Versionsnummer ab `v20.19`, z. B. `v22.22.1`.

```bash
node --version
```

Hast du Node.js zusätzlich über den Versionsmanager `nvm` installiert, wird dessen Version angezeigt. Das ist in Ordnung, solange sie mindestens `v20.19` ist.

## Einen Blog anlegen

### 3. Projekt erzeugen

`npx` lädt `hexo-cli` vorübergehend herunter und führt es aus. `init` legt den Ordner `~/meinhexo` an, lädt die offizielle Projektvorlage hinein und installiert Hexo samt Design in den Unterordner `node_modules`. Das dauert etwa eine Minute.

```bash
npx hexo-cli init ~/meinhexo
```

Die Frage `Need to install the following packages: hexo-cli … Ok to proceed? (y)` beantwortest du mit <kbd>Enter</kbd>.

**Prüfen:** Die Ausgabe endet mit `INFO  Start blogging with Hexo!`. Hinweise von npm auf eine neuere npm-Version kannst du ignorieren.

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt. `npx hexo` startet dann immer das Hexo aus diesem Projekt.

```bash
cd ~/meinhexo
```

**Prüfen:** Die Ausgabe beginnt mit `hexo: 8.1.2` (oder einer neueren Nummer).

```bash
npx hexo version
```

### 5. Titel, Sprache und Zeitzone einstellen

In `_config.yml` stehen die Einstellungen des Blogs im YAML-Format.

```bash
nano _config.yml
```

Ändere im Abschnitt `# Site` oben in der Datei diese vier Zeilen. Wichtig: Nach dem Doppelpunkt steht immer ein Leerzeichen.

```yaml
title: Meine Website
author: Dein Name
language: de
timezone: Europe/Berlin
```

- `language: de` – das Design beschriftet Menüs und Links auf Deutsch, z. B. „Archiv“.
- `timezone` – bestimmt, zu welcher Uhrzeit ein Beitrag als veröffentlicht gilt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Beispielbeitrag löschen

Die Vorlage enthält einen englischen Beitrag „Hello World“, der nicht gebraucht wird.

```bash
rm source/_posts/hello-world.md
```

### 7. Einen Beitrag anlegen

Legt im Ordner `source/_posts` eine neue Markdown-Datei mit Titel und aktuellem Datum an. Den Dateinamen bildet Hexo aus dem Titel.

```bash
npx hexo new "Mein erster Beitrag"
```

**Prüfen:** Die Ausgabe endet mit `Created: …/source/_posts/Mein-erster-Beitrag.md`.

### 8. Beitrag schreiben

```bash
nano source/_posts/Mein-erster-Beitrag.md
```

Oben zwischen den `---`-Zeilen stehen die Angaben zum Beitrag (Front Matter). Ergänze die Zeile `tags:` zu `tags: [hexo, blog]`. Schreibe unter die zweite `---`-Zeile deinen Text, zum Beispiel:

```markdown
Diese Seite wurde mit **Hexo** gebaut.
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Vorschau starten

`server` startet einen kleinen Webserver und baut jede gespeicherte Änderung an Beiträgen sofort ein. `-i 127.0.0.1` beschränkt ihn auf den eigenen Rechner, sonst wäre er im ganzen Netzwerk erreichbar.

```bash
npx hexo server -i 127.0.0.1
```

**Prüfen:** Die Ausgabe enthält `Hexo is running at http://127.0.0.1:4000/`. Öffne <http://localhost:4000> im Browser. Oben steht „Meine Website“, darunter der Beitrag mit Datum und Schlagwörtern.

Beende die Vorschau mit <kbd>Strg</kbd>+<kbd>C</kbd>. Ist Port 4000 schon belegt, hängst du `-p 4001` an den Befehl an.

### 10. Website bauen

Schreibt die fertige Website in den Ordner `public`. Trage vorher in `_config.yml` bei `url:` die echte Adresse deines Blogs ein, sonst zeigen einige Links auf `example.com`.

```bash
npx hexo generate
```

**Prüfen:** Die Ausgabe endet mit `files generated in …`. Im Ordner `public` liegen unter anderem `index.html`, `archives` und `tags`.

```bash
ls public
```

Den Inhalt von `public` kann jeder Webserver ausliefern, zum Beispiel wie in [Statische Website mit nginx](nginx-statisch.md) beschrieben.

Werden gelöschte Beiträge oder geänderte Einstellungen einmal nicht übernommen, löscht `npx hexo clean` den Ordner `public` und den Zwischenspeicher. Danach baust du neu.

## Aktualisieren

### 1. In den Projektordner wechseln

```bash
cd ~/meinhexo
```

### 2. Veraltete Pakete anzeigen

Listet Hexo und seine Erweiterungen auf, für die es neuere Versionen gibt.

```bash
npm outdated
```

### 3. Pakete aktualisieren

Aktualisiert alle Pakete innerhalb ihrer Hauptversion. Beiträge und Einstellungen bleiben erhalten. Für einen Sprung auf eine neue Hauptversion (z. B. Hexo 9) lies vorher die Hinweise unter <https://github.com/hexojs/hexo/releases> und installiere sie gezielt mit `npm install hexo@latest`.

```bash
npm update
```

**Prüfen:** `npx hexo version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Projektordner löschen

Hexo steckt nur im Ordner `node_modules` des Projekts. Mit dem Projektordner verschwinden Hexo, Design, Einstellungen, Beiträge und die gebaute Website. **Achtung:** Wer die Beiträge behalten will, kopiert vorher den Ordner `~/meinhexo/source/_posts`.

```bash
rm -r ~/meinhexo
```

**Prüfen:** Der Ordner ist verschwunden.

```bash
ls ~/meinhexo
```

### 2. npm-Zwischenspeicher leeren (optional)

npm bewahrt heruntergeladene Pakete, auch das vorübergehend geladene `hexo-cli`, in `~/.npm` auf. Dieser Befehl leert den Speicher und betrifft alle Node.js-Projekte, die dann beim nächsten Mal wieder aus dem Internet laden.

```bash
npm cache clean --force
```

Node.js, npm und Git bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.
