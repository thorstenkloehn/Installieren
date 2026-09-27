# Symfony

Symfony ist ein PHP-Framework aus vielen einzelnen Bausteinen (Komponenten), die auch andere Projekte wie Laravel, Drupal oder Composer verwenden. Ein neues Projekt startet sehr klein. Weitere Fähigkeiten wie Datenbankzugriff, Vorlagen oder Anmeldung holt man mit Composer dazu, und das Werkzeug Symfony Flex richtet sie dabei gleich passend ein.

## Vorbemerkungen

- **Installation pro Projekt:** Symfony wird mit **Composer** in jedes Projekt einzeln installiert. Aus den Ubuntu-Paketquellen kommen nur PHP, seine Erweiterungen und Composer.
- **Datenbank:** Das Projekt verwendet **SQLite** über Doctrine, die übliche Datenbankschicht von Symfony. Die Datenbank ist eine Datei im Projektordner, ein Datenbankserver ist nicht nötig.
- **Kein Webserver nötig:** Zum Entwickeln reicht der Server, der in PHP eingebaut ist. Er läuft auf <http://127.0.0.1:8000>, nur vom eigenen Rechner aus erreichbar. Port 8000 darf nicht von einem anderen Programm belegt sein. Das Symfony-Befehlszeilenwerkzeug (Symfony CLI), das Symfony nach dem Anlegen empfiehlt, braucht man dafür nicht.
- **Ohne Docker:** Einige Vorlagen von Symfony Flex legen Docker-Dateien für die Datenbank an. Schritt 6 schaltet das ab.
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [Laravel](laravel.md), [Ruby on Rails](rails.md), [Flask](flask.md) und [Express](express.md).
- **Version:** Getestet mit Symfony **8.1.7**, Doctrine ORM 3, PHP 8.5 und Composer 2.9 unter Ubuntu 26.04. Symfony 8 braucht PHP 8.4 oder neuer.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. PHP, Erweiterungen und Composer installieren

- `php-cli` führt PHP im Terminal aus, auch den Entwicklungsserver.
- `php-sqlite3` verbindet PHP mit SQLite.
- `xml`, `mbstring`, `intl`, `curl` und `zip` braucht Symfony für Konfiguration, Umlaute, Sprachen, Downloads und das Entpacken von Paketen.
- `unzip` und `composer` laden und entpacken Symfony und alle Bibliotheken.

Sind Pakete schon vorhanden, etwa aus der [Laravel-Anleitung](laravel.md), meldet `apt` das nur.

```bash
sudo apt install php-cli php-sqlite3 php-xml php-mbstring php-intl php-curl php-zip unzip composer
```

**Prüfen:** Die erste Zeile beginnt mit `Composer version 2`, die zweite nennt `PHP version 8.5`.

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

Lädt die kleinste Projektvorlage `symfony/skeleton` in den Ordner `meinsymfony`. Sie enthält nur den Kern: Routen, Controller, Konfiguration und die Konsole `bin/console`.

```bash
composer create-project symfony/skeleton meinsymfony
```

**Prüfen:** Die Ausgabe beginnt mit `Creating a "symfony/skeleton" project at "./meinsymfony"`, weiter unten stehen `Executing script cache:clear [OK]` und `Executing script assets:install public [OK]`.

