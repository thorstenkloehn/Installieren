# VSCodium

VSCodium ist ein Code-Editor, der aus demselben offenen Quellcode gebaut wird wie [Visual Studio Code](vscode.md), aber ohne die Zusätze von Microsoft. Er sieht aus und funktioniert wie VS Code, sendet aber keine Nutzungsdaten (Telemetrie) an Microsoft und steht vollständig unter der freien MIT-Lizenz.

## Vorbemerkungen

- **Unterschied zu VS Code:** Microsoft baut VS Code aus dem offenen Quellcode und fügt eigene Teile hinzu: Telemetrie, das Logo und die Anbindung an den eigenen Marktplatz für Erweiterungen. VSCodium lässt diese Teile weg. Einstellungen, Tastenkürzel und Bedienung sind gleich.
- **Erweiterungen aus Open VSX:** Den Marktplatz von Microsoft dürfen laut dessen Nutzungsbedingungen nur Microsoft-Produkte verwenden. VSCodium holt Erweiterungen deshalb von <https://open-vsx.org>, einem offenen Verzeichnis der Eclipse Foundation. Die meisten verbreiteten Erweiterungen gibt es dort auch. Einige Erweiterungen von Microsoft fehlen, z. B. Remote-SSH, Live Share und Pylance.
- **Installation über das Paketarchiv:** VSCodium ist nicht in den Ubuntu-Paketquellen enthalten. Diese Anleitung bindet das Paketarchiv ein, das auf <https://vscodium.com> für Debian und Ubuntu genannt wird. VSCodium wird danach mit `apt` verwaltet und aktualisiert. Den Snap `codium` gibt es auch, er hinkt aber mehrere Monate hinterher (September 2026: Snap 1.105, Paketarchiv 1.135).
- **Neben VS Code:** VSCodium verwendet eigene Ordner für Einstellungen und Erweiterungen und den Befehl `codium`. Es lässt sich deshalb gleichzeitig mit VS Code installieren.
- **Version:** Getestet mit VSCodium **1.135.06055** unter Ubuntu 26.04.

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

### 3. Schlüssel des Paketarchivs einrichten

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich aus dem VSCodium-Archiv stammen und nicht verändert wurden. `wget` speichert ihn mit `-O` direkt im Ordner für Paketschlüssel. Der Schlüssel liegt als Text vor, `apt` liest ihn mit der Endung `.asc` ohne Umwandlung.

```bash
sudo wget -O /usr/share/keyrings/vscodium.asc https://gitlab.com/paulcarroty/vscodium-deb-rpm-repo/raw/master/pub.gpg
```

**Prüfen:** Die erste Zeile lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -n 1 /usr/share/keyrings/vscodium.asc
```

### 4. Paketarchiv eintragen

Legt eine Datei an, die `apt` mitteilt, wo die VSCodium-Pakete liegen und mit welchem Schlüssel sie geprüft werden.

```bash
sudo nano /etc/apt/sources.list.d/vscodium.sources
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://download.vscodium.com/debs
Suites: vscodium
Components: main
Architectures: amd64
Signed-By: /usr/share/keyrings/vscodium.asc
```

### 5. Paketlisten erneut aktualisieren

Jetzt liest `apt` auch das neue Paketarchiv ein.

```bash
sudo apt update
```

**Prüfen:** In der Ausgabe erscheinen Zeilen mit `https://download.vscodium.com/debs vscodium`, ohne Fehlermeldung.

### 6. VSCodium installieren

Installiert VSCodium. Der Befehl zum Starten im Terminal heißt `codium`.

```bash
sudo apt install codium
```

**Prüfen:** Die erste Zeile der Ausgabe ist die Versionsnummer, z. B. `1.135.06055`. Die ersten drei Stellen entsprechen der Version von VS Code, auf der VSCodium beruht.

```bash
codium --version
```

## Erste Schritte

### 7. VSCodium starten

Öffnet VSCodium. Alternativ findest du das Programm im Anwendungsmenü unter „VSCodium“.

```bash
codium
```

### 8. Deutsches Sprachpaket installieren

