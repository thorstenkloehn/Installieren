# Wagtail

Wagtail ist ein Open-Source-Content-Management-System auf Basis des Python-Webframeworks [Django](django.md). Redakteure pflegen Seiten in einer übersichtlichen Verwaltung, Entwickler legen in Python fest, welche Seitentypen und Felder es gibt. Wagtail steht unter der freien BSD-Lizenz.

## Vorbemerkungen

- **Kein apt-Paket:** Wagtail ist nicht in den Ubuntu-Paketquellen enthalten. Es wird **pro Projekt** in einer virtuellen Python-Umgebung mit `pip` installiert. Python und das Modul `venv` kommen aus den Ubuntu-Paketquellen.
- **Voraussetzung:** [PostgreSQL](postgresql.md) ist installiert und läuft. Ohne weitere Einstellungen würde Wagtail eine SQLite-Datei verwenden.
- **Seitentypen als Code:** Welche Felder eine Seite hat, steht in der Datei `models.py`, das Aussehen in HTML-Vorlagen. Diese Anleitung ergänzt die Startseite um ein Textfeld. Grundkenntnisse in [Python](python.md) helfen, sind aber nicht nötig.
- **Adresse:** Wagtail läuft hier im Entwicklungsserver unter <http://127.0.0.1:8000>, nur vom eigenen Rechner aus erreichbar. Für den echten Betrieb auf einem Server braucht man zusätzlich einen Anwendungsserver wie Gunicorn hinter [nginx](nginx.md). Das behandelt diese Anleitung nicht.
- **Version:** Getestet mit Wagtail **8.0** und Django 6.1 unter Python 3.14 aus Ubuntu 26.04 und PostgreSQL 18.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Modul für virtuelle Umgebungen installieren

Eine virtuelle Umgebung ist ein eigener Ordner mit Python-Paketen nur für dieses Projekt. So kommen sich Wagtail und die Python-Pakete des Systems nicht in die Quere. Ist das Paket schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install python3-venv
```

## Datenbank in PostgreSQL einrichten

### 3. Datenbankbenutzer anlegen

Wagtail meldet sich mit diesem Benutzer bei PostgreSQL an. Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 11.

```bash
sudo -u postgres psql -c "CREATE USER wagtail WITH PASSWORD 'geheimes_passwort';"
```

**Prüfen:** Die Ausgabe lautet `CREATE ROLE`.

### 4. Datenbank anlegen

```bash
sudo -u postgres psql -c "CREATE DATABASE wagtail OWNER wagtail ENCODING 'UTF8';"
```

**Prüfen:** Die Ausgabe lautet `CREATE DATABASE`.

## Projekt anlegen

### 5. Projektordner anlegen

```bash
mkdir ~/meinwagtail
```

### 6. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinwagtail
```

### 7. Virtuelle Umgebung anlegen

Legt die Umgebung im versteckten Unterordner `.venv` an.

```bash
python3 -m venv .venv
```

### 8. Virtuelle Umgebung aktivieren

Ab jetzt verwenden `python` und `pip` die Umgebung im Projektordner. Vor der Eingabezeile steht `(.venv)`. In jedem neuen Terminal musst du diesen Befehl im Projektordner wiederholen.

```bash
source .venv/bin/activate
```

### 9. Wagtail installieren

Lädt Wagtail samt Django und allen Bibliotheken in die Umgebung. `psycopg` verbindet Python mit PostgreSQL, `[binary]` bringt die dafür nötigen Bibliotheken fertig übersetzt mit.

```bash
pip install wagtail "psycopg[binary]"
```

**Prüfen:** Die Ausgabe lautet `You are using Wagtail 8.0` oder nennt eine neuere Version.

```bash
wagtail --version
```

### 10. Wagtail-Projekt erzeugen

Legt das Projekt `meinewebsite` im aktuellen Ordner an (daher der Punkt am Ende). Dazu gehören `manage.py` für alle Verwaltungsbefehle, der Ordner `meinewebsite` mit den Einstellungen und die App `home` mit der Startseite.

```bash
wagtail start meinewebsite .
```

**Prüfen:** Die Ausgabe endet mit `Success! meinewebsite has been created`.

### 11. Eigene Einstellungen anlegen

Das Projekt lädt im Entwicklungsmodus zusätzlich die Datei `meinewebsite/settings/local.py`, falls es sie gibt. Dort stehen deine Einstellungen, die vorgegebenen Dateien bleiben unverändert.

```bash
nano meinewebsite/settings/local.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>) und setze bei `PASSWORD` dein Passwort aus Schritt 3 ein:

```python
from .base import INSTALLED_APPS

