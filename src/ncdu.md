# ncdu

ncdu (*NCurses Disk Usage*) zeigt im Terminal, welche Ordner und Dateien wie viel Platz auf der Festplatte belegen. Es durchsucht einen Ordner einmal, sortiert den Inhalt nach Größe und lässt dich mit den Pfeiltasten hineinblättern. So findest du in wenigen Sekunden heraus, was eine volle Festplatte füllt. Überflüssige Dateien lassen sich direkt aus ncdu löschen.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert ncdu **1.22** als einzelnes Paket ohne weitere Abhängigkeiten. Es läuft kein Dienst.
- **Mit oder ohne `sudo`:** Deinen eigenen Home-Ordner kannst du ohne `sudo` untersuchen. Für Ordner wie `/var` oder das ganze System brauchst du `sudo`, sonst fehlen alle Ordner, die du nicht lesen darfst.
- **Löschen ist endgültig:** Was du in ncdu löschst, landet nicht im Papierkorb. Mit `sudo` kann ncdu auch Dateien des Systems löschen. Für einen gefahrlosen Blick gibt es die Option `-r` (Schritt 11).
- **Momentaufnahme:** ncdu zeigt den Stand zum Zeitpunkt des Durchsuchens. Änderungen danach erscheinen erst, wenn du neu einlesen lässt.
- **Englische Oberfläche:** Anzeige und Hilfe sind englisch. Zahlen erscheinen mit deutschem Komma.
- **Version:** Getestet mit ncdu **1.22** am 4. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. ncdu installieren

```bash
sudo apt install ncdu
```

### 3. Version prüfen

```bash
ncdu -V
```

**Prüfen:** Die Ausgabe lautet `ncdu 1.22`.

## Einen Ordner untersuchen

### 4. Home-Ordner durchsuchen

Ohne Angabe untersucht ncdu den Ordner, in dem du gerade stehst. Mit einem Pfad dahinter den angegebenen Ordner.

```bash
ncdu ~
```

**Prüfen:** Zuerst erscheint ein Fenster `Scanning...` mit der Zahl der gefundenen Dateien. Danach folgt die Liste, der größte Eintrag steht oben:

```text
--- /home/thorsten ---
   35,0 MiB [###########] /gross
    3,0 MiB [           ] /cache
    2,0 MiB [           ] /.versteckt
    1,0 MiB [           ]  datei.txt
 Total disk usage:  41,0 MiB   Apparent size:  41,0 MiB   Items: 9
```

Ordner beginnen mit einem Schrägstrich. Der Balken zeigt die Größe im Verhältnis zum größten Eintrag der Liste. Die unterste Zeile nennt den gesamten Platzbedarf und die Zahl der Dateien und Ordner.

### 5. Durch die Ordner blättern

| Taste | Wirkung |
|-------|---------|
| <kbd>↑</kbd> <kbd>↓</kbd> | Eintrag wählen |
| <kbd>→</kbd> oder <kbd>Enter</kbd> | in den gewählten Ordner wechseln |
| <kbd>←</kbd> | zurück in den übergeordneten Ordner |
| <kbd>i</kbd> | Einzelheiten zum gewählten Eintrag ein- und ausblenden |
| <kbd>?</kbd> | Hilfe mit allen Tasten, <kbd>q</kbd> schließt sie |
| <kbd>q</kbd> | ncdu beenden |

Gehe so vor: Öffne den obersten, also größten Ordner, dort wieder den größten und so weiter. Nach wenigen Schritten stehst du vor den Dateien, die den Platz belegen.

### 6. Anzeige umschalten

| Taste | Wirkung |
|-------|---------|
| <kbd>g</kbd> | wechselt zwischen Balken, Prozentwert, beidem und keinem |
| <kbd>c</kbd> | zeigt je Ordner die Zahl der enthaltenen Einträge |
| <kbd>s</kbd> | nach Größe sortieren, nochmals drücken kehrt die Reihenfolge um |
| <kbd>n</kbd> | nach Namen sortieren |
| <kbd>C</kbd> | nach Zahl der Einträge sortieren |
| <kbd>e</kbd> | versteckte Einträge (Name beginnt mit einem Punkt) aus- und einblenden |
| <kbd>a</kbd> | wechselt zwischen belegtem Platz und der eigentlichen Dateigröße |
| <kbd>r</kbd> | den aktuellen Ordner neu einlesen |

Ausgeblendete Einträge zählen in den Summen weiter mit.

### 7. Zeichen vor den Einträgen deuten

Manche Zeilen beginnen mit einem Kennzeichen:

| Zeichen | Bedeutung |
|---------|-----------|
| `!` | Ordner konnte nicht gelesen werden, meist fehlen die Rechte |
| `.` | ein Unterordner konnte nicht gelesen werden, die Größe ist deshalb zu klein |
| `<` | durch `--exclude` ausgeschlossen |
| `>` | liegt auf einem anderen Dateisystem und wurde wegen `-x` ausgelassen |
| `@` | weder Datei noch Ordner, z. B. eine symbolische Verknüpfung |
| `H` | harte Verknüpfung, deren Inhalt schon an anderer Stelle gezählt wurde |
| `e` | leerer Ordner |

Siehst du viele `!` und `.`, starte ncdu mit `sudo`.

## Das ganze System untersuchen

### 8. Wurzelordner durchsuchen

Die Option `-x` bleibt auf dem Dateisystem des angegebenen Ordners. Ohne sie würde ncdu auch eingehängte Laufwerke, Netzwerkfreigaben und Ordner wie `/proc` mitzählen.

