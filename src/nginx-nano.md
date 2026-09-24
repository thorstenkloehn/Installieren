# nginx-Konfiguration mit nano bearbeiten

Diese Anleitung zeigt, wie man die Konfiguration einer statischen Website von Hand im Terminal-Editor [GNU nano](nano.md) anlegt und ändert, am Beispiel `start.de`. Dabei geht es auch um den Aufbau einer nginx-Konfiguration und darum, Tippfehler anhand der Meldungen von `nginx -t` zu finden.

**Voraussetzung:** nginx ist installiert (siehe [nginx](nginx.md)), und die Dateien der Website liegen in `/var/www/start.de/html`. Wie man sie anlegt, zeigen die Schritte 2 bis 6 der Anleitung [Statische Website mit nginx](nginx-statisch.md). Dort wird die fertige Konfiguration nur eingefügt. Hier geht es ausführlicher um ihren Aufbau, um spätere Änderungen und um die Fehlersuche.

## Vorbereitung

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von nano kennt.

```bash
sudo apt update
```

### 2. nano installieren

Unter Ubuntu ist nano meist schon vorhanden. Dann meldet `apt` das nur.

```bash
sudo apt install nano
```

**Prüfen:** Die Versionsnummer wird angezeigt, z. B. `GNU Nano, Version 8.7.1`.

```bash
nano --version
```

### 3. Vorhandene Konfiguration sichern

Nur nötig, wenn es die Datei `/etc/nginx/sites-available/start.de` schon gibt, z. B. aus der Anleitung [Statische Website mit nginx](nginx-statisch.md). Die Kopie liegt bewusst **außerhalb** von `sites-available` und `sites-enabled`. So kann nginx sie nicht versehentlich als zweite Website laden. `-p` behält Rechte und Zeitstempel bei.

```bash
sudo cp -p /etc/nginx/sites-available/start.de /root/start.de.sicherung
```

**Prüfen:** Ohne vorhandene Datei meldet `cp` `Datei oder Verzeichnis nicht gefunden`. Das ist dann in Ordnung, es gibt nichts zu sichern.

## So ist eine nginx-Konfiguration aufgebaut

Bevor du tippst, lohnt ein Blick auf die Schreibregeln. nginx ist dabei streng. Ein einziges fehlendes Zeichen verhindert, dass die neue Konfiguration geladen wird.

| Regel | Beispiel |
|---|---|
| Jede Einstellung (**Anweisung**) steht meist in einer eigenen Zeile: vorne das Stichwort, dahinter ein oder mehrere Werte. Den Schluss bildet **immer** ein `;` | `root /var/www/start.de/html;` |
| Ein **Block** fasst Anweisungen in geschweiften Klammern zusammen. Jede `{` braucht eine passende `}`. Nach `}` steht **kein** `;` | `server { … }` |
| Der **server-Block** beschreibt eine Website | `server { listen 80; … }` |
| Ein **location-Block** gilt nur für bestimmte Adressen innerhalb der Website | `location / { … }` |
| Mit `#` beginnen **Kommentare**: Notizen für Menschen, die nginx beim Lesen einfach überspringt. Sie dürfen auch hinter einer Anweisung stehen | `expires 7d;  # eine Woche` |
| **Einrückungen** sind für nginx egal, machen die Datei aber lesbar. Üblich sind vier Leerzeichen pro Ebene | |

## Konfiguration in nano anlegen

### 4. Datei in nano öffnen

`sudo` ist nötig, weil Dateien unter `/etc/nginx` dem Benutzer `root` gehören. `-l` zeigt links Zeilennummern an. Die braucht man später, weil `nginx -t` Fehler mit Zeilennummer meldet.

```bash
sudo nano -l /etc/nginx/sites-available/start.de
```

**Prüfen:** Unten steht `Neue Datei`, wenn es die Datei noch nicht gab. Sonst zeigt nano ihren Inhalt und meldet z. B. `28 Zeilen gelesen`.

