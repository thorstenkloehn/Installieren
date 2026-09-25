# Outline

Outline ist ein Wiki für Teams, in dem mehrere Personen gleichzeitig an Dokumenten schreiben, ähnlich wie in Notion oder Confluence. Diese Anleitung baut Outline ohne Docker aus dem Quellcode, speichert die Inhalte in PostgreSQL und lässt die Anmeldung über Keycloak laufen.

## Vorbemerkungen

- **Voraussetzungen:** [PostgreSQL](postgresql.md) und [Keycloak](keycloak.md) sind nach den jeweiligen Anleitungen installiert und laufen. In Keycloak gibt es den Realm `intern` mit mindestens einem Benutzer, der eine E-Mail-Adresse hat.
- **Warum Keycloak:** Outline hat keine eigene Benutzerverwaltung mit Passwörtern. Das erste Konto lässt sich nur über einen Anmeldedienst wie Slack, Google oder einen OpenID-Connect-Server anlegen. Keycloak ist so ein Server, der vollständig auf dem eigenen Rechner läuft.
- **Ohne Docker:** Das Projekt veröffentlicht fertige Pakete nur als Docker-Image. Ohne Docker lädt man den Quellcode mit Git und baut ihn selbst. Node.js und Redis kommen aus den Paketquellen von Ubuntu. Den Paketmanager Yarn holt das Hilfsprogramm corepack in genau der Version, die Outline vorschreibt.
- **Version:** Getestet mit Outline **1.10.1**, Node.js 22, Redis 8, Keycloak 26.7 und PostgreSQL 18.
- **Platz und Zeit:** Quellcode, Bibliotheken und Build brauchen etwa 2,5 GB. Das Bauen dauert je nach Rechner einige Minuten und braucht mindestens 4 GB freien Arbeitsspeicher.
- **Port:** Outline läuft normalerweise auf Port 3000. Diesen Port belegt hier schon [Martin](martin.md), Port 3001 ist für [Wiki.js](wikijs.md) vorgesehen. Die Anleitung verwendet deshalb Port **3002**. Outline selbst nimmt Verbindungen auf allen Netzwerkschnittstellen an. Der Dienst in Schritt 20 beschränkt das auf den eigenen Rechner.
- **Passwort:** `geheimes_passwort` ist ein Beispiel. Ersetze es überall durch ein eigenes Passwort.

## Vorbereitung

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketstände der Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Git, Node.js, corepack und Redis installieren

- `git` lädt den Quellcode von Outline.
- `nodejs` führt Outline aus. Outline 1.10 braucht Node.js 20, 22, 24 oder 26, Ubuntu 26.04 liefert Version 22.
- `node-corepack` holt später die passende Version des Paketmanagers Yarn.
- `redis-server` ist ein schneller Zwischenspeicher im Arbeitsspeicher. Outline verteilt darüber Aufgaben und hält die Dokumente beim gemeinsamen Bearbeiten auf dem gleichen Stand.

```bash
sudo apt install git nodejs node-corepack redis-server
```

**Prüfen:** Die Node.js-Version beginnt mit `v22`.

```bash
/usr/bin/node --version
```

**Prüfen:** Redis läuft und antwortet mit `PONG`.

```bash
redis-cli ping
```

## Datenbank in PostgreSQL einrichten

### 3. Datenbankbenutzer für Outline anlegen

Legt in PostgreSQL den Benutzer `outline` an.

```bash
sudo -u postgres psql -c "CREATE USER outline WITH PASSWORD 'geheimes_passwort';"
```

### 4. Datenbank für Outline anlegen

Legt die leere Datenbank `outline` an. Die Tabellen erstellt Outline beim ersten Start selbst.

```bash
sudo -u postgres psql -c "CREATE DATABASE outline OWNER outline;"
```

**Prüfen:** Die Datenbank erscheint in der Liste.

```bash
sudo -u postgres psql -l | grep outline
```

## Outline in Keycloak eintragen

Damit Keycloak Anmeldungen für Outline annimmt, bekommt Outline dort einen eigenen **Client**. Das ist der Eintrag eines Programms, das Keycloak zur Anmeldung nutzt.

