# sysstat (sar, iostat, mpstat, pidstat)

sysstat ist eine Sammlung kleiner Messwerkzeuge für das Terminal. Sein wichtigster Teil zeichnet im Hintergrund alle zehn Minuten Prozessorlast, Arbeitsspeicher, Plattenzugriffe, Netzverkehr und vieles mehr auf. Mit dem Befehl `sar` lässt sich so auch im Nachhinein klären, was der Rechner gestern um 3 Uhr nachts gemacht hat. Dazu kommen `iostat`, `mpstat` und `pidstat` für Momentaufnahmen von Platten, einzelnen Prozessorkernen und Prozessen. Anders als [Munin](munin.md) braucht sysstat keinen Webserver, und anders als [htop oder btop](htop-btop.md) merkt es sich den Verlauf.

## Vorbemerkungen

- **Meist schon vorhanden:** sysstat gehört bei Ubuntu 26.04 zur Grundinstallation und zeichnet bereits auf. Schritt 1 prüft das. Fehlt es, installieren es die Schritte 2 und 3.
- **Aufbewahrung:** Ab Werk werden die Messwerte 7 Tage aufgehoben. Schritt 21 verlängert das.
- **Ausgabe:** Die Spaltenköpfe sind englisch. Zahlen und Datum erscheinen auf einem deutschen System im deutschen Format, mit Komma als Dezimalzeichen und der Zeile **Durchschnitt:** am Ende.
- **Kein Netzwerkzugriff:** sysstat öffnet keinen Port. Die Daten liegen als Binärdateien unter `/var/log/sysstat`.
- **Version:** Getestet mit sysstat **12.7.7** am 2. Oktober 2026.

## Installation prüfen

### 1. Prüfen, ob sysstat installiert ist

```bash
sar -V
```

**Prüfen:** Die Ausgabe beginnt mit `sysstat Version 12.7.7`. Dann ist sysstat vorhanden und du machst mit Schritt 4 weiter. Meldet die Shell `Befehl 'sar' nicht gefunden`, folgen die Schritte 2 und 3.

### 2. Paketlisten aktualisieren

Nur nötig, wenn sysstat fehlt.

```bash
sudo apt update
```

### 3. sysstat installieren

```bash
sudo apt install sysstat
```

### 4. Prüfen, ob die Aufzeichnung läuft

Die Messung erledigt ein systemd-Timer, der alle zehn Minuten den Sammeldienst startet.

```bash
systemctl list-timers sysstat-collect.timer
```

**Prüfen:** In der Spalte **NEXT** steht der nächste Zeitpunkt, z. B. `23:20:00`, also die nächste volle Zehnerminute.

Meldet der Befehl `0 timers listed`, ist die Aufzeichnung abgeschaltet. Dann schaltest du die Timer ein:

```bash
sudo systemctl enable --now sysstat-collect.timer sysstat-summary.timer sysstat-rotate.timer
```

Zusätzlich muss in `/etc/default/sysstat` die Zeile `ENABLED="true"` stehen, sonst bricht der Sammeldienst bei jedem Lauf gleich wieder ab:

```bash
grep ENABLED /etc/default/sysstat
```

Steht dort `ENABLED="false"`, öffne die Datei mit `sudo nano /etc/default/sysstat` und ändere den Wert in `"true"`.

### 5. Vorhandene Messdaten ansehen

```bash
ls /var/log/sysstat
```

Für jeden Tag gibt es eine Datei `saTT`, wobei `TT` der Tag im Monat ist, z. B. `sa02` für den 2. Die Dateien `sarTT` enthalten eine nächtliche Zusammenfassung als Text.

## Verlauf abfragen mit sar

### 6. Prozessorlast des heutigen Tages

Ohne weitere Angaben zeigt `sar` die Prozessorauslastung seit Mitternacht in Zehn-Minuten-Schritten.

```bash
sar
```

**Prüfen:** Jede Zeile beginnt mit einer Uhrzeit. Die wichtigsten Spalten sind **%user** (Programme), **%system** (Systemkern), **%iowait** (Warten auf Platten) und **%idle** (Leerlauf). Die letzte Zeile **Durchschnitt:** fasst den Tag zusammen. Kurz nach der Installation erscheinen noch keine Zeilen, weil der erste Messpunkt fehlt.

