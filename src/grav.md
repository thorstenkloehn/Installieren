# Grav

Grav ist ein Content-Management-System, das ohne Datenbank auskommt: Jede Seite ist eine Markdown-Datei in einem Ordner, Einstellungen stehen in YAML-Dateien. Man kann Inhalte deshalb wahlweise im Browser über die Verwaltung oder direkt mit einem Texteditor bearbeiten und die ganze Website einfach als Ordner sichern oder mit Git verwalten.

## Vorbemerkungen

- **Kein apt-Paket:** Grav ist nicht in den Ubuntu-Paketquellen enthalten. Die Anleitung lädt das offizielle Paket mit Verwaltung („Grav + Admin“) von GitHub. PHP und nginx kommen aus den Ubuntu-Paketquellen.
- **Keine Datenbank:** Anders als [Drupal](drupal.md), [Joomla](joomla.md) oder [TYPO3](typo3.md) braucht Grav kein PostgreSQL oder MySQL.
- **Voraussetzung:** [nginx](nginx.md) ist installiert und läuft.
- **Adresse:** Grav läuft hier unter <http://localhost:8093>, nur vom eigenen Rechner aus erreichbar. Für eine öffentliche Website mit eigener Domain passt man die nginx-Konfiguration an, wie in [nginx auf dem Produktionsserver](nginx-produktion.md) beschrieben.
- **Version:** Getestet mit Grav **2.2.1** und der neuen Verwaltung „Admin2“ 2.1.23 unter PHP 8.5 und Ubuntu 26.04. Grav 2 braucht mindestens PHP 8.3.

## PHP vorbereiten

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. PHP, Erweiterungen und unzip installieren

- `php-fpm` führt PHP-Dateien für nginx aus.
- `gd` braucht Grav für Bilder, `curl` für Downloads von Updates und Erweiterungen, `zip` zum Entpacken von Erweiterungen, `xml` für XML und `mbstring` für Umlaute.
- `unzip` entpackt das heruntergeladene Grav-Paket.

Sind Pakete schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install php-fpm php-gd php-curl php-zip php-xml php-mbstring unzip
```

**Prüfen:** Die Ausgabe beginnt mit `PHP 8.3` oder höher, z. B. `PHP 8.5.4`.

```bash
php --version
```

## Grav herunterladen

### 3. Grav herunterladen

Lädt das Paket mit Verwaltung (etwa 21 MB) nach `/tmp`. Die aktuelle Version steht auf <https://github.com/getgrav/grav/releases/latest>. Bei einer neueren Version ersetzt du `2.2.1` an beiden Stellen im Befehl.

```bash
wget -O /tmp/grav.zip https://github.com/getgrav/grav/releases/download/2.2.1/grav-admin-v2.2.1.zip
```

### 4. Prüfsumme vergleichen

Berechnet die SHA-256-Prüfsumme der Datei. So lässt sich feststellen, ob der Download vollständig und unverändert ist.

```bash
sha256sum /tmp/grav.zip
```

**Prüfen:** Auf der Release-Seite steht unter „Assets“ neben `grav-admin-v2.2.1.zip` die Prüfsumme (`sha256:…`). Für 2.2.1 lautet sie `0916525e4a359b3b366eb76afe82a5d5d8d3efd4dbb3a085262d82a19367cb7e`. Weicht sie ab, lösche die Datei und lade sie neu.

### 5. Grav entpacken

Das Archiv enthält einen Ordner `grav-admin`. Er landet in `/var/www`.

```bash
sudo unzip -q /tmp/grav.zip -d /var/www
```

### 6. Ordner umbenennen

Ein kürzerer Name, der zum Rest der Anleitung passt.

```bash
sudo mv /var/www/grav-admin /var/www/grav
```

**Prüfen:** Die Ausgabe enthält unter anderem `index.php`, `system`, `user` und `webserver-configs`.

```bash
ls /var/www/grav
```

### 7. Dateien dem Webserver übergeben

PHP-FPM läuft als Benutzer `www-data`. Grav schreibt Seiten, Einstellungen, Zwischenspeicher und Updates selbst. Deshalb gehören alle Dateien diesem Benutzer.

```bash
sudo chown -R www-data:www-data /var/www/grav
```

### 8. Heruntergeladene Datei löschen

```bash
rm /tmp/grav.zip
```

## nginx einrichten

### 9. Mitgelieferte Vorlage kopieren

Grav bringt im Ordner `webserver-configs` eine fertige nginx-Konfiguration mit. Sie sperrt unter anderem Einstellungen, Benutzerkonten, Protokolle und den Zwischenspeicher gegen Zugriffe aus dem Web. Du übernimmst sie und änderst nur zwei Zeilen.

```bash
sudo cp /var/www/grav/webserver-configs/nginx.conf /etc/nginx/sites-available/grav
```

### 10. Adresse und Ordner eintragen

```bash
sudo nano /etc/nginx/sites-available/grav
```

Ändere zwei Zeilen ganz oben in der Datei:

1. Aus `#listen 80;` wird die folgende Zeile. Das `#` am Anfang fällt weg. nginx nimmt dann nur Anfragen vom eigenen Rechner auf Port 8093 an.

   ```nginx
       listen 127.0.0.1:8093;
   ```

