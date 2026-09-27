# Sublime Text

Sublime Text ist ein schneller Code-Editor mit grafischer Oberfläche. Er startet in Sekundenbruchteilen, bleibt auch bei sehr großen Dateien flüssig und ist bekannt für Mehrfach-Cursor, die Befehlspalette und das schnelle Springen zu Dateien und Funktionen. Über Package Control lassen sich tausende Erweiterungen nachinstallieren.

## Vorbemerkungen

- **Lizenz:** Sublime Text ist kein freies Programm. Man darf es kostenlos herunterladen und ausprobieren, für die dauerhafte Nutzung verlangt der Hersteller aber den Kauf einer Lizenz. Eine persönliche Lizenz kostet einmalig 99 US-Dollar und enthält drei Jahre Updates (Stand September 2026). Ohne Lizenz zeigt Sublime Text von Zeit zu Zeit einen Hinweis zum Kauf und in der Titelleiste `(UNREGISTERED)`.
- **Installation über das Paketarchiv:** Sublime Text ist nicht in den Ubuntu-Paketquellen enthalten. Diese Anleitung bindet das offizielle Paketarchiv des Herstellers Sublime HQ ein. Sublime Text wird danach mit `apt` verwaltet und aktualisiert. Es gibt auch einen Snap `sublime-text`, der aber nicht vom Hersteller stammt, sondern von der Community „Snapcrafters“.
- **Nur Englisch:** Die Oberfläche von Sublime Text gibt es nur auf Englisch. Ein offizielles Sprachpaket gibt es nicht.
- **Version:** Getestet mit Sublime Text **Build 4215** unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme für die nächsten Schritte kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramm installieren

`wget` lädt Dateien aus dem Internet herunter. Es ist meist schon vorhanden, dann meldet `apt` das nur.

```bash
sudo apt install wget
```

### 3. Schlüssel des Herstellers einrichten

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich von Sublime HQ stammen und nicht verändert wurden. Der Ordner `/etc/apt/keyrings` ist unter Ubuntu für Schlüssel gedacht, die man selbst hinzufügt. Der Schlüssel liegt als Text vor, `apt` liest ihn mit der Endung `.asc` ohne Umwandlung.

```bash
sudo wget -O /etc/apt/keyrings/sublimehq-pub.asc https://download.sublimetext.com/sublimehq-pub.gpg
```

**Prüfen:** Die erste Zeile lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -n 1 /etc/apt/keyrings/sublimehq-pub.asc
```

### 4. Paketarchiv eintragen

Legt eine Datei an, die `apt` mitteilt, wo die Pakete liegen und mit welchem Schlüssel sie geprüft werden.

```bash
sudo nano /etc/apt/sources.list.d/sublime-text.sources
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://download.sublimetext.com/
Suites: apt/stable/
Signed-By: /etc/apt/keyrings/sublimehq-pub.asc
```

`apt/stable/` ist der Kanal für fertige Versionen. Der Hersteller bietet zusätzlich einen Kanal `apt/dev/` mit Vorabversionen an, der aber nur mit gekaufter Lizenz funktioniert. Die Zeile `Components` fehlt hier absichtlich: Das Archiv ist einfach aufgebaut und hat keine Unterteilung wie `main`.

### 5. Paketlisten erneut aktualisieren

Jetzt liest `apt` auch das neue Paketarchiv ein.

```bash
sudo apt update
```

**Prüfen:** In der Ausgabe erscheinen Zeilen mit `https://download.sublimetext.com apt/stable/`, ohne Fehlermeldung.

### 6. Sublime Text installieren

Installiert Sublime Text. Der Befehl zum Starten im Terminal heißt `subl`.

```bash
sudo apt install sublime-text
```

**Prüfen:** Die Ausgabe lautet `Sublime Text Build 4215` oder nennt eine höhere Nummer.

```bash
subl --version
```

## Erste Schritte

### 7. Sublime Text starten

Öffnet Sublime Text. Alternativ findest du das Programm im Anwendungsmenü unter „Sublime Text“.

```bash
subl
```

### 8. Projektordner öffnen

`subl .` öffnet den aktuellen Ordner. Die Seitenleiste links zeigt dann alle Dateien des Ordners. Hier als Beispiel dieser Ordner mit den Anleitungen:

```bash
cd ~/Installieren
```

```bash
subl .
```

Mit `subl datei.md:12` öffnet Sublime Text eine Datei direkt in Zeile 12.

### 9. Package Control installieren

Package Control ist der Paketmanager für Erweiterungen. Er ist nicht vorinstalliert.

