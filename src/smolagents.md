# smolagents

smolagents ist eine kleine Python-Bibliothek für KI-Agenten von Hugging Face. Ihre Besonderheit sind **Code-Agenten**: Statt ein Werkzeug nach dem anderen per JSON aufzurufen, schreibt das Sprachmodell ein kurzes Python-Programm, das die Werkzeuge verwendet, Zwischenergebnisse in Variablen speichert und rechnet. smolagents führt das Programm aus und gibt dem Modell die Ausgabe zurück. So erledigt ein Agent mehrere Schritte oft in einem einzigen Durchgang.

## Vorbemerkungen

- **Zwei Arten von Agenten:** `CodeAgent` lässt das Modell Python schreiben. `ToolCallingAgent` arbeitet wie die meisten anderen Frameworks mit einzelnen Werkzeugaufrufen. Beispiel 2 vergleicht beide.
- **Sprachmodell:** smolagents spricht Modelle von Hugging Face, OpenAI, über LiteLLM und jeden Dienst mit der Schnittstelle von OpenAI an. Diese Anleitung verwendet ein lokales Modell über [Ollama](ollama.md). Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`.
- **Vom Modell geschriebener Code:** Der `CodeAgent` führt Code aus, den das Modell erzeugt hat. smolagents verwendet dafür einen eigenen Python-Interpreter, der nur freigegebene Module importieren darf und gefährliche Funktionen sperrt. Eine echte Sandbox ist das nicht. Für fremde Eingaben oder heikle Umgebungen bietet smolagents die Ausführung in Docker oder bei Cloud-Diensten an.
- **Installation über pip:** smolagents ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine **virtuelle Umgebung** installiert, rund 125 MB.
- **Version:** Getestet mit smolagents **1.26.0** unter Python 3.14 aus Ubuntu 26.04.

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
mkdir ~/agent-smol
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-smol
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

### 7. smolagents installieren

`[openai]` installiert zusätzlich die Bibliothek für die OpenAI-kompatible Schnittstelle, über die Ollama angesprochen wird. Die Anführungszeichen verhindern, dass die Shell die eckigen Klammern auswertet.

```bash
pip install "smolagents[openai]"
```

**Prüfen:** Die Ausgabe nennt `Version: 1.26.0` oder eine neuere Version.

```bash
pip show smolagents
```

## Beispiel 1: Ein Code-Agent

### 8. Programm anlegen

Der Agent soll ausrechnen, wie viele Einwohner zwei Landeshauptstädte zusammen haben. Dafür braucht er zwei Werkzeuge nacheinander und muss danach rechnen.

```bash
nano agent.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
from smolagents import CodeAgent, OpenAIModel, tool

# Lokales Modell über die OpenAI-kompatible Schnittstelle von Ollama
modell = OpenAIModel(
    model_id="qwen3:4b-instruct",
    api_base="http://localhost:11434/v1",
    api_key="ollama",
)

HAUPTSTAEDTE = {
    "schleswig-holstein": "Kiel",
    "hamburg": "Hamburg",
    "niedersachsen": "Hannover",
    "bayern": "München",
}

EINWOHNER = {"Kiel": 247000, "Hamburg": 1910000, "Hannover": 548000, "München": 1510000}


@tool
def landeshauptstadt(bundesland: str) -> str:
    """Liefert die Landeshauptstadt eines deutschen Bundeslands.

    Args:
        bundesland: Name des Bundeslands, z. B. Bayern.
    """
    return HAUPTSTAEDTE.get(bundesland.lower(), "unbekannt")


@tool
def einwohner(stadt: str) -> int:
    """Liefert die ungefähre Einwohnerzahl einer Stadt.

    Args:
        stadt: Name der Stadt, z. B. Kiel.
    """
    if stadt not in EINWOHNER:
        # Fehler statt 0: Der Agent sieht die Meldung und kann sich korrigieren
        raise ValueError(f"Unbekannte Stadt {stadt!r}. Bekannt sind: {', '.join(EINWOHNER)}")
    return EINWOHNER[stadt]


agent = CodeAgent(
    tools=[landeshauptstadt, einwohner],
    model=modell,
    max_steps=5,
    instructions="Ermittle Landeshauptstädte immer mit dem Werkzeug landeshauptstadt, "
    "nie aus dem Gedächtnis. Gib als Endergebnis nur die Zahl zurück.",
)