2. Aus `root /home/USER/www/html;` wird die folgende Zeile. Sie sagt nginx, wo Grav liegt.

   ```nginx
       root /var/www/grav;
   ```

Alle anderen Zeilen bleiben unverändert. Die Zeile `fastcgi_pass unix:/var/run/php/php-fpm.sock;` passt schon zu Ubuntu.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Ausgabe zeigt genau diese beiden Zeilen.

```bash
grep -E '^\s*(listen|root)' /etc/nginx/sites-available/grav
```

### 11. Konfiguration aktivieren, prüfen und laden

```bash
sudo ln -s /etc/nginx/sites-available/grav /etc/nginx/sites-enabled/grav
```

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Nur dann weiter.

```bash
sudo systemctl reload nginx
```

## Grav einrichten

### 12. In den Grav-Ordner wechseln

Die Befehlszeilenprogramme von Grav liegen im Unterordner `bin`.

```bash
cd /var/www/grav
```

**Prüfen:** Die Ausgabe lautet `Grav CLI Application 2.2.1`.

```bash
sudo -u www-data bin/grav --version
```

### 13. Administratorkonto anlegen

Legt ein Konto an, mit dem du dich an der Verwaltung und an der Website anmelden kannst. Solange es kein Konto gibt, leitet Grav jeden Aufruf zur Verwaltung um.

- `-u` – der Anmeldename, `-e` – deine E-Mail-Adresse, `-N` – dein Name.
- `-P b` – Zugang zur Verwaltung und zur Website.
- `-t` – ein Titel, der in der Verwaltung unter dem Namen steht.
- `-l de` – die Verwaltung erscheint für dieses Konto auf Deutsch.

```bash
sudo -u www-data bin/plugin login new-user -u admin -e admin@example.com -P b -N "Dein Name" -t Administrator -l de
```

Grav fragt nach dem Passwort und dann noch einmal zur Bestätigung. Die Eingabe bleibt unsichtbar. Das Passwort muss mindestens 8 Zeichen lang sein und Groß- und Kleinbuchstaben sowie eine Ziffer enthalten.

**Prüfen:** Die Ausgabe endet mit `Success! User admin created.`

### 14. Titel und Sprache der Website einstellen

Die allgemeinen Angaben zur Website stehen in `user/config/site.yaml`.

```bash
sudo nano user/config/site.yaml
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```yaml
title: 'Meine Grav-Website'
default_lang: de
author:
  name: 'Dein Name'
  email: 'admin@example.com'
metadata:
  description: 'Meine Website mit Grav'
