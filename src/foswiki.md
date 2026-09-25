# Foswiki

Foswiki ist eine in Perl geschriebene Wiki-Software, die ihre Seiten als Textdateien speichert und keine Datenbank braucht. Mit Makros, Formularen und Suchen lassen sich strukturierte Anwendungen im Wiki bauen, etwa Aufgabenlisten oder Wissensdatenbanken. Diese Anleitung installiert Foswiki von Hand, lässt es als FastCGI-Dienst laufen und bindet es in nginx ein.

## Vorbemerkungen

- **Voraussetzung:** [nginx](nginx.md) ist nach der Anleitung installiert und läuft.
- **Keine Installation über apt:** Ubuntu enthält kein Foswiki-Paket. Das Projekt stellt ein fertiges Archiv bereit. Die Perl-Module, die Foswiki braucht, kommen aber alle aus den Ubuntu-Paketquellen.
- **Version:** Getestet mit Foswiki **2.1.11**, Perl 5 und nginx 1.28 unter Ubuntu 26.04.
- **Wie Foswiki mit nginx läuft:** nginx kann selbst keine Perl-Programme ausführen. Foswiki läuft deshalb als eigener Dienst mit einigen ständig laufenden Prozessen (FastCGI). nginx liefert Bilder und Anhänge selbst aus und reicht alle übrigen Anfragen an diesen Dienst weiter.
- **Ports:** Das Wiki ist unter nginx auf Port **8087** erreichbar. Der FastCGI-Dienst hört auf Port **9010**. Beide sind nur vom eigenen Rechner aus erreichbar.
- **Passwort:** `AdminPasswort123` ist ein Beispiel. Ersetze es durch ein eigenes Passwort.

## Vorbereitung

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketstände der Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Perl-Module installieren

Installiert alle Perl-Module, die Foswiki braucht.

```bash
sudo apt install libcgi-pm-perl libcgi-session-perl libcrypt-passwdmd5-perl libcrypt-eksblowfish-perl libemail-address-xs-perl libemail-mime-perl libfile-copy-recursive-perl libfcgi-perl libfcgi-procmanager-perl liblocale-maketext-lexicon-perl liblocale-msgfmt-perl liblocale-codes-perl libarchive-zip-perl libmozilla-ca-perl
```

Wofür die Module da sind:

- `libcgi-pm-perl` und `libcgi-session-perl` – verarbeiten Webanfragen und merken sich angemeldete Benutzer.
- `libcrypt-passwdmd5-perl` und `libcrypt-eksblowfish-perl` – verschlüsseln Passwörter.
- `libemail-address-xs-perl` und `libemail-mime-perl` – prüfen E-Mail-Adressen und erzeugen E-Mails, z. B. für Benachrichtigungen.
- `libfile-copy-recursive-perl` – kopiert ganze Ordner, etwa beim Umbenennen von Seiten.
- `libfcgi-perl` und `libfcgi-procmanager-perl` – der FastCGI-Dienst, über den nginx mit Foswiki spricht.
- `liblocale-maketext-lexicon-perl`, `liblocale-msgfmt-perl` und `liblocale-codes-perl` – Übersetzungen der Oberfläche, z. B. ins Deutsche.
- `libarchive-zip-perl` und `libmozilla-ca-perl` – entpacken Erweiterungen und prüfen Zertifikate beim Herunterladen.

**Prüfen:** Der Befehl gibt nichts aus. Fehlt ein Modul, erscheint eine Meldung mit `Can't locate`.

```bash
perl -MCGI -MCGI::Session -MFCGI -MFCGI::ProcManager -MEmail::MIME -e1
```

## Foswiki installieren

### 3. Programmarchiv herunterladen

Lädt Foswiki 2.1.11 (etwa 19 MB) in den Ordner `/tmp`. Die aktuelle Version steht auf <https://github.com/foswiki/distro/releases>.

```bash
curl -L -o /tmp/Foswiki-2.1.11.tgz https://github.com/foswiki/distro/releases/download/FoswikiRelease02x01x11/Foswiki-2.1.11.tgz
```

### 4. Prüfsumme kontrollieren

Stellt sicher, dass das Archiv vollständig und unverändert angekommen ist. Die Prüfsumme veröffentlicht das Projekt neben dem Archiv in der Datei `Foswiki-2.1.11.sha1`.

