# Obsidian

Obsidian ist ein Programm für Notizen und persönliches Wissensmanagement. Notizen sind gewöhnliche Markdown-Dateien in einem Ordner auf deinem Rechner, die sich über Links zu einem Netz verknüpfen lassen. Mit **Canvas** kommen frei anordenbare Pinnwände hinzu, die ebenfalls in einem offenen Textformat gespeichert werden.

## Vorbemerkungen

- **Kein apt-Paket:** Obsidian ist nicht in den Ubuntu-Paketquellen enthalten. Diese Anleitung installiert es als Snap, das die Hersteller selbst veröffentlichen.
- **Lizenz:** Obsidian ist kostenlos, auch für die Arbeit, aber nicht quelloffen. Kostenpflichtig sind nur Zusatzdienste wie die Synchronisation zwischen Geräten (Obsidian Sync).
- **Vault:** Obsidian nennt einen Notizordner **Vault** (Tresor). Alles, was du schreibst, liegt als Datei in diesem Ordner. Das Programm ist nur die Oberfläche dafür.
- **Formate im Mittelpunkt:** Diese Anleitung legt zuerst ein Beispiel-Vault **im Terminal** an. So siehst du, wie die Dateien aussehen, bevor Obsidian sie darstellt.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` im nächsten Schritt die aktuelle Version von snapd kennt.

```bash
sudo apt update
```

### 2. Snap-Unterstützung sicherstellen

`snapd` ist der Dienst, der Snaps installiert und aktualisiert. Unter Ubuntu ist er normalerweise schon vorhanden, dann meldet `apt` das nur.

```bash
sudo apt install snapd
```

### 3. Obsidian installieren

Installiert Obsidian als Snap. `--classic` ist nötig, damit Obsidian Vaults an jedem Ort öffnen und Links zu anderen Programmen öffnen kann.

```bash
sudo snap install obsidian --classic
```

**Prüfen:** Die Ausgabe zeigt Name, Version (z. B. `1.13.7`) und als Herausgeber `obsidianmd`.

```bash
snap list obsidian
```

## Beispiel-Vault anlegen: die Format-Ebene

### 4. Ordner für das Vault anlegen

Das Vault ist ein ganz normaler Ordner. Hier als Beispiel `~/Dokumente/Obsidian`.

```bash
mkdir -p ~/Dokumente/Obsidian
```

### 5. In den Ordner wechseln

Die nächsten Dateien werden hier angelegt.

```bash
cd ~/Dokumente/Obsidian
```

### 6. Eine Notiz in Markdown anlegen

Legt die Notiz `Projekt Garten.md` an. Sie zeigt die wichtigsten Bausteine des Obsidian-Markdowns:

- Der Block zwischen den `---`-Zeilen am Anfang enthält **Eigenschaften** (Properties) im YAML-Format. Obsidian zeigt sie als Formular über der Notiz an.
- `[[Pflanzenliste]]` ist ein **Wikilink** auf eine andere Notiz. Der Dateiname wird ohne `.md` angegeben.
- `#garten` ist ein **Tag**.
- `> [!tip]` leitet einen **Hinweiskasten** (Callout) ein.
- `- [ ]` ist eine **Aufgabe** mit Kontrollkästchen.

```bash
nano "Projekt Garten.md"
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```markdown
---
status: geplant
beginn: 2026-10-01
tags:
  - garten
---

# Projekt Garten

Hochbeet im Herbst anlegen, Bepflanzung siehe [[Pflanzenliste]]. #garten

> [!tip] Tipp
> Erde erst nach dem ersten Regen auffüllen.

- [ ] Holz besorgen
- [x] Standort festlegen
```

### 7. Die verlinkte Notiz anlegen

Legt die Notiz an, auf die der Wikilink zeigt. Obsidian findet sie allein über den Dateinamen, egal in welchem Unterordner sie liegt.

```bash
nano Pflanzenliste.md
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```markdown
# Pflanzenliste

- Salat
- Radieschen
- Kräuter
```

### 8. Ein Canvas anlegen

Ein Canvas ist eine Pinnwand mit Karten und Verbindungslinien. Obsidian speichert sie in Dateien mit der Endung `.canvas` im offenen Format **JSON Canvas**. Der Aufbau:

- `nodes` – die Karten. Jede hat eine eindeutige `id`, eine Position (`x`, `y`) und eine Größe (`width`, `height`) in Pixeln. Der `type` legt fest, was die Karte zeigt: `text` (eigener Markdown-Text), `file` (eine Notiz aus dem Vault), `link` (eine Webseite) oder `group` (ein Rahmen um andere Karten).
- `edges` – die Verbindungslinien. `fromNode` und `toNode` verweisen auf die `id` der Karten, `fromSide` und `toSide` legen fest, an welcher Seite (`top`, `right`, `bottom`, `left`) die Linie ansetzt.