### 5. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinsymfony
```

**Prüfen:** Die Ausgabe lautet `Symfony v8.1.7 (env: dev, debug: true)` oder nennt eine neuere Version. `env: dev` heißt: Das Projekt läuft im Entwicklungsmodus mit ausführlichen Fehlermeldungen.

```bash
php bin/console --version
```

Im Projektordner liegen auch die Dateien `AGENTS.md` und `CLAUDE.md`. Sie enthalten Hinweise für KI-Assistenten und sind für diese Anleitung nicht wichtig.

### 6. Docker-Vorlagen abschalten

Trägt in `composer.json` ein, dass Symfony Flex beim Installieren weiterer Pakete keine Docker-Dateien anlegen soll. Ohne diese Einstellung fragt Composer in Schritt 7 danach oder legt `compose.yaml` mit einem PostgreSQL-Container an. `--json` sorgt dafür, dass `false` als Wahrheitswert und nicht als Text eingetragen wird.

```bash
composer config --json extra.symfony.docker false
```

**Prüfen:** Die Ausgabe enthält `"docker": false`.

```bash
grep docker composer.json
```

### 7. Doctrine installieren

`symfony/orm-pack` ist ein Sammelpaket: Doctrine ORM für den Zugriff auf die Datenbank über PHP-Objekte und Doctrine Migrations für die Tabellen. Flex legt dabei die Konfiguration `config/packages/doctrine.yaml` und den Ordner `migrations` an.

```bash
composer require symfony/orm-pack
```

**Prüfen:** Die Ausgabe enthält `Configuring doctrine/doctrine-bundle` und `Configuring doctrine/doctrine-migrations-bundle` und endet mit dem Hinweis `Modify your DATABASE_URL config in .env`. Das erledigt der nächste Schritt.

### 8. SQLite als Datenbank einstellen

In der Datei `.env` hat Doctrine eine Verbindung zu PostgreSQL eingetragen. Statt `.env` zu ändern, legt man eigene Einstellungen in `.env.local` ab. Symfony liest sie zusätzlich und sie überschreiben gleichnamige Werte aus `.env`. Die Datei ist neu, nano startet mit einer leeren Seite.

```bash
nano .env.local
```

Füge diesen Inhalt ein:

```bash
# SQLite-Datei im Ordner var statt PostgreSQL
DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"
```

`%kernel.project_dir%` ersetzt Symfony durch den Projektordner. Die Datenbank wird also `~/meinsymfony/var/data.db`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Entity schreiben

Eine **Entity** ist eine PHP-Klasse, deren Objekte Doctrine in einer Tabelle speichert. Die Attribute in `#[…]` beschreiben Tabelle und Spalten. Den Ordner `src/Entity` hat Flex in Schritt 7 schon angelegt, `src/Controller` gibt es seit Schritt 4.

```bash
nano src/Entity/Notiz.php
```

Füge diesen Inhalt ein:

```php
<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

// Jede Notiz ist eine Zeile in der Tabelle "notizen"
#[ORM\Entity]
#[ORM\Table(name: 'notizen')]
class Notiz
{
    // Laufende Nummer, vergibt die Datenbank
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Titel mit höchstens 255 Zeichen
    #[ORM\Column(length: 255)]
    private string $titel;

    public function __construct(string $titel)
    {
        $this->titel = $titel;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    // Die Notiz als Array, daraus wird JSON
    public function alsArray(): array
    {
        return ['id' => $this->id, 'titel' => $this->titel];
    }
}
```

- `#[ORM\Table(name: 'notizen')]` – ohne diese Zeile hieße die Tabelle wie die Klasse, also `notiz`.
- `#[ORM\GeneratedValue]` – die Nummer vergibt die Datenbank beim Speichern. Vorher ist `$id` noch `null`.
- `alsArray()` – die Felder sind `private`. Die Methode gibt sie für die JSON-Antwort gezielt heraus.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Migration erzeugen

Doctrine vergleicht die Entities mit der (noch leeren) Datenbank und schreibt die nötigen SQL-Befehle in eine neue Datei im Ordner `migrations`.

```bash
php bin/console doctrine:migrations:diff
```

**Prüfen:** Die Ausgabe nennt die neue Datei `migrations/Version….php`. Darin steht der Befehl `CREATE TABLE notizen (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, titel VARCHAR(255) NOT NULL)`.

```bash
grep CREATE migrations/Version*.php
```

### 11. Tabelle anlegen

Führt alle Migrationen aus, die noch nicht gelaufen sind. Dabei entsteht die Datei `var/data.db`. `-n` beantwortet die Sicherheitsfrage, ob wirklich migriert werden soll, mit Ja.

```bash
php bin/console doctrine:migrations:migrate -n
```

**Prüfen:** Die Ausgabe endet mit `[OK] Successfully migrated to version: DoctrineMigrations\Version…`.

### 12. Controller schreiben

Ein **Controller** beantwortet Anfragen. In Symfony steht die Adresse direkt als Attribut `#[Route]` über der Methode. Die Datei `config/routes.yaml` liest alle Controller im Ordner `src/Controller` selbst ein.

```bash
nano src/Controller/NotizController.php
```

Füge diesen Inhalt ein:

```php
<?php

namespace App\Controller;

use App\Entity\Notiz;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class NotizController extends AbstractController
{
    // GET /hallo?name=... liefert eine Begrüßung als JSON
    #[Route('/hallo', methods: ['GET'])]
    public function hallo(Request $request): JsonResponse
    {
        $name = $request->query->get('name', 'Welt');

        return $this->json(['gruss' => "Hallo $name!"]);
    }

    // GET /notizen liefert alle Notizen aus der Datenbank
    #[Route('/notizen', methods: ['GET'])]
    public function alle(EntityManagerInterface $em): JsonResponse
    {
        $notizen = $em->getRepository(Notiz::class)->findBy([], ['id' => 'ASC']);

        return $this->json(array_map(fn (Notiz $n) => $n->alsArray(), $notizen));
    }

    // GET /notizen/1 liefert eine Notiz oder 404
    #[Route('/notizen/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function eine(int $id, EntityManagerInterface $em): JsonResponse
    {
        $notiz = $em->find(Notiz::class, $id);
        if ($notiz === null) {
            return $this->json(['fehler' => 'Notiz nicht gefunden'], 404);
        }

        return $this->json($notiz->alsArray());
    }

    // POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
    #[Route('/notizen', methods: ['POST'])]
    public function anlegen(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $daten = json_decode($request->getContent(), true);
        $titel = $daten['titel'] ?? '';
        if (!is_string($titel) || $titel === '') {
            return $this->json(['fehler' => 'Feld titel fehlt'], 400);
        }

        $notiz = new Notiz($titel);
        $em->persist($notiz);
        $em->flush();

        return $this->json($notiz->alsArray(), 201, ['Location' => '/notizen/'.$notiz->getId()]);
    }
}
```

- **Parameter der Methoden** – Symfony füllt sie selbst: `Request` ist die laufende Anfrage, `EntityManagerInterface` der Zugang zu Doctrine, `int $id` kommt aus dem Platzhalter `{id}` der Adresse.
- `requirements: ['id' => '\d+']` – die Route passt nur, wenn `{id}` aus Ziffern besteht.
- `$request->query->get()` liest Werte aus der Adresse, `$request->getContent()` den mitgeschickten JSON-Inhalt als Text, den `json_decode` in ein Array verwandelt.
- `$em->find()` sucht eine Notiz nach Nummer, `getRepository(…)->findBy()` liest mehrere. `persist()` merkt eine neue Notiz zum Speichern vor, `flush()` schreibt alle vorgemerkten Änderungen in die Datenbank.
- `$this->json()` macht aus einem Array eine JSON-Antwort. Status und Kopfzeilen sind optional.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Routen anzeigen

Listet alle Routen. So siehst du, ob Symfony den Controller fehlerfrei gelesen hat.

```bash
php bin/console debug:router
```

**Prüfen:** Die Tabelle enthält `app_notiz_hallo` (`GET /hallo`), `app_notiz_alle` (`GET /notizen`), `app_notiz_eine` (`GET /notizen/{id}`) und `app_notiz_anlegen` (`POST /notizen`). Die Namen bildet Symfony aus Controller und Methode. Die Route `_preview_error` bringt Symfony selbst mit, um Fehlerseiten anzusehen.

## Starten und testen

### 14. Entwicklungsserver starten

Startet den in PHP eingebauten Server. `-t public` macht den Ordner `public` zum Stammverzeichnis. Dort liegt `index.php`, über die alle Anfragen in Symfony landen. Das Terminal bleibt belegt, solange der Server läuft. Im Entwicklungsmodus schreibt Symfony zu jeder Anfrage viele Zeilen mit Details hinein.

```bash
php -S 127.0.0.1:8000 -t public
```

**Prüfen:** Die erste Zeile lautet `PHP 8.5.4 Development Server (http://127.0.0.1:8000) started`.

### 15. Notiz anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, weiter unten steht `Location: /notizen/1`, die letzte Zeile ist `{"id":1,"titel":"Erste Notiz"}`.

### 16. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung:

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:8000/notizen` | `[{"id":1,"titel":"Erste Notiz"}]` |
| `curl http://localhost:8000/notizen/1` | `{"id":1,"titel":"Erste Notiz"}` |
| `curl "http://localhost:8000/hallo?name=Thorsten"` | `{"gruss":"Hallo Thorsten!"}` |
| `curl http://localhost:8000/notizen/7` | `{"fehler":"Notiz nicht gefunden"}` (Status 404) |
| `curl -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{}'` | `{"fehler":"Feld titel fehlt"}` (Status 400) |
| `curl http://localhost:8000/gibtsnicht` | HTML-Fehlerseite, die erste Zeile beginnt mit `<!-- No route found for` (Status 404) |

