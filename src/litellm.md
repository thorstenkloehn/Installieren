# LiteLLM

LiteLLM bündelt viele Anbieter von Sprachmodellen hinter einer einheitlichen Schnittstelle im Format von OpenAI. Als Python-Bibliothek ruft man damit Ollama, OpenAI, Anthropic und rund hundert weitere Dienste mit demselben Befehl auf. Als **Proxy-Server** steht LiteLLM zwischen den eigenen Programmen und den Modellen, verteilt Anfragen, springt bei Ausfällen auf ein anderes Modell um und verlangt einen Schlüssel.

## Vorbemerkungen

- **Wofür ein Proxy?** Programme müssen dann nur eine Adresse und einen Schlüssel kennen. Welches Modell dahinter antwortet, ob [Ollama](ollama.md), [llama.cpp](llama-cpp.md) oder ein Cloud-Anbieter, legt eine Konfigurationsdatei fest. Ändert man sie, merken die Programme davon nichts.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`. Die Anleitung bindet zusätzlich [llama.cpp](llama-cpp.md) auf Port 8082 ein. Läuft es nicht, zeigt das Beispiel, wie LiteLLM auf Ollama ausweicht.
- **Ohne Datenbank:** Der Proxy kann Benutzer, eigene Schlüssel und Kosten in einer PostgreSQL-Datenbank verwalten und bietet dann auch eine Weboberfläche. Diese Anleitung kommt ohne Datenbank aus und schützt den Proxy mit einem einzigen Hauptschlüssel.
- **Preisliste:** Beim Start lädt LiteLLM normalerweise eine aktuelle Preisliste der Cloud-Anbieter von GitHub. Für lokale Modelle ist sie unnötig. Die Anleitung schaltet das mit `LITELLM_LOCAL_MODEL_COST_MAP=True` ab, LiteLLM verwendet dann die mitgelieferte Liste.
- **Port:** Der Proxy lauscht auf Port 4000 und nur für den eigenen Rechner.
- **Installation über pip:** LiteLLM ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine **virtuelle Umgebung** installiert, rund 700 MB.
- **Version:** Getestet mit litellm **1.103.2** unter Python 3.14 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Unterstützung für virtuelle Umgebungen installieren

Ist das Paket schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install python3-venv
```

### 3. Projektordner anlegen

Hier liegen das Programm und seine Konfiguration.

```bash
mkdir ~/litellm
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/litellm
```

### 5. Virtuelle Umgebung anlegen

Legt eine eigene Python-Umgebung für dieses Projekt im Unterordner `.venv` an. Ubuntu verhindert absichtlich, dass `pip` Pakete systemweit installiert.

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung aktivieren

Danach verwenden `python` und `pip` die Umgebung. Die Eingabezeile beginnt mit `(.venv)`. In jedem neuen Terminal muss die Umgebung erneut aktiviert werden.

```bash
source .venv/bin/activate
```

### 7. LiteLLM installieren

- `litellm[proxy]` – die Bibliothek samt Proxy-Server und Befehl `litellm`
- `prisma` – eigentlich für die Datenbank gedacht. Ohne dieses Paket beantwortet der Proxy Anfragen ohne Schlüssel mit einem internen Fehler statt mit einer klaren Ablehnung.

```bash
pip install "litellm[proxy]" prisma
```

**Prüfen:** Die Ausgabe nennt `Version: 1.103.2` oder eine neuere Version.

```bash
pip show litellm
```

## Beispiel 1: LiteLLM als Bibliothek

### 8. Programm anlegen

Das Programm stellt eine Frage an Ollama. Für einen anderen Anbieter ändert man nur die Angabe `model`, der Rest bleibt gleich.

```bash
nano erste.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
import os

# Mitgelieferte Preisliste verwenden statt sie von GitHub zu laden
os.environ["LITELLM_LOCAL_MODEL_COST_MAP"] = "True"

from litellm import completion

antwort = completion(
    model="ollama_chat/qwen3:4b-instruct",
    api_base="http://localhost:11434",
    messages=[
        {"role": "user", "content": "Wie heißt die Landeshauptstadt von Schleswig-Holstein? Antworte mit einem Wort."}
    ],
)
print(antwort.choices[0].message.content)
print(antwort.usage)
```

