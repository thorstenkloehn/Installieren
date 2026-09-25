# Microsoft GraphRAG

GraphRAG ist ein Werkzeug von Microsoft, das aus Texten einen **Wissensgraphen** baut. Ein Sprachmodell liest die Dokumente, erkennt Personen, Organisationen, Orte und Ereignisse und die Beziehungen zwischen ihnen. Es fasst zusammenhängende Gruppen zu Themen zusammen. Fragen werden danach mit Hilfe dieses Graphen beantwortet. Das hilft besonders bei Fragen nach Zusammenhängen, die über mehrere Textstellen verteilt sind. Diese Anleitung nutzt [Ollama](ollama.md) als lokales Sprachmodell.

## Vorbemerkungen

- **Voraussetzung:** [Ollama](ollama.md) läuft und hat die Modelle `qwen3:4b-instruct` und `nomic-embed-text` geladen.
- **Python-Version:** GraphRAG 3.2 läuft nur mit Python 3.11 bis 3.13. Ubuntu 26.04 bringt Python 3.14 mit, und ältere Versionen gibt es in den Paketquellen nicht. Die Anleitung verwendet deshalb **uv**, einen schnellen Paketmanager für Python. Er lädt für das Projekt ein passendes Python 3.13 herunter, ohne das Python von Ubuntu zu verändern. `uv` selbst wird mit `pipx` installiert, wie es die Anleitung [Python](python.md) für Kommandozeilenprogramme empfiehlt.
- **Version:** Getestet mit GraphRAG 3.2.0, uv 0.12, Python 3.13 und Ollama 0.34 auf einer GeForce GTX 1660.
- **Rechenaufwand:** GraphRAG schickt beim Aufbau des Graphen sehr viele Anfragen an das Sprachmodell. Drei kurze Absätze haben im Test fast fünf Minuten gebraucht. Für große Textmengen ist ein lokales 4B-Modell zu langsam und zu ungenau. Dort nimmt man ein größeres Modell oder einen Cloud-Anbieter.
- **Ergebnis im Test:** Die lokale Suche (`--method local`) hat Fragen nach Zusammenhängen richtig beantwortet. Der Graph enthielt aber auch Fehler des kleinen Modells, etwa falsch geschriebene Namen. Die globale Suche (`--method global`) lieferte mit diesem Modell keine Antwort.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von `pipx` kennt.

```bash
sudo apt update
```

### 2. pipx installieren

`pipx` installiert Python-Programme jeweils in eine eigene Umgebung.

```bash
sudo apt install pipx
```

### 3. uv installieren

Installiert `uv` und legt die Befehle `uv` und `uvx` in `~/.local/bin` ab.

```bash
pipx install uv
```

**Prüfen:** Die Versionsnummer erscheint, z. B. `uv 0.12.19`. Fehlt der Befehl, `pipx ensurepath` ausführen und ein neues Terminal öffnen.

```bash
uv --version
```

### 4. Projektordner anlegen

Legt einen Ordner für das Beispiel an.

```bash
mkdir ~/graphrag-test
```

### 5. In den Projektordner wechseln

Alle weiteren Befehle arbeiten in diesem Ordner.

```bash
cd ~/graphrag-test
```

### 6. Virtuelle Umgebung mit Python 3.13 anlegen

`uv` lädt Python 3.13 herunter (nach `~/.local/share/uv`) und legt damit im Unterordner `.venv` eine virtuelle Umgebung an.

```bash
uv venv --python 3.13
```

**Prüfen:** Die Ausgabe beginnt mit `Using CPython 3.13`.

### 7. GraphRAG installieren

Installiert GraphRAG mit allen Abhängigkeiten in die Umgebung aus Schritt 6. `uv` findet den Ordner `.venv` im aktuellen Ordner von selbst und ist dabei deutlich schneller als `pip`.

```bash
uv pip install graphrag
```

### 8. Virtuelle Umgebung aktivieren

Ab jetzt ist der Befehl `graphrag` in diesem Terminal verfügbar. Vor der Eingabeaufforderung steht `(graphrag-test)`.

```bash
source .venv/bin/activate
```

**Prüfen:** Die Hilfe von GraphRAG erscheint mit den Befehlen `init`, `index` und `query`.

```bash
graphrag --help
```

## Projekt einrichten

### 9. Projekt anlegen

Erzeugt die Einstellungsdatei `settings.yaml`, die Datei `.env` für Zugangsdaten, den Ordner `input` für die Texte und den Ordner `prompts` mit den Anweisungen an das Sprachmodell. `-m` und `-e` geben das Chat- und das Embedding-Modell an. Ohne diese Angaben fragt der Befehl danach.

```bash
graphrag init --root . -m qwen3:4b-instruct -e nomic-embed-text
```

### 10. Platzhalter-Schlüssel eintragen

GraphRAG verlangt einen API-Schlüssel. Ollama braucht keinen und ignoriert ihn, deshalb reicht ein Platzhalter.

```bash
nano .env
```

