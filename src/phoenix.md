# Phoenix

Phoenix ist das bekannteste Webframework für die Programmiersprache Elixir. Elixir läuft auf der virtuellen Maschine von Erlang (BEAM), die für Telefonanlagen entwickelt wurde und sehr viele gleichzeitige Verbindungen mit leichtgewichtigen Prozessen bewältigt. Phoenix nutzt das für Schnittstellen, Webseiten und mit LiveView für Oberflächen, die sich ohne eigenes JavaScript live aktualisieren.

## Vorbemerkungen

- **Aus den Paketquellen:** Ubuntu 26.04 enthält Elixir 1.18 und Erlang/OTP 27. Phoenix selbst kommt über **Hex**, den Paketmanager von Elixir, in jedes Projekt einzeln. Hex und der Projektgenerator landen in `~/.mix`, heruntergeladene Pakete in `~/.hex`.
- **Nur eine Schnittstelle:** Phoenix kann Datenbank (Ecto), HTML-Seiten, LiveView, E-Mail-Versand und Übersetzungen gleich mit einrichten. Dieses Beispiel schaltet all das ab und baut nur eine JSON-Schnittstelle. Dafür braucht es weder Datenbank noch Node.js.
- **Port 4000:** Der Entwicklungsserver lauscht auf <http://127.0.0.1:4000>, nur vom eigenen Rechner aus erreichbar. Port 4000 darf nicht von einem anderen Programm belegt sein.
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [Express](express.md), [Gin](gin.md), [Ktor](ktor.md) und [FastAPI](fastapi.md). Wie bei [Laravel](laravel.md) liegen alle Adressen unter `/api`. Die Notizen liegen nur im Arbeitsspeicher, verwaltet von einem eigenen Elixir-Prozess.
- **Version:** Getestet mit Phoenix **1.8.15**, Elixir 1.18.3, Erlang/OTP 27 und Hex 2.5.1 unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Elixir und Erlang-Entwicklungsdateien installieren

`elixir` zieht die nötigen Teile von Erlang mit und bringt die Befehle `elixir`, `iex` (interaktive Konsole) und `mix` (Build-Werkzeug) mit. `erlang-dev` enthält Header-Dateien von Erlang, die Phoenix beim Übersetzen einliest. Ohne das Paket bricht das Übersetzen mit `error parsing file /usr/lib/erlang/lib/public_key-…/include/OTP-PUB-KEY.hrl` ab.

```bash
sudo apt install elixir erlang-dev
```

**Prüfen:** Die letzte Zeile lautet `Elixir 1.18.3 (compiled with Erlang/OTP 27)`.

```bash
elixir --version
```

### 3. Hex installieren

Installiert den Paketmanager Hex für den eigenen Benutzer. `--force` beantwortet die Rückfrage, ob Hex wirklich installiert werden soll, mit Ja.

```bash
mix local.hex --force
```

**Prüfen:** Die Ausgabe lautet `* creating /home/…/.mix/archives/hex-2.5.1` oder nennt eine neuere Version.

### 4. Projektgenerator von Phoenix installieren

Lädt den Generator `phx_new` von Hex und installiert ihn als Erweiterung von `mix`. Er stellt den Befehl `mix phx.new` bereit. Auch hier beantwortet `--force` die Rückfrage.

```bash
mix archive.install hex phx_new --force
```

**Prüfen:** Die Ausgabe endet mit `* creating /home/…/.mix/archives/phx_new-1.8.15` oder nennt eine neuere Version.

## Erstes Projekt

### 5. In das Home-Verzeichnis wechseln

Das Projekt wird im aktuellen Ordner angelegt.

```bash
cd ~
```

### 6. Projekt anlegen

Legt den Ordner `meinphoenix` mit einem fertigen Projekt samt Git-Repository an. Die Schalter lassen alles weg, was eine reine Schnittstelle nicht braucht:

- `--no-ecto` – keine Datenbank
- `--no-html` und `--no-assets` – keine HTML-Seiten, kein CSS und JavaScript
- `--no-dashboard` – keine Übersichtsseite zu Laufzeitdaten
- `--no-mailer` und `--no-gettext` – kein E-Mail-Versand, keine Übersetzungen

`--install` lädt die Abhängigkeiten gleich herunter und übersetzt sie, ohne vorher zu fragen.

```bash
mix phx.new meinphoenix --no-ecto --no-html --no-assets --no-dashboard --no-mailer --no-gettext --install
```