### 5. Client-Secret erzeugen

Outline weist sich gegenüber Keycloak mit einem geheimen Schlüssel aus, dem Client-Secret. Dieser Befehl erzeugt eine zufällige Zeichenfolge. Kopiere sie, du brauchst sie in Schritt 7 und Schritt 18.

```bash
openssl rand -hex 32
```

### 6. Befehlszeilenwerkzeug von Keycloak anmelden

Die Anmeldung aus der Keycloak-Anleitung läuft nach kurzer Zeit ab. Melde `kcadm.sh` deshalb neu an. Es fragt nach dem Passwort des Keycloak-Administrators.

```bash
/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8083 --realm master --user admin
```

### 7. Client für Outline anlegen

Legt im Realm `intern` den Client `outline` an. Ersetze `DEIN_CLIENT_SECRET` durch die Zeichenfolge aus Schritt 5.

```bash
/opt/keycloak/bin/kcadm.sh create clients -r intern -s clientId=outline -s enabled=true -s publicClient=false -s secret=DEIN_CLIENT_SECRET -s 'redirectUris=["http://localhost:3002/auth/oidc.callback"]' -s 'webOrigins=["http://localhost:3002"]' -s standardFlowEnabled=true -s directAccessGrantsEnabled=false
```

Was die Angaben bedeuten:

- `publicClient=false` und `secret` – Outline muss sich mit dem Client-Secret ausweisen. Das geht, weil Outline auf dem Server läuft und das Secret dort geheim bleibt.
- `redirectUris` – die einzige Adresse, zu der Keycloak nach der Anmeldung zurückleiten darf. Bei Outline endet sie immer auf `/auth/oidc.callback`.
- `webOrigins` – erlaubt dem Browser Anfragen von der Adresse von Outline an Keycloak.
- `standardFlowEnabled=true` – die übliche Anmeldung über eine Weiterleitung im Browser.
- `directAccessGrantsEnabled=false` – Outline darf keine Passwörter direkt an Keycloak schicken. Das braucht es nicht.

**Prüfen:** Die Ausgabe lautet `Created new client with id '…'`.

## Outline herunterladen und bauen

### 8. Systembenutzer anlegen

Outline läuft unter einem eigenen Benutzer `outline`, mit dem man sich nicht anmelden kann. Sein Heimatordner ist der Programmordner. Dort legt corepack auch die heruntergeladene Yarn-Version ab.

```bash
sudo useradd --system --home-dir /opt/outline --shell /usr/sbin/nologin outline
```

### 9. Quellcode herunterladen

Lädt die Version 1.10.1 von Outline nach `/opt/outline`. `-b v1.10.1` wählt genau diese Version, `--depth 1` lässt die Versionsgeschichte weg. Die aktuelle Versionsnummer steht auf <https://github.com/outline/outline/releases>.

```bash
sudo git clone -b v1.10.1 --depth 1 https://github.com/outline/outline.git /opt/outline
```

Die Meldung über einen „losgelösten HEAD“ (`detached HEAD`) ist normal: Git zeigt eine feste Version statt eines Entwicklungszweigs.

### 10. Eigentümer ändern

Übergibt den Ordner dem Benutzer `outline`, damit er dort bauen darf.

```bash
sudo chown -R outline:outline /opt/outline
```

### 11. In den Programmordner wechseln

Die folgenden Yarn-Befehle arbeiten immer im aktuellen Ordner.

```bash
cd /opt/outline
```

### 12. Bibliotheken installieren

Lädt alle Bibliotheken, die Outline braucht, in den Ordner `node_modules`. corepack liest aus `package.json`, welche Yarn-Version Outline vorschreibt, und lädt sie beim ersten Aufruf. Fragt corepack, ob es Yarn herunterladen darf, bestätige mit <kbd>Y</kbd>. `--immutable` sorgt dafür, dass genau die Versionen installiert werden, mit denen die Entwickler getestet haben. Meldungen mit `YN0004` (Build-Skripte abgeschaltet) sind normal.

