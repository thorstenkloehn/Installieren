# Agno

Agno ist ein Python-Framework für KI-Agenten, das auf wenig Code und schnellen Start ausgelegt ist. Ein Agent bekommt Modell, Anweisungen und Werkzeuge. Gesprächsverläufe, Erinnerungen an Benutzer und Zusammenfassungen speichert Agno auf Wunsch gleich in einer Datenbank, etwa SQLite oder [PostgreSQL](postgresql.md). Mit AgentOS lassen sich Agenten außerdem als Webdienst betreiben.

## Vorbemerkungen

- **Viele Anbieter:** Agno bindet über 20 Anbieter an, darunter OpenAI, Anthropic, Google und [Ollama](ollama.md). Diese Anleitung verwendet ein lokales Modell über Ollama. Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`. Es kann Werkzeuge aufrufen.
- **Telemetrie:** Agno sendet ab Werk bei jedem Lauf eines Agenten ein Ereignis an den Hersteller (`os-api.agno.com`). Die Beispiele schalten das mit `telemetry=False` ab. Für alle Programme auf einmal geht es mit der Umgebungsvariable `AGNO_TELEMETRY=false`.
- **Pakete zusammensuchen:** Der Kern `agno` bringt die Anbindungen nicht mit. Für Ollama braucht es die Pakete `ollama` und `openai`, für SQLite `sqlalchemy`, `aiosqlite` und `greenlet`. Schritt 7 installiert alles auf einmal. Im Test reichte das Extra `agno[ollama]` allein nicht, und SQLAlchemy 2.1 installiert `greenlet` nicht mehr selbst.
- **Installation über pip:** Agno ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine **virtuelle Umgebung** installiert, rund 170 MB.
- **Version:** Getestet mit agno **3.0.11**, ollama 0.6, openai 3.19 und SQLAlchemy 2.1 unter Python 3.14 aus Ubuntu 26.04.

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
mkdir ~/agent-agno
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-agno
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

### 7. Agno mit Ollama- und SQLite-Anbindung installieren

- `agno[ollama,openai,sqlite]` – Agno samt den Bibliotheken `ollama`, `openai`, `sqlalchemy` und `aiosqlite`
- `sqlalchemy[asyncio]` – ergänzt `greenlet`, ohne das die SQLite-Speicherung mit einem `ImportError` abbricht

Die Anführungszeichen verhindern, dass die Shell die eckigen Klammern auswertet.

```bash
pip install "agno[ollama,openai,sqlite]" "sqlalchemy[asyncio]"
```

**Prüfen:** Die Liste enthält `agno 3.0.11` (oder neuer), `ollama`, `openai`, `SQLAlchemy`, `aiosqlite` und `greenlet`.

```bash
pip list
```

## Beispiel 1: Ein Agent mit Werkzeug

### 8. Programm anlegen

```bash
nano agent.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
from agno.agent import Agent
from agno.models.ollama import Ollama

HAUPTSTAEDTE = {
    "schleswig-holstein": "Kiel",
    "hamburg": "Hamburg",
    "niedersachsen": "Hannover",
    "bayern": "München",
}


def landeshauptstadt(bundesland: str) -> str:
    """Liefert die Landeshauptstadt eines deutschen Bundeslands.

    Args:
        bundesland: Name des Bundeslands, z. B. Bayern.
    """
    return HAUPTSTAEDTE.get(bundesland.lower(), "unbekannt")


agent = Agent(
    model=Ollama(id="qwen3:4b-instruct"),
    instructions="Du beantwortest Fragen zu deutschen Bundesländern kurz auf Deutsch. "
    "Nutze für Landeshauptstädte immer das Werkzeug landeshauptstadt.",
    tools=[landeshauptstadt],
    # Keine Nutzungsdaten an Agno senden
    telemetry=False,
)

agent.print_response("Was ist die Hauptstadt von Schleswig-Holstein und von Bayern?", show_tool_calls=True)
```

- **Modell:** `Ollama(id=…)` spricht Ollama unter `http://localhost:11434` an. Läuft Ollama woanders, gibt man `host="http://…"` mit.
- **Werkzeug:** Jede normale Python-Funktion in `tools` ist ein Werkzeug. Name, Typangaben und Docstring gehen als Beschreibung an das Modell.
- **Ausgabe:** `print_response` zeigt Frage, Werkzeugaufrufe und Antwort in Kästen im Terminal an. Im eigenen Programm verwendet man stattdessen `ergebnis = agent.run("…")` und liest die Antwort aus `ergebnis.content`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Programm ausführen

