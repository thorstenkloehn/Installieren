# Elixir

Elixir ist eine funktionale Programmiersprache, die auf der virtuellen Maschine von Erlang (BEAM) läuft. Programme bestehen aus vielen leichtgewichtigen Prozessen, die sich Nachrichten schicken und von Supervisoren überwacht werden. Elixir eignet sich deshalb besonders für Server mit vielen gleichzeitigen Verbindungen. Das bekannteste Webframework ist [Phoenix](phoenix.md).

## Vorbemerkungen

- **Aus den Paketquellen:** Ubuntu 26.04 enthält Elixir **1.18** und Erlang/OTP 27. Das Paket `elixir` zieht die nötigen Teile von Erlang selbst mit und bringt die Befehle `elixir`, `iex` (interaktive Konsole) und `mix` (Build-Werkzeug) mit.
- **Hex:** Bibliotheken für Elixir kommen von <https://hex.pm>. Den Paketmanager Hex installiert `mix` einmalig für den eigenen Benutzer nach `~/.mix`, heruntergeladene Pakete landen in `~/.hex`.
- **Unveränderliche Daten:** In Elixir ändert man Werte nicht, sondern erzeugt neue. Schleifen schreibt man als Rekursion oder mit Funktionen aus dem Modul `Enum`. Das Beispiel zeigt beides.
- **Version:** Getestet mit Elixir **1.18.3**, Erlang/OTP 27 und Hex 2.5.1 unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Elixir installieren

Installiert Elixir samt den nötigen Erlang-Paketen.

```bash
sudo apt install elixir
```

**Prüfen:** Die letzte Zeile lautet `Elixir 1.18.3 (compiled with Erlang/OTP 27)`.

```bash
elixir --version
```

## Erstes Programm

### 3. Arbeitsordner anlegen

Ein eigener Ordner für die Übungen.

```bash
mkdir ~/hallo-elixir
```

### 4. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/hallo-elixir
```

### 5. Skript anlegen

Dateien mit der Endung `.exs` sind Elixir-Skripte. Sie werden beim Start übersetzt und sofort ausgeführt.

```bash
nano hallo.exs
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```elixir
# Ein kleines Elixir-Skript: Begrüßung und eine Liste
name = List.first(System.argv()) || "Welt"
IO.puts("Hallo #{name}!")

["Elixir", "Erlang", "Go"]
|> Enum.with_index(1)
|> Enum.each(fn {sprache, nr} ->
  IO.puts("#{nr}. #{sprache} hat #{String.length(sprache)} Buchstaben")
end)
```

- `System.argv()` enthält die Werte, die man beim Aufruf hinter den Dateinamen schreibt. `|| "Welt"` nimmt `"Welt"`, wenn keiner angegeben ist.
- `#{…}` setzt einen Wert in einen Text ein.
- `|>` ist der **Pipe-Operator**: Er gibt das Ergebnis links als ersten Wert an die Funktion rechts weiter. Die Liste läuft so von oben nach unten durch `Enum.with_index` (Nummern ab 1 anhängen) und `Enum.each` (für jedes Element etwas tun).
- `fn {sprache, nr} -> … end` ist eine namenlose Funktion. `{sprache, nr}` zerlegt dabei jedes Paar aus Wert und Nummer in zwei Variablen (**Mustervergleich**).

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Skript ausführen

```bash
elixir hallo.exs
```

**Prüfen:** Die Ausgabe lautet:

```text
Hallo Welt!
1. Elixir hat 6 Buchstaben
2. Erlang hat 6 Buchstaben
3. Go hat 2 Buchstaben
```

Mit `elixir hallo.exs Thorsten` lautet die erste Zeile `Hallo Thorsten!`.

### 7. Interaktive Konsole ausprobieren

`iex` (Interactive Elixir) führt jede eingegebene Zeile sofort aus und zeigt das Ergebnis.

```bash
iex
```

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>:

```elixir
String.upcase("elixir")
```

```elixir
Enum.map([1, 2, 3], fn x -> x * x end)
```

**Prüfen:** `iex` zeigt die Ergebnisse `"ELIXIR"` und `[1, 4, 9]`. Mit `h String.upcase` zeigt `iex` die Beschreibung einer Funktion an. Beende `iex` mit zweimal <kbd>Strg</kbd>+<kbd>C</kbd>.

## Projekt mit mix

### 8. Projekt anlegen

`mix new` legt ein Projekt mit Quellordner `lib`, Testordner `test` und der Projektdatei `mix.exs` an.

```bash
mix new rechner
```

**Prüfen:** Die Ausgabe endet mit `Your Mix project was created successfully.`

### 9. In den Projektordner wechseln

```bash
cd ~/hallo-elixir/rechner
```

### 10. Modul schreiben

```bash
nano lib/rechner.ex
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein:

```elixir
defmodule Rechner do
  @moduledoc """
  Kleine Rechenfunktionen für Listen von Zahlen.
  """

  @doc """
  Addiert alle Zahlen einer Liste.

  ## Beispiele

      iex> Rechner.summe([1, 2, 3])
      6

      iex> Rechner.summe([])
      0

  """
  def summe([]), do: 0
  def summe([kopf | rest]), do: kopf + summe(rest)

  @doc """
  Berechnet den Durchschnitt. Eine leere Liste ergibt einen Fehler-Tupel.

  ## Beispiele

      iex> Rechner.durchschnitt([2, 4, 6])
      {:ok, 4.0}

      iex> Rechner.durchschnitt([])
      {:error, :leere_liste}

  """
  def durchschnitt([]), do: {:error, :leere_liste}
  def durchschnitt(zahlen), do: {:ok, summe(zahlen) / length(zahlen)}
