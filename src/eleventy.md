# Eleventy

Eleventy (kurz 11ty) ist ein Generator für statische Websites auf Basis von Node.js. Er macht aus Markdown-, HTML- und Vorlagendateien fertige HTML-Seiten, schreibt kein bestimmtes Design oder Framework vor und liefert standardmäßig kein JavaScript an den Browser aus.

## Vorbemerkungen

- **Kein apt-Paket:** Eleventy ist nicht in den Ubuntu-Paketquellen enthalten. Es wird nicht systemweit installiert, sondern **pro Projekt** über `npm`, den Paketmanager von Node.js. Aus den Ubuntu-Paketquellen kommen nur Node.js und npm.
- **Version:** Getestet mit Eleventy **3.1.6** und Node.js 22 aus Ubuntu 26.04. Eleventy 3 braucht Node.js 18 oder neuer.
- **Design:** Eleventy bringt kein Design mit. In dieser Anleitung legst du eine kleine Vorlage selbst an. Fertige Vorlagen für ganze Websites heißen bei Eleventy „Starter Projects“ und sind unter <https://www.11ty.dev/docs/starter/> aufgelistet.
- **Port:** Die Vorschau läuft auf Port **8080**. Ist er belegt, z. B. durch den Apache aus der [Tileserver-Anleitung](tileserver.md), weicht Eleventy von selbst auf den nächsten freien Port aus (8081, 8082 …).

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Node.js und npm kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt Eleventy aus, `npm` lädt es herunter. Das Paket `npm` bringt auch den Befehl `npx` mit, der Programme aus dem Projektordner startet. Ist beides schon vorhanden (z. B. aus der [VitePress-Anleitung](vitepress.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Ausgabe ist eine Versionsnummer ab `v18`, z. B. `v22.22.1`.

```bash
node --version
```

Hast du Node.js zusätzlich über den Versionsmanager `nvm` installiert, wird dessen Version angezeigt. Das ist in Ordnung, solange sie mindestens `v18` ist.

## Eine Website anlegen

### 3. Projektordner anlegen

In diesem Ordner liegen später Eleventy, die Vorlage und alle Texte.

```bash
mkdir ~/mein-eleventy
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/mein-eleventy
```

### 5. Projektdatei anlegen

Legt `package.json` an. Darin hält npm fest, welche Pakete das Projekt braucht. `-y` übernimmt alle Vorgaben, ohne nachzufragen.

```bash
npm init -y
```

### 6. Eleventy im Projekt installieren

Lädt Eleventy in den Ordner `node_modules` und trägt es in `package.json` ein. `-D` markiert es als Entwicklungswerkzeug: Es wird zum Bauen gebraucht, ist aber nicht Teil der fertigen Website.

```bash
npm install -D @11ty/eleventy
```

**Prüfen:** Die Ausgabe lautet `3.1.6` (oder eine neuere Nummer).

```bash
npx @11ty/eleventy --version
```

### 7. Ordner für Vorlagen anlegen

Eleventy sucht Vorlagen (Layouts) im Ordner `_includes`. Ordner und Dateien, deren Name mit `_` beginnt, werden nicht als eigene Seiten ausgegeben.

```bash
mkdir _includes
```

### 8. Vorlage anlegen

Die Vorlage ist in **Nunjucks** geschrieben, einer von mehreren Vorlagensprachen, die Eleventy versteht. Sie enthält das Gerüst, das alle Seiten gemeinsam haben. An der Stelle `{{ content | safe }}` setzt Eleventy den Inhalt der jeweiligen Seite ein, `{{ title }}` wird durch deren Titel ersetzt.

```bash
nano _includes/basis.njk
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ title }}</title>
  <style>
    body { max-width: 42rem; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; line-height: 1.6; }
    header a { color: inherit; text-decoration: none; }
    .datum { color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <header><h1><a href="/">Meine Website</a></h1></header>
  <main>
    {{ content | safe }}
  </main>
</body>
</html>
```

### 9. Ordner für Beiträge anlegen

Eleventy übernimmt die Ordnerstruktur in die Adressen. Ein Beitrag in `beitraege` ist später unter `/beitraege/…/` erreichbar.

```bash
mkdir beitraege
```

### 10. Einen Beitrag schreiben

```bash
nano beitraege/erster-beitrag.md
```

Füge diesen Inhalt ein, speichere und beende nano:

```markdown
---
layout: basis.njk
title: Mein erster Beitrag
date: 2026-09-26
tags: beitrag
---
Diese Seite wurde mit **Eleventy** gebaut.
```

Der Bereich zwischen den `---`-Zeilen heißt **Front Matter** und enthält Angaben zur Seite:

- `layout` – die Vorlage aus Schritt 8.
- `title` und `date` – Titel und Datum des Beitrags.
- `tags: beitrag` – nimmt die Seite in die Sammlung `beitrag` auf. Über diese Sammlung listet die Startseite alle Beiträge auf.

### 11. Startseite anlegen

Die Startseite ist ebenfalls eine Nunjucks-Datei. Sie geht die Sammlung `beitrag` durch und gibt zu jedem Beitrag Link und Datum aus. `reverse` dreht die Reihenfolge um, damit der neueste Beitrag oben steht.

```bash
nano index.njk
```

Füge diesen Inhalt ein, speichere und beende nano:

```html
---
layout: basis.njk
title: Meine Website
---
<p>Willkommen auf meiner Website.</p>
<ul>
{%- for beitrag in collections.beitrag | reverse %}
  <li><a href="{{ beitrag.url }}">{{ beitrag.data.title }}</a> <span class="datum">{{ beitrag.date.toLocaleDateString("de-DE") }}</span></li>
{%- endfor %}
</ul>
```

### 12. Website bauen

Eleventy liest alle passenden Dateien im Projektordner und schreibt die fertige Website in den Ordner `_site`. Den Ordner `node_modules` lässt es dabei von selbst aus.

```bash
npx @11ty/eleventy
```

**Prüfen:** Die Ausgabe endet mit `Wrote 2 files`. In `_site` liegen `index.html` und `beitraege/erster-beitrag/index.html`.

```bash
find _site -type f
```

### 13. Vorschau starten

`--serve` baut die Website, startet einen kleinen Webserver und baut bei jeder gespeicherten Änderung neu. Der Browser lädt die Seite dann automatisch neu.

```bash
npx @11ty/eleventy --serve
```

**Prüfen:** Die Ausgabe endet mit `Server at http://localhost:8080/` (oder einem anderen Port, siehe Vorbemerkungen). Öffne diese Adresse im Browser. Oben steht „Meine Website“, darunter der Begrüßungstext und der Beitrag mit Datum.

Beende die Vorschau mit <kbd>Strg</kbd>+<kbd>C</kbd>.

Den Inhalt von `_site` kann jeder Webserver ausliefern, zum Beispiel wie in [Statische Website mit nginx](nginx-statisch.md) beschrieben.

## Aktualisieren

### 1. In den Projektordner wechseln

```bash
cd ~/mein-eleventy
```

### 2. Neue Version installieren

`@latest` holt die neueste Version, auch wenn sich die erste Stelle der Versionsnummer ändert. Vorlage und Texte bleiben erhalten. Lies vor einem Sprung auf eine neue Hauptversion die Hinweise unter <https://www.11ty.dev/blog/>.

```bash
npm install -D @11ty/eleventy@latest
```

**Prüfen:** `npx @11ty/eleventy --version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Projektordner löschen

Eleventy steckt nur im Ordner `node_modules` des Projekts. Mit dem Projektordner verschwinden Eleventy, Vorlage, Texte und die gebaute Website. **Achtung:** Wer die Texte behalten will, kopiert vorher die Markdown-Dateien.

```bash
rm -r ~/mein-eleventy
```

**Prüfen:** Der Ordner ist verschwunden.

```bash
ls ~/mein-eleventy
```

### 2. npm-Zwischenspeicher leeren (optional)

npm bewahrt heruntergeladene Pakete in `~/.npm` auf, damit spätere Installationen schneller gehen. Dieser Befehl leert den Speicher und betrifft alle Node.js-Projekte, die dann beim nächsten Mal wieder aus dem Internet laden.

```bash
npm cache clean --force
```

Node.js und npm bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.
