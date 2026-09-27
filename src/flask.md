# Flask

Flask ist ein kleines Python-Framework für Webanwendungen und Schnittstellen. Es liefert nur das Nötigste: Routen, Zugriff auf die Anfrage, Antworten als JSON und HTML-Vorlagen mit Jinja2. Alles Weitere, etwa Datenbank oder Anmeldung, wählt man selbst dazu.

## Vorbemerkungen

- **Aus den Paketquellen:** Ubuntu 26.04 enthält Flask **3.1.3**. Das ist zugleich die neueste Version, eine Installation über `pip` ist nicht nötig.
- **Eingebauter Server:** Zum Entwickeln startet `flask run` einen Server auf <http://127.0.0.1:5000>, nur vom eigenen Rechner aus erreichbar. Port 5000 darf nicht von einem anderen Programm belegt sein.
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [FastAPI](fastapi.md), [Express](express.md), [Laravel](laravel.md) und [Ruby on Rails](rails.md). Die Notizen liegen nur im Arbeitsspeicher. Dazu kommt eine HTML-Seite, die sie auflistet.
- **Verhältnis zu Django und FastAPI:** [Django](django.md) bringt Datenbank, Verwaltungsoberfläche und Anmeldung fertig mit. [FastAPI](fastapi.md) prüft Eingaben anhand von Typangaben und erzeugt eine Dokumentation der Schnittstelle. Flask macht beides nicht, ist dafür schnell verstanden und eignet sich für Webseiten ebenso wie für Schnittstellen.
- **Version:** Getestet mit Flask **3.1.3** und Werkzeug 3.1.5 unter Python 3.14 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Flask installieren

`python3-flask` bringt das Framework, die Vorlagensprache Jinja2, die Hilfsbibliothek Werkzeug (Anfragen, Entwicklungsserver) und den Befehl `flask` mit.

```bash
sudo apt install python3-flask
```

**Prüfen:** Die Ausgabe nennt drei Zeilen, darunter `Flask 3.1.3`.

```bash
flask --version
```

## Erstes Projekt

### 3. Projektordner anlegen

`-p` legt auch gleich den Unterordner `templates` an. Dort sucht Flask nach HTML-Vorlagen.

```bash
mkdir -p ~/hallo-flask/templates
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/hallo-flask
```

### 5. Anwendung schreiben

Legt die Datei `app.py` an. Die wichtigsten Bausteine:

- **`app = Flask(__name__)`** – die Anwendung. `__name__` sagt Flask, wo die Datei liegt, damit es den Ordner `templates` daneben findet.
- **Routen** (`@app.get`, `@app.post`) – legen fest, welche Funktion welche Adresse und Methode beantwortet. `<int:notiz_id>` im Pfad nimmt nur ganze Zahlen an und übergibt sie der Funktion.
- **`request`** – die laufende Anfrage. `request.args` enthält die Werte aus der Adresse (`?name=…`), `request.get_json()` den mitgeschickten JSON-Inhalt. `silent=True` liefert `None` statt eines Fehlers, wenn kein JSON ankommt.
- **Rückgabewerte** – gibt eine Funktion ein Dictionary oder eine Liste zurück, macht Flask daraus JSON. Mit einem Tupel setzt man zusätzlich Status und Kopfzeilen, z. B. `notiz, 201, {"Location": …}`.
- **`render_template`** – füllt eine HTML-Vorlage aus dem Ordner `templates` mit Daten.
- **`@app.errorhandler(404)`** – beantwortet alle unbekannten Adressen mit JSON statt mit der HTML-Fehlerseite von Flask.

```bash
nano app.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
from flask import Flask, render_template, request

app = Flask(__name__)

# Notizen nur im Arbeitsspeicher: Nach einem Neustart sind sie weg
notizen = []


# GET /hallo?name=... liefert eine Begrüßung als JSON
@app.get("/hallo")
def hallo():
    name = request.args.get("name", "Welt")
    return {"gruss": f"Hallo {name}!"}


# GET /notizen liefert alle Notizen
@app.get("/notizen")
def alle_notizen():
    return notizen


# GET /notizen/1 liefert eine Notiz oder 404
@app.get("/notizen/<int:notiz_id>")
def eine_notiz(notiz_id):
    for notiz in notizen:
        if notiz["id"] == notiz_id:
            return notiz
    return {"fehler": "Notiz nicht gefunden"}, 404


# POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
@app.post("/notizen")
def notiz_anlegen():
    daten = request.get_json(silent=True) or {}
    titel = daten.get("titel")
    if not titel:
        return {"fehler": 'Feld "titel" fehlt'}, 400
    notiz = {"id": len(notizen) + 1, "titel": titel}
    notizen.append(notiz)
    return notiz, 201, {"Location": f"/notizen/{notiz['id']}"}


# GET / zeigt die Notizen als HTML-Seite
@app.get("/")
def startseite():
    return render_template("notizen.html", notizen=notizen)


# Alle anderen unbekannten Adressen: 404 als JSON
@app.errorhandler(404)
def nicht_gefunden(fehler):
    return {"fehler": "Nicht gefunden"}, 404
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. HTML-Vorlage schreiben

Die Vorlage für die Startseite. Jinja2 ersetzt `{{ … }}` durch Werte und führt Anweisungen in `{% … %}` aus, hier eine Bedingung und eine Schleife über alle Notizen.

```bash
nano templates/notizen.html
```

Füge diesen Inhalt ein:

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Notizen</title>
</head>
<body>
  <h1>Notizen</h1>
  {% if notizen %}
    <ul>
      {% for notiz in notizen %}
        <li>{{ notiz.id }}: {{ notiz.titel }}</li>
      {% endfor %}
    </ul>
  {% else %}
    <p>Noch keine Notizen.</p>
  {% endif %}
</body>
</html>
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. Routen anzeigen

Lädt die Anwendung und listet alle Routen. So siehst du, ob `app.py` fehlerfrei ist. `--app app` bedeutet: die Anwendung in der Datei `app.py`.

```bash
flask --app app routes
```

**Prüfen:** Die Tabelle enthält die Adressen `/notizen` (zweimal, mit `GET` und `POST`), `/notizen/<int:notiz_id>`, `/hallo` und `/`. Die Zeile `/static/<path:filename>` legt Flask selbst an, für Dateien im Ordner `static`.

## Starten und testen

### 8. Server im Entwicklungsmodus starten

`--debug` schaltet den Entwicklungsmodus ein: Flask startet bei jeder gespeicherten Änderung neu und zeigt bei Fehlern im Browser eine Seite zur Fehlersuche. Das Terminal bleibt belegt, hier erscheint zu jeder Anfrage eine Zeile.

```bash
flask --app app run --debug
```

**Prüfen:** Die Ausgabe enthält `Running on http://127.0.0.1:5000` und `Debugger is active!`.

