# LangGraph und LangChain

LangChain und LangGraph sind Python-Bibliotheken, mit denen man Anwendungen rund um große Sprachmodelle (LLMs) baut: Chatbots, Agenten, die selbstständig Werkzeuge aufrufen, oder mehrstufige Abläufe. LangGraph beschreibt solche Abläufe als **Graph** aus Schritten mit gemeinsamem Zustand. LangChain liefert darauf aufbauend fertige Bausteine wie Agenten und Anbindungen an viele Modellanbieter.

## Vorbemerkungen

- **Das Ökosystem:** Die Pakete bauen aufeinander auf:

  | Paket | Aufgabe |
  |---|---|
  | `langchain-core` | Gemeinsame Grundlagen: Nachrichten, Werkzeuge, Schnittstelle für Chat-Modelle |
  | `langgraph` | Abläufe als Graph mit Zustand, Verzweigungen, Schleifen und Gedächtnis |
  | `langchain` | Fertige Bausteine, vor allem `create_agent` für Agenten mit Werkzeugen. Baut intern auf LangGraph auf. |
  | `langchain-anthropic` | Anbindung an Claude von Anthropic. Für andere Anbieter gibt es entsprechende Pakete, z. B. `langchain-openai` oder `langchain-ollama`. |
  | LangSmith | Optionaler Online-Dienst zum Nachverfolgen und Auswerten von Abläufen. Wird in dieser Anleitung nicht verwendet. |

