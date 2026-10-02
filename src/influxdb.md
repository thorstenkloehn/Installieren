# InfluxDB

InfluxDB ist eine Zeitreihen-Datenbank: Sie ist darauf ausgelegt, sehr viele Messwerte mit Zeitstempel schnell zu speichern und nach Zeiträumen auszuwerten. Typische Daten sind Werte von Temperatur- und Feuchtesensoren, Stromzählern, Wetterstationen oder die Auslastung von Servern. Messwerte werden in einem einfachen Textformat geschrieben, abgefragt wird mit SQL. Diese Anleitung installiert **InfluxDB 3 Core**, die freie Ausgabe der aktuellen Version 3, und speichert als Beispiel das Raumklima mehrerer Zimmer.

## Vorbemerkungen

- **Warum nicht apt aus Ubuntu:** Ubuntu 26.04 enthält nur das Paket `influxdb` in der veralteten Version 1.6. Diese Anleitung nimmt stattdessen das apt-Archiv des Herstellers InfluxData. Nach dem Einbinden installiert und aktualisiert `apt` InfluxDB wie jedes andere Paket.
- **Version 3 statt 2:** Im selben Archiv gibt es auch noch `influxdb2`. Version 3 ist eine Neuentwicklung mit SQL als Abfragesprache und dem Speicherformat Parquet. Für neue Projekte empfiehlt der Hersteller Version 3.
- **Nur lokal erreichbar:** Ohne Anpassung lauscht InfluxDB 3 auf allen Netzwerkschnittstellen (`0.0.0.0:8181`). Schritt 11 beschränkt das vor dem ersten Start auf `127.0.0.1`.
- **Telemetrie:** In der Grundeinstellung schickt InfluxDB regelmäßig Nutzungsdaten an den Hersteller. Schritt 11 schaltet das ebenfalls ab.
- **Zugriff mit Token:** Statt Benutzer und Passwort verwendet InfluxDB 3 lange Zufallsschlüssel (*Token*). Ohne Token ist kein Zugriff möglich.
- **Version:** Getestet mit InfluxDB 3 Core **3.12.0** am 2. Oktober 2026.

## Paketquelle einbinden

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramme installieren

`wget` lädt den Schlüssel herunter, `ca-certificates` enthält die Zertifikate für die verschlüsselte Verbindung zum Archiv, `gpg` kann den Fingerabdruck des Schlüssels anzeigen. Meist sind alle drei schon vorhanden.

```bash
sudo apt install wget ca-certificates gpg
```

### 3. Signaturschlüssel herunterladen

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich von InfluxData stammen und unterwegs nicht verändert wurden. Mit der Endung `.asc` kann `apt` ihn direkt lesen.

```bash
sudo wget -O /etc/apt/keyrings/influxdata.asc https://repos.influxdata.com/influxdata-archive.key
```

### 4. Fingerabdruck des Schlüssels prüfen

Der Fingerabdruck ist eine Prüfsumme des Schlüssels. Stimmt er mit dem Wert überein, den InfluxData in seiner Installationsanleitung nennt, ist es der richtige Schlüssel.

```bash
gpg --show-keys /etc/apt/keyrings/influxdata.asc
```

**Prüfen:** Unter `pub` steht `24C975CBA61A024EE1B631787C3D57159FC2F927` und darunter `InfluxData Package Signing Key`. Steht dort etwas anderes, lösche die Datei mit `sudo rm /etc/apt/keyrings/influxdata.asc` und brich hier ab.

### 5. Paketquelle eintragen

Legt eine neue Datei an, die `apt` als zusätzliche Paketquelle liest.

```bash
sudo nano /etc/apt/sources.list.d/influxdata.sources
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://repos.influxdata.com/debian
Suites: stable
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/influxdata.asc
```

Das Archiv heißt zwar `debian`, die Pakete laufen aber genauso unter Ubuntu. `Suites: stable` ist für alle Systeme gleich.

### 6. Paketlisten neu einlesen

Erst jetzt lädt `apt` das Paketverzeichnis von InfluxData herunter.