INSTALLED_APPS = INSTALLED_APPS + ["django.contrib.postgres"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "wagtail",
        "USER": "wagtail",
        "PASSWORD": "geheimes_passwort",
        "HOST": "127.0.0.1",
        "PORT": "5432",
    }
}

LANGUAGE_CODE = "de"
TIME_ZONE = "Europe/Berlin"

WAGTAIL_SITE_NAME = "Meine Website"
WAGTAILADMIN_BASE_URL = "http://127.0.0.1:8000"
```

- `django.contrib.postgres` – die Suche von Wagtail nutzt damit die Volltextsuche von PostgreSQL. Ohne diese Zeile bricht Schritt 12 mit `'django.contrib.postgres' must be in INSTALLED_APPS` ab.
- `DATABASES` – die Verbindung zur Datenbank aus Schritt 3 und 4.
- `LANGUAGE_CODE` und `TIME_ZONE` – Verwaltung auf Deutsch, Uhrzeiten in deutscher Zeit.
- `WAGTAIL_SITE_NAME` – der Name, der in der Verwaltung erscheint.
- `WAGTAILADMIN_BASE_URL` – die Adresse, die Wagtail in Links verwendet, z. B. in E-Mails.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

Die Datei enthält das Datenbankpasswort. Legst du später ein Git-Repository an, trage `meinewebsite/settings/local.py` in die Datei `.gitignore` ein, damit das Passwort nicht mit hochgeladen wird.

### 12. Einstellungen prüfen

Django prüft das ganze Projekt, auch die Verbindung zur Datenbank.

```bash
python manage.py check
```

**Prüfen:** Die Ausgabe lautet `System check identified no issues (0 silenced).`

### 13. Tabellen anlegen

Legt alle Tabellen von Django und Wagtail an, dazu eine erste Startseite „Home“.

```bash
python manage.py migrate
```

**Prüfen:** Die Ausgabe endet mit Zeilen wie `Applying wagtailusers.0015_… OK`.

### 14. Administratorkonto anlegen

Fragt nacheinander nach Benutzername, E-Mail-Adresse und zweimal nach dem Passwort. Die Passworteingabe bleibt unsichtbar.

```bash
python manage.py createsuperuser
```

**Prüfen:** Die letzte Zeile lautet `Superuser created successfully.`

## Startseite um ein Textfeld erweitern

Die Startseite der Vorlage hat nur einen Titel und zeigt eine englische Begrüßung. Die nächsten Schritte geben ihr ein Feld für formatierten Text.

### 15. Seitenmodell ändern

In `home/models.py` steht, welche Felder eine Startseite hat.

```bash
nano home/models.py
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein:

```python
from django.db import models

from wagtail.admin.panels import FieldPanel
from wagtail.fields import RichTextField
from wagtail.models import Page


class HomePage(Page):
    inhalt = RichTextField(blank=True, verbose_name="Inhalt")

    content_panels = Page.content_panels + [
        FieldPanel("inhalt"),
    ]
```

- `RichTextField` – ein Feld für Text mit Überschriften, Fettdruck, Listen und Links. `blank=True` erlaubt, es leer zu lassen.
- `content_panels` – zeigt das Feld in der Verwaltung unter dem Titel an.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Vorlage der Startseite ersetzen

Die Vorlage bestimmt, wie die Startseite im Browser aussieht.

```bash
nano home/templates/home/home_page.html
```

Ersetze den ganzen Inhalt wie in Schritt 15 und füge ein:

```html
{% extends "base.html" %}
{% load wagtailcore_tags %}

{% block body_class %}template-homepage{% endblock %}

{% block content %}
<main>
    <h1>{{ page.title }}</h1>
    {{ page.inhalt|richtext }}
</main>
{% endblock content %}
```

- `{% extends "base.html" %}` – übernimmt das Grundgerüst der Seite aus `meinewebsite/templates/base.html`.
- `{{ page.title }}` – der Titel der Seite.
- `{{ page.inhalt|richtext }}` – der Text aus dem neuen Feld. `richtext` wandelt die internen Links von Wagtail in normale Adressen um.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 17. Sprache im Grundgerüst auf Deutsch stellen

Das Grundgerüst gibt die Sprache der Seite fest als Englisch an. Browser und Vorleseprogramme richten sich danach, z. B. bei der Silbentrennung und der Aussprache.

```bash
nano meinewebsite/templates/base.html
```

Drücke <kbd>Strg</kbd>+<kbd>W</kbd>, gib `lang="en"` ein und drücke <kbd>Enter</kbd>. Ändere die Zeile in:

