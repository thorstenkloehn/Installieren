# GNU nano

GNU nano ist ein kleiner Texteditor für das Terminal. Er eignet sich gut, um schnell Konfigurationsdateien zu bearbeiten, auch auf Servern ohne grafische Oberfläche.

## Installation

Unter Ubuntu ist nano meistens schon vorinstalliert. Die folgenden Schritte schaden aber nicht: Ist nano bereits vorhanden, meldet `apt` das nur.

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von nano aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. nano installieren

Installiert nano aus den offiziellen Ubuntu-Paketquellen. Die Dateien für die Syntaxhervorhebung (z. B. für Shell, Python, HTML) sind im Paket enthalten.

```bash
sudo apt install nano
```

**Prüfen:** Die Versionsnummer wird angezeigt.

```bash
nano --version
```

## Erste Schritte

### 3. Datei öffnen

Öffnet eine Datei zum Bearbeiten. Gibt es die Datei noch nicht, legt nano sie beim Speichern an.

```bash
nano test.txt
```

**Prüfen:** Oben steht der Dateiname, unten eine Leiste mit den wichtigsten Tastenkürzeln.

### 4. Die wichtigsten Tastenkürzel kennenlernen

In der unteren Leiste steht `^` für die Taste <kbd>Strg</kbd> und `M-` für die Taste <kbd>Alt</kbd>.

| Tasten | Wirkung |
|---|---|
| <kbd>Strg</kbd>+<kbd>O</kbd>, dann <kbd>Enter</kbd> | Datei speichern |
| <kbd>Strg</kbd>+<kbd>X</kbd> | nano beenden (fragt bei Änderungen, ob gespeichert werden soll) |
| <kbd>Strg</kbd>+<kbd>W</kbd> | Text suchen |
| <kbd>Strg</kbd>+<kbd>\\</kbd> | Suchen und ersetzen |
| <kbd>Strg</kbd>+<kbd>K</kbd> | Aktuelle Zeile ausschneiden |
| <kbd>Strg</kbd>+<kbd>U</kbd> | Ausgeschnittenen Text einfügen |
| <kbd>Alt</kbd>+<kbd>U</kbd> | Letzte Änderung rückgängig machen |
| <kbd>Strg</kbd>+<kbd>_</kbd> | Zu einer bestimmten Zeilennummer springen |
| <kbd>Strg</kbd>+<kbd>G</kbd> | Hilfe anzeigen |

### 5. Systemdateien bearbeiten

Dateien unter `/etc` gehören `root`. Damit du sie speichern kannst, startest du nano mit `sudo`. Die Datei `/etc/hosts` dient hier nur als Beispiel.

```bash
sudo nano /etc/hosts
```

**Prüfen:** Unten erscheint beim Speichern keine Meldung wie „Keine Berechtigung“.

## Optional: nano einrichten

### 6. Eigene Einstellungsdatei anlegen

Die Datei `~/.nanorc` gilt nur für deinen Benutzer. Die Einstellungen zeigen Zeilennummern an, rücken neue Zeilen automatisch ein und fügen statt eines Tabulators vier Leerzeichen ein.

```bash
nano ~/.nanorc
```

Hast du die Datei schon mit eigenen Einstellungen, lösche deren alten Inhalt zuerst oder ergänze nur die fehlenden Zeilen. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
set linenumbers
set autoindent
set tabsize 4
set tabstospaces
```

**Prüfen:** Beim nächsten Start von nano stehen links die Zeilennummern.

```bash
nano ~/.nanorc
```

### 7. nano als Standard-Editor festlegen

Programme wie `crontab -e` oder `git commit` öffnen den eingestellten Standard-Editor. Mit diesem Befehl wählst du aus einer Liste den Editor aus, der systemweit verwendet wird. Gib die Nummer ein, die vor `/bin/nano` steht.

```bash
sudo update-alternatives --config editor
```

**Prüfen:** Die Ausgabe zeigt als Link `/bin/nano`.

```bash
update-alternatives --query editor | grep Value
```

## Deinstallieren

### 1. Eigene Einstellungen entfernen

Löscht die persönliche Einstellungsdatei, falls du sie in Schritt 6 angelegt hast.

```bash
rm -f ~/.nanorc
```

### 2. nano entfernen

`purge` entfernt auch die systemweite Einstellungsdatei `/etc/nanorc`. **Hinweis:** Ist nano dein Standard-Editor, stellt Ubuntu automatisch auf einen anderen installierten Editor um.

```bash
sudo apt purge nano
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten, die nur für nano installiert wurden.

```bash
sudo apt autoremove
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
nano --version
```