```bash
sudo apt update
```

**Prüfen:** Der Installationskandidat ist eine Version wie `3.12.0-1`.

```bash
apt policy influxdb3-core
```

## Installation

### 7. InfluxDB installieren

Installiert den Server und das Kommandozeilenprogramm `influxdb3`. Als Empfehlung kommt das Paket `influxdata-archive-keyring` mit, das den Signaturschlüssel ein zweites Mal ablegt und künftig aktualisiert. Das Paket meldet den Dienst für den Systemstart an, startet ihn aber noch nicht.

```bash
sudo apt install influxdb3-core
```

### 8. Version prüfen

```bash
influxdb3 --version
```

**Prüfen:** Es erscheint z. B. `influxdb3 InfluxDB 3 Core, 3.12.0, revision …`.

## Vor dem ersten Start einrichten

### 9. Konfigurationsdatei öffnen

Die Einstellungen stehen in einer Datei im Format TOML. Fast alle Zeilen darin sind Kommentare mit `#`, die die möglichen Einstellungen beschreiben.

```bash
sudo nano /etc/influxdb3/influxdb3-core.conf
```

### 10. An das Ende der Datei springen

Drücke <kbd>Strg</kbd>+<kbd>Ende</kbd> und dann <kbd>Enter</kbd> für eine neue Zeile.

### 11. Adresse festlegen und Telemetrie abschalten

Füge diese zwei Zeilen ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
http-bind="127.0.0.1:8181"
disable-telemetry-upload=true
```

- `http-bind` – InfluxDB nimmt Verbindungen nur noch von diesem Rechner an.
- `disable-telemetry-upload` – InfluxDB sendet keine Nutzungsdaten mehr an den Hersteller.

### 12. Dienst starten

```bash
sudo systemctl start influxdb3-core
```

### 13. Prüfen, ob der Dienst läuft

```bash
systemctl status influxdb3-core
```

**Prüfen:** In der Ausgabe steht `active (running)`. Beende die Anzeige mit <kbd>q</kbd>.

### 14. Prüfen, dass InfluxDB nur lokal lauscht

```bash
sudo ss -ltnp | grep influxdb3
```

**Prüfen:** Es erscheint genau eine Zeile mit `127.0.0.1:8181`.

### 15. Prüfen, dass beide Einstellungen wirken

Ein Hilfsprogramm des Pakets wandelt die Konfigurationsdatei beim Start in Umgebungsvariablen um. Dieser Befehl zeigt die Variablen des laufenden Servers.

```bash
sudo cat /proc/$(pgrep -x influxdb3)/environ | tr '\0' '\n' | grep -E 'BIND|TELEMETRY'
```

**Prüfen:** Es erscheinen `INFLUXDB3_HTTP_BIND_ADDR=127.0.0.1:8181` und `INFLUXDB3_DISABLE_TELEMETRY_UPLOAD=true`.

## Zugangsschlüssel einrichten

### 16. Admin-Token erzeugen

Das erste Token hat alle Rechte. InfluxDB zeigt es nur ein einziges Mal an.

```bash
influxdb3 create token --admin
```

**Prüfen:** Es erscheint `New token created successfully!` und hinter `Token:` eine lange Zeichenfolge, die mit `apiv3_` beginnt. Lass das Terminal offen, du kopierst das Token im nächsten Schritt.

### 17. Token in einer Datei speichern

```bash
nano ~/.influxdb3-token
```

Markiere das Token im Terminal mit der Maus (von `apiv3_` bis zum Zeilenende), kopiere es mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>C</kbd> und füge es in nano mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd> ein. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 18. Datei schützen

Nur du darfst die Datei lesen und ändern.

```bash
chmod 600 ~/.influxdb3-token
```

### 19. Token für jedes Terminal bereitstellen

`influxdb3` liest das Token aus der Umgebungsvariablen `INFLUXDB3_AUTH_TOKEN`. Die Datei `~/.bashrc` wird bei jedem neuen Terminal ausgeführt.

```bash
nano ~/.bashrc
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei und füge diese Zeile ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

