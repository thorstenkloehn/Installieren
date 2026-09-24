# Martin (Vektor-Tileserver)

Martin liefert aus PostGIS-Tabellen Vektorkacheln, die ein Webbrowser erst beim Anzeigen zeichnet. Diese Anleitung importiert die Stadt Ahrensburg aus der Datei `ahrensburg.osm.pbf` in PostgreSQL und veröffentlicht sie über Martin.

## Vorbemerkungen

So arbeiten die Bausteine zusammen:

| Baustein | Aufgabe |
|---|---|
| PostgreSQL + PostGIS | hält die OSM-Daten samt Geometrien |
| osm2pgsql | liest `ahrensburg.osm.pbf` und legt dabei eigene, schlanke Tabellen an |
| Martin | findet die Tabellen selbst und erzeugt daraus auf Anfrage Vektorkacheln (Format MVT) |
| MapLibre GL JS | zeichnet die Vektorkacheln im Browser und bestimmt Farben und Linien |

Hinweise:

- Martin rendert keine Bilder. Das Aussehen der Karte legt allein die Webseite fest (Schritt 22). Einen Kartenstil wie OpenStreetMap Carto braucht es deshalb nicht.
- Martin ist nicht in den Ubuntu-Paketquellen enthalten. Das Projekt stellt aber ein fertiges `.deb`-Paket bereit. Getestet wurde diese Anleitung mit Martin 1.16.1, PostgreSQL 18 und osm2pgsql 2.2.
- Die Daten liegen in einer eigenen Datenbank `osm`. Eine vorhandene Datenbank `gis` aus der Anleitung [Tileserver (OpenStreetMap)](tileserver.md) wird nicht verändert.
- Martin läuft unter einem eigenen Systembenutzer `martin`. Weil die Datenbankrolle genauso heißt, meldet sich Martin über den lokalen Socket ohne Passwort an (Anmeldeart *peer*).
- Martin hört nur auf `127.0.0.1:3000`, ist also von anderen Rechnern aus nicht erreichbar.

## Installation der Pakete

### 1. Paketlisten aktualisieren

Damit `apt` die neuesten Paketversionen kennt.

```bash
sudo apt update
```

### 2. Datenbank und Importwerkzeuge installieren

Installiert PostgreSQL mit der Geodaten-Erweiterung PostGIS, das Importprogramm `osm2pgsql`, das Ausschneidewerkzeug `osmium` und `curl` für Downloads. Bereits installierte Pakete lässt `apt` einfach stehen.

```bash
sudo apt install -y postgresql postgis postgresql-18-postgis-3 osm2pgsql osmium-tool curl
```

**Prüfen:** osm2pgsql meldet Version 2.0 oder neuer. Ältere Versionen verstehen die Importregeln aus Schritt 13 nicht.

```bash
osm2pgsql --version
```

### 3. Martin-Paket herunterladen

