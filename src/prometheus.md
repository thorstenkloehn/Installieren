# Prometheus

Prometheus sammelt laufend Messwerte von Rechnern und Programmen und legt sie als Zeitreihen ab: etwa freien Arbeitsspeicher, Prozessorlast, Plattenplatz oder die Zahl der Anfragen an einen Webserver. Es fragt die Werte in festen Abständen selbst ab, wertet sie mit der Abfragesprache PromQL aus und meldet mit Regeln, wenn etwas aus dem Ruder läuft. Zusammen mit [Grafana](grafana.md) entstehen daraus übersichtliche Dashboards. Diese Anleitung installiert Prometheus und den *Node Exporter*, der die Werte des eigenen Rechners liefert, beschränkt beide auf den eigenen Rechner und richtet eine erste Alarmregel ein.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Prometheus **2.53** und den Node Exporter **1.10** direkt in den eigenen Paketquellen. Prometheus 2.53 ist die letzte Ausgabe der Reihe 2 mit langer Pflege. Die neuere Reihe 3 gibt es nur direkt beim Projekt.
- **Ohne Zusatzwerkzeuge:** Der Node Exporter empfiehlt ein Paket mit weiteren Messskripten, das Werkzeuge für Festplattenzustand (SMART), NVMe und Server-Fernwartung (IPMI) mitbringt. Schritt 2 lässt diese Empfehlungen mit `--no-install-recommends` weg. Statt 30 werden so 14 Pakete installiert.
- **Sofort erreichbar:** Beide Dienste starten direkt nach der Installation und lauschen zunächst auf allen Netzwerkschnittstellen, Prometheus auf Port **9090**, der Node Exporter auf Port **9100**. Die Schritte 4 bis 9 beschränken sie auf `127.0.0.1`. Erledige diese Schritte daher gleich nach der Installation.
- **Ohne Anmeldung:** Prometheus und der Node Exporter haben keine Benutzerverwaltung. Jeder, der den Port erreicht, sieht alle Messwerte. Auch deshalb bleiben sie auf `127.0.0.1`.
- **Klassische Weboberfläche:** Das Ubuntu-Paket enthält nicht die aktuelle Weboberfläche des Projekts, sondern nur die ältere, einfachere unter `/classic/`. Für Diagramme ist ohnehin [Grafana](grafana.md) üblich.
- **Version:** Getestet mit Prometheus **2.53.5** und Node Exporter **1.10.2** am 2. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Prometheus und Node Exporter installieren

`promtool`, ein Prüfwerkzeug für die Konfiguration, kommt automatisch mit.

```bash
sudo apt install --no-install-recommends prometheus prometheus-node-exporter
```

### 3. Version prüfen

```bash
prometheus --version
```

**Prüfen:** Die erste Zeile beginnt mit `prometheus, version 2.53.5`.

## Auf den eigenen Rechner beschränken

Beide Dienste lesen ihre Startoptionen aus einer Datei in `/etc/default`. Dort steht jeweils eine leere Zeile `ARGS=""`.

### 4. Startoptionen des Node Exporters öffnen

```bash
sudo nano /etc/default/prometheus-node-exporter
```

### 5. Adresse des Node Exporters festlegen

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `ARGS=` und drücke <kbd>Enter</kbd>. Ersetze die gefundene Zeile `ARGS=""` durch diese Zeile:

```bash
ARGS="--web.listen-address=127.0.0.1:9100"
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Startoptionen von Prometheus öffnen

```bash
sudo nano /etc/default/prometheus
```

### 7. Adresse von Prometheus festlegen

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `ARGS=` und drücke <kbd>Enter</kbd>. Ersetze die gefundene Zeile `ARGS=""` durch diese Zeile:

```bash
ARGS="--web.listen-address=127.0.0.1:9090"
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Beide Dienste neu starten

Die Dienste lesen die Startoptionen nur beim Start.

```bash
sudo systemctl restart prometheus-node-exporter prometheus
```

### 9. Prüfen, dass beide nur lokal lauschen

```bash
sudo ss -ltnp | grep prometheus
```

**Prüfen:** Es erscheinen zwei Zeilen mit `127.0.0.1:9090` und `127.0.0.1:9100`. Steht dort noch `*:9090` oder `*:9100`, ist die Zeile in Schritt 5 oder 7 nicht richtig gespeichert.

### 10. Messwerte des Node Exporters ansehen

Der Node Exporter liefert seine Werte als einfachen Text unter `/metrics`, mehrere hundert Zeilen. `grep` zeigt nur die Zeile mit dem freien Arbeitsspeicher.

```bash
curl -s http://127.0.0.1:9100/metrics | grep '^node_memory_MemAvailable_bytes'
```

