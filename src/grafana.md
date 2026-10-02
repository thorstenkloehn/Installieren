# Grafana

Grafana zeigt Messwerte und andere Daten als Diagramme, Anzeigen und Tabellen in übersichtlichen *Dashboards* im Browser. Es speichert die Daten nicht selbst, sondern fragt sie bei Datenquellen ab, etwa bei [InfluxDB](influxdb.md), [PostgreSQL](postgresql.md), [MySQL](mysql.md) oder [ClickHouse](clickhouse.md). So lassen sich z. B. Raumtemperaturen, Stromverbrauch oder die Auslastung eines Servers über Stunden und Monate verfolgen. Diese Anleitung installiert Grafana als Dienst, schaltet die Datenübertragung an den Hersteller ab und baut mit eingebauten Testdaten ein erstes Dashboard.

## Vorbemerkungen

- **Warum nicht apt aus Ubuntu:** Ubuntu 26.04 enthält kein Paket für Grafana. Der Hersteller Grafana Labs betreibt aber ein eigenes, signiertes apt-Archiv. Nach dem Einbinden installiert und aktualisiert `apt` Grafana wie jedes andere Paket.
- **Nur lokal erreichbar:** Ohne Anpassung lauscht Grafana auf allen Netzwerkschnittstellen. Schritt 9 beschränkt das vor dem ersten Start auf `127.0.0.1`.
- **Datenübertragung:** In der Grundeinstellung meldet Grafana Nutzungsdaten an den Hersteller, sucht nach Updates und lädt Neuigkeiten. Schritt 9 schaltet das ab.
- **Port 3000:** Grafana verwendet Port **3000**. Läuft auf dem Rechner schon ein anderes Programm auf diesem Port, z. B. [Martin](martin.md), nimmst du in Schritt 9 eine andere Zahl wie `3001` und ersetzt `3000` in den folgenden Schritten entsprechend.
- **Englische Oberfläche:** Grafana startet auf Englisch. Die Anleitung nennt deshalb die englischen Bezeichnungen. Eine teilweise deutsche Oberfläche lässt sich später im Profil einstellen.
- **Größe:** Der Download ist rund 380 MB groß, ausgepackt belegt Grafana etwa 1,3 GB. Im Betrieb braucht es rund 350 MB Arbeitsspeicher.
- **Version:** Getestet mit Grafana **13.2.3** (Open-Source-Ausgabe) am 2. Oktober 2026.

## Paketquelle einbinden

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramme installieren

`wget` lädt den Schlüssel herunter, `ca-certificates` enthält die Zertifikate für die verschlüsselte Verbindung zum Archiv. Meist sind beide schon vorhanden.

```bash
sudo apt install wget ca-certificates
```

### 3. Signaturschlüssel herunterladen

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich von Grafana Labs stammen und unterwegs nicht verändert wurden. Mit der Endung `.asc` kann `apt` ihn direkt lesen.

```bash
sudo wget -O /etc/apt/keyrings/grafana.asc https://apt.grafana.com/gpg.key
```

**Prüfen:** Die erste Zeile lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -n 1 /etc/apt/keyrings/grafana.asc
```

### 4. Paketquelle eintragen

Legt eine neue Datei an, die `apt` als zusätzliche Paketquelle liest.

```bash
sudo nano /etc/apt/sources.list.d/grafana.sources
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://apt.grafana.com
Suites: stable
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/grafana.asc
```

`Suites: stable` enthält die fertigen Versionen. Das Archiv ist für alle Ubuntu- und Debian-Versionen gleich.

### 5. Paketlisten neu einlesen

Erst jetzt lädt `apt` das Paketverzeichnis von Grafana herunter.

```bash
sudo apt update
```

**Prüfen:** Der Installationskandidat ist eine Version wie `13.2.3`.

```bash
apt policy grafana
```

## Installation

### 6. Grafana installieren

Das Paket `grafana` ist die freie Open-Source-Ausgabe. Es legt den Dienst `grafana-server` an, startet ihn aber noch nicht.

```bash
sudo apt install grafana
```

**Prüfen:** Am Ende der Ausgabe steht `### NOT starting on installation`.