Ändere die Zeile `GRAPHRAG_API_KEY=<API_KEY>` so ab, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
GRAPHRAG_API_KEY=ollama
```

### 11. Einstellungen an Ollama anpassen

GraphRAG spricht standardmäßig mit OpenAI. Ollama bietet unter `/v1` eine Schnittstelle im selben Format an. Man muss GraphRAG nur die Adresse nennen.

```bash
nano settings.yaml
```

Nimm diese vier Änderungen vor. <kbd>Strg</kbd>+<kbd>W</kbd> sucht jeweils nach dem Text.

1. Suche `model: qwen3:4b-instruct`. Füge direkt darunter eine neue Zeile mit derselben Einrückung ein:

   ```yaml
       api_base: http://127.0.0.1:11434/v1
   ```

2. Suche `model: nomic-embed-text` und füge darunter dieselbe Zeile ein.
3. Suche `size: 1200` und ändere den Wert auf `size: 600`. Ollama verarbeitet standardmäßig nur 4.096 Tokens auf einmal. Kleinere Textabschnitte passen mit den Anweisungen von GraphRAG hinein.
4. Suche `max_input_length: 8000` und ändere den Wert auf `max_input_length: 2500`. Aus demselben Grund.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. Die Einrückung muss aus Leerzeichen bestehen, sonst kann GraphRAG die Datei nicht lesen.

**Prüfen:** Die Datei enthält die neuen Werte.

```bash
grep -nE "api_base|size: 600|max_input_length" settings.yaml
```

### 12. Beispieltext schreiben

GraphRAG liest alle Textdateien im Ordner `input`. Der Text über eine erfundene Rösterei enthält Personen, Firmen, Orte und ein Ereignis.

```bash
nano input/roesterei.txt
```

Füge diesen Inhalt ein, speichere und beende nano:

```text
Die Kaffeerösterei Stormarn wurde 2011 von Jana Petersen in Ahrensburg gegründet. Jana Petersen hatte vorher bei der Hamburger Reederei Nordlicht gearbeitet.
Die Rösterei bezieht ihren Rohkaffee von der Kooperative La Esperanza in Kolumbien. Aus diesem Kaffee entsteht die beliebteste Sorte "Schlossblick", benannt nach dem Ahrensburger Schloss.
Seit 2020 beliefert die Rösterei das Café am Schloss, das von Tom Becker geführt wird. Tom Becker und Jana Petersen organisieren gemeinsam jedes Jahr im September das Ahrensburger Kaffeefest.
```

## Graph bauen und abfragen

### 13. Index aufbauen

Liest den Text, lässt das Sprachmodell Einträge und Beziehungen herausziehen, bildet Themengruppen, schreibt Berichte dazu und berechnet Vektoren. Das Ergebnis landet im Ordner `output`. Im Test dauerte das knapp fünf Minuten.

```bash
graphrag index --root .
```

**Prüfen:** Die letzte Zeile lautet `Pipeline complete`.

### 14. Erkannte Einträge ansehen

Die Ergebnisse liegen als Parquet-Dateien vor. Dieser Befehl zeigt die erkannten Einträge mit ihrem Typ.

```bash
python -c "import pandas as pd; print(pd.read_parquet('output/entities.parquet')[['title','type']])"
```

**Prüfen:** Die Liste enthält u. a. `JANA PETERSEN` und `TOM BECKER` (Typ `PERSON`), `KAFFEERÖSTEREI STORMARN` (Typ `ORGANIZATION`) und `AHRENSBURG` (Typ `GEO`). Einzelne Namen können falsch geschrieben sein, im Test z. B. „SCHLOSSLICK“.

### 15. Frage nach einem Zusammenhang stellen

Die lokale Suche geht von den Einträgen aus, die zur Frage passen, und folgt ihren Beziehungen im Graphen.

```bash
graphrag query --root . --method local "Welche Verbindung besteht zwischen Jana Petersen und Tom Becker?"
```

**Prüfen:** Die Antwort nennt das gemeinsam organisierte Kaffeefest und dass die Rösterei seit 2020 das Café am Schloss beliefert. Die Angaben wie `[Data: Entities (1, 6); Relationships (5)]` verweisen auf die Stellen im Graphen, auf die sich die Antwort stützt.

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

Stellt das Terminal wieder auf das Python des Systems um.

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner mit virtueller Umgebung, Texten, Graph und Einstellungen.

```bash
rm -rf ~/graphrag-test
```

### 3. Zwischenspeicher von uv leeren

`uv` hebt heruntergeladene Pakete auf, im Test rund 1 GB.

```bash
uv cache clean
```

### 4. Python 3.13 von uv entfernen

Entfernt das Python, das `uv` in Schritt 6 heruntergeladen hat. Das Python von Ubuntu bleibt unberührt.

```bash
uv python uninstall 3.13
```

### 5. uv entfernen

Entfernt `uv` selbst.

```bash
pipx uninstall uv
```

### 6. pipx entfernen (optional)

Nur ausführen, wenn du keine anderen Programme mit `pipx` installiert hast. `pipx list` zeigt, welche es gibt.

```bash
sudo apt purge pipx
```

```bash
sudo apt autoremove
```

**Prüfen:** Der Befehl `uv` wird nicht mehr gefunden.

```bash
uv --version
```
