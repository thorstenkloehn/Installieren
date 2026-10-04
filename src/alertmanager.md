# Alertmanager

Der Alertmanager verschickt die Alarme, die [Prometheus](prometheus.md) erkennt. Prometheus selbst zeigt einen ausgelösten Alarm nur auf einer Webseite an. Der Alertmanager nimmt ihn entgegen, fasst zusammengehörige Alarme zu einer Nachricht zusammen, schickt sie per E-Mail oder an einen anderen Dienst und meldet sich erneut, wenn die Störung vorbei ist. Während Wartungsarbeiten lassen sich Alarme gezielt stummschalten.

## Vorbemerkungen

- **Voraussetzung:** Prometheus und der Node Exporter sind nach der [Prometheus-Anleitung](prometheus.md) installiert, einschließlich der Regeldatei aus den Schritten 15 bis 20. Ohne Regeln gibt es nichts zu verschicken.
- **Installation über apt:** Ubuntu 26.04 liefert den Alertmanager **0.28.1** als einzelnes Paket `prometheus-alertmanager`. Es enthält auch das Befehlszeilenwerkzeug `amtool`.
- **Keine Weboberfläche:** Das Ubuntu-Paket bringt die Weboberfläche des Projekts nicht mit. Unter `http://127.0.0.1:9093/` steht nur ein Hinweis darauf. Diese Anleitung bedient den Alertmanager deshalb mit `amtool`.
- **Sofort erreichbar:** Der Dienst startet direkt nach der Installation und lauscht auf allen Netzwerkschnittstellen, auf Port **9093** für Alarme und auf Port **9094** für den Verbund mehrerer Alertmanager. Eine Anmeldung gibt es nicht. Die Schritte 4 bis 6 beschränken ihn auf `127.0.0.1` und schalten den Verbund ab. Erledige sie gleich nach der Installation.
- **E-Mail über den eigenen Rechner:** Das Beispiel verschickt die Nachrichten über ein Mailprogramm auf demselben Rechner (Postfix, Port 25) an einen lokalen Benutzer. Postfix muss dafür installiert sein. Es war auf dem Testrechner schon vorhanden und ist nicht Teil dieser Anleitung. Den Versand über einen Anbieter im Internet beschreibt der Abschnitt „Wie geht es weiter?“, **dieser Weg ist nicht selbst getestet**.
- **Version:** Getestet mit Alertmanager **0.28.1** und Prometheus **2.53.5** am 4. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Alertmanager installieren

```bash
sudo apt install prometheus-alertmanager
```

### 3. Version prüfen

```bash
prometheus-alertmanager --version
```

**Prüfen:** Die erste Zeile beginnt mit `alertmanager, version 0.28.1`.

## Auf den eigenen Rechner beschränken

### 4. Startoptionen öffnen

```bash
sudo nano /etc/default/prometheus-alertmanager
```

### 5. Adresse festlegen

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `ARGS=` und drücke <kbd>Enter</kbd>. Ersetze die gefundene Zeile `ARGS=""` durch diese Zeile:

```bash
ARGS="--web.listen-address=127.0.0.1:9093 --cluster.listen-address="
```

Die erste Option bindet den Alertmanager an den eigenen Rechner. Die zweite bleibt absichtlich ohne Wert: Das schaltet den Verbund und damit Port 9094 ab. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Dienst neu starten und prüfen

```bash
sudo systemctl restart prometheus-alertmanager
```

```bash
sudo ss -ltnp | grep prometheus-aler
```

**Prüfen:** Es erscheint genau eine Zeile mit `127.0.0.1:9093`. Port 9094 taucht nicht mehr auf.

## Empfänger einrichten

Die mitgelieferte Datei `/etc/prometheus/alertmanager.yml` ist ein umfangreiches Beispiel mit erfundenen Adressen. Du ersetzt sie durch eine kurze eigene Fassung.

### 7. Beispieldatei sichern

So kannst du später nachlesen, welche Möglichkeiten das Beispiel zeigt.

```bash
sudo cp /etc/prometheus/alertmanager.yml /etc/prometheus/alertmanager.yml.beispiel
```

### 8. Konfiguration öffnen

```bash
sudo nano /etc/prometheus/alertmanager.yml
```

### 9. Eigene Konfiguration eintragen

Lösche den gesamten Inhalt: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge dann diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>) und ersetze `thorsten` durch deinen Benutzernamen:

```yaml
global:
  smtp_smarthost: 'localhost:25'
  smtp_from: 'alertmanager@localhost'
  smtp_require_tls: false

route:
  receiver: mail
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

receivers:
  - name: mail
    email_configs:
      - to: 'thorsten@localhost'
        send_resolved: true
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. Die Einrückung mit Leerzeichen gehört zum Format YAML und muss genau so bleiben.

Was die Einträge bedeuten:

- `smtp_smarthost` – der Mailserver, der die Nachricht annimmt, hier Postfix auf dem eigenen Rechner.
- `smtp_require_tls: false` – für die Verbindung innerhalb des Rechners ist keine Verschlüsselung nötig.
- `receiver: mail` – alle Alarme gehen an den Empfänger mit diesem Namen, der unter `receivers` beschrieben ist.
- `group_by` – Alarme mit demselben Namen kommen gemeinsam in eine Nachricht.
- `group_wait` – so lange wartet der Alertmanager nach dem ersten Alarm, ob weitere dazukommen.
- `group_interval` – frühestens nach dieser Zeit folgt eine weitere Nachricht zur selben Gruppe, etwa die Entwarnung.
- `repeat_interval` – besteht ein Alarm weiter, wird er in diesem Abstand wiederholt.
- `send_resolved: true` – auch das Ende einer Störung wird gemeldet.

### 10. Konfiguration prüfen

```bash
amtool check-config /etc/prometheus/alertmanager.yml
```

**Prüfen:** Die Ausgabe enthält `SUCCESS` und darunter `1 receivers`.

### 11. Dienst neu starten

```bash
sudo systemctl restart prometheus-alertmanager
```

**Prüfen:** Die Ausgabe lautet `active`.

```bash
systemctl is-active prometheus-alertmanager
```

### 12. Verbindung von Prometheus prüfen

Die Konfiguration von Prometheus enthält ab Werk schon einen Eintrag für einen Alertmanager auf `localhost:9093`. Dort ist nichts zu ändern.

```bash
curl -s http://127.0.0.1:9090/api/v1/alertmanagers
```

**Prüfen:** Unter `activeAlertmanagers` steht `http://localhost:9093/api/v2/alerts`. Ist die Liste noch leer, warte einige Sekunden und wiederhole den Befehl.

## Alarm auslösen

### 13. Node Exporter anhalten

Damit greift die Regel `ExporterNichtErreichbar` aus der Prometheus-Anleitung.

```bash
sudo systemctl stop prometheus-node-exporter
```

### 14. Alarm im Alertmanager ansehen

Es dauert rund anderthalb Minuten, bis Prometheus den Alarm auslöst und weitergibt.

```bash
amtool alert
```

**Prüfen:** Zunächst erscheint nur die Kopfzeile. Danach steht darunter der Alarm:

```text
Alertname                Starts At                Summary                                      State
ExporterNichtErreichbar  2026-10-04 03:43:12 UTC  node ist seit einer Minute nicht erreichbar  active
```

Die Uhrzeit ist in Weltzeit (UTC) angegeben. `amtool alert -o extended` zeigt zusätzlich alle Merkmale des Alarms.

### 15. E-Mail ansehen

Etwa eine halbe Minute nach dem Alarm, der Wartezeit aus `group_wait`, liegt die Nachricht im lokalen Postfach.

```bash
grep '^Subject:' /var/mail/thorsten
```

**Prüfen:** Es erscheint eine Zeile wie `Subject: [FIRING:1] ExporterNichtErreichbar (localhost:9100 node example)`. Die Nachricht selbst ist als HTML gestaltet. `less /var/mail/thorsten` zeigt den Rohtext.

### 16. Node Exporter wieder starten

```bash
sudo systemctl start prometheus-node-exporter
```

**Prüfen:** Nach einigen Minuten folgt die Entwarnung. Im Test dauerte es knapp fünf Minuten, das entspricht `group_interval`.

```bash
grep '^Subject:' /var/mail/thorsten
```

Die neue Zeile beginnt mit `Subject: [RESOLVED]`.

## Alarme stummschalten

Bei geplanten Arbeiten soll der Alertmanager nicht jede erwartete Störung melden. Eine Stummschaltung (*Silence*) unterdrückt die Nachrichten für eine bestimmte Zeit. Der Alarm selbst bleibt bestehen.

### 17. Stummschaltung anlegen

