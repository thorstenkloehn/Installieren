# Logwatch

Logwatch liest einmal am Tag die Protokolle des Rechners und fasst sie zu einem kurzen Bericht zusammen: welche Pakete installiert wurden, wer sich angemeldet hat, welche Befehle mit `sudo` liefen, welche Fehler der Kernel gemeldet hat, wie viele Zugriffe der Webserver hatte und wie voll die Festplatten sind. Den Bericht verschickt es per E-Mail oder zeigt ihn im Terminal. So musst du nicht jeden Tag selbst durch die Protokolle blättern und bemerkst trotzdem, wenn etwas Ungewöhnliches passiert.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Logwatch **7.12**. Mitinstalliert wird das empfohlene Paket `libdate-manip-perl`, das frei wählbare Zeiträume wie „die letzten sieben Tage“ ermöglicht.
- **Mailprogramm als Abhängigkeit:** Logwatch verlangt ein Programm zum Versenden von E-Mails. Ist noch keines vorhanden, installiert `apt` Postfix mit und fragt nach der Art der Einrichtung. **Dieser Teil ist nicht selbst getestet**, weil Postfix auf dem Testrechner schon vorhanden war. Für Berichte, die auf dem Rechner bleiben, genügt die Auswahl **Nur lokal** (*Local only*).
- **Kein Dienst:** Logwatch läuft nicht dauernd. Das Paket legt die Datei `/etc/cron.daily/00logwatch` an, die den Bericht einmal täglich erzeugt und an `root` schickt.
- **Mit `sudo`:** Viele Protokolle darf nur `root` lesen. Ohne `sudo` startet Logwatch zwar, der Bericht bleibt aber weitgehend leer.
- **Englische Berichte:** Überschriften und Texte der Berichte sind englisch.
- **Version:** Getestet mit Logwatch **7.12** am 4. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Logwatch installieren

```bash
sudo apt install logwatch
```

Erscheint dabei ein Dialog zur Einrichtung von Postfix, wähle **Nur lokal** und bestätige den vorgeschlagenen Namen des Rechners.

### 3. Version prüfen

```bash
logwatch --version
```

**Prüfen:** Die Ausgabe lautet `Logwatch 7.12 (released 01/22/25)`.

## Bericht im Terminal ansehen

### 4. Bericht für heute erzeugen

Ohne weitere Angabe wertet Logwatch den gestrigen Tag aus. `--range today` nimmt stattdessen den heutigen, so siehst du gleich etwas zur eben erfolgten Installation.

```bash
sudo logwatch --range today
```

**Prüfen:** Nach ein bis zwei Sekunden erscheint der Bericht. Er beginnt mit einem Kopf, der Zeitraum und Detailstufe nennt. Darunter folgt je Thema ein Abschnitt zwischen `Begin` und `End`:

```text
 --------------------- dpkg status changes Begin ------------------------

 Installed:
    libdate-manip-perl:all 6.98-1
    logwatch:all 7.12-3ubuntu2

 ---------------------- dpkg status changes End -------------------------
```

Abschnitte erscheinen nur für Themen, zu denen es im Zeitraum Einträge gab.

### 5. Die wichtigsten Abschnitte

| Abschnitt | Inhalt |
|-----------|--------|
| `dpkg status changes` | installierte, aktualisierte und entfernte Pakete |
| `Kernel` | Fehlermeldungen des Kernels, etwa von Treibern oder Datenträgern |
| `pam_unix` | geöffnete Sitzungen, fehlgeschlagene Anmeldungen |
| `SSHD` | Anmeldungen und abgewiesene Versuche über SSH |
| `Sudo (secure-log)` | welcher Benutzer welche Befehle mit `sudo` ausgeführt hat |
| `Cron` | ausgeführte Cronjobs |
| `httpd` | Zugriffe auf den Webserver, übertragene Menge, Fehlerseiten |
| `Postfix` | zugestellte und abgewiesene E-Mails |
| `Disk Space` | Belegung der Dateisysteme |

Der Abschnitt `httpd` wertet auch die Protokolle von [nginx](nginx.md) aus.

### 6. Detailstufe wählen

`--detail` kennt die Stufen `low`, `med` und `high`. Die Voreinstellung ist `low`. Höhere Stufen zeigen zusätzliche Abschnitte und mehr Einzelheiten.

```bash
sudo logwatch --range today --detail high
```

Weil der Bericht dann lang wird, hilft ein Blätterprogramm:

```bash
sudo logwatch --range today --detail high | less
```

### 7. Zeitraum wählen

Mehrere Wörter gehören in Anführungszeichen. Dieser Befehl fasst die letzten sieben Tage zusammen:

```bash
sudo logwatch --range 'between -7 days and today'
```

Weitere Möglichkeiten sind `yesterday`, `today` und `all`. Bei längeren Zeiträumen liegen ältere Einträge oft schon in gepackten Dateien wie `syslog.2.gz`. Die Option `--archives` bezieht sie mit ein. Alle Schreibweisen zeigt:

```bash
logwatch --range help
```

### 8. Nur ein Thema auswerten

`--service` beschränkt den Bericht auf ein Thema. Die Option darf mehrfach vorkommen. Dieser Befehl zeigt nur, welche Befehle in der letzten Woche mit `sudo` liefen:

```bash
sudo logwatch --service sudo --range 'between -7 days and today'
```

Die Namen aller Themen sind die Dateinamen in diesem Ordner:

```bash
ls /usr/share/logwatch/scripts/services
```

Gebräuchlich sind `sshd`, `sudo`, `http`, `kernel`, `dpkg`, `postfix` und `fail2ban`.

## Bericht speichern oder verschicken

### 9. Bericht als HTML-Datei speichern

`--output file` schreibt in eine Datei, `--format html` erzeugt eine Seite für den Browser.

```bash
sudo logwatch --range today --format html --output file --filename /root/bericht.html
```

**Prüfen:** Die Datei ist angelegt. Sie gehört `root` und ist nur für `root` lesbar, weil der Bericht vertrauliche Angaben enthalten kann.

```bash
sudo ls -l /root/bericht.html
```

### 10. Bericht per E-Mail an einen lokalen Benutzer schicken

`--mailto` verschickt den Bericht, statt ihn anzuzeigen. Ersetze `thorsten` durch deinen Benutzernamen.

```bash
sudo logwatch --range today --mailto thorsten
```

**Prüfen:** Die E-Mail liegt nach wenigen Sekunden im lokalen Postfach. Der Betreff lautet `Logwatch for <Rechnername> (Linux)`.

```bash
less /var/mail/thorsten
```

Eine Adresse außerhalb des Rechners, z. B. `name@example.org`, funktioniert nur, wenn Postfix E-Mails ins Internet zustellen darf. Bei der Einrichtung **Nur lokal** ist das nicht der Fall.

## Täglichen Bericht einrichten

Den täglichen Lauf gibt es bereits. Du legst nur noch fest, wohin der Bericht geht und wie ausführlich er ist.

### 11. Eigene Einstellungen anlegen

Die Voreinstellungen stehen in `/usr/share/logwatch/default.conf/logwatch.conf`. Diese Datei wird bei Updates überschrieben. Eigene Werte gehören in eine neue Datei unter `/etc/logwatch/conf`, sie haben Vorrang.

```bash
sudo nano /etc/logwatch/conf/logwatch.conf
```

Trage ein, was du ändern willst. Ein Beispiel:

```text
MailTo = thorsten
Detail = Med
Range = yesterday
```

`MailTo` ist der Empfänger, `Detail` die Stufe aus Schritt 6, `Range` der Zeitraum aus Schritt 7. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Themen ausschließen

Ein Thema, das dich nicht interessiert, schaltest du in derselben Datei mit einem Minus vor dem Namen ab. Die erste Zeile wählt zunächst alle Themen, die zweite nimmt eines wieder heraus:

```text
Service = All
Service = "-pam_unix"
```

### 13. Täglichen Lauf von Hand auslösen

Dieser Befehl ist derselbe, den der Cronjob jede Nacht ausführt. So prüfst du deine Einstellungen, ohne bis morgen zu warten.

```bash
sudo logwatch --output mail
```

**Prüfen:** Im Postfach des Empfängers aus Schritt 11 liegt eine neue E-Mail.

```bash
less /var/mail/thorsten
```

### 14. Zeitpunkt des täglichen Laufs

Die Skripte in `/etc/cron.daily` startet Ubuntu einmal täglich am frühen Morgen. Läuft der Rechner zu dieser Zeit nicht, holt er den Lauf nach dem Einschalten nach. Der Bericht behandelt dann den Vortag.

## Wie geht es weiter?

- **Protokolle selbst durchsehen:** Fällt im Bericht etwas auf, zeigt [lnav](lnav.md) die zugehörigen Meldungen im Zusammenhang.
- **Webzugriffe genauer:** Eine ausführliche Auswertung der Besucher liefert [GoAccess](goaccess.md).
- **Sofort statt täglich:** Logwatch berichtet im Nachhinein. Wer bei einem Ausfall sofort benachrichtigt werden will, nimmt [Monit](monit.md) oder [Uptime Kuma](uptime-kuma.md).
- **Dokumentation:** `man logwatch` sowie die ausführlich kommentierte Datei `/usr/share/logwatch/default.conf/logwatch.conf`

## Deinstallieren

### 1. Logwatch entfernen

`purge` löscht auch den täglichen Cronjob und den Ordner `/etc/logwatch` mit deinen Einstellungen.

```bash
sudo apt purge logwatch libdate-manip-perl
```

Postfix bleibt installiert. Wie man es entfernt, hängt davon ab, ob andere Programme es brauchen.

### 2. Eigene Dateien löschen

Nur nötig, wenn du Schritt 9 ausgeführt hast.

```bash
sudo rm -f /root/bericht.html
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
logwatch --version
```
