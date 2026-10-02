# Meilisearch

Meilisearch ist eine Suchmaschine, die man in eigene Websites und Anwendungen einbaut. Man übergibt ihr Datensätze als JSON, etwa Produkte, Artikel oder Bücher, und kann sie danach blitzschnell durchsuchen. Meilisearch verzeiht Tippfehler, liefert schon während des Tippens passende Treffer und kann nach Feldern filtern, sortieren und zählen. Angesprochen wird es über HTTP. Diese Anleitung richtet Meilisearch als Dienst ein und baut einen kleinen Bücherkatalog als Beispiel.

## Vorbemerkungen

- **Warum nicht apt:** Ubuntu 26.04 enthält kein Paket für Meilisearch. Das Archiv, das der Hersteller für apt anbietet, ist nicht signiert und hinkt den Versionen hinterher. Diese Anleitung nimmt deshalb die fertige Programmdatei, die das Projekt auf GitHub veröffentlicht, prüft ihre Prüfsumme und legt sie nach `/usr/local/bin`. Den Dienst richtest du selbst ein, so wie es die Herstellerdokumentation für den Betrieb auf einem Server beschreibt.
- **Nur lokal erreichbar:** Mit der Einstellung aus Schritt 11 lauscht Meilisearch nur auf `127.0.0.1`, Port **7700**.
- **Mit Hauptschlüssel:** Ein *Master Key* schützt alle Zugriffe. Ohne Schlüssel antwortet Meilisearch nur auf die Abfrage seines Zustands.
- **Telemetrie:** Ohne Gegenmaßnahme sendet Meilisearch anonyme Nutzungsdaten an den Hersteller. Schritt 11 schaltet das ab.
- **Größe:** Die Programmdatei ist rund 340 MB groß.
- **Version:** Getestet mit Meilisearch **1.54.3** am 2. Oktober 2026. Steht auf der [Release-Seite](https://github.com/meilisearch/meilisearch/releases/latest) eine neuere Version, ersetzt du `v1.54.3` in Schritt 3 durch die neue Nummer.

## Installation

### 1. Paketlisten aktualisieren

So kennt `apt` die neuesten Paketversionen.

```bash
sudo apt update
```

### 2. curl installieren

`curl` lädt die Programmdatei herunter und spricht später mit Meilisearch. Ist es schon vorhanden, meldet `apt` nur, dass es bereits in der neuesten Version installiert ist.

```bash
sudo apt install curl
```

### 3. Programmdatei herunterladen

Lädt die Fassung für Linux auf 64-Bit-Intel/AMD-Prozessoren nach `/tmp`. `-L` sorgt dafür, dass `curl` der Weiterleitung von GitHub zur eigentlichen Datei folgt.

```bash
curl -L -o /tmp/meilisearch https://github.com/meilisearch/meilisearch/releases/download/v1.54.3/meilisearch-linux-amd64
```

Die Datei `meilisearch-enterprise-linux-amd64` auf derselben Seite ist die kostenpflichtige Ausgabe und wird hier nicht gebraucht.

### 4. Prüfsumme kontrollieren

Mit der Prüfsumme stellst du fest, ob die Datei vollständig und unverändert angekommen ist.

```bash
sha256sum /tmp/meilisearch
```

**Prüfen:** Bei Version 1.54.3 lautet der Wert `0ece934f9791f0db83e1184f4f505a38eae7d93ff1c47efaa9426cf2b3a12ba7`. Bei einer neueren Version vergleichst du ihn mit dem Wert `sha256:…`, den GitHub auf der Release-Seite unter „Assets“ neben `meilisearch-linux-amd64` anzeigt.

### 5. Programm installieren

`install` kopiert die Datei nach `/usr/local/bin` und macht sie mit `-m 755` für alle ausführbar. Die Datei gehört danach `root`, der Dienst kann sie also nicht verändern.

```bash
sudo install -m 755 /tmp/meilisearch /usr/local/bin/meilisearch
```

### 6. Heruntergeladene Datei löschen

```bash
rm /tmp/meilisearch
```

### 7. Version prüfen

```bash
meilisearch --version
```

**Prüfen:** Es erscheint `meilisearch 1.54.3`.

## Dienst einrichten

### 8. Systembenutzer anlegen

Meilisearch soll nicht mit den Rechten von `root` oder deinem eigenen Benutzer laufen, sondern als eigener Benutzer ohne Anmeldemöglichkeit.

- `--system` legt einen Systembenutzer an.
- `--no-create-home` verhindert, dass Vorlagedateien wie `.bashrc` kopiert werden.
- `--shell /usr/sbin/nologin` verhindert eine Anmeldung als dieser Benutzer.

```bash
sudo useradd --system --no-create-home --home-dir /var/lib/meilisearch --shell /usr/sbin/nologin meilisearch
```

### 9. Datenordner anlegen

`install -d` legt den Ordner an, `-o` und `-g` übergeben ihn dem Benutzer und der Gruppe `meilisearch`, `-m 750` sperrt ihn für alle anderen Benutzer. Die Unterordner für Daten und Sicherungen legt Meilisearch später selbst an.

```bash
sudo install -d -o meilisearch -g meilisearch -m 750 /var/lib/meilisearch
```

### 10. Hauptschlüssel erzeugen

Der Hauptschlüssel muss mindestens 16 Zeichen lang sein. Dieser Befehl erzeugt eine zufällige Zeichenfolge aus 64 Zeichen:

```bash
openssl rand -hex 32
```

Lass die Ausgabe im Terminal stehen. Du brauchst sie in Schritt 11 und Schritt 17.

### 11. Konfigurationsdatei anlegen

```bash
sudo nano /etc/meilisearch.toml
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>) und ersetze `HAUPTSCHLUESSEL` durch die Zeichenfolge aus Schritt 10. Die Anführungszeichen bleiben stehen. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

```ini
env = "production"
master_key = "HAUPTSCHLUESSEL"
http_addr = "127.0.0.1:7700"
no_analytics = true
db_path = "/var/lib/meilisearch/data"
dump_dir = "/var/lib/meilisearch/dumps"
snapshot_dir = "/var/lib/meilisearch/snapshots"
```

- `env = "production"` – Betrieb mit Schlüsselpflicht und ohne die Vorschau-Weboberfläche für Entwickler.
- `master_key` – der Hauptschlüssel mit allen Rechten.
- `http_addr` – Meilisearch nimmt Verbindungen nur von diesem Rechner an.
- `no_analytics = true` – keine Nutzungsdaten an den Hersteller.
- `db_path`, `dump_dir`, `snapshot_dir` – wo Meilisearch Daten und Sicherungen ablegt.

### 12. Konfigurationsdatei schützen

Die Datei enthält den Hauptschlüssel. `chown` gibt sie der Gruppe `meilisearch`, `chmod 640` erlaubt nur `root` das Schreiben und der Gruppe das Lesen. Andere Benutzer sehen den Inhalt nicht.

```bash
sudo chown root:meilisearch /etc/meilisearch.toml
```

```bash
sudo chmod 640 /etc/meilisearch.toml
```

### 13. Dienstdatei anlegen

```bash
sudo nano /etc/systemd/system/meilisearch.service
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Unit]
Description=Meilisearch
After=network.target