**Prüfen:** Die Ausgabe listet viele Zeilen `* creating meinphoenix/…`, dann `* running mix deps.get` und `* running mix deps.compile` und endet mit dem Hinweis `Start your Phoenix app with: $ mix phx.server`. Die Hinweise von Git zu `init.defaultBranch` kannst du übergehen.

### 7. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinphoenix
```

Der Code liegt in `lib`. `lib/meinphoenix` ist für die eigentliche Arbeit gedacht, `lib/meinphoenix_web` für alles rund um HTTP wie Router und Controller. Die Datei `AGENTS.md` enthält Hinweise für KI-Assistenten und ist für diese Anleitung nicht wichtig.

### 8. Notizen-Speicher schreiben

In Elixir gibt es keine veränderlichen Variablen, auf die mehrere Anfragen gleichzeitig zugreifen. Einen Zustand wie die Liste der Notizen hält man stattdessen in einem eigenen Prozess. Ein **Agent** ist die einfachste Form dafür: Er bewahrt einen Wert auf, andere Prozesse lesen oder ändern ihn über Funktionsaufrufe, immer schön nacheinander. Die Datei ist neu, nano startet mit einer leeren Seite.

```bash
nano lib/meinphoenix/notizen.ex
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```elixir
defmodule Meinphoenix.Notizen do
  # Ein Agent ist ein eigener kleiner Prozess, der einen Wert verwaltet.
  # Hier: die Liste der Notizen, nur im Arbeitsspeicher.
  use Agent

  def start_link(_) do
    Agent.start_link(fn -> [] end, name: __MODULE__)
  end

  def alle do
    Agent.get(__MODULE__, &Enum.reverse/1)
  end

  def finde(id) do
    Agent.get(__MODULE__, fn notizen -> Enum.find(notizen, &(&1.id == id)) end)
  end

  def lege_an(titel) do
    Agent.get_and_update(__MODULE__, fn notizen ->
      notiz = %{id: length(notizen) + 1, titel: titel}
      {notiz, [notiz | notizen]}
    end)
  end
end
```

- `name: __MODULE__` – der Agent ist unter dem Namen des Moduls erreichbar, man braucht sich keine Prozessnummer zu merken.
- `Agent.get` liest den Wert, `Agent.get_and_update` liefert ein Ergebnis und ändert den Wert in einem Schritt.
- Neue Notizen kommen vorne an die Liste (`[notiz | notizen]`), das ist in Elixir am schnellsten. `alle` dreht die Liste deshalb für die Ausgabe um.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Speicher beim Start mitstarten

`application.ex` legt fest, welche Prozesse beim Start der Anwendung laufen. Ein **Supervisor** überwacht sie und startet einen abgestürzten Prozess neu.

```bash
nano lib/meinphoenix/application.ex
```

Suche die Zeile `{Phoenix.PubSub, name: Meinphoenix.PubSub},` und füge darunter zwei Zeilen ein:

```elixir
      # Die Liste der Notizen
      Meinphoenix.Notizen,
```

Die Liste `children` sieht danach so aus:

```elixir
    children = [
      MeinphoenixWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:meinphoenix, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Meinphoenix.PubSub},
      # Die Liste der Notizen
      Meinphoenix.Notizen,
      # Start a worker by calling: Meinphoenix.Worker.start_link(arg)
      # {Meinphoenix.Worker, arg},
      # Start to serve requests, typically the last entry
      MeinphoenixWeb.Endpoint
    ]
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Routen eintragen

Der Router enthält schon den Bereich `scope "/api"`. Die `pipeline :api` davor sorgt dafür, dass dort nur JSON angenommen wird.

```bash
nano lib/meinphoenix_web/router.ex
```

Ergänze unter `pipe_through :api` eine Leerzeile und die vier Routen, sodass der Bereich so aussieht:

```elixir
  scope "/api", MeinphoenixWeb do
    pipe_through :api

    get "/hallo", NotizController, :hallo
    get "/notizen", NotizController, :index
    get "/notizen/:id", NotizController, :show
    post "/notizen", NotizController, :create
  end
