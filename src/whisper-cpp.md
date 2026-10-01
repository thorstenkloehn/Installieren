# whisper.cpp

whisper.cpp wandelt gesprochene Sprache in Text um, vollständig auf dem eigenen Rechner. Es verwendet die Whisper-Modelle von OpenAI, versteht rund 100 Sprachen, darunter Deutsch, und schreibt auf Wunsch Untertitel mit Zeitangaben. Gedacht ist es etwa für Interviews, Sprachnotizen, Vorträge oder Videos.

## Vorbemerkungen

- **Aus den Ubuntu-Paketquellen:** Ubuntu 26.04 liefert whisper.cpp als Paket mit. Es nutzt dieselbe Rechenbibliothek ggml wie [llama.cpp](llama-cpp.md).
- **Grafikkarte über Vulkan:** Wie bei llama.cpp gibt es keine Fassung für CUDA, aber ein Zusatzpaket für **Vulkan**. Es nutzt Grafikkarten von NVIDIA, AMD und Intel. Ohne geeignete Grafikkarte rechnet whisper.cpp auf dem Prozessor, nur langsamer.
- **Modelle:** Die Modelle gehören nicht zum Paket. Sie liegen als Dateien bei Hugging Face und stehen wie Whisper selbst unter der MIT-Lizenz. Die Anleitung verwendet `large-v3-turbo` in einer verkleinerten Fassung (`q5_0`, 550 MB). Es erkennt Deutsch sehr zuverlässig. Zum Vergleich gibt es das kleine Modell `base` (150 MB).
- **Audioformate:** whisper.cpp liest WAV-, MP3- und Ogg-Dateien direkt (im Test geprüft). Für Videos oder andere Formate braucht man zusätzlich `ffmpeg`.
- **Port:** Der mitgelieferte Server lauscht normalerweise auf Port 8080. Diesen Port belegen oft schon andere Dienste, z. B. Apache aus der Anleitung [Tileserver](tileserver.md). Die Anleitung verwendet deshalb Port **8083**.
- **Version:** Getestet mit whisper.cpp **1.8.3** aus Ubuntu 26.04 auf einer GeForce GTX 1660.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. whisper.cpp mit Vulkan-Unterstützung installieren

- `whisper.cpp` – die Programme `whisper-cli`, `whisper-server`, `whisper-stream` und weitere
- `libggml0-backend-vulkan` – das Zusatzpaket, mit dem whisper.cpp auf der Grafikkarte rechnet. Ohne geeignete Grafikkarte kann es entfallen. Ist [llama.cpp](llama-cpp.md) schon installiert, ist es meist schon vorhanden.

```bash
sudo apt install whisper.cpp libggml0-backend-vulkan
```

**Prüfen:** Die Hilfe von `whisper-cli` erscheint und beginnt mit `usage: whisper-cli [options] file0 file1 ...`.

```bash
whisper-cli --help
```

### 3. Ordner für Modelle und Aufnahmen anlegen

```bash
mkdir ~/whisper
```

