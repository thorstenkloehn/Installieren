# Judge0

Judge0 nimmt Quellcode über eine HTTP-API entgegen und lässt Programme durch getrennte Arbeitsprozesse übersetzen und ausführen.

## Docker und Ubuntu 26.04

Docker ist für dieses Kapitel durch die ausdrückliche Produktwahl erlaubt. **Judge0 CE 1.13.1 lässt sich mit dem dokumentierten offiziellen Docker-Weg dennoch nicht als funktionierende Standardinstallation auf Ubuntu 26.04 darstellen.** Die Bereitstellung setzt cgroup v1 voraus. Ubuntu 26.04 verwendet systemd 259 und cgroup v2; seit systemd 258 wird cgroup v1 nicht mehr unterstützt. Docker liefert keinen eigenen Hostkernel und beseitigt diesen Unterschied nicht.

Die alte GRUB-Einstellung aus der Judge0-Anleitung wird daher hier nicht angewendet. Für CE 1.13.1 kommt eine getrennte VM mit dem dort dokumentierten Ubuntu 22.04 infrage; das ist ein anderes Zielsystem. Ein aktueller, nachweislich cgroup-v2-kompatibler Judge0-Aufbau müsste separat geprüft werden. Die folgenden Schritte laden nur Quellcode und installieren keinen Dienst.

### 1. cgroup-Modus prüfen

Auf dem vorgesehenen Ubuntu 26.04 ist cgroup2fs zu erwarten.

```bash
stat -fc %T /sys/fs/cgroup
```

### 2. systemd-Version prüfen

Zeigt die Version des Hosts; dies ist keine Prüfung eines Judge0-Containers.

```bash
systemd-run --version
```

Quellen: [offizielle Judge0-Bereitstellung](https://github.com/judge0/judge0/blob/master/CHANGELOG.md#deployment-procedure), [systemd-Änderungen zu Version 258](https://github.com/systemd/systemd/blob/main/NEWS) und [Ubuntu-26.04-Paket](https://packages.ubuntu.com/resolute/systemd).

Geprüft wurde der [offizielle Quellstand d0632c](https://github.com/judge0/judge0/tree/d0632cffaaf4fcdbf83a83e7a55ed9baf8a86db6). Die [Bereitstellungsanleitung für CE 1.13.1](https://github.com/judge0/judge0/blob/d0632cffaaf4fcdbf83a83e7a55ed9baf8a86db6/CHANGELOG.md#deployment-procedure) nennt Ubuntu 22.04 und verlangt eine Umstellung auf cgroup v1. Das passt nicht als unveränderte Anleitung für Ubuntu 26.04 mit cgroup v2.

Der [Dockerfile](https://github.com/judge0/judge0/blob/d0632cffaaf4fcdbf83a83e7a55ed9baf8a86db6/Dockerfile) baut auf einem vorbereiteten Compiler-Image auf und setzt Ruby 2.7.0 sowie Bundler 2.1.4 voraus. Für einen nativen Betrieb fehlen damit nicht nur Rails, PostgreSQL und Redis: Auch Compilerbestände, feste Pfade, Sandbox und Startumgebung müssen aufeinander abgestimmt werden. Das Installieren eines gleichnamigen Client-SDKs richtet diese Dienste nicht ein.

Die [Serverskripte](https://github.com/judge0/judge0/tree/d0632cffaaf4fcdbf83a83e7a55ed9baf8a86db6/scripts) enthalten Containerannahmen wie `/api` und einen Start auf allen Netzwerkschnittstellen. Ihre unveränderte Übernahme einschließlich der weitreichenden sudo-Regel aus dem Dockerfile ist keine geeignete Hostinstallation.

## Quellcode zur Vorbereitung prüfen

Die folgenden optionalen Schritte laden ausschließlich Quellcode. Sie installieren weder einen Dienst noch eine Sandbox und ändern keine Bootparameter.

### 1. Paketlisten aktualisieren

Damit Ubuntu die aktuellen Informationen für Git kennt.

```bash
sudo apt update
```

### 2. Git installieren

Wird zum Abrufen und Prüfen des offiziellen Repositorys benötigt.

```bash
sudo apt install git ca-certificates
```

### 3. In das Home-Verzeichnis wechseln

Der Prüfordner wird im eigenen Benutzerkonto angelegt.

```bash
cd ~
```

### 4. Quellcode herunterladen

Der Zielordner darf noch nicht existieren.

```bash
git clone https://github.com/judge0/judge0.git judge0-quellpruefung
```

### 5. Prüfordner öffnen

Die weiteren Befehle beziehen sich auf dieses Repository.

```bash
cd ~/judge0-quellpruefung
```

### 6. Dokumentierten Stand auswählen

So beziehen sich die folgenden Prüfungen auf dieselben Dateien wie dieses Kapitel.

```bash
git checkout --detach d0632cffaaf4fcdbf83a83e7a55ed9baf8a86db6
```

### 7. Offizielle Bereitstellung lesen

Prüfe insbesondere den ersten Abschnitt `Deployment Procedure` und dessen Voraussetzungen.

```bash
less CHANGELOG.md
```

### 8. Native Startannahmen prüfen

Zeigt die Startbefehle; dieser Befehl führt die Skripte nicht aus.

```bash
cat scripts/server scripts/workers
```

## Was für eine native Installation offenbleibt

Eine belastbare Portierung muss die Ruby- und Rails-Abhängigkeiten, Datenbank, Warteschlange, Worker, Compilerpfade, Sandbox mit cgroup v2 sowie eng begrenzte Dienstrechte gemeinsam einrichten und testen. Ein Austausch gegen aktuelles [Isolate](isolate.md) allein erfüllt das nicht. Änderungen an GRUB oder eine pauschale sudo-Freigabe werden hier deshalb nicht als Installationsschritt angeboten.

**Installationsprüfung:** Nach den obigen Schritten ist nur der Quellcode vorhanden. Eine echte Inbetriebnahme müsste mindestens die Sprachliste unter `/languages`, eine erfolgreiche `/submissions`-Anfrage sowie Zeit-, Speicher- und Netzwerkbegrenzungen überprüfen. Ein antwortender Rails-Server allein belegt noch keine funktionierende Sandbox.

Für einen direkt auf Ubuntu installierbaren Ausführungsdienst siehe [Jobe](jobe.md); für eine lokale Sandbox ohne HTTP-API siehe [Isolate](isolate.md). Beide haben andere Schnittstellen und ersetzen Judge0 nicht unverändert.

## Prüfordner entfernen

### 1. Quellcode löschen

Entfernt nur den in dieser Anleitung angelegten Prüfordner. Eigene Änderungen darin gehen verloren. Es wurden keine Judge0-Dienste installiert, die zusätzlich deinstalliert werden müssten.

```bash
rm -rf -- ~/judge0-quellpruefung
```

### 2. Entfernung prüfen

Die Ausgabe soll `Judge0-Prüfordner entfernt` lauten.

```bash
test ! -e ~/judge0-quellpruefung && echo 'Judge0-Prüfordner entfernt'
```

## Lizenz

Judge0 steht unter [GPL-3.0](https://github.com/judge0/judge0/blob/master/LICENSE). Docker ist eine Bereitstellungsform und ändert die Softwarelizenz nicht.
