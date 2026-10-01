# Lokaler Sprachassistent

Diese Anleitung baut aus drei Programmen dieses Buchs einen Sprachassistenten, der vollständig auf dem eigenen Rechner läuft. Man stellt eine Frage ins Mikrofon, [whisper.cpp](whisper-cpp.md) macht daraus Text, ein Sprachmodell in [Ollama](ollama.md) formuliert die Antwort und [Piper](piper.md) liest sie vor. Keine Aufnahme und keine Frage verlässt den Rechner.

## Vorbemerkungen

- **Ablauf:** Aufnahme mit `arecord` → Spracherkennung mit whisper.cpp → Antwort von `qwen3:4b-instruct` in Ollama → Sprachausgabe mit Piper → Wiedergabe mit `aplay`. Ein kleines Python-Programm verbindet die Schritte.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`. Die übrigen Programme richtet diese Anleitung selbst ein. Wer die Anleitungen zu [whisper.cpp](whisper-cpp.md) und [Piper](piper.md) schon durchgearbeitet hat, kennt die Schritte bereits.
- **Grafikkarte:** Im Test auf einer GeForce GTX 1660 mit 6 GB passten das Whisper-Modell und das Sprachmodell gleichzeitig in den Grafikspeicher. Eine Frage samt Antwort dauerte rund vier Sekunden. Ohne Grafikkarte funktioniert alles auch, nur deutlich langsamer.
- **Ohne Mikrofon testen:** Damit der erste Test unabhängig vom Mikrofon gelingt, spricht Piper zuerst zwei Testfragen in Dateien, die der Assistent dann beantwortet.
- **Kleine Modelle wissen wenig:** Im Test hat der Assistent Kiel richtig als Landeshauptstadt genannt, aber eine falsche Einwohnerzahl (180 000 statt rund 250 000). Für Fakten ist ein Modell mit 4 Milliarden Parametern nicht verlässlich.
- **Version:** Getestet mit whisper.cpp 1.8.3 aus Ubuntu 26.04, piper-tts 1.8.0, ollama (Python-Paket) 0.6 und Ollama 0.34.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. whisper.cpp und Python-Umgebungen installieren

- `whisper.cpp` – die Spracherkennung
- `libggml0-backend-vulkan` – damit whisper.cpp auf der Grafikkarte rechnet. Ohne geeignete Grafikkarte kann es entfallen.
- `python3-venv` – für die virtuelle Umgebung des Assistenten

```bash
sudo apt install whisper.cpp libggml0-backend-vulkan python3-venv
```

### 3. Projektordner anlegen

```bash
mkdir ~/assistent
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/assistent
```

### 5. Virtuelle Umgebung anlegen

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung aktivieren

Die Eingabezeile beginnt danach mit `(.venv)`. In jedem neuen Terminal muss die Umgebung erneut aktiviert werden.

```bash
source .venv/bin/activate
```

### 7. Piper und den Ollama-Client installieren

- `piper-tts` – die Sprachausgabe
- `ollama` – die Python-Anbindung an den laufenden Ollama-Dienst

```bash
pip install piper-tts ollama
```

### 8. Deutsche Stimme herunterladen

```bash
python -m piper.download_voices de_DE-thorsten-high
```

### 9. Modell für die Spracherkennung herunterladen

```bash
curl -L -o ggml-large-v3-turbo-q5_0.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q5_0.bin
```

**Prüfen:** Im Ordner liegen `de_DE-thorsten-high.onnx`, `de_DE-thorsten-high.onnx.json` und `ggml-large-v3-turbo-q5_0.bin`.

```bash
ls
```

## Das Programm

### 10. Programm anlegen

```bash
nano assistent.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
import subprocess
import sys
import wave

import ollama
from piper import PiperVoice

WHISPER_MODELL = "ggml-large-v3-turbo-q5_0.bin"
SPRACHMODELL = "qwen3:4b-instruct"
STIMME = PiperVoice.load("de_DE-thorsten-high.onnx")

# Bisheriges Gespräch, damit das Modell Rückfragen versteht
verlauf = [
    {
        "role": "system",
        "content": "Du bist ein freundlicher Sprachassistent. Antworte auf Deutsch in höchstens zwei kurzen Sätzen, "
        "ohne Aufzählungen, Emojis oder Formatierungen, denn deine Antwort wird vorgelesen.",
    }
]


def aufnehmen(datei, sekunden=5):
    """Nimmt über das Standardmikrofon auf."""
    print(f"Sprich jetzt ({sekunden} Sekunden) …")
    subprocess.run(["arecord", "-q", "-f", "S16_LE", "-r", "16000", "-c", "1", "-d", str(sekunden), datei], check=True)


def erkennen(datei):
    """Wandelt Sprache mit whisper.cpp in Text um."""
    ergebnis = subprocess.run(
        ["whisper-cli", "-m", WHISPER_MODELL, "-l", "de", "-nt", "-np", "-f", datei],
        capture_output=True, text=True, check=True,
    )
    return ergebnis.stdout.strip()


def antworten(frage):
    """Fragt das Sprachmodell in Ollama."""
    verlauf.append({"role": "user", "content": frage})
    antwort = ollama.chat(model=SPRACHMODELL, messages=verlauf).message.content
    verlauf.append({"role": "assistant", "content": antwort})
    return antwort


