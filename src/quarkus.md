# Quarkus

Quarkus ist ein Java-Framework für Webanwendungen und Schnittstellen, das auf schnellen Start und wenig Speicherbedarf ausgelegt ist. Es verwendet bekannte Java-Standards wie Jakarta REST für Routen und CDI für Dependency Injection. Im Entwicklungsmodus übersetzt Quarkus geänderten Code bei der nächsten Anfrage selbst neu, ohne dass man den Server neu startet.

## Vorbemerkungen

- **Installation pro Projekt:** Wie [Spring Boot](spring-boot.md) gehört Quarkus als Abhängigkeit zu jedem Projekt. Aus den Ubuntu-Paketquellen kommt nur das Java-Entwicklungspaket (JDK).
- **Projekt anlegen mit code.quarkus.io:** Der offizielle Dienst <https://code.quarkus.io> erzeugt ein fertiges Projektgerüst. Diese Anleitung ruft ihn mit `curl` auf, im Browser geht es genauso.
- **Maven Wrapper:** Das Projekt enthält das Skript `./mvnw`. Es lädt beim ersten Aufruf das Build-Werkzeug Maven in der passenden Version herunter. Ein systemweites Maven ist nicht nötig. Maven legt alle Bibliotheken in `~/.m2` ab, für dieses Projekt rund 200 MB.
- **Port 8000:** Quarkus lauscht ohne Angabe auf Port 8080. Das Beispiel legt Port 8000 fest, weil 8080 oft schon belegt ist, etwa von Apache aus der [Tileserver-Anleitung](tileserver.md). Port 8000 darf nicht von einem anderen Programm belegt sein.
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [FastAPI](fastapi.md), [Gin](gin.md), [NestJS](nestjs.md) und [Express](express.md). Die Notizen liegen nur im Arbeitsspeicher.
- **Version:** Getestet mit Quarkus **3.39.5** und Java 25 aus Ubuntu 26.04. Quarkus 3.39 braucht Java 17 oder neuer, empfohlen ist Java 25.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. JDK und Hilfsprogramme installieren

- `default-jdk` – Java-Entwicklungspaket (Compiler und Laufzeitumgebung) in der Standardversion von Ubuntu. Ist es schon vorhanden (z. B. aus der [Spring-Boot-Anleitung](spring-boot.md)), meldet `apt` das nur.
- `curl` – lädt das Projektgerüst von code.quarkus.io herunter
- `unzip` – entpackt es

```bash
sudo apt install default-jdk curl unzip
```

**Prüfen:** Die Ausgabe nennt eine Java-Version ab 25, z. B. `openjdk version "25…"`. Ist zusätzlich eine neuere Java-Version installiert (z. B. 26), wird diese angezeigt. Das ist in Ordnung.

```bash
java -version
```

## Erstes Projekt

### 3. In das Home-Verzeichnis wechseln

Das Projekt wird im aktuellen Ordner angelegt.

```bash
cd ~
```

### 4. Projektgerüst herunterladen

Die Werte in der Adresse legen das Projekt fest:

- `g=de.beispiel` – die Gruppe, zugleich das Java-Paket für den Code
- `a=meinquarkus` – der Name des Projekts und des Ordners
- `j=25` – die Java-Version
- `e=rest-jackson` – die Erweiterung für Schnittstellen mit JSON (Quarkus REST mit der JSON-Bibliothek Jackson)

```bash
curl -o meinquarkus.zip "https://code.quarkus.io/d?g=de.beispiel&a=meinquarkus&j=25&e=rest-jackson"
```

**Prüfen:** Die Datei `meinquarkus.zip` ist rund 20 KB groß.

```bash
ls -lh meinquarkus.zip
```

### 5. Projekt entpacken

Entpackt das Gerüst in den Ordner `meinquarkus`.

```bash
unzip meinquarkus.zip
```

### 6. ZIP-Datei löschen

Sie wird nicht mehr gebraucht.

```bash
rm meinquarkus.zip
```

