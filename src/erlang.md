# Erlang

Erlang ist eine funktionale Programmiersprache, die bei Ericsson für Telefonvermittlungen entwickelt wurde. Ein Erlang-Programm besteht aus vielen kleinen, voneinander getrennten Prozessen, die sich Nachrichten schicken. Stürzt einer ab, laufen die anderen weiter. Deshalb steckt Erlang heute in Diensten, die nie ausfallen dürfen, etwa im Messenger WhatsApp oder im Nachrichtenvermittler RabbitMQ.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **Erlang/OTP 27** und das Bauwerkzeug **rebar3**. OTP (Open Telecom Platform) ist die Standardbibliothek von Erlang.
- **Ohne grafische Werkzeuge:** Das Paket `erlang` installiert auch grafische Hilfsprogramme mit den Bibliotheken von wxWidgets und GTK. Für die Kommandozeile genügt `erlang-nox`. rebar3 empfiehlt das volle Paket, deshalb installiert die Anleitung mit `--no-install-recommends`. So sind es 40 statt 49 Pakete.
- **Verwandt mit Elixir:** [Elixir](elixir.md) läuft auf derselben virtuellen Maschine (BEAM) und kann alle Erlang-Bibliotheken nutzen.
- **Version:** Getestet mit Erlang/OTP **27** und rebar3 3.26.0 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Erlang und rebar3 installieren

```bash
sudo apt install --no-install-recommends erlang-nox rebar3
```

**Prüfen:** Die Ausgabe lautet `rebar 3.26.0 on Erlang/OTP 27 Erts …`.

```bash
rebar3 version
```

## Erste Schritte

### 3. Konsole starten

`erl` startet die Erlang-Konsole. Die Eingabezeile lautet `1>`.

```bash
erl
```

### 4. Etwas ausprobieren

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>. Jede Eingabe endet mit einem Punkt.

```erlang
lists:map(fun(X) -> X * X end, [1, 2, 3, 4]).
```

```erlang
Preis = 699.
```

**Prüfen:** Die Antworten lauten `[1,4,9,16]` und `699`. Variablen beginnen mit einem Großbuchstaben und lassen sich nur einmal belegen: `Preis = 899.` meldet danach einen Fehler. Beende die Konsole mit `q().`

## Ein Modul

### 5. Übungsordner anlegen

```bash
mkdir ~/erlang-uebung
```

### 6. In den Ordner wechseln

```bash
cd ~/erlang-uebung
```

### 7. Modul anlegen

Der Dateiname muss zum Modulnamen passen.

```bash
nano lager.erl
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```erlang
-module(lager).
-export([start/0, bestand/0, lagerwert/1]).

bestand() ->
    [{"Citybike", 699, 4}, {"Trekkingrad", 899, 0}, {"Lastenrad", 3490, 1}].

status(0) -> "ausverkauft";
status(Anzahl) -> integer_to_list(Anzahl) ++ " auf Lager".

lagerwert(Raeder) ->
    lists:sum([Preis * Anzahl || {_, Preis, Anzahl} <- Raeder]).

start() ->
    [io:format("~-12s ~5w Euro, ~s~n", [Modell, Preis, status(Anzahl)])
     || {Modell, Preis, Anzahl} <- bestand()],
    io:format("Lagerwert: ~w Euro~n", [lagerwert(bestand())]).
```

- **`-export`** – nennt die Funktionen, die von außen aufrufbar sind. Die Zahl hinter dem Schrägstrich ist die Anzahl der Parameter.
- **Tupel** – `{"Citybike", 699, 4}` fasst feste Werte zusammen. Eine Liste von Tupeln ist der Bestand.
- **Mustervergleich** – `status` hat zwei Klauseln. Ist die Anzahl 0, greift die erste, sonst die zweite. Klauseln werden mit `;` getrennt, die letzte endet mit `.`.
- **Listenbeschreibung** – `[Preis * Anzahl || {_, Preis, Anzahl} <- Raeder]` nimmt jedes Tupel auseinander und bildet daraus einen Wert. `_` steht für einen Wert, der nicht gebraucht wird.
- **`io:format`** – gibt formatiert aus. `~s` ist ein Text, `~w` ein beliebiger Wert, `~n` ein Zeilenumbruch, `~-12s` ein Text linksbündig auf 12 Zeichen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Modul übersetzen

`erlc` übersetzt das Modul für die virtuelle Maschine von Erlang und legt die Datei `lager.beam` an.

```bash
erlc lager.erl
```

### 9. Modul ausführen

`-noshell` startet Erlang ohne Konsole, `-s lager start` ruft `lager:start()` auf, `-s init stop` beendet Erlang danach.

```bash
erl -noshell -s lager start -s init stop
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike       699 Euro, 4 auf Lager
Trekkingrad    899 Euro, ausverkauft
Lastenrad     3490 Euro, 1 auf Lager
Lagerwert: 6286 Euro
```

## Prozesse und Nachrichten

### 10. Modul mit Prozessen anlegen

Drei Kassen laufen als eigene Prozesse. Das Hauptprogramm schickt ihnen 30 Verkäufe als Nachrichten und sammelt am Ende die Summen ein.

```bash
nano kasse.erl
```

Füge diesen Inhalt ein:

```erlang
-module(kasse).
-export([start/0]).