end
```

- **Mehrere Fassungen einer Funktion:** `summe` gibt es zweimal. Elixir nimmt die erste, deren Muster passt: `[]` für die leere Liste, sonst `[kopf | rest]`, das die Liste in erstes Element und Rest zerlegt. So entsteht eine Schleife durch Rekursion.
- **Tupel mit `:ok` und `:error`:** Statt eine Ausnahme auszulösen, geben Elixir-Funktionen oft `{:ok, wert}` oder `{:error, grund}` zurück. Wörter mit Doppelpunkt wie `:ok` sind **Atome**, feste Namen.
- **Dokumentation mit Beispielen:** Die Zeilen mit `iex>` in `@doc` sind zugleich Tests (Doctests), siehe nächster Schritt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Test schreiben

```bash
nano test/rechner_test.exs
```

Ersetze den ganzen Inhalt wie in Schritt 10 und füge ein:

```elixir
defmodule RechnerTest do
  use ExUnit.Case
  # Führt die Beispiele aus der Dokumentation als Tests aus
  doctest Rechner

  test "summe mit negativen Zahlen" do
    assert Rechner.summe([5, -2, -3]) == 0
  end
end
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Tests ausführen

`mix test` übersetzt das Projekt und führt alle Tests mit dem eingebauten Testwerkzeug ExUnit aus.

```bash
mix test
```

**Prüfen:** Die Ausgabe endet mit `4 doctests, 1 test, 0 failures`. Die vier Doctests sind die Beispiele aus Schritt 10.

### 13. Projekt in iex laden

`iex -S mix` startet die Konsole mit übersetztem Projekt. So lassen sich eigene Funktionen direkt aufrufen.

```bash
iex -S mix
```

Gib ein und drücke <kbd>Enter</kbd>:

```elixir
Rechner.summe([10, 20, 30])
```

**Prüfen:** Die Ausgabe lautet `60`. Beende `iex` mit zweimal <kbd>Strg</kbd>+<kbd>C</kbd>.

## Bibliotheken von Hex

### 14. Hex installieren

Installiert den Paketmanager Hex für den eigenen Benutzer. `--force` beantwortet die Rückfrage mit Ja. Ohne diesen Schritt fragt `mix` beim ersten Laden einer Bibliothek selbst `Shall I install Hex?`.

```bash
mix local.hex --force
```

**Prüfen:** Die Ausgabe lautet `* creating /home/…/.mix/archives/hex-2.5.1` oder nennt eine neuere Version.

### 15. Bibliothek eintragen

Abhängigkeiten stehen in `mix.exs` in der Funktion `deps`. Als Beispiel dient `jason`, die übliche Bibliothek für JSON.

```bash
nano mix.exs
```

Ersetze in `defp deps do` die beiden Kommentarzeilen, die mit `# {:dep_from` beginnen, durch diese Zeile:

```elixir
      {:jason, "~> 1.4"}
```

Die Funktion sieht danach so aus:

```elixir
  defp deps do
    [
      {:jason, "~> 1.4"}
    ]
  end
```

`"~> 1.4"` bedeutet: Version 1.4 oder neuer, aber unter 2.0.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Bibliothek herunterladen

Lädt `jason` in den Ordner `deps` und hält die genaue Version in `mix.lock` fest.

```bash
mix deps.get
```

**Prüfen:** Die Ausgabe enthält `New: jason 1.4.5` (oder eine neuere 1.x) und `* Getting jason (Hex package)`.

### 17. Bibliothek verwenden

Starte die Konsole mit dem Projekt. Beim ersten Mal übersetzt `mix` auch `jason`.

```bash
iex -S mix
```

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>:

```elixir
Jason.encode!(%{summe: Rechner.summe([1, 2, 3]), zahlen: [1, 2, 3]})
```

```elixir
Jason.decode!(~s({"titel": "Notiz"}))
```

**Prüfen:** Die erste Zeile liefert den JSON-Text `"{\"summe\":6,\"zahlen\":[1,2,3]}"`, die zweite die Map `%{"titel" => "Notiz"}`. `%{…}` schreibt in Elixir eine Map, `~s(…)` einen Text, in dem Anführungszeichen nicht maskiert werden müssen. Beende `iex` mit zweimal <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Formatieren:** `mix format` bringt alle Dateien des Projekts in die übliche Schreibweise.
- **Prozesse:** Mit `spawn`, `send` und `receive` startet man eigene Prozesse und schickt ihnen Nachrichten. Für dauerhaft laufende Prozesse gibt es `GenServer` und `Agent`, wie in der [Phoenix-Anleitung](phoenix.md).
- **Webanwendungen:** [Phoenix](phoenix.md) baut auf Elixir auf. Dafür braucht es zusätzlich das Paket `erlang-dev`.
- **Lernen:** Die offizielle Einführung auf <https://elixir-lang.org> („Getting Started“) erklärt die Sprache Schritt für Schritt.

## Deinstallieren

### 1. Übungsordner entfernen

Löscht den Übungsordner samt Projekt.

```bash
rm -rf ~/hallo-elixir
```

### 2. Hex entfernen (optional)

Hex liegt in `~/.mix`, heruntergeladene Pakete in `~/.hex`. Die Befehle löschen beide Ordner. Das betrifft alle Elixir-Projekte.

```bash
rm -rf ~/.mix
```

```bash
rm -rf ~/.hex
```

### 3. Elixir entfernen

Nur ausführen, wenn kein anderes Programm Elixir braucht, z. B. [Phoenix](phoenix.md).

```bash
sudo apt purge elixir
```

### 4. Nicht mehr benötigte Pakete entfernen

Entfernt die Erlang-Pakete, die nur für Elixir mitinstalliert wurden. Der Befehl entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Die Shell meldet, dass der Befehl `elixir` nicht gefunden wurde.

```bash
elixir --version
```
