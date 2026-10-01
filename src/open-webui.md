# Open WebUI

Open WebUI ist eine Weboberfläche zum Chatten mit Sprachmodellen, die im Browser ähnlich aussieht wie bekannte Chat-Dienste. Sie läuft auf dem eigenen Rechner, spricht direkt mit [Ollama](ollama.md), speichert Gespräche, verwaltet mehrere Benutzer und beantwortet Fragen auch zu hochgeladenen Dokumenten.

## Vorbemerkungen

- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit mindestens einem Modell, hier `qwen3:4b-instruct`. Open WebUI findet Ollama unter `http://localhost:11434` von selbst und zeigt alle dort geladenen Modelle an.
- **Python-Version:** Open WebUI 0.11 läuft nur mit Python 3.11 oder 3.12. Ubuntu 26.04 bringt Python 3.14 mit. Die Anleitung verwendet deshalb wie bei [Microsoft GraphRAG](graphrag.md) den Paketmanager **uv**. Er lädt ein eigenes Python 3.12 herunter und lässt das Python von Ubuntu unverändert.
- **Kleinere Installation ohne CUDA:** Für die Suche in Dokumenten bringt Open WebUI die Bibliothek PyTorch mit. In der Standardfassung mit Unterstützung für NVIDIA-Grafikkarten wird die Installation 6,9 GB groß. Die Anleitung wählt die Fassung für den Prozessor, damit sind es 2,5 GB. Die Antworten der Sprachmodelle berechnet weiterhin Ollama, auf Wunsch auch mit der Grafikkarte.
- **Erster Start:** Beim ersten Start lädt Open WebUI ein kleines Modell für die Dokumentensuche von Hugging Face herunter, rund 900 MB in `~/.cache/huggingface`.
- **Port:** Open WebUI lauscht normalerweise auf Port 8080. Diesen Port belegen oft schon andere Dienste, z. B. Apache aus der Anleitung [Tileserver](tileserver.md). Die Anleitung verwendet deshalb Port **8081** und lässt nur Zugriffe vom eigenen Rechner zu.
- **Als Benutzerdienst:** Open WebUI wird im eigenen Home-Ordner installiert und läuft als systemd-Dienst des angemeldeten Benutzers. Dafür braucht es nach der Installation kein `sudo` mehr.
- **Version:** Getestet mit Open WebUI **0.11.4**, uv 0.12 und Python 3.12.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von `pipx` kennt.

```bash
sudo apt update
```

### 2. pipx installieren

`pipx` installiert Python-Programme jeweils in eine eigene Umgebung. Ist es schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install pipx
```

### 3. uv installieren

Legt die Befehle `uv` und `uvx` in `~/.local/bin` ab.

```bash
pipx install uv
```

**Prüfen:** Die Versionsnummer erscheint, z. B. `uv 0.12.21`. Fehlt der Befehl, `pipx ensurepath` ausführen und ein neues Terminal öffnen.

```bash
uv --version
```

### 4. Programmordner anlegen

Hier liegen später das Programm, seine Datenbank und hochgeladene Dateien.

```bash
mkdir ~/open-webui
```

### 5. In den Programmordner wechseln

```bash
cd ~/open-webui
```

### 6. Virtuelle Umgebung mit Python 3.12 anlegen

`uv` lädt Python 3.12 nach `~/.local/share/uv` herunter und legt damit im Unterordner `.venv` eine eigene Python-Umgebung an.

```bash
uv venv --python 3.12
```

**Prüfen:** Die Ausgabe beginnt mit `Using CPython 3.12`.

### 7. Open WebUI installieren

`--torch-backend cpu` wählt die kleinere Fassung von PyTorch ohne CUDA. Der Download ist trotzdem groß und dauert je nach Leitung einige Minuten.

```bash
uv pip install open-webui --torch-backend cpu
```

**Prüfen:** Die Ausgabe nennt `Version: 0.11.4` oder eine neuere Version.

```bash
uv pip show open-webui
```

## Als Dienst einrichten

### 8. Ordner für Benutzerdienste anlegen

systemd sucht die Dienste eines Benutzers in `~/.config/systemd/user`. `-p` legt fehlende Zwischenordner mit an und meldet keinen Fehler, wenn der Ordner schon existiert.

```bash
mkdir -p ~/.config/systemd/user
```

### 9. Dienstdatei anlegen

```bash
nano ~/.config/systemd/user/open-webui.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```ini
[Unit]
Description=Open WebUI
After=network-online.target

[Service]
WorkingDirectory=%h/open-webui
Environment=DATA_DIR=%h/open-webui/data
Environment=SCARF_NO_ANALYTICS=true
Environment=DO_NOT_TRACK=true
Environment=ANONYMIZED_TELEMETRY=false
ExecStart=%h/open-webui/.venv/bin/open-webui serve --host 127.0.0.1 --port 8081
Restart=on-failure

[Install]
WantedBy=default.target
```

