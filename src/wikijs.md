# Wiki.js

Wiki.js ist eine moderne Wiki-Software auf Basis von Node.js, deren Seiten man in Markdown oder in einem grafischen Editor schreibt. Diese Anleitung richtet sie als Dienst auf dem eigenen Rechner ein und speichert alle Inhalte in PostgreSQL.

## Vorbemerkungen

- **Voraussetzung:** [PostgreSQL](postgresql.md) ist nach der Anleitung installiert und läuft.
- **Keine Installation über apt:** Für Wiki.js gibt es kein Ubuntu-Paket. Das Projekt stellt aber ein fertiges Archiv bereit, in dem alle benötigten Node.js-Bibliotheken schon enthalten sind. Node.js selbst kommt aus den Paketquellen von Ubuntu.
- **Version:** Die Anleitung verwendet Wiki.js **2.5**, die aktuelle stabile Version (getestet mit 2.5.315, Node.js 22 aus Ubuntu 26.04 und PostgreSQL 18). Wiki.js 3 ist noch in Entwicklung.
- **Port:** Wiki.js läuft normalerweise auf Port 3000. Diesen Port belegt hier schon [Martin](martin.md), deshalb verwendet die Anleitung Port **3001**. Wiki.js ist dabei nur vom eigenen Rechner aus erreichbar.
- **Passwort:** `geheimes_passwort` ist ein Beispiel. Ersetze es überall durch ein eigenes Passwort.

## Vorbereitung

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketstände der Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Node.js und curl installieren

Wiki.js ist in JavaScript geschrieben und braucht Node.js ab Version 20. Ubuntu 26.04 liefert Version 22. Mit `curl` lädst du später das Programmarchiv herunter.

```bash
sudo apt install nodejs curl
```

**Prüfen:** Die Ausgabe beginnt mit `v22`.

```bash
/usr/bin/node --version
```

Der Befehl nennt den vollen Pfad `/usr/bin/node`. Wer zusätzlich Node.js über nvm installiert hat, bekommt mit dem kurzen Befehl `node` sonst dessen Version angezeigt. Der Dienst in Schritt 11 verwendet ausdrücklich das Node.js aus Ubuntu.

## Datenbank in PostgreSQL einrichten

### 3. Datenbankbenutzer für Wiki.js anlegen

Legt in PostgreSQL den Benutzer `wikijs` an. Mit ihm und seinem Passwort meldet sich Wiki.js an der Datenbank an.

```bash
sudo -u postgres psql -c "CREATE USER wikijs WITH PASSWORD 'geheimes_passwort';"
```

### 4. Datenbank für Wiki.js anlegen

Legt die leere Datenbank `wikijs` an und macht den gleichnamigen Benutzer zu ihrem Eigentümer. Die Tabellen erstellt Wiki.js beim ersten Start selbst.

```bash
sudo -u postgres psql -c "CREATE DATABASE wikijs OWNER wikijs;"
```

**Prüfen:** Die Datenbank erscheint in der Liste.

```bash
sudo -u postgres psql -l | grep wikijs
```

## Wiki.js installieren

### 5. Systembenutzer anlegen

Wiki.js soll nicht mit Administratorrechten und nicht unter deinem Benutzerkonto laufen, sondern unter einem eigenen Benutzer `wikijs` ohne Anmeldemöglichkeit. Wird das Programm angegriffen, kommt der Angreifer so nur an die Dateien von Wiki.js.

```bash
sudo useradd --system --home-dir /opt/wikijs --shell /usr/sbin/nologin wikijs
```

**Prüfen:** Der Benutzer existiert.

```bash
id wikijs
```

### 6. Programmarchiv herunterladen

Lädt die neueste Version von Wiki.js als Archiv (etwa 90 MB) in den Ordner `/tmp`. `-L` folgt der Weiterleitung von GitHub zur eigentlichen Datei.

```bash
curl -L -o /tmp/wiki-js.tar.gz https://github.com/requarks/wiki/releases/latest/download/wiki-js.tar.gz
```

**Prüfen:** Die Datei ist ungefähr 90 MB groß.

```bash
ls -lh /tmp/wiki-js.tar.gz
```

### 7. Programmordner anlegen

Legt den Ordner an, in dem Wiki.js liegen soll. `/opt` ist unter Linux für Programme gedacht, die nicht aus Paketen stammen.

```bash
sudo mkdir /opt/wikijs
```

### 8. Archiv entpacken

Packt das Programm samt aller Bibliotheken in den neuen Ordner aus. `-C` gibt den Zielordner an.

```bash
sudo tar xzf /tmp/wiki-js.tar.gz -C /opt/wikijs
```

**Prüfen:** Der Ordner enthält unter anderem `server`, `node_modules` und `config.sample.yml`.

```bash
ls /opt/wikijs
```

### 9. Einstellungsdatei anlegen

Die Datei `config.yml` sagt Wiki.js, auf welchem Port es läuft und wie es die Datenbank erreicht. Alle Einstellungen, die hier fehlen, übernimmt Wiki.js aus seinen Standardwerten. Eine ausführlich kommentierte Vorlage mit allen Möglichkeiten liegt in `config.sample.yml`.