### 5. Vorhandenen Inhalt löschen

Nur nötig, wenn die Datei schon Text enthält. Drücke so oft <kbd>Strg</kbd>+<kbd>K</kbd>, bis die Datei leer ist. Jeder Druck schneidet eine Zeile aus. Die gesicherte Kopie aus Schritt 3 bleibt davon unberührt.

### 6. Konfiguration eingeben

Tippe den folgenden Text ab oder kopiere ihn und füge ihn im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd> ein. Die Bedeutung der Zeilen:

- `listen` – Port 80, über IPv4 und IPv6
- `server_name` – der Block gilt nur für Anfragen an `start.de` und `www.start.de`
- `root` – Ordner mit den Dateien der Website, `index` – Startdatei eines Ordners
- `access_log`, `error_log` – eigene Logdateien für diese Website
- `location /` – liefert die angefragte Datei aus, sonst Fehler 404
- `error_page` – eigene Fehlerseite statt der schlichten Seite von nginx
- zweiter `location`-Block – CSS, Skripte, Bilder und Schriften darf der Browser 7 Tage zwischenspeichern

```nginx
# Statische Website start.de
server {
    listen 80;
    listen [::]:80;
    server_name start.de www.start.de;

    root /var/www/start.de/html;
    index index.html;

    access_log /var/log/nginx/start.de.access.log;
    error_log  /var/log/nginx/start.de.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;

    location ~* \.(css|js|png|jpe?g|gif|svg|webp|ico|woff2?)$ {
        expires 7d;
    }
}
```

Beim Einfügen rückt nano manchmal zusätzlich ein. Das stört nginx nicht.

**Prüfen:** Links stehen die Zeilennummern 1 bis 22. Die letzte Zeile ist `}` ganz am Zeilenanfang.

### 7. Datei speichern

Drücke <kbd>Strg</kbd>+<kbd>O</kbd>. Unten fragt nano nach dem Dateinamen, der schon eingetragen ist. Bestätige mit <kbd>Enter</kbd>.

**Prüfen:** Unten erscheint `22 Zeilen geschrieben`.

### 8. nano beenden

Drücke <kbd>Strg</kbd>+<kbd>X</kbd>. Fragt nano `Geänderten Puffer speichern?`, wurde nach dem Speichern noch etwas geändert. Dann mit <kbd>J</kbd> speichern oder mit <kbd>N</kbd> verwerfen.

### 9. Website einschalten

nginx lädt nur Dateien aus `sites-enabled`. Der Link schaltet die Website ein. Meldet der Befehl `Die Datei existiert bereits`, ist die Website schon eingeschaltet. Dann geht es mit dem nächsten Schritt weiter.

```bash
sudo ln -s /etc/nginx/sites-available/start.de /etc/nginx/sites-enabled/start.de
```

### 10. Konfiguration testen

