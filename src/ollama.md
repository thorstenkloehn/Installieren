# Ollama

Ollama führt große Sprachmodelle (LLMs) direkt auf dem eigenen Rechner aus, ohne Cloud-Dienst, Konto oder Kosten pro Anfrage. Es lädt Modelle mit einem Befehl herunter und stellt sie über eine einfache HTTP-Schnittstelle bereit. Programme wie [LlamaIndex](llamaindex.md) können sie darüber nutzen. Neben Chat-Modellen gibt es Embedding-Modelle, die Texte in Vektoren für die Ähnlichkeitssuche umwandeln.

## Vorbemerkungen

- **Keine Installation über apt:** Ubuntu hat kein Paket für Ollama. Der Snap im Snap Store stammt nicht vom Hersteller. Die Anleitung installiert deshalb das offizielle Archiv von GitHub von Hand. Das Projekt bietet auch ein Installationsskript an (`curl … | sh`). Der Weg von Hand zeigt aber genau, was wohin kommt.
- **Version:** Getestet mit Ollama **0.34.4** unter Ubuntu 26.04.
- **Grafikkarte:** Mit einer NVIDIA-Grafikkarte und installiertem Treiber rechnet Ollama auf der Grafikkarte und ist dann viel schneller. Getestet mit einer GeForce GTX 1660 mit 6 GB. Ob ein Treiber läuft, zeigt `nvidia-smi`. Ohne Grafikkarte läuft Ollama auf dem Prozessor, nur langsamer.
- **Modelle:** Die Anleitung verwendet zwei kleine Modelle, die zusammen gut in 6 GB Grafikspeicher passen:
  - `qwen3:4b-instruct` (2,5 GB) – ein Chat-Modell, das Deutsch versteht und Werkzeuge aufrufen kann.
  - `nomic-embed-text` (274 MB) – ein Embedding-Modell, das Texte in Vektoren mit 768 Zahlen umwandelt.
- **Kleine Modelle wissen wenig:** Modelle dieser Größe formulieren gut, kennen aber nur wenige Fakten sicher. Im Test hat die „denkende“ Variante `qwen3:4b` die Hauptstadt von Schleswig-Holstein falsch beantwortet. `qwen3:4b-instruct` lag richtig. Für Antworten zu eigenen Dokumenten kombiniert man solche Modelle deshalb mit einer Suche in diesen Dokumenten (RAG), siehe [LlamaIndex](llamaindex.md).
- **Platz:** Das Programm braucht etwa 4 GB, weil es Bibliotheken für verschiedene Grafikkarten mitbringt. Dazu kommen die Modelle.
- **Port:** Ollama läuft auf Port **11434** und ist nur vom eigenen Rechner aus erreichbar.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. curl und zstd installieren

`curl` lädt das Archiv herunter. `zstd` packt es aus, denn Ollama verwendet das Kompressionsformat Zstandard (`.tar.zst`).

```bash
sudo apt install curl zstd
```

### 3. Programmarchiv herunterladen

Lädt Ollama 0.34.4 (etwa 1,4 GB) in den Ordner `/tmp`. Die aktuelle Version steht auf <https://github.com/ollama/ollama/releases>.

```bash
curl -L -o /tmp/ollama-linux-amd64.tar.zst https://github.com/ollama/ollama/releases/download/v0.34.4/ollama-linux-amd64.tar.zst
```

### 4. Prüfsumme kontrollieren

Der erste Befehl zeigt die Prüfsumme, die das Projekt für das Archiv veröffentlicht. Der zweite berechnet sie für die heruntergeladene Datei.

```bash
curl -sL https://github.com/ollama/ollama/releases/download/v0.34.4/sha256sum.txt | grep ollama-linux-amd64.tar.zst
```

```bash
sha256sum /tmp/ollama-linux-amd64.tar.zst
```

**Prüfen:** Beide Ausgaben beginnen mit derselben langen Zeichenfolge, bei Version 0.34.4 mit `c238986e61d40c0cc5f4a9b9e40b9eea104350b77efa34741fc134e105cb9533`.

### 5. Archiv auspacken

