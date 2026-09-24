# IntelliJ IDEA

IntelliJ IDEA ist eine Entwicklungsumgebung (IDE) von JetBrains, vor allem für Java und Kotlin. Sie bietet intelligente Codevervollständigung, Refactoring, einen Debugger und eingebaute Unterstützung für Maven, Gradle und Git.

## Vorbemerkungen

- **Eine Version für alle:** IntelliJ IDEA gibt es seit Version 2025.3 nur noch als ein gemeinsames Produkt. Die frühere „Community Edition“ ist darin aufgegangen: Ihr Funktionsumfang bleibt kostenlos, auch für kommerzielle Projekte. Weitere Funktionen (früher „Ultimate“) erfordern ein Abo, das 30 Tage kostenlos getestet werden kann.
- **Kein apt-Paket:** In den Ubuntu-Paketquellen gibt es Pakete wie `libintellij-platform-api-java`. Das sind nur Programmbibliotheken aus der IntelliJ-Plattform, auf der alle JetBrains-IDEs aufbauen, nicht die IDE selbst. Diese Anleitung installiert IntelliJ IDEA deshalb als Snap. Das Snap wird von JetBrains selbst veröffentlicht.
- **Speicherplatz:** Das Snap ist knapp 2 GB groß.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version des Java-Entwicklungspakets im nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. Java-Entwicklungspaket (JDK) installieren

IntelliJ IDEA bringt für sich selbst eine eigene Java-Laufzeit mit. Um eigene Java-Programme zu übersetzen und auszuführen, brauchst du aber ein JDK. `default-jdk` installiert die aktuelle Java-Version mit Langzeitunterstützung aus den Ubuntu-Paketquellen (derzeit Java 25).

```bash
sudo apt install default-jdk
```

**Prüfen:** Die Ausgabe nennt die Java-Version, z. B. `javac 25`.

```bash
javac -version
```

### 3. IntelliJ IDEA installieren

Installiert IntelliJ IDEA als Snap. `--classic` ist nötig, weil eine IDE uneingeschränkt auf deine Dateien, das JDK und andere Programme zugreifen muss.

```bash
sudo snap install intellij-idea --classic
```

**Prüfen:** Die Ausgabe zeigt Name, Version (z. B. `2026.2.3`) und als Herausgeber `jetbrains`.

```bash
snap list intellij-idea
```

## Erste Schritte

### 4. IntelliJ IDEA starten

Öffne das Anwendungsmenü und starte **IntelliJ IDEA**. Beim ersten Start fragt das Programm nach den Nutzungsbedingungen und ob anonyme Nutzungsdaten gesendet werden dürfen. Das Senden kannst du ablehnen.

**Prüfen:** Es erscheint der Willkommensbildschirm mit den Schaltflächen **New Project** und **Open**.

### 5. Kostenlose Nutzung wählen

Wenn IntelliJ IDEA nach einer Lizenz fragt, wähle die kostenlose Nutzung (nicht die Testversion des Abos). Damit stehen alle Grundfunktionen dauerhaft zur Verfügung. Das Abo kannst du später jederzeit über **Help → Register** freischalten.

### 6. Deutsche Oberfläche einrichten

Die Oberfläche ist zunächst auf Englisch. Öffne im Willkommensbildschirm **Customize → Language** (oder in einem Projekt **File → Settings → Appearance & Behavior → System Settings → Language and Region**), wähle **Deutsch** und starte IntelliJ IDEA neu. Fehlt Deutsch in der Liste, installiere zuerst unter **Plugins** das Sprachpaket „German Language Pack“.

### 7. Erstes Projekt anlegen

Klicke auf **New Project**. Wähle als Sprache **Java** und als Build-System **Maven** oder **Gradle**. Unter **JDK** sollte das in Schritt 2 installierte JDK erscheinen (Pfad `/usr/lib/jvm/...`). Mit **Create** wird das Projekt angelegt.

**Prüfen:** Öffne die Datei `Main.java` und klicke auf den grünen Pfeil neben `main`. Unten im Ausführungsfenster erscheint die Ausgabe des Programms.

### 8. Die wichtigsten Tastenkürzel kennenlernen

