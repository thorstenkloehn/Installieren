# Hermes Agent

Hermes Agent ist ein persönlicher KI-Agent von Nous Research, der im Terminal läuft. Anders als ein reiner Chat führt er selbst Befehle aus, liest und schreibt Dateien und legt sich aus erledigten Aufgaben eigene Anleitungen („Skills“) an, die er beim nächsten Mal wiederverwendet. Er merkt sich Wissen über mehrere Sitzungen hinweg, kann Aufgaben zeitgesteuert ausführen und ist auf Wunsch auch über Telegram, Discord und andere Dienste erreichbar.

> **Hinweis: nicht selbst getestet.** Diese Anleitung beruht auf der offiziellen Dokumentation von Hermes Agent (Stand 27. September 2026). Installation und Bedienung von Hermes Agent selbst wurden für dieses Buch nicht ausprobiert. Selbst getestet sind nur die Vorbereitung von [Ollama](ollama.md) in den Schritten 8 bis 10 und das Herunterladen des Installationsskripts. Befehle und Ausgaben können daher von der Beschreibung abweichen.

## Vorbemerkungen

- **Was ein Agent darf:** Hermes führt Befehle mit deinen Rechten aus. Er kann also alles, was du im Terminal auch kannst, auch Dateien löschen. Vor gefährlichen Befehlen fragt er nach (Schritt 13). Starte ihn für den Anfang in einem eigenen Übungsordner und bestätige nur Befehle, die du verstehst.
- **Keine Pakete von Ubuntu:** Hermes Agent gibt es weder als apt-Paket noch als Snap. Auf PyPI liegt nur die ältere Version 0.19.0 vom Juli 2026, die Python unter 3.14 verlangt. Ubuntu 26.04 hat aber Python 3.14, und das Projekt veröffentlicht inzwischen Versionen nach Datum (zuletzt v2026.9.24). Der Hersteller empfiehlt deshalb sein Installationsskript. Es braucht kein `sudo` und installiert alles für deinen Benutzer: den Code nach `~/.hermes/hermes-agent`, Einstellungen und Daten nach `~/.hermes` und den Befehl `hermes` nach `~/.local/bin`. Python, Node.js und weitere Werkzeuge bringt es in eigenen Versionen mit.
- **Sprachmodell:** Hermes braucht ein großes Sprachmodell (LLM). Diese Anleitung verwendet ein lokales Modell über [Ollama](ollama.md). Dann verlassen keine Daten den Rechner und es fallen keine Kosten an. Alternativ lässt sich Hermes mit kostenpflichtigen Anbietern wie OpenRouter, OpenAI, Anthropic oder dem Abo „Nous Portal“ des Herstellers verbinden.
- **Leistung lokaler Modelle:** Ein Agent braucht viel Kontext. Hermes verlangt mindestens 64 000 Tokens. Im Test belegte `qwen3:4b-instruct` mit diesem Kontext rund 12 GB Arbeitsspeicher statt 2,5 GB und lief bei 8 GB Grafikspeicher größtenteils auf dem Prozessor. Kleine Modelle verstehen Aufgaben außerdem schlechter als große. Die Hersteller-Doku empfiehlt für ernsthafte Arbeit Modelle wie `gemma4:31b` (rund 20 GB, 24 GB Arbeitsspeicher oder mehr).
- **Ähnliche Programme:** Das bekannteste vergleichbare Projekt ist OpenClaw. Hermes kann dessen Einstellungen mit `hermes claw migrate` übernehmen.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Voraussetzungen installieren

