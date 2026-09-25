# Letta

Letta, früher MemGPT, baut KI-Agenten mit dauerhaftem Gedächtnis. Ein Letta-Agent merkt sich über Gespräche hinweg, was er über dich und deine Arbeit gelernt hat, und schreibt dieses Wissen selbst in seinen Speicher. Diese Anleitung installiert „Letta Code“, die aktuelle Form von Letta, als Programm im Terminal und verbindet es mit Claude von Anthropic.

> **Nicht vollständig getestet:** Installation, Umstellung auf den lokalen Betrieb, das Verbinden mit Anthropic und die Modellliste (Schritte 1 bis 9) wurden unter Ubuntu 26.04 geprüft. Die Gespräche mit dem Agenten (ab Schritt 10) wurden **nicht** ausprobiert, weil dafür ein kostenpflichtiger API-Schlüssel nötig ist.

## Vorbemerkungen

- **Was sich geändert hat:** Der frühere Letta-Server in Python (MemGPT) wird nicht mehr weiterentwickelt. Unter dem Namen `letta` gibt es heute **Letta Code**, ein Programm für das Terminal mit eingebautem Agenten-Server. Ältere Anleitungen mit `letta server` und einer eigenen PostgreSQL-Datenbank passen nicht mehr.
- **Installation mit pipx:** Letta Code gibt es als Python-Paket. Es wird mit `pipx` installiert, wie es die Anleitung [Python](python.md) für Kommandozeilenprogramme empfiehlt. Das Projekt verteilt es auch über npm.
- **Lokal statt Cloud:** Ohne weitere Einstellung speichert Letta Code Agenten bei Letta Cloud, dafür braucht man ein Konto. Die Anleitung stellt auf den **lokalen Betrieb** um. Agenten und ihr Gedächtnis liegen dann im Ordner `~/.letta` auf deinem Rechner.
- **Sprachmodell:** Die Anleitung verwendet **Claude Opus 5.5** von Anthropic. Dafür brauchst du einen API-Schlüssel (<https://console.anthropic.com>), und jede Anfrage kostet Geld. Ein Agent schickt bei jeder Anfrage lange Anweisungen mit, etwa 25.000 Tokens. Das macht jede Anfrage spürbar teurer als eine einfache Chat-Frage.
- **Warum kein lokales Modell:** Letta Code kann auch Modelle aus [Ollama](ollama.md) nutzen. Im Test mit `qwen3:4b-instruct` auf einer Grafikkarte mit 6 GB war das aber nicht brauchbar. Die langen Anweisungen verlangen ein Kontextfenster von 32.768 Tokens, das Modell passte dann nicht mehr ganz in den Grafikspeicher, und eine Antwort dauerte rund fünf Minuten. Außerdem hatte sich der Agent die Information aus der vorigen Nachricht nicht gemerkt und eine Antwort erfunden.
- **Version:** Letta Code 0.33.2 unter Python 3.14.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von `pipx` kennt.

```bash
sudo apt update
```

### 2. pipx installieren

`pipx` installiert Python-Programme jeweils in eine eigene virtuelle Umgebung und macht ihren Befehl trotzdem überall verfügbar.

```bash
sudo apt install pipx
```

### 3. Letta Code installieren

Lädt Letta Code von <https://pypi.org> und legt den Befehl `letta` in `~/.local/bin` ab.

```bash
pipx install letta
```

**Prüfen:** Die Ausgabe lautet z. B. `0.33.2 (Letta Code)`.

```bash
letta --version
```

Meldet das Terminal `letta: Kommando nicht gefunden`, fehlt `~/.local/bin` im Suchpfad. `pipx ensurepath` trägt den Ordner ein. Danach ein neues Terminal öffnen.

### 4. Auf lokalen Betrieb umstellen

Legt fest, dass neue Agenten auf diesem Rechner gespeichert werden und nicht bei Letta Cloud. Die Einstellung gilt dauerhaft.

```bash
letta backend local
```

**Prüfen:** Die Ausgabe lautet `Agents you create by default will be stored on this device.`

## Mit Claude verbinden

### 5. API-Schlüssel eingeben

`read -rsp` fragt den Schlüssel ab, ohne ihn anzuzeigen, und legt ihn in der Variablen `ANTHROPIC_API_KEY` ab. So landet er weder auf dem Bildschirm noch im Befehlsverlauf. Füge den Schlüssel ein und drücke <kbd>Enter</kbd>.

```bash
read -rsp "API-Schlüssel: " ANTHROPIC_API_KEY
```

### 6. Anthropic als Anbieter eintragen

Übergibt den Schlüssel an Letta Code. Im Befehlsverlauf steht dabei nur der Variablenname, nicht der Schlüssel selbst. Letta speichert ihn in `~/.letta/lc-local-backend/providers/auth.json`. Diese Datei darf nur dein Benutzer lesen.

```bash
letta connect anthropic --api-key "$ANTHROPIC_API_KEY"
```

**Prüfen:** Die Ausgabe endet mit `Connected Anthropic (anthropic) in local storage.` Im Test erschien diese Meldung auch bei einem ungültigen Schlüssel. Ob der Schlüssel stimmt, zeigt sich erst beim ersten Gespräch.

### 7. Schlüssel aus dem Terminal entfernen

Der Schlüssel liegt jetzt bei Letta. Die Variable im Terminal wird nicht mehr gebraucht.

```bash
unset ANTHROPIC_API_KEY
```

### 8. Verfügbare Claude-Modelle anzeigen

Listet die Modelle, die Letta über den eingetragenen Anbieter nutzen kann. Jedes Modell hat einen „Handle“ in der Form `anbieter/modell`.

```bash
letta model list | grep '"handle": "anthropic/claude-opus-5-5"' | head -1
```

**Prüfen:** Die Ausgabe enthält `anthropic/claude-opus-5-5`.

### 9. Projektordner anlegen und hineinwechseln

Letta Code merkt sich pro Ordner, mit welchem Agenten du zuletzt gesprochen hast. Ein eigener Ordner hält das Beispiel getrennt.

```bash
mkdir ~/letta-test
```

```bash
cd ~/letta-test
```

## Erster Agent (nicht getestet)

### 10. Agenten anlegen und ihm etwas mitteilen

`--new-agent` legt einen neuen Agenten an, `--model` wählt Claude Opus 5.5. `-p` schickt eine einzelne Nachricht und gibt die Antwort aus, ohne die bildschirmfüllende Oberfläche zu öffnen.

```bash
letta --new-agent --model anthropic/claude-opus-5-5 -p "Merke dir bitte dauerhaft: Mein Lieblingskaffee ist die Sorte Schlossblick. Antworte kurz auf Deutsch."
```

**Erwartet:** Der Agent bestätigt, dass er sich die Sorte gemerkt hat.

### 11. Das Gedächtnis prüfen

Ohne `--new-agent` spricht Letta Code mit dem zuletzt in diesem Ordner genutzten Agenten weiter.

```bash
letta -p "Welche Kaffeesorte mag ich am liebsten? Antworte in einem Satz."
```

**Erwartet:** Der Agent nennt „Schlossblick“, obwohl die Frage eine neue Anfrage ist.

### 12. Agenten anzeigen

Listet die Agenten auf diesem Rechner im Format JSON, mit Name, Modell und Systemanweisungen.

```bash
letta agents list
```

### 13. Interaktiv arbeiten

Ohne weitere Angaben öffnet `letta` eine Oberfläche im Terminal, in der du fortlaufend mit dem Agenten schreibst. Befehle beginnen dort mit `/`, z. B. `/help`. Mit <kbd>Strg</kbd>+<kbd>C</kbd> beendest du sie.

```bash
letta
```

## Wo liegt was?

- `~/.local/share/pipx/venvs/letta` – das Programm in seiner virtuellen Umgebung.
- `~/.letta/settings.json` – Einstellungen, z. B. der lokale Betrieb aus Schritt 4.
- `~/.letta/lc-local-backend` – Agenten, Gespräche und die Zugangsdaten zu Anthropic.

## Aktualisieren

### 1. Neue Version installieren

`pipx` aktualisiert Letta Code in seiner eigenen Umgebung. Letta Code bringt dafür auch einen eigenen Befehl `letta update` mit.

```bash
pipx upgrade letta
```

**Prüfen:** `letta --version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Letta Code entfernen

Entfernt das Programm samt seiner virtuellen Umgebung.

```bash
pipx uninstall letta
```

### 2. Agenten, Gespräche und Zugangsdaten löschen

Löscht den Ordner mit allen Agenten, ihrem Gedächtnis und dem gespeicherten API-Schlüssel. **Achtung:** Das Gedächtnis der Agenten geht dabei verloren.

```bash
rm -rf ~/.letta
```

### 3. Projektordner löschen

Entfernt den Ordner aus Schritt 9.

```bash
rm -rf ~/letta-test
```

### 4. pipx entfernen (optional)

Nur ausführen, wenn du keine anderen Programme mit `pipx` installiert hast. `pipx list` zeigt, welche es gibt.

```bash
sudo apt purge pipx
```

```bash
sudo apt autoremove
```

**Prüfen:** Der Befehl `letta` wird nicht mehr gefunden.

```bash
letta --version
```

**Hinweis:** Den API-Schlüssel kannst du in der Anthropic Console jederzeit sperren oder löschen, wenn du ihn nicht mehr brauchst.
