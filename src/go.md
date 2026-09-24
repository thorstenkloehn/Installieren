# Go

Go ist eine von Google entwickelte, bewusst einfach gehaltene Programmiersprache, die schnell übersetzt und eigenständige Programme ohne Abhängigkeiten erzeugt. Sie ist besonders beliebt für Netzwerkdienste, Kommandozeilenwerkzeuge und Cloud-Software wie Docker oder Kubernetes.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **Go 1.26** im Paket `golang-go`. Das Paket enthält den Befehl `go`, der übersetzt, testet, formatiert und Abhängigkeiten verwaltet.
- **Module:** Jedes Go-Projekt ist ein **Modul** mit einer Datei `go.mod`. Darin stehen der Name des Moduls und die benötigten Bibliotheken. Fremde Bibliotheken lädt `go` selbst aus dem Internet; ein eigener Paketmanager ist nicht nötig.
- **Ordner `~/go`:** Heruntergeladene Bibliotheken landen in `~/go/pkg/mod`, mit `go install` installierte Programme in `~/go/bin`.
- **Neuere Version:** Wer eine neuere Version als die von Ubuntu braucht, kann Go zusätzlich von der offiziellen Downloadseite nach `/usr/local/go` entpacken. Für den Einstieg reicht die apt-Version.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Go installieren

Installiert den Go-Compiler mit allen Werkzeugen und der Standardbibliothek.

```bash
sudo apt install golang-go
```

**Prüfen:** Die Ausgabe lautet z. B. `go version go1.26… linux/amd64`. Steht dort eine andere Version, liegt noch eine ältere Installation in `/usr/local/go`, die im Suchpfad zuerst gefunden wird.

```bash
go version
```

### 3. Ordner für installierte Programme in den Suchpfad aufnehmen

Programme, die später mit `go install` installiert werden, liegen in `~/go/bin`. Damit die Shell sie findet, kommt dieser Ordner in den Suchpfad. Danach ein neues Terminal öffnen.

```bash
nano ~/.bashrc
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei und füge in einer eigenen Zeile an (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```bash
export PATH="$PATH:$HOME/go/bin"
```

**Prüfen:** Im neuen Terminal enthält die Ausgabe `/go/bin`.

```bash
echo $PATH
```

## Erstes Programm

### 4. Projektordner anlegen

Ein eigener Ordner für das Übungsprojekt.

```bash
mkdir -p ~/hallo-go
```

### 5. In den Ordner wechseln

Alle folgenden Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/hallo-go
```

### 6. Modul anlegen

Erzeugt die Datei `go.mod`. Der Name `beispiel/hallo` ist frei wählbar; bei veröffentlichten Projekten nimmt man meist die Adresse des Repositorys, z. B. `github.com/name/projekt`.

```bash
go mod init beispiel/hallo
```

**Prüfen:** Die Meldung lautet `go: creating new go.mod: module beispiel/hallo`.

### 7. Quelltext anlegen

Legt `main.go` an. Das Programm nummeriert eine Liste und gibt sie danach in einer Zeile aus. Go rückt mit Tabulatoren ein; das Werkzeug `gofmt` sorgt später automatisch dafür.

```bash
nano main.go
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	sprachen := []string{"Go", "Rust", "PHP", "Kotlin", "TypeScript"}

	for i, s := range sprachen {
		fmt.Printf("%d. %s\n", i+1, s)
	}
	fmt.Println("Alle:", strings.Join(sprachen, ", "))
}
```

### 8. Programm starten

`go run .` übersetzt das Modul im aktuellen Ordner in einen temporären Ordner und startet es sofort.

```bash
go run .
```

**Prüfen:** Die Ausgabe lautet:

```text
1. Go
2. Rust
3. PHP
4. Kotlin
5. TypeScript
Alle: Go, Rust, PHP, Kotlin, TypeScript
```

### 9. Eigenständiges Programm erzeugen

`go build` erzeugt die Datei `hallo` (benannt nach dem letzten Teil des Modulnamens). Sie enthält alles Nötige und läuft auch auf Rechnern ohne Go.

```bash
go build
```

**Prüfen:** Das Programm liefert dieselbe Ausgabe wie in Schritt 8.

```bash
./hallo
```

### 10. Quelltext prüfen und formatieren

`go vet` sucht nach typischen Fehlern, `gofmt -l .` listet Dateien auf, die nicht einheitlich formatiert sind. Mit `gofmt -w .` werden sie korrigiert.

```bash
go vet ./... && gofmt -l .
```

**Prüfen:** Beide Befehle geben nichts aus – der Code ist in Ordnung.

## Wie geht es weiter?

- **Bibliotheken:** `go get <Adresse>` fügt eine Bibliothek zu `go.mod` hinzu, z. B. `go get github.com/google/uuid`. `go mod tidy` räumt nicht mehr benutzte Einträge auf.
- **Tests:** Dateien mit der Endung `_test.go` enthalten Tests; `go test ./...` führt alle aus.
- **Andere Systeme:** Go übersetzt ohne weitere Werkzeuge auch für andere Plattformen, z. B. `GOOS=windows GOARCH=amd64 go build` für Windows.
- **Editor:** [Visual Studio Code](vscode.md) mit der Erweiterung „Go“ bietet Autovervollständigung über das Werkzeug `gopls`, das die Erweiterung auf Nachfrage selbst installiert. In [Neovim](neovim.md) lässt sich `gopls` ebenfalls einbinden.

## Deinstallieren

### 1. Übungsprojekt entfernen

Löscht den Projektordner.

```bash
rm -rf ~/hallo-go
```

### 2. Heruntergeladene Bibliotheken löschen

Go legt Bibliotheken schreibgeschützt ab, damit sie nicht versehentlich verändert werden. Deshalb nicht mit `rm`, sondern mit diesem Befehl entfernen. Er muss **vor** Schritt 4 laufen, solange `go` noch installiert ist.

```bash
go clean -modcache
```

### 3. Zwischenspeicher und Go-Ordner löschen

Entfernt die Übersetzungszwischenstände und den nun leeren Ordner `~/go` samt `~/go/bin`.

```bash
rm -rf ~/go ~/.cache/go-build
```

### 4. Go entfernen

Entfernt das Paket `golang-go`.

```bash
sudo apt purge golang-go
```

### 5. Nicht mehr benötigte Abhängigkeiten entfernen

Räumt die eigentlichen Versionspakete (z. B. `golang-1.26-go`) auf, die mit `golang-go` installiert wurden.

```bash
sudo apt autoremove
```

### 6. Suchpfad-Eintrag entfernen

Löscht die Zeile aus Schritt 3 der Installation wieder aus `~/.bashrc`.

```bash
nano ~/.bashrc
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `go/bin` und drücke <kbd>Enter</kbd>. Lösche die Zeile `export PATH="$PATH:$HOME/go/bin"` mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Meldung lautet `go: Befehl nicht gefunden` bzw. `command not found`.

```bash
go version
```
