# Uptime Kuma

Uptime Kuma prüft in festen Abständen, ob Websites, Server und Dienste erreichbar sind, und meldet sich, sobald etwas ausfällt oder ein TLS-Zertifikat bald abläuft. Es beherrscht unter anderem Abfragen per HTTP(S) mit Suche nach einem Schlüsselwort, Ping, offene TCP-Ports und DNS-Einträge. Die Ergebnisse zeigt es als übersichtliches Dashboard mit Verfügbarkeit und Antwortzeiten und auf Wunsch als öffentliche Statusseite. Benachrichtigungen verschickt es über mehr als 90 Wege, etwa E-Mail, Telegram, Matrix oder ntfy. Während [Zabbix](zabbix.md) oder [Munin](munin.md) vor allem das Innere eines Rechners beobachten, schaut Uptime Kuma von außen auf die Dienste.

> **Hinweis: nicht selbst getestet.** Diese Anleitung beruht auf der offiziellen Dokumentation von Uptime Kuma (README und Wiki, Stand 2. Oktober 2026). Selbst geprüft wurden nur das Herunterladen des Quellcodes von Version 2.5.5 und die Installation der Abhängigkeiten mit `npm ci` (Schritte 7 und 8) mit Node.js 22.22 und npm 9.2 aus Ubuntu. Das Herunterladen der vorgebauten Oberfläche, der Start des Dienstes und die Bedienung im Browser wurden für dieses Buch nicht ausprobiert. Die Menünamen stammen aus der deutschen Sprachdatei des Programms. Befehle und Ausgaben können daher von der Beschreibung abweichen.

## Vorbemerkungen

- **Kein apt-Paket:** Ubuntu 26.04 enthält Uptime Kuma nicht. Das Projekt bietet außer Docker nur die Installation aus dem Quellcode mit Node.js an. Node.js, npm und git kommen dabei aus den Ubuntu-Paketquellen. Uptime Kuma 2.5.5 braucht Node.js ab Version 20.4, Ubuntu liefert 22.22.
- **Eigener Systembenutzer:** Uptime Kuma läuft unter einem eigenen Benutzer `uptime-kuma` ohne Anmeldemöglichkeit. Programm und Daten liegen unter `/opt/uptime-kuma`, die Daten im Unterordner `data` in einer SQLite-Datenbank.
- **Nur lokal:** Ohne Einstellung lauscht Uptime Kuma auf Port **3001** an allen Netzwerkschnittstellen. Der systemd-Dienst in Schritt 10 beschränkt das auf `127.0.0.1`.
- **Eigenes Konto:** Uptime Kuma hat eine eigene Benutzerverwaltung. Beim ersten Aufruf legst du das Administrator-Konto an. Bis dahin könnte jeder, der die Seite erreicht, das Konto anlegen. Auch deshalb bleibt sie auf `127.0.0.1`.
- **Größe:** Auf einem Rechner ohne npm zieht `npm` aus Ubuntu viele kleine `node-*`-Pakete nach (je nach Rechner über 100). Uptime Kuma selbst installiert rund 650 npm-Pakete in seinen eigenen Ordner.
- **Version:** Uptime Kuma **2.5.5** vom 16. September 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Node.js, npm und git installieren

```bash
sudo apt install nodejs npm git
```

**Prüfen:** Die Ausgabe beginnt mit `v22`.

```bash
/usr/bin/node --version
```

> **Hinweis:** Die Anleitung ruft `node` und `npm` über `sudo` auf. Dabei gelten immer die Programme aus Ubuntu unter `/usr/bin`, auch wenn du für deinen Benutzer mit `nvm` eine andere Node.js-Version eingerichtet hast.

### 3. Systembenutzer anlegen

Legt den Benutzer `uptime-kuma` ohne Passwort und ohne Anmelde-Shell an. `--system` macht ihn zu einem Dienstkonto, `--home-dir` legt `/opt/uptime-kuma` als sein Heimatverzeichnis fest.

```bash
sudo useradd --system --home-dir /opt/uptime-kuma --shell /usr/sbin/nologin uptime-kuma
```

### 4. Programmordner anlegen

```bash
sudo mkdir /opt/uptime-kuma
```

### 5. Ordner dem Systembenutzer übergeben

So laufen alle weiteren Schritte unter `uptime-kuma` statt unter `root`. Die Installationsskripte der npm-Pakete bekommen dadurch keine Administratorrechte.

```bash
sudo chown uptime-kuma:uptime-kuma /opt/uptime-kuma
```

### 6. In den Programmordner wechseln

```bash
cd /opt/uptime-kuma
```

### 7. Quellcode herunterladen

Lädt genau die Version 2.5.5 von GitHub in den leeren Ordner. `--depth 1` lässt die ältere Versionsgeschichte weg. `-u uptime-kuma -H` führt den Befehl als Systembenutzer mit dessen Heimatverzeichnis aus.

