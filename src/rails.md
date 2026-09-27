# Ruby on Rails

Ruby on Rails (kurz Rails) ist das bekannteste Web-Framework für die Programmiersprache Ruby. Es folgt festen Namensregeln: Wer Klassen, Dateien und Tabellen so benennt, wie Rails es erwartet, muss kaum etwas einstellen. Generatoren erzeugen Models, Migrationen und Controller, Active Record liest und schreibt die Datenbank ohne SQL.

## Vorbemerkungen

- **Aus den Paketquellen:** Ubuntu 26.04 enthält Rails **7.2** samt Ruby 3.3 und allen Bibliotheken (Gems) als Pakete. Neue Projekte verwenden nur diese lokal installierten Gems. Die neueste Version (Rails 8.1) gibt es über `gem`, siehe Abschnitt „Alternative: neueste Version über gem“.
- **Ohne empfohlene Pakete:** Das Paket `rails` empfiehlt über Umwege Node.js-Pakete und den Browser Chromium (als Snap) für automatische Browsertests. Für eine Schnittstelle braucht man beides nicht. Mit `--no-install-recommends` kommen rund 90 statt über 200 Pakete auf den Rechner.
- **Datenbank:** Neue Projekte verwenden **SQLite**. Die Datenbank ist eine Datei im Ordner `storage`, ein Datenbankserver ist nicht nötig. Die Notizen bleiben deshalb auch nach einem Neustart erhalten.
- **Port 3000:** Der Entwicklungsserver lauscht auf <http://127.0.0.1:3000>. Läuft dort schon ein anderes Programm, etwa [Martin](martin.md) oder [Express](express.md), bricht Rails mit `Address already in use` ab. Starte den Server dann mit `bin/rails server -p 3001` und schreibe in allen Adressen dieser Anleitung `3001` statt `3000`.
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [Express](express.md), [Laravel](laravel.md), [FastAPI](fastapi.md), [ASP.NET Core](aspnet-core.md) und [Axum und Actix-web](rust-web.md).
- **Version:** Getestet mit Rails **7.2.3**, Ruby 3.3.8, Bundler 2.6 und dem Webserver Puma 6.6 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Rails installieren

`rails` zieht Ruby, Bundler, den Webserver Puma und die Anbindung an SQLite (`ruby-sqlite3`) mit. `--no-install-recommends` lässt Node.js und Chromium weg.

```bash
sudo apt install --no-install-recommends rails
```

**Prüfen:** Die Ausgabe lautet `Rails 7.2.3`.

```bash
rails --version
```

## Erstes Projekt

### 3. In das Home-Verzeichnis wechseln

Das Projekt wird im aktuellen Ordner angelegt.

```bash
cd ~
```

### 4. Projekt anlegen

Legt den Ordner `meinrails` mit einem fertigen Projekt an. Die Schalter bedeuten:

- `--api` – ein schlankes Projekt nur für Schnittstellen, ohne HTML-Vorlagen, Stylesheets und Browser-Sitzungen.
- `--skip-brakeman` und `--skip-rubocop` – lassen zwei Prüfwerkzeuge weg. Ubuntu hat sie nicht als Paket. Da Rails nur lokal installierte Gems verwendet, würde das Anlegen sonst mit `Could not find gem 'brakeman' in locally installed gems` scheitern.
- `--skip-ci` und `--skip-docker` – lassen Dateien für GitHub Actions und Docker weg.

```bash
rails new meinrails --api --skip-brakeman --skip-rubocop --skip-ci --skip-docker
```

**Prüfen:** Die Ausgabe endet mit `run  bundle binstubs bundler`. Weiter oben stehen `run  bundle install --local --quiet` ohne Fehlermeldung darunter und `Writing lockfile to /home/…/meinrails/Gemfile.lock`. Für diesen Schritt fragt Bundler kurz bei rubygems.org nach (`Fetching gem metadata`), installiert aber nichts von dort.

### 5. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt. Rails hat hier auch schon ein Git-Repository angelegt.

```bash
cd ~/meinrails
```

**Prüfen:** Die Ausgabe lautet `Rails 7.2.3`. `bin/rails` ist das Werkzeug des Projekts für alle weiteren Aufgaben.

```bash
bin/rails --version
```

### 6. Mehrzahl von „Notiz“ festlegen

