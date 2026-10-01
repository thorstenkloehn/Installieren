# CrewAI

CrewAI ist ein Python-Framework, mit dem mehrere KI-Agenten als Team („Crew“) zusammenarbeiten. Jeder Agent bekommt eine Rolle, ein Ziel und eine kurze Vorgeschichte. Aufgaben werden den Agenten zugeteilt und der Reihe nach erledigt. Das Ergebnis einer Aufgabe fließt dabei in die nächste ein.

## Vorbemerkungen

- **Die Bausteine:** Ein `Agent` ist eine Rolle, etwa „Lagerverwalter“. Eine `Task` beschreibt eine Aufgabe und das erwartete Ergebnis. Eine `Crew` fasst Agenten und Aufgaben zusammen und startet die Arbeit mit `kickoff()`.
- **Sprachmodell:** CrewAI spricht OpenAI, Anthropic, Google und viele andere Anbieter an. Diese Anleitung verwendet ein lokales Modell über [Ollama](ollama.md). Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`.
- **Python-Version:** CrewAI 1.15 läuft nur mit Python 3.10 bis 3.13. Ubuntu 26.04 bringt Python 3.14 mit, ältere Versionen gibt es in den Paketquellen nicht. Die Anleitung verwendet deshalb wie bei [Microsoft GraphRAG](graphrag.md) den Paketmanager **uv**. Er lädt für das Projekt ein eigenes Python 3.13 herunter und lässt das Python von Ubuntu unverändert.
- **Nutzungsdaten:** CrewAI schickt von sich aus anonyme Nutzungsdaten an den Hersteller. Die Beispiele schalten das mit der Umgebungsvariablen `CREWAI_DISABLE_TELEMETRY` ab.
- **Platzbedarf:** Die virtuelle Umgebung belegt rund 750 MB, dazu kommen etwa 800 MB im Zwischenspeicher von uv und 110 MB für Python 3.13.
- **Version:** Getestet mit CrewAI **1.15.23**, uv 0.12 und Python 3.13.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von `pipx` kennt.

```bash
sudo apt update
```

### 2. pipx installieren

`pipx` installiert Python-Programme jeweils in eine eigene Umgebung. Ist es schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install pipx
```

### 3. uv installieren

Legt die Befehle `uv` und `uvx` in `~/.local/bin` ab.

```bash
pipx install uv
```

**Prüfen:** Die Versionsnummer erscheint, z. B. `uv 0.12.21`. Fehlt der Befehl, `pipx ensurepath` ausführen und ein neues Terminal öffnen.

```bash
uv --version
```

### 4. Projektordner anlegen

```bash
mkdir ~/agent-crewai
```

### 5. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-crewai
```

### 6. Virtuelle Umgebung mit Python 3.13 anlegen

`uv` lädt Python 3.13 nach `~/.local/share/uv` herunter und legt damit im Unterordner `.venv` eine eigene Python-Umgebung an.

```bash
uv venv --python 3.13
```

**Prüfen:** Die Ausgabe beginnt mit `Using CPython 3.13`.

### 7. CrewAI installieren

`uv` findet den Ordner `.venv` im aktuellen Ordner von selbst und installiert CrewAI samt Abhängigkeiten hinein.

```bash
uv pip install crewai
```

### 8. Virtuelle Umgebung aktivieren

Danach verwendet `python` das Python 3.13 der Umgebung. Die Eingabezeile beginnt mit `(agent-crewai)`. In jedem neuen Terminal muss die Umgebung erneut aktiviert werden.

```bash
source .venv/bin/activate
```

**Prüfen:** Die Ausgabe lautet `1.15.23` oder eine neuere Version.

```bash
python -c "import crewai; print(crewai.__version__)"
```

## Beispiel 1: Ein Agent, eine Aufgabe

### 9. Programm anlegen

Ein einzelner Agent schreibt aus ein paar Stichpunkten einen kurzen Werbetext für ein Fahrrad.

```bash
nano erste.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
import os

# Keine anonymen Nutzungsdaten an CrewAI senden
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"

from crewai import Agent, Crew, LLM, Task

# Lokales Modell über Ollama
llm = LLM(model="ollama/qwen3:4b-instruct", base_url="http://localhost:11434")

