# DSPy

DSPy ist ein Python-Framework aus der Universität Stanford, mit dem man Sprachmodelle programmiert statt Prompts von Hand zu schreiben. Man beschreibt nur, welche Eingaben eine Aufgabe hat und welche Ausgaben herauskommen sollen, als **Signatur**. DSPy baut daraus den Prompt und liest die Antwort wieder in Felder aus. Mit Beispieldaten und einer Bewertungsfunktion kann DSPy den Prompt außerdem selbst **optimieren**, etwa indem es gute Beispiele auswählt.

## Vorbemerkungen

- **Die Idee:** Ein Programm besteht aus Modulen wie `dspy.Predict` (einfache Anfrage), `dspy.ChainOfThought` (erst nachdenken, dann antworten) oder `dspy.ReAct` (Agent mit Werkzeugen). Optimierer wie `BootstrapFewShot` verbessern diese Module anhand messbarer Ergebnisse. Den Prompt muss man dabei nicht anfassen.
- **Sprachmodell:** DSPy spricht OpenAI, Anthropic, Google und viele andere an. Diese Anleitung verwendet ein lokales Modell über [Ollama](ollama.md). Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`.
- **Zwischenspeicher:** DSPy speichert jede Antwort des Modells in `~/.dspy_cache`. Ein zweiter Aufruf mit genau denselben Eingaben liefert die gespeicherte Antwort, ohne das Modell zu fragen. Das spart Zeit beim Entwickeln, kann beim Ausprobieren aber verwirren. `cache=False` schaltet es ab.
- **Installation über pip:** DSPy ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine **virtuelle Umgebung** installiert, rund 300 MB.
- **Version:** Getestet mit dspy **3.4.0** unter Python 3.14 aus Ubuntu 26.04.

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
mkdir ~/agent-dspy
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-dspy
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

### 7. DSPy installieren

```bash
pip install dspy
```

**Prüfen:** Die Ausgabe nennt `Version: 3.4.0` oder eine neuere Version.

```bash
pip show dspy
```

## Beispiel 1: Eine Signatur

### 8. Programm anlegen

Das Programm soll Kundenbewertungen als positiv, neutral oder negativ einordnen und kurz begründen.

```bash
nano erste.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
import dspy

# Lokales Modell über Ollama
lm = dspy.LM("ollama_chat/qwen3:4b-instruct", api_base="http://localhost:11434/v1")
dspy.configure(lm=lm)


# Eine Signatur beschreibt, was hineingeht und was herauskommt
class Stimmung(dspy.Signature):
    """Bestimme die Stimmung einer Kundenbewertung."""

    bewertung: str = dspy.InputField()
    stimmung: str = dspy.OutputField(desc="positiv, neutral oder negativ")
    begruendung: str = dspy.OutputField(desc="ein kurzer Satz auf Deutsch")


einschaetzen = dspy.Predict(Stimmung)

for text in [
    "Das Fahrrad kam schnell und ist super verarbeitet.",
    "Die Lieferung dauerte drei Wochen, und der Sattel war kaputt.",
    "Ganz okay, nichts Besonderes.",
]:
    ergebnis = einschaetzen(bewertung=text)
    print(f"{ergebnis.stimmung:9} | {ergebnis.begruendung}")

