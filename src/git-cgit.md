# Git und cgit

Git ist ein Versionsverwaltungssystem: Es speichert jeden Stand deiner Dateien und macht Änderungen nachvollziehbar. cgit ist eine schlanke Weboberfläche, mit der du Git-Repositories im Browser ansehen kannst, also Dateien, Änderungsverlauf und Unterschiede. Zusammen ergeben sie einen einfachen, lokalen Git-Server.

## Vorbemerkungen

- **Installation über apt:** Git und cgit sind beide in den Ubuntu-Paketquellen enthalten.
- **Voraussetzung für cgit:** [nginx](nginx.md) ist nach der Anleitung installiert und läuft. cgit ist ein CGI-Programm. nginx kann solche Programme nicht selbst starten, deshalb übernimmt das der kleine Hilfsdienst **fcgiwrap**.
- **Aufbau:** Die zentralen Repositories liegen als sogenannte **Bare-Repositories** (ohne Arbeitskopie, Name endet auf `.git`) im Ordner `/srv/git`. Dort liest cgit sie aus. Gearbeitet wird in Klonen, z. B. in deinem Home-Verzeichnis.
- **Nur lesen im Browser:** cgit zeigt Repositories an und erlaubt das Klonen über HTTP. Änderungen hochladen (`git push`) geht in dieser Anleitung nur lokal über den Dateipfad.

## Git installieren und einrichten

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Git und cgit aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Git installieren

Installiert Git. Unter Ubuntu ist es oft schon vorhanden, dann meldet `apt` das nur.

```bash
sudo apt install git
```

**Prüfen:** Die Versionsnummer wird angezeigt, z. B. `git version 2.53.0`.

```bash
git --version
```

### 3. Namen festlegen

Git schreibt zu jeder gespeicherten Änderung (Commit), wer sie gemacht hat. `--global` speichert die Einstellung für alle deine Repositories in der Datei `~/.gitconfig`.

```bash
git config --global user.name "Dein Name"
```

### 4. E-Mail-Adresse festlegen

Gehört ebenfalls zu jedem Commit. Verwende die Adresse, die du auch bei Diensten wie GitHub oder GitLab angibst.

```bash
git config --global user.email "du@example.org"
```

### 5. Namen des Hauptzweigs festlegen

Neue Repositories bekommen damit den Hauptzweig `main` statt `master`. Das entspricht dem heute üblichen Standard.

```bash
git config --global init.defaultBranch main
```

**Prüfen:** Die Ausgabe enthält die drei Einstellungen.

```bash
git config --global --list
```

## Zentrales Repository anlegen

### 6. Ordner für die Repositories anlegen

`/srv` ist unter Linux für Daten gedacht, die ein Dienst bereitstellt, hier cgit.

```bash
sudo mkdir -p /srv/git
```

### 7. Ordner deinem Benutzer übergeben

So kannst du ohne `sudo` Repositories anlegen und Änderungen hochladen. cgit läuft als Benutzer `www-data` und braucht nur Leserechte. Die hat es, weil neue Dateien unter Ubuntu für alle lesbar angelegt werden.

```bash
sudo chown "$USER":"$USER" /srv/git
```

### 8. Bare-Repository anlegen

Legt das leere, zentrale Repository `test.git` an. `--bare` bedeutet: Es enthält nur die Versionsgeschichte, keine Arbeitskopie zum Bearbeiten.

```bash
git init --bare /srv/git/test.git
```

### 9. Beschreibung eintragen

cgit zeigt den Inhalt der Datei `description` in der Übersicht aller Repositories an.

```bash
nano /srv/git/test.git/description
```

Git hat die Datei mit einem englischen Platzhaltertext angelegt. Lösche diese Zeile mit <kbd>Strg</kbd>+<kbd>K</kbd> und füge stattdessen ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Test-Repository für cgit
```

### 10. Repository klonen

Erstellt eine Arbeitskopie in `~/test`. Die Meldung, dass ein leeres Repository geklont wurde, ist hier richtig.

```bash
git clone /srv/git/test.git ~/test
```

### 11. Erste Datei anlegen

Eine README-Datei in Markdown. cgit zeigt sie später auf der Seite **about** des Repositorys an.

```bash
nano ~/test/README.md
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```markdown
# Test

Hallo **cgit**.
```

