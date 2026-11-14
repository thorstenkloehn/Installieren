# Anki mit FSRS

Anki verwaltet Lernkarten und plant Wiederholungen mit dem eingebauten FSRS-Planer.

Für Ubuntu 26.04 LTS (amd64). Die Ubuntu-Paketsuche führt kein Anki-Paket für 26.04. Deshalb wird der offizielle Linux-Installer 26.09.4 verwendet. Ein sehr altes Paket aus einer anderen Ubuntu-Version wäre kein geeigneter Ersatz für FSRS.

## Einrichtung

### 1. Paketlisten aktualisieren

Aktualisiert die Informationen für die benötigten Systembibliotheken.

````bash
sudo apt update
````

### 2. Abhängigkeiten installieren

Stellt Download, Archivverarbeitung und die im Handbuch genannten Grafikbibliotheken bereit. Der offizielle Installer kann weitere Systembibliotheken über apt ergänzen.

````bash
sudo apt install curl ca-certificates zstd tar xdg-utils libxcb-xinerama0 libxcb-cursor0 libnss3 libxcb-icccm4 libxcb-keysyms1
````

### 3. Vorhandene Installation prüfen

Falls bereits eine ältere apt-Version installiert ist, sichere zuerst deine Sammlung und entferne dieses Paket vor dem offiziellen Installer. Bei einem neuen Rechner ist keine Entfernung nötig.

````bash
dpkg-query -W anki
````

Nur wenn dabei ein installiertes Paket angezeigt wird:

````bash
sudo apt remove anki
````

### 4. Arbeitsordner anlegen

Verwende einen neuen Zielordner.

````bash
mkdir ~/anki-installation
````

### 5. Arbeitsordner öffnen

Download und entpackte Dateien bleiben zusammen.

````bash
cd ~/anki-installation
````

### 6. Installer laden

Lädt den offiziellen x86_64-Stand. Die Version ist für diese Anleitung festgelegt.

````bash
curl --fail --location --output anki.tar.zst https://github.com/ankitects/anki/releases/download/26.09.4/anki-26.09.4-linux-x86_64.tar.zst
````

### 7. Archiv entpacken

Entfernt die oberste Archivebene, sodass install.sh direkt im Arbeitsordner liegt.

````bash
tar -xaf anki.tar.zst --strip-components=1
````

### 8. Anki installieren

Führt den offiziellen Installer aus. Er legt Anki unter /usr/local ab; Updates laufen danach nicht über Ubuntus apt-Paketverwaltung.

````bash
sudo ./install.sh
````

### 9. Anki starten

Wähle beim ersten Start die gewünschte Sprache.

````bash
anki
````

### 10. Teststapel erstellen

Lege einen neuen Stapel Ubuntu-Test an, damit du die Lernfunktionen mit eigenen Karten ausprobieren kannst.

### 11. FSRS aktivieren

Öffne über das Zahnrad die Stapeloptionen und aktiviere FSRS im entsprechenden Abschnitt. Die Aktivierung gilt global für die Sammlung, nicht nur für den Teststapel. Bei synchronisierten Geräten müssen alle verwendeten Clients FSRS unterstützen.

### 12. Einstellungen speichern

Behalte für den Einstieg den vorgeschlagenen Zielwert für die Erinnerungswahrscheinlichkeit bei. Ein höherer Wert erhöht die tägliche Wiederholungsarbeit. Für die Aktivierung wird kein zusätzliches FSRS-Add-on benötigt.

### 13. Eigene Karte hinzufügen

Lege etwa eine Karte mit der Frage Welcher Befehl zeigt den Arbeitsordner? und der Antwort pwd an.

## Installation prüfen

### 1. Versionsstand kontrollieren

Unter Hilfe → Über Anki muss die installierte Version angezeigt werden. In den Stapeloptionen muss FSRS weiterhin aktiviert sein.

### 2. Lernen ausprobieren

Lerne die Testkarte und bewerte deine tatsächliche Erinnerung. Wenn du die Antwort nicht wusstest, verwende die Bewertung für erneut lernen. Prüfe, dass Anki einen neuen Fälligkeitstermin speichert.

## Deinstallieren

Beende Anki und sichere gewünschte Karten vor dem Entfernen.

### 1. Programm entfernen

Verwendet das mitgelieferte Deinstallationsskript der offiziellen Installation.

````bash
sudo /usr/local/share/anki/uninstall.sh
````

### 2. Arbeitsordner optional löschen

Entfernt das Archiv und die entpackten Installerdateien.

````bash
rm -rf -- ~/anki-installation
````

### 3. Entfernung prüfen

Die Bestätigung erscheint, wenn der offizielle Programmstarter entfernt wurde.

````bash
test ! -e /usr/local/bin/anki && echo 'Anki entfernt'
````

Die Sammlung im Benutzerverzeichnis bleibt erhalten. Die Deinstallation löscht keine Lernkarten und kein AnkiWeb-Konto.

## Quellen und Lizenz

[Ubuntu-Paketsuche](https://packages.ubuntu.com/anki), [offizielle Downloads](https://apps.ankiweb.net/), [Linux-Installation](https://docs.ankiweb.net/platform/linux/installing.html) und [FSRS-Optionen](https://docs.ankiweb.net/deck-options.html#fsrs). Anki Desktop ist freie Software (AGPL-3.0); Inhalte importierter Kartensammlungen haben gesonderte Rechte.
