# Gollum

Gollum ist ein schlankes Wiki, das alle Seiten als Markdown-Dateien in einem Git-Repository speichert. Jede Änderung im Browser wird zu einem Git-Commit. Man kann das Wiki deshalb genauso gut mit einem Texteditor und `git` bearbeiten. Diese Anleitung installiert Gollum als Ruby-Programm und lässt es als Dienst auf dem eigenen Rechner laufen.

## Vorbemerkungen

- **Voraussetzung:** [Git](git-cgit.md) ist installiert (`git --version`).
- **Installation über RubyGems:** Ubuntu hat kein Paket für Gollum selbst. Es wird mit dem Ruby-Paketmanager `gem` installiert. Ruby, die Build-Werkzeuge und die Git-Bibliothek `rugged` kommen aber aus apt.
- **Warum `rugged` aus apt:** Gollum greift über `rugged` auf Git zu. Holt `gem` dieses Modul selbst, muss es die Bibliothek libgit2 übersetzen. Unter Ubuntu 26.04 bricht das mit einem Linkerfehler ab (`-l:libjitterentropy.a kann nicht gefunden werden`). Das fertige Paket `ruby-rugged` umgeht das. `gem` erkennt es als bereits installiert.
- **Version:** Getestet mit Gollum **6.1.0** und Ruby 3.3 unter Ubuntu 26.04.
- **Keine Benutzerkonten:** Gollum hat keine Anmeldung. Jeder, der das Wiki erreicht, darf lesen und schreiben. Die Anleitung macht es deshalb nur auf dem eigenen Rechner erreichbar, auf Port **4567**.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketstände der Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Ruby, Build-Werkzeuge und rugged installieren

- `ruby` – die Programmiersprache, in der Gollum geschrieben ist, samt Paketmanager `gem`.
- `ruby-dev` und `build-essential` – Compiler und Kopfdateien. Einige Bibliotheken von Gollum enthalten C-Code, den `gem` bei der Installation übersetzt.
- `ruby-rugged` – die fertig übersetzte Git-Anbindung für Ruby.

```bash
sudo apt install ruby ruby-dev build-essential ruby-rugged
```

**Prüfen:** Die Ausgabe beginnt mit `ruby 3.3`, und `gem` findet `rugged` in Version 1.9.

```bash
ruby --version
```

```bash
gem list rugged
```

### 3. Gollum installieren

Lädt Gollum und rund 35 Bibliotheken, die es braucht, von <https://rubygems.org> und installiert sie für das ganze System. Einige davon werden dabei übersetzt (`Building native extensions`), das dauert etwa eine Minute. `--no-document` lässt die Hilfetexte der Bibliotheken weg.

```bash
sudo gem install --no-document gollum
```

**Prüfen:** Die Ausgabe endet mit `… gems installed`, und Gollum meldet seine Version.

```bash
gollum --version
```

## Wiki einrichten

### 4. Systembenutzer anlegen

Gollum soll unter einem eigenen Benutzer laufen, mit dem man sich nicht anmelden kann. `--create-home` legt gleich den Ordner `/var/lib/gollum` an, in dem das Wiki liegen wird.

```bash
sudo useradd --system --create-home --home-dir /var/lib/gollum --shell /usr/sbin/nologin gollum
```

### 5. Git-Repository für das Wiki anlegen

Legt ein leeres Git-Repository an, in dem Gollum die Seiten speichert. `-b main` nennt den Hauptzweig `main`. Gollum wird in Schritt 6 angewiesen, genau diesen Zweig zu verwenden. `sudo -u gollum` sorgt dafür, dass der Ordner dem Benutzer `gollum` gehört.

```bash
sudo -u gollum git init -b main /var/lib/gollum/wiki
```

**Prüfen:** Die Ausgabe lautet `Leeres Git-Repository in /var/lib/gollum/wiki/.git/ initialisiert` (oder englisch `Initialized empty Git repository …`).

## Als Dienst einrichten

### 6. systemd-Dienst anlegen

Damit Gollum beim Rechnerstart automatisch läuft, bekommt es eine Dienstdatei für systemd.