```html
<html lang="de">
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 18. Migration erzeugen

Django vergleicht `models.py` mit der Datenbank und schreibt die nötige Änderung als Datei in `home/migrations`.

```bash
python manage.py makemigrations
```

**Prüfen:** Die Ausgabe enthält `+ Add field inhalt to homepage`.

### 19. Migration anwenden

Fügt der Tabelle der Startseite die neue Spalte hinzu.

```bash
python manage.py migrate
```

**Prüfen:** Die Ausgabe enthält `Applying home.0003_homepage_inhalt... OK`.

## Wagtail verwenden

### 20. Entwicklungsserver starten

Startet den eingebauten Webserver von Django. Er lädt geänderte Python-Dateien und Vorlagen automatisch neu. Das Terminal bleibt dabei belegt.

```bash
python manage.py runserver
```

**Prüfen:** Die Ausgabe enthält `Starting WSGI development server at http://127.0.0.1:8000/`. Die Warnung `This is a development server` darunter erinnert nur daran, dass dieser Server nicht für den echten Betrieb gedacht ist.

### 21. An der Verwaltung anmelden

Öffne <http://127.0.0.1:8000/admin/> im Browser und melde dich mit dem Konto aus Schritt 14 an.

**Prüfen:** Das Dashboard zeigt „Meine Website“ und „1 Seite erstellt in Meine Website“. Links stehen „Seiten“, „Bilder“, „Dokumente“, „Berichte“ und „Einstellungen“.

### 22. Startseite bearbeiten

1. Klicke links auf **Seiten** und dann auf **Home**.
2. Ändere den **Titel**, z. B. in `Willkommen`.
3. Schreibe im Feld **Inhalt** einen Text. Über das Pluszeichen am Zeilenanfang fügst du Überschriften, Listen und Bilder ein.
4. Klicke unten auf den Pfeil neben **Entwurf speichern** und wähle **Veröffentlichen**.

„Entwurf speichern“ allein sichert die Änderung, ohne sie auf der Website zu zeigen.

### 23. Website ansehen

Öffne <http://127.0.0.1:8000> im Browser.

**Prüfen:** Titel und Text aus Schritt 22 erscheinen. Das Aussehen ist noch schlicht. Stylesheets legst du in `meinewebsite/static/css/meinewebsite.css` ab, das Grundgerüst bindet die Datei schon ein.

Beende den Server im Terminal mit <kbd>Strg</kbd>+<kbd>C</kbd>.

## Aktualisieren

Lege vorher eine Sicherung des Projektordners und der Datenbank an.

### 1. In den Projektordner wechseln

```bash
cd ~/meinwagtail
```

### 2. Virtuelle Umgebung aktivieren

```bash
source .venv/bin/activate
```

### 3. Wagtail aktualisieren

`-U` holt die neueste Version, zusammen mit einer passenden Django-Version. Beim Sprung auf eine neue Hauptversion (z. B. von 8 auf 9) liest man vorher die Hinweise unter <https://docs.wagtail.org>.

```bash
pip install -U wagtail
```

**Prüfen:** `wagtail --version` zeigt die neue Versionsnummer.

### 4. Datenbank anpassen

Neue Versionen bringen oft geänderte Tabellen mit.

```bash
python manage.py migrate
```

**Prüfen:** Die Ausgabe endet mit `OK`-Zeilen oder mit `No migrations to apply.`

## Deinstallieren

### 1. Server beenden

Läuft der Entwicklungsserver noch in einem Terminal, beende ihn dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Virtuelle Umgebung verlassen

Ist vor der Eingabezeile noch `(.venv)` zu sehen, verlässt du die Umgebung mit:

```bash
deactivate
```

### 3. Projektordner löschen

**Achtung:** Damit sind auch der Code, die Vorlagen und die hochgeladenen Bilder und Dokumente gelöscht. Die Uploads liegen in `~/meinwagtail/media`. Die virtuelle Umgebung mit Wagtail liegt ebenfalls im Projektordner und verschwindet mit.

```bash
rm -r ~/meinwagtail
```

### 4. Datenbank löschen

**Achtung:** Damit sind alle Seiten, Inhalte und Benutzer gelöscht.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS wagtail;"
```

### 5. Datenbankbenutzer löschen

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS wagtail;"
```

**Prüfen:** Der Server ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://127.0.0.1:8000
```

### 6. pip-Zwischenspeicher leeren (optional)

pip bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Dieser Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
python3 -m pip cache purge
```

Python, `python3-venv` und PostgreSQL bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.
