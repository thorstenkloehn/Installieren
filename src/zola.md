# Zola

Zola ist ein Generator für statische Websites, der als ein einziges Programm ohne weitere Abhängigkeiten auskommt. Er wandelt Markdown-Dateien mit Hilfe von Vorlagen in fertiges HTML um und bringt Vorschau-Server, Sass-Übersetzung, Syntaxhervorhebung und Suchindex gleich mit.

## Vorbemerkungen

- **Warum nicht apt oder Snap:** Ubuntu 26.04 enthält kein Paket `zola`. Im Snap Store gibt es Zola nur im Testkanal `edge`, nicht als stabile Version. Diese Anleitung verwendet deshalb die fertige Programmdatei, die das Zola-Projekt auf GitHub veröffentlicht. Sie wird nach `/usr/local/bin` kopiert. Dort liegen selbst installierte Programme, getrennt von den Paketen aus apt.
- **Version:** Getestet mit Zola **0.23.6**. Steht auf der [Release-Seite](https://github.com/getzola/zola/releases/latest) eine neuere Version, ersetzt du `0.23.6` in den Befehlen durch die neue Nummer.
- **Design:** Zola bringt kein fertiges Design mit. Ohne Vorlagen zeigt die Website nur eine Willkommensseite. In dieser Anleitung legst du drei kleine Vorlagen selbst an. Fertige Designs findest du unter <https://www.getzola.org/themes/>.
- **Port:** Die Vorschau läuft auf Port **1111**, nur vom eigenen Rechner aus erreichbar.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketversionen kennt.

```bash
sudo apt update
```

### 2. curl installieren

Mit `curl` lädst du die Programmdatei herunter. Meist ist es schon installiert. Dann meldet `apt` nur, dass es bereits die neueste Version ist.

```bash
sudo apt install curl
```

### 3. Archiv herunterladen

Lädt die Linux-Version für 64-Bit-Intel/AMD-Prozessoren nach `/tmp`. `-L` folgt der Weiterleitung von GitHub zum eigentlichen Download.

```bash
curl -L -o /tmp/zola.tar.gz https://github.com/getzola/zola/releases/download/v0.23.6/zola-v0.23.6-x86_64-unknown-linux-gnu.tar.gz
```

**Prüfen:** Die Datei ist rund 16 MB groß.

```bash
ls -lh /tmp/zola.tar.gz
```

### 4. Prüfsumme kontrollieren

Die Prüfsumme zeigt, ob die Datei vollständig und unverändert angekommen ist.

```bash
sha256sum /tmp/zola.tar.gz
```

**Prüfen:** Bei Version 0.23.6 lautet die Ausgabe `8f5132b3522412d04e395e0b25f6d68613ad272a873e54a2b3ebf664873024a4`. Bei einer neueren Version vergleichst du mit dem Wert, den GitHub auf der Release-Seite unter „Assets“ neben der Datei `zola-v…-x86_64-unknown-linux-gnu.tar.gz` anzeigt (`sha256:…`).

### 5. Programm auspacken

Das Archiv enthält neben dem Programm `zola` noch Lizenztexte und Hilfedateien. Der Name `zola` am Ende sorgt dafür, dass nur das Programm nach `/usr/local/bin` ausgepackt wird.

```bash
sudo tar -xzf /tmp/zola.tar.gz -C /usr/local/bin zola
```

**Prüfen:** Die Ausgabe lautet `zola 0.23.6`.

```bash
zola --version
```

### 6. Archiv löschen

Das heruntergeladene Archiv wird nicht mehr gebraucht.

```bash
rm /tmp/zola.tar.gz
```

## Eine Website anlegen

### 7. Grundgerüst erzeugen

Legt den Ordner `~/meineseite` mit der Einstellungsdatei `zola.toml` und den leeren Ordnern `content` (Texte), `templates` (Vorlagen), `static` (Bilder und andere Dateien), `sass` und `themes` an.

```bash
zola init ~/meineseite
```

Der Assistent stellt drei Fragen. Drücke jedes Mal <kbd>Enter</kbd>, um den Vorschlag zu übernehmen:

| Frage | Eingabe |
|---|---|
| `What is the URL of your site?` | <kbd>Enter</kbd> (`https://example.com`, später änderbar) |
| `Do you want to enable Sass compilation?` | <kbd>Enter</kbd> (ja) |
| `Do you want to build a search index of the content?` | <kbd>Enter</kbd> (nein) |

**Prüfen:** Die Ausgabe enthält `Done! Your site was created in …/meineseite`.

### 8. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meineseite
```

### 9. Titel und Sprache einstellen

In `zola.toml` stehen die Einstellungen der Website.

```bash
nano zola.toml
```

Gehe in die Zeile `base_url = "https://example.com"` und drücke am Zeilenende <kbd>Enter</kbd>. Füge dort diese zwei Zeilen ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```toml
title = "Meine Website"
default_language = "de"
```

Die Zeilen müssen **oberhalb** von `[markdown]` stehen. Alles unter einer Zeile in eckigen Klammern gehört zu diesem Abschnitt. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Grundvorlage anlegen

Zola verwendet die Vorlagensprache **Tera**. In `base.html` steht das Gerüst, das alle Seiten gemeinsam haben: Kopfbereich, einfache Gestaltung und der Titel der Website als Überschrift. `{% block content %}` ist der Platz, den die anderen Vorlagen füllen.

```bash
nano templates/base.html
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```html
<!DOCTYPE html>
<html lang="{{ lang }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{% block title %}{{ config.title }}{% endblock %}</title>
  <style>
    body { max-width: 42rem; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; line-height: 1.6; }
    header a { color: inherit; text-decoration: none; }
    .datum { color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <header><h1><a href="{{ get_url(path='/') }}">{{ config.title }}</a></h1></header>
  <main>{% block content %}{% endblock %}</main>
</body>
</html>
```

### 11. Vorlage für die Startseite anlegen

Die Startseite zeigt den Begrüßungstext und darunter eine Liste aller Beiträge mit Datum.

```bash
nano templates/index.html
```

Füge diesen Inhalt ein, speichere und beende nano:

```html
{% extends "base.html" %}
{% block content %}
{{ section.content | safe }}
<ul>
{% for page in section.pages %}
  <li><a href="{{ page.permalink }}">{{ page.title }}</a> <span class="datum">{{ page.date | date(format="%d.%m.%Y") }}</span></li>
{% endfor %}
</ul>
{% endblock %}
```

- `extends "base.html"` – übernimmt das Gerüst aus Schritt 10.
- `section.pages` – alle Beiträge im Ordner `content`.
- `| safe` – gibt das aus Markdown erzeugte HTML unverändert aus, statt die spitzen Klammern zu maskieren.

### 12. Vorlage für einzelne Beiträge anlegen

Zeigt Titel, Datum und Text eines Beitrags.

```bash
nano templates/page.html
```

Füge diesen Inhalt ein, speichere und beende nano:

```html
{% extends "base.html" %}
{% block title %}{{ page.title }} – {{ config.title }}{% endblock %}
{% block content %}
<h2>{{ page.title }}</h2>
<p class="datum">{{ page.date | date(format="%d.%m.%Y") }}</p>
{{ page.content | safe }}
{% endblock %}
```

### 13. Text der Startseite anlegen

Die Datei `_index.md` (mit Unterstrich) gehört zur Startseite. Der Bereich zwischen den `+++`-Zeilen enthält Einstellungen im TOML-Format. `sort_by = "date"` sortiert die Beiträge nach Datum, die neuesten zuerst.

```bash
nano content/_index.md
```

Füge diesen Inhalt ein, speichere und beende nano:

```markdown
+++
sort_by = "date"
+++

Willkommen auf meiner Website.
```

### 14. Einen Beitrag schreiben

Jede andere Markdown-Datei in `content` ist ein Beitrag. Aus dem Dateinamen wird die Adresse, hier `/erster-beitrag/`.

```bash
nano content/erster-beitrag.md
```

Füge diesen Inhalt ein, speichere und beende nano:

```markdown
+++
title = "Mein erster Beitrag"
date = 2026-09-26
+++

Diese Seite wurde mit **Zola** gebaut.
```

### 15. Vorschau starten

`zola serve` baut die Website und startet einen kleinen Webserver. Jede gespeicherte Änderung an Texten, Vorlagen oder `zola.toml` baut die Seite sofort neu und lädt sie im Browser automatisch neu.

```bash
zola serve
```

**Prüfen:** Die Ausgabe enthält `Creating 1 pages` und `Web server is available at http://127.0.0.1:1111`. Öffne <http://localhost:1111> im Browser. Oben steht „Meine Website“, darunter der Begrüßungstext und der Beitrag mit Datum.

Beende die Vorschau mit <kbd>Strg</kbd>+<kbd>C</kbd>. Ist Port 1111 schon belegt, startest du die Vorschau mit `zola serve --port 1112`.

### 16. Website für die Veröffentlichung bauen

Trage vorher in `zola.toml` bei `base_url` die echte Adresse deiner Website ein, sonst zeigen die Links auf `example.com`. Der Befehl schreibt die fertige Website in den Ordner `public`.

```bash
zola build
```

**Prüfen:** Im Ordner `public` liegen `index.html`, `404.html`, `sitemap.xml` und der Ordner `erster-beitrag`.

```bash
ls public
```

Den Inhalt von `public` kann jeder Webserver ausliefern, zum Beispiel wie in [Statische Website mit nginx](nginx-statisch.md) beschrieben.

## Aktualisieren

### 1. Neue Version herunterladen

Ersetze `0.23.6` an beiden Stellen durch die neue Versionsnummer.

```bash
curl -L -o /tmp/zola.tar.gz https://github.com/getzola/zola/releases/download/v0.23.6/zola-v0.23.6-x86_64-unknown-linux-gnu.tar.gz
```

### 2. Prüfsumme kontrollieren

Vergleiche die Ausgabe mit dem Wert auf der Release-Seite, wie in Schritt 4 der Installation.

```bash
sha256sum /tmp/zola.tar.gz
```

### 3. Programm ersetzen

Überschreibt die alte Programmdatei. Deine Websites bleiben unverändert.

```bash
sudo tar -xzf /tmp/zola.tar.gz -C /usr/local/bin zola
```

**Prüfen:** `zola --version` zeigt die neue Versionsnummer. Lies vor dem Aktualisieren die Änderungsliste auf der Release-Seite. Neue Versionen ändern gelegentlich Einstellungen, die dann in `zola.toml` angepasst werden müssen.

### 4. Archiv löschen

```bash
rm /tmp/zola.tar.gz
```

## Deinstallieren

### 1. Programm löschen

Zola besteht nur aus dieser einen Datei.

```bash
sudo rm /usr/local/bin/zola
```

**Prüfen:** Die Ausgabe meldet, dass der Befehl bzw. die Datei nicht gefunden wurde.

```bash
zola --version
```

### 2. Website löschen (optional)

Entfernt Einstellungen, Vorlagen, Texte und die gebaute Website. **Achtung:** Wer die Texte behalten will, kopiert vorher den Ordner `~/meineseite/content`.

```bash
rm -r ~/meineseite
```

`curl` bleibt installiert, weil andere Programme und Anleitungen es ebenfalls verwenden.
