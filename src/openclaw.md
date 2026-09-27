# OpenClaw

OpenClaw ist ein freier KI-Assistent, der auf dem eigenen Rechner läuft und Aufgaben selbst erledigt: Er führt Befehle aus, bearbeitet Dateien und nutzt Werkzeuge und Erweiterungen („Skills“). Erreichbar ist er über eine Oberfläche im Terminal, eine Weboberfläche und über Messenger wie Telegram, Signal, WhatsApp, Discord oder Slack. Zentrale Stelle ist das **Gateway**, ein Hintergrunddienst, der Sitzungen, Werkzeuge und Verbindungen verwaltet.

> **Hinweis: nicht selbst getestet.** Diese Anleitung beruht auf der offiziellen Dokumentation von OpenClaw (Stand 27. September 2026). Installation und Bedienung von OpenClaw wurden für dieses Buch nicht ausprobiert. Selbst geprüft wurden nur das Herunterladen des Installationsskripts und dessen Inhalt. Befehle und Ausgaben können daher von der Beschreibung abweichen.

## Vorbemerkungen

- **Verhältnis zu Hermes Agent:** [Hermes Agent](hermes-agent.md) ist ein ähnliches Projekt. Beide sind persönliche Agenten mit Gedächtnis, Skills und Messenger-Anbindung. OpenClaw ist in TypeScript geschrieben und stellt das Gateway mit Weboberfläche und vielen Messengern in den Mittelpunkt. Hermes setzt stärker auf das Terminal und auf selbst gelernte Skills. Beide können Einstellungen des jeweils anderen übernehmen.
- **Was ein Agent darf:** Werkzeuge laufen ohne weitere Einstellung direkt auf dem Rechner, mit deinen Rechten. Nachrichten, die über Messenger hereinkommen, sind als nicht vertrauenswürdig zu behandeln. Unbekannte Absender müssen erst gekoppelt werden (Schritt 15).
- **Node.js 24 nötig:** OpenClaw braucht Node.js 24.16 oder neuer. Ubuntu 26.04 liefert nur Node.js 22, das Paket `nodejs` aus `apt` reicht also nicht. Das empfohlene Skript `install.sh` würde unter Linux das Paketarchiv NodeSource einrichten und damit das `nodejs` von Ubuntu ersetzen. Diese Anleitung verwendet deshalb das zweite offizielle Skript `install-cli.sh`. Es braucht kein root und legt ein eigenes Node.js und OpenClaw nur in `~/.openclaw` ab. Das System bleibt unverändert.
- **Sprachmodell:** Diese Anleitung verbindet OpenClaw mit einem lokalen Modell über [Ollama](ollama.md). Dann verlassen keine Daten den Rechner und es fallen keine Kosten an. Kleine lokale Modelle wie `qwen3:4b-instruct` verstehen Aufgaben aber deutlich schlechter als große. Alternativ nutzt OpenClaw Anbieter wie Anthropic, OpenAI oder OpenRouter mit eigenem, meist kostenpflichtigem Zugang.
- **Was OpenClaw ins Netz sendet:** Laut Hersteller nur eine tägliche Prüfung auf neue Versionen. Anonyme Nutzungsstatistiken sind ab Werk aus. Schritt 17 schaltet auch die Versionsprüfung ab.
- **Träger:** OpenClaw gehört der gemeinnützigen OpenClaw Foundation, steht unter der MIT-Lizenz und hat keine Bezahlversion.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Voraussetzungen installieren

Das Installationsskript braucht curl und Git. Sind sie schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install curl git
```

### 3. Installationsskript herunterladen

Speichert das Skript zuerst als Datei, statt es ungesehen aus dem Internet zu starten. `--proto '=https' --tlsv1.2` erzwingt eine verschlüsselte Verbindung.

```bash
curl -fsSL --proto '=https' --tlsv1.2 -o ~/openclaw-install-cli.sh https://openclaw.ai/install-cli.sh
```

### 4. Skript ansehen (optional)

Zeigt das Skript seitenweise an, mit <kbd>Q</kbd> beendest du die Anzeige. Es lädt Node.js in einer festen Version nach `~/.openclaw/tools`, prüft dessen Prüfsumme, installiert OpenClaw mit diesem Node.js nach `~/.openclaw` und legt den Befehl `~/.openclaw/bin/openclaw` an. `sudo` verwendet es nur, falls Git fehlt.

```bash
less ~/openclaw-install-cli.sh
```

### 5. Skript ausführen

Ohne weitere Angaben installiert das Skript die aktuelle Version und startet die Einrichtung noch nicht, die folgt in Schritt 10.

```bash
bash ~/openclaw-install-cli.sh
```

**Prüfen:** Gegen Ende steht eine Zeile `OpenClaw installed (…)` mit der Versionsnummer.

### 6. Skript löschen

Das Skript wird nicht mehr gebraucht.

```bash
rm ~/openclaw-install-cli.sh
```

### 7. Befehl in den Suchpfad aufnehmen

Das Skript legt den Befehl nach `~/.openclaw/bin`, trägt diesen Ordner aber nicht in den Suchpfad ein.

```bash
nano ~/.bashrc
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei und füge in einer eigenen Zeile an:

```bash
export PATH="$HOME/.openclaw/bin:$PATH"
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. Öffne danach ein neues Terminal.

**Prüfen:** Die Ausgabe nennt die Version von OpenClaw.

```bash
openclaw --version
```

## Mit Ollama verbinden

### 8. Modell prüfen

OpenClaw braucht ein Modell, das Werkzeuge aufrufen kann und mindestens 16 000 Tokens Kontext hat. `qwen3:4b-instruct` aus der [Ollama-Anleitung](ollama.md) erfüllt beides. Unter `Capabilities` muss `tools` stehen.

```bash
ollama show qwen3:4b-instruct
```

### 9. Modell laden

Die automatische Suche der Einrichtung berücksichtigt vor allem Modelle, die Ollama gerade im Speicher hat. Dieser Aufruf lädt das Modell mit einer kurzen Frage. Ollama behält es danach fünf Minuten im Speicher.

```bash
ollama run qwen3:4b-instruct "Antworte nur mit: bereit"
```

### 10. Einrichtung starten

`openclaw onboard` führt durch die Einrichtung. Zuerst zeigt es einen Hinweis zur Sicherheit, den du bestätigen musst.

```bash
openclaw onboard
```

Wähle als Anbieter **Ollama** und als Betriebsart **Local only**. Gib als Adresse `http://127.0.0.1:11434` ein und wähle das Modell `qwen3:4b-instruct`. OpenClaw schickt vor dem Speichern eine echte Testanfrage an das Modell und legt den Arbeitsordner `~/.openclaw/workspace` an.

**Prüfen:** Die Liste enthält `qwen3:4b-instruct`.

```bash
openclaw models list --provider ollama
```

## Gateway und Oberflächen

### 11. Gateway als Dienst einrichten

Das Gateway soll im Hintergrund laufen. Dieser Befehl legt dafür einen systemd-Dienst für deinen Benutzer an. `sudo` ist nicht nötig.

```bash
openclaw gateway install
```

### 12. Gateway prüfen

```bash
openclaw gateway status
```

**Prüfen:** Die Ausgabe meldet, dass das Gateway läuft.

### 13. Weboberfläche öffnen

Öffnet die Control UI im Browser. Dort siehst du Sitzungen, Einstellungen und ein Chatfenster. Schicke eine erste Nachricht, z. B. `Welche Dateien liegen in deinem Arbeitsordner?`.

```bash
openclaw dashboard
```

### 14. Terminal-Oberfläche verwenden

`openclaw` ohne weitere Angaben öffnet eine Chat-Oberfläche im Terminal, die mit dem Gateway verbunden ist.

```bash
openclaw
```

## Sicherheit

### 15. Messenger nur mit Kopplung

Wer OpenClaw über einen Messenger erreichbar macht (`openclaw configure` → Kanäle), sollte wissen: Unbekannte Absender bekommen in Direktnachrichten zunächst einen Kopplungscode. Erst wenn du ihn bestätigst, reagiert der Agent auf sie:

```bash
openclaw pairing approve <kanal> <code>
```

Bestätige nur Personen, denen du erlaubst, auf deinem Rechner Befehle auszulösen.

### 16. Sicherheitsprüfung

`openclaw doctor` prüft Einstellungen, Dienst und Laufzeitumgebung und nennt Probleme. `openclaw doctor --fix` behebt, was sich automatisch beheben lässt.

```bash
openclaw doctor
```

Bevor du andere Benutzer anbindest oder das Gateway aus dem Netz erreichbar machst, lies die Seiten zu Sicherheit und Sandbox in der Doku: Mit einer Sandbox laufen Werkzeuge abgeschottet statt direkt auf dem Rechner.

### 17. Versionsprüfung abschalten (optional)

Schaltet die tägliche Anfrage nach neuen Versionen ab. Die Einstellung landet in `~/.openclaw/openclaw.json`.

```bash
openclaw config set update.checkOnStart false
```

## Wie geht es weiter?

- **Einstellungen:** `openclaw configure` ändert später Modell, Gateway, Kanäle, Plugins oder Skills. Die Einstellungen stehen in `~/.openclaw/openclaw.json`. Das Gateway übernimmt Änderungen an der Datei selbst.
- **Skills und Plugins:** Erweiterungen gibt es im Verzeichnis ClawHub (<https://clawhub.ai>). Prüfe fremde Skills vor der Installation, denn sie laufen mit denselben Rechten wie der Agent.
- **Umzug von Hermes:** `openclaw onboard --import-from hermes` übernimmt Einstellungen aus [Hermes Agent](hermes-agent.md).
- **Dokumentation:** <https://docs.openclaw.ai>

## Aktualisieren

OpenClaw aktualisiert sich über seinen eigenen Befehl, nicht über `apt`. Er erneuert auch den Gateway-Dienst und meldet Erfolg erst, wenn das Gateway danach wieder läuft.

```bash
openclaw update
```

`openclaw update --dry-run` zeigt vorher, was geschehen würde. Scheitert ein Update, hilft laut Doku, das Installationsskript aus den Schritten 3 bis 6 erneut auszuführen.

## Deinstallieren

### 1. Entfernen ansehen

`--dry-run` zeigt nur, was entfernt würde. `--all` wählt Dienst, Einstellungen, Arbeitsordner und Programm.

```bash
openclaw uninstall --dry-run --all
```

### 2. OpenClaw entfernen

Entfernt den Gateway-Dienst, alle Einstellungen, den Arbeitsordner mit den Dateien des Agenten und das Programm. **Achtung:** Alle Daten des Agenten gehen dabei verloren.

```bash
openclaw uninstall --all
```

### 3. Restliche Dateien entfernen

Löscht, was von `~/.openclaw` noch übrig ist, etwa das mitgebrachte Node.js.

```bash
rm -rf ~/.openclaw
```

### 4. Suchpfad-Eintrag entfernen

```bash
nano ~/.bashrc
```

Lösche die Zeile `export PATH="$HOME/.openclaw/bin:$PATH"`: Cursor in die Zeile setzen und <kbd>Strg</kbd>+<kbd>K</kbd> drücken. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** In einem neuen Terminal meldet die Shell, dass der Befehl `openclaw` nicht gefunden wurde.

```bash
openclaw --version
```