```

Jede Zeile verbindet Methode und Adresse mit einer Funktion im Controller. `:id` ist ein Platzhalter.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Controller schreiben

Die Datei ist neu, nano startet mit einer leeren Seite.

```bash
nano lib/meinphoenix_web/controllers/notiz_controller.ex
```

Füge diesen Inhalt ein:

```elixir
defmodule MeinphoenixWeb.NotizController do
  use MeinphoenixWeb, :controller

  alias Meinphoenix.Notizen

  # GET /api/hallo?name=... liefert eine Begrüßung als JSON
  def hallo(conn, params) do
    name = Map.get(params, "name", "Welt")
    json(conn, %{gruss: "Hallo #{name}!"})
  end

  # GET /api/notizen liefert alle Notizen
  def index(conn, _params) do
    json(conn, Notizen.alle())
  end

  # GET /api/notizen/1 liefert eine Notiz oder 404
  def show(conn, %{"id" => id}) do
    with {nummer, ""} <- Integer.parse(id),
         %{} = notiz <- Notizen.finde(nummer) do
      json(conn, notiz)
    else
      _ -> conn |> put_status(404) |> json(%{fehler: "Notiz nicht gefunden"})
    end
  end

  # POST /api/notizen legt eine Notiz an; der Inhalt kommt als JSON
  def create(conn, %{"titel" => titel}) when is_binary(titel) and titel != "" do
    notiz = Notizen.lege_an(titel)

    conn
    |> put_status(201)
    |> put_resp_header("location", "/api/notizen/#{notiz.id}")
    |> json(notiz)
  end

  def create(conn, _params) do
    conn |> put_status(400) |> json(%{fehler: ~s(Feld "titel" fehlt)})
  end
end
```

- **`conn`** – die Verbindung. Sie enthält die Anfrage und sammelt alles für die Antwort. `json(conn, …)` sendet eine Map oder Liste als JSON.
- **`params`** – alle Werte der Anfrage in einer Map: aus der Adresse (`name`, `id`) und aus dem mitgeschickten JSON (`titel`).
- **Mustervergleich** – `create` gibt es zweimal. Elixir nimmt die erste Fassung, deren Muster passt: Enthält `params` einen nicht leeren Text `titel`, wird angelegt, sonst greift die zweite Fassung mit `400`.
- **`with`** – führt Schritte nacheinander aus, solange jeder passt. Ist `id` keine Zahl oder die Notiz nicht vorhanden, springt es zu `else`.
- **`|>`** – der Pipe-Operator gibt das Ergebnis links als ersten Wert an die Funktion rechts weiter. So liest sich `put_status`, `put_resp_header` und `json` von oben nach unten.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Routen anzeigen

Übersetzt das Projekt und listet alle Routen. So siehst du, ob Router und Controller fehlerfrei sind.

```bash
mix phx.routes
```

**Prüfen:** Vor der Liste steht `Generated meinphoenix app`. Die Liste enthält `GET /api/hallo`, `GET /api/notizen`, `GET /api/notizen/:id` und `POST /api/notizen`, jeweils mit `MeinphoenixWeb.NotizController`.

## Starten und testen

### 13. Server starten

`iex -S mix phx.server` startet den Server und öffnet zugleich die interaktive Elixir-Konsole IEx. Nur `mix phx.server` würde den Server ohne Konsole starten. Das Terminal zeigt zu jeder Anfrage einige Zeilen mit Adresse, Controller, Parametern und Dauer.

```bash
iex -S mix phx.server
```

**Prüfen:** Die Ausgabe enthält `Running MeinphoenixWeb.Endpoint with Bandit … at 127.0.0.1:4000 (http)` und endet mit der Eingabeaufforderung `iex(1)>`.

### 14. Notiz anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:4000/api/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, weiter unten steht `location: /api/notizen/1`, die letzte Zeile ist `{"id":1,"titel":"Erste Notiz"}`. Im ersten Terminal erscheinen `POST /api/notizen`, `Processing with MeinphoenixWeb.NotizController.create/2` und `Sent 201 in …`.

### 15. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung:

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:4000/api/notizen` | `[{"id":1,"titel":"Erste Notiz"}]` |
| `curl http://localhost:4000/api/notizen/1` | `{"id":1,"titel":"Erste Notiz"}` |
| `curl "http://localhost:4000/api/hallo?name=Thorsten"` | `{"gruss":"Hallo Thorsten!"}` |
| `curl http://localhost:4000/api/notizen/7` | `{"fehler":"Notiz nicht gefunden"}` (Status 404) |
| `curl http://localhost:4000/api/notizen/abc` | `{"fehler":"Notiz nicht gefunden"}` (Status 404) |
| `curl -X POST http://localhost:4000/api/notizen -H "Content-Type: application/json" -d '{}'` | `{"fehler":"Feld \"titel\" fehlt"}` (Status 400) |
| `curl http://localhost:4000/api/gibtsnicht` | HTML-Seite mit dem Titel `Phoenix.Router.NoRouteError at GET /api/gibtsnicht` (Status 404) |