- **`%h`** – setzt systemd durch den Home-Ordner des Benutzers ersetzt, z. B. `/home/thorsten`.
- **`WorkingDirectory`** – beim ersten Start legt Open WebUI hier die Datei `.webui_secret_key` an. Mit diesem Schlüssel unterschreibt es die Anmeldungen im Browser.
- **`DATA_DIR`** – Ordner für die Datenbank `webui.db`, hochgeladene Dateien und die Suchdaten der Dokumente. Ohne diese Angabe lägen die Daten versteckt in der virtuellen Umgebung und gingen bei einer Neuinstallation verloren.
- **`SCARF_NO_ANALYTICS`, `DO_NOT_TRACK`, `ANONYMIZED_TELEMETRY`** – schalten anonyme Nutzungsstatistiken von Open WebUI und seinen Bibliotheken ab.
- **`--host 127.0.0.1 --port 8081`** – nur der eigene Rechner erreicht die Oberfläche, und zwar auf Port 8081.
- **`Restart=on-failure`** – startet Open WebUI nach einem Absturz neu.
- **`WantedBy=default.target`** – der Dienst startet, sobald du dich anmeldest.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. systemd die neue Datei bekannt machen

systemd liest Dienstdateien nur beim Start oder auf Anweisung ein. `--user` steht für die Dienste des eigenen Benutzers, deshalb ohne `sudo`.

```bash
systemctl --user daemon-reload
```

### 11. Dienst starten und dauerhaft einschalten

`enable` startet Open WebUI künftig bei jeder Anmeldung, `--now` startet es sofort.

```bash
systemctl --user enable --now open-webui
```

**Prüfen:** In der Ausgabe steht `active (running)`. Beende die Anzeige mit <kbd>q</kbd>.

```bash
systemctl --user status open-webui
```

### 12. Auf den ersten Start warten

Beim ersten Start richtet Open WebUI seine Datenbank ein und lädt das Modell für die Dokumentensuche herunter. Im Test dauerte das gut eine Minute, spätere Starts etwa zehn Sekunden. Der Befehl zeigt die Meldungen des Dienstes laufend an. Beende ihn mit <kbd>Strg</kbd>+<kbd>C</kbd>, sobald eine Zeile mit `Started server process` erscheint.

```bash
journalctl --user -u open-webui -f
```

**Prüfen:** Die Antwort lautet `{"status":true}`.

```bash
curl http://127.0.0.1:8081/health
```

### 13. Auch ohne Anmeldung laufen lassen (optional)

Benutzerdienste laufen normalerweise nur, solange der Benutzer angemeldet ist. Dieser Befehl lässt sie schon beim Hochfahren des Rechners starten und nach dem Abmelden weiterlaufen. Für die Nutzung am eigenen Desktop ist das nicht nötig.

```bash
sudo loginctl enable-linger $USER
```

## Erste Schritte im Browser

### 14. Oberfläche öffnen

Öffne im Browser diese Adresse:

```text
http://localhost:8081
```

Die Oberfläche richtet sich nach der Sprache des Browsers und erscheint daher meist auf Deutsch.

### 15. Administratorkonto anlegen

Klicke auf **Loslegen** und gib Name, E-Mail-Adresse und Passwort ein. Das erste Konto wird automatisch zum Administrator. Die E-Mail-Adresse dient nur als Anmeldename. Open WebUI verschickt keine E-Mails.

**Prüfen:** Nach dem Klick auf **Admin-Konto erstellen** erscheint das Chatfenster.

### 16. Modell auswählen und chatten

Oben links steht die Modellauswahl. Wähle `qwen3:4b-instruct` und stelle unten im Eingabefeld eine Frage, z. B. „Wie heißt die Landeshauptstadt von Schleswig-Holstein? Antworte mit einem Wort.“

