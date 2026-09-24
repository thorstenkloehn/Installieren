# SiYuan

SiYuan ist ein Programm für Notizen und persönliches Wissensmanagement. Notizen bestehen aus Blöcken, die sich untereinander verlinken, einbetten und in Datenbank-Ansichten (Tabelle, Kanban, Kalender) auswerten lassen. Die Daten liegen lokal auf deinem Rechner.

## Vorbemerkungen

- **Kein apt-Paket und kein Snap:** SiYuan ist weder in den Ubuntu-Paketquellen noch als Snap erhältlich. Die Entwickler veröffentlichen aber auf GitHub ein fertiges `.deb`-Paket. Diese Anleitung installiert dieses Paket mit `apt`, damit die nötigen Abhängigkeiten automatisch mitinstalliert werden.
- **Version:** Die Befehle verwenden die Version **3.8.5**. Ist eine neuere Version erschienen, ersetzt du in den Befehlen die Versionsnummer. Die aktuelle Version steht auf der Seite <https://github.com/siyuan-note/siyuan/releases/latest>.
- **Speicherplatz:** Das installierte Programm belegt etwa 700 MB.
- **Arbeitsbereich:** SiYuan speichert alle Notizen in einem Ordner, dem **Arbeitsbereich** (standardmäßig `~/SiYuan`). Die Notizen liegen dort in einem eigenen Format (`.sy`-Dateien), nicht als Markdown. Über das Menü lassen sie sich aber jederzeit als Markdown exportieren.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Abhängigkeiten kennt, die SiYuan braucht.

```bash
sudo apt update
```

### 2. In den Download-Ordner wechseln

Die Dateien der nächsten Schritte werden hier abgelegt.

```bash
cd ~/Downloads
```

### 3. Paket herunterladen

Lädt das `.deb`-Paket für 64-Bit-PCs (amd64) von der GitHub-Seite des Projekts herunter. Die Datei ist etwa 200 MB groß.

```bash
wget https://github.com/siyuan-note/siyuan/releases/download/v3.8.5/siyuan-3.8.5-linux.deb
```

### 4. Prüfsummen herunterladen

Die Datei enthält für jede Download-Datei eine Prüfsumme. Damit lässt sich feststellen, ob das Paket vollständig und unverändert angekommen ist.

```bash
wget https://github.com/siyuan-note/siyuan/releases/download/v3.8.5/SHA256SUMS.txt
```

### 5. Paket prüfen

Berechnet die Prüfsumme des heruntergeladenen Pakets und vergleicht sie mit der Liste. `--ignore-missing` überspringt die Einträge für Dateien, die du nicht heruntergeladen hast (z. B. für andere Systeme).

```bash
sha256sum --ignore-missing -c SHA256SUMS.txt
```

**Prüfen:** Die Ausgabe lautet `siyuan-3.8.5-linux.deb: OK`. Steht dort `FEHLSCHLAG` bzw. `FAILED`, lösche die Datei und lade sie erneut herunter.

### 6. SiYuan installieren

Installiert das Paket. Das `./` vor dem Dateinamen ist wichtig: Es sagt `apt`, dass es eine lokale Datei installieren soll und nicht nach einem Paket in den Paketquellen suchen. Fehlende Abhängigkeiten lädt `apt` automatisch aus den Ubuntu-Paketquellen nach. Das Paket richtet außerdem ein AppArmor-Profil ein, das SiYuan unter Ubuntu zum Starten braucht.

```bash
sudo apt install ./siyuan-3.8.5-linux.deb
```

**Prüfen:** Die Ausgabe zeigt Paketname und Version `3.8.5`.

```bash
dpkg -l siyuan | tail -n 1
```

### 7. Heruntergeladene Dateien löschen

Nach der Installation werden die Dateien nicht mehr gebraucht.

```bash
rm siyuan-3.8.5-linux.deb SHA256SUMS.txt
```

## Erste Schritte

### 8. SiYuan starten

Startet SiYuan. Alternativ findest du das Programm im Anwendungsmenü unter „SiYuan“.

```bash
siyuan &
```

### 9. Arbeitsbereich festlegen

Beim ersten Start fragt SiYuan, wo der Arbeitsbereich liegen soll. Der Vorschlag `~/SiYuan` ist in Ordnung. Bestätige ihn.

