# Livebook

Livebook ist eine Umgebung für ausführbare Elixir-Notizbücher mit einer Browseroberfläche.

Für Ubuntu 26.04 LTS auf amd64. Der Server und die Rechenprozesse laufen bei dieser Anleitung direkt auf Ubuntu.

## Installation

### 1. Paketlisten aktualisieren

Lädt die verfügbaren Paketstände.

````bash
sudo apt update
````

### 2. Elixir und Erlang-Komponenten installieren

Livebook benötigt Elixir ab 1.18 und diese Erlang-Anwendungen. Build-Werkzeuge werden für native Erweiterungen mitinstalliert.

````bash
sudo apt install elixir erlang-dev erlang-inets erlang-os-mon erlang-runtime-tools erlang-ssl erlang-xmerl erlang-parsetools build-essential
````

### 3. Elixir prüfen

Ubuntu 26.04 liefert Elixir 1.18.3. Bei einer älteren aktiven Version hier anhalten.

````bash
elixir --version
````

### 4. Hex einrichten

Installiert Elixirs Paketwerkzeug im Benutzerkonto.

````bash
mix local.hex --force
````

### 5. Rebar einrichten

Stellt das Werkzeug zum Bauen von Erlang-Abhängigkeiten bereit.

````bash
mix local.rebar --force
````

### 6. Livebook installieren

Baut das ausführbare escript im Benutzerkonto. Bestätige die Installation bei der Rückfrage.

````bash
mix escript.install hex livebook
````

### 7. Server lokal starten

Öffne die im Terminal angezeigte Adresse einschließlich Zugangstoken. Lege ein Notizbuch an und berechne Enum.sum([2, 5, 9]); erwartet wird 16. Speichere die .livemd-Datei im Home-Verzeichnis. Strg + C beendet den Server.

````bash
~/.mix/escripts/livebook server --ip 127.0.0.1
````

## Installation prüfen

### 1. Serveroptionen anzeigen

Bestätigt, dass das escript ausführbar ist.

````bash
~/.mix/escripts/livebook server --help
````

## Deinstallieren

### 1. Livebook entfernen

Entfernt das installierte escript. Gespeicherte .livemd-Dateien bleiben erhalten.

````bash
mix escript.uninstall livebook
````

### 2. Entfernung prüfen

Die Bestätigung erscheint, wenn der Standard-Installationspfad entfernt wurde.

````bash
test ! -e ~/.mix/escripts/livebook && echo 'Livebook entfernt'
````

## Quellen und Lizenz

[Direkte Livebook-Installation](https://github.com/livebook-dev/livebook#direct-installation-with-elixir) und [Ubuntu-Elixir](https://packages.ubuntu.com/resolute/elixir). Lizenz: Apache-2.0.