```bash
sha1sum /tmp/Foswiki-2.1.11.tgz
```

**Prüfen:** Die Ausgabe beginnt mit `6fd484903d10ca1ae908c67d7977bdedfe265c3e`.

### 5. Archiv entpacken

Packt Foswiki nach `/var/www` aus. Dabei entsteht der Ordner `/var/www/Foswiki-2.1.11`.

```bash
sudo tar xzf /tmp/Foswiki-2.1.11.tgz -C /var/www
```

### 6. Ordner umbenennen

Ein Ordnername ohne Versionsnummer macht die Pfade in den Einstellungen einfacher.

```bash
sudo mv /var/www/Foswiki-2.1.11 /var/www/foswiki
```

### 7. Eigentümer setzen

Foswiki läuft als Benutzer `www-data` und muss in die Ordner für Seiten (`data`), Anhänge (`pub`) und Zwischendateien (`working`) schreiben. Außerdem schreibt es seine Einstellungen nach `lib/LocalSite.cfg`.

```bash
sudo chown -R www-data:www-data /var/www/foswiki
```

### 8. In den Programmordner wechseln

Die folgenden Befehle arbeiten im Ordner von Foswiki.

```bash
cd /var/www/foswiki
```

### 9. Grundeinstellungen anlegen

Das Werkzeug `tools/configure` legt die Einstellungsdatei `lib/LocalSite.cfg` an. `-noprompt` lässt es alle Pfade selbst ermitteln. Mit `-set` gibst du die Werte vor, die es nicht erraten kann.

```bash
sudo -u www-data perl tools/configure -save -noprompt -set {DefaultUrlHost}=http://localhost:8087 -set {ScriptUrlPath}=/bin -set {ScriptUrlPaths}{view}= -set {PubUrlPath}=/pub -set {SafeEnvPath}=/usr/bin:/bin -set {UserInterfaceInternationalisation}=1 -set {Languages}{de}{Enabled}=1
```

Was die Einstellungen bedeuten:

- `{DefaultUrlHost}` – die Adresse, unter der das Wiki im Browser aufgerufen wird.
- `{ScriptUrlPath}=/bin` – Aktionen wie Bearbeiten oder Anmelden liegen unter `/bin/…`, z. B. `/bin/edit/Main/WebHome`.
- `{ScriptUrlPaths}{view}=` (leer) – Seiten werden ohne Vorsatz angezeigt, also `/Main/WebHome` statt `/bin/view/Main/WebHome`.
- `{PubUrlPath}=/pub` – unter dieser Adresse liegen Bilder und Anhänge.
- `{SafeEnvPath}=/usr/bin:/bin` – die Ordner, in denen Foswiki Hilfsprogramme wie `grep` sucht. Ohne diese Einstellung findet Foswiki sie im FastCGI-Betrieb nicht, weil nginx keinen Suchpfad mitschickt. Viele Seiten enden dann mit dem Fehler `502 Bad Gateway`.
- `{UserInterfaceInternationalisation}=1` und `{Languages}{de}{Enabled}=1` – schaltet die Übersetzungen ein und gibt Deutsch frei. Foswiki richtet sich dann nach der Spracheinstellung des Browsers.

**Prüfen:** Die Ausgabe endet mit `New configuration saved in /var/www/foswiki/lib/LocalSite.cfg`.

### 10. Administratorpasswort setzen

Foswiki hat ein eingebautes Administratorkonto mit dem Anmeldenamen `admin`. Dieser Befehl legt sein Passwort fest. Foswiki speichert es nur verschlüsselt. Im Verlauf der Shell steht es aber im Klartext. Wer das nicht möchte, löscht die Zeile danach mit `history -d` und der Zeilennummer aus `history`.

```bash
sudo -u www-data perl tools/configure -save -set {Password}=AdminPasswort123
```

**Prüfen:** In der Einstellungsdatei steht jetzt eine verschlüsselte Zeichenfolge, die mit `$apr1$` beginnt.

```bash
sudo grep "{Password}" lib/LocalSite.cfg
```

## FastCGI-Dienst einrichten

### 11. systemd-Dienst anlegen