Das Installationsskript braucht Git, curl und tar. Sind sie schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install git curl tar
```

### 3. Installationsskript herunterladen

Speichert das Skript zuerst als Datei. So kannst du vor dem Ausführen nachsehen, was es tut, statt es ungesehen aus dem Internet zu starten.

```bash
curl -fsSL -o ~/hermes-install.sh https://hermes-agent.nousresearch.com/install.sh
```

### 4. Skript ansehen (optional)

Zeigt das Skript seitenweise an, mit <kbd>Q</kbd> beendest du die Anzeige. Wichtig: Es verwendet kein `sudo`. Es lädt das Werkzeug `uv` herunter und prüft dessen Prüfsumme, klont den Quellcode mit Git und legt die Ordner unter `~/.hermes` an. Fehlt `~/.local/bin` im Suchpfad, trägt es den Ordner in `~/.bashrc` und `~/.profile` ein.

```bash
less ~/hermes-install.sh
```

### 5. Skript ausführen

`--skip-browser` lässt die Browser-Werkzeuge samt eigenem Chromium weg, mit denen der Agent Webseiten bedienen kann. Sie lassen sich später mit `hermes pm install agent-browser` nachinstallieren. `--non-interactive` überspringt den Einrichtungsassistenten am Ende, die Einrichtung folgt in Schritt 11.

```bash
bash ~/hermes-install.sh --skip-browser --non-interactive
```

Das Skript zeigt für jeden Schritt eine Statuszeile. Die ausführliche Ausgabe schreibt es nach `~/.hermes/logs/install.log`. Schlägt ein Schritt fehl, nennt es die letzten Zeilen und den Pfad zu dieser Datei.

### 6. Skript löschen

Das Skript wird nicht mehr gebraucht.

```bash
rm ~/hermes-install.sh
```

### 7. Neues Terminal öffnen

Schließe das Terminal und öffne ein neues, damit die Shell den Befehl `hermes` findet.

**Prüfen:** Die Ausgabe nennt die Version von Hermes Agent.

```bash
hermes --version
```

## Lokales Modell vorbereiten

Diese Schritte setzen ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct` voraus. Sie wurden selbst getestet.

### 8. Modelldatei anlegen

Ollama verwendet ohne Angabe einen kleinen Kontext. Eine Modelldatei legt eine Variante mit 64 000 Tokens an. Sie verweist nur auf das vorhandene Modell, belegt also keinen zusätzlichen Platz auf der Festplatte.

```bash
nano ~/Modelfile-agent
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```text
FROM qwen3:4b-instruct
PARAMETER num_ctx 65536
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Modellvariante erzeugen

Erzeugt die Variante `qwen3-agent`.

```bash
ollama create qwen3-agent -f ~/Modelfile-agent
```

**Prüfen:** Die Ausgabe endet mit `success`. In der Liste der Modelle steht jetzt `qwen3-agent:latest`.

```bash
ollama list
```

### 10. Schnittstelle prüfen

Hermes spricht Ollama über dessen OpenAI-kompatible Schnittstelle unter `http://localhost:11434/v1` an. Dieser Aufruf schickt eine Testfrage dorthin.

```bash
curl http://localhost:11434/v1/chat/completions -H "Content-Type: application/json" -d '{"model": "qwen3-agent", "messages": [{"role": "user", "content": "Antworte nur mit: Hallo"}]}'
```

**Prüfen:** Die Antwort ist JSON und enthält `"content":"Hallo"`. `ollama ps` zeigt danach unter `CONTEXT` den Wert `65536` und unter `SIZE`, wie viel Speicher das Modell jetzt belegt.

## Hermes einrichten

### 11. Modell auswählen

`hermes model` führt durch die Auswahl des Anbieters und schreibt das Ergebnis nach `~/.hermes/config.yaml`.

```bash
hermes model
```

Wähle als Anbieter **Custom Endpoint** und gib ein:

- **Base URL:** `http://localhost:11434/v1`
- **API Key:** leer lassen oder `no-key` eingeben, Ollama braucht keinen
- **Model:** `qwen3-agent`

Laut Doku kann man stattdessen auch den Abschnitt `model:` in `~/.hermes/config.yaml` mit `nano` so einstellen:

```yaml
model:
  default: "qwen3-agent"
  provider: "custom"
  base_url: "http://localhost:11434/v1"
```

### 12. Einrichtung prüfen

`hermes doctor` prüft Einstellungen und Abhängigkeiten und nennt gefundene Probleme mit einem Vorschlag zur Behebung.

```bash
hermes doctor
```

## Erste Schritte

### 13. Übungsordner anlegen und Hermes starten

Ein eigener Ordner, in dem der Agent Dateien anlegen darf.

```bash
mkdir ~/hermes-uebung
```

```bash
cd ~/hermes-uebung
```

```bash
hermes
```

Hermes zeigt eine Oberfläche im Terminal mit Eingabezeile. Probiere z. B.:

```text
Lege eine Datei notizen.md mit drei Tipps zum Arbeiten im Terminal an.
```

```text
Zeige mir, welche Dateien in diesem Ordner liegen und wie groß sie sind.
```

