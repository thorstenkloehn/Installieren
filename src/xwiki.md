# XWiki

XWiki ist eine in Java geschriebene Wiki-Plattform für Unternehmen und Teams. Neben normalen Wiki-Seiten bietet sie strukturierte Daten, feine Rechteverwaltung und viele Erweiterungen. Diese Anleitung installiert XWiki aus dem offiziellen apt-Repository, lässt es im Webserver Tomcat laufen und speichert alle Inhalte in PostgreSQL.

## Vorbemerkungen

- **Voraussetzung:** [PostgreSQL](postgresql.md) ist nach der Anleitung installiert und läuft.
- **Offizielles Repository:** Ubuntu selbst enthält kein XWiki-Paket. Das XWiki-Projekt betreibt aber ein eigenes apt-Repository. Die Pakete richten die Datenbank selbst ein und binden XWiki in Tomcat ein. Tomcat und Java kommen aus den Paketquellen von Ubuntu.
- **Version:** Die Anleitung verwendet den Zweig mit Langzeitunterstützung (**LTS**), derzeit XWiki **17.10**. Er bekommt über längere Zeit nur Fehlerkorrekturen und ist deshalb ruhiger im Betrieb. Wer immer die neuesten Funktionen möchte, nimmt den Zweig `stable` (Hinweis in Schritt 4).
- **Getestet:** XWiki 17.10.13 mit Tomcat 11, Java 25 und PostgreSQL 18 unter Ubuntu 26.04.
- **Port:** Tomcat läuft normalerweise auf Port 8080. Auf diesem Rechner belegt Apache diesen Port schon (siehe [Tileserver](tileserver.md)). Die Anleitung stellt Tomcat deshalb auf Port **8082** um. XWiki ist dabei nur vom eigenen Rechner aus erreichbar.
- **Platzbedarf:** Die Pakete brauchen etwa 600 MB. XWiki sollte mindestens 2 GB freien Arbeitsspeicher haben.

## Repository einbinden

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme aus dem nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramme installieren

`curl` lädt den Signaturschlüssel herunter, `ca-certificates` enthält die Zertifikate für die HTTPS-Verbindung.

```bash
sudo apt install curl ca-certificates
```

### 3. Signaturschlüssel herunterladen

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich vom XWiki-Projekt stammen. `--fail` verhindert, dass bei einem Fehler eine Fehlerseite als Schlüssel gespeichert wird.

```bash
sudo curl -o /usr/share/keyrings/xwiki-keyring.gpg --fail https://maven.xwiki.org/xwiki-keyring.gpg
```

**Prüfen:** Angezeigt wird ein Schlüssel von `XWiki Dev Team <committers@xwiki.org>`.

```bash
gpg --show-keys /usr/share/keyrings/xwiki-keyring.gpg
```

### 4. Paketquelle eintragen

Legt eine neue Datei an, in der die Adresse des Repositorys steht. `apt` liest alle Dateien mit der Endung `.sources` in diesem Ordner als zusätzliche Paketquellen ein.

```bash
sudo nano /etc/apt/sources.list.d/xwiki-lts.sources
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://maven.xwiki.org
Suites: lts/
Signed-By: /usr/share/keyrings/xwiki-keyring.gpg
```

Was die Felder bedeuten:

- `Types: deb` – aus dieser Quelle kommen fertige Programmpakete.
- `URIs` – die Internetadresse des Repositorys.
- `Suites: lts/` – der Zweig mit Langzeitunterstützung. Der Schrägstrich am Ende ist wichtig: Das XWiki-Repository ist ein sogenanntes flaches Repository ohne Unterbereiche, deshalb fehlt auch die Zeile `Components`. Für die neueste Version steht hier `stable/`.
- `Signed-By` – Pakete aus dieser Quelle werden nur mit dem Schlüssel aus Schritt 3 akzeptiert.

### 5. Paketlisten neu einlesen

Jetzt lädt `apt` das Paketverzeichnis des XWiki-Repositorys herunter.

```bash
sudo apt update
```

**Prüfen:** Beim `Installationskandidat` steht eine Version, die mit `17.10` beginnt.

```bash
apt policy xwiki-tomcat11-pgsql
```

## Tomcat einrichten

### 6. Tomcat installieren

XWiki ist eine Java-Webanwendung und braucht einen Servlet-Container, der sie ausführt. Das ist hier Tomcat 11 aus Ubuntu. Tomcat wird vor XWiki installiert, damit du zuerst den Port ändern kannst. Die Installation bringt auch Java mit, falls es noch nicht vorhanden ist.

```bash
sudo apt install tomcat11
```

