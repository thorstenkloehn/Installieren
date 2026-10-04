# Fail2ban

Fail2ban schützt Dienste, die aus dem Internet erreichbar sind, vor dem massenhaften Durchprobieren von Passwörtern. Es liest die Protokolle mit, zählt fehlgeschlagene Anmeldungen je Absenderadresse und sperrt eine Adresse für eine Weile in der Firewall, sobald sie zu oft danebenlag. Am bekanntesten ist der Einsatz für SSH. Fertige Regeln gibt es aber auch für [nginx](nginx.md), Mailserver und viele andere Programme.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Fail2ban **1.1.0**. Mitinstalliert wird das empfohlene Paket `whois`.
- **Sinnvoll auf Servern:** Fail2ban hilft nur bei Diensten, die von außen erreichbar sind. Auf einem Rechner hinter einem Router ohne Portfreigabe gibt es nichts zu sperren.
- **SSH ist sofort geschützt:** Der Dienst startet direkt nach der Installation mit einer aktiven Regel für SSH. Sie liest das systemd-Journal und funktioniert ohne weitere Einrichtung. Ist kein SSH-Server installiert, läuft sie einfach leer mit.
- **Sperren über nftables:** Fail2ban legt für seine Sperren eine eigene Tabelle `f2b-table` in der Firewall des Kernels an. Es verträgt sich mit `ufw`, braucht `ufw` aber nicht.
- **Begriff Jail:** Eine Regel heißt bei Fail2ban *Jail*. Ein Jail verbindet einen Filter (woran erkenne ich einen Fehlversuch?), ein Protokoll (wo suche ich?) und eine Aktion (was sperre ich?).
- **Kein Ersatz für gute Passwörter:** Fail2ban bremst Angreifer, die von einer Adresse aus viele Versuche machen. Gegen verteilte Angriffe von tausenden Adressen hilft es wenig. Für SSH bleibt die Anmeldung mit Schlüssel statt Passwort der wichtigere Schutz.
- **Version:** Getestet mit Fail2ban **1.1.0** am 4. Oktober 2026. Auf dem Testrechner lief kein SSH-Server. Die Sperre für SSH ist deshalb von Hand ausgelöst, das selbstständige Sperren mit einem Jail für nginx und nachgestellten Protokollzeilen geprüft.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Fail2ban installieren

```bash
sudo apt install fail2ban
```

### 3. Version und Dienst prüfen

```bash
fail2ban-client --version
```

```bash
systemctl is-active fail2ban
```

**Prüfen:** Die Ausgaben lauten `Fail2Ban v1.1.0` und `active`.

### 4. Aktive Jails anzeigen

`fail2ban-client` spricht mit dem laufenden Dienst und braucht dafür `sudo`.

```bash
sudo fail2ban-client status
```

**Prüfen:** Die Ausgabe nennt ein Jail:

```text
Status
|- Number of jail:	1
`- Jail list:	sshd
```

## Eigene Einstellungen

Die Voreinstellungen stehen in `/etc/fail2ban/jail.conf`. Diese Datei wird bei Updates überschrieben und bleibt unverändert. Eigene Werte gehören in die Datei `/etc/fail2ban/jail.local`. Sie hat Vorrang und muss nur enthalten, was vom Standard abweicht.

### 5. Datei für eigene Einstellungen anlegen

```bash
sudo nano /etc/fail2ban/jail.local
```

### 6. Grundwerte eintragen

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
ignoreip = 127.0.0.1/8 ::1 192.168.178.0/24

[sshd]
enabled = true
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

Was die Einträge bedeuten:

- `[DEFAULT]` – Werte für alle Jails, sofern ein Jail nichts anderes festlegt.
- `bantime` – Dauer der Sperre. Ab Werk sind es zehn Minuten, hier eine Stunde.
- `findtime` und `maxretry` – wer innerhalb von zehn Minuten fünfmal scheitert, wird gesperrt.
- `ignoreip` – Adressen, die nie selbsttätig gesperrt werden. Trage hier dein Heimnetz oder die feste Adresse ein, von der aus du den Server verwaltest, damit du dich nicht selbst aussperrst. `192.168.178.0/24` ist das übliche Netz einer Fritzbox. Passe den Wert an oder lass ihn weg.
- `[sshd]` mit `enabled = true` – schaltet das Jail für SSH ein. Es ist schon aktiv, der Eintrag macht das nur sichtbar.

### 7. Konfiguration prüfen

```bash
sudo fail2ban-client -t
```

**Prüfen:** Die Ausgabe lautet `OK: configuration test is successful`.

### 8. Dienst neu starten

```bash
sudo systemctl restart fail2ban
```

**Prüfen:** Die Sperrdauer des Jails beträgt jetzt 3600 Sekunden.

```bash
sudo fail2ban-client get sshd bantime
```

## Sperren ansehen und aufheben

### 9. Zustand eines Jails anzeigen

```bash
sudo fail2ban-client status sshd
```

**Prüfen:** Die Ausgabe zeigt oben die gezählten Fehlversuche, unten die Sperren:

```text
Status for the jail: sshd
|- Filter
|  |- Currently failed:	0
|  |- Total failed:	0
|  `- Journal matches:	_SYSTEMD_UNIT=ssh.service + _COMM=sshd
`- Actions
   |- Currently banned:	0
   |- Total banned:	0
   `- Banned IP list:
```

Auf einem Server mit offenem SSH-Port stehen hier meist schon nach wenigen Stunden die ersten Adressen.

### 10. Eine Adresse von Hand sperren

Zum Ausprobieren eignet sich `192.0.2.1`. Diese Adresse ist für Beispiele reserviert und gehört niemandem.

```bash
sudo fail2ban-client set sshd banip 192.0.2.1
```

**Prüfen:** Die Ausgabe ist `1`. `sudo fail2ban-client status sshd` nennt die Adresse unter `Banned IP list`.

Eine Sperre von Hand gilt auch für Adressen aus `ignoreip`. Die Ausnahme schützt nur vor dem selbsttätigen Sperren.

### 11. Die Sperre in der Firewall ansehen

```bash
sudo nft list table inet f2b-table
```

**Prüfen:** Die Tabelle enthält eine Liste mit der gesperrten Adresse und eine Regel, die Verbindungen dieser Adressen zum SSH-Port 22 abweist:

```text
table inet f2b-table {
	set addr-set-sshd {
		type ipv4_addr
		elements = { 192.0.2.1 }
	}

	chain f2b-chain {
		type filter hook input priority filter - 1; policy accept;
		tcp dport 22 ip saddr @addr-set-sshd reject with icmp port-unreachable
	}
}
```

Gesperrt ist also nur der betroffene Dienst. Andere Ports erreicht die Adresse weiterhin.

### 12. Alle Sperren auf einen Blick

```bash
sudo fail2ban-client banned
```

**Prüfen:** Es erscheint je Jail eine Liste der gesperrten Adressen.

### 13. Eine Sperre aufheben

Das brauchst du, wenn du dich selbst oder einen Kollegen ausgesperrt hast.

```bash
sudo fail2ban-client set sshd unbanip 192.0.2.1
```

**Prüfen:** Die Ausgabe ist `1`, die Adresse fehlt in `sudo fail2ban-client status sshd`.

Ist nicht bekannt, in welchem Jail die Adresse steckt, hebt dieser Befehl die Sperre überall auf:

```bash
sudo fail2ban-client unban 192.0.2.1
```

### 14. Das Protokoll von Fail2ban lesen

Jeder erkannte Fehlversuch (`Found`), jede Sperre (`Ban`) und jede Freigabe (`Unban`) steht in `/var/log/fail2ban.log`.

```bash
sudo grep -E 'Found|Ban' /var/log/fail2ban.log
```

