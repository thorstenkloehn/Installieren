# Spring Boot

Spring Boot ist ein Framework für Java, mit dem man Webanwendungen, REST-Schnittstellen und Hintergrunddienste schnell aufsetzt. Es bringt einen eingebauten Webserver mit und richtet vieles selbst ein. Eine fertige Anwendung ist eine einzelne `.jar`-Datei, die sich mit `java -jar` starten lässt.

## Vorbemerkungen

- **Keine Installation im engeren Sinn:** Spring Boot wird nicht auf dem System installiert, sondern gehört als Abhängigkeit zu jedem Projekt. Aus den Ubuntu-Paketquellen kommt nur das Java-Entwicklungspaket (JDK).
- **Projekt anlegen mit Spring Initializr:** Der offizielle Dienst <https://start.spring.io> erzeugt ein fertiges Projektgerüst. Diese Anleitung ruft ihn mit `curl` auf, im Browser geht es genauso.
- **Maven Wrapper:** Das Projekt enthält das Skript `./mvnw`. Es lädt beim ersten Aufruf automatisch das Build-Werkzeug Maven in der passenden Version herunter. Ein systemweites Maven ist nicht nötig.
- **Versionen:** Spring Boot 4.1.1 und Java 25. Java 25 ist die aktuelle Version mit Langzeitunterstützung (LTS) und das Standard-JDK von Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von JDK und Hilfsprogrammen kennt.

```bash
sudo apt update
```

### 2. JDK und Hilfsprogramme installieren

- `default-jdk` – Java-Entwicklungspaket (Compiler und Laufzeitumgebung) in der Standardversion von Ubuntu. Ist es schon vorhanden (z. B. aus der [IntelliJ-IDEA-Anleitung](intellij-idea.md)), meldet `apt` das nur.
- `curl` – lädt das Projektgerüst von Spring Initializr herunter
- `unzip` – entpackt es

```bash
sudo apt install default-jdk curl unzip
```

**Prüfen:** Die Ausgabe nennt eine Java-Version ab 25, z. B. `openjdk version "25…"`.

```bash
java -version
```

Ist zusätzlich eine neuere Java-Version installiert (z. B. 26), wird diese angezeigt. Das ist in Ordnung: Sie kann Projekte für Java 25 ebenfalls übersetzen.

## Erstes Projekt

### 3. In das Home-Verzeichnis wechseln

Das Projekt wird im Ordner `~/hallo` angelegt.

```bash
cd ~
```

### 4. Projektgerüst herunterladen

Fordert bei Spring Initializr ein fertiges Projekt als ZIP-Datei an. Die Angaben bedeuten:

- `type=maven-project` – Build mit Maven (Alternative: `gradle-project`)
- `bootVersion`, `javaVersion` – Spring-Boot- und Java-Version
- `groupId`, `artifactId`, `packageName` – Namen für Projekt und Java-Paket. Die `groupId` ist üblicherweise eine umgedrehte Domain.
- `dependencies=web,actuator` – die gewünschten Bausteine: `web` für Webanwendungen und REST-Schnittstellen mit eingebautem Webserver (Tomcat), `actuator` für Betriebsinformationen wie den Gesundheitszustand

```bash
curl https://start.spring.io/starter.zip -d type=maven-project -d bootVersion=4.1.1 -d javaVersion=25 -d groupId=de.beispiel -d artifactId=hallo -d packageName=de.beispiel.hallo -d dependencies=web,actuator -o hallo.zip
```

**Prüfen:** Die Datei ist ein ZIP-Archiv.

```bash
file hallo.zip
```

### 5. Projekt entpacken

Entpackt das Archiv in den Ordner `~/hallo`.

```bash
unzip hallo.zip -d hallo
```

### 6. ZIP-Datei löschen

Das Archiv wird nicht mehr gebraucht.

```bash
rm hallo.zip
```

### 7. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/hallo
```

**Prüfen:** Unter anderem werden `pom.xml` (Projektbeschreibung für Maven), `mvnw` (Maven Wrapper) und der Ordner `src` angezeigt.

```bash
ls
```

## Eine REST-Schnittstelle schreiben

### 8. Controller anlegen

Ein **Controller** beantwortet HTTP-Anfragen. Die Klasse liegt neben der von Initializr erzeugten Startklasse `HalloApplication.java`, damit Spring Boot sie automatisch findet. Die Anmerkungen (Annotationen) steuern das Verhalten:

- `@RestController` – die Klasse liefert Daten (hier JSON), keine HTML-Seiten
- `@GetMapping("/hallo")` – die Methode beantwortet `GET`-Anfragen an `/hallo`
- `@RequestParam(defaultValue = "Welt")` – liest den Parameter `name` aus der Adresse, ohne Angabe gilt „Welt“

Spring Boot wandelt die zurückgegebene `Map` automatisch in JSON um.

```bash
nano src/main/java/de/beispiel/hallo/HalloController.java
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```java
package de.beispiel.hallo;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Eine REST-Schnittstelle: Die Klasse beantwortet HTTP-Anfragen
@RestController
public class HalloController {

    // GET /hallo?name=... liefert eine Begrüßung als JSON
    @GetMapping("/hallo")
    public Map<String, String> hallo(@RequestParam(defaultValue = "Welt") String name) {
        return Map.of("gruss", "Hallo " + name + "!");
    }
}
```

