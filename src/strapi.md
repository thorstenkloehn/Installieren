# Strapi

Strapi ist ein Headless-CMS: Es verwaltet Inhalte wie Artikel, Produkte oder Termine in einer Verwaltungsoberfläche im Browser und gibt sie über eine REST- oder GraphQL-Schnittstelle aus. Die eigentliche Website oder App baut man getrennt davon, z. B. mit [Astro](starlight.md), React, einer Handy-App oder einem statischen Website-Generator.

## Vorbemerkungen

- **Kein apt-Paket:** Strapi ist nicht in den Ubuntu-Paketquellen enthalten. Es wird **pro Projekt** über `npm` installiert. Node.js und npm kommen aus den Ubuntu-Paketquellen.
- **Voraussetzung:** [PostgreSQL](postgresql.md) ist installiert und läuft. Strapi kann auch SQLite, MySQL und MariaDB verwenden. Für den Dauerbetrieb empfiehlt sich aber eine richtige Datenbank.
- **Zwei Betriebsarten:** Im **Entwicklungsmodus** (`npm run develop`) legt man fest, welche Arten von Inhalten es gibt, z. B. „Artikel“ mit Titel, Text und Bild. Im **Produktionsmodus** (`npm run start`) pflegt man nur noch Inhalte, die Struktur ist dann gesperrt.
- **Adresse:** Strapi läuft hier unter <http://localhost:1337>, nur vom eigenen Rechner aus erreichbar.
- **Version:** Getestet mit Strapi **5.55.1** unter Node.js 22 und npm 9 aus Ubuntu 26.04 und PostgreSQL 18. Strapi 5 braucht Node.js 20 oder neuer.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt Strapi aus, `npm` lädt es herunter. Sind beide schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Ausgabe ist eine Versionsnummer ab `v20`, z. B. `v22.22.1`.

```bash
node --version
```

Hast du Node.js zusätzlich über den Versionsmanager `nvm` installiert, wird dessen Version angezeigt. Das ist in Ordnung, solange sie zwischen `v20` und `v26` liegt.

## Datenbank in PostgreSQL einrichten

### 3. Datenbankbenutzer anlegen

Strapi meldet sich mit diesem Benutzer bei PostgreSQL an. Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 5.

```bash
sudo -u postgres psql -c "CREATE USER strapi WITH PASSWORD 'geheimes_passwort';"
```

**Prüfen:** Die Ausgabe lautet `CREATE ROLE`.

### 4. Datenbank anlegen

```bash
sudo -u postgres psql -c "CREATE DATABASE strapi OWNER strapi ENCODING 'UTF8';"
```

**Prüfen:** Die Ausgabe lautet `CREATE DATABASE`.

## Projekt anlegen

### 5. Strapi-Projekt erzeugen

`npx` lädt das Einrichtungsprogramm `create-strapi` und legt damit das Projekt `~/meinstrapi` an. Die Optionen beantworten alle Fragen im Voraus:

- `--no-run` – Strapi nach dem Anlegen noch nicht starten.
- `--ts` und `--use-npm` – das Projekt in TypeScript anlegen und npm als Paketmanager verwenden.
- `--skip-cloud` – keine Anmeldung beim kostenpflichtigen Dienst Strapi Cloud.
- `--no-example` und `--no-git-init` – ohne Beispieldaten und ohne Git-Repository.
- `--db…` – die Verbindung zur Datenbank aus Schritt 3 und 4. Setze bei `--dbpassword` dein Passwort ein.

```bash
npx create-strapi@latest ~/meinstrapi --no-run --ts --use-npm --install --skip-cloud --no-example --no-git-init --dbclient=postgres --dbhost=127.0.0.1 --dbport=5432 --dbname=strapi --dbusername=strapi --dbpassword=geheimes_passwort --dbssl=false
```

Die Frage `Need to install the following packages: create-strapi … Ok to proceed? (y)` beantwortest du mit <kbd>Enter</kbd>. Das Herunterladen aller Pakete dauert einige Minuten.

**Prüfen:** Die Ausgabe enthält `✓ Dependencies installed` und `Your application was created!`.

### 6. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinstrapi
```

### 7. Nur vom eigenen Rechner erreichbar machen

In der Datei `.env` stehen Einstellungen, Datenbankpasswort und geheime Schlüssel. Voreingestellt ist `HOST=0.0.0.0`: Strapi wäre dann von jedem Rechner im Netzwerk erreichbar.

```bash
nano .env
```

Ändere die Zeile `HOST=0.0.0.0` ganz oben in:

```ini
HOST=127.0.0.1
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

Die Datei `.env` enthält geheime Schlüssel. Gib sie nicht weiter und lade sie nicht in ein öffentliches Git-Repository hoch.

### 8. Telemetrie abschalten

Strapi schickt sonst anonyme Nutzungsdaten an den Hersteller. Der Befehl trägt `"telemetryDisabled": true` in die Datei `package.json` ein.

```bash
npm run strapi telemetry:disable
```

**Prüfen:** Die Ausgabe endet mit `Successfully opted out of Strapi telemetry`.

### 9. Deutsche Oberfläche freischalten

Die Verwaltung ist zunächst nur auf Englisch verfügbar. Weitere Sprachen schaltet man in der Datei `src/admin/app.tsx` frei.

```bash
nano src/admin/app.tsx
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```typescript
import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['de'],
  },
  bootstrap(app: StrapiApp) {},
};
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Administratorkonto anlegen

Legt das erste Konto für die Verwaltung an. Setze deinen Namen, deine E-Mail-Adresse und ein Passwort mit mindestens 8 Zeichen, Groß- und Kleinbuchstaben und einer Ziffer ein. Das Passwort landet dabei in der Befehlschronik des Terminals. Ändere es nach der ersten Anmeldung in der Verwaltung unter „Profil-Einstellungen“.