### 12. Datei für den Commit vormerken

`git add` nimmt die Datei in den nächsten Commit auf. `-C ~/test` führt den Befehl im Ordner `~/test` aus, ohne dass du hineinwechseln musst.

```bash
git -C ~/test add README.md
```

### 13. Commit erstellen

Speichert den vorgemerkten Stand mit einer kurzen Beschreibung dauerhaft in der Versionsgeschichte.

```bash
git -C ~/test commit -m "Erster Commit"
```

### 14. Änderungen ins zentrale Repository hochladen

Überträgt den Commit nach `/srv/git/test.git`. `-u` merkt sich die Verbindung, danach genügt künftig `git push`.

```bash
git -C ~/test push -u origin main
```

**Prüfen:** Das zentrale Repository enthält den Commit „Erster Commit“.

```bash
git -C /srv/git/test.git log --oneline
```

## cgit einrichten

### 15. cgit und Hilfsprogramme installieren

- `cgit` – die Weboberfläche
- `fcgiwrap` – startet cgit im Auftrag von nginx
- `python3-markdown` – stellt README-Dateien in Markdown formatiert dar
- `python3-pygments` – färbt Quellcode in der Dateiansicht ein

cgit empfiehlt den Webserver Apache. Weil nginx schon installiert ist, gilt diese Empfehlung als erfüllt, und Apache wird **nicht** mitinstalliert.

```bash
sudo apt install cgit fcgiwrap python3-markdown python3-pygments
```

**Prüfen:** Die Ausgabe lautet `active`. fcgiwrap wartet damit auf Anfragen von nginx.

```bash
systemctl is-active fcgiwrap.socket
```

### 16. cgit konfigurieren

Ersetzt die Einstellungsdatei `/etc/cgitrc`. Die Angaben bewirken Folgendes:

- `css`, `logo`, `favicon` – Adressen von Stildatei und Bildern
- `root-title`, `root-desc` – Überschrift und Untertitel der Startseite
- `virtual-root=/` – kurze Adressen wie `/test/log/` statt `/?url=test/log/`
- `enable-http-clone`, `clone-url` – Repositories lassen sich über HTTP klonen, die Adresse wird auf jeder Repository-Seite angezeigt
- `readme`, `about-filter` – zeigt `README.md` formatiert auf der Seite **about** an
- `source-filter` – Syntaxhervorhebung für Quellcode
- `remove-suffix=1` – zeigt `test` statt `test.git` an
- `scan-path` – Ordner, in dem cgit nach Repositories sucht. Diese Zeile muss **am Ende** stehen, weil nur die Einstellungen darüber für die gefundenen Repositories gelten.

```bash
sudo nano /etc/cgitrc
```

Die Datei hat schon Inhalt, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
css=/cgit.css
logo=/cgit.png
favicon=/favicon.ico

root-title=Meine Git-Repositories
root-desc=Lokaler Git-Server auf dem Entwicklungsrechner

virtual-root=/
enable-http-clone=1
clone-url=http://localhost:8086/$CGIT_REPO_URL

readme=:README.md
about-filter=/usr/lib/cgit/filters/about-formatting.sh
source-filter=/usr/lib/cgit/filters/syntax-highlighting.py