```bash
sudo -u outline corepack yarn install --immutable
```

**Prüfen:** Die letzte Zeile beginnt mit `➤ YN0000: · Done`.

### 13. Outline bauen

Übersetzt die Weboberfläche und den Server in fertiges JavaScript im Ordner `build`. Das dauert einige Minuten.

```bash
sudo -u outline corepack yarn build
```

**Prüfen:** Die Ausgabe endet mit `Done!`, und der Ordner `build` enthält `app` und `server`.

```bash
ls /opt/outline/build
```

## Outline einrichten

### 14. Ordner für hochgeladene Dateien anlegen

Outline speichert Bilder und Anhänge hier auf der Festplatte statt in einem Cloud-Speicher.

```bash
sudo mkdir -p /var/lib/outline/data
```

### 15. Eigentümer des Datenordners setzen

Nur Outline soll in diesen Ordner schreiben.

```bash
sudo chown -R outline:outline /var/lib/outline
```

### 16. Ersten geheimen Schlüssel erzeugen

Outline braucht zwei zufällige Schlüssel. Mit ihnen verschlüsselt es Anmeldesitzungen und gespeicherte Zugangsdaten. Kopiere die Ausgabe für `SECRET_KEY` in Schritt 18.

```bash
openssl rand -hex 32
```

### 17. Zweiten geheimen Schlüssel erzeugen

Derselbe Befehl noch einmal, diesmal für `UTILS_SECRET`. Die beiden Schlüssel müssen verschieden sein.

```bash
openssl rand -hex 32
```

### 18. Einstellungsdatei anlegen

Outline liest seine Einstellungen aus der Datei `.env` im Programmordner. Eine ausführlich kommentierte Vorlage mit allen Möglichkeiten liegt in `.env.sample`.

```bash
sudo nano /opt/outline/.env
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Setze die Schlüssel aus den Schritten 16 und 17 und das Client-Secret aus Schritt 5 ein. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

```ini
NODE_ENV=production
URL=http://localhost:3002
PORT=3002
FORCE_HTTPS=false

SECRET_KEY=SCHLÜSSEL_AUS_SCHRITT_16
UTILS_SECRET=SCHLÜSSEL_AUS_SCHRITT_17

DATABASE_URL=postgres://outline:geheimes_passwort@127.0.0.1:5432/outline
PGSSLMODE=disable
REDIS_URL=redis://127.0.0.1:6379

FILE_STORAGE=local
FILE_STORAGE_LOCAL_ROOT_DIR=/var/lib/outline/data

OIDC_ISSUER_URL=http://localhost:8083/realms/intern
OIDC_CLIENT_ID=outline
OIDC_CLIENT_SECRET=DEIN_CLIENT_SECRET
OIDC_DISPLAY_NAME=Keycloak
OIDC_USERNAME_CLAIM=preferred_username
OIDC_SCOPES=openid profile email

