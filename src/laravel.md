# Laravel

Laravel ist das meistgenutzte Web-Framework für PHP. Es bringt fast alles mit, was eine Webanwendung braucht: Routen, Datenbankzugriff über Objekte (Eloquent), Migrationen für Tabellen, Vorlagen (Blade), Anmeldung, Warteschlangen und das Befehlszeilenwerkzeug `artisan`, das Code-Gerüste erzeugt und Aufgaben erledigt.

## Vorbemerkungen

- **Installation pro Projekt:** Laravel wird mit **Composer** in jedes Projekt einzeln installiert. Aus den Ubuntu-Paketquellen kommen nur PHP, seine Erweiterungen und Composer.
- **Datenbank:** Neue Projekte verwenden **SQLite**. Die Datenbank ist eine Datei im Projektordner, ein Datenbankserver ist nicht nötig. Anders als bei [Express](express.md) bleiben die Notizen deshalb auch nach einem Neustart erhalten.
- **Kein Webserver nötig:** Zum Entwickeln startet `php artisan serve` einen eingebauten Server auf <http://127.0.0.1:8000>, nur vom eigenen Rechner aus erreichbar. Port 8000 darf nicht von einem anderen Programm belegt sein.
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [Express](express.md), [ASP.NET Core](aspnet-core.md) und [Axum und Actix-web](rust-web.md). Bei Laravel liegen alle Adressen der Schnittstelle unter `/api`.
- **Version:** Getestet mit Laravel **13.33** (Projektvorlage 13.10), PHP 8.5 und Composer 2.9 unter Ubuntu 26.04. Laravel 13 braucht PHP 8.3 oder neuer.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. PHP, Erweiterungen und Composer installieren

- `php-cli` führt PHP im Terminal aus, auch den Entwicklungsserver.
- `php-sqlite3` verbindet PHP mit SQLite.
- `xml`, `mbstring`, `curl`, `intl` und `zip` braucht Laravel für XML, Umlaute, Anfragen an andere Server, Sprachen und das Entpacken von Paketen.
- `unzip` und `composer` laden und entpacken Laravel und alle Bibliotheken.

Sind Pakete schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install php-cli php-sqlite3 php-xml php-mbstring php-curl php-intl php-zip unzip composer
```

**Prüfen:** Die Ausgabe beginnt mit `Composer version 2`.

```bash
composer --version
```

## Erstes Projekt

### 3. In das Home-Verzeichnis wechseln

Das Projekt wird im aktuellen Ordner angelegt.

```bash
cd ~
```

### 4. Projekt anlegen

Lädt die Projektvorlage `laravel/laravel` samt aller Bibliotheken in den Ordner `meinlaravel`. Danach erzeugt Laravel selbst einen geheimen Schlüssel in der Datei `.env`, legt die SQLite-Datei `database/database.sqlite` an und erstellt darin die Grundtabellen für Benutzer, Zwischenspeicher und Warteschlangen.

```bash
composer create-project laravel/laravel meinlaravel
```

**Prüfen:** Die Ausgabe enthält `Application key set successfully.` und endet mit drei Zeilen `… DONE`, z. B. `0001_01_01_000000_create_users_table … DONE`.

### 5. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinlaravel
```

**Prüfen:** Die Ausgabe lautet `Laravel Framework 13.33.0` oder nennt eine neuere Version.

```bash
php artisan --version
```

### 6. Unterstützung für Schnittstellen einrichten

Neue Projekte sind für Webseiten eingerichtet. Dieser Befehl legt zusätzlich die Datei `routes/api.php` an. Alle Routen darin sind unter `/api` erreichbar und brauchen keinen Schutz gegen gefälschte Formulare (CSRF-Token), den Laravel sonst für jede `POST`-Anfrage verlangt. Außerdem installiert er das Paket Sanctum für die Anmeldung per Token. `--without-migration-prompt` verhindert eine Rückfrage, die Tabellen legt Schritt 12 an.

```bash
php artisan install:api --without-migration-prompt
```

**Prüfen:** Die Ausgabe endet mit `API scaffolding installed.` Den Hinweis auf `HasApiTokens` brauchst du erst, wenn sich Benutzer per Token anmelden sollen.

### 7. Migration für die Notizen anlegen

Eine **Migration** beschreibt in PHP, wie eine Tabelle aussieht. Laravel erkennt am Namen `create_notizen_table`, dass eine Tabelle `notizen` entstehen soll, und legt eine passende Vorlage im Ordner `database/migrations` an. Der Dateiname beginnt mit Datum und Uhrzeit, damit Migrationen in der richtigen Reihenfolge laufen.

```bash
php artisan make:migration create_notizen_table
```

**Prüfen:** Die Ausgabe lautet `Migration [database/migrations/…_create_notizen_table.php] created successfully.`

