# Excalidraw

Excalidraw ist ein Zeichenprogramm für Skizzen, Diagramme und Schaubilder im Handzeichnungs-Stil. Es läuft im Browser. Zeichnungen lassen sich als offene JSON-Datei (`.excalidraw`) speichern oder als PNG bzw. SVG exportieren.

## Vorbemerkungen

- **Kein apt-Paket, kein Snap:** Excalidraw ist eine Web-App. Diese Anleitung baut sie aus dem offiziellen Quellcode und liefert sie mit [nginx](nginx.md) auf dem eigenen Rechner aus. So läuft sie ohne die Seite excalidraw.com.
- **Version:** Verwendet wird die Version **0.18.1** (Git-Tag `v0.18.1`). Sie braucht Node.js 18 bis 22. Ubuntu 26.04 liefert Node.js 22, das passt.
- **Speicherplatz und Zeit:** Die Build-Werkzeuge belegen etwa 1,1 GB, der Bau dauert je nach Rechner ein bis drei Minuten. Die fertige App ist etwa 45 MB groß.
- **Was lokal bleibt:** Zeichnen, Speichern und Exportieren funktionieren komplett lokal. Die Funktionen **Live-Zusammenarbeit**, **Link teilen** und die **Bibliothek** mit fertigen Formen nutzen weiterhin die Server von excalidraw.com.

## Vorbereitung

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Node.js, npm und Git kennt.

```bash
sudo apt update
```

### 2. Node.js, npm und Git installieren

