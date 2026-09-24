# Django

Django ist ein Web-Framework für Python. Es bringt vieles schon mit, was Webanwendungen brauchen: Datenbankzugriff über Python-Klassen statt SQL, Benutzerverwaltung, Formulare, Schutz vor typischen Angriffen und eine fertige Verwaltungsoberfläche (Admin), mit der sich Daten ohne eigenen Code pflegen lassen.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Django **5.2**. Das ist die aktuelle Version mit Langzeitunterstützung (LTS), sie bekommt bis April 2028 Sicherheitskorrekturen. Die neueren Versionen 6.x gibt es nur über `pip`, siehe [Abschnitt am Ende](#alternative-neueste-version-über-pip).
- **Datenbank:** Für den Anfang verwendet Django **SQLite**. Die Daten liegen dann in einer einzelnen Datei im Projektordner, ein Datenbankserver ist nicht nötig. Später lässt sich auf [PostgreSQL](postgresql.md) umstellen.
- **Projekt und App:** Ein Django-**Projekt** ist die gesamte Website mit ihren Einstellungen. Es besteht aus einer oder mehreren **Apps**, die jeweils einen Bereich abdecken, hier eine App `notizen`.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von Django aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Django installieren

Installiert Django und den Befehl `django-admin`. Die benötigten Hilfsbibliotheken (`python3-asgiref`, `python3-sqlparse`) installiert `apt` automatisch mit.

```bash
sudo apt install python3-django
```

**Prüfen:** Die Ausgabe ist die Versionsnummer, z. B. `5.2.9`.

```bash
django-admin --version
```

## Erstes Projekt

### 3. Projektordner anlegen

Ein eigener Ordner für das Projekt.

```bash
mkdir ~/meinprojekt
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle beziehen sich auf diesen Ordner.

```bash
cd ~/meinprojekt
```

### 5. Projekt anlegen

Erzeugt das Grundgerüst. Der Punkt am Ende bedeutet: direkt in diesen Ordner, ohne zusätzlichen Unterordner. Es entstehen die Datei `manage.py` (das Werkzeug für alle weiteren Befehle) und der Ordner `meinprojekt` mit den Einstellungen (`settings.py`) und den Adressen (`urls.py`).

```bash
django-admin startproject meinprojekt .
```

**Prüfen:** Es werden `manage.py` und `meinprojekt` angezeigt.

```bash
ls
```

### 6. Sprache und Zeitzone einstellen

Stellt die Oberfläche auf Deutsch und die Zeitzone auf Mitteleuropa um. Das betrifft vor allem die Verwaltungsoberfläche und die Anzeige von Datum und Uhrzeit.

```bash
nano meinprojekt/settings.py
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `LANGUAGE_CODE` und drücke <kbd>Enter</kbd>. Ändere diese Zeile und die Zeile `TIME_ZONE` zwei Zeilen darunter, sodass sie lauten:

```python
LANGUAGE_CODE = 'de-de'

TIME_ZONE = 'Europe/Berlin'
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die Ausgabe zeigt `LANGUAGE_CODE = 'de-de'` und `TIME_ZONE = 'Europe/Berlin'`.

```bash
grep -E "^(LANGUAGE_CODE|TIME_ZONE)" meinprojekt/settings.py
```

### 7. App anlegen

Erzeugt die App `notizen` als eigenen Ordner mit Dateien für Datenmodelle (`models.py`), Seitenlogik (`views.py`) und Verwaltungsoberfläche (`admin.py`).

```bash
python3 manage.py startapp notizen
```

### 8. App im Projekt anmelden

Django berücksichtigt eine App erst, wenn sie in der Liste `INSTALLED_APPS` in `settings.py` steht. `notizen` kommt ans Ende der Liste.

```bash
nano meinprojekt/settings.py
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `staticfiles` und drücke <kbd>Enter</kbd>. Der Cursor steht in der letzten Zeile der Liste `INSTALLED_APPS`. Drücke <kbd>Ende</kbd> und <kbd>Enter</kbd> und tippe darunter die neue Zeile, eingerückt mit vier Leerzeichen:

```python
    'notizen',
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Die letzte Zeile der Liste lautet `'notizen',`.

```bash
grep -A 8 '^INSTALLED_APPS' meinprojekt/settings.py
```

## Daten, Verwaltung und eine Seite

### 9. Datenmodell anlegen

Ein **Modell** ist eine Python-Klasse, aus der Django eine Datenbanktabelle macht. Jedes Feld wird zu einer Spalte. Die Texte in Anführungszeichen (z. B. `"Titel"`) sind die Beschriftungen in der Verwaltungsoberfläche. `auto_now_add` trägt beim Anlegen automatisch Datum und Uhrzeit ein. `Meta` legt den Namen in Einzahl und Mehrzahl sowie die Sortierung fest (neueste zuerst).

```bash
nano notizen/models.py
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```python
from django.db import models


class Notiz(models.Model):
    titel = models.CharField("Titel", max_length=200)
    text = models.TextField("Text", blank=True)
    erstellt = models.DateTimeField("Erstellt", auto_now_add=True)

    class Meta:
        verbose_name = "Notiz"
        verbose_name_plural = "Notizen"
        ordering = ["-erstellt"]

    def __str__(self):
        return self.titel
```

### 10. Migration erzeugen

Eine **Migration** ist eine Datei, die beschreibt, wie die Datenbank an das Modell angepasst wird. Django erzeugt sie selbst aus dem Modell. Bei jeder späteren Änderung am Modell wiederholst du diesen und den nächsten Schritt.

```bash
python3 manage.py makemigrations notizen
```

**Prüfen:** Die Ausgabe enthält `+ Create model Notiz`.

### 11. Datenbank anlegen

Führt alle Migrationen aus: die eigenen und die der mitgelieferten Apps (Benutzer, Sitzungen, Verwaltung). Dabei entsteht die Datenbankdatei `db.sqlite3`.

```bash
python3 manage.py migrate
```

**Prüfen:** Die letzten Zeilen enden jeweils mit `OK`, darunter `Applying notizen.0001_initial... OK`.

### 12. Notizen in der Verwaltungsoberfläche anzeigen

Meldet das Modell bei der Verwaltungsoberfläche an. `list_display` legt die Spalten der Übersicht fest, `search_fields` die Felder, in denen die Suche sucht.

```bash
nano notizen/admin.py
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```python
from django.contrib import admin

from .models import Notiz


@admin.register(Notiz)
class NotizAdmin(admin.ModelAdmin):
    list_display = ["titel", "erstellt"]
    search_fields = ["titel", "text"]
```

### 13. Administrator anlegen

Legt ein Benutzerkonto mit vollen Rechten für die Verwaltungsoberfläche an. Der Befehl fragt nach Benutzername, E-Mail-Adresse (darf leer bleiben) und zweimal nach dem Passwort. Die Eingabe des Passworts wird nicht angezeigt.

```bash
python3 manage.py createsuperuser
```

**Prüfen:** Die Ausgabe endet mit `Superuser created successfully.`

### 14. Eine eigene Seite schreiben

Eine **View** ist eine Funktion, die eine Anfrage bekommt und eine Antwort zurückgibt. Diese hier liefert alle Notizen als JSON, also als einfache REST-Schnittstelle. Für HTML-Seiten würde man stattdessen eine Vorlage (Template) verwenden.

```bash
nano notizen/views.py
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```python
from django.http import JsonResponse

from .models import Notiz


def liste(request):
    notizen = Notiz.objects.values("id", "titel", "erstellt")
    return JsonResponse({"notizen": list(notizen)})
```

### 15. Adresse für die Seite festlegen

Ersetzt die Adressliste des Projekts. Neben der Verwaltungsoberfläche unter `/admin/` ist die neue View jetzt unter `/notizen/` erreichbar.

```bash
nano meinprojekt/urls.py
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```python
from django.contrib import admin
from django.urls import path

from notizen import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("notizen/", views.liste),
]
```

### 16. Projekt prüfen

Django untersucht Einstellungen, Modelle und Adressen auf Fehler, ohne den Server zu starten.

```bash
python3 manage.py check
```

**Prüfen:** Die Ausgabe lautet `System check identified no issues (0 silenced).`

## Starten und testen

### 17. Entwicklungsserver starten

Startet den eingebauten Webserver auf <http://127.0.0.1:8000>. Er ist nur vom eigenen Rechner aus erreichbar und lädt geänderte Python-Dateien automatisch neu. Das Terminal bleibt dabei belegt. Für den echten Betrieb ist er nicht gedacht.

```bash
python3 manage.py runserver
```

**Prüfen:** Die Ausgabe enthält `Starting development server at http://127.0.0.1:8000/`. Die gelbe Warnung darunter erinnert nur daran, dass dieser Server nicht für den echten Betrieb gedacht ist.

