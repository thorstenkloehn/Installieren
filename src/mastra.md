# Mastra

Mastra ist ein Framework für [TypeScript](typescript.md), mit dem man KI-Agenten und Workflows baut. Agenten rufen selbstständig Werkzeuge auf. Workflows legen dagegen eine feste Abfolge von Schritten fest, prüfen dabei jede Ein- und Ausgabe und können einzelne Schritte einem Agenten übergeben. Mastra baut auf dem [Vercel AI SDK](vercel-ai-sdk.md) auf und läuft in Node.js.

## Vorbemerkungen

- **Agent oder Workflow:** Bei einem Agenten entscheidet das Sprachmodell, welche Werkzeuge es wann aufruft. Bei einem Workflow bestimmt der Programmcode die Reihenfolge, und das Modell erledigt nur die Schritte, in denen Sprache gebraucht wird. Die Anleitung zeigt beides.
- **Sprachmodell:** Mastra spricht OpenAI, Anthropic, Google und viele andere Anbieter an. Diese Anleitung verwendet ein lokales Modell über [Ollama](ollama.md) und seine OpenAI-kompatible Schnittstelle. Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`. Es kann Werkzeuge aufrufen.
- **Node.js aus Ubuntu:** Mastra braucht Node.js 22.13 oder neuer. Ubuntu 26.04 liefert Node.js 22.22, das reicht. TypeScript-Dateien startet die Anleitung wie beim Vercel AI SDK mit dem kleinen Werkzeug `tsx`, weil das Node.js von Ubuntu das nicht selbst kann.
- **Installation pro Projekt:** Die Pakete lädt `npm` in den Projektordner, zusammen rund 180 MB.
- **Version:** Getestet mit @mastra/core **1.74.0**, zod 4.6, tsx 4.23 und TypeScript 7.0 unter Node.js 22.22 und npm 9.2 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Ist beides schon vorhanden (z. B. aus der Anleitung [Vercel AI SDK](vercel-ai-sdk.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Versionsnummer beginnt mit `v22` oder höher.

```bash
node --version
```

### 3. Projektordner anlegen

```bash
mkdir ~/agent-mastra
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-mastra
```

### 5. Projekt anlegen

Legt die Datei `package.json` an, in der `npm` die Pakete des Projekts festhält.

```bash
npm init -y
```

### 6. Moderne Module einschalten

Mit ES-Modulen funktionieren `import … from …` und `await` direkt in der Datei.

```bash
npm pkg set type=module
```

### 7. Mastra installieren

- `@mastra/core` – Agenten, Werkzeuge, Workflows und die Anbindung der Sprachmodelle
- `zod` – beschreibt, welche Daten ein Werkzeug oder ein Schritt erwartet, und prüft sie

```bash
npm install @mastra/core zod
```

**Prüfen:** Die Ausgabe endet mit `found 0 vulnerabilities`.

### 8. Werkzeuge für TypeScript installieren

`tsx` führt TypeScript-Dateien aus, `typescript` prüft die Typen, `@types/node` beschreibt die Typen von Node.js 22. `--save-dev` kennzeichnet sie als reine Entwicklungswerkzeuge.

```bash
npm install --save-dev tsx typescript @types/node@22
```

**Prüfen:** Die Liste nennt `@mastra/core@1.74.0` (oder neuer), `zod`, `tsx`, `typescript` und `@types/node`.

```bash
npm ls --depth=0
```

## Beispiel 1: Ein Agent mit Werkzeug

### 9. Programm anlegen

Ein Agent im Verkauf eines Fahrradladens beantwortet eine Kundenfrage. Den Lagerbestand sieht er mit einem Werkzeug nach.

```bash
nano agent.ts
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```typescript
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const LAGER: Record<string, number> = { citybike: 4, trekkingrad: 0, lastenrad: 1 };

const lagerbestand = createTool({
  id: "lagerbestand",
  description: "Gibt zurück, wie viele Räder eines Modells (citybike, trekkingrad, lastenrad) im Lager sind.",
  inputSchema: z.object({ modell: z.string().describe("Name des Modells, z. B. citybike") }),
  outputSchema: z.object({ modell: z.string(), anzahl: z.number().nullable() }),
  execute: async ({ modell }) => {
    console.log(`  [Werkzeug] lagerbestand(${modell})`);
    return { modell, anzahl: LAGER[modell.toLowerCase()] ?? null };
  },
});

const agent = new Agent({
  id: "verkauf",
  name: "Verkauf",
  instructions:
    "Du arbeitest im Verkauf eines Fahrradladens und antwortest kurz auf Deutsch. " +
    "Sieh den Bestand immer mit dem Werkzeug lagerbestand nach.",
  // Ollama über die OpenAI-kompatible Schnittstelle
  model: { id: "ollama/qwen3:4b-instruct", url: "http://localhost:11434/v1" },
  tools: { lagerbestand },
});

const antwort = await agent.generate("Habt ihr ein Trekkingrad oder ein Lastenrad da?");
console.log(antwort.text);
```

