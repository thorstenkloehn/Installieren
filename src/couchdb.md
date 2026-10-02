# CouchDB

Apache CouchDB ist eine Dokumentdatenbank: Statt Tabellen mit festen Spalten speichert sie einzelne Dokumente im JSON-Format, die jeweils eigene Felder haben dürfen. Angesprochen wird CouchDB ausschließlich über HTTP, also mit denselben Mitteln wie eine Webseite. Dadurch reichen `curl` oder ein Browser zum Arbeiten. Eine besondere Stärke ist der Abgleich (*Replikation*) zwischen mehreren CouchDB-Servern oder mit Apps, die offline arbeiten und ihre Änderungen später zurückspielen.

## Vorbemerkungen

- **Warum nicht apt aus Ubuntu:** Ubuntu 26.04 enthält kein Paket für CouchDB. Das Apache-CouchDB-Projekt betreibt aber ein eigenes apt-Archiv mit Paketen für Ubuntu 26.04. Nach dem Einbinden installiert und aktualisiert `apt` CouchDB wie jedes andere Paket.
- **Warum nicht MongoDB:** MongoDB ist die bekanntere Dokumentdatenbank, bietet aber (Stand Oktober 2026) noch keinen Server für Ubuntu 26.04 an.
- **Nur lokal erreichbar:** Mit den Antworten aus Schritt 7 lauscht CouchDB nur auf `127.0.0.1`, Port **5984**. Andere Rechner im Netz erreichen den Dienst nicht.
- **Mit Passwort:** Bei der Installation wird der Verwalter `admin` mit einem Passwort angelegt. Ohne Anmeldung darf man danach nur die Begrüßung des Servers abrufen.
- **Version:** Getestet mit CouchDB **3.5.2** am 2. Oktober 2026.

## Paketquelle einbinden

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramme installieren

`wget` lädt den Schlüssel herunter, `curl` brauchst du später für die Arbeit mit CouchDB, `ca-certificates` enthält die Zertifikate für verschlüsselte Verbindungen. Meist sind alle drei schon vorhanden.

```bash
sudo apt install wget curl ca-certificates
```

### 3. Signaturschlüssel herunterladen

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich von der Apache Software Foundation stammen und unterwegs nicht verändert wurden. Der Schlüssel liegt als Text vor, mit der Endung `.asc` kann `apt` ihn direkt lesen.

```bash
sudo wget -O /etc/apt/keyrings/couchdb.asc https://couchdb.apache.org/repo/keys.asc
```

