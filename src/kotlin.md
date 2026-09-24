# Kotlin

Kotlin ist eine moderne Programmiersprache von JetBrains, die auf der Java-Plattform läuft und mit Java-Code direkt zusammenarbeitet. Sie ist die bevorzugte Sprache für Android-Apps und wird zunehmend auch für Serveranwendungen, z. B. mit [Spring Boot](spring-boot.md), eingesetzt.

## Vorbemerkungen

- **Warum nicht apt?** Ubuntu 26.04 enthält zwar ein Paket `kotlin`, aber in der sehr alten Version 1.3 von 2019. Viele heutige Sprachmerkmale und Bibliotheken funktionieren damit nicht. Diese Anleitung installiert deshalb den Compiler als **Snap**, die JetBrains selbst veröffentlicht und aktuell hält (derzeit **Kotlin 2.4**).
- **Java wird gebraucht:** Kotlin übersetzt Programme in Bytecode für die Java Virtual Machine. Zum Übersetzen und Ausführen braucht man deshalb ein JDK. Das kommt wie in der Anleitung [Java](java.md) aus apt.
- **Kommandozeile oder Gradle:** Für einzelne Dateien und zum Lernen reicht der Kommandozeilen-Compiler `kotlinc`. Größere Projekte baut man mit **Gradle**, das meist von der Entwicklungsumgebung mitgebracht wird. Auch das Gradle-Paket von Ubuntu ist stark veraltet und wird hier nicht verwendet.
- **Entwicklungsumgebung:** [IntelliJ IDEA](intellij-idea.md) stammt ebenfalls von JetBrains und unterstützt Kotlin ohne Erweiterung am besten. Neue Kotlin-Projekte legt man dort mit dem Assistenten an; er richtet Gradle automatisch ein.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. JDK installieren

Installiert OpenJDK 25, das Kotlin zum Übersetzen und Ausführen braucht. Ist es aus der Anleitung [Java](java.md) schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install default-jdk
```

**Prüfen:** Die Ausgabe beginnt mit `openjdk version "25…"`.

```bash
java -version
```

### 3. Kotlin-Compiler als Snap installieren

Installiert die Befehle `kotlinc` (Compiler) und `kotlin` (startet Programme und Skripte). Der Schalter `--classic` ist nötig, weil der Compiler auf das JDK und auf Dateien außerhalb der Snap-Umgebung zugreifen muss.

```bash
sudo snap install kotlin --classic
```

**Prüfen:** Die Ausgabe nennt die Version, z. B. `info: kotlinc-jvm 2.4.20 (JRE 25…)`.

```bash
kotlinc -version
```

## Erstes Programm

### 4. Arbeitsordner anlegen

Ein eigener Ordner für die Übungsdateien.

```bash
mkdir -p ~/kotlin-uebung
```

### 5. In den Ordner wechseln

Alle folgenden Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/kotlin-uebung
```

### 6. Quelltext anlegen

Legt `hallo.kt` an. Eine `data class` ist eine Klasse, die nur Daten hält; Kotlin erzeugt dafür Vergleich, Textausgabe und Kopierfunktion automatisch. `sortedBy` und `maxBy` arbeiten mit einer kurzen Funktion in geschweiften Klammern, in der `it` für das jeweilige Element steht.

```bash
nano hallo.kt
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```kotlin
data class Sprache(val name: String, val jahr: Int)

fun main() {
    val sprachen = listOf(
        Sprache("Java", 1995),
        Sprache("Kotlin", 2016),
        Sprache("Go", 2009),
    )

    for (s in sprachen.sortedBy { it.jahr }) {
        println("${s.name} (${s.jahr})")
    }

    val neueste = sprachen.maxBy { it.jahr }
    println("Am neuesten: ${neueste.name}")
}
```

### 7. Programm übersetzen

Übersetzt den Quelltext in die Datei `hallo.jar`. Der Schalter `-include-runtime` packt die Kotlin-Standardbibliothek mit hinein, damit das Programm später mit dem gewöhnlichen Befehl `java` läuft. Das Übersetzen dauert einige Sekunden.

```bash
kotlinc hallo.kt -include-runtime -d hallo.jar
```

**Prüfen:** Im Ordner liegt jetzt `hallo.jar`.

```bash
ls -l hallo.jar
```

### 8. Programm starten

Startet das Programm mit der Java-Laufzeitumgebung. Kotlin selbst muss auf dem Zielrechner nicht installiert sein.

```bash
java -jar hallo.jar
```

**Prüfen:** Die Sprachen erscheinen nach Erscheinungsjahr sortiert:

```text
Java (1995)
Go (2009)
Kotlin (2016)
Am neuesten: Kotlin
```

## Kotlin-Skripte

### 9. Skript anlegen

Dateien mit der Endung `.main.kts` sind Skripte: Die Anweisungen stehen direkt in der Datei, eine Funktion `main` ist nicht nötig. Das eignet sich für kleine Hilfsprogramme.

```bash
nano rechnen.main.kts
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```kotlin
val zahlen = (1..10).toList()
println("Summe: ${zahlen.sum()}")
println("Gerade Zahlen: ${zahlen.filter { it % 2 == 0 }}")
```

### 10. Skript ausführen

Der Befehl `kotlin` übersetzt das Skript im Hintergrund und führt es sofort aus.

```bash
kotlin rechnen.main.kts
```

**Prüfen:** Die Ausgabe lautet:

```text
Summe: 55
Gerade Zahlen: [2, 4, 6, 8, 10]
```

## Wie geht es weiter?

- **Projekte mit Gradle:** In [IntelliJ IDEA](intellij-idea.md) über *File → New → Project → Kotlin* ein Projekt mit „Gradle“ als Build-System anlegen. Das Projekt enthält dann ein Startskript `./gradlew`, das die passende Gradle-Version selbst herunterlädt; `./gradlew run` startet das Programm.
- **Interaktiv ausprobieren:** `kotlinc` ohne weitere Angaben öffnet eine Eingabezeile für einzelne Anweisungen. Beenden mit `:quit`.
- **Aktualisierungen:** Snaps werden automatisch im Hintergrund aktualisiert. Wer bei einer Hauptversion bleiben möchte, wechselt den Kanal, z. B. `sudo snap refresh kotlin --channel=2.4/stable`.
- **Serveranwendungen:** [Spring Boot](spring-boot.md) unterstützt Kotlin als gleichwertige Alternative zu Java.

## Deinstallieren

### 1. Übungsordner entfernen

Löscht die Beispieldateien.

```bash
rm -rf ~/kotlin-uebung
```

### 2. Kotlin-Snap entfernen

Entfernt den Compiler. `--purge` löscht dabei auch die automatische Sicherung, die `snap` sonst beim Entfernen anlegt.

```bash
sudo snap remove --purge kotlin
```

### 3. Optional: JDK entfernen

Nur ausführen, wenn Java auch nicht mehr gebraucht wird, z. B. für die Anleitungen [Java](java.md) oder [Spring Boot](spring-boot.md). Die genauen Schritte stehen im Abschnitt „Deinstallieren“ der Anleitung [Java](java.md).

```bash
sudo apt purge default-jdk default-jdk-headless openjdk-25-jdk openjdk-25-jdk-headless
```

```bash
sudo apt autoremove
```

**Prüfen:** Die Meldung lautet `kotlinc: Befehl nicht gefunden` bzw. `command not found`.

```bash
kotlinc -version
```
