# Keycloak

Keycloak ist eine freie Benutzer- und Anmeldeverwaltung. Andere Programme wie [Outline](outline.md) überlassen ihm die Anmeldung über die Standards OpenID Connect (OIDC) oder SAML. Benutzer haben dann ein Konto an einer zentralen Stelle statt in jedem Programm ein eigenes. Diese Anleitung richtet Keycloak als Dienst auf dem eigenen Rechner ein und speichert alle Daten in PostgreSQL.

## Vorbemerkungen

- **Voraussetzung:** [PostgreSQL](postgresql.md) ist nach der Anleitung installiert und läuft.
- **Keine Installation über apt:** Ubuntu enthält kein Keycloak-Paket. Das Projekt stellt aber ein fertiges Archiv bereit, das nur Java braucht. Java kommt aus den Paketquellen von Ubuntu.
- **Version:** Getestet mit Keycloak **26.7.4** und PostgreSQL 18. Keycloak 26.7 setzt Java **25** voraus und lief im Test auch mit Java 26.
- **Port:** Keycloak läuft normalerweise auf Port 8080. Auf diesem Rechner belegt Apache diesen Port schon (siehe [Tileserver](tileserver.md)). Die Anleitung verwendet deshalb Port **8083**. Dazu kommt Port **9000** für interne Gesundheitsprüfungen. Beide Ports sind nur vom eigenen Rechner aus erreichbar.
- **Ohne HTTPS:** Keycloak läuft hier im Produktionsmodus, aber ohne Verschlüsselung. Das ist nur in Ordnung, solange Keycloak ausschließlich über `localhost` erreichbar ist. Für den Zugriff aus dem Netz gehört ein Proxy mit Zertifikat davor, z. B. [nginx](nginx.md).
- **Passwörter:** `geheimes_passwort` ist ein Beispiel. Ersetze es überall durch ein eigenes Passwort.

## Vorbereitung

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketstände der Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Java und curl installieren

Keycloak ist in Java geschrieben. `openjdk-25-jre-headless` ist die Java-Laufzeitumgebung ohne grafische Teile, die ein Server nicht braucht. Mit `curl` lädst du später das Programmarchiv herunter.

```bash
sudo apt install openjdk-25-jre-headless curl
```

**Prüfen:** Die erste Zeile beginnt mit `openjdk version "25`. Sind mehrere Java-Versionen installiert, kann hier auch eine neuere stehen. Keycloak verwendet dieselbe Version wie dieser Befehl.

```bash
java -version
```

## Datenbank in PostgreSQL einrichten

### 3. Datenbankbenutzer für Keycloak anlegen

Legt in PostgreSQL den Benutzer `keycloak` an. Mit ihm meldet sich Keycloak an der Datenbank an.

```bash
sudo -u postgres psql -c "CREATE USER keycloak WITH PASSWORD 'geheimes_passwort';"
```

### 4. Datenbank für Keycloak anlegen

Legt die leere Datenbank `keycloak` an und macht den gleichnamigen Benutzer zu ihrem Eigentümer. Die Tabellen erstellt Keycloak beim ersten Start selbst.

```bash
sudo -u postgres psql -c "CREATE DATABASE keycloak OWNER keycloak;"
```

**Prüfen:** Die Datenbank erscheint in der Liste.

```bash
sudo -u postgres psql -l | grep keycloak
```

## Keycloak installieren

### 5. Systembenutzer anlegen

Keycloak soll weder mit Administratorrechten noch unter deinem Benutzerkonto laufen, sondern unter einem eigenen Benutzer `keycloak`, mit dem man sich nicht anmelden kann.

```bash
sudo useradd --system --home-dir /opt/keycloak --shell /usr/sbin/nologin keycloak
```

### 6. Programmarchiv herunterladen

Lädt Keycloak 26.7.4 (etwa 170 MB) in den Ordner `/tmp`. Die aktuelle Versionsnummer steht auf <https://github.com/keycloak/keycloak/releases>. Bei einer neueren Version ersetzt du die Nummer an beiden Stellen im Befehl.

```bash
curl -L -o /tmp/keycloak.tar.gz https://github.com/keycloak/keycloak/releases/download/26.7.4/keycloak-26.7.4.tar.gz
```

**Prüfen:** Die Datei ist ungefähr 170 MB groß.

```bash
ls -lh /tmp/keycloak.tar.gz
```

### 7. Programmordner anlegen

Legt den Ordner an, in dem Keycloak liegen soll.

```bash
sudo mkdir /opt/keycloak
```

### 8. Archiv entpacken

Im Archiv steckt alles in einem Unterordner `keycloak-26.7.4`. `--strip-components=1` lässt diese Ebene weg, sodass die Dateien direkt in `/opt/keycloak` landen.

```bash
sudo tar xzf /tmp/keycloak.tar.gz -C /opt/keycloak --strip-components=1
```

