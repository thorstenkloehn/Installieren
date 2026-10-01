# Zig

Zig ist eine junge Systemprogrammiersprache, die als moderne Alternative zu [C](c.md) gedacht ist. Sie erzeugt schnelle, kleine Programme ohne versteckte Speicherzugriffe und ohne Laufzeitumgebung. Den Speicher verwaltet man ausdrücklich selbst, Zig hilft aber dabei, Fehler zu finden. Außerdem kann der Zig-Compiler auch C-Code übersetzen und für andere Betriebssysteme bauen.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 bietet zwei Versionen an: Zig 0.14 über das Paket `zig` und **Zig 0.15** im Paket `zig0.15`. Die Anleitung verwendet 0.15.
- **Noch vor Version 1.0:** Zig ändert seine Standardbibliothek noch mit fast jeder Version. Gerade bei der Ausgabe von Text unterscheidet sich 0.15 deutlich von 0.14. Viele Beispiele im Netz passen deshalb nicht zur installierten Version. Der Code in dieser Anleitung ist für 0.15 geschrieben.
- **Befehlsname:** Das Paket `zig0.15` stellt den Befehl `zig0.15` bereit. Schritt 3 legt eine Verknüpfung an, damit er wie üblich `zig` heißt.
- **Zwischenspeicher:** Zig legt Übersetzungsergebnisse in `~/.cache/zig` und im Projektordner unter `.zig-cache` ab.
- **Version:** Getestet mit Zig **0.15.2** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Zig installieren

Zig bringt seinen eigenen Compiler auf Basis von LLVM mit. Deshalb kommen etwa zehn Pakete auf den Rechner.

```bash
sudo apt install zig0.15
```

### 3. Ordner für eigene Befehle anlegen

`~/.local/bin` ist bei Ubuntu für Programme gedacht, die nur dem eigenen Benutzer gehören. `-p` meldet keinen Fehler, wenn es den Ordner schon gibt.

```bash
mkdir -p ~/.local/bin
```

### 4. Verknüpfung `zig` anlegen

`ln -s` legt eine Verknüpfung an. Danach startet `zig` den Befehl `zig0.15`.

```bash
ln -s /usr/bin/zig0.15 ~/.local/bin/zig
```

### 5. Suchpfad neu einlesen

Ubuntu nimmt `~/.local/bin` beim Anmelden in den Suchpfad auf, aber nur, wenn der Ordner dann schon existiert. Hast du ihn gerade erst angelegt, liest dieser Befehl die Einstellung neu ein.

```bash
source ~/.profile
```

**Prüfen:** Die Ausgabe lautet `0.15.2`.

```bash
zig version
```

## Ein einzelnes Programm

### 6. Übungsordner anlegen

```bash
mkdir ~/zig-uebung
```

### 7. In den Ordner wechseln

```bash
cd ~/zig-uebung
```

### 8. Quelltext anlegen

```bash
nano lager.zig
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```zig
const std = @import("std");

const Fahrrad = struct {
    modell: []const u8,
    preis: u32,
    anzahl: u32,
};

const bestand = [_]Fahrrad{
    .{ .modell = "Citybike", .preis = 699, .anzahl = 4 },
    .{ .modell = "Trekkingrad", .preis = 899, .anzahl = 0 },
    .{ .modell = "Lastenrad", .preis = 3490, .anzahl = 1 },
};

