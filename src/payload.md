# Payload CMS

Payload ist ein Headless-CMS, bei dem man Inhaltstypen als TypeScript-Code beschreibt. Daraus erzeugt es eine Verwaltungsoberfläche, eine REST- und GraphQL-Schnittstelle und die passenden Tabellen in der Datenbank. Payload baut auf dem Webframework Next.js auf, deshalb kann dasselbe Projekt auch die eigentliche Website ausliefern. Anders als [Directus](directus.md) steht Payload unter der freien MIT-Lizenz.

## Vorbemerkungen

- **Kein apt-Paket:** Payload ist nicht in den Ubuntu-Paketquellen enthalten. Es wird **pro Projekt** über `npm` installiert. Node.js und npm kommen aus den Ubuntu-Paketquellen.
- **Voraussetzung:** [PostgreSQL](postgresql.md) ist installiert und läuft. Payload kann auch MongoDB und SQLite verwenden.
- **Code statt Klicks:** Neue Inhaltstypen („Sammlungen“) legt man nicht in der Oberfläche an, sondern als Datei im Ordner `src/collections`. Grundkenntnisse in [TypeScript](typescript.md) oder [JavaScript](javascript.md) helfen, sind für diese Anleitung aber nicht nötig.
- **Adresse:** Payload läuft hier unter <http://localhost:3001>, nur vom eigenen Rechner aus erreichbar. Der voreingestellte Port 3000 ist auf diesem Rechner schon von [Martin](martin.md) belegt.
- **Version:** Getestet mit Payload **3.90.2** und Next.js 16.3 unter Node.js 22 und npm 9 aus Ubuntu 26.04 und PostgreSQL 18.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt Payload aus, `npm` lädt es herunter. Sind beide schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Ausgabe ist eine Versionsnummer ab `v20.9`, z. B. `v22.22.1`.

```bash
node --version
```

Hast du Node.js zusätzlich über den Versionsmanager `nvm` installiert, wird dessen Version angezeigt. Das ist in Ordnung, solange sie mindestens `v20.9` ist.

## Datenbank in PostgreSQL einrichten

### 3. Datenbankbenutzer anlegen

Payload meldet sich mit diesem Benutzer bei PostgreSQL an. Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 6. Verwende nur Buchstaben, Ziffern, `-` und `_`, weil das Passwort in Schritt 6 Teil einer Adresse ist.

```bash
sudo -u postgres psql -c "CREATE USER payload WITH PASSWORD 'geheimes_passwort';"
```

**Prüfen:** Die Ausgabe lautet `CREATE ROLE`.

### 4. Datenbank anlegen

```bash
sudo -u postgres psql -c "CREATE DATABASE payload OWNER payload ENCODING 'UTF8';"
```

**Prüfen:** Die Ausgabe lautet `CREATE DATABASE`.

## Projekt anlegen

### 5. In das Home-Verzeichnis wechseln

Das Projekt wird im aktuellen Ordner angelegt.

```bash
cd ~
```

### 6. Payload-Projekt erzeugen

`npx` lädt das Einrichtungsprogramm `create-payload-app` und legt damit das Projekt `~/meinpayload` an. Die Optionen beantworten alle Fragen im Voraus:

- `-n meinpayload` – der Name des Projektordners.
- `-t blank` – die leere Vorlage mit Benutzern und einer Medienbibliothek. Die Vorlage `website` bringt zusätzlich eine fertige Website mit.
- `--db postgres` und `--db-connection-string` – die Datenbank aus Schritt 3 und 4. Die Adresse ist so aufgebaut: `postgres://BENUTZER:PASSWORT@RECHNER:PORT/DATENBANK`. Setze dein Passwort ein.
- `--use-npm` – npm als Paketmanager verwenden.
- `--no-agent` und `--no-git` – keine Anleitungsdateien für KI-Assistenten und kein Git-Repository anlegen.

```bash
npx create-payload-app@latest -n meinpayload -t blank --db postgres --db-connection-string postgres://payload:geheimes_passwort@127.0.0.1:5432/payload --use-npm --no-agent --no-git
```

Die Frage `Need to install the following packages: create-payload-app … Ok to proceed? (y)` beantwortest du mit <kbd>Enter</kbd>. Das Herunterladen aller Pakete dauert etwa eine Minute.

