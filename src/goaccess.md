# GoAccess

GoAccess wertet die Zugriffsprotokolle eines Webservers aus und zeigt, wie viele Besucher eine Website hat, welche Seiten am häufigsten aufgerufen werden, welche Adressen nicht gefunden wurden, woher die Besucher kommen und welche Browser und Suchmaschinen-Roboter dabei sind. Die Ergebnisse erscheinen direkt im Terminal oder als HTML-Seite, auf Wunsch auch fortlaufend aktualisiert. GoAccess braucht keinen Dienst, keine Datenbank und kein Skript in der Website, denn es liest nur die Protokolle, die [nginx](nginx.md) ohnehin schreibt.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert GoAccess **1.9.4**. Das Paket hat keine weiteren Abhängigkeiten, die nicht schon vorhanden sind.
- **Voraussetzung:** nginx ist installiert und schreibt sein Protokoll nach `/var/log/nginx/access.log`, wie in der Anleitung [nginx](nginx.md) beschrieben. Für Apache funktioniert GoAccess genauso, das Protokoll heißt dort `/var/log/apache2/access.log`.
- **Leserechte:** Die Protokolle gehören der Gruppe `adm`. Der Benutzer, der bei der Installation von Ubuntu angelegt wurde, ist Mitglied dieser Gruppe und kann sie ohne `sudo` lesen.
- **Datenschutz:** Protokolle und Berichte enthalten die IP-Adressen der Besucher, also personenbezogene Daten. Berichte gehören daher nicht ungeschützt ins Internet. Schritt 14 zeigt, wie GoAccess die Adressen kürzt.
- **Version:** Getestet mit GoAccess **1.9.4** am 2. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. GoAccess installieren

```bash
sudo apt install goaccess
```

### 3. Version prüfen

```bash
goaccess --version
```

**Prüfen:** Die erste Zeile lautet `GoAccess - 1.9.4.`

### 4. Leserecht prüfen

```bash
id -nG | grep -w adm
```

**Prüfen:** Die Ausgabe enthält `adm`. Gibt der Befehl nichts aus, stellst du in den folgenden Befehlen `sudo` voran.

## Einrichten

### 5. Protokollformat festlegen

GoAccess muss wissen, wie die Zeilen im Protokoll aufgebaut sind. nginx und Apache schreiben in der Grundeinstellung das verbreitete Format *Combined*. Damit du es nicht bei jedem Aufruf angeben musst, legst du es in einer Einstellungsdatei in deinem Home-Ordner fest.

```bash
nano ~/.goaccessrc
```