### 9. Anwendung nur lokal erreichbar machen

Ohne weitere Angabe ist der eingebaute Webserver aus dem ganzen Netz erreichbar. Diese Zeilen in der Einstellungsdatei beschränken ihn auf den eigenen Rechner und legen den Port `8080` ausdrücklich fest.

```bash
nano src/main/resources/application.properties
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei und füge in eigenen Zeilen an (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```ini
server.address=127.0.0.1
server.port=8080
```

**Prüfen:** Die Datei enthält drei Zeilen: den Anwendungsnamen und die beiden neuen Einstellungen.

```bash
cat src/main/resources/application.properties
```

## Starten und testen

### 10. Anwendung im Entwicklungsmodus starten

`spring-boot:run` übersetzt das Projekt und startet die Anwendung direkt. Beim ersten Aufruf lädt der Maven Wrapper Maven und alle Bibliotheken herunter (etwa 70 MB, nach `~/.m2`). Das dauert eine Weile, spätere Starts gehen schnell. Das Terminal bleibt belegt, solange die Anwendung läuft.

```bash
./mvnw spring-boot:run
```

**Prüfen:** Die Ausgabe endet mit Zeilen wie `Tomcat started on port 8080` und `Started HalloApplication in … seconds`.

### 11. REST-Schnittstelle aufrufen

Öffne ein zweites Terminal und frage die neue Schnittstelle ab.

```bash
curl "http://localhost:8080/hallo?name=Thorsten"
```

**Prüfen:** Die Antwort lautet `{"gruss":"Hallo Thorsten!"}`. Ohne `?name=…` kommt `{"gruss":"Hallo Welt!"}`.

### 12. Gesundheitszustand abfragen

Der Baustein Actuator stellt unter `/actuator/health` den Zustand der Anwendung bereit. Überwachungswerkzeuge fragen diese Adresse regelmäßig ab. Weitere Actuator-Endpunkte sind aus Sicherheitsgründen zunächst abgeschaltet.

```bash
curl http://localhost:8080/actuator/health
```

**Prüfen:** Die Antwort enthält `"status":"UP"`.

### 13. Anwendung beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

## Fertige Anwendung bauen

### 14. JAR-Datei erzeugen

`package` übersetzt das Projekt, führt die mitgelieferten Tests aus und packt alles, einschließlich Webserver und Bibliotheken, in eine einzige Datei. Die Warnungen zu `Mockito` und `Java agent` während der Tests sind harmlos.

```bash
./mvnw package
```

**Prüfen:** Die Ausgabe endet mit `BUILD SUCCESS`, und im Ordner `target` liegt die Datei `hallo-0.0.1-SNAPSHOT.jar` (etwa 22 MB).

```bash
ls -lh target/*.jar
```

### 15. JAR-Datei starten

So wird die Anwendung auch auf einem Server gestartet. Außer Java wird dort nichts gebraucht.

```bash
java -jar target/hallo-0.0.1-SNAPSHOT.jar
```

**Prüfen:** Im zweiten Terminal liefert `curl http://localhost:8080/hallo` wieder `{"gruss":"Hallo Welt!"}`. Mit <kbd>Strg</kbd>+<kbd>C</kbd> beendest du die Anwendung.

## Wie geht es weiter?

- **Entwicklungsumgebung:** [IntelliJ IDEA](intellij-idea.md) öffnet das Projekt direkt über die Datei `pom.xml`. In [VS Code](vscode.md) helfen die Erweiterungen „Extension Pack for Java“ und „Spring Boot Extension Pack“, in [Eclipse](eclipse.md) die „Spring Tools“ aus dem Eclipse Marketplace.
- **Weitere Bausteine:** Auf <https://start.spring.io> findest du alle verfügbaren Abhängigkeiten, z. B. `data-jpa` und `postgresql` für den Zugriff auf [PostgreSQL](postgresql.md), `security` für Anmeldung und Rechte oder `devtools` für automatischen Neustart bei Codeänderungen.
- **KI-Anbindung:** Mit dem Projekt Spring AI lassen sich Sprachmodelle und Vektordatenbanken wie [pgvector](postgresql.md#pgvector-einrichten), [Qdrant](qdrant.md) oder [Milvus](milvus.md) einbinden.

## Deinstallieren

### 1. Projekt entfernen

Löscht den Projektordner mit Quellcode und gebauter JAR-Datei. **Achtung:** Eigene Änderungen am Projekt gehen verloren.

```bash
rm -rf ~/hallo
```

### 2. Maven-Downloads entfernen

Der Maven Wrapper hat Maven nach `~/.m2/wrapper` und alle Bibliotheken nach `~/.m2/repository` geladen. Behalte den Ordner, wenn du weitere Java-Projekte mit Maven hast, sonst müssen sie alles neu herunterladen.

```bash
rm -rf ~/.m2
```

### 3. Optional: JDK entfernen

Nur ausführen, wenn kein anderes Programm Java braucht (z. B. IntelliJ IDEA oder Eclipse). `curl` und `unzip` brauchen viele andere Programme, sie bleiben deshalb installiert.

```bash
sudo apt purge default-jdk
```

```bash
sudo apt autoremove
```

**Prüfen:** Der Projektordner existiert nicht mehr.

```bash
ls ~/hallo
```
