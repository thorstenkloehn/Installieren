# Glances

Glances zeigt auf einer einzigen Seite, wie es dem Rechner gerade geht: Prozessor, Arbeitsspeicher, Auslastung, Netzwerk, Festplatten, Temperaturen und die Prozesse, die am meisten Rechenzeit brauchen. Es läuft im Terminal, liefert die Werte auf Wunsch über eine Programmierschnittstelle (API) oder als CSV-Datei und hat eine Weboberfläche für den Browser. Für den schnellen Blick ist Glances damit eine Ergänzung zu [Monit](monit.md), [Prometheus](prometheus.md) und [Grafana](grafana.md).

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Glances **4.3.3**. Mit `--no-install-recommends` kommen 17 Pakete auf den Rechner. Ohne diese Option wären es über 50, darunter Bibliotheken für Diagramme und Mathematik, die Glances nur für Sonderfunktionen braucht.
- **Weboberfläche fehlt im Ubuntu-Paket:** Ubuntu liefert Glances ohne die fertig gebauten Dateien der Weboberfläche aus. Der Befehl `glances -w` bricht deshalb mit der Meldung `Directory '…/static/public' does not exist` ab. Die API funktioniert trotzdem (Teil 3). Wer die Weboberfläche haben möchte, installiert sie zusätzlich über `pipx` (Teil 5).
- **Dienst:** Das Paket richtet einen Dienst `glances` ein und startet ihn sofort. Er liefert die Messwerte auf Port 61209 an andere Glances-Programme (Teil 2) und ist nur von diesem Rechner aus erreichbar.
- **Temperaturen:** Die Temperaturen von Prozessor und SSD liest Glances direkt aus dem System. Das Paket `lm-sensors` ist dafür nicht nötig.
- **Version:** Getestet mit Glances **4.3.3** (apt) und **4.5.7** (pipx) am 2. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Glances installieren

`--no-install-recommends` lässt die nur empfohlenen Zusatzpakete weg.

```bash
sudo apt install --no-install-recommends glances
```

### 3. Version prüfen

```bash
glances --version
```

**Prüfen:** Die erste Zeile lautet `Glances version: 4.3.3`.

### 4. Dienst prüfen

```bash
systemctl is-active glances
```

**Prüfen:** Die Ausgabe lautet `active`.

## Teil 1: Glances im Terminal

### 5. Glances starten

```bash
glances
```

**Prüfen:** Oben stehen Rechnername, Ubuntu-Version und Laufzeit, darunter Kästen für **CPU**, **MEM**, **SWAP** und **LOAD**. Links folgen Netzwerk, Festplatten, Dateisysteme und Temperaturen (**SENSORS**), rechts die Liste der Prozesse. Die Anzeige wird alle zwei Sekunden erneuert und ist nur auf Englisch verfügbar.

### 6. Anzeige mit Tasten steuern

Glances reagiert auf einzelne Tasten, ohne dass du <kbd>Enter</kbd> drücken musst:

- <kbd>c</kbd> sortiert die Prozesse nach Prozessorlast, <kbd>m</kbd> nach Arbeitsspeicher, <kbd>a</kbd> wieder automatisch.
- <kbd>1</kbd> zeigt jeden Prozessorkern einzeln an und mit einem zweiten Druck wieder alle zusammen.
- <kbd>s</kbd> blendet die Temperaturen aus und wieder ein, <kbd>z</kbd> die Prozessliste.
- <kbd>h</kbd> zeigt alle Tasten, ein weiteres <kbd>h</kbd> schließt die Hilfe.

**Farben:** Grün heißt in Ordnung, Blau »beobachten«, Violett »Warnung« und Rot »kritisch«.

### 7. Glances beenden

Drücke <kbd>q</kbd>.

## Teil 2: Werte vom Dienst abrufen

Der Dienst aus Schritt 4 misst die Werte im Hintergrund. Ein zweites Glances-Programm kann sich als *Client* mit ihm verbinden und zeigt dann dessen Werte. Das ist vor allem nützlich, wenn der Dienst auf einem anderen Rechner läuft.

### 8. Mit dem Dienst verbinden

```bash
glances -c 127.0.0.1
```

**Prüfen:** Die Anzeige sieht aus wie in Schritt 5. Zusätzlich steht dort `Connected to` mit dem Rechnernamen. Mit <kbd>q</kbd> beendest du sie.

### 9. Dienst abschalten (optional)

Brauchst du den Client-Modus nicht, kannst du den Dienst ausschalten. Glances im Terminal funktioniert auch ohne ihn.

```bash
sudo systemctl disable --now glances
```

**Prüfen:** Die Ausgabe lautet `inactive`.

```bash
systemctl is-active glances
```

## Teil 3: Werte über die API abfragen

Mit `-w` startet Glances einen kleinen Webserver. `--disable-webui` schaltet dabei die Weboberfläche ab, die im Ubuntu-Paket fehlt, und lässt nur die API laufen. Sie liefert alle Messwerte im Format JSON, etwa für eigene Skripte.

### 10. API starten

`-B 127.0.0.1` lässt den Webserver nur Verbindungen von diesem Rechner annehmen. Ohne diese Angabe wäre er aus dem ganzen Netz erreichbar, und zwar ohne Passwort.

```bash
glances -w --disable-webui -B 127.0.0.1
```

**Prüfen:** Die letzte Zeile lautet `Uvicorn running on http://127.0.0.1:61208 (Press CTRL+C to quit)`. Lass dieses Terminal offen.

### 11. Prozessorlast abfragen