```bash
python agent.py
```

**Prüfen:** Nach einigen Sekunden erscheinen drei Kästen: „Message“ mit der Frage, „Tool Calls“ mit `landeshauptstadt(bundesland=Schleswig-Holstein)` und `landeshauptstadt(bundesland=Bayern)` und „Response“ mit der Antwort:

```text
Die Hauptstadt von Schleswig-Holstein ist Kiel und die Hauptstadt von Bayern ist München.
```

## Beispiel 2: Gedächtnis in einer Datenbank

### 10. Programm anlegen

Der Agent soll sich an ein Gespräch erinnern, auch wenn das Programm zwischendurch beendet wird. Dafür speichert Agno jede Runde in einer SQLite-Datei. Die Frage kommt als Argument beim Aufruf.

```bash
nano gedaechtnis.py
```

Füge diesen Inhalt ein:

```python
import sys

from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.ollama import Ollama

agent = Agent(
    model=Ollama(id="qwen3:4b-instruct"),
    instructions="Du bist ein freundlicher Assistent. Antworte kurz auf Deutsch.",
    # Gespräche und Erinnerungen in einer SQLite-Datei speichern
    db=SqliteDb(db_file="agent.db"),
    user_id="thorsten",
    session_id="erstes-gespraech",
    # Die letzten Runden des Gesprächs bei jeder Frage mitschicken
    add_history_to_context=True,
    num_history_runs=5,
    telemetry=False,
)

frage = " ".join(sys.argv[1:]) or "Hallo!"
agent.print_response(frage)
```

- **`db=SqliteDb(…)`** – Agno legt die Datei `agent.db` an und speichert darin Sitzungen und Läufe.
- **`user_id` und `session_id`** – ordnen das Gespräch einem Benutzer und einer Sitzung zu. Eine andere `session_id` beginnt ein neues Gespräch.
- **`add_history_to_context`** – schickt die letzten Runden (hier höchstens 5) bei jeder Frage an das Modell mit. Ohne diese Einstellung würde Agno zwar speichern, das Modell sähe den Verlauf aber nicht.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Etwas erzählen

```bash
python gedaechtnis.py Ich heiße Thorsten und wohne in Ahrensburg.
```

**Prüfen:** Der Agent begrüßt dich mit Namen. Im Ordner liegt jetzt die Datei `agent.db`.

### 12. Nachfragen in einem neuen Aufruf

Das Programm läuft jetzt neu, der Verlauf kommt aus der Datenbank.

```bash
python gedaechtnis.py In welchem Bundesland liegt mein Wohnort?
```

```bash
python gedaechtnis.py Wie heiße ich?
```

**Prüfen:** Der Agent nennt Schleswig-Holstein und den Namen Thorsten. Kleine Modelle wie `qwen3:4b-instruct` machen dabei Grammatikfehler („in der Bundesländer“) und hängen gern Emojis an. Löschst du `agent.db`, hat der Agent alles vergessen.

## Wie geht es weiter?

- **Erinnerungen an Benutzer:** Mit `update_memory_on_run=True` legt Agno aus Gesprächen dauerhafte Notizen über den Benutzer an, etwa Vorlieben, und bezieht sie in spätere Sitzungen ein.
- **Wissen:** Mit einer Wissensbasis und einer Vektordatenbank wie [Qdrant](qdrant.md) durchsucht ein Agent eigene Dokumente, bevor er antwortet.
- **Teams:** `Team` fasst mehrere Agenten zusammen, die sich Aufgaben teilen.
- **AgentOS:** Agno kann Agenten als FastAPI-Webdienst bereitstellen. Die Weboberfläche dazu betreibt der Hersteller unter `os.agno.com`. Das Befehlszeilenwerkzeug `agnoctl` verbindet Programmier-Assistenten mit einem laufenden AgentOS.
- **Dokumentation:** <https://docs.agno.com>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung und der Datenbank `agent.db`.

```bash
rm -rf ~/agent-agno
```

### 3. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