**Prüfen:** Der Ordner enthält unter anderem `bin`, `conf` und `lib`.

```bash
ls /opt/keycloak
```

### 9. Einstellungsdatei schreiben

Die Datei `keycloak.conf` legt fest, welche Datenbank Keycloak nutzt und unter welcher Adresse es erreichbar ist. Sie enthält schon Beispiele, die alle auskommentiert sind.

```bash
sudo nano /opt/keycloak/conf/keycloak.conf
```

Lösche den bisherigen Inhalt: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles aus. Füge dann diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
# Datenbank
db=postgres
db-url=jdbc:postgresql://127.0.0.1:5432/keycloak
db-username=keycloak
db-password=geheimes_passwort

# HTTP
http-enabled=true
http-host=127.0.0.1
http-port=8083
hostname=http://localhost:8083

# Gesundheitsprüfung
health-enabled=true
```

Was die Einträge bedeuten:

- `db` und `db-url` – Keycloak nutzt PostgreSQL auf dem eigenen Rechner und dort die Datenbank `keycloak`.
- `db-username` und `db-password` – die Zugangsdaten aus Schritt 3.
- `http-enabled=true` – erlaubt unverschlüsseltes HTTP. Im Produktionsmodus ist es sonst abgeschaltet.
- `http-host` und `http-port` – Keycloak nimmt Anfragen nur vom eigenen Rechner an, und zwar auf Port 8083.
- `hostname` – die Adresse, die Keycloak in Links und Anmeldedaten für andere Programme einträgt. Sie muss genau so lauten, wie Browser und Programme Keycloak aufrufen.
- `health-enabled=true` – schaltet unter Port 9000 eine Seite ein, die meldet, ob Keycloak bereit ist.

### 10. Eigentümer und Rechte setzen

Der erste Befehl übergibt den Programmordner dem Benutzer `keycloak`. Der zweite sorgt dafür, dass nur noch dieser Benutzer die Einstellungsdatei mit dem Datenbank-Passwort lesen darf.

```bash
sudo chown -R keycloak:keycloak /opt/keycloak
```

```bash
sudo chmod 600 /opt/keycloak/conf/keycloak.conf
```

### 11. Keycloak für diese Einstellungen vorbereiten

Keycloak übersetzt einen Teil der Einstellungen, z. B. die Wahl der Datenbank, vorab in eine optimierte Fassung. Dann startet es später schneller. Dieser Schritt ist nach jeder Änderung an `db` oder `health-enabled` nötig.

```bash
sudo -u keycloak /opt/keycloak/bin/kc.sh build
```

**Prüfen:** Die Ausgabe endet mit `Server configuration updated and persisted.`

### 12. Ersten Administrator anlegen

Ein neues Keycloak hat noch keinen Benutzer, mit dem man es verwalten kann. Dieser Befehl legt den Administrator `admin` an und legt dabei auch die Tabellen in PostgreSQL an. Er funktioniert nur, solange Keycloak noch nicht als Dienst läuft, deshalb kommt er vor Schritt 15. Nach dem Start fragt er zweimal nach dem gewünschten Passwort (`Enter password:`). Die Eingabe bleibt beim Tippen unsichtbar.

```bash
sudo -u keycloak /opt/keycloak/bin/kc.sh bootstrap-admin user --optimized --username admin
```

**Prüfen:** Unter den Meldungen steht `Created temporary admin user with username admin`. Keycloak nennt dieses Konto „temporär“ und empfiehlt in der Verwaltungsoberfläche, später ein dauerhaftes Administratorkonto anzulegen. Für einen Entwicklungsrechner reicht `admin`.

## Als Dienst einrichten

### 13. systemd-Dienst anlegen

Damit Keycloak beim Rechnerstart automatisch läuft, bekommt es eine Dienstdatei für systemd.

```bash
sudo nano /etc/systemd/system/keycloak.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=Keycloak
After=network.target postgresql.service

[Service]
Type=simple
User=keycloak
Group=keycloak
ExecStart=/opt/keycloak/bin/kc.sh start --optimized
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

- `After=` – Keycloak startet erst, wenn PostgreSQL bereit ist.
- `ExecStart=` – `start` ist der Produktionsmodus. `--optimized` nutzt die vorbereitete Fassung aus Schritt 11.
- `Restart=on-failure` – systemd startet Keycloak nach einem Absturz neu.

### 14. systemd die neue Datei bekannt machen

systemd liest Dienstdateien nur beim Start oder auf Anweisung ein.

```bash
sudo systemctl daemon-reload
```

### 15. Dienst starten und Autostart einschalten

`enable` sorgt für den Start beim Hochfahren, `--now` startet Keycloak zusätzlich sofort.

```bash
sudo systemctl enable --now keycloak
```

### 16. Start prüfen

