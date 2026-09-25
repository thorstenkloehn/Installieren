# AnythingLLM

AnythingLLM ist ein Desktop-Programm, in dem man mit Sprachmodellen chattet und ihnen eigene Dokumente zum Nachschlagen gibt (RAG). Es bringt Vektordatenbank, Dokumentenimport und Oberfläche in einer Anwendung mit. Mit [Ollama](ollama.md) als Modell bleibt dabei alles auf dem eigenen Rechner.

> **Teilweise getestet:** Installation, AppArmor-Profil, Start und die Erkennung der Ollama-Modelle wurden unter Ubuntu 26.04 geprüft. Die Einrichtung und der Chat in der Oberfläche (ab Schritt 10) wurden **nicht** durchgeklickt.

## Vorbemerkungen

- **Voraussetzung:** [Ollama](ollama.md) läuft und hat die Modelle `qwen3:4b-instruct` und `nomic-embed-text` geladen.
- **Keine Installation über apt:** Für Linux gibt es AnythingLLM Desktop nur als **AppImage**. Das ist eine einzelne Programmdatei, die ohne Installation läuft. Der Hersteller bietet auch ein Installationsskript an. Diese Anleitung macht dieselben Schritte von Hand, lässt aber das zusätzliche, eingebaute Ollama weg, weil Ollama schon als Dienst läuft.
- **Version:** Getestet mit AnythingLLM Desktop **1.16.2**.
- **AppArmor:** Ubuntu erlaubt Programmen seit Version 24.04 bestimmte Sandbox-Funktionen nur mit einem passenden AppArmor-Profil. Ohne Profil bricht AnythingLLM beim Start ab mit `The SUID sandbox helper binary was found, but is not configured correctly`. Schritt 6 legt das Profil an.
- **Ports:** AnythingLLM startet im Hintergrund einen eigenen Server auf **127.0.0.1:3001** und einen Dokumentensammler auf **127.0.0.1:8888**. Port 3001 verwendet auch [Wiki.js](wikijs.md) in dieser Sammlung. Läuft Wiki.js, stoppe es vor dem Start von AnythingLLM mit `sudo systemctl stop wikijs`.
- **Platz:** Das AppImage ist etwa 900 MB groß.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfspakete aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. FUSE-Bibliothek installieren

AppImages binden sich beim Start als eigenes kleines Dateisystem ein. Dafür braucht AnythingLLM die ältere FUSE-Bibliothek in Version 2, die Ubuntu nicht mehr standardmäßig installiert. Ohne sie bricht der Start ab mit `error loading libfuse.so.2`.

```bash
sudo apt install libfuse2t64 curl
```

### 3. Ordner für Programme anlegen

Ein eigener Ordner im Home-Verzeichnis hält selbst heruntergeladene Programme zusammen.

```bash
mkdir -p ~/Anwendungen
```

### 4. AppImage herunterladen

Lädt AnythingLLM Desktop 1.16.2 (etwa 900 MB). Die aktuelle Version steht auf <https://github.com/Mintplex-Labs/anything-llm/releases>. Der Dateiname muss `AnythingLLMDesktop.AppImage` lauten, weil das AppArmor-Profil in Schritt 6 genau diesen Namen erwartet.

```bash
curl -L -o ~/Anwendungen/AnythingLLMDesktop.AppImage https://github.com/Mintplex-Labs/anything-llm/releases/download/v1.16.2/AnythingLLMDesktop.AppImage
```

### 5. AppImage ausführbar machen

Heruntergeladene Dateien sind unter Linux zunächst nicht ausführbar. `chmod +x` ändert das.

```bash
chmod +x ~/Anwendungen/AnythingLLMDesktop.AppImage
```

### 6. AppArmor-Profil anlegen

Legt ein Profil an, das AnythingLLM die Sandbox-Funktionen erlaubt. Es gilt für jede Datei namens `AnythingLLMDesktop.AppImage`, egal in welchem Ordner.

```bash
sudo nano /etc/apparmor.d/anythingllmdesktop
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
# AppArmor-Profil für AnythingLLM Desktop
abi <abi/4.0>,
include <tunables/global>

profile anythingllmdesktop /**/AnythingLLMDesktop.AppImage flags=(unconfined) {
  userns,
}
```

- `profile anythingllmdesktop /**/AnythingLLMDesktop.AppImage` – der Name des Profils und für welche Dateien es gilt. `/**/` steht für einen beliebigen Ordner.
- `flags=(unconfined)` – das Programm wird sonst nicht eingeschränkt.
- `userns,` – erlaubt dem Programm, sogenannte User-Namespaces anzulegen. Die eingebaute Chromium-Sandbox braucht sie.

### 7. Profil laden

Lädt das neue Profil sofort, ohne Neustart.

```bash
sudo apparmor_parser -r /etc/apparmor.d/anythingllmdesktop
```

**Prüfen:** Das Profil erscheint in der Liste der geladenen Profile.

```bash
sudo aa-status | grep anythingllm
```

## Starten

### 8. AnythingLLM starten

Startet das Programm. Beim ersten Start richtet es seinen Datenordner `~/.config/anythingllm-desktop` ein, das dauert einige Sekunden.

```bash
~/Anwendungen/AnythingLLMDesktop.AppImage
```

Das Terminal bleibt belegt, solange AnythingLLM läuft, und zeigt laufend Meldungen. Beim Schließen des Fensters endet auch der Befehl.