**Prüfen:** Die erste Zeile lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -n 1 /etc/apt/keyrings/couchdb.asc
```

### 4. Paketquelle eintragen

Legt eine neue Datei an, die `apt` als zusätzliche Paketquelle liest.

```bash
sudo nano /etc/apt/sources.list.d/couchdb.sources
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://apache.jfrog.io/artifactory/couchdb-deb
Suites: resolute
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/couchdb.asc
```

- `URIs` – Das Archiv liegt bei einem Dienstleister der Apache Software Foundation.
- `Suites: resolute` – der Bereich für Ubuntu 26.04. Den Codenamen deines Systems zeigt `grep VERSION_CODENAME /etc/os-release`.
- `Signed-By` – Pakete aus dieser Quelle werden nur mit dem Schlüssel aus Schritt 3 angenommen.

### 5. Paketlisten neu einlesen

Erst jetzt lädt `apt` das Paketverzeichnis von CouchDB herunter.

```bash
sudo apt update
```

**Prüfen:** Der Installationskandidat ist eine Version wie `3.5.2.1~resolute`.

```bash
apt policy couchdb
```

## Installation

### 6. Ein zufälliges Cookie erzeugen

CouchDB fragt bei der Installation nach einem *Cookie*. Das ist ein gemeinsames Geheimnis, mit dem sich mehrere CouchDB-Server eines Verbunds gegenseitig ausweisen. Auch ein einzelner Server braucht einen Wert. Dieser Befehl erzeugt eine zufällige Zeichenfolge aus 32 Zeichen:

```bash
openssl rand -hex 16
```

Lass die Ausgabe im Terminal stehen. Du kopierst sie im nächsten Schritt.

### 7. CouchDB installieren

Installiert CouchDB und eine JavaScript-Bibliothek, mit der CouchDB eigene Auswertungen ausführt.

```bash
sudo apt install couchdb
```

Während der Installation erscheinen nacheinander fünf Fragen auf Englisch. Mit <kbd>Tab</kbd> springst du auf **<Ok>**, mit <kbd>Enter</kbd> bestätigst du.

1. **General type of CouchDB configuration** – Wähle `standalone`. Damit läuft CouchDB als einzelner Server. `clustered` ist für einen Verbund aus mehreren Servern gedacht.
2. **CouchDB Erlang magic cookie** – Füge die Zeichenfolge aus Schritt 6 ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>).
3. **CouchDB interface bind address** – Lass `127.0.0.1` stehen. So ist CouchDB nur von diesem Rechner aus erreichbar.
4. **Password for the CouchDB "admin" user** – Gib ein eigenes, langes Passwort ein. Die Eingabe ist nicht zu sehen.
5. **Repeat password** – Gib dasselbe Passwort noch einmal ein.

Danach startet der Dienst sofort und künftig bei jedem Hochfahren.

### 8. Prüfen, ob der Dienst läuft

```bash
systemctl status couchdb
```

**Prüfen:** In der Ausgabe steht `active (running)`. Beende die Anzeige mit <kbd>q</kbd>.

### 9. Prüfen, dass CouchDB nur lokal lauscht

```bash
sudo ss -ltnp | grep -E 'beam|epmd'
```

**Prüfen:** Alle Zeilen enthalten `127.0.0.1` oder `[::1]`. Neben Port `5984` erscheinen Port `4369` und ein zufälliger hoher Port. Diese gehören zur Laufzeitumgebung Erlang, in der CouchDB geschrieben ist, und dienen der Verbindung zwischen Servern eines Verbunds.

### 10. Begrüßung abrufen

Diese Adresse ist auch ohne Anmeldung erreichbar.

```bash
curl http://127.0.0.1:5984/
```

**Prüfen:** Die Antwort beginnt mit `{"couchdb":"Welcome","version":"3.5.2"`.

## Anmeldedaten hinterlegen

Jeder weitere Aufruf braucht Benutzer und Passwort. Damit das Passwort nicht bei jedem Befehl auf dem Bildschirm und im Befehlsverlauf landet, legst du es in einer Datei ab, die nur du lesen darfst.

### 11. Datei anlegen

```bash
nano ~/.couchdb-netrc
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>) und ersetze `DEIN-PASSWORT` durch das Passwort aus Schritt 7. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

```text
machine 127.0.0.1
login admin
password DEIN-PASSWORT
```

Das Format heißt *netrc*. `curl` sucht darin nach der Zeile `machine` mit der aufgerufenen Adresse und meldet sich mit `login` und `password` an.

### 12. Datei schützen

Nur du darfst die Datei lesen und ändern.

```bash
chmod 600 ~/.couchdb-netrc
```

### 13. Anmeldung testen

`--netrc-file` nennt `curl` die Datei mit den Anmeldedaten. `_all_dbs` listet alle Datenbanken auf.

```bash
curl --netrc-file ~/.couchdb-netrc http://127.0.0.1:5984/_all_dbs
```

**Prüfen:** Die Antwort lautet `["_replicator","_users"]`. Diese beiden Datenbanken legt CouchDB für sich selbst an. Ohne `--netrc-file` antwortet CouchDB mit `You are not a server admin.`

## Eine Gartendatenbank anlegen

Das Beispiel verwaltet die Pflanzen eines kleinen Gartens. Jede Pflanze ist ein Dokument mit Name, Art, Beet und dem Monat der Aussaat.

### 14. Übungsordner anlegen

```bash
mkdir -p ~/couchdb-uebung
```

### 15. In den Ordner wechseln

```bash
cd ~/couchdb-uebung
```

### 16. Datenbank anlegen

In CouchDB legt ein `PUT` auf eine neue Adresse etwas an. Hier entsteht die Datenbank `garten`.

```bash
curl --netrc-file ~/.couchdb-netrc -X PUT http://127.0.0.1:5984/garten
```

**Prüfen:** Die Antwort lautet `{"ok":true}`. Ein zweiter Aufruf liefert den Fehler `file_exists`.

### 17. Datei mit den Pflanzen anlegen

