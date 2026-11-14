# Blazor WebAssembly

Blazor WebAssembly ermöglicht Weboberflächen in C#, deren .NET-Code im Browser ausgeführt wird.

## Aufbau

Auf Ubuntu 26.04 LTS (amd64) wird das .NET-10-SDK über APT installiert. Damit erzeugst und baust du eine eigenständige Browseranwendung. Die Vorlage heißt `blazorwasm`; sie unterscheidet sich von der Vorlage `blazor` für Blazor Web Apps. Grundlage sind die [Microsoft-Anleitung für Ubuntu](https://learn.microsoft.com/en-us/dotnet/core/install/linux-ubuntu-install) und die [Blazor-Projektvorlagen](https://learn.microsoft.com/en-us/aspnet/core/blazor/tooling?view=aspnetcore-10.0).

Ein aktueller Browser genügt zur Benutzung der fertigen Anwendung. Docker und eine zusätzliche Datenbank werden nicht benötigt. Die Anwendung ist zunächst ein eigenes kleines Webprojekt, keine fertige Entwicklungsumgebung zum Ausführen beliebiger C#-Eingaben. Dafür siehe [DotNetLab](dotnetlab.md).

Das Erzeugen und Veröffentlichen des Beispielprojekts wurde mit dem .NET-10-SDK erfolgreich geprüft. Ein vollständiger Browserlauf auf Ubuntu 26.04 steht noch aus.

## Installation und erstes Projekt

### 1. Paketlisten aktualisieren

Damit Ubuntu die verfügbaren SDK-Pakete kennt.

```bash
sudo apt update
```

### 2. SDK und Prüfwerkzeuge installieren

Das SDK enthält Compiler und Vorlagen. Python dient später als einfacher lokaler HTTP-Server für die gebauten Dateien.

```bash
sudo apt install dotnet-sdk-10.0 python3 curl
```

### 3. SDK prüfen

In der Ausgabe muss ein SDK der Version 10.0 erscheinen. Ein zusätzlich installiertes SDK wird nicht entfernt.

```bash
dotnet --list-sdks
```

### 4. Projekt erzeugen

Erstellt eine eigenständige WebAssembly-Anwendung für .NET 10 mit Beispielseiten. Der Zielordner darf noch nicht existieren. Beim Wiederherstellen der Abhängigkeiten ist Internetzugang zu NuGet erforderlich.

```bash
dotnet new blazorwasm --framework net10.0 --output ~/blazor-wasm-uebung
```

### 5. In den Projektordner wechseln

Die weiteren Befehle beziehen sich auf dieses Projekt.

```bash
cd ~/blazor-wasm-uebung
```

### 6. Entwicklungsserver starten

Startet die Anwendung ausschließlich auf dem eigenen Rechner. `--no-launch-profile` verhindert, dass Einstellungen aus einer Startkonfiguration die hier gewählte Adresse ersetzen. Das Terminal bleibt belegt.

```bash
dotnet run --no-launch-profile --urls http://127.0.0.1:5080
```

### 7. Anwendung im Browser prüfen

Öffne diese Adresse. Rufe die Beispielseite **Counter** auf und klicke auf den Zählerknopf. Der angezeigte Wert muss steigen.

```text
http://127.0.0.1:5080
```

### 8. Entwicklungsserver beenden

Drücke im Serverterminal **Strg+C**. Damit kannst du das Projekt anschließend unabhängig vom Entwicklungsserver veröffentlichen.

## Statische Dateien erzeugen

### 9. Release-Ausgabe bauen

Erzeugt im Projektordner die auslieferbaren Dateien unter `ausgabe/wwwroot`. Für das normale Beispiel sind keine zusätzlichen `wasm-tools` erforderlich. Solche Build-Werkzeuge werden etwa für AOT-Kompilierung benötigt; siehe die [Microsoft-Dokumentation zu WebAssembly-Build-Werkzeugen](https://learn.microsoft.com/en-us/aspnet/core/blazor/webassembly-build-tools-and-aot?view=aspnetcore-10.0).

```bash
dotnet publish --configuration Release --output ./ausgabe
```

**Prüfen:** Die Ausgabe muss eine Startseite und den Ordner `_framework` enthalten.

```bash
ls ausgabe/wwwroot
```

### 10. Release-Ausgabe lokal bereitstellen

Der einfache HTTP-Server liefert nur die gebauten Dateien aus. Die Anwendung benötigt zum Ausführen im Browser keinen laufenden .NET-Anwendungsserver.

```bash
python3 -m http.server 5081 --bind 127.0.0.1 --directory ausgabe/wwwroot
```

### 11. Ausgelieferte Startseite prüfen

Öffne ein zweites Terminal. Erwartet wird der HTTP-Status `200`.

```bash
curl --fail --output /dev/null --write-out '%{http_code}\n' http://127.0.0.1:5081/
```

### 12. Fertige Anwendung im Browser prüfen

Öffne diese Adresse und teste den Zähler erneut. Erst das funktionierende Laden der Oberfläche und des .NET-Codes prüft die Anwendung vollständig; HTTP 200 allein genügt nicht.

```text
http://127.0.0.1:5081
```

Der Python-Server ist für diesen lokalen Test gedacht. Direktaufrufe interner Routen wie `/counter` können dort beim Neuladen mit HTTP 404 scheitern. Ein produktiver Webserver braucht dafür eine Weiterleitung unbekannter Anwendungsrouten an `index.html` sowie passende MIME-Typen und gegebenenfalls Kompressionsregeln. Die [Microsoft-Bereitstellungsanleitung](https://learn.microsoft.com/en-us/aspnet/core/blazor/host-and-deploy/webassembly/?view=aspnetcore-10.0) beschreibt diese Anforderungen.

### 13. Testserver beenden

Drücke im Python-Serverterminal **Strg+C**. Die Dateien unter `ausgabe/wwwroot` bleiben erhalten.

Clientseitige Dateien und Konfigurationen sind für Browserbenutzer einsehbar. Lege dort keine geheimen API-Schlüssel oder Datenbankzugänge ab.

## Deinstallieren

### 1. Laufende Testserver beenden

Drücke in noch laufenden Serverterminals **Strg+C**, damit das Projekt nicht mehr verwendet wird.

### 2. Projekt entfernen

Löscht Quellcode und Build-Ausgabe. Sichere eigene Änderungen vorher.

```bash
rm -rf -- ~/blazor-wasm-uebung
```

### 3. Optional: SDK entfernen

Führe dies nur aus, wenn keine anderen Projekte das über APT installierte .NET-10-SDK benötigen. Gemeinsam verwendete Laufzeiten und NuGet-Caches werden hier nicht pauschal gelöscht.

```bash
sudo apt remove dotnet-sdk-10.0
```

**Prüfen:** Die Ausgabe soll `Blazor-Projekt entfernt` lauten.

```bash
test ! -e ~/blazor-wasm-uebung && echo 'Blazor-Projekt entfernt'
```
