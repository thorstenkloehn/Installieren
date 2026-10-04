# NetHogs

NetHogs zeigt im Terminal, welches Programm gerade wie viel über das Netzwerk sendet und empfängt. Andere Werkzeuge schlüsseln den Verkehr nach Netzwerkkarte oder Gegenstelle auf, NetHogs ordnet ihn dem Prozess zu. Ist die Leitung unerwartet ausgelastet, siehst du so sofort, ob gerade ein Update lädt, eine Datensicherung läuft oder ein Programm etwas hochlädt, von dem du nichts wusstest.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert NetHogs **0.8.8** als einzelnes Paket ohne weitere Abhängigkeiten. Ein Dienst läuft nicht.
- **Nur mit `sudo`:** NetHogs liest die Pakete direkt an der Netzwerkkarte mit. Das darf nur `root`. Ohne `sudo` bricht es mit `Error opening handler for device` ab.
- **Nur der Augenblick:** NetHogs zählt ab dem Start und speichert nichts. Für Verbrauchszahlen über Tage und Monate eignet sich [vnStat](vnstat.md).
- **Was gezählt wird:** Ab Werk erfasst NetHogs TCP-Verbindungen. Die Zeile `unknown TCP` sammelt Verkehr, den es keinem Prozess zuordnen konnte, etwa von Verbindungen, die schon wieder geschlossen sind.
- **Englische Oberfläche:** Die Anzeige ist englisch, Zahlen erscheinen mit Punkt als Dezimaltrenner.
- **Version:** Getestet mit NetHogs **0.8.8** am 4. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. NetHogs installieren

```bash
sudo apt install nethogs
```

### 3. Version prüfen

```bash
nethogs -V
```

**Prüfen:** Die Ausgabe lautet `version 0.8.8-1`.

## Netzwerkverkehr live ansehen

### 4. NetHogs starten

Ohne weitere Angabe beobachtet NetHogs alle aktiven Netzwerkkarten außer der internen Schnittstelle `lo`.

```bash
sudo nethogs
```

**Prüfen:** Es erscheint eine Liste, die sich jede Sekunde erneuert. Das Programm mit dem meisten empfangenen Verkehr steht oben, die letzte Zeile `TOTAL` nennt die Summe:

```text
NetHogs version 0.8.8-1

    PID USER     PROGRAM                   DEV          SENT      RECEIVED
  78677 thorst.. curl                      enp3s0       2.004    1569.653 kB/s
   5900 thorst.. /opt/google/chrome/chr..  enp3s0       0.047       0.047 kB/s
      ? root     unknown TCP                            0.000       0.000 kB/s

  TOTAL                                                 2.051    1569.700 kB/s
```

Auf einem ruhigen Rechner ist die Liste fast leer. Ein Programm taucht erst auf, wenn es nach dem Start von NetHogs etwas überträgt.

### 5. Die Spalten lesen

| Spalte | Inhalt |
|--------|--------|
| `PID` | Nummer des Prozesses |
| `USER` | Benutzer, dem der Prozess gehört |
| `PROGRAM` | Pfad des Programms |
| `DEV` | Netzwerkkarte, über die der Verkehr läuft |
| `SENT` | gesendete Menge, ab Werk in kB je Sekunde |
| `RECEIVED` | empfangene Menge |

### 6. Mit Tasten bedienen

| Taste | Wirkung |
|-------|---------|
| <kbd>m</kbd> | Einheit wechseln (siehe unten) |
| <kbd>s</kbd> | nach gesendeter Menge sortieren |
| <kbd>r</kbd> | nach empfangener Menge sortieren (Standard) |
| <kbd>l</kbd> | vollständige Befehlszeile statt nur des Programms zeigen |
| <kbd>b</kbd> | nur den Programmnamen ohne Pfad zeigen |
| <kbd>q</kbd> | NetHogs beenden |

Die Taste <kbd>m</kbd> schaltet der Reihe nach durch: kB je Sekunde, Summe in kB, Summe in Bytes, Summe in MB, MB je Sekunde und GB je Sekunde. Die Einheit steht rechts neben den Zahlen. Die Summen zählen ab dem Start von NetHogs. Lässt du es einige Minuten laufen, siehst du, wer in dieser Zeit insgesamt am meisten übertragen hat.