**Prüfen:** Es erscheint eine Zeile mit `node_memory_MemAvailable_bytes` und dem freien Arbeitsspeicher in Byte, geschrieben in Exponentialschreibweise, z. B. `1.2555706368e+10` für rund 12,5 Milliarden Byte.

### 11. Abfrageziele prüfen

Die mitgelieferte Konfiguration `/etc/prometheus/prometheus.yml` lässt Prometheus alle 15 Sekunden sich selbst (`job="prometheus"`) und den Node Exporter (`job="node"`) abfragen. Die Kennzahl `up` ist 1, wenn die letzte Abfrage geklappt hat.

```bash
curl -s http://127.0.0.1:9090/api/v1/query --data-urlencode 'query=up'
```

**Prüfen:** Die Antwort enthält zweimal `"1"`, einmal bei `"job":"prometheus"` und einmal bei `"job":"node"`. Steht direkt nach dem Neustart noch nichts da, warte 30 Sekunden und wiederhole den Befehl.

## Abfragen in der Weboberfläche

### 12. Weboberfläche öffnen

```text
http://127.0.0.1:9090/classic/graph
```

**Prüfen:** Oben steht **Prometheus** mit den Menüpunkten **Alerts**, **Graph**, **Status** und **Help**, darunter ein Eingabefeld und der Knopf **Execute**.

Die Startseite `http://127.0.0.1:9090/` erklärt nur, dass die neue Oberfläche im Ubuntu-Paket fehlt, und verweist mit **Use classic web UI** auf diese Seite.

### 13. Freien Arbeitsspeicher in Prozent abfragen

Gib in das Eingabefeld diese Abfrage ein und klicke auf **Execute**:

```text
round(node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100)
```

**Prüfen:** Im Reiter **Console** erscheint eine Zeile mit `job="node"` und einer Zahl, dem freien Arbeitsspeicher in Prozent. Der Reiter **Graph** zeigt den Verlauf.

### 14. Weitere Abfragen ausprobieren

Ersetze den Inhalt des Eingabefelds jeweils durch eine dieser Zeilen und klicke auf **Execute**:

- Prozessorauslastung in Prozent über die letzte Minute: `round(100 - avg(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)`
- Freier Platz auf der Systempartition in Gigabyte: `round(node_filesystem_avail_bytes{mountpoint="/"} / 1e9)`
- Empfangene Byte pro Sekunde je Netzwerkkarte: `round(rate(node_network_receive_bytes_total{device!="lo"}[1m]))`
- Zahl der Prozessorkerne: `count(node_cpu_seconds_total{mode="idle"})`

Was die Bausteine bedeuten:

- `{mode="idle"}` wählt nur die Werte mit diesem Merkmal aus, `!=` schließt Werte aus.
- `[1m]` nimmt die Werte der letzten Minute.
- `rate(…)` rechnet aus einem stetig steigenden Zähler die Zunahme pro Sekunde aus.

**Prüfen:** Jede Abfrage liefert mindestens eine Zeile mit einer Zahl.

## Eine Alarmregel einrichten

### 15. Regeldatei anlegen

```bash
sudo nano /etc/prometheus/regeln.yml
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```yaml
groups:
  - name: rechner
    rules:
      - alert: ExporterNichtErreichbar
        expr: up == 0
        for: 1m
        annotations:
          summary: "{{ $labels.job }} ist seit einer Minute nicht erreichbar"

      - alert: WenigPlatzAufSystemplatte
        expr: node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100 < 10
        for: 5m
        annotations:
          summary: "Auf / sind weniger als 10 % frei"
```

- `expr` – die Bedingung als PromQL-Abfrage. Liefert sie ein Ergebnis, ist die Regel verletzt.
- `for` – so lange muss die Bedingung ununterbrochen gelten, bevor der Alarm auslöst. Kurze Ausreißer lösen so keinen Alarm aus.
- `summary` – ein Text, der beim Alarm angezeigt wird. `{{ $labels.job }}` setzt den Namen des betroffenen Ziels ein.

Die Einrückung mit Leerzeichen gehört zum Format YAML und muss genau so bleiben.

### 16. Regeldatei prüfen

```bash
promtool check rules /etc/prometheus/regeln.yml
```

**Prüfen:** Die Ausgabe endet mit `SUCCESS: 2 rules found`.

### 17. Konfiguration öffnen

```bash
sudo nano /etc/prometheus/prometheus.yml
```

### 18. Regeldatei eintragen

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `first_rules` und drücke <kbd>Enter</kbd>. Ersetze die gefundene Zeile `  # - "first_rules.yml"` durch diese Zeile (mit zwei Leerzeichen am Anfang):

