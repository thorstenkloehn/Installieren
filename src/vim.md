# Vim

Vim ist ein sehr leistungsfähiger Texteditor für das Terminal. Er wird komplett über die Tastatur bedient und eignet sich besonders zum Programmieren und für längere Arbeit an Textdateien.

## Installation

Ubuntu bringt meist nur `vim-tiny` mit, eine stark abgespeckte Variante ohne Syntaxhervorhebung. Das Paket `vim` enthält die vollständige Version.

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von Vim aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Vim installieren

Installiert die vollständige Terminal-Version von Vim aus den offiziellen Ubuntu-Paketquellen.

```bash
sudo apt install vim
```

**Prüfen:** Die erste Zeile der Ausgabe nennt die Version, z. B. `VIM - Vi IMproved 9.1`.

```bash
vim --version | head -n 1
```

### 3. Optional: Version mit Zwischenablage installieren

Die normale Terminal-Version kann nicht auf die Zwischenablage des Desktops zugreifen. Wenn du Text zwischen Vim und anderen Programmen kopieren willst, installierst du stattdessen `vim-gtk3`. Das Paket bringt zusätzlich die grafische Oberfläche `gvim` mit.

```bash
sudo apt install vim-gtk3
```

**Prüfen:** In der Ausgabe steht `+clipboard` (mit Pluszeichen).

```bash
vim --version | grep -o '[+-]clipboard'
```

## Erste Schritte

### 4. Die eingebaute Übung durcharbeiten

`vimtutor` öffnet eine Übungsdatei, in der du die Grundlagen direkt ausprobierst. Das dauert etwa 30 Minuten und ist der beste Einstieg, weil Vim anders funktioniert als die meisten Editoren.

```bash
vimtutor de
```

### 5. Datei öffnen

Öffnet eine Datei zum Bearbeiten. Gibt es die Datei noch nicht, legt Vim sie beim Speichern an.

```bash
vim test.txt
```

**Prüfen:** Unten links steht der Dateiname.

### 6. Die Modi verstehen

Vim startet im **Normalmodus**. Dort lösen Tasten Befehle aus, statt Text zu schreiben. Zum Tippen wechselst du in den **Einfügemodus**.

| Tasten | Wirkung |
|---|---|
| <kbd>i</kbd> | In den Einfügemodus wechseln (unten steht `-- EINFÜGEN --`) |
| <kbd>Esc</kbd> | Zurück in den Normalmodus |
| `:w` + <kbd>Enter</kbd> | Datei speichern |
| `:q` + <kbd>Enter</kbd> | Vim beenden |
| `:wq` + <kbd>Enter</kbd> | Speichern und beenden |
| `:q!` + <kbd>Enter</kbd> | Beenden, ohne zu speichern |
| <kbd>u</kbd> | Letzte Änderung rückgängig machen |
| <kbd>d</kbd><kbd>d</kbd> | Aktuelle Zeile ausschneiden |
| <kbd>p</kbd> | Ausgeschnittenen Text einfügen |
| `/wort` + <kbd>Enter</kbd> | Nach „wort“ suchen, mit <kbd>n</kbd> zum nächsten Treffer |
| `:help` + <kbd>Enter</kbd> | Hilfe anzeigen |

Die Befehle mit Doppelpunkt funktionieren nur im Normalmodus. Drücke im Zweifel vorher <kbd>Esc</kbd>.

### 7. Systemdateien bearbeiten

Dateien unter `/etc` gehören `root`. Mit `sudoedit` bearbeitest du eine Kopie mit deinen normalen Rechten, beim Beenden wird sie zurückgeschrieben. Das ist sicherer, als Vim komplett mit `sudo` zu starten. Die Datei `/etc/hosts` dient hier nur als Beispiel.

```bash
SUDO_EDITOR=vim sudoedit /etc/hosts
```

## Optional: Vim einrichten

### 8. Eigene Einstellungsdatei anlegen

Die Datei `~/.vimrc` gilt nur für deinen Benutzer. Die Einstellungen schalten Syntaxhervorhebung und Zeilennummern ein, rücken automatisch ein und fügen statt eines Tabulators vier Leerzeichen ein.

```bash
nano ~/.vimrc
```

Hast du die Datei schon mit eigenen Einstellungen, lösche deren alten Inhalt zuerst oder ergänze nur die fehlenden Zeilen. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```vim
syntax on
filetype plugin indent on
set number
set autoindent
set tabstop=4
set shiftwidth=4
set expandtab
```

**Prüfen:** Beim nächsten Start von Vim stehen links die Zeilennummern.

```bash
vim ~/.vimrc
```

### 9. Vim als Standard-Editor festlegen

Programme wie `crontab -e` oder `git commit` öffnen den eingestellten Standard-Editor. Mit diesem Befehl wählst du aus einer Liste den Editor aus, der systemweit verwendet wird. Gib die Nummer ein, die vor `/usr/bin/vim.basic` steht (bzw. `/usr/bin/vim.gtk3`, wenn du Schritt 3 ausgeführt hast).

```bash
sudo update-alternatives --config editor
```

**Prüfen:** Die Ausgabe zeigt als Link den gewählten Vim.

```bash
update-alternatives --query editor | grep Value
```

## Deinstallieren

### 1. Eigene Einstellungen entfernen

Löscht die persönliche Einstellungsdatei und den Ordner für Erweiterungen, falls vorhanden. **Achtung:** Selbst installierte Plugins in `~/.vim` gehen verloren.

```bash
rm -rf ~/.vimrc ~/.vim
```

### 2. Vim entfernen

Entfernt die vollständige Version und, falls installiert, die Version mit Zwischenablage. `vim-tiny` bleibt erhalten, weil Ubuntu es als einfachen Editor mitbringt. Ist Vim dein Standard-Editor, stellt Ubuntu automatisch auf einen anderen installierten Editor um.

```bash
sudo apt purge vim vim-gtk3
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten, die nur für Vim installiert wurden, z. B. `vim-runtime`.

```bash
sudo apt autoremove
```

**Prüfen:** Es wird nur noch die kleine Version gefunden, `vim.basic` fehlt.

```bash
ls /usr/bin/vim*
```