**Prüfen:** Die Antwort lautet „Kiel“. Das Gespräch erscheint links in der Liste und bleibt auch nach einem Neustart erhalten.

### 17. Fragen zu einem Dokument stellen

Klicke im Eingabefeld auf das Pluszeichen, wähle **Datei(en) hochladen** und lade eine Textdatei oder ein PDF hoch. Stelle danach eine Frage zum Inhalt. Open WebUI sucht die passenden Stellen im Dokument heraus und gibt sie dem Modell mit.

**Prüfen:** Die Antwort bezieht sich auf das Dokument und trägt eine Quellenangabe wie `[1]`. Im Test hat das Modell aus einer kurzen Datei mit Öffnungszeiten richtig herausgelesen, an welchen Tagen die Werkstatt Reparaturen annimmt.

## Wie geht es weiter?

- **Weitere Benutzer:** Neue Konten bekommen zunächst den Status „ausstehend“ und müssen im **Admin-Bereich** freigeschaltet werden. Dort lässt sich die Registrierung auch ganz abschalten.
- **Wissen:** Im Arbeitsbereich fasst man mehrere Dokumente zu einer Wissenssammlung zusammen und bindet sie in jedem Chat mit `#` ein.
- **Cloud-Anbieter:** Im Admin-Bereich unter den Verbindungen lassen sich zusätzlich Dienste mit der Schnittstelle von OpenAI eintragen. Deren Modelle erscheinen dann neben denen von Ollama.
- **Zugriff aus dem Netz:** Soll die Oberfläche unter einer eigenen Domain erreichbar sein, schaltet man [nginx](nginx.md) mit HTTPS davor, wie bei den anderen Diensten dieses Buchs.
- **Dokumentation:** <https://docs.openwebui.com>

## Aktualisieren

### 1. In den Programmordner wechseln

```bash
cd ~/open-webui
```

### 2. Neue Version installieren

`-U` holt die neueste Version. Datenbank und Dateien in `data` bleiben erhalten.

```bash
uv pip install -U open-webui --torch-backend cpu
```

### 3. Dienst neu starten

```bash
systemctl --user restart open-webui
```

## Deinstallieren

### 1. Dienst beenden und ausschalten

```bash
systemctl --user disable --now open-webui
```

### 2. Dienstdatei löschen

```bash
rm ~/.config/systemd/user/open-webui.service
```

### 3. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
systemctl --user daemon-reload
```

### 4. Programm und Daten entfernen

Löscht die virtuelle Umgebung, den Schlüssel und alle Daten, also auch Konten, Gespräche und hochgeladene Dateien.

```bash
rm -rf ~/open-webui
```

### 5. Modell für die Dokumentensuche entfernen

Löscht den Zwischenspeicher von Hugging Face. Verwendest du andere Programme, die Modelle von Hugging Face laden, lösche stattdessen nur den Unterordner `hub/models--sentence-transformers--all-MiniLM-L6-v2`.

```bash
rm -rf ~/.cache/huggingface
```

### 6. Zwischenspeicher von uv leeren

`uv` hebt heruntergeladene Pakete auf. Der Befehl leert den ganzen Speicher, also auch den anderer Projekte, die uv verwenden.

```bash
uv cache clean
```

### 7. Python 3.12 von uv entfernen (optional)

Nur ausführen, wenn kein anderes Projekt das Python 3.12 von uv braucht. Das Python von Ubuntu bleibt unberührt.

```bash
uv python uninstall 3.12
```

### 8. uv entfernen (optional)

Nur ausführen, wenn uv nicht mehr gebraucht wird, z. B. für [CrewAI](crewai.md) oder [Microsoft GraphRAG](graphrag.md).

```bash
pipx uninstall uv
```

**Prüfen:** Der Befehl `uv` wird nicht mehr gefunden.

```bash
uv --version
```

### 9. pipx entfernen (optional)

Nur ausführen, wenn keine anderen Programme mit pipx installiert sind. `pipx list` zeigt sie an.

```bash
sudo apt purge pipx
```

### 10. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt Pakete, die nur für pipx mitinstalliert wurden. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove
```

### 11. Dauerbetrieb zurücknehmen (falls in Schritt 13 eingeschaltet)

```bash
sudo loginctl disable-linger $USER
```
