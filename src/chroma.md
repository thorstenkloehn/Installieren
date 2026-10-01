# Chroma

Chroma ist eine Vektordatenbank für Python, die man ohne eigenen Server direkt im Programm verwenden kann. Man gibt ihr Texte, sie berechnet daraus selbst die Vektoren (Embeddings) und findet später zu einer Frage die Texte mit der ähnlichsten Bedeutung. Damit ist sie ein einfacher Einstieg in semantische Suche und RAG-Anwendungen.

## Vorbemerkungen

- **Unterschied zu Qdrant und Milvus:** [Qdrant](qdrant.md) und [Milvus](milvus.md) laufen als eigener Dienst und erwarten fertige Vektoren. Chroma speichert seine Daten dagegen einfach in einem Ordner des Programms und rechnet Texte auf Wunsch selbst in Vektoren um. Bei Bedarf läuft es auch als Server.
- **Eingebautes Einbettungsmodell:** Ohne weitere Angaben verwendet Chroma das kleine Modell `all-MiniLM-L6-v2`. Beim ersten Gebrauch lädt es das Modell herunter, rund 170 MB in `~/.cache/chroma`. Das Modell wurde mit englischen Texten trainiert. Beispiel 1 zeigt, dass es bei deutschen Texten oft danebenliegt.
- **Mehrsprachiges Modell über Ollama:** Beispiel 2 verwendet deshalb das Einbettungsmodell `embeddinggemma` aus [Ollama](ollama.md), das auch Deutsch versteht. Voraussetzung dafür ist ein laufendes Ollama.
- **Installation über pip:** Chroma ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine **virtuelle Umgebung** installiert, rund 450 MB.
- **Nutzungsdaten:** Der Python-Teil von Chroma 1.5 enthält zwar noch eine Einstellung für anonyme Nutzungsstatistiken, die zugehörige Funktion sendet aber nichts mehr.
- **Version:** Getestet mit chromadb **1.5.9** unter Python 3.14 aus Ubuntu 26.04.

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
mkdir ~/chroma
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/chroma
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

### 7. Chroma installieren

- `chromadb` – die Datenbank samt Befehl `chroma` für den Serverbetrieb
- `ollama` – die Anbindung an Ollama, die Beispiel 2 für das Einbettungsmodell braucht

```bash
pip install chromadb ollama
```

**Prüfen:** Die Ausgabe nennt `Version: 1.5.9` oder eine neuere Version.

```bash
pip show chromadb
```

## Beispiel 1: Suche mit dem eingebauten Modell

### 8. Programm anlegen

Das Programm speichert fünf kurze Auskünfte eines Fahrradladens und sucht zu fünf Kundenfragen jeweils die passendste heraus.

```bash
nano suche.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
import chromadb

# Daten im Unterordner "daten" speichern
client = chromadb.PersistentClient(path="daten")
sammlung = client.get_or_create_collection("laden")

sammlung.upsert(
    ids=["werkstatt", "zeiten", "zahlung", "verleih", "kette"],
    documents=[
        "Die Werkstatt nimmt Reparaturen nur dienstags und donnerstags an.",
        "Wir haben Montag bis Freitag von 9 bis 18 Uhr geöffnet, samstags von 10 bis 14 Uhr.",
        "Bezahlen können Sie bar, mit Karte oder per Überweisung.",
        "Lastenräder kann man bei uns für einen Tag ausleihen.",
        "Die Kette sollte alle 500 Kilometer gereinigt und geölt werden.",
    ],
    metadatas=[
        {"thema": "werkstatt"},
        {"thema": "laden"},
        {"thema": "laden"},
        {"thema": "verleih"},
        {"thema": "werkstatt"},
    ],
)

fragen = [
    "Wann kann ich mein Rad reparieren lassen?",
    "Wie lange habt ihr am Samstag offen?",
    "Kann ich mit Kreditkarte zahlen?",
    "Ich brauche ein Rad für einen Umzug.",
    "Meine Kette quietscht.",
]
for frage in fragen:
    treffer = sammlung.query(query_texts=[frage], n_results=1)
    print(f"{frage:45} -> {treffer['ids'][0][0]}")

# Suche nur in Einträgen mit dem Thema "werkstatt"
treffer = sammlung.query(query_texts=["Meine Kette quietscht."], n_results=2, where={"thema": "werkstatt"})
print("Mit Filter:", treffer["ids"][0])
```

