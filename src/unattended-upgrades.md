# unattended-upgrades

unattended-upgrades spielt Sicherheitsupdates von selbst ein, ohne dass jemand `apt upgrade` eintippen muss. Einmal am Tag holt es die Paketlisten, installiert alle Aktualisierungen aus den Sicherheitsquellen von Ubuntu und schreibt auf, was es getan hat. Auf einem Server, an dem man sich nicht täglich anmeldet, ist das der wichtigste einzelne Schutz: Bekannte Lücken bleiben so nur Stunden statt Wochen offen.

## Vorbemerkungen

- **Schon installiert und aktiv:** Ubuntu 26.04 bringt unattended-upgrades **2.12** mit und schaltet es bei der Installation ein. Diese Anleitung zeigt, wie du das prüfst, was genau geschieht und wie du es anpasst.
- **Nur Sicherheitsupdates:** Ab Werk installiert es Pakete aus der Quelle `-security`. Gewöhnliche Fehlerkorrekturen aus `-updates` und Pakete aus fremden Quellen (z. B. PostgreSQL oder Google Chrome von den Herstellern) bleiben liegen, bis du selbst `sudo apt upgrade` ausführst. Auf dem Testrechner warteten deshalb 37 Aktualisierungen, obwohl der Dienst lief.
- **Kein selbsttätiger Neustart:** Ein neuer Kernel wird installiert, aber erst nach einem Neustart benutzt. Den Neustart löst unattended-upgrades ab Werk nicht aus. Schritt 11 zeigt, wie du das änderst.
- **Eigene Einstellungen in eigener Datei:** Die mitgelieferte Datei `50unattended-upgrades` wird bei Paketupdates ersetzt. Eigene Werte kommen deshalb in eine zweite Datei mit höherer Nummer, die später gelesen wird und Vorrang hat.
- **Version:** Getestet mit unattended-upgrades **2.12** am 4. Oktober 2026. Geprüft sind die Einstellungen und Probeläufe. Ein selbsttätiger Neustart und der Mailversand sind nicht ausgelöst worden.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. unattended-upgrades installieren

Ist das Paket schon vorhanden, meldet `apt` das und ändert nichts.

```bash
sudo apt install unattended-upgrades
```

### 3. Prüfen, ob es eingeschaltet ist

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
```

**Prüfen:** Die Datei enthält zwei Zeilen mit dem Wert `"1"`:

```text
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

Die erste Zeile holt täglich die Paketlisten, die zweite installiert täglich die Updates. Die Zahl ist der Abstand in Tagen, `"0"` schaltet ab.

### 4. Bei Bedarf einschalten

Nur nötig, wenn die Datei fehlt oder dort `"0"` steht.

```bash
sudo dpkg-reconfigure -plow unattended-upgrades
```

Beantworte die Frage, ob stabile Updates automatisch heruntergeladen und installiert werden sollen, mit **Ja**.

## Verstehen, was geschieht

### 5. Zeitpunkte ansehen

Zwei Timer von systemd steuern den Ablauf. `apt-daily.timer` holt die Paketlisten, `apt-daily-upgrade.timer` installiert.

```bash
systemctl list-timers 'apt-daily*'
```

**Prüfen:** Es erscheinen zwei Zeilen. Die Spalte `NEXT` nennt den nächsten Lauf, `LAST` den letzten. Die Installation beginnt morgens ab 6 Uhr mit einer zufälligen Verzögerung von bis zu einer Stunde. War der Rechner zu dieser Zeit aus, wird der Lauf nach dem Einschalten nachgeholt.

### 6. Erlaubte Quellen ansehen

```bash
apt-config dump | grep '^Unattended-Upgrade'
```

**Prüfen:** Unter `Allowed-Origins` stehen vier Einträge. Entscheidend ist `${distro_id}:${distro_codename}-security`, die Sicherheitsquelle von Ubuntu. Der Eintrag ohne Zusatz ist die Grundausstattung der Version. Er ist nötig, weil ein Sicherheitsupdate gelegentlich ein weiteres Paket von dort braucht. Die beiden Einträge mit `ESM` gelten nur mit einem Abonnement von Ubuntu Pro.

`apt-config dump` zeigt immer die tatsächlich wirksamen Werte aus allen Dateien zusammen. Damit prüfst du später auch deine eigenen Einstellungen.

### 7. Probelauf starten

`--dry-run` rechnet alles durch, installiert aber nichts. `-v` zeigt, was geschehen würde.

```bash
sudo unattended-upgrade --dry-run -v
```

**Prüfen:** Die Ausgabe nennt zuerst die erlaubten Quellen. Gibt es nichts zu tun, folgt die Meldung, dass keine Pakete für eine automatische Aktualisierung gefunden wurden. Andernfalls erscheint eine Zeile `Pakete, welche aktualisiert werden:` mit den Namen.

Der Befehl heißt `unattended-upgrade` ohne `s` am Ende, das Paket und die Dateien dagegen `unattended-upgrades`.

### 8. Protokoll lesen

```bash
sudo less /var/log/unattended-upgrades/unattended-upgrades.log
```

**Prüfen:** Je Lauf steht dort ein Block mit Datum, der Liste der aktualisierten Pakete und am Ende `Alle Systemaktualisierungen installiert`. Auch Fehler stehen hier, etwa wenn ein Download fehlschlug. Mit <kbd>Umschalt</kbd>+<kbd>G</kbd> springst du ans Ende, <kbd>q</kbd> beendet `less`.

Was `dpkg` bei der Installation im Einzelnen ausgegeben hat, steht daneben in `unattended-upgrades-dpkg.log`.

