# TiddlyWiki

Mit TiddlyWiki sammelst du Wissen in vielen kleinen Karteikarten, den „Tiddlern“, statt in langen Dokumenten. Jede Karte lässt sich mit anderen verlinken, mit Schlagwörtern versehen und in Übersichten einbinden. Diese Anleitung lässt TiddlyWiki als Dienst auf dem eigenen Rechner laufen, mit Anmeldung. Jede Notiz wird dabei als eigene Textdatei gespeichert.

## Vorbemerkungen

- **Keine Installation über apt:** Ubuntu hat kein Paket für TiddlyWiki. Das Projekt veröffentlicht die Server-Version über npm, den Paketmanager von Node.js. Node.js und npm selbst kommen aus apt.
- **Version:** Getestet mit TiddlyWiki **5.4.1** und Node.js 22 aus Ubuntu 26.04.
- **Zwei Arten, TiddlyWiki zu nutzen:** TiddlyWiki gibt es auch als einzelne HTML-Datei, die man im Browser öffnet. Beim Speichern lädt der Browser dann aber jedes Mal eine neue Datei herunter. Die Server-Version aus dieser Anleitung speichert jede Änderung sofort auf dem Rechner. Eine einzelne HTML-Datei lässt sich trotzdem jederzeit erzeugen, siehe Schritt 15.
- **Port:** Die Ports 3000 bis 3003 sind im Buch schon vergeben (z. B. für [SilverBullet](silverbullet.md)). TiddlyWiki läuft deshalb auf Port **3004**, nur vom eigenen Rechner aus erreichbar.
- **Passwort:** `AdminPasswort123` ist ein Beispiel. Ersetze es durch ein eigenes Passwort.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Node.js und npm kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt TiddlyWiki aus, npm lädt es herunter. Sind beide schon vorhanden (z. B. aus der [Docusaurus-Anleitung](docusaurus.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Versionsnummer beginnt mit `v22`.

```bash
/usr/bin/node --version
```

### 3. TiddlyWiki installieren

`-g` installiert TiddlyWiki für alle Benutzer. Das npm von Ubuntu legt das Programm dabei nach `/usr/local/bin/tiddlywiki`. Mit `@5.4.1` bekommst du genau die getestete Version. Ohne diese Angabe installiert npm die neueste.

```bash
sudo npm install -g tiddlywiki@5.4.1
```

**Prüfen:** Die Ausgabe lautet `5.4.1`.

```bash
tiddlywiki --version
```

## Einrichten

### 4. Systembenutzer anlegen

TiddlyWiki soll unter einem eigenen Benutzer laufen, mit dem man sich nicht anmelden kann. `--create-home` legt den Ordner `/var/lib/tiddlywiki` an, in dem das Wiki liegen wird.

```bash
sudo useradd --system --create-home --home-dir /var/lib/tiddlywiki --shell /usr/sbin/nologin tiddlywiki
```

### 5. Wiki-Ordner anlegen

`--init server` legt den Ordner `/var/lib/tiddlywiki/wiki` mit der Vorlage für den Serverbetrieb an. `sudo -u tiddlywiki` sorgt dafür, dass der Ordner dem Benutzer aus Schritt 4 gehört.

```bash
sudo -u tiddlywiki tiddlywiki /var/lib/tiddlywiki/wiki --init server
```

**Prüfen:** Die Ausgabe lautet `Copied edition 'server' to /var/lib/tiddlywiki/wiki`. Im Ordner liegt die Datei `tiddlywiki.info`, die Einstellungsdatei des Wikis.

```bash
sudo ls /var/lib/tiddlywiki/wiki
```

### 6. Deutsches Sprachpaket einschalten

TiddlyWiki bringt Übersetzungen mit, lädt aber nur die Sprachen, die in `tiddlywiki.info` stehen. Öffne die Datei als Benutzer `tiddlywiki`:

```bash
sudo -u tiddlywiki nano /var/lib/tiddlywiki/wiki/tiddlywiki.info
```

Gehe an das Ende der zweiten Zeile (`"description": "Basic client-server edition",`), drücke <kbd>Enter</kbd> und füge diese Zeile ein:

```json
    "languages": ["de-DE"],
```

Der Anfang der Datei sieht danach so aus:

```json
{
    "description": "Basic client-server edition",
    "languages": ["de-DE"],
    "plugins": [
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. Das Komma am Ende der neuen Zeile ist wichtig, sonst startet TiddlyWiki nicht.

### 7. Datei mit Benutzerkonten anlegen

TiddlyWiki liest Benutzernamen und Passwörter aus einer einfachen CSV-Datei. Sie liegt außerhalb des Wiki-Ordners, damit sie nie im Wiki selbst auftaucht.

```bash
sudo -u tiddlywiki nano /var/lib/tiddlywiki/benutzer.csv
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
username,password
admin,AdminPasswort123
```

Die erste Zeile ist die Kopfzeile und muss genau so lauten. Jede weitere Zeile ist ein Benutzerkonto. Das Passwort steht hier im Klartext, deshalb schützt der nächste Schritt die Datei.

### 8. Datei mit den Passwörtern schützen

`600` bedeutet: Nur der Besitzer, also der Benutzer `tiddlywiki`, darf die Datei lesen und ändern.

```bash
sudo chmod 600 /var/lib/tiddlywiki/benutzer.csv
```

## Als Dienst einrichten

### 9. systemd-Dienst anlegen

Damit TiddlyWiki beim Rechnerstart automatisch läuft, bekommt es eine Dienstdatei für systemd.

```bash
sudo nano /etc/systemd/system/tiddlywiki.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=TiddlyWiki
After=network.target

[Service]
Type=simple
User=tiddlywiki
Group=tiddlywiki
ExecStart=/usr/local/bin/tiddlywiki /var/lib/tiddlywiki/wiki --listen host=127.0.0.1 port=3004 credentials=/var/lib/tiddlywiki/benutzer.csv readers=(authenticated) writers=(authenticated)
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Was die Angaben hinter `--listen` bedeuten:

- `host=127.0.0.1` – TiddlyWiki ist nur vom eigenen Rechner aus erreichbar.
- `port=3004` – der Port, unter dem TiddlyWiki läuft.
- `credentials=…` – die Datei mit den Benutzerkonten aus Schritt 7.
- `readers=(authenticated)` und `writers=(authenticated)` – nur angemeldete Benutzer dürfen lesen und schreiben. Ohne diese Angaben wäre das Wiki für jeden offen, der den Port erreicht.

### 10. systemd die neue Datei bekannt machen

systemd liest Dienstdateien nur beim Start oder auf Anweisung ein.

```bash
sudo systemctl daemon-reload
```

### 11. Dienst starten und Autostart einschalten

`enable` sorgt für den Start beim Hochfahren, `--now` startet TiddlyWiki zusätzlich sofort.

```bash
sudo systemctl enable --now tiddlywiki
```

**Prüfen:** Im Protokoll steht `Serving on http://127.0.0.1:3004`.

```bash
sudo journalctl -u tiddlywiki -n 10
```

### 12. Aufruf prüfen

Prüft, ob TiddlyWiki antwortet und ohne Anmeldung gesperrt ist.

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3004/
```

**Prüfen:** Die Ausgabe lautet `401`, also „nicht angemeldet“. Das Wiki ist geschützt.

## Erste Schritte

### 13. Im Browser anmelden und Deutsch auswählen

Öffne <http://localhost:3004> und melde dich mit `admin` und dem Passwort aus Schritt 7 an. Die Oberfläche ist zunächst englisch. Klicke rechts auf das Zahnrad (**Control Panel**). Im Reiter **Info**, Unterreiter **Basics**, steht ganz oben „Hello! Current language:“. Wähle dort **Deutsch (Deutschland)**.

**Prüfen:** Die Oberfläche wechselt sofort auf Deutsch. Die Einstellung wird im Wiki gespeichert und gilt ab jetzt für alle Benutzer.

### 14. Einen Tiddler anlegen

Klicke rechts auf das Plus-Zeichen (**Erstelle einen neuen Tiddler**). Gib einen Titel ein, z. B. `Einkaufsliste`, schreibe einen Text und klicke auf das Häkchen (**Fertig**). Links zu anderen Tiddlern schreibst du als `[[Titel]]`. Existiert der Tiddler noch nicht, legt ein Klick auf den Link ihn an.

**Prüfen:** Der neue Tiddler liegt als eigene Datei mit der Endung `.tid` im Unterordner `tiddlers`.

```bash
sudo ls /var/lib/tiddlywiki/wiki/tiddlers
```

### 15. Das Wiki als einzelne HTML-Datei sichern

`--build index` erzeugt aus allen Tiddlern eine einzige HTML-Datei, die ohne Server in jedem Browser läuft. So lässt sich das Wiki einfach weitergeben oder sichern.

```bash
sudo -u tiddlywiki tiddlywiki /var/lib/tiddlywiki/wiki --build index
```

**Prüfen:** Im Ordner `output` liegt die Datei `index.html` (etwa 3 MB).

```bash
sudo ls -l /var/lib/tiddlywiki/wiki/output
```

Weitere Benutzer trägst du als neue Zeilen in `/var/lib/tiddlywiki/benutzer.csv` ein und startest danach den Dienst neu (`sudo systemctl restart tiddlywiki`).

## Aktualisieren

### 1. Neue Version installieren

Installiert die neueste Version von TiddlyWiki. Das Wiki und die Benutzerkonten bleiben unberührt.

```bash
sudo npm install -g tiddlywiki@latest
```

### 2. Dienst neu starten

Der laufende Dienst verwendet sonst weiter die alte Version.

```bash
sudo systemctl restart tiddlywiki
```

**Prüfen:** `tiddlywiki --version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Dienst stoppen und Autostart ausschalten

Beendet TiddlyWiki und verhindert den Start beim Hochfahren.

```bash
sudo systemctl disable --now tiddlywiki
```

### 2. Dienstdatei löschen

Entfernt die Dienstdatei aus Schritt 9.

```bash
sudo rm /etc/systemd/system/tiddlywiki.service
```

### 3. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
sudo systemctl daemon-reload
```

### 4. Programm entfernen

Entfernt TiddlyWiki aus `/usr/local`. Node.js und npm bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.

```bash
sudo npm uninstall -g tiddlywiki
```

### 5. Benutzer, Wiki und Benutzerkonten löschen

`-r` löscht mit dem Benutzer auch seinen Ordner `/var/lib/tiddlywiki`. **Achtung:** Alle Tiddler gehen dabei verloren. Wer sie behalten will, sichert vorher die Datei aus Schritt 15 oder den Ordner `/var/lib/tiddlywiki/wiki`. Die Warnung `Mail-Warteschlange … nicht gefunden` ist harmlos.

```bash
sudo userdel -r tiddlywiki
```

**Prüfen:** Der Befehl `tiddlywiki` wird nicht mehr gefunden, und unter Port 3004 antwortet nichts mehr.

```bash
curl -sI http://localhost:3004/
```
