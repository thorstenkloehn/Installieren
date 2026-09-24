# Visual Studio Code

Visual Studio Code (kurz VS Code) ist ein kostenloser Code-Editor von Microsoft mit grafischer Oberfläche. Er unterstützt viele Programmiersprachen und lässt sich über Erweiterungen an fast jede Aufgabe anpassen, etwa Git, Debugging oder Markdown-Vorschau.

## Installation

VS Code ist nicht in den Ubuntu-Paketquellen enthalten. Diese Anleitung bindet deshalb das offizielle Paketarchiv von Microsoft ein. Der Vorteil: VS Code wird danach wie jedes andere Paket mit `apt` verwaltet und bei `sudo apt upgrade` automatisch aktualisiert. Eine Alternative über Snap steht [weiter unten](#alternative-installation-über-snap).

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

### 3. Schlüssel von Microsoft einrichten

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich von Microsoft stammen und nicht verändert wurden. `wget` speichert ihn mit `-O` direkt im Ordner für Paketschlüssel. `apt` liest die Textform mit der Endung `.asc` ohne Umwandlung.

```bash
sudo wget -O /usr/share/keyrings/microsoft.asc https://packages.microsoft.com/keys/microsoft.asc
```

**Prüfen:** Die erste Zeile lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -n 1 /usr/share/keyrings/microsoft.asc
```

### 4. Paketarchiv von Microsoft eintragen

Legt eine Datei an, die `apt` mitteilt, wo die VS-Code-Pakete liegen und mit welchem Schlüssel sie geprüft werden.

```bash
sudo nano /etc/apt/sources.list.d/vscode.sources
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://packages.microsoft.com/repos/code
Suites: stable
Components: main
Architectures: amd64
Signed-By: /usr/share/keyrings/microsoft.asc
```

### 5. Paketlisten erneut aktualisieren

Jetzt liest `apt` auch das neue Paketarchiv ein.

```bash
sudo apt update
```

**Prüfen:** In der Ausgabe erscheint eine Zeile mit `packages.microsoft.com/repos/code`, ohne Fehlermeldung.

### 6. VS Code installieren

Installiert VS Code. Der Befehl zum Starten im Terminal heißt `code`.

```bash
sudo apt install code
```

**Prüfen:** Die erste Zeile der Ausgabe ist die Versionsnummer, z. B. `1.139.0`.

```bash
code --version
```

## Erste Schritte

### 7. VS Code starten

Öffnet VS Code. Alternativ findest du das Programm im Anwendungsmenü unter „Visual Studio Code“.

```bash
code
```

### 8. Deutsche Oberfläche einrichten

VS Code ist zunächst auf Englisch. Dieser Befehl installiert das offizielle deutsche Sprachpaket als Erweiterung.

```bash
code --install-extension MS-CEINTL.vscode-language-pack-de
```

Danach in VS Code <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>P</kbd> drücken, `Configure Display Language` eingeben, **Deutsch** auswählen und VS Code neu starten.

**Prüfen:** Die Menüs heißen jetzt „Datei“, „Bearbeiten“ usw.

### 9. Projektordner öffnen

VS Code arbeitet am besten mit ganzen Ordnern. Wechsle im Terminal in deinen Projektordner und öffne ihn mit `code .` (der Punkt steht für den aktuellen Ordner). Hier als Beispiel dieser Ordner mit den Anleitungen:

```bash
cd ~/Installieren
```

```bash
code .
```

Beim ersten Öffnen eines Ordners fragt VS Code, ob du den Autoren vertraust. Nur bei eigenen oder bekannten Projekten mit „Ja“ antworten, sonst können Erweiterungen dort Code ausführen.

### 10. Die wichtigsten Tastenkürzel kennenlernen

| Tasten | Wirkung |
|---|---|
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>P</kbd> | Befehlspalette: jeden Befehl über seinen Namen suchen |
| <kbd>Strg</kbd>+<kbd>P</kbd> | Datei im Projekt schnell öffnen |
| <kbd>Strg</kbd>+<kbd>S</kbd> | Datei speichern |
| <kbd>Strg</kbd>+<kbd>F</kbd> | In der Datei suchen |
| <kbd>Strg</kbd>+<kbd>H</kbd> | In der Datei ersetzen |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>F</kbd> | Im ganzen Projekt suchen |
| <kbd>Strg</kbd>+<kbd>Ö</kbd> | Terminal ein- und ausblenden |
| <kbd>Strg</kbd>+<kbd>B</kbd> | Seitenleiste ein- und ausblenden |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>X</kbd> | Erweiterungen anzeigen und installieren |

## Optional: VS Code für Git verwenden

### 11. VS Code als Editor für Git festlegen

Git öffnet für Commit-Nachrichten einen Editor. Mit dieser Einstellung ist das VS Code. `--wait` sorgt dafür, dass Git wartet, bis du den Tab mit der Nachricht schließt.

```bash
git config --global core.editor "code --wait"
```

**Prüfen:** Die Ausgabe lautet `code --wait`.

```bash
git config --global core.editor
```

## Aktualisieren

VS Code wird zusammen mit den anderen Paketen aktualisiert:

```bash
sudo apt update
```

```bash
sudo apt upgrade
```

## Alternative: Installation über Snap

Statt über das Paketarchiv von Microsoft lässt sich VS Code auch als Snap installieren. Snaps aktualisieren sich selbstständig im Hintergrund. `--classic` ist nötig, weil ein Code-Editor auf alle Dateien und Programme zugreifen muss. Nutze nur einen der beiden Wege, nicht beide gleichzeitig.

```bash
sudo snap install code --classic
```

**Prüfen:**

```bash
code --version
```

Deinstallieren der Snap-Version:

```bash
sudo snap remove code
```

## Deinstallieren

### 1. Git-Einstellung zurücksetzen

Entfernt VS Code als Git-Editor, falls du Schritt 11 ausgeführt hast. Git nutzt danach wieder den Standard-Editor des Systems.

```bash
git config --global --unset core.editor
```

### 2. VS Code entfernen

Entfernt das Programm.

```bash
sudo apt purge code
```

### 3. Paketarchiv und Schlüssel entfernen

Ohne diese Dateien sucht `apt` nicht mehr bei Microsoft nach Updates. `microsoft.gpg` stammt aus einer älteren Fassung dieser Anleitung. `-f` sorgt dafür, dass `rm` fehlende Dateien einfach überspringt.

```bash
sudo rm -f /etc/apt/sources.list.d/vscode.sources /usr/share/keyrings/microsoft.asc /usr/share/keyrings/microsoft.gpg
```

### 4. Paketlisten aktualisieren

Damit `apt` das entfernte Paketarchiv auch aus seinen Listen streicht.

```bash
sudo apt update
```

### 5. Eigene Einstellungen und Erweiterungen entfernen

VS Code speichert Einstellungen in `~/.config/Code` und Erweiterungen in `~/.vscode`. **Achtung:** Deine Einstellungen und alle installierten Erweiterungen gehen dabei verloren.

```bash
rm -rf ~/.config/Code ~/.vscode
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
code --version
```
