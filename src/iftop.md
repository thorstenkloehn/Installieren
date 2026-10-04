# iftop

iftop zeigt im Terminal, mit welchen Gegenstellen der Rechner gerade Daten austauscht und wie viel über jede dieser Verbindungen fließt. Die Liste ist nach Durchsatz sortiert und erneuert sich laufend. So erkennst du, wohin eine ausgelastete Leitung ihre Bandbreite verliert: an einen einzelnen Besucher, der die Website abgrast, an einen Server für Updates oder an eine Adresse, die du nicht kennst.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert iftop **1.0pre4** als einzelnes Paket ohne weitere Abhängigkeiten. Ein Dienst läuft nicht.
- **Nur mit `sudo`:** iftop liest die Pakete direkt an der Netzwerkkarte mit. Das darf nur `root`. Ohne `sudo` bricht es mit `You don't have permission to perform this capture` ab.
- **Gegenstellen, nicht Programme:** iftop weiß nicht, welcher Prozess eine Verbindung geöffnet hat. Diese Frage beantwortet [NetHogs](nethogs.md). Beide ergänzen sich.
- **Bit statt Byte:** Die Raten stehen ab Werk in Bit je Sekunde (`Kb`, `Mb`), wie bei Angaben von Internetanbietern. 8 Mb entsprechen 1 MB je Sekunde. Die Option `-B` schaltet auf Byte um.
- **Nur der Augenblick:** iftop zählt ab dem Start und speichert nichts. Für Verbrauchszahlen über Tage und Monate eignet sich [vnStat](vnstat.md).
- **Englische Oberfläche:** Anzeige und Hilfe sind englisch, Zahlen erscheinen mit deutschem Komma.
- **Version:** Getestet mit iftop **1.0pre4** am 4. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. iftop installieren

```bash
sudo apt install iftop
```

### 3. Installation prüfen

iftop hat keine eigene Option für die Version. Sie steht am Ende der Hilfe.

```bash
iftop -h
```

**Prüfen:** Die vorletzte Zeile lautet `iftop, version 1.0pre4`.

## Verbindungen live ansehen

### 4. iftop starten

Ohne weitere Angabe wählt iftop die erste Netzwerkkarte, die nach außen führt.

```bash
sudo iftop
```

**Prüfen:** Oben steht eine Skala, darunter je Verbindung ein Zeilenpaar, unten drei Summenzeilen. Die Anzeige erneuert sich alle zwei Sekunden.

```text
192.168.178.20             => 141.30.62.25               33,0Kb  48,1Kb  48,1Kb
                           <=                            9,81Mb  9,35Mb  9,35Mb

TX:             cum:   50,7KB   peak:    141Kb  rates:   35,1Kb  50,7Kb  50,7Kb
RX:                    9,36MB           13,1Mb           9,81Mb  9,36Mb  9,36Mb
TOTAL:                 9,41MB           13,2Mb           9,84Mb  9,41Mb  9,41Mb
```

### 5. Die Anzeige lesen

Links steht der eigene Rechner, rechts die Gegenstelle. Die Zeile mit `=>` ist der gesendete, die mit `<=` der empfangene Verkehr. Die drei Zahlenspalten sind Durchschnitte über die letzten 2, 10 und 40 Sekunden. Sortiert ist nach der mittleren Spalte. Ein heller Balken hinter jeder Zeile zeigt die Rate im Verhältnis zur Skala am oberen Rand.

In den Summenzeilen steht `TX` für gesendet, `RX` für empfangen. `cum` ist die Menge seit dem Start in Byte, `peak` der höchste bisher gemessene Wert, `rates` wieder die drei Durchschnitte.

### 6. Mit Tasten bedienen

| Taste | Wirkung |
|-------|---------|
| <kbd>n</kbd> | Rechnernamen oder IP-Adressen zeigen |
| <kbd>p</kbd> | Ports mit anzeigen |
| <kbd>N</kbd> | Ports als Nummer oder als Dienstname (`http`, `https`) zeigen |
| <kbd>t</kbd> | Darstellung wechseln: zwei Zeilen je Verbindung, eine Zeile, nur gesendet, nur empfangen |
| <kbd>T</kbd> | zusätzliche Spalte mit der Summe je Verbindung seit dem Start |
| <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> | nach der ersten, zweiten oder dritten Zahlenspalte sortieren |
| <kbd>j</kbd> <kbd>k</kbd> | in der Liste nach unten und oben blättern |
| <kbd>P</kbd> | Anzeige anhalten und fortsetzen |
| <kbd>h</kbd> | Hilfe mit allen Tasten ein- und ausblenden |
| <kbd>q</kbd> | iftop beenden |