```

- `title` – steht im Titel jedes Browser-Tabs und im Kopf der Website.
- `default_lang: de` – das Design schreibt `lang="de"` in jede Seite. Browser und Suchmaschinen erkennen den Text so als deutsch.
- `metadata` – die Beschreibung erscheint bei Suchmaschinen unter dem Titel.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. Startseite bearbeiten

Jede Seite ist ein Ordner unter `user/pages` mit einer Markdown-Datei. Die Zahl vor dem Ordnernamen bestimmt die Reihenfolge im Menü.

```bash
sudo nano user/pages/01.home/default.md
```

Ersetze den ganzen Inhalt wie in Schritt 14 durch:

```markdown
---
title: Startseite
---

# Willkommen

Diese Website läuft mit **Grav**. Jede Seite ist eine Markdown-Datei,
eine Datenbank gibt es nicht.
```

Oben zwischen den `---`-Zeilen stehen Angaben zur Seite (Front Matter), darunter der Text in Markdown.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Zwischenspeicher leeren

Grav bemerkt geänderte Dateien meist von selbst. Nach Änderungen an Einstellungen sorgt dieser Befehl dafür, dass sie sicher übernommen werden.

```bash
sudo -u www-data bin/grav clearcache
```

### 17. Website ansehen

Öffne <http://localhost:8093> im Browser.

**Prüfen:** Die Startseite zeigt „Willkommen“ und den Text aus Schritt 15. Im Browser-Tab steht „Startseite | Meine Grav-Website“. Das Menü enthält außerdem die Beispielseite „Typography“.

### 18. An der Verwaltung anmelden

Öffne <http://localhost:8093/admin> und melde dich mit dem Anmeldenamen und Passwort aus Schritt 13 an.

**Prüfen:** Das Dashboard erscheint auf Deutsch mit „Willkommen zurück, Dein Name“. Links stehen „Konfiguration“, „Benutzer“, „Seiten“, „Medien“, „Plugins“, „Themes“ und „Werkzeuge“. Unter „Seiten“ findest du die Startseite aus Schritt 15 wieder und kannst sie auch hier bearbeiten.

Oben erscheint ein Hinweis, dass E-Mail-Links noch nicht an einen vertrauenswürdigen Hostnamen gebunden sind. Er betrifft nur Mails zum Zurücksetzen von Passwörtern und ist für eine Testinstallation auf dem eigenen Rechner unwichtig.

## Aktualisieren

Grav aktualisiert sich mit seinem eigenen Paketmanager GPM. Lege vorher eine Sicherung an, am einfachsten eine Kopie des Ordners `/var/www/grav/user`, in dem Seiten, Einstellungen und Konten liegen.

### 1. In den Grav-Ordner wechseln

```bash
cd /var/www/grav
```

### 2. Grav selbst aktualisieren

```bash
sudo -u www-data bin/gpm selfupgrade
```

**Prüfen:** Die Ausgabe nennt die neue Version oder meldet `You are already running the latest version of Grav`.

### 3. Plugins und Themes aktualisieren

```bash
sudo -u www-data bin/gpm update
```

**Prüfen:** Die Ausgabe listet die aktualisierten Erweiterungen oder meldet `Nothing to update.`

Updates lassen sich auch in der Verwaltung einspielen. Das Dashboard zeigt unter „Updates“, ob etwas ansteht.

## Deinstallieren

### 1. Seite in nginx deaktivieren

```bash
sudo rm /etc/nginx/sites-enabled/grav
```

### 2. nginx-Konfigurationsdatei löschen

```bash
sudo rm /etc/nginx/sites-available/grav
```

### 3. nginx prüfen und neu laden

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

### 4. Grav löschen

**Achtung:** Damit sind alle Seiten, Bilder, Einstellungen und Konten gelöscht, denn bei Grav liegt alles in diesem Ordner. Wer die Inhalte behalten will, kopiert vorher `/var/www/grav/user`. `cd /tmp` sorgt dafür, dass du nicht mehr im gelöschten Ordner stehst.

```bash
cd /tmp && sudo rm -r /var/www/grav
```

**Prüfen:** Die Seite ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:8093
```

PHP und nginx bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.