| Tasten | Wirkung |
|---|---|
| 2 × <kbd>Umschalt</kbd> | Überall suchen: Dateien, Klassen, Aktionen, Einstellungen |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>A</kbd> | Aktion über ihren Namen suchen |
| <kbd>Alt</kbd>+<kbd>Enter</kbd> | Lösungsvorschläge für die markierte Stelle anzeigen |
| <kbd>Strg</kbd>+<kbd>Leertaste</kbd> | Codevervollständigung |
| <kbd>Umschalt</kbd>+<kbd>F10</kbd> | Programm ausführen |
| <kbd>Umschalt</kbd>+<kbd>F9</kbd> | Programm im Debugger ausführen |
| <kbd>Strg</kbd>+<kbd>Alt</kbd>+<kbd>L</kbd> | Code formatieren |
| <kbd>Umschalt</kbd>+<kbd>F6</kbd> | Umbenennen (überall im Projekt) |
| <kbd>Alt</kbd>+<kbd>F12</kbd> | Terminal ein- und ausblenden |

**Hinweis:** <kbd>Strg</kbd>+<kbd>Alt</kbd>+<kbd>L</kbd> sperrt unter Ubuntu eventuell den Bildschirm, bevor IntelliJ IDEA die Tasten erhält. In diesem Fall formatierst du den Code über **Code → Reformat Code**.

## Optional: Mehr Dateien überwachen

### 9. Grenze für Dateiüberwachung erhöhen

IntelliJ IDEA lässt sich vom System melden, wenn sich Dateien im Projekt ändern. Bei großen Projekten reicht die Voreinstellung von Ubuntu dafür nicht aus, dann erscheint ein Hinweis „External file changes sync might be slow“. Nur in diesem Fall ist der Schritt nötig. Die Datei unter `/etc/sysctl.d` hebt die Grenze dauerhaft an.

```bash
sudo nano /etc/sysctl.d/60-jetbrains.conf
```

Die Datei ist neu und leer. Füge diese Zeile ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
fs.inotify.max_user_watches = 524288
```

### 10. Neue Grenze sofort übernehmen

Lädt die Einstellungen neu, damit du nicht neu starten musst. Danach IntelliJ IDEA neu starten.

```bash
sudo sysctl --system
```

**Prüfen:** Die Ausgabe lautet `524288`.

```bash
cat /proc/sys/fs/inotify/max_user_watches
```

## Aktualisieren

Snaps aktualisieren sich automatisch im Hintergrund. Sofort aktualisieren kannst du mit:

```bash
sudo snap refresh intellij-idea
```

## Deinstallieren

### 1. IntelliJ IDEA entfernen

Entfernt das Snap. `--purge` verhindert, dass Snap vorher eine Sicherungskopie der Snap-Daten anlegt.

```bash
sudo snap remove --purge intellij-idea
```

### 2. Einstellungen, Plugins und Zwischenspeicher entfernen

IntelliJ IDEA speichert seine Daten in Ordnern, deren Name mit `IntelliJIdea` beginnt, gefolgt von der Version. Ordner anderer JetBrains-Programme (z. B. der Toolbox) bleiben erhalten. **Achtung:** Deine IDE-Einstellungen und installierten Plugins gehen verloren. Deine Projekte selbst werden nicht gelöscht.

```bash
rm -rf ~/.config/JetBrains/IntelliJIdea* ~/.cache/JetBrains/IntelliJIdea* ~/.local/share/JetBrains/IntelliJIdea*
```

### 3. Einstellung zur Dateiüberwachung entfernen

Nur nötig, wenn du Schritt 9 ausgeführt hast. Die höhere Grenze gilt dann ab dem nächsten Neustart nicht mehr.

```bash
sudo rm /etc/sysctl.d/60-jetbrains.conf
```

### 4. Optional: JDK entfernen

Nur ausführen, wenn kein anderes Programm Java braucht.

```bash
sudo apt purge default-jdk
```

```bash
sudo apt autoremove
```

**Prüfen:** Die Ausgabe meldet, dass kein Snap namens `intellij-idea` installiert ist.

```bash
snap list intellij-idea
```
