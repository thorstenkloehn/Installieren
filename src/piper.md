# Piper

Piper ist eine Sprachausgabe, die Text auf dem eigenen Rechner in natürlich klingende Sprache umwandelt. Es ist schnell genug für den Prozessor, braucht keine Grafikkarte und bringt Stimmen für viele Sprachen mit, darunter mehrere deutsche. Typische Einsätze sind Sprachassistenten, Vorlesen von Texten und Ansagen.

## Vorbemerkungen

- **Gegenstück zu whisper.cpp:** [whisper.cpp](whisper-cpp.md) macht aus Sprache Text, Piper macht aus Text Sprache. Zusammen mit einem Sprachmodell aus [Ollama](ollama.md) ergeben sie einen Sprachassistenten, der vollständig lokal läuft.
- **Nicht das Ubuntu-Paket `piper`:** In den Ubuntu-Paketquellen gibt es ein Paket `piper`. Das ist aber ein anderes Programm, mit dem man Gaming-Mäuse einstellt. Die Sprachausgabe Piper heißt bei pip `piper-tts` und wird in eine **virtuelle Umgebung** installiert, rund 200 MB.
- **Stimme:** Die Anleitung verwendet die deutsche Stimme `de_DE-thorsten-high` (114 MB). Sie beruht auf den Aufnahmen des Projekts Thorsten-Voice, die unter der freien Lizenz CC0 stehen. Weitere deutsche Stimmen sind `kerstin`, `ramona`, `eva_k` und `karlsson`, meist in geringerer Qualität.
- **Lizenz von Piper:** Piper selbst steht unter der GPL 3. Für eigene Programme, die Piper einbinden und weitergegeben werden, ist das zu beachten.
- **Version:** Getestet mit piper-tts **1.8.0** unter Python 3.14 aus Ubuntu 26.04. Zur Kontrolle hat [whisper.cpp](whisper-cpp.md) die erzeugten Sätze wieder in Text umgewandelt. Sie kamen Wort für Wort richtig zurück.

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

Hier liegen später das Programm, die Stimmen und die erzeugten Audiodateien.

```bash
mkdir ~/piper
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/piper
```

### 5. Virtuelle Umgebung anlegen

Legt eine eigene Python-Umgebung für dieses Projekt im Unterordner `.venv` an. Ubuntu verhindert absichtlich, dass `pip` Pakete systemweit installiert.

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung aktivieren

Danach verwenden `python`, `pip` und `piper` die Umgebung. Die Eingabezeile beginnt mit `(.venv)`. In jedem neuen Terminal muss die Umgebung erneut aktiviert werden.

```bash
source .venv/bin/activate
```

### 7. Piper installieren

```bash
pip install piper-tts
```

**Prüfen:** Die Ausgabe nennt `Version: 1.8.0` oder eine neuere Version.

```bash
pip show piper-tts
```

### 8. Deutsche Stimmen anzeigen

Ohne Angabe einer Stimme listet der Befehl alle verfügbaren Stimmen auf. `grep de_DE` zeigt nur die deutschen.

```bash
python -m piper.download_voices | grep de_DE
```

**Prüfen:** Die Liste enthält unter anderem `de_DE-thorsten-high`.

### 9. Stimme herunterladen

Lädt die Stimme aus dem Hugging-Face-Konto des Projekts in den aktuellen Ordner. Zu jeder Stimme gehören zwei Dateien: das Modell (`.onnx`) und seine Einstellungen (`.onnx.json`).

```bash
python -m piper.download_voices de_DE-thorsten-high
```

**Prüfen:** Die Liste zeigt `de_DE-thorsten-high.onnx` und `de_DE-thorsten-high.onnx.json`.

```bash
ls
```

## Erste Schritte

### 10. Einen Satz in eine Datei sprechen

`echo` gibt den Text an Piper weiter. `-m` wählt die Stimme, `-f` die Ausgabedatei.

```bash
echo "Willkommen in Ahrensburg. Die Werkstatt nimmt Reparaturen dienstags und donnerstags an." | piper -m de_DE-thorsten-high.onnx -f test.wav
```

**Prüfen:** Nach etwa zwei Sekunden liegt die Datei `test.wav` im Ordner.

### 11. Datei abspielen

`aplay` gehört bei Ubuntu zur Grundausstattung und spielt WAV-Dateien über den Standard-Lautsprecher ab.

