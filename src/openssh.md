# OpenSSH-Server

Mit SSH (*Secure Shell*) bedienst du einen entfernten Rechner im Terminal, als säßest du davor. Die Verbindung ist verschlüsselt. Der OpenSSH-Server nimmt solche Verbindungen entgegen und ist der übliche Weg, einen Server ohne Bildschirm zu verwalten, Dateien dorthin zu kopieren oder mit Git zu arbeiten. Diese Anleitung installiert den Server, richtet die Anmeldung mit Schlüssel statt Passwort ein und schaltet danach die unsicheren Wege ab.

## Vorbemerkungen

- **Zwei Rechner:** In dieser Anleitung ist der **Server** der Rechner, auf den du zugreifen willst, und der **Arbeitsplatz** der Rechner, an dem du sitzt. Über jedem Abschnitt steht, wo die Befehle auszuführen sind. Das Programm `ssh` für den Arbeitsplatz ist bei Ubuntu schon installiert.
- **Installation über apt:** Ubuntu 26.04 liefert OpenSSH **10.2**. Das Paket `openssh-server` zieht drei kleine Pakete nach.
- **Sofort erreichbar:** Nach der Installation nimmt der Server auf Port **22** auf allen Netzwerkschnittstellen Verbindungen an. Jeder Benutzer des Rechners kann sich dann mit seinem Passwort anmelden. Auf einem Server im Internet beginnen fremde Anmeldeversuche binnen Minuten. Richte deshalb die Schritte 6 bis 13 zügig ein.
- **Start bei Bedarf:** Ubuntu startet den eigentlichen Dienst erst bei der ersten Verbindung. Dauerhaft aktiv ist nur `ssh.socket`, das auf dem Port lauscht. Für Port und Adresse hat das Folgen, siehe Schritt 15.
- **Eigene Einstellungen in eigener Datei:** Die Datei `/etc/ssh/sshd_config` bleibt unverändert. Eigene Werte kommen in eine Datei im Ordner `/etc/ssh/sshd_config.d`. Gilt eine Einstellung mehrfach, gewinnt die zuerst gelesene, und dieser Ordner wird vor dem Rest gelesen.
- **Nicht aussperren:** Schalte die Anmeldung mit Passwort erst ab, wenn die Anmeldung mit Schlüssel nachweislich funktioniert. Lass dabei eine bestehende Verbindung offen, bis du in einem zweiten Fenster eine neue aufgebaut hast.
- **Version:** Getestet mit OpenSSH **10.2p1** am 4. Oktober 2026. Geprüft sind Installation, Einstellungen, Syntaxprüfung, Portwechsel und das Erzeugen eines Schlüssels. **Nicht selbst getestet** sind das Übertragen des Schlüssels mit `ssh-copy-id` und die Anmeldung selbst (Schritte 8 bis 10), weil dafür auf dem Testrechner ein Zugang hätte hinterlegt werden müssen. Diese Schritte folgen der Dokumentation.

## Installation

*Auf dem Server.*

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. OpenSSH-Server installieren

```bash
sudo apt install openssh-server
```

### 3. Version prüfen

```bash
sshd -V
```

**Prüfen:** Die Ausgabe beginnt mit `OpenSSH_10.2p1`.

### 4. Prüfen, dass der Server lauscht

```bash
sudo ss -ltnp | grep ':22 '
```

**Prüfen:** Es erscheint mindestens eine Zeile mit Port 22. Als Programm steht dort `systemd`, das den Port stellvertretend offen hält.

```bash
systemctl is-active ssh.socket
```

Die Ausgabe lautet `active`.

### 5. Adresse des Servers ermitteln

```bash
hostname -I
```

**Prüfen:** Die erste Adresse der Ausgabe, z. B. `192.168.178.20`, brauchst du gleich am Arbeitsplatz. In den Beispielen steht dafür `SERVER`, für deinen Benutzernamen auf dem Server `benutzer`.

## Schlüssel erzeugen und übertragen

*Am Arbeitsplatz.*

Ein Schlüssel besteht aus zwei Dateien. Der private Teil bleibt auf dem Arbeitsplatz und wird nie weitergegeben. Der öffentliche Teil kommt auf den Server. Anmelden kann sich nur, wer den privaten Teil besitzt.

### 6. Schlüsselpaar erzeugen

