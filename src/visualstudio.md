# Microsoft Visual Studio

Microsoft Visual Studio ist eine umfangreiche Entwicklungsumgebung von Microsoft, vor allem für C#, .NET und C++. Diese Seite erklärt, warum sie unter Ubuntu nicht installiert werden kann, und richtet stattdessen eine gleichwertige Arbeitsumgebung für C# und .NET ein.

## Vorbemerkungen

- **Nur für Windows:** Visual Studio (2022 und neuer) gibt es ausschließlich für Windows. Die Mac-Version hat Microsoft im August 2024 eingestellt, eine Linux-Version gab es nie. Auch mit Wine lässt sich Visual Studio nicht sinnvoll betreiben.
- **Nicht verwechseln:** [Visual Studio Code](vscode.md) ist ein anderes, deutlich schlankeres Programm. Es läuft unter Ubuntu und ist die von Microsoft empfohlene Lösung für .NET-Entwicklung unter Linux.
- **Der Ersatz:** Diese Anleitung installiert das **.NET SDK** aus den Ubuntu-Paketquellen und die Erweiterung **C# Dev Kit** für VS Code. Damit stehen Projektverwaltung, Codevervollständigung, Debugger und Testausführung ähnlich wie in Visual Studio zur Verfügung.
- **Lizenz des C# Dev Kit:** Für Privatpersonen, Ausbildung und Open-Source-Projekte kostenlos. Für die Arbeit in Unternehmen gelten dieselben Bedingungen wie bei Visual Studio Community, größere Firmen brauchen also ein Visual-Studio-Abo.
- **Voraussetzung:** VS Code ist installiert, siehe [Anleitung Visual Studio Code](vscode.md).

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version des .NET SDK aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. .NET SDK installieren

Das SDK enthält den C#-Compiler, die Laufzeitumgebung und den Befehl `dotnet`, mit dem Projekte angelegt, gebaut und gestartet werden. Ubuntu stellt die aktuelle Version mit Langzeitunterstützung (.NET 10) selbst bereit, ein Paketarchiv von Microsoft ist nicht nötig.

```bash
sudo apt install dotnet-sdk-10.0
```

**Prüfen:** Die Ausgabe ist eine Versionsnummer, die mit `10.0` beginnt.

```bash
dotnet --version
```

### 3. C# Dev Kit in VS Code installieren

Installiert die Erweiterung, die VS Code um die Visual-Studio-ähnlichen Funktionen für C# ergänzt. Die benötigte Grunderweiterung **C#** wird automatisch mitinstalliert.

```bash
code --install-extension ms-dotnettools.csdevkit
```

**Prüfen:** In der Liste erscheinen `ms-dotnettools.csdevkit` und `ms-dotnettools.csharp`.

```bash
code --list-extensions | grep ms-dotnettools
```

## Erste Schritte

### 4. Testprojekt anlegen

Legt im Home-Verzeichnis ein kleines Konsolenprogramm im Ordner `HalloDotnet` an. Beim ersten Aufruf von `dotnet` erscheint einmalig ein Begrüßungstext.

```bash
dotnet new console -o ~/HalloDotnet
```

### 5. Testprojekt ausführen

Übersetzt das Programm und startet es. So siehst du, dass das SDK funktioniert.

```bash
dotnet run --project ~/HalloDotnet
```

**Prüfen:** Die Ausgabe lautet `Hello, World!`.

### 6. Projekt in VS Code öffnen

Öffnet den Projektordner in VS Code. Das C# Dev Kit erkennt das Projekt automatisch.

```bash
code ~/HalloDotnet
```

Beim ersten Öffnen fragt VS Code, ob du den Autoren des Ordners vertraust: mit „Ja“ bestätigen. Das C# Dev Kit bittet eventuell um eine Anmeldung mit einem Microsoft-Konto. Für die private Nutzung ist das nicht nötig, die Meldung kann geschlossen werden.

