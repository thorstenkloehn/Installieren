# OpenAI Agents SDK

Das OpenAI Agents SDK ist eine schlanke Python-Bibliothek für KI-Agenten. Ein Agent besteht aus Anweisungen, einem Sprachmodell und Werkzeugen (normalen Python-Funktionen). Mehrere Agenten können sich Aufgaben übergeben (**Handoffs**). Den Ablauf – Modell fragen, Werkzeug ausführen, Ergebnis zurückgeben, bis eine Antwort feststeht – übernimmt das SDK.

## Vorbemerkungen

- **Nicht nur für OpenAI:** Das SDK stammt von OpenAI, arbeitet aber mit jedem Dienst, der die Chat-Schnittstelle von OpenAI anbietet. Diese Anleitung verwendet ein lokales Modell über [Ollama](ollama.md). Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`. Es kann Werkzeuge aufrufen.
- **Installation über pip:** Das SDK ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine **virtuelle Umgebung** installiert, einen eigenen Ordner nur für dieses Projekt (rund 100 MB).
- **Tracing abschalten:** Das SDK zeichnet jeden Lauf auf und sendet diese „Traces“ ab Werk an OpenAI, um sie dort im Dashboard anzuzeigen. Die Beispiele schalten das mit `set_tracing_disabled(True)` ab.
- **Version:** Getestet mit openai-agents **0.22.3** und openai 3.19 unter Python 3.14 aus Ubuntu 26.04.

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
mkdir ~/agent-openai
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-openai
```

### 5. Virtuelle Umgebung anlegen

Legt die Umgebung im Unterordner `.venv` an.

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung aktivieren

Danach verwenden `python` und `pip` die Umgebung. Die Eingabezeile beginnt mit `(.venv)`. In jedem neuen Terminal muss die Umgebung erneut aktiviert werden.

```bash
source .venv/bin/activate
```

### 7. SDK installieren

Installiert das SDK samt der Bibliothek `openai`, mit der es Modelle anspricht.

```bash
pip install openai-agents
```

**Prüfen:** Die Ausgabe nennt `Version: 0.22.3` oder eine neuere Version.

```bash
pip show openai-agents
```

## Beispiel 1: Ein Agent mit Werkzeug

### 8. Programm anlegen

```bash
nano agent.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
from openai import AsyncOpenAI
from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled

# Keine Ablaufdaten (Traces) an OpenAI senden
set_tracing_disabled(True)

# Ollama spricht dieselbe Schnittstelle wie OpenAI
ollama = AsyncOpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
modell = OpenAIChatCompletionsModel(model="qwen3:4b-instruct", openai_client=ollama)

HAUPTSTAEDTE = {
    "schleswig-holstein": "Kiel",
    "hamburg": "Hamburg",
    "niedersachsen": "Hannover",
    "bayern": "München",
}


@function_tool
def landeshauptstadt(bundesland: str) -> str:
    """Liefert die Landeshauptstadt eines deutschen Bundeslands.

    Args:
        bundesland: Name des Bundeslands, z. B. Bayern.
    """
    print(f"  [Werkzeug] landeshauptstadt({bundesland!r})")
    return HAUPTSTAEDTE.get(bundesland.lower(), "unbekannt")


agent = Agent(
    name="Erdkunde",
    instructions="Du beantwortest Fragen zu deutschen Bundesländern kurz auf Deutsch. "
    "Nutze für Landeshauptstädte immer das Werkzeug landeshauptstadt.",
    model=modell,
    tools=[landeshauptstadt],
)

ergebnis = Runner.run_sync(agent, "Was ist die Hauptstadt von Schleswig-Holstein und von Bayern?")
print(ergebnis.final_output)
```

- **Modell:** `AsyncOpenAI` ist der Client der OpenAI-Bibliothek. Mit `base_url` zeigt er auf Ollama. Ollama prüft den Schlüssel nicht, die Bibliothek verlangt aber einen, deshalb `api_key="ollama"`. `OpenAIChatCompletionsModel` verbindet den Client mit dem Modellnamen.
- **Werkzeug:** `@function_tool` macht aus einer Python-Funktion ein Werkzeug. Name, Typangaben und Docstring (die Beschreibung in `"""…"""`) schickt das SDK dem Modell als Beschreibung. Das Modell entscheidet selbst, wann es das Werkzeug aufruft und mit welchem Wert. Die Zeile mit `print` zeigt im Terminal, wann das geschieht.
- **Agent:** `instructions` sind die Anweisungen an das Modell, `tools` die Liste der Werkzeuge.
- **Runner:** `Runner.run_sync` startet den Ablauf und wartet auf das Ergebnis. `final_output` ist die fertige Antwort.

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

Das Modell hat die Frage zerlegt und das Werkzeug zweimal aufgerufen. Die Antwort kann bei jedem Lauf etwas anders formuliert sein.

## Beispiel 2: Zwei Agenten mit Übergabe

