# Piston

Piston führt Quellcode über eine lokale HTTP-API mit separat installierten Sprachlaufzeiten aus.

## Vorbemerkungen

- **Docker-Ausnahme:** Diese Anleitung beschreibt Ubuntu 26.04 LTS (amd64) mit Docker und cgroup v2. Der offizielle Piston-Aufbau benötigt einen privilegierten Container; Docker ist hier ausdrücklich vorgesehen und damit eine begründete Ausnahme zur sonst containerfreien Vorgabe dieses Buchs.
- **Sicherheit:** Verwende für Piston einen separaten Ausführungsrechner oder eine virtuelle Maschine. Die API wird in dieser Anleitung ausschließlich an `127.0.0.1` (localhost) gebunden, besitzt jedoch keine Authentifizierung – alle lokalen Programme können die API erreichen.
- **Sprachlaufzeiten:** Der Piston-Kerncontainer enthält noch keine Compiler oder Interpreter; diese werden nach dem Start über die Paket-API separat installiert.
- **Alternative ohne Docker:** Wer Code direkt ohne Docker ausführen möchte, findet in [Jobe](jobe.md) oder dem eigenen [Runner mit bubblewrap und systemd-run](bubblewrap-systemd-run.md) native Alternativen.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aller benötigten Pakete aus den Ubuntu-Quellen kennt.

```bash
sudo apt update
```

### 2. Docker und Hilfswerkzeuge installieren

Installiert Docker und das Compose-Plugin direkt aus den offiziellen Ubuntu-Paketquellen, ohne fremde Installationsskripte.

```bash
sudo apt install docker.io docker-compose-v2 curl ca-certificates
```

### 3. Docker starten

Aktiviert den Docker-Dienst sofort und sorgt dafür, dass er auch nach einem Systemneustart automatisch läuft.

```bash
sudo systemctl enable --now docker
```

### 4. Docker prüfen

Prüft, ob Docker-Client und Docker-Daemon ordnungsgemäß gestartet sind und reagieren.

```bash
sudo docker version
```

### 5. Compose prüfen

Stellt sicher, dass das Compose-Plugin für Docker funktionsfähig ist.

```bash
sudo docker compose version
```

### 6. cgroup-Version prüfen

Piston benötigt cgroup v2. Die Ausgabe muss `cgroup2fs` lauten.

```bash
stat -fc %T /sys/fs/cgroup
```

### 7. Projektordner anlegen

Erstellt einen eigenen Ordner für die Piston-Konfiguration und die Daten.

```bash
mkdir ~/piston-lab
```

### 8. In den Projektordner wechseln

Alle weiteren Konfigurationsbefehle beziehen sich auf diesen Ordner.

```bash
cd ~/piston-lab
```

### 9. Compose-Konfiguration anlegen

Erstellt die Datei `compose.yaml`. Der Port 2000 wird gezielt nur an `127.0.0.1` gebunden, und ein Docker-Volume speichert die nachinstallierten Sprachpakete dauerhaft.

```bash
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
```

### 10. Konfiguration testen

Prüft die `compose.yaml` auf Syntaxfehler, bevor der Dienst gestartet wird.

```bash
sudo docker compose config --quiet
```

### 11. Image herunterladen

Lädt das offizielle Piston-Container-Image aus der GitHub-Container-Registry herunter.

```bash
sudo docker compose pull
```

### 12. Image-Digest festhalten

Ermittelt den kryptografischen Prüfwert (Digest) des geladenen Images zur Dokumentation des genauen Softwarestands.

```bash
sudo docker image inspect ghcr.io/engineer-man/piston:latest --format '{{index .RepoDigests 0}}'
```

### 13. Piston starten

Startet den Piston-Dienst als Hintergrundcontainer.

```bash
sudo docker compose up -d
```

### 14. Sprachliste abrufen

Fragt die verfügbaren Sprachlaufzeiten ab. Unmittelbar nach dem Start ist diese Liste noch leer.

```bash
curl --fail --show-error http://127.0.0.1:2000/api/v2/runtimes
```

### 15. Python-Laufzeit installieren

Lädt über die Paket-API von Piston die aktuelle Python-Laufzeitumgebung in das Docker-Volume herunter.

```bash
curl --fail --show-error \
  --header 'Content-Type: application/json' \
  --data '{"language":"python","version":"*"}' \
  http://127.0.0.1:2000/api/v2/packages
```

## Prüfung

### 1. Installierte Laufzeit prüfen

Prüft, ob Python jetzt in der Liste der installierten Laufzeiten aufgeführt wird.

```bash
curl --fail --show-error http://127.0.0.1:2000/api/v2/runtimes
```

### 2. Eigenen Programmcode ausführen

Sendet ein kleines Python-Skript an die API zur Ausführung in der Sandbox. Erwartet wird der Rückgabecode `0` und die Ausgabe `Piston bereit`.

```bash
curl --fail --show-error \
  --header 'Content-Type: application/json' \
  --data '{"language":"python","version":"*","files":[{"name":"probe.py","content":"print(\"Piston bereit\")"}],"run_timeout":3000,"run_memory_limit":134217728}' \
  http://127.0.0.1:2000/api/v2/execute
```

### 3. Zeitbegrenzung testen

Sendet eine Endlosschleife, um zu prüfen, ob Piston die Ausführung nach Ablauf des Zeitlimits zuverlässig abbricht.

```bash
curl --fail --show-error \
  --header 'Content-Type: application/json' \
  --data '{"language":"python","version":"*","files":[{"content":"while True: pass"}],"run_timeout":1000,"run_cpu_time":1000}' \
  http://127.0.0.1:2000/api/v2/execute
```

### 4. Dienst-Protokolle einsehen

Bei Fehlern lassen sich die Ausgaben des Piston-Containers anzeigen.

```bash
sudo docker compose logs --tail=80 api
```

## Deinstallation

### 1. Container stoppen und entfernen

Beendet den Piston-Dienst im Ordner `~/piston-lab`.

```bash
cd ~/piston-lab && sudo docker compose down
```

### 2. Sprachpakete und Volumes löschen

Entfernt auch das Docker-Volume mit den heruntergeladenen Sprachpaketen.

```bash
cd ~/piston-lab && sudo docker compose down --volumes
```

### 3. Entfernung prüfen

Stellt sicher, dass keine Piston-Container mehr vorhanden sind.

```bash
sudo docker compose ps --all
```

### 4. Projektordner löschen

Entfernt den Konfigurationsordner.

```bash
rm -rf ~/piston-lab
```

### 5. Docker optional deinstallieren

Falls Docker ausschließlich für diesen Test installiert wurde, können die Pakete wieder entfernt werden.

```bash
sudo apt purge docker.io docker-compose-v2
```

## Quellen und Lizenz

- **Piston:** Quellcode und API-Dokumentation stehen unter der [MIT-Lizenz](https://github.com/engineer-man/piston/blob/master/LICENSE).
- **Referenzen:** [Offizielles Repository](https://github.com/engineer-man/piston), [Compose-Vorlage](https://github.com/engineer-man/piston/blob/master/docker-compose.yaml) und [Ubuntu-Paketseite docker-compose-v2](https://packages.ubuntu.com/resolute/docker-compose-v2).
