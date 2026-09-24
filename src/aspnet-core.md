# ASP.NET Core

ASP.NET Core ist das Web-Framework von Microsoft für die Plattform .NET. Damit baut man in C# Webanwendungen, REST-Schnittstellen und Echtzeitdienste. Es ist quelloffen, läuft unter Linux genauso wie unter Windows und bringt mit **Kestrel** einen eigenen, schnellen Webserver mit.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **.NET 10** selbst, die aktuelle Version mit Langzeitunterstützung (LTS) bis November 2028. Das .NET SDK enthält ASP.NET Core bereits, ein Paketarchiv von Microsoft ist nicht nötig.
- **Vorlagen:** Neue Projekte legt man mit `dotnet new` aus Vorlagen an. Die wichtigsten für Webanwendungen:

  | Vorlage | Inhalt |
  |---|---|
  | `web` | Leeres Projekt mit **Minimal API**: Endpunkte werden direkt in `Program.cs` festgelegt. Wird in dieser Anleitung verwendet. |
  | `webapi` | REST-Schnittstelle mit Beispiel-Endpunkt und OpenAPI-Beschreibung |
  | `mvc` | Webanwendung nach dem Muster Model-View-Controller |
  | `webapp` | Webanwendung mit Razor Pages (eine Datei pro Seite) |
  | `blazor` | Interaktive Weboberfläche in C# statt JavaScript |

- **Nur HTTP:** Auf dem Entwicklungsrechner läuft die Anwendung hier über einfaches HTTP an `127.0.0.1`. HTTPS übernimmt im echten Betrieb meist ein vorgeschalteter Webserver wie [nginx](nginx.md).

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version des .NET SDK aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. .NET SDK installieren

Installiert den Befehl `dotnet`, den C#-Compiler, die Laufzeitumgebungen für .NET und ASP.NET Core sowie die Projektvorlagen. Ist es schon vorhanden (z. B. aus der Anleitung [Microsoft Visual Studio](visualstudio.md)), meldet `apt` das nur.

```bash
sudo apt install dotnet-sdk-10.0
```

**Prüfen:** In der Liste steht `Microsoft.AspNetCore.App 10.0…`, also die Laufzeitumgebung für ASP.NET Core.

```bash
dotnet --list-runtimes
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

## Erstes Projekt

### 4. Projekt anlegen

Erzeugt aus der Vorlage `web` ein leeres Projekt im Ordner `~/HalloWeb`. Beim allerersten Aufruf von `dotnet` erscheint einmalig ein Begrüßungstext.

```bash
dotnet new web -o ~/HalloWeb
```

### 5. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/HalloWeb
```

**Prüfen:** Es werden unter anderem `Program.cs` (der Programmcode), `HalloWeb.csproj` (die Projektbeschreibung) und `appsettings.json` (Einstellungen) angezeigt.

```bash
ls
```

### 6. Programmcode schreiben

Ersetzt `Program.cs` durch eine kleine REST-Schnittstelle für Notizen. Die wichtigsten Bausteine:

- `WebApplication.CreateBuilder` und `Build` – richten die Anwendung mit Webserver, Protokollierung und Einstellungen ein
- `MapGet`, `MapPost` – legen fest, welche Funktion eine Anfrage an eine Adresse beantwortet. Parameter wie `name` liest ASP.NET Core automatisch aus der Adresse, Objekte wie `eingabe` aus dem mitgeschickten JSON.
- Rückgabewerte werden automatisch in JSON umgewandelt. `Results.Created` antwortet zusätzlich mit dem HTTP-Status `201 Created`.
- `record` – eine kurze Schreibweise für einfache Datenklassen

Die Notizen liegen nur im Arbeitsspeicher und sind nach einem Neustart weg. Für dauerhafte Speicherung verwendet man eine Datenbank, siehe „Wie geht es weiter?“.

```bash
nano Program.cs
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Notizen nur im Arbeitsspeicher: Nach einem Neustart sind sie weg
var notizen = new List<Notiz>();

// GET /hallo?name=... liefert eine Begrüßung als JSON
app.MapGet("/hallo", (string? name) => new { gruss = $"Hallo {name ?? "Welt"}!" });

// GET /notizen liefert alle Notizen
app.MapGet("/notizen", () => notizen);

// POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
app.MapPost("/notizen", (NeueNotiz eingabe) =>
{
    var notiz = new Notiz(notizen.Count + 1, eingabe.Titel, DateTime.Now);
    notizen.Add(notiz);
    return Results.Created($"/notizen/{notiz.Id}", notiz);
});

app.Run();

// Datentypen: "record" ist eine kurze Schreibweise für einfache Datenklassen
record NeueNotiz(string Titel);
record Notiz(int Id, string Titel, DateTime Erstellt);
```

### 7. Projekt übersetzen

Übersetzt das Projekt und meldet Fehler im Code, ohne die Anwendung zu starten. Beim ersten Mal dauert das einige Sekunden länger.

