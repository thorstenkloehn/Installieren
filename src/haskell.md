# Haskell

Haskell ist eine rein funktionale Programmiersprache: Programme bestehen aus Funktionen ohne Nebenwirkungen, Werte ändern sich nach dem Anlegen nicht mehr, und ein strenges Typsystem findet viele Fehler schon beim Übersetzen. Haskell wird in Forschung und Lehre viel genutzt, aber auch für Compiler, Finanzsoftware und Werkzeuge wie [Pandoc](pandoc.md).

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert den Compiler **GHC 9.10** im Paket `ghc` und das Bauwerkzeug **cabal** im Paket `cabal-install`. Zusammen sind das sieben Pakete mit knapp 1 GB.
- **GHC und cabal:** `ghc` übersetzt einzelne Dateien, `ghci` ist die interaktive Konsole, `runghc` führt eine Datei direkt aus. `cabal` verwaltet Projekte und lädt Bibliotheken von **Hackage**, dem zentralen Paketarchiv.
- **Paketverzeichnis von Hackage:** Bevor cabal ein Projekt anlegen oder bauen kann, lädt es mit `cabal update` das Verzeichnis aller Pakete auf Hackage. Im Test belegte es 1,2 GB in `~/.cache/cabal`.
- **GHCup:** Auf der Website von Haskell wird oft GHCup empfohlen, ein Installationsprogramm für neuere Versionen. Für den Einstieg reicht die Fassung aus `apt`.
- **Version:** Getestet mit GHC **9.10.3** und cabal-install 3.12.1 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. GHC und cabal installieren

```bash
sudo apt install ghc cabal-install
```

**Prüfen:** Die Ausgabe lautet `The Glorious Glasgow Haskell Compilation System, version 9.10.3`.

```bash
ghc --version
```

## Erste Schritte

### 3. Interaktive Konsole starten

Die Eingabezeile beginnt mit `ghci>`.

```bash
ghci
```

### 4. Etwas ausprobieren

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>:

```haskell
map (*2) [1..5]
```

```haskell
sum [1..100]
```

**Prüfen:** Die Ausgaben lauten `[2,4,6,8,10]` und `5050`. `map` wendet eine Funktion auf jedes Element an, `[1..5]` ist die Liste von 1 bis 5. Beende die Konsole mit `:quit`.

## Ein einzelnes Programm

### 5. Übungsordner anlegen

```bash
mkdir ~/haskell-uebung
```

### 6. In den Ordner wechseln

```bash
cd ~/haskell-uebung
```

### 7. Quelltext anlegen

```bash
nano lager.hs
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```haskell
-- Lagerbestand eines Fahrradladens

import Data.List (intercalate)

data Fahrrad = Fahrrad
  { modell :: String
  , preis :: Int
  , anzahl :: Int
  }

bestand :: [Fahrrad]
bestand =
  [ Fahrrad "Citybike" 699 4
  , Fahrrad "Trekkingrad" 899 0
  , Fahrrad "Lastenrad" 3490 1
  ]

status :: Fahrrad -> String
status rad
  | anzahl rad > 0 = show (anzahl rad) ++ " auf Lager"
  | otherwise = "ausverkauft"

zeile :: Fahrrad -> String
zeile rad = modell rad ++ ": " ++ show (preis rad) ++ " Euro, " ++ status rad

lagerwert :: [Fahrrad] -> Int
lagerwert raeder = sum [preis r * anzahl r | r <- raeder]

main :: IO ()
main = do
  mapM_ (putStrLn . zeile) bestand
  let lieferbar = [modell r | r <- bestand, anzahl r > 0]
  putStrLn ("Sofort lieferbar: " ++ intercalate ", " lieferbar)
  putStrLn ("Lagerwert: " ++ show (lagerwert bestand) ++ " Euro")
