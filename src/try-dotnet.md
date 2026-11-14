# Try .NET

Try .NET war ein Microsoft-Projekt für ausführbare C#-Beispiele in Webseiten und interaktiver Markdown-Dokumentation.

## Projektstatus

**Try .NET wurde zum 31. Dezember 2025 eingestellt.** Das [offizielle Repository](https://github.com/dotnet/try) ist seit dem 3. Dezember 2025 archiviert. Deshalb gibt es hier keine Empfehlung für eine Neuinstallation als aktuelle Software auf Ubuntu 26.04.

Die historischen Anweisungen beziehen sich unter anderem auf .NET Core 3.0 und das globale Werkzeug `Microsoft.dotnet-try`. Sie sind keine bestätigte Installationsanleitung für das heutige Ubuntu und .NET 10. Die damalige Browserintegration und das lokale Markdown-Werkzeug waren zudem unterschiedliche Einsatzformen.

Für aktuelle Arbeiten im Buch eignen sich:

- [DotNetLab](dotnetlab.md), wenn du C#- und Razor-Code im Browser untersuchen möchtest.
- [Blazor WebAssembly](blazor-webassembly.md), wenn du eine eigene C#-Webanwendung bauen möchtest.
- [C#](csharp.md), wenn du Programme direkt unter Ubuntu entwickeln und ausführen möchtest.

## Vorhandene Altinstallation prüfen und entfernen

### 1. Globale .NET-Werkzeuge auflisten

Falls `dotnet` bereits installiert ist, zeigt dieser Befehl die globalen Werkzeuge des aktuellen Benutzerkontos. Suche nach `microsoft.dotnet-try`. Diese Prüfung benötigt keine neue Softwareinstallation und kein `sudo`.

```bash
dotnet tool list --global
```

### 2. Altes Werkzeug deinstallieren

Nur ausführen, wenn das Paket in der Liste steht. Entfernt das globale Try-.NET-Werkzeug dieses Benutzerkontos. Eigene Dokumentationen und Beispielprojekte bleiben erhalten.

```bash
dotnet tool uninstall --global Microsoft.dotnet-try
```

### 3. Entfernung kontrollieren

Der Paketname darf in der Liste nicht mehr erscheinen. Lokal über ein Toolmanifest installierte Fassungen werden davon nicht erfasst.

```bash
dotnet tool list --global
```

### 4. Optional: Lokales Toolmanifest prüfen

Führe den Befehl im Ordner einer vorhandenen interaktiven Dokumentation aus. Er listet die dort über ein Manifest verwalteten .NET-Werkzeuge auf.

```bash
dotnet tool list --local
```

### 5. Optional: Lokale Fassung entfernen

Nur ausführen, wenn das lokale Manifest `microsoft.dotnet-try` enthält. Ändert die Werkzeugkonfiguration dieses Projekts; die Markdown-Dateien werden nicht gelöscht.

```bash
dotnet tool uninstall --local Microsoft.dotnet-try
```