### 18. Notiz in der Verwaltungsoberfläche anlegen

Öffne <http://127.0.0.1:8000/admin/> im Browser und melde dich mit dem Konto aus Schritt 13 an. Die Oberfläche heißt „Django-Systemverwaltung“. Unter **Notizen** klickst du auf **Hinzufügen**, gibst einen Titel und einen Text ein und klickst auf **Sichern**.

**Prüfen:** Die Notiz erscheint in der Übersicht mit Titel und Erstellungszeit.

### 19. Eigene Seite abrufen

Öffne ein zweites Terminal und frage die View aus Schritt 14 ab.

```bash
curl http://127.0.0.1:8000/notizen/
```

**Prüfen:** Die Antwort enthält die angelegte Notiz, z. B. `{"notizen": [{"id": 1, "titel": "Erste Notiz", "erstellt": "…"}]}`.

### 20. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **PostgreSQL statt SQLite:** Mit dem Paket `python3-psycopg` (über `apt`) und einer angepassten Einstellung `DATABASES` in `settings.py` verwendet Django eine [PostgreSQL](postgresql.md)-Datenbank.
- **Betrieb mit nginx:** Für den echten Betrieb startet man Django mit einem Anwendungsserver wie Gunicorn (Paket `gunicorn`) und setzt [nginx](nginx.md) davor. In `settings.py` müssen dann `DEBUG = False` gesetzt und `ALLOWED_HOSTS` sowie `SECRET_KEY` angepasst werden.
- **REST-Schnittstellen:** Das Django REST Framework (Paket `python3-djangorestframework`) erleichtert umfangreichere Schnittstellen.
- **Entwicklungsumgebung:** [VS Code](vscode.md) mit der Python-Erweiterung oder PyCharm unterstützen Django-Projekte.

## Alternative: neueste Version über pip

Die aktuelle Version Django 6.1 bekommst du nur über `pip` in einer virtuellen Umgebung, genau wie in der [LangGraph-Anleitung](langgraph.md) beschrieben. Im Projektordner:

```bash
python3 -m venv .venv
```

```bash
source .venv/bin/activate
```

```bash
pip install django
```

Solange die virtuelle Umgebung aktiv ist, verwenden `django-admin` und `python3 manage.py` diese Version. Sie bekommt aber keine Updates über `apt`, und du musst sie selbst mit `pip install -U django` aktuell halten.

## Deinstallieren

### 1. Projekt entfernen

Löscht den Projektordner samt Datenbank `db.sqlite3`. **Achtung:** Alle darin gespeicherten Daten gehen verloren.

```bash
rm -rf ~/meinprojekt
```

### 2. Django entfernen

Entfernt das Paket.

```bash
sudo apt purge python3-django
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt die Hilfsbibliotheken, die nur für Django installiert wurden.

```bash
sudo apt autoremove
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
django-admin --version
```