DEFAULT_LANGUAGE=de_DE
```

Was die Einträge bedeuten:

- `URL` – die Adresse, unter der Outline im Browser aufgerufen wird. Sie muss genau zur `redirectUris` aus Schritt 7 passen.
- `PORT` – der Port, auf dem Outline Anfragen annimmt.
- `FORCE_HTTPS=false` – Outline leitet sonst jede Anfrage auf HTTPS um. Hier gibt es kein Zertifikat.
- `SECRET_KEY` und `UTILS_SECRET` – die beiden Schlüssel aus den Schritten 16 und 17.
- `DATABASE_URL` – Benutzer, Passwort, Adresse und Name der Datenbank aus den Schritten 3 und 4.
- `PGSSLMODE=disable` – die Verbindung zur Datenbank bleibt auf dem eigenen Rechner und braucht keine Verschlüsselung.
- `REDIS_URL` – die Adresse von Redis.
- `FILE_STORAGE=local` und `FILE_STORAGE_LOCAL_ROOT_DIR` – Anhänge landen im Ordner aus Schritt 14.
- `OIDC_ISSUER_URL` – die Adresse des Realms `intern`. Outline liest dort alle weiteren Adressen von Keycloak selbst aus.
- `OIDC_CLIENT_ID` und `OIDC_CLIENT_SECRET` – Name und Secret des Clients aus Schritt 7.
- `OIDC_DISPLAY_NAME` – die Beschriftung der Anmeldeschaltfläche.
- `OIDC_USERNAME_CLAIM` – aus diesem Feld übernimmt Outline den Benutzernamen.
- `OIDC_SCOPES` – Outline fragt bei Keycloak Name und E-Mail-Adresse des Benutzers ab.
- `DEFAULT_LANGUAGE=de_DE` – neue Benutzer sehen die Oberfläche auf Deutsch.

### 19. Einstellungsdatei schützen

Die Datei enthält Passwörter und Schlüssel. Die beiden Befehle übergeben sie dem Benutzer `outline` und sperren sie für alle anderen.

```bash
sudo chown outline:outline /opt/outline/.env
```

```bash
sudo chmod 600 /opt/outline/.env
```

## Als Dienst einrichten

### 20. systemd-Dienst anlegen

Damit Outline beim Rechnerstart automatisch läuft, bekommt es eine Dienstdatei für systemd.

```bash
sudo nano /etc/systemd/system/outline.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=Outline
After=network.target postgresql.service redis-server.service keycloak.service

[Service]
Type=simple
User=outline
Group=outline
WorkingDirectory=/opt/outline
ExecStart=/usr/bin/node build/server/index.js
Restart=on-failure
IPAddressDeny=any
IPAddressAllow=localhost

[Install]
WantedBy=multi-user.target
```

- `After=` – Outline startet erst nach PostgreSQL, Redis und Keycloak.
- `WorkingDirectory=` – Outline findet dort die Datei `.env`.
- `ExecStart=` – startet den gebauten Server mit dem Node.js aus Ubuntu.
- `IPAddressDeny=any` und `IPAddressAllow=localhost` – systemd lässt nur Verbindungen vom und zum eigenen Rechner durch. Aus dem Netzwerk ist Outline so nicht erreichbar, obwohl es auf allen Schnittstellen lauscht.

### 21. systemd die neue Datei bekannt machen

systemd liest Dienstdateien nur beim Start oder auf Anweisung ein.

```bash
sudo systemctl daemon-reload
```

### 22. Dienst starten und Autostart einschalten

Startet Outline sofort und bei jedem Hochfahren. Beim ersten Start legt Outline die Tabellen in PostgreSQL an.

```bash
sudo systemctl enable --now outline
```

### 23. Protokoll ansehen

Zeigt die Meldungen von Outline fortlaufend an. <kbd>Strg</kbd>+<kbd>C</kbd> beendet die Anzeige.

```bash
sudo journalctl -u outline -f
```

**Prüfen:** Nach vielen Zeilen mit `Migrating …` erscheint `Listening on http://localhost:3002`. Die Warnung `Enforced https was disabled` ist gewollt.

### 24. Aufruf prüfen

Prüft, ob Outline antwortet.

```bash
curl -sI http://localhost:3002/
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 200 OK`.

## Erste Anmeldung

### 25. Mit Keycloak anmelden

Öffne im Browser <http://localhost:3002>. Klicke auf die Schaltfläche mit **Keycloak**. Der Browser wechselt zur Anmeldeseite von Keycloak. Melde dich dort mit dem Benutzer aus dem Realm `intern` an. Danach leitet Keycloak zurück zu Outline.

Beim allerersten Anmelden legt Outline einen Arbeitsbereich an und macht dich zu dessen Administrator. Alle weiteren Benutzer aus dem Realm `intern` können sich danach ebenfalls anmelden und landen im selben Arbeitsbereich.

**Prüfen:** Outline zeigt die Sammlung **Welcome** mit einigen Beispieldokumenten.

### 26. Arbeitsbereich benennen (optional)

Den Namen des Arbeitsbereichs änderst du unter **Einstellungen → Details**.