### 7. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinquarkus
```

**Prüfen:** Die Ausgabe enthält `mvnw`, `pom.xml` und `src`.

```bash
ls
```

Das Gerüst enthält schon ein Beispiel `src/main/java/de/beispiel/GreetingResource.java`, das unter `/hello` einen Text liefert, und Tests dafür. Die Dateien in `src/main/docker` braucht diese Anleitung nicht.

### 8. Port und Adresse festlegen

In `application.properties` stehen die Einstellungen der Anwendung. Die Datei ist noch leer.

```bash
nano src/main/resources/application.properties
```

Füge diesen Inhalt ein:

```properties
# Nur vom eigenen Rechner aus erreichbar, Port 8000 statt 8080
quarkus.http.host=127.0.0.1
quarkus.http.port=8000
```

Ohne `quarkus.http.host` wäre die fertige Anwendung (Schritt 17) aus dem ganzen Netz erreichbar. Nur der Entwicklungsmodus lauscht von sich aus lediglich auf `localhost`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Schnittstelle schreiben

In Quarkus heißt eine Klasse mit Routen **Resource**. Die Datei ist neu, nano startet mit einer leeren Seite.

```bash
nano src/main/java/de/beispiel/NotizResource.java
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```java
package de.beispiel;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;

@Path("/")
public class NotizResource {

    // So sieht eine gespeicherte Notiz aus
    public record Notiz(int id, String titel) {}

    // So sieht eine neue Notiz aus, die man schickt: nur ein Titel
    public record NotizNeu(String titel) {}

    // Notizen nur im Arbeitsspeicher: Nach einem Neustart sind sie weg
    private final List<Notiz> notizen = new CopyOnWriteArrayList<>();

    // GET /hallo?name=... liefert eine Begrüßung als JSON
    @GET
    @Path("hallo")
    public Map<String, String> hallo(@QueryParam("name") @DefaultValue("Welt") String name) {
        return Map.of("gruss", "Hallo " + name + "!");
    }

    // GET /notizen liefert alle Notizen
    @GET
    @Path("notizen")
    public List<Notiz> alle() {
        return notizen;
    }

    // GET /notizen/1 liefert eine Notiz oder 404
    @GET
    @Path("notizen/{id}")
    public Notiz eine(@PathParam("id") int id) {
        return notizen.stream()
                .filter(n -> n.id() == id)
                .findFirst()
                .orElseThrow(() -> new NotFoundException(Response.status(404)
                        .entity(Map.of("fehler", "Notiz nicht gefunden")).build()));
    }

    // POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
    @POST
    @Path("notizen")
    public synchronized Response anlegen(NotizNeu daten) {
        if (daten == null || daten.titel() == null || daten.titel().isEmpty()) {
            return Response.status(400).entity(Map.of("fehler", "Feld \"titel\" fehlt")).build();
        }
        Notiz notiz = new Notiz(notizen.size() + 1, daten.titel());
        notizen.add(notiz);
        return Response.created(URI.create("/notizen/" + notiz.id())).entity(notiz).build();
    }
}
```

- **Annotationen** – `@Path` legt die Adresse fest, `@GET` und `@POST` die Methode. `{id}` ist ein Platzhalter.
- **Parameter** – `@QueryParam("name")` liest Werte aus der Adresse (`?name=…`), `@DefaultValue` gibt einen Vorgabewert. `@PathParam("id")` liest den Platzhalter und wandelt ihn in eine Zahl um. Ein Parameter ohne Annotation wie `NotizNeu daten` wird aus dem mitgeschickten JSON gefüllt.
- **Records** – `Notiz` und `NotizNeu` sind kurze Java-Klassen nur für Daten. Jackson macht aus ihnen JSON und umgekehrt.
- **Rückgabewerte** – Listen, Maps und Records werden als JSON gesendet. Mit `Response` setzt man zusätzlich Status und Kopfzeilen, z. B. `Response.created(…)` für Status `201` mit `Location`.
- `NotFoundException` – bricht mit Status `404` und der mitgegebenen Antwort ab.
- `CopyOnWriteArrayList` und `synchronized` – Quarkus bearbeitet Anfragen gleichzeitig und verwendet dafür ein einziges Objekt dieser Klasse. Beides verhindert, dass sich zwei Anfragen beim Anlegen in die Quere kommen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

## Starten und testen

### 10. Entwicklungsmodus starten

`quarkus:dev` übersetzt das Projekt und startet es mit Live Coding. Beim ersten Aufruf lädt `./mvnw` Maven und alle Bibliotheken herunter, das dauert ein bis zwei Minuten. Das Terminal bleibt belegt.

```bash
./mvnw quarkus:dev
```

Beim ersten Start fragt Quarkus: `Do you agree to contribute anonymous build time data to the Quarkus community? (y/n and enter)`. Gib <kbd>n</kbd> ein und drücke <kbd>Enter</kbd>, wenn du keine Nutzungsdaten senden möchtest.

**Prüfen:** Unter dem Quarkus-Schriftzug steht `Listening on: http://127.0.0.1:8000` und `Profile dev activated. Live Coding activated.` Darunter zeigt Quarkus eine Zeile mit Tasten, z. B. `[h] for more options`.

### 11. Notiz anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, weiter unten steht `Location: http://localhost:8000/notizen/1`, die letzte Zeile ist `{"id":1,"titel":"Erste Notiz"}`. Quarkus ergänzt die Adresse aus `Response.created` selbst zu einer vollständigen Adresse.

### 12. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung:

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:8000/notizen` | `[{"id":1,"titel":"Erste Notiz"}]` |
| `curl http://localhost:8000/notizen/1` | `{"id":1,"titel":"Erste Notiz"}` |
| `curl "http://localhost:8000/hallo?name=Thorsten"` | `{"gruss":"Hallo Thorsten!"}` |
| `curl http://localhost:8000/notizen/7` | `{"fehler":"Notiz nicht gefunden"}` (Status 404) |
| `curl -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{}'` | `{"fehler":"Feld \"titel\" fehlt"}` (Status 400) |
| `curl http://localhost:8000/hello` | `Hello from Quarkus REST` (Beispiel aus dem Gerüst) |
| `curl http://localhost:8000/gibtsnicht` | Text `404 - Resource Not Found` mit einer Liste aller Adressen (Status 404) |

