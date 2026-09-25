# Apache Jena Fuseki

Apache Jena Fuseki ist ein Server für RDF-Daten, also für Wissen in Form von Aussagen wie „Hamburg – hat Einwohner – 1.910.000“. Solche Aussagen heißen Tripel. Fuseki speichert sie dauerhaft und beantwortet Abfragen in der Abfragesprache SPARQL, über eine Weboberfläche oder per HTTP. Diese Anleitung lässt Fuseki als Dienst auf dem eigenen Rechner laufen.

## Vorbemerkungen

- **Keine Installation über apt:** Ubuntu hat kein Paket für Fuseki. Die Apache Software Foundation stellt ein fertiges Archiv bereit, das nur Java braucht. Java kommt aus den Paketquellen von Ubuntu.
- **Version:** Getestet mit Fuseki **6.2.0** und Java 25 unter Ubuntu 26.04. Fuseki 6 braucht mindestens Java 21.
- **Ordner:** Das Programm liegt in `/opt/fuseki`. Datenbanken, Einstellungen und Protokolle legt Fuseki in einem eigenen Arbeitsordner ab, hier `/var/lib/fuseki`. So bleiben die Daten bei einem Update unberührt.
- **Port:** Fuseki läuft auf Port **3030** und ist nur vom eigenen Rechner aus erreichbar.
- **Kein Passwort:** Die Verwaltung (Datenbanken anlegen und löschen) erlaubt Fuseki von Haus aus nur vom eigenen Rechner. Abfragen und Änderungen an den Daten sind ohne Anmeldung möglich. Solange Fuseki nur auf `localhost` hört, ist das in Ordnung.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketstände der Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Java und curl installieren

`openjdk-25-jre-headless` ist die Java-Laufzeitumgebung ohne grafische Teile. Mit `curl` lädst du später das Archiv herunter und sprichst mit Fuseki.

```bash
sudo apt install openjdk-25-jre-headless curl
```

**Prüfen:** Der Ordner mit Java 25 ist vorhanden. Den Pfad braucht der Dienst in Schritt 8.

```bash
ls /usr/lib/jvm/java-25-openjdk-amd64/bin/java
```

### 3. Programmarchiv herunterladen

Lädt Fuseki 6.2.0 (etwa 50 MB) in den Ordner `/tmp`. Die aktuelle Version steht auf <https://jena.apache.org/download/>.

```bash
curl -L -o /tmp/fuseki.tar.gz https://dlcdn.apache.org/jena/binaries/apache-jena-fuseki-6.2.0.tar.gz
```

### 4. Prüfsumme kontrollieren

Stellt sicher, dass das Archiv vollständig und unverändert angekommen ist. Apache veröffentlicht die Prüfsumme neben dem Archiv, in einer Datei mit der Endung `.sha512`.

```bash
sha512sum /tmp/fuseki.tar.gz
```

**Prüfen:** Die Ausgabe beginnt mit `ba65f5867d2d4741b2ed9e2af5a0d4fbb447909894ab2a0c6bc4dac8997f4fe339c87b13c48d45d054977769f0f8bf763ea346b1f7792d5cdc458041bd43a132`.

### 5. Programmordner anlegen

Legt den Ordner für das Programm an.

```bash
sudo mkdir /opt/fuseki
```

### 6. Archiv entpacken

Im Archiv liegt alles in einem Unterordner `apache-jena-fuseki-6.2.0`. `--strip-components=1` lässt diese Ebene weg, sodass die Dateien direkt in `/opt/fuseki` landen.

```bash
sudo tar xzf /tmp/fuseki.tar.gz -C /opt/fuseki --strip-components=1
```

**Prüfen:** Der Ordner enthält `fuseki-server` und `fuseki-server.jar`.

```bash
ls /opt/fuseki
```

### 7. Systembenutzer anlegen

Fuseki soll unter einem eigenen Benutzer laufen, mit dem man sich nicht anmelden kann. `--create-home` legt dabei den Arbeitsordner `/var/lib/fuseki` an. Das Programm in `/opt/fuseki` gehört weiter `root`, Fuseki kann es also nicht verändern.

```bash
sudo useradd --system --create-home --home-dir /var/lib/fuseki --shell /usr/sbin/nologin fuseki
```

## Als Dienst einrichten

