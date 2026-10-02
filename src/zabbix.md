# Zabbix

Zabbix überwacht Rechner, Dienste und Netzwerkgeräte rund um die Uhr, speichert die Messwerte in einer Datenbank und meldet Probleme, sobald ein Grenzwert überschritten ist oder ein Gerät nicht mehr antwortet. Anders als [Prometheus](prometheus.md) bringt es eine vollständige Weboberfläche mit, in der Hosts, Vorlagen, Alarme und Diagramme per Mausklick eingerichtet werden, und es liefert über 350 fertige Vorlagen für Linux, Windows, Datenbanken, Webserver und vieles mehr. Diese Anleitung installiert den Zabbix-Server mit [PostgreSQL](postgresql.md) als Datenbank, den Agenten für den eigenen Rechner und die Weboberfläche hinter [nginx](nginx.md), alles nur lokal erreichbar.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Zabbix **7.0** in der Paketquelle *universe*. Die Reihe 7.0 ist eine Ausgabe mit langer Pflege (LTS). Neuere Zwischenstände und die Reihe 7.4 gibt es nur im eigenen apt-Archiv des Herstellers, das diese Anleitung nicht verwendet.
- **Voraussetzungen:** [nginx](nginx.md) und [PostgreSQL](postgresql.md) müssen bereits installiert sein und laufen. PHP-FPM, das die Weboberfläche ausführt, installiert Schritt 2 gleich mit.
- **Drei Bestandteile:** Der *Server* fragt die Werte ab, legt sie in der Datenbank ab und prüft die Regeln. Der *Agent 2* läuft auf jedem überwachten Rechner und liefert dessen Werte, hier die des eigenen Rechners. Die *Weboberfläche* ist eine PHP-Anwendung zum Anzeigen und Einrichten.
- **Sofort gestartet:** Server und Agent laufen direkt nach der Installation. Der Server findet seine Datenbank aber noch nicht und schreibt bis Schritt 8 alle zehn Sekunden eine Fehlermeldung in sein Protokoll. Das ist erwartet.
- **Nur lokal:** Ohne Anpassung lauscht der Server auf Port **10051** und der Agent auf Port **10050** an allen Netzwerkschnittstellen. Die Schritte 7 und 10 beschränken beide auf `127.0.0.1`. Die Weboberfläche erreichst du unter `http://127.0.0.1:8081`.
- **Sprache:** Die Oberfläche startet auf Englisch und wird in Schritt 22 auf Deutsch umgestellt. Die mitgelieferten Vorlagen, Auslöser und manche Meldungen bleiben englisch.
- **Größe:** Auf einem Rechner mit nginx, PHP-FPM und PostgreSQL kommen 12 Pakete hinzu. Die leere Datenbank belegt rund 65 MB. Der Server startet rund 50 Hilfsprozesse und braucht im Betrieb einige hundert MB Arbeitsspeicher.
- **Version:** Getestet mit Zabbix **7.0.22** und PostgreSQL **18** am 2. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Zabbix installieren

Der Befehl installiert den Server für PostgreSQL, die Weboberfläche, den Agenten 2 sowie PHP-FPM mit der PostgreSQL-Anbindung für PHP. `--no-install-recommends` verhindert, dass `apt` zusätzlich den Webserver Apache mitbringt.

```bash
sudo apt install --no-install-recommends zabbix-server-pgsql zabbix-frontend-php zabbix-agent2 php-fpm php-pgsql
```

### 3. Versionen prüfen

```bash
zabbix_server --version
```

**Prüfen:** Die erste Zeile lautet `zabbix_server (Zabbix) 7.0.22`.

```bash
zabbix_agent2 --version
```

**Prüfen:** Die erste Zeile lautet `zabbix_agent2 (Zabbix) 7.0.22`.

## Datenbank anlegen

### 4. Datenbankbenutzer anlegen

