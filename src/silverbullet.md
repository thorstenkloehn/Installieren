# SilverBullet

SilverBullet ist eine Notiz- und Wissensablage im Browser, die alle Seiten als Markdown-Dateien in einem Ordner speichert. Seiten werden mit `[[Links]]` verknüpft, und kleine Abfragen und Skripte machen daraus ein persönliches Wissenssystem. Diese Anleitung lässt SilverBullet als Dienst auf dem eigenen Rechner laufen, mit Anmeldung.

## Vorbemerkungen

- **Keine Installation über apt:** Ubuntu hat kein Paket für SilverBullet. Das Projekt stellt den Server als einzelne Programmdatei bereit, die ohne weitere Abhängigkeiten läuft.
- **Version:** Getestet mit SilverBullet **2.11.1** unter Ubuntu 26.04.
- **Datenordner und Spaces:** SilverBullet 2 trennt zwei Ordner: Ein **Datenordner** enthält Einstellungen und Benutzerkonten. Die Notizen selbst liegen in einem **Space**, einem normalen Ordner mit Markdown-Dateien. Ein Server kann mehrere Spaces haben. Die Anleitung legt einen an.
- **Port:** SilverBullet läuft normalerweise auf Port 3000. Die Ports 3000 bis 3002 sind hier schon für [Martin](martin.md), [Wiki.js](wikijs.md) und [Outline](outline.md) vorgesehen. Die Anleitung verwendet deshalb Port **3003**, nur vom eigenen Rechner aus erreichbar.
- **Passwort:** `AdminPasswort123` ist ein Beispiel. Ersetze es durch ein eigenes Passwort.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. curl und unzip installieren

`curl` lädt das Programm herunter, `unzip` packt das Archiv aus.

```bash
sudo apt install curl unzip
```

### 3. Programm herunterladen

Lädt den Server für 64-Bit-PCs mit Intel- oder AMD-Prozessor (etwa 15 MB) in den Ordner `/tmp`. Die aktuelle Versionsnummer steht auf <https://github.com/silverbulletmd/silverbullet/releases>. Bei einer neueren Version ersetzt du die Nummer im Befehl.

```bash
curl -L -o /tmp/silverbullet.zip https://github.com/silverbulletmd/silverbullet/releases/download/2.11.1/silverbullet-server-linux-x86_64.zip
```

### 4. Archiv auspacken

Packt die Programmdatei `silverbullet` nach `/tmp/silverbullet`.

```bash
unzip -o /tmp/silverbullet.zip -d /tmp/silverbullet
```

### 5. Programm installieren

`install` kopiert die Datei nach `/usr/local/bin`, wo selbst installierte Programme hingehören, und macht sie mit `-m 755` für alle ausführbar.

```bash
sudo install -m 755 /tmp/silverbullet/silverbullet /usr/local/bin/silverbullet
```

**Prüfen:** Die Versionsnummer erscheint, sie beginnt mit `2.11.1`.

```bash
silverbullet version
```

## Einrichten

### 6. Systembenutzer anlegen

SilverBullet soll unter einem eigenen Benutzer laufen, mit dem man sich nicht anmelden kann. `--create-home` legt den Ordner `/var/lib/silverbullet` an, in dem Einstellungen und Notizen liegen werden.

```bash
sudo useradd --system --create-home --home-dir /var/lib/silverbullet --shell /usr/sbin/nologin silverbullet
```

### 7. Datenordner, Administrator und ersten Space anlegen

Der Befehl `setup` erledigt die Ersteinrichtung ohne Browser. Er legt den Datenordner an, darin das Administratorkonto, und einen Space namens „Notizen“. `sudo -u silverbullet` sorgt dafür, dass alles dem Benutzer aus Schritt 6 gehört.

```bash
sudo -u silverbullet silverbullet setup --admin 'admin:AdminPasswort123' --space Notizen --space-folder /var/lib/silverbullet/notizen /var/lib/silverbullet/data
```

Was die Angaben bedeuten:

- `--admin 'admin:AdminPasswort123'` – Benutzername und Passwort des Administrators, durch einen Doppelpunkt getrennt. SilverBullet speichert das Passwort nur verschlüsselt. Im Verlauf der Shell steht es aber im Klartext. Wer das nicht möchte, löscht die Zeile danach mit `history -d` und der Zeilennummer aus `history`.
- `--space Notizen` – der Name des ersten Space.
- `--space-folder` – der Ordner, in dem die Notizen dieses Space als Markdown-Dateien liegen. Ohne diese Angabe landen sie in einem Unterordner mit zufälligem Namen.
- `/var/lib/silverbullet/data` – der Datenordner für Einstellungen und Benutzerkonten.

**Prüfen:** Die Ausgabe endet mit `Setup complete: admin "admin" created` und `Space "Notizen" created at "/"`. Im Ordner der Notizen liegt eine erste Seite `index.md`.

```bash
sudo ls /var/lib/silverbullet/notizen
```

Alternativ kann man Schritt 7 weglassen. Dann startet SilverBullet beim ersten Aufruf im Browser einen Einrichtungsassistenten unter `/.setup/`, der dieselben Angaben abfragt.