### 7. Zeitraum eingrenzen

`-s` und `-e` legen Beginn und Ende fest. Dieser Befehl zeigt nur die Werte zwischen 8 und 12 Uhr.

```bash
sar -s 08:00:00 -e 12:00:00
```

### 8. Einen früheren Tag abfragen

`-f` liest eine bestimmte Tagesdatei. Ersetze `01` durch den gewünschten Tag des Monats. Es stehen so viele Tage zur Verfügung, wie die Aufbewahrung erlaubt.

```bash
sar -f /var/log/sysstat/sa01
```

### 9. Andere Messwerte wählen

Ein Schalter wählt, was `sar` zeigt. Er lässt sich mit `-s`, `-e` und `-f` kombinieren.

| Befehl | Zeigt |
|--------|-------|
| `sar -r` | Arbeitsspeicher, z. B. **%memused** und **kbavail** (frei verfügbar) |
| `sar -S` | Auslagerungsspeicher (Swap) |
| `sar -q` | Warteschlange und Systemlast (**ldavg-1**, **ldavg-5**, **ldavg-15**) |
| `sar -d` | Zugriffe je Laufwerk |
| `sar -b` | Lese- und Schreibvorgänge insgesamt |
| `sar -n DEV` | Netzverkehr je Schnittstelle |
| `sar -P ALL` | Auslastung je Prozessorkern |
| `sar -A` | alles auf einmal |

Zum Beispiel der Arbeitsspeicher:

```bash
sar -r
```

### 10. Auf ein Gerät beschränken

Bei vielen Laufwerken oder Schnittstellen wird die Ausgabe lang. `--dev=` und `--iface=` beschränken sie auf eines. Die Namen zeigen `lsblk -d` und `ip -br link`.

```bash
sar -d --dev=nvme0n1
```

```bash
sar -n DEV --iface=enp3s0
```

### 11. Live messen

Mit zwei Zahlen dahinter misst `sar` sofort statt aus der Datei zu lesen: hier dreimal im Abstand von einer Sekunde.

```bash
sar -u 1 3
```

## Momentaufnahmen

### 12. Plattenauslastung mit iostat

`-x` zeigt erweiterte Werte, `-z` blendet untätige Geräte aus. `1 2` misst zweimal im Abstand von einer Sekunde. Der erste Block zeigt die Durchschnitte seit dem Systemstart, erst der zweite die aktuelle Sekunde.

```bash
iostat -xz 1 2
```

Wichtig sind **r/s** und **w/s** (Lese- und Schreibvorgänge je Sekunde), **r_await** und **w_await** (Wartezeit in Millisekunden) und **%util** (Auslastung des Geräts).

### 13. Prozessorkerne mit mpstat

Zeigt jeden Kern einzeln. So fällt auf, wenn ein Programm nur einen Kern voll auslastet, während die Gesamtlast niedrig wirkt.

```bash
mpstat -P ALL 1 1
```

### 14. Prozesse mit pidstat

Listet die Prozesse, die in der gemessenen Sekunde Rechenzeit gebraucht haben, mit Benutzer-ID, Prozessnummer und Programmname.

```bash
pidstat 1 1
```

Mit `-r` zeigt `pidstat` stattdessen den Speicherverbrauch, mit `-d` die Plattenzugriffe je Prozess.

## Grafiken erzeugen

### 15. Prozessorlast als Grafik speichern

`sadf -g` wandelt die Messdaten in eine SVG-Grafik um. Hinter `--` stehen dieselben Schalter wie bei `sar`. `-T` beschriftet die Zeitachse mit der Ortszeit statt mit UTC.

```bash
sadf -g -T -- -u > ~/sar-cpu.svg
```

### 16. Grafik ansehen

```bash
xdg-open ~/sar-cpu.svg
```

**Prüfen:** Es öffnet sich ein dunkles Diagramm **CPU utilization [all]** mit farbigen Balken für **%user**, **%system** und die übrigen Werte über den Tag. Rechts stehen jeweils Minimum und Maximum.

### 17. Weitere Grafiken

