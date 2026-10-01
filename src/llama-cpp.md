# llama.cpp

llama.cpp führt Sprachmodelle im GGUF-Format direkt auf dem eigenen Rechner aus, auf dem Prozessor oder auf der Grafikkarte. Es bringt einen Chat im Terminal mit und einen Server mit einer Schnittstelle wie bei OpenAI und einer einfachen Chat-Seite im Browser. Viele bekannte Programme bauen intern darauf auf, darunter [Ollama](ollama.md).

## Vorbemerkungen

- **Unterschied zu Ollama:** Ollama verwaltet Modelle selbst und lädt sie nur bei Bedarf. llama.cpp ist schlanker und lässt sich genauer einstellen. Modelle lädt es direkt von Hugging Face, wo es zu fast jedem offenen Modell GGUF-Dateien in mehreren Stufen gibt.
- **Aus den Ubuntu-Paketquellen:** Ubuntu 26.04 liefert llama.cpp als Paket mit, samt systemd-Dienst für den Server.
- **Grafikkarte über Vulkan:** Eine Fassung für NVIDIAs CUDA gibt es in den Paketquellen nicht. Das Zusatzpaket für **Vulkan** nutzt aber Grafikkarten von NVIDIA, AMD und Intel. Bei NVIDIA muss dafür der proprietäre Treiber installiert sein. Ohne passende Grafikkarte rechnet llama.cpp auf dem Prozessor, nur langsamer.
- **Modell:** Die Anleitung verwendet Qwen3-4B-Instruct in der Stufe `Q4_K_M` (2,4 GB) aus dem Hugging-Face-Konto `unsloth`. Es ist dasselbe Modell, das in [Ollama](ollama.md) `qwen3:4b-instruct` heißt. Es steht unter der freien Lizenz Apache 2.0.
- **Speicher der Grafikkarte:** Der Server hält das Modell dauerhaft im Grafikspeicher, im Test knapp 5 GB auf einer GeForce GTX 1660 mit 6 GB. Laufen gleichzeitig Modelle in Ollama, reicht der Speicher nicht für beide, und eines davon wird langsamer.
- **Port:** Der Server lauscht normalerweise auf Port 8080. Diesen Port belegen oft schon andere Dienste, z. B. Apache aus der Anleitung [Tileserver](tileserver.md). Die Anleitung verwendet deshalb Port **8082**.
- **Version:** Getestet mit llama.cpp **8681** aus Ubuntu 26.04 auf einer GeForce GTX 1660.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. llama.cpp mit Vulkan-Unterstützung installieren

- `llama.cpp` – die Programme `llama-cli`, `llama-server`, `llama-bench` und weitere
- `libggml0-backend-vulkan` – das Zusatzpaket, mit dem llama.cpp auf der Grafikkarte rechnet. Ohne geeignete Grafikkarte kann es entfallen.

```bash
sudo apt install llama.cpp libggml0-backend-vulkan
```

**Prüfen:** Die letzte Zeile beginnt mit `version: 8681`.

```bash
llama-cli --version
```

### 3. Grafikkarte prüfen

Zeigt, welche Geräte llama.cpp zum Rechnen findet.

```bash
llama-server --list-devices
```

**Prüfen:** Unter `Available devices` steht die Grafikkarte, z. B. `Vulkan0: NVIDIA GeForce GTX 1660 (6390 MiB, 5725 MiB free)`. Ist die Liste leer, rechnet llama.cpp auf dem Prozessor.

## Erster Test im Terminal

### 4. Eine Frage stellen

`-hf` lädt das Modell von Hugging Face. Hinter dem Doppelpunkt steht die Stufe. Beim ersten Mal dauert das wegen des Downloads einige Minuten. Die Datei landet in `~/.cache/huggingface` und wird danach wiederverwendet. `-p` gibt die Frage vor, `-st` beendet das Programm nach der ersten Antwort.

```bash
llama-cli -hf unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M -p "Wie heißt die Landeshauptstadt von Schleswig-Holstein? Antworte mit einem Wort." -st
```

**Prüfen:** Unter der Frage steht `Kiel`. Darunter zeigt llama.cpp die Geschwindigkeit, im Test etwa `Generation: 17 t/s` (Wortteile pro Sekunde).

### 5. Im Terminal chatten

Ohne `-p` und `-st` startet ein Gespräch. Gib nach dem Zeichen `>` eine Frage ein und drücke <kbd>Enter</kbd>. Mit `/exit` oder <kbd>Strg</kbd>+<kbd>C</kbd> beendest du das Gespräch.

```bash
llama-cli -hf unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M
```

## Server als Dienst

Der Server stellt das Modell anderen Programmen zur Verfügung. Das Paket bringt dafür einen systemd-Dienst mit, der unter dem eigenen Systembenutzer `_llama-server` läuft. Er ist nach der Installation noch ausgeschaltet.

### 6. Einstellungen des Dienstes öffnen

Der Dienst liest seine Einstellungen aus dieser Datei. Sie enthält bisher nur auskommentierte Beispiele.

```bash
sudo nano /etc/default/llama-server
```

