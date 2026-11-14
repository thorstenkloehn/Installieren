# DotNetLab

DotNetLab, auch .NET Lab beziehungsweise Razor Lab genannt, ist eine Browserumgebung zum Untersuchen und Ausführen von C#- und Razor-Beispielen.

## Aufbau und Versionen

Gemeint ist das Projekt [jjonescz/DotNetLab](https://github.com/jjonescz/DotNetLab), dessen öffentliche Webfassung unter [lab.razor.fyi](https://lab.razor.fyi/) läuft. Diese Anleitung baut die WebAssembly-Fassung selbst unter Ubuntu 26.04 LTS (amd64) und stellt sie nur lokal bereit. Docker ist nicht erforderlich.

Der hier dokumentierte [Quellstand 3a274eb](https://github.com/jjonescz/DotNetLab/tree/3a274eb08b61c58042a64405f9a182aaa98ce4c6) verlangt laut `global.json` das SDK `11.0.100-rc.2.26504.105` und einen festgelegten Workload-Stand. Die `.nvmrc` verlangt Node.js 24. Ubuntu 26.04 liefert regulär .NET 10 und Node.js 22; diese allein reichen für diesen Quellstand nicht aus. Ein neueres stabiles SDK wird hier nicht ungeprüft anstelle der Projektvorgabe verwendet.

Deshalb kommen die Systemvoraussetzungen aus APT und die projektspezifischen Werkzeuge in Unterordner des Projekts. Es handelt sich um einen Entwickleraufbau mit einem Vorab-SDK, nicht um eine fertige Ubuntu-Desktop-Anwendung. Für den Download von SDK, Workloads, npm- und NuGet-Paketen benötigst du Internetzugang und mehrere GB freien Speicher. Die vollständige Installation wurde hier nicht praktisch durchlaufen.

## System vorbereiten

### 1. Paketlisten aktualisieren

Damit Ubuntu die verfügbaren Paketversionen kennt.

```bash
sudo apt update
```

### 2. Grundwerkzeuge installieren

Das APT-SDK stellt eine regulär verwaltete .NET-Installation samt Systemabhängigkeiten bereit. Der spezielle Projektbuild verwendet später zusätzlich sein eigenes SDK. Compilerwerkzeuge werden für den WebAssembly-Build benötigt; Python stellt die fertigen Dateien lokal bereit.

```bash
sudo apt install dotnet-sdk-10.0 build-essential git curl ca-certificates python3 xz-utils
```

### 3. Ins Home-Verzeichnis wechseln

Der Projektordner wird im Benutzerkonto angelegt.

```bash
cd ~
```

### 4. Quellcode herunterladen

Der Zielordner darf noch nicht existieren.

```bash
git clone https://github.com/jjonescz/DotNetLab.git dotnetlab-lokal
```

### 5. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/dotnetlab-lokal
```

### 6. Dokumentierten Quellstand auswählen

Damit passen SDK-Auswahl, Build-Einstellungen und Projektdateien zu dieser Anleitung.

```bash
git checkout --detach 3a274eb08b61c58042a64405f9a182aaa98ce4c6
```

## Projektwerkzeuge im Benutzerkonto einrichten

### 7. Microsoft-Installationsskript herunterladen

Der [offizielle Installationsweg per Skript](https://learn.microsoft.com/en-us/dotnet/core/install/linux-scripted-manual) kann eine bestimmte SDK-Version ohne Administratorrechte installieren. Hier wird das Skript zunächst als Datei gespeichert.

```bash
curl --fail --location https://dot.net/v1/dotnet-install.sh --output dotnet-install.sh
```

### 8. SDK laut Projektdatei installieren

Python liest die Versionsnummer aus `global.json`. Das SDK wird ausschließlich unter `.dotnet-sdk` abgelegt. Falls der Hersteller diesen Vorab-Build nicht mehr bereitstellt, muss ein anderer, zusammen mit dem Projekt getesteter Quellstand gewählt werden; bloßes Ändern der Versionsnummer ist keine bestätigte Lösung.

```bash
bash ./dotnet-install.sh --version "$(python3 -c 'import json; print(json.load(open("global.json"))["sdk"]["version"])')" --install-dir "$PWD/.dotnet-sdk"
```

### 9. Projekt-SDK für dieses Terminal auswählen

Teilt .NET mit, wo die getrennte SDK-Installation liegt.

```bash
export DOTNET_ROOT="$PWD/.dotnet-sdk"
```

### 10. Projekt-SDK in den Suchpfad aufnehmen

Damit verwendet der Befehl `dotnet` in diesem Terminal das lokale SDK.

```bash
export PATH="$DOTNET_ROOT:$PATH"
```

**Prüfen:** Erwartet wird die Version `11.0.100-rc.2.26504.105`.

```bash
dotnet --version
```

### 11. Node-Versionsverwaltung projektlokal laden

Die offizielle [nvm-Versionsverwaltung](https://github.com/nvm-sh/nvm) installiert das benötigte Node.js im Benutzerkonto. Der eigene Unterordner verhindert, dass eine vorhandene nvm-Installation überschrieben wird. Diese Alternative ist hier nötig, weil die Node-Version aus den Ubuntu-26.04-Paketquellen von der Projektvorgabe abweicht.

```bash
git clone --depth 1 --branch v0.40.3 https://github.com/nvm-sh/nvm.git .nvm
```

### 12. Lokales nvm-Verzeichnis festlegen

Alle über diese nvm-Instanz geladenen Versionen werden im Projekt gespeichert.

```bash
export NVM_DIR="$PWD/.nvm"
```

### 13. nvm im Terminal laden

Stellt die Funktion `nvm` für die aktuelle Bash-Sitzung bereit.

```bash
source "$NVM_DIR/nvm.sh"
```

### 14. Node.js laut Projektvorgabe installieren

nvm liest die `.nvmrc`, installiert eine passende Node.js-24-Version und aktiviert sie. npm wird mitgeliefert.

```bash
nvm install
```

**Prüfen:** Die Ausgabe muss mit `v24.` beginnen.

```bash
node --version
```

### 15. WebAssembly-Workloads installieren

Installiert die beiden vom Projekt genannten Workloads in das schreibbare lokale SDK. Die Workload-Version wird durch `global.json` vorgegeben. Hier ist kein `sudo` erforderlich; installiere diese Vorab-Workloads nicht unbeabsichtigt in das systemweite APT-SDK.

```bash
dotnet workload install wasm-tools wasm-experimental
```

**Prüfen:** Beide Workloads sollen in der Liste erscheinen.

```bash
dotnet workload list
```

## Webfassung bauen und starten

### 16. WebAssembly-Projekt veröffentlichen

Der Build lädt NuGet-Abhängigkeiten und baut über npm die Editorbestandteile. Die gezielte Projektauswahl vermeidet einen unnötigen Android- oder Windows-Build. `-noAutoResponse` entspricht dem Workaround im [Projekt-Buildskript](https://github.com/jjonescz/DotNetLab/blob/3a274eb08b61c58042a64405f9a182aaa98ce4c6/eng/build.sh).

```bash
dotnet publish src/WebAssembly/WebAssembly.csproj --configuration Release --output "$PWD/ausgabe" -noAutoResponse
```

### 17. Ausgabe mit der Projektprüfung kontrollieren

Das mitgelieferte Prüfprogramm kontrolliert unter anderem, ob `index.html` im Service-Worker-Manifest enthalten ist. Erwartet wird eine Meldung mit `OK`.

```bash
dotnet run --file eng/check-publish-output.cs -- ausgabe
```

### 18. Dateien lokal bereitstellen

Startet einen einfachen Testserver auf Loopback. Die eigentliche C#-Ausführung dieser Fassung findet im Browser statt. Der Serverprozess bleibt im Terminal aktiv.

```bash
python3 -m http.server 5082 --bind 127.0.0.1 --directory ausgabe/wwwroot
```

### 19. Oberfläche im Browser öffnen

Öffne diese Adresse. Beim ersten Start können Compilerbestandteile und weitere Ressourcen nachgeladen werden; eine lokal ausgelieferte Startseite bedeutet deshalb noch keinen garantierten Offline-Betrieb.

```text
http://127.0.0.1:5082
```

### 20. C#-Ausführung prüfen

Wähle den C#-Modus und gib dieses eigene Beispiel ein. Verwende die Ausführungsfunktion beziehungsweise die Konsolenausgabe der Oberfläche. Erwartet wird `42`.

```csharp
System.Console.WriteLine(6 * 7);
```

Prüfe zusätzlich eine Compileransicht, etwa IL oder Syntaxbaum. Eine Antwort des HTTP-Servers allein bestätigt noch nicht, dass Compiler, Worker und WebAssembly korrekt geladen wurden. Verwende für diesen Versuch nur eigenen Code und stelle ihn nicht als öffentlichen Ausführungsdienst bereit.

### 21. Testserver beenden

Drücke im Serverterminal **Strg+C**. Nach einem neuen Terminalstart musst du für einen erneuten Build die Schritte 5 und 9 bis 13 sowie `nvm use` wiederholen. Zum bloßen Bereitstellen einer bestehenden Ausgabe genügt Schritt 18 aus dem Projektordner.

## Deinstallieren

### 1. Testserver beenden

Drücke in seinem Terminal **Strg+C**, falls er noch läuft.

### 2. Neues Terminal öffnen

Ein neues Terminal verwendet wieder seine normale Werkzeugauswahl. So arbeitest du nach dem Löschen nicht versehentlich mit Pfaden auf die projektlokalen Werkzeuge weiter.

### 3. Projekt und eigene Werkzeuge entfernen

Löscht Quellcode, Ausgabe, das projektspezifische SDK und die dort installierte Node-Version. Sichere eigene Beispiele vorher. Gemeinsame NuGet-Caches im Benutzerkonto bleiben erhalten.

```bash
rm -rf -- ~/dotnetlab-lokal
```

### 4. Optional: Browserdaten entfernen

Entferne in den Browsereinstellungen die Websitedaten für `http://127.0.0.1:5082`, wenn du auch PWA-Caches und dort gespeicherte Einstellungen löschen möchtest.

### 5. Entfernung prüfen

Die Ausgabe soll `DotNetLab-Projekt entfernt` lauten. Das reguläre APT-SDK bleibt für andere C#-Projekte installiert; seine optionale Entfernung ist in der [Blazor-Anleitung](blazor-webassembly.md#deinstallieren) beschrieben.

```bash
test ! -e ~/dotnetlab-lokal && echo 'DotNetLab-Projekt entfernt'
```
