# UFW

UFW (*Uncomplicated Firewall*) ist die Firewall, die Ubuntu mitbringt. Sie legt fest, welche Verbindungen von außen den Rechner erreichen dürfen, und übersetzt kurze Befehle wie `ufw allow 80/tcp` in die umfangreichen Regeln des Kernels. Der übliche Aufbau ist einfach: Alles Eingehende ist verboten, nur ausdrücklich freigegebene Ports sind offen. Auf einem Server im Internet gehört das zur Grundausstattung.

## Vorbemerkungen

- **Schon installiert:** Ubuntu 26.04 bringt UFW **0.36.2** mit, die Firewall ist aber ausgeschaltet. Schritt 2 stellt nur sicher, dass das Paket vorhanden ist.
- **Erst SSH freigeben, dann einschalten:** Wer einen Server über SSH verwaltet und die Firewall einschaltet, ohne SSH vorher zu erlauben, sperrt sich aus. Die Reihenfolge der Schritte 5 bis 8 ist deshalb wichtig. Regeln lassen sich anlegen, solange die Firewall noch aus ist.
- **Ausgehend bleibt alles erlaubt:** Der Rechner selbst kann weiter Updates laden und Webseiten aufrufen. Auch Verbindungen innerhalb des Rechners (`127.0.0.1`) sind nicht betroffen. Dienste, die nach den Anleitungen dieses Buchs nur auf `127.0.0.1` lauschen, brauchen keine Freigabe.
- **Hinter einem Router:** Ein Rechner im Heimnetz ist durch den Router schon vor Zugriffen aus dem Internet geschützt. UFW regelt dann zusätzlich, was andere Geräte im selben Netz erreichen dürfen.
- **IPv4 und IPv6:** UFW legt jede Regel für beide Protokolle an. In den Listen erscheint sie deshalb doppelt, einmal mit dem Zusatz `(v6)`.
- **Deutsche Ausgaben:** Die Meldungen von `ufw` sind übersetzt. Die Beispiele zeigen sie so, wie sie auf einem deutsch eingestellten System erscheinen.
- **Version:** Getestet mit UFW **0.36.2** am 4. Oktober 2026 auf einem Rechner ohne SSH-Server. Die Regeln sind angelegt und geprüft, ein Zugriff von einem zweiten Rechner aus ist nicht getestet.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. UFW installieren

Ist das Paket schon vorhanden, meldet `apt` das und ändert nichts.

```bash
sudo apt install ufw
```

### 3. Version prüfen

```bash
ufw version
```

**Prüfen:** Die erste Zeile lautet `ufw 0.36.2`.

### 4. Zustand ansehen

```bash
sudo ufw status
```

**Prüfen:** Auf einem frischen System lautet die Ausgabe `Status: Inaktiv`.

## Grundregeln festlegen

### 5. Eingehend alles verbieten

Das ist bereits die Voreinstellung. Der Befehl stellt sie sicher, falls sie einmal geändert wurde.

```bash
sudo ufw default deny incoming
```

### 6. Ausgehend alles erlauben

```bash
sudo ufw default allow outgoing
```

### 7. SSH freigeben

Nur nötig, wenn du den Rechner über SSH verwaltest. Dann aber unbedingt vor Schritt 8.

```bash
sudo ufw allow ssh
```

**Prüfen:** Die Ausgabe lautet `Regeln aktualisiert` und `Regeln aktualisiert (v6)`. Der Name `ssh` steht für Port 22. Läuft dein SSH-Server auf einem anderen Port, gib ihn als Zahl an, z. B. `sudo ufw allow 2222/tcp`.

Welche Regeln schon vorgemerkt sind, zeigt dieser Befehl auch bei ausgeschalteter Firewall:

```bash
sudo ufw show added
```

### 8. Firewall einschalten

```bash
sudo ufw enable
```

Bei einer Verbindung über SSH fragt UFW nach, ob bestehende Verbindungen gestört werden dürfen. Bestätige mit <kbd>y</kbd> und <kbd>Enter</kbd>.

**Prüfen:** Die Ausgabe lautet `Die Firewall ist beim System-Start aktiv und aktiviert`. Sie bleibt also auch nach einem Neustart eingeschaltet.

