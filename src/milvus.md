# Milvus

Milvus ist eine quelloffene Vektordatenbank. Sie speichert Vektoren, etwa Embeddings von Texten oder Bildern, zusammen mit weiteren Feldern und findet die Einträge, die einem Suchvektor am ähnlichsten sind. Milvus ist für sehr große Datenmengen gebaut und wird oft für semantische Suche und RAG-Anwendungen eingesetzt.

## Vorbemerkungen

- **Welche Variante?** Milvus gibt es in mehreren Formen:

  | Variante | Beschreibung | In dieser Anleitung |
  |---|---|---|
  | **Milvus Lite** | Offizielle, schlanke Ausgabe für Python. Läuft im eigenen Programm oder als kleiner Server, die Daten liegen in einem Ordner. | ja |
  | Milvus Standalone / Distributed | Vollständiger Server für große Datenmengen. Wird offiziell über Docker oder Kubernetes betrieben. | nein |
  | `.deb`-Paket von Milvus Standalone | Gab es auf GitHub, zuletzt für Version 2.6.18 (Juni 2026). Neuere Versionen erscheinen nicht mehr als Paket. Der Dienst läuft außerdem als `root` und ist ohne Anpassung aus dem Netz erreichbar. | nein |

  Diese Anleitung verwendet **Milvus Lite**. Es ist aktuell, braucht weder Docker noch Administratorrechte und ist für Entwicklung, Tests und Datenmengen bis etwa eine Million Vektoren gedacht.
- **Gleiche Schnittstelle:** Programme sprechen Milvus Lite und den großen Milvus-Server mit derselben Python-Bibliothek `pymilvus` an. Für den Umstieg reicht es, beim Verbinden statt eines Ordnernamens die Adresse des Servers anzugeben. Nicht alle Funktionen des großen Servers stehen in Milvus Lite zur Verfügung.
- **Installation über pip:** Milvus Lite ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine virtuelle Umgebung (venv) installiert, also in einen eigenen Ordner nur für dieses Projekt.
- **Versionen:** pymilvus 3.0 und Milvus Lite 3.2 unter Python 3.14.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version des Pakets für virtuelle Umgebungen kennt.

```bash
sudo apt update
```

### 2. Unterstützung für virtuelle Umgebungen installieren

`python3-venv` enthält das Werkzeug, mit dem Python virtuelle Umgebungen anlegt. Ist es schon vorhanden (z. B. aus der [LangGraph-Anleitung](langgraph.md)), meldet `apt` das nur.

```bash
sudo apt install python3-venv
```

### 3. Projektordner anlegen

Ein eigener Ordner für die Beispiele.

```bash
mkdir ~/milvus-test
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/milvus-test
```

### 5. Virtuelle Umgebung anlegen

Legt die Umgebung im Unterordner `.venv` an.

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung aktivieren

Sorgt dafür, dass `python` und `pip` in diesem Terminal die Umgebung verwenden. Das musst du in jedem neuen Terminal wiederholen.

```bash
source .venv/bin/activate
```

**Prüfen:** Vor der Eingabeaufforderung steht jetzt `(.venv)`.

### 7. pymilvus mit Milvus Lite installieren

Installiert die Python-Bibliothek `pymilvus`. Der Zusatz `[milvus-lite]` holt Milvus Lite gleich mit. Die Anführungszeichen verhindern, dass die Shell die eckigen Klammern selbst auswertet.

```bash
pip install -U "pymilvus[milvus-lite]"
```

**Prüfen:** Die Liste zeigt `milvus-lite` und `pymilvus` mit ihren Versionen, z. B. `3.2.1` und `3.0.2`.

```bash
pip list | grep -i milvus
```

## Erstes Beispiel

### 8. Beispielprogramm anlegen