### 7. Wirkung ausprobieren

Öffne ein zweites Terminal und lade dort eine größere Datei, ohne sie zu speichern. Dieser Befehl holt eine rund 38 MB große Dateiliste vom Ubuntu-Server und begrenzt das Tempo auf 2 MB je Sekunde, damit der Vorgang lange genug dauert:

```bash
curl --limit-rate 2M -o /dev/null http://de.archive.ubuntu.com/ubuntu/ls-lR.gz
```

**Prüfen:** Im ersten Terminal steht `curl` oben in der Liste, mit einem hohen Wert unter `RECEIVED` und einem kleinen unter `SENT`.

## Gezielt beobachten

### 8. Nur eine Netzwerkkarte beobachten

Die Namen der Netzwerkkarten zeigt dieser Befehl. `UP` bedeutet, dass die Karte verbunden ist.

```bash
ip -br link
```

Den Namen hängst du an den Aufruf an, im Beispiel `enp3s0`. Mehrere Namen hintereinander sind erlaubt.

```bash
sudo nethogs enp3s0
```

Nennst du eine Karte ohne Verbindung, meldet NetHogs `No devices to monitor`.

### 9. Auch interne Verbindungen zeigen

Verkehr zwischen Programmen auf demselben Rechner läuft über die Schnittstelle `lo`, zum Beispiel von [nginx](nginx.md) zu einem Dienst dahinter. Mit `-a` beobachtet NetHogs auch sie.

```bash
sudo nethogs -a
```

### 10. Summen statt Rate und anderes Intervall

`-v` legt die Einheit schon beim Start fest: `0` kB je Sekunde, `1` Summe in kB, `2` Summe in Bytes, `3` Summe in MB, `4` MB je Sekunde. `-d` bestimmt den Abstand der Aktualisierung in Sekunden.

```bash
sudo nethogs -v 3 -d 5
```

### 11. Auch UDP erfassen

Mit `-C` zählt NetHogs zusätzlich UDP-Pakete. Darüber laufen zum Beispiel DNS-Abfragen, viele Videokonferenzen und das von modernen Browsern genutzte Protokoll QUIC.

```bash
sudo nethogs -C
```

## Ausgabe für Protokolle und Skripte

### 12. Textmodus nutzen

Mit `-t` schreibt NetHogs fortlaufend Text, statt den Bildschirm zu übernehmen. `-c` begrenzt die Zahl der Durchläufe. Dieser Befehl misst eine Minute lang alle fünf Sekunden und schreibt in eine Datei:

```bash
sudo nethogs -t -d 5 -c 12 > ~/nethogs.log
```

**Prüfen:** Die Datei enthält je Durchlauf einen Block, der mit `Refreshing:` beginnt.

```bash
less ~/nethogs.log
```

Jede Zeile darin besteht aus Programm, Prozessnummer und Benutzernummer, getrennt durch Schrägstriche, gefolgt von gesendeter und empfangener Menge in kB je Sekunde:

```text
Refreshing:
curl/78623/1000	0.244922	623.658
unknown TCP/0/0	0	0
```

## Wie geht es weiter?

- **Verbrauch über Tage und Monate:** [vnStat](vnstat.md) zeichnet auf, wie viel jede Netzwerkkarte übertragen hat.
- **Alles auf einen Blick:** [Glances](glances.md) und [btop](htop-btop.md) zeigen Netzwerk, Prozessor und Speicher zusammen, allerdings ohne Aufteilung nach Prozess.
- **Festplatte statt Netzwerk:** Dieselbe Frage für den Datenträger beantwortet [iotop](iotop.md).
- **Dokumentation:** `man nethogs` sowie <https://github.com/raboof/nethogs>

## Deinstallieren

### 1. NetHogs entfernen

```bash
sudo apt purge nethogs
```

### 2. Eigene Dateien löschen

Nur nötig, wenn du Schritt 12 ausgeführt hast.

```bash
rm -f ~/nethogs.log
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
nethogs -V
```