### 10. Programm anlegen

Ein Empfangs-Agent nimmt Fragen an und übergibt Fragen zum Lager an einen zweiten Agenten, der als einziger das Werkzeug `lagerbestand` hat.

```bash
nano team.py
```

Füge diesen Inhalt ein:

```python
from openai import AsyncOpenAI
from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, handoff, set_tracing_disabled
from agents.extensions import handoff_filters

set_tracing_disabled(True)
ollama = AsyncOpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
modell = OpenAIChatCompletionsModel(model="qwen3:4b-instruct", openai_client=ollama)

LAGER = {"fahrrad": 3, "helm": 0, "luftpumpe": 12}


@function_tool
def lagerbestand(artikel: str) -> str:
    """Liefert, wie viele Stück eines Artikels auf Lager sind.

    Args:
        artikel: Name des Artikels, z. B. Helm.
    """
    print(f"  [Werkzeug] lagerbestand({artikel!r})")
    anzahl = LAGER.get(artikel.lower())
    return "Artikel unbekannt" if anzahl is None else f"{anzahl} Stück"


lager = Agent(
    name="Lager",
    handoff_description="Beantwortet Fragen zum Lagerbestand von Artikeln.",
    instructions="Frage den Bestand immer mit dem Werkzeug lagerbestand ab. Antworte kurz auf Deutsch.",
    model=modell,
    tools=[lagerbestand],
)

empfang = Agent(
    name="Empfang",
    instructions="Du nimmst Fragen entgegen. Fragen zum Lagerbestand gibst du an das Lager weiter.",
    model=modell,
    # Beim Übergeben die bisherigen Werkzeugaufrufe aus dem Verlauf entfernen
    handoffs=[handoff(lager, input_filter=handoff_filters.remove_all_tools)],
)

ergebnis = Runner.run_sync(empfang, "Habt ihr noch Helme und Luftpumpen auf Lager?")
print("Geantwortet hat:", ergebnis.last_agent.name)
print(ergebnis.final_output)
```

- **`handoffs`** – die Agenten, an die `empfang` abgeben darf. Für das Modell sieht eine Übergabe aus wie ein Werkzeug namens `transfer_to_lager`. `handoff_description` erklärt ihm, wofür der andere Agent zuständig ist.
- **`input_filter`** – bestimmt, welchen Gesprächsverlauf der übernehmende Agent sieht. `remove_all_tools` entfernt dabei alle bisherigen Werkzeugaufrufe, auch den der Übergabe. Im Test war das mit dem kleinen lokalen Modell nötig: Ohne Filter antwortete der Lager-Agent nach der Übergabe ohne Werkzeug und behauptete, Helme seien vorrätig.
- **`last_agent`** – der Agent, der die letzte Antwort gegeben hat.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Programm ausführen

```bash
python team.py
```

**Prüfen:** Die Ausgabe lautet z. B.:

```text
  [Werkzeug] lagerbestand('Helm')
  [Werkzeug] lagerbestand('Luftpumpe')
Geantwortet hat: Lager
Helm: 0 Stück auf Lager. Luftpumpe: 12 Stück auf Lager.
```

## Hinweise zu kleinen lokalen Modellen

- **Werkzeuge werden manchmal übergangen:** In einem Test sollte ein Agent 19 % Mehrwertsteuer mit einem Werkzeug berechnen. `qwen3:4b-instruct` rechnete lieber selbst, zum Glück richtig. Werkzeuge werden zuverlässiger genutzt, wenn sie Wissen liefern, das das Modell nicht haben kann, wie hier Lagerbestand oder eine Tabelle.
- **`tool_choice` wirkt nicht:** Die Einstellung `ModelSettings(tool_choice="required")`, die einen Werkzeugaufruf erzwingen soll, hat Ollama im Test nicht beachtet.
- **Größere Modelle:** Mit größeren Modellen in Ollama oder mit einem OpenAI-Modell (`model="gpt-…"` und Umgebungsvariable `OPENAI_API_KEY`, kostenpflichtig) arbeiten Agenten deutlich verlässlicher.

## Wie geht es weiter?

- **Guardrails:** Prüffunktionen, die Eingaben oder Ausgaben eines Agenten kontrollieren und den Lauf bei Bedarf abbrechen, etwa bei Fragen, die nicht zum Thema gehören.
- **Sitzungen:** Mit `SQLiteSession` merkt sich ein Agent den Gesprächsverlauf über mehrere Aufrufe hinweg.
- **Streaming:** `Runner.run_streamed` liefert die Antwort Stück für Stück, während das Modell sie erzeugt.
- **MCP:** Über das Model Context Protocol bindet man fertige Werkzeug-Server an, etwa für Dateisysteme oder Datenbanken.
- **Dokumentation:** <https://openai.github.io/openai-agents-python/>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung.

```bash
rm -rf ~/agent-openai
```

### 3. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
