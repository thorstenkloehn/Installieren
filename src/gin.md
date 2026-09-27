# Gin

Gin ist das meistgenutzte Webframework für [Go](go.md). Es ergänzt den Webserver aus der Go-Standardbibliothek um Routen mit Platzhaltern, bequeme JSON-Antworten, die Prüfung eingehender Daten und fertige Bausteine für Protokoll und Fehlerbehandlung. Das Ergebnis ist ein einziges ausführbares Programm, das ohne weitere Laufzeitumgebung auf dem Server läuft.

## Vorbemerkungen

- **Go aus den Paketquellen:** Go kommt als Paket `golang-go` aus Ubuntu 26.04 (Go 1.26). Gin selbst ist eine Bibliothek, die `go` in jedes Projekt einzeln aus dem Internet lädt. Das Ubuntu-Paket `golang-github-gin-gonic-gin-dev` enthält nur die alte Version 1.8 und wird hier nicht verwendet.
- **Port 8000:** Gin würde ohne Angabe auf Port 8080 lauschen. Das Beispiel legt Port 8000 fest, weil 8080 oft schon belegt ist, etwa von Apache aus der [Tileserver-Anleitung](tileserver.md). Port 8000 darf nicht von einem anderen Programm belegt sein.
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [Express](express.md), [FastAPI](fastapi.md), [Flask](flask.md) und [Axum und Actix-web](rust-web.md). Die Notizen liegen nur im Arbeitsspeicher.
- **Version:** Getestet mit Gin **1.12.0** und Go 1.26.0 aus Ubuntu 26.04. Gin 1.12 braucht Go 1.25 oder neuer.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Go installieren

Ist Go aus der [Go-Anleitung](go.md) schon installiert, meldet `apt` das nur.

```bash
sudo apt install golang-go
```

**Prüfen:** Die Ausgabe lautet `go version go1.26.0 linux/amd64` oder nennt eine neuere Version 1.26.

```bash
go version
```

## Erstes Projekt

### 3. Projektordner anlegen

```bash
mkdir ~/hallo-gin
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/hallo-gin
```

### 5. Modul anlegen

Legt die Datei `go.mod` an. Sie enthält den Namen des Projekts und später die Liste der Bibliotheken.

```bash
go mod init hallo-gin
```

**Prüfen:** Die Ausgabe lautet `go: creating new go.mod: module hallo-gin`.

### 6. Gin herunterladen

Lädt Gin und alle Bibliotheken, die Gin selbst braucht, nach `~/go/pkg/mod` und trägt sie in `go.mod` ein. Die Prüfsummen landen in `go.sum`. So bekommt jeder, der das Projekt später übersetzt, genau dieselben Versionen.

```bash
go get github.com/gin-gonic/gin
```

**Prüfen:** Die Ausgabe enthält eine Zeile `go: added github.com/gin-gonic/gin v1.12.0` oder eine neuere Version. `go.mod` enthält danach die Zeile `go 1.25.0`, die Mindestversion, die Gin verlangt.

### 7. Anwendung schreiben

Legt die Datei `main.go` an. Die wichtigsten Bausteine:

- **Strukturen** (`type Notiz struct`) – beschreiben, wie die Daten aussehen. Die Angaben in Backticks wie `` `json:"titel"` `` legen den Feldnamen im JSON fest. `` `binding:"required"` `` macht `titel` beim Anlegen zur Pflicht.
- **`gin.Default()`** – erzeugt den Router samt Protokoll jeder Anfrage im Terminal und einem Schutz, der bei einem Programmfehler mit Status `500` antwortet, statt den Server abstürzen zu lassen.
- **`SetTrustedProxies(nil)`** – Gin soll keine Kopfzeilen wie `X-Forwarded-For` auswerten, die jeder Aufrufer fälschen kann. Ohne diese Zeile warnt Gin beim Start.
- **Routen** (`r.GET`, `r.POST`) – verbinden Adresse und Methode mit einer Funktion. `:id` ist ein Platzhalter, `c.Param("id")` liest ihn als Text.
- **`c`** (der Kontext) – enthält die Anfrage und baut die Antwort. `c.DefaultQuery` liest Werte aus der Adresse (`?name=…`), `c.ShouldBindJSON` den mitgeschickten JSON-Inhalt samt Prüfung, `c.JSON` antwortet mit Status und JSON. `gin.H` ist eine Kurzschreibweise für ein beliebiges JSON-Objekt.
- **`sync.Mutex`** – Gin bearbeitet Anfragen gleichzeitig. Die Sperre sorgt dafür, dass immer nur eine Anfrage die Liste der Notizen liest oder ändert.
- **`r.NoRoute`** – beantwortet alle unbekannten Adressen mit JSON.

