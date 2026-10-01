# Pascal (Free Pascal)

Pascal wurde um 1970 als gut lesbare Lehrsprache entworfen und lebt heute vor allem als **Object Pascal** weiter, bekannt durch Delphi. Free Pascal ist ein freier Compiler dafür. Er übersetzt schnell, erzeugt eigenständige Programme ohne weitere Abhängigkeiten und versteht auch Delphi-Code. Mit der Entwicklungsumgebung Lazarus entstehen damit auch grafische Anwendungen.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **Free Pascal 3.2.2**. Das Paket `fpc` würde den Compiler mit allen Bibliotheken installieren, auch denen für grafische Oberflächen. Das sind 139 Pakete. Für Konsolenprogramme genügen `fp-compiler` und die Free Component Library `fp-units-fcl`, zusammen 7 Pakete.
- **Units:** Pascal-Programme werden in Units aufgeteilt. Eine Unit hat einen öffentlichen Teil (`interface`) und einen inneren Teil (`implementation`).
- **Sprachmodus:** Free Pascal kennt mehrere Schreibweisen. Diese Anleitung verwendet den Modus `objfpc` mit Klassen und langen Zeichenketten, wie er auch in Lazarus üblich ist.
- **Version:** Getestet mit Free Pascal **3.2.2** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Compiler und Grundbibliotheken installieren

- `fp-compiler` – der Compiler `fpc` mit der Laufzeitbibliothek
- `fp-units-fcl` – die Free Component Library mit Klassen für Listen, Dateien, JSON und vieles mehr

```bash
sudo apt install fp-compiler fp-units-fcl
```

**Prüfen:** Die Ausgabe lautet `3.2.2`.

```bash
fpc -iV
```

## Ein einzelnes Programm

### 3. Übungsordner anlegen

```bash
mkdir ~/pascal-uebung
```

### 4. In den Ordner wechseln

```bash
cd ~/pascal-uebung
```

### 5. Quelltext anlegen

```bash
nano lager.pas
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```pascal
program Lager;

{$mode objfpc}{$H+}

uses
  SysUtils;

type
  TFahrrad = record
    Modell: string;
    Preis: Integer;
    Anzahl: Integer;
  end;

const
  Bestand: array[1..3] of TFahrrad = (
    (Modell: 'Citybike'; Preis: 699; Anzahl: 4),
    (Modell: 'Trekkingrad'; Preis: 899; Anzahl: 0),
    (Modell: 'Lastenrad'; Preis: 3490; Anzahl: 1)
  );

function Status(const Rad: TFahrrad): string;
begin
  if Rad.Anzahl > 0 then
    Result := IntToStr(Rad.Anzahl) + ' auf Lager'
  else
    Result := 'ausverkauft';
end;

var
  I, Wert: Integer;
begin
  Wert := 0;
  for I := Low(Bestand) to High(Bestand) do
  begin
    WriteLn(Format('%d. %-12s %5d Euro, %s', [I, Bestand[I].Modell, Bestand[I].Preis, Status(Bestand[I])]));
    Wert := Wert + Bestand[I].Preis * Bestand[I].Anzahl;
  end;
  WriteLn('Lagerwert: ', Wert, ' Euro');