```bash
export INFLUXDB3_AUTH_TOKEN="$(cat ~/.influxdb3-token)"
```

Das Token selbst steht so nur in der geschützten Datei aus Schritt 17, nicht in `~/.bashrc`.

### 20. Einstellung im aktuellen Terminal laden

```bash
source ~/.bashrc
```

### 21. Anmeldung testen

```bash
influxdb3 show databases
```

**Prüfen:** Es erscheint eine Tabelle mit der Datenbank `_internal`, die InfluxDB für sich selbst anlegt. Erscheint stattdessen ein Fehler mit `401` oder `Unauthorized`, stimmt das Token in der Datei nicht.

## Messwerte speichern

Das Beispiel speichert stündliche Werte für Temperatur und Luftfeuchte aus zwei Räumen.

### 22. Datenbank anlegen

```bash
influxdb3 create database haus
```

**Prüfen:** Es erscheint `Database "haus" created successfully`.

### 23. Übungsordner anlegen

```bash
mkdir -p ~/influxdb-uebung
```

### 24. In den Ordner wechseln

```bash
cd ~/influxdb-uebung
```

### 25. Datei mit Messwerten anlegen

```bash
nano messwerte.lp
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
raumklima,raum=wohnzimmer temperatur=20.5,feuchte=48 1790834400
raumklima,raum=keller temperatur=14.2,feuchte=67 1790834400
raumklima,raum=wohnzimmer temperatur=20.8,feuchte=47 1790838000
raumklima,raum=keller temperatur=14.3,feuchte=66 1790838000
raumklima,raum=wohnzimmer temperatur=21.1,feuchte=46 1790841600
raumklima,raum=keller temperatur=14.4,feuchte=67 1790841600
raumklima,raum=wohnzimmer temperatur=21.4,feuchte=45 1790845200
raumklima,raum=keller temperatur=14.5,feuchte=66 1790845200
raumklima,raum=wohnzimmer temperatur=21.7,feuchte=44 1790848800
raumklima,raum=keller temperatur=14.6,feuchte=67 1790848800
raumklima,raum=wohnzimmer temperatur=22.0,feuchte=43 1790852400
raumklima,raum=keller temperatur=14.7,feuchte=66 1790852400
```

Jede Zeile ist ein Messpunkt im *Line Protocol*, dem Schreibformat von InfluxDB. Die Teile sind durch Leerzeichen getrennt:

1. `raumklima,raum=wohnzimmer` – der Name der Tabelle, danach durch Komma getrennt Merkmale (*Tags*), nach denen man später filtert und gruppiert.
2. `temperatur=20.5,feuchte=48` – die eigentlichen Messwerte (*Fields*).
3. `1790834400` – der Zeitpunkt in Sekunden seit dem 1. Januar 1970. Die Zahlen hier stehen für den 1. Oktober 2026 von 6 bis 11 Uhr Weltzeit (UTC), also 8 bis 13 Uhr deutscher Sommerzeit.

Eine Tabelle muss vorher nicht angelegt werden. InfluxDB legt sie beim ersten Schreiben an und ergänzt neue Spalten selbst.

### 26. Messwerte schreiben

`--precision s` sagt InfluxDB, dass die Zeitpunkte in Sekunden angegeben sind. Ohne die Angabe erwartet InfluxDB Nanosekunden.

```bash
influxdb3 write --database haus --precision s --file messwerte.lp
```

**Prüfen:** Die Ausgabe meldet `12 lines`.

### 27. Einen einzelnen Wert ohne Zeitpunkt schreiben

Fehlt der Zeitpunkt, nimmt InfluxDB die aktuelle Uhrzeit. So schicken auch Sensoren ihre Werte.

```bash
influxdb3 write --database haus 'raumklima,raum=kueche temperatur=22.4,feuchte=55'
```

## Abfragen

Die Zeitpunkte in den Ergebnissen sind immer in Weltzeit (UTC) angegeben.

### 28. Die ersten Zeilen ansehen