### 8. systemd-Dienst anlegen

Im Archiv liegt unter `service/service/fuseki.service` eine Vorlage. Die folgende Datei baut darauf auf, mit angepassten Pfaden.

```bash
sudo nano /etc/systemd/system/fuseki.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=Apache Jena Fuseki
After=network.target

[Service]
Type=simple
User=fuseki
Group=fuseki
Environment=FUSEKI_HOME=/opt/fuseki
Environment=FUSEKI_BASE=/var/lib/fuseki
Environment=JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64
Environment=JVM_ARGS=-Xmx2G
ExecStart=/opt/fuseki/fuseki-server --localhost --port 3030
Restart=on-abort
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

Was die Angaben bedeuten:

- `FUSEKI_HOME` – der Programmordner aus Schritt 6.
- `FUSEKI_BASE` – der Arbeitsordner für Datenbanken, Einstellungen und Protokolle.
- `JAVA_HOME` – Fuseki nutzt ausdrücklich Java 25, auch wenn weitere Java-Versionen installiert sind.
- `JVM_ARGS=-Xmx2G` – Fuseki darf bis zu 2 GB Arbeitsspeicher belegen. Für große Datenmengen erhöht man den Wert.
- `--localhost` – Fuseki ist nur vom eigenen Rechner aus erreichbar.
- `--port 3030` – der Port für Weboberfläche und Abfragen.
- `SuccessExitStatus=143` – Java beendet sich beim Stoppen mit dem Code 143. systemd soll das nicht als Fehler werten.

### 9. systemd die neue Datei bekannt machen

systemd liest Dienstdateien nur beim Start oder auf Anweisung ein.

```bash
sudo systemctl daemon-reload
```

### 10. Dienst starten und Autostart einschalten

`enable` sorgt für den Start beim Hochfahren, `--now` startet Fuseki zusätzlich sofort. Beim ersten Start legt Fuseki im Arbeitsordner Unterordner wie `databases` und `configuration` an.

```bash
sudo systemctl enable --now fuseki
```

**Prüfen:** Im Protokoll stehen `Fuseki Base = /var/lib/fuseki` und `Start Fuseki`.

```bash
sudo journalctl -u fuseki -n 15
```

### 11. Erreichbarkeit prüfen

`/$/ping` ist eine Adresse, die nur meldet, ob Fuseki läuft. Die einfachen Anführungszeichen verhindern, dass die Shell `$` als Variable liest.

```bash
curl -s 'http://localhost:3030/$/ping'
```

**Prüfen:** Die Ausgabe ist Datum und Uhrzeit, z. B. `2026-09-25T22:14:24.069+00:00`. Im Browser zeigt <http://localhost:3030> die Weboberfläche von Fuseki.

## Erste Daten

### 12. Datenbank anlegen

Legt eine dauerhafte Datenbank namens `wissen` an. `tdb2` ist das Speicherformat von Jena, das die Daten auf der Festplatte ablegt. Dasselbe geht auch in der Weboberfläche im Bereich zur Verwaltung der Datenbanken.

```bash
curl -s --data 'dbName=wissen&dbType=tdb2' 'http://localhost:3030/$/datasets'
```

**Prüfen:** Die Datenbank erscheint in der Liste der Datenbanken von Fuseki.

```bash
curl -s 'http://localhost:3030/$/datasets' | grep ds.name
```

### 13. Beispieldaten schreiben

Legt eine Datei im Format Turtle an, einer gut lesbaren Schreibweise für RDF.

```bash
nano ~/staedte.ttl
```

Füge diesen Inhalt ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```turtle
@prefix ex:   <http://example.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

ex:Hamburg    rdfs:label "Hamburg" ;    ex:einwohner 1910000 ; ex:liegtIn ex:Hamburg_Land .
ex:Ahrensburg rdfs:label "Ahrensburg" ; ex:einwohner 34800 ;   ex:liegtIn ex:Schleswig-Holstein .
```

- `@prefix` – Abkürzungen: `ex:Hamburg` steht für `http://example.org/Hamburg`. In RDF hat jedes Ding eine weltweit eindeutige Adresse.
- Jede Zeile beschreibt eine Stadt. `;` trennt mehrere Aussagen über dieselbe Stadt, `.` beendet sie. Zusammen sind es sechs Tripel.

### 14. Daten laden

