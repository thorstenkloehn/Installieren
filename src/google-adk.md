# Google ADK

Das Agent Development Kit (ADK) von Google ist ein Python-Framework für KI-Agenten. Ein Agent ist ein Python-Paket mit einer Variablen `root_agent`. Das Befehlszeilenwerkzeug `adk` startet ihn im Terminal, als Weboberfläche zum Ausprobieren und Nachverfolgen oder als Schnittstelle für andere Programme. Mehrere Agenten lassen sich zu Teams und festen Abläufen verbinden.

## Vorbemerkungen

- **Nicht nur für Gemini:** ADK ist auf die Gemini-Modelle von Google ausgerichtet, bindet über die Bibliothek **LiteLLM** aber auch viele andere Anbieter an. Diese Anleitung verwendet ein lokales Modell über [Ollama](ollama.md). Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`. Es kann Werkzeuge aufrufen.
- **Installation über pip:** ADK ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine **virtuelle Umgebung** installiert. Zusammen mit LiteLLM belegt sie rund 370 MB, die Installation dauert etwa eine Minute.
- **Wo was landet:** Gesprächsverläufe speichert `adk run` in `.adk/session.db` im Ordner des Agenten, Protokolle in `/tmp/agents_log`.
- **Version:** Getestet mit google-adk **2.10.0** und LiteLLM 1.102 unter Python 3.14 aus Ubuntu 26.04.

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

In diesem Ordner liegen später die Agenten, jeder in einem eigenen Unterordner.

```bash
mkdir ~/agent-adk
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-adk
```

### 5. Virtuelle Umgebung anlegen

Legt eine eigene Python-Umgebung für dieses Projekt im Unterordner `.venv` an. Ubuntu verhindert absichtlich, dass `pip` Pakete systemweit installiert.

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung aktivieren

Danach verwenden `python`, `pip` und `adk` die Umgebung. Die Eingabezeile beginnt mit `(.venv)`. In jedem neuen Terminal muss die Umgebung erneut aktiviert werden.

```bash
source .venv/bin/activate
```

### 7. ADK und LiteLLM installieren

```bash
pip install google-adk litellm
```

**Prüfen:** Die Ausgabe nennt `Version: 2.10.0` oder eine neuere Version.

```bash
pip show google-adk
```

## Ersten Agenten anlegen

### 8. Ordner für den Agenten anlegen

Jeder Agent ist ein eigener Ordner. Sein Name ist zugleich der Name des Agenten beim Start.

```bash
mkdir erdkunde
```

### 9. Paketdatei anlegen

Die Datei `__init__.py` macht den Ordner zu einem Python-Paket. Die eine Zeile lädt beim Import die Datei `agent.py`, damit ADK den Agenten findet.

```bash
nano erdkunde/__init__.py
```

Füge diese Zeile ein:

```python
from . import agent
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Agenten schreiben

```bash
nano erdkunde/agent.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

HAUPTSTAEDTE = {
    "schleswig-holstein": "Kiel",
    "hamburg": "Hamburg",
    "niedersachsen": "Hannover",
    "bayern": "München",
}


def landeshauptstadt(bundesland: str) -> dict:
    """Liefert die Landeshauptstadt eines deutschen Bundeslands.

    Args:
        bundesland: Name des Bundeslands, z. B. Bayern.
    """
    print(f"  [Werkzeug] landeshauptstadt({bundesland!r})")
    stadt = HAUPTSTAEDTE.get(bundesland.lower())
    if stadt is None:
        return {"status": "fehler", "meldung": f"{bundesland} ist nicht bekannt"}
    return {"status": "ok", "hauptstadt": stadt}


# ADK sucht in diesem Paket nach einer Variablen namens root_agent
root_agent = Agent(
    name="erdkunde",
    # LiteLLM leitet die Anfragen an Ollama weiter
    model=LiteLlm(model="ollama_chat/qwen3:4b-instruct"),
    description="Beantwortet Fragen zu deutschen Bundesländern.",
    instruction="Du beantwortest Fragen zu deutschen Bundesländern kurz auf Deutsch. "
    "Nutze für Landeshauptstädte immer das Werkzeug landeshauptstadt.",
    tools=[landeshauptstadt],
)
```

