# Qdrant

Qdrant ist eine Vektordatenbank. Sie speichert Vektoren, etwa Embeddings von Texten oder Bildern, zusammen mit beliebigen Zusatzdaten und findet in Millisekunden die Einträge, die einem Suchvektor am ähnlichsten sind. Damit ist sie ein typischer Baustein für semantische Suche und RAG-Anwendungen (Sprachmodelle, die in eigenen Dokumenten nachschlagen).

## Vorbemerkungen

- **Kein apt-Paket und kein offizielles Snap:** Qdrant ist nicht in den Ubuntu-Paketquellen enthalten. Die Entwickler veröffentlichen aber auf GitHub ein fertiges `.deb`-Paket, das diese Anleitung mit `apt` installiert.
- **Das Paket ist schlicht:** Es enthält nur das Programm `/usr/bin/qdrant`, eine Einstellungsdatei und die Weboberfläche. Einen Systembenutzer und einen systemd-Dienst legt es **nicht** an. Das erledigst du in den Schritten 7 bis 12.
- **Version:** Die Befehle verwenden Version **1.19.1**. Ist eine neuere Version erschienen, ersetzt du in den Befehlen die Versionsnummer und die Prüfsumme. Beides steht auf <https://github.com/qdrant/qdrant/releases/latest>.
- **Nur lokal erreichbar:** Ohne weitere Einstellung lauscht Qdrant auf allen Netzwerkschnittstellen, ohne Passwort. Diese Anleitung beschränkt es auf den eigenen Rechner (`127.0.0.1`) und schaltet die anonyme Nutzungsstatistik ab, die Qdrant sonst an die Hersteller sendet.
- **Alternative:** Wer Vektoren direkt neben seinen übrigen Daten ablegen möchte, kann auch [PostgreSQL mit pgvector](postgresql.md#pgvector-einrichten) verwenden. Qdrant ist dagegen auf Vektorsuche spezialisiert und bringt eigene Filter, eine Weboberfläche und Werkzeuge zum Skalieren mit.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramme installieren

`wget` lädt das Paket herunter, mit `curl` sprichst du später die Datenbank an. Beide sind meist schon vorhanden.

```bash
sudo apt install wget curl
```

### 3. In den Download-Ordner wechseln

Das Paket wird hier abgelegt.

```bash
cd ~/Downloads
```

### 4. Paket herunterladen

Lädt das offizielle `.deb`-Paket für 64-Bit-PCs (amd64) herunter, etwa 25 MB.

```bash
wget https://github.com/qdrant/qdrant/releases/download/v1.19.1/qdrant_1.19.1-1_amd64.deb
```

### 5. Paket prüfen

Vergleicht die Prüfsumme der heruntergeladenen Datei mit dem Wert, den GitHub auf der Release-Seite neben der Datei anzeigt (`sha256:…`). So erkennst du, ob die Datei vollständig und unverändert angekommen ist.

```bash
echo "858dda511c5c05bb5ceb19d7f79669c1e13a64390df205eee6f33b929a0a9a84  qdrant_1.19.1-1_amd64.deb" | sha256sum -c
```

**Prüfen:** Die Ausgabe lautet `qdrant_1.19.1-1_amd64.deb: OK`. Bei `FEHLSCHLAG` bzw. `FAILED` löschst du die Datei und lädst sie erneut herunter.

### 6. Qdrant installieren

Installiert das Paket. Das `./` vor dem Dateinamen sagt `apt`, dass es eine lokale Datei installieren soll.

```bash
sudo apt install ./qdrant_1.19.1-1_amd64.deb
```

**Prüfen:** Die Ausgabe lautet `qdrant 1.19.1`.

```bash
qdrant --version
```

Die heruntergeladene Datei kannst du danach löschen:

```bash
rm qdrant_1.19.1-1_amd64.deb
```

## Als Dienst einrichten

### 7. Systembenutzer anlegen

Qdrant soll nicht mit Administratorrechten laufen, sondern als eigener Benutzer `qdrant` ohne Anmeldemöglichkeit. `--system` legt einen Benutzer für Dienste an, `--home-dir` setzt sein Verzeichnis auf den Datenordner.

```bash
sudo useradd --system --home-dir /var/lib/qdrant --shell /usr/sbin/nologin qdrant
```

### 8. Datenordner übergeben

Der Benutzer `qdrant` muss in `/var/lib/qdrant` schreiben dürfen. Dort legt Qdrant die Unterordner `storage` (Daten) und `snapshots` (Sicherungen) an. Die Weboberfläche liegt ebenfalls hier, im Ordner `static`.

```bash
sudo chown -R qdrant:qdrant /var/lib/qdrant
```

### 9. systemd-Dienst anlegen

Die Dienstdatei sorgt dafür, dass systemd Qdrant startet, beim Systemstart automatisch hochfährt und nach einem Absturz neu startet. Die wichtigsten Angaben:

- `User`, `Group` – Qdrant läuft als Benutzer `qdrant`
- `ExecStart` – startet Qdrant mit der Einstellungsdatei aus dem Paket
- `QDRANT__SERVICE__HOST=127.0.0.1` – nur vom eigenen Rechner aus erreichbar
- `QDRANT__TELEMETRY_DISABLED=true` – keine Nutzungsstatistik an die Hersteller
- `LimitNOFILE` – erlaubt viele gleichzeitig geöffnete Dateien, die Qdrant bei vielen Daten braucht

Umgebungsvariablen, die mit `QDRANT__` beginnen, überschreiben Einstellungen aus der Datei. So bleibt `/etc/qdrant/config.yaml` unverändert und wird bei Updates nicht zum Konflikt.

```bash
sudo nano /etc/systemd/system/qdrant.service
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=Qdrant Vektordatenbank
After=network.target

[Service]
User=qdrant
Group=qdrant
WorkingDirectory=/var/lib/qdrant
ExecStart=/usr/bin/qdrant --config-path /etc/qdrant/config.yaml
Environment=QDRANT__SERVICE__HOST=127.0.0.1
Environment=QDRANT__TELEMETRY_DISABLED=true
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 10. systemd die neue Datei bekannt machen

systemd liest neue oder geänderte Dienstdateien erst nach diesem Befehl ein.

```bash
sudo systemctl daemon-reload
```

### 11. Dienst starten und Autostart einschalten

`enable` sorgt für den Start bei jedem Hochfahren, `--now` startet den Dienst zusätzlich sofort.

```bash
sudo systemctl enable --now qdrant
```

**Prüfen:** In der Ausgabe steht `Active: active (running)`. Mit `q` verlässt du die Anzeige.

```bash
systemctl status qdrant
```

### 12. Adresse und Telemetrie prüfen

Zeigt die Startmeldungen des Dienstes. Die zwei Warnungen `Config file not found: config/…` sind harmlos: Qdrant sucht zusätzlich nach Einstellungsdateien im Arbeitsordner, die es hier nicht gibt.

```bash
sudo journalctl -u qdrant --no-pager | grep -E "Telemetry|listening on:"
```

**Prüfen:** Die Ausgabe enthält `Telemetry reporting disabled` und `listening on: 127.0.0.1:6333`.

## Erste Schritte

Qdrant wird über eine REST-Schnittstelle auf Port `6333` angesprochen (und über gRPC auf Port `6334` für schnelle Programmanbindungen). Die folgenden Schritte verwenden `curl` und das gleiche Beispiel wie die pgvector-Anleitung: drei Einträge mit kleinen Vektoren aus drei Zahlen. Echte Embeddings haben meist mehrere hundert Zahlen.

### 13. Verbindung testen

Fragt Name und Version des Servers ab.

```bash
curl -s http://localhost:6333/
```

**Prüfen:** Die Antwort enthält `"version":"1.19.1"`.

### 14. Sammlung anlegen

Eine **Sammlung** (Collection) entspricht einer Tabelle. Beim Anlegen legst du fest, wie viele Zahlen jeder Vektor hat (`size`) und wie Ähnlichkeit gemessen wird (`distance`). `Cosine` vergleicht die Richtung der Vektoren, das ist für Text-Embeddings üblich.

```bash
curl -s -X PUT http://localhost:6333/collections/notizen -H 'Content-Type: application/json' -d '{"vectors": {"size": 3, "distance": "Cosine"}}'
```

**Prüfen:** Die Antwort lautet `{"result":true,"status":"ok",…}`.

### 15. Einträge einfügen

Ein Eintrag heißt in Qdrant **Punkt** (Point). Er besteht aus einer `id`, dem Vektor und einer frei gestaltbaren **Payload** mit Zusatzdaten im JSON-Format. `wait=true` wartet, bis die Daten gespeichert sind.

```bash
curl -s -X PUT 'http://localhost:6333/collections/notizen/points?wait=true' -H 'Content-Type: application/json' -d '{
  "points": [
    {"id": 1, "vector": [1, 0, 0],     "payload": {"text": "Apfel", "art": "obst"}},
    {"id": 2, "vector": [0.9, 0.1, 0], "payload": {"text": "Birne", "art": "obst"}},
    {"id": 3, "vector": [0, 0, 1],     "payload": {"text": "Auto",  "art": "fahrzeug"}}
  ]
}'
```

**Prüfen:** Die Antwort enthält `"status":"completed"`.

### 16. Ähnlichkeitssuche

Sucht die zwei Punkte, die dem Suchvektor am ähnlichsten sind. `score` gibt die Ähnlichkeit an: Je näher an 1, desto ähnlicher. `with_payload` liefert die Zusatzdaten mit.

```bash
curl -s -X POST http://localhost:6333/collections/notizen/points/query -H 'Content-Type: application/json' -d '{"query": [1, 0.05, 0], "limit": 2, "with_payload": true}'
```

**Prüfen:** Die Antwort enthält zuerst `Apfel`, dann `Birne`, beide mit einem `score` knapp unter 1. `Auto` fehlt, weil es nicht ähnlich ist.

### 17. Suche mit Filter

Eine Stärke von Qdrant: Suche und Filter auf die Payload lassen sich kombinieren. Dieselbe Suche wie oben, aber nur unter Einträgen mit `art` = `fahrzeug`.

```bash
curl -s -X POST http://localhost:6333/collections/notizen/points/query -H 'Content-Type: application/json' -d '{"query": [1, 0.05, 0], "limit": 2, "with_payload": true, "filter": {"must": [{"key": "art", "match": {"value": "fahrzeug"}}]}}'
```

**Prüfen:** Die Antwort enthält nur noch `Auto`, obwohl es dem Suchvektor gar nicht ähnlich ist. Der Filter wird zuerst angewendet.

### 18. Weboberfläche öffnen

Qdrant bringt eine Weboberfläche mit. Dort siehst du Sammlungen und Punkte, kannst Vektoren grafisch darstellen und Anfragen in einer Konsole ausprobieren.

**Prüfen:** <http://localhost:6333/dashboard> zeigt die Sammlung `notizen` mit 3 Punkten.

### 19. Beispiel-Sammlung löschen

Entfernt die Sammlung samt aller Punkte wieder.

```bash
curl -s -X DELETE http://localhost:6333/collections/notizen
```

## Aus Programmen verwenden

Für viele Sprachen gibt es offizielle Client-Bibliotheken, z. B. `qdrant-client` für Python (mit `pip` in einer virtuellen Umgebung, siehe [LangGraph-Anleitung](langgraph.md)) oder `@qdrant/js-client-rest` für JavaScript. LangChain bindet Qdrant über das Paket `langchain-qdrant` als Vektorspeicher an.

## Optional: Zugriff mit API-Schlüssel schützen

Auf einem Entwicklungsrechner, auf dem nur du arbeitest, reicht die Beschränkung auf `127.0.0.1`. Nutzen weitere Personen den Rechner, kannst du einen Schlüssel verlangen. Dazu ergänzt du in der Dienstdatei aus Schritt 9 im Abschnitt `[Service]` eine Zeile wie `Environment=QDRANT__SERVICE__API_KEY=ein-langes-geheimes-wort` und wiederholst die Schritte 10 und 11 (bei laufendem Dienst: `sudo systemctl restart qdrant`). Anfragen müssen den Schlüssel dann im Kopf `api-key` mitschicken, z. B. `curl -H 'api-key: ein-langes-geheimes-wort' …`.

## Aktualisieren

Das Paket stammt nicht aus einem Paketarchiv, deshalb aktualisiert `sudo apt upgrade` Qdrant **nicht**. Für eine neue Version wiederholst du die Schritte 3 bis 6 mit neuer Versionsnummer und Prüfsumme und startest danach den Dienst neu:

```bash
sudo systemctl restart qdrant
```

Deine Daten in `/var/lib/qdrant/storage` bleiben dabei erhalten. Lies vorher die Versionshinweise: Qdrant unterstützt Updates nur schrittweise über jeweils eine Nebenversion (z. B. von 1.18 auf 1.19, nicht direkt von 1.17 auf 1.19).

## Deinstallieren

### 1. Dienst stoppen und Autostart ausschalten

Beendet Qdrant und verhindert den Start beim Hochfahren.

```bash
sudo systemctl disable --now qdrant
```

### 2. Dienstdatei löschen

Entfernt die Datei aus Schritt 9.

```bash
sudo rm /etc/systemd/system/qdrant.service
```

### 3. systemd neu einlesen

Damit systemd den gelöschten Dienst vergisst.

```bash
sudo systemctl daemon-reload
```

### 4. Qdrant entfernen

`purge` entfernt das Programm, die Weboberfläche und die Einstellungsdatei `/etc/qdrant/config.yaml`.

```bash
sudo apt purge qdrant
```

### 5. Daten löschen

**Achtung:** Löscht alle Sammlungen, Punkte und Sicherungen endgültig.

```bash
sudo rm -rf /var/lib/qdrant
```

### 6. Systembenutzer löschen

Entfernt den Benutzer `qdrant` aus Schritt 7.

```bash
sudo userdel qdrant
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
qdrant --version
```