**Prüfen:** Die Ausgabe enthält `Successfully installed Payload and dependencies` und `Payload project successfully created!`.

Das Programm schreibt die Datenbankadresse und einen zufälligen geheimen Schlüssel (`PAYLOAD_SECRET`) in die Datei `.env` im Projektordner. Gib sie nicht weiter und lade sie nicht in ein öffentliches Git-Repository hoch.

### 7. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinpayload
```

### 8. Telemetrie von Next.js abschalten

Next.js schickt sonst anonyme Nutzungsdaten an den Hersteller Vercel. Die Einstellung gilt für alle Next.js-Projekte deines Benutzers. Für Payload selbst schaltet Schritt 10 die Telemetrie ab.

```bash
npx next telemetry disable
```

**Prüfen:** Die Ausgabe enthält `Status: Disabled`.

### 9. Sammlung „Artikel“ anlegen

Diese Datei beschreibt einen Inhaltstyp mit Titel und formatiertem Text. `slug` ist der Name in der Datenbank und in der Adresse der Schnittstelle. `read: () => true` erlaubt jedem, Artikel über die Schnittstelle zu lesen. Anlegen, Ändern und Löschen bleibt angemeldeten Benutzern vorbehalten.

```bash
nano src/collections/Artikel.ts
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```typescript
import type { CollectionConfig } from 'payload'

export const Artikel: CollectionConfig = {
  slug: 'artikel',
  labels: {
    singular: 'Artikel',
    plural: 'Artikel',
  },
  admin: {
    useAsTitle: 'titel',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'titel',
      label: 'Titel',
      type: 'text',
      required: true,
    },
    {
      name: 'inhalt',
      label: 'Inhalt',
      type: 'richText',
    },
  ],
}
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Hauptkonfiguration anpassen

In `src/payload.config.ts` stehen alle Einstellungen des Projekts. Hier wird die neue Sammlung eingebunden, die Oberfläche auf Deutsch gestellt und die Telemetrie von Payload abgeschaltet.

```bash
nano src/payload.config.ts
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein:

```typescript
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { de } from '@payloadcms/translations/languages/de'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Artikel } from './collections/Artikel'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Artikel],
  editor: lexicalEditor(),
  i18n: {
    supportedLanguages: { de },
    fallbackLanguage: 'de',
  },
  telemetry: false,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
```

Gegenüber der Vorlage neu sind:

- `import { de } …` und der Block `i18n` – die Verwaltung erscheint auf Deutsch, unabhängig von der Sprache des Browsers.
- `import { Artikel } …` und `Artikel` in der Liste `collections` – bindet die Sammlung aus Schritt 9 ein.
- `telemetry: false` – Payload schickt keine Nutzungsdaten an den Hersteller.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

## Payload verwenden

### 11. Im Entwicklungsmodus starten

Im Entwicklungsmodus legt Payload fehlende Tabellen in der Datenbank selbst an und lädt Änderungen an den Dateien sofort nach. `--` gibt die folgenden Optionen an Next.js weiter: `-p 3001` wählt den Port, `-H 127.0.0.1` macht Payload nur vom eigenen Rechner aus erreichbar.

```bash
npm run dev -- -p 3001 -H 127.0.0.1
```

**Prüfen:** Nach wenigen Sekunden erscheint `✓ Ready`. Beim ersten Aufruf einer Seite folgen `Pulling schema from database...` und die Tabellen werden angelegt. Die Warnung `No email adapter provided` kannst du ignorieren: Ohne Mailserver schreibt Payload E-Mails, z. B. zum Zurücksetzen von Passwörtern, nur ins Terminal.

### 12. Ersten Benutzer anlegen

Öffne <http://localhost:3001/admin> im Browser. Der erste Aufruf dauert einige Sekunden, weil Next.js die Seite erst übersetzt. Payload zeigt die Seite „Willkommen“, weil es noch keinen Benutzer gibt. Gib E-Mail-Adresse und zweimal ein Passwort ein und klicke auf **Erstellen**.

**Prüfen:** Die Übersicht zeigt unter „Sammlungen“ die Einträge „Users“, „Media“ und „Artikel“. „Users“ und „Media“ heißen so in der Vorlage, du kannst sie in `src/collections/Users.ts` und `Media.ts` genauso mit `labels` umbenennen wie in Schritt 9.

