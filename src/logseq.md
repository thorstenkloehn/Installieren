# Logseq

Logseq ist ein Programm für Notizen und persönliches Wissensmanagement. Notizen werden als verschachtelte Stichpunkte (Blöcke) geschrieben und über Links und Tags miteinander verknüpft. Alle Inhalte liegen als gewöhnliche Markdown-Dateien in einem Ordner auf deinem Rechner, nicht in einer Cloud.

## Vorbemerkungen

- **Kein apt-Paket:** Logseq ist nicht in den Ubuntu-Paketquellen enthalten. Diese Anleitung installiert es deshalb als Snap. Das Snap wird unter dem Herausgeber „Logseq, Inc.“ veröffentlicht.
- **Zwei Versionen:** Logseq teilt sich derzeit in zwei Linien auf:
  - **Logseq 0.10** – die stabile Version, die Notizen als Markdown-Dateien speichert. Diese Version installiert die Anleitung.
  - **Logseq 2.0** – eine neue Version, die Notizen in einer Datenbank speichert. Sie ist noch eine **Beta-Version** und nur als AppImage von der GitHub-Seite des Projekts erhältlich. Für wichtige Notizen ist sie noch nicht zu empfehlen.
- **Graph:** Logseq nennt einen Ordner mit Notizen einen **Graph**. Du kannst mehrere Graphen anlegen, z. B. einen privaten und einen beruflichen.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` im nächsten Schritt die aktuelle Version von snapd kennt.

```bash
sudo apt update
```

### 2. Snap-Unterstützung sicherstellen

`snapd` ist der Dienst, der Snaps installiert und aktualisiert. Unter Ubuntu ist er normalerweise schon vorhanden. Dann meldet `apt` das nur.

```bash
sudo apt install snapd
```

### 3. Logseq installieren

Installiert Logseq als Snap. Das Snap läuft in einem abgeschotteten Bereich und darf nur auf dein Home-Verzeichnis (ohne versteckte Ordner) und auf Wechseldatenträger zugreifen. Für Notizen reicht das.

```bash
sudo snap install logseq
```

**Prüfen:** Die Ausgabe zeigt Name und Version, z. B. `0.10.15`.

```bash
snap list logseq
```

## Erste Schritte

### 4. Ordner für die Notizen anlegen

Logseq braucht einen Ordner, in dem es die Notizen ablegt. Er muss in deinem Home-Verzeichnis liegen und darf nicht mit einem Punkt beginnen, sonst hat das Snap keinen Zugriff. Hier als Beispiel `~/Dokumente/Logseq`.

```bash
mkdir -p ~/Dokumente/Logseq
```

### 5. Logseq starten

Startet Logseq. Alternativ findest du das Programm im Anwendungsmenü unter „Logseq“.

```bash
logseq &
```

**Prüfen:** Es öffnet sich ein Fenster mit einer Begrüßung und der Schaltfläche **Choose a folder**.

### 6. Ordner als Graph auswählen

Klicke auf **Choose a folder** und wähle den Ordner `~/Dokumente/Logseq` aus Schritt 4. Logseq richtet darin seine Unterordner ein und öffnet die Tagesseite für heute.

**Prüfen:** Im Ordner liegen jetzt die Unterordner `journals` (Tagesseiten), `pages` (eigene Seiten) und `logseq` (Einstellungen des Graphen).

```bash
ls ~/Dokumente/Logseq
```

Die Unterordner `journals` und `pages` erscheinen erst, sobald du den ersten Text geschrieben hast.

### 7. Deutsche Oberfläche einstellen

Die Oberfläche ist zunächst auf Englisch. Klicke oben rechts auf die drei Punkte **…** → **Settings**. Wähle im Reiter **General** bei **Language** den Eintrag **Deutsch**. Die Umstellung wirkt sofort.

### 8. Die Grundlagen kennenlernen

Jeder Absatz in Logseq ist ein **Block**. Blöcke lassen sich einrücken, verlinken und als Aufgabe markieren.

| Eingabe / Tasten | Wirkung |
|---|---|
| <kbd>Enter</kbd> | Neuen Block beginnen |
| <kbd>Umschalt</kbd>+<kbd>Enter</kbd> | Neue Zeile im selben Block |
| <kbd>Tab</kbd> / <kbd>Umschalt</kbd>+<kbd>Tab</kbd> | Block einrücken / ausrücken |
| `[[Seitenname]]` | Link auf eine Seite; existiert sie nicht, wird sie angelegt |
| `#Tag` | Schlagwort, ebenfalls ein Link auf eine gleichnamige Seite |
| `/` | Menü mit Befehlen öffnen, z. B. Datum, Aufgabe, Überschrift |
| `TODO ` am Blockanfang | Block wird zur Aufgabe mit Kontrollkästchen |
| <kbd>Strg</kbd>+<kbd>Enter</kbd> | Aufgabenstatus umschalten (TODO → DOING → DONE) |
| <kbd>Strg</kbd>+<kbd>K</kbd> | Suche über alle Seiten und Blöcke |
| <kbd>G</kbd>, dann <kbd>J</kbd> | Zu den Tagesseiten springen (außerhalb eines Blocks) |