[Service]
Type=simple
User=meilisearch
Group=meilisearch
WorkingDirectory=/var/lib/meilisearch
ExecStart=/usr/local/bin/meilisearch --config-file-path /etc/meilisearch.toml
Restart=on-failure
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/var/lib/meilisearch

[Install]
WantedBy=multi-user.target
```

- `User` und `Group` – der Dienst läuft als Benutzer aus Schritt 8.
- `Restart=on-failure` – stürzt Meilisearch ab, startet systemd es neu.
- Die Zeilen ab `NoNewPrivileges` schränken den Dienst ein: Er darf sich keine zusätzlichen Rechte verschaffen, sieht die Home-Ordner nicht und darf nur in `/var/lib/meilisearch` schreiben.

### 14. systemd die neue Datei mitteilen

```bash
sudo systemctl daemon-reload
```

### 15. Dienst starten und für den Systemstart anmelden

`enable --now` erledigt beides auf einmal.

```bash
sudo systemctl enable --now meilisearch
```

### 16. Prüfen, ob der Dienst läuft

```bash
systemctl status meilisearch
```

**Prüfen:** In der Ausgabe steht `active (running)`. Beende die Anzeige mit <kbd>q</kbd>.

**Prüfen:** Die Startmeldung zeigt die wichtigsten Einstellungen.

```bash
sudo journalctl -u meilisearch | grep -E 'listening on|Environment|telemetry'
```

Unter den Zeilen stehen `Server listening on:` mit `"http://127.0.0.1:7700"`, `Environment:` mit `"production"` und `Anonymous telemetry:` mit `"Disabled"`.

## Schlüssel bereitstellen

### 17. Hauptschlüssel in einer Datei ablegen

Damit der Schlüssel nicht bei jedem Befehl abgetippt werden muss und nicht im Befehlsverlauf landet, kommt er in eine Datei, die nur du lesen darfst.

```bash
nano ~/.meilisearch-key
```

Füge die Zeichenfolge aus Schritt 10 ein (ohne Anführungszeichen), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 18. Datei schützen

```bash
chmod 600 ~/.meilisearch-key
```

### 19. Schlüssel für dieses Terminal laden

Die Umgebungsvariable `MEILI_KEY` gilt nur im aktuellen Terminal. Öffnest du ein neues Terminal, wiederholst du diesen Schritt.

```bash
export MEILI_KEY="$(cat ~/.meilisearch-key)"
```

### 20. Zugriff ohne Schlüssel testen

Die Adresse `/health` ist als einzige ohne Schlüssel erreichbar.

```bash
curl http://127.0.0.1:7700/health
```

**Prüfen:** Die Antwort lautet `{"status":"available"}`. Fragst du stattdessen `http://127.0.0.1:7700/indexes` ab, meldet Meilisearch `missing_authorization_header`.