Öffne bei einem Server jetzt ein **zweites** Terminal und melde dich darin neu per SSH an, bevor du das erste schließt. Klappt das nicht, kannst du im ersten Fenster noch `sudo ufw disable` eingeben.

### 9. Regeln ausführlich anzeigen

```bash
sudo ufw status verbose
```

**Prüfen:** Die Ausgabe nennt den Zustand, die Voreinstellungen und darunter die Regeln:

```text
Status: Aktiv
Protokollierung: on (low)
Voreinstellung: deny (eingehend), allow (abgehend), disabled (gesendet)
Neue Profile: skip

Zu                         Aktion      Von
--                         ------      ---
22/tcp                     ALLOW IN    Anywhere
22/tcp (v6)                ALLOW IN    Anywhere (v6)
```

## Dienste freigeben

### 10. Einen Port freigeben

Ohne Angabe eines Protokolls gilt die Freigabe für TCP und UDP. Meist ist nur TCP gemeint, deshalb gehört `/tcp` dazu.

```bash
sudo ufw allow 8080/tcp
```

### 11. Einen Dienst über sein Profil freigeben

Viele Pakete bringen ein Profil mit, das ihre Ports unter einem Namen zusammenfasst. Die vorhandenen Profile zeigt:

```bash
sudo ufw app list
```

Mit [nginx](nginx.md) stehen dort unter anderem `Nginx HTTP` (Port 80), `Nginx HTTPS` (Port 443) und `Nginx Full` (beide). Was ein Profil öffnet, zeigt `sudo ufw app info 'Nginx Full'`. Die Freigabe:

```bash
sudo ufw allow 'Nginx Full'
```

**Prüfen:** In `sudo ufw status` steht die Zeile `80,443/tcp (Nginx Full)` mit `ALLOW IN`.

### 12. Nur für ein bestimmtes Netz freigeben

Eine Datenbank soll nicht für die ganze Welt offen sein. Diese Regel erlaubt den Zugriff auf [PostgreSQL](postgresql.md) (Port 5432) nur aus dem Heimnetz `192.168.178.0/24`:

```bash
sudo ufw allow from 192.168.178.0/24 to any port 5432 proto tcp
```

Für einen einzelnen Rechner gibst du statt des Netzes dessen Adresse an, z. B. `from 192.168.178.30`.

### 13. Eine Adresse aussperren

```bash
sudo ufw deny from 192.0.2.1
```

Die Adresse `192.0.2.1` ist für Beispiele reserviert. UFW prüft die Regeln von oben nach unten, die erste passende gilt. Eine Sperre wirkt deshalb nur, wenn sie vor der Freigabe steht, die sie einschränken soll. Mit `sudo ufw insert 1 deny from 192.0.2.1` setzt du sie an die erste Stelle. Wer Adressen nach Fehlversuchen selbsttätig sperren lassen will, nimmt [Fail2ban](fail2ban.md).

### 14. Anmeldeversuche begrenzen

`limit` erlaubt einen Port, sperrt aber eine Adresse vorübergehend, wenn sie in 30 Sekunden sechs oder mehr Verbindungen aufbaut. Das bremst das Durchprobieren von Passwörtern.

```bash
sudo ufw limit ssh
```

**Prüfen:** Die Regel für Port 22 trägt in `sudo ufw status` jetzt `LIMIT IN` statt `ALLOW IN`. Sie ersetzt die Regel aus Schritt 7.

## Regeln ändern und löschen

### 15. Regeln mit Nummern anzeigen

```bash
sudo ufw status numbered
```

**Prüfen:** Jede Regel trägt vorn eine Nummer:

```text
     Zu                         Aktion      Von
     --                         ------      ---
[ 1] 22/tcp                     LIMIT IN    Anywhere
[ 2] Nginx Full                 ALLOW IN    Anywhere
[ 3] 8080/tcp                   ALLOW IN    Anywhere
[ 4] 5432/tcp                   ALLOW IN    192.168.178.0/24
[ 5] Anywhere                   DENY IN     192.0.2.1
[ 6] 22/tcp (v6)                LIMIT IN    Anywhere (v6)
[ 7] Nginx Full (v6)            ALLOW IN    Anywhere (v6)
[ 8] 8080/tcp (v6)              ALLOW IN    Anywhere (v6)
```