- **`PersistentClient(path="daten")`** – Chroma legt den Ordner `daten` an und speichert dort alles. Beim nächsten Start ist die Sammlung noch da.
- **Sammlung** – entspricht einer Tabelle. `get_or_create_collection` öffnet sie oder legt sie beim ersten Mal an.
- **`upsert`** – fügt Einträge ein oder ersetzt sie, wenn es die `ids` schon gibt. Deshalb entstehen keine doppelten Einträge, wenn du das Programm mehrmals startest. Zu jedem Text berechnet Chroma selbst den Vektor.
- **`metadatas`** – beliebige Zusatzangaben zu jedem Eintrag, nach denen sich filtern lässt.
- **`query`** – rechnet die Frage ebenfalls in einen Vektor um und liefert die `n_results` ähnlichsten Einträge. `where` beschränkt die Suche auf Einträge mit passenden Zusatzangaben.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Programm ausführen

Beim ersten Start lädt Chroma das Einbettungsmodell herunter und zeigt dabei einen Fortschrittsbalken.

```bash
python suche.py
```

**Prüfen:** Im Test kam heraus:

```text
Wann kann ich mein Rad reparieren lassen?     -> werkstatt
Wie lange habt ihr am Samstag offen?          -> zeiten
Kann ich mit Kreditkarte zahlen?              -> zahlung
Ich brauche ein Rad für einen Umzug.          -> zahlung
Meine Kette quietscht.                        -> zahlung
Mit Filter: ['werkstatt', 'kette']
```

Drei Fragen sind richtig zugeordnet, zwei falsch. Das englische Modell erkennt zwischen „Umzug“ und „Lastenrad“ oder zwischen „quietscht“ und „geölt“ keinen Zusammenhang. Mit dem Filter kommen nur noch die beiden Einträge zum Thema `werkstatt` in Frage. Auch hier stuft das Modell die Kette aber nicht als besten Treffer ein. Beispiel 2 behebt das.

## Beispiel 2: Mehrsprachiges Modell über Ollama

### 10. Einbettungsmodell laden

Lädt das Einbettungsmodell `embeddinggemma` (rund 620 MB) in Ollama. Es erzeugt nur Vektoren und kann nicht chatten.

```bash
ollama pull embeddinggemma
```

**Prüfen:** `embeddinggemma:latest` steht in der Liste.

```bash
ollama list
```

### 11. Programm anlegen

Das Programm verwendet dieselben Texte und Fragen, lässt die Vektoren aber von Ollama berechnen.

```bash
nano suche_ollama.py
```

Füge diesen Inhalt ein:

```python
import chromadb
from chromadb.utils.embedding_functions import OllamaEmbeddingFunction

# Vektoren mit dem Modell embeddinggemma aus Ollama berechnen
einbettung = OllamaEmbeddingFunction(url="http://localhost:11434", model_name="embeddinggemma")

client = chromadb.PersistentClient(path="daten")
sammlung = client.get_or_create_collection("laden_ollama", embedding_function=einbettung)

sammlung.upsert(
    ids=["werkstatt", "zeiten", "zahlung", "verleih", "kette"],
    documents=[
        "Die Werkstatt nimmt Reparaturen nur dienstags und donnerstags an.",
        "Wir haben Montag bis Freitag von 9 bis 18 Uhr geöffnet, samstags von 10 bis 14 Uhr.",
        "Bezahlen können Sie bar, mit Karte oder per Überweisung.",
        "Lastenräder kann man bei uns für einen Tag ausleihen.",
        "Die Kette sollte alle 500 Kilometer gereinigt und geölt werden.",
    ],
)

fragen = [
    "Wann kann ich mein Rad reparieren lassen?",
    "Wie lange habt ihr am Samstag offen?",
    "Kann ich mit Kreditkarte zahlen?",
    "Ich brauche ein Rad für einen Umzug.",
    "Meine Kette quietscht.",
]
for frage in fragen:
    treffer = sammlung.query(query_texts=[frage], n_results=1)
    print(f"{frage:45} -> {treffer['ids'][0][0]}")
```