Der Agent entscheidet selbst, welche Werkzeuge er braucht, und zeigt jeden Befehl, den er ausführt. Mit einem kleinen lokalen Modell dauern Antworten spürbar länger als mit großen Modellen im Netz.

**Nachfragen bei gefährlichen Befehlen:** In der Voreinstellung (`approvals.mode: smart`) bewertet Hermes Befehle vor dem Ausführen. Harmlose führt er aus, eindeutig gefährliche lehnt er ab, und bei unklaren fragt er dich. Lies die Nachfrage und bestätige nur, was du verstehst. Der „YOLO-Modus“ (`hermes --yolo` oder `/yolo`) schaltet alle Nachfragen ab und ist nur für Wegwerf-Umgebungen gedacht.

### 14. Befehle in der Sitzung

Befehle mit Schrägstrich steuern die Sitzung:

| Befehl | Wirkung |
|---|---|
| `/help` | Alle Befehle anzeigen |
| `/model` | Modell anzeigen oder wechseln |
| `/new` | Neue Unterhaltung beginnen |
| `/quit` | Hermes beenden (auch `/exit`) |

Mehrzeilige Eingaben entstehen mit <kbd>Alt</kbd>+<kbd>Enter</kbd> oder <kbd>Strg</kbd>+<kbd>J</kbd>.

### 15. Einzelne Frage ohne Sitzung

`hermes -z` beantwortet eine einzelne Aufgabe und gibt nur die Antwort aus. Das eignet sich für Skripte.

```bash
hermes -z "Welche Hauptstadt hat Frankreich? Antworte mit einem Wort."
```

## Wie geht es weiter?

- **Werkzeuge wählen:** `hermes tools` legt fest, welche Werkzeuge der Agent verwenden darf, etwa Terminal, Dateien, Websuche oder Browser.
- **Messenger:** `hermes gateway setup` verbindet Hermes mit Telegram, Discord, Slack, Signal und anderen Diensten. Lege dabei unbedingt fest, welche Benutzer mit dem Agenten sprechen dürfen, sonst kann jeder, der den Bot findet, Befehle auf deinem Rechner auslösen.
- **Zeitgesteuerte Aufgaben:** Hermes hat eine eingebaute Zeitsteuerung. Aufgaben wie „fasse mir jeden Morgen die neuen Dateien im Ordner zusammen“ beschreibt man in normaler Sprache.
- **Sandbox:** Statt direkt auf dem Rechner kann Hermes Befehle auch per SSH auf einem anderen Rechner oder in abgeschotteten Umgebungen ausführen. Die Doku beschreibt das unter „terminal backends“.
- **Dokumentation:** <https://hermes-agent.nousresearch.com/docs/>

## Aktualisieren

Hermes aktualisiert sich über seinen eigenen Befehl, nicht über `apt`. Vor dem Update sichert er seine wichtigsten Einstellungen.

```bash
hermes update
```

## Deinstallieren

### 1. Messenger-Dienst beenden

Nur nötig, wenn du Hermes mit einem Messenger verbunden hast.

```bash
hermes gateway stop
```

### 2. Entfernen ansehen

`--dry-run` zeigt nur, was entfernt würde, ohne etwas zu löschen.

```bash
hermes uninstall --dry-run
```

### 3. Hermes entfernen

`--full` entfernt auch Einstellungen, Erinnerungen, Skills und Sitzungen in `~/.hermes`. Ohne `--full` bleiben diese Daten für eine spätere Neuinstallation erhalten. **Achtung:** Mit `--full` gehen alle Daten des Agenten verloren. `hermes backup` sichert sie vorher.

```bash
hermes uninstall --full
```

Laut Doku geht es auch von Hand:

```bash
rm -f ~/.local/bin/hermes
```

```bash
rm -rf ~/.hermes
```

### 4. Übungsordner und Modellvariante entfernen

Löscht den Übungsordner, die Modelldatei und die Modellvariante aus Schritt 9. Das Grundmodell `qwen3:4b-instruct` bleibt erhalten.

```bash
rm -rf ~/hermes-uebung ~/Modelfile-agent
```

```bash
ollama rm qwen3-agent
```

**Prüfen:** Die Shell meldet, dass der Befehl `hermes` nicht gefunden wurde.

```bash
hermes --version
```