Legt in PostgreSQL den Benutzer `zabbix` an. Der Befehl fragt zweimal nach einem Passwort für diesen Benutzer. Merke es dir, die Weboberfläche braucht es in Schritt 12.

```bash
sudo -u postgres createuser --pwprompt zabbix
```

### 5. Datenbank anlegen

Legt die leere Datenbank `zabbix` an und macht den gleichnamigen Benutzer zu ihrem Eigentümer.

```bash
sudo -u postgres createdb -O zabbix zabbix
```

### 6. Tabellen und Grunddaten einspielen

Das Paket bringt drei gepackte SQL-Dateien mit: den Aufbau der Tabellen, die Symbolbilder und die Grunddaten mit allen Vorlagen und dem Host „Zabbix server“. Der Befehl entpackt sie nacheinander und spielt sie über `psql` ein. `psql` fragt dabei nach dem Passwort aus Schritt 4. Das Einspielen dauert einige Sekunden.

```bash
zcat /usr/share/zabbix-server-pgsql/{schema,images,data}.sql.gz | psql -q -h localhost -U zabbix zabbix
```

**Prüfen:** Die Abfrage der Benutzer liefert nach erneuter Passworteingabe die beiden Einträge `guest` und `Admin`.

```bash
psql -h localhost -U zabbix -c "SELECT username FROM users;" zabbix
```

## Server einrichten

### 7. Eigene Server-Einstellungen anlegen

Statt die lange Hauptdatei zu ändern, legst du eine kleine Ergänzungsdatei an. Der Server liest alle Dateien mit der Endung `.conf` in diesem Ordner zusätzlich ein.

```bash
sudo nano /etc/zabbix/zabbix_server.conf.d/lokal.conf
```

Trage diese drei Zeilen ein:

```ini
DBHost=
ListenIP=127.0.0.1
AllowSoftwareUpdateCheck=0
```

Was die Zeilen bewirken:

- `DBHost=` ohne Wert lässt den Server über den lokalen Socket statt über das Netzwerk mit PostgreSQL sprechen. PostgreSQL erkennt dabei den Systembenutzer `zabbix` und lässt ihn ohne Passwort an die gleichnamige Datenbank. So steht kein Passwort in der Datei.
- `ListenIP=127.0.0.1` lässt den Server nur Verbindungen vom eigenen Rechner annehmen.
- `AllowSoftwareUpdateCheck=0` verhindert, dass Zabbix regelmäßig bei zabbix.com nach neuen Versionen fragt. Aktualisiert wird ohnehin über `apt`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Server neu starten

Erst jetzt verbindet sich der Server mit der Datenbank.

```bash
sudo systemctl restart zabbix-server
```

### 9. Prüfen, ob der Server läuft

```bash
sudo grep "database version" /var/log/zabbix-server/zabbix_server.log
```

**Prüfen:** Es erscheint eine Zeile mit `current database version (mandatory/optional): 07000000/...`. Der Server hat die Datenbank also gefunden.

```bash
ss -ltn | grep 10051
```

**Prüfen:** Die Zeile enthält `127.0.0.1:10051`.

## Agent einrichten

### 10. Eigene Agent-Einstellungen anlegen

Auch der Agent liest zusätzliche Dateien aus einem eigenen Ordner. Der Rest seiner Einstellungen passt schon: Er nimmt Anfragen vom Server unter `127.0.0.1` an und meldet sich unter dem Namen „Zabbix server“, den der vorbereitete Host in der Datenbank trägt.

```bash
sudo nano /etc/zabbix/zabbix_agent2.d/lokal.conf
```

Trage diese Zeile ein, speichere und schließe nano:

```ini
ListenIP=127.0.0.1
```

### 11. Agent neu starten

```bash
sudo systemctl restart zabbix-agent2
```

**Prüfen:** Die Zeile enthält `127.0.0.1:10050`.

```bash
ss -ltn | grep 10050
```

## Weboberfläche einrichten

### 12. Zugangsdaten für die Weboberfläche anlegen