# So sah der Prompt aus, den DSPy aus der Signatur gebaut hat
dspy.inspect_history(n=1)
```

- **Modell:** `ollama_chat/…` wählt Ollama. DSPy spricht es über die OpenAI-kompatible Schnittstelle an, deshalb endet `api_base` auf `/v1`. Ohne `/v1` meldet DSPy `404 page not found`. Einen `api_key` gibt man für Ollama gar nicht an. Ein leerer Schlüssel (`api_key=""`) führt zum Fehler `empty credential`.
- **Signatur:** Die Klasse beschreibt die Aufgabe. Der Docstring wird zur Aufgabenbeschreibung im Prompt, `InputField` und `OutputField` zu den Feldern, `desc` zu Hinweisen für das Modell.
- **Modul:** `dspy.Predict(Stimmung)` macht aus der Signatur eine aufrufbare Funktion. Das Ergebnis hat für jedes Ausgabefeld ein Attribut.
- **`inspect_history`** zeigt den letzten Prompt samt Antwort.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Programm ausführen

```bash
python erste.py
```

**Prüfen:** Die ersten drei Zeilen lauten sinngemäß:

```text
positiv   | Die Bewertung enthält positive Bestimmungen wie „schnell“ und „super verarbeitet“.
negativ   | Die Kundenbewertung erwähnt eine lange Lieferzeit und einen defekten Produkt, …
neutral   | Die Bewertung besagt, dass etwas „ganz okay“ ist, aber nichts Besonderes, …
```

Darunter steht der Prompt, den DSPy gebaut hat: eine Beschreibung der Felder, die Aufgabe aus dem Docstring und Markierungen wie `[[ ## stimmung ## ]]`, an denen DSPy die Antwort wieder in Felder zerlegt. Führst du das Programm erneut aus, kommen die Antworten sofort aus dem Zwischenspeicher.

## Beispiel 2: Automatisch optimieren

### 10. Programm anlegen

Das Programm ordnet Kundenanfragen an einen Fahrradladen einer Abteilung zu. Es misst die Trefferquote an zehn Prüfbeispielen, lässt DSPy den Prompt anhand von acht Lernbeispielen verbessern und misst erneut.

```bash
nano optimieren.py
```

Füge diesen Inhalt ein:

```python
import dspy

lm = dspy.LM("ollama_chat/qwen3:4b-instruct", api_base="http://localhost:11434/v1")
dspy.configure(lm=lm)


class Anfrage(dspy.Signature):
    """Ordne eine Kundenanfrage an einen Fahrradladen einer Abteilung zu."""

    nachricht: str = dspy.InputField()
    abteilung: str = dspy.OutputField(desc="genau eines von: lieferung, rechnung, werkstatt, sonstiges")


def beispiel(nachricht, abteilung):
    return dspy.Example(nachricht=nachricht, abteilung=abteilung).with_inputs("nachricht")


# Beispiele zum Lernen
training = [
    beispiel("Wo bleibt mein Paket? Bestellt habe ich vor zehn Tagen.", "lieferung"),
    beispiel("Auf der Rechnung steht der falsche Betrag.", "rechnung"),
    beispiel("Meine Gangschaltung springt ständig raus.", "werkstatt"),
    beispiel("Habt ihr am Samstag geöffnet?", "sonstiges"),
    beispiel("Der Kurier hat das Rad beim Nachbarn abgegeben, der ist aber verreist.", "lieferung"),
    beispiel("Ich möchte per Überweisung statt mit Karte zahlen.", "rechnung"),
    beispiel("Können Sie meine Scheibenbremsen entlüften?", "werkstatt"),
    beispiel("Sucht ihr noch Aushilfen für den Sommer?", "sonstiges"),
]

# Beispiele zum Prüfen, die beim Lernen nicht vorkommen
pruefung = [
    beispiel("Die Sendungsnummer funktioniert nicht.", "lieferung"),
    beispiel("Bitte schicken Sie mir eine Kopie der Rechnung vom März.", "rechnung"),
    beispiel("Das Hinterrad eiert seit dem Sturz.", "werkstatt"),
    beispiel("Kann ich bei euch einen Gutschein kaufen?", "sonstiges"),
    beispiel("Mein Paket wurde als zugestellt markiert, ist aber nicht da.", "lieferung"),
    beispiel("Ich wurde für die Bestellung zweimal belastet.", "rechnung"),
    beispiel("Die Kette quietscht, obwohl ich sie geölt habe.", "werkstatt"),
    beispiel("Wie lange habt ihr heute auf?", "sonstiges"),
    beispiel("Der Karton kam beschädigt an.", "lieferung"),
    beispiel("Die Mahnung ist doch längst bezahlt.", "rechnung"),
]


def richtig(beispiel, vorhersage, trace=None):
    """Bewertung: 1, wenn die Abteilung stimmt, sonst 0."""
    return beispiel.abteilung == vorhersage.abteilung.strip().lower()


pruefen = dspy.Evaluate(devset=pruefung, metric=richtig, display_progress=False)

einfach = dspy.Predict(Anfrage)
print("Vorher:", pruefen(einfach).score, "%")

optimierer = dspy.BootstrapFewShot(metric=richtig, max_bootstrapped_demos=4, max_labeled_demos=4)
optimiert = optimierer.compile(einfach, trainset=training)
print("Nachher:", pruefen(optimiert).score, "%")

optimiert.save("anfrage.json")
```

- **`dspy.Example`** – ein Beispiel mit Eingabe und erwartetem Ergebnis. `with_inputs("nachricht")` legt fest, welches Feld Eingabe ist.
- **Metrik:** `richtig` bewertet eine Vorhersage. Sie ist der Maßstab, an dem DSPy misst und optimiert.
- **`dspy.Evaluate`** – lässt das Programm alle Prüfbeispiele beantworten und liefert den Anteil richtiger Antworten.
- **`BootstrapFewShot`** – lässt das Programm die Lernbeispiele bearbeiten, behält die richtig gelösten und setzt bis zu vier davon als Musterbeispiele in den Prompt.
- **`save`** – speichert das optimierte Programm samt ausgewählter Beispiele als JSON. Ein neues `dspy.Predict(Anfrage)` lädt es mit `.load("anfrage.json")` wieder.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Programm ausführen

Der Lauf dauert etwa eine halbe Minute.

```bash
python optimieren.py
```

**Prüfen:** Zwischen Meldungen von DSPy stehen die Zeilen:

```text
Vorher: 80.0 %
Nachher: 100.0 %
```

Im Test ordnete das einfache Programm „Ich wurde für die Bestellung zweimal belastet.“ der Lieferung statt der Rechnung zu und „Wie lange habt ihr heute auf?“ der Werkstatt statt „sonstiges“. Mit den vier Musterbeispielen im Prompt waren alle zehn Prüfbeispiele richtig. Das Ergebnis war auch ohne Zwischenspeicher bei wiederholten Läufen gleich. Im Ordner liegt jetzt `anfrage.json` mit den ausgewählten Beispielen.

## Wie geht es weiter?

- **Nachdenken lassen:** `dspy.ChainOfThought(Stimmung)` statt `dspy.Predict` fügt ein Feld `reasoning` hinzu, in dem das Modell vor der Antwort überlegt.
- **Kurzschreibweise:** Einfache Signaturen lassen sich als Text schreiben, z. B. `dspy.Predict("frage -> antwort")`.
- **Agenten:** `dspy.ReAct(Signatur, tools=[funktion])` baut einen Agenten, der Python-Funktionen als Werkzeuge aufruft.
- **Stärkere Optimierer:** `MIPROv2` und `GEPA` schreiben auch die Aufgabenbeschreibung um und probieren viele Varianten aus. Sie brauchen mehr Beispiele und deutlich mehr Anfragen an das Modell.
- **Dokumentation:** <https://dspy.ai>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung und `anfrage.json`.

```bash
rm -rf ~/agent-dspy
```

### 3. Zwischenspeicher von DSPy entfernen

Löscht die gespeicherten Antworten des Modells.

```bash
rm -rf ~/.dspy_cache
```

### 4. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
