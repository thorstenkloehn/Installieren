# LlamaIndex

LlamaIndex ist eine Python-Bibliothek, mit der man Sprachmodelle mit eigenen Dokumenten verbindet. Sie liest Texte ein, zerlegt sie in Abschnitte, speichert sie als Vektoren und sucht zu einer Frage die passenden Abschnitte heraus. Das Sprachmodell formuliert dann die Antwort daraus. Dieses Vorgehen heißt **RAG** (Retrieval-Augmented Generation). Diese Anleitung baut ein kleines RAG-Beispiel mit [Ollama](ollama.md) als Sprachmodell und [PostgreSQL](postgresql.md) mit pgvector als Speicher.

## Vorbemerkungen

- **Voraussetzungen:**
  - [PostgreSQL](postgresql.md) ist installiert und läuft.
  - [Ollama](ollama.md) läuft und hat die Modelle `qwen3:4b-instruct` und `nomic-embed-text` geladen.
- **Alles lokal:** Dokumente, Vektoren und Sprachmodell bleiben auf dem eigenen Rechner. Es entstehen keine Kosten pro Anfrage.
- **Installation über pip:** LlamaIndex ist nicht in den Ubuntu-Paketquellen. Es wird mit `pip` in eine **virtuelle Umgebung** (venv) installiert, wie in der Anleitung [LangGraph und LangChain](langgraph.md).
- **Pakete:** LlamaIndex ist in viele kleine Pakete aufgeteilt. Man installiert nur, was man braucht:

  | Paket | Aufgabe |
  |---|---|
  | `llama-index-core` | Grundlagen: Dokumente einlesen, zerlegen, Index, Abfragen |
  | `llama-index-llms-ollama` | Anbindung an Chat-Modelle in Ollama |
  | `llama-index-embeddings-ollama` | Anbindung an Embedding-Modelle in Ollama |
  | `llama-index-vector-stores-postgres` | Speichert die Vektoren in PostgreSQL mit pgvector |

- **Versionen:** Getestet mit llama-index-core 0.14.25, Python 3.14, Ollama 0.34 und PostgreSQL 18 mit pgvector 0.8.
- **Passwort:** `geheimes_passwort` ist ein Beispiel. Ersetze es überall durch ein eigenes Passwort.

## Vorbereitung

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketstände der Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. pgvector und venv-Unterstützung installieren