Lädt das `.deb`-Paket von der Release-Seite des Projekts (<https://github.com/maplibre/martin/releases>). Für eine neuere Version die Versionsnummer in der Adresse austauschen.

```bash
curl -L -o /tmp/martin.deb https://github.com/maplibre/martin/releases/download/martin-v1.16.1/debian-x86_64.deb
```

**Prüfen:** Die Datei ist rund 28 MB groß.

```bash
ls -lh /tmp/martin.deb
```

### 4. Martin installieren

`apt` installiert auch lokale Dateien. Wichtig ist das `./` bzw. der volle Pfad, sonst sucht `apt` in den Paketquellen nach einem Paket dieses Namens. Das Paket bringt die Programme `martin`, `martin-cp` und `mbtiles`, eine Beispielkonfiguration in `/etc/martin/config.yaml` und einen systemd-Dienst mit.

```bash
sudo apt install -y /tmp/martin.deb
```

**Prüfen:**

```bash
martin --version
```

### 5. Heruntergeladene Datei löschen

Das Paket ist installiert, die Datei wird nicht mehr gebraucht.

```bash
rm /tmp/martin.deb
```

## Benutzer und Datenbank einrichten

### 6. Systembenutzer `martin` anlegen

Unter diesem Benutzer laufen später der Import und der Dienst. Er hat kein Home-Verzeichnis und keine Login-Shell, weil er nur für Martin da ist.

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin martin
```

### 7. Datenbankrolle `martin` anlegen

Eine gleichnamige Rolle in PostgreSQL erlaubt dem Systembenutzer `martin` die passwortlose Anmeldung über den lokalen Socket.

```bash
sudo -u postgres createuser martin
```

### 8. Datenbank `osm` anlegen

Die Datenbank gehört `martin`. So darf der Import darin Tabellen anlegen und löschen.

```bash
sudo -u postgres createdb -E UTF8 -O martin osm
```

### 9. PostGIS aktivieren

Erst mit dieser Erweiterung kennt die Datenbank Geometrien. Nur `postgres` darf sie einschalten.

```bash
sudo -u postgres psql -d osm -c "CREATE EXTENSION postgis;"
```

**Prüfen:** Die Anmeldung als `martin` klappt, und die PostGIS-Version wird angezeigt.

```bash
sudo -u martin psql -d osm -c "SELECT postgis_version();"
```

## Kartendaten vorbereiten

Liegt `/srv/osm/data/ahrensburg.osm.pbf` schon vor (z. B. aus der Anleitung [Tileserver (OpenStreetMap)](tileserver.md)), geht es direkt mit Schritt 13 weiter.

### 10. Datenverzeichnis anlegen

Unter `/srv/osm` kann der Benutzer `martin` die Dateien lesen. Aus dem Home-Verzeichnis ginge das nicht ohne Weiteres.

```bash
sudo mkdir -p /srv/osm/data
```

```bash
sudo chown "$USER": /srv/osm/data
```

### 11. Schleswig-Holstein herunterladen

Geofabrik stellt OSM-Auszüge je Bundesland bereit (rund 150 MB), aber keine einzelnen Städte. Deshalb zuerst das Bundesland laden.

```bash
curl -L -o /srv/osm/data/schleswig-holstein-latest.osm.pbf https://download.geofabrik.de/europe/germany/schleswig-holstein-latest.osm.pbf
```

### 12. Ahrensburg ausschneiden

`osmium extract` schneidet ein Rechteck aus. Die vier Zahlen hinter `-b` sind westliche Länge, südliche Breite, östliche Länge und nördliche Breite rund um Ahrensburg.

```bash
osmium extract -b 10.16,53.63,10.32,53.71 /srv/osm/data/schleswig-holstein-latest.osm.pbf -o /srv/osm/data/ahrensburg.osm.pbf
```

**Prüfen:** `ahrensburg.osm.pbf` ist nur wenige Megabyte groß.

```bash
ls -lh /srv/osm/data
```

## Importregeln festlegen

### 13. Ordner für die Importregeln anlegen

In diesem Ordner liegt die Lua-Datei, die osm2pgsql sagt, welche OSM-Objekte in welche Tabelle kommen.

```bash
sudo mkdir -p /srv/osm/martin
```

### 14. Lua-Datei anlegen

osm2pgsql arbeitet hier mit der *Flex*-Ausgabe: Ein Lua-Skript legt die Tabellen fest und entscheidet für jedes Objekt, wohin es gehört. Das Beispiel legt vier Tabellen an: `strassen` (Wege und Straßen als Linien), `gebaeude` (Umrisse), `flaechen` (Wald, Wasser, Wiesen, Parks usw.) und `orte` (Punkte wie Geschäfte, Ärzte, Schulen). Die Geometrien speichert osm2pgsql automatisch in Web-Mercator (EPSG:3857), der Projektion der Webkarten. Martin muss dann nichts umrechnen.

```bash
sudo nano /srv/osm/martin/ahrensburg.lua
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```lua
-- Importregeln für Martin: vier einfache Tabellen in Web-Mercator (EPSG:3857)

local strassen = osm2pgsql.define_way_table('strassen', {
    { column = 'art', type = 'text' },
    { column = 'name', type = 'text' },
    { column = 'geom', type = 'linestring', not_null = true },
})

local gebaeude = osm2pgsql.define_area_table('gebaeude', {
    { column = 'art', type = 'text' },
    { column = 'hausnummer', type = 'text' },
    { column = 'geom', type = 'geometry', not_null = true },
})

local flaechen = osm2pgsql.define_area_table('flaechen', {
    { column = 'art', type = 'text' },
    { column = 'name', type = 'text' },
    { column = 'geom', type = 'geometry', not_null = true },
})

local orte = osm2pgsql.define_node_table('orte', {
    { column = 'art', type = 'text' },
    { column = 'name', type = 'text' },
    { column = 'geom', type = 'point', not_null = true },
})

-- Welche Schlüssel eine Fläche beschreiben (in dieser Reihenfolge geprüft)
local flaechen_schluessel = { 'natural', 'landuse', 'leisure', 'water' }

local function flaechen_art(tags)
    for _, schluessel in ipairs(flaechen_schluessel) do
        if tags[schluessel] then
            return schluessel .. '=' .. tags[schluessel]
        end
    end
    return nil
end

function osm2pgsql.process_node(object)
    local art = object.tags.amenity or object.tags.shop or object.tags.place
    if art then
        orte:insert({
            art = art,
            name = object.tags.name,
            geom = object:as_point(),
        })
    end
end

function osm2pgsql.process_way(object)
    local tags = object.tags
    if tags.building and object.is_closed then
        gebaeude:insert({
            art = tags.building,
            hausnummer = tags['addr:housenumber'],
            geom = object:as_polygon(),
        })
    elseif tags.highway then
        strassen:insert({
            art = tags.highway,
            name = tags.name,
            geom = object:as_linestring(),
        })
    elseif object.is_closed then
        local art = flaechen_art(tags)
        if art then
            flaechen:insert({
                art = art,
                name = tags.name,
                geom = object:as_polygon(),
            })
        end
    end
end

function osm2pgsql.process_relation(object)
    local tags = object.tags
    if tags.type ~= 'multipolygon' then
        return
    end
    if tags.building then
        gebaeude:insert({
            art = tags.building,
            hausnummer = tags['addr:housenumber'],
            geom = object:as_multipolygon(),
        })
        return
    end
    local art = flaechen_art(tags)
    if art then
        flaechen:insert({
            art = art,
            name = tags.name,
            geom = object:as_multipolygon(),
        })
    end
end
```

Bei Flächen steht in der Spalte `art` Schlüssel und Wert zusammen, z. B. `natural=water` oder `landuse=forest`. Danach richtet die Testseite in Schritt 22 die Farben aus.

## Daten importieren

### 15. In ein Verzeichnis wechseln, das `martin` lesen darf

`sudo -u martin` behält das aktuelle Verzeichnis bei. Liegt das im eigenen Home-Verzeichnis, gibt es sonst eine Warnung über fehlende Rechte.

```bash
cd /srv/osm
```

### 16. `ahrensburg.osm.pbf` importieren

Der Import läuft als `martin`, damit dieser Benutzer die neuen Tabellen besitzt.

- `-d osm`: Zieldatenbank
- `-O flex`: Flex-Ausgabe mit eigenen Tabellen
- `-S …/ahrensburg.lua`: die Importregeln aus Schritt 14

```bash
sudo -u martin osm2pgsql -d osm -O flex -S /srv/osm/martin/ahrensburg.lua /srv/osm/data/ahrensburg.osm.pbf
```

**Prüfen:** Am Ende steht `osm2pgsql took … overall`. Die vier Tabellen sind gefüllt (zum Zeitpunkt des Tests je nach Tabelle zwischen 2 000 und 21 000 Zeilen):

```bash
sudo -u martin psql -d osm -c "SELECT 'strassen' AS tabelle, count(*) FROM strassen UNION ALL SELECT 'gebaeude', count(*) FROM gebaeude UNION ALL SELECT 'flaechen', count(*) FROM flaechen UNION ALL SELECT 'orte', count(*) FROM orte;"
```

Ein erneuter Aufruf von Schritt 16 (z. B. mit neueren Daten) löscht die Tabellen und baut sie neu auf.

## Martin einrichten

### 17. Konfigurationsdatei öffnen

Das Paket hat unter `/etc/martin/config.yaml` schon eine Beispieldatei angelegt. Sie wird komplett ersetzt.

```bash
sudo nano /etc/martin/config.yaml
```

Lösche den vorhandenen Inhalt: <kbd>Alt</kbd>+<kbd>\\</kbd> (Dateianfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung starten), <kbd>Alt</kbd>+<kbd>/</kbd> (Dateiende), <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes ausschneiden).

