# vnStat

vnStat zählt dauerhaft mit, wie viele Daten über jede Netzwerkschnittstelle empfangen und gesendet werden, und hält das in Fünf-Minuten-, Stunden-, Tages-, Monats- und Jahressummen fest. So siehst du jederzeit, wie viel Verkehr der Rechner heute, in diesem Monat oder seit der Installation verursacht hat, etwa bei einem Tarif mit Volumengrenze oder um einen auffälligen Upload zu entdecken. vnStat liest dafür nur die Zähler, die der Linux-Kernel ohnehin führt, und belastet den Rechner praktisch nicht.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert vnStat **2.13**. Das Paket `vnstati` erzeugt aus denselben Daten PNG-Grafiken und ist optional.
- **Dienst:** Ein kleiner Hintergrunddienst liest die Zähler alle paar Sekunden und schreibt sie alle 5 Minuten in eine SQLite-Datenbank unter `/var/lib/vnstat`. Erste Zahlen erscheinen deshalb erst nach einigen Minuten.
- **Ab jetzt:** vnStat zählt nur, was nach der Installation passiert. Ältere Daten gibt es nicht.
- **Kein Netzwerkzugriff:** vnStat öffnet keinen Port und sendet nichts. Es zeigt nur Mengen, nicht welche Programme oder Gegenstellen den Verkehr verursacht haben.
- **Englische Ausgabe:** Die Tabellen sind englisch beschriftet (**rx** = empfangen, **tx** = gesendet, **total** = Summe).
- **Version:** Getestet mit vnStat **2.13** am 2. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. vnStat installieren

Installiert vnStat und das Grafikwerkzeug `vnstati`. Der Dienst startet sofort und legt für jede gefundene Netzwerkschnittstelle einen Eintrag in seiner Datenbank an.

```bash
sudo apt install vnstat vnstati
```

### 3. Version prüfen

```bash
vnstat --version
```

**Prüfen:** Die Ausgabe beginnt mit `vnStat 2.13`.

### 4. Prüfen, ob der Dienst läuft

```bash
systemctl is-active vnstat
```

**Prüfen:** Die Ausgabe lautet `active`.

## Schnittstellen festlegen

### 5. Überwachte Schnittstellen ansehen

```bash
vnstat --iflist
```

Die Ausgabe nennt alle Schnittstellen, die der Kernel kennt, z. B. `Available interfaces: enp3s0 (1000 Mbit) wlp0s20f3`. Namen mit `en…` sind Netzwerkkabel, `wl…` steht für WLAN. Die Zahl in Klammern ist die erkannte Geschwindigkeit.

```bash
vnstat
```

**Prüfen:** Für jede Schnittstelle erscheint eine Zeile. Kurz nach der Installation steht dort noch `No data`.

### 6. Unbenutzte Schnittstelle entfernen (optional)

Nutzt der Rechner nur das Kabel, kann die WLAN-Schnittstelle aus der Datenbank. Ersetze `wlp0s20f3` durch den Namen aus Schritt 5. `--force` bestätigt das Löschen der bisher gezählten Daten dieser Schnittstelle.

```bash
sudo vnstat --remove -i wlp0s20f3 --force
```

**Prüfen:** Die Ausgabe lautet `Interface "wlp0s20f3" removed from database.` Wird die Schnittstelle später doch gebraucht, nimmt `sudo vnstat --add -i wlp0s20f3` sie wieder auf.

## Verkehr ansehen

### 7. Aktuelle Übertragungsrate messen

Dieser Befehl misst fünf Sekunden lang und braucht keine gespeicherten Daten. Ersetze `enp3s0` durch deine Schnittstelle.

```bash
vnstat -tr 5 -i enp3s0
```

**Prüfen:** Es erscheinen zwei Zeilen mit **rx** und **tx**, jeweils in kbit/s oder Mbit/s und Paketen pro Sekunde.

### 8. Live mitverfolgen

Zeigt die Rate fortlaufend an, bis du mit <kbd>Strg</kbd>+<kbd>C</kbd> abbrichst.

```bash
vnstat -l -i enp3s0
```

### 9. Übersicht anzeigen

Nach den ersten 5 Minuten hat der Dienst Daten gespeichert.

```bash
vnstat
```