Schickt die Datei an die Datenbank `wissen`. `Content-Type: text/turtle` sagt Fuseki, in welchem Format die Daten kommen.

```bash
curl -s -X POST -H 'Content-Type: text/turtle' --data-binary @$HOME/staedte.ttl http://localhost:3030/wissen/data
```

**Prüfen:** Die Antwort meldet `"tripleCount" : 6`.

### 15. SPARQL-Abfrage stellen

Fragt alle Städte mit ihrer Einwohnerzahl ab, die größte zuerst. `Accept: text/csv` bestellt das Ergebnis als einfache Tabelle.

```bash
curl -s -H 'Accept: text/csv' --data-urlencode 'query=PREFIX ex: <http://example.org/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?stadt ?einwohner WHERE { ?s rdfs:label ?stadt ; ex:einwohner ?einwohner } ORDER BY DESC(?einwohner)' http://localhost:3030/wissen/query
```

**Prüfen:** Die Ausgabe lautet:

```text
stadt,einwohner
Hamburg,1910000
Ahrensburg,34800
```

Bequemer geht es im Browser: Auf <http://localhost:3030> gibt es zu jeder Datenbank einen Abfrage-Editor.

## Wo liegt was?

- `/var/lib/fuseki/databases` – die Datenbanken, ein Ordner pro Datenbank.
- `/var/lib/fuseki/configuration` – eine Beschreibung pro Datenbank, damit Fuseki sie nach einem Neustart wieder öffnet.
- `/var/lib/fuseki/shiro.ini` – Zugriffsregeln. Hier legt man bei Bedarf Benutzer und Passwörter an.
- `/var/lib/fuseki/backups` – Sicherungen, die man in der Weboberfläche anstoßen kann.

## Aktualisieren

### 1. Neue Version herunterladen

Lädt die neue Version. Ersetze `6.2.0` durch die aktuelle Versionsnummer.

```bash
curl -L -o /tmp/fuseki.tar.gz https://dlcdn.apache.org/jena/binaries/apache-jena-fuseki-6.2.0.tar.gz
```

### 2. Dienst stoppen

Fuseki darf beim Austausch der Dateien nicht laufen.

```bash
sudo systemctl stop fuseki
```

### 3. Neue Version entpacken

Überschreibt die Programmdateien in `/opt/fuseki`. Die Daten in `/var/lib/fuseki` bleiben unberührt.

```bash
sudo tar xzf /tmp/fuseki.tar.gz -C /opt/fuseki --strip-components=1
```

### 4. Dienst starten

Startet die neue Version.

```bash
sudo systemctl start fuseki
```

**Prüfen:** Im Protokoll (`sudo journalctl -u fuseki -n 15`) steht die neue Versionsnummer.

## Deinstallieren

### 1. Dienst stoppen und Autostart ausschalten

Beendet Fuseki und verhindert den Start beim Hochfahren.

```bash
sudo systemctl disable --now fuseki
```

### 2. Dienstdatei löschen

Entfernt die Dienstdatei aus Schritt 8.

```bash
sudo rm /etc/systemd/system/fuseki.service
```

### 3. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
sudo systemctl daemon-reload
```

### 4. Programm und Archiv löschen

Entfernt den Programmordner und das heruntergeladene Archiv.

```bash
sudo rm -rf /opt/fuseki /tmp/fuseki.tar.gz
```

### 5. Benutzer und Daten löschen

`-r` löscht mit dem Benutzer auch seinen Ordner `/var/lib/fuseki` und damit alle Datenbanken. **Achtung:** Die Daten gehen dabei verloren. Die Warnung `Mail-Warteschlange … nicht gefunden` ist harmlos.

```bash
sudo userdel -r fuseki
```

### 6. Beispieldatei löschen

Entfernt die Datei aus Schritt 13.

```bash
rm -f ~/staedte.ttl
```

### 7. Java entfernen (optional)

Nur ausführen, wenn kein anderes Programm Java 25 braucht, z. B. [Keycloak](keycloak.md).

```bash
sudo apt purge openjdk-25-jre-headless
```

```bash
sudo apt autoremove
```

**Prüfen:** Unter Port 3030 antwortet nichts mehr, `curl` meldet einen Verbindungsfehler.

```bash
curl -sI http://localhost:3030/
```