- **`model`** – vor dem Schrägstrich steht der Anbieter, dahinter das Modell. `ollama_chat/` spricht die Chat-Schnittstelle von Ollama an. Für einen Cloud-Anbieter stünde dort z. B. `anthropic/…`, und der Schlüssel käme aus einer Umgebungsvariablen.
- **Antwort** – hat bei jedem Anbieter denselben Aufbau wie bei OpenAI. `usage` zählt die verbrauchten Wortteile (Token).

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Programm ausführen

```bash
python erste.py
```

**Prüfen:** Die Ausgabe lautet `Kiel`, darunter eine Zeile, die mit `Usage(completion_tokens=` beginnt.

## Beispiel 2: Der Proxy-Server

### 10. Hauptschlüssel erzeugen

Erzeugt einen zufälligen Schlüssel, der mit `sk-` beginnt. Mit ihm melden sich später alle Programme beim Proxy an. Kopiere die Ausgabe für den nächsten Schritt.

```bash
echo "sk-$(openssl rand -hex 16)"
```

### 11. Konfiguration anlegen

```bash
nano config.yaml
```

Füge diesen Inhalt ein und ersetze `sk-HIER-DEIN-SCHLUESSEL` durch den Schlüssel aus Schritt 10:

```yaml
model_list:
  - model_name: lokal
    litellm_params:
      model: ollama_chat/qwen3:4b-instruct
      api_base: http://localhost:11434
  - model_name: llamacpp
    litellm_params:
      model: openai/qwen3-4b
      api_base: http://localhost:8082/v1
      api_key: kein-schluessel

router_settings:
  fallbacks:
    - llamacpp: ["lokal"]

general_settings:
  master_key: sk-HIER-DEIN-SCHLUESSEL
```

- **`model_list`** – die Modelle, die der Proxy anbietet. `model_name` ist der Name, unter dem Programme das Modell anfragen. `litellm_params` sagt, wohin die Anfrage wirklich geht.
- **`lokal`** – leitet an Ollama weiter.
- **`llamacpp`** – leitet an den Server aus der Anleitung [llama.cpp](llama-cpp.md) weiter. `openai/` bedeutet: ein Dienst mit der Schnittstelle von OpenAI. Der Modellname dahinter ist bei llama.cpp beliebig, weil der Server nur ein Modell hat. `api_key` muss gesetzt sein, llama.cpp prüft ihn aber nicht.
- **`fallbacks`** – antwortet `llamacpp` nicht, übernimmt `lokal` die Anfrage.
- **`master_key`** – nur Anfragen mit diesem Schlüssel werden angenommen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Proxy als Benutzerdienst einrichten

Der Proxy soll im Hintergrund laufen und bei jeder Anmeldung starten. Dafür bekommt er einen systemd-Dienst des eigenen Benutzers. `-p` legt den Ordner an, falls es ihn noch nicht gibt.

```bash
mkdir -p ~/.config/systemd/user
```

### 13. Dienstdatei anlegen

```bash
nano ~/.config/systemd/user/litellm.service
```

Füge diesen Inhalt ein:

```ini
[Unit]
Description=LiteLLM Proxy
After=network-online.target

[Service]
WorkingDirectory=%h/litellm
Environment=LITELLM_LOCAL_MODEL_COST_MAP=True
ExecStart=%h/litellm/.venv/bin/litellm --config %h/litellm/config.yaml --host 127.0.0.1 --port 4000
Restart=on-failure

[Install]
WantedBy=default.target
```

- **`%h`** – setzt systemd durch den Home-Ordner ersetzt, z. B. `/home/thorsten`.
- **`--host 127.0.0.1 --port 4000`** – nur der eigene Rechner erreicht den Proxy, und zwar auf Port 4000.
- **`Restart=on-failure`** – startet den Proxy nach einem Absturz neu.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. systemd die neue Datei bekannt machen

`--user` steht für die Dienste des eigenen Benutzers, deshalb ohne `sudo`.

```bash
systemctl --user daemon-reload
```

### 15. Dienst starten und dauerhaft einschalten

```bash
systemctl --user enable --now litellm
```

**Prüfen:** Nach einigen Sekunden lautet die Antwort `"I'm alive!"`.

```bash
curl http://127.0.0.1:4000/health/liveliness
```

### 16. Schlüssel in einer Variablen ablegen

Damit du den Schlüssel in den nächsten Befehlen nicht jedes Mal einfügen musst. Ersetze `sk-HIER-DEIN-SCHLUESSEL` wieder durch deinen Schlüssel. Die Variable gilt nur in diesem Terminal.

