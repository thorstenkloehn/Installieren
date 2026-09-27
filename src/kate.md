# Kate

Kate ist der Code-Editor des KDE-Projekts. Er ist freie Software, läuft auch unter GNOME und bringt viele Werkzeuge schon mit: Syntaxhervorhebung für mehrere hundert Sprachen, eine Projektansicht, Suche in Dateien, Git-Anzeige, ein eingebautes Terminal und einen LSP-Client, der mit Sprachservern Code-Vervollständigung und Fehleranzeige für viele Programmiersprachen liefert.

## Vorbemerkungen

- **Aus den Paketquellen:** Ubuntu 26.04 enthält Kate **25.12.3** im Paket `kate`. Es gibt auch einen Snap von KDE, der mit Version 25.08 aber älter ist.
- **KDE-Bibliotheken:** Unter der Standardoberfläche GNOME installiert `apt` rund 230 Pakete mit, vor allem Qt- und KDE-Bibliotheken, zusammen etwa 370 MB. Darauf zu verzichten (`--no-install-recommends`) spart nur wenig und lässt wichtige Teile weg: die Anbindung an Wayland, die deutschen Übersetzungen von Qt und die Darstellung von SVG-Symbolen. Diese Anleitung installiert Kate deshalb vollständig.
- **Deutsche Oberfläche:** Kate übernimmt die Sprache des Systems. Unter einem deutschen Ubuntu sind Menüs und Einstellungen sofort auf Deutsch.
- **Version:** Getestet mit Kate **25.12.3** unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Kate installieren

Installiert Kate samt der nötigen KDE-Bibliotheken. Lies die Liste der Pakete und bestätige mit <kbd>J</kbd>.

```bash
sudo apt install kate
```

**Prüfen:** Die letzte Zeile lautet `kate 25.12.3`. Eine Zeile `QThreadStorage: entry 0 destroyed …` davor ist nur ein Hinweis von Qt und kann übergangen werden.

```bash
kate --version
```

## Erste Schritte

### 3. Kate starten

Öffnet Kate. Alternativ findest du das Programm im Anwendungsmenü unter „Kate“.

```bash
kate
```

Beim ersten Start zeigt Kate eine Willkommensseite mit den zuletzt geöffneten Dateien und Ordnern.

### 4. Datei aus dem Terminal öffnen

`kate` mit Dateinamen öffnet die Dateien in Kate. Läuft Kate schon, öffnen sie sich als neue Tabs im vorhandenen Fenster. Hier als Beispiel eine Anleitung aus diesem Buch:

```bash
kate ~/Installieren/src/kate.md
```

Mit `kate -l 12 datei.md` springt Kate direkt in Zeile 12.

### 5. Projektordner öffnen

Wähle **Datei → Ordner öffnen …** und dann z. B. den Ordner `Installieren`. Links erscheint die Projektansicht mit allen Dateien des Ordners. Ist der Ordner ein Git-Repository, zeigt Kate dort auch geänderte Dateien an, und in der Statusleiste steht der aktuelle Branch.

### 6. Eingebautes Terminal einrichten

Das Terminal-Panel von Kate braucht einen Baustein aus dem Terminalprogramm Konsole. Er ist nur vorgeschlagen und wird nicht automatisch installiert.

```bash
sudo apt install konsole-kpart
```

Starte Kate danach neu und drücke <kbd>F4</kbd>. Unten öffnet sich ein Terminal im Ordner der aktuellen Datei. <kbd>F4</kbd> blendet es wieder aus.

### 7. Sprachserver für Python installieren

Der LSP-Client von Kate spricht mit Sprachservern, die eine Programmiersprache verstehen. Für Python kennt Kate den Server `pylsp` schon, er muss nur installiert sein.

```bash
sudo apt install python3-pylsp
```

**Prüfen:** Die Ausgabe nennt die Version, z. B. `pylsp v1.14.0`.

```bash
pylsp --version
```

Öffne danach in Kate eine Python-Datei. Kate startet den Sprachserver selbst. Beim Tippen erscheinen Vorschläge, Fehler werden unterstrichen, und <kbd>Strg</kbd>+Klick auf einen Namen springt zu seiner Definition. Passiert nichts, prüfe unter **Einstellungen → Kate einrichten … → Module**, ob **LSP-Client** eingeschaltet ist. Für andere Sprachen gibt es passende Pakete, z. B. `clangd` für C und C++ oder `gopls` für Go.

### 8. Die wichtigsten Tastenkürzel kennenlernen

| Tasten | Wirkung |
|---|---|
| <kbd>Strg</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> | Befehlsleiste: jeden Befehl über seinen Namen suchen |
| <kbd>Strg</kbd>+<kbd>Alt</kbd>+<kbd>O</kbd> | Schnellöffnen: Datei aus dem Projekt oder den offenen Dateien suchen |
| <kbd>Strg</kbd>+<kbd>G</kbd> | Zu einer Zeile springen |
| <kbd>Strg</kbd>+<kbd>F</kbd> | In der Datei suchen |
| <kbd>Strg</kbd>+<kbd>Alt</kbd>+<kbd>F</kbd> | In Dateien suchen (ganzer Projektordner) |
| <kbd>Alt</kbd>+Klick | Weiteren Cursor an die geklickte Stelle setzen |
| <kbd>F4</kbd> | Terminal ein- und ausblenden (nach Schritt 6) |

Unter **Einstellungen → Kurzbefehle festlegen …** lassen sich alle Tastenkürzel ansehen und ändern.

## Optional: Kate für Git verwenden

### 9. Kate als Editor für Git festlegen

Git öffnet für Commit-Nachrichten einen Editor. Mit dieser Einstellung ist das Kate. `-b` (block) sorgt dafür, dass Git wartet, bis du die Datei in Kate schließt.

```bash
git config --global core.editor "kate -b"
```

**Prüfen:** Die Ausgabe lautet `kate -b`.

```bash
git config --global core.editor
```

## Aktualisieren

Kate wird zusammen mit den anderen Paketen aktualisiert:

```bash
sudo apt update
```

```bash
sudo apt upgrade
```

## Deinstallieren

### 1. Git-Einstellung zurücksetzen

Entfernt Kate als Git-Editor, falls du Schritt 9 ausgeführt hast. Git nutzt danach wieder den Standard-Editor des Systems.

```bash
git config --global --unset core.editor
```

### 2. Kate und Zusatzpakete entfernen

Entfernt Kate und, falls installiert, das Terminal-Panel und den Python-Sprachserver aus Schritt 6 und 7. Nicht installierte Pakete meldet `apt` nur.

```bash
sudo apt purge kate konsole-kpart python3-pylsp
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt die KDE- und Qt-Bibliotheken, die nur für Kate mitinstalliert wurden. Der Befehl entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

### 4. Eigene Einstellungen entfernen

Kate verteilt seine Dateien auf mehrere Orte: Einstellungen in `~/.config/katerc`, `~/.config/katevirc`, `~/.config/kate-externaltoolspluginrc` und im Ordner `~/.config/kate`, Sitzungen in `~/.local/share/kate` den Fensterzustand in `~/.local/state/katestaterc` und die Einstellung zur freiwilligen Rückmeldung an KDE in `~/.local/state/UserFeedback.org.kde.kate`. **Achtung:** Deine Einstellungen und gespeicherten Sitzungen gehen dabei verloren.

```bash
rm -rf ~/.config/katerc ~/.config/katevirc ~/.config/kate-externaltoolspluginrc ~/.config/kate ~/.local/share/kate ~/.local/state/katestaterc ~/.local/state/UserFeedback.org.kde.kate
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
kate --version
```