Das Archiv enthält die Ordner `bin` und `lib`. Ausgepackt nach `/usr/local` landet das Programm in `/usr/local/bin/ollama` und seine Bibliotheken in `/usr/local/lib/ollama`. Dort liegen selbst installierte Programme, getrennt von den Paketen aus apt.

```bash
sudo tar --zstd -xf /tmp/ollama-linux-amd64.tar.zst -C /usr/local
```

**Prüfen:** Die Ausgabe enthält die Versionsnummer `0.34.4`. Die Warnung, dass keine Verbindung zum Server besteht, ist normal, denn der Dienst läuft noch nicht.

```bash
ollama --version
```

### 6. Systembenutzer anlegen

Ollama soll unter einem eigenen Benutzer laufen, mit dem man sich nicht anmelden kann. Die Modelle speichert Ollama in dessen Heimatordner, hier `/usr/share/ollama/.ollama/models`.

```bash
sudo useradd --system --create-home --home-dir /usr/share/ollama --shell /usr/sbin/nologin ollama
```

## Als Dienst einrichten

### 7. systemd-Dienst anlegen

Damit Ollama beim Rechnerstart automatisch läuft, bekommt es eine Dienstdatei für systemd.

```bash
sudo nano /etc/systemd/system/ollama.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=Ollama
After=network-online.target

[Service]
Type=simple
User=ollama
Group=ollama
ExecStart=/usr/local/bin/ollama serve
Environment=OLLAMA_HOST=127.0.0.1:11434
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

- `ExecStart=… serve` – startet Ollama als Server, der auf Anfragen wartet.
- `OLLAMA_HOST=127.0.0.1:11434` – Ollama ist nur vom eigenen Rechner aus erreichbar. Ollama hat keine Anmeldung. Wäre es im Netzwerk erreichbar, könnte jeder dort die Modelle nutzen.
- `Restart=always` und `RestartSec=3` – startet Ollama nach einem Absturz nach drei Sekunden neu.

### 8. systemd die neue Datei bekannt machen

systemd liest Dienstdateien nur beim Start oder auf Anweisung ein.

```bash
sudo systemctl daemon-reload
```

### 9. Dienst starten und Autostart einschalten

`enable` sorgt für den Start beim Hochfahren, `--now` startet Ollama zusätzlich sofort.

```bash
sudo systemctl enable --now ollama
```

**Prüfen:** Die Antwort lautet `Ollama is running`.

```bash
curl -s http://localhost:11434/
```

### 10. Grafikkarte prüfen

Beim Start sucht Ollama nach Grafikkarten und schreibt das Ergebnis ins Protokoll.

```bash
sudo journalctl -u ollama | grep "inference compute"
```

**Prüfen:** Bei einer NVIDIA-Karte steht in der Zeile `library=CUDA` und der Name der Karte, z. B. `NVIDIA GeForce GTX 1660`. Steht dort `library=cpu`, rechnet Ollama auf dem Prozessor.

## Modelle laden und nutzen

### 11. Chat-Modell herunterladen

Lädt `qwen3:4b-instruct` aus der Modellbibliothek von Ollama (<https://ollama.com/library>). Der Teil hinter dem Doppelpunkt heißt Tag und wählt Größe und Variante.

```bash
ollama pull qwen3:4b-instruct
```

### 12. Embedding-Modell herunterladen

Lädt `nomic-embed-text`. Embedding-Modelle antworten nicht mit Text, sondern mit einer Liste von Zahlen, die die Bedeutung eines Textes beschreibt.

```bash
ollama pull nomic-embed-text
```

**Prüfen:** Beide Modelle erscheinen in der Liste.

```bash
ollama list
```

### 13. Mit dem Modell sprechen

Stellt dem Modell eine Frage und gibt die Antwort aus. Beim ersten Aufruf lädt Ollama das Modell in den Grafikspeicher. Das kann eine Weile dauern, danach geht es schnell.

```bash
ollama run qwen3:4b-instruct "Wie heißt die Landeshauptstadt von Schleswig-Holstein? Antworte mit einem Wort."
```

**Prüfen:** Die Antwort lautet `Kiel`. Ohne Frage am Ende startet `ollama run qwen3:4b-instruct` ein Gespräch im Terminal, das du mit `/bye` beendest.

### 14. Wo läuft das Modell?

Zeigt die geladenen Modelle und ob sie auf der Grafikkarte (GPU) oder dem Prozessor (CPU) laufen. Ollama entlädt ein Modell nach fünf Minuten ohne Anfrage wieder.

```bash
ollama ps
```

**Prüfen:** In der Spalte `PROCESSOR` steht bei einer passenden Grafikkarte `100% GPU`.

### 15. Die HTTP-Schnittstelle nutzen

Programme sprechen Ollama über HTTP an. Dieser Aufruf wandelt einen Satz in einen Vektor um und zählt, wie viele Zahlen er enthält.

```bash
curl -s http://localhost:11434/api/embed -d '{"model":"nomic-embed-text","input":"Ahrensburg liegt in Schleswig-Holstein."}' | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["embeddings"][0]))'
```

Ollama antwortet im Format JSON. Das kleine Python-Programm am Ende liest die Antwort und gibt nur die Länge des Vektors aus.

**Prüfen:** Die Ausgabe lautet `768`. Chat-Anfragen gehen entsprechend an `/api/chat`. Zusätzlich bietet Ollama unter `/v1` eine Schnittstelle im Format von OpenAI an, die viele Programme direkt verstehen.

## Wo liegt was?

- `/usr/local/bin/ollama` – das Programm.
- `/usr/local/lib/ollama` – Bibliotheken für Prozessor und Grafikkarten.
- `/usr/share/ollama/.ollama/models` – die heruntergeladenen Modelle.

Nicht mehr gebrauchte Modelle löschst du mit `ollama rm NAME`, z. B. `ollama rm qwen3:4b-instruct`.

## Aktualisieren

### 1. Neue Version herunterladen

Lädt die neue Version. Ersetze `v0.34.4` durch die aktuelle Versionsnummer und kontrolliere die Prüfsumme wie in Schritt 4.

```bash
curl -L -o /tmp/ollama-linux-amd64.tar.zst https://github.com/ollama/ollama/releases/download/v0.34.4/ollama-linux-amd64.tar.zst
```

### 2. Dienst stoppen

Ollama darf beim Austausch der Dateien nicht laufen.

```bash
sudo systemctl stop ollama
```

### 3. Alte Bibliotheken löschen

Die neue Version bringt eigene Bibliotheken mit. Alte Dateien könnten sonst stören. Die Modelle bleiben unberührt.

```bash
sudo rm -rf /usr/local/lib/ollama
```

### 4. Neue Version auspacken

Wie in Schritt 5 der Installation.

```bash
sudo tar --zstd -xf /tmp/ollama-linux-amd64.tar.zst -C /usr/local
```

### 5. Dienst starten

Startet die neue Version.

```bash
sudo systemctl start ollama
```

**Prüfen:** `ollama --version` zeigt die neue Versionsnummer, ohne Warnung.

## Deinstallieren

### 1. Dienst stoppen und Autostart ausschalten

Beendet Ollama und verhindert den Start beim Hochfahren.

```bash
sudo systemctl disable --now ollama
```

### 2. Dienstdatei löschen

Entfernt die Dienstdatei aus Schritt 7.

```bash
sudo rm /etc/systemd/system/ollama.service
```

### 3. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
sudo systemctl daemon-reload
```

### 4. Programm, Bibliotheken und Archiv löschen

Entfernt alles, was in Schritt 5 ausgepackt wurde, und das heruntergeladene Archiv.

```bash
sudo rm -rf /usr/local/bin/ollama /usr/local/lib/ollama /tmp/ollama-linux-amd64.tar.zst
```

### 5. Benutzer und Modelle löschen

`-r` löscht mit dem Benutzer auch seinen Ordner `/usr/share/ollama` samt allen heruntergeladenen Modellen. Die Warnung `Mail-Warteschlange … nicht gefunden` ist harmlos.

```bash
sudo userdel -r ollama
```

**Prüfen:** Der Befehl `ollama` wird nicht mehr gefunden, und unter Port 11434 antwortet nichts mehr.

```bash
curl -s http://localhost:11434/
```
