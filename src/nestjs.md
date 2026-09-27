# NestJS

NestJS (kurz Nest) ist ein Framework für Server-Anwendungen mit Node.js und [TypeScript](typescript.md). Es baut auf [Express](express.md) auf und gibt größeren Projekten eine feste Ordnung: Controller nehmen Anfragen entgegen, Services enthalten die eigentliche Arbeit, Module fassen beides zusammen. Welche Methode welche Adresse beantwortet, steht als Decorator (`@Get`, `@Post`) direkt im Code.

## Vorbemerkungen

- **Installation pro Projekt:** Aus den Ubuntu-Paketquellen kommen nur Node.js und npm. Nest selbst und sein Befehlszeilenwerkzeug (Nest CLI) lädt `npm` in jedes Projekt einzeln.
- **Einstellung für npm:** Das npm 9.2 aus Ubuntu 26.04 bricht die Installation eines neuen Nest-Projekts mit `Cannot read properties of null (reading 'edgesOut')` ab. Ursache ist, dass eine Testbibliothek des Projekts TypeScript 5 erwartet, das Projekt aber TypeScript 6 verwendet. Neuere npm-Versionen melden das nur als Warnung. Schritt 6 stellt npm für das Projekt so ein, dass es diesen Widerspruch übergeht.
- **Port 8000:** Nest lauscht ohne Angabe auf Port 3000. Das Beispiel legt Port 8000 fest, weil 3000 oft schon belegt ist, etwa von [Martin](martin.md). Port 8000 darf nicht von einem anderen Programm belegt sein.
- **Gleiches Beispiel:** Das Projekt bekommt dieselbe kleine Notiz-Schnittstelle wie die Anleitungen zu [Express](express.md), [FastAPI](fastapi.md), [Flask](flask.md) und [Gin](gin.md). Die Notizen liegen nur im Arbeitsspeicher.
- **Version:** Getestet mit NestJS **12.1** (Nest CLI 12.0.7), TypeScript 6, Node.js 22.22.1 und npm 9.2.0 aus Ubuntu 26.04. Nest 12 braucht Node.js 20 oder neuer.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt den Server aus, `npm` lädt Nest und alle Bibliotheken herunter. Ist beides schon vorhanden (z. B. aus der [Express-Anleitung](express.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Versionsnummer beginnt mit `v20` oder höher, z. B. `v22.22.1`.

```bash
node --version
```

## Erstes Projekt

### 3. In das Home-Verzeichnis wechseln

Das Projekt wird im aktuellen Ordner angelegt.

```bash
cd ~
```

### 4. Projekt anlegen

`npx` lädt die Nest CLI nur für diesen einen Aufruf herunter, ohne sie dauerhaft zu installieren. `new meinnest` legt den Ordner `meinnest` mit einem fertigen Projekt samt Git-Repository an. `--package-manager npm` beantwortet die Frage nach dem Paketmanager im Voraus. `--skip-install` lässt die Bibliotheken zunächst weg, sie folgen nach der Einstellung in Schritt 6.

```bash
npx @nestjs/cli@latest new meinnest --package-manager npm --skip-install
```

Fragt npm `Need to install the following packages: @nestjs/cli@… Ok to proceed? (y)`, bestätige mit <kbd>Enter</kbd>.

**Prüfen:** Die Ausgabe listet viele Zeilen `CREATE meinnest/…`, darunter `CREATE meinnest/src/main.ts`, und endet mit `Thanks for installing Nest`.

### 5. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinnest
```

### 6. npm für das Projekt einstellen

Eine Datei `.npmrc` im Projektordner gilt nur für dieses Projekt. `legacy-peer-deps=true` sagt npm, dass es nicht auf Versionsangaben achten soll, die eine Bibliothek an ihre Nachbarn stellt (Peer-Abhängigkeiten). So kommt das npm aus Ubuntu über den Widerspruch aus den Vorbemerkungen hinweg. Die Datei ist neu, nano startet mit einer leeren Seite.

```bash
nano .npmrc
```

Füge diese Zeile ein:

```ini
legacy-peer-deps=true
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. Bibliotheken installieren

Lädt Nest, TypeScript, die Nest CLI und die Testwerkzeuge in den Ordner `node_modules`.

```bash
npm install
```

**Prüfen:** Die Ausgabe enthält `added 348 packages` (die Zahl kann abweichen). Die Meldung über `vulnerabilities` betrifft Werkzeuge für die Entwicklung. `npm audit fix --force` solltest du nicht ausführen, es kann Bibliotheken auf unpassende Versionen ändern.

### 8. Service erzeugen

Ein **Service** enthält die eigentliche Arbeit, hier das Verwalten der Notizen. `npx nest` ruft die Nest CLI aus `node_modules` auf. `--flat` legt die Datei direkt in `src` statt in einem eigenen Unterordner an, `--no-spec` lässt die Testdatei weg. Nest trägt den Service selbst in `src/app.module.ts` ein.

```bash
npx nest generate service notizen --flat --no-spec
```

**Prüfen:** Die Ausgabe lautet `CREATE src/notizen.service.ts` und `UPDATE src/app.module.ts`.

### 9. Controller erzeugen

Ein **Controller** nimmt Anfragen entgegen und gibt sie an den Service weiter.

```bash
npx nest generate controller notizen --flat --no-spec
```

**Prüfen:** Die Ausgabe lautet `CREATE src/notizen.controller.ts` und `UPDATE src/app.module.ts`.

### 10. Service ausfüllen

```bash
nano src/notizen.service.ts
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';

export interface Notiz {
  id: number;
  titel: string;
}

@Injectable()
export class NotizenService {
  // Notizen nur im Arbeitsspeicher: Nach einem Neustart sind sie weg
  private readonly notizen: Notiz[] = [];

  alle(): Notiz[] {
    return this.notizen;
  }

  eine(id: number): Notiz {
    const notiz = this.notizen.find((n) => n.id === id);
    if (!notiz) {
      throw new NotFoundException('Notiz nicht gefunden');
    }
    return notiz;
  }

  anlegen(titel: string): Notiz {
    const notiz = { id: this.notizen.length + 1, titel };
    this.notizen.push(notiz);
    return notiz;
  }
}
```

- `interface Notiz` – beschreibt, wie eine Notiz aussieht. TypeScript prüft damit beim Übersetzen, dass überall die richtigen Felder verwendet werden.
- `@Injectable()` – erlaubt Nest, den Service selbst zu erzeugen und an Controller weiterzugeben.
- `NotFoundException` – bricht ab. Nest macht daraus eine Antwort mit Status `404` und der Meldung als JSON.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Controller ausfüllen

```bash
nano src/notizen.controller.ts
```

Ersetze den ganzen Inhalt wie in Schritt 10 und füge ein:

```typescript
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Notiz } from './notizen.service.js';
import { NotizenService } from './notizen.service.js';

// Alle Routen dieser Klasse beginnen mit /notizen
@Controller('notizen')
export class NotizenController {
  // Nest übergibt den Service selbst (Dependency Injection)
  constructor(private readonly notizenService: NotizenService) {}

  // GET /notizen liefert alle Notizen
  @Get()
  alle(): Notiz[] {
    return this.notizenService.alle();
  }

  // GET /notizen/1 liefert eine Notiz oder 404
  @Get(':id')
  eine(@Param('id', ParseIntPipe) id: number): Notiz {
    return this.notizenService.eine(id);
  }

  // POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
  @Post()
  anlegen(
    @Body('titel') titel: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Notiz {
    if (typeof titel !== 'string' || titel === '') {
      throw new BadRequestException('Feld "titel" fehlt');
    }
    const notiz = this.notizenService.anlegen(titel);
    res.location(`/notizen/${notiz.id}`);
    return notiz;
  }
}
```

- **Decorators** – `@Controller('notizen')` legt den gemeinsamen Anfang der Adressen fest, `@Get()` und `@Post()` die Methode, `@Get(':id')` einen Platzhalter.
- **Parameter-Decorators** – füllen die Parameter der Methoden: `@Param('id')` aus der Adresse, `@Body('titel')` aus dem mitgeschickten JSON. `ParseIntPipe` wandelt die Nummer in eine Zahl um und antwortet selbst mit `400`, wenn das nicht geht.
- **Rückgabewert** – Nest wandelt ihn in JSON um. Bei `@Post()` setzt Nest den Status `201` von selbst.
- `@Res({ passthrough: true })` – gibt Zugriff auf die Express-Antwort, hier für die Kopfzeile `Location`. `passthrough` sorgt dafür, dass Nest den Rückgabewert trotzdem als JSON sendet.
- `import type` – `Notiz` ist nur ein Typ, der nach dem Übersetzen verschwindet. Ohne `type` bricht das Übersetzen mit dem Fehler `TS1272` ab.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Begrüßung ergänzen

Der Controller der Vorlage in `src/app.controller.ts` beantwortet schon die Startseite `/` mit `Hello World!`. Er bekommt zusätzlich die Route `/hallo`.

```bash
nano src/app.controller.ts
```

Ändere in der ersten Zeile `{ Controller, Get }` in `{ Controller, Get, Query }`. Drücke dann <kbd>Strg</kbd>+<kbd>W</kbd>, gib `getHello()` ein und drücke <kbd>Enter</kbd>. Setze den Cursor in die Zeile mit der schließenden Klammer `}` direkt unter `return this.appService.getHello();`, drücke <kbd>Ende</kbd> und dann <kbd>Enter</kbd> und füge ein:

```typescript

  // GET /hallo?name=... liefert eine Begrüßung als JSON
  @Get('hallo')
  hallo(@Query('name') name = 'Welt') {
    return { gruss: `Hallo ${name}!` };
  }
```

Die Klasse sieht danach so aus:

```typescript
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // GET /hallo?name=... liefert eine Begrüßung als JSON
  @Get('hallo')
  hallo(@Query('name') name = 'Welt') {
    return { gruss: `Hallo ${name}!` };
  }
}
```

`@Query('name')` liest den Wert aus `?name=…`. Fehlt er, gilt der Vorgabewert `'Welt'`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Adresse und Port festlegen

In `src/main.ts` startet der Server. Ohne Angabe wäre er auf Port 3000 aus dem ganzen Netz erreichbar.

```bash
nano src/main.ts
```

Ersetze die Zeile

```typescript
  await app.listen(process.env.PORT ?? 3000);
```

durch diese beiden Zeilen:

```typescript
  // Nur vom eigenen Rechner aus erreichbar, Port 8000
  await app.listen(8000, '127.0.0.1');
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

## Starten und testen

### 14. Server im Entwicklungsmodus starten

`start:dev` übersetzt den TypeScript-Code, startet den Server und beobachtet danach alle Dateien in `src`. Das Terminal bleibt belegt.

```bash
npm run start:dev
```

**Prüfen:** Die Ausgabe enthält `Found 0 errors. Watching for file changes.`, danach je eine Zeile `Mapped {…} route` für `/`, `/hallo`, `/notizen` (zweimal) und `/notizen/:id` und am Ende `Nest application successfully started`. Meldet sie `Found 2 errors`, stehen darüber Datei und Zeile, z. B. ein vergessenes `import type` aus Schritt 11.

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
| `curl http://localhost:8000/notizen/7` | `{"message":"Notiz nicht gefunden","error":"Not Found","statusCode":404}` |
| `curl http://localhost:8000/notizen/abc` | `{"message":"Validation failed (numeric string is expected)","error":"Bad Request","statusCode":400}` |
| `curl http://localhost:8000/gibtsnicht` | `{"message":"Cannot GET /gibtsnicht","error":"Not Found","statusCode":404}` |
| `curl -X POST http://localhost:8000/notizen -H "Content-Type: application/json" -d '{}'` | `{"message":"Feld \"titel\" fehlt","error":"Bad Request","statusCode":400}` |

Alle Fehler haben dieselbe Form, weil Nest jede Exception mit demselben Filter in JSON umwandelt, auch die Fehler, die gar nicht im eigenen Code entstehen (unbekannte Adresse, keine Zahl).

### 17. Automatischen Neustart ausprobieren

Ändere in `src/app.controller.ts` das Wort `Hallo` in der Methode `hallo` z. B. in `Servus` und speichere die Datei. Im ersten Terminal erscheint `File change detected. Starting incremental compilation...`, danach startet der Server neu.

**Prüfen:** `curl http://localhost:8000/hallo` liefert jetzt `{"gruss":"Servus Welt!"}`. Die Notizen aus Schritt 15 sind durch den Neustart verloren, weil sie nur im Arbeitsspeicher lagen.

### 18. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

### 19. Für den Betrieb übersetzen

Übersetzt den TypeScript-Code einmalig nach JavaScript in den Ordner `dist`.

```bash
npm run build
```

**Prüfen:** Im Ordner `dist` liegen `main.js`, `app.module.js`, `notizen.controller.js` und `notizen.service.js`.

```bash
ls dist/*.js
```

### 20. Übersetzte Fassung starten

`start:prod` startet `dist/main.js` direkt mit Node.js, ohne TypeScript und ohne Beobachtung der Dateien. So läuft die Anwendung später auf einem Server.

```bash
npm run start:prod
```

**Prüfen:** Die letzte Zeile lautet `Nest application successfully started`, `curl http://localhost:8000/notizen` liefert `[]`. Beende den Server mit <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Tests:** `npm test` führt die Tests mit Vitest aus. Die Vorlage bringt einen Test für `AppController` mit.
- **Eingaben prüfen:** Mit `npm install class-validator class-transformer` und `app.useGlobalPipes(new ValidationPipe())` in `main.ts` beschreibt man Eingaben als Klassen mit Regeln wie `@IsNotEmpty()`. Nest prüft dann jede Anfrage selbst.
- **Ganze Ressource erzeugen:** `npx nest generate resource aufgaben` legt Modul, Controller, Service und Klassen für Ein- und Ausgabe mit allen Methoden zum Lesen, Anlegen, Ändern und Löschen in einem eigenen Ordner an.
- **Datenbank:** Nest arbeitet mit TypeORM (`@nestjs/typeorm`), Prisma oder MikroORM zusammen, z. B. mit [PostgreSQL](postgresql.md).
- **Betrieb:** Auf einem Server startet man `node dist/main` über einen systemd-Dienst (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage) und setzt [nginx](nginx.md) davor, der auch HTTPS übernimmt.

## Deinstallieren

### 1. Server beenden

Läuft `npm run start:dev` oder `npm run start:prod` noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projekt entfernen

Löscht den Projektordner samt `node_modules`.

```bash
rm -rf ~/meinnest
```

**Prüfen:** Der Projektordner existiert nicht mehr, `ls` meldet `Datei oder Verzeichnis nicht gefunden`.

```bash
ls ~/meinnest
```

### 3. npm-Zwischenspeicher leeren (optional)

npm bewahrt heruntergeladene Pakete in `~/.npm` auf, auch die Nest CLI aus Schritt 4. Dieser Befehl leert den ganzen Speicher. Das betrifft alle Node.js-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
npm cache clean --force
```

### 4. Node.js und npm entfernen (optional)

Nur ausführen, wenn kein anderes Programm sie braucht, z. B. [Express](express.md) oder [Docusaurus](docusaurus.md).

```bash
sudo apt purge nodejs npm
```

Der nächste Befehl entfernt die Pakete, die nur dafür mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```
