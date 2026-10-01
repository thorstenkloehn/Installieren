# Lua

Lua ist eine kleine, schnelle Skriptsprache aus Brasilien, die sich leicht in andere Programme einbauen lässt. Deshalb steckt sie in vielen Anwendungen als Erweiterungssprache, etwa in [Neovim](neovim.md), im Satzprogramm LuaTeX, im Webserver OpenResty und in Spielen. Der Interpreter ist nur wenige hundert Kilobyte groß.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 bietet **Lua 5.4** im Paket `lua5.4` und das neue Lua 5.5 im Paket `lua5.5`. Die Anleitung verwendet 5.4, denn dafür gibt es bei Ubuntu fertige Bibliotheken als Pakete, etwa für JSON oder Dateizugriffe. Für 5.5 fehlen sie noch.
- **Bibliotheken über apt:** Pakete wie `lua-cjson` oder `lua-filesystem` sind für Lua 5.1, 5.3 und 5.4 gebaut. Sie werden mit `apt` installiert und aktualisiert.
- **LuaRocks:** Der Paketmanager LuaRocks ist bei Ubuntu nur in Version 3.8 enthalten und auf Lua 5.1 oder 5.3 ausgelegt. Er zieht deshalb ein zweites Lua nach sich. Für den Einstieg reichen die Bibliotheken aus `apt`.
- **Neovim:** Neovim bringt seine eigene Lua-Umgebung (LuaJIT) mit. Für die Konfiguration von Neovim muss Lua nicht installiert werden.
- **Version:** Getestet mit Lua **5.4.8** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Lua installieren

Das Paket bringt den Interpreter `lua5.4` und den Übersetzer `luac5.4` mit. Ubuntu richtet dazu die kurzen Befehle `lua` und `luac` ein.

```bash
sudo apt install lua5.4
```

**Prüfen:** Die Ausgabe beginnt mit `Lua 5.4.8`.

```bash
lua -v
```

## Erste Schritte

### 3. Interaktive Konsole starten

`-i` startet eine Konsole, in der jede Zeile sofort ausgeführt wird. Die Eingabezeile beginnt mit `>`.

```bash
lua -i
```

### 4. Etwas ausprobieren

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>:

```lua
x = 6 * 7
```

```lua
print("Ergebnis: " .. x)
```

**Prüfen:** Die Ausgabe lautet `Ergebnis: 42`. `..` hängt Texte aneinander. Beende die Konsole mit <kbd>Strg</kbd>+<kbd>D</kbd>.

## Ein eigenes Modul

### 5. Übungsordner anlegen

```bash
mkdir ~/lua-uebung
```

### 6. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/lua-uebung
```

### 7. Modul anlegen

Ein Modul ist eine Lua-Datei, die eine Tabelle mit Funktionen zurückgibt. Andere Dateien laden es mit `require`.

```bash
nano lager.lua
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```lua
-- Modul mit Funktionen rund um den Lagerbestand
local lager = {}

function lager.lieferbar(bestand)
  local ergebnis = {}
  for _, rad in ipairs(bestand) do
    if rad.anzahl > 0 then
      table.insert(ergebnis, rad.modell)
    end
  end
  return ergebnis
end

function lager.wert(bestand)
  local summe = 0
  for _, rad in ipairs(bestand) do
    summe = summe + rad.preis * rad.anzahl
  end
  return summe
end

return lager
```

- **Tabellen** – der einzige zusammengesetzte Datentyp von Lua. Sie dienen als Liste, als Wörterbuch und, wie hier, als Modul mit Funktionen.
- **`local`** – die Variable gilt nur in dieser Datei bzw. in diesem Block. Ohne `local` wäre sie überall sichtbar.
- **`ipairs`** – geht eine Liste der Reihe nach durch und liefert Position und Wert. `_` ist der übliche Name für einen Wert, den man nicht braucht.
- **`return lager`** – gibt die Tabelle an den zurück, der das Modul lädt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Hauptprogramm anlegen

```bash
nano auswertung.lua
```

Füge diesen Inhalt ein:

```lua
local lager = require("lager")

local bestand = {
  { modell = "Citybike", preis = 699, anzahl = 4 },
  { modell = "Trekkingrad", preis = 899, anzahl = 0 },
  { modell = "Lastenrad", preis = 3490, anzahl = 1 },
}

for i, rad in ipairs(bestand) do
  local status = rad.anzahl > 0 and (rad.anzahl .. " auf Lager") or "ausverkauft"
  print(string.format("%d. %-12s %5d Euro  %s", i, rad.modell, rad.preis, status))
end

print("Sofort lieferbar: " .. table.concat(lager.lieferbar(bestand), ", "))
print("Lagerwert: " .. lager.wert(bestand) .. " Euro")
```

- **`require("lager")`** – sucht die Datei `lager.lua` unter anderem im aktuellen Ordner und lädt sie.
- **Listen beginnen bei 1:** Anders als in vielen Sprachen hat das erste Element einer Liste in Lua die Position 1.
- **`a and b or c`** – die übliche Kurzform für „wenn a, dann b, sonst c“.
- **`string.format`** – gibt Werte formatiert aus. `%-12s` füllt einen Text linksbündig auf 12 Zeichen auf, `%5d` eine Zahl rechtsbündig auf 5 Stellen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Programm ausführen

```bash
lua auswertung.lua
```

