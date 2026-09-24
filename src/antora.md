# Antora

Antora ist ein statischer Webseitengenerator für umfangreiche Software- und Systemdokumentationen auf Basis von AsciiDoc. Auf dem Entwicklungsrechner dient es dazu, strukturierte Dokumentationen aus einem oder mehreren Git-Repositories lokal zu einer durchsuchbaren Webseite zusammenzuführen und zu testen.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketdaten aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Node.js, npm und Git installieren

Antora basiert auf Node.js und setzt Git voraus, um Dokumentationsinhalte aus Repositories einzulesen.

```bash
sudo apt install -y nodejs npm git
```

**Prüfen:** Die installierte Version von Node.js wird angezeigt.

```bash
node -v
```

### 3. Antora CLI und Site Generator installieren

Installiert das Antora-Befehlszeilenwerkzeug (`@antora/cli`) und den Webseitengenerator (`@antora/site-generator`) global über den Node-Paketmanager `npm`.

```bash
sudo npm install -g @antora/cli @antora/site-generator
```

*(Hinweis: Falls du Node.js über nvm im Benutzerverzeichnis verwendest, führe den Befehl ohne `sudo` aus).*

**Prüfen:** Die installierten Versionsnummern von Antora werden angezeigt.

```bash
antora -v
```

## Beispiel-Dokumentation erstellen und testen

### 4. Projektverzeichnis anlegen

Erstellt die von Antora erwartete Standard-Ordnerstruktur für ein Modul.

```bash
mkdir -p ~/antora-demo/docs/modules/ROOT/pages
```

### 5. Komponenten-Konfiguration anlegen

Definiert den Namen, die Versionsbezeichnung und den Titel der Dokumentationskomponente in `docs/antora.yml`.

```bash
nano ~/antora-demo/docs/antora.yml
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```yaml
name: handbuch
title: Entwickler-Handbuch
version: '1.0'
start_page: index.adoc
nav:
  - modules/ROOT/nav.adoc
```

### 6. Navigationsdatei anlegen

Erstellt die Navigation für die linke Seitenleiste in `docs/modules/ROOT/nav.adoc`.

```bash
nano ~/antora-demo/docs/modules/ROOT/nav.adoc
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```asciidoc
* xref:index.adoc[Startseite]
```

### 7. Startseite in AsciiDoc verfassen

Erstellt den eigentlichen Inhalt der Einstiegsseite in `docs/modules/ROOT/pages/index.adoc`.

```bash
nano ~/antora-demo/docs/modules/ROOT/pages/index.adoc
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```asciidoc
= Willkommen im Entwickler-Handbuch

Dies ist eine lokale Dokumentationsseite, die mit Antora und AsciiDoc erstellt wurde.

== Erste Schritte

* Dokumentation im AsciiDoc-Format schreiben
* Änderungen mit Git versionieren
* Mit Antora zur fertigen Webseite bauen
```

### 8. Playbook-Konfiguration anlegen

Das Playbook `antora-playbook.yml` steuert den Bauprozess, bindet Inhaltsquellen ein und legt das Standard-Design fest.

```bash
nano ~/antora-demo/antora-playbook.yml
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```yaml
site:
  title: Mein Dokumentationsportal
  start_page: handbuch::index.adoc
content:
  sources:
    - url: .
      branches: HEAD
      start_path: docs
ui:
  bundle:
    url: https://gitlab.com/antora/antora-ui-default/-/jobs/artifacts/HEAD/raw/build/ui-bundle.zip?job=bundle-stable
    snapshot: true
```

### 9. Git-Repository initialisieren

Antora liest Dokumentationsstände standardmäßig aus Git-Zweigen (Branches).

```bash
git -C ~/antora-demo init
```

### 10. Dokumentationsdateien zum Git-Index hinzufügen

Nimmt alle erstellten Konfigurations- und Inhaltsdateien in die Versionsverwaltung auf.

```bash
git -C ~/antora-demo add .
```

### 11. Git-Commit erstellen

Erstellt den ersten Revisionsstand im Repository.

```bash
git -C ~/antora-demo commit -m "Initiale Dokumentation"
```

### 12. Dokumentationsseite bauen

Startet die Generierung der statischen HTML-Webseite über Antora. Die Ausgabe landet standardmäßig in `build/site/`.

```bash
antora ~/antora-demo/antora-playbook.yml
```

**Prüfen:** Die Startdatei `build/site/index.html` wurde erfolgreich erzeugt.

```bash
ls -lh ~/antora-demo/build/site/index.html
```

### 13. Dokumentation im Browser ansehen

Öffnet die generierte Dokumentationsseite direkt in deinem Standard-Webbrowser.

```bash
xdg-open ~/antora-demo/build/site/index.html
```

## Deinstallieren

### 1. Antora-Pakete entfernen

Deinstalliert Antora CLI und den Site Generator aus npm.

```bash
sudo npm uninstall -g @antora/cli @antora/site-generator
```

### 2. Node.js und npm entfernen (optional)

Falls Node.js und npm über apt installiert wurden und nicht mehr benötigt werden.

```bash
sudo apt purge nodejs npm
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt verbliebene Hilfspakete aus dem System.

```bash
sudo apt autoremove
```

### 4. Testprojekt löschen (optional)

Entfernt das erstellte Testverzeichnis.

```bash
rm -rf ~/antora-demo
```

**Prüfen:** Der Befehl `antora` ist nicht mehr vorhanden.

```bash
antora -v
```
