# WebVM und CheerpX

WebVM stellt eine Linux-Umgebung im Browser bereit und verwendet dafür die x86-Emulation CheerpX.

## Was auf Ubuntu eingerichtet wird

Diese Anleitung baut auf Ubuntu 26.04 LTS (amd64) die WebVM-Oberfläche und liefert sie lokal mit nginx aus. Ein fertiges Linux-Datenträgerabbild erspart einen eigenen Image-Build. Docker wird nicht verwendet. Das Gastprogramm läuft im Browser, nicht als Linux-Prozess auf dem Webserver.

Grundlage ist der [WebVM-Quellstand 667a02d](https://github.com/leaningtech/webvm/tree/667a02d79a3b91a48ed7bee8dca3693c33ef95a2). Das darin eingebundene NPM-Paket lädt die eigentliche CheerpX-Runtime vom Hersteller. Der Aufbau ist deshalb **kein vollständig lokaler Offline-Betrieb**. Die WebVM-Oberfläche ist unter Apache-2.0 veröffentlicht; für CheerpX gelten eigene Bedingungen. Nach der [Herstellerbeschreibung](https://cheerpx.io/docs/licensing) setzt das Selbsthosten der Runtime eine kommerzielle Lizenz voraus. Prüfe bei institutioneller Nutzung insbesondere die Bedingungen für Hochschulen und Organisationen; die Lizenz der Oberfläche allein deckt CheerpX nicht ab.

Die Schritte beschreiben einen lokalen technischen Versuch. Abhängigkeitsinstallation und statischer Build waren in der Prüfumgebung erfolgreich; die vollständige Browserausführung auf Ubuntu 26.04 wurde hier nicht getestet. Für die Bedienung benötigst du einen aktuellen Browser mit WebAssembly und SharedArrayBuffer sowie Internetzugang zum CheerpX-Server.

## Werkzeuge installieren

### 1. Paketlisten aktualisieren

Damit Ubuntu die verfügbaren Pakete kennt.

```bash
sudo apt update
```

### 2. Build-Werkzeuge und nginx installieren

Node.js und npm bauen die Oberfläche, Git lädt den Quellcode und nginx liefert die Dateien aus. Ubuntu 26.04 bietet Node.js 22, das die Anforderungen des hier verwendeten Vite-5-Builds erfüllt. Beachte, dass das nginx-Paket auch einen Systemdienst einrichten kann; bei einem bereits vorhandenen Webserver muss dessen Portbelegung vorher berücksichtigt werden.

```bash
sudo apt install nodejs npm git nginx curl ca-certificates nano
```

**Prüfen:** Die Ausgabe sollte mit `v22.` oder einer geeigneten neueren Node-Version beginnen.

```bash
node --version
```

### 3. Ins Home-Verzeichnis wechseln

Die WebVM-Dateien werden im eigenen Benutzerkonto abgelegt.

```bash
cd ~
```

### 4. Quellcode laden

Der Zielordner darf noch nicht existieren.

```bash
git clone https://github.com/leaningtech/webvm.git webvm-lokal
```

### 5. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/webvm-lokal
```

### 6. Dokumentierten Quellstand auswählen

Verhindert, dass spätere Projektänderungen unbemerkt andere Voraussetzungen einführen.

```bash
git checkout --detach 667a02d79a3b91a48ed7bee8dca3693c33ef95a2
```

## Fertiges Gastabbild verwenden

### 7. Image-Verzeichnis anlegen

Hier liegt das lokale Datenträgerabbild. Plane für Downloads und Build mehrere GB freien Speicher ein.

```bash
mkdir -p custom-disk-images
```

### 8. Offizielles Beispielabbild herunterladen

Lädt das in der Projektanleitung genannte Debian-Mini-Abbild. Es ist ein älteres Demonstrationssystem, keine aktuelle Ubuntu-Installation. Die darin enthaltene Software wird durch ein `apt update` auf dem Ubuntu-Host nicht aktualisiert.

```bash
curl --fail --location --output custom-disk-images/debian_mini_20230519_5022088024.ext2 https://github.com/leaningtech/webvm/releases/download/ext2_image/debian_mini_20230519_5022088024.ext2
```

### 9. Lokales Abbild konfigurieren

Öffne die Datei und ersetze ausschließlich die vorhandenen Definitionen für `diskImageUrl` und `diskImageType` durch die folgenden Zeilen. Die übrigen Einstellungen bleiben bestehen.

```bash
nano config_public_terminal.js
```

```javascript
export const diskImageUrl = "/custom-disk-images/debian_mini_20230519_5022088024.ext2";
export const diskImageType = "bytes";
```

Speichere mit **Strg+O**, bestätige mit **Enter** und beende nano mit **Strg+X**.

### 10. JavaScript-Abhängigkeiten installieren

Verwendet die zum Quellstand gehörende Sperrdatei. Die Installation erfolgt ohne `sudo` im Projektordner.

```bash
npm ci
```

### 11. Oberfläche bauen

Erzeugt das Verzeichnis `build` mit den auslieferbaren Webdateien. Auch dieser Schritt benötigt Internetzugang, da das Projekt beim Erzeugen statischer Seiten externe Inhalte abfragt. Bei `fetch failed` prüfe zuerst die Netzwerkverbindung.

```bash
npm run build
```

## Lokal ausliefern

### 12. Eigene nginx-Konfiguration erstellen

Öffne die neue Datei und füge den folgenden Inhalt ein. Sie startet einen separaten nginx-Prozess im Benutzerkonto und verändert keine bestehenden nginx-Sites. Port 8083 ist ausschließlich lokal erreichbar.

```bash
nano nginx-local.conf
```

```nginx
daemon off;
pid nginx-local.pid;
error_log stderr;

events {
    worker_connections 256;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    access_log off;

    server {
        listen 127.0.0.1:8083;
        server_name localhost;

        add_header Cross-Origin-Opener-Policy same-origin always;
        add_header Cross-Origin-Embedder-Policy require-corp always;

        location / {
            root build;
            index index.html;
        }

        location /custom-disk-images/ {
            root .;
        }
    }
}
```

Die beiden Cross-Origin-Header ermöglichen die vom Browser benötigte Isolation. Ein gewöhnlicher HTTP-Dateiserver ohne diese Header genügt nicht; siehe den [CheerpX-Einstieg](https://cheerpx.io/docs/getting-started).

### 13. nginx-Konfiguration prüfen

Der Präfix sorgt dafür, dass relative Pfade auf den Projektordner zeigen. Die Prüfung muss erfolgreich enden.

```bash
nginx -t -e stderr -p "$PWD/" -c nginx-local.conf
```

### 14. Lokalen Webserver starten

Der Prozess bleibt im Vordergrund. Port 8083 muss frei sein.

```bash
nginx -e stderr -p "$PWD/" -c nginx-local.conf
```

### 15. HTTP-Header prüfen

Öffne ein zweites Terminal. Die Antwort soll HTTP 200 sowie die Header `Cross-Origin-Opener-Policy` und `Cross-Origin-Embedder-Policy` enthalten.

```bash
curl --head http://127.0.0.1:8083/
```

### 16. Bereichsabruf des Abbilds prüfen

Die Antwort soll HTTP 206 und einen passenden `Content-Range` enthalten. Bereichsabrufe vermeiden, dass jeder Zugriff das gesamte Image übertragen muss.

```bash
curl --range 0-1023 --dump-header - --output /dev/null http://127.0.0.1:8083/custom-disk-images/debian_mini_20230519_5022088024.ext2
```

### 17. WebVM im Browser öffnen

Warte, bis die Linux-Shell erscheint. localhost gilt für die benötigten Browserfunktionen als lokale Entwicklungsumgebung; ein Zugriff über eine gewöhnliche HTTP-LAN-Adresse erfüllt diese Voraussetzung nicht.

```text
http://127.0.0.1:8083
```

### 18. Gastumgebung prüfen

Gib diesen Befehl **im WebVM-Terminal im Browser** ein. Er zeigt die Distribution des Gasts, nicht die des Ubuntu-Hosts.

```bash
cat /etc/os-release
```

Die Browser-Entwicklerkonsole sollte bei folgendem JavaScript-Ausdruck `true` anzeigen, wenn die erforderliche Isolation aktiv ist:

```javascript
crossOriginIsolated
```

Schreibzugriffe des Gasts können im Browserprofil gespeichert werden. Sichere benötigte Gastdateien vor dem Löschen von Websitedaten. Gast-Netzwerkzugang ist eine zusätzliche Funktion und wird hier nicht eingerichtet; erfolgreicher Zugriff auf die Oberfläche bedeutet nicht automatisch Internetzugang innerhalb der WebVM.

### 19. Webserver beenden

Drücke im nginx-Terminal **Strg+C**. Schließe auch den Browser-Tab, wenn die Gastumgebung nicht weiterlaufen soll.

## Deinstallieren

### 1. Lokalen nginx-Prozess beenden

Drücke im zugehörigen Terminal **Strg+C**, falls er noch läuft. Der eventuell vorhandene nginx-Systemdienst ist ein anderer Prozess.

### 2. WebVM-Dateien löschen

Entfernt Quellcode, Build-Abhängigkeiten und Gastabbild. Sichere eigene Anpassungen vorher.

```bash
rm -rf -- ~/webvm-lokal
```

### 3. Optional: Browserdaten entfernen

Lösche in den Browsereinstellungen die Websitedaten für `http://127.0.0.1:8083`, wenn dort gespeicherte Gastdaten ebenfalls entfernt werden sollen. Dabei gehen nicht exportierte Gastdateien verloren.

### 4. Entfernung prüfen

Die Ausgabe soll `WebVM-Dateien entfernt` lauten. Gemeinsam verwendete Programme wie Node.js und nginx bleiben installiert.

```bash
test ! -e ~/webvm-lokal && echo 'WebVM-Dateien entfernt'
```
