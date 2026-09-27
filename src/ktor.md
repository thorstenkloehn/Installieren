# Ktor

Ktor ist ein Framework von JetBrains für Webanwendungen und Schnittstellen in [Kotlin](kotlin.md). Routen schreibt man als kurze Kotlin-Blöcke (`get("/…") { … }`), Fähigkeiten wie JSON, Anmeldung oder Protokollierung schaltet man als Plugins einzeln zu. Ktor arbeitet mit Kotlin-Coroutinen und kann dadurch viele Anfragen gleichzeitig bearbeiten, ohne für jede einen eigenen Thread zu blockieren.

## Vorbemerkungen

- **Installation pro Projekt:** Ktor gehört als Abhängigkeit zu jedem Projekt. Aus den Ubuntu-Paketquellen kommt nur das Java-Entwicklungspaket (JDK). Den Kotlin-Compiler bringt das Build-Werkzeug Gradle selbst mit, der Snap aus der [Kotlin-Anleitung](kotlin.md) ist nicht nötig.
- **Projekt anlegen mit start.ktor.io:** Der offizielle Generator <https://start.ktor.io> erzeugt ein fertiges Projektgerüst. Diese Anleitung ruft ihn mit `curl` auf, so wie es auch das Kommandozeilenwerkzeug von Ktor tut. Im Browser geht es genauso.
- **Gradle Wrapper:** Das Projekt enthält das Skript `./gradlew`. Es lädt beim ersten Aufruf Gradle in der passenden Version herunter. Gradle legt sich selbst, den Kotlin-Compiler und alle Bibliotheken in `~/.gradle` ab, zusammen rund 650 MB.
- **Port 8000:** Die Vorlage lauscht auf Port 8080 und ist aus dem ganzen Netz erreichbar. Schritt 9 ändert das auf Port 8000 und nur den eigenen Rechner, weil 8080 oft schon belegt ist, etwa von Apache aus der [Tileserver-Anleitung](tileserver.md).
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [Quarkus](quarkus.md), [Gin](gin.md), [FastAPI](fastapi.md) und [Express](express.md). Die Notizen liegen nur im Arbeitsspeicher.
- **Version:** Getestet mit Ktor **3.6.0**, Kotlin 2.4.0, Gradle 9.5.1 und Java 25 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. JDK und Hilfsprogramme installieren

- `default-jdk` – Java-Entwicklungspaket in der Standardversion von Ubuntu. Ist es schon vorhanden (z. B. aus der [Kotlin-Anleitung](kotlin.md)), meldet `apt` das nur.
- `curl` – lädt das Projektgerüst von start.ktor.io herunter
- `unzip` – entpackt es

```bash
sudo apt install default-jdk curl unzip
```

**Prüfen:** Der Ordner `/usr/lib/jvm/java-25-openjdk-amd64` existiert. Gradle sucht sich dort das JDK, das Schritt 8 festlegt, auch wenn `java -version` eine andere Version anzeigt.

```bash
ls -d /usr/lib/jvm/java-25-openjdk-amd64
```

## Erstes Projekt

### 3. In das Home-Verzeichnis wechseln

Das Projekt wird im aktuellen Ordner angelegt.

```bash
cd ~
```

### 4. Projektgerüst herunterladen

Schickt die Wünsche als JSON an den Generator und speichert das Ergebnis als `meinktor.zip`:

- `project_name` – der Name des Projekts
- `company_website` – daraus bildet Ktor das Kotlin-Paket, hier `de.beispiel`
- `engine` – der Webserver, hier Netty
- `build_system` – Gradle mit Build-Skripten in Kotlin
- `features` – die Plugins: Content Negotiation wählt das Format der Antwort, kotlinx.serialization wandelt Kotlin-Klassen in JSON um
- `configurationOption` – Einstellungen wie der Port stehen im Code
- `addWrapper` – legt `./gradlew` bei

