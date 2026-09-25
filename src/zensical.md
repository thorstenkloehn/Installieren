# Zensical

Zensical ist ein Generator für statische Websites, der aus Markdown-Dateien eine fertige Dokumentations-Website mit Suche, Navigation und hellem und dunklem Design baut. Er stammt von den Entwicklern von Material for MkDocs, ist teilweise in Rust geschrieben und baut deshalb sehr schnell. Vorhandene MkDocs-Projekte kann er direkt übernehmen.

## Vorbemerkungen

- **Keine Installation über apt:** Ubuntu hat kein Paket für Zensical. Es wird als Python-Programm mit `pipx` installiert, wie es die Anleitung [Python](python.md) für Kommandozeilenprogramme empfiehlt. `pipx` legt dafür automatisch eine eigene virtuelle Umgebung an, sodass Zensical nichts an der Python-Installation von Ubuntu ändert.
- **Version:** Getestet mit Zensical **0.0.65** und Python 3.14 unter Ubuntu 26.04. Zensical ist noch jung: Einstellungen und Befehle können sich zwischen Versionen ändern.
- **Verhältnis zu MkDocs:** Zensical liest seine Einstellungen aus `zensical.toml`, versteht aber auch die `mkdocs.yml` eines vorhandenen [MkDocs](mkdocs.md)-Projekts.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von `pipx` kennt.

```bash
sudo apt update
```

### 2. pipx installieren

`pipx` installiert Python-Programme jeweils in eine eigene virtuelle Umgebung und macht ihren Befehl trotzdem überall verfügbar.

```bash
sudo apt install pipx
```

**Prüfen:** Die Versionsnummer erscheint, z. B. `1.8.0`.

```bash
pipx --version
```

### 3. Zensical installieren

Lädt Zensical von <https://pypi.org> und legt den Befehl `zensical` in `~/.local/bin` ab.

```bash
pipx install zensical
```

**Prüfen:** Die Versionsnummer erscheint, z. B. `0.0.65`.

```bash
zensical --version
```

Meldet das Terminal `zensical: Kommando nicht gefunden`, fehlt `~/.local/bin` im Suchpfad. `pipx ensurepath` trägt den Ordner ein. Danach ein neues Terminal öffnen.

## Erstes Projekt

### 4. Projekt anlegen

Legt den Ordner `~/zensical-test` mit einer Beispielseite, einer Einstellungsdatei und einer Vorlage für die automatische Veröffentlichung auf GitHub Pages an.

```bash
zensical new ~/zensical-test
```

### 5. In den Projektordner wechseln

Alle weiteren Befehle arbeiten im Projektordner.

```bash
cd ~/zensical-test
```

**Prüfen:** Der Ordner enthält `zensical.toml` und den Ordner `docs` mit `index.md` und `markdown.md`. Der versteckte Ordner `.github` enthält die Vorlage für GitHub Pages.

```bash
ls -A
```

### 6. Einstellungsdatei schreiben

Die mitgelieferte `zensical.toml` ist englisch und enthält viele Beispiele. Diese Fassung ist kürzer und stellt die Oberfläche auf Deutsch um.

```bash
nano zensical.toml
```

Lösche den bisherigen Inhalt: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles aus. Füge dann diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```toml
[project]
site_name = "Meine Dokumentation"
site_url = "http://localhost:8000/"
nav = [
  { "Start" = "index.md" },
  { "Erste Seite" = "erste-seite.md" },
]

[project.theme]
language = "de"
features = [
  "content.code.copy",
  "navigation.footer",
  "search.highlight",
]

[[project.theme.palette]]
media = "(prefers-color-scheme: light)"
scheme = "default"
toggle.icon = "lucide/moon"
toggle.name = "Dunkles Design"

[[project.theme.palette]]
media = "(prefers-color-scheme: dark)"
scheme = "slate"
toggle.icon = "lucide/sun"
toggle.name = "Helles Design"
```

Was die Einträge bedeuten:

- `site_name` – der Name der Website, er steht oben links und im Titel jeder Seite.
- `site_url` – die spätere Adresse der Website. Zensical braucht sie z. B. für die Sitemap.
- `nav` – die Navigation: links der angezeigte Name, rechts die Datei im Ordner `docs`.
- `language = "de"` – Suche, Schaltflächen und Hinweise erscheinen auf Deutsch.
- `features` – Zusatzfunktionen. `content.code.copy` setzt eine Kopier-Schaltfläche an jeden Codeblock, `navigation.footer` zeigt unten Links zur vorigen und nächsten Seite, `search.highlight` hebt Suchbegriffe hervor.
- `[[project.theme.palette]]` – ein helles und ein dunkles Design. Welches zuerst gilt, richtet sich nach der Einstellung des Betriebssystems. Über das Symbol oben rechts lässt sich umschalten.

### 7. Nicht mehr benötigte Beispielseite löschen

Die Datei `markdown.md` steht nicht mehr in der Navigation. Zensical würde sie trotzdem mit ausgeben.

```bash
rm docs/markdown.md
```

### 8. Eine neue Seite anlegen

Legt die Seite an, die in `nav` als „Erste Seite“ eingetragen ist.

```bash
nano docs/erste-seite.md
```

Füge diesen Inhalt ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

````markdown
# Erste Seite

Das ist meine **erste Seite** mit Zensical.

```bash
zensical build
```
````

### 9. Vorschau starten

Baut die Website und stellt sie unter <http://localhost:8000> bereit. Speicherst du eine Datei im Ordner `docs`, baut Zensical die Seite neu. Nach dem Neuladen im Browser ist die Änderung zu sehen.

```bash
zensical serve
```

**Prüfen:** Im Terminal steht `Serving /home/…/zensical-test/site on http://localhost:8000`. Im Browser zeigt <http://localhost:8000/erste-seite/> die neue Seite. Über dem Codeblock erscheint beim Darüberfahren die Schaltfläche **In Zwischenablage kopieren**.

### 10. Vorschau beenden

Drücke im Terminal <kbd>Strg</kbd>+<kbd>C</kbd>. Die Vorschau hört auf, der Ordner bleibt unverändert.

### 11. Fertige Website bauen

Erzeugt die fertige Website im Ordner `site`. Diesen Ordner kann man auf jeden Webserver kopieren, z. B. nach [nginx](nginx-statisch.md), oder mit [gh-pages](gh-pages.md) veröffentlichen. `--strict` bricht bei Warnungen ab, etwa bei Links auf Seiten, die es nicht gibt.

```bash
zensical build --strict
```

**Prüfen:** Die Ausgabe endet mit `Build finished in …`, und die Startseite ist vorhanden.

```bash
ls site/index.html
```

## Vorhandenes MkDocs-Projekt bauen (optional)

### 12. MkDocs-Projekt mit Zensical bauen

Wechsle in ein Projekt, das eine `mkdocs.yml` hat, z. B. aus der Anleitung [MkDocs](mkdocs.md). `-f` sagt Zensical, welche Einstellungsdatei es lesen soll. Das Ergebnis landet wie bei MkDocs im Ordner `site`.

```bash
zensical build -f mkdocs.yml
```

**Prüfen:** Die Ausgabe endet mit `Build finished in …`. Zensical unterstützt noch nicht alle Erweiterungen von MkDocs. Meldet es Probleme, hilft die Seite <https://zensical.org/docs/compatibility/mkdocs/>.

## Aktualisieren

### 1. Neue Version installieren

`pipx` aktualisiert Zensical in seiner eigenen Umgebung.

```bash
pipx upgrade zensical
```

**Prüfen:** `zensical --version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Testprojekt entfernen

Löscht den Beispielordner samt gebauter Website.

```bash
rm -rf ~/zensical-test
```

### 2. Zensical entfernen

Entfernt Zensical samt seiner virtuellen Umgebung.

```bash
pipx uninstall zensical
```

**Prüfen:** Der Befehl `zensical` wird nicht mehr gefunden.

```bash
zensical --version
```

### 3. pipx entfernen (optional)

Nur ausführen, wenn du keine anderen Programme mit `pipx` installiert hast. `pipx list` zeigt, welche es gibt.

```bash
sudo apt purge pipx
```

```bash
sudo apt autoremove
```