Das Archiv enthält unter `tools/systemd/foswiki.service` eine Vorlage. Die folgende Datei ist eine vereinfachte Fassung davon, mit Port 9010 statt 9000.

```bash
sudo nano /etc/systemd/system/foswiki.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=Foswiki
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/foswiki/bin/
ExecStart=/usr/bin/perl /var/www/foswiki/bin/foswiki.fcgi -n 3 -l 127.0.0.1:9010 -a foswiki
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
SyslogIdentifier=foswiki

[Install]
WantedBy=multi-user.target
```

Was die Angaben bedeuten:

- `User=www-data` – Foswiki läuft mit denselben Rechten wie der Webserver und darf in seine Ordner schreiben.
- `WorkingDirectory=` – Foswiki erwartet, im Ordner `bin` gestartet zu werden.
- `-n 3` – drei Prozesse beantworten Anfragen gleichzeitig.
- `-l 127.0.0.1:9010` – der Dienst ist nur vom eigenen Rechner aus erreichbar.
- `-a foswiki` – unter diesem Namen erscheinen die Prozesse in `ps` und `top`.
- `ExecReload=` – `systemctl reload foswiki` lässt Foswiki geänderte Einstellungen neu einlesen.

### 12. systemd die neue Datei bekannt machen

systemd liest Dienstdateien nur beim Start oder auf Anweisung ein.

```bash
sudo systemctl daemon-reload
```

### 13. Dienst starten und Autostart einschalten

`enable` sorgt für den Start beim Hochfahren, `--now` startet den Dienst zusätzlich sofort.

```bash
sudo systemctl enable --now foswiki
```

**Prüfen:** Das Protokoll zeigt `FastCGI: manager (pid …): initialized` und für jeden der drei Prozesse `server (pid …) started`.

```bash
sudo journalctl -u foswiki -n 10
```

## nginx konfigurieren

### 14. Konfiguration für Foswiki anlegen

Legt einen eigenen Server-Block auf Port 8087 an. Nur der Ordner `pub` mit Bildern und Anhängen wird direkt ausgeliefert. Alle Adressen unter `/bin/` gehen an den FastCGI-Dienst. Alle übrigen Adressen gelten als Seitennamen und werden intern an `/bin/view/` weitergereicht. Die Ordner `data`, `lib` und `working` sind damit von außen gar nicht erreichbar.

```bash
sudo nano /etc/nginx/sites-available/foswiki
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 127.0.0.1:8087;
    server_name localhost;

    root /var/www/foswiki;

    client_max_body_size 20m;

    # Nur pub/ wird als Datei ausgeliefert, ohne die Arbeitsordner
    location ^~ /pub/ {
        location ~ ^/pub/[^/]+/.*/_work_areas/ {
            return 403;
        }
        try_files $uri =404;
        expires 7d;
    }

    # Aktionen wie /bin/edit/Main/WebHome an Foswiki weitergeben
    location ~ ^/bin/ {
        fastcgi_pass 127.0.0.1:9010;
        fastcgi_split_path_info ^(/bin/[^/]+)(/.*)?$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root/bin/foswiki.fcgi;
        fastcgi_param SCRIPT_NAME $fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }

    # Kurze Adressen: /Main/WebHome zeigt die Seite an
    location / {
        rewrite ^/(.*)$ /bin/view/$1 last;
    }
}
```

- `fastcgi_split_path_info` – zerlegt z. B. `/bin/edit/Main/WebHome` in die Aktion `/bin/edit` und den Seitennamen `/Main/WebHome`. Foswiki bekommt beides getrennt als `SCRIPT_NAME` und `PATH_INFO`.
- `rewrite … /bin/view/$1 last` – aus `/Main/WebHome` wird intern `/bin/view/Main/WebHome`. Im Browser bleibt die kurze Adresse stehen.

### 15. Konfiguration aktivieren

Ein Link in `sites-enabled` sorgt dafür, dass nginx die neue Seite lädt.

```bash
sudo ln -s /etc/nginx/sites-available/foswiki /etc/nginx/sites-enabled/foswiki
```

### 16. nginx-Konfiguration testen

Findet Tippfehler, bevor nginx neu geladen wird.

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 17. nginx neu laden

Übernimmt die Konfiguration, ohne laufende Verbindungen abzubrechen.

```bash
sudo systemctl reload nginx
```