Rails bildet aus dem Namen eines Models die Namen von Tabelle, Controller und Adressen, und zwar nach englischen Regeln. Aus `Notiz` würde `notizs`. Eine eigene Regel in der Datei für Wortformen (Inflections) sagt Rails, dass die Mehrzahl `notizen` heißt. Die Regel muss vor Schritt 7 stehen, weil der Generator sie schon braucht.

```bash
nano config/initializers/inflections.rb
```

Die Datei enthält nur Kommentare. Drücke <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende der Datei) und füge diese Zeilen ein:

```ruby

# Deutsche Mehrzahl für "Notiz", sonst bildet Rails "notizs"
ActiveSupport::Inflector.inflections(:en) do |inflect|
  inflect.irregular "notiz", "notizen"
end
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. Model und Migration erzeugen

Ein **Model** steht für eine Tabelle, eine **Migration** beschreibt, wie die Tabelle angelegt wird. `titel:string` ergänzt eine Textspalte `titel`. Die laufende Nummer `id` und die Zeitstempel `created_at` und `updated_at` fügt Rails selbst hinzu.

```bash
bin/rails generate model Notiz titel:string
```

**Prüfen:** Die Ausgabe enthält `create    db/migrate/…_create_notizen.rb` und `create    app/models/notiz.rb`. Steht dort `create_notizs`, fehlt die Regel aus Schritt 6. Lösche die Dateien dann mit `bin/rails destroy model Notiz`, korrigiere Schritt 6 und wiederhole diesen Schritt.

### 8. Tabelle anlegen

Führt die Migration aus. Rails legt dabei die Datei `storage/development.sqlite3` an und darin die Tabelle `notizen`.

```bash
bin/rails db:migrate
```

**Prüfen:** Die Ausgabe enthält `create_table(:notizen)` und endet mit `CreateNotizen: migrated`.

### 9. Pflichtfeld im Model festlegen

Das Model soll keine Notiz ohne Titel speichern.

```bash
nano app/models/notiz.rb
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein:

```ruby
class Notiz < ApplicationRecord
  # Ohne Titel wird keine Notiz gespeichert
  validates :titel, presence: true
end
```

`validates … presence: true` lässt `save` scheitern, wenn `titel` fehlt oder leer ist. Die Spalten muss man im Model nicht aufzählen, Rails liest sie aus der Datenbank.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Controller für die Notizen schreiben

Ein **Controller** beantwortet Anfragen. Rails findet ihn über seinen Namen: Adressen unter `/notizen` landen in der Klasse `NotizenController` in der Datei `notizen_controller.rb`. Die Datei ist neu, nano startet mit einer leeren Seite.

```bash
nano app/controllers/notizen_controller.rb
```

Füge diesen Inhalt ein:

```ruby
class NotizenController < ApplicationController
  # Gibt es die gesuchte Notiz nicht, antworten wir mit 404
  rescue_from ActiveRecord::RecordNotFound do
    render json: { fehler: "Notiz nicht gefunden" }, status: :not_found
  end

  # GET /notizen liefert alle Notizen
  def index
    render json: Notiz.order(:id).as_json(only: [:id, :titel])
  end

  # GET /notizen/1 liefert eine Notiz
  def show
    notiz = Notiz.find(params[:id])
    render json: notiz.as_json(only: [:id, :titel])
  end

  # POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
  def create
    notiz = Notiz.new(titel: params[:titel])
    if notiz.save
      render json: notiz.as_json(only: [:id, :titel]), status: :created, location: notiz
    else
      render json: { fehler: notiz.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
```

- **Methoden** `index`, `show` und `create` – die üblichen Namen für „alle zeigen“, „eine zeigen“ und „anlegen“. Welche Adresse zu welcher Methode führt, legt Schritt 12 fest.
- `params` – enthält alle Werte der Anfrage: aus der Adresse (`:id`) und aus dem mitgeschickten JSON (`titel`). Es wird nur `titel` übernommen. Schickt jemand eine eigene `id` mit, bleibt sie unbeachtet.
- `Notiz.find` – sucht nach der Nummer. Gibt es sie nicht, löst es einen Fehler aus, den `rescue_from` in eine Antwort mit `404` verwandelt.
- `as_json(only: …)` – nimmt nur `id` und `titel` in das JSON auf, ohne die Zeitstempel.
- `location: notiz` – setzt die Kopfzeile `Location` auf die Adresse der neuen Notiz.
- `errors.full_messages` – die Gründe, warum `save` gescheitert ist, hier aus Schritt 9.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Controller für die Begrüßung schreiben

