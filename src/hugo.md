# Hugo

Hugo ist ein sehr schneller Generator für statische Webseiten. Nach dem Prinzip „Docs as Code“ liegt die Dokumentation als Markdown im Git-Repository, wird wie Quellcode versioniert und geprüft und von Hugo zu einer Webseite mit Navigation und Suche gebaut.

## Vorbemerkungen

- **Docs as Code:** Die Texte werden mit denselben Werkzeugen gepflegt wie Programmcode: Texteditor, Git, Commits und Prüfungen vor dem Einchecken. Hugo übernimmt dabei zwei Aufgaben: Es baut die Webseite und es bricht den Bau ab, wenn z. B. ein interner Link ins Leere zeigt.
- **Installation über apt:** Ubuntu liefert Hugo in der Variante „extended“ aus (Version 0.154). Diese Variante kann auch SCSS verarbeiten, was viele Designs voraussetzen.
- **Design (Theme):** Hugo bringt kein fertiges Design mit. Diese Anleitung verwendet **Hugo Book**, ein schlichtes Design für Dokumentationen mit Seitenleiste, Suche und „Bearbeiten“-Link. Die neuesten Versionen von Hugo Book verlangen Hugo 0.158 oder neuer. Deshalb wird hier die Version `v13` fest eingestellt, die mit der Hugo-Version aus Ubuntu funktioniert.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketversionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Hugo und Git installieren

Installiert den Befehl `hugo` und Git. Git wird für die Versionsverwaltung der Texte und zum Einbinden des Designs gebraucht.

```bash
sudo apt install hugo git
```

**Prüfen:** Die Ausgabe beginnt mit `hugo v0.154.5+extended`. Wichtig ist das Wort `extended`.

```bash
hugo version
```

## Dokumentationsprojekt anlegen

### 3. Neues Projekt erzeugen

Legt den Ordner `~/hugo-docs` mit der Grundstruktur eines Hugo-Projekts an. `--format yaml` sorgt dafür, dass die Einstellungsdatei `hugo.yaml` heißt und im YAML-Format geschrieben ist.

```bash
hugo new site ~/hugo-docs --format yaml
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/hugo-docs
```

**Prüfen:** Es werden unter anderem `content`, `themes` und `hugo.yaml` angezeigt.

```bash
ls
```

### 5. Git-Repository anlegen

Macht den Ordner zu einem Git-Repository mit dem Hauptzweig `main`. Ab jetzt wird jede Änderung an der Dokumentation nachvollziehbar gespeichert.

```bash
git init -b main
```

### 6. Erzeugte Dateien von Git ausschließen

Die fertige Webseite (`public/`) und Zwischenergebnisse entstehen bei jedem Bau neu. Sie gehören deshalb nicht ins Repository, nur die Quelltexte.

```bash
nano .gitignore
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
public/
resources/_gen/
.hugo_build.lock
```

### 7. Design als Git-Submodul einbinden

Lädt Hugo Book in den Ordner `themes/hugo-book`. Als Submodul merkt sich das Repository nur, welche Version des Designs verwendet wird, statt alle Dateien selbst zu speichern.

```bash
git submodule add https://github.com/alex-shpak/hugo-book themes/hugo-book
```

### 8. Passende Design-Version einstellen

Stellt das Design auf die Version `v13`, die zu Hugo 0.154 passt (siehe Vorbemerkungen).

```bash
git -C themes/hugo-book checkout v13
```

Git meldet dabei einen „losgelösten HEAD“ (detached HEAD). Das ist hier gewollt: Das Design soll auf genau dieser Version stehen bleiben.

**Prüfen:** Die Ausgabe zeigt `v13`.

```bash
git -C themes/hugo-book describe --tags
```

### 9. Einstellungsdatei schreiben

Ersetzt den Inhalt von `hugo.yaml`. Die Einstellungen bewirken Folgendes:

- `languageCode` und `defaultContentLanguage` – die Seite ist deutschsprachig
- `theme` – verwendet das Design aus Schritt 7
- `enableGitInfo` – übernimmt das Datum der letzten Änderung jeder Seite aus der Git-Historie
- `BookSection` – der Ordner `content/docs` erscheint als Navigation in der Seitenleiste
- `BookRepo` und `BookEditLink` – jede Seite bekommt einen Link, der direkt zur Datei im Online-Repository führt; die Adresse später durch die eigene ersetzen

```bash
nano hugo.yaml
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```yaml
baseURL: https://example.org/
languageCode: de
defaultContentLanguage: de
title: Meine Dokumentation
theme: hugo-book
enableGitInfo: true

params:
  BookSection: docs
  BookRepo: https://github.com/beispiel/hugo-docs
  BookEditLink: '{{ .Site.Params.BookRepo }}/edit/main/{{ .Path }}'
