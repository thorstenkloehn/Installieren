# Directus

Directus ist ein Headless-CMS: Es legt eine Verwaltungsoberfläche und eine REST- und GraphQL-Schnittstelle über eine SQL-Datenbank. Tabellen und Felder richtet man im Browser ein, die Inhalte holen sich Websites, Apps oder Skripte über die Schnittstelle. Anders als bei [Strapi](strapi.md) entstehen dabei keine Code-Dateien, alles steht in der Datenbank.

## Vorbemerkungen

- **Kein apt-Paket:** Directus ist nicht in den Ubuntu-Paketquellen enthalten. Es wird **pro Projekt** über `npm` installiert. Node.js und npm kommen aus den Ubuntu-Paketquellen.
- **Voraussetzung:** [PostgreSQL](postgresql.md) ist installiert und läuft. Directus kann auch MySQL, MariaDB und SQLite verwenden.
- **Lizenz:** Directus ist **quelloffen, aber keine Open-Source-Software**. Es steht unter der „Monospace Sustainable Core License“ (MSCL). Kostenlos erlaubt sind unter anderem die eigene interne Nutzung, nicht kommerzielle Lehre und Forschung sowie das Einrichten für Kunden. Nicht erlaubt ist, Directus als Konkurrenzangebot zum kostenpflichtigen Angebot des Herstellers bereitzustellen. Jede Version wird vier Jahre nach ihrem Erscheinen zusätzlich unter der GPL-3.0 freigegeben. Den vollständigen Text findest du nach der Installation in `~/meindirectus/node_modules/directus/license`.
- **Adresse:** Directus läuft hier unter <http://localhost:8055>, nur vom eigenen Rechner aus erreichbar.
- **Version:** Getestet mit Directus **12.4.1** unter Node.js 22 und npm 9 aus Ubuntu 26.04 und PostgreSQL 18. Directus 12 braucht Node.js 22 oder neuer.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt Directus aus, `npm` lädt es herunter. Sind beide schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Ausgabe ist eine Versionsnummer ab `v22`, z. B. `v22.22.1`.

```bash
node --version
```

Hast du Node.js zusätzlich über den Versionsmanager `nvm` installiert, wird dessen Version angezeigt. Das ist in Ordnung, solange sie mindestens `v22` ist.

## Datenbank in PostgreSQL einrichten

### 3. Datenbankbenutzer anlegen

Directus meldet sich mit diesem Benutzer bei PostgreSQL an. Ersetze `geheimes_passwort` durch ein eigenes Passwort und merke es dir für Schritt 10.

```bash
sudo -u postgres psql -c "CREATE USER directus WITH PASSWORD 'geheimes_passwort';"
```

**Prüfen:** Die Ausgabe lautet `CREATE ROLE`.

### 4. Datenbank anlegen

```bash
sudo -u postgres psql -c "CREATE DATABASE directus OWNER directus ENCODING 'UTF8';"
```

**Prüfen:** Die Ausgabe lautet `CREATE DATABASE`.

## Projekt anlegen

### 5. Projektordner anlegen

In diesem Ordner liegen Directus, seine Einstellungen und die hochgeladenen Dateien.

```bash
mkdir ~/meindirectus
```

### 6. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meindirectus
```

### 7. Directus herunterladen

Lädt Directus mit allen Bibliotheken in den Unterordner `node_modules` und legt die Datei `package.json` an. Das dauert etwa eine Minute.

```bash
npm install directus
```

**Prüfen:** Die Ausgabe lautet `12.4.1` oder eine neuere Versionsnummer.

```bash
npx directus --version
```

### 8. Ordner für Uploads und Erweiterungen anlegen

Directus legt hochgeladene Dateien in `uploads` ab und lädt Erweiterungen aus `extensions`. Fehlen die Ordner, meldet Directus beim Start `is not read/writeable` bzw. `is not readable`.

```bash
mkdir uploads extensions
```

### 9. Geheimen Schlüssel erzeugen

Directus unterschreibt damit die Anmeldungen. Der Befehl gibt eine zufällige Zeichenkette aus 64 Zeichen aus. Markiere sie und kopiere sie mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>C</kbd>. Du brauchst sie im nächsten Schritt.

```bash
openssl rand -hex 32
```

### 10. Einstellungsdatei anlegen

Directus liest seine Einstellungen aus der Datei `.env` im Projektordner.

```bash
nano .env
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```ini
HOST=127.0.0.1
PORT=8055
PUBLIC_URL=http://localhost:8055
SECRET=HIER_DEN_SCHLUESSEL_EINSETZEN

DB_CLIENT=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=directus
DB_USER=directus
DB_PASSWORD=geheimes_passwort

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Ein-langes-Passwort-2026

TELEMETRY=false
PROJECT_OWNER_ENABLED=false
```