**Prüfen:** Die Ausgabe lautet:

```text
1. Citybike       699 Euro  4 auf Lager
2. Trekkingrad    899 Euro  ausverkauft
3. Lastenrad     3490 Euro  1 auf Lager
Sofort lieferbar: Citybike, Lastenrad
Lagerwert: 6286 Euro
```

### 10. Syntax prüfen

`luac -p` übersetzt die Dateien nur zur Probe und meldet Syntaxfehler mit Datei und Zeile, ohne das Programm auszuführen.

```bash
luac -p auswertung.lua lager.lua
```

**Prüfen:** Der Befehl gibt nichts aus. Fehlt z. B. eine schließende Klammer, meldet er etwa `')' expected (to close '(' at line 1)`.

## Bibliotheken aus apt

### 11. Bibliotheken für JSON und Dateien installieren

- `lua-cjson` – liest und schreibt JSON
- `lua-filesystem` – listet Ordner auf und fragt Dateieigenschaften ab

```bash
sudo apt install lua-cjson lua-filesystem
```

### 12. Programm anlegen

Das Programm speichert den Bestand als JSON-Datei, liest ihn wieder ein und listet alle Lua-Dateien im Ordner mit ihrer Größe auf.

```bash
nano json.lua
```

Füge diesen Inhalt ein:

```lua
local cjson = require("cjson")
local lfs = require("lfs")

-- Bestand als JSON-Datei speichern
local bestand = {
  { modell = "Citybike", preis = 699, anzahl = 4 },
  { modell = "Lastenrad", preis = 3490, anzahl = 1 },
}
local datei = assert(io.open("bestand.json", "w"))
datei:write(cjson.encode(bestand))
datei:close()

-- Datei wieder einlesen
datei = assert(io.open("bestand.json", "r"))
local gelesen = cjson.decode(datei:read("a"))
datei:close()
print("Gelesen: " .. #gelesen .. " Einträge, erstes Modell: " .. gelesen[1].modell)

-- Alle Lua-Dateien im Ordner sammeln, sortieren und mit Größe auflisten
local namen = {}
for name in lfs.dir(".") do
  if name:match("%.lua$") then
    table.insert(namen, name)
  end
end
table.sort(namen)
for _, name in ipairs(namen) do
  print(string.format("%-16s %4d Bytes", name, lfs.attributes(name, "size")))
end
```

- **`require("lfs")`** – das Paket `lua-filesystem` heißt beim Laden `lfs`.
- **`assert(io.open(…))`** – `io.open` liefert bei einem Fehler `nil` und eine Meldung. `assert` bricht dann mit dieser Meldung ab.
- **`datei:write(…)`** – der Doppelpunkt ruft eine Methode auf und übergibt `datei` selbst als ersten Wert.
- **`#gelesen`** – die Länge einer Liste.
- **`name:match("%.lua$")`** – ein Lua-Muster, ähnlich einem regulären Ausdruck: Der Name endet auf `.lua`. `%` maskiert den Punkt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Programm ausführen

```bash
lua json.lua
```

**Prüfen:** Die Ausgabe lautet:

```text
Gelesen: 2 Einträge, erstes Modell: Citybike
auswertung.lua    548 Bytes
json.lua          861 Bytes
lager.lua         427 Bytes
```

Die Größen können um ein paar Bytes abweichen, wenn du beim Einfügen Leerzeilen anders gesetzt hast.

### 14. JSON-Datei ansehen

```bash
cat bestand.json
```

**Prüfen:** Die Datei enthält beide Räder in einer Zeile, z. B. `[{"preis":699,"modell":"Citybike","anzahl":4},…]`. Die Reihenfolge der Felder kann sich bei jedem Lauf ändern, denn Lua-Tabellen merken sich keine Reihenfolge ihrer Schlüssel.

## Wie geht es weiter?

- **Weitere Bibliotheken:** `apt search lua-` listet alle Lua-Pakete von Ubuntu, z. B. `lua-socket` für Netzwerkverbindungen, `lua-lpeg` für Textzerlegung oder `lua-penlight` mit vielen Hilfsfunktionen.
- **Lua 5.5:** `sudo apt install lua5.5` installiert die neue Version zusätzlich. Sie startet mit `lua5.5`, die alte weiterhin mit `lua5.4`. Auf welche Version der kurze Befehl `lua` zeigt, legst du mit `sudo update-alternatives --config lua-interpreter` fest. Die Bibliotheken aus `apt` funktionieren nur mit 5.4.
- **Lua einbetten:** Mit `liblua5.4-dev` lässt sich Lua in eigene Programme in [C](c.md) einbauen. Das ist der ursprüngliche Zweck der Sprache.
- **Editor:** Für [Visual Studio Code](vscode.md) und [Neovim](neovim.md) gibt es den Sprachserver lua-language-server mit Autovervollständigung und Fehleranzeige.
- **Dokumentation:** Das Handbuch zu Lua 5.4 steht unter <https://www.lua.org/manual/5.4/>.

## Deinstallieren

### 1. Übungsordner entfernen

```bash
rm -rf ~/lua-uebung
```

### 2. Lua und Bibliotheken entfernen

```bash
sudo apt purge lua5.4 lua-cjson lua-filesystem
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

`apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `lua` wird nicht mehr gefunden.

```bash
lua -v
```