```

- **`data Fahrrad`** – ein eigener Datentyp mit drei benannten Feldern. Die Feldnamen sind zugleich Funktionen: `preis rad` liefert den Preis.
- **Typangaben** – `status :: Fahrrad -> String` heißt: Die Funktion bekommt ein Fahrrad und liefert einen Text. GHC würde die Typen auch selbst erkennen, ausgeschrieben sind sie aber eine gute Dokumentation.
- **Wächter `|`** – wählen je nach Bedingung einen Fall aus. `otherwise` gilt, wenn keiner der vorigen zutrifft.
- **Listenbeschreibung** – `[preis r * anzahl r | r <- raeder]` bildet aus jedem Rad `r` den Wert seiner Räder. Hinter einem Komma können Bedingungen folgen, wie bei `lieferbar`.
- **`main`** – der Startpunkt. Ein- und Ausgaben stehen in einem `do`-Block. `mapM_` führt `putStrLn . zeile` für jedes Rad aus, der Punkt verkettet zwei Funktionen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Programm direkt ausführen

`runghc` übersetzt und startet die Datei in einem Schritt.

```bash
runghc lager.hs
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike: 699 Euro, 4 auf Lager
Trekkingrad: 899 Euro, ausverkauft
Lastenrad: 3490 Euro, 1 auf Lager
Sofort lieferbar: Citybike, Lastenrad
Lagerwert: 6286 Euro
```

### 9. Eigenständiges Programm erzeugen

`-O2` schaltet die Optimierungen ein, `-Wall` alle Warnungen. GHC legt neben dem Programm `lager` noch Zwischendateien mit den Endungen `.o` und `.hi` an.

```bash
ghc -O2 -Wall lager.hs
```

**Prüfen:** GHC meldet `Linking lager` ohne Warnungen. Das Programm liefert dieselbe Ausgabe wie in Schritt 8.

```bash
./lager
```

## Ein Projekt mit cabal

### 10. Paketverzeichnis von Hackage laden

Ohne dieses Verzeichnis kann cabal weder Projekte anlegen noch bauen. Der Download dauert etwa eine Viertelminute, belegt aber 1,2 GB.

```bash
cabal update
```

**Prüfen:** Die Ausgabe endet mit `The index-state is set to …` und dem aktuellen Datum.

### 11. Projektordner anlegen

```bash
mkdir ~/lager-hs
```

### 12. In den Projektordner wechseln

```bash
cd ~/lager-hs
```

### 13. Projekt anlegen

`--non-interactive` übernimmt alle Vorgaben, ohne nachzufragen. `--exe` legt ein ausführbares Programm an. Name und E-Mail-Adresse für die Projektbeschreibung übernimmt cabal aus den Einstellungen von Git, falls vorhanden.

```bash
cabal init --non-interactive --exe --package-name=lager-hs
```

**Prüfen:** Im Ordner liegen die Projektbeschreibung `lager-hs.cabal` und das Programm `app/Main.hs`. Die Warnung `No synopsis given` ist harmlos.

### 14. Bibliothek eintragen

Das Programm soll die Bibliothek `containers` verwenden. Sie gehört zum Lieferumfang von GHC und muss nicht heruntergeladen werden, cabal muss aber von ihr wissen.

```bash
nano lager-hs.cabal
```

Suche die Zeile, die mit `build-depends:` beginnt, und ergänze am Ende `, containers`:

```text
    build-depends:    base ^>=4.20.2.0, containers
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. Programm schreiben

```bash
nano app/Main.hs
```

Lösche den bisherigen Inhalt (mehrmals <kbd>Strg</kbd>+<kbd>K</kbd>) und füge diesen ein:

```haskell
module Main where

import qualified Data.Map.Strict as Map

-- Verkäufe als Liste von (Modell, Anzahl)
verkaeufe :: [(String, Int)]
verkaeufe =
  [ ("Citybike", 2)
  , ("Lastenrad", 1)
  , ("Citybike", 3)
  , ("Trekkingrad", 1)
  , ("Citybike", 1)
  ]

main :: IO ()
main = do
  let summen = Map.fromListWith (+) verkaeufe
  mapM_ (\(modell, anzahl) -> putStrLn (modell ++ ": " ++ show anzahl)) (Map.toList summen)
  putStrLn ("Meistverkauft: " ++ fst (Map.foldrWithKey bester ("", 0) summen))
  where
    bester modell anzahl (bisher, hoechst)
      | anzahl > hoechst = (modell, anzahl)
      | otherwise = (bisher, hoechst)
```

- **`import qualified … as Map`** – lädt das Modul so, dass alle seine Funktionen mit `Map.` beginnen. Das verhindert Verwechslungen mit gleichnamigen Funktionen für Listen.
- **`Map.fromListWith (+)`** – baut aus der Liste ein Wörterbuch. Kommt ein Modell mehrfach vor, werden die Anzahlen addiert.
- **`\(modell, anzahl) -> …`** – eine namenlose Funktion, die ein Paar auseinandernimmt.
- **`where`** – definiert die Hilfsfunktion `bester`, die beim Durchlaufen des Wörterbuchs das Modell mit der höchsten Anzahl behält.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Projekt bauen und starten

`cabal run` übersetzt das Projekt im Ordner `dist-newstyle` und startet es.

```bash
cabal run
```

**Prüfen:** Nach den Meldungen des Compilers lautet die Ausgabe:

```text
Citybike: 6
Lastenrad: 1
Trekkingrad: 1
Meistverkauft: Citybike
```

Das Wörterbuch hält die Modelle alphabetisch sortiert.

## Wie geht es weiter?

- **Bibliotheken von Hackage:** Ein Paketname unter `build-depends`, der nicht zu GHC gehört, z. B. `split`, wird beim nächsten `cabal run` automatisch heruntergeladen und übersetzt. Viele Bibliotheken gibt es auch als Ubuntu-Paket mit dem Namen `libghc-…-dev`, die cabal ebenfalls findet.
- **Code verbessern:** `sudo apt install hlint` installiert ein Werkzeug, das Vereinfachungen vorschlägt, z. B. `hlint app/Main.hs`.
- **Editor:** Für [Visual Studio Code](vscode.md) gibt es die Erweiterung „Haskell“. Sie braucht den Haskell Language Server, der meist über GHCup installiert wird.
- **Dokumentation:** Einstieg und Bücher unter <https://www.haskell.org/documentation/>, Bibliotheken unter <https://hackage.haskell.org>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/haskell-uebung ~/lager-hs
```

### 2. Daten von cabal entfernen

Löscht das Paketverzeichnis von Hackage, heruntergeladene Bibliotheken und die Einstellungen von cabal.

```bash
rm -rf ~/.cache/cabal ~/.config/cabal ~/.local/state/cabal
```

### 3. GHC und cabal entfernen

```bash
sudo apt purge ghc cabal-install
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

`apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `ghc` wird nicht mehr gefunden.

```bash
ghc --version
```