### 16. Eine Regel löschen

Am sichersten löschst du eine Regel, indem du sie mit `delete` davor wiederholst. Das entfernt die Fassungen für IPv4 und IPv6 zugleich.

```bash
sudo ufw delete allow 8080/tcp
```

Die Sperre aus Schritt 13 entfernst du genauso:

```bash
sudo ufw delete deny from 192.0.2.1
```

Das Löschen über die Nummer, z. B. `sudo ufw delete 3`, entfernt nur diese eine Zeile. Die zugehörige Regel mit `(v6)` bleibt stehen und muss eigens gelöscht werden. Nach jedem Löschen rücken die Nummern nach, sieh sie dir also vor dem nächsten Löschen neu an.

### 17. Offene Ports mit den Regeln vergleichen

Dieser Befehl listet alle Ports, auf denen ein Programm von außen erreichbar lauscht, und nennt darunter die Regel, die den Port freigibt. Ports ohne Regel sind durch die Firewall geschützt.

```bash
sudo ufw show listening
```

## Protokoll und Wartung

### 18. Abgewiesene Verbindungen ansehen

UFW schreibt abgewiesene Verbindungen ins Systemprotokoll, gekennzeichnet mit `[UFW BLOCK]`.

```bash
sudo journalctl -k --grep 'UFW BLOCK'
```

Auf einem Server im Internet sammeln sich dort schnell viele Einträge von Programmen, die das Netz nach offenen Ports absuchen. Das ist normal. Wie viel protokolliert wird, regelt `sudo ufw logging` mit den Stufen `off`, `low` (Standard), `medium` und `high`.

### 19. Firewall vorübergehend ausschalten

Zur Fehlersuche, wenn unklar ist, ob die Firewall eine Verbindung verhindert. Die Regeln bleiben gespeichert.

```bash
sudo ufw disable
```

Wieder einschalten mit `sudo ufw enable`.

### 20. Alle Regeln verwerfen

`reset` schaltet die Firewall aus und löscht alle eigenen Regeln. Die bisherigen Dateien bleiben als Sicherung mit Datum im Namen in `/etc/ufw` liegen. Der Befehl fragt vorher nach.

```bash
sudo ufw reset
```

## Wie geht es weiter?

- **Vorher ansehen:** `sudo ufw --dry-run allow 9999/tcp` zeigt die Regeln, die ein Befehl erzeugen würde, ohne etwas zu ändern.
- **Server absichern:** Wie die Firewall mit HTTPS und automatischen Updates zusammenspielt, zeigt [nginx auf dem Produktionsserver](nginx-produktion.md).
- **Angreifer selbsttätig sperren:** [Fail2ban](fail2ban.md) wertet die Protokolle aus und sperrt Adressen nach wiederholten Fehlversuchen. Es arbeitet neben UFW und braucht keine Anpassung.
- **Dokumentation:** `man ufw` sowie <https://help.ubuntu.com/community/UFW>

## Deinstallieren

UFW gehört zur Grundausstattung von Ubuntu. Andere Pakete wie nginx und Postfix legen ihre Profile dort ab. Statt das Paket zu entfernen, schaltest du die Firewall aus und verwirfst die Regeln.

### 1. Firewall ausschalten und Regeln löschen

```bash
sudo ufw reset
```

Bestätige die Rückfrage mit <kbd>y</kbd> und <kbd>Enter</kbd>.

**Prüfen:** Die Firewall ist aus.

```bash
sudo ufw status
```

Die Ausgabe lautet `Status: Inaktiv`.

### 2. Sicherungen der alten Regeln löschen

`reset` hat die bisherigen Regeldateien mit Datum im Namen aufbewahrt. Dieser Befehl zeigt sie:

```bash
ls /etc/ufw/*.rules.*
```

Brauchst du sie nicht mehr, lösche sie:

```bash
sudo rm /etc/ufw/*.rules.*
```

### 3. Optional: Paket entfernen

Nur wenn du UFW wirklich nicht mehr auf dem System haben willst.

```bash
sudo apt purge ufw
```