antwort = agent.run(
    "Wie viele Einwohner haben die Landeshauptstädte von Schleswig-Holstein und Bayern zusammen?"
)
print("Antwort:", antwort)
```

- **Modell:** `OpenAIModel` spricht die Chat-Schnittstelle von OpenAI, `api_base` zeigt auf Ollama. Ollama prüft den Schlüssel nicht, die Bibliothek verlangt aber einen.
- **Werkzeuge:** `@tool` macht aus einer Funktion ein Werkzeug. smolagents verlangt Typangaben für alle Parameter und den Rückgabewert und im Docstring einen Abschnitt `Args:`, der jeden Parameter beschreibt. Daraus baut es die Beschreibung für das Modell.
- **Fehler statt stiller Vorgabewerte:** `einwohner` löst bei einer unbekannten Stadt einen Fehler aus, statt 0 zurückzugeben. Im Test schrieb das Modell manchmal „Munich“ statt „München“. Mit einer stillen 0 kam dann ein falsches Ergebnis heraus. Mit der Fehlermeldung sieht der Agent, welche Städte es gibt, und korrigiert sich im nächsten Schritt.
- **Anweisungen:** Ohne den Hinweis in `instructions` übersprang das kleine Modell oft das Werkzeug `landeshauptstadt` und verwendete eigenes, teils falsches Wissen.
- **`max_steps`** begrenzt die Zahl der Durchgänge, damit ein Agent nicht endlos weiterläuft.
- **`final_answer`** ist ein Werkzeug, das smolagents selbst mitbringt. Ruft das Programm des Modells es auf, ist der Lauf beendet.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Programm ausführen

```bash
python agent.py
```

**Prüfen:** smolagents zeigt in Kästen die Aufgabe, den vom Modell geschriebenen Code, dessen Ausgabe und die Antwort. Ein typischer Lauf (Kommentare im Code gekürzt):

```text
 ─ Executing parsed code: ─────────────────────────────────────────────────────
  capital_schleswig_holstein = landeshauptstadt("Schleswig-Holstein")
  print(f"Capital of Schleswig-Holstein: {capital_schleswig_holstein}")
  capital_bayern = landeshauptstadt("Bayern")
  print(f"Capital of Bayern: {capital_bayern}")
  population_schleswig_holstein = einwohner(capital_schleswig_holstein)
  population_bayern = einwohner(capital_bayern)
  total_population = population_schleswig_holstein + population_bayern
  final_answer(total_population)
Execution logs:
Capital of Schleswig-Holstein: Kiel
Capital of Bayern: München

Final answer: 1757000
[Step 1: Duration 5.51 seconds| Input tokens: 2,188 | Output tokens: 251]
Antwort: 1757000
```

Das Modell hat alle Werkzeugaufrufe und die Addition in einem einzigen Programm erledigt. Der Code ist bei jedem Lauf etwas anders, die Kommentare darin schreibt das Modell meist auf Englisch. Manchmal braucht der Agent zwei oder drei Schritte, etwa wenn er zuerst nur die Hauptstädte abfragt oder einen Fehler von `einwohner` korrigiert. Im Test lieferten 8 von 8 Läufen `1757000`.

## Beispiel 2: Vergleich mit einzelnen Werkzeugaufrufen

### 10. Programm kopieren

Die Vergleichsfassung ist dasselbe Programm mit einer anderen Art von Agent.

```bash
cp agent.py vergleich.py
```

### 11. Art des Agenten ändern

```bash
nano vergleich.py
```

Ersetze `CodeAgent` an beiden Stellen durch `ToolCallingAgent`: in der ersten Zeile beim `import` und bei `agent = CodeAgent(`. Mit <kbd>Strg</kbd>+<kbd>\\</kbd> ersetzt nano Text: Gib `CodeAgent` ein, drücke <kbd>Enter</kbd>, gib `ToolCallingAgent` ein, drücke <kbd>Enter</kbd> und bestätige mit <kbd>A</kbd> (alle ersetzen).

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Vergleich ausführen

```bash
python vergleich.py
```

**Prüfen:** Jetzt zeigt smolagents für jeden Schritt einen Kasten `Calling tool: …` mit einem einzelnen Werkzeugaufruf: zweimal `landeshauptstadt`, zweimal `einwohner` und am Ende `final_answer`.

Im Test brauchte der `ToolCallingAgent` jedes Mal 6 Schritte und rund 8 400 Eingabe-Tokens, der `CodeAgent` 1 bis 3 Schritte und rund 2 200 bis 7 500 Tokens. Mit dem kleinen lokalen Modell fehlte beim `ToolCallingAgent` außerdem in 2 von 3 Läufen die Summe in der Antwort: Er nannte nur die beiden Städte. Bei Aufgaben, in denen Ergebnisse weiterverarbeitet werden, ist der Code-Agent deshalb meist schneller und verlässlicher.

## Wie geht es weiter?

- **Weitere Module erlauben:** Der Code-Agent darf ab Werk nur wenige Module importieren, etwa `math`, `datetime` oder `re`. Mit `additional_authorized_imports=["json"]` gibt man weitere frei.
- **Fertige Werkzeuge:** smolagents bringt Werkzeuge mit, z. B. eine Websuche (`WebSearchTool`) oder das Abrufen von Webseiten. Werkzeuge lassen sich auch über den Hugging Face Hub teilen oder per MCP anbinden.
- **Weboberfläche:** Mit `pip install "smolagents[gradio]"` und `GradioUI(agent).launch()` bekommt ein Agent eine Chat-Oberfläche im Browser.
- **Mehrere Agenten:** Ein Agent kann andere Agenten als Werkzeuge verwenden (`managed_agents=[…]`).
- **Dokumentation:** <https://huggingface.co/docs/smolagents>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung.

```bash
rm -rf ~/agent-smol
```

### 3. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
