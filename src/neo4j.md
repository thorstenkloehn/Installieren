# Neo4j

Neo4j ist eine Graphdatenbank: Sie speichert Dinge als Knoten und die Beziehungen zwischen ihnen als eigene Verbindungen mit Richtung und Eigenschaften. Das passt gut zu Daten, bei denen vor allem die Zusammenhänge zählen, etwa Verkehrsnetze, Stammbäume, Abhängigkeiten zwischen Programmteilen oder Wissensnetze. Abgefragt wird Neo4j mit der Sprache Cypher, in der man Muster aus Knoten und Pfeilen fast wie eine Skizze hinschreibt. Diese Anleitung installiert die freie Community Edition, sichert sie ab und baut ein kleines Bahnnetz als Beispiel.

## Vorbemerkungen

- **Warum nicht apt aus Ubuntu:** Ubuntu 26.04 enthält kein Paket für Neo4j. Neo4j betreibt aber ein eigenes apt-Archiv. Nach dem Einbinden installiert und aktualisiert `apt` Neo4j wie jedes andere Paket.
- **Community Edition:** Das Paket `neo4j` ist die freie Ausgabe unter der Lizenz GPLv3. Das Paket `neo4j-enterprise` aus demselben Archiv ist kostenpflichtig und wird hier nicht gebraucht.
- **Java:** Neo4j ist in Java geschrieben und läuft nur mit **Java 21 oder 25**. Das Paket zieht Java 21 automatisch mit. Ist auf dem Rechner eine neuere Java-Version als Standard eingestellt (z. B. Java 26 aus der Anleitung [Java](java.md)), würde Neo4j mit dieser starten. Schritt 13 legt deshalb fest, dass der Dienst immer Java 21 nimmt.
- **Nur lokal erreichbar:** Neo4j lauscht nach der Installation nur auf `127.0.0.1`. Port **7687** ist für Programme und die Kommandozeile (Protokoll *Bolt*), Port **7474** für die Weboberfläche *Neo4j Browser*.
- **Datenübertragung abschalten:** Neo4j schickt in der Grundeinstellung anonyme Nutzungsdaten an den Hersteller und meldet sich per Rundruf im lokalen Netz. Schritt 11 schaltet beides vor dem ersten Start ab.
- **Version:** Getestet mit Neo4j **2026.09.0** am 2. Oktober 2026.

## Paketquelle einbinden

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramme installieren

`wget` lädt den Schlüssel herunter, `ca-certificates` enthält die Zertifikate für die verschlüsselte Verbindung zum Archiv. Meist sind beide schon vorhanden.

```bash
sudo apt install wget ca-certificates
```

### 3. Signaturschlüssel herunterladen

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich von Neo4j stammen und unterwegs nicht verändert wurden. Der Ordner `/etc/apt/keyrings` ist unter Ubuntu für selbst hinzugefügte Schlüssel gedacht. Der Schlüssel liegt als Text vor, mit der Endung `.asc` kann `apt` ihn direkt lesen.

```bash
sudo wget -O /etc/apt/keyrings/neo4j.asc https://debian.neo4j.com/neotechnology.gpg.key
```

**Prüfen:** Die erste Zeile lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -n 1 /etc/apt/keyrings/neo4j.asc
```

### 4. Paketquelle eintragen

Legt eine neue Datei an, die `apt` als zusätzliche Paketquelle liest.

```bash
sudo nano /etc/apt/sources.list.d/neo4j.sources
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://debian.neo4j.com
Suites: stable
Components: latest
Architectures: amd64
Signed-By: /etc/apt/keyrings/neo4j.asc
```

- `Suites: stable` – Das Archiv von Neo4j ist nicht nach Ubuntu-Versionen aufgeteilt, alle Systeme nutzen denselben Bereich.
- `Components: latest` – Immer die neueste Neo4j-Version. Wer bei der älteren Reihe 5 bleiben muss, schreibt hier `5`.
- `Signed-By` – Pakete aus dieser Quelle werden nur mit dem Schlüssel aus Schritt 3 angenommen.

### 5. Paketlisten neu einlesen

Erst jetzt lädt `apt` das Paketverzeichnis von Neo4j herunter.

```bash
sudo apt update
```

**Prüfen:** In der Ausgabe erscheint eine Zeile mit `https://debian.neo4j.com stable InRelease`, und der Installationskandidat ist eine Version wie `1:2026.09.0`.