```yaml
  - "regeln.yml"
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. Der Pfad ist relativ zum Ordner `/etc/prometheus`.

### 19. Gesamte Konfiguration prüfen

`promtool` prüft dabei auch die eingetragene Regeldatei.

```bash
promtool check config /etc/prometheus/prometheus.yml
```

**Prüfen:** Es erscheinen `SUCCESS: 1 rule files found` und `SUCCESS: 2 rules found`.

### 20. Konfiguration neu laden

`reload` liest die Konfiguration neu ein, ohne Prometheus zu beenden. Die gesammelten Werte bleiben erhalten.

```bash
sudo systemctl reload prometheus
```

**Prüfen:** Unter `http://127.0.0.1:9090/classic/alerts` stehen die beiden Regeln mit dem Zustand **Inactive**.

### 21. Alarm auslösen

Zum Ausprobieren hältst du den Node Exporter an.

```bash
sudo systemctl stop prometheus-node-exporter
```

**Prüfen:** Lade die Seite mit den Alarmen nach etwa einer halben Minute neu. `ExporterNichtErreichbar` steht jetzt unter **Pending**: Die Bedingung gilt, die Minute aus `for` ist aber noch nicht vorbei. Nach rund zwei Minuten wechselt der Alarm zu **Firing**.

### 22. Node Exporter wieder starten

```bash
sudo systemctl start prometheus-node-exporter
```

**Prüfen:** Nach etwa einer halben Minute steht der Alarm wieder unter **Inactive**.

Prometheus zeigt Alarme nur an. Um bei einem Alarm eine E-Mail oder Nachricht zu verschicken, braucht es zusätzlich den [Alertmanager](alertmanager.md).

## In Grafana anzeigen

Ist [Grafana](grafana.md) installiert, wählst du dort unter **Connections → Add new connection** die Quelle **Prometheus** und trägst bei **Prometheus server URL** `http://127.0.0.1:9090` ein. Danach stehen alle Abfragen aus Schritt 14 für Dashboards zur Verfügung.

## Optional: Autostart ausschalten

Wer Prometheus nur ab und zu braucht, nimmt beide Dienste aus dem Systemstart heraus und startet sie bei Bedarf mit `sudo systemctl start prometheus-node-exporter prometheus`.

```bash
sudo systemctl disable --now prometheus prometheus-node-exporter
```

## Wie geht es weiter?

- **Aufbewahrungsdauer:** Prometheus behält die Messwerte 15 Tage und speichert sie in `/var/lib/prometheus/metrics2`. Mit `--storage.tsdb.retention.time=90d` zusätzlich in der Zeile `ARGS` aus Schritt 7 bleiben sie 90 Tage.
- **Weitere Ziele:** Für viele Programme gibt es eigene Exporter als Ubuntu-Paket, etwa `prometheus-postgres-exporter` für [PostgreSQL](postgresql.md) oder `prometheus-nginx-exporter` für [nginx](nginx.md). Sie werden als weiterer Eintrag unter `scrape_configs` in `prometheus.yml` eingetragen.
- **Neue Weboberfläche:** Das Skript `/usr/share/prometheus/install-ui.sh` lädt die aktuelle Oberfläche des Projekts von GitHub nach. Sie wird dann aber nicht über `apt` aktualisiert.
- **Dokumentation:** Einführung in PromQL unter <https://prometheus.io/docs/prometheus/latest/querying/basics/>. Die Seiten beschreiben die neueste Version, Grundlagen und Abfragesprache gelten aber auch für 2.53.

## Deinstallieren

### 1. Prometheus und Node Exporter entfernen

`purge` löscht auch die gesammelten Messwerte in `/var/lib/prometheus`. `apt` meldet dabei, dass `/etc/prometheus` nicht leer ist, weil dort noch die Regeldatei liegt.

```bash
sudo apt purge prometheus prometheus-node-exporter promtool
```

### 2. Übrige Abhängigkeiten entfernen

Entfernt die Bibliotheken für die Weboberfläche, die nur für Prometheus installiert wurden. `apt` listet die Pakete auf und fragt vor dem Löschen nach. Ist ein Paket dabei, das du noch brauchst, brich mit <kbd>n</kbd> ab.

```bash
sudo apt autoremove --purge
```

### 3. Übrige Dateien löschen

Die Regeldatei aus Schritt 15 gehört zu keinem Paket und bleibt deshalb liegen.

```bash
sudo rm -rf /etc/prometheus /var/lib/prometheus
```

### 4. Systembenutzer entfernen

Die Installation hat den Benutzer `prometheus` und eine gleichnamige Gruppe angelegt.

```bash
sudo deluser prometheus
```

**Prüfen:** Der Befehl `prometheus` wird nicht mehr gefunden.

```bash
prometheus --version
```