Node.js und npm werden zum Bauen gebraucht, Git zum Herunterladen des Quellcodes. Ist alles schon vorhanden (z. B. aus der [Docusaurus-Anleitung](docusaurus.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm git
```

**Prüfen:** Die Versionsnummer liegt zwischen `v18` und `v22`, z. B. `v22.22.1`.

```bash
node --version
```

Zeigt der Befehl eine höhere Version (z. B. `v25`), stammt Node.js aus dem Versionsmanager `nvm`. Schalte dann für dieses Terminal auf das Node.js von Ubuntu um und prüfe erneut:

```bash
nvm use system
```

## Excalidraw bauen

### 3. Quellcode herunterladen

Lädt den Quellcode der Version 0.18.1 nach `~/excalidraw`. `--depth 1` lädt nur diesen Stand ohne die gesamte Versionsgeschichte.

```bash
git clone --depth 1 -b v0.18.1 https://github.com/excalidraw/excalidraw.git ~/excalidraw
```

### 4. In den Quellcode-Ordner wechseln

Alle Befehle zum Bauen werden hier ausgeführt.

```bash
cd ~/excalidraw
```

### 5. Abhängigkeiten installieren

Excalidraw verwendet den Paketmanager **Yarn in Version 1**. Ubuntu liefert nur die neuere, nicht passende Yarn-Version 4. `npx` lädt deshalb genau die benötigte Version 1.22.22 herunter und führt sie aus. `--frozen-lockfile` installiert exakt die Versionen, die die Entwickler getestet haben.

```bash
npx --yes yarn@1.22.22 install --frozen-lockfile
```

**Prüfen:** Die Ausgabe endet mit `Done in …`.

### 6. App bauen

Erzeugt die fertige Web-App im Ordner `excalidraw-app/build`. Das Build-Skript heißt `build:app:docker`, hat aber nichts mit Docker zu tun: Es ist die Variante, die **keine** Fehlerberichte an den Dienst Sentry sendet und keine Nutzungsstatistik erhebt. Deshalb eignet sie sich für eine eigene Installation.

```bash
npx --yes yarn@1.22.22 build:app:docker
```

**Prüfen:** Die Ausgabe enthält `✓ built in …`, und im Ordner liegt eine `index.html`.

```bash
ls excalidraw-app/build/index.html
```

## Mit nginx ausliefern

### 7. Zielordner anlegen

Die fertige App wird nach `/var/www/excalidraw` kopiert, wo nginx sie lesen darf.

```bash
sudo mkdir -p /var/www/excalidraw
```

### 8. App kopieren

Kopiert den Inhalt des Build-Ordners. Der Punkt am Ende von `build/.` sorgt dafür, dass auch versteckte Dateien mitkommen.

```bash
sudo cp -r excalidraw-app/build/. /var/www/excalidraw/
```

### 9. nginx-Konfiguration anlegen

Excalidraw läuft auf Port `8087` und ist nur vom eigenen Rechner aus erreichbar. Die App besteht nur aus statischen Dateien, PHP oder ein anderer Dienst ist nicht nötig. Der zweite Block gibt der Datei `manifest.webmanifest` den richtigen Typ. Mit ihr kann der Browser Excalidraw als eigene App installieren.

```bash
sudo nano /etc/nginx/sites-available/excalidraw
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 127.0.0.1:8087;
    server_name localhost;

    root /var/www/excalidraw;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /manifest.webmanifest {
        default_type application/manifest+json;
    }
}
```

### 10. Konfiguration aktivieren

Ein Link in `sites-enabled` sorgt dafür, dass nginx die neue Seite lädt.

```bash
sudo ln -s /etc/nginx/sites-available/excalidraw /etc/nginx/sites-enabled/excalidraw
```

### 11. nginx-Konfiguration testen

Findet Tippfehler, bevor nginx neu geladen wird.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 12. nginx neu laden

Übernimmt die Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

**Prüfen:** Die Ausgabe enthält den Seitentitel `Excalidraw`.

```bash
curl -s http://localhost:8087/ | grep -o '<title>[^<]*'
```

Im Browser öffnet <http://localhost:8087> die Zeichenfläche. Ist dein Browser auf Deutsch eingestellt, erscheint auch Excalidraw auf Deutsch. Sonst stellst du die Sprache im Menü (☰ oben links) ganz unten um.

### 13. Optional: Quellcode-Ordner löschen

Der Quellcode samt Build-Werkzeugen (etwa 1,1 GB) wird für den Betrieb nicht mehr gebraucht. Behalte ihn, wenn du später aktualisieren willst.

```bash
rm -rf ~/excalidraw
```

## Das Dateiformat `.excalidraw`

Excalidraw merkt sich die aktuelle Zeichnung automatisch im Speicher des Browsers. Dieser Speicher gehört zur Adresse `http://localhost:8087`. Löschst du die Browserdaten, ist die Zeichnung weg. Wichtige Zeichnungen speicherst du deshalb mit <kbd>Strg</kbd>+<kbd>S</kbd> als Datei.

Eine `.excalidraw`-Datei ist lesbares JSON:

- `type` ist immer `"excalidraw"`, `version` die Formatversion (derzeit `2`)
- `elements` enthält alle Formen: Rechtecke, Pfeile, Texte usw., jeweils mit Position, Größe, Farben und einer eindeutigen `id`. Pfeile verweisen über diese `id` auf die Formen, die sie verbinden.
- `appState` enthält Ansichtseinstellungen wie Hintergrundfarbe und Raster
- `files` enthält eingefügte Bilder, als Text kodiert (Base64)

Beim Export als PNG oder SVG kannst du die Option **Szene einbetten** wählen. Dann steckt die komplette Zeichnung in der Bilddatei, und Excalidraw kann sie später wieder bearbeitbar öffnen.

**Tipp:** Wer [Obsidian](obsidian.md) nutzt, kann Excalidraw-Zeichnungen mit der Community-Erweiterung „Excalidraw“ direkt im Vault ablegen und mit Notizen verlinken.

## Aktualisieren

Für eine neue Version wiederholst du die Schritte 3 bis 8 mit der neuen Versionsnummer im Befehl `git clone`. Den alten Quellcode-Ordner löschst du vorher, den alten Inhalt von `/var/www/excalidraw` ebenfalls (`sudo rm -rf /var/www/excalidraw/*`). Neue Versionen stehen auf <https://github.com/excalidraw/excalidraw/releases>. Prüfe dort auch, welche Node.js-Version sie brauchen.

## Deinstallieren

### 1. Seite in nginx deaktivieren

Löscht den Link aus `sites-enabled`.

```bash
sudo rm -f /etc/nginx/sites-enabled/excalidraw
```

### 2. nginx-Konfigurationsdatei löschen

Löscht die Konfigurationsdatei der Seite.

```bash
sudo rm -f /etc/nginx/sites-available/excalidraw
```

### 3. nginx neu laden

Übernimmt das Abschalten der Seite.

```bash
sudo systemctl reload nginx
```

### 4. App-Dateien löschen

Entfernt die ausgelieferte App.

```bash
sudo rm -rf /var/www/excalidraw
```

### 5. Quellcode und Zwischenspeicher löschen

Entfernt den Quellcode-Ordner (falls noch vorhanden) und das von `npx` zwischengespeicherte Yarn. Andere Projekte sind nicht betroffen, `npx` lädt benötigte Programme beim nächsten Aufruf neu.

```bash
rm -rf ~/excalidraw ~/.npm/_npx
```

### 6. Optional: Node.js und npm entfernen

Nur ausführen, wenn kein anderes Programm Node.js braucht (z. B. Antora, Docusaurus, VitePress oder Starlight).

```bash
sudo apt purge nodejs npm
```

```bash
sudo apt autoremove
```

**Prüfen:** Unter <http://localhost:8087> antwortet kein Webserver mehr, `curl` meldet einen Verbindungsfehler.

```bash
curl -sI http://localhost:8087/
```

Zeichnungen, die du als `.excalidraw`-Datei gespeichert hast, bleiben erhalten. Die automatisch gemerkte Zeichnung im Browser verschwindet erst, wenn du die Browserdaten für `localhost:8087` löschst.
