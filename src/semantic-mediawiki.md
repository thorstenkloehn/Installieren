# Semantic MediaWiki

Semantic MediaWiki (SMW) ist eine Erweiterung für MediaWiki, mit der man Wiki-Seiten maschinenlesbare Angaben wie „Einwohner: 34.800“ geben kann. Diese Angaben lassen sich danach wie in einer Datenbank abfragen, sortieren und als Tabelle oder Liste auf anderen Seiten anzeigen. Diese Anleitung ergänzt ein vorhandenes MediaWiki mit PostgreSQL um SMW.

## Vorbemerkungen

- **Voraussetzung:** MediaWiki ist nach der Anleitung [MediaWiki](mediawiki.md) installiert. Es liegt in `/var/www/mediawiki`, nutzt die PostgreSQL-Datenbank `wikidb`, läuft unter <http://localhost:8085>, und Composer ist installiert.
- **Keine Installation über apt:** SMW gibt es nicht als Ubuntu-Paket. Es wird wie die Bibliotheken von MediaWiki mit Composer installiert.
- **Version:** Die Anleitung verwendet SMW **7.3**. Getestet mit MediaWiki 1.43, PHP 8.5 und PostgreSQL 18. SMW 7 unterstützt laut Projekt MediaWiki 1.43 bis 1.46, PHP 8.1 bis 8.5 und PostgreSQL ab Version 10.
- **Neu seit SMW 7:** Ältere Anleitungen nennen noch die Zeile `enableSemantics( … );` in `LocalSettings.php`. Seit Version 7 ist sie überflüssig und erzeugt nur eine Warnung.

## Installation

### 1. In den MediaWiki-Ordner wechseln

Composer und die Wartungsskripte von MediaWiki arbeiten im Ordner des Wikis.

```bash
cd /var/www/mediawiki
```

### 2. SMW in die lokale Composer-Datei eintragen

MediaWiki liest neben seiner eigenen `composer.json` auch eine Datei `composer.local.json`. Dort stehen Erweiterungen, die du selbst hinzufügst. So bleiben sie beim Aktualisieren von MediaWiki erhalten.

```bash
nano composer.local.json
```

Gibt es die Datei noch nicht, füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```json
{
    "require": {
        "mediawiki/semantic-media-wiki": "~7.3"
    }
}
```

`~7.3` bedeutet: Version 7.3 oder eine neuere 7.x-Version, aber nicht 8.0. So kommen Fehlerkorrekturen automatisch, ein großer Versionssprung aber nur, wenn du ihn hier einträgst.

Gibt es die Datei schon mit anderen Einträgen, füge nur die Zeile `"mediawiki/semantic-media-wiki": "~7.3"` in den Block `"require"` ein. Die Zeile davor braucht dann ein Komma am Ende.

### 3. SMW herunterladen

Composer liest `composer.local.json` mit ein, lädt SMW nach `extensions/SemanticMediaWiki` und installiert die Bibliotheken, die SMW braucht. `--no-dev` lässt Werkzeuge weg, die nur für die Entwicklung von SMW selbst gedacht sind.

```bash
composer update --no-dev
```

**Prüfen:** Die Zeile `versions` zeigt `* 7.3.0` oder eine neuere 7.x-Version.

```bash
composer show mediawiki/semantic-media-wiki | grep versions
```

### 4. SMW in MediaWiki einschalten

Die Erweiterung liegt jetzt im Ordner, MediaWiki lädt sie aber erst nach einem Eintrag in `LocalSettings.php`.

```bash
nano LocalSettings.php
```

Springe mit <kbd>Strg</kbd>+<kbd>Ende</kbd> ans Ende der Datei und füge in einer eigenen Zeile an (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>). Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```php
wfLoadExtension( 'SemanticMediaWiki' );
```

nano behält beim Speichern Eigentümer und Rechte der Datei bei. Andere Werkzeuge wie `sed -i` legen die Datei neu an. Dann verliert sie die Gruppe `www-data`, und das Wiki meldet `LocalSettings.php not readable`.

### 5. Datenbanktabellen anlegen

Das Update-Skript von MediaWiki legt jetzt auch die Tabellen von SMW in PostgreSQL an. `--quick` überspringt die Wartezeit vor dem Start.

```bash
php maintenance/run.php update --quick
```