### 9. Hintergrund-Server prüfen

Öffne ein zweites Terminal. Dieser Befehl fragt den eingebauten Server von AnythingLLM, ob er läuft.

```bash
curl -s http://127.0.0.1:3001/api/ping
```

**Prüfen:** Die Antwort lautet `{"online":true}`.

## Einrichten (nicht getestet)

### 10. Ollama als Sprachmodell wählen

Beim ersten Start führt AnythingLLM durch eine Einrichtung. Wähle beim Sprachmodell (LLM Preference) den Anbieter **Ollama**. Als Adresse trägst du `http://127.0.0.1:11434` ein, falls sie nicht schon da steht. Im Test fand AnythingLLM die Modelle von Ollama darüber selbst. Wähle `qwen3:4b-instruct`.

### 11. Ollama für Embeddings wählen

Unter **Embedder** wählst du ebenfalls **Ollama** und das Modell `nomic-embed-text`. Sonst nutzt AnythingLLM ein eingebautes, kleineres Embedding-Modell. Als Vektordatenbank bleibt die eingebaute **LanceDB** eingestellt. Sie braucht keine weitere Einrichtung.

### 12. Arbeitsbereich anlegen und Dokument hochladen

Lege einen Arbeitsbereich (Workspace) an, z. B. „Rösterei“. Über das Symbol zum Hochladen ziehst du eine Textdatei, ein PDF oder ein Word-Dokument hinein und fügst sie dem Arbeitsbereich hinzu (**Move to Workspace**, dann **Save and Embed**). AnythingLLM zerlegt das Dokument und speichert die Vektoren.

### 13. Frage stellen

Stelle im Arbeitsbereich eine Frage zum Inhalt des Dokuments. Unter der Antwort zeigt AnythingLLM die verwendeten Quellen. Als Übungsdokumente eignen sich die beiden Texte aus der Anleitung [LlamaIndex](llamaindex.md).

## Optional: Eintrag im Anwendungsmenü

### 14. Starter anlegen

Damit AnythingLLM im Anwendungsmenü von Ubuntu erscheint, braucht es eine Desktop-Datei. Das `~` wird darin nicht verstanden, deshalb steht dort der volle Pfad. Ersetze `DEINNAME` durch deinen Benutzernamen (Ausgabe von `whoami`).

```bash
nano ~/.local/share/applications/anythingllmdesktop.desktop
```

Füge diesen Inhalt ein, speichere und beende nano:

```ini
[Desktop Entry]
Type=Application
Name=AnythingLLM Desktop
Exec=/home/DEINNAME/Anwendungen/AnythingLLMDesktop.AppImage
Icon=/home/DEINNAME/.config/anythingllm-desktop/storage/icon.png
StartupWMClass=anythingllm-desktop
Categories=Utility;
```

## Wo liegt was?

- `~/Anwendungen/AnythingLLMDesktop.AppImage` – das Programm.
- `~/.config/anythingllm-desktop/storage` – Einstellungen, hochgeladene Dokumente, Vektordatenbank und Chats.
- `/etc/apparmor.d/anythingllmdesktop` – das AppArmor-Profil.

## Aktualisieren

### 1. AnythingLLM beenden

Schließe das Fenster von AnythingLLM.

### 2. Neue Version herunterladen

Überschreibt das AppImage mit der neuen Version. Ersetze `v1.16.2` durch die aktuelle Versionsnummer. Einstellungen und Dokumente bleiben erhalten.

```bash
curl -L -o ~/Anwendungen/AnythingLLMDesktop.AppImage https://github.com/Mintplex-Labs/anything-llm/releases/download/v1.16.2/AnythingLLMDesktop.AppImage
```

### 3. Wieder ausführbar machen

Die neue Datei ist wie beim ersten Download nicht ausführbar.

```bash
chmod +x ~/Anwendungen/AnythingLLMDesktop.AppImage
```

## Deinstallieren

### 1. AnythingLLM beenden

Schließe das Fenster von AnythingLLM.

### 2. Programm löschen

Entfernt das AppImage.

```bash
rm ~/Anwendungen/AnythingLLMDesktop.AppImage
```

### 3. Daten löschen

Löscht Einstellungen, Dokumente, Vektoren und Chats. **Achtung:** Alles, was du in AnythingLLM gespeichert hast, geht verloren.

```bash
rm -rf ~/.config/anythingllm-desktop
```

### 4. Menüeintrag löschen (falls angelegt)

Entfernt die Desktop-Datei aus Schritt 14. `-f` verhindert eine Fehlermeldung, falls es sie nicht gibt.

```bash
rm -f ~/.local/share/applications/anythingllmdesktop.desktop
```

### 5. AppArmor-Profil entladen

Nimmt das Profil aus dem laufenden AppArmor heraus.

```bash
sudo apparmor_parser -R /etc/apparmor.d/anythingllmdesktop
```

### 6. AppArmor-Profil löschen

Entfernt die Datei aus Schritt 6.

```bash
sudo rm /etc/apparmor.d/anythingllmdesktop
```

### 7. FUSE-Bibliothek entfernen (optional)

Nur ausführen, wenn kein anderes AppImage sie braucht.

```bash
sudo apt purge libfuse2t64
```

**Prüfen:** Das Profil ist nicht mehr geladen, die Ausgabe ist leer.

```bash
sudo aa-status | grep anythingllm
```
