# Autolab

Autolab ist eine an der Carnegie Mellon University entwickelte Webanwendung zum Verwalten von Programmieraufgaben, Abgaben und Bewertungen.

## Einordnung und Grenzen

Diese Anleitung beschreibt eine **lokale Testinstallation ohne Container** auf Ubuntu 26.04 LTS (amd64). Sie installiert die Rails-Webanwendung mit SQLite im eigenen Benutzerkonto. Für die Teilnahme an einem bestehenden Hochschulkurs genügt normalerweise der Browser mit der von der Hochschule mitgeteilten Adresse.

**Kompatibilitätsstand:** Die [offizielle manuelle Anleitung](https://docs.autolabproject.com/installation/ubuntu/) behandelt Ubuntu 22.04. Die Übertragung auf Ubuntu 26.04 wurde hier anhand des Quellcodes vorbereitet, aber nicht praktisch durchinstalliert. Insbesondere das Übersetzen älterer Ruby-Erweiterungen kann Anpassungen erfordern. Dieser Aufbau ist deshalb keine bestätigte Produktionsinstallation.

Der geprüfte [Quellstand](https://github.com/autolab/Autolab/tree/5497901b2dfac43d73404e9059dde2067a733346) bindet Ruby 3.2.2 und Rails 6.1.7.6. Ruby 3.2 erhält seit April 2026 keine Pflege mehr; siehe den [Ruby-Wartungsstatus](https://www.ruby-lang.org/en/downloads/branches/). Verwende diese Testinstanz ausschließlich lokal und ohne echte Studierendendaten. Für einen öffentlichen Lehrbetrieb müssen die veralteten Abhängigkeiten zuerst durch eine unterstützte und getestete Kombination ersetzt werden.

Automatische Bewertungen übernimmt der separate Dienst **Tango**. Dessen dokumentierte Ausführungsumgebungen verwenden Docker oder AWS-EC2-VMs. Dieser lokale Aufbau enthält weder Tango noch automatische Programmausführung. Die Webanwendung kann unabhängig davon laufen; siehe die [Komponentenübersicht](https://docs.autolabproject.com/) und die [Tango-Anleitung](https://docs.autolabproject.com/installation/tango/). Redis und MySQL werden für diesen SQLite-Versuch nicht benötigt.

## Voraussetzungen installieren

### 1. Paketlisten aktualisieren

Damit Ubuntu die verfügbaren Paketversionen kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramme und Entwicklungsbibliotheken installieren

Die Compiler und Bibliotheken werden zum Bauen von Ruby und nativen Gems gebraucht. Die MySQL-Entwicklungsbibliothek bleibt erforderlich, weil Autolab das Gem `mysql2` auch bei dieser SQLite-Konfiguration installiert. Ein MySQL-Server wird dadurch nicht eingerichtet.

```bash
sudo apt install build-essential git curl ca-certificates autoconf bison patch libssl-dev libyaml-dev libreadline-dev libncurses-dev libgdbm-dev libffi-dev zlib1g-dev libmysqlclient-dev libjansson-dev universal-ctags sqlite3 libsqlite3-dev pkg-config shared-mime-info openssl perl nano rbenv ruby-build
```

### 3. rbenv für dieses Terminal aktivieren

Ubuntu liefert rbenv als Paket. Damit lässt sich die vom Projekt verlangte Ruby-Version zusätzlich zum System-Ruby verwenden. Wiederhole diesen Schritt in einem neuen Terminal vor der Arbeit an Autolab.

```bash
eval "$(rbenv init - bash)"
```

### 4. Plugin-Verzeichnis anlegen

Hier wird eine aktuelle Bauanleitung für Ruby abgelegt, damit der Build nicht von der Version des Ubuntu-Pakets `ruby-build` abhängt.

```bash
mkdir -p ~/.rbenv/plugins
```

### 5. Aktuelles ruby-build laden

Das offizielle Plugin kennt zusätzliche Build-Korrekturen. Falls dieses Verzeichnis bereits existiert, verwende deine vorhandene Installation und aktualisiere sie bei Bedarf, statt sie zu überschreiben.

```bash
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
```

## Quellcode und Ruby einrichten

### 6. Ins Home-Verzeichnis wechseln

Autolab erhält einen eigenen Ordner im Benutzerkonto.

```bash
cd ~
```

### 7. Repository herunterladen

Lädt den Quellcode. Der Zielordner darf noch nicht existieren.

```bash
git clone https://github.com/autolab/Autolab.git autolab-cmu
```

### 8. Projektordner öffnen

Alle weiteren Autolab-Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/autolab-cmu
```

### 9. Geprüften Quellstand auswählen

Der feste Commit verhindert, dass spätere Änderungen unbemerkt andere Voraussetzungen einführen. Git meldet dabei einen abgetrennten HEAD; für diesen Installationsversuch ist das vorgesehen.

```bash
git checkout --detach 5497901b2dfac43d73404e9059dde2067a733346
```

### 10. Ruby übersetzen und installieren

Verwendet die Version aus `.ruby-version`. `RUBY_BUILD_VENDOR_OPENSSL=1` lässt ruby-build eine zu dieser alten Ruby-Version passende OpenSSL-Bibliothek mitbauen, statt sich auf die neuere Systembibliothek zu verlassen. Ruby und diese Bibliothek landen im Benutzerkonto. Die [ruby-build-Dokumentation](https://github.com/rbenv/ruby-build#readme) erläutert die Option.

```bash
RUBY_BUILD_VENDOR_OPENSSL=1 rbenv install --skip-existing "$(cat .ruby-version)"
```

**Prüfen:** Im Projektordner muss Ruby 3.2.2 aus deinem rbenv-Verzeichnis verwendet werden.

```bash
rbenv which ruby
```

```bash
ruby --version
```

### 11. Passenden Bundler installieren

Verwendet die in `Gemfile.lock` festgelegte Version des Ruby-Paketmanagers. Hier und bei allen folgenden Gem-Befehlen ist kein `sudo` nötig.

```bash
gem install bundler -v 2.5.3 --no-document
```

### 12. Gems im Projektordner ablegen

Die Bibliotheken werden getrennt von anderen Ruby-Projekten unter `vendor/bundle` gespeichert.

```bash
bundle _2.5.3_ config set --local path vendor/bundle
```

### 13. Projektabhängigkeiten installieren

Bundler verwendet die vorhandene Sperrdatei. Das Bauen nativer Erweiterungen kann mehrere Minuten dauern und viel Speicher benötigen. Bricht es mit einem Compilerfehler ab, ist die Installation noch nicht abgeschlossen; entferne dann nicht einfach Versionsbindungen aus der Gemfile.

```bash
bundle _2.5.3_ install
```

**Prüfen:** Bundler soll alle Abhängigkeiten als erfüllt melden.

```bash
bundle check
```

## Lokale Einstellungen

### 14. Datenbankkonfiguration anlegen

SQLite speichert die Daten direkt als Dateien. Öffne die neue Konfiguration und füge den nachfolgenden Inhalt ein.

```bash
nano config/database.yml
```

```yaml
development:
  adapter: sqlite3
  database: db/autolab_development.sqlite3
  pool: 5
  timeout: 5000

test:
  adapter: sqlite3
  database: db/autolab_test.sqlite3
  pool: 5
  timeout: 5000
```

Speichere mit **Strg+O**, bestätige mit **Enter** und beende nano mit **Strg+X**.

### 15. Organisationskonfiguration kopieren

Erzeugt die lokale Datei aus der zum Quellstand gehörenden Vorlage.

```bash
cp config/school.yml.template config/school.yml
```

### 16. Organisation anpassen

Ändere im Abschnitt `development` beispielsweise `school_name` auf `Lokaler Autolab-Test` und `school_short_name` auf `TEST`. Trage eigene Kontaktadressen ein. Dadurch gibt sich deine unabhängige Testinstanz nicht als CMU-Installation aus.

```bash
nano config/school.yml
```

### 17. Autograding-Konfiguration vorbereiten

Auch ohne laufenden Tango-Dienst wird die vom Projekt vorgesehene Konfigurationsdatei angelegt. Automatische Bewertungen werden dadurch noch nicht eingerichtet.

```bash
cp config/autogradeConfig.rb.template config/autogradeConfig.rb
```

### 18. Umgebungsdatei anlegen

Die Datei nimmt Schlüssel und lokale Verbindungsangaben auf.

```bash
cp .env.template .env
```

### 19. Lokale URL einstellen

Ersetze in der Datei die Zeile für `MAILER_HOST` durch `MAILER_HOST=localhost:3000`. Mailversand wird in dieser Anleitung nicht eingerichtet. Die Tango-Werte `RESTFUL_HOST`, `RESTFUL_PORT` und `RESTFUL_KEY` bleiben zunächst leer.

```bash
nano .env
```

### 20. Zufällige Anwendungsschlüssel erzeugen

Das mitgelieferte Skript ersetzt die Schlüsselplatzhalter in `.env`. Führe es bei einer bestehenden Instanz nicht als routinemäßigen Startschritt aus.

```bash
./bin/initialize_secrets.sh
```

### 21. Schlüsseldatei schützen

Beschränkt den Dateizugriff auf dein Benutzerkonto.

```bash
chmod 600 .env
```

## Datenbank und Anmeldung

### 22. Entwicklungsdatenbank anlegen

Erzeugt die lokale SQLite-Datei, ohne eine vorhandene Datenbank zurückzusetzen.

```bash
RAILS_ENV=development bundle exec rails db:create
```

### 23. Datenbankschema einrichten

Die Migrationen legen die benötigten Tabellen an. Ein Fehler muss behoben werden, bevor du mit dem Serverstart fortfährst.

```bash
RAILS_ENV=development bundle exec rails db:migrate
```

### 24. Administratorkonto anlegen

Das Projektskript fragt E-Mail-Adresse, Passwort und Namen ab. `-d` wählt die Entwicklungsdatenbank. Verwende für diesen Test ein eigenes Passwort ohne Kommas oder eckige Klammern, weil das Skript die Eingaben als Rake-Argumentliste weitergibt.

```bash
./bin/initialize_user.sh -d
```

## Starten und prüfen

### 25. Webanwendung starten

Bindet den Entwicklungsserver ausschließlich an die lokale IPv4-Adresse. Lass dieses Terminal geöffnet.

```bash
RAILS_ENV=development bundle exec rails server --binding=127.0.0.1 --port=3000
```

### 26. HTTP-Verbindung prüfen

Führe die Abfrage in einem zweiten Terminal aus. Erwartet wird eine erfolgreiche Antwort oder eine Weiterleitung zur Anmeldung. Ein Status `500` weist auf einen Anwendungsfehler hin; Details stehen im Serverterminal.

```bash
curl --head http://127.0.0.1:3000/
```

### 27. Im Browser anmelden

Öffne diese Adresse und verwende das in Schritt 24 angelegte Konto. Prüfe, ob du die Kursverwaltung öffnen kannst. Autograding-Funktionen bleiben ohne Tango unbenutzbar.

```text
http://127.0.0.1:3000
```

### 28. Server beenden

Drücke im Serverterminal **Strg+C**. Zum erneuten Start aktivierst du rbenv wie in Schritt 3, wechselst in den Projektordner und wiederholst Schritt 25. Datenbank und Abgaben bleiben im Projektverzeichnis erhalten.

## Deinstallieren

### 1. Autolab beenden

Drücke im Serverterminal **Strg+C**, damit keine Dateien mehr geschrieben werden.

### 2. Projektordner entfernen

**Achtung:** Dieser Befehl löscht die Testdatenbank, Abgaben, Schlüssel und alle eigenen Änderungen im Projekt. Sichere benötigte Dateien vorher.

```bash
rm -rf -- ~/autolab-cmu
```

### 3. Optional: Ruby-Version entfernen

Nur ausführen, wenn kein anderes Projekt Ruby 3.2.2 aus rbenv verwendet. Die übrigen rbenv-Versionen bleiben erhalten.

```bash
rbenv uninstall 3.2.2
```

### 4. Entfernung prüfen

Die Ausgabe soll `Autolab entfernt` lauten. Systembibliotheken und rbenv bleiben für andere Projekte installiert; es wurde kein eigener Datenbankdienst eingerichtet.

```bash
test ! -e ~/autolab-cmu && echo 'Autolab entfernt'
```
