# Neovim

Neovim ist eine Weiterentwicklung von Vim. Es wird genauso über die Tastatur bedient, lässt sich aber mit der Programmiersprache Lua einrichten und bringt moderne Funktionen für das Programmieren mit, etwa Unterstützung für Language Server (Autovervollständigung, Fehleranzeige).

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von Neovim aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Neovim installieren

Installiert Neovim aus den offiziellen Ubuntu-Paketquellen. Der Befehl zum Starten heißt `nvim`.

```bash
sudo apt install neovim
```

**Prüfen:** Die erste Zeile der Ausgabe nennt die Version, z. B. `NVIM v0.11.6`.

```bash
nvim --version | head -n 1
```

### 3. Werkzeug für die Zwischenablage installieren

Neovim greift nicht selbst auf die Zwischenablage des Desktops zu, sondern nutzt dafür ein Hilfsprogramm. Ubuntu verwendet Wayland, deshalb wird `wl-clipboard` gebraucht. Ohne das Paket kannst du keinen Text zwischen Neovim und anderen Programmen austauschen.

```bash
sudo apt install wl-clipboard
```

### 4. Einrichtung überprüfen

Neovim hat eine eingebaute Selbstprüfung. Sie zeigt, ob alles Nötige vorhanden ist.

```bash
nvim +checkhealth
```

**Prüfen:** Im Abschnitt `vim.provider` steht unter „Clipboard“ ein `OK` mit `wl-copy`. Warnungen zu Python, Ruby, Node.js oder Perl kannst du ignorieren, diese Erweiterungen werden nur von manchen Plugins gebraucht. Mit `:qa` + <kbd>Enter</kbd> verlässt du die Anzeige.

## Erste Schritte

### 5. Die eingebaute Übung durcharbeiten

Neovim bringt eine Übung zum Mitmachen mit. Sie ist nur auf Englisch verfügbar. Wer die deutsche Fassung möchte, kann stattdessen `vimtutor de` aus der [Vim-Anleitung](vim.md) nutzen, die Grundbefehle sind gleich.

```bash
nvim +Tutor
```

### 6. Datei öffnen

Öffnet eine Datei zum Bearbeiten. Gibt es die Datei noch nicht, legt Neovim sie beim Speichern an.

```bash
nvim test.txt
```

### 7. Die wichtigsten Befehle kennenlernen

Wie Vim startet Neovim im **Normalmodus**, in dem Tasten Befehle auslösen. Zum Tippen wechselst du in den **Einfügemodus**.

| Tasten | Wirkung |
|---|---|
| <kbd>i</kbd> | In den Einfügemodus wechseln (unten steht `-- EINFÜGEN --`) |
| <kbd>Esc</kbd> | Zurück in den Normalmodus |
| `:w` + <kbd>Enter</kbd> | Datei speichern |
| `:q` + <kbd>Enter</kbd> | Neovim beenden |
| `:wq` + <kbd>Enter</kbd> | Speichern und beenden |
| `:q!` + <kbd>Enter</kbd> | Beenden, ohne zu speichern |
| <kbd>u</kbd> | Letzte Änderung rückgängig machen |
| <kbd>d</kbd><kbd>d</kbd> | Aktuelle Zeile ausschneiden |
| <kbd>p</kbd> | Ausgeschnittenen Text einfügen |
| `"+y` | Markierten Text in die Zwischenablage des Desktops kopieren |
| `"+p` | Text aus der Zwischenablage des Desktops einfügen |
| `/wort` + <kbd>Enter</kbd> | Nach „wort“ suchen, mit <kbd>n</kbd> zum nächsten Treffer |
| `:help` + <kbd>Enter</kbd> | Hilfe anzeigen |

### 8. Systemdateien bearbeiten

Dateien unter `/etc` gehören `root`. Mit `sudoedit` bearbeitest du eine Kopie mit deinen normalen Rechten, beim Beenden wird sie zurückgeschrieben. So bleiben auch deine eigenen Neovim-Einstellungen aktiv. Die Datei `/etc/hosts` dient hier nur als Beispiel.

```bash
SUDO_EDITOR=nvim sudoedit /etc/hosts
```

## Optional: Neovim einrichten

Neovim hat bereits sinnvolle Grundeinstellungen, etwa Syntaxhervorhebung und automatisches Einrücken. Eine eigene Einstellungsdatei brauchst du nur für persönliche Anpassungen.

### 9. Ordner für die Einstellungen anlegen

Neovim liest seine Einstellungen aus `~/.config/nvim`. Der Ordner existiert anfangs nicht.

```bash
mkdir -p ~/.config/nvim
```

### 10. Einstellungsdatei anlegen

Die Datei `init.lua` wird in Lua geschrieben. Die Einstellungen zeigen Zeilennummern an, fügen statt eines Tabulators vier Leerzeichen ein und verbinden die normalen Kopierbefehle direkt mit der Zwischenablage des Desktops (dann ist `"+` nicht mehr nötig).

```bash
nano ~/.config/nvim/init.lua
```

Hast du die Datei schon mit eigenen Einstellungen, lösche deren alten Inhalt zuerst oder ergänze nur die fehlenden Zeilen. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```lua
vim.opt.number = true
vim.opt.tabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true
vim.opt.clipboard = "unnamedplus"
```

**Prüfen:** Beim nächsten Start von Neovim stehen links die Zeilennummern.

```bash
nvim ~/.config/nvim/init.lua
```

### 11. Neovim als Standard-Editor festlegen

Programme wie `crontab -e` oder `git commit` öffnen den eingestellten Standard-Editor. Mit diesem Befehl wählst du aus einer Liste den Editor aus, der systemweit verwendet wird. Gib die Nummer ein, die vor `/usr/bin/nvim` steht.

```bash
sudo update-alternatives --config editor
```

**Prüfen:** Die Ausgabe zeigt als Link `/usr/bin/nvim`.

```bash
update-alternatives --query editor | grep Value
```

## Deinstallieren

### 1. Eigene Einstellungen und Daten entfernen

Neovim legt Dateien an vier Stellen ab: Einstellungen, Plugins, Verlauf bzw. Sicherungsdateien und Zwischenspeicher. **Achtung:** Deine Einstellungen und selbst installierten Plugins gehen dabei verloren.

```bash
rm -rf ~/.config/nvim ~/.local/share/nvim ~/.local/state/nvim ~/.cache/nvim
```

### 2. Neovim entfernen

Entfernt Neovim und das Hilfsprogramm für die Zwischenablage. Lass `wl-clipboard` weg, wenn andere Programme es noch brauchen. Ist Neovim dein Standard-Editor, stellt Ubuntu automatisch auf einen anderen installierten Editor um.

```bash
sudo apt purge neovim wl-clipboard
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten, die nur für Neovim installiert wurden, z. B. `neovim-runtime`.

```bash
sudo apt autoremove
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
nvim --version
```
