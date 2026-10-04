# iotop

iotop zeigt im Terminal, welche Prozesse gerade wie viel von der Festplatte lesen und darauf schreiben. Es ist das Gegenstück zu [htop](htop-btop.md) für den Datenträger: Rattert die Festplatte, reagiert der Rechner zäh oder wächst ein Ordner ohne erkennbaren Grund, siehst du hier in Sekunden den Verursacher. Diese Anleitung verwendet **iotop-c**, eine in C geschriebene Neufassung des älteren, in Python geschriebenen iotop.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 bietet zwei Pakete an: `iotop-c` (Version **1.31**, wird weiter gepflegt) und das ältere `iotop` (Version 0.6). Diese Anleitung nimmt `iotop-c`. Es ist ein einzelnes Paket ohne weitere Abhängigkeiten, ein Dienst läuft nicht.
- **Zwei Namen, ein Programm:** Das Paket legt den Befehl `iotop-c` an und richtet zusätzlich `iotop` als Verweis darauf ein. Beide Namen starten dasselbe Programm.
- **Nur mit `sudo`:** Der Kernel gibt diese Zahlen nur an `root` heraus. Ohne `sudo` bricht iotop mit einem Hinweis ab.
- **Spalte IO braucht eine Kerneleinstellung:** Die Spalten `SWAPIN` und `IO` (Wartezeit auf den Datenträger) bleiben bei 0, solange die Einstellung `kernel.task_delayacct` ausgeschaltet ist. Das ist bei Ubuntu der Normalfall. Lese- und Schreibmenge funktionieren auch so. Wie du die Einstellung einschaltest, steht ab Schritt 12.
- **Englische Oberfläche:** Anzeige und Hilfe sind englisch. Zahlen erscheinen mit deutschem Komma.
- **Version:** Getestet mit iotop-c **1.31** am 4. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. iotop-c installieren

```bash
sudo apt install iotop-c
```

### 3. Version prüfen

```bash
iotop --version
```

**Prüfen:** Die Ausgabe lautet `iotop 1.31`.

## Zugriffe live ansehen

### 4. iotop starten

Die Option `-o` zeigt nur Prozesse, die gerade wirklich lesen oder schreiben. `-P` fasst die Threads eines Programms zu einer Zeile zusammen. Ohne beide Optionen ist die Liste sehr lang und besteht fast nur aus Nullen.

```bash
sudo iotop -o -P
```

**Prüfen:** Oben stehen zwei Zeilen mit den Summen, darunter die Liste. Sie aktualisiert sich jede Sekunde. Auf einem ruhigen Rechner tauchen nur ab und zu Einträge wie `systemd-journald` auf.

### 5. Die Anzeige lesen

| Spalte | Inhalt |
|--------|--------|
| `PID` (ohne `-P`: `TID`) | Nummer des Prozesses oder Threads |
| `PRIO` | Priorität beim Zugriff auf den Datenträger, z. B. `be/4` |
| `USER` | Benutzer, dem der Prozess gehört |
| `DISK READ` | gelesene Menge je Sekunde |
| `DISK WRITE` | geschriebene Menge je Sekunde |
| `SWAPIN` | Anteil der Zeit, in der der Prozess auf ausgelagerten Speicher wartete |
| `IO` | Anteil der Zeit, in der der Prozess auf den Datenträger wartete |
| `GRAPH` | kleiner Verlauf der letzten Sekunden |
| `COMMAND` | Name des Programms |

In einem schmalen Fenster lässt iotop Spalten weg. Mach das Terminal breiter, wenn `SWAPIN` und `IO` fehlen.

Die beiden Kopfzeilen unterscheiden sich so: `Total` ist die Menge, die die Programme beim Kernel angefordert haben. `Current` ist die Menge, die tatsächlich zwischen Kernel und Datenträger floss. Weil Linux Schreibvorgänge zwischenspeichert und später gebündelt ausführt, weichen die beiden Werte oft voneinander ab.

### 6. Mit Tasten bedienen

| Taste | Wirkung |
|-------|---------|
| <kbd>←</kbd> <kbd>→</kbd> | Spalte wählen, nach der sortiert wird |
| <kbd>r</kbd> | Reihenfolge umkehren |
| <kbd>o</kbd> | nur aktive Prozesse zeigen oder alle |
| <kbd>p</kbd> | zwischen Prozessen und einzelnen Threads wechseln |
| <kbd>a</kbd> | statt der Menge je Sekunde die Summe seit dem Start von iotop zeigen |
| <kbd>c</kbd> | vollständige Befehlszeile zeigen |
| <kbd>f</kbd> | nach Benutzer- oder Prozessnummer filtern |
| <kbd>↑</kbd> <kbd>↓</kbd> | in der Liste blättern |
| <kbd>h</kbd> | Hilfe mit allen Tasten ein- und ausblenden |
| <kbd>q</kbd> | iotop beenden |

Die Taste <kbd>a</kbd> schaltet der Reihe nach drei Darstellungen durch. Die erste ist die Summe seit dem Start, erkennbar daran, dass in den Spalten kein `/s` mehr steht. Nach dem dritten Druck bist du wieder bei der Menge je Sekunde.

### 7. Wirkung ausprobieren

Öffne ein zweites Terminal und erzeuge dort Schreiblast. Dieser Befehl schreibt eine 2 GB große Datei aus Nullen in deinen Home-Ordner:

```bash
dd if=/dev/zero of=~/iotop-test.tmp bs=1M count=2000 oflag=dsync
```

**Prüfen:** Im ersten Terminal steht `dd` oben in der Liste, mit einer hohen Zahl unter `DISK WRITE`. Auf dem Testrechner mit SSD waren es rund 520 M/s.

Lösche die Testdatei danach wieder:

```bash
rm ~/iotop-test.tmp
```

## Gezielt beobachten

### 8. Summe statt Rate zeigen

Ein Programm, das nur gelegentlich schreibt, erscheint in der Liste immer nur kurz. Mit `-a` zeigt iotop die Summe seit dem Start. Lässt du das einige Minuten laufen, steht oben, wer in dieser Zeit insgesamt am meisten geschrieben hat.

```bash
sudo iotop -o -P -a
```

### 9. Nur einen Benutzer oder Prozess zeigen

`-u` beschränkt die Liste auf einen Benutzer, hier den des Webservers:

```bash
sudo iotop -o -P -u www-data
```

`-p` beschränkt sie auf eine Prozessnummer. `pgrep` liefert die Nummer zum Namen, im Beispiel die des ältesten nginx-Prozesses:

```bash
sudo iotop -p $(pgrep -o nginx)
```

### 10. Befehlszeile und anderes Intervall

`-c` zeigt die ganze Befehlszeile statt nur des Programmnamens. So unterscheidest du mehrere Prozesse desselben Programms. `-d` legt den Abstand zwischen zwei Messungen in Sekunden fest.

```bash
sudo iotop -o -P -c -d 5
```

## Ausgabe für Protokolle und Skripte

### 11. Stapelmodus nutzen

Mit `-b` schreibt iotop fortlaufend Text, statt den Bildschirm zu übernehmen. `-n` begrenzt die Zahl der Messungen, `-t` setzt die Uhrzeit dazu, `-qq` lässt die Spaltenüberschriften weg. Dieser Befehl misst eine Minute lang alle fünf Sekunden und schreibt das Ergebnis in eine Datei:

```bash
sudo iotop -b -o -P -t -qq -d 5 -n 12 > ~/iotop.log
```

**Prüfen:** Die Datei enthält je Messung zwei Summenzeilen mit Datum und Uhrzeit, darunter die aktiven Prozesse.

```bash
less ~/iotop.log
```

Für eine dauerhafte Aufzeichnung, in der sich auch nachts um drei nachschlagen lässt, eignet sich [atop](atop.md) besser.

## Wartezeit auf den Datenträger anzeigen

Die Spalte `IO` beantwortet eine andere Frage als die Schreibmenge: Sie zeigt, welcher Prozess ausgebremst wird, weil er auf den Datenträger warten muss. Dafür muss der Kernel die Wartezeiten erfassen.

### 12. Erfassung vorübergehend einschalten

Diese Einstellung gilt bis zum nächsten Neustart.

```bash
sudo sysctl kernel.task_delayacct=1
```

**Prüfen:** Die Ausgabe lautet `kernel.task_delayacct = 1`. Der Wert gilt für Prozesse, die danach gestartet werden. Wiederholst du Schritt 7, steht bei `dd` in der Spalte `IO` nun ein Prozentwert, auf dem Testrechner rund 37 %.

Die Erfassung kostet etwas Rechenzeit, deshalb ist sie ab Werk aus. Zum Ausschalten:

```bash
sudo sysctl kernel.task_delayacct=0
```

### 13. Erfassung dauerhaft einschalten

Nur nötig, wenn du die Spalte regelmäßig brauchst. Lege eine eigene Datei für die Einstellung an:

```bash
sudo nano /etc/sysctl.d/90-delayacct.conf
```

Trage diese Zeile ein:

```text
kernel.task_delayacct = 1
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. Dann die Einstellungen neu laden:

```bash
sudo sysctl --system
```

**Prüfen:** Der Wert ist 1.

```bash
cat /proc/sys/kernel/task_delayacct
```

## Wie geht es weiter?

- **Priorität ändern:** Die Taste <kbd>i</kbd> in iotop ändert die Priorität eines Prozesses beim Zugriff auf den Datenträger. Dasselbe leistet der Befehl `ionice`, etwa um eine Datensicherung im Hintergrund zu bremsen.
- **Auslastung je Laufwerk:** Wie stark ein Datenträger als Ganzes beschäftigt ist, zeigt `iostat` aus [sysstat](sysstat.md).
- **Wer belegt den Platz?** Welche Ordner die Festplatte füllen, zeigt [ncdu](ncdu.md).
- **Dokumentation:** `man iotop-c` sowie <https://github.com/Tomas-M/iotop>

## Deinstallieren

### 1. iotop-c entfernen

Damit verschwindet auch der Verweis `iotop`.

```bash
sudo apt purge iotop-c
```

### 2. Kerneleinstellung zurücknehmen

Nur nötig, wenn du Schritt 13 ausgeführt hast.

```bash
sudo rm /etc/sysctl.d/90-delayacct.conf
```

```bash
sudo sysctl kernel.task_delayacct=0
```

### 3. Eigene Dateien löschen

Nur nötig, wenn die Dateien aus den Schritten 7 und 11 noch vorhanden sind.

```bash
rm -f ~/iotop.log ~/iotop-test.tmp
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
iotop --version
```