Die Weboberfläche läuft unter dem Benutzer `www-data` und meldet sich deshalb mit Passwort bei PostgreSQL an. Ubuntu erwartet ihre Einstellungen unter `/etc/zabbix/zabbix.conf.php`. Fehlt die Datei, startet stattdessen ein Einrichtungsassistent, der sie aber mangels Schreibrechten nicht selbst speichern kann.

```bash
sudo nano /etc/zabbix/zabbix.conf.php
```

Trage Folgendes ein und ersetze `DEIN-PASSWORT` durch das Passwort aus Schritt 4. Hinter `$ZBX_SERVER_NAME` steht der Name, der später oben links in der Oberfläche erscheint.

```php
<?php
$DB['TYPE']     = 'POSTGRESQL';
$DB['SERVER']   = 'localhost';
$DB['PORT']     = '0';
$DB['DATABASE'] = 'zabbix';
$DB['USER']     = 'zabbix';
$DB['PASSWORD'] = 'DEIN-PASSWORT';
$DB['SCHEMA']   = '';

$ZBX_SERVER_NAME      = 'Mein Rechner';
$IMAGE_FORMAT_DEFAULT = IMAGE_FORMAT_PNG;
```

`PORT` mit dem Wert `0` steht für den Standardport von PostgreSQL. Speichere und schließe nano.

### 13. Datei der Gruppe www-data zuordnen

Die Datei enthält ein Passwort. Sie soll deshalb `root` gehören und nur für die Gruppe `www-data` lesbar sein, unter der PHP-FPM läuft.

```bash
sudo chown root:www-data /etc/zabbix/zabbix.conf.php
```

### 14. Leserechte einschränken

Entzieht allen anderen Benutzern das Leserecht.

```bash
sudo chmod 640 /etc/zabbix/zabbix.conf.php
```

### 15. nginx-Seite für Zabbix anlegen

Die Weboberfläche bekommt eine eigene Seite in nginx, die nur unter `127.0.0.1` auf Port **8081** lauscht. So bleibt die bestehende Standardseite unverändert.

```bash
sudo nano /etc/nginx/sites-available/zabbix
```

Trage Folgendes ein:

```nginx
server {
    listen 127.0.0.1:8081;
    server_name localhost;

    root  /usr/share/zabbix;
    index index.php;

    location ~ ^/(conf|app|include|local|locale|vendor)/ {
        deny all;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php-fpm.sock;
        fastcgi_param PHP_VALUE "post_max_size=16M
            max_execution_time=300
            max_input_time=300";
    }
}
```

Was die Blöcke bewirken:

- `root` zeigt auf den Ordner, in den das Paket die Weboberfläche installiert hat.
- Der erste `location`-Block sperrt die internen Ordner der Anwendung für den Browser. Er muss vor dem PHP-Block stehen, weil nginx bei solchen Mustern den ersten Treffer nimmt.
- Der zweite `location`-Block reicht PHP-Dateien an PHP-FPM weiter. `PHP_VALUE` setzt nur für Zabbix die Grenzwerte, die die Oberfläche verlangt, ohne die allgemeine `php.ini` zu ändern.

Speichere und schließe nano.

### 16. Seite einschalten

nginx liest nur Seiten, die in `sites-enabled` verlinkt sind.

```bash
sudo ln -s /etc/nginx/sites-available/zabbix /etc/nginx/sites-enabled/zabbix
```

