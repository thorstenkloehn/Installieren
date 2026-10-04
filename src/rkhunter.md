# rkhunter

rkhunter (Rootkit Hunter) sucht nach Rootkits. Das sind Schadprogramme, die sich nach einem Einbruch tief im System einnisten und ihre Spuren verwischen, etwa indem sie Befehle wie `ls` oder `ps` gegen gefälschte Fassungen tauschen. rkhunter sucht nach den Dateien bekannter Rootkits, merkt sich den Zustand wichtiger Systembefehle und meldet, wenn sich daran etwas ändert. Dazu kommen Prüfungen auf versteckte Dateien, auffällige Einträge in `/dev` und verdächtige Benutzerkonten.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert rkhunter **1.4.6**. Als Abhängigkeit kommt `net-tools` mit. Die empfohlenen Pakete würden 16 weitere Pakete nachziehen, darunter Ruby. Schritt 2 lässt sie mit `--no-install-recommends` weg.
- **Fehlalarme sind normal:** rkhunter meldet alles, was ungewöhnlich aussieht. Auf dem Testrechner endeten beim ersten Lauf drei Prüfzeilen mit einer Warnung, alle harmlos. Eine Warnung heißt deshalb: nachsehen, nicht: der Rechner ist befallen. Ab Schritt 8 trägst du geprüfte Stellen als Ausnahmen ein.
- **Nach Updates neu einlesen:** rkhunter vergleicht die Systembefehle mit einem gespeicherten Stand. Tauscht ein Update einen Befehl aus, sieht das für rkhunter wie eine Manipulation aus. Nach Updates liest du den Stand deshalb neu ein (Schritt 12).
- **Grenzen:** rkhunter läuft auf dem System, das es prüft. Ein Rootkit, das schon aktiv ist, kann auch rkhunter täuschen. Ein Lauf ohne Warnungen ist ein gutes Zeichen, aber kein Beweis.
- **Kein Nachladen aus dem Internet:** Im Ubuntu-Paket ist das Herunterladen neuer Datendateien abgeschaltet. `sudo rkhunter --update` endet mit `Update failed`, `--versioncheck` mit `Download failed`. Das ist so gewollt. Neue Fassungen kommen über `apt`.
- **Englische Ausgaben:** Alle Meldungen sind englisch.
- **Version:** Getestet mit rkhunter **1.4.6** am 4. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. rkhunter installieren

```bash
sudo apt install --no-install-recommends rkhunter
```

Je nach Einstellung des Systems stellt das Paket dabei bis zu drei Fragen zu automatischen Läufen. Beantworte sie mit **Nein**. Die Schritte 14 bis 16 zeigen, wie du die Automatik später gezielt einschaltest.

Am Ende der Installation liest das Paket den Zustand der Systembefehle zum ersten Mal ein. Im Test lautete die Zeile dazu `File created: searched for 183 files, found 179`.

### 3. Version prüfen

```bash
rkhunter --version
```

**Prüfen:** Die erste Zeile lautet `Rootkit Hunter 1.4.6`.

### 4. Konfiguration prüfen

Der Befehl sucht in den Einstellungen nach Fehlern.

```bash
sudo rkhunter --config-check
```

**Prüfen:** Der Befehl gibt nichts aus. Dann ist alles in Ordnung.

## System prüfen

### 5. Prüflauf starten

`--sk` (kurz für `--skip-keypress`) verhindert, dass rkhunter nach jedem Abschnitt auf die Eingabetaste wartet.

```bash
sudo rkhunter --check --sk
```

Der Lauf dauerte auf dem Testrechner knapp drei Minuten und gab rund 350 Zeilen aus.

**Prüfen:** Die Ausgabe ist in vier Teile gegliedert:

| Abschnitt | Was geprüft wird |
|-----------|------------------|
| `Checking system commands...` | Systembefehle: Vergleich mit dem gespeicherten Stand |
| `Checking for rootkits...` | Dateien und Ordner bekannter Rootkits, weitere Schadsoftware |
| `Checking the network...` | Netzwerkschnittstellen und Ports |
| `Checking the local host...` | Systemstart, Benutzerkonten, Konfiguration, Dateisystem |

Rechts steht in eckigen Klammern das Ergebnis. Grün (`OK`, `Not found`, `None found`) ist unauffällig, rot (`Warning`) solltest du dir ansehen.

### 6. Die Zusammenfassung lesen

Am Ende steht die Zusammenfassung. Im Test sah sie so aus:

```text
File properties checks...
    Files checked: 179
    Suspect files: 1

Rootkit checks...
    Rootkits checked : 477
    Possible rootkits: 0
```

Entscheidend ist die Zeile `Possible rootkits`. Steht dort `0`, hat rkhunter keine Datei eines bekannten Rootkits gefunden. `Suspect files` zählt Systembefehle, die vom gespeicherten Stand abweichen oder sonst auffallen.

### 7. Warnungen im Protokoll nachlesen