Direkt nach der Installation versucht Tomcat, Port 8080 zu belegen. Ist der Port schon vergeben, steht im Protokoll ein Fehler mit `BindException`. Das wird im nächsten Schritt behoben.

### 7. Port von Tomcat ändern

Öffnet die zentrale Einstellungsdatei von Tomcat.

```bash
sudo nano /etc/tomcat11/server.xml
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `Connector port="8080"` und bestätige mit <kbd>Enter</kbd>. Ändere die gefundene Zeile

```xml
    <Connector port="8080" protocol="HTTP/1.1"
```

so ab:

```xml
    <Connector port="8082" address="127.0.0.1" protocol="HTTP/1.1"
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

- `port="8082"` – Tomcat nimmt Anfragen auf Port 8082 an statt auf dem belegten Port 8080.
- `address="127.0.0.1"` – Tomcat ist nur vom eigenen Rechner aus erreichbar.

Weiter unten in der Datei steht noch einmal `port="8080"`, aber innerhalb eines Kommentars (`<!-- … -->`). Diese Stelle bleibt unverändert.

### 8. Tomcat neu starten

Tomcat liest `server.xml` nur beim Start ein.

```bash
sudo systemctl restart tomcat11
```

**Prüfen:** Nach einigen Sekunden lautet die erste Zeile `HTTP/1.1 200`.

```bash
curl -sI http://localhost:8082/
```

## XWiki installieren

### 9. XWiki-Paket für Tomcat 11 und PostgreSQL installieren

Das Paket `xwiki-tomcat11-pgsql` zieht alle nötigen Teile nach: XWiki selbst, die Anbindung an Tomcat 11 und die Anbindung an PostgreSQL.

```bash
sudo apt install xwiki-tomcat11-pgsql
```

Während der Installation erscheinen Fragen des Hilfsprogramms `dbconfig-common`, das die Datenbank für XWiki anlegt. Mit der <kbd>Tab</kbd>-Taste wechselst du zwischen den Schaltflächen, mit <kbd>Enter</kbd> bestätigst du:

- **Datenbank für xwiki mit dbconfig-common konfigurieren?** – **Ja**. Dann legt das Paket in PostgreSQL den Benutzer `xwiki` und die Datenbank `xwiki` an und trägt die Zugangsdaten in die Einstellungen von XWiki ein.
- **PostgreSQL-Anwendungspasswort für xwiki** – Lass das Feld leer und bestätige mit **Ok**. Dann erzeugt das Paket ein zufälliges Passwort. Du musst es dir nicht merken, weil nur XWiki selbst es braucht. Ein eigenes Passwort geht auch, dann wird es noch einmal zur Bestätigung abgefragt.

**Prüfen:** In der Ausgabe stehen `creating postgres user xwiki: success.` und `creating database xwiki: success.`

### 10. Tomcat neu starten

Die Installation legt XWiki in Tomcat ab und gibt Tomcat Schreibrechte für den Datenordner `/var/lib/xwiki/data`. Tomcat übernimmt beides erst nach einem Neustart.

```bash
sudo systemctl restart tomcat11
```

### 11. Start von XWiki abwarten

Der erste Start dauert etwa eine halbe Minute. Im Protokoll von Tomcat siehst du, wann er fertig ist. <kbd>Strg</kbd>+<kbd>C</kbd> beendet die Anzeige.

```bash
sudo journalctl -u tomcat11 -f
```

**Prüfen:** Es erscheint eine Zeile mit `Server startup in`. Einige Warnungen mit `WARNING: sun.misc.Unsafe` sind normal und stören nicht.

### 12. Datenbank prüfen

Beim ersten Aufruf von XWiki werden die Tabellen in PostgreSQL angelegt. Dieser Aufruf erledigt das und prüft gleichzeitig, ob XWiki antwortet.

```bash
curl -sL -o /dev/null -w '%{http_code}\n' http://localhost:8082/xwiki/
```

**Prüfen:** Die Ausgabe lautet `200`. Danach gibt es in der Datenbank `xwiki` etwa 40 Tabellen.

```bash
sudo -u postgres psql -d xwiki -c "\dt"
```

## Einrichtung im Browser

### 13. Einrichtungsassistenten öffnen

Öffne im Browser <http://localhost:8082/xwiki/>. Ein frisch installiertes XWiki ist noch leer und startet den **Distribution Wizard**, der dich durch die restliche Einrichtung führt.

### 14. Administratorkonto anlegen

Im ersten Schritt legst du das Konto für den Administrator an: Vor- und Nachname, Benutzername, Passwort und E-Mail-Adresse. Mit diesem Konto verwaltest du später das Wiki. Bestätige mit **Register and login** und dann **Continue**.

### 15. Flavor installieren