Für Adressen ohne passende Route antwortet Symfony selbst. Im Entwicklungsmodus ist das eine ausführliche HTML-Fehlerseite. Öffne zum Vergleich <http://localhost:8000/gibtsnicht> im Browser. Die Seite zeigt den Fehler und den Weg der Anfrage durch den Code.

Die Meldung bei fehlendem Titel steht bewusst ohne Anführungszeichen: `$this->json()` würde `"` im Text als `"` ausgeben. Das ist gültiges JSON, aber schlecht lesbar.

### 17. Änderung ohne Neustart ausprobieren

PHP liest den Code bei jeder Anfrage neu, und im Entwicklungsmodus erneuert Symfony seinen Zwischenspeicher selbst. Ändere in `src/Controller/NotizController.php` das Wort `Hallo` in der Methode `hallo` z. B. in `Servus` und speichere die Datei.

**Prüfen:** `curl http://localhost:8000/hallo` liefert sofort `{"gruss":"Servus Welt!"}`.

### 18. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

**Prüfen:** Startest du den Server wie in Schritt 14 erneut, liefert `curl http://localhost:8000/notizen` weiterhin die Notiz aus Schritt 15. Sie liegt in `var/data.db`.

## Wie geht es weiter?

- **Code erzeugen lassen:** `composer require --dev symfony/maker-bundle` installiert die Befehle `make:…`. `php bin/console make:entity` fragt Felder ab und schreibt die Entity samt Repository, `make:controller` legt einen Controller an.
- **Webseiten:** `composer require twig` installiert die Vorlagensprache Twig. Vorlagen liegen dann im Ordner `templates`, ein Controller gibt sie mit `$this->render('….html.twig', […])` aus.
- **Eingaben prüfen und JSON umwandeln:** Mit `composer require serializer validator` wandelt Symfony JSON direkt in Objekte um und prüft sie mit Regeln wie `#[Assert\NotBlank]`. Für größere Schnittstellen gibt es API Platform.
- **Andere Datenbank:** Mit dem Paket `php-pgsql` und einer passenden `DATABASE_URL` in `.env.local` verwendet Doctrine [PostgreSQL](postgresql.md). Die Vorlage dafür steht schon in `.env`.
- **Betrieb:** Auf einem Server liefert [nginx](nginx.md) mit PHP-FPM den Ordner `public` aus, wie in den Anleitungen zu [Bolt CMS](bolt.md) oder [Contao](contao.md). Dort gehört `APP_ENV=prod` in `.env.local`, sonst zeigt Symfony Besuchern bei Fehlern Code und Einstellungen.
- **Aktualisieren:** `composer update` im Projektordner holt neue Versionen innerhalb von Symfony 8.1. Danach `php bin/console doctrine:migrations:migrate`, falls neue Migrationen dazugekommen sind.

## Deinstallieren

### 1. Server beenden

Läuft `php -S` noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projekt entfernen

Löscht den Projektordner samt Bibliotheken und SQLite-Datenbank.

```bash
rm -rf ~/meinsymfony
```

**Prüfen:** Der Projektordner existiert nicht mehr, `ls` meldet `Datei oder Verzeichnis nicht gefunden`.

```bash
ls ~/meinsymfony
```

### 3. Composer-Zwischenspeicher leeren (optional)

Composer bewahrt heruntergeladene Pakete in `~/.cache/composer` auf. Dieser Befehl leert den ganzen Speicher. Das betrifft alle PHP-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
composer clear-cache
```

### 4. PHP-Pakete entfernen (optional)

Nur ausführen, wenn kein anderes Programm sie braucht, z. B. [Laravel](laravel.md) oder die CMS-Anleitungen mit PHP.

```bash
sudo apt purge php-sqlite3 composer
```

Der nächste Befehl entfernt die Pakete, die nur dafür mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Die Shell meldet, dass der Befehl `composer` nicht gefunden wurde.

```bash
composer --version
```
