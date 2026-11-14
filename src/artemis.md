# Artemis

Artemis ist eine an der TU München entwickelte Lernplattform für Kurse, Aufgaben und Prüfungen.

Diese Anleitung richtet auf Ubuntu 26.04 LTS (amd64) eine eigene lokale Testinstanz direkt auf dem Rechner ein. Wenn du lediglich an einem TUM-Kurs teilnehmen möchtest, öffne stattdessen die [Artemis-Instanz der TUM](https://artemis.tum.de) im Browser und verwende deinen Hochschulzugang.

## Umfang und Voraussetzungen

Die Testinstanz verwendet PostgreSQL und ist nur vom eigenen Rechner erreichbar. Sie ist unabhängig von den Kursen und Benutzerkonten der TUM. Internetzugang ist für die Downloads erforderlich. Plane für den Quellcode, die Abhängigkeiten und den Build mehrere GB freien Speicher ein; für den Build sind 16 GB RAM eine sinnvolle Planungsgröße.

**Grenze des Aufbaus:** Die integrierte automatische Ausführung von Programmierabgaben benötigt Build-Agenten mit Container-Laufzeit. Diese Anleitung lässt deshalb die Profile `localci`, `localvc` und `buildagent` weg. Für Kurse mit automatisch getesteten Programmieraufgaben reicht dieser Aufbau nicht aus. Siehe die [offizielle Beschreibung der Build-Infrastruktur](https://docs.artemis.tum.de/admin/production-setup/integrated-code-lifecycle-setup/).

Verwendet wird der Entwicklungszweig `develop`. Er verändert sich laufend; dies ist keine Anleitung für einen öffentlichen Hochschulserver. Die folgenden Build-Einstellungen wurden anhand des [offiziellen Build-Skripts](https://github.com/ls1intum/Artemis/blob/develop/build.gradle) geprüft: Java 25 sowie ein projektverwalteter Download von Node.js und pnpm. Ein separates systemweites Gradle, Node.js oder pnpm ist für diesen Weg nicht nötig.

## System vorbereiten

### 1. Paketlisten aktualisieren

Damit Ubuntu die verfügbaren Paketversionen kennt.

```bash
sudo apt update
```

### 2. Voraussetzungen installieren

Java übersetzt und startet Artemis. PostgreSQL speichert die Daten; Git lädt den Quellcode. Die übrigen Werkzeuge dienen dem Build, der Konfiguration und den Prüfungen.

```bash
sudo apt install openjdk-25-jdk postgresql postgresql-client git curl ca-certificates build-essential graphviz nano openssl
```

### 3. Java für dieses Terminal auswählen

Die feste Auswahl verhindert, dass ein anderes installiertes JDK für den Build verwendet wird. Wiederhole diesen Schritt in einem neuen Terminal vor dem Artemis-Start.

```bash
export JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64
```

### 4. Java in den Suchpfad aufnehmen

Damit auch der direkte Aufruf von `java` die ausgewählte Version verwendet.

```bash
export PATH="$JAVA_HOME/bin:$PATH"
```

**Prüfen:** Die Ausgabe muss Java 25 nennen.

```bash
java -version
```

### 5. PostgreSQL starten

Aktiviert den Datenbankdienst auch für spätere Rechnerstarts.

```bash
sudo systemctl enable --now postgresql
```

**Prüfen:** Der Server muss Verbindungen annehmen.

```bash
pg_isready -h 127.0.0.1 -p 5432
```

## Eigene Datenbank einrichten

### 6. Datenbankbenutzer anlegen

Der Benutzer erhält keine Administratorrechte. Gib auf Nachfrage ein eigenes Datenbankpasswort ein und bewahre es für Schritt 12 auf. Die Namen `artemis_local` werden ausschließlich für diese Testinstanz verwendet.

```bash
sudo -u postgres createuser --pwprompt artemis_local
```

### 7. Datenbank anlegen

Die separate Datenbank gehört dem neuen Benutzer. Artemis legt seine Tabellen später selbst an.

```bash
sudo -u postgres createdb --owner=artemis_local --encoding=UTF8 artemis_local
```

**Prüfen:** Gib das soeben gewählte Passwort ein. Die Ausgabe soll den Benutzer und die Datenbank `artemis_local` zeigen. Falls PostgreSQL bereits vor dieser Anleitung eingerichtet war, muss seine Zugriffskonfiguration lokale TCP-Verbindungen mit Passwort erlauben.

```bash
psql -h 127.0.0.1 -U artemis_local -d artemis_local -W -c 'SELECT current_user, current_database();'
```

## Artemis herunterladen und konfigurieren

### 8. Ins Home-Verzeichnis wechseln

Der Quellcode wird im eigenen Benutzerkonto gespeichert; Artemis wird ohne `sudo` gebaut und gestartet.

```bash
cd ~
```

### 9. Quellcode laden

Lädt den Entwicklungszweig ohne die vollständige Änderungshistorie. Der Zielordner darf noch nicht existieren.

```bash
git clone --depth 1 --branch develop https://github.com/ls1intum/Artemis.git artemis-tum
```

### 10. In den Projektordner wechseln

Alle nachfolgenden Build-Befehle werden hier ausgeführt.

```bash
cd ~/artemis-tum
```

**Prüfen:** Notiere diese Kennung, damit du später weißt, welchen Quellstand du eingerichtet hast. Bei einem späteren Download können sich die Voraussetzungen ändern.

```bash
git rev-parse HEAD
```

### 11. Anmeldeschlüssel erzeugen

Der zufällige Schlüssel dient zur Signierung der Anmeldetokens. Kopiere die ausgegebene Zeile für die Konfiguration.

```bash
openssl rand -base64 64 | tr -d '\n'; echo
```

### 12. Lokale Konfiguration anlegen

Öffnet die Datei für die Einstellungen dieser Instanz. Die Kombination aus PostgreSQL und dem Profil `local` wird im [offiziellen Setup-Handbuch](https://docs.artemis.tum.de/developer/setup/) beschrieben.

```bash
nano src/main/resources/config/application-local.yml
```

Trage den folgenden Inhalt ein. Ersetze die drei Platzhalter durch dein Datenbankpasswort, ein eigenes Adminpasswort und den Schlüssel aus Schritt 11. Verwende bei Passwörtern innerhalb einfacher YAML-Anführungszeichen für ein enthaltenes `'` jeweils `''`. Die Adminadresse ist für diesen lokalen Versuch ein Platzhalter; Mailversand wird hier nicht eingerichtet.

```yaml
server:
    address: 127.0.0.1
    port: 8080
    url: http://localhost:8080

spring:
    datasource:
        url: jdbc:postgresql://127.0.0.1:5432/artemis_local
        username: artemis_local
        password: 'DATENBANKPASSWORT_ERSETZEN'
    jpa:
        database: POSTGRESQL

jhipster:
    security:
        authentication:
            jwt:
                base64-secret: 'SCHLUESSEL_ERSETZEN'

artemis:
    user-management:
        use-external: false
        internal-admin:
            username: lokaladmin
            password: 'ADMINPASSWORT_ERSETZEN'
            email: admin@localhost
```

Speichere mit **Strg+O**, bestätige mit **Enter** und schließe nano mit **Strg+X**. Die Admin-Einstellungen entsprechen den Schlüsseln der [Artemis-Konfiguration](https://github.com/ls1intum/Artemis/blob/develop/src/main/resources/config/application-artemis.yml).

### 13. Konfigurationsdatei schützen

Nur dein Benutzerkonto soll die Datei mit den Zugangsdaten lesen und ändern können.

```bash
chmod 600 src/main/resources/config/application-local.yml
```

## Starten und prüfen

### 14. Artemis starten

Der Gradle Wrapper lädt die benötigten Build-Werkzeuge und Bibliotheken, baut die Weboberfläche und startet den Server. Der erste Aufruf kann erheblich dauern. Das Terminal bleibt während des Betriebs belegt. Die Einbindung des Frontend-Builds ist im [Gradle-Entwicklungsprofil](https://github.com/ls1intum/Artemis/blob/develop/gradle/profile_dev.gradle) hinterlegt.

```bash
./gradlew bootRun --args='--spring.profiles.active=dev,artemis,scheduling,core,local'
```

**Prüfen:** Warte auf die Meldung, dass `ArtemisApp` gestartet wurde. Bei `Connection refused` prüfe PostgreSQL; bei einem Authentifizierungsfehler prüfe das Datenbankpasswort. Falls Port 8080 belegt ist, beende den dort laufenden eigenen Dienst oder wähle in der Konfiguration einen anderen Port und passe die folgenden Adressen an.

### 15. HTTP-Antwort prüfen

Öffne ein zweites Terminal. Eine Antwort mit HTTP-Status `200` zeigt, dass die Startseite ausgeliefert wird.

```bash
curl --fail --output /dev/null --write-out '%{http_code}\n' http://localhost:8080/
```

### 16. Im Browser anmelden

Öffne die lokale Adresse und melde dich mit `lokaladmin` und deinem Adminpasswort an. Prüfe, ob die Verwaltungsfunktionen erreichbar sind.

```text
http://localhost:8080
```

### 17. Artemis beenden

Drücke im Serverterminal **Strg+C**. Die Daten bleiben in PostgreSQL und im Projektordner erhalten. Zum erneuten Start wiederholst du die Schritte 3, 4, 10 und 14.

Für einen öffentlichen Betrieb sind weitere Arbeiten nötig, unter anderem TLS, Backups, Mailversand und eine Produktionskonfiguration. Der lokale Entwicklungsaufbau ist dafür kein fertiger Ersatz. Ausgangspunkt ist das [offizielle Administratorhandbuch](https://docs.artemis.tum.de/admin/intro/).

## Deinstallieren

Die folgenden Schritte löschen die Daten dieser Testinstanz unwiderruflich. Sichere benötigte Kurse, Uploads und eigene Quellcodeänderungen vorher.

### 1. Server beenden

Drücke im Serverterminal **Strg+C**, damit Artemis nicht mehr auf die Datenbank zugreift.

### 2. Datenbank löschen

Entfernt alle in dieser Testinstanz gespeicherten Datenbankinhalte.

```bash
sudo -u postgres dropdb artemis_local
```

### 3. Datenbankbenutzer löschen

Entfernt das ausschließlich für diese Instanz angelegte Datenbankkonto.

```bash
sudo -u postgres dropuser artemis_local
```

### 4. Projektordner löschen

Entfernt Quellcode, Konfiguration, Build-Dateien und dort abgelegte Artemis-Dateien. Gemeinsame Gradle-Caches im Home-Verzeichnis bleiben für andere Projekte erhalten.

```bash
rm -rf -- ~/artemis-tum
```

**Prüfen:** Die Ausgabe soll `entfernt` lauten.

```bash
test ! -e ~/artemis-tum && echo entfernt
```

### 5. Optional: Java-Entwicklungspaket entfernen

Führe dies nur aus, wenn du das Paket für kein anderes Projekt benötigst. PostgreSQL und die Hilfsprogramme bleiben installiert, damit bestehende Datenbanken und andere Anwendungen erhalten bleiben.

```bash
sudo apt remove openjdk-25-jdk
```