### 17. Konfiguration prüfen

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`. Bei einem Fehler nennt nginx Datei und Zeile. Korrigiere sie mit nano, bevor du weitermachst.

### 18. nginx neu laden

```bash
sudo systemctl reload nginx
```

### 19. Weboberfläche abfragen

```bash
curl -s http://127.0.0.1:8081/ | grep "<title>"
```

**Prüfen:** Die Ausgabe enthält `<title>Mein Rechner: Zabbix</title>`.

## Erste Anmeldung

### 20. Weboberfläche öffnen

```bash
xdg-open http://127.0.0.1:8081
```

### 21. Mit dem Startkonto anmelden

Gib bei **Username** `Admin` und bei **Password** `zabbix` ein und klicke auf **Sign in**. Groß- und Kleinschreibung zählen.

Es erscheint das Dashboard **Global view**. Oben steht unter Umständen eine rote Meldung `Locale for language "en_US" is not found on the web server`. Sie kommt auf deutsch eingerichteten Systemen ohne englisches Sprachpaket vor und verschwindet mit dem nächsten Schritt.

### 22. Sprache und Zeitzone einstellen

Öffne links **Administration** → **General** → **GUI**. Wähle bei **Default language** den Eintrag **German (de_DE)** und bei **Default time zone** den Eintrag **Europe/Berlin**. Klicke unten auf **Update**.

**Prüfen:** Oben erscheint **Konfiguration geändert**, und die Oberfläche ist nun deutsch. Die Einstellung gilt für alle Benutzer, die in ihrem Profil nichts anderes gewählt haben.

### 23. Eigenes Kennwort festlegen

Das Startkennwort `zabbix` ist allgemein bekannt. Öffne links unten **Benutzereinstellungen** → **Profil** und klicke auf **Kennwort ändern**. Trage bei **Aktuelles Passwort** `zabbix` ein, bei **Kennwort** und **Kennwort (nochmal)** dein neues Kennwort, und klicke auf **Ändern**.

Eine englische Rückfrage weist darauf hin, dass alle laufenden Sitzungen beendet werden. Bestätige mit **OK**. Zabbix meldet dich ab.

**Prüfen:** Die Anmeldung mit `Admin` und dem neuen Kennwort klappt.

## Werte ansehen

### 24. Host prüfen

Öffne **Überwachung** → **Hosts**. Dort steht der Host **Zabbix server** mit der Schnittstelle `127.0.0.1:10050`.

**Prüfen:** In der Spalte **Verfügbarkeit** leuchtet **ZBX** grün. Der Server erreicht den Agenten also. Ist das Feld grau, warte eine Minute und lade die Seite neu.

### 25. Aktuelle Werte ansehen

Klicke in derselben Zeile auf **Aktuelle Daten**. Die Liste zeigt rund 130 Werte des Rechners, z. B. **CPU utilization**, **Available memory** oder den freien Platz der Dateisysteme, jeweils mit Zeitpunkt der letzten Abfrage. Ein Klick auf **Diagramm** am Zeilenende zeigt den Verlauf.

### 26. Systemzustand von Zabbix ansehen

Öffne **Berichte** → **Systeminformation**.

**Prüfen:** In der Zeile **Zabbix-Server läuft** steht **Ja** mit `127.0.0.1:10051`.

### 27. Alarm ausprobieren

Halte den Agenten an, damit Zabbix ein Problem meldet.

```bash
sudo systemctl stop zabbix-agent2
```

Öffne nach etwa vier Minuten **Überwachung** → **Probleme**.

**Prüfen:** Es erscheint das Problem **Linux: Zabbix agent is not available (for 3m)** für den Host **Zabbix server**.

### 28. Agent wieder starten

```bash
sudo systemctl start zabbix-agent2
```

**Prüfen:** Nach ein bis zwei Minuten wechselt das Problem auf den Status **ERLEDIGT** und verschwindet kurz darauf aus der Liste.

## Wie geht es weiter?

- **Benachrichtigungen per E-Mail:** Unter **Alarme** → **Medientypen** trägst du beim Typ **Email** deinen Mailserver ein. Danach hinterlegst du im eigenen **Profil** unter **Medien** die Empfängeradresse und schaltest unter **Alarme** → **Aktionen** → **Auslöseraktionen** die vorbereitete Aktion ein.
- **Weitere Rechner überwachen:** Auf dem anderen Rechner `zabbix-agent2` installieren und in einer Ergänzungsdatei `Server=` und `ServerActive=` auf die Adresse des Zabbix-Servers setzen. Dann darf der Server nicht mehr nur auf `127.0.0.1` lauschen, und die Firewall muss die Ports 10050 und 10051 zwischen beiden Rechnern freigeben. Im Browser legst du den Rechner unter **Datenerfassung** → **Hosts** → **Neuer Host** an und verbindest ihn mit der Vorlage **Linux by Zabbix agent**.
- **Fertige Vorlagen:** Unter **Datenerfassung** → **Vorlagen** gibt es Vorlagen etwa für PostgreSQL, nginx, MySQL oder Webseiten-Prüfungen. Die zugehörigen Hinweise liegen unter `/usr/share/doc/zabbix-frontend-php/templates`.
- **Darstellung in Grafana:** Mit dem Zabbix-Plugin für [Grafana](grafana.md) lassen sich die Werte dort in eigenen Dashboards zeigen.
- **Sicherung:** Alle Einstellungen und Messwerte stecken in der Datenbank. `sudo -u postgres pg_dump -Fc zabbix > zabbix.dump` sichert sie, siehe [PostgreSQL](postgresql.md).
- **Dokumentation:** <https://www.zabbix.com/documentation/7.0/de/manual> sowie die Hinweise unter `/usr/share/doc/zabbix-server-pgsql/README.Debian`

## Deinstallieren

### 1. nginx-Seite löschen

```bash
sudo rm /etc/nginx/sites-enabled/zabbix /etc/nginx/sites-available/zabbix
```

### 2. nginx neu laden

```bash
sudo systemctl reload nginx
```

### 3. Zabbix entfernen

Entfernt Server, Weboberfläche und Agent samt ihren Einstellungen, der Datei `/etc/zabbix/zabbix.conf.php` und den Protokollen. Die Dienste werden dabei angehalten. `apt` meldet, dass zwei Ordner unter `/etc/zabbix` nicht leer sind. Sie enthalten die eigenen Dateien aus den Schritten 7 und 10 und werden in Schritt 7 gelöscht.

```bash
sudo apt purge zabbix-server-pgsql zabbix-frontend-php zabbix-agent2
```

### 4. Mitinstallierte Pakete entfernen

Entfernt die Pakete, die Zabbix nachgezogen hat: das Ping-Werkzeug `fping`, die PHP-Erweiterung `bcmath` und einige Bibliotheken. PHP-FPM und die PostgreSQL-Anbindung für PHP bleiben erhalten, weil sie oft auch von anderen Anwendungen genutzt werden. Prüfe vor dem Bestätigen die Liste, die `apt` anzeigt: Steht dort ein Paket, das du für etwas anderes brauchst, brich mit <kbd>n</kbd> ab und lass es im Befehl weg.

```bash
sudo apt purge fping php-bcmath php8.5-bcmath libopenipmi0t64 libevent-core-2.1-7t64 libevent-extra-2.1-7t64 libevent-pthreads-2.1-7t64
```

> **Hinweis:** `sudo apt autoremove --purge` würde diese Pakete ebenfalls finden, entfernt aber auch alles andere, was auf dem Rechner gerade als „nicht mehr benötigt“ gilt. Sieh dir deshalb die Liste genau an, falls du diesen Weg nimmst.

### 5. Datenbank löschen

**Achtung:** Damit sind alle Einstellungen und Messwerte von Zabbix unwiderruflich gelöscht.

```bash
sudo -u postgres dropdb zabbix
```

### 6. Datenbankbenutzer löschen

```bash
sudo -u postgres dropuser zabbix
```

### 7. Übrige Dateien löschen

Löscht den Ordner mit den beiden eigenen Ergänzungsdateien aus den Schritten 7 und 10, den das Paket zurücklässt.

```bash
sudo rm -rf /etc/zabbix
```

### 8. Systembenutzer entfernen

Die Installation hat den Benutzer `zabbix` angelegt, unter dem Server und Agent liefen.

```bash
sudo deluser zabbix
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
zabbix_server --version
```
