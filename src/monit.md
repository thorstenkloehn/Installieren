# Monit

Monit behält Dienste, Prozesse, Dateisysteme und die Auslastung des Rechners im Auge. Fällt ein Dienst wie [nginx](nginx.md) aus, startet Monit ihn von selbst neu; wird der Speicherplatz knapp oder der Rechner überlastet, meldet es das im Protokoll, auf einer kleinen Weboberfläche oder per E-Mail. Monit ist ein einzelnes, sparsames Programm ohne Datenbank und ergänzt [Prometheus](prometheus.md) und [Grafana](grafana.md): Diese sammeln Messwerte für Diagramme, Monit greift dagegen sofort ein.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Monit **5.35.2**. Das Paket bringt keine weiteren Abhängigkeiten mit.
- **Aufbau der Einstellungen:** Die Hauptdatei `/etc/monit/monitrc` bleibt unverändert. Eigene Prüfungen kommen als einzelne Dateien in den Ordner `/etc/monit/conf.d/`, den Monit automatisch einliest. So bleibt die Hauptdatei bei Updates unberührt.
- **Prüfabstand:** Monit prüft in der Grundeinstellung alle **120 Sekunden**. Bis ein ausgefallener Dienst neu startet, können also bis zu zwei Minuten vergehen.
- **Voraussetzung für Teil 3:** nginx ist installiert, wie in der Anleitung [nginx](nginx.md) beschrieben. Die übrigen Teile funktionieren auch ohne nginx.
- **Version:** Getestet mit Monit **5.35.2** am 2. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Monit installieren

Das Paket richtet Monit als Systemdienst ein und startet es sofort.

```bash
sudo apt install monit
```

### 3. Version prüfen

```bash
monit --version
```

**Prüfen:** Die erste Zeile lautet `This is Monit version 5.35.2`.

### 4. Dienst prüfen

```bash
systemctl is-active monit
```

**Prüfen:** Die Ausgabe lautet `active`.

## Teil 1: Weboberfläche und Befehl `monit status`

Die Befehle `monit status` und `monit summary` fragen den laufenden Monit-Dienst über seine eingebaute Weboberfläche ab. Solange diese ausgeschaltet ist (so ist es nach der Installation), funktionieren sie nicht. Deshalb schaltest du die Oberfläche zuerst ein, aber nur für diesen Rechner und mit Passwort.

### 5. Einstellungsdatei für die Weboberfläche anlegen

```bash
sudo nano /etc/monit/conf.d/weboberflaeche
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), ersetze `GeheimesPasswort` durch ein eigenes Passwort, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
set httpd port 2812
    use address 127.0.0.1
    allow 127.0.0.1
    allow admin:GeheimesPasswort
```

Was die Zeilen bedeuten:

- `set httpd port 2812` schaltet die Weboberfläche auf Port 2812 ein.
- `use address 127.0.0.1` lässt Monit nur auf diesem Rechner lauschen, aus dem Netz ist die Oberfläche nicht erreichbar.
- `allow 127.0.0.1` erlaubt Verbindungen von diesem Rechner.
- `allow admin:…` legt Benutzername und Passwort für die Anmeldung fest.

> **Hinweis:** Monit lässt nur Verbindungen über IPv4 zu, weil die Oberfläche auf `127.0.0.1` lauscht. Im Browser deshalb immer `127.0.0.1` eingeben, nicht `localhost`: Firefox und Chrome versuchen bei `localhost` zuerst die IPv6-Adresse `::1`.

### 6. Datei vor anderen Benutzern schützen

Die Datei enthält das Passwort im Klartext. Mit `chmod 600` darf nur noch `root` sie lesen.

```bash
sudo chmod 600 /etc/monit/conf.d/weboberflaeche
```

### 7. Einstellungen prüfen

`monit -t` liest alle Einstellungsdateien und meldet Tippfehler, ohne etwas zu verändern.

```bash
sudo monit -t
```

**Prüfen:** Die Ausgabe lautet `Control file syntax OK`. Andernfalls nennt Monit Datei und Zeile des Fehlers.

