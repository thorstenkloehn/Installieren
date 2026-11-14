# Piston

Piston führt Quellcode über eine lokale HTTP-API mit separat installierten Sprachlaufzeiten aus.

Diese Anleitung beschreibt Ubuntu 26.04 LTS (amd64) mit Docker und cgroup v2. Docker ist hier ausdrücklich gewünscht und damit eine Ausnahme zur allgemeinen Vorgabe dieses Buchs. Verwende einen eigenen Ausführungsrechner oder eine VM: Der offizielle Piston-Aufbau benötigt einen privilegierten Container. Die API wird ausschließlich an 127.0.0.1 gebunden; auch lokale Programme können die ungeschützte API erreichen.

Die Schritte sind anhand der offiziellen Quellen vorbereitet, aber nicht durch einen vollständigen Docker-Betriebstest auf diesem Rechner bestätigt. Alle Ausführungstests müssen vor dem Einsatz bestehen.

## Installation

### 1. Paketlisten aktualisieren

Lädt die Ubuntu-Paketstände.

````bash
sudo apt update
````

### 2. Docker und Werkzeuge installieren

Verwendet Ubuntu-Pakete statt eines fremden Installationsskripts.

````bash
sudo apt install docker.io docker-compose-v2 curl ca-certificates
````

### 3. Docker starten

Aktiviert den Dienst auch für spätere Neustarts.

````bash
sudo systemctl enable --now docker
````

### 4. Docker prüfen

Client und Server müssen eine Versionsantwort liefern.

````bash
sudo docker version
````

### 5. Compose prüfen

Die Ubuntu-Erweiterung stellt den Unterbefehl compose bereit.

````bash
sudo docker compose version
````

### 6. cgroup-Version prüfen

Erwartet wird cgroup2fs. Ohne cgroup v2 hier anhalten.

````bash
stat -fc %T /sys/fs/cgroup
````

### 7. Projektordner anlegen

Verwende einen noch nicht vorhandenen Zielordner.

````bash
mkdir ~/piston-lab
````

### 8. Projektordner öffnen

Die Compose-Datei wird hier verwaltet.

````bash
cd ~/piston-lab
````

### 9. Compose-Konfiguration schreiben

Übernimmt die benötigten Eigenschaften des offiziellen Aufbaus und begrenzt die Portfreigabe auf den eigenen Rechner. Sprachpakete liegen in einem eigenen Docker-Volume.

````bash
cat > compose.yaml <<'EOF'
services:
  api:
    image: ghcr.io/engineer-man/piston:latest
    privileged: true
    restart: unless-stopped
    ports:
      - "127.0.0.1:2000:2000"
    volumes:
      - packages:/piston/packages
    tmpfs:
      - /tmp:exec
volumes:
  packages:
EOF
````

### 10. Konfiguration prüfen

Muss ohne Fehler enden, bevor der Dienst gestartet wird.

````bash
sudo docker compose config --quiet
````

### 11. Image laden

Lädt das offizielle Image. latest ist veränderlich; der nächste Schritt dokumentiert den tatsächlichen Stand.

````bash
sudo docker compose pull
````

### 12. Image-Digest festhalten

Speichere den angezeigten Digest für eine spätere Wiederholung. Für einen festen Betrieb kann der Imagewert in compose.yaml durch ghcr.io/engineer-man/piston@sha256:... mit diesem Digest ersetzt werden.

````bash
sudo docker image inspect ghcr.io/engineer-man/piston:latest --format '{{index .RepoDigests 0}}'
````

### 13. API starten

Startet den Container im Hintergrund.

````bash
sudo docker compose up -d
````

### 14. Sprachliste abrufen

Eine leere JSON-Liste ist vor der Paketinstallation normal. Wenn der Dienst noch startet, wiederhole den Abruf. Bei anhaltendem Fehler lies die Logs mit dem unten genannten Befehl.

````bash
curl --fail --show-error http://127.0.0.1:2000/api/v2/runtimes
````

### 15. Python-Laufzeit installieren

Die Verwaltungs-API lädt ein verfügbares Python-Paket in das Volume. Prüfe die Antwort auf erfolgreichen Abschluss; ein gestarteter Container allein enthält noch keine Sprachlaufzeiten.

````bash
curl --fail --show-error   --header 'Content-Type: application/json'   --data '{"language":"python","version":"*"}'   http://127.0.0.1:2000/api/v2/packages
````

## Installation prüfen

### 1. Installierte Laufzeit prüfen

Die Antwort muss Python mit einer konkreten Versionsnummer enthalten.

````bash
curl --fail --show-error http://127.0.0.1:2000/api/v2/runtimes
````

### 2. Eigenen Code ausführen

Erwartet werden code 0 und die Ausgabe Piston bereit. Die Zeitwerte sind Millisekunden, das Speicherlimit ist in Bytes angegeben.

````bash
curl --fail --show-error   --header 'Content-Type: application/json'   --data '{"language":"python","version":"*","files":[{"name":"probe.py","content":"print(\"Piston bereit\")"}],"run_timeout":3000,"run_memory_limit":134217728}'   http://127.0.0.1:2000/api/v2/execute
````

### 3. Zeitbegrenzung prüfen

Diese Endlosschleife soll als Zeitüberschreitung enden. Eine HTTP-Antwort allein bedeutet noch keinen erfolgreichen Programmlauf: prüfe run.status, run.code und run.signal.

````bash
curl --fail --show-error   --header 'Content-Type: application/json'   --data '{"language":"python","version":"*","files":[{"content":"while True: pass"}],"run_timeout":1000,"run_cpu_time":1000}'   http://127.0.0.1:2000/api/v2/execute
````

### 4. Logs bei Fehlern lesen

Zeigt insbesondere Start-, Paket- und Sandboxfehler.

````bash
sudo docker compose logs --tail=80 api
````

Die Paketverwaltung besitzt keine Anmeldung. Dieser lokale Einstieg ist kein öffentlich abgesicherter Mehrbenutzerdienst. Die öffentliche Piston-API ist ein getrenntes Angebot und wird hier nicht vorausgesetzt.

## Deinstallieren

Führe die Compose-Befehle im Ordner ~/piston-lab aus.

### 1. Container entfernen

Stoppt den Dienst; Sprachpakete bleiben zunächst erhalten.

````bash
sudo docker compose down
````

### 2. Sprachpakete optional löschen

Entfernt das Volume dieses Projekts. Die installierten Sprachpakete gehen verloren.

````bash
sudo docker compose down --volumes
````

### 3. Containerentfernung prüfen

Die Ausgabe soll keine laufenden Container dieses Projekts enthalten.

````bash
sudo docker compose ps --all
````

### 4. Projektordner optional entfernen

Löscht die Konfiguration; sichere eigene Änderungen vorher.

````bash
rm -rf -- ~/piston-lab
````

Docker und das heruntergeladene Image bleiben verfügbar. Falls Docker ausschließlich hierfür installiert wurde, können seine Ubuntu-Pakete nach dem Beenden anderer Container entfernt werden:

```bash
sudo apt purge docker.io docker-compose-v2
```

## Quellen und Lizenz

[Offizieller Aufbau und API](https://github.com/engineer-man/piston/blob/master/readme.md), [Compose-Vorlage](https://github.com/engineer-man/piston/blob/master/docker-compose.yaml), [Paketinstallation](https://github.com/engineer-man/piston/blob/master/cli/commands/ppman_commands/install.js) und [Ubuntu-Compose-Paket](https://packages.ubuntu.com/resolute/docker-compose-v2). Piston steht unter MIT; Sprachpakete haben eigene Lizenzen.