## Weitere Jails einschalten

Die Datei `jail.conf` enthält rund 90 vorbereitete Jails, die alle ausgeschaltet sind. Du schaltest ein Jail ein, indem du seinen Namen mit `enabled = true` in `jail.local` aufnimmst. Schalte nur Jails für Programme ein, die installiert sind: Findet ein Jail sein Protokoll nicht, startet Fail2ban nicht.

### 15. Jails für nginx und Wiederholungstäter ergänzen

```bash
sudo nano /etc/fail2ban/jail.local
```

Hänge diese Zeilen ans Ende an:

```ini
[nginx-http-auth]
enabled = true

[nginx-botsearch]
enabled = true

[recidive]
enabled = true
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

- `nginx-http-auth` – sperrt nach falschen Passwörtern an Seiten, die nginx mit Benutzername und Passwort schützt.
- `nginx-botsearch` – sperrt Programme, die reihenweise nach nicht vorhandenen Adressen wie `/phpmyadmin` oder `/wp-login.php` suchen.
- `recidive` – liest das Protokoll von Fail2ban selbst. Wer innerhalb eines Tages mehrfach gesperrt wurde, wird für eine Woche auf allen Ports gesperrt.

### 16. Prüfen und neu laden

```bash
sudo fail2ban-client -t
```

```bash
sudo systemctl restart fail2ban
```

**Prüfen:** Die Liste nennt jetzt vier Jails.

```bash
sudo fail2ban-client status
```

```text
`- Jail list:	nginx-botsearch, nginx-http-auth, recidive, sshd
```

### 17. Einen Filter an einem Protokoll ausprobieren

`fail2ban-regex` wendet einen Filter auf eine Datei an, ohne etwas zu sperren. So siehst du, ob ein Filter die Zeilen deines Protokolls überhaupt erkennt.

```bash
sudo fail2ban-regex /var/log/nginx/error.log nginx-http-auth
```

**Prüfen:** Die Zeile `Lines:` am Ende nennt, wie viele Zeilen gelesen und wie viele als Fehlversuch erkannt wurden (`matched`). Auf einem Server ohne geschützte Seiten ist die Zahl 0.

## Wie geht es weiter?

- **Wachsende Sperrdauer:** Mit `bantime.increment = true` unter `[DEFAULT]` verlängert sich die Sperre bei jeder Wiederholung derselben Adresse.
- **Alle vorbereiteten Jails:** Die Namen stehen in eckigen Klammern in `/etc/fail2ban/jail.conf`, die zugehörigen Filter liegen in `/etc/fail2ban/filter.d`. Es gibt unter anderem Jails für Postfix, Dovecot und Apache.
- **Benachrichtigung per E-Mail:** Mit `action = %(action_mw)s` unter `[DEFAULT]` und einer Adresse in `destemail` schickt Fail2ban bei jeder Sperre eine Nachricht. Dafür muss ein Mailprogramm wie Postfix eingerichtet sein. Nicht selbst getestet.
- **Tägliche Zusammenfassung:** [Logwatch](logwatch.md) hat einen eigenen Abschnitt für Fail2ban und listet die Sperren des Vortags.
- **Dokumentation:** `man fail2ban-client` und `man jail.conf` sowie <https://github.com/fail2ban/fail2ban/wiki>

## Deinstallieren

### 1. Fail2ban entfernen

`purge` beendet den Dienst, hebt alle Sperren auf und entfernt die Tabelle `f2b-table` aus der Firewall. `apt` meldet dabei, dass `/etc/fail2ban` nicht leer ist, weil dort noch die eigene Datei liegt.

```bash
sudo apt purge fail2ban whois
```

### 2. Eigene Einstellungen löschen

Die Datei `jail.local` gehört zu keinem Paket und bleibt deshalb liegen.

```bash
sudo rm -rf /etc/fail2ban
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
fail2ban-client --version
```