**Prüfen:** Schreibe auf der Tagesseite `Test mit [[Erste Seite]]` und klicke dann auf den Link. Logseq öffnet die neue Seite „Erste Seite“ und zeigt unten unter **Verlinkte Referenzen**, dass die Tagesseite auf sie verweist.

## Das Dateiformat

### 9. Eine Seite als Datei ansehen

Logseq speichert jede Seite als Markdown-Datei, aber in einer besonderen Form: Jeder Block ist ein Listenpunkt (`- `), eingerückte Blöcke sind mit Tabulatoren eingerückt. Tagesseiten liegen in `journals` und heißen nach dem Datum (z. B. `2026_09_23.md`), alle anderen Seiten liegen in `pages`. Dieser Befehl zeigt die Seite „Erste Seite“ aus Schritt 8:

```bash
cat ~/Dokumente/Logseq/pages/Erste\ Seite.md
```

**Prüfen:** Die Datei beginnt mit `- `. Hast du auf der Seite etwas geschrieben, steht jeder Block in einer eigenen Zeile mit `- `.

Weitere Bausteine des Formats:

| Schreibweise | Bedeutung |
|---|---|
| `- Text` | Ein Block |
| `[[Seite]]`, `#Tag` | Links auf andere Seiten |
| `TODO Text`, `DONE Text` | Aufgabe mit ihrem Status |
| `schluessel:: wert` | Eigenschaft (Property). Steht sie in der ersten Zeile der Datei, gilt sie für die ganze Seite, sonst für den Block darüber. |
| `id:: 6512…` | Kennung eines Blocks, die Logseq anlegt, sobald ein Block von anderswo verlinkt wird |

Die Einstellungen des Graphen stehen in `logseq/config.edn`, einer Textdatei im EDN-Format (einer Schreibweise aus der Programmiersprache Clojure). Weil alles aus Textdateien besteht, kannst du die Notizen auch mit einem Editor lesen oder mit [Git](git-cgit.md) versionieren. Beim Wechsel zu [Obsidian](obsidian.md) lassen sich die Dateien meist direkt weiterverwenden. Nur die Listenpunkt-Struktur und die Schreibweise `schluessel:: wert` sind dort ungewohnt.

## Optional: Notizen sichern

Weil Logseq alle Notizen als Markdown-Dateien speichert, reicht es, den Ordner `~/Dokumente/Logseq` in deine normale Datensicherung aufzunehmen. Die Dateien lassen sich auch ohne Logseq mit jedem Texteditor öffnen, z. B. mit [GNU nano](nano.md).

## Aktualisieren

Snaps aktualisieren sich automatisch im Hintergrund. Sofort aktualisieren kannst du mit:

```bash
sudo snap refresh logseq
```

## Deinstallieren

### 1. Logseq entfernen

Entfernt das Snap. `--purge` verhindert, dass Snap vorher eine Sicherungskopie anlegt, und löscht auch die Programmeinstellungen, die das Snap unter `~/snap/logseq` gespeichert hat. Deine Notizen in `~/Dokumente/Logseq` bleiben erhalten.

```bash
sudo snap remove --purge logseq
```

**Prüfen:** Die Ausgabe meldet, dass kein Snap namens `logseq` installiert ist.

```bash
snap list logseq
```

### 2. Optional: Notizen löschen

**Achtung:** Dieser Befehl löscht alle Notizen des Graphen endgültig. Nur ausführen, wenn du sie nicht mehr brauchst oder vorher gesichert hast.

```bash
rm -rf ~/Dokumente/Logseq
```