texter = Agent(
    role="Werbetexter",
    goal="Kurze, ansprechende Produkttexte auf Deutsch schreiben",
    backstory="Du schreibst seit Jahren Texte für den Onlineshop eines Fahrradladens. "
    "Du verwendest nur die Angaben, die du bekommst, und erfindest nichts dazu.",
    llm=llm,
)

beschreiben = Task(
    description="Schreibe eine Produktbeschreibung für dieses Fahrrad: {angaben}",
    expected_output="Zwei bis drei Sätze ohne Überschrift",
    agent=texter,
)

crew = Crew(agents=[texter], tasks=[beschreiben])
ergebnis = crew.kickoff(
    inputs={"angaben": "Citybike Hansa, 7-Gang-Nabenschaltung, Nabendynamo, Gepäckträger, 16 kg"}
)
print(ergebnis.raw)
```

- **Umgebungsvariable:** Sie muss gesetzt sein, bevor `crewai` geladen wird. Deshalb steht sie ganz oben.
- **Modell:** `ollama/…` wählt Ollama, `base_url` ist die Adresse des Ollama-Dienstes. Einen API-Schlüssel braucht Ollama nicht.
- **`role`, `goal`, `backstory`** – daraus baut CrewAI die Anweisungen an das Modell. Je genauer die Vorgeschichte, desto besser hält sich der Agent an seine Rolle.
- **`expected_output`** – sagt dem Agenten, wie das Ergebnis aussehen soll.
- **`{angaben}`** – ein Platzhalter. `kickoff(inputs=…)` setzt den Text dort ein. So lässt sich dieselbe Crew mit anderen Eingaben wiederverwenden.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Programm ausführen

```bash
python erste.py
```

**Prüfen:** Nach einigen Sekunden erscheinen zwei bis drei Sätze über das Citybike, die Schaltung, Dynamo, Gepäckträger und Gewicht nennen. Im Test mischte das kleine Modell einzelne englische Wörter ein und machte Tippfehler („perfaktes“). Größere Modelle schreiben deutlich sauberer.

## Beispiel 2: Zwei Agenten mit Werkzeug

### 11. Programm anlegen

Ein Kunde fragt per E-Mail, ob bestimmte Räder vorrätig sind. Der erste Agent sieht mit einem Werkzeug im Lager nach. Der zweite schreibt mit diesem Ergebnis die Antwort an den Kunden.

```bash
nano laden.py
```

Füge diesen Inhalt ein:

```python
import os

# Keine anonymen Nutzungsdaten an CrewAI senden
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"

from crewai import Agent, Crew, LLM, Process, Task
from crewai.tools import tool

llm = LLM(model="ollama/qwen3:4b-instruct", base_url="http://localhost:11434", temperature=0)

LAGER = {"citybike": 4, "trekkingrad": 0, "lastenrad": 1}


@tool("Lagerbestand")
def lagerbestand(modell: str) -> str:
    """Gibt zurück, wie viele Räder eines Modells (citybike, trekkingrad, lastenrad) im Lager sind."""
    anzahl = LAGER.get(modell.strip().lower())
    if anzahl is None:
        return f"Das Modell {modell} führen wir nicht."
    return f"{modell}: {anzahl} Stück auf Lager"


lager = Agent(
    role="Lagerverwalter",
    goal="Den Lagerbestand genau ermitteln",
    backstory="Du arbeitest im Lager eines Fahrradladens und schaust jeden Bestand im System nach, statt zu raten.",
    tools=[lagerbestand],
    llm=llm,
)

service = Agent(
    role="Kundenservice",
    goal="Freundliche, kurze Antworten an Kunden schreiben",
    backstory="Du beantwortest E-Mails von Kunden eines Fahrradladens auf Deutsch.",
    llm=llm,
)

nachsehen = Task(
    description="Ein Kunde fragt: {anfrage}\nSieh für jedes erwähnte Modell den Bestand nach.",
    expected_output="Für jedes Modell eine Zeile mit dem Bestand",
    agent=lager,
)

antworten = Task(
    description="Schreibe dem Kunden eine Antwort auf seine Anfrage: {anfrage}",
    expected_output="Eine E-Mail mit höchstens fünf Sätzen auf Deutsch",
    agent=service,
    context=[nachsehen],
)