```bash
curl -o meinktor.zip -X POST https://start.ktor.io/project/generate -H "Content-Type: application/json" -d '{"settings":{"project_name":"meinktor","company_website":"beispiel.de","engine":"NETTY","build_system":"GRADLE_KTS","ktor_version":"3.6.0","kotlin_version":"2.4.0","build_system_args":{"version_catalog":""}},"features":["io.ktor/server-content-negotiation","io.ktor/server-kotlinx-serialization"],"addDefaultRoutes":true,"configurationOption":"CODE","addWrapper":true}'
```

**Prüfen:** Die Datei `meinktor.zip` ist rund 50 KB groß. Ist sie nur wenige Bytes groß, enthält sie eine Fehlermeldung des Generators. `cat meinktor.zip` zeigt sie an. Meist hat sich dann die Ktor- oder Kotlin-Version geändert. Die aktuellen Werte liefert `curl https://start.ktor.io/project/settings`.

```bash
ls -lh meinktor.zip
```

### 5. Projekt entpacken

Die Dateien liegen im ZIP ohne eigenen Ordner. `-d meinktor` entpackt sie deshalb in einen neuen Ordner `meinktor`.

```bash
unzip meinktor.zip -d meinktor
```

### 6. ZIP-Datei löschen

Sie wird nicht mehr gebraucht.

```bash
rm meinktor.zip
```

### 7. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinktor
```

**Prüfen:** Die Ausgabe enthält `build.gradle.kts`, `gradlew` und `src`.

```bash
ls
```

Der Code liegt in `src/main/kotlin`: `main.kt` startet den Server, `Application.kt` schaltet die Teile zusammen, `Serialization.kt` richtet JSON ein und `Routing.kt` enthält die Routen.

### 8. Java-Version festlegen

Die Vorlage verlangt Java 21. Ubuntu liefert Java 25. Ohne Änderung würde Gradle ein zusätzliches JDK 21 aus dem Internet laden.

```bash
nano build.gradle.kts
```

Ändere die Zeile `jvmToolchain(21)` in:

```kotlin
    jvmToolchain(25)
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Port und Adresse festlegen

```bash
nano src/main/kotlin/main.kt
```

Ändere die beiden Zeilen `port = 8080,` und `host = "0.0.0.0",` so, dass sie lauten:

```kotlin
        port = 8000,
        host = "127.0.0.1",
```

`0.0.0.0` hieße: aus dem ganzen Netz erreichbar. `127.0.0.1` beschränkt den Server auf den eigenen Rechner.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Routen schreiben

```bash
nano src/main/kotlin/Routing.kt
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein:

```kotlin
package de.beispiel

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

// So sieht eine gespeicherte Notiz aus
@Serializable
data class Notiz(val id: Int, val titel: String)

// So sieht eine neue Notiz aus, die man schickt: nur ein Titel
@Serializable
data class NotizNeu(val titel: String = "")

// Notizen nur im Arbeitsspeicher: Nach einem Neustart sind sie weg
private val notizen = mutableListOf<Notiz>()