`nginx -t` liest alle Konfigurationsdateien und prüft sie, ohne den laufenden Webserver zu verändern. **Diesen Schritt nie auslassen:** Bei einem Fehler würde nginx die Konfiguration beim Neuladen nicht übernehmen, und ein späterer Neustart würde scheitern.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Steht dort `test failed`, hilft der Abschnitt [Fehler finden und beheben](#fehler-finden-und-beheben).

### 11. nginx neu laden

Übernimmt die neue Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

### 12. Website abrufen

Zum Test auf dem eigenen Rechner muss `start.de` auf `127.0.0.1` zeigen. Wie das geht, steht in Schritt 11 der Anleitung [Statische Website mit nginx](nginx-statisch.md).

```bash
curl -I http://start.de/style.css
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 200 OK`, weiter unten steht `Cache-Control: max-age=604800` (7 Tage in Sekunden).

## Konfiguration ändern

Als Beispiel werden zwei Einstellungen geändert: Der Browser soll CSS und Bilder 30 statt 7 Tage zwischenspeichern, und nginx soll CSS und JavaScript komprimiert übertragen.

### 13. Datei erneut öffnen

```bash
sudo nano -l /etc/nginx/sites-available/start.de
```

### 14. Die Stelle suchen

Drücke <kbd>Strg</kbd>+<kbd>W</kbd>, tippe `expires` und drücke <kbd>Enter</kbd>. Der Cursor springt zur ersten Fundstelle. <kbd>Alt</kbd>+<kbd>W</kbd> springt zur nächsten.

**Prüfen:** Der Cursor steht in der Zeile `expires 7d;`.

### 15. Wert ändern

Bewege den Cursor mit den Pfeiltasten auf die `7`, lösche sie mit <kbd>Entf</kbd> und tippe `30`. Die Zeile lautet danach `expires 30d;`. Das Semikolon am Ende muss stehen bleiben.

### 16. Komprimierung ergänzen

Ubuntu schaltet die Komprimierung in `/etc/nginx/nginx.conf` mit `gzip on;` ein, dort aber nur für HTML. Welche weiteren Dateitypen komprimiert werden, legt `gzip_types` fest. Die Einstellung gilt hier nur für diese Website.

Setze den Cursor an das Ende der Zeile `index index.html;`, drücke <kbd>Enter</kbd> und tippe:

```nginx
    gzip_types text/css application/javascript image/svg+xml;
```

**Prüfen:** Die neue Zeile steht direkt unter `index index.html;` und endet mit `;`.

### 17. Speichern und beenden

<kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd>, dann <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Vor dem Beenden meldet nano `23 Zeilen geschrieben`, eine Zeile mehr als vorher.

### 18. Testen und neu laden

Erst testen, dann laden. Das `&&` sorgt dafür, dass nginx nur neu geladen wird, wenn der Test erfolgreich war.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**Prüfen:** Die Ausgabe enthält `test is successful`.

### 19. Änderungen prüfen

`-H 'Accept-Encoding: gzip'` teilt nginx mit, dass `curl` komprimierte Antworten versteht, so wie es jeder Browser tut.

```bash
curl -sI -H 'Accept-Encoding: gzip' http://start.de/style.css | grep -iE 'cache-control|content-encoding'
```

**Prüfen:** Die Ausgabe lautet `Cache-Control: max-age=2592000` (30 Tage in Sekunden) und `Content-Encoding: gzip`.

## Fehler finden und beheben

### 20. Fehlermeldung lesen

Schlägt `nginx -t` fehl, nennt die Meldung die Art des Fehlers, die Datei und nach dem Doppelpunkt die Zeile, zum Beispiel:

```text
nginx: [emerg] invalid number of arguments in "root" directive in /etc/nginx/sites-enabled/start.de:8
```

Die häufigsten Meldungen:

| Meldung | Ursache |
|---|---|
| `invalid number of arguments in "root" directive` | Meist fehlt am Ende der Zeile **davor** das `;`. nginx liest dann zwei Zeilen als eine Anweisung und meldet die Zeile, in der es das nächste `;` findet. Im Beispiel steht der Fehler also in Zeile 7. |
| `unknown directive "roott"` | Tippfehler im Namen einer Anweisung |
| `unexpected end of file, expecting "}"` | Eine `}` fehlt. nginx bemerkt das erst am Dateiende. |
| `unexpected "}"` | Eine `}` zu viel |
| `conflicting server name "start.de"` (Warnung) | Zwei Dateien in `sites-enabled` beanspruchen dieselbe Domain, z. B. wenn eine Kopie der Konfiguration dort liegt |

Der Pfad in der Meldung zeigt meist auf `sites-enabled`. Das ist nur der Link. Bearbeitet wird immer die Datei in `sites-available`.

### 21. Direkt zur gemeldeten Zeile springen

`+8` öffnet die Datei und setzt den Cursor gleich in Zeile 8. Ersetze die Zahl durch die Zeile aus deiner Meldung. Bei `invalid number of arguments` schau auch in die Zeile darüber. In einer bereits geöffneten Datei springt <kbd>Strg</kbd>+<kbd>_</kbd> zu einer Zeilennummer.

```bash
sudo nano -l +8 /etc/nginx/sites-available/start.de
```

Korrigiere den Fehler, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd>, beende mit <kbd>Strg</kbd>+<kbd>X</kbd> und teste erneut mit `sudo nginx -t`.

### 22. Optional: Fehler zum Üben einbauen

Öffne die Datei wie in Schritt 13, lösche am Ende der Zeile `root /var/www/start.de/html;` das `;`, speichere und teste mit `sudo nginx -t`. Die Meldung nennt die Zeile **unter** der geänderten Zeile. Setze das `;` wieder ein, speichere und teste erneut, bis `test is successful` erscheint. Solange du nicht neu lädst, läuft nginx mit der alten, fehlerfreien Konfiguration einfach weiter.

## Nützliche Tastenkürzel in nano

| Tasten | Wirkung |
|---|---|
| <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> | Speichern |
| <kbd>Strg</kbd>+<kbd>X</kbd> | Beenden |
| <kbd>Strg</kbd>+<kbd>W</kbd> | Suchen, <kbd>Alt</kbd>+<kbd>W</kbd> springt zum nächsten Treffer |
| <kbd>Strg</kbd>+<kbd>_</kbd> | Zu einer Zeilennummer springen |
| <kbd>Strg</kbd>+<kbd>K</kbd> / <kbd>Strg</kbd>+<kbd>U</kbd> | Zeile ausschneiden / wieder einfügen, auch an anderer Stelle |
| <kbd>Alt</kbd>+<kbd>U</kbd> / <kbd>Alt</kbd>+<kbd>E</kbd> | Rückgängig / Wiederherstellen |
| <kbd>Alt</kbd>+<kbd>3</kbd> | Aktuelle Zeile mit `#` aus- oder wieder einkommentieren. Praktisch, um eine Einstellung vorübergehend abzuschalten |
| <kbd>Alt</kbd>+<kbd>N</kbd> | Zeilennummern ein- und ausblenden |
| <kbd>Strg</kbd>+<kbd>G</kbd> | Hilfe mit allen Tastenkürzeln |

## Prüfen der Installation

```bash
nano --version
```

```bash
sudo nginx -T 2>/dev/null | grep -E 'expires|gzip_types'
```

**Prüfen:** Der erste Befehl zeigt die Version von nano, der zweite die Zeilen `gzip_types …` und `expires 30d;` aus der Konfiguration.

## Rückgängig machen und deinstallieren

### 1. Alte Konfiguration zurückholen

Nur möglich, wenn in Schritt 3 eine Sicherung angelegt wurde. Überschreibt die Datei mit dem Stand vor dieser Anleitung.

```bash
sudo cp -p /root/start.de.sicherung /etc/nginx/sites-available/start.de
```

### 2. Oder: Website ganz entfernen

Gab es vorher keine Konfiguration, entfernst du Link und Datei. Die Dateien der Website und weitere Reste entfernt der Abschnitt „Deinstallieren“ der Anleitung [Statische Website mit nginx](nginx-statisch.md).

```bash
sudo rm /etc/nginx/sites-enabled/start.de /etc/nginx/sites-available/start.de
```

### 3. nginx testen und neu laden

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Sicherung löschen

```bash
sudo rm -f /root/start.de.sicherung
```

### 5. nano entfernen (nicht empfohlen)

nano ist unter Ubuntu der vorgegebene Editor, etwa für `sudo visudo` oder `crontab -e`. Entferne es nur, wenn ein anderer Editor eingerichtet ist. Die genauen Schritte stehen in der Anleitung [GNU nano](nano.md).

**Prüfen:** Nach Schritt 3 meldet `sudo nginx -t` wieder `test is successful`.