remove-suffix=1
scan-path=/srv/git
```

### 17. nginx-Konfiguration für cgit anlegen

cgit läuft auf Port `8086` und ist nur vom eigenen Rechner aus erreichbar. Die festen Dateien, die cgit mitbringt (Stildatei, Skript, Logo und Symbol im Ordner `/usr/share/cgit`), liefert nginx direkt aus. Alle anderen Adressen reicht nginx über fcgiwrap an cgit weiter: `SCRIPT_FILENAME` nennt das Programm, das fcgiwrap starten soll, und `PATH_INFO` übergibt die aufgerufene Adresse. Daraus liest cgit ab, welches Repository und welche Ansicht gemeint sind, z. B. `/test/log/`.

```bash
sudo nano /etc/nginx/sites-available/cgit
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 127.0.0.1:8086;
    server_name localhost;

    # Stildatei, Skript, Logo und Symbol bringt cgit mit, nginx liefert sie direkt aus
    location ~ ^/(cgit\.(css|js|png)|favicon\.ico|robots\.txt)$ {
        root /usr/share/cgit;
    }

    # Alle übrigen Adressen beantwortet cgit, gestartet über fcgiwrap
    location / {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /usr/lib/cgit/cgit.cgi;
        fastcgi_param PATH_INFO $uri;
        fastcgi_pass unix:/run/fcgiwrap.socket;
    }
}
```

### 18. Konfiguration aktivieren

Ein Link in `sites-enabled` sorgt dafür, dass nginx die neue Seite lädt.

```bash
sudo ln -s /etc/nginx/sites-available/cgit /etc/nginx/sites-enabled/cgit
```

### 19. nginx-Konfiguration testen

Findet Tippfehler, bevor nginx neu geladen wird.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 20. nginx neu laden

Übernimmt die Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

## Testen

### 21. Startseite aufrufen

Prüft, ob cgit antwortet und das Repository findet.

```bash
curl -s http://localhost:8086/ | grep "Test-Repository"
```

**Prüfen:** Die Ausgabe enthält `Test-Repository für cgit`. Im Browser zeigt <http://localhost:8086> die Liste der Repositories. Ein Klick auf `test` öffnet das Repository, unter **about** erscheint die formatierte README-Datei, unter **log** der Commit.

### 22. Über HTTP klonen

Prüft, ob das Klonen über die Weboberfläche funktioniert. Der Klon landet in `~/test-klon`.

```bash
git clone http://localhost:8086/test ~/test-klon
```

**Prüfen:** Der Klon enthält den Commit „Erster Commit“.

```bash
git -C ~/test-klon log --oneline
```

### 23. Test-Klon wieder löschen

Der Klon aus dem vorigen Schritt wird nicht mehr gebraucht.

```bash
rm -rf ~/test-klon
```

## Weitere Repositories hinzufügen

Jedes Bare-Repository, das du in `/srv/git` anlegst, erscheint automatisch in cgit, genau wie in den Schritten 8 und 9. Ein bestehendes Projekt lädst du so hoch: Leeres Bare-Repository anlegen, dann im Projektordner das Ziel eintragen und hochladen:

```bash
git remote add origin /srv/git/projekt.git
```

```bash
git push -u origin main
```

## Deinstallieren

### 1. Seite in nginx deaktivieren

Löscht den Link aus `sites-enabled`.

```bash
sudo rm -f /etc/nginx/sites-enabled/cgit
```

### 2. nginx-Konfigurationsdatei löschen

Löscht die Konfigurationsdatei der Seite.

```bash
sudo rm -f /etc/nginx/sites-available/cgit
```

### 3. nginx neu laden

Übernimmt das Abschalten der Seite.

```bash
sudo systemctl reload nginx
```

### 4. cgit und Hilfsprogramme entfernen

`purge` entfernt auch die Einstellungsdatei `/etc/cgitrc`. `python3-pygments` bleibt installiert, weil es auch andere Programme nutzen.

```bash
sudo apt purge cgit fcgiwrap python3-markdown
```

### 5. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten, die nur für cgit installiert wurden.

```bash
sudo apt autoremove
```

### 6. Repositories und Arbeitskopie löschen (optional)

**Achtung:** Löscht alle zentralen Repositories in `/srv/git` und die Arbeitskopie `~/test` endgültig. Nur ausführen, wenn du sie nicht mehr brauchst oder vorher gesichert hast.

```bash
sudo rm -rf /srv/git ~/test
```

### 7. Git entfernen (optional)

Git brauchen viele andere Programme und Anleitungen (z. B. [MediaWiki](mediawiki.md)). Entferne es nur, wenn du sicher bist, dass du es nicht mehr brauchst. Deine persönlichen Einstellungen in `~/.gitconfig` bleiben dabei erhalten.

```bash
sudo apt purge git
```

**Prüfen:** Unter <http://localhost:8086> antwortet kein Webserver mehr, `curl` meldet einen Verbindungsfehler.

```bash
curl -sI http://localhost:8086/
```
