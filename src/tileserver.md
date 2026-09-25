# Tileserver (OpenStreetMap)

Ein Tileserver erzeugt aus OpenStreetMap-Daten eigene Kartenkacheln (PNG-Bilder), die sich in Webkarten wie Leaflet oder OpenLayers einbinden lassen – ohne Abhängigkeit von fremden Kartendiensten.

## Vorbemerkungen

Der Tileserver besteht aus mehreren Bausteinen, die zusammenarbeiten:

| Baustein | Aufgabe |
|---|---|
| PostgreSQL + PostGIS | speichert die importierten OSM-Daten mit Geometrien |
| osm2pgsql | liest eine `.osm.pbf`-Datei und schreibt sie in die Datenbank |
| OpenStreetMap Carto | Kartenstil (Farben, Linien, Beschriftungen) im CartoCSS-Format |
| carto | übersetzt den Kartenstil in eine Mapnik-XML-Datei |
| Mapnik | zeichnet aus Datenbank und Stil die Kartenbilder |
| renderd | Hintergrunddienst, der Kacheln mit Mapnik rendert und zwischenspeichert |
| Apache + mod_tile | liefert die Kacheln per HTTP aus und beauftragt bei Bedarf renderd |

Hinweise zum Umfang:

- Diese Anleitung importiert als Beispiel nur die Stadt **Ahrensburg** (Kreis Stormarn). Der kleine Ausschnitt ist in wenigen Sekunden importiert. Größere Gebiete brauchen deutlich mehr Arbeitsspeicher, Festplattenplatz und Zeit. Für ganz Deutschland sollten es mindestens 32 GB RAM und rund 200 GB SSD-Speicher sein.
- Die Kartendaten und der Kartenstil liegen unter `/srv/osm`. So muss das Home-Verzeichnis nicht für andere Benutzer freigegeben werden.
- Ubuntu 26.04 bringt PostgreSQL 18 und Mapnik 4.2 mit. Pfade und Paketnamen unten sind darauf abgestimmt.
- **Quelle:** Die Texte dieser Anleitung sind eigenständig geschrieben. Als technische Grundlage für die Befehle zu Datenbank, Import und renderd diente die englische Anleitung [„Manually building a tile server (Ubuntu 24.04 LTS)“](https://switch2osm.org/serving-tiles/manually-building-a-tile-server-ubuntu-24-04-lts/) der switch2osm-Mitwirkenden, veröffentlicht unter der Lizenz [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/deed.de). Befehle, Pfade und Versionen sind hier auf Ubuntu 26.04, Mapnik 4.2 und den Ausschnitt Ahrensburg abgestimmt.

## Installation der Pakete

### 1. Paketlisten aktualisieren

Sorgt dafür, dass `apt` die neuesten Paketversionen aus den Ubuntu-Quellen kennt.

```bash
sudo apt update
```

### 2. Datenbank-Pakete installieren

Installiert PostgreSQL, die Geodaten-Erweiterung PostGIS und das Importwerkzeug `osm2pgsql`.

```bash
sudo apt install -y postgresql postgresql-contrib postgis postgresql-18-postgis-3 postgresql-18-postgis-3-scripts osm2pgsql
```

**Prüfen:** Die Version von osm2pgsql wird ausgegeben.

```bash
osm2pgsql --version
```

### 3. Render-Pakete installieren

Installiert den Renderdienst `renderd`, das Apache-Modul `mod_tile`, den Webserver Apache sowie die Mapnik-Werkzeuge.

```bash
sudo apt install -y apache2 renderd libapache2-mod-tile mapnik-utils
```

**Prüfen:** Apache läuft (`active`). renderd meldet an dieser Stelle noch `failed` – das ist richtig so, denn es ist noch kein Kartenstil eingetragen (Schritt 22).

```bash
systemctl is-active apache2 renderd
```

> **Port 80 schon belegt?** Läuft auf dem Rechner bereits ein anderer Webserver (z. B. nginx), kann Apache nicht starten und meldet `failed` mit `Address already in use` bzw. `no listening sockets available`. Dann Apache auf Port 8080 legen und in allen späteren URLs `localhost:8080` statt `localhost` verwenden:
>
> ```bash
> sudo nano /etc/apache2/ports.conf
> ```
>
> Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `Listen 80`, ändere die Zeile in `Listen 8080`, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.
>
> ```bash
> sudo nano /etc/apache2/sites-available/000-default.conf
> ```
>
> Ändere die erste Zeile `<VirtualHost *:80>` in `<VirtualHost *:8080>`, speichere und beende nano. Danach Apache neu starten:
>
> ```bash
> sudo systemctl restart apache2
> ```
>
> Damit die Karte später auch ohne `:8080` erreichbar ist, kann nginx die Kachelanfragen an Apache weiterreichen – siehe [nginx als Proxy vor Apache](nginx-apache.md).

### 4. Werkzeuge für den Kartenstil installieren

`node-carto` übersetzt den Kartenstil, `osmium-tool` schneidet ein Stadtgebiet aus einer größeren OSM-Datei aus, `gdal-bin` und die Python-Module werden vom Hilfsskript für die Küstenlinien- und Grenzdaten gebraucht, `git` holt den Kartenstil.

```bash
sudo apt install -y git curl unzip osmium-tool node-carto gdal-bin python3-psycopg2 python3-yaml python3-requests
```

**Prüfen:** carto meldet mindestens Version 1.2.0.

```bash
carto -v
```

### 5. Schriftarten installieren

Der Kartenstil beschriftet Orte in vielen Schriftsystemen und erwartet dafür die Noto-Schriften. Über `apt` installiert, findet Mapnik sie automatisch unter `/usr/share/fonts`.

```bash
sudo apt install -y fonts-noto-core fonts-noto-ui-core fonts-noto-cjk fonts-noto-extra fonts-hanazono fonts-unifont
```

## Datenbank einrichten

### 6. Datenbank `gis` anlegen

Der Dienst `renderd` läuft als Systembenutzer `_renderd` (wurde mit dem Paket angelegt). Deshalb bekommt dieser Benutzer eine gleichnamige Datenbankrolle und wird Besitzer der Datenbank `gis`. Der Name `gis` ist im Kartenstil fest eingetragen.

```bash
sudo -u postgres createuser _renderd
```

```bash
sudo -u postgres createdb -E UTF8 -O _renderd gis
```

### 7. Erweiterungen PostGIS und hstore aktivieren

PostGIS ergänzt die Datenbank um Geometrie-Datentypen, `hstore` speichert beliebige OSM-Schlüssel/Wert-Paare in einer Spalte.

```bash
sudo -u postgres psql -d gis -c "CREATE EXTENSION postgis;" -c "CREATE EXTENSION hstore;"
```

### 8. Besitz der PostGIS-Tabellen übertragen

Die beiden Verwaltungstabellen von PostGIS gehören nach dem Anlegen `postgres`. `_renderd` braucht Schreibrechte darauf, damit der Import funktioniert.

```bash
sudo -u postgres psql -d gis -c "ALTER TABLE geometry_columns OWNER TO _renderd;" -c "ALTER TABLE spatial_ref_sys OWNER TO _renderd;"
```

**Prüfen:** In der Liste der Erweiterungen stehen `postgis` und `hstore`.

```bash
sudo -u postgres psql -d gis -c "\dx"
```

## Kartenstil vorbereiten

### 9. Arbeitsverzeichnis anlegen

Legt `/srv/osm` an und macht den eigenen Benutzer zum Besitzer, damit die folgenden Schritte ohne `sudo` auskommen.

```bash
sudo mkdir -p /srv/osm
```

```bash
sudo chown "$USER": /srv/osm
```

### 10. OpenStreetMap Carto herunterladen

Klont den Standard-Kartenstil von openstreetmap.org.

```bash
git clone https://github.com/gravitystorm/openstreetmap-carto.git /srv/osm/openstreetmap-carto
```

### 11. Feste Version auswählen

Wechselt auf die veröffentlichte Version 5.9.0, damit Stil, Importregeln und Datenbankfunktionen sicher zueinander passen.

```bash
git -C /srv/osm/openstreetmap-carto switch --detach v5.9.0
```

### 12. Kartenstil in Mapnik-XML übersetzen

`carto` wandelt die Projektdatei `project.mml` in die Datei `mapnik.xml` um, die renderd später lädt.

```bash
cd /srv/osm/openstreetmap-carto && carto project.mml > mapnik.xml
```

**Prüfen:** Die Datei existiert und ist mehrere Megabyte groß. Warnungen von carto sind unkritisch, solange die Datei entsteht.

```bash
ls -lh /srv/osm/openstreetmap-carto/mapnik.xml
```

## OSM-Daten importieren

### 13. Datenverzeichnis anlegen

Hier landet der heruntergeladene Kartenausschnitt.

```bash
mkdir -p /srv/osm/data
```

### 14. Bundesland Schleswig-Holstein herunterladen

Geofabrik bietet tagesaktuelle Ausschnitte der OSM-Daten an, allerdings nur bis hinunter zu Bundesländern und Regierungsbezirken. Für Ahrensburg wird deshalb zuerst das ganze Bundesland geladen (rund 150 MB). Für ein anderes Gebiet die passende URL von <https://download.geofabrik.de/> einsetzen.

```bash
curl -L -o /srv/osm/data/schleswig-holstein-latest.osm.pbf https://download.geofabrik.de/europe/germany/schleswig-holstein-latest.osm.pbf
```

### 15. Ahrensburg ausschneiden

`osmium extract` schneidet ein Rechteck aus der Datei heraus. Die Werte nach `-b` sind die Ecken des Rechtecks als *westliche Länge, südliche Breite, östliche Länge, nördliche Breite* und umschließen das Stadtgebiet von Ahrensburg. Die Grenzen einer anderen Stadt lassen sich z. B. auf <https://www.openstreetmap.org> über „Export“ ablesen.

```bash
osmium extract -b 10.16,53.63,10.32,53.71 /srv/osm/data/schleswig-holstein-latest.osm.pbf -o /srv/osm/data/ahrensburg.osm.pbf
```

**Prüfen:** Die neue Datei ist nur wenige Megabyte groß.

```bash
ls -lh /srv/osm/data
```

### 16. Daten in die Datenbank importieren

`osm2pgsql` liest die PBF-Datei und legt die Tabellen an, die OpenStreetMap Carto erwartet. Der Import läuft als `_renderd`, damit dieser Benutzer die Tabellen besitzt.

Bedeutung der Optionen:

- `--create --slim`: neue Datenbank aufbauen, Zwischendaten in der Datenbank statt im RAM halten (Voraussetzung für spätere Updates)
- `-G`: Multipolygone als eine zusammenhängende Geometrie speichern
- `--hstore`: legt zusätzlich die Spalte `tags` an. Darin landen als Schlüssel/Wert-Paare alle Merkmale eines Objekts, die in der Spaltenliste (`-S`) nicht vorkommen
- `--tag-transform-script` und `-S`: Regeln und Spaltenliste aus dem Kartenstil
- `-C 2500`: bis zu 2500 MB Arbeitsspeicher als Zwischenspeicher nutzen – bei wenig RAM kleiner wählen

```bash
sudo -u _renderd osm2pgsql -d gis --create --slim -G --hstore \
  --tag-transform-script /srv/osm/openstreetmap-carto/openstreetmap-carto.lua \
  -S /srv/osm/openstreetmap-carto/openstreetmap-carto.style \
  -C 2500 --number-processes 1 \
  /srv/osm/data/ahrensburg.osm.pbf
```

**Prüfen:** Am Ende meldet osm2pgsql `osm2pgsql took ... overall`. Die Tabellen sind vorhanden:

```bash
sudo -u _renderd psql -d gis -c "\dt"
```

### 17. Indizes anlegen

Zusätzliche Indizes beschleunigen die Abfragen, die Mapnik beim Zeichnen der Kacheln stellt.

```bash
cd /srv/osm/openstreetmap-carto && sudo -u _renderd psql -d gis -f indexes.sql
```

### 18. Datenbankfunktionen einspielen

Der Kartenstil ruft einige eigene SQL-Funktionen auf (z. B. zur Auswahl von Beschriftungen), die hier angelegt werden.

```bash
cd /srv/osm/openstreetmap-carto && sudo -u _renderd psql -d gis -f functions.sql
```

### 19. Externe Daten laden

Küstenlinien, Meeresflächen und einige Grenzen stammen nicht aus der PBF-Datei, sondern werden separat heruntergeladen und in die Datenbank geladen. Das Verzeichnis `data` muss `_renderd` gehören, weil das Skript als dieser Benutzer läuft.

```bash
mkdir -p /srv/osm/openstreetmap-carto/data
```

```bash
sudo chown _renderd /srv/osm/openstreetmap-carto/data
```

```bash
cd /srv/osm/openstreetmap-carto && sudo -u _renderd scripts/get-external-data.py
```

**Prüfen:** Das Skript endet ohne Fehlermeldung; die Tabelle `water_polygons` ist gefüllt.

```bash
sudo -u _renderd psql -d gis -c "SELECT count(*) FROM water_polygons;"
```

## renderd konfigurieren

### 20. Konfigurationsdatei öffnen

Die Einstellungen von renderd liegen in `/etc/renderd.conf`.

```bash
sudo nano /etc/renderd.conf
```

### 21. Mapnik-Pfade korrigieren

Die mitgelieferte Datei zeigt noch auf das Plugin-Verzeichnis von Mapnik 3.1. Unter Ubuntu 26.04 liegt Mapnik 4.2 an anderer Stelle. Außerdem soll renderd alle Schriften unter `/usr/share/fonts` finden (die CJK-Schriften liegen unter `opentype`, nicht unter `truetype`). Den Abschnitt `[mapnik]` so ändern:

```ini
[mapnik]
plugins_dir=/usr/lib/x86_64-linux-gnu/mapnik/4.2/input
font_dir=/usr/share/fonts
font_dir_recurse=true
```

**Prüfen:** Im angegebenen Verzeichnis liegt u. a. `postgis+pgraster.input` – das ist das Plugin, mit dem Mapnik die Datenbank liest.

```bash
ls /usr/lib/x86_64-linux-gnu/mapnik/4.2/input
```

### 22. Kartenstil als Kachelsatz eintragen

Am Ende der Datei einen eigenen Abschnitt ergänzen. `URI` ist der URL-Pfad, unter dem die Kacheln erreichbar sind, `XML` der in Schritt 12 erzeugte Stil.

```ini
[osm]
URI=/osm/
XML=/srv/osm/openstreetmap-carto/mapnik.xml
HOST=localhost
TILESIZE=256
MAXZOOM=20
```

Anschließend speichern (`Strg+O`, `Enter`) und schließen (`Strg+X`).

### 23. renderd neu starten

Lädt die geänderte Konfiguration und den Kartenstil.

```bash
sudo systemctl restart renderd
```

**Prüfen:** Der Dienst ist `active (running)`. Fehler beim Laden des Stils stehen im Journal.

```bash
systemctl status renderd --no-pager
```

```bash
journalctl -u renderd -n 30 --no-pager
```

## Apache konfigurieren

### 24. Modul mod_tile aktivieren

Schaltet das Apache-Modul ein, das Kachel-URLs erkennt und mit renderd spricht. Meist hat das Paket das schon erledigt; die Meldung `Module tile already enabled` ist dann in Ordnung.

```bash
sudo a2enmod tile
```

### 25. Konfiguration für mod_tile anlegen

Die Datei sagt mod_tile, wo die Kachelsätze beschrieben sind und über welchen Socket renderd erreichbar ist. Die Zeitlimits legen fest, wie lange Apache auf eine neu gerenderte Kachel wartet.

```bash
sudo nano /etc/apache2/conf-available/renderd.conf
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```apache
LoadTileConfigFile /etc/renderd.conf
ModTileRenderdSocketName /run/renderd/renderd.sock
ModTileRequestTimeout 3
ModTileMissingRequestTimeout 60
```

### 26. Konfiguration aktivieren

Bindet die neue Datei in Apache ein.

```bash
sudo a2enconf renderd
```

### 27. Apache neu starten

Neu starten statt nur neu laden, weil ein Modul hinzugekommen ist.

```bash
sudo systemctl restart apache2
```

**Prüfen:** Die Konfiguration ist fehlerfrei.

```bash
sudo apache2ctl configtest
```

## Tileserver testen

### 28. Erste Kachel abrufen

Fordert die Weltkarte in Zoomstufe 0 an. Beim ersten Aufruf rendert renderd die Kachel, das kann einige Sekunden dauern.

```bash
curl -o /tmp/kachel.png http://localhost/osm/0/0/0.png
```

**Prüfen:** Die Datei ist ein PNG-Bild mit 256 × 256 Pixeln.

```bash
file /tmp/kachel.png
```

### 29. Testseite mit Leaflet anlegen

Eine kleine HTML-Seite zeigt die eigenen Kacheln als verschiebbare Karte, zentriert auf die Ahrensburger Innenstadt.

```bash
sudo nano /var/www/html/karte.html
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Eigener Tileserver</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css">
  <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>html, body, #karte { height: 100%; margin: 0; }</style>
</head>
<body>
  <div id="karte"></div>
  <script>
    const karte = L.map('karte').setView([53.675, 10.236], 14);
    L.tileLayer('/osm/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap-Mitwirkende'
    }).addTo(karte);
  </script>