VSCodium ist zunächst auf Englisch. Das deutsche Sprachpaket von Microsoft steht auch in Open VSX und lässt sich deshalb genauso installieren wie in VS Code.

```bash
codium --install-extension MS-CEINTL.vscode-language-pack-de
```

**Prüfen:** Die Ausgabe endet mit `Extension 'ms-ceintl.vscode-language-pack-de' v… was successfully installed.` Eine vorangehende Meldung `DeprecationWarning` kannst du übergehen.

### 9. Oberfläche auf Deutsch umstellen

Drücke in VSCodium <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>P</kbd>, gib `Configure Display Language` ein, wähle **Deutsch** aus und starte VSCodium neu.

**Prüfen:** Die Menüs heißen jetzt „Datei“, „Bearbeiten“ usw.

### 10. Projektordner öffnen

VSCodium arbeitet am besten mit ganzen Ordnern. Wechsle im Terminal in deinen Projektordner und öffne ihn mit `codium .` (der Punkt steht für den aktuellen Ordner). Hier als Beispiel dieser Ordner mit den Anleitungen:

```bash
cd ~/Installieren
```

```bash
codium .
```

Beim ersten Öffnen eines Ordners fragt VSCodium, ob du den Autoren vertraust. Antworte nur bei eigenen oder bekannten Projekten mit „Ja“, sonst können Erweiterungen dort Code ausführen.

### 11. Erweiterungen suchen

Drücke <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>X</kbd>. Die Seitenleiste zeigt die Erweiterungen aus Open VSX. Gib z. B. `python` ein und installiere eine Erweiterung mit **Installieren**. Den Namen einer Erweiterung (z. B. `ms-python.python`) kann man auch wie in Schritt 8 mit `codium --install-extension` angeben.

**Prüfen:** Die Liste aller installierten Erweiterungen enthält das Sprachpaket aus Schritt 8.

```bash
codium --list-extensions
```

Alle Tastenkürzel sind dieselben wie in VS Code. Eine Tabelle der wichtigsten steht in der Anleitung [Visual Studio Code](vscode.md#10-die-wichtigsten-tastenkürzel-kennenlernen).

## Optional: VSCodium für Git verwenden

### 12. VSCodium als Editor für Git festlegen

Git öffnet für Commit-Nachrichten einen Editor. Mit dieser Einstellung ist das VSCodium. `--wait` sorgt dafür, dass Git wartet, bis du den Tab mit der Nachricht schließt.

```bash
git config --global core.editor "codium --wait"
```

**Prüfen:** Die Ausgabe lautet `codium --wait`.

```bash
git config --global core.editor
```

## Aktualisieren

VSCodium wird zusammen mit den anderen Paketen aktualisiert:

```bash
sudo apt update
```

```bash
sudo apt upgrade
```

## Deinstallieren

### 1. Git-Einstellung zurücksetzen

Entfernt VSCodium als Git-Editor, falls du Schritt 12 ausgeführt hast. Git nutzt danach wieder den Standard-Editor des Systems.

```bash
git config --global --unset core.editor
```

### 2. VSCodium entfernen

Entfernt das Programm.

```bash
sudo apt purge codium
```

### 3. Paketarchiv und Schlüssel entfernen

Ohne diese Dateien sucht `apt` nicht mehr im VSCodium-Archiv nach Updates.

```bash
sudo rm /etc/apt/sources.list.d/vscodium.sources /usr/share/keyrings/vscodium.asc
```

### 4. Paketlisten aktualisieren

Damit `apt` das entfernte Paketarchiv auch aus seinen Listen streicht.

```bash
sudo apt update
```

### 5. Eigene Einstellungen und Erweiterungen entfernen

VSCodium speichert Einstellungen in `~/.config/VSCodium` und Erweiterungen in `~/.vscode-oss`. **Achtung:** Deine Einstellungen und alle installierten Erweiterungen gehen dabei verloren. Die Ordner von VS Code (`~/.config/Code` und `~/.vscode`) bleiben unberührt.

```bash
rm -rf ~/.config/VSCodium ~/.vscode-oss
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
codium --version
```