**Prüfen:** Oben steht `Database updated:` mit der Uhrzeit der letzten Speicherung, darunter die Summe seit der Installation sowie je eine kleine Tabelle **monthly** und **daily**. Die Zeile **estimated** rechnet den bisherigen Verbrauch auf den ganzen Tag oder Monat hoch. Direkt nach der Installation ist diese Hochrechnung noch unbrauchbar und wird mit der Zeit genauer.

### 10. Andere Zeiträume anzeigen

Jeder Schalter zeigt eine eigene Tabelle:

| Befehl | Zeigt |
|--------|-------|
| `vnstat -5` | Fünf-Minuten-Abschnitte |
| `vnstat -h` | Stunden |
| `vnstat -d` | Tage |
| `vnstat -m` | Monate |
| `vnstat -y` | Jahre |
| `vnstat -t` | die Tage mit dem meisten Verkehr |

Zum Beispiel die Tagesübersicht:

```bash
vnstat -d
```

Mit `-i enp3s0` beschränkst du jede Ausgabe auf eine Schnittstelle.

## Grafiken erzeugen

### 11. Zusammenfassung als Bild speichern

`vnstati` nimmt dieselben Schalter wie `vnstat`. `-s` erzeugt eine Zusammenfassung mit Kreisdiagrammen für heute und den laufenden Monat, `-o` legt die Ausgabedatei fest.

```bash
vnstati -s -i enp3s0 -o ~/vnstat-uebersicht.png
```

### 12. Bild ansehen

```bash
xdg-open ~/vnstat-uebersicht.png
```

**Prüfen:** Das Bild zeigt den Namen der Schnittstelle, die Mengen für **today** und den Monat sowie rechts **all time**. Weitere Bilder liefern z. B. `vnstati -h` für Stunden oder `vnstati -d` für Tage.

## Einstellungen anpassen

### 13. Einstellungsdatei öffnen

Alle Einstellungen stehen in `/etc/vnstat.conf`. Zeilen, die mit `;` beginnen, sind auskommentiert und zeigen den Standardwert.

```bash
sudo nano /etc/vnstat.conf
```

### 14. Monatswechsel und Einheiten ändern

Zwei Einstellungen sind besonders nützlich. Suche die Zeilen mit <kbd>Strg</kbd>+<kbd>W</kbd>, entferne das `;` am Anfang und ändere den Wert:

- `MonthRotate 15` lässt den Abrechnungsmonat am 15. statt am 1. beginnen, passend zum Stichtag eines Mobilfunk- oder Internettarifs. Das gilt für alle ab dann gezählten Daten.
- `UnitMode 2` zeigt Mengen in Dezimal-Einheiten (kB, MB, GB) wie die meisten Anbieter. Standard ist `0` mit binären Einheiten (KiB, MiB, GiB), die rund 5 bis 7 Prozent kleinere Zahlen ergeben.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. Dienst neu starten

Damit der Dienst die geänderten Einstellungen übernimmt.

```bash
sudo systemctl restart vnstat
```

**Prüfen:** `vnstat -m` zeigt die Mengen nun z. B. in `MB` statt `MiB`.

```bash
vnstat -m
```

## Wie geht es weiter?

- **Weiterverarbeiten:** `vnstat --json` gibt alle Daten maschinenlesbar aus, `vnstat --oneline` eine einzige Zeile mit durch `;` getrennten Werten, gut für eigene Skripte.
- **Grafiken im Browser:** Ein Cron-Job kann mit `vnstati` regelmäßig Bilder in einen Ordner schreiben, den [nginx](nginx.md) ausliefert.
- **Welche Programme senden?** vnStat sieht nur Mengen. Für die Aufteilung nach Programmen eignen sich `nethogs` oder `iftop` (beide über apt), für einen Gesamtüberblick über den Rechner [Glances](glances.md) oder [btop](htop-btop.md).
- **Dokumentation:** `man vnstat`, `man vnstati`, `man vnstat.conf` und <https://humdi.net/vnstat/>

## Deinstallieren

### 1. vnStat entfernen

Entfernt beide Programme, die Einstellungsdatei, die Datenbank mit allen gezählten Daten und den Systembenutzer `vnstat`. **Achtung:** Die Verkehrsstatistik ist danach unwiderruflich gelöscht.

```bash
sudo apt purge vnstat vnstati
```

### 2. Erzeugte Bilder löschen (optional)

```bash
rm -f ~/vnstat-uebersicht.png
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
vnstat --version
```
