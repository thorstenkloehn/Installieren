# FastAPI

FastAPI ist ein schlankes Python-Framework für Schnittstellen (APIs). Man beschreibt Adressen als normale Python-Funktionen und die erwarteten Daten mit Typangaben. FastAPI prüft daraufhin alle Eingaben selbst, wandelt Antworten in JSON um und erzeugt eine Dokumentation, in der man die Schnittstelle im Browser ausprobieren kann.

## Vorbemerkungen

- **Aus den Paketquellen:** Ubuntu 26.04 enthält FastAPI (Version 0.118) und den Server Uvicorn als Pakete. Die neueste Version (0.141) gibt es über `pip`, siehe Abschnitt „Alternative: neueste Version über pip“.
- **Uvicorn:** FastAPI selbst ist nur das Framework. Ausgeliefert werden die Anfragen von **Uvicorn**, einem Server für asynchrones Python (ASGI).
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [Express](express.md), [Laravel](laravel.md), [ASP.NET Core](aspnet-core.md) und [Axum und Actix-web](rust-web.md). Die Notizen liegen nur im Arbeitsspeicher.
- **Verhältnis zu Django:** [Django](django.md) bringt Datenbank, Verwaltungsoberfläche und HTML-Vorlagen mit. FastAPI konzentriert sich auf Schnittstellen und lässt die Wahl der Datenbank offen.
- **Version:** Getestet mit FastAPI **0.118**, Uvicorn 0.38 und Pydantic 2.12 unter Python 3.14 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. FastAPI und Uvicorn installieren

`python3-fastapi` bringt das Framework samt Pydantic für die Prüfung der Daten mit, `python3-uvicorn` den Server.

```bash
sudo apt install python3-fastapi python3-uvicorn
```

**Prüfen:** Die Ausgabe nennt die Versionen von FastAPI und Uvicorn, z. B. `0.118.0 0.38.0`.

```bash
python3 -c "import fastapi, uvicorn; print(fastapi.__version__, uvicorn.__version__)"
```

## Erstes Projekt

### 3. Projektordner anlegen

```bash
mkdir ~/hallo-fastapi
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/hallo-fastapi
```

### 5. Anwendung schreiben

Legt die Datei `main.py` an. Die wichtigsten Bausteine:

- **`app = FastAPI(…)`** – die Anwendung. `title` erscheint als Überschrift der Dokumentation.
- **Modelle** (`class … (BaseModel)`) – beschreiben, wie die Daten aussehen. `NotizNeu` ist das, was man beim Anlegen schickt, `Notiz` die gespeicherte Notiz mit Nummer. Pydantic prüft jede Anfrage dagegen.
- **Routen** (`@app.get`, `@app.post`) – legen fest, welche Funktion welche Adresse und Methode beantwortet. Parameter der Funktion füllt FastAPI selbst: `name` aus der Adresse (`?name=…`), `notiz_id` aus dem Pfad und `daten` aus dem mitgeschickten JSON.
- **Rückgabetyp** (`-> Notiz`) – FastAPI wandelt das Ergebnis danach in JSON um und nimmt nur die Felder des Modells auf.
- `HTTPException` bricht mit einem Fehlerstatus ab, hier `404`. `status_code=201` setzt den Status für eine erfolgreich angelegte Notiz.

```bash
nano main.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel

app = FastAPI(title="Notizen")


# So sieht eine neue Notiz aus, die man schickt: nur ein Titel
class NotizNeu(BaseModel):
    titel: str


# So sieht eine gespeicherte Notiz aus: mit Nummer
class Notiz(NotizNeu):
    id: int


# Notizen nur im Arbeitsspeicher: Nach einem Neustart sind sie weg
notizen: list[Notiz] = []


# GET /hallo?name=... liefert eine Begrüßung als JSON
@app.get("/hallo")
def hallo(name: str = "Welt"):
    return {"gruss": f"Hallo {name}!"}


# GET /notizen liefert alle Notizen
@app.get("/notizen")
def alle_notizen() -> list[Notiz]:
    return notizen


# GET /notizen/1 liefert eine Notiz oder 404
@app.get("/notizen/{notiz_id}")
def eine_notiz(notiz_id: int) -> Notiz:
    for notiz in notizen:
        if notiz.id == notiz_id:
            return notiz
    raise HTTPException(status_code=404, detail="Notiz nicht gefunden")


# POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
@app.post("/notizen", status_code=201)
def notiz_anlegen(daten: NotizNeu, response: Response) -> Notiz:
    notiz = Notiz(id=len(notizen) + 1, titel=daten.titel)
    notizen.append(notiz)
    response.headers["Location"] = f"/notizen/{notiz.id}"
    return notiz
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

## Starten und testen

### 6. Server im Entwicklungsmodus starten

`main:app` bedeutet: das Objekt `app` in der Datei `main.py`. `--reload` startet den Server bei jeder gespeicherten Änderung neu. `--host 127.0.0.1` macht ihn nur vom eigenen Rechner aus erreichbar, `--port 8000` legt den Port fest. Das Ubuntu-Paket bringt keinen eigenen Befehl `uvicorn` mit, deshalb wird der Server über `python3 -m` gestartet. Das Terminal bleibt belegt, hier erscheint zu jeder Anfrage eine Zeile.

```bash
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Prüfen:** Die Ausgabe enthält `Uvicorn running on http://127.0.0.1:8000` und endet mit `Application startup complete.`