Keycloak braucht nach dem Start noch einige Sekunden, bis es Anfragen beantwortet. Die Gesundheitsprüfung zeigt, ob es so weit ist.

```bash
curl -s http://localhost:9000/health/ready
```

**Prüfen:** Die Ausgabe enthält `"status": "UP"`. Steht dort noch `DOWN`, wiederhole den Befehl nach ein paar Sekunden. Kommt gar keine Antwort, zeigt `sudo journalctl -u keycloak -n 50` die letzten Meldungen.

### 17. Verwaltungsoberfläche öffnen

Öffne im Browser <http://localhost:8083/admin/> und melde dich mit `admin` und dem Passwort aus Schritt 12 an.

## Realm und ersten Benutzer anlegen

Ein **Realm** ist in Keycloak ein abgetrennter Bereich mit eigenen Benutzern und eigenen angebundenen Programmen. Der vorhandene Realm `master` ist nur für die Verwaltung von Keycloak selbst gedacht. Für deine Anwendungen legst du einen eigenen an, hier mit dem Namen `intern`. Die Schritte nutzen das Befehlszeilenwerkzeug `kcadm.sh`, das bei Keycloak dabei ist. Alles geht genauso in der Verwaltungsoberfläche.

### 18. Befehlszeilenwerkzeug anmelden

Meldet `kcadm.sh` als Administrator bei Keycloak an. Das Werkzeug fragt nach dem Passwort aus Schritt 12 und merkt sich die Anmeldung für die nächsten Befehle in `~/.keycloak/kcadm.config`.

```bash
/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8083 --realm master --user admin
```

**Prüfen:** Nach der Passworteingabe erscheint keine Fehlermeldung.

### 19. Realm anlegen

Erstellt den Realm `intern` und schaltet ihn ein.

```bash
/opt/keycloak/bin/kcadm.sh create realms -s realm=intern -s enabled=true
```

**Prüfen:** Die Ausgabe lautet `Created new realm with id 'intern'`.

### 20. Benutzer anlegen

Erstellt einen Benutzer im Realm `intern`. Ersetze Benutzername, E-Mail und Namen durch deine Angaben. Die E-Mail-Adresse und der Name werden gebraucht, weil angebundene Programme wie Outline sie übernehmen. `emailVerified=true` kennzeichnet die Adresse als bestätigt, weil hier kein E-Mail-Versand eingerichtet ist.

```bash
/opt/keycloak/bin/kcadm.sh create users -r intern -s username=erika -s email=erika@example.com -s emailVerified=true -s firstName=Erika -s lastName=Mustermann -s enabled=true
```

### 21. Passwort für den Benutzer setzen

Legt das Passwort fest, mit dem sich der Benutzer später anmeldet. `kcadm.sh` fragt danach, die Eingabe bleibt unsichtbar.

```bash
/opt/keycloak/bin/kcadm.sh set-password -r intern --username erika
```

**Prüfen:** Öffne <http://localhost:8083/realms/intern/account/> und melde dich mit dem neuen Benutzer an. Es erscheint die Kontoseite des Benutzers.

## Deinstallieren

### 1. Dienst stoppen und Autostart ausschalten

Beendet Keycloak und verhindert den Start beim Hochfahren.

```bash
sudo systemctl disable --now keycloak
```

### 2. Dienstdatei löschen

Entfernt die Dienstdatei aus Schritt 13.

```bash
sudo rm /etc/systemd/system/keycloak.service
```

### 3. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
sudo systemctl daemon-reload
```

### 4. Programmordner und Archiv löschen

Entfernt Keycloak samt Einstellungen und das heruntergeladene Archiv.

```bash
sudo rm -rf /opt/keycloak /tmp/keycloak.tar.gz
```

### 5. Anmeldung des Befehlszeilenwerkzeugs löschen

Entfernt die gespeicherte Anmeldung aus Schritt 18.

```bash
rm -rf ~/.keycloak
```

### 6. Datenbank löschen

Löscht die Datenbank `keycloak`. **Achtung:** Alle Realms, Benutzer und Einstellungen gehen unwiderruflich verloren. Programme, die sich über Keycloak anmelden, funktionieren danach nicht mehr.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS keycloak;"
```

### 7. Datenbankbenutzer löschen

Entfernt den PostgreSQL-Benutzer aus Schritt 3.

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS keycloak;"
```

### 8. Systembenutzer löschen

Entfernt den Linux-Benutzer aus Schritt 5.

```bash
sudo userdel keycloak
```

### 9. Java entfernen (optional)

Nur ausführen, wenn kein anderes Programm Java 25 braucht.

```bash
sudo apt purge openjdk-25-jre-headless
```

```bash
sudo apt autoremove
```

**Prüfen:** Unter Port 8083 antwortet nichts mehr, `curl` meldet einen Verbindungsfehler.

```bash
curl -sI http://localhost:8083/
```