Nach jedem Tastendruck steht links oben kurz, was umgeschaltet wurde, z. B. `DNS resolution off` oder `Port display ON`.

### 7. Wirkung ausprobieren

Öffne ein zweites Terminal und lade dort eine größere Datei, ohne sie zu speichern. Dieser Befehl holt eine rund 38 MB große Dateiliste vom Ubuntu-Server und begrenzt das Tempo auf 2 MB je Sekunde, damit der Vorgang lange genug dauert:

```bash
curl --limit-rate 2M -o /dev/null http://de.archive.ubuntu.com/ubuntu/ls-lR.gz
```

**Prüfen:** Im ersten Terminal rückt die Verbindung zum Ubuntu-Server an die erste Stelle, mit einem hohen Wert in der Zeile `<=`. Drückst du <kbd>p</kbd>, steht hinter der Gegenstelle `:http`.

## Gezielt beobachten

### 8. Ohne Namensauflösung und mit Ports starten

iftop fragt zu jeder Adresse den Namen ab. Das erzeugt selbst Verkehr und verzögert die Anzeige. `-n` zeigt stattdessen die IP-Adressen, `-P` blendet die Ports von Anfang an ein, `-B` rechnet in Byte.

```bash
sudo iftop -n -P -B
```

### 9. Eine bestimmte Netzwerkkarte wählen

Die Namen der Netzwerkkarten zeigt dieser Befehl:

```bash
ip -br link
```

Den Namen übergibst du mit `-i`, im Beispiel `enp3s0`:

```bash
sudo iftop -i enp3s0
```

### 10. Nur bestimmten Verkehr zählen

`-f` nimmt einen Filter in derselben Schreibweise wie `tcpdump`. Dieser Befehl zählt nur Webverkehr auf den Ports 80 und 443:

```bash
sudo iftop -n -f 'port 80 or port 443'
```

Weitere nützliche Filter:

| Filter | Wirkung |
|--------|---------|
| `port 22` | nur SSH |
| `host 192.168.178.1` | nur Verkehr mit dieser Adresse |
| `not port 53` | alles außer DNS-Abfragen |

Im laufenden Programm änderst du den Filter mit der Taste <kbd>f</kbd>.

## Ausgabe für Protokolle und Skripte

### 11. Textmodus nutzen

Mit `-t` schreibt iftop Text, statt den Bildschirm zu übernehmen. `-s` beendet es nach der angegebenen Zahl von Sekunden und gibt dann eine einzige Übersicht aus, `-L` begrenzt die Zahl der Verbindungen. Dieser Befehl misst zehn Sekunden und schreibt die zehn stärksten Verbindungen in eine Datei:

```bash
sudo iftop -t -n -s 10 -L 10 > ~/iftop.log
```

**Prüfen:** Die Datei enthält eine Tabelle mit den Spalten `last 2s`, `last 10s`, `last 40s` und `cumulative`, darunter die Summen.

```bash
less ~/iftop.log
```

## Wie geht es weiter?

- **Welches Programm ist es?** Hast du eine auffällige Verbindung gefunden, zeigt [NetHogs](nethogs.md) den Prozess dazu.
- **Verbrauch über Tage und Monate:** [vnStat](vnstat.md) zeichnet auf, wie viel jede Netzwerkkarte übertragen hat.
- **Besucher der Website:** Wer wie oft welche Seite aufgerufen hat, steht im Zugriffsprotokoll des Webservers. [GoAccess](goaccess.md) wertet es aus.
- **Dokumentation:** `man iftop` sowie <https://pdw.ex-parrot.com/iftop/>

## Deinstallieren

### 1. iftop entfernen

```bash
sudo apt purge iftop
```

### 2. Eigene Dateien löschen

Nur nötig, wenn du Schritt 11 ausgeführt hast.

```bash
rm -f ~/iftop.log
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
iftop -h
```