```bash
influxdb3 query --database haus "SELECT * FROM raumklima ORDER BY time LIMIT 4"
```

**Prüfen:** Es erscheint eine Tabelle mit den Spalten `feuchte`, `raum`, `temperatur` und `time`, beginnend mit `2026-10-01T06:00:00`.

### 29. Mittelwerte je Raum berechnen

```bash
influxdb3 query --database haus "SELECT raum, round(avg(temperatur), 1) AS mittel, max(feuchte) AS max_feuchte FROM raumklima GROUP BY raum ORDER BY raum"
```

**Prüfen:** Es erscheinen drei Räume, darunter `keller` mit `14.5` und `wohnzimmer` mit `21.3`.

### 30. Werte in Zeitabschnitten zusammenfassen

`date_bin` ordnet jeden Zeitpunkt einem Abschnitt fester Länge zu, hier zwei Stunden. Das ist die typische Abfrage für Diagramme über einen längeren Zeitraum.

```bash
influxdb3 query --database haus "SELECT date_bin(INTERVAL '2 hours', time) AS zeitraum, raum, round(avg(temperatur), 1) AS mittel FROM raumklima WHERE raum IN ('keller', 'wohnzimmer') GROUP BY zeitraum, raum ORDER BY zeitraum, raum"
```

**Prüfen:** Es erscheinen sechs Zeilen für die Abschnitte ab 6, 8 und 10 Uhr, je eine für Keller und Wohnzimmer.

### 31. Ergebnis als CSV ausgeben

`--format csv` gibt die Werte durch Kommas getrennt aus, z. B. für eine Tabellenkalkulation. Mit `> datei.csv` dahinter landet die Ausgabe in einer Datei.

```bash
influxdb3 query --database haus --format csv "SELECT raum, round(avg(temperatur), 1) AS mittel FROM raumklima GROUP BY raum ORDER BY raum"
```

## Über HTTP schreiben und lesen

Sensoren, Skripte und Programme sprechen InfluxDB meist direkt über HTTP an. Das Token wird dabei im Kopf der Anfrage mitgeschickt.

### 32. Ohne Token anfragen

```bash
curl -i http://127.0.0.1:8181/health
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 401 Unauthorized`.

### 33. Einen Messwert per HTTP schreiben

`--data-binary` schickt die Zeile im Line Protocol unverändert mit. `-w '%{http_code}\n'` zeigt den Antwortcode an.

```bash
curl -w '%{http_code}\n' -H "Authorization: Bearer $INFLUXDB3_AUTH_TOKEN" --data-binary 'raumklima,raum=bad temperatur=23.1,feuchte=71' "http://127.0.0.1:8181/api/v3/write_lp?db=haus"
```

**Prüfen:** Die Antwort ist `204`. Das bedeutet: angenommen, es gibt nichts zurückzumelden.

### 34. Per HTTP abfragen

`-G` hängt die Angaben an die Adresse an, `--data-urlencode` wandelt Leerzeichen und Sonderzeichen passend um. `format=jsonl` liefert jede Zeile als eigenes JSON-Objekt.

```bash
curl -G -H "Authorization: Bearer $INFLUXDB3_AUTH_TOKEN" http://127.0.0.1:8181/api/v3/query_sql --data-urlencode db=haus --data-urlencode "q=SELECT raum, temperatur FROM raumklima WHERE raum IN ('bad', 'kueche')" --data-urlencode format=jsonl
```

**Prüfen:** Es erscheinen `{"raum":"bad","temperatur":23.1}` und `{"raum":"kueche","temperatur":22.4}`.

## Sichern und wiederherstellen

InfluxDB 3 Core legt alle Daten als Dateien unter `/var/lib/influxdb3/data` ab. Bei angehaltenem Dienst lässt sich der Ordner als Archiv sichern.

### 35. Dienst anhalten

```bash
sudo systemctl stop influxdb3-core
```

### 36. Sicherung anlegen

`-C /var/lib/influxdb3` wechselt vorher in den Elternordner, damit im Archiv nur `data/…` steht.