def sprechen(text, datei="antwort.wav"):
    """Spricht den Text mit Piper und spielt ihn ab."""
    with wave.open(datei, "wb") as wav:
        STIMME.synthesize_wav(text, wav)
    subprocess.run(["aplay", "-q", datei], check=True)


def runde(datei):
    frage = erkennen(datei)
    print("Du:", frage)
    antwort = antworten(frage)
    print("Assistent:", antwort)
    sprechen(antwort)


if len(sys.argv) > 1:
    # Fertige Audiodateien nacheinander beantworten
    for datei in sys.argv[1:]:
        runde(datei)
else:
    while input("Enter drücken zum Sprechen, q und Enter zum Beenden: ").strip().lower() != "q":
        aufnehmen("frage.wav")
        runde("frage.wav")
```

- **`verlauf`** – die Liste aller bisherigen Fragen und Antworten. Sie geht bei jeder Frage mit an das Modell, deshalb versteht es Rückfragen wie „Und wie viele Einwohner hat sie?“. Die erste Nachricht mit der Rolle `system` legt fest, wie der Assistent antwortet. Kurze Sätze ohne Aufzählungen klingen beim Vorlesen natürlicher.
- **`aufnehmen`** – nimmt fünf Sekunden im Format auf, mit dem Whisper intern arbeitet.
- **`erkennen`** – ruft `whisper-cli` auf. `-nt` lässt die Zeitangaben weg, `-np` alle Meldungen außer dem erkannten Text.
- **`antworten`** – schickt den Verlauf an Ollama und hängt die Antwort an.
- **`sprechen`** – erzeugt mit Piper die Datei `antwort.wav` und spielt sie mit `aplay` ab.
- **Zwei Betriebsarten:** Mit Dateinamen beim Aufruf beantwortet das Programm diese Aufnahmen. Ohne Dateinamen hört es nach jedem <kbd>Enter</kbd> fünf Sekunden zu.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

## Test ohne Mikrofon

### 11. Erste Testfrage sprechen lassen

Piper spricht die Frage in die Datei `frage1.wav`.

```bash
echo "Wie heißt die Landeshauptstadt von Schleswig-Holstein?" | piper -m de_DE-thorsten-high.onnx -f frage1.wav
```

### 12. Zweite Testfrage sprechen lassen

Eine Rückfrage, die sich auf die erste bezieht.

```bash
echo "Und wie viele Einwohner hat sie ungefähr?" | piper -m de_DE-thorsten-high.onnx -f frage2.wav
```

### 13. Assistent mit den Testfragen starten

```bash
python assistent.py frage1.wav frage2.wav
```

**Prüfen:** Nach einigen Sekunden stehen im Terminal etwa diese Zeilen, und du hörst beide Antworten aus dem Lautsprecher:

```text
Du: Wie heißt die Landeshauptstadt von Schleswig-Holstein?
Assistent: Die Landeshauptstadt von Schleswig-Holstein ist Kiel.
Du: Und wie viele Einwohner hat sie ungefähr?
Assistent: Kiel hat etwa 180.000 Einwohner.
```

Die Rückfrage wurde verstanden: „sie“ hat der Assistent auf Kiel bezogen. Die Zahl ist allerdings falsch, siehe Vorbemerkungen.

## Mit dem Mikrofon sprechen

### 14. Assistent ohne Dateien starten

```bash
python assistent.py
```

### 15. Eine Frage stellen

Drücke <kbd>Enter</kbd>, warte auf `Sprich jetzt (5 Sekunden) …` und stelle deine Frage. Nach der Aufnahme zeigt das Programm, was es verstanden hat, und spricht die Antwort. Danach kannst du mit <kbd>Enter</kbd> die nächste Frage stellen oder mit <kbd>q</kbd> und <kbd>Enter</kbd> aufhören.

**Prüfen:** Hinter `Du:` steht deine Frage. Steht dort etwas, das du nicht gesagt hast, z. B. `Untertitelung des ZDF, 2020`, war die Aufnahme leer. Dann in den Einstellungen von Ubuntu das richtige Mikrofon als Eingabegerät wählen, siehe [whisper.cpp](whisper-cpp.md).

## Wie geht es weiter?

- **Eigenes Wissen:** Statt allgemeiner Fragen kann der Assistent in eigenen Dokumenten nachschlagen. Dafür sucht man vor `antworten` mit [Chroma](chroma.md) passende Abschnitte und gibt sie in der Nachricht mit.
- **Werkzeuge:** Mit `tools=[…]` bei `ollama.chat` kann das Modell Python-Funktionen aufrufen, etwa für die Uhrzeit oder einen Lagerbestand, wie in [Vercel AI SDK](vercel-ai-sdk.md) oder [Mastra](mastra.md) gezeigt.
- **Länger zuhören:** `sekunden=5` in `aufnehmen` ändern oder `whisper-stream` aus [whisper.cpp](whisper-cpp.md) für fortlaufendes Mitschreiben verwenden.
- **Andere Stimme oder anderes Modell:** `STIMME` und `SPRACHMODELL` oben im Programm anpassen.

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung, Stimme, Whisper-Modell und Aufnahmen.

```bash
rm -rf ~/assistent
```

### 3. whisper.cpp entfernen (optional)

Nur ausführen, wenn du whisper.cpp nicht mehr brauchst. Wird `libggml0-backend-vulkan` noch von [llama.cpp](llama-cpp.md) gebraucht, lass es im Befehl weg.

```bash
sudo apt purge whisper.cpp libggml0-backend-vulkan
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

`apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```