**Prüfen:** Die Ausgabe enthält keine Fehlermeldung. In der Datenbank gibt es jetzt rund 40 Tabellen, deren Name mit `smw` beginnt.

```bash
sudo -u postgres psql -d wikidb -c "\dt smw*"
```

### 6. Vorhandene Seiten auswerten (nur bei einem Wiki mit Inhalt)

Enthält das Wiki schon Seiten, liest dieses Skript sie einmal komplett durch und übernimmt vorhandene Angaben in die SMW-Tabellen. Bei einem frisch installierten Wiki kannst du den Schritt überspringen. `-v` zeigt den Fortschritt an.

```bash
php maintenance/run.php SemanticMediaWiki:rebuildData -v
```

### 7. Installation prüfen

Die Seite **Spezial:Version** listet alle geladenen Erweiterungen auf.

```bash
curl -s http://localhost:8085/Spezial:Version | grep -o "Semantic MediaWiki" | head -1
```

**Prüfen:** Die Ausgabe lautet `Semantic MediaWiki`. Im Browser steht auf <http://localhost:8085/Spezial:Version> auch die Versionsnummer. Die Seite <http://localhost:8085/Spezial:SemanticMediaWiki> zeigt Einstellungen und Wartungsfunktionen.

## Ausprobieren

Die folgenden Schritte legen zwei Städte mit Angaben an und zeigen sie in einer automatisch erzeugten Tabelle. Die Seiten entstehen hier mit dem Wartungsskript `edit`, damit die Befehle direkt kopiert werden können. Im Browser geht es genauso: Seite aufrufen, **Bearbeiten**, Text eingeben, speichern. `WikiAdmin` ist das Administratorkonto aus der MediaWiki-Anleitung.

### 8. Eigenschaft „Einwohner“ als Zahl festlegen

In SMW heißen Eigenschaften auf Deutsch **Attribute**. Jedes Attribut hat eine eigene Seite, auf der sein Datentyp steht. Ohne Angabe gilt ein Wert als Name einer Wiki-Seite. Für Einwohnerzahlen soll der Typ **Zahl** gelten, damit SMW richtig sortiert und rechnet.

```bash
echo 'Diese Eigenschaft ist vom Typ [[Datentyp::Zahl]].' | php maintenance/run.php edit --user WikiAdmin "Attribut:Einwohner"
```

**Prüfen:** Die Ausgabe lautet `Saving...done`.

### 9. Eigenschaft „Bundesland“ als Seite festlegen

Das Bundesland soll auf eine eigene Wiki-Seite verweisen, deshalb bekommt dieses Attribut den Typ **Seite**.

```bash
echo 'Diese Eigenschaft ist vom Typ [[Datentyp::Seite]].' | php maintenance/run.php edit --user WikiAdmin "Attribut:Bundesland"
```

### 10. Erste Stadt anlegen

Eine Angabe schreibt man wie einen Wiki-Link, nur mit Attribut und zwei Doppelpunkten davor: `[[Einwohner::1910000]]`. Im Text erscheint nur der Wert, SMW merkt sich zusätzlich die Angabe. Die Kategorie hilft später bei der Abfrage.

```bash
echo 'Hamburg hat [[Einwohner::1910000]] Einwohner und liegt im Bundesland [[Bundesland::Hamburg]]. [[Kategorie:Stadt]]' | php maintenance/run.php edit --user WikiAdmin "Hamburg"
```

### 11. Zweite Stadt anlegen

Dasselbe für eine zweite Stadt.

```bash
echo 'Ahrensburg hat [[Einwohner::34800]] Einwohner und liegt in [[Bundesland::Schleswig-Holstein]]. [[Kategorie:Stadt]]' | php maintenance/run.php edit --user WikiAdmin "Ahrensburg"
```

### 12. Abfrage-Seite anlegen

Die Funktion `#ask` sucht alle Seiten der Kategorie **Stadt**. Die Zeilen mit `?` legen fest, welche Attribute als Spalten erscheinen. `sort` und `order=desc` sortieren nach Einwohnerzahl, die größte Stadt zuerst.

```bash
echo '{{#ask: [[Kategorie:Stadt]] |?Einwohner |?Bundesland |sort=Einwohner |order=desc}}' | php maintenance/run.php edit --user WikiAdmin "Städte"
```

### 13. Warteschlange abarbeiten

MediaWiki erledigt manche Arbeiten nach dem Speichern erst später, beim nächsten Seitenaufruf. Dieser Befehl arbeitet die Warteschlange sofort ab.