```bash
sudo nano /opt/wikijs/config.yml
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. Die Einrückung unter `db:` muss aus Leerzeichen bestehen, nicht aus Tabulatoren, sonst kann Wiki.js die Datei nicht lesen.

```yaml
port: 3001
bindIP: 127.0.0.1

db:
  type: postgres
  host: 127.0.0.1
  port: 5432
  user: wikijs
  pass: 'geheimes_passwort'
  db: wikijs
  ssl: false

logLevel: info
dataPath: ./data
```

Was die Einträge bedeuten:

- `port` – der Port, auf dem Wiki.js Anfragen annimmt.
- `bindIP: 127.0.0.1` – Wiki.js ist nur vom eigenen Rechner aus erreichbar, nicht aus dem Netzwerk.
- `db` – Art der Datenbank, Adresse, Benutzer, Passwort und Name der Datenbank aus den Schritten 3 und 4. Das Passwort steht in einfachen Anführungszeichen, damit Sonderzeichen keine Probleme machen.
- `dataPath` – Ordner für Zwischenspeicher und hochgeladene Dateien, relativ zum Programmordner.

### 10. Eigentümer und Rechte setzen

Der erste Befehl übergibt den Programmordner dem Benutzer `wikijs`, damit Wiki.js in den Ordner `data` schreiben kann. Der zweite sorgt dafür, dass nur noch dieser Benutzer die Einstellungsdatei mit dem Datenbank-Passwort lesen darf.

```bash
sudo chown -R wikijs:wikijs /opt/wikijs
```

```bash
sudo chmod 600 /opt/wikijs/config.yml
```

**Prüfen:** Die Rechte lauten `-rw-------`, Eigentümer ist `wikijs`.

```bash
sudo ls -l /opt/wikijs/config.yml
```

## Als Dienst einrichten

### 11. systemd-Dienst anlegen

Damit Wiki.js beim Rechnerstart automatisch läuft und nach einem Absturz neu startet, bekommt es eine Dienstdatei für systemd.

```bash
sudo nano /etc/systemd/system/wikijs.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=Wiki.js
After=network.target postgresql.service

[Service]
Type=simple
User=wikijs
Group=wikijs
WorkingDirectory=/opt/wikijs
ExecStart=/usr/bin/node server
Environment=NODE_ENV=production
Restart=always

[Install]
WantedBy=multi-user.target
```

Was die Einträge bedeuten:

- `After=` – Wiki.js startet erst, wenn Netzwerk und PostgreSQL bereit sind.
- `User=` und `Group=` – der Dienst läuft unter dem Benutzer aus Schritt 5.
- `WorkingDirectory=` – Wiki.js sucht `config.yml` und `data` in diesem Ordner.
- `ExecStart=` – startet das Programm mit dem Node.js aus Ubuntu.
- `Restart=always` – systemd startet Wiki.js neu, falls es sich beendet.
- `WantedBy=multi-user.target` – der Dienst startet beim normalen Hochfahren mit.

### 12. systemd die neue Datei bekannt machen

systemd liest Dienstdateien nur beim Start oder auf Anweisung ein.

```bash
sudo systemctl daemon-reload
```

### 13. Dienst starten und Autostart einschalten

`enable` sorgt für den Start beim Hochfahren, `--now` startet den Dienst zusätzlich sofort.

```bash
sudo systemctl enable --now wikijs
```

**Prüfen:** In der Ausgabe steht `active (running)`. Mit <kbd>q</kbd> verlässt du die Anzeige.

```bash
systemctl status wikijs
```

### 14. Protokoll ansehen

Beim ersten Start stellt Wiki.js fest, dass die Datenbank noch leer ist, und startet einen Einrichtungsassistenten. `-f` zeigt neue Zeilen fortlaufend an, <kbd>Strg</kbd>+<kbd>C</kbd> beendet die Anzeige.

```bash
sudo journalctl -u wikijs -f
```

**Prüfen:** Im Protokoll stehen `Database Connection Successful` und `Starting setup wizard...`. Steht dort eine Fehlermeldung zur Datenbank, stimmen Benutzer oder Passwort in `config.yml` nicht mit den Schritten 3 und 4 überein.

## Einrichtung im Browser

### 15. Einrichtungsassistenten öffnen

Öffne im Browser die Adresse <http://localhost:3001>. Es erscheint die Seite des Einrichtungsassistenten.

**Prüfen:** Auch ohne Browser lässt sich feststellen, dass Wiki.js antwortet. Die erste Zeile lautet `HTTP/1.1 200 OK`.

```bash
curl -sI http://localhost:3001/
```

### 16. Administratorkonto und Adresse eintragen

Fülle im Assistenten die Felder aus:

- **Administrator Email** – deine E-Mail-Adresse, sie dient später als Anmeldename.
- **Password** und **Confirm Password** – das Passwort für das Administratorkonto.
- **Site URL** – `http://localhost:3001`. Wiki.js baut damit Links, etwa in E-Mails.
- **Telemetry** – schalte den Schalter aus, wenn Wiki.js keine anonymen Nutzungsdaten an die Entwickler senden soll.