### 4. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/whisper
```

### 5. Großes Modell herunterladen

Lädt `large-v3-turbo` in der Fassung `q5_0` aus dem Hugging-Face-Konto des whisper.cpp-Projekts. `-L` folgt der Weiterleitung zum eigentlichen Speicherort, `-o` legt den Dateinamen fest.

```bash
curl -L -o ggml-large-v3-turbo-q5_0.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q5_0.bin
```

### 6. Kleines Modell herunterladen

Das Modell `base` dient zum Vergleich. Wer nur das große Modell nutzen will, kann diesen Schritt überspringen.

```bash
curl -L -o ggml-base.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin
```

**Prüfen:** Die Liste zeigt beide Dateien mit den Größen `548M` und `142M`.

```bash
ls -lh
```

## Erste Schritte

### 7. Englisches Beispiel erkennen

Das Paket bringt zwei kurze Aufnahmen aus der gesprochenen Wikipedia mit. `-m` wählt das Modell, `-f` die Audiodatei.

```bash
whisper-cli -m ggml-base.bin -f /usr/share/sounds/debian/samples/en-Wikipedia-Ignore_All_Rules.wav
```

**Prüfen:** Unter vielen technischen Meldungen stehen Zeilen mit Zeitangaben und Text, die erste lautet `[00:00:00.000 --> 00:00:09.240]   Wikipedia, Ignore all rules …`. Weiter oben steht `using Vulkan0 backend`, wenn whisper.cpp die Grafikkarte verwendet.

### 8. Deutsche Aufnahme herunterladen

Ein gesprochener Wikipedia-Artikel über das Radio, 2 Minuten 39 Sekunden lang. Die Aufnahme liegt auf Wikimedia Commons unter der Lizenz CC BY-SA 3.0, gesprochen von Benutzer HendrixXx.

```bash
curl -L -o radio.ogg https://upload.wikimedia.org/wikipedia/commons/a/a1/De-Radio-article.ogg
```

### 9. Deutsche Aufnahme in Text umwandeln

`-l de` legt die Sprache fest. Ohne diese Angabe nimmt whisper.cpp Englisch an. `-l auto` erkennt die Sprache selbst. `-otxt` speichert den Text zusätzlich in einer Datei, `-of` legt ihren Namen ohne Endung fest.

```bash
whisper-cli -m ggml-large-v3-turbo-q5_0.bin -l de -f radio.ogg -otxt -of radio
```

**Prüfen:** Die Zeilen beginnen mit `Radio aus Wikipedia, der freien Enzyklopädie.` Im Test war der ganze Text bis auf Kleinigkeiten fehlerfrei, sogar mit Satzzeichen. Für die 2:39 Minuten brauchte die GTX 1660 knapp 10 Sekunden. Den Text gibt es jetzt auch als Datei:

```bash
cat radio.txt
```

### 10. Mit dem kleinen Modell vergleichen

```bash
whisper-cli -m ggml-base.bin -l de -f radio.ogg -otxt -of radio-base
```

**Prüfen:** Das kleine Modell ist nur wenig schneller, macht aber deutlich mehr Fehler. Im Test hat es „lateinisch Radius, der Strahl“ als „Lateinisch-Radius der Strahl“ geschrieben und eine Internetadresse als „Schrägstrich.wiki.schrägstrich“. Mit Grafikkarte lohnt sich deshalb das große Modell.

### 11. Untertitel erzeugen

`-osrt` schreibt eine Untertiteldatei im Format SRT, die Videoprogramme wie VLC zusammen mit dem Video anzeigen. `-ovtt` erzeugt das Format WebVTT für Webseiten.

```bash
whisper-cli -m ggml-large-v3-turbo-q5_0.bin -l de -f radio.ogg -osrt -of radio
```

**Prüfen:** Die Datei `radio.srt` enthält nummerierte Abschnitte mit Zeitangaben wie `00:00:00,000 --> 00:00:03,880`.

```bash
head radio.srt
```

## Eigene Sprache aufnehmen

### 12. Zehn Sekunden aufnehmen

`arecord` gehört bei Ubuntu zur Grundausstattung. Der Befehl nimmt zehn Sekunden über das Standardmikrofon auf, gleich in dem Format, das Whisper intern verwendet: 16 000 Messwerte pro Sekunde, ein Kanal. Sprich nach dem Start einen beliebigen Satz.

```bash
arecord -f S16_LE -r 16000 -c 1 -d 10 aufnahme.wav
```

### 13. Aufnahme erkennen

```bash
whisper-cli -m ggml-large-v3-turbo-q5_0.bin -l de -f aufnahme.wav
```

**Prüfen:** Dein Satz erscheint als Text. Steht dort ein Satz, den du nicht gesagt hast, etwa `Untertitelung des ZDF, 2020`, war die Aufnahme leer oder zu leise. Genau diesen Satz hat Whisper im Test bei einer stillen Datei erfunden, weil es unter anderem mit Untertiteln aus dem Fernsehen trainiert wurde. Wähle dann in den Einstellungen von Ubuntu das richtige Mikrofon als Eingabegerät.

## Whisper als Server

`whisper-server` hält ein Modell im Speicher und nimmt Audiodateien über das Netz entgegen. So können andere Programme Sprache erkennen lassen, ohne das Modell jedes Mal neu zu laden.

### 14. Server starten

Der Server läuft im Vordergrund, das Terminal bleibt also belegt. `--host 127.0.0.1` lässt nur Zugriffe vom eigenen Rechner zu.

```bash
whisper-server -m ggml-large-v3-turbo-q5_0.bin -l de --host 127.0.0.1 --port 8083
```

**Prüfen:** Die letzte Zeile lautet `whisper server listening at http://127.0.0.1:8083`.

### 15. Zweites Terminal öffnen

Öffne ein neues Terminal mit <kbd>Strg</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd> und wechsle dort in den Ordner:

```bash
cd ~/whisper
```

### 16. Datei an den Server schicken

`-F` schickt die Datei wie ein Formular im Browser. `response_format=text` verlangt reinen Text. Andere Werte sind `json`, `srt` und `vtt`.

```bash
curl http://127.0.0.1:8083/inference -F file=@radio.ogg -F response_format=text
```

**Prüfen:** Nach gut zehn Sekunden erscheint derselbe Text wie in Schritt 9.

### 17. Server beenden

Wechsle in das erste Terminal und drücke dort <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Live mitschreiben:** `whisper-stream -m ggml-large-v3-turbo-q5_0.bin -l de` hört dauerhaft am Mikrofon zu und schreibt alle paar Sekunden den erkannten Text. Beenden mit <kbd>Strg</kbd>+<kbd>C</kbd>.
- **Ins Englische übersetzen:** `-tr` erkennt die Sprache und gibt gleich eine englische Übersetzung aus. In andere Sprachen übersetzt Whisper nicht.
- **Videos:** Mit `sudo apt install ffmpeg` lässt sich die Tonspur eines Videos in eine WAV-Datei umwandeln, etwa `ffmpeg -i video.mp4 -ar 16000 -ac 1 ton.wav`.
- **Weitere Modelle:** Unter <https://huggingface.co/ggerganov/whisper.cpp> liegen alle Größen von `tiny` bis `large-v3`. Modelle mit `.en` im Namen verstehen nur Englisch.
- **Dokumentation:** <https://github.com/ggml-org/whisper.cpp>

## Deinstallieren

### 1. Pakete entfernen

```bash
sudo apt purge whisper.cpp libggml0-backend-vulkan
```

Wird `libggml0-backend-vulkan` noch von [llama.cpp](llama-cpp.md) gebraucht, lass es im Befehl weg.

### 2. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt Pakete, die nur für whisper.cpp mitinstalliert wurden, z. B. `libwhisper1` und `libggml0`. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

### 3. Modelle und Aufnahmen löschen

Löscht den Ordner mit den Modellen, Aufnahmen und erzeugten Texten.

```bash
rm -rf ~/whisper
```

**Prüfen:** Der Befehl `whisper-cli` wird nicht mehr gefunden.

```bash
whisper-cli --help
```
