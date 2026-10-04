# ClamAV

ClamAV ist ein freier Virenscanner. Er durchsucht Dateien und Ordner nach bekannter Schadsoftware und holt sich die nötigen Erkennungsmuster mehrmals täglich selbst aus dem Internet. Unter Linux dient er vor allem dazu, Dateien zu prüfen, die an andere weitergegeben werden: hochgeladene Dateien einer Website, E-Mail-Anhänge, Freigaben für Windows-Rechner oder ein USB-Stick unbekannter Herkunft.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert ClamAV **1.5.4**. Das Paket `clamav` bringt den Scanner `clamscan` und den Dienst `clamav-freshclam` für die Erkennungsmuster mit. Zusammen sind es vier Pakete.
- **Download beim ersten Start:** Direkt nach der Installation lädt der Dienst die Erkennungsmuster, rund 110 MB. Vorher kann `clamscan` nicht arbeiten.
- **Prüfen auf Anforderung:** `clamscan` läuft nur, wenn du es startest. Einen Wächter, der jede geöffnete Datei sofort prüft wie unter Windows üblich, richtet diese Anleitung nicht ein.
- **Langsamer Start, optionaler Dienst:** `clamscan` lädt bei jedem Aufruf alle Muster neu. Das dauerte auf dem Testrechner neun Sekunden, auch für eine einzige Datei. Wer oft prüft, installiert zusätzlich den Dienst `clamav-daemon`, der die Muster im Arbeitsspeicher hält (ab Schritt 14). Er belegt dafür dauerhaft rund 1 GB.
- **Grenzen:** ClamAV erkennt, was in seinen Mustern steht. Es ersetzt weder Updates noch eine Firewall, siehe [unattended-upgrades](unattended-upgrades.md) und [UFW](ufw.md).
- **Englische Ausgaben:** Die Meldungen der Programme sind englisch.
- **Version:** Getestet mit ClamAV **1.5.4** am 4. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. ClamAV installieren

```bash
sudo apt install clamav
```

### 3. Version prüfen

```bash
clamscan --version
```

**Prüfen:** Die Ausgabe beginnt mit `ClamAV 1.5.4`.

### 4. Dienst für die Erkennungsmuster einschalten

Der Dienst startet bei der Installation von selbst. Im Test war er aber nicht für den Systemstart vorgemerkt. Dieser Befehl stellt beides sicher:

```bash
sudo systemctl enable --now clamav-freshclam
```

**Prüfen:** Die Ausgaben lauten `enabled` und `active`.

```bash
systemctl is-enabled clamav-freshclam
```

```bash
systemctl is-active clamav-freshclam
```

### 5. Warten, bis die Muster geladen sind

```bash
ls -lh /var/lib/clamav
```

**Prüfen:** Der Ordner enthält die drei Dateien `main.cvd` (rund 85 MB), `daily.cvd` (rund 22 MB) und `bytecode.cvd`. Fehlt eine, warte eine Minute und wiederhole den Befehl. Den Fortschritt zeigt das Protokoll:

```bash
sudo tail /var/log/clamav/freshclam.log
```

Zu jeder Datei steht dort eine Zeile mit `updated` und der Zahl der Muster. Die Zeile `ERROR: NotifyClamd: Can't find or parse configuration file` am Ende ist ohne Bedeutung: Der Dienst versucht, den Scandienst aus Schritt 14 zu benachrichtigen, der noch nicht installiert ist.

## Erkennung ausprobieren

Zum Testen gibt es die EICAR-Testdatei. Sie enthält eine festgelegte, harmlose Zeichenfolge, die jeder Virenscanner absichtlich als Fund meldet.

### 6. Testordner mit Testdatei anlegen

```bash
mkdir ~/clamtest
```

Der zweite Befehl schreibt die Zeichenfolge in eine Datei. Kopiere ihn vollständig, die Zeichen müssen genau stimmen.

```bash
printf '%s' 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > ~/clamtest/eicar.txt
```

### 7. Eine Datei prüfen

```bash
clamscan ~/clamtest/eicar.txt
```

**Prüfen:** Nach einigen Sekunden meldet ClamAV den Fund, darunter folgt eine Zusammenfassung:

```text
/home/thorsten/clamtest/eicar.txt: Eicar-Test-Signature FOUND

----------- SCAN SUMMARY -----------
Known viruses: 3628118
Engine version: 1.5.4
Scanned directories: 0
Scanned files: 1
Infected files: 1
```

Eine unauffällige Datei endet mit `OK` statt `FOUND`, und `Infected files` ist 0.

## Ordner prüfen

### 8. Einen Ordner mit allen Unterordnern prüfen

`-r` nimmt die Unterordner mit. `-i` zeigt nur Funde. Ohne `-i` erscheint für jede Datei eine Zeile.

```bash
clamscan -r -i ~/clamtest
```

**Prüfen:** Es erscheint nur die Zeile mit `FOUND` und die Zusammenfassung. ClamAV schaut auch in gepackte Dateien wie ZIP-Archive hinein.

### 9. Den Home-Ordner prüfen

Der Ordner `.cache` enthält viele kleine Dateien ohne bleibenden Wert und wird ausgelassen. Das Muster trifft jeden Ordner, dessen Pfad auf `/.cache` endet.

```bash
clamscan -r -i --exclude-dir='/\.cache$' ~
```

Das dauert je nach Datenmenge von Minuten bis zu Stunden. <kbd>Strg</kbd>+<kbd>C</kbd> bricht ab.

### 10. Ergebnis in eine Datei schreiben

`--log` hält Funde und Zusammenfassung zusätzlich in einer Datei fest.

```bash
clamscan -r -i --log="$HOME/clamscan.log" ~/clamtest
```

### 11. Rückgabewert für Skripte nutzen