```bash
sudo ncdu -x /
```

Auf dem Testrechner dauerte das rund 25 Sekunden. Ein laufendes Durchsuchen brichst du mit <kbd>q</kbd> ab.

**Prüfen:** Die Liste zeigt Ordner wie `/usr`, `/var` und `/home` mit ihrer Größe. Häufige Platzfresser auf einem Server sind `/var/log`, `/var/lib` (Datenbanken) und `/var/cache`.

### 9. Ordner ausschließen

`--exclude` lässt alles aus, was auf das Muster passt. Die Option darf mehrfach vorkommen.

```bash
ncdu --exclude node_modules --exclude '*.iso' ~
```

Ausgeschlossene Einträge stehen mit `<` und der Größe 0 in der Liste.

### 10. Änderungsdatum anzeigen

Mit `-e` merkt sich ncdu zusätzlich das Änderungsdatum, `--show-mtime` blendet es als Spalte ein. Bei Ordnern ist es das Datum der jüngsten Datei darin. So erkennst du große Ordner, die seit Jahren niemand angefasst hat.

```bash
ncdu -e --show-mtime ~
```

In dieser Betriebsart sortiert <kbd>M</kbd> nach dem Datum, <kbd>m</kbd> blendet die Spalte aus und ein.

## Aufräumen

### 11. Nur ansehen, ohne löschen zu können

Mit `-r` ist das Löschen abgeschaltet. Das ist die sichere Wahl für `sudo`.

```bash
sudo ncdu -r -x /
```

Drückst du darin <kbd>d</kbd>, meldet ncdu nur `Deletion feature disabled.`

### 12. Datei oder Ordner löschen

Starte ncdu ohne `-r`, wähle den Eintrag und drücke <kbd>d</kbd>. Es erscheint eine Rückfrage mit den Antworten `yes`, `no` und `don't ask me again`. Vorgewählt ist `no`, ein bloßes <kbd>Enter</kbd> löscht also nichts. Zum Löschen gehst du mit <kbd>←</kbd> auf `yes` und bestätigst mit <kbd>Enter</kbd>.

Ein Ordner wird mitsamt seinem ganzen Inhalt gelöscht. Lies deshalb den Namen in der Rückfrage genau. Die Antwort `don't ask me again` solltest du meiden, danach löscht jedes <kbd>d</kbd> ohne Rückfrage.

**Prüfen:** Der Eintrag verschwindet aus der Liste, die Summe in der untersten Zeile sinkt.

## Ergebnis speichern

Bei großen Dateisystemen oder auf einem Server lohnt es sich, das Durchsuchen vom Ansehen zu trennen.

### 13. Ergebnis in eine Datei schreiben

`-o` schreibt das Ergebnis in eine Datei, statt die Liste zu zeigen. `-0` unterdrückt dabei die Fortschrittsanzeige, was für Skripte und Cronjobs nötig ist.

```bash
sudo ncdu -0 -x -o ~/belegung.json /
```

**Prüfen:** Die Datei ist angelegt. Auf dem Testrechner war sie rund 44 MB groß.

```bash
ls -lh ~/belegung.json
```

### 14. Gespeichertes Ergebnis ansehen

`-f` liest die Datei ein. Das geht ohne `sudo` und auch auf einem anderen Rechner, auf den du die Datei kopiert hast.

```bash
ncdu -f ~/belegung.json
```

**Prüfen:** Rechts oben steht `[imported]`. Löschen und neu einlesen sind in dieser Ansicht nicht möglich.

## Voreinstellungen

### 15. Konfigurationsdatei anlegen

Optionen, die du immer verwenden willst, trägst du in `~/.config/ncdu/config` ein. Zuerst den Ordner anlegen:

```bash
mkdir -p ~/.config/ncdu
```

Dann die Datei öffnen:

```bash
nano ~/.config/ncdu/config
```

Je Zeile steht eine Option, genau wie auf der Befehlszeile. Ein Beispiel:

```text
--show-percent
--exclude node_modules
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Beim nächsten Start von `ncdu` steht neben dem Balken der Prozentwert, und Ordner namens `node_modules` sind mit `<` ausgeschlossen.

Beachte: `sudo ncdu` läuft als Benutzer `root` und liest diese Datei nicht. Für alle Benutzer gilt stattdessen `/etc/ncdu.conf`.

## Wie geht es weiter?

- **Größen in Zehnerpotenzen:** `--si` rechnet mit 1000 statt 1024 und zeigt MB und GB, wie es Festplattenhersteller tun.
- **Überblick über alle Laufwerke:** `df -h` zeigt, wie voll jedes eingehängte Dateisystem ist. Das ist der erste Schritt, um zu entscheiden, wo du mit ncdu suchst.
- **Zustand der Festplatte:** Ob ein Laufwerk gesund ist, prüfen die [smartmontools](smartmontools.md).
- **Protokolle:** Füllt `/var/log` die Festplatte, zeigt [lnav](lnav.md), welches Programm so viel schreibt.
- **Dokumentation:** <https://dev.yorhel.nl/ncdu> sowie `man ncdu`

## Deinstallieren

### 1. ncdu entfernen

```bash
sudo apt purge ncdu
```

### 2. Eigene Dateien löschen

Nur nötig, wenn du die Schritte 13 und 15 ausgeführt hast. Diese Dateien gehören zu keinem Paket.

```bash
rm -rf ~/.config/ncdu ~/belegung.json
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
ncdu -V
```