### 18. Neue Konfiguration eintragen

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```yaml
# Nur lokal erreichbar
listen_addresses: '127.0.0.1:3000'

# Übersichtsseite mit allen Kachelquellen unter http://localhost:3000/
web_ui: enable-for-all

cache:
  size_mb: 256

postgres:
  # Anmeldung über den lokalen Socket, ohne Passwort
  connection_string: 'postgresql:///osm?host=/var/run/postgresql&user=martin'
  # Ausdehnung der Daten beim Start genau berechnen
  auto_bounds: calc
  auto_publish:
    tables: true
    functions: false
```

Was die Einträge bewirken:

- `connection_string`: Der leere Teil zwischen `//` und `/osm` heißt „kein Rechnername“. Mit `host=/var/run/postgresql` nutzt Martin den Unix-Socket statt TCP. Nur so greift die passwortlose Anmeldung.
- `auto_publish.tables: true`: Martin veröffentlicht jede Tabelle mit Geometriespalte als eigene Kachelquelle, benannt nach der Tabelle.
- `auto_bounds: calc`: Martin trägt in die Beschreibung jeder Quelle den Ausschnitt ein, der tatsächlich Daten enthält.

### 19. Ordner für die Dienst-Ergänzung anlegen

Der mitgelieferte Dienst würde Martin als `root` starten. Das ist unnötig, und die Anmeldung als `martin` bei der Datenbank würde scheitern. Eine Ergänzungsdatei (*Drop-in*) ändert das, ohne die Paketdatei anzufassen, die bei einem Update überschrieben würde.

