# atop

atop zeigt im Terminal, wie stark Prozessor, Arbeitsspeicher, Festplatten und Netzwerk ausgelastet sind und welche Prozesse dafür verantwortlich sind. Die Besonderheit: Ein Hintergrunddienst schreibt diese Werte laufend in eine Datei. So lässt sich auch im Nachhinein nachsehen, was auf dem Rechner los war, zum Beispiel heute Nacht um drei, als die Website langsam wurde. Programme wie [htop](htop-btop.md) zeigen dagegen nur den jetzigen Augenblick.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert atop **2.12.1** als einzelnes Paket ohne weitere Abhängigkeiten.
- **Dienste starten sofort:** Nach der Installation laufen zwei Dienste. `atop` schreibt alle zehn Minuten einen Messpunkt nach `/var/log/atop`, `atopacct` merkt sich auch Prozesse, die zwischen zwei Messpunkten gestartet und wieder beendet wurden.
- **Platzbedarf:** Je Tag entsteht eine Datei `atop_JJJJMMTT`, aufbewahrt werden 28 Tage. Auf dem Testrechner (Desktop mit rund 460 Prozessen) belegte ein Messpunkt etwa 100 kB, das ergibt bei zehn Minuten Abstand ungefähr 15 MB am Tag.
- **Mit oder ohne `sudo`:** Ohne `sudo` läuft atop in einer eingeschränkten Ansicht. Die Zugriffe auf die Festplatte je Prozess fehlen dann. Die Aufzeichnungen des Dienstes sind vollständig und für alle Benutzer lesbar.
- **Netzwerk je Prozess:** Dafür wäre das Kernelmodul *netatop* nötig, das Ubuntu nicht als Paket anbietet. Die Auslastung der Netzwerkkarten insgesamt zeigt atop auch ohne.
- **Englische Oberfläche:** Anzeige und Hilfe sind englisch.
- **Version:** Getestet mit atop **2.12.1** am 4. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. atop installieren

```bash
sudo apt install atop
```

### 3. Version prüfen

```bash
atop -V
```

**Prüfen:** Die Ausgabe beginnt mit `Version: 2.12.1`.

### 4. Dienste prüfen

```bash
systemctl is-active atop atopacct atop-rotate.timer
```

**Prüfen:** Es erscheint dreimal `active`. Der Timer `atop-rotate.timer` startet den Dienst jede Nacht um Mitternacht neu, damit eine neue Tagesdatei beginnt.

## Aktuelle Auslastung ansehen

### 5. atop starten

```bash
sudo atop
```

**Prüfen:** Oben stehen Rechnername, Datum und Uhrzeit. Darunter folgen Zeilen für das ganze System, darunter die Liste der Prozesse. Die erste Anzeige enthält die Summen seit dem Systemstart, nach zehn Sekunden folgt der erste echte Messabschnitt. Ab dann zeigt jede Anzeige, was in den letzten zehn Sekunden geschah.

### 6. Die Zeilen im oberen Teil lesen

| Zeile | Inhalt |
|-------|--------|
| `PRC` | Zahl der Prozesse, verbrauchte Rechenzeit |
| `CPU` | Auslastung aller Prozessorkerne zusammen, bei sechs Kernen sind 600 % das Maximum |
| `cpu` | Auslastung je Kern |
| `CPL` | Lastdurchschnitt (`avg1`, `avg5`, `avg15`) |
| `MEM` | Arbeitsspeicher: gesamt, frei, verfügbar, Zwischenspeicher |
| `SWP` | Auslagerungsspeicher |
| `PAG` | Auslagerungsvorgänge, `oomkill` zählt wegen Speichermangel beendete Prozesse |
| `DSK` | je Festplatte: Anteil der Zeit, in der sie beschäftigt war, Lese- und Schreibzugriffe |
| `NET` | Pakete und Durchsatz je Netzwerkkarte |

Ist eine Ressource fast oder ganz ausgeschöpft, färbt atop die betreffende Zeile ein. Beim Prozessor, bei Festplatten und beim Arbeitsspeicher gilt eine Auslastung ab 90 % als kritisch und erscheint rot.

### 7. Ansicht der Prozessliste wechseln

Jede Ansicht hat eine eigene Taste. Groß- und Kleinschreibung sind zu beachten.

