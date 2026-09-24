# Emacs

GNU Emacs ist ein sehr vielseitiger Texteditor. Er lässt sich mit der Sprache Emacs Lisp fast beliebig erweitern und wird zum Programmieren, für Notizen (Org-Modus) und viele andere Aufgaben genutzt.

## Installation

Ubuntu bietet Emacs in mehreren Varianten an. Diese Anleitung verwendet `emacs-pgtk`, weil sie direkt mit Wayland zusammenarbeitet, dem Grafiksystem von Ubuntu. Schriften werden dadurch scharf dargestellt, auch bei Bildschirmskalierung. Wer nur im Terminal arbeitet (z. B. auf einem Server), nimmt stattdessen `emacs-nox`.

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von Emacs aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Emacs installieren

Installiert Emacs mit grafischer Oberfläche aus den offiziellen Ubuntu-Paketquellen. Die gemeinsam genutzten Dateien (z. B. Hilfe und Erweiterungen) werden automatisch mitinstalliert.

```bash
sudo apt install emacs-pgtk
```

**Prüfen:** Die erste Zeile der Ausgabe nennt die Version, z. B. `GNU Emacs 30.2`.

```bash
emacs --version | head -n 1
```

### 3. Emacs starten

Öffnet Emacs in einem eigenen Fenster. Alternativ findest du Emacs im Anwendungsmenü.

```bash
emacs &
```

**Prüfen:** Es öffnet sich ein Fenster mit der Begrüßungsseite von Emacs.

Soll Emacs direkt im Terminal laufen statt in einem eigenen Fenster, startest du es mit `-nw`:

```bash
emacs -nw
```

## Erste Schritte

### 4. Die eingebaute Übung durcharbeiten

Emacs bringt eine Übung zum Mitmachen auf Deutsch mit. Sie erklärt die Grundbefehle und dauert etwa 30 Minuten. Nach dem Start fragt Emacs unten nach der Sprache: `German` eingeben und <kbd>Enter</kbd> drücken.

```bash
emacs -nw --eval '(call-interactively (quote help-with-tutorial-spec-language))'
```

Innerhalb von Emacs erreichst du die Übung jederzeit mit <kbd>Strg</kbd>+<kbd>H</kbd>, dann <kbd>T</kbd> (in der Sprache deines Systems).

### 5. Datei öffnen

Öffnet eine Datei zum Bearbeiten. Gibt es die Datei noch nicht, legt Emacs sie beim Speichern an.

```bash
emacs test.txt &
```

### 6. Die wichtigsten Tastenkürzel kennenlernen

Emacs verwendet eigene Tastenkürzel. In der Emacs-Hilfe steht `C-` für <kbd>Strg</kbd> und `M-` für <kbd>Alt</kbd>. `C-x C-s` bedeutet: <kbd>Strg</kbd>+<kbd>X</kbd> drücken, loslassen, dann <kbd>Strg</kbd>+<kbd>S</kbd>.

| Tasten | Wirkung |
|---|---|
| `C-x C-f` | Datei öffnen |
| `C-x C-s` | Datei speichern |
| `C-x C-c` | Emacs beenden (fragt bei Änderungen, ob gespeichert werden soll) |
| `C-g` | Aktuellen Befehl abbrechen |
| `C-/` | Letzte Änderung rückgängig machen |
| `C-s` | Text suchen, erneut `C-s` für den nächsten Treffer |
| `M-%` | Suchen und ersetzen |
| `C-k` | Rest der Zeile ausschneiden |
| `C-y` | Ausgeschnittenen Text einfügen |
| `C-h t` | Übung öffnen |

**Tipp:** Im Menü **Options → Use CUA Keys (Cut/Paste with C-x/C-c/C-v)** schaltest du die gewohnten Kürzel zum Ausschneiden, Kopieren und Einfügen ein. Mit **Options → Save Options** bleibt die Einstellung erhalten.

### 7. Systemdateien bearbeiten

Dateien unter `/etc` gehören `root`. Mit `sudoedit` bearbeitest du eine Kopie mit deinen normalen Rechten, beim Beenden wird sie zurückgeschrieben. Die Datei `/etc/hosts` dient hier nur als Beispiel.

```bash
SUDO_EDITOR="emacs -nw" sudoedit /etc/hosts
```

## Optional: Emacs einrichten

### 8. Ordner für die Einstellungen anlegen

Emacs liest seine Einstellungen aus `~/.config/emacs`. Der Ordner existiert anfangs nicht.

```bash
mkdir -p ~/.config/emacs
```

### 9. Einstellungsdatei anlegen

Die Datei `init.el` wird in Emacs Lisp geschrieben. Die Einstellungen blenden die Begrüßungsseite aus, zeigen Zeilennummern an und fügen statt eines Tabulators vier Leerzeichen ein.

```bash
nano ~/.config/emacs/init.el
```

Hast du die Datei schon mit eigenen Einstellungen, lösche deren alten Inhalt zuerst oder ergänze nur die fehlenden Zeilen. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```lisp
(setq inhibit-startup-screen t)
(global-display-line-numbers-mode 1)
(setq-default indent-tabs-mode nil)
(setq-default tab-width 4)
```

**Prüfen:** Beim nächsten Start von Emacs erscheint keine Begrüßungsseite, und links stehen die Zeilennummern.

```bash
emacs ~/.config/emacs/init.el &
```

### 10. Emacs als Standard-Editor festlegen

Programme wie `crontab -e` oder `git commit` lesen den gewünschten Editor aus der Umgebungsvariablen `EDITOR`. Dazu kommt Emacs (im Terminal-Modus) in die Datei `~/.bashrc`, die bei jedem neuen Terminal gelesen wird.

```bash
nano ~/.bashrc
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei und füge in einer eigenen Zeile an (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```bash
export EDITOR="emacs -nw"
```

**Prüfen:** Ein neues Terminal öffnen. Die Ausgabe lautet `emacs -nw`.

```bash
echo "$EDITOR"
```

## Deinstallieren

### 1. Eintrag als Standard-Editor entfernen

Löscht die Zeile aus Schritt 10 wieder aus `~/.bashrc`, falls du sie angelegt hast.

```bash
nano ~/.bashrc
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `EDITOR` und drücke <kbd>Enter</kbd>. Lösche die Zeile `export EDITOR="emacs -nw"` mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 2. Eigene Einstellungen entfernen

Löscht die Einstellungen und alle darin installierten Erweiterungen. Die älteren Orte `~/.emacs` und `~/.emacs.d` werden gleich mit entfernt, falls vorhanden. **Achtung:** Deine Einstellungen gehen dabei verloren.

```bash
rm -rf ~/.config/emacs ~/.emacs.d ~/.emacs
```

### 3. Emacs entfernen

`purge` entfernt auch die Konfigurationsdateien des Pakets.

```bash
sudo apt purge emacs-pgtk
```

### 4. Nicht mehr benötigte Pakete entfernen

Entfernt die gemeinsam genutzten Emacs-Pakete (z. B. `emacs-common`), die nur für Emacs installiert wurden. `--purge` löscht dabei auch deren Konfigurationsdateien unter `/etc/emacs`.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
emacs --version
```