## Testen

### 18. Startseite abrufen

Prüft, ob das Wiki über nginx antwortet.

```bash
curl -sI http://localhost:8087/System/WebHome
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 200 OK`. Kommt stattdessen `502 Bad Gateway`, läuft der Dienst aus Schritt 13 nicht, oder `{SafeEnvPath}` aus Schritt 9 fehlt.

### 19. Sperre der Einstellungen prüfen

Die Datei mit den Einstellungen darf nicht abrufbar sein.

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8087/lib/LocalSite.cfg
```

**Prüfen:** Die Ausgabe lautet `404`. Foswiki sucht dabei eine Seite namens `lib/LocalSite.cfg` und findet keine.

### 20. Im Browser anmelden

Öffne <http://localhost:8087>. Ist der Browser auf Deutsch eingestellt, erscheint die Oberfläche auf Deutsch. Klicke oben auf **Anmelden** und melde dich mit dem Namen `admin` und dem Passwort aus Schritt 10 an. Foswiki zeigt dich dann als **AdminUser** an. Mit diesem Konto darfst du alles, auch Seiten bearbeiten und die Einstellungen im Browser unter <http://localhost:8087/bin/configure> ändern.

Für die tägliche Arbeit legst du besser ein persönliches Konto an: über die Seite **System.UserRegistration** (<http://localhost:8087/System/UserRegistration>). Soll dieses Konto Administratorrechte bekommen, trägst du es als AdminUser auf der Seite **Main.AdminGroup** ein.

## Wo liegt was?

- `/var/www/foswiki/data` – die Seiten als Textdateien, ein Ordner pro Web (z. B. `Main`, `Sandbox`).
- `/var/www/foswiki/pub` – Anhänge und Bilder.
- `/var/www/foswiki/lib/LocalSite.cfg` – die Einstellungen.

Für eine Sicherung reichen diese drei. Hinweise zum Umstieg auf eine neue Version stehen im Archiv in der Datei `UpgradeGuide.html`.

## Deinstallieren

### 1. Dienst stoppen und Autostart ausschalten

Beendet Foswiki und verhindert den Start beim Hochfahren.

```bash
sudo systemctl disable --now foswiki
```

### 2. Dienstdatei löschen

Entfernt die Dienstdatei aus Schritt 11.

```bash
sudo rm /etc/systemd/system/foswiki.service
```

### 3. systemd neu einlesen lassen

Damit systemd den gelöschten Dienst vergisst.

```bash
sudo systemctl daemon-reload
```

### 4. Seite in nginx deaktivieren

Löscht den Link aus `sites-enabled`.

```bash
sudo rm -f /etc/nginx/sites-enabled/foswiki
```

### 5. nginx-Konfigurationsdatei löschen

Löscht die Konfigurationsdatei der Seite.

```bash
sudo rm -f /etc/nginx/sites-available/foswiki
```

### 6. nginx neu laden

Übernimmt das Abschalten der Seite.

```bash
sudo systemctl reload nginx
```

### 7. Foswiki-Ordner und Archiv löschen

Entfernt Foswiki samt Seiten, Anhängen und Einstellungen. **Achtung:** Alle Inhalte des Wikis gehen dabei unwiderruflich verloren.

```bash
sudo rm -rf /var/www/foswiki /tmp/Foswiki-2.1.11.tgz
```

### 8. Perl-Module entfernen (optional)

Nur ausführen, wenn kein anderes Programm diese Module braucht.

```bash
sudo apt purge libcgi-pm-perl libcgi-session-perl libcrypt-passwdmd5-perl libcrypt-eksblowfish-perl libemail-address-xs-perl libemail-mime-perl libfile-copy-recursive-perl libfcgi-perl libfcgi-procmanager-perl liblocale-maketext-lexicon-perl liblocale-msgfmt-perl liblocale-codes-perl libarchive-zip-perl libmozilla-ca-perl
```

### 9. Nicht mehr benötigte Pakete entfernen

Entfernt Bibliotheken, die nur zusammen mit den Perl-Modulen installiert wurden.

```bash
sudo apt autoremove
```

**Prüfen:** Unter Port 8087 antwortet nichts mehr, `curl` meldet einen Verbindungsfehler.

```bash
curl -sI http://localhost:8087/
```