Die Liste aller Adressen bei unbekannten Adressen gibt es nur im Entwicklungsmodus, als Hilfe beim Entwickeln. Die fertige Anwendung antwortet nur mit `Resource not found`. Auch `/notizen/abc` ergibt `404` ohne Inhalt, weil `abc` keine Zahl für `int id` ist.

### 13. Dev UI ansehen

Öffne <http://localhost:8000/q/dev-ui> im Browser. Die Oberfläche gibt es nur im Entwicklungsmodus. Sie zeigt unter anderem die installierten Erweiterungen, unter **Endpoints** alle Adressen und unter **Configuration** alle Einstellungen, die man in `application.properties` setzen kann.

### 14. Live Coding ausprobieren

Ändere in `NotizResource.java` das Wort `Hallo` in der Methode `hallo` z. B. in `Servus` und speichere die Datei.

**Prüfen:** `curl http://localhost:8000/hallo` liefert `{"gruss":"Servus Welt!"}`. Die Anfrage dauert etwas länger, weil Quarkus erst jetzt neu übersetzt. Im ersten Terminal erscheinen `Restarting quarkus due to changes in NotizResource…` und `Live reload total time: …`. Die Notizen aus Schritt 11 sind danach verloren, weil sie nur im Arbeitsspeicher lagen.

### 15. Entwicklungsmodus beenden

Wechsle in das erste Terminal und drücke <kbd>q</kbd> oder <kbd>Strg</kbd>+<kbd>C</kbd>.

### 16. Anwendung paketieren

`package` übersetzt das Projekt, führt die Tests aus und legt die fertige Anwendung im Ordner `target/quarkus-app` ab. Die Tests starten die Anwendung dafür kurz auf Port 8081.

```bash
./mvnw package
```

**Prüfen:** Die Ausgabe enthält `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0` und endet mit `BUILD SUCCESS`. Der Ordner `target/quarkus-app` enthält die Datei `quarkus-run.jar` und die Unterordner `app`, `lib` und `quarkus`. Zum Betrieb braucht man den ganzen Ordner, nicht nur die JAR-Datei.

```bash
ls target/quarkus-app
```

### 17. Fertige Anwendung starten

Startet die Anwendung ohne Maven, nur mit Java. So läuft sie später auf einem Server.

```bash
java -jar target/quarkus-app/quarkus-run.jar
```

**Prüfen:** Die Ausgabe enthält `Listening on: http://127.0.0.1:8000` und `Profile prod activated.` Laut der Angabe `started in …s` dauert der Start nur etwa eine halbe Sekunde, weil Quarkus viel Arbeit schon beim Paketieren erledigt. `curl http://localhost:8000/notizen` liefert `[]`. Beende die Anwendung mit <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Erweiterungen:** `./mvnw quarkus:list-extensions` listet alle Erweiterungen, `./mvnw quarkus:add-extension -Dextensions="…"` fügt eine hinzu.
- **Eingaben prüfen:** Mit der Erweiterung `hibernate-validator` schreibt man Regeln wie `@NotBlank` an die Felder und `@Valid` an den Parameter. Quarkus antwortet dann bei ungültigen Eingaben selbst mit `400`.
- **Datenbank:** Mit `hibernate-orm-panache` und `jdbc-postgresql` spricht Quarkus [PostgreSQL](postgresql.md) an. Die Verbindung steht in `application.properties`.
- **Tests:** `./mvnw test` führt die Tests aus. Im Entwicklungsmodus startet die Taste <kbd>r</kbd> die Tests und wiederholt sie nach jeder Änderung.
- **Betrieb:** Auf einem Server kopiert man den Ordner `target/quarkus-app` hin, startet `java -jar quarkus-run.jar` über einen systemd-Dienst (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage) und setzt [nginx](nginx.md) davor, der auch HTTPS übernimmt.

## Deinstallieren

### 1. Anwendung beenden

Läuft `./mvnw quarkus:dev` oder `java -jar …` noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projekt entfernen

Löscht den Projektordner samt übersetzter Anwendung.

```bash
rm -rf ~/meinquarkus
```

**Prüfen:** Der Projektordner existiert nicht mehr, `ls` meldet `Datei oder Verzeichnis nicht gefunden`.

```bash
ls ~/meinquarkus
```

### 3. Heruntergeladene Bibliotheken entfernen (optional)

Maven und alle Bibliotheken liegen in `~/.m2`. Der Befehl löscht den ganzen Ordner. Das betrifft auch andere Java-Projekte wie [Spring Boot](spring-boot.md), die ihre Bibliotheken dann beim nächsten Build wieder aus dem Internet laden.

```bash
rm -rf ~/.m2
```

### 4. JDK entfernen (optional)

Nur ausführen, wenn kein anderes Programm Java braucht, z. B. [IntelliJ IDEA](intellij-idea.md) oder [Keycloak](keycloak.md).

```bash
sudo apt purge default-jdk
```

Der nächste Befehl entfernt die Pakete, die nur dafür mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```