Passe dann diese Werte an:

- `SECRET` – ersetze `HIER_DEN_SCHLUESSEL_EINSETZEN` durch den Schlüssel aus Schritt 9.
- `DB_PASSWORD` – das Datenbankpasswort aus Schritt 3.
- `ADMIN_EMAIL` und `ADMIN_PASSWORD` – deine Anmeldedaten für die Verwaltung. Sie werden nur in Schritt 11 gebraucht.

Die übrigen Zeilen bedeuten:

- `HOST=127.0.0.1` und `PORT=8055` – Directus ist nur vom eigenen Rechner aus erreichbar.
- `DB_…` – die Verbindung zur Datenbank aus Schritt 3 und 4. `pg` steht für PostgreSQL.
- `TELEMETRY=false` – Directus schickt keine Nutzungsdaten an den Hersteller.
- `PROJECT_OWNER_ENABLED=false` – Directus fragt nicht nach einem „Projektinhaber“. Ohne diese Zeile erscheint nach der Anmeldung ein Dialog, der E-Mail-Adresse und Verwendungszweck an den Hersteller schickt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

Die Datei `.env` enthält Passwörter und den geheimen Schlüssel. Gib sie nicht weiter und lade sie nicht in ein öffentliches Git-Repository hoch.

### 11. Datenbank einrichten

`bootstrap` legt die Tabellen von Directus in der Datenbank an und erzeugt das Administratorkonto mit den Daten aus `ADMIN_EMAIL` und `ADMIN_PASSWORD`.

```bash
npx directus bootstrap
```

**Prüfen:** Die letzten Zeilen lauten `Adding first admin user...` und `Done`.

### 12. Administratorpasswort aus der Einstellungsdatei entfernen

Das Konto ist jetzt angelegt. Die beiden Zeilen werden nicht mehr gebraucht, und das Passwort soll nicht dauerhaft im Klartext in der Datei stehen.

```bash
nano .env
```

Drücke <kbd>Strg</kbd>+<kbd>W</kbd>, gib `ADMIN_EMAIL` ein und drücke <kbd>Enter</kbd>. Drücke dann zweimal <kbd>Strg</kbd>+<kbd>K</kbd>. Das löscht die Zeilen `ADMIN_EMAIL=…` und `ADMIN_PASSWORD=…`. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Der Befehl gibt nichts aus.

```bash
grep ADMIN_ .env
```

## Directus verwenden

### 13. Directus starten

Startet den Server im Terminal. Er läuft so lange, bis du ihn mit <kbd>Strg</kbd>+<kbd>C</kbd> beendest.

```bash
npx directus start
```

**Prüfen:** Nach wenigen Sekunden erscheint `Server started at http://127.0.0.1:8055`. Die Warnung `PostGIS isn't installed` kannst du ignorieren. PostGIS braucht man nur für Geodaten.

### 14. An der Verwaltung anmelden

Öffne <http://localhost:8055> im Browser. Directus leitet auf die Anmeldeseite unter `/admin` weiter. Melde dich mit E-Mail-Adresse und Passwort aus Schritt 10 an.

### 15. Lizenzfrage beantworten

Nach der ersten Anmeldung fragt Directus „Have a license key?“. Für die kostenlose Nutzung:

1. Klicke auf **I'm using Core plan**.
2. Wähle unter „What are you using Directus for?“ den passenden Zweck, z. B. **Personal / Side project**.
3. Klicke auf **Save**.

Die Antwort wird nur in deiner eigenen Datenbank gespeichert. Klickst du stattdessen auf **Skip**, erscheint die Frage bei jeder Anmeldung wieder.

**Prüfen:** Links steht „Content“ mit dem Hinweis „No Collections“.

### 16. Oberfläche auf Deutsch umstellen

1. Klicke in der linken Leiste auf das Zahnrad (**Settings**) und dann auf **Settings**.
2. Wähle im Feld **Default Language** den Eintrag **German (Germany)**.
3. Klicke oben rechts auf **Save** (Häkchen).
4. Lade die Seite mit <kbd>F5</kbd> neu.

