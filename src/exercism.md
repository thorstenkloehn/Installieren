# Exercism-CLI

Die Exercism-CLI lädt Programmieraufgaben herunter und kann Lösungen an Exercism übertragen.

Die Anleitung gilt für Ubuntu 26.04 LTS (amd64). Verwendet wird die offizielle Linux-x86_64-Binärdatei von Version 3.5.9. Für Downloads von Aufgaben brauchst du ein Exercism-Konto; Sprachwerkzeuge werden separat installiert.

## Installation

### 1. Paketlisten aktualisieren

Aktualisiert die Paketinformationen vor dem Installieren der Downloadwerkzeuge.

````bash
sudo apt update
````

### 2. Werkzeuge installieren

curl lädt das Archiv; Python dient später als Laufzeit für die Beispielaufgabe.

````bash
sudo apt install curl ca-certificates tar python3
````

### 3. Downloadordner anlegen

Verwende einen neuen Ordner, damit keine vorhandenen Dateien überschrieben werden.

````bash
mkdir ~/exercism-installation
````

### 4. Downloadordner öffnen

Die folgenden Dateien liegen nur in diesem Ordner.

````bash
cd ~/exercism-installation
````

### 5. Programm herunterladen

Wählt x86_64, die passende Architektur für Ubuntu amd64.

````bash
curl --fail --location --output exercism-3.5.9-linux-x86_64.tar.gz https://github.com/exercism/cli/releases/download/v3.5.9/exercism-3.5.9-linux-x86_64.tar.gz
````

### 6. Prüfsummen herunterladen

Die offizielle Release-Datei enthält die erwarteten SHA-256-Werte.

````bash
curl --fail --location --output exercism_checksums.txt https://github.com/exercism/cli/releases/download/v3.5.9/exercism_checksums.txt
````

### 7. Archiv prüfen

Es muss OK erscheinen. Bei einer Abweichung hier anhalten und das Archiv nicht ausführen.

````bash
grep -E '(^|[ /])exercism-3\.5\.9-linux-x86_64\.tar\.gz$' exercism_checksums.txt | sha256sum --check --strict
````

### 8. Programm entpacken

Entpackt nur die benötigte Binärdatei.

````bash
tar -xzf exercism-3.5.9-linux-x86_64.tar.gz exercism
````

### 9. CLI installieren

Legt das Programm unter /usr/local/bin ab. Eine dort vorhandene Exercism-Version wird ersetzt.

````bash
sudo install -m 0755 exercism /usr/local/bin/exercism
````

### 10. CLI prüfen

Bestätigt, dass das installierte Programm ausführbar ist.

````bash
exercism version
````

### 11. API-Token ermitteln

Melde dich auf Exercism an und öffne die Einstellungen für den API-Token. Der Token ist ein Zugangsschlüssel und gehört nicht in Kursdateien oder Git-Repositorys.

### 12. Token verdeckt einlesen

Füge den eigenen Token ein und drücke Enter. Er erscheint nicht im Terminal und nicht als Klartextbefehl in der Shell-Historie.

````bash
read -r -s -p 'Exercism-Token: ' exercism_token
````

### 13. CLI zuordnen

Speichert die Kontozuordnung in der lokalen CLI-Konfiguration.

````bash
exercism configure --token="$exercism_token"
````

### 14. Temporäre Variable entfernen

Der Token bleibt nur in der CLI-Konfiguration gespeichert.

````bash
unset exercism_token
````

### 15. Python-Aufgabe laden

Lädt die Einstiegsaufgabe. Öffne nötigenfalls zuerst den Python-Track auf Exercism und folge dessen Freischaltungshinweisen. Das Terminal nennt den Zielordner.

````bash
exercism download --track=python --exercise=hello-world
````

### 16. Aufgabenordner öffnen

Bei unveränderter CLI-Konfiguration ist dies der Standardpfad. Verwende sonst den im vorherigen Schritt gemeldeten Pfad.

````bash
cd ~/Exercism/python/hello-world
````

### 17. Tests ausführen

Die Tests schlagen vor dem Lösen gewöhnlich fehl. Bearbeite anschließend die Lösungsdatei anhand der Aufgabenbeschreibung und wiederhole die Prüfung.

````bash
python3 -m unittest discover -p "*_test.py"
````

## Installation prüfen

### 1. Version erneut anzeigen

Prüft die CLI unabhängig von der Aufgabe.

````bash
exercism version
````

Eine bestandene lokale Aufgabe und der erfolgreiche Download prüfen zusätzlich Laufzeit und Kontozugriff. Eine Abgabe erfolgt nur bewusst mit dem in der Aufgabe genannten submit-Befehl; diese Anleitung überträgt keine Lösung automatisch.

## Deinstallieren

### 1. CLI entfernen

Löscht nur die hier installierte Binärdatei.

````bash
sudo rm -- /usr/local/bin/exercism
````

### 2. Downloadordner löschen

Entfernt das Installationsarchiv und seine entpackte Kopie.

````bash
rm -rf -- ~/exercism-installation
````

### 3. Entfernung prüfen

Es soll eine Bestätigung erscheinen.

````bash
test ! -e /usr/local/bin/exercism && echo 'Exercism-CLI entfernt'
````

Aufgaben unter ~/Exercism und die Kontokonfiguration bleiben erhalten. Soll auch der Kontozugriff entfallen, widerrufe den Token in den Exercism-Kontoeinstellungen und lösche nur die zu Exercism gehörenden Konfigurationsdateien; ihre Lage lässt sich vor dem Entfernen mit exercism troubleshoot ermitteln.

## Quellen und Lizenz

[Offizielle Releases](https://github.com/exercism/cli/releases/tag/v3.5.9), [CLI-Quellcode](https://github.com/exercism/cli) und [lokal arbeiten](https://exercism.org/docs/using/solving-exercises/working-locally/). Lizenz der CLI: MIT.