### 8. Monit neu laden

Monit liest die Einstellungen neu ein, ohne dass die Überwachung unterbrochen wird.

```bash
sudo systemctl reload monit
```

### 9. Status abfragen

```bash
sudo monit summary
```

**Prüfen:** Die Tabelle zeigt eine Zeile mit dem Namen deines Rechners, dem Status `OK` und dem Typ `System`. Ohne `sudo` meldet Monit `Permission denied`, weil es dann die Einstellungen nicht lesen darf.

### 10. Weboberfläche öffnen

```bash
xdg-open http://127.0.0.1:2812
```

Melde dich mit dem Benutzer `admin` und deinem Passwort aus Schritt 5 an.

**Prüfen:** Die Seite trägt die Überschrift **Monit Service Manager** und zeigt unter **System** Auslastung (**Load**), Prozessor (**CPU**) und Arbeitsspeicher (**Memory**). Die Oberfläche gibt es nur auf Englisch.

## Teil 2: Rechner und Speicherplatz überwachen

### 11. Datei für die Systemprüfungen anlegen

```bash
sudo nano /etc/monit/conf.d/system
```

Füge diesen Inhalt ein, speichere und beende nano:

```text
check system $HOST
    if loadavg (5min) > 4 then alert
    if memory usage > 90% then alert
    if cpu usage > 95% for 10 cycles then alert

check filesystem wurzel with path /
    if space usage > 90% then alert
```

Was die Zeilen bedeuten:

- `check system $HOST` prüft den Rechner selbst. `$HOST` setzt Monit durch den Rechnernamen.
- `loadavg (5min) > 4` schlägt an, wenn im Mittel der letzten fünf Minuten mehr als vier Prozesse gleichzeitig auf Rechenzeit warten. Ein guter Wert ist etwa die Zahl der Prozessorkerne (`nproc` zeigt sie).
- `memory usage > 90%` meldet knappen Arbeitsspeicher.
- `for 10 cycles` verlangt, dass die Prozessorlast zehn Prüfungen hintereinander über 95 % liegt. Kurze Spitzen lösen so keine Meldung aus.
- `check filesystem wurzel with path /` überwacht die Partition, auf der Ubuntu liegt. `wurzel` ist ein frei gewählter Name.
- `then alert` schreibt eine Meldung ins Protokoll `/var/log/monit.log` und verschickt eine E-Mail, falls ein Mailserver eingestellt ist (siehe „Wie geht es weiter?“).

### 12. Einstellungen prüfen und neu laden

```bash
sudo monit -t
```

```bash
sudo systemctl reload monit
```

### 13. Speicherplatz anzeigen

`monit status` mit einem Namen zeigt alle Messwerte dieser einen Prüfung.

```bash
sudo monit status wurzel
```

**Prüfen:** Unter der Überschrift `Filesystem 'wurzel'` stehen `status OK` und Zeilen wie `space free total`.

## Teil 3: nginx bei Ausfall neu starten

### 14. Datei für nginx anlegen

```bash
sudo nano /etc/monit/conf.d/nginx
```

Füge diesen Inhalt ein, speichere und beende nano:

```text
check process nginx with pidfile /run/nginx.pid
    start program = "/usr/bin/systemctl start nginx"
    stop program = "/usr/bin/systemctl stop nginx"
    if failed host 127.0.0.1 port 80 protocol http then restart
    if 3 restarts within 5 cycles then unmonitor
```

Was die Zeilen bedeuten:

- `with pidfile /run/nginx.pid` sagt Monit, woran es den laufenden nginx-Prozess erkennt. In dieser Datei steht seine Prozessnummer.
- `start program` und `stop program` legen fest, wie Monit nginx startet und stoppt. Monit nutzt dafür denselben Weg wie du, nämlich systemd.
- `if failed … protocol http then restart` ruft bei jeder Prüfung die Startseite ab. Antwortet nginx nicht, startet Monit es neu. Ein Prozess, der zwar läuft, aber hängt, fällt so ebenfalls auf.
- `if 3 restarts within 5 cycles then unmonitor` verhindert eine Endlosschleife: Scheitert der Neustart dreimal kurz hintereinander, etwa wegen eines Fehlers in der nginx-Konfiguration, hört Monit auf und meldet das.