%% Eine Kasse ist ein eigener Prozess, der Verkäufe als Nachrichten empfängt.
kasse(Name, Summe) ->
    receive
        {verkauf, Betrag} ->
            kasse(Name, Summe + Betrag);
        {abschluss, Absender} ->
            Absender ! {summe, Name, Summe}
    end.

start() ->
    Ich = self(),
    Kassen = [spawn(fun() -> kasse(Name, 0) end) || Name <- ["Kasse 1", "Kasse 2", "Kasse 3"]],
    %% 30 Verkäufe: drei Räder und 27 Fahrradschlösser, reihum auf die Kassen verteilt
    Verkaeufe = [699, 899, 3490 | lists:duplicate(27, 49)],
    [lists:nth((N rem 3) + 1, Kassen) ! {verkauf, Betrag} || {N, Betrag} <- lists:enumerate(Verkaeufe)],
    [Kasse ! {abschluss, Ich} || Kasse <- Kassen],
    Summen = [receive {summe, Name, Summe} -> {Name, Summe} end || _ <- Kassen],
    [io:format("~s: ~w Euro~n", [Name, Summe]) || {Name, Summe} <- lists:sort(Summen)],
    io:format("Gesamt: ~w Euro~n", [lists:sum([S || {_, S} <- Summen])]).
```

- **`spawn`** – startet eine Funktion als neuen Prozess und liefert seine Kennung. Erlang-Prozesse sind keine Prozesse des Betriebssystems, sondern sehr leicht: Hunderttausende gleichzeitig sind kein Problem.
- **`!`** – schickt einem Prozess eine Nachricht. Der Absender wartet nicht.
- **`receive`** – wartet auf eine passende Nachricht. Die Kasse ruft sich danach selbst mit der neuen Summe auf und wartet weiter. So hält ein Prozess seinen Zustand, ohne Variablen zu verändern.
- **`self()`** – die Kennung des eigenen Prozesses, damit die Kassen wissen, wem sie die Summe schicken.
- **`lists:enumerate`** – nummeriert die Verkäufe von 1 an. `N rem 3` verteilt sie reihum auf die drei Kassen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Übersetzen und ausführen

```bash
erlc kasse.erl
```

```bash
erl -noshell -s kasse start -s init stop
```

**Prüfen:** Die Ausgabe lautet:

```text
Kasse 1: 3931 Euro
Kasse 2: 1140 Euro
Kasse 3: 1340 Euro
Gesamt: 6411 Euro
```

## Ein Kommandozeilenprogramm mit rebar3

### 12. In das Home-Verzeichnis wechseln

```bash
cd ~
```

### 13. Projekt anlegen

Die Vorlage `escript` erzeugt ein Projekt für ein Kommandozeilenprogramm. Ein escript ist eine einzelne ausführbare Datei, die Erlang zum Starten braucht, sonst nichts.

```bash
rebar3 new escript umsatz
```

**Prüfen:** rebar3 meldet unter anderem `Writing umsatz/src/umsatz.erl` und `Writing umsatz/rebar.config`.

### 14. In den Projektordner wechseln

```bash
cd ~/umsatz
```

### 15. Programm schreiben

Das Programm liest eine CSV-Datei, deren Name beim Aufruf angegeben wird, und zählt den Umsatz je Modell zusammen. Die Tests stehen in derselben Datei.

```bash
nano src/umsatz.erl
```

Lösche den bisherigen Inhalt (mehrmals <kbd>Strg</kbd>+<kbd>K</kbd>) und füge diesen ein:

```erlang
-module(umsatz).
-export([main/1, summen/1]).

