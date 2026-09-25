# Freeplane

Freeplane ist ein Programm für Mindmaps: Gedanken, Notizen und Wissen werden als Baum aus Knoten um ein zentrales Thema angeordnet, mit Verbindungen, Symbolen, Notizen und Attributen. Jede Mindmap ist eine offene XML-Datei mit der Endung `.mm`.

## Vorbemerkungen

- **Warum nicht die Version aus apt:** Ubuntu 26.04 enthält Freeplane nur in der alten Version 1.7.10 von 2019. Im Test startete sie zwar, aber ihr Skript-Modul brach mit einer Fehlermeldung ab, weil es eine Java-Funktion nutzt, die es in neuen Java-Versionen nicht mehr gibt. Diese Anleitung installiert deshalb die aktuelle `.deb`-Datei des Projekts. Das Paket wird trotzdem mit `apt` installiert, so kümmert sich `apt` um die Abhängigkeiten und die spätere Deinstallation.
- **Version:** Getestet mit Freeplane **1.13.3** unter Ubuntu 26.04.
- **Java:** Freeplane ist in Java geschrieben und läuft laut seinem Startskript nur mit Java 8 oder 11 bis 23. Ubuntu 26.04 bringt als Standard Java 25 mit, eventuell ist auch Java 26 installiert (siehe [Java](java.md)). Beide sind zu neu. Die Anleitung installiert deshalb zusätzlich Java 21, eine Version mit Langzeitpflege, und stellt Freeplane darauf ein. Das übrige System nutzt weiter sein Standard-Java.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von Java 21 kennt.

```bash
sudo apt update
```

### 2. Java 21 installieren

`openjdk-21-jre` ist die Laufzeitumgebung von Java 21, also alles, was zum Ausführen von Java-Programmen nötig ist. Sie wird neben einem vorhandenen Java installiert und ändert nicht, welches Java der Befehl `java` startet.

```bash
sudo apt install openjdk-21-jre
```

**Prüfen:** Die Ausgabe beginnt mit `openjdk version "21`.

```bash
/usr/lib/jvm/java-21-openjdk-amd64/bin/java -version
```

### 3. Freeplane herunterladen

Lädt das Paket (etwa 70 MB) von SourceForge, wo das Projekt seine Versionen veröffentlicht, in den Ordner `/tmp`. Die aktuelle Versionsnummer steht auf <https://sourceforge.net/projects/freeplane/files/freeplane%20stable/>. Bei einer neueren Version ersetzt du die Nummer im Befehl.

```bash
wget -O /tmp/freeplane.deb https://sourceforge.net/projects/freeplane/files/freeplane%20stable/freeplane_1.13.3.upstream-1_all.deb/download
```

### 4. Download prüfen

Vergleicht die Prüfsumme der Datei mit dem Wert, den SourceForge für Version 1.13.3 angibt. So fällt auf, wenn der Download beschädigt oder verändert wurde. Bei einer anderen Version steht die passende Prüfsumme auf der Download-Seite hinter dem Info-Symbol (i) der Datei.

```bash
echo "28cb439457c282e6f598daa6d21a611379b650e7  /tmp/freeplane.deb" | sha1sum -c
```

**Prüfen:** Die Ausgabe lautet `/tmp/freeplane.deb: OK`.

### 5. Freeplane installieren

Der Pfad mit `/` am Anfang sagt `apt`, dass es eine lokale Datei installieren soll und kein Paket aus den Paketquellen. `apt` installiert dabei auch das Standard-Java von Ubuntu mit, weil das Paket es als Abhängigkeit angibt.

```bash
sudo apt install /tmp/freeplane.deb
```

**Prüfen:** Die Zeile beginnt mit `ii` und enthält `1.13.3~upstream-1`.

```bash
dpkg -l freeplane
```

## Einrichten

### 6. Ordner für die Einstellungen anlegen

Das Startskript von Freeplane liest beim Start die Datei `/etc/freeplane/freeplanerc`, falls es sie gibt. Den Ordner dafür legt das Paket nicht an.

