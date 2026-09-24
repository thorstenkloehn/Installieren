# C#

C# (gesprochen „C Sharp“) ist die wichtigste Programmiersprache der Plattform .NET von Microsoft. Mit ihr entstehen Kommandozeilenprogramme, Webanwendungen, Desktop-Programme und Spiele (z. B. mit Unity), und sie läuft heute genauso unter Linux wie unter Windows.

## Vorbemerkungen

- **.NET SDK:** Zum Programmieren in C# braucht man das **.NET SDK**. Es enthält den Befehl `dotnet`, den C#-Compiler, die Laufzeitumgebung und Projektvorlagen.
- **Installation über apt:** Ubuntu 26.04 liefert **.NET 10** in den eigenen Paketquellen. Das ist die aktuelle Version mit Langzeitunterstützung (LTS) bis November 2028 und bringt **C# 14** mit. Ein Paketarchiv von Microsoft ist nicht nötig.
- **Zwei Arbeitsweisen:** Seit .NET 10 lässt sich eine einzelne `.cs`-Datei direkt mit `dotnet run` starten, ganz ohne Projektdatei. Für richtige Programme legt man ein Projekt mit `dotnet new` an. Diese Anleitung zeigt beides.
- **Entwicklungsumgebung:** [Visual Studio Code](vscode.md) mit der Erweiterung „C# Dev Kit“ oder JetBrains Rider. Das klassische Visual Studio gibt es nur für Windows, siehe [Microsoft Visual Studio](visualstudio.md).

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version des .NET SDK kennt.

```bash
sudo apt update
```

### 2. .NET SDK installieren

Installiert das SDK mitsamt Laufzeitumgebungen. Ist es schon vorhanden (z. B. aus der Anleitung [ASP.NET Core](aspnet-core.md)), meldet `apt` das nur.

```bash
sudo apt install dotnet-sdk-10.0
```

**Prüfen:** Die Ausgabe beginnt mit `10.0.`.

```bash
dotnet --version
```

### 3. Optional: Nutzungsstatistik abschalten

Die Befehlszeile `dotnet` kann anonyme Nutzungsdaten an Microsoft senden. Diese Zeile in `~/.bashrc` schaltet das für alle künftigen Terminals ab. Danach ein neues Terminal öffnen.

```bash
nano ~/.bashrc
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei und füge in einer eigenen Zeile an (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```bash
export DOTNET_CLI_TELEMETRY_OPTOUT=1
```

## Einzelne Datei ausführen

### 4. Arbeitsordner anlegen

Ein eigener Ordner für die Übungsdateien.

```bash
mkdir -p ~/csharp-uebung
```

### 5. In den Ordner wechseln

Alle folgenden Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/csharp-uebung
```

### 6. Quelltext anlegen

Legt `hallo.cs` an. Die Anweisungen stehen direkt in der Datei, eine Klasse mit `Main`-Methode ist nicht nötig. `Sum()` und `Max()` stammen aus LINQ, den Abfragefunktionen von .NET.

```bash
nano hallo.cs
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```csharp
var zahlen = new[] { 3, 1, 4, 1, 5 };
Console.WriteLine($"Hallo aus C# {Environment.Version}!");
Console.WriteLine($"Summe: {zahlen.Sum()}, größte Zahl: {zahlen.Max()}");
```

### 7. Datei ausführen

`dotnet` übersetzt die Datei im Hintergrund und startet sie. Der erste Aufruf dauert einige Sekunden, weitere Aufrufe gehen schneller.

```bash
dotnet run hallo.cs
```

**Prüfen:** Die Ausgabe lautet:

```text
Hallo aus C# 10.0.…!
Summe: 14, größte Zahl: 5
```

## Konsolenprojekt anlegen

### 8. Projekt erzeugen

Erzeugt aus der Vorlage `console` ein Projekt im Unterordner `Rechner`. Darin liegen die Projektdatei `Rechner.csproj` und der Quelltext `Program.cs`.

```bash
dotnet new console -o Rechner
```

### 9. In den Projektordner wechseln

`dotnet run` und `dotnet build` arbeiten mit dem Projekt im aktuellen Ordner.

```bash
cd Rechner
```

### 10. Quelltext ersetzen

Überschreibt die Vorlage mit einem kleinen Programm, das eine Klasse `Konto` anlegt und benutzt. Klassen stehen in dieser Schreibweise unterhalb der Anweisungen.

```bash
nano Program.cs
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```csharp
var konto = new Konto("Thorsten");
konto.Einzahlen(100m);
konto.Abheben(30m);
Console.WriteLine($"{konto.Inhaber}: {konto.Stand:C}");

class Konto(string inhaber)
{
    public string Inhaber { get; } = inhaber;
    public decimal Stand { get; private set; }

    public void Einzahlen(decimal betrag) => Stand += betrag;

    public void Abheben(decimal betrag)
    {
        if (betrag > Stand)
            throw new InvalidOperationException("Nicht genug Guthaben");
        Stand -= betrag;
    }
}
```

### 11. Projekt starten

Übersetzt das Projekt und startet es.

```bash
dotnet run
```

**Prüfen:** Die Ausgabe lautet `Thorsten: 70,00 €` (Währungsformat abhängig von der Spracheinstellung des Systems).

### 12. Optional: Fertiges Programm erzeugen

Erstellt eine optimierte Fassung im Ordner `bin/Release/net10.0/publish`. Das Programm dort lässt sich auf jedem Rechner mit .NET-10-Laufzeitumgebung per `./Rechner` starten.

```bash
dotnet publish -c Release
```

**Prüfen:**

```bash
./bin/Release/net10.0/publish/Rechner
```

## Wie geht es weiter?

- **Bibliotheken:** Pakete aus dem Verzeichnis NuGet fügt man mit `dotnet add package <Name>` zum Projekt hinzu.
- **Tests:** Die Vorlage `xunit` legt ein Testprojekt an; `dotnet test` führt die Tests aus.
- **Webanwendungen:** Die Anleitung [ASP.NET Core](aspnet-core.md) baut darauf auf.
- **Weitere Vorlagen:** `dotnet new list` zeigt alle installierten Projektvorlagen.

## Deinstallieren

### 1. Übungsordner entfernen

Löscht die Beispieldatei und das Projekt.

```bash
rm -rf ~/csharp-uebung
```

### 2. .NET SDK entfernen

Nur ausführen, wenn .NET auch nicht mehr für [ASP.NET Core](aspnet-core.md) gebraucht wird.

```bash
sudo apt purge dotnet-sdk-10.0
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Laufzeitumgebungen und weitere nur für .NET installierte Pakete.

```bash
sudo apt autoremove
```

### 4. Zwischenspeicher im Benutzerordner löschen

`dotnet` legt heruntergeladene NuGet-Pakete und Einstellungen in `~/.nuget` und `~/.dotnet` ab.

```bash
rm -rf ~/.nuget ~/.dotnet
```

### 5. Optional: Eintrag für die Nutzungsstatistik entfernen

Nur nötig, wenn Schritt 3 der Installation ausgeführt wurde. Löscht die Zeile wieder aus `~/.bashrc`.

```bash
nano ~/.bashrc
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `DOTNET_CLI_TELEMETRY_OPTOUT` und drücke <kbd>Enter</kbd>. Lösche die Zeile `export DOTNET_CLI_TELEMETRY_OPTOUT=1` mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Meldung lautet `dotnet: Befehl nicht gefunden` bzw. `command not found`.

```bash
dotnet --version
```