```bash
export LITELLM_KEY=sk-HIER-DEIN-SCHLUESSEL
```

### 17. Erreichbarkeit der Modelle prüfen

Der Proxy schickt an jedes Modell eine kurze Testanfrage.

```bash
curl -s http://127.0.0.1:4000/health -H "Authorization: Bearer $LITELLM_KEY"
```

**Prüfen:** `"healthy_count":1` zählt die erreichbaren Modelle, `"unhealthy_count":1` die nicht erreichbaren. Läuft llama.cpp nicht, steht es bei den nicht erreichbaren. Läuft es, stehen beide Modelle bei den erreichbaren.

### 18. Ohne Schlüssel anfragen

Prüft, dass der Proxy Anfragen ohne Schlüssel ablehnt.

```bash
curl -s http://127.0.0.1:4000/v1/models
```

**Prüfen:** Die Antwort enthält `Authentication Error, No api key passed in.` und `"code":"401"`.

## Beispiel 3: Programme mit dem Proxy verbinden

### 19. Programm anlegen

Das Programm verwendet das offizielle Paket `openai`, das mit LiteLLM schon installiert wurde. Es weiß nicht, dass dahinter Ollama und llama.cpp stehen. So lassen sich alle Programme und Bibliotheken anbinden, die eine Adresse für OpenAI-kompatible Dienste erlauben.

```bash
nano frage.py
```

Füge diesen Inhalt ein:

```python
import os

from openai import OpenAI

client = OpenAI(base_url="http://127.0.0.1:4000", api_key=os.environ["LITELLM_KEY"])

for modell in ["lokal", "llamacpp"]:
    antwort = client.chat.completions.create(
        model=modell,
        messages=[
            {"role": "user", "content": "Wie heißt die Landeshauptstadt von Schleswig-Holstein? Antworte mit einem Wort."}
        ],
    )
    print(f"{modell:9} -> {antwort.choices[0].message.content}  (beantwortet von: {antwort.model})")
```

- **`base_url`** – zeigt auf den Proxy statt auf OpenAI.
- **`api_key`** – der Hauptschlüssel aus der Variablen von Schritt 16.
- **`antwort.model`** – verrät, welches Modell tatsächlich geantwortet hat.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 20. Programm ausführen

Im selben Terminal wie Schritt 16, damit die Variable gesetzt ist.

```bash
python frage.py
```

**Prüfen:** Läuft llama.cpp nicht, lautet die Ausgabe:

```text
lokal     -> Kiel  (beantwortet von: lokal)
llamacpp  -> Kiel  (beantwortet von: ollama_chat/qwen3:4b-instruct)
```

Die Anfrage an `llamacpp` ist gescheitert, und LiteLLM hat sie an Ollama weitergereicht. Das Programm hat trotzdem eine Antwort bekommen.

## Wie geht es weiter?

- **Cloud-Anbieter:** Ein Eintrag wie `model: anthropic/…` mit `api_key: os.environ/ANTHROPIC_API_KEY` holt den Schlüssel aus einer Umgebungsvariablen statt ihn in die Datei zu schreiben. Die Variable trägt man dann mit `Environment=` in die Dienstdatei ein.
- **Lastverteilung:** Mehrere Einträge mit demselben `model_name` verteilt LiteLLM abwechselnd. So teilen sich etwa zwei Rechner mit Ollama die Arbeit.
- **Eigene Schlüssel und Kosten:** Mit einer [PostgreSQL](postgresql.md)-Datenbank (`database_url` unter `general_settings`) vergibt der Proxy eigene Schlüssel mit Budget pro Benutzer und bietet eine Weboberfläche unter `/ui`.
- **Andere Programme anbinden:** [Open WebUI](open-webui.md) und Frameworks wie das [OpenAI Agents SDK](openai-agents.md) sprechen den Proxy über eine OpenAI-Verbindung mit der Adresse `http://127.0.0.1:4000` an.
- **Dokumentation:** <https://docs.litellm.ai>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Dienst beenden und ausschalten

```bash
systemctl --user disable --now litellm
```

### 3. Dienstdatei löschen

```bash
rm ~/.config/systemd/user/litellm.service
```

### 4. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
systemctl --user daemon-reload
```

### 5. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung und Konfiguration.

```bash
rm -rf ~/litellm
```

### 6. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