```bash
sudo mkdir -p /etc/systemd/system/martin.service.d
```

### 20. Ergänzungsdatei anlegen

```bash
sudo nano /etc/systemd/system/martin.service.d/override.conf
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Service]
User=martin
Group=martin
Restart=on-failure
```

`Restart=on-failure` startet Martin neu, falls er abstürzt, z. B. weil PostgreSQL beim Hochfahren noch nicht bereit war.

### 21. Dienst einschalten und starten

`daemon-reload` liest die neue Ergänzungsdatei ein. `enable --now` startet Martin sofort und bei jedem Systemstart.

```bash
sudo systemctl daemon-reload
```

```bash
sudo systemctl enable --now martin
```

**Prüfen:** Der Dienst ist `active (running)`. Im Journal steht für jede Tabelle eine Zeile `Published source` und am Ende `Martin server is now active at http://127.0.0.1:3000/`.

```bash
systemctl status martin --no-pager
```

```bash
journalctl -u martin -n 30 --no-pager
```

**Prüfen:** Der Katalog listet die vier Quellen `flaechen`, `gebaeude`, `orte` und `strassen`.

```bash
curl -s http://localhost:3000/catalog
```

**Prüfen:** Eine Kachel über der Ahrensburger Innenstadt (Zoomstufe 14) wird mit Status `200` und einigen zehn Kilobyte geliefert. Mehrere Quellen, durch Kommas getrennt, fasst Martin zu einer Kachel zusammen.

```bash
curl -s -o /dev/null -w '%{http_code} %{size_download}\n' http://localhost:3000/strassen,gebaeude,flaechen,orte/14/8657/5285
```

Status `204` bedeutet: Die Kachel ist gültig, enthält an dieser Stelle aber keine Daten.

## Karte ansehen

### 22. Testseite anlegen

Eine kleine HTML-Datei holt sich über die TileJSON-Adresse `http://localhost:3000/flaechen,gebaeude,strassen,orte` die Kacheln und legt fest, wie jede Tabelle gezeichnet wird. `source-layer` ist dabei immer der Tabellenname. Martin erlaubt Zugriffe von fremden Seiten (CORS), deshalb klappt das auch mit einer lokal geöffneten Datei.

```bash
nano ~/martin-karte.html
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Martin – Ahrensburg</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.css">
  <script src="https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.js"></script>
  <style>html, body, #karte { height: 100%; margin: 0; }</style>
</head>
<body>
  <div id="karte"></div>
  <script>
    const karte = new maplibregl.Map({
      container: 'karte',
      center: [10.236, 53.675],
      zoom: 14,
      style: {
        version: 8,
        sources: {
          ahrensburg: {
            type: 'vector',
            url: 'http://localhost:3000/flaechen,gebaeude,strassen,orte',
            attribution: '&copy; OpenStreetMap-Mitwirkende'
          }
        },
        layers: [
          { id: 'hintergrund', type: 'background',
            paint: { 'background-color': '#f4f1ea' } },
          { id: 'flaechen', type: 'fill', source: 'ahrensburg', 'source-layer': 'flaechen',
            paint: { 'fill-color': ['match', ['get', 'art'],
              ['natural=water', 'water=pond', 'water=lake'], '#9cc3e6',
              ['landuse=forest', 'natural=wood'], '#a7c796',
              ['landuse=grass', 'landuse=meadow', 'leisure=park'], '#cfe5b5',
              ['landuse=residential'], '#e8e2d8',
              '#dcd8c8'] } },
          { id: 'gebaeude', type: 'fill', source: 'ahrensburg', 'source-layer': 'gebaeude',
            minzoom: 13,
            paint: { 'fill-color': '#c9b8a8', 'fill-outline-color': '#a8968a' } },
          { id: 'strassen', type: 'line', source: 'ahrensburg', 'source-layer': 'strassen',
            paint: {
              'line-color': ['match', ['get', 'art'],
                ['motorway', 'trunk', 'primary'], '#e8925a',
                ['secondary', 'tertiary'], '#f2c96b',
                '#ffffff'],
              'line-width': ['match', ['get', 'art'],
                ['motorway', 'trunk', 'primary'], 4,
                ['secondary', 'tertiary'], 3,
                ['footway', 'path', 'cycleway', 'track'], 1,
                2] } },
          { id: 'orte', type: 'circle', source: 'ahrensburg', 'source-layer': 'orte',
            minzoom: 15,
            paint: { 'circle-radius': 3, 'circle-color': '#b0406a' } }
        ]
      }
    });
    karte.addControl(new maplibregl.NavigationControl());

    // Beim Klick auf einen Punkt dessen Art und Namen anzeigen
    karte.on('click', 'orte', (e) => {
      const p = e.features[0].properties;
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setText(`${p.art}${p.name ? ': ' + p.name : ''}`)
        .addTo(karte);
    });
  </script>
</body>
</html>
```