`postgresql-18-pgvector` erweitert PostgreSQL um den Datentyp `vector` und die Ähnlichkeitssuche. `python3-venv` wird für virtuelle Umgebungen gebraucht. Ist beides schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install postgresql-18-pgvector python3-venv
```

### 3. Datenbankbenutzer anlegen

Legt in PostgreSQL den Benutzer `llamaindex` an, mit dem sich das Python-Programm anmeldet.

```bash
sudo -u postgres psql -c "CREATE USER llamaindex WITH PASSWORD 'geheimes_passwort';"
```

### 4. Datenbank anlegen

Legt die Datenbank `llamaindex` an und macht den gleichnamigen Benutzer zu ihrem Eigentümer.

```bash
sudo -u postgres psql -c "CREATE DATABASE llamaindex OWNER llamaindex;"
```

### 5. pgvector in der Datenbank einschalten

Erweiterungen schaltet man pro Datenbank ein, und das darf nur ein Administrator. Deshalb erledigt das der Benutzer `postgres` und nicht das Programm selbst.

```bash
sudo -u postgres psql -d llamaindex -c "CREATE EXTENSION vector;"
```

**Prüfen:** Die Tabelle zeigt die Erweiterung `vector`.

```bash
sudo -u postgres psql -d llamaindex -c "\dx vector"
```

## Installation

### 6. Projektordner anlegen

Legt einen Ordner für das Beispiel an.

```bash
mkdir ~/llamaindex-test
```

### 7. In den Projektordner wechseln

Alle weiteren Befehle arbeiten in diesem Ordner.

```bash
cd ~/llamaindex-test
```

### 8. Virtuelle Umgebung anlegen

Erzeugt den Unterordner `.venv` mit einer eigenen Python-Umgebung für dieses Projekt.

```bash
python3 -m venv .venv
```

### 9. Virtuelle Umgebung aktivieren

Ab jetzt beziehen sich `python` und `pip` in diesem Terminal auf die Umgebung. Vor der Eingabeaufforderung steht `(.venv)`. In einem neuen Terminal musst du diesen Schritt wiederholen.

```bash
source .venv/bin/activate
```

### 10. LlamaIndex installieren

Installiert die vier Pakete samt Abhängigkeiten, darunter die PostgreSQL-Treiber `psycopg2` und `asyncpg` und das Python-Paket `ollama`.

```bash
pip install llama-index-core llama-index-llms-ollama llama-index-embeddings-ollama llama-index-vector-stores-postgres
```

**Prüfen:** Alle vier Pakete erscheinen in der Liste.

```bash
pip list | grep llama-index
```

## Beispiel: Fragen an eigene Dokumente

Das Beispiel verwendet Texte über eine erfundene Kaffeerösterei. So ist sicher, dass das Modell die Antworten nicht aus seinem Training kennt, sondern aus den Dokumenten holt.

### 11. Ordner für die Dokumente anlegen

LlamaIndex liest später alle Dateien aus diesem Ordner.

```bash
mkdir daten
```

### 12. Erstes Dokument schreiben

```bash
nano daten/roesterei.txt
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Die Kaffeerösterei Stormarn wurde 2011 von Jana Petersen in Ahrensburg gegründet.
Sie röstet jede Woche etwa 400 Kilogramm Kaffee in einem Trommelröster aus dem Jahr 1958.
Die beliebteste Sorte heißt "Schlossblick" und stammt aus Kolumbien.
```

### 13. Zweites Dokument schreiben

```bash
nano daten/oeffnungszeiten.txt
```

Füge diesen Inhalt ein, speichere und beende nano wie in Schritt 12:

```text
Der Laden der Kaffeerösterei Stormarn in der Hagener Allee hat dienstags bis samstags von 9 bis 18 Uhr geöffnet.
Montags ist Rösttag, dann bleibt der Laden geschlossen.
Jeden ersten Samstag im Monat gibt es um 11 Uhr eine kostenlose Röstvorführung.
```

### 14. Gemeinsame Einstellungen schreiben

Beide Programme der nächsten Schritte brauchen dieselben Einstellungen. Deshalb stehen sie in einer eigenen Datei.

```bash
nano einstellungen.py
```

Füge diesen Inhalt ein, speichere und beende nano:

```python
from llama_index.core import Settings
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.llms.ollama import Ollama
from llama_index.vector_stores.postgres import PGVectorStore

Settings.llm = Ollama(model="qwen3:4b-instruct", request_timeout=300, context_window=4096)
Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text")

speicher = PGVectorStore.from_params(
    host="127.0.0.1",
    port=5432,
    database="llamaindex",
    user="llamaindex",
    password="geheimes_passwort",
    table_name="notizen",
    embed_dim=768,
)
```

Was die Zeilen bewirken:

- `Settings.llm` – das Chat-Modell in Ollama, das die Antworten formuliert. `request_timeout=300` lässt ihm bis zu fünf Minuten Zeit, falls es erst geladen werden muss. `context_window=4096` sagt LlamaIndex, wie viel Text das Modell auf einmal verarbeitet.
- `Settings.embed_model` – das Embedding-Modell, das Texte und Fragen in Vektoren umwandelt.
- `PGVectorStore.from_params` – die Verbindung zur Datenbank aus den Schritten 3 bis 5. LlamaIndex legt dort die Tabelle `data_notizen` selbst an. `embed_dim=768` muss zur Länge der Vektoren von `nomic-embed-text` passen.

### 15. Programm zum Einlesen schreiben

```bash
nano einlesen.py
```

Füge diesen Inhalt ein, speichere und beende nano:

```python
from llama_index.core import SimpleDirectoryReader, StorageContext, VectorStoreIndex

from einstellungen import speicher