- **Werkzeug:** In ADK ist jede normale Python-Funktion in `tools` ein Werkzeug, ein Decorator ist nicht nötig. Name, Typangaben und Docstring gehen als Beschreibung an das Modell. Google empfiehlt, ein Dictionary mit einem Feld `status` zurückzugeben, damit das Modell Erfolg und Fehler unterscheiden kann.
- **Modell:** `LiteLlm` mit dem Namen `ollama_chat/…` schickt die Anfragen an Ollama unter `http://localhost:11434`. Läuft Ollama auf einem anderen Rechner, setzt man die Umgebungsvariable `OLLAMA_API_BASE`. Für Gemini würde man stattdessen nur `model="gemini-…"` schreiben und einen Schlüssel von Google hinterlegen.
- **`description`** braucht ADK, wenn der Agent später Teil eines Teams ist: Andere Agenten entscheiden danach, ob sie ihm eine Aufgabe übergeben. **`instruction`** sind die Anweisungen an das Modell.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

## Starten und testen

### 11. Agenten im Terminal fragen

`adk run` lädt den Agenten aus dem Ordner `erdkunde`. Mit einer Frage dahinter beantwortet er nur diese und beendet sich.

```bash
adk run erdkunde "Was ist die Hauptstadt von Schleswig-Holstein und von Bayern?"
```

**Prüfen:** Nach einigen Sekunden lauten die letzten Zeilen:

```text
  [Werkzeug] landeshauptstadt('Schleswig-Holstein')
  [Werkzeug] landeshauptstadt('Bayern')
[erdkunde]: Die Hauptstadt von Schleswig-Holstein ist Kiel und die Hauptstadt von Bayern ist München.
```

Davor stehen mehrere Warnungen mit `[EXPERIMENTAL]` und Zeilen von LiteLLM. Sie weisen nur auf Funktionen hin, die sich noch ändern können. Ohne Frage am Ende startet `adk run erdkunde` ein Gespräch im Terminal, das du mit `exit` beendest.

### 12. Weboberfläche starten

`adk web` startet einen Server mit einer Oberfläche zum Ausprobieren aller Agenten im aktuellen Ordner. Das Terminal bleibt belegt.

```bash
adk web
```

**Prüfen:** Die Ausgabe enthält `Uvicorn running on http://127.0.0.1:8000`. Der Server ist nur vom eigenen Rechner aus erreichbar. Ist Port 8000 belegt, startet ihn `adk web --port 8001` auf einem anderen Port.

### 13. Agenten im Browser verwenden

Öffne <http://127.0.0.1:8000> im Browser. Wähle oben links den Agenten `erdkunde` und stelle unten im Eingabefeld eine Frage, z. B. `Was ist die Hauptstadt von Niedersachsen?`.

Links zeigt die Oberfläche jeden Schritt als Ereignis: den Aufruf des Werkzeugs `landeshauptstadt`, seine Antwort und die Antwort des Modells. Ein Klick auf ein Ereignis zeigt die Einzelheiten, z. B. die genaue Anfrage an das Modell. So lässt sich nachvollziehen, warum ein Agent etwas getan hat.

### 14. Server beenden

Wechsle in das Terminal mit `adk web` und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Teams:** Ein Agent mit `sub_agents=[…]` übergibt Aufgaben an spezialisierte Agenten. Feste Abläufe bauen `SequentialAgent` (nacheinander), `ParallelAgent` (gleichzeitig) und `LoopAgent` (wiederholt).
- **Schnittstelle:** `adk api_server` startet nur die HTTP-Schnittstelle ohne Oberfläche, damit andere Programme den Agenten aufrufen können.
- **Gemini:** Mit einem Schlüssel aus Google AI Studio (Umgebungsvariable `GOOGLE_API_KEY`) und `model="gemini-…"` verwendet der Agent die Modelle von Google. Je nach Nutzung ist das kostenpflichtig.
- **Dokumentation:** <https://google.github.io/adk-docs/>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung und gespeicherten Gesprächen.

```bash
rm -rf ~/agent-adk
```

### 3. Protokolle entfernen

Löscht die Protokolldateien von ADK.

```bash
rm -rf /tmp/agents_log
```

### 4. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