**Prüfen:** SiYuan öffnet sich mit einem Notizbuch mit Einführungsdokumenten. Im Arbeitsbereich liegt jetzt unter anderem der Ordner `data`.

```bash
ls ~/SiYuan
```

### 10. Deutsche Oberfläche einstellen

Ist die Oberfläche nicht schon auf Deutsch, öffne die Einstellungen mit <kbd>Alt</kbd>+<kbd>P</kbd> oder über das Menü oben links. Wähle unter **Appearance** (**Erscheinungsbild**) bei **Language** (**Sprache**) den Eintrag **Deutsch**. SiYuan lädt die Oberfläche danach neu.

### 11. Die Grundlagen kennenlernen

Jeder Absatz, jede Überschrift und jeder Listenpunkt ist in SiYuan ein **Block**. Blöcke lassen sich über ihre Kennung verlinken und an anderer Stelle einbetten.

| Eingabe / Tasten | Wirkung |
|---|---|
| `/` | Menü mit Befehlen öffnen, z. B. Überschrift, Tabelle, Datenbank, Aufgabe |
| `((` | Auf einen anderen Block verweisen (Suche nach dem Block öffnet sich) |
| `[[` | Auf ein anderes Dokument verweisen |
| `#Tag#` | Schlagwort vergeben |
| `{{` | Einen anderen Block einbetten (sein Inhalt wird hier angezeigt) |
| <kbd>Strg</kbd>+<kbd>P</kbd> | Suche über alle Notizen |
| <kbd>Alt</kbd>+<kbd>5</kbd> | Tagesnotiz für heute öffnen |
| <kbd>Alt</kbd>+<kbd>P</kbd> | Einstellungen öffnen |

**Prüfen:** Lege über das **+** neben einem Notizbuch ein neues Dokument an, tippe `[[` und wähle ein Einführungsdokument aus. Ein Klick auf den Link öffnet das Dokument.

## Optional: Notizen sichern

SiYuan legt im Arbeitsbereich regelmäßig eigene Datensicherungen an (Einstellungen → **Datenverlauf** und **Datenrepository**). Zusätzlich solltest du den Ordner `~/SiYuan` in deine normale Datensicherung aufnehmen. Sicherer ist es, SiYuan vorher zu beenden, damit keine Datei gerade geschrieben wird.

## Aktualisieren

SiYuan zeigt beim Start einen Hinweis, wenn eine neue Version erschienen ist. Weil das Paket nicht aus einem Paketarchiv stammt, aktualisiert `sudo apt upgrade` SiYuan **nicht**. Zum Aktualisieren wiederholst du die Schritte 2 bis 7 mit der neuen Versionsnummer. Das neue Paket ersetzt das alte, deine Notizen im Arbeitsbereich bleiben erhalten.

## Deinstallieren

### 1. SiYuan beenden

Schließe alle SiYuan-Fenster. SiYuan läuft eventuell noch im Hintergrund weiter (Symbol in der oberen Leiste). Beende es dort über das Symbol mit **Beenden**.

**Prüfen:** Die Ausgabe ist leer, es läuft kein SiYuan-Prozess mehr.

```bash
pgrep -ai siyuan
```

### 2. SiYuan entfernen

Entfernt das Programm unter `/opt/SiYuan`, den Befehl `siyuan` und das AppArmor-Profil.

```bash
sudo apt purge siyuan
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten, die nur für SiYuan installiert wurden.

```bash
sudo apt autoremove
```

### 4. Programmeinstellungen entfernen

SiYuan speichert seine Programmeinstellungen, die Liste der Arbeitsbereiche und ein Protokoll in `~/.config/siyuan` sowie Daten der Programmoberfläche in `~/.config/SiYuan-Electron`. Deine Notizen sind dort nicht enthalten.

```bash
rm -rf ~/.config/siyuan ~/.config/SiYuan-Electron
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
siyuan --version
```

### 5. Optional: Notizen löschen

**Achtung:** Dieser Befehl löscht den Arbeitsbereich mit allen Notizen und Sicherungen endgültig. Nur ausführen, wenn du sie nicht mehr brauchst oder vorher exportiert bzw. gesichert hast.

```bash
rm -rf ~/SiYuan
```