### 8. Spalte für den Titel ergänzen

Die Vorlage enthält nur eine laufende Nummer (`id`) und die Zeitstempel `created_at` und `updated_at`. Das Sternchen `*` im Befehl steht für Datum und Uhrzeit im Dateinamen, so musst du sie nicht abtippen.

```bash
nano database/migrations/*_create_notizen_table.php
```

Drücke <kbd>Strg</kbd>+<kbd>W</kbd>, gib `$table->id();` ein und drücke <kbd>Enter</kbd>. Drücke <kbd>Ende</kbd> und dann <kbd>Enter</kbd> für eine neue Zeile und füge ein:

```php
            $table->string('titel');
```

Der Block sieht danach so aus:

```php
        Schema::create('notizen', function (Blueprint $table) {
            $table->id();
            $table->string('titel');
            $table->timestamps();
        });
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Model anlegen

Ein **Model** steht in Laravel für eine Tabelle. Über die Klasse `Notiz` liest und schreibt man später Notizen, ohne SQL zu schreiben.

```bash
php artisan make:model Notiz
```

**Prüfen:** Die Ausgabe lautet `Model [app/Models/Notiz.php] created successfully.`

### 10. Model ausfüllen

```bash
nano app/Models/Notiz.php
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notiz extends Model
{
    // Tabellenname festlegen, sonst sucht Laravel nach "notizs"
    protected $table = 'notizen';

    // Nur dieses Feld darf per Notiz::create() gefüllt werden
    protected $fillable = ['titel'];

    // Diese Felder erscheinen im JSON
    protected $visible = ['id', 'titel'];
}
```

- `$table` – Laravel bildet den Tabellennamen sonst nach englischen Regeln aus dem Klassennamen und käme auf `notizs`.
- `$fillable` – schützt davor, dass jemand über die Schnittstelle andere Spalten wie `id` mitschickt und überschreibt.
- `$visible` – ohne diese Zeile stünden auch `created_at` und `updated_at` im JSON.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Routen schreiben

In `routes/api.php` legt man fest, welche Funktion welche Adresse und Methode beantwortet.

```bash
nano routes/api.php
```

Ersetze den ganzen Inhalt wie in Schritt 10 und füge ein:

```php
<?php

use App\Models\Notiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// GET /api/hallo?name=... liefert eine Begrüßung als JSON
Route::get('/hallo', function (Request $request) {
    return ['gruss' => 'Hallo ' . $request->query('name', 'Welt') . '!'];
});

// GET /api/notizen liefert alle Notizen aus der Datenbank
Route::get('/notizen', function () {
    return Notiz::orderBy('id')->get();
});

// POST /api/notizen legt eine Notiz an; der Inhalt kommt als JSON
Route::post('/notizen', function (Request $request) {
    if (! $request->filled('titel')) {
        return response()->json(['fehler' => 'Feld "titel" fehlt'], 400);
    }
    $notiz = Notiz::create(['titel' => $request->input('titel')]);

    return response()->json($notiz, 201)->header('Location', '/api/notizen/' . $notiz->id);
});