```bash
nano Gartenplanung.canvas
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```json
{
  "nodes": [
    {
      "id": "idee",
      "type": "text",
      "text": "## Idee\nHochbeet mit Gemüse",
      "x": 0, "y": 0, "width": 250, "height": 120
    },
    {
      "id": "projekt",
      "type": "file",
      "file": "Projekt Garten.md",
      "x": 400, "y": -60, "width": 400, "height": 300
    }
  ],
  "edges": [
    {
      "id": "idee-zu-projekt",
      "fromNode": "idee", "fromSide": "right",
      "toNode": "projekt", "toSide": "left",
      "label": "wird zu"
    }
  ]
}
```

**Prüfen:** Der Befehl meldet keinen Fehler, die Datei ist also gültiges JSON.

```bash
python3 -m json.tool Gartenplanung.canvas > /dev/null
```

## Obsidian verwenden

### 9. Obsidian starten

Startet Obsidian. Alternativ findest du das Programm im Anwendungsmenü unter „Obsidian“.

```bash
obsidian &
```

### 10. Beispiel-Vault öffnen

Wähle im Startfenster **Open folder as vault** und dann den Ordner `~/Dokumente/Obsidian`. Beim ersten Öffnen fragt Obsidian, ob du den Autoren des Vaults vertraust. Das betrifft Erweiterungen (Plugins). Weil das Vault von dir stammt, kannst du zustimmen.

**Prüfen:** Links in der Dateiliste stehen `Gartenplanung`, `Pflanzenliste` und `Projekt Garten`. Die Notiz „Projekt Garten“ zeigt oben die Eigenschaften `status` und `beginn`, darunter den Hinweiskasten und die Aufgaben. „Gartenplanung“ zeigt zwei Karten, die mit einem beschrifteten Pfeil verbunden sind.

### 11. Deutsche Oberfläche einstellen

Öffne die Einstellungen über das Zahnrad unten links (oder <kbd>Strg</kbd>+<kbd>,</kbd>). Wähle unter **General** bei **Language** den Eintrag **Deutsch** und klicke auf **Relaunch**, damit Obsidian neu startet.

### 12. Die wichtigsten Tastenkürzel kennenlernen

| Tasten | Wirkung |
|---|---|
| <kbd>Strg</kbd>+<kbd>O</kbd> | Notiz schnell öffnen (Schnellwechsler) |
| <kbd>Strg</kbd>+<kbd>P</kbd> | Befehlspalette: jeden Befehl über seinen Namen suchen |
| <kbd>Strg</kbd>+<kbd>N</kbd> | Neue Notiz |
| <kbd>Strg</kbd>+<kbd>E</kbd> | Zwischen Bearbeiten und Leseansicht wechseln |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>F</kbd> | Im ganzen Vault suchen |
| <kbd>Strg</kbd>+<kbd>G</kbd> | Graph-Ansicht: alle Notizen und ihre Links als Netz |
| `[[` | Link auf eine Notiz einfügen (mit Vorschlagsliste) |

## Was Obsidian im Vault ablegt

### 13. Einstellungsordner ansehen

Beim ersten Öffnen legt Obsidian im Vault den versteckten Ordner `.obsidian` an. Darin stehen die Einstellungen dieses Vaults als JSON-Dateien, z. B. Darstellung, Tastenkürzel und installierte Plugins. Deine Notizen enthält der Ordner nicht.

```bash
ls ~/Dokumente/Obsidian/.obsidian
```

**Prüfen:** Es werden Dateien wie `app.json` und `workspace.json` angezeigt.

Weil Notizen und Canvas-Dateien reine Textdateien sind, kannst du sie auch mit jedem Editor bearbeiten, mit [Git](git-cgit.md) versionieren oder mit anderen Programmen weiterverarbeiten. Obsidian bemerkt Änderungen von außen und zeigt sie sofort an.

## Aktualisieren

Snaps aktualisieren sich automatisch im Hintergrund. Sofort aktualisieren kannst du mit:

```bash
sudo snap refresh obsidian
```

## Deinstallieren

### 1. Obsidian entfernen

Entfernt das Snap. `--purge` verhindert, dass Snap vorher eine Sicherungskopie anlegt. Deine Notizen bleiben erhalten.

```bash
sudo snap remove --purge obsidian
```

### 2. Programmeinstellungen entfernen

Obsidian merkt sich in `~/.config/obsidian` die Liste der geöffneten Vaults und die Fenstereinstellungen. Deine Notizen sind dort nicht enthalten.

```bash
rm -rf ~/.config/obsidian
```

**Prüfen:** Die Ausgabe meldet, dass kein Snap namens `obsidian` installiert ist.

```bash
snap list obsidian
```

### 3. Optional: Vault löschen

**Achtung:** Dieser Befehl löscht alle Notizen und Canvas-Dateien des Vaults endgültig. Nur ausführen, wenn du sie nicht mehr brauchst oder vorher gesichert hast.

```bash
rm -rf ~/Dokumente/Obsidian
```