dokumente = SimpleDirectoryReader("daten").load_data()
kontext = StorageContext.from_defaults(vector_store=speicher)
VectorStoreIndex.from_documents(dokumente, storage_context=kontext, show_progress=True)
print(f"{len(dokumente)} Dokumente eingelesen.")
```

- `SimpleDirectoryReader` – liest alle Dateien im Ordner `daten`. Neben Text versteht es mit Zusatzpaketen z. B. auch PDF und Word.
- `VectorStoreIndex.from_documents` – zerlegt die Dokumente in Abschnitte, lässt für jeden Abschnitt einen Vektor berechnen und speichert beides in PostgreSQL.

### 16. Dokumente einlesen

Führt das Programm aus. Beim ersten Mal lädt Ollama das Embedding-Modell, danach geht es schneller.

```bash
python einlesen.py
```

**Prüfen:** Die letzte Zeile lautet `2 Dokumente eingelesen.`, und in der Datenbank stehen zwei Einträge.

```bash
sudo -u postgres psql -d llamaindex -c "SELECT count(*) FROM data_notizen;"
```

### 17. Programm zum Fragen schreiben

```bash
nano fragen.py
```

Füge diesen Inhalt ein, speichere und beende nano:

```python
import sys

from llama_index.core import VectorStoreIndex

from einstellungen import speicher

index = VectorStoreIndex.from_vector_store(speicher)
abfrage = index.as_query_engine(similarity_top_k=2)

antwort = abfrage.query(sys.argv[1])
print(antwort)
print("\nQuellen:")
for treffer in antwort.source_nodes:
    print(f"- {treffer.metadata['file_name']} (Ähnlichkeit {treffer.score:.2f})")
```

- `from_vector_store` – öffnet den vorhandenen Index in PostgreSQL. Die Dokumente müssen nicht erneut eingelesen werden.
- `similarity_top_k=2` – sucht die zwei Abschnitte, die der Frage am ähnlichsten sind, und gibt sie dem Sprachmodell mit.
- `sys.argv[1]` – die Frage kommt als Text von der Befehlszeile.
- `source_nodes` – die gefundenen Abschnitte. So sieht man, woher die Antwort stammt.

### 18. Eine Frage stellen

```bash
python fragen.py "Wann kann ich eine Röstvorführung sehen, und an welchem Tag ist der Laden zu?"
```

**Prüfen:** Die Antwort nennt den ersten Samstag im Monat um 11 Uhr und den Montag. Darunter stehen beide Dateien als Quellen, `oeffnungszeiten.txt` mit der höheren Ähnlichkeit.

Eigene Dokumente legst du in den Ordner `daten` und führst Schritt 16 erneut aus. Dabei werden alle Dateien noch einmal eingelesen. Für wiederholtes Einlesen ohne doppelte Einträge bietet LlamaIndex eine `IngestionPipeline` mit Dokumentenverwaltung.

**Hinweis:** Ein kleines Modell gibt Fakten aus den Dokumenten zuverlässig wieder, rechnet aber leicht falsch. Im Test antwortete es auf die Frage nach dem Alter des Rösters mit „65 Jahre“, weil es das aktuelle Jahr nicht kennt. Wichtige Antworten prüft man deshalb anhand der angegebenen Quellen.

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

Stellt das Terminal wieder auf das Python des Systems um.

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung, Dokumenten und Programmen.

```bash
rm -rf ~/llamaindex-test
```

### 3. Datenbank löschen

Löscht die Datenbank mit allen gespeicherten Vektoren.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS llamaindex;"
```

### 4. Datenbankbenutzer löschen

Entfernt den Benutzer aus Schritt 3.

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS llamaindex;"
```

### 5. Zwischenspeicher von pip leeren (optional)

`pip` hebt heruntergeladene Pakete in einem Zwischenspeicher auf, um spätere Installationen zu beschleunigen. Dieser Befehl gibt den Platz frei.

```bash
rm -rf ~/.cache/pip
```

**Prüfen:** Die Datenbank `llamaindex` fehlt in der Liste.

```bash
sudo -u postgres psql -l | grep llamaindex
```