## Als Dienst einrichten

### 8. systemd-Dienst anlegen

Damit SilverBullet beim Rechnerstart automatisch läuft, bekommt es eine Dienstdatei für systemd.

```bash
sudo nano /etc/systemd/system/silverbullet.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=SilverBullet
After=network.target

[Service]
Type=simple
User=silverbullet
Group=silverbullet
ExecStart=/usr/local/bin/silverbullet --hostname 127.0.0.1 --port 3003 /var/lib/silverbullet/data
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

- `--hostname 127.0.0.1` – SilverBullet ist nur vom eigenen Rechner aus erreichbar.
- `--port 3003` – der Port, unter dem SilverBullet läuft.
- `/var/lib/silverbullet/data` – der Datenordner aus Schritt 7. Dort findet SilverBullet auch den Pfad zu den Notizen.

### 9. systemd die neue Datei bekannt machen

systemd liest Dienstdateien nur beim Start oder auf Anweisung ein.

```bash
sudo systemctl daemon-reload
```

### 10. Dienst starten und Autostart einschalten

`enable` sorgt für den Start beim Hochfahren, `--now` startet SilverBullet zusätzlich sofort.

```bash
sudo systemctl enable --now silverbullet
```

**Prüfen:** Im Protokoll steht `multi-space mode: 1 space(s) configured` und `server running: http://localhost:3003`. Die Zeile `runtime Chrome detected` erscheint nur, wenn Google Chrome installiert ist. SilverBullet kann damit einige Funktionen auch auf dem Server ausführen, braucht Chrome aber nicht.

```bash
sudo journalctl -u silverbullet -n 10
```

### 11. Aufruf prüfen

Prüft, ob SilverBullet antwortet und die Notizen ohne Anmeldung gesperrt sind.

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3003/.fs/index.md
```

**Prüfen:** Die Ausgabe lautet `401`, also „nicht angemeldet“. Die Notizen sind geschützt.

## Erste Schritte

### 12. Im Browser anmelden

Öffne <http://localhost:3003> und melde dich mit `admin` und dem Passwort aus Schritt 7 an. Es erscheint die Seite `index` des Space „Notizen“.

### 13. Eine Notiz anlegen

Schreibe auf der Startseite einen Link wie `[[Einkaufsliste]]` und klicke darauf. SilverBullet legt die Seite an. Alles, was du tippst, wird automatisch gespeichert. Mit <kbd>Strg</kbd>+<kbd>K</kbd> springst du zu einer beliebigen Seite, mit <kbd>Strg</kbd>+<kbd>/</kbd> öffnest du die Befehlsliste.

**Prüfen:** Die neue Notiz liegt als Markdown-Datei im Ordner des Space.

```bash
sudo ls /var/lib/silverbullet/notizen
```

Weitere Benutzer und Spaces verwaltest du als Administrator im Dashboard unter <http://localhost:3003/.dashboard>.

## Aktualisieren

### 1. Neue Version herunterladen

Lädt die neueste Version. Ersetze die Versionsnummer durch die aktuelle von der Release-Seite.

```bash
curl -L -o /tmp/silverbullet.zip https://github.com/silverbulletmd/silverbullet/releases/download/2.11.1/silverbullet-server-linux-x86_64.zip
```

### 2. Archiv auspacken

Überschreibt die zuvor ausgepackte Datei.

```bash
unzip -o /tmp/silverbullet.zip -d /tmp/silverbullet
```

### 3. Programm ersetzen

Ersetzt die Programmdatei in `/usr/local/bin`. Einstellungen und Notizen bleiben unberührt.

```bash
sudo install -m 755 /tmp/silverbullet/silverbullet /usr/local/bin/silverbullet
```

### 4. Dienst neu starten

Der laufende Dienst verwendet sonst weiter die alte Version.

```bash
sudo systemctl restart silverbullet
```

**Prüfen:** `silverbullet version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Dienst stoppen und Autostart ausschalten

Beendet SilverBullet und verhindert den Start beim Hochfahren.

```bash
sudo systemctl disable --now silverbullet
```

### 2. Dienstdatei löschen

Entfernt die Dienstdatei aus Schritt 8.

```bash
sudo rm /etc/systemd/system/silverbullet.service
```

### 3. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
sudo systemctl daemon-reload
```

### 4. Programm und heruntergeladene Dateien löschen

Entfernt die Programmdatei und die Dateien in `/tmp`.

```bash
sudo rm -rf /usr/local/bin/silverbullet /tmp/silverbullet /tmp/silverbullet.zip
```

### 5. Benutzer, Einstellungen und Notizen löschen

`-r` löscht mit dem Benutzer auch seinen Ordner `/var/lib/silverbullet`. **Achtung:** Alle Notizen gehen dabei verloren. Wer sie behalten will, kopiert vorher den Ordner `/var/lib/silverbullet/notizen`. Die Warnung `Mail-Warteschlange … nicht gefunden` ist harmlos.

```bash
sudo userdel -r silverbullet
```

**Prüfen:** Der Befehl `silverbullet` wird nicht mehr gefunden, und unter Port 3003 antwortet nichts mehr.

```bash
curl -sI http://localhost:3003/
```