| Taste | Wirkung |
|-------|---------|
| <kbd>g</kbd> | allgemeine Ansicht (Standard) |
| <kbd>m</kbd> | Speicherverbrauch je Prozess |
| <kbd>d</kbd> | Festplattenzugriffe je Prozess (nur mit `sudo`) |
| <kbd>c</kbd> | vollständige Befehlszeile je Prozess |
| <kbd>u</kbd> | Verbrauch je Benutzer zusammengefasst |
| <kbd>p</kbd> | Verbrauch je Programmname zusammengefasst |
| <kbd>C</kbd> / <kbd>M</kbd> / <kbd>D</kbd> | nach Prozessor, Speicher oder Festplatte sortieren |
| <kbd>a</kbd> | auch untätige Prozesse zeigen (Umschalter) |
| <kbd>Strg</kbd>+<kbd>F</kbd> / <kbd>Strg</kbd>+<kbd>B</kbd> | in der Prozessliste vor- und zurückblättern |

### 8. Nach einem Programm filtern

Drücke <kbd>P</kbd>, tippe einen Namen wie `nginx` und bestätige mit <kbd>Enter</kbd>. Die Liste zeigt nur noch Prozesse mit diesem Namen. Der Name ist ein regulärer Ausdruck. <kbd>P</kbd> und danach nur <kbd>Enter</kbd> hebt den Filter wieder auf. Mit <kbd>U</kbd> filterst du genauso nach einem Benutzer.

### 9. Messabstand ändern und anhalten

Drücke <kbd>i</kbd>, tippe eine Zahl in Sekunden, z. B. `5`, und bestätige mit <kbd>Enter</kbd>. <kbd>z</kbd> hält die Anzeige an, in der obersten Zeile steht dann `PAUSED`. Ein weiteres <kbd>z</kbd> lässt sie weiterlaufen.

Der Abstand lässt sich auch gleich beim Aufruf angeben:

```bash
sudo atop 5
```

### 10. Balkendiagramm zeigen

<kbd>B</kbd> schaltet auf eine Ansicht mit Balken für Prozessor, Speicher, Festplatten und Netzwerk um. Sie zeigt nur das System als Ganzes, keine Prozesse. Ein weiteres <kbd>B</kbd> führt zurück zur Textansicht.

### 11. Hilfe aufrufen und beenden

<kbd>?</kbd> öffnet die Übersicht aller Tasten, <kbd>q</kbd> schließt sie. In der normalen Ansicht beendet <kbd>q</kbd> atop.

## In die Vergangenheit schauen

### 12. Aufzeichnung von heute öffnen

Die Option `-r` liest die Datei des Dienstes, statt live zu messen.

```bash
atop -r
```

**Prüfen:** Die Anzeige sieht aus wie in Schritt 5, läuft aber nicht von selbst weiter. Die Uhrzeit in der obersten Zeile ist die des ersten Messpunkts von heute.

Direkt nach der Installation gibt es erst einen Messpunkt. Warte mindestens zehn Minuten, bevor du die nächsten Schritte ausprobierst.

### 13. Durch die Zeit blättern

| Taste | Wirkung |
|-------|---------|
| <kbd>t</kbd> | zum nächsten Messpunkt |
| <kbd>T</kbd> | zum vorigen Messpunkt |
| <kbd>b</kbd> | zu einer Uhrzeit springen, Eingabe als `hhmm`, z. B. `0300` |
| <kbd>r</kbd> | zurück zum Anfang der Datei |

Alle Tasten aus den Schritten 7 und 8 gelten auch hier. Du kannst also zu einer Uhrzeit springen und mit <kbd>m</kbd> nachsehen, welcher Prozess gerade am meisten Speicher belegt hat.

### 14. Bei einer Uhrzeit einsteigen

`-b` legt fest, bei welcher Uhrzeit die Anzeige beginnt.

```bash
atop -r -b 03:00
```

### 15. Einen anderen Tag öffnen

Für gestern genügt `y`, für vorgestern `yy`.

```bash
atop -r y
```

Jeden anderen Tag öffnest du über den Dateinamen. Welche Tage vorhanden sind, zeigt `ls /var/log/atop`.

```bash
atop -r /var/log/atop/atop_20261004
```

Gibt es die Datei für den Tag nicht, meldet atop `No such file or directory`.

## Berichte mit atopsar

`atopsar` gehört zum selben Paket. Es gibt die aufgezeichneten Werte als Tabelle mit einer Zeile je Messpunkt aus. Das ist übersichtlicher, wenn du einen ganzen Tag überblicken willst.