**Prüfen:** Links in der Seitenleiste erscheint der Bereich **Projektmappen-Explorer** (bzw. **Solution Explorer**) mit dem Projekt `HalloDotnet`.

### 7. Programm im Debugger starten

Öffne die Datei `Program.cs`, klicke links neben die Zeilennummer der Zeile mit `Console.WriteLine`, um einen Haltepunkt (roter Punkt) zu setzen, und drücke <kbd>F5</kbd>. Wählt VS Code nach einem Debugger, nimm **C#**.

**Prüfen:** Das Programm hält am Haltepunkt an, die Zeile ist gelb hinterlegt. Mit <kbd>F5</kbd> läuft es weiter.

### 8. Die wichtigsten Tastenkürzel für C# kennenlernen

| Tasten | Wirkung |
|---|---|
| <kbd>F5</kbd> | Programm im Debugger starten bzw. fortsetzen |
| <kbd>Strg</kbd>+<kbd>F5</kbd> | Programm ohne Debugger starten |
| <kbd>F9</kbd> | Haltepunkt setzen oder entfernen |
| <kbd>F10</kbd> / <kbd>F11</kbd> | Im Debugger: nächste Zeile / in Methode hineinspringen |
| <kbd>F12</kbd> | Zur Definition springen |
| <kbd>Strg</kbd>+<kbd>.</kbd> | Lösungsvorschläge für die markierte Stelle anzeigen |
| <kbd>F2</kbd> | Umbenennen (überall im Projekt) |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>B</kbd> | Projekt bauen |

## Weitere Alternativen

- **JetBrains Rider:** Eine vollwertige .NET-IDE, die Visual Studio in Aufbau und Umfang am nächsten kommt. Für nicht-kommerzielle Nutzung kostenlos, als Snap `rider` verfügbar.
- **Windows in einer virtuellen Maschine:** Wer zwingend Visual Studio selbst braucht (z. B. für Windows-Forms-Designer oder C++ mit MSVC), kann Windows in einer virtuellen Maschine (z. B. mit GNOME Boxes oder VirtualBox) installieren. Dafür ist eine Windows-Lizenz nötig.

## Aktualisieren

Das .NET SDK wird mit den anderen Paketen aktualisiert:

```bash
sudo apt update
```

```bash
sudo apt upgrade
```

Erweiterungen in VS Code aktualisieren sich automatisch.

## Deinstallieren

### 1. C#-Erweiterungen entfernen

Entfernt das C# Dev Kit aus VS Code.

```bash
code --uninstall-extension ms-dotnettools.csdevkit
```

Entfernt die Grunderweiterung C#, die mitinstalliert wurde.

```bash
code --uninstall-extension ms-dotnettools.csharp
```

### 2. Hilfserweiterung entfernen

Das C# Dev Kit hat zusätzlich eine Hilfserweiterung installiert, die .NET-Laufzeiten für VS Code verwaltet.

```bash
code --uninstall-extension ms-dotnettools.vscode-dotnet-runtime
```

**Prüfen:** Die Ausgabe ist leer.

```bash
code --list-extensions | grep ms-dotnettools
```

### 3. .NET SDK entfernen

`purge` entfernt auch die Konfigurationsdateien des Pakets.

```bash
sudo apt purge dotnet-sdk-10.0
```

### 4. Nicht mehr benötigte Pakete entfernen

Entfernt Laufzeitumgebung und weitere Pakete, die nur für das SDK installiert wurden.

```bash
sudo apt autoremove
```

### 5. Zwischenspeicher und Testprojekt entfernen

`~/.dotnet` enthält Einstellungen des `dotnet`-Befehls, `~/.nuget` heruntergeladene Programmbibliotheken. **Achtung:** Der letzte Ordner ist das Testprojekt aus Schritt 4, prüfe vorher, dass du nichts Eigenes darin gespeichert hast.

```bash
rm -rf ~/.dotnet ~/.nuget ~/HalloDotnet
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
dotnet --version
```