`clamscan` meldet über seinen Rückgabewert, wie die Prüfung ausging: `0` heißt kein Fund, `1` heißt mindestens ein Fund, `2` heißt, es ist ein Fehler aufgetreten.

```bash
clamscan -r -i ~/clamtest; echo "Rückgabewert: $?"
```

**Prüfen:** Die letzte Zeile lautet `Rückgabewert: 1`.

## Mit Funden umgehen

ClamAV löscht von sich aus nichts. Ein Fund kann auch ein Fehlalarm sein. Verschiebe verdächtige Dateien deshalb zuerst und lösche sie erst, wenn du sicher bist.

### 12. Funde in einen Quarantäne-Ordner verschieben

```bash
mkdir ~/quarantaene
```

```bash
clamscan -r -i --move="$HOME/quarantaene" ~/clamtest
```

**Prüfen:** Unter dem Fund steht eine Zeile mit `moved to`. Die Testdatei liegt jetzt im neuen Ordner.

```bash
ls ~/quarantaene
```

Die Option `--remove` löscht Funde stattdessen sofort. Verwende sie nur, wenn ein Fehlalarm keinen Schaden anrichten kann.

### 13. Muster von Hand aktualisieren

Der Dienst aus Schritt 4 sieht 24-mal am Tag nach neuen Mustern. Von Hand ist das selten nötig. Weil der laufende Dienst das Protokoll gesperrt hält, muss er dafür kurz angehalten werden.

```bash
sudo systemctl stop clamav-freshclam
```

```bash
sudo freshclam
```

```bash
sudo systemctl start clamav-freshclam
```

**Prüfen:** `freshclam` meldet je Datei `updated` oder `is up-to-date`.

## Optional: Scandienst für schnelle Prüfungen

### 14. Scandienst installieren

```bash
sudo apt install clamav-daemon
```

Das Paket bringt den Dienst `clamd` und das Programm `clamdscan` mit. Der Dienst lauscht nur auf einer lokalen Socket-Datei, nicht im Netzwerk.

### 15. Warten, bis der Dienst bereit ist

Das Laden der Muster dauert rund eine halbe Minute.

```bash
systemctl is-active clamav-daemon
```

**Prüfen:** Die Ausgabe lautet `active`.

### 16. Über den Dienst prüfen

`clamdscan` reicht die Dateien an den laufenden Dienst weiter. `--fdpass` ist dabei nötig: Der Dienst läuft als Benutzer `clamav` und darf deine Dateien nicht selbst lesen. Mit der Option öffnet `clamdscan` sie unter deinem Namen und übergibt sie. Ohne sie meldet der Dienst `Permission denied`.

```bash
clamdscan --fdpass -i ~/quarantaene
```

**Prüfen:** Der Fund erscheint sofort. Im Test dauerte die Prüfung weniger als eine Hundertstelsekunde statt neun Sekunden.

Für große Ordner verteilt `--multiscan` die Arbeit auf mehrere Prozessorkerne:

```bash
clamdscan --fdpass -i --multiscan ~
```

Die Prüfung selbst findet im Dienst statt. Die meisten Scan-Optionen von `clamscan` wirken bei `clamdscan` deshalb nicht. Ausnahmen (`ExcludePath`) und Grenzen wie die größte geprüfte Datei (25 MB ab Werk) stehen in `/etc/clamav/clamd.conf`.

## Regelmäßig prüfen

### 17. Wöchentliche Prüfung einrichten

Skripte im Ordner `/etc/cron.weekly` führt Ubuntu einmal in der Woche als `root` aus. Der Dateiname darf keinen Punkt enthalten.

```bash
sudo nano /etc/cron.weekly/clamscan-home
```

Füge diesen Inhalt ein:

```sh
#!/bin/sh
clamscan -r -i --exclude-dir='/\.cache$' --log=/var/log/clamav/wochenscan.log /home
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 18. Skript ausführbar machen

Ohne dieses Recht überspringt Ubuntu die Datei.

```bash
sudo chmod +x /etc/cron.weekly/clamscan-home
```

**Prüfen:** Nach dem ersten Lauf stehen Funde und Zusammenfassung im Protokoll. Jeder Lauf hängt einen neuen Abschnitt an.

```bash
sudo less /var/log/clamav/wochenscan.log
```

## Wie geht es weiter?

- **Grafische Oberfläche:** Das Paket `clamtk` bietet ein Fenster zum Auswählen von Ordnern und zum Ansehen der Funde. Nicht selbst getestet.
- **Hochgeladene Dateien prüfen:** Viele Webanwendungen können Uploads an den Scandienst übergeben, WordPress und Nextcloud etwa über Erweiterungen.
- **Bericht per E-Mail:** [Logwatch](logwatch.md) hat eigene Abschnitte für ClamAV und nimmt Funde in den täglichen Bericht auf.
- **Dokumentation:** <https://docs.clamav.net> sowie `man clamscan` und `man clamdscan`

## Deinstallieren

### 1. ClamAV entfernen

Die Liste nennt alle Pakete aus den Schritten 2 und 14. Nicht installierte überspringt `apt` mit einem Hinweis.

```bash
sudo apt purge clamav clamav-base clamav-freshclam libclamav12 clamav-daemon clamdscan
```

`apt` meldet dabei, dass `/etc/clamav` und `/var/lib/clamav` nicht leer sind. Den Benutzer `clamav` entfernt `purge` selbst.

### 2. Übrige Ordner und eigene Dateien löschen

```bash
sudo rm -rf /etc/clamav /var/lib/clamav /var/log/clamav /etc/cron.weekly/clamscan-home
```

```bash
rm -rf ~/clamtest ~/quarantaene ~/clamscan.log
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
clamscan --version
```