### 7. Version prüfen

```bash
grafana --version
```

**Prüfen:** Es erscheint `grafana version 13.2.3` oder eine höhere Nummer.

## Vor dem ersten Start einrichten

Die Einstellungen von Grafana stehen in der sehr langen Datei `/etc/grafana/grafana.ini`. Jede Einstellung lässt sich aber auch über eine Umgebungsvariable der Form `GF_ABSCHNITT_NAME` setzen. Diese Anleitung legt die Variablen in einer Ergänzungsdatei (*Drop-in*) zum Dienst ab. So bleibt `grafana.ini` unverändert, und bei Updates gibt es keine Rückfragen zu geänderten Konfigurationsdateien.

### 8. Ordner für die Dienst-Ergänzung anlegen

```bash
sudo mkdir -p /etc/systemd/system/grafana-server.service.d
```

### 9. Ergänzungsdatei anlegen

```bash
sudo nano /etc/systemd/system/grafana-server.service.d/override.conf
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Service]
Environment=GF_SERVER_HTTP_ADDR=127.0.0.1
Environment=GF_SERVER_HTTP_PORT=3000
Environment=GF_ANALYTICS_REPORTING_ENABLED=false
Environment=GF_ANALYTICS_CHECK_FOR_UPDATES=false
Environment=GF_ANALYTICS_CHECK_FOR_PLUGIN_UPDATES=false
Environment=GF_NEWS_NEWS_FEED_ENABLED=false
```

- `GF_SERVER_HTTP_ADDR` – Grafana nimmt Verbindungen nur von diesem Rechner an.
- `GF_SERVER_HTTP_PORT` – der Port der Weboberfläche.
- `GF_ANALYTICS_REPORTING_ENABLED` – keine Nutzungsdaten an den Hersteller.
- `GF_ANALYTICS_CHECK_FOR_UPDATES` und `…_PLUGIN_UPDATES` – keine Abfrage nach neuen Versionen. Updates kommen über `apt`.
- `GF_NEWS_NEWS_FEED_ENABLED` – keine Neuigkeiten von grafana.com auf der Startseite.

### 10. Testdaten-Quelle anlegen

Grafana bringt eine Datenquelle mit, die zufällige Messkurven erzeugt. Damit lässt sich ein Dashboard ausprobieren, ohne eine Datenbank anzuschließen. Dateien im Ordner `provisioning/datasources` legt Grafana beim Start als Datenquellen an.

```bash
sudo nano /etc/grafana/provisioning/datasources/testdaten.yaml
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```yaml
apiVersion: 1

datasources:
  - name: Testdaten
    type: grafana-testdata-datasource
    isDefault: true