Klicke dann auf **Install**. Wiki.js legt jetzt die Tabellen in PostgreSQL an und leitet nach einigen Sekunden auf die Startseite weiter.

**Prüfen:** In der Datenbank gibt es jetzt gut 30 Tabellen.

```bash
sudo -u postgres psql -d wikijs -c "\dt"
```

### 17. Anmelden und erste Seite anlegen

Melde dich mit der E-Mail-Adresse und dem Passwort aus Schritt 16 an. Auf der Startseite bietet Wiki.js an, die Startseite des Wikis anzulegen (**Create Home Page**). Wähle einen Editor, z. B. **Markdown**, schreibe einen Text und speichere mit **Create**.

### 18. Oberfläche auf Deutsch umstellen (optional)

Die Oberfläche ist zunächst englisch. Öffne oben rechts über das Zahnrad die **Administration** und wähle links **Locale**. Wähle unter **Site Locale** den Eintrag für Deutsch und bestätige mit **Apply**. Wiki.js lädt die Übersetzung aus dem Internet und stellt die Oberfläche um.

Soll Wiki.js später unter einer eigenen Domain erreichbar sein, leitet man die Anfragen wie bei anderen Diensten über [nginx](nginx.md) an `127.0.0.1:3001` weiter.

## Aktualisieren

Neue Versionen von Wiki.js 2.5 installierst du, indem du das Programm austauschst. `config.yml` und die Daten in PostgreSQL bleiben dabei erhalten.

### 1. Dienst stoppen

Wiki.js darf beim Austausch der Dateien nicht laufen.

```bash
sudo systemctl stop wikijs
```

### 2. Neue Version herunterladen

Lädt das aktuelle Archiv und überschreibt dabei ein älteres in `/tmp`.

```bash
curl -L -o /tmp/wiki-js.tar.gz https://github.com/requarks/wiki/releases/latest/download/wiki-js.tar.gz
```

### 3. Alte Programmdateien löschen

Entfernt Programmcode und Bibliotheken der alten Version, damit keine veralteten Dateien übrig bleiben. `config.yml` und der Ordner `data` werden nicht angefasst.

```bash
sudo rm -rf /opt/wikijs/assets /opt/wikijs/node_modules /opt/wikijs/server
```

### 4. Neue Version entpacken

Packt die neue Version in den Programmordner aus. Das Archiv enthält keine `config.yml`, deine Einstellungen bleiben also erhalten.

```bash
sudo tar xzf /tmp/wiki-js.tar.gz -C /opt/wikijs
```

### 5. Eigentümer wieder setzen

Die neu entpackten Dateien gehören `root`. Dieser Befehl übergibt sie wieder dem Benutzer `wikijs`.

```bash
sudo chown -R wikijs:wikijs /opt/wikijs
```

### 6. Dienst starten

Beim Start passt Wiki.js die Tabellen in PostgreSQL bei Bedarf selbst an die neue Version an.

```bash
sudo systemctl start wikijs
```

**Prüfen:** In der Administration zeigt die Seite **System Info** die neue Versionsnummer von Wiki.js.

## Deinstallieren

### 1. Dienst stoppen und Autostart ausschalten

Beendet Wiki.js und verhindert, dass es beim nächsten Hochfahren wieder startet.

```bash
sudo systemctl disable --now wikijs
```

### 2. Dienstdatei löschen

Entfernt die Dienstdatei aus Schritt 11.

```bash
sudo rm /etc/systemd/system/wikijs.service
```

### 3. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
sudo systemctl daemon-reload
```

### 4. Programmordner löschen

Entfernt Wiki.js samt Einstellungen und dem Ordner `data`. **Achtung:** Hochgeladene Dateien liegen in der Datenbank und in `data`. Wer sie behalten will, sichert vorher beides.

```bash
sudo rm -rf /opt/wikijs
```

### 5. Heruntergeladenes Archiv löschen

Entfernt das Archiv aus `/tmp`, falls es noch vorhanden ist.

```bash
rm -f /tmp/wiki-js.tar.gz
```

### 6. Datenbank löschen

Löscht die Datenbank `wikijs`. **Achtung:** Alle Seiten des Wikis gehen dabei unwiderruflich verloren.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS wikijs;"
```

### 7. Datenbankbenutzer löschen

Entfernt den PostgreSQL-Benutzer aus Schritt 3.

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS wikijs;"
```

### 8. Systembenutzer löschen

Entfernt den Linux-Benutzer aus Schritt 5.

```bash
sudo userdel wikijs
```

### 9. Node.js entfernen (optional)

Nur ausführen, wenn kein anderes Programm Node.js aus Ubuntu braucht.

```bash
sudo apt purge nodejs
```

```bash
sudo apt autoremove
```

**Prüfen:** Unter Port 3001 antwortet nichts mehr, `curl` meldet einen Verbindungsfehler.

```bash
curl -sI http://localhost:3001/
```