Der Bildschirm zeigt nur, dass es eine Warnung gab. Den Grund nennt das Protokoll. Es gehört `root`, daher mit `sudo`.

```bash
sudo grep -A5 'Warning:' /var/log/rkhunter.log
```

Im Test standen dort unter anderem diese Meldungen:

| Meldung | Ursache |
|---------|---------|
| `The command '/usr/bin/lwp-request' has been replaced by a script` | Das Programm ist von Haus aus ein Perl-Skript aus dem Paket `libwww-perl`. |
| `Suspicious file types found in /dev: /dev/shm/PostgreSQL.…` | PostgreSQL legt dort gemeinsam genutzten Speicher ab. |
| `Hidden directory found: /etc/.java` | Der Ordner stammt von Java. |
| `Hidden file found: /etc/.updated` | Die Datei legt systemd an. |

Ob eine Datei zu einem Paket gehört, zeigt `dpkg -S`:

```bash
dpkg -S /usr/bin/lwp-request
```

Die Ausgabe nennt das Paket, hier `libwww-perl`. Dateien, die erst im Betrieb entstehen, kennt `dpkg` nicht. Dort hilft ein Blick auf Inhalt und Datum.

## Fehlalarme abstellen

Eigene Einstellungen kommen in die Datei `/etc/rkhunter.conf.local`. Sie ergänzt die mitgelieferte `/etc/rkhunter.conf` und bleibt bei Updates des Pakets unberührt.

### 8. Ausnahmen eintragen

Trage nur Stellen ein, die du vorher geprüft hast.

```bash
sudo nano /etc/rkhunter.conf.local
```

Für die Meldungen aus Schritt 7 sieht der Inhalt so aus:

```text
SCRIPTWHITELIST=/usr/bin/lwp-request
ALLOWDEVFILE=/dev/shm/PostgreSQL.*
ALLOWHIDDENDIR=/etc/.java
ALLOWHIDDENFILE=/etc/.updated
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

| Option | Wirkung |
|--------|---------|
| `SCRIPTWHITELIST` | Dieser Befehl darf ein Skript sein. |
| `ALLOWDEVFILE` | Diese Datei in `/dev` ist erlaubt. Der Stern steht für beliebige Zeichen. |
| `ALLOWHIDDENDIR` | Dieser versteckte Ordner ist erlaubt. |
| `ALLOWHIDDENFILE` | Diese versteckte Datei ist erlaubt. |

Jede Option darf mehrfach vorkommen, je Zeile ein Pfad.

### 9. Konfiguration erneut prüfen

Ein Tippfehler im Namen einer Option fällt hier auf.

```bash
sudo rkhunter --config-check
```

**Prüfen:** Keine Ausgabe.

### 10. Nur die betroffene Prüfung wiederholen

`--enable` beschränkt den Lauf auf einzelne Prüfungen. `filesystem` umfasst `/dev` und die versteckten Dateien und ist nach wenigen Sekunden fertig.

```bash
sudo rkhunter --check --sk --enable filesystem
```

**Prüfen:** Beide Zeilen enden auf `[ None found ]`, und am Ende steht `No warnings were found while checking the system.`

Die Namen aller Prüfungen zeigt `sudo rkhunter --list tests`.

### 11. Vollständigen Lauf nur mit Warnungen

`--rwo` (kurz für `--report-warnings-only`) unterdrückt alles außer den Warnungen.

```bash
sudo rkhunter --check --sk --rwo
```

**Prüfen:** Der Befehl gibt nach knapp drei Minuten nichts aus. Der Rückgabewert ist dann `0`, bei Warnungen `1`:

```bash
echo $?
```

## Nach Updates

### 12. Stand der Systembefehle neu einlesen

Nach `sudo apt upgrade` oder der Installation neuer Programme meldet rkhunter geänderte Befehle. Wenn du weißt, dass die Änderung von dir stammt, übernimmst du den neuen Zustand:

```bash
sudo rkhunter --propupd
```

**Prüfen:** Die Ausgabe lautet `File updated: searched for 183 files, found 179`. Die Zahlen hängen davon ab, welche Programme installiert sind.

Führe den Befehl nicht aus, um eine Warnung loszuwerden, deren Ursache du nicht kennst. Damit würdest du eine mögliche Manipulation als gültig abspeichern.

### 13. So sieht eine erkannte Änderung aus

Im Test wurde eine überwachte Datei nach dem Einlesen verändert. Der nächste Lauf meldete:

```text
Warning: The file properties have changed:
         File: /usr/local/bin/rkh-probe
         Current hash: 2357a071…
         Stored hash : aee1dd71…
         Current size: 36    Stored size: 21