```bash
aplay test.wav
```

**Prüfen:** Du hörst den Satz. Im Terminal steht `Wiedergabe: WAVE 'test.wav' : Signed 16 bit Little Endian, Rate: 22050 Hz, mono`.

### 12. Direkt sprechen, ohne Datei

`--output-raw` gibt die Audiodaten fortlaufend aus, statt eine Datei zu schreiben. `aplay` spielt sie sofort ab. Weil dabei die Angaben einer WAV-Datei fehlen, nennt man `aplay` das Format: 22 050 Messwerte pro Sekunde, 16 Bit, ein Kanal.

```bash
echo "Hallo aus dem Lautsprecher." | piper -m de_DE-thorsten-high.onnx --output-raw | aplay -r 22050 -f S16_LE -t raw -c 1 -
```

### 13. Eine Textdatei vorlesen

Lege eine Textdatei mit einigen Sätzen an:

```bash
nano vorlesen.txt
```

Schreibe ein paar Sätze hinein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. Danach liest Piper die Datei vor. `--sentence-silence 0.5` fügt nach jedem Satz eine halbe Sekunde Pause ein.

```bash
piper -m de_DE-thorsten-high.onnx -i vorlesen.txt -f vorlesen.wav --sentence-silence 0.5
```

```bash
aplay vorlesen.wav
```

## Aus Python verwenden

### 14. Programm anlegen

Das Programm erzeugt denselben Satz zweimal, einmal normal und einmal langsamer gesprochen, und gibt die Länge der Aufnahmen aus.

```bash
nano sprechen.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
import wave

from piper import PiperVoice, SynthesisConfig

stimme = PiperVoice.load("de_DE-thorsten-high.onnx")

satz = "Ihr Fahrrad ist fertig. Sie können es ab morgen um neun Uhr abholen."
fassungen = {
    "normal.wav": SynthesisConfig(),
    "langsam.wav": SynthesisConfig(length_scale=1.4),
}

for datei, einstellung in fassungen.items():
    with wave.open(datei, "wb") as wav:
        stimme.synthesize_wav(satz, wav, syn_config=einstellung)
    with wave.open(datei, "rb") as wav:
        print(f"{datei}: {wav.getnframes() / wav.getframerate():.1f} Sekunden")
```

- **`PiperVoice.load`** – lädt die Stimme einmal. Die Einstellungsdatei `.onnx.json` findet Piper von selbst, wenn sie daneben liegt.
- **`SynthesisConfig`** – Einstellungen für das Sprechen. `length_scale` dehnt die Laute: Werte über 1 sprechen langsamer, unter 1 schneller. Weitere Angaben sind etwa `volume` für die Lautstärke.
- **`synthesize_wav`** – schreibt die Sprache in eine geöffnete WAV-Datei.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. Programm ausführen

```bash
python sprechen.py
```

**Prüfen:** Die Ausgabe lautet:

```text
normal.wav: 3.8 Sekunden
langsam.wav: 4.9 Sekunden
```

### 16. Beide Fassungen anhören

```bash
aplay normal.wav langsam.wav
```

## Wie geht es weiter?

- **Andere Stimmen:** Hörproben aller Stimmen gibt es unter <https://rhasspy.github.io/piper-samples>. Eine neue Stimme lädt man wie in Schritt 9 und wählt sie mit `-m`.
- **Mehrere Sprechweisen:** Die Stimme `de_DE-thorsten_emotional-medium` enthält acht Sprechweisen, etwa neutral (Nummer 4), müde (5) oder flüsternd (7). `-s` wählt eine davon über ihre Nummer aus. Die Zuordnung steht in der Datei `.onnx.json` unter `speaker_id_map`.
- **Als Dienst:** Mit `pip install "piper-tts[http]"` kommt ein kleiner Webserver dazu (`python -m piper.http_server -m …`), dem andere Programme Text schicken.
- **Sprachassistent:** [whisper.cpp](whisper-cpp.md) erkennt die Frage, ein Modell aus [Ollama](ollama.md) formuliert die Antwort, Piper spricht sie aus.
- **Dokumentation:** <https://github.com/OHF-Voice/piper1-gpl>

## Deinstallieren

### 1. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 2. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung, Stimmen und Audiodateien.

```bash
rm -rf ~/piper
```

### 3. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