Ein Flavor ist eine Zusammenstellung von Erweiterungen, die aus der leeren Plattform ein fertiges Wiki macht. Wähle **XWiki Standard Flavor** und klicke auf **Install**. XWiki lädt dabei mehrere hundert Erweiterungen von `extensions.xwiki.org` herunter. Das dauert je nach Internetverbindung einige Minuten. Klicke danach weiter auf **Continue**, bis der Assistent die Startseite des Wikis zeigt.

### 16. Oberfläche auf Deutsch umstellen (optional)

Öffne über das Menü oben rechts die **Administration** (Administer Wiki) und dort **Content → Localization**. Wähle bei **Default Language** den Eintrag für Deutsch und speichere.

Soll XWiki später unter einer eigenen Domain erreichbar sein, leitet man die Anfragen wie bei anderen Diensten über [nginx](nginx.md) an `127.0.0.1:8082` weiter.

## Aktualisieren

XWiki kommt aus einem apt-Repository und wird deshalb mit dem restlichen System aktualisiert.

### 1. Paketlisten aktualisieren

Holt die aktuellen Paketlisten, auch die aus dem XWiki-Repository.

```bash
sudo apt update
```

### 2. Pakete aktualisieren

Installiert neue Versionen aller Pakete, darunter XWiki und Tomcat. Die Einstellungen in `/etc/xwiki` und die Daten in PostgreSQL bleiben erhalten.

```bash
sudo apt upgrade
```

### 3. Tomcat neu starten

Tomcat lädt die neue XWiki-Version erst nach einem Neustart. Beim nächsten Aufruf im Browser bietet XWiki bei Bedarf an, auch die Erweiterungen des Flavors zu aktualisieren.

```bash
sudo systemctl restart tomcat11
```

**Prüfen:** Die neue Versionsnummer steht unten auf jeder Seite von XWiki.

## Deinstallieren

### 1. Tomcat stoppen

Beendet Tomcat und damit XWiki.

```bash
sudo systemctl stop tomcat11
```

### 2. XWiki-Pakete entfernen

`purge` entfernt die Pakete samt Einstellungen in `/etc/xwiki`. Fragt `dbconfig-common`, ob die Datenbank gelöscht werden soll, kannst du **Ja** wählen. Sonst erledigen das die Schritte 3 und 4.

```bash
sudo apt purge xwiki-tomcat11-pgsql xwiki-tomcat11-common xwiki-pgsql-common xwiki-common
```

### 3. Datenbank löschen

Löscht die Datenbank `xwiki`, falls sie noch existiert. **Achtung:** Alle Seiten des Wikis gehen dabei unwiderruflich verloren.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS xwiki;"
```

### 4. Datenbankbenutzer löschen

Entfernt den PostgreSQL-Benutzer `xwiki`.

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS xwiki;"
```

### 5. Datenordner löschen

Nach `purge` bleibt der Ordner mit Anhängen, Suchindex und installierten Erweiterungen übrig. **Achtung:** Hochgeladene Dateien gehen dabei verloren.

```bash
sudo rm -rf /var/lib/xwiki
```

### 6. Tomcat entfernen

Entfernt Tomcat samt Einstellungen und Protokollen. Nur ausführen, wenn Tomcat nicht für andere Anwendungen gebraucht wird.

```bash
sudo apt purge tomcat11 tomcat11-common libtomcat11-java
```

### 7. Nicht mehr benötigte Pakete entfernen

Entfernt Pakete, die nur für XWiki und Tomcat installiert wurden, z. B. `dbconfig-common`, Java-Bibliotheken und – falls es nur dafür nachinstalliert wurde – Java. Sieh dir die Liste vor dem Bestätigen kurz an: Sie kann auch Pakete aus anderen Installationen enthalten, die schon vorher überflüssig waren.

```bash
sudo apt autoremove --purge
```

### 8. Systembenutzer von Tomcat löschen

Tomcat hat bei der Installation den Benutzer `tomcat` angelegt, der beim Entfernen der Pakete erhalten bleibt.

```bash
sudo userdel tomcat
```

### 9. Paketquelle und Schlüssel entfernen

Löscht die Datei aus Schritt 4 und den Schlüssel aus Schritt 3 der Installation.

```bash
sudo rm -f /etc/apt/sources.list.d/xwiki-lts.sources /usr/share/keyrings/xwiki-keyring.gpg
```

### 10. Paketlisten aktualisieren

Damit `apt` das entfernte Repository vergisst.

```bash
sudo apt update
```

**Prüfen:** In der Ausgabe kommt `maven.xwiki.org` nicht mehr vor, und unter Port 8082 antwortet nichts mehr, `curl` meldet einen Verbindungsfehler.

```bash
curl -sI http://localhost:8082/
```