```bash
nano main.go
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```go
package main

import (
	"net/http"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
)

// Notiz ist eine gespeicherte Notiz; die json-Angaben legen die Feldnamen im JSON fest
type Notiz struct {
	ID    int    `json:"id"`
	Titel string `json:"titel"`
}

// NotizNeu ist das, was man beim Anlegen schickt; titel ist Pflicht
type NotizNeu struct {
	Titel string `json:"titel" binding:"required"`
}

// Notizen nur im Arbeitsspeicher: Nach einem Neustart sind sie weg
var (
	notizen = []Notiz{}
	sperre  sync.Mutex // Anfragen laufen gleichzeitig, die Liste darf nur einer auf einmal ändern
)

func main() {
	r := gin.Default()

	// Keinem Proxy vertrauen: Die Adresse des Aufrufers kommt direkt aus der Verbindung
	r.SetTrustedProxies(nil)

	// GET /hallo?name=... liefert eine Begrüßung als JSON
	r.GET("/hallo", func(c *gin.Context) {
		name := c.DefaultQuery("name", "Welt")
		c.JSON(http.StatusOK, gin.H{"gruss": "Hallo " + name + "!"})
	})

	// GET /notizen liefert alle Notizen
	r.GET("/notizen", func(c *gin.Context) {
		sperre.Lock()
		defer sperre.Unlock()
		c.JSON(http.StatusOK, notizen)
	})

	// GET /notizen/1 liefert eine Notiz oder 404
	r.GET("/notizen/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"fehler": "Nummer ist keine Zahl"})
			return
		}
		sperre.Lock()
		defer sperre.Unlock()
		for _, n := range notizen {
			if n.ID == id {
				c.JSON(http.StatusOK, n)
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"fehler": "Notiz nicht gefunden"})
	})

	// POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
	r.POST("/notizen", func(c *gin.Context) {
		var daten NotizNeu
		if err := c.ShouldBindJSON(&daten); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"fehler": `Feld "titel" fehlt`})
			return
		}
		sperre.Lock()
		defer sperre.Unlock()
		n := Notiz{ID: len(notizen) + 1, Titel: daten.Titel}
		notizen = append(notizen, n)
		c.Header("Location", "/notizen/"+strconv.Itoa(n.ID))
		c.JSON(http.StatusCreated, n)
	})

	// Alle anderen Adressen: 404 als JSON
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"fehler": "Nicht gefunden"})
	})

	// Nur vom eigenen Rechner aus erreichbar, Port 8000
	r.Run("127.0.0.1:8000")
}
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Quelltext prüfen

`go vet` übersetzt den Code und sucht nach typischen Fehlern. Tippfehler oder fehlende Klammern fallen so auf, bevor der Server startet.

```bash
go vet ./...
```

**Prüfen:** Der Befehl gibt nichts aus. Meldet er Fehler, nennt er Datei und Zeile.

## Starten und testen

### 9. Server starten

`go run .` übersetzt das Projekt und startet es sofort. Beim ersten Mal dauert das einige Sekunden, weil Go auch Gin und alle Bibliotheken übersetzt. Das Terminal bleibt belegt, hier erscheint zu jeder Anfrage eine Zeile mit Status, Dauer und Adresse.

```bash
go run .
```

**Prüfen:** Die Ausgabe listet die vier Routen, z. B. `[GIN-debug] GET    /hallo`, und endet mit `[GIN-debug] Listening and serving HTTP on 127.0.0.1:8000`. Die Warnung `Running in "debug" mode` erklärt Schritt 13.

### 10. Notiz anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, weiter unten steht `Location: /notizen/1`, die letzte Zeile ist `{"id":1,"titel":"Erste Notiz"}`. Im ersten Terminal erscheint eine Zeile mit `201` und `POST     "/notizen"`.

### 11. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung:

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:8000/notizen` | `[{"id":1,"titel":"Erste Notiz"}]` |
| `curl http://localhost:8000/notizen/1` | `{"id":1,"titel":"Erste Notiz"}` |
| `curl "http://localhost:8000/hallo?name=Thorsten"` | `{"gruss":"Hallo Thorsten!"}` |
| `curl http://localhost:8000/notizen/7` | `{"fehler":"Notiz nicht gefunden"}` (Status 404) |
| `curl http://localhost:8000/notizen/abc` | `{"fehler":"Nummer ist keine Zahl"}` (Status 400) |
| `curl http://localhost:8000/gibtsnicht` | `{"fehler":"Nicht gefunden"}` (Status 404) |
| `curl -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{}'` | `{"fehler":"Feld \"titel\" fehlt"}` (Status 400) |