```bash
sudo -u uptime-kuma -H git clone --branch 2.5.5 --depth 1 https://github.com/louislam/uptime-kuma.git /opt/uptime-kuma
```

**Prüfen:** Die Datei `package.json` ist vorhanden.

```bash
ls /opt/uptime-kuma/package.json
```

### 8. Abhängigkeiten installieren

Installiert die npm-Pakete, die der Server braucht, in den Unterordner `node_modules`. `--omit dev` lässt Entwicklerwerkzeuge weg, `--no-audit` die Sicherheitsabfrage bei npm. Das dauert etwa eine halbe Minute.

```bash
sudo -u uptime-kuma -H npm ci --omit dev --no-audit
```

**Prüfen:** Die letzte Zeile meldet etwa `added 652 packages`.

### 9. Vorgebaute Oberfläche herunterladen

Die Weboberfläche wird nicht auf dem eigenen Rechner gebaut. Dieses Skript lädt sie als fertiges Archiv von der Release-Seite auf GitHub und packt sie in den Ordner `dist` aus.

```bash
sudo -u uptime-kuma -H npm run download-dist
```

**Prüfen:** Im Ordner `dist` liegt eine Datei `index.html`.

```bash
ls /opt/uptime-kuma/dist/index.html
```

## Als Dienst einrichten

### 10. systemd-Dienst anlegen

Das Projekt empfiehlt den Prozessverwalter pm2. Mit systemd geht es ohne weiteres Werkzeug, und der Dienst startet beim Hochfahren mit.

```bash
sudo nano /etc/systemd/system/uptime-kuma.service
```

Trage Folgendes ein:

```ini
[Unit]
Description=Uptime Kuma
Documentation=https://github.com/louislam/uptime-kuma
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=uptime-kuma
WorkingDirectory=/opt/uptime-kuma
Environment=UPTIME_KUMA_HOST=127.0.0.1
Environment=UPTIME_KUMA_PORT=3001
ExecStart=/usr/bin/node server/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Was die Zeilen bewirken:

- `User` und `WorkingDirectory` lassen den Server als `uptime-kuma` im Programmordner laufen. Die Daten landen dadurch in `/opt/uptime-kuma/data`.
- `UPTIME_KUMA_HOST=127.0.0.1` beschränkt den Server auf den eigenen Rechner, `UPTIME_KUMA_PORT` legt den Port fest.
- `ExecStart` startet den Server direkt mit dem Node.js aus Ubuntu.
- `Restart=on-failure` startet ihn nach einem Absturz neu.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. systemd die neue Datei mitteilen

```bash
sudo systemctl daemon-reload
```

### 12. Dienst starten und für den Systemstart anmelden

```bash
sudo systemctl enable --now uptime-kuma
```

### 13. Prüfen, ob der Dienst läuft

```bash
systemctl status uptime-kuma
```

**Prüfen:** In der Zeile **Active** steht `active (running)`. Mit <kbd>q</kbd> verlässt du die Anzeige. Beim ersten Start legt Uptime Kuma seine Datenbank an. Die Meldungen dazu zeigt `journalctl -u uptime-kuma`.

### 14. Prüfen, dass Uptime Kuma nur lokal lauscht

```bash
ss -ltn | grep 3001
```

**Prüfen:** Die Zeile enthält `127.0.0.1:3001`.

## Erste Einrichtung

### 15. Uptime Kuma im Browser öffnen

```bash
xdg-open http://127.0.0.1:3001
```

### 16. Datenbank wählen

Beim ersten Aufruf fragt Uptime Kuma „Welche Datenbank möchtest du verwenden?“. Stelle oben bei **Sprache** auf Deutsch um, wähle **SQLite** und klicke auf **Weiter**. SQLite ist eine einfache Datenbankdatei und reicht für einige hundert Monitore. Das Einrichten kann einen Moment dauern.

### 17. Administrator-Konto anlegen

Unter **Erstelle dein Administrator-Konto** trägst du **Benutzername**, **Passwort** und **Passwort wiederholen** ein und klickst auf **Erstellen**. Danach öffnet sich das Dashboard.

## Ersten Monitor anlegen

### 18. Monitor hinzufügen

Klicke oben links auf **Neuen Monitor hinzufügen**.

### 19. Monitor einrichten

- **Monitortyp:** **HTTP(s)** für eine Website.
- **Anzeigename:** ein Name für die Liste, z. B. `Meine Website`.
- **URL:** die vollständige Adresse, z. B. `https://example.org`.
- **Heartbeat-Intervall:** wie oft geprüft wird, Vorgabe 60 Sekunden.
- **Wiederholungen:** wie oft eine fehlgeschlagene Prüfung wiederholt wird, bevor der Monitor als **Offline** gilt.