pub fn main() !void {
    var puffer: [1024]u8 = undefined;
    var stdout_writer = std.fs.File.stdout().writer(&puffer);
    const aus = &stdout_writer.interface;

    var wert: u32 = 0;
    for (bestand, 1..) |rad, nummer| {
        if (rad.anzahl > 0) {
            try aus.print("{d}. {s:<12} {d:>5} Euro, {d} auf Lager\n", .{ nummer, rad.modell, rad.preis, rad.anzahl });
        } else {
            try aus.print("{d}. {s:<12} {d:>5} Euro, ausverkauft\n", .{ nummer, rad.modell, rad.preis });
        }
        wert += rad.preis * rad.anzahl;
    }
    try aus.print("Lagerwert: {d} Euro\n", .{wert});
    try aus.flush();
}
```

- **`const` und `var`** – `const` ist unveränderlich, `var` veränderlich. Zig verlangt `const`, wo nichts verändert wird.
- **Typen** – `u32` ist eine vorzeichenlose ganze Zahl mit 32 Bit. `[]const u8` ist ein Stück Speicher aus Bytes, so stellt Zig Texte dar.
- **`[_]Fahrrad{ … }`** – ein Feld fester Länge. `_` lässt Zig die Länge selbst zählen.
- **Ausgabe mit Puffer** – Zig 0.15 schreibt zuerst in einen eigenen Puffer (`puffer`) und gibt ihn mit `flush` aus. Ohne `flush` am Ende erscheint unter Umständen nichts.
- **`!void` und `try`** – die Funktion kann einen Fehler liefern. `try` gibt einen Fehler sofort an den Aufrufer weiter.
- **`for (bestand, 1..) |rad, nummer|`** – geht das Feld durch und zählt dabei ab 1 mit.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Programm übersetzen und starten

`zig run` übersetzt und startet in einem Schritt. Beim ersten Mal übersetzt Zig auch Teile der Standardbibliothek, das dauert einige Sekunden.

```bash
zig run lager.zig
```

**Prüfen:** Die Ausgabe lautet:

```text
1. Citybike       699 Euro, 4 auf Lager
2. Trekkingrad    899 Euro, ausverkauft
3. Lastenrad     3490 Euro, 1 auf Lager
Lagerwert: 6286 Euro
```

### 10. Formatierung prüfen

`zig fmt` bringt Quelltext in die einheitliche Form von Zig. `--check` prüft nur und nennt Dateien, die abweichen.

```bash
zig fmt --check lager.zig
```

**Prüfen:** Der Befehl gibt nichts aus. Ohne `--check` korrigiert `zig fmt` die Datei selbst.

## Ein Projekt mit Tests

### 11. Projektordner anlegen

Der Name des Ordners wird zum Namen des Projekts und des Programms.

```bash
mkdir ~/lager
```

### 12. In den Projektordner wechseln

```bash
cd ~/lager
```

### 13. Projekt anlegen

Legt die Bauanleitung `build.zig`, die Projektbeschreibung `build.zig.zon` und zwei Quelldateien an: `src/root.zig` für die Bibliothek und `src/main.zig` für das Programm.

```bash
zig init
```

**Prüfen:** Die Meldungen nennen `created src/main.zig` und `created src/root.zig`.

### 14. Bibliothek mit Tests schreiben

```bash
nano src/root.zig
```

Lösche den bisherigen Inhalt (mehrmals <kbd>Strg</kbd>+<kbd>K</kbd>) und füge diesen ein:

```zig
//! Funktionen rund um den Lagerbestand
const std = @import("std");

pub const Fahrrad = struct {
    modell: []const u8,
    preis: u32,
    anzahl: u32,
};

/// Summe aus Preis mal Anzahl über alle Räder
pub fn lagerwert(bestand: []const Fahrrad) u32 {
    var summe: u32 = 0;
    for (bestand) |rad| summe += rad.preis * rad.anzahl;
    return summe;
}

/// Liefert die Modelle, die auf Lager sind. Der Aufrufer gibt die Liste wieder frei.
pub fn lieferbar(allocator: std.mem.Allocator, bestand: []const Fahrrad) !std.ArrayList([]const u8) {
    var liste: std.ArrayList([]const u8) = .empty;
    errdefer liste.deinit(allocator);
    for (bestand) |rad| {
        if (rad.anzahl > 0) try liste.append(allocator, rad.modell);
    }
    return liste;
}

const beispiel = [_]Fahrrad{
    .{ .modell = "Citybike", .preis = 699, .anzahl = 4 },
    .{ .modell = "Lastenrad", .preis = 3490, .anzahl = 0 },
};

test "lagerwert" {
    try std.testing.expectEqual(@as(u32, 2796), lagerwert(&beispiel));
}

test "lieferbar" {
    var liste = try lieferbar(std.testing.allocator, &beispiel);
    defer liste.deinit(std.testing.allocator);
    try std.testing.expectEqual(@as(usize, 1), liste.items.len);
    try std.testing.expectEqualStrings("Citybike", liste.items[0]);
}
```

- **`pub`** – macht einen Namen außerhalb der Datei sichtbar.
- **Allocator** – Zig hat keine automatische Speicherverwaltung. Funktionen, die Speicher brauchen, bekommen einen `Allocator` übergeben. So sieht man schon an der Schnittstelle, wo Speicher angefordert wird.
- **`std.ArrayList`** – eine Liste, die wächst. `append` fügt hinzu und kann scheitern, wenn kein Speicher mehr frei ist. Deshalb steht `try` davor.
- **`errdefer`** – gibt die Liste nur frei, wenn die Funktion mit einem Fehler endet. **`defer`** im Test gibt sie in jedem Fall am Ende frei.
- **`test "…"`** – Tests stehen direkt neben dem Code. `std.testing.allocator` meldet Speicher, der nicht freigegeben wurde, als Fehler.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. Programm schreiben

```bash
nano src/main.zig
```

Lösche den bisherigen Inhalt und füge diesen ein:

```zig
const std = @import("std");
const lager = @import("lager");