Öffne ein zweites Terminal. Die Adresse besteht aus `/api/4/`, dem Namen eines Bereichs (`cpu`) und dem gewünschten Wert (`total`).

```bash
curl http://127.0.0.1:61208/api/4/cpu/total
```

**Prüfen:** Die Antwort sieht aus wie `{"total":19.2}`, also die Prozessorlast in Prozent.

### 12. Liste aller Bereiche anzeigen

```bash
curl http://127.0.0.1:61208/api/4/pluginslist
```

**Prüfen:** Die Liste enthält unter anderem `"cpu"`, `"mem"`, `"load"`, `"fs"` und `"sensors"`. Jeden dieser Namen kannst du in Schritt 11 statt `cpu` einsetzen. Ohne Wertnamen, also etwa `/api/4/mem`, liefert Glances alle Werte des Bereichs.

### 13. API beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

## Teil 4: Werte in eine CSV-Datei schreiben

### 14. Messwerte aufzeichnen

Glances schreibt bei jeder Messung eine Zeile in die Datei. `--stop-after 30` beendet die Aufzeichnung nach 30 Messungen, also nach etwa einer Minute. `--quiet` lässt die Anzeige im Terminal weg.

```bash
glances --export csv --export-csv-file ~/glances.csv --stop-after 30 --quiet
```

**Prüfen:** Die erste Zeile der Datei enthält die Spaltennamen wie `timestamp`, `cpu.total` und `mem.percent`. Die Datei lässt sich in LibreOffice Calc öffnen.

```bash
head -c 300 ~/glances.csv
```

## Teil 5: Weboberfläche über pipx

Die vollständige Weboberfläche gibt es in der Version von <https://pypi.org>. `pipx` installiert sie in eine eigene virtuelle Umgebung, getrennt von Ubuntus Python, wie es die Anleitung [Python](python.md) für Kommandozeilenprogramme empfiehlt. Mit dem Zusatz `--suffix=-web` heißt der Befehl `glances-web`. So kommt er dem `glances` aus dem Ubuntu-Paket nicht in die Quere.

### 15. pipx installieren

```bash
sudo apt install pipx
```

**Prüfen:** Die Versionsnummer erscheint, z. B. `1.8.0`.

```bash
pipx --version
```

### 16. Glances mit Weboberfläche installieren

`[web]` sorgt dafür, dass pipx auch die Bibliotheken für den Webserver mitinstalliert. Die Anführungszeichen braucht die Shell wegen der eckigen Klammern.

```bash
pipx install 'glances[web]' --suffix=-web
```

**Prüfen:** Die Ausgabe endet mit `These apps are now globally available` und `- glances-web`.

Meldet das Terminal später `glances-web: Kommando nicht gefunden`, fehlt `~/.local/bin` im Suchpfad. `pipx ensurepath` trägt den Ordner ein. Danach ein neues Terminal öffnen.

### 17. Weboberfläche starten

```bash
glances-web -w -B 127.0.0.1
```

**Prüfen:** Die letzte Zeile lautet `Uvicorn running on http://127.0.0.1:61208 (Press CTRL+C to quit)`. Lass dieses Terminal offen.

### 18. Weboberfläche im Browser öffnen

Öffne ein zweites Terminal:

```bash
xdg-open http://127.0.0.1:61208
```

**Prüfen:** Der Browser zeigt dieselben Bereiche wie das Terminal in Schritt 5 und erneuert sie laufend. Ein Klick auf eine Spaltenüberschrift der Prozessliste sortiert nach dieser Spalte. Die API aus Teil 3 steht unter derselben Adresse ebenfalls bereit.

### 19. Weboberfläche beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Anderen Rechner beobachten:** Läuft auf einem Server der Dienst aus Teil 2, kann er mit `-B 0.0.0.0` für das Netz geöffnet werden. Dann gehören ein Passwort (`--password`) und eine Firewall-Regel dazu, die nur die eigenen Rechner zulässt.
- **Nach Prometheus exportieren:** Mit `--export prometheus` stellt Glances seine Werte für [Prometheus](prometheus.md) bereit. Dafür braucht es zusätzlich das Paket `python3-prometheus-client`. Für einen Rechner allein ist der Node Exporter aus der Prometheus-Anleitung aber die übliche Wahl.
- **Grenzwerte ändern:** Ab welchen Werten Glances eine Farbe wechselt, steht in `/etc/glances/glances.conf`.
- **Dokumentation:** `man glances` oder <https://glances.readthedocs.io>

## Deinstallieren

### 1. Weboberfläche entfernen (falls installiert)

```bash
pipx uninstall glances-web
```

### 2. pipx entfernen (falls installiert und nicht mehr gebraucht)

```bash
sudo apt purge pipx
```

### 3. Glances entfernen

`purge` hält auch den Dienst an und löscht ihn.

```bash
sudo apt purge glances
```

### 4. Übrige Abhängigkeiten entfernen

Entfernt die Bibliotheken, die nur für Glances und pipx installiert wurden. `apt` listet die Pakete auf und fragt vor dem Löschen nach. Ist ein Paket dabei, das du noch brauchst, brich mit <kbd>n</kbd> ab.

```bash
sudo apt autoremove --purge
```

### 5. Übrige Dateien löschen

Glances legt beim Start ein Protokoll in deinem Home-Ordner an. Die CSV-Datei stammt aus Schritt 14.

```bash
rm -rf ~/.local/share/glances ~/glances.csv
```

**Prüfen:** Der Befehl `glances` wird nicht mehr gefunden.

```bash
glances --version
```
