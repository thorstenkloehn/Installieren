# Vercel AI SDK

Das AI SDK von Vercel ist eine Bibliothek für [TypeScript](typescript.md) und JavaScript, mit der man Sprachmodelle in eigene Programme einbindet. Eine einheitliche Schnittstelle spricht viele Anbieter an. Die Bibliothek erzeugt Text, streamt Antworten Stück für Stück und baut mit `ToolLoopAgent` Agenten, die selbstständig Werkzeuge aufrufen. Sie läuft in Node.js-Programmen ebenso wie in Webanwendungen, etwa mit [Next.js](nextjs.md).

## Vorbemerkungen

- **Viele Anbieter:** Für jeden Anbieter gibt es ein eigenes Paket, z. B. `@ai-sdk/openai` oder `@ai-sdk/anthropic`. Diese Anleitung verwendet ein lokales Modell über [Ollama](ollama.md), angebunden mit dem Paket `@ai-sdk/openai-compatible`. Es fallen also keine Kosten an und keine Daten verlassen den Rechner.
- **Voraussetzung:** Ein laufendes [Ollama](ollama.md) mit dem Modell `qwen3:4b-instruct`. Es kann Werkzeuge aufrufen.
- **Node.js aus Ubuntu:** Das AI SDK braucht Node.js 22 oder neuer. Ubuntu 26.04 liefert Node.js 22.22, das reicht. Dieses Node.js kann TypeScript-Dateien aber nicht selbst ausführen: Es wurde ohne diese Funktion übersetzt und meldet `ERR_NO_TYPESCRIPT`. Die Anleitung verwendet deshalb das kleine Werkzeug `tsx`, das TypeScript direkt startet.
- **Installation pro Projekt:** Die Pakete lädt `npm` in den Projektordner, zusammen rund 70 MB.
- **Version:** Getestet mit ai **7.0.118**, @ai-sdk/openai-compatible 3.0, zod 4.6, tsx 4.23 und TypeScript 7.0 unter Node.js 22.22 und npm 9.2 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Node.js und npm installieren

Ist beides schon vorhanden (z. B. aus der [Express-Anleitung](express.md)), meldet `apt` das nur.

```bash
sudo apt install nodejs npm
```

**Prüfen:** Die Versionsnummer beginnt mit `v22` oder höher.

```bash
node --version
```

### 3. Projektordner anlegen

```bash
mkdir ~/agent-aisdk
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/agent-aisdk
```

### 5. Projekt anlegen

Legt die Datei `package.json` mit Vorgabewerten an. Darin hält `npm` fest, welche Pakete das Projekt braucht.

```bash
npm init -y
```

### 6. Moderne Module einschalten

Stellt das Projekt auf ES-Module um. Erst dann funktionieren `import … from …` und `await` direkt in der Datei, ohne umschließende Funktion.

```bash
npm pkg set type=module
```

### 7. AI SDK installieren

- `ai` – der Kern mit Textgenerierung, Streaming, Werkzeugen und Agenten
- `@ai-sdk/openai-compatible` – die Anbindung an Dienste mit der Schnittstelle von OpenAI, hier Ollama
- `zod` – beschreibt, welche Eingaben ein Werkzeug erwartet, und prüft sie

```bash
npm install ai @ai-sdk/openai-compatible zod
```

**Prüfen:** Die Ausgabe endet mit `found 0 vulnerabilities`.

### 8. Werkzeuge für TypeScript installieren

`--save-dev` kennzeichnet sie als Werkzeuge nur für die Entwicklung. `tsx` führt TypeScript-Dateien aus, `typescript` prüft die Typen, `@types/node` beschreibt die Typen von Node.js selbst.

```bash
npm install --save-dev tsx typescript @types/node@22
```

**Prüfen:** Die Liste nennt `ai@7.0.118` (oder neuer), `@ai-sdk/openai-compatible`, `zod`, `tsx`, `typescript` und `@types/node`.

```bash
npm ls --depth=0
```

## Beispiel 1: Ein Agent mit Werkzeug

### 9. Programm anlegen

```bash
nano agent.ts
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```typescript
import { ToolLoopAgent, tool } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";

// Ollama über die OpenAI-kompatible Schnittstelle
const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: "http://localhost:11434/v1",
});

const HAUPTSTAEDTE: Record<string, string> = {
  "schleswig-holstein": "Kiel",
  hamburg: "Hamburg",
  niedersachsen: "Hannover",
  bayern: "München",
};

const agent = new ToolLoopAgent({
  model: ollama("qwen3:4b-instruct"),
  instructions:
    "Du beantwortest Fragen zu deutschen Bundesländern kurz auf Deutsch. " +
    "Nutze für Landeshauptstädte immer das Werkzeug landeshauptstadt.",
  tools: {
    landeshauptstadt: tool({
      description: "Liefert die Landeshauptstadt eines deutschen Bundeslands.",
      inputSchema: z.object({
        bundesland: z.string().describe("Name des Bundeslands, z. B. Bayern"),
      }),
      execute: async ({ bundesland }) => {
        console.log(`  [Werkzeug] landeshauptstadt(${bundesland})`);
        return HAUPTSTAEDTE[bundesland.toLowerCase()] ?? "unbekannt";
      },
    }),
  },
});

