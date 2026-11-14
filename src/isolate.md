# Isolate

Isolate führt Programme mit begrenzten Ressourcen in einer Linux-Sandbox aus und wird unter anderem für Programmierwettbewerbe eingesetzt.

## Voraussetzungen

Diese Anleitung installiert **IOI Isolate** direkt auf Ubuntu 26.04 LTS (amd64), ohne Docker oder Podman. Die Sandbox verwendet Linux-Namespaces und cgroup v2; diese Betriebssystemfunktionen sind auch ohne Containerverwaltung verfügbar. Isolate stellt keine Weboberfläche und keine HTTP-API bereit.

Der Hersteller bietet ein eigenes APT-Repository mit der Paketserie `resolute-isolate` für Ubuntu 26.04 an. Dort ist zum Recherchezeitpunkt Version 2.7 verfügbar. Grundlage sind das [offizielle Repository](https://www.ucw.cz/isolate/debian/dists/), die [Projektbeschreibung](https://github.com/ioi/isolate) und das [Handbuch](https://www.ucw.cz/isolate/isolate.1.html).

Die Befehle wurden anhand dieser Quellen geprüft, aber auf diesem Rechner nicht ausgeführt. Verwende für fremde Programme einen separaten Ausführungsrechner ohne persönliche Daten. Isolate benötigt privilegierte Systemfunktionen; im folgenden Einzelplatztest werden die Aufrufe ausdrücklich mit `sudo` ausgeführt.

## Installation über APT

### 1. Architektur prüfen

Diese Anleitung setzt die Ausgabe `amd64` voraus.

```bash
dpkg --print-architecture
```

### 2. cgroup-Version prüfen

Ubuntu 26.04 verwendet normalerweise cgroup v2. Die Ausgabe muss `cgroup2fs` lauten; ändere für diese Anleitung keine Kernel-Bootparameter.

```bash
stat -fc %T /sys/fs/cgroup
```

### 3. Paketlisten aktualisieren

Lädt die aktuellen Paketinformationen der bereits eingerichteten Quellen.

```bash
sudo apt update
```

### 4. Downloadwerkzeuge installieren

`curl` lädt den Repository-Schlüssel über HTTPS.

```bash
sudo apt install curl ca-certificates nano
```

### 5. Schlüsselverzeichnis anlegen

Hier legt APT die Schlüssel zusätzlich eingerichteter Paketquellen ab.

```bash
sudo install -d -m 0755 /etc/apt/keyrings
```

### 6. Herstellerschlüssel herunterladen

Der Schlüssel wird im nächsten Schritt ausschließlich dieser Paketquelle zugeordnet.

```bash
sudo curl --fail --location https://www.ucw.cz/isolate/debian/signing-key.asc --output /etc/apt/keyrings/isolate.asc
```

### 7. Schlüsseldatei lesbar machen

Damit auch der eingeschränkte APT-Downloadbenutzer die Signatur prüfen kann.

```bash
sudo chmod 0644 /etc/apt/keyrings/isolate.asc
```

### 8. Paketquelle eintragen

Öffne die neue Datei und trage den folgenden Inhalt ein. `resolute-isolate` ist die Ubuntu-26.04-Serie; verwende hier keine Debian-Serie.

```bash
sudo nano /etc/apt/sources.list.d/isolate.sources
```

```text
Types: deb
URIs: https://www.ucw.cz/isolate/debian/
Suites: resolute-isolate
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/isolate.asc
```

Speichere mit **Strg+O**, bestätige mit **Enter** und beende nano mit **Strg+X**.

### 9. Paketlisten erneut aktualisieren

Macht die Pakete der neuen Quelle verfügbar. Bei Signaturfehlern zuerst die Quelle und den Schlüssel prüfen; die Signaturprüfung nicht abschalten.

```bash
sudo apt update
```

### 10. Paketkandidaten prüfen

Die Ausgabe soll das Hersteller-Repository und Version 2.7 oder eine neuere Version ausweisen. Installiere keine alte 1.x-Fassung nach dieser Anleitung.

```bash
apt-cache policy isolate
```

### 11. Isolate installieren

APT richtet das Programm, seine Konfiguration und die Systemintegration ein.

```bash
sudo apt install isolate
```

### 12. cgroup-Dienst starten

Der Dienst hält den von systemd an Isolate delegierten cgroup-Bereich bereit. Er soll auch nach einem Neustart verfügbar sein.

```bash
sudo systemctl enable --now isolate.service
```

**Prüfen:** Die Ausgabe soll `active` lauten.

```bash
systemctl is-active isolate.service
```

## Installation praktisch prüfen

### 13. Programmversion abfragen

Verwende ausdrücklich das über APT installierte Programm unter `/usr/bin`, falls zuvor eine selbst gebaute Fassung unter `/usr/local/bin` installiert wurde.

```bash
sudo /usr/bin/isolate --version
```

### 14. Test-Sandbox anlegen

Verwendet die Box-ID 42. Diese ID muss frei sein: `--init` kann eine bereits vorhandene Box zurücksetzen. Die Ausgabe nennt das Sandbox-Verzeichnis.

```bash
sudo /usr/bin/isolate --cg --box-id=42 --init
```

### 15. Eigenes Testprogramm ausführen

Das harmlose Beispiel gibt einen Text aus. CPU-Zeit, verstrichene Zeit und cgroup-Speicher werden begrenzt; der Speicherwert ist in KiB angegeben.

```bash
sudo /usr/bin/isolate --cg --box-id=42 --time=1 --wall-time=5 --cg-mem=65536 --processes=1 --run -- /usr/bin/printf 'Isolate funktioniert\n'
```

**Prüfen:** Neben `Isolate funktioniert` sollte eine erfolgreiche Statusmeldung erscheinen. Bei cgroup-Fehlern zuerst den Dienst und dessen Journal prüfen.

```bash
sudo journalctl -u isolate.service -n 30 --no-pager
```

### 16. Test-Sandbox entfernen

Gibt die Testbox und ihre Ressourcen wieder frei. Führe dies auch nach einem fehlgeschlagenen Test aus.

```bash
sudo /usr/bin/isolate --cg --box-id=42 --cleanup
```

Isolate 2.x ist nicht automatisch ein kompatibler Ersatz für die in [Judge0](judge0.md) oder [Piston](piston.md) eingebauten älteren beziehungsweise angepassten Sandbox-Versionen. Vor einer solchen Integration müssen Aufrufoptionen, Verzeichnisse und Ressourcenbegrenzungen gemeinsam geprüft werden.

## Deinstallieren

### 1. Eigene Sandbox-Jobs beenden

Beende alle Anwendungen, die diese Isolate-Installation verwenden. Räume ihre Boxen vor dem Entfernen des Programms jeweils mit der zugehörigen Box-ID und `--cleanup` auf.

### 2. Dienst deaktivieren

Stoppt den cgroup-Hilfsdienst und seinen automatischen Start.

```bash
sudo systemctl disable --now isolate.service
```

### 3. Paket entfernen

Entfernt Isolate und paketverwaltete Konfigurationen.

```bash
sudo apt purge isolate
```

### 4. Paketquelle entfernen

Damit APT die zusätzliche Quelle nicht mehr abfragt.

```bash
sudo rm -- /etc/apt/sources.list.d/isolate.sources
```

### 5. Repository-Schlüssel entfernen

Der nur für diese Quelle verwendete Schlüssel wird nicht mehr benötigt.

```bash
sudo rm -- /etc/apt/keyrings/isolate.asc
```

### 6. Paketlisten aktualisieren

Übernimmt die entfernte Quelle in den lokalen Paketinformationen.

```bash
sudo apt update
```

**Prüfen:** Der folgende Befehl soll melden, dass `/usr/bin/isolate` entfernt wurde. Andere manuell installierte Fassungen werden davon nicht erfasst.

```bash
test ! -e /usr/bin/isolate && echo 'APT-Installation von Isolate entfernt'
```

## Lizenz und Betriebsart

IOI Isolate steht unter GPL-2.0-or-later. Dieses Kapitel installiert es direkt, ohne Docker.