### 9. Prüfen, ob ein Neustart aussteht

Verlangt ein Update einen Neustart, legt das System eine Markierungsdatei an.

```bash
cat /var/run/reboot-required
```

**Prüfen:** Meldet `cat`, dass die Datei nicht existiert, ist kein Neustart nötig. Andernfalls steht dort `*** System restart required ***`. Welche Pakete ihn verlangen, zeigt `cat /var/run/reboot-required.pkgs`.

## Anpassen

### 10. Datei für eigene Einstellungen anlegen

```bash
sudo nano /etc/apt/apt.conf.d/52unattended-upgrades-local
```

Die Schritte 11 bis 14 zeigen, was du dort eintragen kannst. Nimm nur die Blöcke, die du brauchst. Jede Zeile endet mit einem Semikolon. Speichere am Ende mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Selbsttätig neu starten

Mit diesen Zeilen startet der Rechner um 4 Uhr nachts neu, wenn ein Update das verlangt. Für einen Server, der nachts kaum genutzt wird, ist das sinnvoll. Auf einem Arbeitsplatzrechner eher nicht.

```text
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
```

### 12. Auch gewöhnliche Updates einspielen

Dieser Block nimmt die Quelle `-updates` dazu. Listen wie `Allowed-Origins` werden ergänzt, nicht ersetzt. Die vier Einträge aus Schritt 6 bleiben also bestehen.

```text
Unattended-Upgrade::Allowed-Origins {
	"${distro_id}:${distro_codename}-updates";
};
```

Damit bleibt das System ohne dein Zutun vollständig aktuell. Der Preis: Auch Updates, die keine Sicherheitslücke schließen, kommen ungeprüft auf den Rechner.

### 13. Einzelne Pakete ausnehmen

Pakete, die du lieber von Hand aktualisierst, etwa eine Datenbank. Der Eintrag ist ein Muster für den Anfang des Namens: `postgresql-` trifft `postgresql-18` und alle ähnlich benannten Pakete.

```text
Unattended-Upgrade::Package-Blacklist {
	"postgresql-";
};
```

### 14. Bericht per E-Mail und Aufräumen

Die ersten beiden Zeilen schicken eine E-Mail, sobald etwas installiert wurde oder ein Fehler auftrat. Dafür muss ein Mailprogramm wie Postfix eingerichtet sein. Die dritte Zeile entfernt nach jedem Lauf Pakete, die niemand mehr braucht, so wie `apt autoremove`.

```text
Unattended-Upgrade::Mail "thorsten";
Unattended-Upgrade::MailReport "on-change";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
```

Ersetze `thorsten` durch deinen Benutzernamen oder eine E-Mail-Adresse.

### 15. Einstellungen prüfen

```bash
apt-config dump | grep '^Unattended-Upgrade'
```

**Prüfen:** Deine Werte stehen in der Liste, zusätzlich zu den vier Quellen aus Schritt 6. Meldet der Befehl stattdessen einen Syntaxfehler mit Dateiname und Zeile, fehlt dort meist ein Semikolon oder eine Klammer.

Wiederhole danach den Probelauf aus Schritt 7. Mit dem Block aus Schritt 12 listet er nun auch die gewöhnlichen Updates auf. Ein Neustart des Dienstes ist nicht nötig, die Einstellungen werden bei jedem Lauf neu gelesen.

### 16. Sofort ausführen

Statt bis zum nächsten Morgen zu warten, kannst du den Lauf von Hand starten. Ohne `--dry-run` werden die Updates wirklich installiert.

```bash
sudo unattended-upgrade -v
```

## Wie geht es weiter?

- **Alle Optionen:** Die Datei `/etc/apt/apt.conf.d/50unattended-upgrades` enthält jede Einstellung als auskommentierte Zeile mit Erklärung. Lies dort nach und übernimm, was du brauchst, in deine eigene Datei.
- **Was sich geändert hat:** [Logwatch](logwatch.md) listet in seinem täglichen Bericht alle installierten und aktualisierten Pakete.
- **Fremde Quellen:** Pakete aus Quellen der Hersteller lassen sich ebenfalls aufnehmen. Die nötigen Angaben `o=` (Herkunft) und `a=` (Archiv) zeigt `apt-cache policy`. Nicht selbst getestet.
- **Rundum abgesichert:** Zusammen mit [UFW](ufw.md) und [Fail2ban](fail2ban.md) ergibt sich die übliche Grundsicherung eines Servers, wie sie [nginx auf dem Produktionsserver](nginx-produktion.md) im Zusammenhang zeigt.
- **Dokumentation:** `man unattended-upgrade` sowie <https://help.ubuntu.com/community/AutomaticSecurityUpdates>

## Deinstallieren

unattended-upgrades gehört zur Grundausstattung von Ubuntu. Statt das Paket zu entfernen, nimmst du die eigenen Einstellungen zurück oder schaltest es ab.

### 1. Eigene Einstellungen löschen

Danach gelten wieder die Werte ab Werk.

```bash
sudo rm /etc/apt/apt.conf.d/52unattended-upgrades-local
```

### 2. Optional: Automatische Updates abschalten

```bash
sudo dpkg-reconfigure -plow unattended-upgrades
```

Beantworte die Frage mit **Nein**.

**Prüfen:** In der Datei steht jetzt bei `Unattended-Upgrade` der Wert `"0"`.

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
```

Ab jetzt musst du Sicherheitsupdates wieder selbst mit `sudo apt update` und `sudo apt upgrade` einspielen.

### 3. Optional: Paket entfernen

Nur wenn du es wirklich nicht mehr auf dem System haben willst.

```bash
sudo apt purge unattended-upgrades
```