Füge diese Zeile ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
log-format COMBINED
```

### 6. Testaufrufe erzeugen (optional)

Ist das Protokoll noch leer, erzeugen diese drei Aufrufe einige Einträge: zwei vorhandene Seiten und eine Adresse, die es nicht gibt.

```bash
curl -s -o /dev/null http://localhost/
```

```bash
curl -s -o /dev/null http://localhost/
```

```bash
curl -s -o /dev/null http://localhost/gibtsnicht
```

**Prüfen:** Die letzten Zeilen des Protokolls zeigen die Aufrufe, die letzte mit dem Statuscode `404`.

```bash
tail -n 3 /var/log/nginx/access.log
```

## Auswertung im Terminal

### 7. GoAccess starten

```bash
goaccess /var/log/nginx/access.log
```

**Prüfen:** Das Terminal zeigt oben eine Übersicht mit **Anfragen gesamt**, **Eindeutige Besucher** und **Nicht gefunden**, darunter Bereiche wie **Eindeutige Besucher pro Tag** und **Angefragte Dateien**. Die Oberfläche richtet sich nach der Sprache des Systems.

### 8. Durch die Bereiche blättern

- <kbd>Tab</kbd> springt zum nächsten Bereich, <kbd>Umschalt</kbd>+<kbd>Tab</kbd> zum vorherigen.
- <kbd>Enter</kbd> klappt den gewählten Bereich auf und zeigt alle Einträge.
- <kbd>F1</kbd> oder <kbd>h</kbd> zeigt die Hilfe mit allen Tasten.

### 9. GoAccess beenden

Drücke <kbd>q</kbd>. Ist ein Bereich aufgeklappt, schließt <kbd>q</kbd> zuerst diesen, ein weiteres <kbd>q</kbd> beendet GoAccess.

## Bericht als HTML-Seite

### 10. Ordner für Berichte anlegen

```bash
mkdir -p ~/goaccess-berichte
```

### 11. Bericht erzeugen

`-o` schreibt das Ergebnis in eine Datei, statt es im Terminal anzuzeigen. An der Endung `.html` erkennt GoAccess, dass eine Webseite entstehen soll.

```bash
goaccess /var/log/nginx/access.log -o ~/goaccess-berichte/bericht.html
```

**Prüfen:** Die Ausgabe endet mit `Cleaning up resources...` und die Datei ist rund 700 KB groß.

```bash
ls -lh ~/goaccess-berichte
```

### 12. Bericht im Browser öffnen

```bash
xdg-open ~/goaccess-berichte/bericht.html
```

**Prüfen:** Der Browser zeigt die Übersicht **Analysierte Anfragen gesamt** mit Zahlen und Diagrammen. Die Seite enthält alles in einer Datei und braucht keine Internetverbindung.

### 13. Auch ältere Protokolle auswerten

nginx beginnt jeden Tag ein neues Protokoll. Die älteren heißen `access.log.1`, `access.log.2.gz` und so weiter, die meisten davon gepackt. `zcat -f` gibt alle Dateien hintereinander aus und packt die gepackten dabei aus. Das `-` am Ende sagt GoAccess, dass es die Daten über die Pipe erhält.

```bash
zcat -f /var/log/nginx/access.log* | goaccess -o ~/goaccess-berichte/alle.html -
```

**Prüfen:** Oben im Bericht reicht der Zeitraum unter **Analysierte Anfragen gesamt** jetzt mehrere Tage zurück.

### 14. IP-Adressen kürzen

`--anonymize-ip` setzt den letzten Teil jeder Adresse auf null, aus `203.0.113.57` wird so `203.0.113.0`. Besucher lassen sich dann nicht mehr einzeln zuordnen, die Statistik bleibt aber aussagekräftig.

```bash
goaccess /var/log/nginx/access.log --anonymize-ip -o ~/goaccess-berichte/anonym.html
```

**Prüfen:** Im Bereich **Besucher-Hostnamen und -IPs** enden alle IPv4-Adressen auf `.0`.

### 15. Bericht als CSV oder JSON

Mit der Endung `.csv` oder `.json` schreibt GoAccess dieselben Zahlen für Tabellenkalkulationen oder eigene Programme.

```bash
goaccess /var/log/nginx/access.log -o ~/goaccess-berichte/bericht.json
```

## Bericht, der sich selbst aktualisiert

GoAccess kann den HTML-Bericht laufend aktualisieren. Dazu startet es einen kleinen Server, der neue Zahlen über eine WebSocket-Verbindung an die geöffnete Seite schickt.

### 16. Live-Bericht starten

- `--real-time-html` hält GoAccess am Laufen und schickt jede neue Protokollzeile an den Browser.
- `--addr=127.0.0.1` lässt den Server nur Verbindungen von diesem Rechner annehmen. Ohne diese Angabe wäre er aus dem ganzen Netz erreichbar.

```bash
goaccess /var/log/nginx/access.log -o ~/goaccess-berichte/live.html --real-time-html --addr=127.0.0.1
```

Lass dieses Terminal offen.

### 17. Live-Bericht öffnen

Öffne ein zweites Terminal und darin den Bericht:

```bash
xdg-open ~/goaccess-berichte/live.html
```

**Prüfen:** Rufe im zweiten Terminal ein paarmal `curl -s -o /dev/null http://localhost/` auf. Nach wenigen Sekunden steigt die Zahl bei **Anfragen gesamt** im Browser, ohne dass du die Seite neu lädst.

### 18. Live-Bericht beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>. Die Seite im Browser zeigt danach den letzten Stand.

## Wie geht es weiter?

- **Roboter ausblenden:** `--ignore-crawlers` lässt Suchmaschinen und andere Roboter aus der Statistik weg.
- **Mehrere Websites:** Schreibt nginx mehrere Websites in dasselbe Protokoll, unterscheidet GoAccess sie nur, wenn der Name der Website im Protokoll steht. Einfacher ist ein eigenes Protokoll je Website mit `access_log` im jeweiligen `server`-Block.
- **Herkunftsländer:** Mit einer GeoIP-Datenbank im Format MaxMind DB (z. B. der kostenlosen *GeoLite2 Country* nach Registrierung bei MaxMind) zeigt GoAccess auch Länder an. Die Datei wird mit `--geoip-database=PFAD` angegeben.
- **Dokumentation:** `man goaccess` oder <https://goaccess.io/man>

## Deinstallieren

### 1. Berichte und Einstellungsdatei löschen

```bash
rm -rf ~/goaccess-berichte ~/.goaccessrc
```

### 2. GoAccess entfernen

```bash
sudo apt purge goaccess
```

**Prüfen:** Der Befehl `goaccess` wird nicht mehr gefunden.

```bash
goaccess --version
```