Ein zweiter, kleiner Controller für die Adresse `/hallo`.

```bash
nano app/controllers/hallo_controller.rb
```

Füge diesen Inhalt ein:

```ruby
class HalloController < ApplicationController
  # GET /hallo?name=... liefert eine Begrüßung als JSON
  def index
    name = params.fetch(:name, "Welt")
    render json: { gruss: "Hallo #{name}!" }
  end
end
```

`params.fetch(:name, "Welt")` nimmt den Wert aus `?name=…` oder, wenn er fehlt, `Welt`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Routen festlegen

In `config/routes.rb` steht, welche Adresse und Methode zu welchem Controller führt.

```bash
nano config/routes.rb
```

Ersetze den ganzen Inhalt wie in Schritt 9 und füge ein:

```ruby
Rails.application.routes.draw do
  # GET /hallo beantwortet die Methode index im HalloController
  get "hallo", to: "hallo#index"

  # Adressen für Notizen: alle lesen, eine lesen, eine anlegen
  resources :notizen, only: [:index, :show, :create]
end
```

`resources :notizen` erzeugt mit einer Zeile die üblichen Adressen für eine Sammlung. `only:` beschränkt sie auf die drei Methoden aus Schritt 10. Ohne `only:` kämen Ändern und Löschen dazu, für die es im Controller noch keine Methoden gibt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Routen anzeigen

Zeigt die Routen, die zu Controllern mit `notizen` im Namen führen. So siehst du, ob Rails die Datei aus Schritt 12 fehlerfrei gelesen hat.

```bash
bin/rails routes -c notizen
```

**Prüfen:** Die Liste enthält drei Zeilen: `GET /notizen` → `notizen#index`, `POST /notizen` → `notizen#create` und `GET /notizen/:id` → `notizen#show`. Ohne `-c notizen` erscheinen zusätzlich viele Routen, die Rails selbst für E-Mail-Empfang und Datei-Uploads mitbringt.

## Starten und testen

### 14. Entwicklungsserver starten

Startet Puma im Entwicklungsmodus, nur vom eigenen Rechner aus erreichbar. Das Terminal bleibt belegt, hier erscheinen zu jeder Anfrage Controller, Parameter und die ausgeführten SQL-Befehle.

```bash
bin/rails server
```

**Prüfen:** Die Ausgabe enthält `Listening on http://127.0.0.1:3000` und endet mit `Use Ctrl-C to stop`. Steht dort stattdessen `Address already in use`, ist Port 3000 belegt, siehe Vorbemerkungen.

### 15. Notiz anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:3000/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, weiter unten steht `location: http://localhost:3000/notizen/1`, die letzte Zeile ist `{"id":1,"titel":"Erste Notiz"}`. Im ersten Terminal erscheint `Processing by NotizenController#create` und `Completed 201 Created`.

### 16. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung:

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:3000/notizen` | `[{"id":1,"titel":"Erste Notiz"}]` |
| `curl http://localhost:3000/notizen/1` | `{"id":1,"titel":"Erste Notiz"}` |
| `curl "http://localhost:3000/hallo?name=Thorsten"` | `{"gruss":"Hallo Thorsten!"}` |
| `curl http://localhost:3000/notizen/7` | `{"fehler":"Notiz nicht gefunden"}` (Status 404) |
| `curl -X POST http://localhost:3000/notizen -H "Content-Type: application/json" -d '{}'` | `{"fehler":["Titel can't be blank"]}` (Status 422) |
| `curl http://localhost:3000/gibtsnicht` | langes JSON mit `"status":404` und `No route matches [GET] \"/gibtsnicht\"` |

Die Meldung `Titel can't be blank` stammt aus der Regel in Schritt 9. Rails formuliert sie auf Englisch, solange keine deutschen Texte eingerichtet sind. Bei unbekannten Adressen antwortet Rails im Entwicklungsmodus selbst, mit einer ausführlichen Fehlerbeschreibung zur Fehlersuche.

### 17. Änderung ohne Neustart ausprobieren