```bash
npm run strapi admin:create-user -- --firstname=Dein --lastname=Name --email=admin@example.com --password='Ein-langes-Passwort-2026'
```

`--` trennt die Optionen für Strapi von denen für npm.

**Prüfen:** Die letzte Zeile lautet `Successfully created new admin`. Eine Warnung zum E-Mail-Anbieter `sendmail` kannst du ignorieren.

## Strapi verwenden

### 11. Im Entwicklungsmodus starten

Startet Strapi, baut die Verwaltung und startet neu, sobald sich Dateien im Projekt ändern. Nur in diesem Modus kann man neue Inhaltstypen anlegen.

```bash
npm run develop
```

**Prüfen:** Nach etwa einer Minute erscheint `Strapi started successfully`.

### 12. Verwaltung öffnen und Sprache wählen

Öffne <http://localhost:1337/admin> im Browser. Klicke oben auf der Anmeldeseite auf das Auswahlfeld **English** und wähle **Deutsch**. Melde dich dann mit E-Mail-Adresse und Passwort aus Schritt 10 an. Der Browser merkt sich die Sprache.

**Prüfen:** Die Startseite begrüßt dich mit „Hallo Dein“. Links stehen unter anderem „Content Manager“, „Medienbibliothek“, „Inhaltstyp-Editor“ und „Einstellungen“. Die Sprache lässt sich später auch unter „Profil-Einstellungen“ ändern.

### 13. Einen Inhaltstyp anlegen

Im **Inhaltstyp-Editor** legst du fest, welche Felder ein Inhalt hat. Ein Beispiel:

1. Klicke im Bereich **Sammlungen** auf **Neue Sammlung erstellen** und gib als Namen `Artikel` ein.
2. Füge ein Feld vom Typ **Text** mit dem Namen `titel` hinzu.
3. Füge ein Feld vom Typ **Formatierter Text (Blocks)** mit dem Namen `inhalt` hinzu.
4. Speichere. Strapi legt dafür Dateien im Ordner `src/api/artikel` an und startet danach kurz neu.

Anschließend kannst du im **Content Manager** Artikel schreiben und veröffentlichen. Damit andere Programme sie ohne Anmeldung abrufen dürfen, öffnest du **Einstellungen**, dann im Bereich **Nutzer- & Berechtigungen-Plugin** den Punkt **Rollen** und die Rolle **Public**. Gib dort beim Typ „Artikel“ die Aktionen `find` und `findOne` frei und speichere.

Beende den Entwicklungsmodus mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 14. Verwaltung für den Produktionsmodus bauen

Erzeugt eine fertige, schnellere Fassung der Verwaltung im Ordner `dist`. Das ist nach jeder Änderung an `src/admin` und nach jedem Update nötig.

```bash
NODE_ENV=production npm run build
```

**Prüfen:** Die Ausgabe endet mit `✔ Building admin panel`.

### 15. Im Produktionsmodus starten

Startet Strapi ohne Beobachtung der Dateien. Der Inhaltstyp-Editor ist hier nur lesbar, Inhalte pflegst du wie gewohnt.

```bash
NODE_ENV=production npm run start
```

**Prüfen:** Die Ausgabe enthält `Strapi started successfully`. Die Verwaltung ist wieder unter <http://localhost:1337/admin> erreichbar. Ein Aufruf von <http://localhost:1337/api/artikels> zeigt die veröffentlichten Artikel als JSON, wenn du sie in Schritt 13 freigegeben hast. Strapi hängt dafür ein „s“ an den Namen des Typs an.

Beende Strapi mit <kbd>Strg</kbd>+<kbd>C</kbd>.

## Aktualisieren

Strapi bringt ein eigenes Werkzeug für Updates mit. Es aktualisiert die Pakete und passt bei Bedarf den Code des Projekts an. Lege vorher eine Sicherung des Projektordners und der Datenbank an.

### 1. In den Projektordner wechseln

```bash
cd ~/meinstrapi
```

### 2. Update ausprobieren

`--dry` zeigt nur, was sich ändern würde. `minor` bleibt innerhalb der Hauptversion 5.

```bash
npx @strapi/upgrade minor --dry
```

**Prüfen:** Die Ausgabe listet die geplanten Änderungen oder meldet `The project is already up-to-date (minor)`.

### 3. Update einspielen

```bash
npx @strapi/upgrade minor
```

### 4. Verwaltung neu bauen

```bash
NODE_ENV=production npm run build
```

Den Sprung auf eine neue Hauptversion macht man mit `npx @strapi/upgrade major`, nachdem man die Hinweise unter <https://docs.strapi.io> gelesen hat.

## Deinstallieren

### 1. Strapi beenden

Läuft Strapi noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projektordner löschen

**Achtung:** Damit sind auch hochgeladene Bilder und Dateien gelöscht. Sie liegen in `~/meinstrapi/public/uploads`.

```bash
rm -r ~/meinstrapi
```

### 3. Datenbank löschen

**Achtung:** Damit sind alle Inhalte, Inhaltstypen und Konten gelöscht.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS strapi;"
```

### 4. Datenbankbenutzer löschen

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS strapi;"
```

**Prüfen:** Strapi ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:1337
```

### 5. npm-Zwischenspeicher leeren (optional)

npm bewahrt heruntergeladene Pakete in `~/.npm` auf. Dieser Befehl leert den ganzen Speicher. Das betrifft alle Node.js-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
npm cache clean --force
```

Node.js, npm und PostgreSQL bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.