### 21. Mitgelieferte Schlüssel anzeigen

Mit dem Hauptschlüssel legt Meilisearch einige Schlüssel mit eingeschränkten Rechten an. Der Kopf `Authorization: Bearer …` schickt den Schlüssel mit.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" http://127.0.0.1:7700/keys
```

**Prüfen:** In der Antwort stehen unter anderem `Default Search API Key` mit `"actions":["search"]` und `Default Admin API Key` mit `"actions":["*"]`. Den Suchschlüssel darf man in eine Website einbauen, denn er erlaubt nur das Suchen. Der Hauptschlüssel gehört nie in eine Website.

## Einen Bücherkatalog anlegen

### 22. Übungsordner anlegen

```bash
mkdir -p ~/meilisearch-uebung
```

### 23. In den Ordner wechseln

```bash
cd ~/meilisearch-uebung
```

### 24. Datei mit Büchern anlegen

```bash
nano buecher.json
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```json
[
  {"id": 1, "titel": "Effi Briest", "autor": "Theodor Fontane", "jahr": 1895, "gattung": "Roman", "inhalt": "Eine junge Frau wird früh mit einem viel älteren Beamten verheiratet und lebt einsam in einer Kleinstadt an der Ostsee."},
  {"id": 2, "titel": "Der Schimmelreiter", "autor": "Theodor Storm", "jahr": 1888, "gattung": "Novelle", "inhalt": "Ein ehrgeiziger Deichgraf an der Nordseeküste baut einen neuen Deich und kämpft gegen Sturmflut und Aberglauben."},
  {"id": 3, "titel": "Buddenbrooks", "autor": "Thomas Mann", "jahr": 1901, "gattung": "Roman", "inhalt": "Über vier Generationen verliert eine Lübecker Kaufmannsfamilie ihr Vermögen und ihren Zusammenhalt."},
  {"id": 4, "titel": "Der Zauberberg", "autor": "Thomas Mann", "jahr": 1924, "gattung": "Roman", "inhalt": "Ein junger Hamburger besucht seinen Vetter in einem Sanatorium in den Schweizer Bergen und bleibt sieben Jahre."},
  {"id": 5, "titel": "Emil und die Detektive", "autor": "Erich Kästner", "jahr": 1929, "gattung": "Kinderbuch", "inhalt": "Einem Jungen wird auf der Bahnfahrt nach Berlin Geld gestohlen, und eine Bande von Kindern jagt den Dieb."},
  {"id": 6, "titel": "Momo", "autor": "Michael Ende", "jahr": 1973, "gattung": "Kinderbuch", "inhalt": "Ein Mädchen, das gut zuhören kann, stellt sich grauen Herren entgegen, die den Menschen ihre Zeit stehlen."}
]
```

Jedes Buch ist ein *Dokument*. `id` ist die eindeutige Nummer, alle anderen Felder sind frei wählbar.

### 25. Bücher übertragen

Meilisearch legt den Index `buecher` beim ersten Übertragen selbst an. `primaryKey=id` sagt, welches Feld die eindeutige Nummer enthält.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" -H 'Content-Type: application/json' -X POST "http://127.0.0.1:7700/indexes/buecher/documents?primaryKey=id" --data-binary @buecher.json
```

**Prüfen:** Die Antwort enthält `"status":"enqueued"`. Meilisearch nimmt den Auftrag also an und arbeitet ihn im Hintergrund ab.

### 26. Auftrag kontrollieren

`/tasks` listet die Aufträge, `limit=1` zeigt nur den neuesten.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" "http://127.0.0.1:7700/tasks?limit=1"
```

