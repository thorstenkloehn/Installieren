# Pydantic AI

Pydantic AI ist eine Python-Bibliothek für KI-Agenten von den Entwicklern von Pydantic, der verbreiteten Bibliothek zum Prüfen von Daten. Ihre Stärke sind **strukturierte Ergebnisse**: Statt freiem Text liefert ein Agent auf Wunsch ein fertiges, geprüftes Python-Objekt mit festen Feldern und Typen. Werkzeuge sind normale Python-Funktionen, deren Typangaben Pydantic AI dem Modell als Beschreibung mitgibt.

## Vorbemerkungen

- **Viele Anbieter:** Pydantic AI spricht OpenAI, Anthropic, Google, Mistral, Groq und andere an und hat eine eigene Anbindung für [Ollama](ollama.md). Diese Anleitung verwendet ein lokales Modell über Ollama. Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`. Es kann Werkzeuge aufrufen.
- **Schlanke Installation:** Das Paket `pydantic-ai` installiert die Anbindungen an alle Anbieter. `pydantic-ai-slim[openai]` bringt nur den Kern und die OpenAI-kompatible Schnittstelle mit, über die auch Ollama läuft (rund 90 MB statt deutlich mehr).
- **Werbe-Banner:** Beim Start zeigt Pydantic AI ein großes Banner für den eigenen Beobachtungsdienst Logfire. Schritt 8 schaltet es ab. Daten werden dabei nicht gesendet, das Banner meldet ausdrücklich `observability: off`.
- **Version:** Getestet mit pydantic-ai-slim **2.51.0** und Pydantic 2.13 unter Python 3.14 aus Ubuntu 26.04.

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
mkdir ~/agent-pydantic
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-pydantic
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

### 7. Pydantic AI installieren

Die Anführungszeichen verhindern, dass die Shell die eckigen Klammern auswertet.

```bash
pip install "pydantic-ai-slim[openai]"
```

**Prüfen:** Die Ausgabe nennt `Version: 2.51.0` oder eine neuere Version.

```bash
pip show pydantic-ai-slim
```

### 8. Banner abschalten (optional)

Setzt die Umgebungsvariable, die das Banner beim Start abschaltet. Sie gilt für dieses Terminal.

```bash
export PYDANTIC_AI_NO_BANNER=1
```

## Beispiel 1: Ein Agent mit Werkzeug

### 9. Programm anlegen

```bash
nano agent.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.ollama import OllamaProvider

# Lokales Modell über Ollama
modell = OpenAIChatModel(
    "qwen3:4b-instruct",
    provider=OllamaProvider(base_url="http://localhost:11434/v1"),
)

agent = Agent(
    modell,
    instructions="Du beantwortest Fragen zu deutschen Bundesländern kurz auf Deutsch. "
    "Nutze für Landeshauptstädte immer das Werkzeug landeshauptstadt.",
)

HAUPTSTAEDTE = {
    "schleswig-holstein": "Kiel",
    "hamburg": "Hamburg",
    "niedersachsen": "Hannover",
    "bayern": "München",
}


@agent.tool_plain
def landeshauptstadt(bundesland: str) -> str:
    """Liefert die Landeshauptstadt eines deutschen Bundeslands.

    Args:
        bundesland: Name des Bundeslands, z. B. Bayern.
    """
    print(f"  [Werkzeug] landeshauptstadt({bundesland!r})")
    return HAUPTSTAEDTE.get(bundesland.lower(), "unbekannt")


ergebnis = agent.run_sync("Was ist die Hauptstadt von Schleswig-Holstein und von Bayern?")
print(ergebnis.output)
```

- **Modell:** `OpenAIChatModel` spricht die Chat-Schnittstelle von OpenAI. `OllamaProvider` richtet sie auf Ollama aus, einen Schlüssel braucht es dafür nicht.
- **Werkzeug:** `@agent.tool_plain` meldet die Funktion beim Agenten als Werkzeug an. Name, Typangaben und Docstring gehen als Beschreibung an das Modell. `tool_plain` heißt: Die Funktion braucht keinen Zugriff auf den Ablauf. Mit `@agent.tool` bekäme sie zusätzlich einen Kontext, etwa für eine Datenbankverbindung.
- **Ausführen:** `run_sync` startet den Agenten und wartet auf das Ergebnis. `output` ist die Antwort.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Programm ausführen

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

## Beispiel 2: Strukturiertes Ergebnis

### 11. Programm anlegen

Der Agent soll aus einer formlosen Nachricht einen Termin herauslesen und als Objekt mit festen Feldern zurückgeben.

```bash
nano termin.py
```

Füge diesen Inhalt ein:

```python
from datetime import date

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.ollama import OllamaProvider

modell = OpenAIChatModel(
    "qwen3:4b-instruct",
    provider=OllamaProvider(base_url="http://localhost:11434/v1"),
)


# So soll das Ergebnis aussehen
class Termin(BaseModel):
    titel: str = Field(description="Kurzer Titel des Termins")
    datum: date
    ort: str
    teilnehmer: list[str]


agent = Agent(
    modell,
    output_type=Termin,
    instructions="Lies aus dem Text den Termin heraus. Heute ist der 27. September 2026.",
)

text = "Hallo Anna, hallo Ben, wir treffen uns am 3. Oktober 2026 in der Stadtbücherei Ahrensburg zur Planung vom Sommerfest."
ergebnis = agent.run_sync(text)

termin = ergebnis.output
print(type(termin).__name__, termin)
WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
print("Wochentag:", WOCHENTAGE[termin.datum.weekday()])
```

- **`class Termin(BaseModel)`** – beschreibt mit Pydantic, welche Felder das Ergebnis hat und welchen Typ sie haben. `Field(description=…)` gibt dem Modell zusätzliche Hinweise.
- **`output_type=Termin`** – Pydantic AI teilt dem Modell diese Form mit und prüft die Antwort dagegen. Passt sie nicht, etwa weil das Datum kein gültiges Datum ist, schickt Pydantic AI den Fehler an das Modell zurück und lässt es erneut versuchen.
- **Echte Typen:** `termin.datum` ist danach ein Python-`date`. Damit lässt sich weiterrechnen, hier der Wochentag.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Programm ausführen

```bash
python termin.py
```

**Prüfen:** Die Ausgabe lautet:

```text
Termin titel='Planung Sommerfest' datum=datetime.date(2026, 10, 3) ort='Stadtbücherei Ahrensburg' teilnehmer=['Anna', 'Ben']
Wochentag: Samstag
```

## Wie geht es weiter?

- **Abhängigkeiten:** Mit `deps_type` bekommt ein Agent beim Start Daten oder Verbindungen mit, etwa eine Datenbank. Werkzeuge mit `@agent.tool` lesen sie über `ctx.deps`. So lassen sich Agenten auch gut testen.
- **Andere Modelle:** Statt eines Modellobjekts genügt oft ein Text wie `"anthropic:claude-…"` oder `"openai:gpt-…"`. Dafür braucht es das passende Zusatzpaket (z. B. `pydantic-ai-slim[anthropic]`) und einen kostenpflichtigen Schlüssel in einer Umgebungsvariable.
- **Streaming:** `agent.run_stream` liefert Text und sogar strukturierte Ergebnisse Stück für Stück.
- **Mehrere Agenten:** Ein Agent kann einen anderen innerhalb eines Werkzeugs aufrufen. Für feste Abläufe gibt es das Zusatzpaket `pydantic-graph`.
- **Dokumentation:** <https://ai.pydantic.dev>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung.

```bash
rm -rf ~/agent-pydantic
```

### 3. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