const ergebnis = await agent.generate({
  prompt: "Was ist die Hauptstadt von Schleswig-Holstein und von Bayern?",
});
console.log(ergebnis.text);
console.log(`Schritte: ${ergebnis.steps.length}`);
```

- **Modell:** `createOpenAICompatible` legt eine Anbindung an Ollama an. `ollama("qwen3:4b-instruct")` wählt daraus das Modell.
- **Werkzeug:** `tool({ … })` beschreibt ein Werkzeug mit `description`, den erwarteten Eingaben als zod-Schema (`inputSchema`) und der Funktion `execute`, die es ausführt. zod prüft die Eingaben des Modells, bevor `execute` sie bekommt. TypeScript kennt dadurch auch den Typ von `bundesland`.
- **Agent:** `ToolLoopAgent` wiederholt die Schleife „Modell fragen → Werkzeuge ausführen → Ergebnisse zurückgeben“, bis das Modell eine Antwort liefert. `generate` startet den Lauf. `ergebnis.steps` enthält jeden Durchgang dieser Schleife.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Programm ausführen

`npx` startet `tsx` aus dem Ordner `node_modules` des Projekts.

```bash
npx tsx agent.ts
```

**Prüfen:** Die Ausgabe lautet nach einigen Sekunden:

```text
  [Werkzeug] landeshauptstadt(Schleswig-Holstein)
  [Werkzeug] landeshauptstadt(Bayern)
Die Hauptstadt von Schleswig-Holstein ist Kiel und die Hauptstadt von Bayern ist München.
Schritte: 2
```

Im ersten Schritt hat das Modell die Werkzeuge aufgerufen, im zweiten mit den Ergebnissen geantwortet.

## Beispiel 2: Antwort streamen

### 11. Programm anlegen

Bei längeren Antworten will man nicht warten, bis alles fertig ist. `streamText` liefert den Text Stück für Stück, sobald das Modell ihn erzeugt.

```bash
nano stream.ts
```

Füge diesen Inhalt ein:

```typescript
import { streamText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: "http://localhost:11434/v1",
});

const ergebnis = streamText({
  model: ollama("qwen3:4b-instruct"),
  prompt: "Schreibe ein kurzes Gedicht mit vier Zeilen über den Herbst an der Ostsee.",
});

// Text Stück für Stück ausgeben, sobald er ankommt
for await (const stueck of ergebnis.textStream) {
  process.stdout.write(stueck);
}
process.stdout.write("\n");
```

`textStream` liefert die Textstücke nacheinander, `for await` wartet jeweils auf das nächste. `process.stdout.write` gibt sie ohne Zeilenumbruch aus, damit der Text zusammenhängend erscheint.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Programm ausführen

```bash
npx tsx stream.ts
```

**Prüfen:** Das Gedicht erscheint Wort für Wort im Terminal. Es ist bei jedem Lauf anders.

Für Fragen nach Fakten eignen sich kleine Modelle wie `qwen3:4b-instruct` nur bedingt. Im Test erfand das Modell auf die Frage, wofür Ahrensburg bekannt ist, eine „historische Stadtbahn“. Für Faktenfragen gibt man einem Agenten deshalb Werkzeuge, die verlässliche Daten liefern, wie in Beispiel 1.

### 13. Typen prüfen

`tsx` entfernt die Typangaben nur und prüft sie nicht. Die Prüfung übernimmt der TypeScript-Compiler `tsc`. `--noEmit` prüft nur, ohne JavaScript-Dateien zu schreiben.

```bash
npx tsc --noEmit --strict --module nodenext --target es2022 --skipLibCheck --types node agent.ts stream.ts
```

**Prüfen:** Der Befehl gibt nichts aus. Bei Fehlern nennt er Datei, Zeile und Grund, z. B. einen Tippfehler in einem Feldnamen.

## Wie geht es weiter?

- **Strukturierte Ergebnisse:** Mit `output: Output.object({ schema: z.object({ … }) })` liefert `generateText` ein geprüftes Objekt statt Text.
- **Weboberfläche:** Das Paket `@ai-sdk/react` bringt Hooks wie `useChat` für Chat-Oberflächen in React und [Next.js](nextjs.md) mit. Der Server-Teil streamt die Antwort mit `streamText` an den Browser.
- **Freigaben:** Werkzeuge können mit `needsApproval: true` eine Bestätigung durch den Menschen verlangen, bevor sie laufen.
- **Andere Anbieter:** Mit `@ai-sdk/anthropic` oder `@ai-sdk/openai` und einem kostenpflichtigen Schlüssel in einer Umgebungsvariable tauscht man nur die Zeile mit `model:` aus.
- **Dokumentation:** Die Doku passend zur installierten Version liegt in `node_modules/ai/docs`, online unter <https://ai-sdk.dev/docs>.

## Deinstallieren

### 1. Projekt entfernen

Löscht den Projektordner samt `node_modules`.

```bash
rm -rf ~/agent-aisdk
```

### 2. npm-Zwischenspeicher leeren (optional)

npm bewahrt heruntergeladene Pakete in `~/.npm` auf. Dieser Befehl leert den ganzen Speicher. Das betrifft alle Node.js-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
npm cache clean --force
```

### 3. Node.js und npm entfernen (optional)

Nur ausführen, wenn kein anderes Programm sie braucht, z. B. [Express](express.md) oder [Next.js](nextjs.md).

```bash
sudo apt purge nodejs npm
```

Der nächste Befehl entfernt die Pakete, die nur dafür mitinstalliert wurden. Er entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```