Die Fehlerseite im Entwicklungsmodus erlaubt es, Python-Befehle auf dem Rechner auszuführen. Der Server darf deshalb mit `--debug` nie aus dem Netz erreichbar sein.

### 9. Notiz anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:5000/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 CREATED`, weiter unten steht `Location: /notizen/1`. Darunter folgt die neue Notiz mit `"id": 1` und `"titel": "Erste Notiz"`. Im Entwicklungsmodus rückt Flask JSON-Antworten zur besseren Lesbarkeit über mehrere Zeilen ein. Im ersten Terminal erscheint `"POST /notizen HTTP/1.1" 201 -`.

### 10. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung. Die Tabelle zeigt die Antworten der Übersicht halber in einer Zeile.

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:5000/notizen` | `[{"id": 1, "titel": "Erste Notiz"}]` |
| `curl http://localhost:5000/notizen/1` | `{"id": 1, "titel": "Erste Notiz"}` |
| `curl "http://localhost:5000/hallo?name=Thorsten"` | `{"gruss": "Hallo Thorsten!"}` |
| `curl http://localhost:5000/notizen/7` | `{"fehler": "Notiz nicht gefunden"}` (Status 404) |
| `curl http://localhost:5000/notizen/abc` | `{"fehler": "Nicht gefunden"}` (Status 404) |
| `curl http://localhost:5000/gibtsnicht` | `{"fehler": "Nicht gefunden"}` (Status 404) |
| `curl -X POST http://localhost:5000/notizen -H "Content-Type: application/json" -d '{}'` | `{"fehler": "Feld \"titel\" fehlt"}` (Status 400) |

`/notizen/abc` landet beim allgemeinen 404, weil `<int:notiz_id>` nur Zahlen annimmt und die Adresse damit zu keiner Route passt.

### 11. HTML-Seite ansehen

Öffne <http://localhost:5000/> im Browser.

**Prüfen:** Die Seite zeigt die Überschrift „Notizen“ und darunter `1: Erste Notiz`.

Lege zum Ausprobieren eine Notiz mit HTML im Titel an:

```bash
curl -X POST http://localhost:5000/notizen -H "Content-Type: application/json" -d '{"titel": "<b>fett</b>"}'
```

**Prüfen:** Nach dem Neuladen steht auf der Seite wörtlich `2: <b>fett</b>`, nicht fett gedruckt. Jinja2 maskiert Werte in `{{ … }}` selbst, damit niemand über Eingaben fremdes HTML oder JavaScript in die Seite schmuggeln kann.

### 12. Automatischen Neustart ausprobieren

Ändere in `app.py` das Wort `Hallo` in der Funktion `hallo` z. B. in `Servus` und speichere die Datei. Im ersten Terminal erscheint `Detected change in '…/app.py', reloading`, danach startet der Server neu.

**Prüfen:** `curl http://localhost:5000/hallo` liefert jetzt `{"gruss": "Servus Welt!"}`. Die Notizen aus Schritt 9 und 11 sind durch den Neustart verloren, weil sie nur im Arbeitsspeicher lagen.

### 13. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Datenbank:** Für SQLite reicht das Modul `sqlite3`, das zu Python gehört. Bequemer wird es mit dem Paket `python3-flask-sqlalchemy`, das Tabellen als Python-Klassen beschreibt und auch [PostgreSQL](postgresql.md) anspricht.
- **Formulare:** In einer Route mit `methods=["GET", "POST"]` liest `request.form` die Felder eines HTML-Formulars. Vorlagen können mit `{% extends "basis.html" %}` ein gemeinsames Grundgerüst teilen.
- **Größere Anwendungen:** Mit Blueprints teilt man die Routen auf mehrere Dateien auf.
- **Betrieb:** Der eingebaute Server ist nur zum Entwickeln gedacht, das sagt auch die Warnung beim Start. Auf einem Server liefert z. B. Gunicorn (Paket `gunicorn`) die Anwendung mit `gunicorn --bind 127.0.0.1:8000 app:app` aus. Gestartet wird es über einen systemd-Dienst (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage), davor sitzt [nginx](nginx.md), der auch HTTPS übernimmt.

## Deinstallieren

### 1. Projekt entfernen

Löscht den Projektordner.

```bash
rm -rf ~/hallo-flask
```

### 2. Flask entfernen

Nur ausführen, wenn kein anderes Programm Flask braucht.

```bash
sudo apt purge python3-flask
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt die Pakete, die nur für Flask mitinstalliert wurden (z. B. `python3-werkzeug` und `python3-itsdangerous`). Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl meldet `ModuleNotFoundError: No module named 'flask'`.

```bash
python3 -c "import flask"
```