const bestand = [_]lager.Fahrrad{
    .{ .modell = "Citybike", .preis = 699, .anzahl = 4 },
    .{ .modell = "Trekkingrad", .preis = 899, .anzahl = 0 },
    .{ .modell = "Lastenrad", .preis = 3490, .anzahl = 1 },
};

pub fn main() !void {
    // Speicherverwaltung, die beim Beenden vergessene Freigaben meldet
    var debug_allocator: std.heap.DebugAllocator(.{}) = .init;
    defer _ = debug_allocator.deinit();
    const allocator = debug_allocator.allocator();

    var puffer: [1024]u8 = undefined;
    var stdout_writer = std.fs.File.stdout().writer(&puffer);
    const aus = &stdout_writer.interface;

    var liste = try lager.lieferbar(allocator, &bestand);
    defer liste.deinit(allocator);

    try aus.print("Sofort lieferbar:", .{});
    for (liste.items) |modell| try aus.print(" {s}", .{modell});
    try aus.print("\nLagerwert: {d} Euro\n", .{lager.lagerwert(&bestand)});
    try aus.flush();
}
```

- **`@import("lager")`** – lädt die Bibliothek aus `src/root.zig`. Den Namen `lager` hat `zig init` in `build.zig` nach dem Projektordner vergeben.
- **`DebugAllocator`** – eine Speicherverwaltung für die Entwicklung. Sie prüft beim Beenden (`deinit`), ob aller Speicher freigegeben wurde.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Programm bauen und starten

```bash
zig build run
```

**Prüfen:** Die Ausgabe lautet:

```text
Sofort lieferbar: Citybike Lastenrad
Lagerwert: 6286 Euro
```

### 17. Tests ausführen

`--summary all` zeigt an, wie viele Tests gelaufen sind.

```bash
zig build test --summary all
```

**Prüfen:** Die Zusammenfassung lautet `Build Summary: 5/5 steps succeeded; 2/2 tests passed`.

### 18. Vergessene Freigabe ausprobieren (optional)

Öffne `src/main.zig`, lösche die Zeile `defer liste.deinit(allocator);` und ändere in der Zeile darüber `var liste` in `const liste`. Zig verlangt das, weil die Liste ohne `deinit` nie mehr verändert wird. Starte danach erneut:

```bash
zig build run
```

**Prüfen:** Nach der normalen Ausgabe meldet der `DebugAllocator` `error(gpa): memory address … leaked` und zeigt, wo der Speicher angefordert wurde. Mache die Änderung danach wieder rückgängig.

### 19. Klein und schnell übersetzen

`-Doptimize=ReleaseSmall` optimiert auf geringe Größe. Das Programm landet in `zig-out/bin`.

```bash
zig build -Doptimize=ReleaseSmall
```

**Prüfen:** Das Programm ist nur rund 20 KB groß und `statically linked`, braucht also keine weiteren Bibliotheken.

```bash
file zig-out/bin/lager
```

## Wie geht es weiter?

- **Für andere Systeme bauen:** `zig build -Dtarget=x86_64-windows` erzeugt eine Windows-Datei `lager.exe`, `-Dtarget=aarch64-linux` ein Programm für ARM-Rechner wie den Raspberry Pi.
- **C-Code übersetzen:** `zig cc` ist ein vollständiger C-Compiler und kann z. B. `gcc` beim Übersetzen fremder Projekte ersetzen.
- **Bibliotheken:** `zig fetch --save <Adresse>` trägt ein Paket aus einem Git-Repository in `build.zig.zon` ein.
- **Editor:** Der Sprachserver ZLS bringt Autovervollständigung in [Visual Studio Code](vscode.md) und [Neovim](neovim.md). Seine Version muss zur Zig-Version passen.
- **Dokumentation:** Die Sprachbeschreibung für 0.15 steht unter <https://ziglang.org/documentation/0.15.2/>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/zig-uebung ~/lager
```

### 2. Zwischenspeicher entfernen

```bash
rm -rf ~/.cache/zig
```

### 3. Verknüpfung entfernen

```bash
rm ~/.local/bin/zig
```

### 4. Zig entfernen

```bash
sudo apt purge zig0.15 zig0.15-dev
```

### 5. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Pakete, die nur für Zig mitinstalliert wurden, z. B. LLVM 20. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `zig` wird nicht mehr gefunden.

```bash
zig version
```
