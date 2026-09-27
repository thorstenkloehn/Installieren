# Next.js

Next.js ist ein Framework für Webanwendungen mit React. Seiten und Schnittstellen liegen im selben Projekt: Jede Datei `page.tsx` im Ordner `app` wird zu einer Seite, jede Datei `route.ts` zu einer Adresse der Schnittstelle. Seiten werden auf dem Server erzeugt und als fertiges HTML ausgeliefert, Formulare können mit Server Actions direkt Code auf dem Server aufrufen.

## Vorbemerkungen

- **Installation pro Projekt:** Aus den Ubuntu-Paketquellen kommen nur Node.js und npm. Next.js, React und alle Werkzeuge lädt `npm` in jedes Projekt einzeln, zusammen rund 600 MB im Ordner `node_modules`.
- **Port 8000:** Next.js lauscht ohne Angabe auf Port 3000. Das Beispiel legt Port 8000 fest, weil 3000 oft schon belegt ist, etwa von [Martin](martin.md). Port 8000 darf nicht von einem anderen Programm belegt sein.
- **Gleiches Beispiel:** Die Schnittstelle unter `/api` entspricht der Notiz-Schnittstelle aus den Anleitungen zu [Express](express.md), [NestJS](nestjs.md) und [FastAPI](fastapi.md). Dazu kommt eine Seite, die die Notizen anzeigt und über ein Formular neue anlegt. Die Notizen liegen nur im Arbeitsspeicher.
- **Schriften von Google:** Die Vorlage verwendet die Schrift Geist über `next/font/google`. Next.js lädt sie beim Entwickeln und Bauen einmal von Google herunter und liefert sie danach selbst aus. Die Besucher der Seite verbinden sich also nicht mit Google.
- **Version:** Getestet mit Next.js **16.3.6**, React 19.2, Node.js 22.22.1 und npm 9.2.0 aus Ubuntu 26.04. Next.js 16 braucht Node.js 20.9 oder neuer.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Node.js führt den Server aus, `npm` lädt Next.js und alle Bibliotheken herunter. Ist beides schon vorhanden (z. B. aus der [Express-Anleitung](express.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Versionsnummer ist `v20.9` oder höher, z. B. `v22.22.1`.

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

`npx` lädt das Werkzeug `create-next-app` nur für diesen einen Aufruf herunter. Es legt den Ordner `meinnext` mit einem fertigen Projekt samt Git-Repository an und installiert alle Bibliotheken. `--yes` übernimmt für alle Fragen die Vorgaben: TypeScript, Tailwind CSS für die Gestaltung, ESLint zur Code-Prüfung und den App Router (Seiten im Ordner `app`). `--use-npm` legt npm als Paketmanager fest.

```bash
npx create-next-app@latest meinnext --yes --use-npm
```

Fragt npm `Need to install the following packages: create-next-app@… Ok to proceed? (y)`, bestätige mit <kbd>Enter</kbd>.

**Prüfen:** Die Ausgabe enthält `added 371 packages` (die Zahl kann abweichen) und endet mit `Success! Created meinnext at /home/…/meinnext`. Die Warnung `npm WARN deprecated eslint@9…` kannst du übergehen.

### 5. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinnext
```

Im Projektordner liegen auch `AGENTS.md` und `CLAUDE.md`. Sie enthalten Hinweise für KI-Assistenten und sind für diese Anleitung nicht wichtig.

### 6. Port und Adresse festlegen

In `package.json` stehen unter `scripts` die Befehle, die `npm run …` ausführt.

```bash
nano package.json
```

Ändere die Zeilen `"dev": "next dev",` und `"start": "next start",` so, dass sie lauten:

```json
    "dev": "next dev -H 127.0.0.1 -p 8000",
```

```json
    "start": "next start -H 127.0.0.1 -p 8000",
```

`-H 127.0.0.1` beschränkt den Server auf den eigenen Rechner, `-p 8000` legt den Port fest. `dev` ist der Entwicklungsserver, `start` startet die fertig gebaute Anwendung.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. Sprache und Titel anpassen

`app/layout.tsx` ist das Grundgerüst, das jede Seite umschließt.

```bash
nano app/layout.tsx
```

Ändere `title: "Create Next App",` in `title: "Notizen",` und `lang="en"` in `lang="de"`. Der Titel erscheint im Browser-Tab, die Sprachangabe hilft Suchmaschinen und Vorleseprogrammen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Ordner für die Notizen anlegen

Code, der keine Seite und keine Route ist, legt man üblicherweise in einen eigenen Ordner `lib`.

```bash
mkdir lib
```

### 9. Notizen verwalten

```bash
nano lib/notizen.ts
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```typescript
export type Notiz = { id: number; titel: string };

// Notizen nur im Arbeitsspeicher: Nach einem Neustart sind sie weg.
// globalThis sorgt dafür, dass Seite und API dieselbe Liste sehen.
const speicher = globalThis as unknown as { notizen?: Notiz[] };
const notizen: Notiz[] = (speicher.notizen ??= []);

export function alleNotizen(): Notiz[] {
  return notizen;
}

export function findeNotiz(id: number): Notiz | undefined {
  return notizen.find((n) => n.id === id);
}

export function legeNotizAn(titel: string): Notiz {
  const notiz = { id: notizen.length + 1, titel };
  notizen.push(notiz);
  return notiz;
}
```

Next.js übersetzt Seiten und Routen getrennt. Ohne `globalThis` könnte jede ihre eigene Kopie der Liste bekommen. So hängt die Liste an einem Objekt, das es im Server-Prozess nur einmal gibt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Ordner für die Schnittstelle anlegen

Beim App Router bestimmen Ordner die Adresse: `app/api/hallo` wird zu `/api/hallo`. Ein Ordner in eckigen Klammern wie `[id]` ist ein Platzhalter. Die Anführungszeichen verhindern, dass die Shell die Klammern selbst auswertet.

```bash
mkdir -p app/api/hallo "app/api/notizen/[id]"
```

### 11. Route für die Begrüßung schreiben

Eine Datei `route.ts` beantwortet Anfragen an ihren Ordner. Der Name der exportierten Funktion ist die Methode, hier `GET`.

```bash
nano app/api/hallo/route.ts
```

Füge diesen Inhalt ein:

```typescript
import type { NextRequest } from "next/server";

// GET /api/hallo?name=... liefert eine Begrüßung als JSON
export function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name") ?? "Welt";
  return Response.json({ gruss: `Hallo ${name}!` });
}
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Route für alle Notizen schreiben

```bash
nano app/api/notizen/route.ts
```

Füge diesen Inhalt ein:

```typescript
import { alleNotizen, legeNotizAn } from "@/lib/notizen";

// GET /api/notizen liefert alle Notizen
export function GET() {
  return Response.json(alleNotizen());
}

// POST /api/notizen legt eine Notiz an; der Inhalt kommt als JSON
export async function POST(request: Request) {
  const daten = await request.json().catch(() => null);
  const titel = daten?.titel;
  if (typeof titel !== "string" || titel === "") {
    return Response.json({ fehler: 'Feld "titel" fehlt' }, { status: 400 });
  }
  const notiz = legeNotizAn(titel);
  return Response.json(notiz, {
    status: 201,
    headers: { Location: `/api/notizen/${notiz.id}` },
  });
}
```

- `@/lib/notizen` – `@/` steht für den Projektordner. So muss man keine Pfade wie `../../../lib` zählen.
- `Response.json(…)` – die Antwortklasse, die auch Browser kennen. Status und Kopfzeilen gibt man als zweiten Wert mit.
- `request.json().catch(() => null)` – liefert `null` statt eines Fehlers, wenn kein gültiges JSON ankommt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Route für eine Notiz schreiben

```bash
nano "app/api/notizen/[id]/route.ts"
```

Füge diesen Inhalt ein:

```typescript
import type { NextRequest } from "next/server";
import { findeNotiz } from "@/lib/notizen";

// GET /api/notizen/1 liefert eine Notiz oder 404
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/notizen/[id]">) {
  const { id } = await ctx.params;
  const notiz = findeNotiz(Number(id));
  if (!notiz) {
    return Response.json({ fehler: "Notiz nicht gefunden" }, { status: 404 });
  }
  return Response.json(notiz);
}
```

`ctx.params` enthält den Platzhalter `[id]` als Text. Seit Next.js 15 muss man ihn mit `await` abwarten. `RouteContext<…>` ist ein Typ, den Next.js aus der Ordnerstruktur selbst erzeugt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. Startseite schreiben

`app/page.tsx` ist die Seite unter `/`. Sie zeigt die Notizen und ein Formular.

```bash
nano app/page.tsx
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein:

```tsx
import { revalidatePath } from "next/cache";
import { alleNotizen, legeNotizAn } from "@/lib/notizen";

// Die Seite bei jedem Aufruf neu erzeugen, weil sich die Notizen ändern
export const dynamic = "force-dynamic";

// Server Action: läuft auf dem Server, wenn das Formular abgeschickt wird
async function notizAnlegen(formData: FormData) {
  "use server";
  const titel = formData.get("titel");
  if (typeof titel === "string" && titel !== "") {
    legeNotizAn(titel);
    revalidatePath("/");
  }
}

export default function Startseite() {
  const notizen = alleNotizen();
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Notizen</h1>
      {notizen.length === 0 ? (
        <p>Noch keine Notizen.</p>
      ) : (
        <ul className="mb-4 list-disc pl-6">
          {notizen.map((n) => (
            <li key={n.id}>
              {n.id}: {n.titel}
            </li>
          ))}
        </ul>
      )}
      <form action={notizAnlegen} className="flex gap-2">
        <input name="titel" placeholder="Neue Notiz" className="flex-1 border px-2 py-1" />
        <button type="submit" className="border px-3 py-1">
          Anlegen
        </button>
      </form>
    </main>
  );
}
```

- **Server Component** – die Funktion `Startseite` läuft auf dem Server. Sie liest die Notizen direkt aus `lib/notizen.ts`, ohne Umweg über die Schnittstelle. Der Browser bekommt fertiges HTML.
- `dynamic = "force-dynamic"` – ohne diese Zeile würde Next.js die Seite beim Bauen einmal erzeugen und danach immer dieselbe, leere Liste zeigen.
- **Server Action** – `"use server"` macht `notizAnlegen` zu einer Funktion, die der Browser beim Abschicken des Formulars auf dem Server aufruft. `formData` enthält die Felder des Formulars. `revalidatePath("/")` sorgt dafür, dass die Seite danach mit der neuen Notiz neu erzeugt wird.
- `className` – Klassen von Tailwind CSS, z. B. `p-8` für Innenabstand und `border` für einen Rahmen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

## Starten und testen

### 15. Entwicklungsserver starten

Startet Next.js im Entwicklungsmodus mit dem Bundler Turbopack. Seiten und Routen werden erst übersetzt, wenn sie zum ersten Mal aufgerufen werden. Das Terminal bleibt belegt, hier erscheint zu jeder Anfrage eine Zeile mit Methode, Adresse, Status und Dauer.

```bash
npm run dev
```

**Prüfen:** Die Ausgabe enthält `Next.js 16.3.6 (Turbopack)`, `Local: http://127.0.0.1:8000` und `Ready in …`.

### 16. Notiz über die Schnittstelle anlegen

Öffne ein zweites Terminal und schicke eine neue Notiz als JSON an den Server. `-i` zeigt zusätzlich die Kopfzeilen der Antwort.

```bash
curl -i -X POST http://localhost:8000/api/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, weiter unten steht `location: /api/notizen/1`, die letzte Zeile ist `{"id":1,"titel":"Erste Notiz"}`. Im ersten Terminal erscheint `POST /api/notizen 201 in …`.

### 17. Weitere Adressen testen

Diese Aufrufe zeigen die übrigen Routen und die Fehlerbehandlung:

| Aufruf | Antwort |
|---|---|
| `curl http://localhost:8000/api/notizen` | `[{"id":1,"titel":"Erste Notiz"}]` |
| `curl http://localhost:8000/api/notizen/1` | `{"id":1,"titel":"Erste Notiz"}` |
| `curl "http://localhost:8000/api/hallo?name=Thorsten"` | `{"gruss":"Hallo Thorsten!"}` |
| `curl http://localhost:8000/api/notizen/7` | `{"fehler":"Notiz nicht gefunden"}` (Status 404) |
| `curl -X POST http://localhost:8000/api/notizen -H "Content-Type: application/json" -d '{}'` | `{"fehler":"Feld \"titel\" fehlt"}` (Status 400) |
| `curl http://localhost:8000/api/gibtsnicht` | HTML-Seite „This page could not be found.“ (Status 404) |

Für unbekannte Adressen liefert Next.js eine eigene Fehlerseite. Eine Datei `app/not-found.tsx` ersetzt sie durch eine selbst gestaltete Seite.

### 18. Seite im Browser ansehen

Öffne <http://localhost:8000> im Browser.

**Prüfen:** Die Seite zeigt die Überschrift „Notizen“ und darunter `1: Erste Notiz` aus Schritt 16. Seite und Schnittstelle greifen auf dieselbe Liste zu.

### 19. Notiz über das Formular anlegen

Gib im Feld „Neue Notiz“ einen Titel ein, z. B. `Aus dem Formular`, und klicke auf **Anlegen**.

**Prüfen:** Die Liste zeigt sofort `2: Aus dem Formular`, ohne dass die Seite sichtbar neu lädt. `curl http://localhost:8000/api/notizen` liefert jetzt beide Notizen.

### 20. Änderung ohne Neustart ausprobieren

Ändere in `app/api/hallo/route.ts` das Wort `Hallo` z. B. in `Servus` und speichere die Datei.

**Prüfen:** `curl http://localhost:8000/api/hallo` liefert sofort `{"gruss":"Servus Welt!"}`. Die Notizen bleiben dabei erhalten, weil Next.js nur den geänderten Code austauscht und der Server-Prozess weiterläuft. Änderungen an `page.tsx` zeigt ein geöffneter Browser sogar ohne Neuladen an.

### 21. Entwicklungsserver beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

### 22. Für den Betrieb bauen

Übersetzt und optimiert das ganze Projekt in den Ordner `.next` und prüft dabei auch die TypeScript-Typen.

```bash
npm run build
```

**Prüfen:** Die Ausgabe enthält `✓ Compiled successfully` und endet mit einer Liste der Routen. Vor `/`, `/api/hallo`, `/api/notizen` und `/api/notizen/[id]` steht `ƒ`, das heißt: Sie werden bei jeder Anfrage auf dem Server erzeugt. Nur `/_not-found` ist mit `○` als feste Seite vorab erzeugt.

### 23. Gebaute Anwendung starten

Startet die gebaute Fassung aus `.next`. So läuft die Anwendung später auf einem Server.

```bash
npm start
```

**Prüfen:** Die Ausgabe enthält `Local: http://127.0.0.1:8000` und `Ready in …`. <http://localhost:8000> zeigt „Noch keine Notizen.“, weil der Arbeitsspeicher leer ist. Beende den Server mit <kbd>Strg</kbd>+<kbd>C</kbd>.

## Wie geht es weiter?

- **Weitere Seiten:** Ein Ordner `app/info` mit einer Datei `page.tsx` ergibt die Seite `/info`. Verlinkt wird mit `<Link href="/info">` aus `next/link`, dann wechselt der Browser die Seite ohne komplettes Neuladen.
- **Interaktive Teile:** Komponenten mit `"use client"` in der ersten Zeile laufen im Browser und können `useState` oder Klick-Ereignisse verwenden.
- **Datenbank:** Statt der Liste im Arbeitsspeicher liest man in Server Components und Server Actions direkt aus einer Datenbank, z. B. [PostgreSQL](postgresql.md) mit einer Bibliothek wie `pg` oder Prisma.
- **Code prüfen:** `npm run lint` prüft den Code mit ESLint.
- **Dokumentation im Projekt:** Next.js legt seine Dokumentation passend zur installierten Version in `node_modules/next/dist/docs` ab.
- **Betrieb:** Auf einem Server startet man `npm start` über einen systemd-Dienst (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage) und setzt [nginx](nginx.md) davor, der auch HTTPS übernimmt.

## Deinstallieren

### 1. Server beenden

Läuft `npm run dev` oder `npm start` noch in einem Terminal, beende es dort mit <kbd>Strg</kbd>+<kbd>C</kbd>.

### 2. Projekt entfernen

Löscht den Projektordner samt `node_modules` und `.next`.

```bash
rm -rf ~/meinnext
```

**Prüfen:** Der Projektordner existiert nicht mehr, `ls` meldet `Datei oder Verzeichnis nicht gefunden`.

```bash
ls ~/meinnext
```

### 3. npm-Zwischenspeicher leeren (optional)

npm bewahrt heruntergeladene Pakete in `~/.npm` auf, auch `create-next-app` aus Schritt 4. Dieser Befehl leert den ganzen Speicher. Das betrifft alle Node.js-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
npm cache clean --force
```

### 4. Node.js und npm entfernen (optional)

Nur ausführen, wenn kein anderes Programm sie braucht, z. B. [Express](express.md), [NestJS](nestjs.md) oder [Docusaurus](docusaurus.md).

```bash
sudo apt purge nodejs npm
```

Der nächste Befehl entfernt die Pakete, die nur dafür mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```