1. Drücke <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>P</kbd>. Die Befehlspalette öffnet sich.
2. Gib `Install Package Control` ein und drücke <kbd>Enter</kbd>.

**Prüfen:** Nach einigen Sekunden meldet ein Fenster, dass Package Control installiert wurde. Im Menü **Preferences** gibt es jetzt den Eintrag **Package Control**.

### 10. Erweiterung installieren

1. Drücke <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>P</kbd>.
2. Gib `Package Control: Install Package` ein und drücke <kbd>Enter</kbd>.
3. Gib den Namen einer Erweiterung ein, z. B. `MarkdownPreview` oder `GitGutter`, und drücke <kbd>Enter</kbd>.

**Prüfen:** Unten in der Statusleiste steht kurz, dass das Paket installiert wurde. Über `Package Control: List Packages` in der Befehlspalette siehst du alle installierten Erweiterungen.

### 11. Einstellungen ändern

Öffne **Preferences → Settings**. Links stehen die Voreinstellungen, rechts deine eigenen. Trage Änderungen nur rechts ein, z. B.:

```json
{
    "font_size": 12,
    "tab_size": 4,
    "translate_tabs_to_spaces": true
}
```

Sublime Text übernimmt die Einstellungen beim Speichern mit <kbd>Strg</kbd>+<kbd>S</kbd> sofort, ohne Neustart.

### 12. Die wichtigsten Tastenkürzel kennenlernen

| Tasten | Wirkung |
|---|---|
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>P</kbd> | Befehlspalette: jeden Befehl über seinen Namen suchen |
| <kbd>Strg</kbd>+<kbd>P</kbd> | Datei im Projekt schnell öffnen |
| <kbd>Strg</kbd>+<kbd>R</kbd> | Zu einer Funktion oder Überschrift in der Datei springen |
| <kbd>Strg</kbd>+<kbd>D</kbd> | Nächstes Vorkommen des markierten Worts zusätzlich markieren (Mehrfach-Cursor) |
| <kbd>Strg</kbd>+Klick | Weiteren Cursor an die geklickte Stelle setzen |
| <kbd>Strg</kbd>+<kbd>F</kbd> | In der Datei suchen |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>F</kbd> | Im ganzen Projekt suchen |
| <kbd>Strg</kbd>+<kbd>K</kbd>, <kbd>Strg</kbd>+<kbd>B</kbd> | Seitenleiste ein- und ausblenden |

## Optional: Sublime Text für Git verwenden

### 13. Sublime Text als Editor für Git festlegen

Git öffnet für Commit-Nachrichten einen Editor. Mit dieser Einstellung ist das Sublime Text. `-w` (wait) sorgt dafür, dass Git wartet, bis du den Tab mit der Nachricht schließt.

```bash
git config --global core.editor "subl -w"
```

**Prüfen:** Die Ausgabe lautet `subl -w`.

```bash
git config --global core.editor
```

## Lizenz eintragen

Hast du eine Lizenz gekauft, öffne **Help → Enter License**, füge den Lizenzschlüssel aus der E-Mail ein und klicke auf **Use License**. Der Hinweis `(UNREGISTERED)` in der Titelleiste verschwindet danach.

## Aktualisieren

Sublime Text wird zusammen mit den anderen Paketen aktualisiert:

```bash
sudo apt update
```

```bash
sudo apt upgrade
```

## Deinstallieren

### 1. Git-Einstellung zurücksetzen

Entfernt Sublime Text als Git-Editor, falls du Schritt 13 ausgeführt hast. Git nutzt danach wieder den Standard-Editor des Systems.

```bash
git config --global --unset core.editor
```

### 2. Sublime Text entfernen

Entfernt das Programm.

```bash
sudo apt purge sublime-text
```

### 3. Paketarchiv und Schlüssel entfernen

Ohne diese Dateien sucht `apt` nicht mehr bei Sublime HQ nach Updates.

```bash
sudo rm /etc/apt/sources.list.d/sublime-text.sources /etc/apt/keyrings/sublimehq-pub.asc
```

### 4. Paketlisten aktualisieren

Damit `apt` das entfernte Paketarchiv auch aus seinen Listen streicht.

```bash
sudo apt update
```

### 5. Eigene Einstellungen und Erweiterungen entfernen

Sublime Text speichert Einstellungen, Erweiterungen und die Lizenz in `~/.config/sublime-text` und den Zwischenspeicher in `~/.cache/sublime-text`. **Achtung:** Deine Einstellungen, alle Erweiterungen und der eingetragene Lizenzschlüssel gehen dabei verloren.

```bash
rm -rf ~/.config/sublime-text ~/.cache/sublime-text
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
subl --version
```
