# smartmontools

smartmontools liest die Selbstdiagnose (*SMART*) von Festplatten und SSDs aus. Daran lässt sich ablesen, wie gesund ein Laufwerk ist: wie viel seiner Lebensdauer verbraucht ist, wie warm es wird, ob es Lesefehler gab oder Sektoren ersetzen musste. Das Programm `smartctl` zeigt diese Werte an und startet Selbsttests. Der Dienst `smartd` behält die Laufwerke im Hintergrund im Auge und warnt, wenn sich ein Wert verschlechtert, oft lange bevor ein Laufwerk ausfällt.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert smartmontools **7.5**. Es ist ein einzelnes Paket ohne weitere Abhängigkeiten.
- **Administratorrechte:** Fast alle Befehle brauchen `sudo`, weil sie direkt mit den Laufwerken sprechen.
- **Laufwerksnamen:** NVMe-SSDs heißen `/dev/nvme0`, `/dev/nvme1` usw., SATA- und USB-Laufwerke `/dev/sda`, `/dev/sdb` usw. Die Beispiele verwenden `/dev/nvme0`. Ersetze den Namen durch deinen aus Schritt 4.
- **USB-Geräte:** Kartenleser und viele USB-Gehäuse reichen SMART nicht oder nur mit Zusatzangaben durch. Für sie liefert `smartctl` oft nur eine Fehlermeldung.
- **Benachrichtigungen:** `smartd` schreibt Warnungen immer ins Systemprotokoll. Per E-Mail verschickt es sie nur, wenn auf dem Rechner ein Mailprogramm eingerichtet ist (siehe [Wie geht es weiter?](#wie-geht-es-weiter)).
- **Version:** Getestet mit smartmontools **7.5** an einer NVMe-SSD am 2. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. smartmontools installieren

Installiert `smartctl` und den Dienst `smartd`, der sofort startet und alle erkannten Laufwerke überwacht.

```bash
sudo apt install smartmontools
```

### 3. Version prüfen

```bash
smartctl --version
```

**Prüfen:** Die erste Zeile beginnt mit `smartctl 7.5`.

## Laufwerke prüfen

### 4. Laufwerke suchen

```bash
sudo smartctl --scan
```

**Prüfen:** Für jedes Laufwerk erscheint eine Zeile, z. B. `/dev/nvme0 -d nvme # /dev/nvme0, NVMe device` oder `/dev/sda -d sat # /dev/sda [SAT], ATA device`.

### 5. Angaben zum Laufwerk anzeigen

`-i` zeigt Modell, Seriennummer, Firmware und Größe.

```bash
sudo smartctl -i /dev/nvme0
```

**Prüfen:** Unter **START OF INFORMATION SECTION** stehen **Model Number** und **Total NVM Capacity**. Bei SATA-Laufwerken heißen die Zeilen **Device Model** und **User Capacity**, und die Zeile **SMART support is** sollte `Enabled` zeigen.

### 6. Gesamturteil abfragen

`-H` fragt das Urteil ab, das das Laufwerk über sich selbst fällt.

```bash
sudo smartctl -H /dev/nvme0
```

**Prüfen:** Die Zeile lautet `SMART overall-health self-assessment test result: PASSED`. Steht dort `FAILED`, solltest du die Daten sofort sichern und das Laufwerk ersetzen.

> **Hinweis:** `PASSED` heißt nur, dass das Laufwerk seine eigenen Grenzwerte noch nicht überschritten hat. Aussagekräftiger sind die Einzelwerte aus dem nächsten Schritt.

### 7. Einzelwerte anzeigen

```bash
sudo smartctl -A /dev/nvme0
```

Bei einer **NVMe-SSD** sind diese Zeilen am wichtigsten:

- **Critical Warning:** sollte `0x00` sein. Jeder andere Wert ist ein Alarm.
- **Temperature:** aktuelle Temperatur. Dauerhaft über 70 °C ist zu viel.
- **Available Spare:** verbleibende Ersatzzellen, neu `100%`. Fällt der Wert unter **Available Spare Threshold**, ist das Ende nahe.
- **Percentage Used:** geschätzter Verbrauch der Lebensdauer. Bei `100%` hat die SSD ihre vom Hersteller zugesagte Schreibmenge erreicht.
- **Data Units Written:** bisher geschriebene Datenmenge, in Klammern z. B. `[55,2 TB]`.
- **Power On Hours:** Betriebsstunden.
- **Unsafe Shutdowns:** wie oft der Strom ohne ordentliches Herunterfahren weg war.
- **Media and Data Integrity Errors:** sollte `0` sein.

Bei einer **SATA-Festplatte oder -SSD** erscheint stattdessen eine Tabelle. Hier sind vor allem die Spalte **RAW_VALUE** der Zeilen **Reallocated_Sector_Ct** (ersetzte Sektoren), **Current_Pending_Sector** (Sektoren, die sich nicht lesen ließen) und **Offline_Uncorrectable** wichtig. Alle drei sollten `0` sein. Steigen sie, kündigt sich ein Ausfall an.

### 8. Alles auf einmal anzeigen

`-x` zeigt sämtliche Angaben, Werte, Fehler- und Selbsttest-Protokolle in einer langen Ausgabe.

```bash
sudo smartctl -x /dev/nvme0 | less
```

Mit <kbd>q</kbd> verlässt du die Anzeige.

## Selbsttest

### 9. Kurzen Selbsttest starten

Der Test läuft im Laufwerk selbst und liest nur. Du kannst den Rechner währenddessen normal weiterbenutzen. Ein kurzer Test dauert ein bis zwei Minuten.

```bash
sudo smartctl -t short /dev/nvme0
```

**Prüfen:** Die Ausgabe meldet `Self-test has begun`. Bei SATA-Laufwerken steht dort zusätzlich, wann der Test voraussichtlich fertig ist.

### 10. Ergebnis abfragen

Warte etwa zwei Minuten.

```bash
sudo smartctl -l selftest /dev/nvme0
```

**Prüfen:** Oben steht `No self-test in progress`, darunter eine Zeile mit `Short` und `Completed without error`. Läuft der Test noch, zeigt die erste Zeile den Fortschritt in Prozent.

Ein gründlicherer Test liest das ganze Laufwerk: `sudo smartctl -t long /dev/nvme0`. Er kann je nach Größe von einigen Minuten bis zu vielen Stunden dauern.

## Überwachung mit smartd einrichten

### 11. Prüfen, ob smartd läuft

```bash
systemctl is-active smartmontools
```

**Prüfen:** Die Ausgabe lautet `active`.

### 12. Überwachte Laufwerke ansehen

```bash
journalctl -u smartmontools -b
```

**Prüfen:** Eine Zeile wie `Monitoring 0 ATA/SATA, 0 SCSI/SAS and 1 NVMe devices` nennt die überwachten Laufwerke. Laufwerke ohne SMART, etwa ein leerer Kartenleser, erscheinen mit einer Fehlerzeile und werden übergangen.

### 13. Einstellungsdatei öffnen

Ab Werk prüft `smartd` alle 30 Minuten den Zustand aller Laufwerke und meldet Verschlechterungen. Mit einer Zeile mehr lässt du zusätzlich die Temperatur überwachen und regelmäßig Selbsttests laufen.

```bash
sudo nano /etc/smartd.conf
```

### 14. Überwachungszeile anpassen

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> die einzige Zeile, die nicht mit `#` beginnt:

```text
DEVICESCAN -d removable -n standby -m root -M exec /usr/share/smartmontools/smartd-runner
```

Ändere sie in:

```text
DEVICESCAN -d removable -n standby -W 4,55,65 -s (S/../.././03|L/../../7/04) -m root -M exec /usr/share/smartmontools/smartd-runner
```

Was die Angaben bedeuten:

- `DEVICESCAN` überwacht alle gefundenen Laufwerke, `-d removable` duldet, dass Wechsellaufwerke fehlen.
- `-n standby` weckt schlafende Festplatten für die Prüfung nicht auf.
- `-W 4,55,65` protokolliert Temperaturänderungen ab 4 Grad, vermerkt ab 55 °C einen Hinweis im Protokoll und meldet ab 65 °C eine kritische Warnung, die auch an `-m` verschickt wird.
- `-s (S/../.././03|L/../../7/04)` startet jeden Tag um 3 Uhr einen kurzen Selbsttest (`S`) und jeden Sonntag um 4 Uhr einen langen (`L`). Die Felder stehen für Monat, Tag, Wochentag (1 = Montag, 7 = Sonntag) und Stunde. Ist der Rechner zu dieser Zeit aus, holt `smartd` den Test nicht nach.
- `-m root` schickt Warnungen an den Benutzer `root`, `-M exec …` legt das Programm fest, das sie verschickt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. smartd neu starten

```bash
sudo systemctl restart smartmontools
```

**Prüfen:** Das Protokoll enthält eine Zeile wie `initial Temperature is 42 Celsius`. Daran erkennst du, dass die Temperaturüberwachung aktiv ist.

```bash
journalctl -u smartmontools -n 20
```

### 16. Warnungen später nachlesen

Alles, was `smartd` feststellt, steht im Systemprotokoll. Dieser Befehl zeigt nur Warnungen und Fehler:

```bash
journalctl -u smartmontools -p warning
```

## Wie geht es weiter?

- **Warnungen per E-Mail:** `smartd` übergibt Warnungen an das Programm `mail`. Ist auf dem Rechner ein Mailserver wie Postfix eingerichtet, landen sie im Postfach von `root`. Mit einer zusätzlichen Angabe `-M test` in der Zeile aus Schritt 14 verschickt `smartd` bei jedem Start eine Probenachricht. Im Protokoll steht dann `Test of /usr/share/smartmontools/smartd-runner to root: successful`. Entferne `-M test` danach wieder.
- **Grafische Oberfläche:** `sudo apt install gsmartcontrol` zeigt dieselben Werte in einem Fenster an.
- **USB-Gehäuse:** Viele Gehäuse geben SMART mit der Angabe `-d sat` weiter, z. B. `sudo smartctl -a -d sat /dev/sdb`.
- **Langfristige Aufzeichnung:** [Zabbix](zabbix.md) bringt Vorlagen für SMART-Werte mit, sodass sich ihr Verlauf über Monate verfolgen lässt.
- **Dokumentation:** `man smartctl`, `man smartd`, `man smartd.conf` und <https://www.smartmontools.org>

## Deinstallieren

### 1. smartmontools entfernen

Entfernt `smartctl` und den Dienst `smartd` samt Einstellungsdatei und gespeichertem Zustand.

```bash
sudo apt purge smartmontools
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
smartctl --version
```