%% Aufruf: umsatz DATEI
main([Datei]) ->
    {ok, Inhalt} = file:read_file(Datei),
    Zeilen = string:split(string:trim(Inhalt), "\n", all),
    Summen = summen([zerlegen(Z) || Z <- Zeilen]),
    [io:format("~-12s ~5w Euro~n", [Modell, Betrag])
     || {Modell, Betrag} <- lists:reverse(lists:keysort(2, maps:to_list(Summen)))],
    erlang:halt(0);
main(_) ->
    io:format("Aufruf: umsatz DATEI~n"),
    erlang:halt(1).

%% "Citybike;2;699" -> {"Citybike", 2, 699}
zerlegen(Zeile) ->
    [Modell, Anzahl, Preis] = string:split(Zeile, ";", all),
    {binary_to_list(Modell), binary_to_integer(Anzahl), binary_to_integer(Preis)}.

%% Zählt den Umsatz je Modell in einer Map zusammen
summen(Verkaeufe) ->
    lists:foldl(
        fun({Modell, Anzahl, Preis}, Map) ->
            maps:update_with(Modell, fun(Alt) -> Alt + Anzahl * Preis end, Anzahl * Preis, Map)
        end,
        #{},
        Verkaeufe).

-ifdef(TEST).
-include_lib("eunit/include/eunit.hrl").

summen_test() ->
    ?assertEqual(#{"A" => 30, "B" => 50}, summen([{"A", 2, 10}, {"B", 1, 50}, {"A", 1, 10}])).

leer_test() ->
    ?assertEqual(#{}, summen([])).
-endif.
```

- **`main/1`** – der Startpunkt eines escripts. Er bekommt die Argumente als Liste. Die erste Klausel passt genau auf ein Argument, die zweite auf alles andere und zeigt dann die Bedienung an.
- **`{ok, Inhalt} = …`** – ein Mustervergleich: Liefert `file:read_file` etwas anderes, etwa `{error, enoent}` für eine fehlende Datei, bricht das Programm mit einer Fehlermeldung ab.
- **Binärtexte** – `file:read_file` liefert den Inhalt als Binärtext. `binary_to_list` und `binary_to_integer` wandeln ihn um.
- **Maps** – `#{}` ist eine leere Map. `maps:update_with` erhöht einen vorhandenen Eintrag oder legt ihn mit dem Startwert an.
- **`-ifdef(TEST)`** – die Tests werden nur beim Testen übersetzt. Funktionen, deren Name auf `_test` endet, erkennt EUnit als Tests.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Tests ausführen

```bash
rebar3 eunit
```

**Prüfen:** Die Ausgabe endet mit `2 tests, 0 failures`.

### 17. Programm bauen

`escriptize` übersetzt das Projekt und packt es in die Datei `_build/default/bin/umsatz`.

```bash
rebar3 escriptize
```

**Prüfen:** Die Meldung lautet `Building escript for umsatz...`.

### 18. Datei mit Verkäufen anlegen

```bash
nano verkauf.csv
```

Füge diesen Inhalt ein:

```text
Citybike;2;699
Lastenrad;1;3490
Citybike;3;699
Trekkingrad;1;899
Citybike;1;649
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 19. Programm starten

```bash
_build/default/bin/umsatz verkauf.csv
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike      4144 Euro
Lastenrad     3490 Euro
Trekkingrad    899 Euro
```

Ohne Dateinamen zeigt das Programm `Aufruf: umsatz DATEI`.

## Wie geht es weiter?

- **OTP-Anwendungen:** `rebar3 new app NAME` legt eine Anwendung mit Supervisor an. Ein Supervisor startet abgestürzte Prozesse automatisch neu. Das ist der übliche Aufbau für Serverdienste in Erlang.
- **Bibliotheken:** Pakete von <https://hex.pm> trägt man in `rebar.config` unter `deps` ein, z. B. `{deps, [jsx]}.` für JSON. rebar3 lädt sie beim nächsten Bauen selbst.
- **Interaktiv mit dem Projekt:** `rebar3 shell` startet die Konsole mit allen Modulen des Projekts.
- **Fehler finden:** `rebar3 dialyzer` sucht anhand der Typen nach Widersprüchen im Code.
- **Dokumentation:** Einführung und Referenz unter <https://www.erlang.org/docs>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/erlang-uebung ~/umsatz
```

### 2. Erlang und rebar3 entfernen

Wird Erlang noch für [Elixir](elixir.md) gebraucht, lass `erlang-nox` im Befehl weg.

```bash
sudo apt purge rebar3 erlang-nox
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die übrigen Erlang-Pakete, die mitinstalliert wurden. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `erl` wird nicht mehr gefunden.

```bash
erl -version
```