Die Seite lädt MapLibre GL JS aus dem Netz. Es braucht also eine Internetverbindung, die Kartendaten selbst kommen aber vom eigenen Rechner.

### 23. Karte im Browser öffnen

```bash
xdg-open ~/martin-karte.html
```

**Prüfen:** Ahrensburg erscheint mit Flächen, Gebäuden und Straßen. Ab Zoomstufe 15 zeigen violette Punkte Geschäfte und Einrichtungen, ein Klick darauf nennt Art und Namen.

### 24. Übersichtsseite von Martin öffnen

Die eingebaute Oberfläche (dank `web_ui` aus Schritt 18) listet alle Quellen samt Feldern und hat eine einfache Vorschau.

```bash
xdg-open http://localhost:3000/
```

> **Über nginx veröffentlichen?** Soll die Karte von außen erreichbar sein, bleibt Martin auf `127.0.0.1:3000`, und nginx reicht einen Pfad wie `/martin/` weiter. Dafür in Schritt 18 die Zeile `route_prefix: '/martin'` ergänzen und in nginx `proxy_pass http://127.0.0.1:3000;` verwenden, ohne Schrägstrich am Ende, damit `/martin` in der Adresse erhalten bleibt. nginx muss außerdem den Kopf `Host` weitergeben (`proxy_set_header Host $host;`), denn aus ihm baut Martin die Kachel-Adressen in den TileJSON-Antworten. Wie ein solcher Proxy grundsätzlich eingerichtet wird, zeigt [nginx als Proxy vor Apache](nginx-apache.md).

## Installation prüfen

```bash
martin --version
```

```bash
systemctl is-active postgresql martin
```

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/health
```

Die letzte Zeile sollte `200` lauten.

## Deinstallieren

### 1. Dienst stoppen und abschalten

Beendet Martin und entfernt den Autostart.

```bash
sudo systemctl disable --now martin
```

### 2. Paket entfernen

`purge` löscht auch `/etc/martin/config.yaml`.

```bash
sudo apt purge martin
```

### 3. Dienst-Ergänzung entfernen

Die Datei aus Schritt 20 gehört nicht zum Paket und bleibt sonst liegen.

```bash
sudo rm -r /etc/systemd/system/martin.service.d
```

```bash
sudo systemctl daemon-reload
```

### 4. Datenbank löschen

**Achtung:** Alle importierten Daten in `osm` gehen verloren. Die Datenbank `gis` eines anderen Tileservers bleibt unberührt.

```bash
sudo -u postgres dropdb osm
```

### 5. Datenbankrolle löschen

Geht erst, wenn der Rolle keine Datenbank mehr gehört (Schritt 4).

```bash
sudo -u postgres dropuser martin
```

### 6. Systembenutzer löschen

```bash
sudo userdel martin
```

### 7. Importregeln und Testseite löschen

`/srv/osm/data` bleibt stehen, falls ein anderer Tileserver die Daten noch nutzt. Sonst `/srv/osm/data` ebenfalls löschen.

```bash
sudo rm -r /srv/osm/martin
```

```bash
rm ~/martin-karte.html
```

**Prüfen:** Das Programm und der Dienst sind verschwunden.

```bash
martin --version
```

```bash
systemctl status martin
```

Beide Befehle melden einen Fehler (`Kommando nicht gefunden` bzw. `Unit martin.service could not be found`).