// Alle anderen Adressen unter /api: 404 als JSON
Route::fallback(function () {
    return response()->json(['fehler' => 'Nicht gefunden'], 404);
});
```

- `Route::get` und `Route::post` – verbinden Adresse und Methode mit einer Funktion. `$request` enthält die Anfrage: `query()` liest Werte aus der Adresse, `input()` und `filled()` lesen den mitgeschickten JSON-Inhalt.
- Gibt eine Funktion ein Array oder Model zurück, wandelt Laravel es selbst in JSON um. Mit `response()->json(…, 201)` setzt man zusätzlich den HTTP-Status.
- `Notiz::orderBy('id')->get()` liest alle Notizen, `Notiz::create()` speichert eine neue.
- `Route::fallback` – beantwortet alle übrigen Adressen unter `/api` mit `404` als JSON.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Tabellen anlegen

Führt alle Migrationen aus, die noch nicht gelaufen sind: die Tabelle `notizen` und die Tabelle von Sanctum aus Schritt 6.

```bash
php artisan migrate
```

**Prüfen:** Die Ausgabe enthält `…_create_notizen_table … DONE` und `…_create_personal_access_tokens_table … DONE`.

### 13. Routen anzeigen

Listet alle Routen unter `/api` auf. So siehst du, ob Laravel die Datei aus Schritt 11 fehlerfrei gelesen hat.

```bash
php artisan route:list --path=api
```

**Prüfen:** Die Liste enthält `GET|HEAD api/hallo`, `GET|HEAD api/notizen`, `POST api/notizen` und `GET|HEAD api/{fallbackPlaceholder}` und endet mit `Showing [4] routes`.

## Starten und testen

### 14. Entwicklungsserver starten

Das Terminal bleibt belegt, solange der Server läuft. Hier erscheint zu jeder Anfrage eine Zeile mit Uhrzeit, Adresse und Dauer.

```bash
php artisan serve
```

**Prüfen:** Die Ausgabe lautet `Server running on [http://127.0.0.1:8000].` Unter <http://127.0.0.1:8000> zeigt der Browser die Willkommensseite von Laravel.

Ist Port 8000 schon belegt, etwa von einem zweiten `php artisan serve` in einem anderen Terminal, weicht Laravel ohne Rückfrage auf 8001 aus. Achte deshalb auf die Portnummer in der Ausgabe.

### 15. Notiz anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:8000/api/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, weiter unten steht `Location: /api/notizen/1`, die letzte Zeile ist `{"titel":"Erste Notiz","id":1}`.

### 16. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung:

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:8000/api/notizen` | `[{"id":1,"titel":"Erste Notiz"}]` |
| `curl "http://localhost:8000/api/hallo?name=Thorsten"` | `{"gruss":"Hallo Thorsten!"}` |
| `curl -X POST http://localhost:8000/api/notizen -H "Content-Type: application/json" -d '{}'` | `{"fehler":"Feld \"titel\" fehlt"}` (Status 400) |
| `curl http://localhost:8000/api/gibtsnicht` | `{"fehler":"Nicht gefunden"}` (Status 404) |

### 17. Änderung ohne Neustart ausprobieren

PHP liest den Code bei jeder Anfrage neu. Ein Neustart des Servers ist deshalb nicht nötig. Ändere in `routes/api.php` das Wort `Hallo` in der Route `/hallo` z. B. in `Servus` und speichere die Datei.

**Prüfen:** `curl http://localhost:8000/api/hallo` liefert sofort `{"gruss":"Servus Welt!"}`.

Nur Änderungen an der Datei `.env` erfordern einen Neustart. `php artisan serve` erkennt sie selbst und startet neu.

### 18. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

**Prüfen:** Startest du den Server mit `php artisan serve` erneut, liefert `curl http://localhost:8000/api/notizen` weiterhin die Notiz aus Schritt 15. Sie liegt in `database/database.sqlite`.

## Wie geht es weiter?

- **Validierung:** Statt `filled()` prüft `$request->validate(['titel' => 'required|max:200'])` Eingaben mit Regeln. Schickt der Aufruf `Accept: application/json` mit, antwortet Laravel bei Fehlern mit Status 422 und einer Liste der Fehler.
- **Controller:** Bei mehr als ein paar Routen gehört der Code in Controller-Klassen. `php artisan make:controller NotizController --api --model=Notiz` erzeugt eine Klasse mit allen Methoden zum Lesen, Anlegen, Ändern und Löschen.
- **Webseiten:** Routen in `routes/web.php` liefern HTML aus Blade-Vorlagen im Ordner `resources/views`.
- **Andere Datenbank:** Mit dem Paket `php-pgsql` und den Einträgen `DB_CONNECTION=pgsql`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME` und `DB_PASSWORD` in `.env` verwendet Laravel [PostgreSQL](postgresql.md).
- **Betrieb:** Auf einem Server liefert [nginx](nginx.md) mit PHP-FPM den Ordner `public` aus, wie in den Anleitungen zu [Bolt CMS](bolt.md) oder [Contao](contao.md). Setze dort in `.env` die Werte `APP_ENV=production` und `APP_DEBUG=false`, sonst zeigt Laravel Besuchern bei Fehlern Code und Einstellungen.
- **Aktualisieren:** `composer update` im Projektordner holt neue Versionen innerhalb von Laravel 13. Danach `php artisan migrate`, falls neue Migrationen dazugekommen sind.

## Deinstallieren

### 1. Server beenden

Läuft `php artisan serve` noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projekt entfernen

Löscht den Projektordner samt Bibliotheken und SQLite-Datenbank.

```bash
rm -rf ~/meinlaravel
```

**Prüfen:** Der Projektordner existiert nicht mehr, `ls` meldet `Datei oder Verzeichnis nicht gefunden`.

```bash
ls ~/meinlaravel
```

### 3. Composer-Zwischenspeicher leeren (optional)

Composer bewahrt heruntergeladene Pakete in `~/.cache/composer` auf. Dieser Befehl leert den ganzen Speicher. Das betrifft alle PHP-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
composer clear-cache
```

### 4. PHP-Pakete entfernen (optional)

Nur ausführen, wenn kein anderes Programm sie braucht, z. B. die CMS-Anleitungen mit PHP.

```bash
sudo apt purge php-sqlite3 composer
```

Der nächste Befehl entfernt die Pakete, die nur dafür mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```
