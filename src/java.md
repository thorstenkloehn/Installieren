# Java

Java ist eine objektorientierte Programmiersprache, deren Programme auf einer virtuellen Maschine laufen und dadurch ohne Änderung unter Linux, Windows und macOS funktionieren. Sie ist in Unternehmensanwendungen, Android-Apps und Serverprogrammen weit verbreitet.

## Vorbemerkungen

- **JDK und JRE:** Zum Programmieren braucht man das **JDK** (Java Development Kit) mit Compiler `javac`. Die **JRE** (Java Runtime Environment) allein kann Programme nur ausführen. Das JDK enthält die Laufzeitumgebung bereits.
- **OpenJDK 25:** Ubuntu 26.04 liefert **OpenJDK 25**, die aktuelle Version mit Langzeitunterstützung (LTS). Das Paket `default-jdk` verweist darauf und wird bei künftigen Ubuntu-Versionen automatisch auf die dann aktuelle LTS-Version umgestellt. Ältere und neuere Versionen (z. B. `openjdk-21-jdk`, `openjdk-26-jdk`) lassen sich zusätzlich installieren.
- **Kompakte Quelldateien:** Seit Java 25 darf ein kleines Programm ohne Klassendeklaration und ohne `public static` geschrieben werden. Das senkt die Einstiegshürde deutlich; die Anleitung zeigt beide Schreibweisen.
- **Entwicklungsumgebung:** Für größere Projekte eignen sich [IntelliJ IDEA](intellij-idea.md), [Eclipse IDE](eclipse.md) oder [Visual Studio Code](vscode.md) mit dem „Extension Pack for Java“.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. JDK installieren

Installiert OpenJDK 25 mit Compiler `javac`, Laufzeitumgebung `java` und weiteren Werkzeugen wie `jshell`.

```bash
sudo apt install default-jdk
```

**Prüfen:** Die Ausgabe beginnt mit `openjdk version "25…"`.

```bash
java -version
```

**Prüfen:** Auch der Compiler ist vorhanden.

```bash
javac -version
```

### 3. Optional: Build-Werkzeug Maven installieren

Maven lädt benötigte Bibliotheken automatisch herunter und baut Projekte nach einem festen Schema. Es wird z. B. für [Spring Boot](spring-boot.md) gebraucht.

```bash
sudo apt install maven
```

**Prüfen:**

```bash
mvn -version
```

### 4. Optional: Zwischen mehreren Java-Versionen wechseln

Nur nötig, wenn mehrere JDKs installiert sind. Der Befehl zeigt eine nummerierte Liste; die Eingabe der Nummer legt fest, welche Version der Befehl `java` startet. Für `javac` gibt es den gleichen Befehl mit `javac` am Ende.

```bash
sudo update-alternatives --config java
```

## Erstes Programm

### 5. Arbeitsordner anlegen

Ein eigener Ordner für die Übungsdateien.

```bash
mkdir -p ~/java-uebung
```

### 6. In den Ordner wechseln

Alle folgenden Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/java-uebung
```

### 7. Kompakte Quelldatei anlegen

Legt `Hallo.java` in der kurzen Schreibweise ab Java 25 an. Die Klasse `IO` liest eine Zeile von der Tastatur und gibt Text aus.

```bash
nano Hallo.java
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```java
void main() {
    String name = IO.readln("Wie heißt du? ");
    IO.println("Hallo " + name + "!");
}
```

### 8. Quelldatei direkt starten

Bei einzelnen Dateien kann `java` den Quelltext selbst übersetzen und sofort ausführen. Ein getrennter Aufruf von `javac` ist nicht nötig.

```bash
java Hallo.java
```

**Prüfen:** Das Programm fragt nach einem Namen. Nach der Eingabe von z. B. `Thorsten` erscheint `Hallo Thorsten!`.

## Klassische Schreibweise mit javac

### 9. Klasse anlegen

So sehen Java-Programme in Büchern, älteren Projekten und größeren Anwendungen aus: Jede Datei enthält eine Klasse, deren Name dem Dateinamen entspricht.

```bash
nano Rechner.java
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```java
public class Rechner {
    public static void main(String[] args) {
        int summe = 0;
        for (int i = 1; i <= 10; i++) {
            summe += i;
        }
        System.out.println("Summe von 1 bis 10: " + summe);
    }
}
```

### 10. Quelltext übersetzen

`javac` erzeugt die Datei `Rechner.class` mit dem Bytecode für die virtuelle Maschine.

```bash
javac Rechner.java
```

**Prüfen:** Im Ordner liegt jetzt `Rechner.class`.

```bash
ls
```

### 11. Programm starten

Beim Start wird nur der Klassenname angegeben, ohne `.class`.

```bash
java Rechner
```

**Prüfen:** Die Ausgabe lautet `Summe von 1 bis 10: 55`.

### 12. Optional: Mit JShell ausprobieren

`jshell` nimmt einzelne Java-Anweisungen entgegen und zeigt das Ergebnis sofort. Ideal zum Ausprobieren, z. B. `Math.sqrt(2)` oder `"Java".repeat(3)`. Beenden mit `/exit`.

```bash
jshell
```

## Wie geht es weiter?

- **Projekte mit Maven:** `mvn archetype:generate` legt ein vollständiges Projekt mit Ordnerstruktur und Testrahmen an. Gradle ist die verbreitete Alternative.
- **Webanwendungen:** Die Anleitung [Spring Boot](spring-boot.md) baut darauf auf.
- **Dokumentation:** Die Beschreibung aller Klassen der Standardbibliothek steht als Javadoc auf den Seiten von Oracle bzw. OpenJDK; das Paket `openjdk-25-doc` installiert sie lokal.

## Deinstallieren

### 1. Übungsordner entfernen

Löscht die Beispieldateien.

```bash
rm -rf ~/java-uebung
```

### 2. Maven entfernen

Nur nötig, wenn Maven installiert wurde.

```bash
sudo apt purge maven
```

### 3. JDK entfernen

Entfernt das Verweispaket und OpenJDK 25. Programme wie IntelliJ IDEA oder Eclipse bringen meist ein eigenes JDK mit und laufen weiter.

```bash
sudo apt purge default-jdk default-jdk-headless openjdk-25-jdk openjdk-25-jdk-headless
```

### 4. Laufzeitumgebung und Abhängigkeiten entfernen

Räumt die Laufzeitumgebung (`openjdk-25-jre…`) und weitere nur für Java installierte Pakete auf.

```bash
sudo apt autoremove
```

### 5. Heruntergeladene Maven-Bibliotheken löschen

Maven speichert Bibliotheken im Ordner `~/.m2`. Wird Maven nicht mehr gebraucht, kann er weg.

```bash
rm -rf ~/.m2
```

**Prüfen:** Die Meldung lautet `javac: Befehl nicht gefunden` bzw. `command not found`.

```bash
javac -version
```