### 13. Einen Artikel anlegen

Klicke auf **Artikel** und dann auf **Neu erstellen**. Gib einen Titel und etwas Text ein und klicke oben rechts auf **Speichern**.

### 14. Artikel über die Schnittstelle abrufen

Öffne ein zweites Terminal. `depth=0` liefert verknüpfte Einträge nur als Nummer statt vollständig.

```bash
curl "http://localhost:3001/api/artikel?depth=0"
```

**Prüfen:** Die Ausgabe beginnt mit `{"docs":[{"id":1,"titel":"…"` und enthält deinen Artikel. Die Benutzerliste unter `/api/users` bleibt ohne Anmeldung gesperrt, dort erscheint `Du hast keine Berechtigung, diese Aktion auszuführen.`

Beende den Entwicklungsmodus im ersten Terminal mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 15. Produktionsfassung bauen

Next.js übersetzt das ganze Projekt in eine schnelle, fertige Fassung im Ordner `.next`. Das ist nach jeder Änderung an den Dateien und nach jedem Update nötig.

```bash
npm run build
```

**Prüfen:** Die Ausgabe enthält `✓ Compiled successfully` und endet mit einer Liste der Adressen (`Route (app)`).

### 16. Im Produktionsmodus starten

Startet die fertige Fassung. Die Tabellen hat der Entwicklungsmodus in Schritt 11 schon angelegt.

```bash
npm run start -- -p 3001 -H 127.0.0.1
```

**Prüfen:** Es erscheint `✓ Ready`. Die Verwaltung ist wieder unter <http://localhost:3001/admin> erreichbar, die Startseite <http://localhost:3001> zeigt „Welcome to your new project.“ aus der Vorlage.

Beende Payload mit <kbd>Strg</kbd>+<kbd>C</kbd>.

Für den Betrieb auf einem Server legt man Änderungen an der Datenbank nicht über den Entwicklungsmodus an, sondern mit Migrationen (`npm run payload migrate:create` und `npm run payload migrate`). Die Hinweise dazu stehen unter <https://payloadcms.com/docs/database/migrations>.

## Aktualisieren

Lege vorher eine Sicherung des Projektordners und der Datenbank an.

### 1. In den Projektordner wechseln

```bash
cd ~/meinpayload
```

### 2. Nach neuen Versionen sehen

Zeigt eine Tabelle mit der installierten (`Current`) und der neuesten Version (`Latest`). Gibt der Befehl nichts aus, ist Payload aktuell.

```bash
npm outdated payload
```

### 3. Payload aktualisieren

Die Pakete von Payload müssen immer dieselbe Version haben. Deshalb werden alle zusammen aktualisiert.

```bash
npm install payload@latest @payloadcms/next@latest @payloadcms/ui@latest @payloadcms/richtext-lexical@latest @payloadcms/db-postgres@latest
```

npm meldet danach oft `vulnerabilities`. Die Warnungen betreffen meist Werkzeuge, die nur beim Entwickeln laufen. Führe nicht `npm audit fix --force` aus: Der Befehl springt auf andere Hauptversionen und kann das Projekt unbrauchbar machen.

### 4. Produktionsfassung neu bauen

```bash
npm run build
```

Den Sprung auf eine neue Hauptversion (z. B. von 3 auf 4) macht man erst, nachdem man die Hinweise unter <https://payloadcms.com/docs> gelesen hat.

## Deinstallieren

### 1. Payload beenden

Läuft Payload noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projektordner löschen

**Achtung:** Damit sind auch hochgeladene Bilder und Dateien gelöscht. Sie liegen in `~/meinpayload/media`.

```bash
rm -r ~/meinpayload
```

### 3. Datenbank löschen

**Achtung:** Damit sind alle Inhalte und Benutzer gelöscht.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS payload;"
```

### 4. Datenbankbenutzer löschen

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS payload;"
```

**Prüfen:** Payload ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:3001
```

### 5. npm-Zwischenspeicher leeren (optional)

npm bewahrt heruntergeladene Pakete in `~/.npm` auf. Dieser Befehl leert den ganzen Speicher. Das betrifft alle Node.js-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
npm cache clean --force
```

Node.js, npm und PostgreSQL bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.