- **Installation über pip:** Die Pakete sind nicht in den Ubuntu-Paketquellen enthalten. Sie werden mit `pip` in eine **virtuelle Umgebung** (venv) installiert. Das ist ein eigener Ordner nur für dieses Projekt. Ubuntu verhindert absichtlich, dass `pip` Pakete systemweit installiert, damit die Python-Pakete des Systems nicht durcheinandergeraten.
- **Versionen:** LangGraph 1.2, LangChain 1.4 und langchain-anthropic 1.7 unter Python 3.14.
- **Sprachmodell:** Das Beispiel mit Agent verwendet **Claude Opus 5**. Dafür brauchst du einen API-Schlüssel von Anthropic (<https://console.anthropic.com>), und jede Anfrage kostet Geld. Das erste Beispiel kommt ohne Sprachmodell aus.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version des Pakets für virtuelle Umgebungen kennt.

```bash
sudo apt update
```

### 2. Unterstützung für virtuelle Umgebungen installieren

`python3-venv` enthält das Werkzeug, mit dem Python virtuelle Umgebungen anlegt. Python selbst ist unter Ubuntu schon installiert.

```bash
sudo apt install python3-venv
```

### 3. Projektordner anlegen

Ein eigener Ordner für die Beispiele.

```bash
mkdir ~/langgraph-test
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/langgraph-test
```

### 5. Virtuelle Umgebung anlegen

Legt die Umgebung im Unterordner `.venv` an. Dort landen später alle Pakete dieses Projekts.

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung aktivieren

Sorgt dafür, dass `python` und `pip` in diesem Terminal die Umgebung verwenden. Das musst du in jedem neuen Terminal wiederholen, bevor du mit dem Projekt arbeitest.

```bash
source .venv/bin/activate
```

**Prüfen:** Vor der Eingabeaufforderung steht jetzt `(.venv)`.

### 7. LangGraph, LangChain und die Claude-Anbindung installieren

Installiert die drei Pakete samt Abhängigkeiten (darunter `langchain-core` und das Anthropic-SDK). `-U` holt jeweils die neueste Version.

```bash
pip install -U langgraph langchain langchain-anthropic
```

**Prüfen:** Die Liste zeigt die installierten Versionen, z. B. `langgraph 1.2.12`.

```bash
pip list | grep -E "^(langgraph|langchain|anthropic) "
```

## Beispiel 1: Ein Graph ohne Sprachmodell

### 8. Beispielprogramm anlegen

Das Programm zeigt die Grundbegriffe von LangGraph, ganz ohne KI:

- **Zustand** (`Zustand`) – die Daten, die durch den Graphen wandern. Hier ein Text und die Anzahl seiner Wörter.
- **Knoten** (`add_node`) – einzelne Schritte, jeweils eine normale Python-Funktion. Sie bekommen den Zustand und geben die Felder zurück, die sie ändern.
- **Kanten** (`add_edge`) – feste Übergänge von einem Knoten zum nächsten. `START` und `END` markieren Anfang und Ende.
- **Bedingte Kante** (`add_conditional_edges`) – eine Weiche, die anhand des Zustands entscheidet, welcher Knoten als Nächstes kommt.

```bash
nano graph_demo.py
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```python
from typing import TypedDict

from langgraph.graph import StateGraph, START, END


# Der Zustand: Daten, die von Knoten zu Knoten weitergereicht werden
class Zustand(TypedDict):
    text: str
    woerter: int


# Knoten sind einfache Funktionen: Sie bekommen den Zustand und
# geben die Felder zurück, die sie ändern
def zaehlen(zustand: Zustand) -> dict:
    return {"woerter": len(zustand["text"].split())}


def kurz(zustand: Zustand) -> dict:
    return {"text": zustand["text"].upper()}


def lang(zustand: Zustand) -> dict:
    return {"text": zustand["text"][:20] + " …"}


# Bedingte Kante: entscheidet anhand des Zustands, wohin es weitergeht
def weiche(zustand: Zustand) -> str:
    return "kurz" if zustand["woerter"] <= 3 else "lang"


graph = StateGraph(Zustand)
graph.add_node("zaehlen", zaehlen)
graph.add_node("kurz", kurz)
graph.add_node("lang", lang)
graph.add_edge(START, "zaehlen")
graph.add_conditional_edges("zaehlen", weiche, ["kurz", "lang"])
graph.add_edge("kurz", END)
graph.add_edge("lang", END)
app = graph.compile()

print(app.invoke({"text": "Hallo LangGraph"}))
print(app.invoke({"text": "Dies ist ein etwas längerer Satz zum Testen"}))
print(app.get_graph().draw_mermaid())
```

### 9. Beispiel ausführen

Startet das Programm in der virtuellen Umgebung.

```bash
python graph_demo.py
```

**Prüfen:** Die ersten beiden Zeilen lauten:

```text
{'text': 'HALLO LANGGRAPH', 'woerter': 2}
{'text': 'Dies ist ein etwas l …', 'woerter': 8}
```

Der kurze Text ging also über den Knoten `kurz`, der lange über `lang`. Darunter steht der Aufbau des Graphen als Mermaid-Diagramm. Du kannst es z. B. in [mdBook](mdbook.md) oder [MkDocs](mkdocs.md) mit einer Mermaid-Erweiterung oder auf <https://mermaid.live> anzeigen lassen.

## Beispiel 2: Ein Agent mit Claude

### 10. API-Schlüssel eingeben

Die Claude-Anbindung liest den Schlüssel aus der Umgebungsvariablen `ANTHROPIC_API_KEY`. `read -rs` fragt ihn ab, ohne ihn anzuzeigen. So landet er weder auf dem Bildschirm noch im Befehlsverlauf. Füge den Schlüssel ein und drücke <kbd>Enter</kbd>.

```bash
read -rsp "API-Schlüssel: " ANTHROPIC_API_KEY
```

### 11. API-Schlüssel für Programme freigeben

`export` macht die Variable für Programme sichtbar, die aus diesem Terminal gestartet werden. Sie gilt nur, bis das Terminal geschlossen wird.

```bash
export ANTHROPIC_API_KEY
```

**Prüfen:** Die Ausgabe ist eine Zahl über 0 (die Länge des Schlüssels), nicht der Schlüssel selbst.

```bash
echo ${#ANTHROPIC_API_KEY}
```

### 12. Agent-Programm anlegen

Ein **Agent** ist ein Sprachmodell, das selbst entscheidet, ob und wann es Werkzeuge aufruft. Das Programm verwendet:

- `tage_bis` – ein **Werkzeug**: eine normale Python-Funktion. Aus Name, Parametern und Docstring erkennt das Modell, wofür es da ist.
- `ChatAnthropic` – die Anbindung an Claude Opus 5 (`claude-opus-5`). `max_tokens` begrenzt die Länge einer Antwort. `betas` und `fallbacks` schalten eine Absicherung ein: Lehnen die Sicherheitsfilter von Anthropic eine Anfrage ab, beantwortet sie automatisch ein anderes passendes Claude-Modell.
- `create_agent` – baut aus Modell, Werkzeugen und Anweisung (`system_prompt`) einen fertigen Agenten. Intern ist das ein LangGraph-Graph mit Schleife: Modell fragen → Werkzeug ausführen → Modell erneut fragen, bis eine Antwort vorliegt.
- `InMemorySaver` – das **Gedächtnis**. Es speichert den Gesprächsverlauf pro Unterhaltung, erkennbar an der `thread_id`. Deshalb versteht der Agent bei der zweiten Frage, worauf sich „Und in Wochen?“ bezieht.

```bash
nano agent_demo.py
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```python
from datetime import date

from langchain.agents import create_agent
from langchain_anthropic import ChatAnthropic
from langgraph.checkpoint.memory import InMemorySaver


# Ein Werkzeug (Tool): eine normale Python-Funktion. Der Docstring
# erklärt dem Modell, wofür das Werkzeug da ist.
def tage_bis(datum: str) -> str:
    """Berechnet, wie viele Tage es noch bis zu einem Datum (JJJJ-MM-TT) sind."""
    ziel = date.fromisoformat(datum)
    return f"Noch {(ziel - date.today()).days} Tage bis {datum}."


modell = ChatAnthropic(
    model="claude-opus-5",
    max_tokens=16000,
    # Bei einer Ablehnung durch Sicherheitsfilter automatisch auf ein
    # geeignetes anderes Claude-Modell ausweichen
    betas=["server-side-fallback-2026-07-01"],
    model_kwargs={"fallbacks": "default"},
)

agent = create_agent(
    modell,
    tools=[tage_bis],
    system_prompt="Du bist ein hilfreicher Assistent. Antworte kurz und auf Deutsch.",
    # Merkt sich den Gesprächsverlauf pro Unterhaltung (thread_id)
    checkpointer=InMemorySaver(),
)

unterhaltung = {"configurable": {"thread_id": "test-1"}}

antwort = agent.invoke(
    {"messages": [{"role": "user", "content": "Wie viele Tage sind es noch bis Silvester 2026?"}]},
    unterhaltung,
)
print(antwort["messages"][-1].text)

antwort = agent.invoke(
    {"messages": [{"role": "user", "content": "Und in Wochen?"}]},
    unterhaltung,
)
print(antwort["messages"][-1].text)
```

### 13. Agent ausführen

Startet den Agenten. Er stellt zwei Anfragen an Claude, die erste davon mit einem Werkzeugaufruf. Das dauert einige Sekunden und kostet wenige Cent.

```bash
python agent_demo.py
```

**Prüfen:** Es erscheinen zwei deutsche Antworten: zuerst die Anzahl der Tage bis zum 31.12.2026 (vom Werkzeug berechnet), dann dieselbe Zeitspanne in Wochen. Der genaue Wortlaut ändert sich bei jedem Aufruf.

Erscheint stattdessen ein Fehler mit `authentication_error`, ist der Schlüssel falsch oder fehlt. Wiederhole dann die Schritte 10 und 11.

## Wie geht es weiter?

- **Eigene Graphen mit Modell:** Ein Knoten kann auch `modell.invoke(...)` aufrufen. So lassen sich feste Abläufe bauen, in denen das Modell nur an bestimmten Stellen gefragt wird, z. B. erst Text zusammenfassen, dann prüfen, dann übersetzen.
- **Dauerhaftes Gedächtnis:** `InMemorySaver` vergisst alles, wenn das Programm endet. Das Paket `langgraph-checkpoint-postgres` speichert den Verlauf stattdessen in [PostgreSQL](postgresql.md).
- **Wissen aus eigenen Dokumenten (RAG):** Mit Embeddings und einem Vektorspeicher wie [pgvector](postgresql.md#pgvector-einrichten) findet der Agent passende Textstellen und bezieht sie in seine Antworten ein.
- **Menschliche Freigabe:** Mit `interrupt_before` hält der Agent vor bestimmten Schritten an und wartet auf eine Bestätigung.

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

Schaltet das Terminal zurück auf das Python des Systems. `(.venv)` verschwindet aus der Eingabeaufforderung.

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung und allen darin installierten Paketen. Außerhalb dieses Ordners hat `pip` nichts installiert.

```bash
rm -rf ~/langgraph-test
```

### 3. Zwischenspeicher von pip leeren (optional)

`pip` hebt heruntergeladene Pakete in einem Zwischenspeicher auf, um spätere Installationen zu beschleunigen.

```bash
rm -rf ~/.cache/pip
```

**Prüfen:** Der Projektordner existiert nicht mehr.

```bash
ls ~/langgraph-test
```

**Hinweis:** Den API-Schlüssel kannst du in der Anthropic Console jederzeit sperren oder löschen, wenn du ihn nicht mehr brauchst.