```bash
apt policy neo4j
```

## Installation

### 6. Neo4j installieren

Installiert den Server, die Kommandozeile `cypher-shell` und Java 21. Das Paket meldet den Dienst für den Systemstart an, startet ihn aber noch nicht. So bleibt Zeit, ihn vorher einzurichten.

```bash
sudo apt install neo4j
```

### 7. Version prüfen

```bash
neo4j --version
```

**Prüfen:** Es erscheint die Versionsnummer, z. B. `2026.09.0`. Steht darüber eine Warnung zu einer nicht unterstützten Java-Version, ist das an dieser Stelle harmlos. Für den Dienst wird das in Schritt 13 gelöst.

## Vor dem ersten Start einrichten

### 8. Konfigurationsdatei öffnen

Die Einstellungen von Neo4j stehen in `/etc/neo4j/neo4j.conf`.

```bash
sudo nano /etc/neo4j/neo4j.conf
```

### 9. An das Ende der Datei springen

Drücke <kbd>Strg</kbd>+<kbd>Ende</kbd>. Der Cursor steht dann unter dem letzten Abschnitt „Other Neo4j system properties“.

### 10. Leerzeile einfügen

Drücke <kbd>Enter</kbd>, damit die neuen Zeilen vom bisherigen Text abgesetzt sind.

### 11. Datenübertragung abschalten