- **`createTool`** – beschreibt ein Werkzeug. Aus `description` und `inputSchema` erfährt das Modell, wofür das Werkzeug da ist und welche Angaben es braucht. `outputSchema` legt fest, was zurückkommt.
- **`model`** – `id` besteht aus einem frei wählbaren Anbieternamen und dem Modellnamen. `url` zeigt auf die Schnittstelle von Ollama. Ein API-Schlüssel ist nicht nötig.
- **`generate`** – schickt die Frage an den Agenten. Er ruft Werkzeuge auf, so oft er sie braucht, und liefert am Ende die Antwort in `text`.
- **`console.log` im Werkzeug** – zeigt, wann das Modell das Werkzeug aufruft.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Programm ausführen

`npx` startet das Programm `tsx` aus dem Projektordner.

```bash
npx tsx agent.ts
```

**Prüfen:** Nach einigen Sekunden erscheint etwa Folgendes. Der letzte Satz ist bei jedem Lauf etwas anders formuliert:

```text
  [Werkzeug] lagerbestand(trekkingrad)
  [Werkzeug] lagerbestand(lastenrad)
Wir haben kein Trekkingrad im Lager, aber ein Lastenrad.
```

Der Agent hat das Werkzeug für beide Modelle aufgerufen und die Ergebnisse in einem Satz zusammengefasst.

## Beispiel 2: Ein Workflow

### 11. Programm anlegen

Ein Workflow erzeugt einen Werbetext für ein Fahrrad in zwei festen Schritten. Der erste Schritt bereitet die Angaben als Stichpunkte auf und braucht dafür kein Sprachmodell. Der zweite gibt die Stichpunkte an einen Agenten, der daraus den Text schreibt. Ein zweiter Lauf zeigt, dass Mastra unvollständige Angaben gar nicht erst annimmt.

```bash
nano workflow.ts
```

Füge diesen Inhalt ein:

```typescript
import { Agent } from "@mastra/core/agent";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const texter = new Agent({
  id: "texter",
  name: "Texter",
  instructions:
    "Du schreibst kurze Produkttexte für einen Fahrradladen auf Deutsch. " +
    "Verwende nur die Angaben, die du bekommst.",
  model: { id: "ollama/qwen3:4b-instruct", url: "http://localhost:11434/v1" },
});

// Schritt 1: Angaben als Stichpunkte aufbereiten (ohne Sprachmodell)
const aufbereiten = createStep({
  id: "aufbereiten",
  inputSchema: z.object({
    name: z.string(),
    merkmale: z.array(z.string()).min(1),
    preis: z.number().positive(),
  }),
  outputSchema: z.object({ stichpunkte: z.string() }),
  execute: async ({ inputData }) => {
    const preis = inputData.preis.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
    const zeilen = [inputData.name, ...inputData.merkmale, `Preis: ${preis}`];
    return { stichpunkte: zeilen.map((zeile) => `- ${zeile}`).join("\n") };
  },
});

// Schritt 2: Der Agent schreibt aus den Stichpunkten einen Text
const schreiben = createStep({
  id: "schreiben",
  inputSchema: z.object({ stichpunkte: z.string() }),
  outputSchema: z.object({ text: z.string() }),
  execute: async ({ inputData }) => {
    const antwort = await texter.generate(
      `Schreibe zwei Sätze Werbetext aus diesen Angaben:\n${inputData.stichpunkte}`,
    );
    return { text: antwort.text };
  },
});

const produkttext = createWorkflow({
  id: "produkttext",
  inputSchema: aufbereiten.inputSchema,
  outputSchema: schreiben.outputSchema,
})
  .then(aufbereiten)
  .then(schreiben)
  .commit();

// Erster Lauf mit vollständigen Angaben
const lauf = await produkttext.createRun();
const ergebnis = await lauf.start({
  inputData: {
    name: "Lastenrad Elbe",
    merkmale: ["Elektromotor", "Kindersitzbank für zwei Kinder", "Regenverdeck"],
    preis: 3490,
  },
});
console.log("Status:", ergebnis.status);
if (ergebnis.status === "success") {
  console.log(ergebnis.result.text);
}

// Zweiter Lauf ohne Merkmale: Mastra prüft die Eingabe und lehnt sie ab
try {
  const lauf2 = await produkttext.createRun();
  await lauf2.start({ inputData: { name: "Citybike Hansa", merkmale: [], preis: 899 } });
} catch (fehler) {
  console.log("Abgelehnt:", (fehler as Error).message);
}
```

