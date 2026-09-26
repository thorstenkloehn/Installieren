# Zettlr

Zettlr ist ein Markdown-Editor für längere Texte und Wissenssammlungen nach dem Zettelkasten-Prinzip: Notizen sind einfache Markdown-Dateien in einem Ordner, die über Links und Schlagwörter miteinander verbunden werden. Mit eingebauter Literaturverwaltung und Export nach PDF oder Word ist Zettlr besonders für wissenschaftliches Schreiben gedacht.

## Vorbemerkungen

- **Kein apt-Paket, kein Snap:** Zettlr ist nicht in den Ubuntu-Paketquellen enthalten. Das Projekt veröffentlicht eine `.deb`-Datei auf GitHub. Sie wird mit `apt` installiert, so kümmert sich `apt` um Abhängigkeiten und die spätere Deinstallation.
- **Version:** Getestet mit Zettlr **4.8.0** unter Ubuntu 26.04.
- **Größe:** Zettlr selbst ist etwa 135 MB groß. `apt` installiert zusätzlich TeX Live für den PDF-Export. Alles zusammen belegt gut 1 GB.
- **Deine Dateien bleiben lesbar:** Zettlr speichert nichts in einer eigenen Datenbank. Jede Notiz ist eine `.md`-Datei, die du auch mit jedem anderen Editor öffnen kannst.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Abhängigkeiten kennt.

```bash
sudo apt update
```

### 2. Zettlr herunterladen

Lädt das Paket für 64-Bit-PCs mit Intel- oder AMD-Prozessor in den Ordner `/tmp`. Die aktuelle Versionsnummer steht auf <https://github.com/Zettlr/Zettlr/releases>. Bei einer neueren Version ersetzt du die Nummer an beiden Stellen im Befehl.

```bash
wget -O /tmp/zettlr.deb https://github.com/Zettlr/Zettlr/releases/download/v4.8.0/Zettlr-4.8.0-amd64.deb
```

### 3. Download prüfen

Vergleicht die Prüfsumme der Datei mit dem Wert, den das Projekt in der Datei `SHA256SUMS.txt` für Version 4.8.0 veröffentlicht. So fällt auf, wenn der Download beschädigt oder verändert wurde.

```bash
echo "104e5655bd3fa26112707478c133d141aeb4058da7491c61eb3c431037deb90b  /tmp/zettlr.deb" | sha256sum -c
```

**Prüfen:** Die Ausgabe lautet `/tmp/zettlr.deb: OK`.

### 4. Zettlr installieren

Der Pfad mit `/` am Anfang sagt `apt`, dass es eine lokale Datei installieren soll. Als empfohlene Pakete kommen TeX Live (für PDF) und Pandoc mit.

```bash
sudo apt install /tmp/zettlr.deb
```

**Prüfen:** Die Ausgabe lautet `Zettlr 4.8.0`.

```bash
zettlr --version
```

### 5. XeLaTeX für den PDF-Export installieren

Zettlr erzeugt PDF-Dateien mit dem Satzprogramm XeLaTeX. Das in Schritt 4 mitinstallierte TeX Live enthält es nicht. Ohne dieses Paket bricht der PDF-Export mit der Meldung `'xelatex' not found` ab.

```bash
sudo apt install texlive-xetex
```

**Prüfen:** Die Ausgabe beginnt mit `XeTeX`.

```bash
xelatex --version
```

## Erste Schritte

### 6. Ordner für die Notizen anlegen

Zettlr arbeitet mit gewöhnlichen Ordnern, die es **Arbeitsverzeichnisse** nennt. Hier als Beispiel `~/Dokumente/Zettelkasten`.

```bash
mkdir -p ~/Dokumente/Zettelkasten
```

### 7. Zettlr starten

Starte Zettlr über das Startmenü (Suchbegriff „Zettlr“) oder im Terminal:

```bash
zettlr
```

**Prüfen:** Das Fenster öffnet sich mit deutscher Oberfläche. Meldungen im Terminal wie `'--ozone-platform=wayland' is not compatible with Vulkan` sind nur Hinweise und stören nicht.

### 8. Arbeitsverzeichnis öffnen

Wähle im Menü **Datei → Arbeitsverzeichnis öffnen…** und dann den Ordner `~/Dokumente/Zettelkasten`. Er erscheint links in der Dateiliste.

### 9. Notizen anlegen und verknüpfen

Lege mit <kbd>Strg</kbd>+<kbd>N</kbd> eine neue Datei an, z. B. `Gartenprojekt`. Schreibe darin Markdown, zum Beispiel:

```markdown
# Gartenprojekt

Im Frühjahr kommen neue Beete dazu. Welche Pflanzen passen, steht in [[Pflanzenliste]].

#garten #planung
```

- `[[Pflanzenliste]]` ist ein Link auf eine andere Notiz. Mit <kbd>Strg</kbd> und Klick auf den Link öffnet Zettlr sie. Gibt es sie noch nicht, legt Zettlr sie an.
- `#garten` ist ein Schlagwort. Über die Seitenleiste findest du später alle Notizen mit demselben Schlagwort.

Zettlr speichert automatisch.

**Prüfen:** Im Ordner liegt die Notiz als Markdown-Datei.

```bash
ls ~/Dokumente/Zettelkasten
```

### 10. Als PDF exportieren

Öffne die Notiz und wähle **Datei → Exportieren…**. Wähle als Format **XeLaTeX PDF** und klicke auf **Exportieren**. Zettlr legt die PDF-Datei standardmäßig in einem temporären Ordner ab und öffnet sie gleich. Unter **Datei → Einstellungen… → Import und Export** stellst du ein, dass die PDF-Datei neben der Notiz gespeichert wird.

## Aktualisieren

Lade die neue `.deb`-Datei wie in Schritt 2 herunter, prüfe sie wie in Schritt 3 mit der Prüfsumme aus `SHA256SUMS.txt` der neuen Version und installiere sie wie in Schritt 4. `apt` ersetzt dabei die alte Version. Deine Notizen und Einstellungen bleiben erhalten.

## Deinstallieren

### 1. Zettlr und XeLaTeX entfernen

`purge` entfernt die Programme samt ihrer Systemdateien.

```bash
sudo apt purge zettlr texlive-xetex
```

### 2. Nicht mehr benötigte Pakete entfernen

Entfernt TeX Live, Pandoc und weitere Pakete, die mit Zettlr installiert wurden, sofern kein anderes Programm sie braucht. Lies vor dem Bestätigen die Liste. Ist z. B. [Sphinx](sphinx.md) installiert, bleibt TeX Live stehen, weil Sphinx es für seinen PDF-Export vorschlägt.

```bash
sudo apt autoremove --purge
```

### 3. Persönliche Einstellungen löschen

Entfernt Einstellungen, Zwischenspeicher und Protokolle von Zettlr. Deine Notizen in `~/Dokumente/Zettelkasten` bleiben erhalten.

```bash
rm -r ~/.config/Zettlr
```

### 4. Heruntergeladene Datei löschen

```bash
rm /tmp/zettlr.deb
```

**Prüfen:** Der Befehl `zettlr` wird nicht mehr gefunden.

```bash
zettlr --version
```