### 16. Prozessorauslastung über den Tag

```bash
atopsar -c
```

**Prüfen:** Es erscheint eine Tabelle mit den Spalten `%usr`, `%sys`, `%wait` und `%idle`, je Messpunkt eine Zeile `all` und darunter die einzelnen Kerne.

### 17. Weitere Berichte

| Befehl | Bericht |
|--------|---------|
| `atopsar -m` | Arbeitsspeicher und Auslagerungsspeicher |
| `atopsar -d` | Festplatten |
| `atopsar -i` | Netzwerkkarten |
| `atopsar -p` | Lastdurchschnitt und Zahl der Prozesse |
| `atopsar -O` | die drei Prozesse mit der meisten Rechenzeit je Messpunkt |
| `atopsar -G` | die drei Prozesse mit dem meisten Speicher je Messpunkt |
| `atopsar -A` | alle Berichte hintereinander |

### 18. Zeitraum und Tag eingrenzen

`-b` und `-e` begrenzen den Zeitraum, `-r` wählt wie bei atop den Tag.

```bash
atopsar -O -r y -b 02:00 -e 04:00
```

Dieser Befehl zeigt für gestern zwischen zwei und vier Uhr, welche drei Prozesse jeweils am meisten Rechenzeit gebraucht haben.

## Aufzeichnung anpassen

### 19. Messabstand und Aufbewahrung ändern

Die Einstellungen des Dienstes stehen in `/etc/default/atop`.

```bash
sudo nano /etc/default/atop
```

Die Datei enthält diese Zeilen:

```text
LOGOPTS=""
LOGINTERVAL=600
LOGGENERATIONS=28
LOGPATH=/var/log/atop
```

`LOGINTERVAL` ist der Abstand der Messpunkte in Sekunden, `LOGGENERATIONS` die Zahl der Tage, nach denen alte Dateien gelöscht werden. Für eine genauere Aufzeichnung setzt du zum Beispiel `LOGINTERVAL=60`. Die Dateien werden dadurch zehnmal so groß. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 20. Dienst neu starten

Erst nach einem Neustart gilt die Änderung.

```bash
sudo systemctl restart atop
```

**Prüfen:** Der laufende Prozess trägt den neuen Abstand am Ende der Befehlszeile.

```bash
pgrep -x -a atop
```

Die Ausgabe lautet dann z. B. `/usr/bin/atop -w /var/log/atop/atop_20261004 60`.

### 21. Eigene Aufzeichnung für einen Test anlegen

Unabhängig vom Dienst kannst du eine kurze Aufzeichnung in eine eigene Datei schreiben, etwa während eines Lasttests. Dieser Befehl misst 30-mal im Abstand von zwei Sekunden und endet dann von selbst:

```bash
atop -w ~/lasttest.raw 2 30
```

Ansehen und auswerten lässt sich die Datei wie die des Dienstes:

```bash
atop -r ~/lasttest.raw
```

```bash
atopsar -c -r ~/lasttest.raw
```

## Wie geht es weiter?

- **Voreinstellungen:** In `~/.atoprc` lassen sich Standardwerte wie der Messabstand oder die Startansicht festlegen. Die Möglichkeiten beschreibt `man atoprc`.
- **Für Skripte:** `atop -P CPU,MEM 10` gibt die Werte in einer Form aus, die sich leicht weiterverarbeiten lässt, `atop -J CPU,MEM 10` als JSON.
- **Tagesberichte als Zahlenreihen:** Eine ähnliche Auswertung ohne Prozessliste, dafür mit sehr kleinen Dateien, bietet [sysstat](sysstat.md).
- **Diagramme im Browser:** Für Verläufe über Wochen eignen sich [Munin](munin.md) oder [Prometheus](prometheus.md) mit [Grafana](grafana.md).
- **Dokumentation:** <https://www.atoptool.nl> sowie `man atop` und `man atopsar`

## Deinstallieren

### 1. atop entfernen

`purge` beendet die Dienste und löscht auch `/etc/default/atop` sowie den Ordner `/var/log/atop` mit allen Aufzeichnungen.

```bash
sudo apt purge atop
```

### 2. Eigene Dateien löschen

Nur nötig, wenn du in Schritt 21 eine eigene Aufzeichnung angelegt hast.

```bash
rm -f ~/lasttest.raw
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
atop -V
```