```bash
nano garten.json
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```json
{"docs": [
  {"_id": "tomate",     "name": "Tomate",     "art": "Gemüse",  "beet": "Süd",  "aussaat": 3},
  {"_id": "zucchini",   "name": "Zucchini",   "art": "Gemüse",  "beet": "Süd",  "aussaat": 4},
  {"_id": "moehre",     "name": "Möhre",      "art": "Gemüse",  "beet": "Nord", "aussaat": 4},
  {"_id": "basilikum",  "name": "Basilikum",  "art": "Kräuter", "beet": "Süd",  "aussaat": 4},
  {"_id": "petersilie", "name": "Petersilie", "art": "Kräuter", "beet": "Nord", "aussaat": 3}
]}
```

`_id` ist die eindeutige Kennung eines Dokuments. Fehlt sie, vergibt CouchDB selbst eine lange Zufallskennung. Alle anderen Felder sind frei wählbar.

### 18. Alle Pflanzen auf einmal speichern

`_bulk_docs` nimmt mehrere Dokumente in einem Aufruf an. `-d @garten.json` schickt den Inhalt der Datei mit, `Content-Type` sagt CouchDB, dass es sich um JSON handelt.

```bash
curl --netrc-file ~/.couchdb-netrc -X POST http://127.0.0.1:5984/garten/_bulk_docs -H 'Content-Type: application/json' -d @garten.json
```

**Prüfen:** Die Antwort enthält fünfmal `"ok":true`, jeweils mit `id` und `rev`.

### 19. Ein Dokument lesen

Jedes Dokument hat eine eigene Adresse aus Datenbank und Kennung.

```bash
curl --netrc-file ~/.couchdb-netrc http://127.0.0.1:5984/garten/tomate
```

**Prüfen:** Die Antwort enthält die Felder aus Schritt 17 und zusätzlich `_rev`, z. B. `"_rev":"1-bf55…"`. Das ist die *Revision*: Die Zahl vor dem Bindestrich zählt die Änderungen, der Rest ist eine Prüfsumme.

### 20. Ändern ohne Revision versuchen

Die Tomate soll schon im Februar (Monat 2) ausgesät werden. Ein `PUT` auf die Adresse des Dokuments ersetzt es vollständig.

```bash
curl --netrc-file ~/.couchdb-netrc -X PUT http://127.0.0.1:5984/garten/tomate -H 'Content-Type: application/json' -d '{"name": "Tomate", "art": "Gemüse", "beet": "Süd", "aussaat": 2}'
```

**Prüfen:** CouchDB lehnt mit `Document update conflict` ab. Wer ein Dokument ändern will, muss angeben, welche Revision er geändert hat. So kann niemand versehentlich die Änderung eines anderen überschreiben, die zwischen Lesen und Schreiben gespeichert wurde.

### 21. Ändern mit Revision

Ersetze `REVISION` durch den Wert von `_rev` aus Schritt 19, z. B. `1-bf5583091cf9b529c7ed1ae4dd02a367`.

```bash
curl --netrc-file ~/.couchdb-netrc -X PUT http://127.0.0.1:5984/garten/tomate -H 'Content-Type: application/json' -d '{"_rev": "REVISION", "name": "Tomate", "art": "Gemüse", "beet": "Süd", "aussaat": 2}'
```

**Prüfen:** Die Antwort enthält `"ok":true` und eine neue Revision, die mit `2-` beginnt.

## Abfragen

### 22. Nach einem Feld suchen

`_find` sucht mit der Abfragesprache *Mango*. Im `selector` steht, welche Werte ein Dokument haben muss, `fields` wählt die Felder der Antwort aus.

```bash
curl --netrc-file ~/.couchdb-netrc -X POST http://127.0.0.1:5984/garten/_find -H 'Content-Type: application/json' -d '{"selector": {"art": "Kräuter"}, "fields": ["name", "beet"]}'
```

**Prüfen:** Es erscheinen Basilikum und Petersilie. Darunter steht der Hinweis `No matching index found`: CouchDB musste alle Dokumente durchsehen. Bei fünf Pflanzen ist das egal, bei Millionen Dokumenten nicht.

### 23. Sortiert suchen

`$lt` bedeutet „kleiner als“. Gesucht sind alle Pflanzen, die vor April ausgesät werden, sortiert nach Monat.

```bash
curl --netrc-file ~/.couchdb-netrc -X POST http://127.0.0.1:5984/garten/_find -H 'Content-Type: application/json' -d '{"selector": {"aussaat": {"$lt": 4}}, "fields": ["name", "aussaat"], "sort": [{"aussaat": "asc"}]}'
```

**Prüfen:** CouchDB antwortet mit dem Fehler `no_usable_index`. Zum Sortieren braucht CouchDB einen Index über das Feld.

### 24. Index anlegen

Der Index ordnet die Dokumente nach dem Feld `aussaat`.

```bash
curl --netrc-file ~/.couchdb-netrc -X POST http://127.0.0.1:5984/garten/_index -H 'Content-Type: application/json' -d '{"index": {"fields": ["aussaat"]}, "name": "nach-aussaat"}'
```

**Prüfen:** Die Antwort enthält `"result":"created"`. Wiederhole jetzt den Befehl aus Schritt 23: Es erscheinen die Tomate mit Monat 2 und die Petersilie mit Monat 3.

### 25. Datei für eine Auswertung anlegen

Für Auswertungen wie „wie viele Pflanzen stehen in jedem Beet?“ nutzt CouchDB *Views*. Ein View besteht aus einer kleinen JavaScript-Funktion, die CouchDB für jedes Dokument ausführt. Views werden in einem besonderen Dokument gespeichert, dem *Design-Dokument*.

```bash
nano auswertung.json
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```json
{
  "views": {
    "nach_beet": {
      "map": "function (doc) { if (doc.beet) { emit(doc.beet, doc.name); } }",
      "reduce": "_count"
    }
  }
}
```