```bash
dotnet build
```

**Prüfen:** Die Ausgabe endet mit `0 Warnung(en)` und `0 Fehler`.

## Starten und testen

### 8. Anwendung starten

`dotnet run` übersetzt das Projekt bei Bedarf und startet es. Ohne weitere Angabe würde die Anwendung auf einem zufällig bei der Projektanlage gewählten Port laufen (festgelegt in `Properties/launchSettings.json`). `--urls` legt stattdessen Adresse und Port fest: nur der eigene Rechner, Port `5000`. Das Terminal bleibt belegt, solange die Anwendung läuft.

```bash
dotnet run --urls http://127.0.0.1:5000
```

**Prüfen:** Die Ausgabe enthält `Now listening on: http://127.0.0.1:5000` und `Hosting environment: Development`.

### 9. Begrüßung abrufen

Öffne ein zweites Terminal und frage den ersten Endpunkt ab.

```bash
curl "http://localhost:5000/hallo?name=Thorsten"
```

**Prüfen:** Die Antwort lautet `{"gruss":"Hallo Thorsten!"}`.

### 10. Notiz anlegen

Schickt eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort an.

```bash
curl -i -X POST http://localhost:5000/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, darunter steht `Location: /notizen/1`. Die letzte Zeile enthält die Notiz mit `"id":1` und dem Erstellungszeitpunkt.

### 11. Alle Notizen abrufen

Fragt die Liste ab.

```bash
curl http://localhost:5000/notizen
```

**Prüfen:** Die Antwort ist eine Liste mit der Notiz aus dem vorigen Schritt.

### 12. Anwendung beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

**Tipp:** Statt `dotnet run` kannst du beim Entwickeln `dotnet watch run --urls http://127.0.0.1:5000` verwenden. Dann übernimmt die laufende Anwendung Änderungen am Code sofort, ohne dass du sie neu starten musst.

## Fertige Anwendung erstellen

### 13. Anwendung veröffentlichen

`publish` übersetzt das Projekt in der optimierten Einstellung `Release` und legt alles, was zum Betrieb nötig ist, in den Ordner `veroeffentlicht`. Auf dem Zielrechner muss dafür nur die ASP.NET-Core-Laufzeitumgebung installiert sein (Paket `aspnetcore-runtime-10.0`), nicht das ganze SDK.

```bash
dotnet publish -c Release -o veroeffentlicht
```

**Prüfen:** Im Ordner liegen unter anderem `HalloWeb` (das Startprogramm) und `HalloWeb.dll`.

```bash
ls veroeffentlicht
```

### 14. Veröffentlichte Anwendung starten

Startet die fertige Anwendung so, wie sie auch auf einem Server laufen würde.

```bash
./veroeffentlicht/HalloWeb --urls http://127.0.0.1:5000
```

**Prüfen:** Die Ausgabe enthält jetzt `Hosting environment: Production`. Im zweiten Terminal liefert `curl http://localhost:5000/hallo` die Antwort `{"gruss":"Hallo Welt!"}`. Mit <kbd>Strg</kbd>+<kbd>C</kbd> beendest du die Anwendung.

## Wie geht es weiter?

- **Datenbank:** Entity Framework Core bildet C#-Klassen auf Tabellen ab. Für [PostgreSQL](postgresql.md) fügst du mit `dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL` den passenden Treiber hinzu.
- **Betrieb:** Auf einem Server lässt man die veröffentlichte Anwendung als systemd-Dienst laufen und setzt [nginx](nginx.md) als Reverse Proxy davor, der auch HTTPS übernimmt.
- **Entwicklungsumgebung:** [VS Code](vscode.md) mit dem C# Dev Kit, siehe [Microsoft Visual Studio](visualstudio.md), oder JetBrains Rider.

## Deinstallieren

### 1. Projekt entfernen

Löscht den Projektordner samt übersetzter und veröffentlichter Dateien.

```bash
rm -rf ~/HalloWeb
```

### 2. Einstellung zur Nutzungsstatistik entfernen

Nur nötig, wenn du Schritt 3 ausgeführt hast.

```bash
nano ~/.bashrc
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `DOTNET_CLI_TELEMETRY_OPTOUT` und drücke <kbd>Enter</kbd>. Lösche die Zeile `export DOTNET_CLI_TELEMETRY_OPTOUT=1` mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 3. Optional: .NET SDK entfernen

Nur ausführen, wenn kein anderes Projekt .NET braucht.

```bash
sudo apt purge dotnet-sdk-10.0
```

```bash
sudo apt autoremove
```

### 4. Optional: Zwischenspeicher entfernen

`~/.dotnet` enthält Einstellungen des Befehls `dotnet`, `~/.nuget` heruntergeladene Bibliotheken. Andere .NET-Projekte laden sie bei Bedarf neu.

```bash
rm -rf ~/.dotnet ~/.nuget
```

**Prüfen:** Der Projektordner existiert nicht mehr.

```bash
ls ~/HalloWeb
```