- **`createStep`** – ein Schritt mit eigenem Ein- und Ausgabeschema. `execute` ist normaler TypeScript-Code und kann, muss aber kein Sprachmodell aufrufen.
- **`z.array(…).min(1)` und `z.number().positive()`** – Regeln für die Eingabe: mindestens ein Merkmal und ein Preis über null.
- **`.then(…)`** – hängt Schritte aneinander. Die Ausgabe von `aufbereiten` passt zur Eingabe von `schreiben`. Passen die Schemas nicht zusammen, meldet TypeScript schon beim Prüfen der Typen einen Fehler.
- **`.commit()`** – schließt den Aufbau des Workflows ab.
- **`createRun` und `start`** – starten einen Lauf. Das Ergebnis enthält den `status` und bei Erfolg unter `result` die Ausgabe des letzten Schritts.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Programm ausführen

```bash
npx tsx workflow.ts
```

**Prüfen:** Die Ausgabe sieht etwa so aus. Der Werbetext ändert sich von Lauf zu Lauf:

```text
Status: success
Das Lastenrad Elbe mit Elektromotor ist die perfekte Lösung für Familien – mit Sitzbank für zwei Kinder und praktischem Regenverdeck. Preis: 3.490,00 €.
Abgelehnt: Invalid input data:
- merkmale: Too small: expected array to have >=1 items
```

Im ersten Lauf hat der Agent alle Angaben und den Preis im deutschen Format übernommen. Der zweite Lauf hat das Sprachmodell gar nicht erst erreicht, weil die Liste der Merkmale leer war. Kleine Modelle bilden dabei gelegentlich holprige Wörter.

### 13. Typen prüfen

`tsx` führt den Code nur aus und prüft die Typen nicht. Das übernimmt der TypeScript-Compiler `tsc`. `--noEmit` prüft nur, ohne JavaScript-Dateien zu schreiben.

```bash
npx tsc --noEmit --strict --module nodenext --target es2022 --skipLibCheck --types node agent.ts workflow.ts
```

**Prüfen:** Der Befehl gibt nichts aus. Bei Fehlern nennt er Datei, Zeile und Grund.

## Wie geht es weiter?

- **Projektvorlage und Studio:** `npm create mastra@latest` legt ein vollständiges Projekt an. Darin startet `npm run dev` das Mastra Studio, eine Weboberfläche im Browser, in der man mit Agenten chattet, Workflows startet und jeden Schritt nachverfolgt.
- **Gedächtnis:** Mit den Paketen `@mastra/memory` und `@mastra/libsql` merkt sich ein Agent frühere Gespräche in einer SQLite-Datei.
- **Verzweigungen im Workflow:** Neben `.then()` gibt es `.parallel()` für gleichzeitige Schritte, `.branch()` für Wenn-dann-Abzweigungen und Schleifen. Workflows können außerdem anhalten und auf eine Freigabe durch den Menschen warten.
- **Andere Anbieter:** Mit einer Modellangabe wie `model: "anthropic/…"` und dem passenden Schlüssel in einer Umgebungsvariable wechselt man zu einem Cloud-Anbieter.
- **Dokumentation:** <https://mastra.ai/docs>

## Deinstallieren

### 1. Projekt entfernen

Löscht den Projektordner samt `node_modules`.

```bash
rm -rf ~/agent-mastra
```

### 2. npm-Zwischenspeicher leeren (optional)

npm bewahrt heruntergeladene Pakete in `~/.npm` auf. Dieser Befehl leert den ganzen Speicher. Das betrifft alle Node.js-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
npm cache clean --force
```

### 3. Node.js und npm entfernen (optional)

Nur ausführen, wenn kein anderes Programm sie braucht, z. B. das [Vercel AI SDK](vercel-ai-sdk.md), [Express](express.md) oder [Next.js](nextjs.md).

```bash
sudo apt purge nodejs npm
```

Der nächste Befehl entfernt die Pakete, die nur dafür mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```
