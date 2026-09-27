# Microsoft Agent Framework

Das Microsoft Agent Framework ist Microsofts Bibliothek für KI-Agenten in Python und .NET. Es führt die beiden früheren Projekte Semantic Kernel und AutoGen zusammen. Ein Agent verbindet einen Chat-Client mit Anweisungen und Werkzeugen. Sitzungen halten Gespräche über mehrere Runden fest, und **Workflows** verbinden mehrere Agenten und Programmschritte zu festen Abläufen.

## Vorbemerkungen

- **Nicht nur für Azure:** Das Framework ist auf Azure OpenAI und Microsoft Foundry ausgerichtet, spricht aber jeden Dienst mit der Chat-Schnittstelle von OpenAI an. Diese Anleitung verwendet ein lokales Modell über [Ollama](ollama.md). Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`. Es kann Werkzeuge aufrufen.
- **Einzelne Pakete:** Das Sammelpaket `agent-framework` installiert die Anbindungen an alle Dienste. Diese Anleitung nimmt nur den Kern `agent-framework-core` und die OpenAI-Anbindung `agent-framework-openai`, zusammen rund 70 MB. Eine eigene Ollama-Anbindung gibt es auch, sie ist aber noch als Beta gekennzeichnet.
- **Asynchron:** Die Beispiele verwenden `async` und `await`, weil `agent.run` auf die Antwort des Modells wartet, ohne das Programm zu blockieren. `asyncio.run(main())` startet die Funktion `main`.
- **Version:** Getestet mit agent-framework-core **1.19.0** und agent-framework-openai 1.14.4 unter Python 3.14 aus Ubuntu 26.04.

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
mkdir ~/agent-ms
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-ms
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

### 7. Framework installieren

```bash
pip install agent-framework-core agent-framework-openai
```

**Prüfen:** Die Ausgabe nennt `Version: 1.19.0` oder eine neuere Version.

```bash
pip show agent-framework-core
```

## Beispiel 1: Ein Agent mit Werkzeug

### 8. Programm anlegen

```bash
nano agent.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
import asyncio
from typing import Annotated

from agent_framework import Agent, tool
from agent_framework.openai import OpenAIChatCompletionClient

HAUPTSTAEDTE = {
    "schleswig-holstein": "Kiel",
    "hamburg": "Hamburg",
    "niedersachsen": "Hannover",
    "bayern": "München",
}


@tool
def landeshauptstadt(
    bundesland: Annotated[str, "Name des Bundeslands, z. B. Bayern"],
) -> str:
    """Liefert die Landeshauptstadt eines deutschen Bundeslands."""
    print(f"  [Werkzeug] landeshauptstadt({bundesland!r})")
    return HAUPTSTAEDTE.get(bundesland.lower(), "unbekannt")


async def main():
    # Ollama über die OpenAI-kompatible Chat-Schnittstelle
    client = OpenAIChatCompletionClient(
        model="qwen3:4b-instruct",
        base_url="http://localhost:11434/v1",
        api_key="ollama",
    )
    agent = Agent(
        client,
        instructions="Du beantwortest Fragen zu deutschen Bundesländern kurz auf Deutsch. "
        "Nutze für Landeshauptstädte immer das Werkzeug landeshauptstadt.",
        name="Erdkunde",
        tools=[landeshauptstadt],
    )
    antwort = await agent.run("Was ist die Hauptstadt von Schleswig-Holstein und von Bayern?")
    print(antwort.text)


asyncio.run(main())
```

- **Client:** `OpenAIChatCompletionClient` spricht die klassische Chat-Schnittstelle von OpenAI (`/v1/chat/completions`), die auch Ollama anbietet. `base_url` zeigt auf Ollama. Ollama prüft den Schlüssel nicht, der Client verlangt aber einen. Das Framework hat noch einen zweiten Client `OpenAIChatClient`, der die neuere „Responses“-Schnittstelle von OpenAI verwendet.
- **Werkzeug:** `@tool` macht aus der Funktion ein Werkzeug. `Annotated[str, "…"]` hängt an den Parameter eine Beschreibung, die das Modell zusammen mit dem Docstring bekommt.
- **Agent:** Er verbindet Client, Anweisungen und Werkzeuge. `agent.run` schickt die Frage, führt die gewünschten Werkzeuge aus und liefert die fertige Antwort, `antwort.text` ist ihr Text.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Programm ausführen

```bash
python agent.py
```

**Prüfen:** Die Ausgabe lautet nach einigen Sekunden:

```text
  [Werkzeug] landeshauptstadt('Schleswig-Holstein')
  [Werkzeug] landeshauptstadt('Bayern')
Die Hauptstadt von Schleswig-Holstein ist Kiel und die Hauptstadt von Bayern ist München.
```

Die Antwort kann bei jedem Lauf etwas anders formuliert sein.

## Beispiel 2: Gespräch mit Gedächtnis

### 10. Programm anlegen

Ein Agent vergisst ohne Weiteres alles nach jeder Antwort. Eine **Sitzung** hält den Verlauf fest und schickt ihn bei jeder neuen Frage mit.

```bash
nano gespraech.py
```

Füge diesen Inhalt ein:

```python
import asyncio

from agent_framework import Agent
from agent_framework.openai import OpenAIChatCompletionClient


async def main():
    client = OpenAIChatCompletionClient(
        model="qwen3:4b-instruct",
        base_url="http://localhost:11434/v1",
        api_key="ollama",
    )
    agent = Agent(client, instructions="Du bist ein freundlicher Assistent. Antworte kurz auf Deutsch.")

    # Eine Sitzung hält den Gesprächsverlauf fest
    sitzung = agent.create_session()

    for frage in [
        "Ich heiße Thorsten und wohne in Ahrensburg.",
        "In welchem Bundesland liegt mein Wohnort?",
        "Wie heiße ich?",
    ]:
        antwort = await agent.run(frage, session=sitzung)
        print(f"> {frage}\n{antwort.text}\n")

    # Ohne Sitzung kennt der Agent den Verlauf nicht
    antwort = await agent.run("Wie heiße ich?")
    print(f"> Wie heiße ich? (ohne Sitzung)\n{antwort.text}")


asyncio.run(main())
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Programm ausführen

```bash
python gespraech.py
```

**Prüfen:** Mit Sitzung nennt der Agent auf die zweite Frage Schleswig-Holstein und auf die dritte den Namen Thorsten. Ohne Sitzung antwortet er, dass er den Namen nicht kennt. Die genaue Formulierung wechselt. Kleine Modelle wie `qwen3:4b-instruct` machen dabei auch Grammatikfehler und hängen gern Emojis an.

## Wie geht es weiter?

- **Sitzungen speichern:** `FileSessionStore` legt Sitzungen in Dateien ab, damit ein Gespräch nach einem Neustart des Programms weitergeht.
- **Workflows:** Mit `WorkflowBuilder` verbindet man Agenten und eigene Funktionen zu einem Graphen, etwa „Entwurf schreiben → prüfen → überarbeiten“. Zwischenstände lassen sich speichern, und ein Mensch kann an festgelegten Stellen freigeben.
- **Middleware:** Eigene Funktionen können jeden Werkzeugaufruf oder jede Anfrage an das Modell vorher prüfen oder protokollieren.
- **Andere Modelle:** Für OpenAI genügt `OpenAIChatClient(model="gpt-…")` mit der Umgebungsvariable `OPENAI_API_KEY`, für Azure OpenAI gibt es eigene Clients. Beides ist kostenpflichtig.
- **Dokumentation:** <https://learn.microsoft.com/agent-framework/>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung.

```bash
rm -rf ~/agent-ms
```

### 3. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