```

### 10. Grundgerüst einchecken

Speichert den bisherigen Stand als ersten Commit. Das ist schon jetzt nötig: Wegen `enableGitInfo` liest Hugo die Git-Historie und bricht ab, solange das Repository noch gar keinen Commit hat.

```bash
git add .
```

```bash
git commit -m "Hugo-Projekt mit Design Hugo Book angelegt"
```

**Prüfen:** `git log --oneline` zeigt den Commit an.

```bash
git log --oneline
```

## Inhalte schreiben

### 11. Startseite anlegen

Die Datei `content/_index.md` wird zur Startseite. Der Link darin verwendet `relref`: Hugo sucht die Zielseite beim Bauen und meldet einen Fehler, falls es sie nicht gibt.

```bash
nano content/_index.md
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```markdown
---
title: Start
---

# Willkommen

Hier beginnt die Dokumentation. Weiter geht es mit der
[Installation]({{< relref "docs/installation" >}}).
```

### 12. Erste Dokumentationsseite erzeugen

`hugo new content` legt die Datei `content/docs/installation.md` mit einem vorbereiteten Kopfbereich an. Das Design liefert dafür eine eigene Vorlage mit allen Einstellungen, die eine Seite haben kann.

```bash
hugo new content docs/installation.md
```

**Prüfen:** Der Kopfbereich zwischen den beiden `---` enthält `title: "Installation"`.

```bash
cat content/docs/installation.md
```

### 13. Text der Seite ergänzen

Hängt einen Hinweiskasten und einen Codeblock an. Der Hinweiskasten nutzt die Markdown-Schreibweise `> [!NOTE]`, die auch GitHub und GitLab darstellen.

```bash
nano content/docs/installation.md
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei und füge diesen Text an (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

~~~markdown

# Installation

> [!NOTE]
> Diese Seite liegt im Git-Repository und wird wie Code geprüft.

```bash
echo "Hallo Hugo"
```
~~~

### 14. Vorschau starten

`hugo server` baut die Seite im Arbeitsspeicher und startet einen kleinen Webserver. Jede gespeicherte Änderung erscheint sofort im Browser. Das Terminal bleibt belegt, öffne für die nächsten Schritte ein zweites Terminal (ebenfalls im Ordner `~/hugo-docs`).

```bash
hugo server
```

**Prüfen:** Im Terminal steht `Web Server is available at http://localhost:1313/`. Unter <http://localhost:1313> erscheint die Startseite, links die Navigation mit „Installation“ und darüber ein Suchfeld.

### 15. Vorschau beenden

Beendet den Webserver aus Schritt 14. Wechsle dazu in dessen Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

## Prüfen wie Code

### 16. Automatische Prüfung vor jedem Commit einrichten

Ein Git-Hook ist ein Skript, das Git bei bestimmten Aktionen selbst startet. Dieser Hook baut die Seite vor jedem Commit testweise im Arbeitsspeicher. `--panicOnWarning` wertet schon Warnungen als Fehler. Scheitert der Bau, z. B. wegen eines Links auf eine nicht vorhandene Seite, bricht Git den Commit ab.

```bash
nano .git/hooks/pre-commit
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```bash
#!/bin/sh
# Vor jedem Commit die Seite testweise bauen
hugo build --panicOnWarning --renderToMemory --logLevel error
```

### 17. Hook ausführbar machen

Git startet nur Hooks, die als ausführbar markiert sind.

```bash
chmod +x .git/hooks/pre-commit
```

### 18. Inhalte einchecken

Merkt die neuen Seiten für den Commit vor und speichert sie. Dabei läuft der Hook aus Schritt 16 zum ersten Mal.

```bash
git add .
```

```bash
git commit -m "Startseite und Installationsseite ergänzt"
```

**Prüfen:** Der Commit wird angelegt, und `git log --oneline` zeigt jetzt zwei Commits.

```bash
git log --oneline
```

**Gegenprobe (optional):** Ändere in `content/_index.md` das Linkziel `docs/installation` in `docs/fehlt` und versuche erneut einen Commit. Hugo meldet `REF_NOT_FOUND`, und der Commit wird nicht angelegt. Danach die Änderung wieder rückgängig machen.

### 19. Fertige Webseite bauen

Erzeugt die fertige Webseite im Ordner `public`. `--minify` verkleinert HTML, CSS und JavaScript. Den Ordner `public` kannst du auf einen beliebigen Webserver hochladen, z. B. nach `/var/www/...` auf einem Server mit [nginx](nginx.md).

```bash
hugo build --minify --panicOnWarning
```

**Prüfen:** Die Ausgabe endet mit `Total in … ms` ohne `ERROR`, und die Seite liegt als HTML-Datei vor.

```bash
ls public/docs/installation/index.html
```

## Projekt auf einem anderen Rechner weiterbearbeiten

Wird das Repository später geklont, muss das Design (Submodul) mitgeladen werden. Dafür gibt es die Option `--recurse-submodules`:

```bash
git clone --recurse-submodules <adresse-des-repositorys>
```

## Deinstallieren

### 1. Testprojekt entfernen

Löscht den Beispielordner aus Schritt 3. **Achtung:** Alles in `~/hugo-docs` geht verloren, auch die Git-Historie.

```bash
rm -rf ~/hugo-docs
```

### 2. Hugo entfernen

`purge` entfernt auch die Konfigurationsdateien des Pakets. Git bleibt installiert, weil es meist auch für andere Zwecke gebraucht wird.

```bash
sudo apt purge hugo
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten, die nur für Hugo installiert wurden, z. B. `libsass1`.

```bash
sudo apt autoremove
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
hugo version
```
