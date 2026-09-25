# Jekyll

Jekyll ist ein Generator für statische Websites: Aus Markdown-Dateien, Vorlagen und einer Einstellungsdatei baut er fertige HTML-Seiten, die jeder Webserver ohne Datenbank und ohne Programmiersprache ausliefern kann. Jekyll steckt auch hinter GitHub Pages und eignet sich für Blogs, Projektseiten und Dokumentationen.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 enthält Jekyll in der aktuellen Version **4.4.1**. Die Anleitung installiert Jekyll deshalb vollständig über `apt`. Das Standard-Design `minima` und die Plugins für den Feed und für Suchmaschinen-Angaben kommen als empfohlene Pakete automatisch mit. Ruby-Pakete aus dem Internet (Gems) sind für die Beispielseite nicht nötig.
- **Version:** Getestet mit Jekyll 4.4.1, Ruby aus Ubuntu 26.04 und dem Design minima 2.5.1.
- **Port:** Die Vorschau läuft auf Port **4000**, nur vom eigenen Rechner aus erreichbar.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von Jekyll kennt.

```bash
sudo apt update
```

### 2. Jekyll installieren

Installiert Jekyll mit Ruby, dem Design `minima` und den Plugins `jekyll-feed` und `jekyll-seo-tag` (zusammen etwa 60 Pakete).

```bash
sudo apt install jekyll
```

**Prüfen:** Die Ausgabe lautet `jekyll 4.4.1`.

```bash
jekyll --version
```

## Eine Website anlegen

### 3. Neue Website erzeugen

Legt den Ordner `~/meineseite` mit einer Beispielseite an: Startseite, Seite „About“, ein Beispielbeitrag und die Einstellungsdatei `_config.yml`. Jekyll ruft dabei `bundle install` auf. Bundler prüft, ob alle benötigten Ruby-Pakete vorhanden sind, und findet sie in den apt-Paketen aus Schritt 2.

```bash
jekyll new ~/meineseite
```

**Prüfen:** Die Ausgabe endet mit `New jekyll site installed in …/meineseite.` Die Zeile davor lautet `Bundle complete!`.

### 4. In den Ordner der Website wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meineseite
```

### 5. Einstellungen anpassen

In `_config.yml` stehen Titel, Beschreibung, Sprache und Design der Website. Die Beispieldatei enthält englische Platzhalter.

```bash
nano _config.yml
```

Ersetze den gesamten Inhalt: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> löscht alles Markierte. Füge dann diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```yaml
title: Meine Wissensseite
description: Notizen und Anleitungen, gebaut mit Jekyll.
lang: de
baseurl: ""
url: ""
theme: minima
plugins:
  - jekyll-feed
```

- `title` und `description` erscheinen im Kopf der Seiten und im Feed.
- `lang: de` kennzeichnet die Seiten als deutsch. Das hilft Screenreadern und Suchmaschinen.
- `theme: minima` ist das Design, `jekyll-feed` erzeugt die Datei `feed.xml` für Feed-Reader.

Jekyll liest `_config.yml` nur beim Start. Nach Änderungen an dieser Datei musst du die Vorschau aus Schritt 7 neu starten.

### 6. Einen Beitrag schreiben

Beiträge liegen im Ordner `_posts`. Der Dateiname muss mit dem Datum im Format `JJJJ-MM-TT` beginnen. Verwende das heutige Datum, denn Beiträge mit einem Datum in der Zukunft lässt Jekyll beim Bauen weg.

```bash
nano _posts/2026-09-26-erster-beitrag.md
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```markdown
---
layout: post
title: "Mein erster Beitrag"
---
Diese Seite wurde mit **Jekyll** gebaut.

- Beiträge liegen im Ordner `_posts`.
- Der Dateiname beginnt mit dem Datum.
```

Der Block zwischen den beiden `---`-Zeilen heißt **Front Matter**. Er sagt Jekyll, welche Vorlage (`layout`) und welchen Titel die Seite bekommt. Darunter folgt normales Markdown.

### 7. Vorschau starten

Baut die Website und startet einen kleinen Webserver. Jekyll beobachtet den Ordner und baut die Seiten bei jeder gespeicherten Änderung neu.

```bash
jekyll serve
```

**Prüfen:** Die Ausgabe enthält `Server address: http://127.0.0.1:4000/`. Öffne <http://localhost:4000> im Browser. Oben steht „Meine Wissensseite“, darunter ist „Mein erster Beitrag“ aufgelistet.

Beende die Vorschau mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 8. Website für die Veröffentlichung bauen

Erzeugt die fertige Website im Ordner `_site`, ohne einen Server zu starten.

```bash
jekyll build
```

**Prüfen:** Der Ordner `_site` enthält unter anderem `index.html` und `feed.xml`.

```bash
ls _site
```

Den Inhalt von `_site` kann jeder Webserver ausliefern. Wie das mit nginx geht, zeigt [Statische Website mit nginx](nginx-statisch.md). Kopiere dafür den Inhalt von `_site` in den dort verwendeten Ordner `/var/www/start.de/html`.

## Aktualisieren

Jekyll, das Design und die Plugins werden mit den normalen Systemaktualisierungen erneuert:

```bash
sudo apt update && sudo apt upgrade
```

## Deinstallieren

### 1. Jekyll entfernen

`purge` entfernt das Programm samt seiner Systemdateien.

```bash
sudo apt purge jekyll
```

### 2. Nicht mehr benötigte Pakete entfernen

Entfernt Ruby, das Design und die Plugins, die mit Jekyll installiert wurden, sofern kein anderes Programm sie braucht. Lies vor dem Bestätigen die Liste.

```bash
sudo apt autoremove --purge
```

### 3. Beispielseite löschen

**Achtung:** Damit sind auch deine Beiträge weg. Wer sie behalten will, kopiert vorher den Ordner `~/meineseite/_posts`.

```bash
rm -r ~/meineseite
```

**Prüfen:** Der Befehl `jekyll` wird nicht mehr gefunden.

```bash
jekyll --version
```