**Prüfen:** Die Antwort enthält `"status":"succeeded"` und `"indexedDocuments":6`.

## Suchen

### 27. Mit Tippfehler suchen

`zauberbrg` fehlt ein Buchstabe. Meilisearch findet trotzdem das richtige Buch.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" -H 'Content-Type: application/json' -X POST http://127.0.0.1:7700/indexes/buecher/search -d '{"q": "zauberbrg"}'
```

**Prüfen:** Unter `hits` steht `Der Zauberberg`.

### 28. Nach einem Wortanfang suchen

Das letzte Suchwort wird auch als Wortanfang gesucht. So kann eine Website schon beim Tippen Treffer zeigen.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" -H 'Content-Type: application/json' -X POST http://127.0.0.1:7700/indexes/buecher/search -d '{"q": "nordsee"}'
```

**Prüfen:** Gefunden wird `Der Schimmelreiter`, weil im Inhalt `Nordseeküste` steht.

### 29. Fundstelle hervorheben lassen

`attributesToHighlight` markiert die gefundenen Wörter mit `<em>`, `attributesToRetrieve` beschränkt die Antwort auf den Titel.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" -H 'Content-Type: application/json' -X POST http://127.0.0.1:7700/indexes/buecher/search -d '{"q": "stehlen", "attributesToHighlight": ["inhalt"], "attributesToRetrieve": ["titel"]}'
```

**Prüfen:** Gefunden wird nur `Momo`, im Feld `_formatted` steht `<em>stehlen</em>`. „Emil und die Detektive“ fehlt, obwohl dort `gestohlen` steht: Meilisearch erkennt Tippfehler und Wortanfänge, bildet aber keine Grundformen von Wörtern.

## Filtern, sortieren und zählen

### 30. Filter ohne Einstellung versuchen

```bash
curl -H "Authorization: Bearer $MEILI_KEY" -H 'Content-Type: application/json' -X POST http://127.0.0.1:7700/indexes/buecher/search -d '{"q": "mann", "filter": "jahr > 1910"}'
```

**Prüfen:** Meilisearch meldet `Attribute 'jahr' is not filterable`. Felder, nach denen gefiltert oder sortiert werden soll, müssen vorher angemeldet werden.

### 31. Felder zum Filtern und Sortieren anmelden

`PATCH` ändert nur die genannten Einstellungen des Index.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" -H 'Content-Type: application/json' -X PATCH http://127.0.0.1:7700/indexes/buecher/settings -d '{"filterableAttributes": ["gattung", "jahr"], "sortableAttributes": ["jahr"]}'
```

**Prüfen:** Nach ein bis zwei Sekunden meldet der Befehl aus Schritt 26 für den neuen Auftrag `"type":"settingsUpdate"` und `"status":"succeeded"`.

### 32. Mit Filter suchen

Wiederhole den Befehl aus Schritt 30.

**Prüfen:** Jetzt erscheint nur `Der Zauberberg`. `Buddenbrooks` ist ebenfalls von Thomas Mann, erschien aber 1901.

### 33. Nach Gattung filtern und sortieren

Eine leere Suche `"q": ""` liefert alle Dokumente, die zum Filter passen. `jahr:desc` sortiert absteigend.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" -H 'Content-Type: application/json' -X POST http://127.0.0.1:7700/indexes/buecher/search -d '{"q": "", "filter": "gattung = Kinderbuch", "sort": ["jahr:desc"], "attributesToRetrieve": ["titel", "jahr"]}'
```

**Prüfen:** Erst kommt `Momo` mit 1973, dann `Emil und die Detektive` mit 1929.

### 34. Treffer je Gattung zählen

`facets` zählt, wie oft jeder Wert vorkommt. Websites zeigen damit z. B. „Roman (3)“ neben einem Auswahlkästchen. `limit: 0` lässt die Treffer selbst weg.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" -H 'Content-Type: application/json' -X POST http://127.0.0.1:7700/indexes/buecher/search -d '{"q": "", "facets": ["gattung"], "limit": 0}'
```

**Prüfen:** Unter `facetDistribution` steht `{"Kinderbuch":2,"Novelle":1,"Roman":3}`.

### 35. Ein Dokument löschen

Die Zahl am Ende der Adresse ist die `id` des Buchs.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" -X DELETE http://127.0.0.1:7700/indexes/buecher/documents/6
```

**Prüfen:** Die Angabe `numberOfDocuments` lautet danach `5`.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" http://127.0.0.1:7700/indexes/buecher/stats
```