```bash
sudo mkdir -p /etc/freeplane
```

### 7. Java 21 für Freeplane festlegen

Ohne diese Einstellung nimmt Freeplane das Standard-Java, bricht wegen der zu neuen Version ab und meldet `Currently, freeplane requires java version 8 or from 11 to 23`.

```bash
sudo nano /etc/freeplane/freeplanerc
```

Füge diese Zeile ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
FREEPLANE_JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
```

Die Einstellung gilt für alle Benutzer des Rechners, egal ob Freeplane im Terminal oder über das Startmenü gestartet wird.

### 8. Freeplane zum ersten Mal starten

Startet Freeplane aus dem Terminal. So siehst du Fehlermeldungen sofort. Später startest du Freeplane über das Startmenü (Suchbegriff „Freeplane“).

```bash
freeplane
```

**Prüfen:** Nach einigen Sekunden öffnet sich das Fenster mit deutscher Oberfläche und einer leeren Mindmap. Im Terminal steht eine Zeile mit `freeplane_version = 1.13.3` und `java_version = 21`. Warnungen wie `Could not read update url` erscheinen nur ohne Internetverbindung und sind harmlos.

## Erste Schritte

### 9. Eine Mindmap aufbauen

Klicke auf den mittleren Knoten und tippe ein Thema, z. B. `Urlaub`. Die wichtigsten Tasten:

- <kbd>Tab</kbd> – neuer Unterknoten unter dem markierten Knoten
- <kbd>Enter</kbd> – neuer Knoten auf derselben Ebene
- <kbd>F2</kbd> – Text des markierten Knotens bearbeiten
- <kbd>Leertaste</kbd> – Äste ein- und ausklappen
- <kbd>Strg</kbd>+<kbd>N</kbd> – neue, leere Mindmap

### 10. Mindmap speichern

Speichere mit <kbd>Strg</kbd>+<kbd>S</kbd> und gib einen Dateinamen an, z. B. `urlaub.mm` im persönlichen Ordner.

**Prüfen:** Die Datei ist eine lesbare XML-Datei. Die erste Zeile beginnt mit `<map version=`.

```bash
head -1 ~/urlaub.mm
```

## Aktualisieren

Eine neue Version lädst du wie in Schritt 3 herunter, prüfst sie wie in Schritt 4 mit der Prüfsumme von der Download-Seite und installierst sie wie in Schritt 5. `apt` ersetzt dabei die alte Version. Die Datei `/etc/freeplane/freeplanerc` und deine Mindmaps bleiben erhalten. Steht in der Versionsliste des neuen Startskripts eine höhere Java-Version als 23, kann die Einstellung aus Schritt 7 entfallen.

## Deinstallieren

### 1. Freeplane entfernen

`purge` entfernt das Programm samt seiner Systemdateien.

```bash
sudo apt purge freeplane
```

### 2. Einstellungsdatei löschen

Die Datei aus Schritt 7 gehört nicht zum Paket und wird deshalb nicht mit entfernt.

```bash
sudo rm -r /etc/freeplane
```

### 3. Java 21 entfernen

Nur ausführen, wenn kein anderes Programm Java 21 braucht.

```bash
sudo apt purge openjdk-21-jre openjdk-21-jre-headless
```

### 4. Nicht mehr benötigte Pakete entfernen

Entfernt Pakete, die automatisch mitinstalliert wurden und die kein anderes Programm mehr braucht. Lies vor dem Bestätigen die Liste. Das Standard-Java aus Schritt 5 bleibt dabei oft installiert, weil andere Pakete des Systems es empfehlen. Das ist harmlos.

```bash
sudo apt autoremove --purge
```

### 5. Persönliche Einstellungen löschen

Freeplane legt im persönlichen Ordner Einstellungen, zuletzt geöffnete Dateien und eigene Skripte ab. Deine Mindmaps (`.mm`-Dateien) liegen woanders und bleiben erhalten.

```bash
rm -r ~/.config/freeplane
```

**Prüfen:** Der Befehl `freeplane` wird nicht mehr gefunden.

```bash
freeplane
```