- `map` – Die Funktion gibt für jedes Dokument mit einem Beet ein Paar aus: das Beet als Schlüssel und den Namen als Wert.
- `reduce` – `_count` ist eine eingebaute Funktion, die die Paare je Schlüssel zählt.

### 26. Design-Dokument speichern

Design-Dokumente beginnen immer mit `_design/`.

```bash
curl --netrc-file ~/.couchdb-netrc -X PUT http://127.0.0.1:5984/garten/_design/auswertung -H 'Content-Type: application/json' -d @auswertung.json
```

**Prüfen:** Die Antwort enthält `"ok":true`.

### 27. Pflanzen je Beet zählen

`group=true` fasst die Ergebnisse je Schlüssel zusammen. Die Adresse steht in Anführungszeichen, weil die Shell das Zeichen `?` sonst selbst auswerten würde.

```bash
curl --netrc-file ~/.couchdb-netrc "http://127.0.0.1:5984/garten/_design/auswertung/_view/nach_beet?group=true"
```

**Prüfen:** Die Antwort lautet `{"key":"Nord","value":2}` und `{"key":"Süd","value":3}`.

### 28. Pflanzen eines Beets auflisten

`reduce=false` schaltet das Zählen ab und zeigt die einzelnen Paare. `-G` hängt die Angaben an die Adresse an, `--data-urlencode` wandelt dabei das `ü` und die Anführungszeichen in eine für Adressen erlaubte Form um.

```bash
curl --netrc-file ~/.couchdb-netrc -G http://127.0.0.1:5984/garten/_design/auswertung/_view/nach_beet --data-urlencode 'key="Süd"' -d reduce=false
```

**Prüfen:** Es erscheinen Basilikum, Tomate und Zucchini.

### 29. Revision der Zucchini abfragen

Auch zum Löschen braucht CouchDB die aktuelle Revision.

```bash
curl --netrc-file ~/.couchdb-netrc http://127.0.0.1:5984/garten/zucchini
```

### 30. Dokument löschen

Ersetze `REVISION` durch den Wert von `_rev` aus Schritt 29.

```bash
curl --netrc-file ~/.couchdb-netrc -X DELETE "http://127.0.0.1:5984/garten/zucchini?rev=REVISION"
```

**Prüfen:** Rufst du Schritt 29 noch einmal auf, antwortet CouchDB mit `{"error":"not_found","reason":"deleted"}`. CouchDB merkt sich gelöschte Dokumente, damit die Löschung bei einer Replikation auch auf anderen Servern ankommt.

## Weboberfläche Fauxton

### 31. Fauxton öffnen

CouchDB bringt die Weboberfläche *Fauxton* mit. Dort lassen sich Datenbanken, Dokumente und Views ansehen und bearbeiten. Öffne im Browser diese Adresse:

```text
http://127.0.0.1:5984/_utils/
```

Melde dich bei „Log In to CouchDB“ mit dem Benutzer `admin` und dem Passwort aus Schritt 7 an.

**Prüfen:** In der Liste der Datenbanken erscheint `garten`. Ein Klick darauf zeigt die gespeicherten Pflanzen.

## Sichern und wiederherstellen