crew = Crew(
    agents=[lager, service],
    tasks=[nachsehen, antworten],
    process=Process.sequential,
    verbose=True,
)
ergebnis = crew.kickoff(
    inputs={"anfrage": "Habt ihr ein Trekkingrad oder ein Lastenrad da? Ich würde es am Samstag abholen."}
)
print(ergebnis.raw)
```

- **`@tool`** – macht aus einer Python-Funktion ein Werkzeug. Der Docstring erklärt dem Modell, wofür es da ist. Die Typangabe `modell: str` legt den Parameter fest.
- **`tools=[lagerbestand]`** – nur der Lagerverwalter darf das Werkzeug benutzen.
- **`context=[nachsehen]`** – das Ergebnis der ersten Aufgabe wird der zweiten mitgegeben. Der Kundenservice kennt also den Bestand, ohne selbst nachzusehen.
- **`Process.sequential`** – die Aufgaben laufen in der angegebenen Reihenfolge. Die Alternative `Process.hierarchical` setzt einen zusätzlichen Leiter-Agenten ein, der die Aufgaben selbst verteilt.
- **`temperature=0`** – das Modell antwortet möglichst gleichbleibend. Das macht Werkzeugaufrufe kleiner Modelle zuverlässiger.
- **`verbose=True`** – zeigt jeden Arbeitsschritt im Terminal an.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Programm ausführen

Der Lauf dauert etwa eine halbe Minute.

```bash
python laden.py
```

**Prüfen:** In umrahmten Kästen zeigt CrewAI, welcher Agent gerade arbeitet. Unter `Tool Execution` steht zweimal das Werkzeug `lagerbestand`, einmal mit `trekkingrad` (Ergebnis `0 Stück`) und einmal mit `lastenrad` (Ergebnis `1 Stück`). Am Ende steht die E-Mail, im Test sinngemäß:

```text
Hallo,
zu Ihrem Anliegen haben wir derzeit ein Lastenrad auf Lager – ein Trekkingrad ist leider nicht verfügbar.
Das Lastenrad können Sie am Samstag abholen.
```

Der letzte Kasten „Tracing Status“ weist nur darauf hin, dass die Ablaufaufzeichnung für den Onlinedienst des Herstellers ausgeschaltet ist. Das ist gewollt.

## Wie geht es weiter?

- **Projektvorlage:** Der Befehl `crewai create crew NAME` legt ein Projekt an, in dem Agenten und Aufgaben in YAML-Dateien stehen statt im Python-Code. Das ist bei größeren Crews übersichtlicher.
- **Flows:** Mit `Flow` steuert man den Ablauf selbst, etwa mit Verzweigungen, und ruft Crews als einzelne Schritte auf.
- **Gedächtnis:** `Crew(memory=True)` lässt Agenten sich an frühere Läufe erinnern. Dafür braucht CrewAI ein Modell für Einbettungen, z. B. `nomic-embed-text` über Ollama.
- **Fertige Werkzeuge:** Das Paket `crewai-tools` bringt Werkzeuge zum Lesen von Dateien, Webseiten und Datenbanken mit.
- **Dokumentation:** <https://docs.crewai.com>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung.

```bash
rm -rf ~/agent-crewai
```

### 3. Daten von CrewAI entfernen

CrewAI legt unter `~/.local/share` einen Ordner mit dem Namen des Projektordners an (Ergebnisse des letzten Laufs) und einen Ordner `crewai` mit einem Schlüssel für gespeicherte Anmeldedaten.

```bash
rm -rf ~/.local/share/agent-crewai ~/.local/share/crewai
```

### 4. Zwischenspeicher von uv leeren

`uv` hebt heruntergeladene Pakete auf, im Test rund 800 MB. Der Befehl leert den ganzen Speicher, also auch den anderer Projekte, die uv verwenden.

```bash
uv cache clean
```

### 5. Python 3.13 von uv entfernen (optional)

Nur ausführen, wenn kein anderes Projekt das Python 3.13 von uv braucht, z. B. [Microsoft GraphRAG](graphrag.md). Das Python von Ubuntu bleibt unberührt.

```bash
uv python uninstall 3.13
```

### 6. uv entfernen (optional)

Nur ausführen, wenn uv nicht mehr gebraucht wird.

```bash
pipx uninstall uv
```

**Prüfen:** Der Befehl `uv` wird nicht mehr gefunden.

```bash
uv --version
```

### 7. pipx entfernen (optional)

Nur ausführen, wenn keine anderen Programme mit pipx installiert sind. `pipx list` zeigt sie an.

```bash
sudo apt purge pipx
```

### 8. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt Pakete, die nur für pipx mitinstalliert wurden. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove
```