> **Hinweis:** Unter `/etc/monit/conf-available/` liefert das Paket fertige Vorlagen, auch eine für nginx. Sie stammt aus älteren Ubuntu-Versionen und startet Dienste über `service`. Die eigene Datei oben ist kürzer und nutzt systemd direkt.

### 15. Einstellungen prüfen und neu laden

```bash
sudo monit -t
```

```bash
sudo systemctl reload monit
```

**Prüfen:** In der Übersicht steht nginx mit dem Status `OK` und dem Typ `Process`.

```bash
sudo monit summary
```

### 16. Ausfall ausprobieren

Halte nginx an, als wäre es abgestürzt:

```bash
sudo systemctl stop nginx
```

### 17. Neustart abwarten

Warte bis zu zwei Minuten (ein Prüfabstand) und frage dann den Zustand ab:

```bash
systemctl is-active nginx
```

**Prüfen:** Die Ausgabe lautet wieder `active`. Das Protokoll zeigt, was Monit getan hat:

```bash
sudo grep nginx /var/log/monit.log
```

Die letzten Zeilen lauten `'nginx' process is not running`, `'nginx' trying to restart` und `'nginx' start: '/usr/bin/systemctl start nginx'`.

## Teil 4: Überwachung steuern

### 18. Überwachung eines Dienstes pausieren

Willst du nginx absichtlich länger anhalten, etwa für Wartungsarbeiten, sagst du es vorher Monit. Sonst startet Monit den Dienst beim nächsten Durchgang wieder.

```bash
sudo monit unmonitor nginx
```

**Prüfen:** `sudo monit summary` zeigt bei nginx den Status `Not monitored`.

### 19. Überwachung fortsetzen

```bash
sudo monit monitor nginx
```

**Prüfen:** `sudo monit summary` zeigt bei nginx wieder `OK`.

### 20. Dienst über Monit neu starten

Startest du einen Dienst über Monit neu, weiß Monit Bescheid und meldet den kurzen Ausfall nicht als Fehler.

```bash
sudo monit restart nginx
```

In der Weboberfläche gibt es dafür auf der Seite eines Dienstes (Klick auf seinen Namen) die Schaltflächen **Start service**, **Stop service**, **Restart service** und **Disable monitoring**.

## Wie geht es weiter?

- **E-Mail-Benachrichtigung:** Mit `set mailserver` und `set alert` in einer weiteren Datei unter `/etc/monit/conf.d/` verschickt Monit Meldungen per E-Mail. Dafür braucht der Rechner Zugang zu einem Mailserver, etwa dem eines E-Mail-Anbieters.
- **Weitere Dienste:** Nach dem Muster aus Schritt 14 lassen sich auch [PostgreSQL](postgresql.md), [MariaDB](mariadb.md) oder [Valkey](valkey.md) überwachen. Die Prozessnummer findet Monit dann mit `check process NAME matching PROGRAMMNAME`, falls der Dienst keine PID-Datei schreibt.
- **Prüfabstand ändern:** Der Abstand steht in `/etc/monit/monitrc` in der Zeile `set daemon 120`.
- **Dokumentation:** `man monit` oder <https://mmonit.com/monit/documentation/>

## Deinstallieren

### 1. Monit entfernen

`purge` entfernt Monit samt Protokoll und Statusdateien. Der überwachte Dienst nginx bleibt unverändert installiert.

```bash
sudo apt purge monit
```

### 2. Eigene Einstellungsdateien löschen

Die Dateien aus den Schritten 5, 11 und 14 gehören nicht zum Paket. `apt` lässt sie deshalb mit dem Ordner `/etc/monit` liegen.

```bash
sudo rm -rf /etc/monit
```

**Prüfen:** Der Befehl `monit` wird nicht mehr gefunden.

```bash
monit --version
```