CouchDB speichert alle Datenbanken als Dateien in `/var/lib/couchdb`. Bei angehaltenem Dienst lässt sich der Ordner einfach als Archiv sichern.

### 32. Dienst anhalten

```bash
sudo systemctl stop couchdb
```

### 33. Sicherung anlegen

`tar` packt den Ordner in eine Archivdatei. `-C /var/lib` wechselt vorher in den Elternordner, damit im Archiv nur `couchdb/…` steht und nicht der ganze Pfad.

```bash
sudo tar -czf /var/backups/couchdb.tar.gz -C /var/lib couchdb
```

**Prüfen:** Die Datei ist vorhanden.

```bash
ls -l /var/backups/couchdb.tar.gz
```

### 34. Dienst wieder starten

```bash
sudo systemctl start couchdb
```

Zum Wiederherstellen hältst du den Dienst an, löschst den Ordner mit `sudo rm -r /var/lib/couchdb`, packst das Archiv mit `sudo tar -xzf /var/backups/couchdb.tar.gz -C /var/lib` wieder aus und startest den Dienst. `tar` stellt dabei auch den Besitzer `couchdb` der Dateien wieder her. **Achtung:** Alles, was nach der Sicherung gespeichert wurde, ist danach weg.

## Optional: Autostart ausschalten

Wer CouchDB nur ab und zu braucht, nimmt es aus dem Systemstart heraus und startet es bei Bedarf mit `sudo systemctl start couchdb`.

```bash
sudo systemctl disable --now couchdb
```

## Wie geht es weiter?

- **Eigene Benutzer:** Für Anwendungen sollte man nicht den Verwalter `admin` verwenden, sondern eigene Benutzer in der Datenbank `_users` anlegen und ihnen in den Einstellungen einer Datenbank (*Permissions* in Fauxton) Rechte geben.
- **Replikation:** Mit `_replicate` oder in Fauxton unter „Replication“ gleicht CouchDB Datenbanken zwischen Servern ab, einmalig oder dauerhaft. Die JavaScript-Bibliothek PouchDB nutzt dasselbe Verfahren, damit Web-Apps offline arbeiten können.
- **Zugriff aus dem Netz:** Dann sollte ein [nginx](nginx.md) mit HTTPS vor CouchDB stehen, und CouchDB bleibt auf `127.0.0.1`.
- **Volltextsuche:** Das Zusatzpaket `couchdb-nouveau` aus demselben Archiv ergänzt eine Volltextsuche. Es braucht Java 21.
- **Dokumentation:** Das Handbuch steht unter <https://docs.couchdb.org/en/stable/>.

## Deinstallieren

### 1. Übungsordner und Anmeldedatei löschen

```bash
rm -rf ~/couchdb-uebung ~/.couchdb-netrc
```

### 2. CouchDB entfernen

```bash
sudo apt purge couchdb
```

Beim Entfernen fragt ein Dialog **„Remove all CouchDB databases?“**. Voreingestellt ist **<No>**: Die Datenbanken in `/var/lib/couchdb` bleiben liegen und stehen bei einer neuen Installation wieder zur Verfügung. Wer alles löschen will, wählt mit <kbd>Tab</kbd> **<Yes>** und bestätigt mit <kbd>Enter</kbd>. Dann werden auch der Systembenutzer `couchdb` und seine Gruppe entfernt. Die Konfiguration in `/opt/couchdb/etc` und die Protokolle löscht `purge` in jedem Fall.

### 3. Übrige Abhängigkeiten entfernen

Entfernt die JavaScript-Bibliothek, die nur für CouchDB installiert wurde. `apt` listet die Pakete auf und fragt vor dem Löschen nach. Ist ein Paket dabei, das du noch brauchst, brich mit <kbd>n</kbd> ab.

```bash
sudo apt autoremove --purge
```

### 4. Paketquelle und Schlüssel löschen

```bash
sudo rm /etc/apt/sources.list.d/couchdb.sources /etc/apt/keyrings/couchdb.asc
```

### 5. Paketlisten aktualisieren

Danach kennt `apt` die Pakete von CouchDB nicht mehr.

```bash
sudo apt update
```

### 6. Sicherung löschen (optional)

**Achtung:** Danach lassen sich die Daten nicht mehr wiederherstellen.

```bash
sudo rm /var/backups/couchdb.tar.gz
```

**Prüfen:** Der Dienst ist unbekannt.

```bash
systemctl status couchdb
```

Die Ausgabe lautet `Unit couchdb.service could not be found.`