### 7. Notiz anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, weiter unten steht `location: /notizen/1`, die letzte Zeile ist `{"titel":"Erste Notiz","id":1}`. Im ersten Terminal erscheint `"POST /notizen HTTP/1.1" 201 Created`.

### 8. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung:

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:8000/notizen` | `[{"titel":"Erste Notiz","id":1}]` |
| `curl http://localhost:8000/notizen/1` | `{"titel":"Erste Notiz","id":1}` |
| `curl "http://localhost:8000/hallo?name=Thorsten"` | `{"gruss":"Hallo Thorsten!"}` |
| `curl http://localhost:8000/notizen/7` | `{"detail":"Notiz nicht gefunden"}` (Status 404) |
| `curl http://localhost:8000/gibtsnicht` | `{"detail":"Not Found"}` (Status 404) |
| `curl -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{}'` | `{"detail":[{"type":"missing","loc":["body","titel"],"msg":"Field required",…}]}` (Status 422) |
| `curl http://localhost:8000/notizen/abc` | `{"detail":[{"type":"int_parsing","loc":["path","notiz_id"],…}]}` (Status 422) |

Die letzten beiden Fehler hat niemand programmiert: FastAPI erkennt am Modell `NotizNeu`, dass `titel` fehlt, und an `notiz_id: int`, dass `abc` keine Zahl ist. Es antwortet dann mit Status `422 Unprocessable Content` und nennt genau, welches Feld nicht passt. Die anderen Anleitungen prüfen das von Hand und antworten mit `400`.

### 9. Dokumentation im Browser ausprobieren

Öffne <http://localhost:8000/docs> im Browser. FastAPI erzeugt diese Seite selbst aus dem Code. Sie listet alle Routen: „Hallo“, „Alle Notizen“, „Notiz Anlegen“ und „Eine Notiz“. Die Namen stammen aus den Funktionsnamen.

1. Klicke auf **POST /notizen**.
2. Klicke auf **Try it out**. Im Feld darunter steht ein Beispiel `{"titel": "string"}`. Ändere `string` in einen eigenen Titel.
3. Klicke auf **Execute**.

**Prüfen:** Unter „Server response“ steht der Code `201` und die neue Notiz als JSON.

Die Seite lädt ihre Skripte und Stylesheets von `cdn.jsdelivr.net` und das Symbol von `fastapi.tiangolo.com`. Ohne Internetverbindung bleibt sie leer. Die Beschreibung der Schnittstelle als Datei liefert <http://localhost:8000/openapi.json>, auch ohne Internet.

### 10. Automatischen Neustart ausprobieren

Ändere in `main.py` das Wort `Hallo` in der Funktion `hallo` z. B. in `Servus` und speichere die Datei. Im ersten Terminal erscheint `StatReload detected changes in 'main.py'. Reloading...`, danach startet der Server neu.

**Prüfen:** `curl http://localhost:8000/hallo` liefert jetzt `{"gruss":"Servus Welt!"}`. Die Notizen aus Schritt 7 und 9 sind durch den Neustart verloren, weil sie nur im Arbeitsspeicher lagen.

### 11. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Datenbank:** FastAPI legt sich nicht fest. Für [PostgreSQL](postgresql.md) oder SQLite verwendet man meist SQLAlchemy oder SQLModel (vom Autor von FastAPI). Beide gibt es über `pip`.
- **Asynchrone Routen:** Schreibt man `async def` statt `def`, kann eine Route auf andere Dienste warten (Datenbank, andere APIs), ohne den Server zu blockieren.
- **Mehr Prüfungen:** Pydantic kennt Einschränkungen wie `titel: str = Field(min_length=1, max_length=200)` oder eigene Typen für E-Mail-Adressen.
- **Betrieb:** Auf einem Server startet man Uvicorn ohne `--reload` über einen systemd-Dienst (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage) und setzt [nginx](nginx.md) davor, der auch HTTPS übernimmt. Mit `--workers 4` verteilt Uvicorn die Anfragen auf mehrere Prozesse.

## Alternative: neueste Version über pip

Wer die neueste Version von FastAPI braucht, installiert sie in einer virtuellen Umgebung im Projektordner. Das Paket `python3-venv` muss dafür installiert sein.

```bash
python3 -m venv .venv
```

```bash
source .venv/bin/activate
```

```bash
pip install "fastapi[standard]"
```

`[standard]` bringt Uvicorn und den Befehl `fastapi` mit. Solange die Umgebung aktiv ist, startet `fastapi dev main.py` den Server im Entwicklungsmodus auf <http://127.0.0.1:8000>. Diese Version bekommt keine Updates über `apt`, du hältst sie selbst mit `pip install -U "fastapi[standard]"` aktuell.

## Deinstallieren

### 1. Projekt entfernen

Löscht den Projektordner.

```bash
rm -rf ~/hallo-fastapi
```

### 2. FastAPI und Uvicorn entfernen

Nur ausführen, wenn kein anderes Programm sie braucht.

```bash
sudo apt purge python3-fastapi python3-uvicorn
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt die Pakete, die nur für FastAPI und Uvicorn mitinstalliert wurden (z. B. `python3-starlette`, `python3-pydantic`). Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl meldet `ModuleNotFoundError: No module named 'fastapi'`.

```bash
python3 -c "import fastapi"
```