```bash
sudo tar -czf /var/backups/influxdb3.tar.gz -C /var/lib/influxdb3 data
```

**Prüfen:** Die Datei ist vorhanden.

```bash
ls -l /var/backups/influxdb3.tar.gz
```

### 37. Dienst wieder starten

```bash
sudo systemctl start influxdb3-core
```

Zum Wiederherstellen hältst du den Dienst an, löschst den Ordner mit `sudo rm -r /var/lib/influxdb3/data`, packst das Archiv mit `sudo tar -xzf /var/backups/influxdb3.tar.gz -C /var/lib/influxdb3` wieder aus und startest den Dienst. Die Sicherung enthält auch die Token. Nach dem Zurückspielen gilt also wieder das Token, das zum Zeitpunkt der Sicherung gültig war. **Achtung:** Alles, was nach der Sicherung geschrieben wurde, ist danach weg.

## Optional: Autostart ausschalten

Wer InfluxDB nur ab und zu braucht, nimmt es aus dem Systemstart heraus und startet es bei Bedarf mit `sudo systemctl start influxdb3-core`.

```bash
sudo systemctl disable --now influxdb3-core
```

## Wie geht es weiter?

- **Alte Werte automatisch löschen:** Mit `influxdb3 create database NAME --retention-period 30d` behält eine Datenbank nur die Werte der letzten 30 Tage.
- **Token mit wenigen Rechten:** InfluxDB 3 Core kennt nur Admin-Token mit allen Rechten. Token, die z. B. nur in eine einzige Datenbank schreiben dürfen, gibt es erst in der kostenpflichtigen Ausgabe *Enterprise*. Gib das Token deshalb nur an Programme weiter, denen du vertraust.
- **Werte sammeln:** Das Programm Telegraf aus demselben Archiv (`sudo apt install telegraf`) misst Auslastung, Speicher und Netzwerk des Rechners oder liest Werte aus vielen anderen Quellen und schreibt sie in InfluxDB.
- **Diagramme:** Zum Darstellen der Zeitreihen wird meist Grafana verwendet. Es kann InfluxDB 3 über SQL abfragen.
- **Dokumentation:** <https://docs.influxdata.com/influxdb3/core/>

## Deinstallieren

### 1. Übungsordner und Token-Datei löschen

```bash
rm -rf ~/influxdb-uebung ~/.influxdb3-token
```

### 2. Zeile aus `~/.bashrc` entfernen

```bash
nano ~/.bashrc
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `INFLUXDB3_AUTH_TOKEN` und drücke <kbd>Enter</kbd>. Lösche die gefundene Zeile mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 3. Dienst anhalten

```bash
sudo systemctl stop influxdb3-core
```

### 4. InfluxDB entfernen

`purge` löscht die Konfiguration und die Protokolle, aber nicht die Daten. `apt` meldet deshalb, dass `/var/lib/influxdb3` nicht leer ist.

```bash
sudo apt purge influxdb3-core influxdata-archive-keyring
```

### 5. Daten löschen

**Achtung:** Alle Datenbanken sind danach unwiderruflich weg.

```bash
sudo rm -rf /var/lib/influxdb3 /var/log/influxdb3 /etc/influxdb3
```

### 6. Systembenutzer entfernen

Die Installation hat für den Dienst den Benutzer `influxdb3` und eine gleichnamige Gruppe angelegt. Die Gruppe wird mit dem Benutzer entfernt.

```bash
sudo deluser influxdb3
```

### 7. Paketquelle und Schlüssel löschen

```bash
sudo rm /etc/apt/sources.list.d/influxdata.sources /etc/apt/keyrings/influxdata.asc
```

### 8. Paketlisten aktualisieren

Danach kennt `apt` die Pakete von InfluxData nicht mehr.

```bash
sudo apt update
```

### 9. Sicherung löschen (optional)

```bash
sudo rm -f /var/backups/influxdb3.tar.gz
```

**Prüfen:** Der Befehl `influxdb3` wird nicht mehr gefunden.

```bash
influxdb3 --version
```
