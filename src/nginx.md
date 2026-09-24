# nginx

nginx ist ein schneller Webserver. Auf dem Entwicklungsrechner dient er dazu, Webseiten und Webanwendungen lokal unter `http://localhost` zu testen.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von nginx aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. nginx installieren

Installiert nginx aus den offiziellen Ubuntu-Paketquellen. Der Dienst wird dabei automatisch gestartet.

```bash
sudo apt install nginx
```

**Prüfen:** Die Versionsnummer wird angezeigt.

```bash
nginx -v
```

### 3. Prüfen, ob der Dienst läuft

nginx läuft als Hintergrunddienst (systemd). Hier siehst du, ob er gestartet ist.

```bash
systemctl status nginx
```

**Prüfen:** In der Ausgabe steht `Active: active (running)`. Mit `q` verlässt du die Anzeige.

### 4. Startseite im Browser aufrufen

Zeigt, dass nginx Anfragen beantwortet.

```bash
curl -I http://localhost
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 200 OK`. Im Browser erscheint unter <http://localhost> die Seite „Welcome to nginx!“.

## Eigene Entwicklungsseite einrichten

### 5. Ordner für die Seite anlegen

Die Dateien kommen nach `/var/www/dev`. Der Ordner gehört deinem Benutzer, damit du ohne `sudo` darin arbeiten kannst. Das Home-Verzeichnis eignet sich nicht, weil nginx (Benutzer `www-data`) dort keine Leserechte hat.

```bash
sudo mkdir -p /var/www/dev
```

```bash
sudo chown "$USER":"$USER" /var/www/dev
```

### 6. Testseite anlegen

Eine einfache HTML-Datei, um die Einrichtung zu prüfen.

```bash
nano /var/www/dev/index.html
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```html
<h1>Entwicklung läuft</h1>
```

### 7. Konfiguration für die Seite anlegen

Die Seite läuft auf Port `8081`, damit sie die Standardseite auf Port 80 nicht stört. Port 8080 bleibt frei für Apache (siehe [nginx als Proxy vor Apache](nginx-apache.md)). `listen 127.0.0.1` sorgt dafür, dass nur dein eigener Rechner darauf zugreifen kann.

```bash
sudo nano /etc/nginx/sites-available/dev
```

Die Datei hat schon Inhalt, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 127.0.0.1:8081;
    server_name localhost;

    root /var/www/dev;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 8. Seite aktivieren

nginx lädt nur Konfigurationen aus `sites-enabled`. Ein Link dorthin schaltet die Seite ein.

```bash
sudo ln -s /etc/nginx/sites-available/dev /etc/nginx/sites-enabled/dev
```

### 9. Konfiguration testen

Findet Tippfehler, bevor nginx neu geladen wird.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 10. nginx neu laden

Übernimmt die neue Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

**Prüfen:** Die Testseite wird angezeigt.

```bash
curl http://localhost:8081
```

Die Ausgabe ist `<h1>Entwicklung läuft</h1>`. Im Browser: <http://localhost:8081>.

## Optional: Autostart ausschalten

Auf einem Entwicklungsrechner muss nginx nicht bei jedem Systemstart laufen.

Autostart ausschalten:

```bash
sudo systemctl disable nginx
```

Bei Bedarf von Hand starten und stoppen:

```bash
sudo systemctl start nginx
```

```bash
sudo systemctl stop nginx
```

## Deinstallieren

### 1. Entwicklungsseite entfernen

Löscht die Konfiguration und die Dateien der Seite. **Achtung:** Alles in `/var/www/dev` geht verloren.

```bash
sudo rm /etc/nginx/sites-enabled/dev /etc/nginx/sites-available/dev
```

```bash
sudo rm -r /var/www/dev
```

### 2. nginx entfernen

`purge` entfernt auch die Konfigurationsdateien unter `/etc/nginx`.

```bash
sudo apt purge nginx nginx-common
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten, die nur für nginx installiert wurden.

```bash
sudo apt autoremove
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
nginx -v
```