Füge diese drei Zeilen ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
dbms.usage_report.enabled=false
dbms.fleet_manager.enabled=false
server.fleet_discovery.enabled=false
```

- `dbms.usage_report.enabled=false` – Neo4j schickt keine anonymen Nutzungsdaten mehr an den Hersteller.
- `dbms.fleet_manager.enabled=false` – Schaltet die Anbindung an die Überwachung im Cloud-Dienst von Neo4j ab.
- `server.fleet_discovery.enabled=false` – Neo4j sendet keine Rundrufe mehr ins lokale Netz, mit denen sich Server gegenseitig finden.

### 12. Ordner für die Dienst-Ergänzung anlegen

Die Einstellung für Java gehört in eine Ergänzungsdatei (*Drop-in*) zum Dienst. So bleibt die Dienstdatei aus dem Paket unverändert und wird bei einem Update nicht überschrieben.

```bash
sudo mkdir -p /etc/systemd/system/neo4j.service.d
```

### 13. Java 21 für den Dienst festlegen

```bash
sudo nano /etc/systemd/system/neo4j.service.d/override.conf
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
[Service]
Environment=JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
```

`JAVA_HOME` zeigt auf das Java 21 aus Schritt 6. Das Startskript von Neo4j nimmt dann dieses Java, egal welche Version der Befehl `java` gerade startet.

### 14. systemd die Änderung mitteilen

systemd liest Dienstdateien nur beim Start oder auf Anweisung neu ein.

```bash
sudo systemctl daemon-reload
```

### 15. Dienst starten

```bash
sudo systemctl start neo4j
```

### 16. Prüfen, ob der Dienst läuft

Der Start dauert einige Sekunden.

```bash
systemctl status neo4j
```

**Prüfen:** In der Ausgabe steht `active (running)`, und weiter unten erscheinen nach kurzer Zeit die Zeilen `Bolt enabled on localhost:7687` und `Started.`. Beende die Anzeige mit <kbd>q</kbd>.

### 17. Prüfen, dass Neo4j nur lokal lauscht

```bash
sudo ss -ltnp | grep java
```

**Prüfen:** Es erscheinen zwei Zeilen mit `127.0.0.1:7474` und `127.0.0.1:7687` (davor kann `[::ffff:` stehen). Steht dort `0.0.0.0` oder `*`, wäre Neo4j aus dem Netz erreichbar.

### 18. Prüfen, welches Java läuft

```bash
sudo journalctl -u neo4j | grep -i "unsupported"
```

**Prüfen:** Der Befehl gibt nichts aus. Erscheint eine Warnung zu einer nicht unterstützten Java-Version, stimmt der Pfad in Schritt 13 nicht oder Schritt 14 wurde ausgelassen.

## Erste Anmeldung

### 19. Kommandozeile öffnen

Neo4j legt den Benutzer `neo4j` mit dem Passwort `neo4j` an. Dieses Passwort gilt nur für die erste Anmeldung und muss sofort geändert werden.

```bash
cypher-shell -u neo4j
```

Bei `password:` gibst du `neo4j` ein. Die Eingabe ist nicht zu sehen.

### 20. Neues Passwort festlegen

Es erscheint `Password change required`. Gib bei `new password:` ein eigenes Passwort mit mindestens 8 Zeichen ein und wiederhole es bei `confirm password:`.

**Prüfen:** Es erscheint `Connected to Neo4j … as user neo4j.` und darunter eine Eingabezeile.

Steht ganz oben `You are using an unsupported version of the Java runtime`, ist eine neuere Java-Version als Standard eingestellt. `cypher-shell` funktioniert trotzdem, die Meldung kann man übergehen.

### 21. Kommandozeile verlassen

```text
:exit
```

## Ein kleines Bahnnetz anlegen

Das Beispiel legt einige Bahnhöfe zwischen Hamburg und Lübeck als Knoten an. Die Fahrten zwischen ihnen werden Beziehungen mit der Fahrzeit in Minuten.

Ein paar Begriffe aus Cypher:

- `(a:Ort {name: 'Ahrensburg'})` – ein Knoten mit dem Etikett (*Label*) `Ort` und der Eigenschaft `name`. Der Buchstabe `a` ist ein Platzhalter, über den man den Knoten in derselben Anweisung wieder ansprechen kann.
- `-[:FAEHRT_NACH {minuten: 6}]->` – eine Beziehung vom Typ `FAEHRT_NACH` mit Richtung und einer Eigenschaft.
- `CREATE` legt an, `MATCH` sucht nach einem Muster, `RETURN` gibt das Ergebnis aus.

### 22. Übungsordner anlegen

```bash
mkdir -p ~/neo4j-uebung
```

### 23. In den Ordner wechseln

```bash
cd ~/neo4j-uebung
```

### 24. Datei mit dem Beispielnetz anlegen

```bash
nano bahn.cypher
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```cypher
CREATE CONSTRAINT ort_name IF NOT EXISTS
FOR (o:Ort) REQUIRE o.name IS UNIQUE;

CREATE (ahr:Ort {name: 'Ahrensburg'}),
       (barg:Ort {name: 'Bargteheide'}),
       (bad:Ort {name: 'Bad Oldesloe'}),
       (hh:Ort {name: 'Hamburg Hbf'}),
       (wand:Ort {name: 'Hamburg-Wandsbek'}),
       (hl:Ort {name: 'Lübeck Hbf'}),
       (hh)-[:FAEHRT_NACH {minuten: 9}]->(wand),
       (wand)-[:FAEHRT_NACH {minuten: 10}]->(ahr),
       (ahr)-[:FAEHRT_NACH {minuten: 6}]->(barg),
       (barg)-[:FAEHRT_NACH {minuten: 8}]->(bad),
       (bad)-[:FAEHRT_NACH {minuten: 15}]->(hl),
       (hh)-[:FAEHRT_NACH {minuten: 40}]->(hl);
```

- Der erste Befehl sorgt dafür, dass jeder Ortsname nur einmal vorkommen darf. Gleichzeitig legt Neo4j dafür einen Index an, über den Orte schnell gefunden werden.
- Der zweite Befehl legt sechs Orte und sechs Verbindungen in einem Rutsch an. Die Fahrzeiten sind ausgedachte Beispielwerte.

### 25. Datei ausführen

`-f` liest die Befehle aus der Datei. Danach fragt `cypher-shell` nach dem Passwort aus Schritt 20.

```bash
cypher-shell -u neo4j -f bahn.cypher
```

**Prüfen:** Es erscheint keine Fehlermeldung. Bei einem zweiten Aufruf meldet Neo4j dagegen einen Fehler mit `property uniqueness constraint violated`, weil es `Ahrensburg` schon gibt. Die Regel aus dem ersten Befehl wirkt also.

## Abfragen

### 26. Kommandozeile öffnen

```bash
cypher-shell -u neo4j
```

Jede Anweisung endet mit einem Semikolon. Erst dann führt `cypher-shell` sie aus.

### 27. Alle Orte anzeigen

```cypher
MATCH (o:Ort) RETURN o.name ORDER BY o.name;
```

**Prüfen:** Es erscheinen sechs Orte in alphabetischer Reihenfolge.

### 28. Alle Verbindungen anzeigen

Das Muster beschreibt zwei Orte, zwischen denen ein Pfeil vom Typ `FAEHRT_NACH` liegt.

```cypher
MATCH (a:Ort)-[f:FAEHRT_NACH]->(b:Ort)
RETURN a.name AS von, b.name AS nach, f.minuten AS minuten;
```

**Prüfen:** Die Tabelle hat sechs Zeilen, darunter `"Ahrensburg" | "Bargteheide" | 6`.

### 29. Erreichbare Orte finden

`*1..3` bedeutet: ein bis drei Verbindungen hintereinander. So findet die Abfrage alle Orte, die von Ahrensburg aus mit höchstens drei Fahrten erreichbar sind.

```cypher
MATCH (:Ort {name: 'Ahrensburg'})-[:FAEHRT_NACH*1..3]->(ziel)
RETURN DISTINCT ziel.name AS erreichbar;
```

**Prüfen:** Es erscheinen `Bargteheide`, `Bad Oldesloe` und `Lübeck Hbf`. Hamburg fehlt, weil die Pfeile nur in eine Richtung zeigen.

### 30. Alle Wege mit Fahrzeit vergleichen

`->+` steht für eine oder beliebig viele Verbindungen. `reduce` addiert die Minuten aller Abschnitte eines Weges.

```cypher
MATCH p = (:Ort {name: 'Hamburg Hbf'})-[:FAEHRT_NACH]->+(:Ort {name: 'Lübeck Hbf'})
RETURN [o IN nodes(p) | o.name] AS weg,
       reduce(summe = 0, f IN relationships(p) | summe + f.minuten) AS minuten
ORDER BY minuten;
```

**Prüfen:** Es erscheinen zwei Wege: die direkte Verbindung mit 40 Minuten und der Weg über Wandsbek, Ahrensburg, Bargteheide und Bad Oldesloe mit 48 Minuten.

### 31. Einem Ort eine Eigenschaft hinzufügen

`SET` ändert oder ergänzt Eigenschaften. Neue Eigenschaften müssen vorher nirgends angemeldet werden.

```cypher
MATCH (o:Ort {name: 'Bad Oldesloe'}) SET o.kreisstadt = true RETURN o;
```

**Prüfen:** Die Ausgabe zeigt `(:Ort {kreisstadt: TRUE, name: "Bad Oldesloe"})`.

### 32. Einen Ort samt Verbindungen löschen

Ein Knoten mit Beziehungen lässt sich nur zusammen mit diesen löschen. Das erledigt `DETACH DELETE`.

```cypher
MATCH (o:Ort {name: 'Hamburg-Wandsbek'}) DETACH DELETE o;
```

### 33. Knoten zählen

```cypher
MATCH (n) RETURN count(n) AS knoten;
```

**Prüfen:** Das Ergebnis ist `5`.

### 34. Kommandozeile verlassen

```text
:exit
```

## Weboberfläche Neo4j Browser

### 35. Browser öffnen

Neo4j bringt eine Weboberfläche mit, die Ergebnisse auch als Grafik mit Kreisen und Pfeilen zeigt. Öffne im Browser diese Adresse:

```text
http://localhost:7474/browser/
```

Es erscheint das Fenster „Connect to instance“. Die Adresse `neo4j://localhost:7687` und der Benutzer `neo4j` sind schon eingetragen. Gib bei „Password“ das Passwort aus Schritt 20 ein und klicke auf **Connect**.

**Prüfen:** Gib oben in die Eingabezeile `MATCH (o:Ort)-[f]->(z) RETURN o, f, z` ein und starte die Abfrage mit <kbd>Enter</kbd> oder dem Startknopf daneben. Das Bahnnetz erscheint als Grafik.

## Sichern und wiederherstellen

Die Community Edition kann eine Datenbank nur sichern, während der Dienst angehalten ist. Die Sicherung ist eine einzelne Datei.

### 36. Dienst anhalten

```bash
sudo systemctl stop neo4j
```

### 37. Ordner für Sicherungen anlegen

Die Sicherung schreibt der Benutzer `neo4j`, deshalb gehört ihm auch der Ordner.

```bash
sudo install -d -o neo4j -g neo4j /var/backups/neo4j
```

### 38. Sicherung anlegen

`neo4j-admin` ist das Verwaltungsprogramm. `database dump neo4j` sichert die Datenbank mit dem Namen `neo4j`, in der die Beispieldaten liegen. `sudo -u neo4j` führt den Befehl als Benutzer `neo4j` aus, damit die Dateirechte stimmen. `JAVA_HOME` sorgt wie in Schritt 13 für Java 21.

```bash
sudo -u neo4j JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 neo4j-admin database dump neo4j --to-path=/var/backups/neo4j
```

**Prüfen:** Die letzte Zeile lautet `Dump completed successfully`, und im Ordner liegt die Datei `neo4j.dump`.

```bash
ls -l /var/backups/neo4j
```

### 39. Dienst wieder starten

```bash
sudo systemctl start neo4j
```

Zum Wiederherstellen hältst du den Dienst an und spielst die Datei mit `load` zurück. `--overwrite-destination=true` ersetzt dabei den aktuellen Inhalt der Datenbank vollständig:

```bash
sudo -u neo4j JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 neo4j-admin database load neo4j --from-path=/var/backups/neo4j --overwrite-destination=true
```

Danach den Dienst wieder starten.

## Optional: Autostart ausschalten

Neo4j belegt mit Java schnell ein bis zwei Gigabyte Arbeitsspeicher. Wer es nur ab und zu braucht, nimmt es aus dem Systemstart heraus und startet es bei Bedarf mit `sudo systemctl start neo4j`.

```bash
sudo systemctl disable --now neo4j
```

## Wie geht es weiter?

- **Arbeitsspeicher begrenzen:** In `/etc/neo4j/neo4j.conf` lassen sich mit `server.memory.heap.max_size` und `server.memory.pagecache.size` feste Grenzen setzen. Ohne diese Angaben richtet sich Neo4j nach dem vorhandenen Arbeitsspeicher.
- **Aus Programmen zugreifen:** Neo4j bietet offizielle Treiber für [Python](python.md), [Java](java.md), [JavaScript](javascript.md), [Go](go.md) und .NET. In Python installiert man den Treiber in einer virtuellen Umgebung mit `pip install neo4j`.
- **Schlüssel läuft ab:** Der Signaturschlüssel von Neo4j ist bis Ende 2026 gültig. Meldet `sudo apt update` später einen abgelaufenen Schlüssel (`EXPKEYSIG`), lädst du ihn mit Schritt 3 neu herunter.
- **Andere Art von Graph:** Für Wissensnetze nach dem Standard RDF mit der Abfragesprache SPARQL gibt es [Apache Jena Fuseki](fuseki.md).
- **Dokumentation:** Das Handbuch zu Cypher steht unter <https://neo4j.com/docs/cypher-manual/current/>.

## Deinstallieren

### 1. Übungsordner und Befehlsverlauf löschen

`~/.neo4j` enthält den Verlauf der Befehle, die du in `cypher-shell` eingegeben hast.

```bash
rm -rf ~/neo4j-uebung ~/.neo4j
```

### 2. Dienst anhalten

```bash
sudo systemctl stop neo4j
```

### 3. Neo4j entfernen

**Achtung:** `purge` löscht ohne Nachfrage alle Datenbanken in `/var/lib/neo4j` und die Protokolle in `/var/log/neo4j`. Sicherungen in `/var/backups/neo4j` bleiben erhalten.

```bash
sudo apt purge neo4j cypher-shell
```

### 4. Übrige Abhängigkeiten entfernen

Entfernt Java 21 und die übrigen Pakete, die nur für Neo4j installiert wurden. `apt` listet sie auf und fragt vor dem Löschen nach. Ist ein Paket dabei, das du noch brauchst, brich mit <kbd>n</kbd> ab.

```bash
sudo apt autoremove --purge
```

### 5. Dienst-Ergänzung löschen

```bash
sudo rm -r /etc/systemd/system/neo4j.service.d
```

### 6. systemd die Änderung mitteilen

```bash
sudo systemctl daemon-reload
```

### 7. Paketquelle und Schlüssel löschen

```bash
sudo rm /etc/apt/sources.list.d/neo4j.sources /etc/apt/keyrings/neo4j.asc
```

### 8. Paketlisten aktualisieren

Danach kennt `apt` die Pakete von Neo4j nicht mehr.

```bash
sudo apt update
```

### 9. Sicherungen löschen (optional)

**Achtung:** Danach lassen sich die Daten nicht mehr wiederherstellen.

```bash
sudo rm -r /var/backups/neo4j
```

**Prüfen:** Der Befehl `neo4j` wird nicht mehr gefunden.

```bash
neo4j --version
```