end.
```

- **`{$mode objfpc}{$H+}`** – schaltet den Sprachmodus mit Klassen ein. `{$H+}` macht `string` zu einer Zeichenkette beliebiger Länge.
- **`uses SysUtils`** – bindet die Unit mit `IntToStr`, `Format` und weiteren Hilfsfunktionen ein.
- **`record`** – fasst mehrere Felder zu einem Typ zusammen. Typnamen beginnen nach Brauch mit `T`.
- **Feld mit eigenen Grenzen** – `array[1..3]` beginnt bei 1. `Low` und `High` liefern die Grenzen.
- **`:=` und `=`** – `:=` weist zu, `=` vergleicht. Blöcke stehen zwischen `begin` und `end`, Anweisungen enden mit `;`.
- **`Result`** – der Rückgabewert einer Funktion.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Programm übersetzen

`-O2` schaltet die Optimierungen ein.

```bash
fpc -O2 lager.pas
```

**Prüfen:** Die letzten Zeilen lauten `Linking lager` und `40 lines compiled, 0.1 sec`.

### 7. Programm starten

```bash
./lager
```

**Prüfen:** Die Ausgabe lautet:

```text
1. Citybike       699 Euro, 4 auf Lager
2. Trekkingrad    899 Euro, ausverkauft
3. Lastenrad     3490 Euro, 1 auf Lager
Lagerwert: 6286 Euro
```

Das Programm ist rund 500 KB groß und braucht keine weiteren Bibliotheken.

## Eine Unit mit einer Klasse

### 8. Unit anlegen

Die Unit enthält eine Klasse, die Verkäufe je Modell zusammenzählt und als JSON ausgeben kann. Der Dateiname muss zum Namen der Unit passen.

```bash
nano umsatz.pas
```

Füge diesen Inhalt ein:

```pascal
unit Umsatz;

{$mode objfpc}{$H+}

interface

uses
  Classes, SysUtils, fpjson;

type
  { Zählt Verkäufe je Modell zusammen }
  TUmsatzListe = class
  private
    FSummen: TStringList;
  public
    constructor Create;
    destructor Destroy; override;
    procedure Verkauf(const Modell: string; Anzahl, Preis: Integer);
    function Summe(const Modell: string): Integer;
    function AlsJson: TJSONObject;
    property Modelle: TStringList read FSummen;
  end;

implementation

constructor TUmsatzListe.Create;
begin
  inherited Create;
  FSummen := TStringList.Create;
end;

destructor TUmsatzListe.Destroy;
begin
  FSummen.Free;
  inherited Destroy;
end;

procedure TUmsatzListe.Verkauf(const Modell: string; Anzahl, Preis: Integer);
begin
  FSummen.Values[Modell] := IntToStr(Summe(Modell) + Anzahl * Preis);
end;

function TUmsatzListe.Summe(const Modell: string): Integer;
begin
  Result := StrToIntDef(FSummen.Values[Modell], 0);
end;

function TUmsatzListe.AlsJson: TJSONObject;
var
  I: Integer;
begin
  Result := TJSONObject.Create;
  for I := 0 to FSummen.Count - 1 do
    Result.Add(FSummen.Names[I], Summe(FSummen.Names[I]));
end;

end.
```

- **`interface` und `implementation`** – oben steht, was andere Programmteile sehen, unten der eigentliche Code.
- **`class`** – eine Klasse mit Feldern, Methoden und einer `property`. `private` verbirgt das Feld `FSummen` nach außen.
- **`TStringList`** – eine Liste von Texten aus der Unit `Classes`. Über `Values['Name']` lassen sich Einträge der Form `Name=Wert` lesen und setzen.
- **Speicher selbst freigeben** – Objekte entstehen mit `Create` und müssen mit `Free` wieder freigegeben werden. Der `destructor` gibt die innere Liste frei.
- **`fpjson`** – die JSON-Unit der Free Component Library.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Hauptprogramm anlegen

```bash
nano auswertung.pas
```

Füge diesen Inhalt ein:

```pascal
program Auswertung;

{$mode objfpc}{$H+}

uses
  Classes, SysUtils, fpjson, Umsatz;

var
  Liste: TUmsatzListe;
  Json: TJSONObject;
  Datei: TStringList;
  I: Integer;
