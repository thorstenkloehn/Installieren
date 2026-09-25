# Foam

Foam ist eine Erweiterung für Visual Studio Code, die aus einem Ordner mit Markdown-Dateien ein persönliches Wissensnetz macht. Notizen werden mit `[[Wiki-Links]]` verknüpft, Foam zeigt Rückverweise und einen Graphen der Verbindungen. Weil alles normale Dateien in einem Git-Repository sind, lassen sich die Notizen mit jedem Editor lesen und mit Git sichern.

> **Teilweise getestet:** Installation der Erweiterung über die Befehlszeile und das Anlegen des Notizordners aus der Vorlage wurden unter Ubuntu 26.04 geprüft. Die Arbeit in der Oberfläche von VS Code (ab Schritt 8) wurde **nicht** durchgeklickt.

## Vorbemerkungen

- **Voraussetzungen:** [Visual Studio Code](vscode.md) und Git sind installiert.
- **Installation über VS Code:** Foam ist kein eigenes Programm, sondern eine Erweiterung aus dem Marketplace von VS Code. Sie lässt sich mit dem Befehl `code` installieren.
- **Version:** Getestet mit Foam **0.44.6** und VS Code 1.138. Foam 0.44 braucht mindestens VS Code 1.110.
- **Vorlage:** Das Projekt stellt eine Vorlage für den Notizordner bereit (`foam-template`), mit Einstellungen und einigen Einführungsseiten. Die Anleitung übernimmt sie, trennt sie aber vom Git-Repository des Projekts. Die Vorlage enthält die Einstellung `git.postCommitCommand: sync`: VS Code schiebt damit nach jedem Commit automatisch zum eingetragenen Server. Mit einem eigenen Repository ohne Server passiert dabei nichts.

## Installation

### 1. Foam installieren

Lädt die Erweiterung aus dem Marketplace und installiert sie in VS Code.

```bash
code --install-extension foam.foam-vscode
```

**Prüfen:** Die Ausgabe lautet `Extension 'foam.foam-vscode' v0.44.6 was successfully installed.` (oder eine neuere Versionsnummer). Die Erweiterung erscheint in der Liste:

```bash
code --list-extensions --show-versions | grep foam
```

### 2. Vorlage für den Notizordner herunterladen

Lädt die Vorlage in den Ordner `~/notizen`. `--depth 1` lässt die Versionsgeschichte der Vorlage weg.

```bash
git clone --depth 1 https://github.com/foambubble/foam-template.git ~/notizen
```

### 3. In den Notizordner wechseln

Die folgenden Befehle arbeiten in diesem Ordner.

```bash
cd ~/notizen
```

### 4. Verbindung zur Vorlage lösen

Der Ordner `.git` gehört noch zum Repository des Foam-Projekts. Dieser Befehl löscht ihn. Die Dateien der Vorlage bleiben erhalten.

```bash
rm -rf .git
```

### 5. Eigenes Git-Repository anlegen

Macht den Ordner zu einem neuen, eigenen Git-Repository. So lassen sich Änderungen an den Notizen nachverfolgen und sichern.

```bash
git init -b main
```

### 6. Vorlage als ersten Stand speichern

`git add .` merkt alle Dateien vor, `git commit` speichert sie als ersten Stand.

```bash
git add .
```

```bash
git commit -m "Notizen aus foam-template angelegt"
```

**Prüfen:** Der Ordner enthält unter anderem `getting-started.md`, `inbox.md` und die Ordner `.foam` und `.vscode`.

```bash
ls -A
```

### 7. Empfohlene Zusatz-Erweiterungen ansehen (optional)

Die Vorlage empfiehlt in `.vscode/extensions.json` weitere Erweiterungen, z. B. `yzhang.markdown-all-in-one` für Inhaltsverzeichnisse und Listen. VS Code bietet sie beim Öffnen des Ordners zur Installation an. Für Foam selbst sind sie nicht nötig.

```bash
cat .vscode/extensions.json
```

## Erste Schritte (nicht getestet)

### 8. Notizordner in VS Code öffnen

Öffnet den Ordner als Arbeitsbereich. Die Einstellungen der Vorlage in `.vscode/settings.json` gelten dann automatisch. Fragt VS Code, ob du den Autoren des Ordners vertraust, bestätige das, sonst bleiben Erweiterungen abgeschaltet.

```bash
code ~/notizen
```

### 9. Notizen verknüpfen

Öffne `inbox.md` und schreibe `[[` gefolgt von einem Namen, z. B. `[[Kaffeerösterei]]`. Foam schlägt vorhandene Notizen vor. Ein Link auf eine Notiz, die es noch nicht gibt, lässt sich mit <kbd>Strg</kbd>+Klick anlegen.

### 10. Tagesnotiz öffnen

<kbd>Alt</kbd>+<kbd>D</kbd> öffnet die Notiz für den heutigen Tag, bei Bedarf legt Foam sie neu an. Sie eignet sich als Tagebuch oder Eingangskorb.

### 11. Graph anzeigen

Öffne mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>P</kbd> die Befehlspalette und wähle **Foam: Show Graph**. Foam zeigt alle Notizen als Punkte und ihre Links als Linien. Weitere Befehle beginnen ebenfalls mit `Foam:`, z. B. **Foam: Create New Note**. Foam hat in der Seitenleiste von VS Code eigene Bereiche. **Connections** zeigt, welche Notizen auf die aktuelle verweisen und wohin sie selbst verweist. **Orphans** listet Notizen ohne Verbindung, **Placeholders** Links auf Notizen, die es noch nicht gibt.

### 12. Änderungen sichern

Speichere geänderte Notizen im Terminal als neuen Stand. Das geht auch in VS Code über die Ansicht **Quellcodeverwaltung** (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>G</kbd>).

```bash
git add .
```

```bash
git commit -m "Neue Notizen"
```

## Aktualisieren

VS Code aktualisiert Erweiterungen normalerweise von selbst. Von Hand geht es so:

```bash
code --install-extension foam.foam-vscode --force
```

## Deinstallieren

### 1. Foam entfernen

Entfernt die Erweiterung aus VS Code. Den Ordner der Erweiterung räumt VS Code beim nächsten Start selbst auf.

```bash
code --uninstall-extension foam.foam-vscode
```

**Prüfen:** Die Ausgabe ist leer.

```bash
code --list-extensions | grep foam
```

### 2. Notizen löschen (optional)

Löscht den Notizordner samt Git-Repository. **Achtung:** Alle Notizen gehen dabei verloren. Die Markdown-Dateien lassen sich aber auch ohne Foam weiter mit jedem Editor nutzen.

```bash
rm -rf ~/notizen
```