## Sichern und wiederherstellen

### 36. Dump anlegen

Ein *Dump* ist eine Sicherung aller Indizes, Einstellungen und Schlüssel in einer einzigen Datei. Er lässt sich auch in eine neuere Meilisearch-Version einspielen und ist deshalb die richtige Sicherung vor einem Update.

```bash
curl -H "Authorization: Bearer $MEILI_KEY" -X POST http://127.0.0.1:7700/dumps
```

**Prüfen:** Nach ein paar Sekunden liegt im Ordner eine Datei mit Datum und Endung `.dump`, z. B. `20261002-193431469.dump`.

```bash
sudo ls -l /var/lib/meilisearch/dumps
```

Zum Einspielen startet man Meilisearch einmalig mit leerem Datenordner und der Option `--import-dump` und dem Pfad zur Datei. Das Vorgehen beschreibt die Herstellerdokumentation unter „Dumps“.

### 37. Datenordner sichern

Für eine schnelle Sicherung derselben Version reicht ein Archiv des Datenordners. Dazu muss der Dienst kurz angehalten werden.

```bash
sudo systemctl stop meilisearch
```

```bash
sudo tar -czf /var/backups/meilisearch.tar.gz -C /var/lib/meilisearch data
```

```bash
sudo systemctl start meilisearch
```

Zum Wiederherstellen hältst du den Dienst an, löschst den Ordner mit `sudo rm -r /var/lib/meilisearch/data`, packst das Archiv mit `sudo tar -xzf /var/backups/meilisearch.tar.gz -C /var/lib/meilisearch` wieder aus und startest den Dienst. **Achtung:** Alles, was nach der Sicherung geändert wurde, ist danach weg.

## Aktualisieren

1. Lege wie in Schritt 36 einen Dump an.
2. Wiederhole die Schritte 3 bis 6 mit der neuen Versionsnummer.
3. Starte den Dienst mit `sudo systemctl restart meilisearch` neu.
4. Prüfe mit `systemctl status meilisearch`, ob er läuft. Lehnt die neue Version die vorhandenen Daten ab, steht im Protokoll (`sudo journalctl -u meilisearch`) ein Hinweis. Dann spielst du den Dump aus Punkt 1 wie in der Herstellerdokumentation beschrieben ein.

## Optional: Autostart ausschalten

Wer Meilisearch nur ab und zu braucht, nimmt es aus dem Systemstart heraus und startet es bei Bedarf mit `sudo systemctl start meilisearch`.

```bash
sudo systemctl disable --now meilisearch
```

## Wie geht es weiter?

- **Suche in eine Website einbauen:** Die JavaScript-Bibliothek *instant-meilisearch* verbindet Meilisearch mit fertigen Suchfeldern und Trefferlisten. Im Browser wird dabei nur der Suchschlüssel aus Schritt 21 verwendet.
- **Aus Programmen zugreifen:** Es gibt offizielle Bibliotheken für [Python](python.md) (`meilisearch`), [PHP](php.md), [JavaScript](javascript.md), [Go](go.md), [Rust](rust.md) und weitere Sprachen.
- **Zugriff aus dem Netz:** Dann sollte ein [nginx](nginx.md) mit HTTPS vor Meilisearch stehen, und Meilisearch bleibt auf `127.0.0.1`.
- **Dokumentation:** <https://www.meilisearch.com/docs>

## Deinstallieren

### 1. Übungsordner und Schlüsseldatei löschen

```bash
rm -rf ~/meilisearch-uebung ~/.meilisearch-key
```

### 2. Dienst anhalten und abmelden

```bash
sudo systemctl disable --now meilisearch
```

### 3. Dienstdatei löschen

```bash
sudo rm /etc/systemd/system/meilisearch.service
```

### 4. systemd die Änderung mitteilen

```bash
sudo systemctl daemon-reload
```

### 5. Programm und Konfiguration löschen

```bash
sudo rm /usr/local/bin/meilisearch /etc/meilisearch.toml
```

### 6. Daten löschen

**Achtung:** Alle Indizes und Dumps sind danach unwiderruflich weg.

```bash
sudo rm -rf /var/lib/meilisearch
```

### 7. Systembenutzer entfernen

```bash
sudo userdel meilisearch
```

### 8. Sicherung löschen (optional)

```bash
sudo rm -f /var/backups/meilisearch.tar.gz
```

**Prüfen:** Der Befehl `meilisearch` wird nicht mehr gefunden.

```bash
meilisearch --version
```