```bash
sudo nano /etc/systemd/system/gollum.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=Gollum Wiki
After=network.target

[Service]
Type=simple
User=gollum
Group=gollum
WorkingDirectory=/var/lib/gollum
ExecStart=/usr/local/bin/gollum --host 127.0.0.1 --port 4567 --ref main --allow-uploads dir --h1-title /var/lib/gollum/wiki
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Was die Angaben für Gollum bedeuten:

- `--host 127.0.0.1` – nur vom eigenen Rechner aus erreichbar. Ohne diese Angabe lauscht Gollum auf allen Netzwerkschnittstellen.
- `--port 4567` – der Port, unter dem das Wiki erreichbar ist.
- `--ref main` – der Git-Zweig aus Schritt 5. Gollum erwartet sonst `master`.
- `--allow-uploads dir` – erlaubt das Hochladen von Bildern und Dateien. Sie landen im Repository im Ordner `uploads`.
- `--h1-title` – die erste Überschrift einer Seite dient als Seitentitel statt des Dateinamens.
- `/var/lib/gollum/wiki` – das Git-Repository mit den Seiten.

### 7. systemd die neue Datei bekannt machen

systemd liest Dienstdateien nur beim Start oder auf Anweisung ein.

```bash
sudo systemctl daemon-reload
```

### 8. Dienst starten und Autostart einschalten

`enable` sorgt für den Start beim Hochfahren, `--now` startet Gollum zusätzlich sofort.

```bash
sudo systemctl enable --now gollum
```

**Prüfen:** Im Protokoll steht `Sinatra (v4.2.1) has taken the stage on 4567`.

```bash
sudo journalctl -u gollum -n 10
```

### 9. Aufruf prüfen

Gollum leitet die Startadresse auf die Seite `Home` weiter.

```bash
curl -sI http://localhost:4567/
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 302 Found`, und bei `Location` steht `http://localhost:4567/Home`.

## Erste Seite anlegen

### 10. Startseite im Browser anlegen

Öffne <http://localhost:4567>. Da es die Seite `Home` noch nicht gibt, bietet Gollum an, sie anzulegen. Wähle als Format **Markdown**, schreibe einen Text und speichere mit **Save**. Im Feld **Edit message** kannst du beschreiben, was du geändert hast. Das wird zur Commit-Nachricht.

Links auf andere Wiki-Seiten schreibst du so: `[[Notizen]]`. Existiert die Seite noch nicht, legt ein Klick darauf sie an.

### 11. Änderung in Git ansehen

Jede gespeicherte Seite ist ein Commit im Repository. Diesen Befehl führst du als Benutzer `gollum` aus, weil ihm das Repository gehört.

```bash
sudo -u gollum git -C /var/lib/gollum/wiki log --oneline
```

**Prüfen:** Die Liste zeigt einen Commit mit deiner Nachricht. Als Autor trägt Gollum `Anonymous` ein, weil es keine Benutzerkonten kennt. Die Seite selbst liegt als `Home.md` im Repository:

```bash
sudo -u gollum git -C /var/lib/gollum/wiki ls-files
```

## Aktualisieren

### 1. Neue Version installieren

`gem update` holt die neueste Version von Gollum und seinen Bibliotheken.

```bash
sudo gem update --no-document gollum
```

### 2. Dienst neu starten

Der laufende Dienst verwendet sonst weiter die alte Version.

```bash
sudo systemctl restart gollum
```

**Prüfen:** `gollum --version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Dienst stoppen und Autostart ausschalten

Beendet Gollum und verhindert den Start beim Hochfahren.

```bash
sudo systemctl disable --now gollum
```

### 2. Dienstdatei löschen

Entfernt die Dienstdatei aus Schritt 6.

```bash
sudo rm /etc/systemd/system/gollum.service
```

### 3. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
sudo systemctl daemon-reload
```

### 4. Benutzer und Wiki löschen

`-r` löscht mit dem Benutzer auch seinen Ordner `/var/lib/gollum` und damit das Git-Repository mit allen Seiten. **Achtung:** Wer die Seiten behalten will, kopiert den Ordner `/var/lib/gollum/wiki` vorher woanders hin. Die Warnung `Mail-Warteschlange … nicht gefunden` ist harmlos.

```bash
sudo userdel -r gollum
```

### 5. Gollum und alle Gems entfernen

Entfernt alle Ruby-Bibliotheken, die mit `sudo gem install` installiert wurden, samt ihrer Startbefehle in `/usr/local/bin`. `--install-dir` beschränkt das auf den Ordner, in den `gem` installiert. Pakete aus apt wie `ruby-rugged` bleiben unberührt. **Achtung:** Hast du mit `sudo gem install` noch andere Programme installiert, verschwinden sie ebenfalls.

```bash
sudo gem uninstall --all --ignore-dependencies --executables --install-dir /var/lib/gems/3.3.0
```

**Prüfen:** Die letzte Zeile lautet `INFO:  Uninstalled all gems in /var/lib/gems/3.3.0`.

### 6. Ruby entfernen (optional)

Nur ausführen, wenn kein anderes Programm Ruby braucht. `build-essential` bleibt installiert, weil es auch für andere Anleitungen wie [C](c.md) und [C++](cpp.md) gebraucht wird.

```bash
sudo apt purge ruby ruby-dev ruby-rugged
```

```bash
sudo apt autoremove
```

### 7. Leere Gem-Ordner löschen

Nach dem Entfernen von Ruby bleibt der leere Ordner `/var/lib/gems` zurück.

```bash
sudo rm -rf /var/lib/gems
```

**Prüfen:** Der Befehl `gollum` wird nicht mehr gefunden, und unter Port 4567 antwortet nichts mehr.

```bash
curl -sI http://localhost:4567/
```