</body>
</html>
```

### 30. Karte im Browser öffnen

Beim Verschieben und Zoomen werden fehlende Kacheln nachgerendert; bereits erzeugte Kacheln kommen aus dem Zwischenspeicher unter `/var/cache/renderd/tiles`.

```bash
xdg-open http://localhost/karte.html
```

**Prüfen:** Die Zahl der zwischengespeicherten Metakacheln (je 8 × 8 Kacheln in einer `.meta`-Datei) wächst, während man in der Karte herumzoomt.

```bash
find /var/cache/renderd/tiles -name '*.meta' | wc -l
```

## Installation prüfen

```bash
osm2pgsql --version
```

```bash
systemctl is-active postgresql renderd apache2
```

```bash
curl -sI http://localhost/osm/0/0/0.png | head -n 1
```

Die letzte Zeile sollte `HTTP/1.1 200 OK` lauten.

## Deinstallieren

### 1. Dienste stoppen

Beendet renderd und Apache, damit keine Dateien mehr in Benutzung sind.

```bash
sudo systemctl stop renderd apache2
```

### 2. Datenbank und Rolle löschen

**Achtung:** Alle importierten Kartendaten gehen verloren.

```bash
sudo -u postgres dropdb gis
```

```bash
sudo -u postgres dropuser _renderd
```

### 3. Kartenstil, Daten und Kachel-Zwischenspeicher löschen

```bash
sudo rm -r /srv/osm /var/cache/renderd
```

### 4. Testseite und Apache-Konfiguration entfernen

```bash
sudo rm /var/www/html/karte.html /etc/apache2/conf-available/renderd.conf
```

### 5. Pakete entfernen

`purge` entfernt auch die Konfigurationsdateien wie `/etc/renderd.conf`. PostgreSQL und Apache nur mit entfernen, wenn sie nicht für andere Zwecke gebraucht werden.

```bash
sudo apt purge renderd libapache2-mod-tile mapnik-utils node-carto osmium-tool osm2pgsql postgresql-18-postgis-3 postgresql-18-postgis-3-scripts postgis
```

### 6. Nicht mehr benötigte Pakete entfernen

Entfernt Abhängigkeiten, die nur für den Tileserver installiert wurden.

```bash
sudo apt autoremove
```

**Prüfen:** Die Befehle werden nicht mehr gefunden.

```bash
renderd -h
```

```bash
osm2pgsql --version
```