**Prüfen:** Die Menüs heißen jetzt „Datenmodell“, „Benutzerrollen“, „Einstellungen“ usw. Die Einstellung gilt für alle Benutzer, die keine eigene Sprache gewählt haben.

### 17. Eine Sammlung anlegen

Eine **Sammlung** ist eine Tabelle in der Datenbank, z. B. für Artikel. Ein Beispiel:

1. Klicke in der linken Leiste auf das Zahnrad, dann auf **Datenmodell** und oben rechts auf **Erstellen**.
2. Gib als **Name** `artikel` ein. Klicke oben rechts auf **Weiter** und danach auf **Einrichtung abschließen**. Das Primärschlüsselfeld `id` legt Directus selbst an.
3. Klicke in der neuen Sammlung auf **Feld erstellen** und wähle **Eingabe**. Gib als **Schlüssel** `titel` ein und klicke auf **Speichern**.
4. Klicke in der linken Leiste ganz oben auf den Würfel (**Inhalt**), dann auf **Artikel** und oben rechts auf **Erstellen**. Gib einen Titel ein und klicke auf **Speichern**.

### 18. Artikel öffentlich lesbar machen

Ohne Anmeldung liefert die Schnittstelle zunächst nichts aus.

1. Klicke in der linken Leiste auf das Zahnrad, dann auf **Zugangsrichtlinien** und in der Liste auf **Öffentlich**.
2. Klicke unter „Permissions“ auf **Sammlung hinzufügen** und wähle `artikel`.
3. In der neuen Zeile `artikel` stehen die Aktionen „Erstellen“, „Lesen“, „Aktualisieren“, „Löschen“ und „Teilen“. Klicke auf **Lesen** und wähle **Kompletter Zugriff**. „Lesen“ wird daraufhin farbig hervorgehoben.
4. Klicke oben rechts auf **Speichern**.

**Prüfen:** Öffne ein zweites Terminal. Die Ausgabe enthält deinen Artikel, z. B. `{"data":[{"id":1,"titel":"Hallo Directus"}]}`. Vor der Freigabe steht dort `You don't have permission to access collection "artikel"`.

```bash
curl http://localhost:8055/items/artikel
```

Beende Directus im ersten Terminal mit <kbd>Strg</kbd>+<kbd>C</kbd>.

## Aktualisieren

Lege vorher eine Sicherung des Projektordners und der Datenbank an.

### 1. In den Projektordner wechseln

```bash
cd ~/meindirectus
```

### 2. Nach neuen Versionen sehen

Zeigt eine Tabelle mit der installierten (`Current`) und der neuesten Version (`Latest`). Gibt der Befehl nichts aus, ist Directus aktuell.

```bash
npm outdated directus
```

### 3. Directus aktualisieren

Installiert die neueste Version. Beim Sprung auf eine neue Hauptversion (z. B. von 12 auf 13) liest man vorher die Hinweise unter <https://directus.com/docs>.

```bash
npm install directus@latest
```

### 4. Datenbank anpassen

Neue Versionen bringen oft geänderte Tabellen mit. Directus muss dafür beendet sein.

```bash
npx directus database migrate:latest
```

**Prüfen:** Die Ausgabe endet mit `Database up to date`.

## Deinstallieren

### 1. Directus beenden

Läuft Directus noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projektordner löschen

**Achtung:** Damit sind auch hochgeladene Bilder und Dateien gelöscht. Sie liegen in `~/meindirectus/uploads`.

```bash
rm -r ~/meindirectus
```

### 3. Datenbank löschen

**Achtung:** Damit sind alle Sammlungen, Inhalte und Konten gelöscht.

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS directus;"
```

### 4. Datenbankbenutzer löschen

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS directus;"
```

**Prüfen:** Directus ist nicht mehr erreichbar, `curl` meldet `Failed to connect`.

```bash
curl http://localhost:8055
```

### 5. npm-Zwischenspeicher leeren (optional)

npm bewahrt heruntergeladene Pakete in `~/.npm` auf. Dieser Befehl leert den ganzen Speicher. Das betrifft alle Node.js-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
npm cache clean --force
```

Node.js, npm und PostgreSQL bleiben installiert, weil andere Anleitungen sie ebenfalls verwenden.