Dieser Befehl unterdrückt eine Stunde lang alle Alarme mit dem Namen `ExporterNichtErreichbar`. Ein Kommentar ist Pflicht.

```bash
amtool silence add alertname=ExporterNichtErreichbar --duration=1h --comment="Wartung am Node Exporter"
```

**Prüfen:** Die Ausgabe ist die Kennung der Stummschaltung, eine lange Folge aus Ziffern und Buchstaben.

### 18. Stummschaltungen anzeigen

```bash
amtool silence query
```

**Prüfen:** Die Liste nennt Kennung, Bedingung, Ende, Urheber und Kommentar.

Ein stummgeschalteter Alarm fehlt in der Ausgabe von `amtool alert`. Mit dieser Option erscheint er wieder, mit dem Zustand `suppressed`:

```bash
amtool alert query --silenced
```

### 19. Stummschaltung vorzeitig beenden

Ersetze `KENNUNG` durch die Kennung aus Schritt 17 oder 18.

```bash
amtool silence expire KENNUNG
```

**Prüfen:** `amtool silence query` zeigt nur noch die Kopfzeile.

## Versand testen, ohne etwas anzuhalten

### 20. Testalarm von Hand erzeugen

`amtool` kann selbst einen Alarm einliefern. So prüfst du Empfänger und Zustellung, ohne einen Dienst zu stoppen. Die doppelten Anführungszeichen innerhalb der einfachen sind nötig, weil der Text Leerzeichen enthält.

```bash
amtool alert add Testalarm --annotation='summary="Nur ein Test"'
```

**Prüfen:** `amtool alert` zeigt den Alarm sofort, nach etwa einer halben Minute liegt eine E-Mail mit `[FIRING:1] Testalarm` im Postfach. Der Testalarm läuft nach fünf Minuten von selbst ab.

### 21. Weg eines Alarms nachvollziehen

Bei mehreren Empfängern zeigt dieser Befehl, an wen ein Alarm mit bestimmten Merkmalen ginge:

```bash
amtool config routes test alertname=Testalarm
```

**Prüfen:** Die Ausgabe ist der Name des Empfängers, hier `mail`.

## Wie geht es weiter?

- **E-Mail über einen Anbieter (nicht selbst getestet):** Für den Versand an eine Adresse im Internet trägst du unter `global` den Server deines Anbieters ein, z. B. `smtp_smarthost: 'smtp.example.org:587'`, dazu `smtp_auth_username` und `smtp_auth_password`, und lässt `smtp_require_tls` weg. Weil dann ein Passwort in der Datei steht, sollte sie nur für `root` und die Gruppe `prometheus` lesbar sein: `sudo chown root:prometheus /etc/prometheus/alertmanager.yml` und `sudo chmod 640 /etc/prometheus/alertmanager.yml`.
- **Andere Wege:** Statt `email_configs` gibt es unter anderem `webhook_configs` für einen beliebigen Webdienst sowie fertige Anbindungen an Slack, Telegram, Discord und Microsoft Teams. Beispiele stehen in der gesicherten Datei aus Schritt 7.
- **Alarme nach Dringlichkeit verteilen:** Regeln in Prometheus können ein Merkmal wie `severity: critical` tragen. Unter `route` lassen sich dann mit `routes` und `matchers` verschiedene Empfänger zuordnen.
- **Nur die Erreichbarkeit von Websites:** Wer keinen Prometheus betreibt und nur wissen will, ob eine Website antwortet, kommt mit [Uptime Kuma](uptime-kuma.md) schneller ans Ziel.
- **Dokumentation:** <https://prometheus.io/docs/alerting/latest/configuration/> sowie `amtool --help`

## Deinstallieren

### 1. Alertmanager entfernen

`purge` löscht auch `/etc/prometheus/alertmanager.yml` und die gespeicherten Stummschaltungen in `/var/lib/prometheus/alertmanager`. Prometheus bleibt installiert und zeigt Alarme weiter auf seiner Webseite an.

```bash
sudo apt purge prometheus-alertmanager
```

### 2. Gesicherte Beispieldatei löschen

Die Kopie aus Schritt 7 gehört zu keinem Paket.

```bash
sudo rm -f /etc/prometheus/alertmanager.yml.beispiel
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
prometheus-alertmanager --version
```

Wie du Prometheus selbst entfernst, steht am Ende der [Prometheus-Anleitung](prometheus.md).