### 7. Modell und Port eintragen

Füge am Ende der Datei diese zwei Zeilen ein:

```ini
LLAMA_ARG_HF_REPO=unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M
LLAMA_ARG_PORT=8082
```

- **`LLAMA_ARG_HF_REPO`** – das Modell, das der Dienst beim Start lädt. Der Dienst lädt es in seinen eigenen Ordner `/var/cache/llama-server`. Die Datei aus Schritt 4 im Home-Ordner kann er nicht lesen, deshalb wird das Modell noch einmal heruntergeladen.
- **`LLAMA_ARG_PORT`** – der Port, hier 8082 statt 8080.
- Ohne weitere Angabe ist der Server nur vom eigenen Rechner aus erreichbar (`127.0.0.1`).

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Dienst starten und dauerhaft einschalten

`enable` startet den Server künftig bei jedem Hochfahren, `--now` startet ihn sofort.

```bash
sudo systemctl enable --now llama-server
```

### 9. Auf das Laden des Modells warten

Beim ersten Start lädt der Dienst das Modell herunter. Danach braucht er für den Start nur noch Sekunden. Der Befehl zeigt die Meldungen des Dienstes laufend an. Beende ihn mit <kbd>Strg</kbd>+<kbd>C</kbd>, sobald `server is listening on http://127.0.0.1:8082` erscheint.

```bash
journalctl -u llama-server -f
```

**Prüfen:** Die Antwort lautet `{"status":"ok"}`.

```bash
curl http://127.0.0.1:8082/health
```

### 10. Schnittstelle testen

Schickt eine Frage im Format der Schnittstelle von OpenAI an den Server. Programme und Bibliotheken, die OpenAI ansprechen, können llama.cpp genauso verwenden.

```bash
curl -s http://127.0.0.1:8082/v1/chat/completions -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Nenne drei Städte in Schleswig-Holstein, nur die Namen mit Komma getrennt."}]}'
```

**Prüfen:** Die Antwort ist ein JSON-Text. Hinter `"content"` stehen die Städte. Im Test kamen `Kiel, Lübeck, Schwerin` heraus. Schwerin liegt allerdings in Mecklenburg-Vorpommern: Ein kleines Modell formuliert flüssig, kennt Fakten aber nicht zuverlässig. Unter `"timings"` steht die Geschwindigkeit, im Test rund 34 Wortteile pro Sekunde.

### 11. Chat-Seite im Browser öffnen

Öffne im Browser diese Adresse:

```text
http://localhost:8082
```

Es erscheint eine schlichte Chat-Seite, über die du direkt mit dem Modell schreiben kannst. Ubuntu liefert sie statt der Oberfläche, die das llama.cpp-Projekt selbst mitbringt.

## Wie geht es weiter?

- **Mit Open WebUI verbinden:** In [Open WebUI](open-webui.md) trägt man im Admin-Bereich bei den Verbindungen eine OpenAI-Verbindung mit der Adresse `http://127.0.0.1:8082/v1` ein. Dann erscheint das Modell neben denen von Ollama.
- **Weitere Einstellungen:** `llama-server --help` listet alle Optionen. Jede lässt sich als `LLAMA_ARG_…` in `/etc/default/llama-server` setzen, z. B. `LLAMA_ARG_CTX_SIZE` für die Länge des Gesprächs, die das Modell im Blick behält.
- **Zugriff schützen:** Mit `LLAMA_API_KEY=…` in derselben Datei verlangt der Server einen Schlüssel. Für den Zugriff aus dem Netz schaltet man [nginx](nginx.md) mit HTTPS davor.
- **Geschwindigkeit messen:** `llama-bench -hf …` misst, wie schnell ein Modell auf dem Rechner läuft.
- **Dokumentation:** <https://github.com/ggml-org/llama.cpp>

## Deinstallieren

### 1. Dienst beenden und ausschalten

```bash
sudo systemctl disable --now llama-server
```

### 2. Pakete entfernen

`purge` löscht auch die Datei `/etc/default/llama-server`.

```bash
sudo apt purge llama.cpp llama.cpp-tools llama.cpp-tools-extra libggml0-backend-vulkan
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt Pakete, die nur für llama.cpp mitinstalliert wurden, z. B. `libllama0`, `libggml0` und `python3-gguf`. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

### 4. Modell und Daten des Dienstes löschen

Diese Ordner bleiben beim Entfernen der Pakete erhalten.

```bash
sudo rm -rf /var/cache/llama-server /var/lib/llama-server
```

### 5. Systembenutzer entfernen

Entfernt den Benutzer `_llama-server`, unter dem der Dienst lief.

```bash
sudo deluser --system _llama-server
```

### 6. Modell im Home-Ordner löschen

Löscht das Modell aus Schritt 4 der Installation. Andere Modelle von Hugging Face bleiben erhalten.

```bash
rm -rf ~/.cache/huggingface/hub/models--unsloth--Qwen3-4B-Instruct-2507-GGUF
```

**Prüfen:** Der Befehl `llama-cli` wird nicht mehr gefunden.

```bash
llama-cli --version
```