Klicke unten auf **Speichern**.

**Prüfen:** Der Monitor erscheint links in der Liste. Nach der ersten Prüfung zeigt er **Online** und einen grünen Balken. Rechts stehen Antwortzeit, **Verfügbarkeit** und bei HTTPS das Ablaufdatum des Zertifikats (**Zert.-Ablauf**).

### 20. Ausfall ausprobieren

Lege zum Test einen zweiten Monitor vom Typ **HTTP(s)** mit einer Adresse an, die es nicht gibt, z. B. `http://127.0.0.1:9`.

**Prüfen:** Der Monitor wechselt nach den eingestellten Wiederholungen auf **Offline** mit rotem Balken. Lösche ihn danach über **Löschen**.

## Benachrichtigung einrichten (optional)

### 21. Benachrichtigung anlegen

Öffne oben rechts über das Profilbild die **Einstellungen** und dort **Benachrichtigungen**. Klicke auf **Benachrichtigung einrichten**, wähle den **Benachrichtigungstyp**, z. B. **E-Mail (SMTP)**, **Telegram** oder **ntfy**, und trage die Zugangsdaten ein. **Testen** schickt eine Probenachricht.

Setzt du ein Häkchen bei **Standardmäßig aktiviert**, gilt die Benachrichtigung für alle neuen Monitore. **Auf alle bestehenden Monitore anwenden** schaltet sie für die schon angelegten ein. Klicke auf **Speichern**.

## Aktualisieren

### 22. Dienst anhalten

```bash
sudo systemctl stop uptime-kuma
```

### 23. Neue Version holen

Ersetze `2.5.5` durch die neue Versionsnummer von der Release-Seite <https://github.com/louislam/uptime-kuma/releases>. Die Befehle laufen im Programmordner.

```bash
cd /opt/uptime-kuma
```

```bash
sudo -u uptime-kuma -H git fetch --depth 1 origin tag 2.5.5
```

```bash
sudo -u uptime-kuma -H git checkout --force 2.5.5
```

### 24. Abhängigkeiten und Oberfläche erneuern

```bash
sudo -u uptime-kuma -H npm install --omit dev --no-audit
```

```bash
sudo -u uptime-kuma -H npm run download-dist
```

### 25. Dienst wieder starten

```bash
sudo systemctl start uptime-kuma
```

> **Tipp:** Sichere vor jedem Update den Ordner `/opt/uptime-kuma/data`, z. B. mit `sudo cp -a /opt/uptime-kuma/data /var/backups/uptime-kuma-data`. Er enthält alle Monitore, Einstellungen und den Verlauf.

## Wie geht es weiter?

- **Passwort vergessen:** Im Programmordner setzt `sudo -u uptime-kuma -H npm run reset-password` das Passwort des Administrator-Kontos zurück.
- **Statusseite:** Unter **Statusseiten** → **Neue Statusseite** fasst du Monitore auf einer öffentlichen Seite zusammen. Dafür muss Uptime Kuma über [nginx](nginx.md) mit eigener Domain erreichbar sein. nginx muss dabei WebSockets durchreichen, Hinweise stehen im Wiki unter „Reverse Proxy“.
- **Update-Prüfung:** Unter **Einstellungen** → **Über** lässt sich **Auf GitHub nach Updates suchen** abschalten.
- **Andere Prüfarten:** Neben HTTP(s) gibt es u. a. **Ping**, **TCP Port**, **DNS**, **HTTP(s) - Schlüsselwort** (sucht einen Text in der Seite) und Datenbankprüfungen.
- **Dokumentation:** <https://github.com/louislam/uptime-kuma/wiki>

## Deinstallieren

### 1. Dienst anhalten und abmelden

```bash
sudo systemctl disable --now uptime-kuma
```

### 2. Dienstdatei löschen

```bash
sudo rm /etc/systemd/system/uptime-kuma.service
```

### 3. systemd die Änderung mitteilen

```bash
sudo systemctl daemon-reload
```

### 4. Programm und Daten löschen

**Achtung:** Damit sind alle Monitore, Einstellungen und der gesamte Verlauf unwiderruflich gelöscht.

```bash
sudo rm -rf /opt/uptime-kuma
```

### 5. Systembenutzer entfernen

```bash
sudo deluser uptime-kuma
```

### 6. Node.js und npm entfernen (optional)

Nur wenn kein anderes Programm sie braucht. `git` bleibt in der Regel installiert, weil es oft auch anderweitig genutzt wird.

```bash
sudo apt purge nodejs npm
```

```bash
sudo apt autoremove --purge
```

**Prüfen:** Port 3001 ist frei, der Befehl gibt nichts aus.

```bash
ss -ltn | grep 3001
```