Ed25519 ist das heute übliche Verfahren. Der Text hinter `-C` ist ein frei wählbarer Vermerk, an dem du den Schlüssel später wiedererkennst.

```bash
ssh-keygen -t ed25519 -C "thorsten@arbeitsplatz"
```

Bestätige den vorgeschlagenen Speicherort mit <kbd>Enter</kbd>. Danach fragt das Programm zweimal nach einer Passphrase. Sie schützt den privaten Schlüssel, falls jemand die Datei in die Hände bekommt. Vergib eine.

Hast du schon ein Schlüsselpaar, überspringe diesen Schritt. Ein vorhandenes würde sonst überschrieben, das Programm fragt vorher nach.

### 7. Schlüssel ansehen

```bash
ls -l ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.pub
```

**Prüfen:** Es gibt zwei Dateien. `id_ed25519` ist der private Teil und nur für dich lesbar (`-rw-------`), `id_ed25519.pub` der öffentliche.

### 8. Öffentlichen Schlüssel auf den Server übertragen

```bash
ssh-copy-id benutzer@SERVER
```

Bei der ersten Verbindung zeigt `ssh` den Fingerabdruck des Servers und fragt, ob du ihm vertraust. Vergleiche ihn mit der Ausgabe aus Schritt 11 und antworte mit `yes`. Danach gibst du einmalig das Passwort deines Benutzers auf dem Server ein.

`ssh-copy-id` hängt den öffentlichen Schlüssel auf dem Server an die Datei `~/.ssh/authorized_keys` an.

### 9. Mit Schlüssel anmelden

```bash
ssh benutzer@SERVER
```

**Prüfen:** Statt des Passworts für den Server wird die Passphrase des Schlüssels abgefragt. Danach zeigt die Eingabezeile den Namen des Servers.

### 10. Verbindung beenden

```bash
exit
```

## Server absichern

*Auf dem Server.* Lass dazu eine SSH-Verbindung offen oder arbeite direkt am Gerät.

### 11. Fingerabdruck des Servers anzeigen

Mit diesem Wert vergleichst du die Angabe, die `ssh` bei der ersten Verbindung zeigt. Stimmen beide überein, sprichst du wirklich mit deinem Server.

```bash
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

**Prüfen:** Die Ausgabe enthält eine Zeichenfolge, die mit `SHA256:` beginnt.

### 12. Datei für eigene Einstellungen anlegen

```bash
sudo nano /etc/ssh/sshd_config.d/10-absicherung.conf
```

Füge diesen Inhalt ein und ersetze `benutzer` durch deinen Benutzernamen:

```text
PermitRootLogin no
PasswordAuthentication no
MaxAuthTries 3
X11Forwarding no
AllowUsers benutzer
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

- `PermitRootLogin no` – der Benutzer `root` darf sich gar nicht anmelden. Verwaltet wird über einen gewöhnlichen Benutzer mit `sudo`.
- `PasswordAuthentication no` – Anmeldung nur noch mit Schlüssel. Das Durchprobieren von Passwörtern läuft damit ins Leere.
- `MaxAuthTries 3` – nach drei Fehlversuchen trennt der Server die Verbindung. Ab Werk sind es sechs.
- `X11Forwarding no` – schaltet das Weiterleiten grafischer Programme ab, das auf einem Server selten gebraucht wird.
- `AllowUsers` – nur die genannten Benutzer dürfen sich anmelden. Mehrere Namen trennst du mit Leerzeichen.

### 13. Einstellungen prüfen und anwenden

`sshd -t` prüft alle Dateien auf Fehler, ohne etwas zu ändern. Mach das vor jedem Neustart: Ein Tippfehler würde verhindern, dass der Dienst wieder startet.

```bash
sudo sshd -t
```

**Prüfen:** Es erscheint keine Ausgabe. Bei einem Fehler nennt der Befehl Datei und Zeile, z. B. `line 1: Bad configuration option: PermitRootLogn`.

```bash
sudo systemctl restart ssh
```

### 14. Wirksame Einstellungen ansehen

`sshd -T` gibt aus, was nach dem Zusammenführen aller Dateien tatsächlich gilt.

```bash
sudo sshd -T | grep -E '^(permitrootlogin|passwordauthentication|maxauthtries|allowusers) '
```

**Prüfen:** Die Ausgabe lautet:

```text
maxauthtries 3
permitrootlogin no
passwordauthentication no
allowusers benutzer
```

Öffne jetzt am Arbeitsplatz ein zweites Terminal und melde dich neu an (Schritt 9). Erst wenn das klappt, schließt du die alte Verbindung.

Ein Anmeldeversuch ohne Schlüssel endet nun mit `Permission denied (publickey).`

### 15. Optional: Anderen Port verwenden

Ein anderer Port macht den Server nicht sicherer, hält aber die Protokolle frei von den vielen automatischen Versuchen auf Port 22. Lege eine weitere Datei an:

```bash
sudo nano /etc/ssh/sshd_config.d/20-port.conf
```

```text
Port 2222
```

Weil bei Ubuntu `ssh.socket` den Port offen hält, genügt ein Neustart des Dienstes hier nicht. Die folgenden beiden Befehle lassen systemd die Einstellung neu einlesen und den Port wechseln:

```bash
sudo systemctl daemon-reload
```

```bash
sudo systemctl restart ssh.socket
```

**Prüfen:** Es lauscht nur noch der neue Port.

```bash
sudo ss -ltn | grep -E ':(22|2222) '
```

Dasselbe gilt, wenn du mit `ListenAddress` festlegst, auf welcher Adresse der Server lauscht. Am Arbeitsplatz gibst du den Port mit `ssh -p 2222 benutzer@SERVER` an.

## Bequemer verbinden

*Am Arbeitsplatz.*

### 16. Kurznamen für den Server anlegen

```bash
nano ~/.ssh/config
```

```text
Host meinserver
    HostName SERVER
    User benutzer
    Port 22
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. Ersetze `SERVER` durch Adresse oder Namen des Servers.

**Prüfen:** Die Anmeldung gelingt jetzt mit dem Kurznamen.

```bash
ssh meinserver
```

### 17. Dateien kopieren

`scp` kopiert über dieselbe Verbindung. Der Doppelpunkt trennt den Server vom Pfad dort.

```bash
scp datei.txt meinserver:/home/benutzer/
```

Für ganze Ordner eignet sich `rsync -av ordner/ meinserver:ordner/`. Es überträgt bei einer Wiederholung nur, was sich geändert hat.

## Wie geht es weiter?

- **Firewall:** Gib den Port in [UFW](ufw.md) frei, bevor du die Firewall einschaltest: `sudo ufw allow ssh` oder `sudo ufw allow 2222/tcp`.
- **Fehlversuche sperren:** [Fail2ban](fail2ban.md) sperrt Adressen, die sich wiederholt vergeblich anmelden. Das Jail für SSH ist dort schon eingeschaltet.
- **Passphrase nur einmal eingeben:** `ssh-agent` hält den entsperrten Schlüssel für die Dauer der Sitzung bereit, `ssh-add` übergibt ihn. Nicht selbst getestet.
- **Git über SSH:** Wie ein Server Repositories über SSH anbietet, zeigt [Git und cgit](git-cgit.md).
- **Dokumentation:** `man sshd_config`, `man ssh_config` sowie <https://www.openssh.com/manual.html>

## Deinstallieren

*Auf dem Server.* Danach ist der Rechner über SSH nicht mehr erreichbar. Arbeite dafür direkt am Gerät oder stelle sicher, dass du einen anderen Zugang hast.

### 1. OpenSSH-Server entfernen

`purge` löscht auch `/etc/ssh/sshd_config` und die Schlüssel des Servers (`ssh_host_*`). `apt` meldet dabei, dass `/etc/ssh/sshd_config.d` nicht leer ist, weil dort noch die eigenen Dateien liegen. Das Programm `ssh` zum Verbinden mit anderen Rechnern bleibt erhalten.

```bash
sudo apt purge openssh-server openssh-sftp-server ncurses-term ssh-import-id
```

### 2. Eigene Einstellungen löschen

```bash
sudo rm -rf /etc/ssh/sshd_config.d
```

### 3. Hinterlegte Schlüssel entfernen

Die Datei mit den zugelassenen öffentlichen Schlüsseln liegt im Home-Ordner und gehört zu keinem Paket.

```bash
rm -f ~/.ssh/authorized_keys
```

**Prüfen:** Port 22 ist geschlossen, der Befehl gibt nichts aus.

```bash
sudo ss -ltn | grep ':22 '
```