Soll Outline später unter einer eigenen Domain erreichbar sein, leitet man die Anfragen über [nginx](nginx.md) an `127.0.0.1:3002` weiter. Dann müssen `URL` in `.env`, die Adressen des Clients in Keycloak und `hostname` in der Keycloak-Einstellung zur neuen Adresse passen, und `IPAddressDeny` bleibt, weil nginx auf demselben Rechner läuft.

## Aktualisieren

Neue Versionen holst du mit Git und baust sie neu. Die Datenbank passt Outline beim nächsten Start selbst an. Die Befehle 2 bis 5 laufen im Ordner `/opt/outline`. `v1.10.2` steht hier als Beispiel für die neue Versionsnummer.

### 1. In den Programmordner wechseln

Git und Yarn arbeiten im aktuellen Ordner.

```bash
cd /opt/outline
```

### 2. Neue Version herunterladen

Holt nur die gewünschte Version vom Server.

```bash
sudo -u outline git fetch --depth 1 origin tag v1.10.2
```

### 3. Auf die neue Version umschalten

Tauscht den Quellcode gegen die neue Version aus. `.env` gehört nicht zum Quellcode und bleibt erhalten.

```bash
sudo -u outline git checkout v1.10.2
```

### 4. Bibliotheken aktualisieren

Bringt `node_modules` auf den Stand der neuen Version.

```bash
sudo -u outline corepack yarn install --immutable
```

### 5. Neu bauen

Erzeugt den Ordner `build` für die neue Version.

```bash
sudo -u outline corepack yarn build
```

### 6. Dienst neu starten

Startet die neue Version. Dabei laufen die nötigen Änderungen an der Datenbank.

```bash
sudo systemctl restart outline
```

**Prüfen:** Im Protokoll (`sudo journalctl -u outline -n 50`) steht wieder `Listening on http://localhost:3002`.

## Deinstallieren

### 1. Dienst stoppen und Autostart ausschalten

Beendet Outline und verhindert den Start beim Hochfahren.

```bash
sudo systemctl disable --now outline
```

### 2. Dienstdatei löschen

Entfernt die Dienstdatei aus Schritt 20.

```bash
sudo rm /etc/systemd/system/outline.service
```

### 3. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
sudo systemctl daemon-reload
```

### 4. Programm- und Datenordner löschen

Entfernt Outline samt Einstellungen und alle hochgeladenen Dateien. **Achtung:** Anhänge gehen dabei verloren.

```bash
sudo rm -rf /opt/outline /var/lib/outline
```

### 5. Datenbank löschen

Löscht die Datenbank `outline`. **Achtung:** Alle Dokumente gehen unwiderruflich verloren.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS outline;"
```

### 6. Datenbankbenutzer löschen

Entfernt den PostgreSQL-Benutzer aus Schritt 3.

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS outline;"
```

### 7. Systembenutzer löschen

Entfernt den Linux-Benutzer aus Schritt 8.

```bash
sudo userdel outline
```

### 8. Befehlszeilenwerkzeug von Keycloak anmelden

Für das Entfernen des Clients braucht `kcadm.sh` eine gültige Anmeldung.

```bash
/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8083 --realm master --user admin
```

### 9. Interne Nummer des Clients ermitteln

Keycloak löscht Clients über ihre interne Nummer (`id`), nicht über den Namen. Dieser Befehl zeigt sie an.

```bash
/opt/keycloak/bin/kcadm.sh get clients -r intern -q clientId=outline --fields id
```

### 10. Client in Keycloak löschen

Ersetze `CLIENT_ID` durch die Nummer aus Schritt 9.

```bash
/opt/keycloak/bin/kcadm.sh delete clients/CLIENT_ID -r intern
```

### 11. Redis entfernen (optional)

Nur ausführen, wenn kein anderes Programm Redis braucht. `purge` entfernt auch die gespeicherten Daten von Redis.

```bash
sudo apt purge redis-server redis-tools
```

```bash
sudo apt autoremove
```

**Prüfen:** Unter Port 3002 antwortet nichts mehr, `curl` meldet einen Verbindungsfehler.

```bash
curl -sI http://localhost:3002/
```