```

rkhunter nennt die Datei und stellt den jetzigen und den gespeicherten Wert für Prüfsumme, Größe und Änderungszeit gegenüber. Stammt die Änderung von einem Update, passt die Änderungszeit zum Zeitpunkt des Updates. Den findest du in `/var/log/apt/history.log`.

Nur die Systembefehle prüft:

```bash
sudo rkhunter --check --sk --rwo --enable properties
```

Dieser Teillauf dauerte im Test eine Minute.

## Automatisch prüfen

Das Paket bringt Skripte für einen täglichen Lauf mit. Sie sind nach der Installation abgeschaltet. Die Schalter stehen in `/etc/default/rkhunter`.

### 14. Voraussetzung prüfen

Der tägliche Lauf verschickt Warnungen als E-Mail und braucht dafür ein Programm `sendmail`, wie es ein Mailserver (z. B. Postfix) mitbringt.

```bash
ls /usr/sbin/sendmail
```

**Prüfen:** Der Pfad wird ausgegeben. Meldet `ls` einen Fehler, fehlt ein Mailserver. Bleib dann beim Lauf von Hand.

### 15. Täglichen Lauf einschalten

```bash
sudo nano /etc/default/rkhunter
```

Ändere die Zeile `CRON_DAILY_RUN=""` in:

```text
CRON_DAILY_RUN="true"
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

Die weiteren Zeilen der Datei:

| Zeile | Bedeutung |
|-------|-----------|
| `REPORT_EMAIL="root"` | Empfänger der Warnungen. `root` ist das lokale Postfach des Systems. |
| `CRON_DB_UPDATE=""` | Wöchentliches Nachladen der Datendateien. Leer lassen, es funktioniert im Ubuntu-Paket nicht (siehe Vorbemerkungen). |
| `APT_AUTOGEN="false"` | Mit `"true"` liest rkhunter nach jedem Lauf von `apt` den Stand der Systembefehle selbst neu ein. |
| `NICE="0"` | Priorität des Laufs. `19` bremst andere Programme am wenigsten. |
| `RUN_CHECK_ON_BATTERY="false"` | Im Akkubetrieb nicht prüfen. Die Erkennung braucht das Paket `powermgmt-base`. |

`APT_AUTOGEN="true"` erspart Schritt 12. Der Preis: Wurde ein Befehl vor dem nächsten `apt`-Lauf manipuliert, speichert rkhunter auch das als gültig ab. Auf einem Rechner mit [unattended-upgrades](unattended-upgrades.md) ist die Einstellung trotzdem verbreitet, weil sonst jedes automatische Update eine Warnung auslöst. Diese Einstellung wurde nicht selbst getestet.

### 16. Täglichen Lauf von Hand auslösen

Das Skript liegt in `/etc/cron.daily` und läuft sonst einmal am Tag von selbst. So probierst du es sofort aus:

```bash
sudo /etc/cron.daily/rkhunter
```

**Prüfen:** Nach knapp drei Minuten endet der Befehl ohne Ausgabe. Gab es Warnungen, liegt eine E-Mail mit dem Betreff `[rkhunter] <Rechnername> - Daily report` im Postfach von `root`:

```bash
sudo cat /var/mail/root
```

Gab es keine Warnungen, verschickt das Skript nichts, und die Datei fehlt möglicherweise.

## Wie geht es weiter?

- **Alle Optionen:** `/etc/rkhunter.conf` erklärt jede Einstellung in ausführlichen Kommentaren. Eigene Werte gehören in `/etc/rkhunter.conf.local`.
- **Abgeschaltete Prüfungen:** Das Ubuntu-Paket lässt einige Prüfungen aus, darunter die Suche nach versteckten Prozessen und Ports. Sie stehen in der Zeile `DISABLE_TESTS` in `/etc/rkhunter.conf`. Für die Suche nach versteckten Prozessen und Ports braucht rkhunter das Paket `unhide`. Nicht selbst getestet.
- **Protokoll:** `/var/log/rkhunter.log` enthält den letzten Lauf von Hand, der vorige liegt in `/var/log/rkhunter.log.old`. Der tägliche Lauf hängt seine Einträge an.
- **Verwandte Werkzeuge:** [Lynis](lynis.md) bewertet, wie gut das System abgesichert ist. [ClamAV](clamav.md) prüft Dateien auf bekannte Schadsoftware.
- **Dokumentation:** `man rkhunter` sowie <https://rkhunter.sourceforge.net>

## Deinstallieren

### 1. rkhunter entfernen

`purge` löscht auch `/etc/rkhunter.conf`, `/etc/default/rkhunter` und den gespeicherten Stand in `/var/lib/rkhunter`.

```bash
sudo apt purge rkhunter
```

### 2. Eigene Einstellungen und Protokolle löschen

Diese Dateien lässt `purge` liegen.

```bash
sudo rm -f /etc/rkhunter.conf.local /var/log/rkhunter.log /var/log/rkhunter.log.old
```

### 3. Optional: net-tools entfernen

Das Paket kam als Abhängigkeit mit und enthält ältere Netzwerkbefehle wie `ifconfig` und `netstat`. Entferne es nur, wenn du diese Befehle nicht anderweitig brauchst.

```bash
sudo apt purge net-tools
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
rkhunter --version
```
