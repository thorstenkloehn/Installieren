# Strands Agents

Strands Agents ist ein Python-Framework für KI-Agenten von Amazon Web Services (AWS). Es setzt darauf, dass das Sprachmodell selbst plant: Ein Agent besteht nur aus Modell, Systemanweisung und Werkzeugen, den Ablauf aus Nachdenken, Werkzeugaufrufen und Antworten steuert das Modell. Ein Agent wird wie eine Funktion aufgerufen und zeigt seine Antwort beim Entstehen im Terminal an.

## Vorbemerkungen

- **Nicht nur für AWS:** Ohne Angabe verwendet Strands die Modelle von Amazon Bedrock. Es bringt aber Anbindungen für Anthropic, OpenAI, Gemini, Mistral, LiteLLM und [Ollama](ollama.md) mit. Diese Anleitung verwendet ein lokales Modell über Ollama. Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`. Es kann Werkzeuge aufrufen.
- **Installation über pip:** Strands ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine **virtuelle Umgebung** installiert, samt der Ollama-Anbindung rund 115 MB. Die AWS-Bibliothek `boto3` kommt dabei immer mit, auch wenn man AWS nicht nutzt.
- **Version:** Getestet mit strands-agents **1.57.1** und der Python-Bibliothek ollama 0.6 unter Python 3.14 aus Ubuntu 26.04.

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

```bash
mkdir ~/agent-strands
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-strands
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

### 7. Strands mit Ollama-Anbindung installieren

`[ollama]` installiert zusätzlich die Bibliothek, mit der Strands Ollama anspricht. Die Anführungszeichen verhindern, dass die Shell die eckigen Klammern auswertet.

```bash
pip install "strands-agents[ollama]"
```

**Prüfen:** Die Ausgabe nennt `Version: 1.57.1` oder eine neuere Version.

```bash
pip show strands-agents
```

## Beispiel 1: Ein Agent mit Werkzeug

### 8. Programm anlegen

```bash
nano agent.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
from strands import Agent, tool
from strands.models.ollama import OllamaModel

HAUPTSTAEDTE = {
    "schleswig-holstein": "Kiel",
    "hamburg": "Hamburg",
    "niedersachsen": "Hannover",
    "bayern": "München",
}


@tool
def landeshauptstadt(bundesland: str) -> str:
    """Liefert die Landeshauptstadt eines deutschen Bundeslands.

    Args:
        bundesland: Name des Bundeslands, z. B. Bayern.
    """
    return HAUPTSTAEDTE.get(bundesland.lower(), "unbekannt")


# Lokales Modell über Ollama statt Amazon Bedrock
modell = OllamaModel(host="http://localhost:11434", model_id="qwen3:4b-instruct")

agent = Agent(
    model=modell,
    system_prompt="Du beantwortest Fragen zu deutschen Bundesländern kurz auf Deutsch. "
    "Nutze für Landeshauptstädte immer das Werkzeug landeshauptstadt.",
    tools=[landeshauptstadt],
)

agent("Was ist die Hauptstadt von Schleswig-Holstein und von Bayern?")
```

- **Werkzeug:** `@tool` macht aus der Funktion ein Werkzeug. Name, Typangaben und Docstring gehen als Beschreibung an das Modell.
- **Modell:** `OllamaModel` spricht Ollama direkt über dessen eigene Schnittstelle an. `model_id` ist der Modellname aus `ollama list`.
- **Aufruf:** Ein Agent wird aufgerufen wie eine Funktion: `agent("…")`. Strands zeigt dabei jeden Werkzeugaufruf und die Antwort beim Entstehen im Terminal an. Der Rückgabewert enthält die Antwort und Messwerte wie die verbrauchten Tokens.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Programm ausführen

```bash
python agent.py
```

**Prüfen:** Die Ausgabe lautet nach einigen Sekunden:

```text
Tool #1: landeshauptstadt

Tool #2: landeshauptstadt
Die Hauptstadt von Schleswig-Holstein ist Kiel und die Hauptstadt von Bayern ist München.
```

Strands führt die beiden Werkzeugaufrufe gleichzeitig aus. Die Antwort kann bei jedem Lauf etwas anders formuliert sein.

## Beispiel 2: Agenten als Werkzeug

### 10. Programm anlegen

Ein häufiges Muster in Strands: Ein Agent ist selbst ein Werkzeug eines anderen Agenten. Hier gibt ein „Chef“-Agent Übersetzungen an einen spezialisierten Übersetzer-Agenten weiter.

```bash
nano team.py
```

Füge diesen Inhalt ein:

```python
from strands import Agent, tool
from strands.models.ollama import OllamaModel

modell = OllamaModel(host="http://localhost:11434", model_id="qwen3:4b-instruct")


@tool
def uebersetzer(text: str, sprache: str) -> str:
    """Übersetzt einen Text in eine andere Sprache.

    Args:
        text: Der Text, der übersetzt werden soll.
        sprache: Zielsprache, z. B. Englisch oder Französisch.
    """
    # Ein eigener Agent nur für Übersetzungen, ohne Ausgabe im Terminal
    fachagent = Agent(
        model=modell,
        system_prompt="Du bist Übersetzer. Gib nur die Übersetzung aus, ohne Erklärung.",
        callback_handler=None,
    )
    return str(fachagent(f"Übersetze ins {sprache}: {text}"))


chef = Agent(
    model=modell,
    system_prompt="Du hilfst bei Texten. Für Übersetzungen nutzt du immer das Werkzeug uebersetzer, "
    "für jede Sprache einzeln. Fasse die Ergebnisse als Liste zusammen.",
    tools=[uebersetzer],
)

chef("Übersetze 'Guten Morgen, wie geht es dir?' ins Englische und ins Französische.")
```

- Der Übersetzer-Agent steckt in einem Werkzeug. Er hat seine eigene, einfache Systemanweisung, der Chef-Agent kennt nur die Beschreibung des Werkzeugs.
- `callback_handler=None` schaltet die Ausgabe des Übersetzers im Terminal ab. So erscheint nur die Antwort des Chefs.
- `str(…)` macht aus dem Ergebnis des Übersetzers seinen Antworttext.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Programm ausführen

```bash
python team.py
```

**Prüfen:** Die Ausgabe lautet z. B.:

```text
Tool #1: uebersetzer

Tool #2: uebersetzer
- Englisch: "Good morning, how are you?"
- Französisch: "Bonjour, comment allez-vous ?"
```

## Wie geht es weiter?

- **Fertige Werkzeuge:** Das Zusatzpaket `strands-agents-tools` bringt Werkzeuge mit, etwa zum Lesen und Schreiben von Dateien, für HTTP-Anfragen oder einen Taschenrechner. Werkzeuge, die Befehle ausführen oder Dateien ändern, fragen vorher nach.
- **Mehrere Agenten:** Neben „Agenten als Werkzeug“ kennt Strands Schwärme (Agenten übergeben sich gegenseitig Aufgaben) und Graphen (feste Abläufe).
- **MCP:** Über das Model Context Protocol bindet man fertige Werkzeug-Server an.
- **Amazon Bedrock:** Ohne `model=` verwendet Strands Claude über Amazon Bedrock. Dafür braucht es ein AWS-Konto mit Zugangsdaten, die Nutzung ist kostenpflichtig.
- **Dokumentation:** <https://strandsagents.com>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung.

```bash
rm -rf ~/agent-strands
```

### 3. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