Für Adressen ohne Route zeigt Phoenix im Entwicklungsmodus eine ausführliche Fehlerseite. Öffne <http://localhost:4000/api/gibtsnicht> im Browser: Sie listet alle vorhandenen Routen. Im Betrieb antwortet Phoenix stattdessen mit JSON aus `lib/meinphoenix_web/controllers/error_json.ex`.

### 16. In der Konsole nachsehen

Die Konsole im ersten Terminal läuft im selben Programm wie der Server. Gib dort ein und drücke <kbd>Enter</kbd>:

```elixir
Meinphoenix.Notizen.alle()
```

**Prüfen:** Die Ausgabe lautet `[%{id: 1, titel: "Erste Notiz"}]`. Das ist dieselbe Liste, die auch `curl` sieht. Mit `Meinphoenix.Notizen.lege_an("Aus IEx")` legst du eine Notiz direkt an, `curl http://localhost:4000/api/notizen` zeigt sie danach ebenfalls.

### 17. Änderung ohne Neustart ausprobieren

Phoenix übersetzt geänderten Code im Entwicklungsmodus bei der nächsten Anfrage neu. Ändere in `notiz_controller.ex` das Wort `Hallo` in der Funktion `hallo` z. B. in `Servus` und speichere die Datei.

**Prüfen:** `curl http://localhost:4000/api/hallo` liefert `{"gruss":"Servus Welt!"}`, im ersten Terminal erscheint `Compiling 1 file (.ex)`. Die Notizen bleiben erhalten. Nur der Code des Controllers wird ausgetauscht, der Agent mit der Liste läuft weiter.

### 18. Server beenden

Drücke im ersten Terminal zweimal <kbd>Strg</kbd>+<kbd>C</kbd>. Nach dem ersten Mal zeigt Erlang ein Menü (`BREAK: (a)bort …`), das zweite Mal beendet das Programm.

### 19. Tests ausführen

Das Projekt bringt Tests für die Fehlerantworten mit. `mix test` übersetzt das Projekt in der Testumgebung und führt alle Tests aus.

```bash
mix test
```

**Prüfen:** Die Ausgabe endet mit `2 tests, 0 failures`.

## Wie geht es weiter?

- **Datenbank:** Ohne `--no-ecto` richtet `mix phx.new` die Datenbankschicht Ecto mit [PostgreSQL](postgresql.md) ein. `mix phx.gen.json` erzeugt dann Schema, Migration, Controller und Tests für eine ganze Ressource.
- **Webseiten und LiveView:** Ohne `--no-html` und `--no-assets` bekommt das Projekt HTML-Vorlagen, Tailwind CSS und LiveView. Dafür lädt Phoenix beim ersten Start die Werkzeuge esbuild und Tailwind herunter.
- **Formatieren:** `mix format` bringt alle Dateien in die übliche Schreibweise von Elixir.
- **Betrieb:** `MIX_ENV=prod mix release` baut ein eigenständiges Paket samt Erlang-Laufzeit im Ordner `_build/prod/rel`. Auf dem Server braucht es die Umgebungsvariablen `SECRET_KEY_BASE` (erzeugt mit `mix phx.gen.secret`) und `PHX_HOST`. Gestartet wird über einen systemd-Dienst (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage), davor sitzt [nginx](nginx.md), der auch HTTPS übernimmt.

## Deinstallieren

### 1. Server beenden

Läuft `iex -S mix phx.server` noch in einem Terminal, beende es dort mit zweimal <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projekt entfernen

Löscht den Projektordner samt übersetzter Abhängigkeiten.

```bash
rm -rf ~/meinphoenix
```

**Prüfen:** Der Projektordner existiert nicht mehr, `ls` meldet `Datei oder Verzeichnis nicht gefunden`.

```bash
ls ~/meinphoenix
```

### 3. Hex und Projektgenerator entfernen (optional)

Hex und `phx_new` liegen in `~/.mix`, heruntergeladene Pakete in `~/.hex`. Die Befehle löschen beide Ordner. Das betrifft alle Elixir-Projekte.

```bash
rm -rf ~/.mix
```

```bash
rm -rf ~/.hex
```

### 4. Elixir und Erlang entfernen

Nur ausführen, wenn kein anderes Programm sie braucht.

```bash
sudo apt purge elixir erlang-dev
```

Der nächste Befehl entfernt die Erlang-Pakete, die nur dafür mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Die Shell meldet, dass der Befehl `elixir` nicht gefunden wurde.

```bash
elixir --version
```