Rails lädt geänderten Code im Entwicklungsmodus bei der nächsten Anfrage neu. Ändere in `app/controllers/hallo_controller.rb` das Wort `Hallo` z. B. in `Servus` und speichere die Datei.

**Prüfen:** `curl http://localhost:3000/hallo` liefert sofort `{"gruss":"Servus Welt!"}`.

Änderungen in `config/initializers` (wie in Schritt 6) werden erst nach einem Neustart des Servers wirksam.

### 18. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

**Prüfen:** Die letzten Zeilen lauten `- Goodbye!` und `Exiting`. Startest du den Server mit `bin/rails server` erneut, liefert `curl http://localhost:3000/notizen` weiterhin die Notiz aus Schritt 15. Sie liegt in `storage/development.sqlite3`.

## Wie geht es weiter?

- **Konsole:** `bin/rails console` öffnet Ruby mit geladenem Projekt. Dort liefert z. B. `Notiz.count` die Zahl der Notizen und `Notiz.create(titel: "Aus der Konsole")` legt eine an. Beenden mit `exit`.
- **Gerüst erzeugen:** `bin/rails generate scaffold Aufgabe titel:string erledigt:boolean` erzeugt Model, Migration, Controller mit allen Methoden (auch Ändern und Löschen), Routen und Tests auf einmal. Danach `bin/rails db:migrate`.
- **Tests:** Der Generator aus Schritt 7 hat unter `test/` schon Dateien angelegt. `bin/rails test` führt alle Tests aus.
- **Webseiten:** Ohne `--api` angelegte Projekte liefern HTML-Seiten aus Vorlagen im Ordner `app/views`.
- **Andere Datenbank:** Mit dem Paket `ruby-pg`, dem Eintrag `gem "pg"` im `Gemfile` und passenden Angaben in `config/database.yml` verwendet Rails [PostgreSQL](postgresql.md). `rails new … --database=postgresql` richtet das gleich beim Anlegen ein.
- **Betrieb:** Auf einem Server startet man Puma mit `RAILS_ENV=production` über einen systemd-Dienst (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage) und setzt [nginx](nginx.md) davor, der auch HTTPS übernimmt. Vorher müssen mit `RAILS_ENV=production bin/rails db:migrate` die Tabellen der Produktionsdatenbank angelegt werden.

## Alternative: neueste Version über gem

Wer Rails 8 braucht, installiert es mit `gem` in das eigene Home-Verzeichnis. Die Gems kommen dann von rubygems.org und nicht aus Ubuntu. Beim Anlegen eines Projekts übersetzt Bundler einige Gems (z. B. Puma und bootsnap) aus dem Quellcode. Dafür braucht es `ruby-dev` und `build-essential`.

```bash
sudo apt install ruby-dev build-essential
```

```bash
gem install --user-install rails
```

Der Befehl `rails` landet dann in `~/.local/share/gem/ruby/3.3.0/bin`. Diesen Ordner musst du in die Variable `PATH` aufnehmen, sonst startet weiter die Version aus Ubuntu. `rails new` braucht mit dieser Version die `--skip`-Schalter aus Schritt 4 nicht, lädt aber alle fehlenden Gems aus dem Internet (getestet mit Rails 8.1.4). Diese Version bekommt keine Updates über `apt`, du hältst sie selbst mit `gem update --user-install rails` aktuell.

## Deinstallieren

### 1. Server beenden

Läuft `bin/rails server` noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projekt entfernen

Löscht den Projektordner samt SQLite-Datenbank.

```bash
rm -rf ~/meinrails
```

**Prüfen:** Der Projektordner existiert nicht mehr, `ls` meldet `Datei oder Verzeichnis nicht gefunden`.

```bash
ls ~/meinrails
```

### 3. Rails entfernen

Nur ausführen, wenn kein anderes Programm Rails braucht.

```bash
sudo apt purge rails
```

### 4. Nicht mehr benötigte Pakete entfernen

Entfernt die Pakete, die nur für Rails mitinstalliert wurden, z. B. `ruby-rails`, `puma` und `ruby-sqlite3`. Ruby selbst bleibt, wenn ein anderes Programm es braucht, etwa [Jekyll](jekyll.md) oder [Asciidoctor](asciidoctor.md). Der Befehl entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Die Shell meldet, dass der Befehl `rails` nicht gefunden wurde.

```bash
rails --version
```
