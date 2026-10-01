# Prolog (SWI-Prolog)

Prolog ist eine Sprache der Logikprogrammierung. Statt Schritt für Schritt vorzuschreiben, wie etwas berechnet wird, beschreibt man Fakten und Regeln. Prolog sucht dann selbst alle Antworten auf eine Frage. Das eignet sich für Wissensbasen, Planungs- und Rätselaufgaben, Sprachverarbeitung und Regelwerke. SWI-Prolog ist die verbreitetste freie Umsetzung.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **SWI-Prolog 9.2**. Das Paket `swi-prolog-nox` enthält die Sprache ohne grafische Werkzeuge. Mit `--no-install-recommends` sind das nur 4 Pakete, mit Empfehlungen 25.
- **Andere Denkweise:** Ein Prolog-Programm wird nicht gestartet, sondern befragt. Man lädt die Datei und stellt Anfragen wie `lieferbar(X).`, auf die Prolog alle passenden Werte für `X` sucht.
- **Schreibweise:** Namen von Fakten und Werten beginnen mit einem Kleinbuchstaben (`citybike`), Variablen mit einem Großbuchstaben (`Name`). Jede Aussage endet mit einem Punkt.
- **Version:** Getestet mit SWI-Prolog **9.2.9** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. SWI-Prolog installieren

```bash
sudo apt install --no-install-recommends swi-prolog-nox
```

**Prüfen:** Die Ausgabe lautet `SWI-Prolog version 9.2.9 for x86_64-linux`.

```bash
swipl --version
```

## Eine Wissensbasis

### 3. Übungsordner anlegen

```bash
mkdir ~/prolog-uebung
```

### 4. In den Ordner wechseln

```bash
cd ~/prolog-uebung
```

### 5. Fakten und Regeln anlegen

Prolog-Dateien haben die Endung `.pl`.

```bash
nano laden.pl
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```prolog
% Fakten: modell(Name, Art, Preis)
modell(citybike,    stadt,   699).
modell(trekkingrad, touren,  899).
modell(lastenrad,   transport, 3490).
modell(rennrad,     sport,  1899).

% Fakten: lager(Name, Anzahl)
lager(citybike,    4).
lager(trekkingrad, 0).
lager(lastenrad,   1).
lager(rennrad,     2).

% Regel: Ein Modell ist lieferbar, wenn mindestens eins auf Lager ist.
lieferbar(Name) :-
    lager(Name, Anzahl),
    Anzahl > 0.

% Regel: passend für ein Budget und lieferbar
empfehlung(Budget, Name, Preis) :-
    modell(Name, _, Preis),
    Preis =< Budget,
    lieferbar(Name).

% Regel: Lagerwert aller Räder
lagerwert(Summe) :-
    findall(Wert, (modell(Name, _, Preis), lager(Name, Anzahl), Wert is Preis * Anzahl), Werte),
    sum_list(Werte, Summe).
```

- **Fakten** – `modell(citybike, stadt, 699).` ist eine Aussage, die einfach gilt.
- **Regeln** – `lieferbar(Name) :- lager(Name, Anzahl), Anzahl > 0.` liest sich: „Name ist lieferbar, wenn es ein Lager mit Name und Anzahl gibt und die Anzahl größer als 0 ist.“ `:-` bedeutet „wenn“, das Komma „und“.
- **`_`** – eine Variable, deren Wert nicht interessiert.
- **`is`** – rechnet. `Wert is Preis * Anzahl` weist das Ergebnis zu. `=<` heißt „kleiner oder gleich“.
- **`findall`** – sammelt alle Lösungen in einer Liste. `sum_list` addiert sie.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Wissensbasis laden

`swipl` mit Dateinamen lädt die Datei und öffnet die Eingabe für Anfragen. Die Eingabezeile lautet `?-`.

```bash
swipl laden.pl
```

### 7. Fragen stellen

Gib die folgende Anfrage ein und drücke <kbd>Enter</kbd>. Der Punkt am Ende gehört dazu.

```prolog
lieferbar(X).
```

Prolog antwortet mit `X = citybike`. Drücke <kbd>;</kbd> für die nächste Antwort, bis keine mehr kommt: `X = lastenrad` und `X = rennrad.` Der Punkt hinter der letzten Antwort zeigt, dass es keine weiteren gibt. Mit <kbd>Enter</kbd> statt <kbd>;</kbd> beendet man die Suche vorzeitig.

Probiere weitere Anfragen aus:

```prolog
empfehlung(1000, Name, Preis).
```

```prolog
lagerwert(Summe).
```

```prolog
lieferbar(trekkingrad).
```

**Prüfen:**

- Bei `empfehlung` antwortet Prolog mit `Name = citybike, Preis = 699` und wartet, weil es noch weitere Lösungen geben könnte. Drücke <kbd>;</kbd>, um weiterzusuchen. Es folgt `false.`, denn das Rennrad liegt mit 1899 Euro über dem Budget und das Trekkingrad ist nicht auf Lager. Mit <kbd>Enter</kbd> statt <kbd>;</kbd> nimmt man die erste Antwort.
- `lagerwert(Summe).` antwortet `Summe = 10084.`
- `lieferbar(trekkingrad).` antwortet `false.` Die Aussage gilt nicht, weil kein Trekkingrad auf Lager ist.

Beende Prolog mit `halt.`

### 8. Anfragen ohne Eingabe stellen

`-g` stellt eine Anfrage direkt beim Start, `-t halt` beendet Prolog danach. `-q` lässt die Begrüßung weg. `forall` geht alle Lösungen durch, `format` gibt sie aus.

```bash
swipl -q -s laden.pl -g "forall(empfehlung(1000, N, P), format('~w für ~w Euro~n', [N, P]))" -t halt
```

**Prüfen:** Die Ausgabe lautet `citybike für 699 Euro`.

## Rätsel lösen mit Constraints

Die Bibliothek CLP(FD) rechnet mit ganzen Zahlen, deren Werte noch nicht feststehen. Man beschreibt nur die Bedingungen, Prolog findet die passenden Werte.

### 9. Programm anlegen

```bash
nano werkstatt.pl
```

Füge diesen Inhalt ein:

```prolog
:- use_module(library(clpfd)).