begin
  Liste := TUmsatzListe.Create;
  try
    Liste.Verkauf('Citybike', 2, 699);
    Liste.Verkauf('Lastenrad', 1, 3490);
    Liste.Verkauf('Citybike', 3, 699);
    Liste.Verkauf('Trekkingrad', 1, 899);
    Liste.Verkauf('Citybike', 1, 649);

    Liste.Modelle.Sort;
    for I := 0 to Liste.Modelle.Count - 1 do
      WriteLn(Format('%-12s %5d Euro', [Liste.Modelle.Names[I], Liste.Summe(Liste.Modelle.Names[I])]));

    Json := Liste.AlsJson;
    Datei := TStringList.Create;
    try
      Datei.Text := Json.FormatJSON;
      Datei.SaveToFile('umsatz.json');
      WriteLn('Gespeichert: umsatz.json');
    finally
      Datei.Free;
      Json.Free;
    end;
  finally
    Liste.Free;
  end;
end.
```

- **`uses …, Umsatz`** – bindet die eigene Unit ein. `fpc` findet `umsatz.pas` im selben Ordner und übersetzt sie mit.
- **`try … finally`** – der Teil nach `finally` läuft immer, auch nach einem Fehler. So wird jedes Objekt sicher freigegeben.
- **`Liste.Modelle.Sort`** – sortiert die Modelle alphabetisch, bevor sie ausgegeben werden.
- **`FormatJSON`** – liefert das JSON-Objekt als eingerückten Text.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Programm übersetzen

```bash
fpc -O2 auswertung.pas
```

**Prüfen:** Die Meldungen nennen `Compiling auswertung.pas` und `Compiling umsatz.pas`. Neben dem Programm entstehen Zwischendateien mit den Endungen `.o` und `.ppu`.

### 11. Programm starten

```bash
./auswertung
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike      4144 Euro
Lastenrad     3490 Euro
Trekkingrad    899 Euro
Gespeichert: umsatz.json
```

Die Datei `umsatz.json` enthält die drei Modelle mit ihren Umsätzen, z. B. `"Citybike" : 4144`.

### 12. Vergessene Freigaben finden (optional)

`-gh` baut eine Speicherprüfung ein. Sie meldet sich beim Beenden nur, wenn Objekte nicht freigegeben wurden. Lösche zum Ausprobieren in `auswertung.pas` die Zeile `Json.Free;` und übersetze neu:

```bash
fpc -gh auswertung.pas
```

```bash
./auswertung
```

**Prüfen:** Nach der normalen Ausgabe erscheint `Heap dump by heaptrc unit` und eine Zeile wie `9 unfreed memory blocks : 621`. Mit der Zeile `Json.Free;` bleibt die Prüfung stumm. Füge sie danach wieder ein.

## Wie geht es weiter?

- **Lazarus:** `sudo apt install lazarus` installiert die Entwicklungsumgebung Lazarus mit einem Formulareditor für grafische Programme, ähnlich wie Delphi. Sie bringt das vollständige Free Pascal samt aller Bibliotheken mit.
- **Weitere Bibliotheken:** Das Paket `fpc` installiert alle Units von Free Pascal, etwa für Datenbanken, Netzwerk und Grafik.
- **Ordnung im Projektordner:** `-FUlib` legt die Zwischendateien im Unterordner `lib` ab, `-FEbin` das fertige Programm in `bin`. Die Ordner müssen vorher existieren.
- **Delphi-Code:** Mit `{$mode delphi}` übersetzt Free Pascal Quelltext in der Schreibweise von Delphi.
- **Dokumentation:** Handbücher zu Sprache und Bibliotheken unter <https://www.freepascal.org/docs.html>, ein deutschsprachiges Forum und Wiki unter <https://www.lazarusforum.de>.

## Deinstallieren

### 1. Übungsordner entfernen

```bash
rm -rf ~/pascal-uebung
```

### 2. Free Pascal entfernen

```bash
sudo apt purge fp-compiler fp-units-fcl
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Pakete, die nur für Free Pascal mitinstalliert wurden, z. B. `fp-compiler-3.2.2`. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `fpc` wird nicht mehr gefunden.

```bash
fpc -iV
```