fun Application.configureRouting() {
    routing {
        // GET /hallo?name=... liefert eine Begrüßung als JSON
        get("/hallo") {
            val name = call.request.queryParameters["name"] ?: "Welt"
            call.respond(mapOf("gruss" to "Hallo $name!"))
        }

        // GET /notizen liefert alle Notizen
        get("/notizen") {
            val alle = synchronized(notizen) { notizen.toList() }
            call.respond(alle)
        }

        // GET /notizen/1 liefert eine Notiz oder 404
        get("/notizen/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
            val notiz = synchronized(notizen) { notizen.find { it.id == id } }
            if (notiz == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("fehler" to "Notiz nicht gefunden"))
            } else {
                call.respond(notiz)
            }
        }

        // POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
        post("/notizen") {
            val daten = runCatching { call.receive<NotizNeu>() }.getOrNull()
            if (daten == null || daten.titel.isEmpty()) {
                call.respond(HttpStatusCode.BadRequest, mapOf("fehler" to "Feld \"titel\" fehlt"))
                return@post
            }
            val notiz = synchronized(notizen) {
                Notiz(notizen.size + 1, daten.titel).also { notizen.add(it) }
            }
            call.response.header(HttpHeaders.Location, "/notizen/${notiz.id}")
            call.respond(HttpStatusCode.Created, notiz)
        }
    }
}
```

- **`@Serializable data class`** – Datenklassen, die kotlinx.serialization in JSON umwandeln kann und umgekehrt. `titel: String = ""` sorgt dafür, dass `{}` nicht als Fehler gilt, sondern einen leeren Titel ergibt, den die Route selbst prüft.
- **`routing { … }`** – enthält alle Routen. `get` und `post` verbinden Adresse und Methode mit einem Block. `{id}` ist ein Platzhalter.
- **`call`** – die laufende Anfrage samt Antwort. `call.request.queryParameters` liest Werte aus der Adresse (`?name=…`), `call.parameters` die Platzhalter, `call.receive<NotizNeu>()` den mitgeschickten JSON-Inhalt. `call.respond` antwortet mit Status und JSON.
- `runCatching { … }.getOrNull()` – liefert `null` statt eines Fehlers, wenn der Inhalt kein passendes JSON ist.
- `synchronized(notizen)` – Ktor bearbeitet Anfragen gleichzeitig. So liest oder ändert immer nur eine Anfrage die Liste.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Test anpassen

Die Vorlage enthält einen Test, der prüft, ob die Startseite `/` mit Status 200 antwortet. Die gibt es nach Schritt 10 nicht mehr. Der Test soll stattdessen `/hallo` aufrufen.

```bash
nano src/test/kotlin/ServerTest.kt
```

Ändere in der Zeile mit `client.get("/")` die Adresse in `"/hallo"`:

```kotlin
        assertEquals(HttpStatusCode.OK, client.get("/hallo").status)
```

`testApplication` startet die Anwendung für den Test ohne echten Netzwerk-Port, `client.get` schickt eine Anfrage an sie.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Projekt bauen

Übersetzt den Code, führt den Test aus und erzeugt die fertigen Programmdateien. Beim ersten Aufruf lädt `./gradlew` Gradle, den Kotlin-Compiler und alle Bibliotheken herunter, das dauert ein bis zwei Minuten.

```bash
./gradlew build
```

**Prüfen:** Die Ausgabe endet mit `BUILD SUCCESSFUL`. Steht dort `BUILD FAILED` mit `There were failing tests`, fehlt die Änderung aus Schritt 11. Bei Tippfehlern im Code nennt die Ausgabe Datei und Zeile.

## Starten und testen

### 13. Server starten

Übersetzt geänderten Code und startet den Server. Das Terminal bleibt belegt, solange er läuft.

```bash
./gradlew run
```

**Prüfen:** Die Ausgabe enthält `Application started in …` und `Responding at http://127.0.0.1:8000`. Die Fortschrittsanzeige von Gradle bleibt bei `> :run` stehen, solange der Server läuft.

### 14. Notiz anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, weiter unten steht `Location: /notizen/1`, die letzte Zeile ist `{"id":1,"titel":"Erste Notiz"}`.

### 15. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung:

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:8000/notizen` | `[{"id":1,"titel":"Erste Notiz"}]` |
| `curl http://localhost:8000/notizen/1` | `{"id":1,"titel":"Erste Notiz"}` |
| `curl "http://localhost:8000/hallo?name=Thorsten"` | `{"gruss":"Hallo Thorsten!"}` |
| `curl http://localhost:8000/notizen/7` | `{"fehler":"Notiz nicht gefunden"}` (Status 404) |
| `curl -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{}'` | `{"fehler":"Feld \"titel\" fehlt"}` (Status 400) |
| `curl -i http://localhost:8000/gibtsnicht` | `HTTP/1.1 404 Not Found` ohne Inhalt |

