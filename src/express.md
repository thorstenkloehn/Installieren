# Express.js

Express ist das bekannteste Web-Framework für Node.js. Es ist bewusst klein gehalten: Es kümmert sich um Adressen (Routen), Anfragen und Antworten und lässt sich über **Middleware** beliebig erweitern. Damit baut man in JavaScript Webserver und REST-Schnittstellen.

## Vorbemerkungen

- **Installation pro Projekt:** Express wird mit `npm` in jedes Projekt einzeln installiert. Aus den Ubuntu-Paketquellen kommen nur Node.js und npm. Ubuntu enthält zwar auch ein Paket `node-express` (Version 5.1), es hinkt der aktuellen Version aber hinterher und wird in `package.json` nicht vermerkt. Ein Projekt, das darauf aufbaut, lässt sich deshalb nicht ohne Weiteres auf einen anderen Rechner übertragen.
- **Version:** Express 5.2. Gegenüber Express 4, das noch in vielen Beispielen im Netz steht, gibt es kleine Änderungen, etwa bei Mustern in Adressen und der Behandlung von Fehlern in `async`-Funktionen.
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [ASP.NET Core](aspnet-core.md) und [Axum und Actix-web](rust-web.md).

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Node.js und npm aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt den Server aus, `npm` lädt Express herunter. Ist beides schon vorhanden (z. B. aus der [Docusaurus-Anleitung](docusaurus.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Versionsnummer beginnt mit `v18` oder höher, z. B. `v22.22.1`. Express 5 braucht mindestens Node.js 18.

```bash
node --version
```

## Erstes Projekt

### 3. Projektordner anlegen

Ein eigener Ordner für das Projekt.

```bash
mkdir ~/hallo-express
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/hallo-express
```

### 5. Projekt anlegen

Legt die Datei `package.json` an. Darin hält npm fest, welche Pakete das Projekt braucht. `-y` übernimmt alle Vorgaben, ohne nachzufragen.

```bash
npm init -y
```

### 6. Moderne Modul-Schreibweise einschalten

Erlaubt im Code die Schreibweise `import … from …`, die heute in JavaScript üblich ist.

```bash
npm pkg set type=module
```

### 7. Express installieren

Lädt Express mit seinen Abhängigkeiten in den Ordner `node_modules` (etwa 4 MB) und trägt es in `package.json` ein.

```bash
npm install express
```

**Prüfen:** Die Ausgabe zeigt `express@5.2.1` (oder eine neuere 5er-Version).

```bash
npm ls
```

### 8. Server schreiben

Legt die Datei `server.js` an. Die wichtigsten Bausteine:

- **Middleware** (`app.use`) – Funktionen, die jede Anfrage der Reihe nach durchläuft, bevor eine Route sie beantwortet. `express.json()` liest mitgeschickte JSON-Inhalte in `req.body` ein. Die eigene Middleware darunter schreibt jede Anfrage ins Terminal und reicht sie mit `next()` weiter.
- **Routen** (`app.get`, `app.post`) – legen fest, welche Funktion welche Adresse und Methode beantwortet. `req` enthält die Anfrage (z. B. `req.query` für Werte aus der Adresse), mit `res` wird geantwortet.
- `res.json()` wandelt ein Objekt in JSON um, `res.status()` setzt den HTTP-Status, z. B. `201 Created` oder `400 Bad Request`.
- Die letzte Middleware fängt alle Adressen ab, für die es keine Route gibt, und antwortet mit `404` als JSON.
- `app.listen(3000, '127.0.0.1', …)` – nur vom eigenen Rechner aus erreichbar, auf Port 3000. Ohne die Adresse wäre der Server aus dem ganzen Netz erreichbar.

```bash
nano server.js
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```javascript
import express from 'express'

const app = express()

// Middleware: läuft vor jeder Anfrage. express.json() liest JSON-Inhalte ein
app.use(express.json())

// Eigene Middleware: protokolliert jede Anfrage im Terminal
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString('de-DE')} ${req.method} ${req.url}`)
  next()
})

// Notizen nur im Arbeitsspeicher: Nach einem Neustart sind sie weg
const notizen = []

// GET /hallo?name=... liefert eine Begrüßung als JSON
app.get('/hallo', (req, res) => {
  res.json({ gruss: `Hallo ${req.query.name ?? 'Welt'}!` })
})

// GET /notizen liefert alle Notizen
app.get('/notizen', (req, res) => {
  res.json(notizen)
})

// POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
app.post('/notizen', (req, res) => {
  if (!req.body?.titel) {
    return res.status(400).json({ fehler: 'Feld "titel" fehlt' })
  }
  const notiz = { id: notizen.length + 1, titel: req.body.titel }
  notizen.push(notiz)
  res.status(201).location(`/notizen/${notiz.id}`).json(notiz)
})

// Alles andere: 404 als JSON statt der Standard-HTML-Seite
app.use((req, res) => {
  res.status(404).json({ fehler: 'Nicht gefunden' })
})

// Nur vom eigenen Rechner aus erreichbar, Port 3000
app.listen(3000, '127.0.0.1', () => {
  console.log('Express läuft auf http://127.0.0.1:3000')
})
```

### 9. Startbefehle festlegen

Trägt zwei Kurzbefehle in `package.json` ein:

- `npm start` – startet den Server normal
- `npm run dev` – startet ihn mit `--watch`: Node.js startet den Server bei jeder gespeicherten Änderung an `server.js` automatisch neu

```bash
npm pkg set scripts.start="node server.js" scripts.dev="node --watch server.js"
```

## Starten und testen

### 10. Server im Entwicklungsmodus starten

Das Terminal bleibt belegt, solange der Server läuft. Hier erscheinen auch die Zeilen der Protokoll-Middleware.

```bash
npm run dev
```

**Prüfen:** Die letzte Zeile lautet `Express läuft auf http://127.0.0.1:3000`.

### 11. Notiz anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:3000/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, weiter unten steht `Location: /notizen/1`, die letzte Zeile ist `{"id":1,"titel":"Erste Notiz"}`. Im ersten Terminal erscheint eine Zeile wie `22:18:41 POST /notizen`.

### 12. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung:

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:3000/notizen` | `[{"id":1,"titel":"Erste Notiz"}]` |
| `curl "http://localhost:3000/hallo?name=Thorsten"` | `{"gruss":"Hallo Thorsten!"}` |
| `curl -X POST http://localhost:3000/notizen -H "Content-Type: application/json" -d '{}'` | `{"fehler":"Feld \"titel\" fehlt"}` (Status 400) |
| `curl http://localhost:3000/gibtsnicht` | `{"fehler":"Nicht gefunden"}` (Status 404) |

### 13. Automatischen Neustart ausprobieren

Ändere in `server.js` das Wort `Hallo` in der Route `/hallo` z. B. in `Servus` und speichere die Datei. Im ersten Terminal erscheint `Restarting 'server.js'`, danach startet der Server neu.

**Prüfen:** `curl http://localhost:3000/hallo` liefert jetzt `{"gruss":"Servus Welt!"}`. Die Notizen aus Schritt 11 sind durch den Neustart verloren, weil sie nur im Arbeitsspeicher lagen.

### 14. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Betrieb:** Auf einem Server startet man die Anwendung mit `npm start` über einen systemd-Dienst (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage) und setzt [nginx](nginx.md) davor, der auch HTTPS übernimmt. Setze dort die Umgebungsvariable `NODE_ENV=production`, damit Express Fehlermeldungen knapper ausgibt.
- **Datenbank:** Das Paket `pg` verbindet Node.js mit [PostgreSQL](postgresql.md), Werkzeuge wie Prisma oder Drizzle bilden Tabellen auf JavaScript-Objekte ab.
- **HTML-Seiten:** Mit `express.static('public')` liefert Express Dateien aus einem Ordner aus. Für dynamische Seiten gibt es Vorlagensysteme wie EJS oder Pug.
- **Sicherheit:** Die Middleware `helmet` setzt sinnvolle Sicherheits-Kopfzeilen, `express-rate-limit` bremst zu viele Anfragen.

## Deinstallieren

### 1. Projekt entfernen

Löscht den Projektordner samt `node_modules`.

```bash
rm -rf ~/hallo-express
```

### 2. Optional: Node.js und npm entfernen

Nur ausführen, wenn kein anderes Programm Node.js braucht (z. B. Antora, Docusaurus, VitePress, Starlight oder Excalidraw).

```bash
sudo apt purge nodejs npm
```

```bash
sudo apt autoremove
```

**Prüfen:** Der Projektordner existiert nicht mehr.

```bash
ls ~/hallo-express
```
