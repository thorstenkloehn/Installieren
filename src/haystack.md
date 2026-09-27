# Haystack

Haystack von der Berliner Firma deepset ist ein Python-Framework für Anwendungen mit Sprachmodellen. Sein Kern sind **Pipelines**: Bausteine (Komponenten) wie „Text in Vektor umwandeln“, „passende Dokumente suchen“, „Prompt bauen“ und „Modell fragen“ werden zu einem festen Ablauf verbunden. Haystack ist besonders für die Suche in eigenen Dokumenten (RAG) bekannt und bringt außerdem einen Agenten mit, der Werkzeuge verwendet.

## Vorbemerkungen

- **Pakete:** `haystack-ai` enthält den Kern. Anbindungen an einzelne Dienste kommen als eigene Pakete, hier `ollama-haystack` für [Ollama](ollama.md). Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Chat-Modell `qwen3:4b-instruct` und dem Embedding-Modell `nomic-embed-text`, beide aus der Ollama-Anleitung.
- **Telemetrie:** Haystack sendet ab Werk anonyme Nutzungsdaten an den Dienst PostHog (`eu.posthog.com`) und legt dafür eine zufällige Kennung in `~/.haystack/config.yaml` ab. Schritt 8 schaltet das über die Umgebungsvariable `HAYSTACK_TELEMETRY_ENABLED` ab. Dann legt Haystack den Ordner auch nicht an.
- **Installation über pip:** Haystack ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine **virtuelle Umgebung** installiert, rund 175 MB.
- **Version:** Getestet mit haystack-ai **3.2.0** und ollama-haystack 7.0.1 unter Python 3.14 aus Ubuntu 26.04.

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
mkdir ~/agent-haystack
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-haystack
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

### 7. Haystack und Ollama-Anbindung installieren

```bash
pip install haystack-ai ollama-haystack
```

**Prüfen:** Die Liste enthält `haystack-ai 3.2.0` (oder neuer) und `ollama-haystack`.

```bash
pip list
```

### 8. Telemetrie abschalten

Setzt die Umgebungsvariable für dieses Terminal. Wer Haystack öfter verwendet, trägt die Zeile mit `nano ~/.bashrc` am Ende der Datei ein, dann gilt sie in jedem neuen Terminal.

```bash
export HAYSTACK_TELEMETRY_ENABLED=False
```

## Beispiel 1: Ein Agent mit Werkzeug

### 9. Programm anlegen

```bash
nano agent.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
from haystack.components.agents import Agent
from haystack.dataclasses import ChatMessage
from haystack.tools import tool
from haystack_integrations.components.generators.ollama import OllamaChatGenerator

HAUPTSTAEDTE = {
    "schleswig-holstein": "Kiel",
    "hamburg": "Hamburg",
    "niedersachsen": "Hannover",
    "bayern": "München",
}


@tool
def landeshauptstadt(bundesland: str) -> str:
    """Liefert die Landeshauptstadt eines deutschen Bundeslands.

    :param bundesland: Name des Bundeslands, z. B. Bayern.
    """
    print(f"  [Werkzeug] landeshauptstadt({bundesland!r})")
    return HAUPTSTAEDTE.get(bundesland.lower(), "unbekannt")


agent = Agent(
    chat_generator=OllamaChatGenerator(model="qwen3:4b-instruct", url="http://localhost:11434"),
    system_prompt="Du beantwortest Fragen zu deutschen Bundesländern kurz auf Deutsch. "
    "Nutze für Landeshauptstädte immer das Werkzeug landeshauptstadt.",
    tools=[landeshauptstadt],
)

ergebnis = agent.run(messages=[ChatMessage.from_user("Was ist die Hauptstadt von Schleswig-Holstein und von Bayern?")])
print(ergebnis["last_message"].text)
```

- **`OllamaChatGenerator`** – die Komponente, die das Chat-Modell in Ollama befragt.
- **`@tool`** – macht aus der Funktion ein Werkzeug. Haystack liest die Parameterbeschreibung aus dem Docstring im Stil `:param name: …`.
- **`ChatMessage.from_user`** – Haystack arbeitet mit Nachrichten-Objekten statt einfachem Text.
- **Ergebnis:** `agent.run` liefert ein Dictionary mit allen Nachrichten. `last_message` ist die letzte, also die Antwort.

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

## Beispiel 2: Fragen zu eigenen Texten (RAG)

### 11. Programm anlegen

Das Modell soll Fragen zu einem erfundenen Schachclub beantworten, über den es nichts wissen kann. Zwei Pipelines erledigen das: Die erste wandelt die Texte in Vektoren um und speichert sie. Die zweite wandelt die Frage in einen Vektor um, sucht die zwei ähnlichsten Texte und gibt sie dem Modell mit.

```bash
nano rag.py
```

Füge diesen Inhalt ein:

```python
from haystack import Document, Pipeline
from haystack.components.builders import ChatPromptBuilder
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.components.writers import DocumentWriter
from haystack.dataclasses import ChatMessage
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack_integrations.components.embedders.ollama import OllamaDocumentEmbedder, OllamaTextEmbedder
from haystack_integrations.components.generators.ollama import OllamaChatGenerator

OLLAMA = "http://localhost:11434"

# Eigene Texte, die das Modell nicht kennen kann
texte = [
    "Der Schachclub Waldblick trifft sich jeden Dienstag um 19 Uhr im Bürgerhaus, Raum 2.",
    "Die Jahreshauptversammlung des Schachclubs findet am 14. November im Gemeindesaal statt.",
    "Der Mitgliedsbeitrag beträgt 60 Euro im Jahr, Schüler zahlen 20 Euro.",
    "Ansprechpartnerin für neue Mitglieder ist Frau Petersen.",
    "Im Sommer spielt der Club donnerstags draußen im Stadtpark am großen Brett.",
]

speicher = InMemoryDocumentStore()

# Pipeline 1: Texte in Vektoren umwandeln und speichern
indizieren = Pipeline()
indizieren.add_component("embedder", OllamaDocumentEmbedder(model="nomic-embed-text", url=OLLAMA, progress_bar=False))
indizieren.add_component("writer", DocumentWriter(document_store=speicher))
indizieren.connect("embedder.documents", "writer.documents")
indizieren.run({"embedder": {"documents": [Document(content=t) for t in texte]}})

vorlage = [
    ChatMessage.from_system(
        "Beantworte die Frage nur mit Hilfe der folgenden Texte. "
        "Steht die Antwort nicht darin, sage das.\n"
        "{% for doc in documents %}- {{ doc.content }}\n{% endfor %}"
    ),
    ChatMessage.from_user("{{ frage }}"),
]

# Pipeline 2: passende Texte suchen und damit antworten
fragen = Pipeline()
fragen.add_component("embedder", OllamaTextEmbedder(model="nomic-embed-text", url=OLLAMA))
fragen.add_component("retriever", InMemoryEmbeddingRetriever(document_store=speicher, top_k=2))
fragen.add_component("prompt", ChatPromptBuilder(template=vorlage, required_variables=["frage", "documents"]))
fragen.add_component("llm", OllamaChatGenerator(model="qwen3:4b-instruct", url=OLLAMA))
fragen.connect("embedder.embedding", "retriever.query_embedding")
fragen.connect("retriever.documents", "prompt.documents")
fragen.connect("prompt.prompt", "llm.messages")

for frage in ["Wann trifft sich der Schachclub?", "Was kostet die Mitgliedschaft für Schüler?", "Wer ist Vorsitzender?"]:
    ergebnis = fragen.run({"embedder": {"text": frage}, "prompt": {"frage": frage}}, include_outputs_from={"retriever"})
    print(f"> {frage}")
    print(ergebnis["llm"]["replies"][0].text)
    print("  Quellen:", [d.content[:40] for d in ergebnis["retriever"]["documents"]], "\n")
```

- **Komponenten und Verbindungen:** `add_component` fügt einen Baustein mit Namen hinzu, `connect("a.ausgang", "b.eingang")` verbindet den Ausgang des einen mit dem Eingang des anderen. Haystack prüft dabei, ob die Datentypen zusammenpassen.
- **Embeddings:** `nomic-embed-text` wandelt jeden Text in einen Zahlenvektor um. Texte mit ähnlicher Bedeutung bekommen ähnliche Vektoren. `InMemoryDocumentStore` hält sie im Arbeitsspeicher, für größere Mengen gibt es Anbindungen an Datenbanken wie [Qdrant](qdrant.md).
- **Suche:** `InMemoryEmbeddingRetriever` findet die `top_k` Texte, deren Vektor dem der Frage am nächsten ist.
- **Prompt:** `ChatPromptBuilder` füllt die Vorlage mit der Frage und den gefundenen Texten. `{% for … %}` und `{{ … }}` sind Jinja2-Schreibweise.
- **`include_outputs_from`** – gibt zusätzlich die gefundenen Texte aus, damit man sieht, worauf sich die Antwort stützt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Programm ausführen

```bash
python rag.py
```

**Prüfen:** Die Ausgabe lautet z. B.:

```text
> Wann trifft sich der Schachclub?
Der Schachclub trifft sich jeden Dienstag um 19 Uhr im Bürgerhaus, Raum 2.
  Quellen: ['Der Schachclub Waldblick trifft sich jed', 'Die Jahreshauptversammlung des Schachclu']

> Was kostet die Mitgliedschaft für Schüler?
Die Mitgliedschaft für Schüler kostet 20 Euro.
  Quellen: ['Der Mitgliedsbeitrag beträgt 60 Euro im ', 'Im Sommer spielt der Club donnerstags dr']

> Wer ist Vorsitzender?
Die Information über den Vorsitzenden steht nicht im Text.
  Quellen: ['Ansprechpartnerin für neue Mitglieder is', 'Der Mitgliedsbeitrag beträgt 60 Euro im ']
```

Die dritte Frage ist eine Falle: Der Vorsitzende steht in keinem Text. Weil die Anweisung verlangt, nur die Texte zu verwenden, sagt das Modell das, statt einen Namen zu erfinden.

## Wie geht es weiter?

- **Eigene Dateien:** Komponenten wie `TextFileToDocument`, `PyPDFToDocument` und `DocumentSplitter` lesen Dateien ein und zerlegen lange Texte in kleinere Abschnitte, bevor sie in den Speicher kommen.
- **Dauerhafter Speicher:** Mit `qdrant-haystack` und einem laufenden [Qdrant](qdrant.md) bleiben die Vektoren nach dem Programmende erhalten.
- **Pipeline als Werkzeug:** Eine ganze Pipeline lässt sich mit `PipelineTool` als Werkzeug an einen Agenten geben. Dann entscheidet der Agent selbst, wann er in den Dokumenten sucht.
- **Pipelines speichern:** `pipeline.dumps()` schreibt eine Pipeline als YAML, `Pipeline.loads()` liest sie wieder ein.
- **Dokumentation:** <https://docs.haystack.deepset.ai>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung.

```bash
rm -rf ~/agent-haystack
```

### 3. Kennung der Telemetrie entfernen

Nur nötig, wenn Haystack einmal ohne abgeschaltete Telemetrie lief. Dann liegt die zufällige Kennung in `~/.haystack`. `-f` meldet keinen Fehler, wenn der Ordner fehlt.

```bash
rm -rf ~/.haystack
```

### 4. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