% Wie viele Citybikes (699 Euro) und Lastenräder (3490 Euro)
% ergeben zusammen genau einen Rechnungsbetrag?
rechnung(Betrag, Citybikes, Lastenraeder) :-
    [Citybikes, Lastenraeder] ins 0..20,
    699 * Citybikes + 3490 * Lastenraeder #= Betrag,
    label([Citybikes, Lastenraeder]).

% Drei Reparaturen auf die Tage Montag (1) bis Freitag (5) verteilen:
% - jede an einem anderen Tag
% - die Bremse vor der Schaltung
% - der Reifen nicht am Montag
% - die Werkstatt nimmt nur dienstags (2) und donnerstags (4) Schaltungen an
plan(Bremse, Schaltung, Reifen) :-
    Tage = [Bremse, Schaltung, Reifen],
    Tage ins 1..5,
    all_different(Tage),
    Bremse #< Schaltung,
    Reifen #\= 1,
    Schaltung in 2 \/ 4,
    label(Tage).

tag(1, montag).
tag(2, dienstag).
tag(3, mittwoch).
tag(4, donnerstag).
tag(5, freitag).

zeige_plaene :-
    forall(plan(B, S, R),
           ( tag(B, TB), tag(S, TS), tag(R, TR),
             format("Bremse: ~w, Schaltung: ~w, Reifen: ~w~n", [TB, TS, TR]) )).
```

- **`:- use_module(library(clpfd)).`** – lädt die Bibliothek beim Laden der Datei.
- **`ins 0..20` und `in 2 \/ 4`** – legen fest, welche Werte möglich sind: 0 bis 20 bzw. nur 2 oder 4.
- **`#=`, `#<`, `#\=`** – Bedingungen zwischen Zahlen: gleich, kleiner, ungleich. Anders als `is` funktionieren sie in beide Richtungen.
- **`all_different`** – alle Werte der Liste müssen verschieden sein.
- **`label`** – probiert konkrete Werte aus, die alle Bedingungen erfüllen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Rechnung zerlegen

Welche Mischung aus Citybikes und Lastenrädern ergibt genau 9077 Euro?

```bash
swipl -q -s werkstatt.pl -g "rechnung(9077, C, L), format('~w Citybikes und ~w Lastenräder~n', [C, L])" -t halt
```

**Prüfen:** Die Ausgabe lautet `3 Citybikes und 2 Lastenräder`.

### 11. Dieselbe Regel rückwärts verwenden

Diesmal sind die Stückzahlen bekannt und der Betrag gesucht. Die Regel bleibt dieselbe.

```bash
swipl -q -s werkstatt.pl -g "rechnung(Betrag, 3, 2), writeln(Betrag)" -t halt
```

**Prüfen:** Die Ausgabe lautet `9077`. Für einen Betrag ohne passende Mischung, etwa 5000, findet Prolog keine Lösung und meldet bei einer Anfrage `false`.

### 12. Alle Wochenpläne ausgeben

```bash
swipl -q -s werkstatt.pl -g zeige_plaene -t halt
```

**Prüfen:** Prolog findet zehn Pläne, die alle Bedingungen erfüllen. Der erste lautet `Bremse: montag, Schaltung: dienstag, Reifen: mittwoch`, der letzte `Bremse: mittwoch, Schaltung: donnerstag, Reifen: freitag`.

## Wie geht es weiter?

- **Fehlersuche:** `trace.` vor einer Anfrage zeigt Schritt für Schritt, wie Prolog nach Lösungen sucht.
- **Listen:** `[Kopf | Rest]` zerlegt eine Liste in ihr erstes Element und den Rest. Darauf bauen die meisten Prolog-Programme auf, z. B. `member/2`, `append/3` und `length/2`.
- **Daten und Web:** SWI-Prolog bringt Bibliotheken für CSV (`library(csv)`), JSON (`library(http/json)`) und einen eingebauten Webserver mit.
- **Zusatzpakete:** `pack_install(Name).` installiert Erweiterungen aus der Paketliste unter <https://www.swi-prolog.org/pack/list>.
- **Dokumentation:** Handbuch und Einführungen unter <https://www.swi-prolog.org>. Das freie Buch „Learn Prolog Now!“ ist ein bewährter Einstieg.

## Deinstallieren

### 1. Übungsordner entfernen

```bash
rm -rf ~/prolog-uebung
```

### 2. SWI-Prolog entfernen

```bash
sudo apt purge swi-prolog-nox swi-prolog-core swi-prolog-core-packages
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

`apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

### 4. Einstellungen und Verlauf entfernen (optional)

SWI-Prolog kann einen Befehlsverlauf und Einstellungen in diesen Ordnern ablegen.

```bash
rm -rf ~/.local/share/swi-prolog ~/.config/swi-prolog
```

**Prüfen:** Der Befehl `swipl` wird nicht mehr gefunden.

```bash
swipl --version
```