Für unbekannte Adressen sendet Ktor nur den Status. Eigene Fehlerseiten oder JSON-Fehler für alle Routen richtet das Plugin Status Pages ein.

### 16. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>. Änderungen am Code wirken erst nach einem neuen `./gradlew run`. Die Notizen gehen dabei verloren, weil sie nur im Arbeitsspeicher liegen.

### 17. Fertige Anwendung starten

Schritt 12 hat auch die Datei `build/libs/meinktor-all.jar` erzeugt. Sie enthält die Anwendung samt Ktor, Kotlin und allen Bibliotheken, rund 30 MB. Zum Starten braucht man nur Java, weder Gradle noch den Quelltext. `--enable-native-access=ALL-UNNAMED` erlaubt dem Webserver Netty, Systembibliotheken zu laden. Ohne den Schalter warnt Java beim Start mit `WARNING: A restricted method in java.lang.System has been called`.

```bash
java --enable-native-access=ALL-UNNAMED -jar build/libs/meinktor-all.jar
```

**Prüfen:** Die Ausgabe enthält `Responding at http://127.0.0.1:8000`, `curl http://localhost:8000/notizen` liefert `[]`. Beende die Anwendung mit <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Plugins:** Der Generator auf <https://start.ktor.io> zeigt alle Plugins mit Beschreibung, etwa Status Pages für Fehlerantworten, Authentication für die Anmeldung oder CORS für Zugriffe von fremden Webseiten. Man trägt sie in `build.gradle.kts` ein und schaltet sie mit `install(…)` ein, wie `ContentNegotiation` in `Serialization.kt`.
- **Automatischer Neustart:** Ktor kann geänderten Code im Entwicklungsmodus neu laden, ohne dass man den Server neu startet. Die Ktor-Dokumentation beschreibt dazu den Entwicklungsmodus und das Auto-Reload.
- **Datenbank:** Mit der Bibliothek Exposed von JetBrains spricht Ktor z. B. [PostgreSQL](postgresql.md) an.
- **Entwicklungsumgebung:** [IntelliJ IDEA](intellij-idea.md) öffnet den Projektordner direkt als Gradle-Projekt und kann den Server mit einem Klick starten.
- **Betrieb:** Auf einem Server kopiert man nur `meinktor-all.jar` hin, startet es über einen systemd-Dienst (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage) und setzt [nginx](nginx.md) davor, der auch HTTPS übernimmt.

## Deinstallieren

### 1. Anwendung beenden

Läuft `./gradlew run` oder `java -jar …` noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Gradle-Hintergrundprozess beenden

Gradle lässt nach dem ersten Aufruf einen Hintergrundprozess (Daemon) laufen, damit spätere Aufrufe schneller starten. Er beendet sich nach drei Stunden ohne Arbeit selbst. Dieser Befehl beendet ihn sofort.

```bash
~/meinktor/gradlew --stop
```

**Prüfen:** Die Ausgabe lautet `Stopping Daemon(s)` und `1 Daemon stopped`.

### 3. Projekt entfernen

Löscht den Projektordner samt übersetzter Anwendung.

```bash
rm -rf ~/meinktor
```

**Prüfen:** Der Projektordner existiert nicht mehr, `ls` meldet `Datei oder Verzeichnis nicht gefunden`.

```bash
ls ~/meinktor
```

### 4. Gradle und Bibliotheken entfernen (optional)

Gradle, der Kotlin-Compiler und alle Bibliotheken liegen in `~/.gradle`. Der Befehl löscht den ganzen Ordner. Das betrifft alle Gradle-Projekte, die beim nächsten Build wieder alles aus dem Internet laden.

```bash
rm -rf ~/.gradle
```

### 5. JDK entfernen (optional)

Nur ausführen, wenn kein anderes Programm Java braucht, z. B. [Kotlin](kotlin.md), [IntelliJ IDEA](intellij-idea.md) oder [Keycloak](keycloak.md).

```bash
sudo apt purge default-jdk
```

Der nächste Befehl entfernt die Pakete, die nur dafür mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```