Das Programm verwendet dasselbe Beispiel wie die Anleitungen zu [pgvector](postgresql.md#pgvector-einrichten) und [Qdrant](qdrant.md): drei Einträge mit kleinen Vektoren aus drei Zahlen. Echte Embeddings haben meist mehrere hundert Zahlen. Die wichtigsten Befehle:

- `MilvusClient("notizen.db")` – öffnet die Datenbank im Ordner `notizen.db` und legt ihn beim ersten Mal an
- `create_collection` – legt eine **Sammlung** an (entspricht einer Tabelle). `dimension` ist die Anzahl der Zahlen pro Vektor, `metric_type="COSINE"` misst Ähnlichkeit über die Richtung der Vektoren.
- `insert` – fügt Einträge ein. Neben `id` und `vector` sind beliebige weitere Felder erlaubt.
- `search` – sucht die ähnlichsten Einträge. `filter` schränkt die Suche mit einer Bedingung auf die Felder ein, `output_fields` legt fest, welche Felder zurückkommen.

```bash
nano milvus_demo.py
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```python
from pymilvus import MilvusClient

# Milvus Lite: Die ganze Datenbank steckt in diesem einen Ordner
client = MilvusClient("notizen.db")

# Sammlung neu anlegen: Vektoren mit 3 Zahlen, Ähnlichkeit per Kosinus
if client.has_collection("notizen"):
    client.drop_collection("notizen")
client.create_collection("notizen", dimension=3, metric_type="COSINE")

# Einträge einfügen: id, Vektor und beliebige weitere Felder
client.insert("notizen", [
    {"id": 1, "vector": [1, 0, 0],     "text": "Apfel", "art": "obst"},
    {"id": 2, "vector": [0.9, 0.1, 0], "text": "Birne", "art": "obst"},
    {"id": 3, "vector": [0, 0, 1],     "text": "Auto",  "art": "fahrzeug"},
])

# Ähnlichkeitssuche: die zwei ähnlichsten Einträge
treffer = client.search("notizen", data=[[1, 0.05, 0]], limit=2, output_fields=["text"])
for t in treffer[0]:
    print("Suche:", t["entity"]["text"], round(t["distance"], 4))

# Suche mit Filter auf ein Feld
treffer = client.search("notizen", data=[[1, 0.05, 0]], limit=2,
                        filter='art == "fahrzeug"', output_fields=["text"])
for t in treffer[0]:
    print("Mit Filter:", t["entity"]["text"], round(t["distance"], 4))

print("Anzahl:", client.get_collection_stats("notizen")["row_count"])
client.close()
```

### 9. Beispiel ausführen

Startet das Programm in der virtuellen Umgebung.

```bash
python milvus_demo.py
```

**Prüfen:** Die Ausgabe lautet:

```text
Suche: Apfel 0.9988
Suche: Birne 0.9982
Mit Filter: Auto 0.0
Anzahl: 3
```

Beim Kosinus-Maß bedeutet ein Wert nahe 1 „sehr ähnlich“. Mit dem Filter bleibt nur `Auto` übrig, obwohl es dem Suchvektor gar nicht ähnlich ist (Wert 0): Der Filter wird zuerst angewendet.

### 10. Datenordner ansehen

Milvus Lite speichert alles im Ordner `notizen.db`. Um die Datenbank zu sichern oder weiterzugeben, kopierst du diesen Ordner, während kein Programm darauf zugreift.

```bash
ls notizen.db
```

**Prüfen:** Es werden `LOCK`, `collections` und `databases` angezeigt. `LOCK` verhindert, dass zwei Programme gleichzeitig in denselben Ordner schreiben.

## Optional: Milvus Lite als Server

Im ersten Beispiel läuft die Datenbank im Programm selbst, und nur dieses Programm kann auf sie zugreifen. Sollen mehrere Programme gleichzeitig dieselben Daten nutzen, startest du Milvus Lite als kleinen Server. Programme verbinden sich dann über das Netzwerkprotokoll gRPC auf Port `19530`, genau wie mit einem großen Milvus-Server.

### 11. Server starten

`--data-dir` legt den Datenordner fest. `--host 127.0.0.1` ist wichtig: Ohne diese Angabe wäre der Server aus dem ganzen Netz erreichbar, ohne Passwort. Der Server läuft im Vordergrund, das Terminal bleibt dabei belegt.

```bash
milvus-lite server --data-dir ~/milvus-test/serverdaten --host 127.0.0.1
```

### 12. Zweites Terminal vorbereiten

Öffne ein zweites Terminal, wechsle in den Projektordner und aktiviere dort ebenfalls die virtuelle Umgebung.

```bash
cd ~/milvus-test && source .venv/bin/activate
```

### 13. Beispiel auf den Server umstellen

Erstellt eine Kopie des Beispielprogramms, die sich statt mit dem Ordner `notizen.db` mit dem Server verbindet. Das ist die einzige Änderung, der übrige Code bleibt gleich.

```bash
cp milvus_demo.py milvus_server_demo.py
```

```bash
nano milvus_server_demo.py
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `MilvusClient(` und drücke <kbd>Enter</kbd>. Die Zeile lautet `client = MilvusClient("notizen.db")`. Ändere die gefundene Zeile so, dass sie lautet:

```python
client = MilvusClient("http://127.0.0.1:19530")
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. Beispiel gegen den Server ausführen

Startet die Kopie. Sie legt die Sammlung jetzt im Server an.

```bash
python milvus_server_demo.py
```

**Prüfen:** Die Ausgabe ist dieselbe wie in Schritt 9. Im Ordner `~/milvus-test/serverdaten` liegen jetzt die Daten des Servers.

### 15. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>. Die Daten bleiben im Ordner `serverdaten` erhalten und stehen beim nächsten Start wieder zur Verfügung.

## Wie geht es weiter?

- **Mit LangChain:** Das Paket `langchain-milvus` bindet Milvus als Vektorspeicher an, siehe [LangGraph und LangChain](langgraph.md).
- **Umzug auf einen großen Milvus-Server:** `milvus-lite dump` schreibt eine Sammlung in JSON-Dateien, die ein vollständiger Milvus-Server einlesen kann, z. B. `milvus-lite dump -d notizen.db -c notizen -p ./export`. Dafür brauchst du einmalig den Zusatz `pip install "pymilvus[bulk_writer]"`.
- **Vergleich:** Für kleinere Projekte ohne Python-Bindung ist [Qdrant](qdrant.md) als eigenständiger Dienst oft einfacher. Liegen die übrigen Daten ohnehin in PostgreSQL, reicht häufig [pgvector](postgresql.md#pgvector-einrichten).

## Aktualisieren

Milvus Lite wird pro Projekt aktualisiert. In der aktivierten virtuellen Umgebung holt dieser Befehl die neuesten Versionen:

```bash
pip install -U "pymilvus[milvus-lite]"
```

Sichere vorher den Datenordner und lies bei einem Sprung der Hauptversion (z. B. von 3 auf 4) die Versionshinweise von Milvus Lite.

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

Schaltet das Terminal zurück auf das Python des Systems. `(.venv)` verschwindet aus der Eingabeaufforderung.

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung, Beispielprogrammen und beiden Datenordnern. **Achtung:** Alle darin gespeicherten Sammlungen gehen verloren. Außerhalb dieses Ordners hat `pip` nichts installiert.

```bash
rm -rf ~/milvus-test
```

### 3. Zwischenspeicher von pip leeren (optional)

`pip` hebt heruntergeladene Pakete in einem Zwischenspeicher auf, um spätere Installationen zu beschleunigen.

```bash
rm -rf ~/.cache/pip
```

**Prüfen:** Der Projektordner existiert nicht mehr.

```bash
ls ~/milvus-test
```