- **`OllamaEmbeddingFunction`** – schickt jeden Text an Ollama und bekommt den Vektor zurück.
- **Eigene Sammlung** – jede Sammlung gehört zu genau einem Einbettungsmodell, denn Vektoren verschiedener Modelle lassen sich nicht vergleichen. Deshalb heißt sie hier `laden_ollama`. Chroma merkt sich das Modell der Sammlung und verwendet es auch für die Fragen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Programm ausführen

```bash
python suche_ollama.py
```

**Prüfen:** Jetzt sind alle fünf Fragen richtig zugeordnet:

```text
Wann kann ich mein Rad reparieren lassen?     -> werkstatt
Wie lange habt ihr am Samstag offen?          -> zeiten
Kann ich mit Kreditkarte zahlen?              -> zahlung
Ich brauche ein Rad für einen Umzug.          -> verleih
Meine Kette quietscht.                        -> kette
```

## Chroma als Server

Sollen mehrere Programme oder Rechner dieselbe Datenbank verwenden, läuft Chroma als eigener Server. Die Programme verbinden sich dann über das Netz statt einen Ordner zu öffnen.

### 13. Server starten

Startet Chroma mit dem Datenordner `server-daten` auf Port 8000. Ohne weitere Angabe ist der Server nur vom eigenen Rechner aus erreichbar. Er läuft im Vordergrund, das Terminal bleibt also belegt.

```bash
chroma run --path ~/chroma/server-daten --port 8000
```

**Prüfen:** Unter dem Chroma-Logo steht `Connect to Chroma at: http://localhost:8000`.

### 14. Zweites Terminal öffnen

Öffne ein neues Terminal mit <kbd>Strg</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd>. Die folgenden Schritte laufen dort.

### 15. Virtuelle Umgebung im zweiten Terminal aktivieren

```bash
cd ~/chroma && source .venv/bin/activate
```

### 16. Verbindung testen

`heartbeat` ist eine einfache Abfrage, mit der man prüft, ob der Server antwortet.

```bash
python -c "import chromadb; print(chromadb.HttpClient(host='localhost', port=8000).heartbeat())"
```

**Prüfen:** Eine lange Zahl erscheint, die aktuelle Uhrzeit des Servers in Nanosekunden.

Um die Beispiele mit dem Server zu verwenden, ersetzt du in ihnen nur die Zeile mit `PersistentClient` durch:

```python
client = chromadb.HttpClient(host="localhost", port=8000)
```

Die Vektoren berechnet weiterhin das Programm, nicht der Server.

### 17. Server beenden

Wechsle in das erste Terminal und drücke dort <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **RAG:** Die gefundenen Texte gibt man zusammen mit der Frage an ein Sprachmodell, das daraus eine Antwort formuliert. Frameworks wie [LlamaIndex](llamaindex.md) und [LangChain](langgraph.md) bringen fertige Anbindungen an Chroma mit.
- **Mehrere Treffer:** `n_results=3` liefert die drei ähnlichsten Einträge, `treffer["distances"]` den Abstand zur Frage. Je kleiner der Wert, desto ähnlicher.
- **Volltextsuche:** `where_document={"$contains": "Kette"}` findet nur Einträge, deren Text ein bestimmtes Wort enthält.
- **Dauerbetrieb:** Für einen dauerhaft laufenden Server richtet man `chroma run` wie bei [Qdrant](qdrant.md) als systemd-Dienst ein.
- **Dokumentation:** <https://docs.trychroma.com>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung und allen gespeicherten Sammlungen.

```bash
rm -rf ~/chroma
```

### 3. Eingebautes Einbettungsmodell entfernen

```bash
rm -rf ~/.cache/chroma
```

### 4. Einbettungsmodell aus Ollama entfernen

```bash
ollama rm embeddinggemma
```

### 5. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