Für den Arbeitsspeicher:

```bash
sadf -g -T -- -r > ~/sar-speicher.svg
```

Für einen früheren Tag stellst du die Datei ans Ende, z. B. `sadf -g -T /var/log/sysstat/sa01 -- -u > ~/sar-cpu-01.svg`.

## Einstellungen anpassen

### 18. Ordner für die Timer-Ergänzung anlegen

Das Messintervall steht im systemd-Timer. Eine Ergänzungsdatei ändert es, ohne die Datei des Pakets anzufassen.

```bash
sudo mkdir -p /etc/systemd/system/sysstat-collect.timer.d
```

### 19. Messintervall ändern

```bash
sudo nano /etc/systemd/system/sysstat-collect.timer.d/intervall.conf
```

Trage Folgendes ein, um alle fünf Minuten zu messen:

```ini
[Timer]
OnCalendar=
OnCalendar=*:00/05
```

Die leere Zeile `OnCalendar=` löscht die Vorgabe von zehn Minuten, sonst würden beide Zeitpläne gelten. `*:00/05` bedeutet: jede Stunde ab Minute 0 alle 5 Minuten. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 20. systemd die Änderung mitteilen

```bash
sudo systemctl daemon-reload
```

**Prüfen:** In der Spalte **NEXT** steht jetzt die nächste volle Fünferminute.

```bash
systemctl list-timers sysstat-collect.timer
```

### 21. Aufbewahrungsdauer verlängern

```bash
sudo nano /etc/sysstat/sysstat
```

Ändere die Zeile `HISTORY=7` z. B. in

```ini
HISTORY=28
```

Damit bleiben die Daten 28 Tage erhalten. Höher solltest du ohne weitere Anpassung nicht gehen: Die Tagesdateien heißen nur nach dem Tag im Monat und würden nach einem Monat überschrieben. Speichere und schließe nano. Die Änderung gilt ab der nächsten nächtlichen Aufräumrunde, ein Neustart ist nicht nötig.

## Wie geht es weiter?

- **Daten weiterverarbeiten:** `sadf -d -- -u` gibt die Werte mit Semikolon getrennt aus, gut für eine Tabellenkalkulation. `sadf -j -- -u` liefert JSON.
- **Auf einen Blick:** Die Spalte **%iowait** in `sar` und **%util** in `iostat` zeigen, ob ein langsamer Rechner auf seine Platte wartet. Hohe Werte bei **ldavg-1** in `sar -q` im Verhältnis zur Zahl der Kerne deuten auf zu viel gleichzeitige Arbeit hin.
- **Dauerhafte Überwachung mit Alarmen:** dafür eignet sich [Zabbix](zabbix.md) oder [Prometheus](prometheus.md).
- **Dokumentation:** `man sar`, `man iostat`, `man mpstat`, `man pidstat`, `man sadf` und <https://sysstat.github.io>

## Deinstallieren

sysstat gehört zur Grundinstallation von Ubuntu, andere Pakete hängen aber nicht davon ab. Oft reicht es, nur die Aufzeichnung abzuschalten.

### 1. Aufzeichnung abschalten (Variante A)

Hält die drei Timer an und verhindert, dass sie beim nächsten Start wieder laufen. Die Befehle `iostat`, `mpstat`, `pidstat` und `sar` mit Live-Messung bleiben nutzbar.

```bash
sudo systemctl disable --now sysstat-collect.timer sysstat-summary.timer sysstat-rotate.timer
```

### 2. sysstat ganz entfernen (Variante B)

```bash
sudo apt purge sysstat
```

### 3. Eigene Timer-Ergänzung löschen

Nur nötig, wenn du Schritt 19 ausgeführt hast.

```bash
sudo rm -r /etc/systemd/system/sysstat-collect.timer.d
```

### 4. systemd die Änderung mitteilen

```bash
sudo systemctl daemon-reload
```

### 5. Messdaten und Grafiken löschen (optional)

```bash
sudo rm -rf /var/log/sysstat
```

```bash
rm -f ~/sar-*.svg
```

**Prüfen:** Nach Variante B wird der Befehl nicht mehr gefunden.

```bash
sar -V
```