Den fehlenden Titel erkennt `ShouldBindJSON` an der Angabe `binding:"required"` in der Struktur `NotizNeu`. Dieselbe Antwort kommt, wenn der Inhalt gar kein gültiges JSON ist.

### 12. Änderung mit Neustart ausprobieren

Go ist eine übersetzte Sprache. Änderungen am Code wirken erst, wenn das Programm neu übersetzt und gestartet wird. Ändere in `main.go` das Wort `Hallo` in der Route `/hallo` z. B. in `Servus` und speichere die Datei. Drücke im ersten Terminal <kbd>Strg</kbd>+<kbd>C</kbd> und starte den Server neu:

```bash
go run .
```

**Prüfen:** `curl http://localhost:8000/hallo` liefert jetzt `{"gruss":"Servus Welt!"}`. Die Notizen aus Schritt 10 sind durch den Neustart verloren, weil sie nur im Arbeitsspeicher lagen. Diesmal startet der Server fast sofort, weil Go übersetzte Bibliotheken in `~/.cache/go-build` aufbewahrt.

### 13. Eigenständiges Programm erzeugen

Beende den Server mit <kbd>Strg</kbd>+<kbd>C</kbd>. `go build` übersetzt das Projekt in eine einzige Programmdatei `hallo-gin`, die Gin und alle Bibliotheken enthält. Auf einem Server braucht sie weder Go noch den Quelltext.

```bash
go build
```

**Prüfen:** Die Datei `hallo-gin` ist rund 30 MB groß.

```bash
ls -lh hallo-gin
```

### 14. Programm im Release-Modus starten

Im Debug-Modus schreibt Gin beim Start Hinweise und die Liste aller Routen ins Terminal. `GIN_MODE=release` schaltet das ab, so wie man das Programm später auf einem Server betreibt. Das Protokoll der einzelnen Anfragen bleibt.

```bash
GIN_MODE=release ./hallo-gin
```

**Prüfen:** Das Terminal bleibt leer, bis die erste Anfrage kommt. `curl http://localhost:8000/notizen` liefert `[]`, im Terminal erscheint eine Zeile mit `200` und `GET      "/notizen"`.

### 15. Server beenden

Drücke im ersten Terminal <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Gruppen:** `api := r.Group("/api")` fasst Routen unter einem gemeinsamen Anfang zusammen. `api.GET("/notizen", …)` ist dann unter `/api/notizen` erreichbar.
- **Mehr Prüfungen:** Die Angabe `binding` kennt weitere Regeln, z. B. `` `binding:"required,max=200"` `` oder `email`. Den genauen Grund liefert `err.Error()`.
- **Datenbank:** Für [PostgreSQL](postgresql.md) gibt es die Bibliothek `github.com/jackc/pgx/v5`, für SQLite `modernc.org/sqlite`. Beide lädt man mit `go get` wie Gin in Schritt 6.
- **Automatischer Neustart:** Werkzeuge wie `air` (`go install github.com/air-verse/air@latest`) beobachten die Dateien und starten den Server bei jeder Änderung neu. Dafür muss `~/go/bin` im Suchpfad stehen, siehe [Go-Anleitung](go.md).
- **Betrieb:** Auf einem Server kopiert man nur die Datei `hallo-gin` hin und startet sie mit `GIN_MODE=release` über einen systemd-Dienst (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage). Davor setzt man [nginx](nginx.md), der auch HTTPS übernimmt.

## Deinstallieren

### 1. Server beenden

Läuft `go run .` oder `./hallo-gin` noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projekt entfernen

Löscht den Projektordner samt Programmdatei.

```bash
rm -rf ~/hallo-gin
```

### 3. Heruntergeladene Bibliotheken löschen (optional)

Gin und seine Bibliotheken liegen weiter in `~/go/pkg/mod`. Dieser Befehl löscht den ganzen Ordner. Das betrifft alle Go-Projekte, die ihre Bibliotheken dann beim nächsten Übersetzen neu laden.

```bash
go clean -modcache
```

### 4. Go entfernen (optional)

Nur ausführen, wenn du Go nicht mehr brauchst. Die weiteren Schritte zum vollständigen Entfernen stehen in der [Go-Anleitung](go.md).

```bash
sudo apt purge golang-go
```

**Prüfen:** Die Shell meldet, dass der Befehl `go` nicht gefunden wurde.

```bash
go version
```