```bash
php maintenance/run.php runJobs
```

### 14. Ergebnis ansehen

Ruft die Seite **Städte** ab und sucht die Einwohnerzahlen in der erzeugten Tabelle.

```bash
curl -s http://localhost:8085/St%C3%A4dte | grep -oE "1\.910\.000|34\.800"
```

**Prüfen:** Die Ausgabe zeigt `1.910.000` und darunter `34.800`. Im Browser zeigt <http://localhost:8085/Städte> eine Tabelle mit den Spalten Einwohner und Bundesland. Legst du eine weitere Stadt mit Kategorie an, erscheint sie dort automatisch. Eigene Abfragen kannst du auf **Spezial:Semantische Suche** zusammenklicken.

## Aktualisieren

Innerhalb von Version 7 holt Composer neue Versionen automatisch, weil in `composer.local.json` `~7.3` steht.

### 1. In den MediaWiki-Ordner wechseln

Composer arbeitet im Ordner des Wikis.

```bash
cd /var/www/mediawiki
```

### 2. Neue Version herunterladen

Aktualisiert SMW und die übrigen Bibliotheken von MediaWiki.

```bash
composer update --no-dev
```

### 3. Datenbank anpassen

Passt die Tabellen von MediaWiki und SMW bei Bedarf an die neuen Versionen an.

```bash
php maintenance/run.php update --quick
```

**Prüfen:** Die neue Versionsnummer steht auf **Spezial:Version**.

Für einen Sprung auf eine neue Hauptversion (z. B. 8.x) änderst du vorher die Zeile in `composer.local.json` und liest die Hinweise zur neuen Version auf <https://github.com/SemanticMediaWiki/SemanticMediaWiki/releases>.

## Deinstallieren

MediaWiki selbst bleibt dabei erhalten. Nur SMW und seine Daten werden entfernt.

### 1. In den MediaWiki-Ordner wechseln

Alle folgenden Befehle arbeiten im Ordner des Wikis.

```bash
cd /var/www/mediawiki
```

### 2. SMW-Daten aus der Datenbank löschen

Löscht alle SMW-Tabellen und damit alle gespeicherten Angaben. Das Skript geht nur, solange SMW noch eingeschaltet ist, deshalb kommt es zuerst. Zur Sicherheit fragt es nach: Tippe `DELETE` in Großbuchstaben und drücke <kbd>Enter</kbd>. Jede andere Eingabe bricht ab. Die Angaben im Text der Seiten, z. B. `[[Einwohner::34800]]`, bleiben erhalten. Sie werden danach als normale Links angezeigt.

```bash
php maintenance/run.php SemanticMediaWiki:setupStore --delete
```

### 3. SMW in MediaWiki ausschalten

Öffnet `LocalSettings.php`, um die Zeile aus Schritt 4 der Installation zu entfernen.

```bash
nano LocalSettings.php
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `SemanticMediaWiki` und bestätige mit <kbd>Enter</kbd>. Lösche die Zeile `wfLoadExtension( 'SemanticMediaWiki' );` mit <kbd>Strg</kbd>+<kbd>K</kbd>, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 4. SMW aus der Composer-Datei entfernen

Öffnet `composer.local.json`.

```bash
nano composer.local.json
```

Lösche die Zeile mit `mediawiki/semantic-media-wiki` (Suchen mit <kbd>Strg</kbd>+<kbd>W</kbd>, Löschen mit <kbd>Strg</kbd>+<kbd>K</kbd>). Stand SMW als einziger Eintrag in der Datei, bleibt ein leerer Block `"require": {}` stehen. Das ist in Ordnung. Achte darauf, dass die letzte verbleibende Zeile im Block kein Komma am Ende hat. Speichere und beende nano wie gewohnt.

### 5. SMW-Dateien entfernen

Composer entfernt jetzt den Ordner `extensions/SemanticMediaWiki` und alle Bibliotheken, die nur SMW gebraucht hat.

```bash
composer update --no-dev
```

**Prüfen:** Der Ordner existiert nicht mehr, und das Wiki antwortet weiterhin.

```bash
ls extensions/SemanticMediaWiki
```

```bash
curl -sI http://localhost:8085/Hauptseite
```

Der erste Befehl meldet `No such file or directory`, der zweite beginnt mit `HTTP/1.1 200 OK`.