```

- `name` – der Name, unter dem die Quelle in Grafana erscheint.
- `type` – die eingebaute Quelle für Testdaten.
- `isDefault: true` – neue Diagramme verwenden diese Quelle, solange keine andere gewählt wird.

Die Einrückung mit Leerzeichen gehört zum Format YAML und muss genau so bleiben.

### 11. systemd die Änderung mitteilen

```bash
sudo systemctl daemon-reload
```

### 12. Dienst starten und für den Systemstart anmelden

`enable --now` erledigt beides auf einmal.

```bash
sudo systemctl enable --now grafana-server
```

### 13. Prüfen, ob der Dienst läuft

Der erste Start dauert einige Sekunden, weil Grafana seine Datenbank anlegt.

```bash
systemctl status grafana-server
```

**Prüfen:** In der Ausgabe steht `active (running)`. Beende die Anzeige mit <kbd>q</kbd>.

### 14. Prüfen, dass die Einstellungen wirken

Grafana schreibt beim Start jede übernommene Umgebungsvariable ins Protokoll.

```bash
sudo journalctl -u grafana-server | grep "Config overridden from Environment"
```

**Prüfen:** Für jede der sechs Variablen aus Schritt 9 erscheint eine Zeile. Nach mehreren Starts stehen die Zeilen entsprechend öfter da.

### 15. Prüfen, dass Grafana nur lokal lauscht

```bash
sudo ss -ltnp | grep grafana
```

**Prüfen:** Es erscheint eine Zeile mit `127.0.0.1:3000`.

### 16. Zustand abfragen

```bash
curl http://127.0.0.1:3000/api/health
```

**Prüfen:** Die Antwort enthält `"database": "ok"` und die Versionsnummer.

## Erste Anmeldung

### 17. Grafana im Browser öffnen

```text
http://127.0.0.1:3000/
```

### 18. Mit dem Startpasswort anmelden

Grafana legt den Verwalter `admin` mit dem Passwort `admin` an. Gib bei **Email or username** `admin` und bei **Password** `admin` ein und klicke auf **Log in**.

### 19. Eigenes Passwort festlegen

Es erscheint **Update your password**. Gib bei **New password** und **Confirm new password** ein eigenes, langes Passwort ein und klicke auf **Submit**. Den Knopf **Skip** nicht verwenden, sonst bleibt das unsichere Passwort `admin` bestehen.

**Prüfen:** Es erscheint die Startseite mit **Welcome to Grafana**.

## Ein erstes Dashboard

### 20. Neues Dashboard anlegen

Klicke links auf **Dashboards** und dann oben rechts auf **New** und im aufklappenden Menü auf **New dashboard**.

**Prüfen:** In der Mitte steht **New dashboard**, rechts ist der Bereich **Add** geöffnet.

### 21. Panel hinzufügen

Ein *Panel* ist ein einzelnes Diagramm oder eine Anzeige im Dashboard. Klicke rechts unter **Panel** auf das Feld mit der Kurve und dem Pluszeichen (*Drag or click to add a panel*).

**Prüfen:** Links erscheint ein leeres Panel **New panel** mit dem Knopf **Configure visualization**.

### 22. Panel einrichten

Klicke auf **Configure visualization**.

**Prüfen:** Der Editor öffnet sich. Oben ist sofort eine Kurve zu sehen. Darunter steht bei **Data source** die Quelle `Testdaten` und bei **Scenario** `Random Walk`, eine zufällig auf und ab laufende Messreihe.

### 23. Darstellung ausprobieren

Rechts stehen unter **Suggestions** Vorschläge für die Darstellung, z. B. **Time series** (Kurve), **Stat** (große Zahl mit dem letzten Wert) und **Gauge** (Zeigerinstrument). Ein Klick auf einen Vorschlag übernimmt ihn.

### 24. Dashboard speichern

Klicke oben rechts auf **Save**. Ersetze im Feld **Title** den Text `New dashboard` durch `Erstes Dashboard` und klicke auf **Save**.

### 25. Zum Dashboard zurückkehren

Klicke oben rechts auf **Back**. Das Dashboard zeigt jetzt das Panel. Oben rechts lässt sich mit **Last 6 hours** der Zeitraum ändern.

**Prüfen:** Unter **Dashboards** steht in der Liste `Erstes Dashboard`.

### 26. Oberfläche auf Deutsch stellen (optional)

Klicke oben rechts auf das runde Benutzersymbol und dann auf **Profile**. Wähle unter **Preferences** bei **Language** `Deutsch` und klicke auf **Save preferences**. Menüs und viele Dialoge erscheinen danach auf Deutsch, einige Bereiche bleiben englisch.

## Sichern und wiederherstellen

Grafana speichert Benutzer, Dashboards und Datenquellen in der SQLite-Datei `/var/lib/grafana/grafana.db`.

### 27. Dienst anhalten

```bash
sudo systemctl stop grafana-server
```

### 28. Datenbank kopieren

`-a` erhält Besitzer und Rechte der Datei.

```bash
sudo cp -a /var/lib/grafana/grafana.db /var/backups/grafana.db
```

### 29. Dienst wieder starten

```bash
sudo systemctl start grafana-server
```

Zum Wiederherstellen hältst du den Dienst an, kopierst die Datei mit `sudo cp -a /var/backups/grafana.db /var/lib/grafana/grafana.db` zurück und startest den Dienst. **Achtung:** Alles, was nach der Sicherung geändert wurde, ist danach weg.

Einzelne Dashboards lassen sich außerdem als JSON-Datei sichern: In der schmalen Leiste rechts im Dashboard das Symbol **Export** (Pfeil nach unten) und dann **Export as code** wählen. Eingelesen wird die Datei über **Dashboards → New → Import dashboard**.

## Optional: Autostart ausschalten

Wer Grafana nur ab und zu braucht, nimmt es aus dem Systemstart heraus und startet es bei Bedarf mit `sudo systemctl start grafana-server`.

```bash
sudo systemctl disable --now grafana-server
```

## Wie geht es weiter?

- **Echte Daten anschließen:** Unter **Connections → Add new connection** stehen Datenquellen wie InfluxDB, PostgreSQL, MySQL und [Prometheus](prometheus.md) zur Auswahl. Für [InfluxDB](influxdb.md) 3 wählst du **InfluxDB** mit der Abfragesprache **SQL** und gibst das Token aus der InfluxDB-Anleitung an.
- **Passwort vergessen:** `sudo -u grafana grafana cli --homepath /usr/share/grafana --config /etc/grafana/grafana.ini admin reset-admin-password NEUES-PASSWORT` setzt das Passwort von `admin` neu. Das Passwort steht danach im Befehlsverlauf, ändere es deshalb gleich im Profil.
- **Zugriff aus dem Netz:** Dann sollte ein [nginx](nginx.md) mit HTTPS vor Grafana stehen, und Grafana bleibt auf `127.0.0.1`.
- **Dokumentation:** <https://grafana.com/docs/grafana/latest/>

## Deinstallieren

### 1. Dienst anhalten und abmelden

```bash
sudo systemctl disable --now grafana-server
```

### 2. Grafana entfernen

`apt` meldet dabei, dass `/etc/grafana` nicht leer ist. Diese Reste löscht Schritt 5.

```bash
sudo apt purge grafana
```

### 3. Dienst-Ergänzung löschen

```bash
sudo rm -r /etc/systemd/system/grafana-server.service.d
```

### 4. systemd die Änderung mitteilen

```bash
sudo systemctl daemon-reload
```

### 5. Übrige Dateien löschen

Das Paket räumt beim Entfernen nicht vollständig auf. Dieser Befehl löscht die Konfiguration samt Testdaten-Quelle, die Datenbank mit allen Dashboards und Benutzern sowie die Protokolle. **Achtung:** Alle Dashboards sind danach unwiderruflich weg.

```bash
sudo rm -rf /etc/grafana /var/lib/grafana /var/log/grafana
```

### 6. Systembenutzer entfernen

Die Installation hat den Benutzer `grafana` und eine gleichnamige Gruppe angelegt.

```bash
sudo deluser grafana
```

### 7. Paketquelle und Schlüssel löschen

```bash
sudo rm /etc/apt/sources.list.d/grafana.sources /etc/apt/keyrings/grafana.asc
```

### 8. Paketlisten aktualisieren

Danach kennt `apt` die Pakete von Grafana nicht mehr.

```bash
sudo apt update
```

### 9. Sicherung löschen (optional)

```bash
sudo rm -f /var/backups/grafana.db
```

**Prüfen:** Der Befehl `grafana` wird nicht mehr gefunden.

```bash
grafana --version
```
