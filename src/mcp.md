# Model Context Protocol (MCP)

Das Model Context Protocol ist ein offener Standard, über den KI-Anwendungen auf Werkzeuge und Daten zugreifen. Ein **MCP-Server** bietet Werkzeuge an, etwa eine Datenbankabfrage oder eine Suche, und ein **MCP-Client** wie Claude Code, ein Agenten-Framework oder ein Chatprogramm verwendet sie. Diese Anleitung baut mit dem offiziellen Python-SDK einen eigenen Server und bindet ihn an.

## Vorbemerkungen

- **Wozu?** Ohne MCP muss man jedes Werkzeug für jedes Programm neu einbauen, etwa einmal für [LangGraph](langgraph.md) und einmal für [Pydantic AI](pydantic-ai.md). Ein MCP-Server wird einmal geschrieben und funktioniert dann mit allen Programmen, die MCP verstehen.
- **Bausteine:** Ein Server bietet **Werkzeuge** (Funktionen, die das Modell aufruft), **Ressourcen** (Daten zum Lesen, mit einer Adresse wie `laden://adresse`) und **Prompts** (Vorlagen) an.
- **Verbindung über stdio:** Meist startet der Client den Server als eigenes Programm und spricht über dessen Ein- und Ausgabe mit ihm. Ein Netzwerkport ist dafür nicht nötig. Alternativ kann ein Server auch über HTTP laufen.
- **Version 2 des SDK:** Diese Anleitung verwendet mcp **2.2**. Viele Beispiele im Netz stammen noch aus Version 1 und verwenden `FastMCP`. Diese Klasse heißt jetzt `MCPServer`. Alter Code bricht mit einer Fehlermeldung ab, die auf die neue Klasse hinweist.
- **Installation über pip:** Das SDK ist nicht in den Ubuntu-Paketquellen enthalten. Es wird mit `pip` in eine **virtuelle Umgebung** installiert, rund 75 MB.
- **Version:** Getestet mit mcp **2.2.0** unter Python 3.14 aus Ubuntu 26.04 und Claude Code 2.1.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Unterstützung für virtuelle Umgebungen installieren

Ist das Paket schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install python3-venv
```

### 3. Projektordner anlegen

```bash
mkdir ~/mcp-laden
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/mcp-laden
```

### 5. Virtuelle Umgebung anlegen

Legt eine eigene Python-Umgebung für dieses Projekt im Unterordner `.venv` an. Ubuntu verhindert absichtlich, dass `pip` Pakete systemweit installiert.

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung aktivieren

Danach verwenden `python` und `pip` die Umgebung. Die Eingabezeile beginnt mit `(.venv)`. In jedem neuen Terminal muss die Umgebung erneut aktiviert werden.

```bash
source .venv/bin/activate
```

### 7. MCP-SDK installieren

`[cli]` installiert zusätzlich den Befehl `mcp` mit Hilfsprogrammen für die Entwicklung.

```bash
pip install "mcp[cli]"
```

**Prüfen:** Die Ausgabe nennt `Version: 2.2.0` oder eine neuere Version.

```bash
pip show mcp
```

## Einen MCP-Server schreiben

### 8. Server anlegen

Der Server gibt Auskunft über einen Fahrradladen. Er bietet zwei Werkzeuge an, Lagerbestand und Öffnungszeiten, und eine Ressource mit der Anschrift.

```bash
nano laden_server.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
from pydantic import BaseModel

from mcp.server import MCPServer

server = MCPServer("Fahrradladen", instructions="Auskünfte über Lager und Öffnungszeiten eines Fahrradladens.")

LAGER = {"citybike": 4, "trekkingrad": 0, "lastenrad": 1}
ZEITEN = {
    "montag": "9 bis 18 Uhr",
    "dienstag": "9 bis 18 Uhr",
    "mittwoch": "9 bis 18 Uhr",
    "donnerstag": "9 bis 18 Uhr",
    "freitag": "9 bis 18 Uhr",
    "samstag": "10 bis 14 Uhr",
    "sonntag": "geschlossen",
}


class Bestand(BaseModel):
    modell: str
    anzahl: int | None


@server.tool()
def lagerbestand(modell: str) -> Bestand:
    """Gibt zurück, wie viele Räder eines Modells (citybike, trekkingrad, lastenrad) im Lager sind."""
    return Bestand(modell=modell, anzahl=LAGER.get(modell.strip().lower()))


@server.tool()
def oeffnungszeiten(wochentag: str) -> str:
    """Nennt die Öffnungszeiten des Ladens an einem Wochentag, z. B. samstag."""
    return ZEITEN.get(wochentag.strip().lower(), "Unbekannter Wochentag")


@server.resource("laden://adresse")
def adresse() -> str:
    """Anschrift des Ladens."""
    return "Fahrradladen Speiche, Große Straße 1, 22926 Ahrensburg"


if __name__ == "__main__":
    server.run()
```

- **`MCPServer`** – der Server. `instructions` erklärt dem Client, wofür der Server da ist.
- **`@server.tool()`** – macht eine Funktion zu einem Werkzeug. Der Name der Funktion wird zum Namen des Werkzeugs, der Docstring zur Beschreibung für das Modell, die Typangaben zur Beschreibung der Parameter.
- **`Bestand`** – ein Pydantic-Modell als Rückgabetyp. Dann liefert der Server die Antwort zusätzlich als **strukturierte Daten** mit festen Feldern, die ein Programm direkt weiterverarbeiten kann.
- **`@server.resource(…)`** – stellt Daten unter einer festen Adresse zum Lesen bereit.
- **`server.run()`** – startet den Server über stdio. Er wartet dann auf Anfragen und gibt selbst nichts im Terminal aus.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

## Den Server aus Python verwenden

### 9. Client anlegen

Der Client startet den Server, fragt ab, welche Werkzeuge es gibt, ruft sie auf und liest die Ressource.

```bash
nano client.py
```

Füge diesen Inhalt ein:

```python
import asyncio
import sys

from mcp import StdioServerParameters
from mcp.client import Client


async def main():
    # Den Server mit demselben Python starten, das auch den Client ausführt
    server = StdioServerParameters(command=sys.executable, args=["laden_server.py"])

    async with Client(server) as client:
        werkzeuge = await client.list_tools()
        for werkzeug in werkzeuge.tools:
            print("Werkzeug:", werkzeug.name, "-", werkzeug.description)

        ergebnis = await client.call_tool("lagerbestand", {"modell": "lastenrad"})
        print("lagerbestand:", ergebnis.structured_content)

        ergebnis = await client.call_tool("oeffnungszeiten", {"wochentag": "Samstag"})
        print("oeffnungszeiten:", ergebnis.content[0].text)

        inhalt = await client.read_resource("laden://adresse")
        print("Adresse:", inhalt.contents[0].text)


asyncio.run(main())
```

- **`StdioServerParameters`** – sagt dem Client, wie er den Server startet. `sys.executable` ist das Python der virtuellen Umgebung. Ein einfaches `python` würde in manchen Fällen das Python von Ubuntu treffen, dem das Paket `mcp` fehlt.
- **`Client(server)`** – startet den Server und handelt mit ihm die Protokollversion aus. Am Ende des `async with`-Blocks beendet er ihn wieder.
- **`structured_content`** – die strukturierte Antwort aus dem Pydantic-Modell. `content` enthält dieselbe Antwort als Text für das Sprachmodell.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Client ausführen

```bash
python client.py
```

**Prüfen:** Die Ausgabe lautet:

```text
Werkzeug: lagerbestand - Gibt zurück, wie viele Räder eines Modells (citybike, trekkingrad, lastenrad) im Lager sind.
Werkzeug: oeffnungszeiten - Nennt die Öffnungszeiten des Ladens an einem Wochentag, z. B. samstag.
lagerbestand: {'modell': 'lastenrad', 'anzahl': 1}
oeffnungszeiten: 10 bis 14 Uhr
Adresse: Fahrradladen Speiche, Große Straße 1, 22926 Ahrensburg
```

## Den Server in Claude Code einbinden

Dieser Teil setzt ein installiertes Claude Code voraus. Andere Programme mit MCP-Unterstützung binden einen Server auf ähnliche Weise ein: Man nennt ihnen den Befehl, mit dem sie den Server starten.

### 11. Server anmelden

Meldet den Server unter dem Namen `laden` an. Hinter `--` steht der Befehl, mit dem Claude Code ihn startet, mit vollständigen Pfaden, weil Claude Code die virtuelle Umgebung nicht kennt. `$HOME` ersetzt die Shell durch den Home-Ordner. Ohne weitere Angabe gilt der Eintrag nur, wenn Claude Code im aktuellen Ordner gestartet wird.

```bash
claude mcp add laden -- $HOME/mcp-laden/.venv/bin/python $HOME/mcp-laden/laden_server.py
```

**Prüfen:** Die Ausgabe beginnt mit `Added stdio MCP server laden`.

### 12. Verbindung prüfen

Claude Code startet dabei jeden angemeldeten Server kurz und prüft, ob er antwortet.

```bash
claude mcp list
```

**Prüfen:** In der Liste steht `laden: … - ✔ Connected`.

### 13. Claude Code verwenden

Starte Claude Code im Projektordner:

```bash
claude
```

Frage dann zum Beispiel „Habt ihr ein Lastenrad auf Lager, und bis wann habt ihr am Samstag geöffnet?“. Claude Code ruft dafür die Werkzeuge `lagerbestand` und `oeffnungszeiten` des Servers `laden` auf. Je nach Einstellung fragt es vorher, ob es das darf. Mit `/mcp` zeigt Claude Code die angemeldeten Server und ihre Werkzeuge an.

Getestet wurde hier die Verbindung aus Schritt 12, nicht ein ganzes Gespräch in Claude Code.

## Wie geht es weiter?

- **Über HTTP:** `server.run(transport="streamable-http", port=8000)` startet den Server als Webdienst unter `http://127.0.0.1:8000/mcp`. Im Client genügt dann `Client("http://127.0.0.1:8000/mcp")`. Der Server lauscht dabei nur für den eigenen Rechner. Für den Zugriff von anderen Rechnern schaltet man [nginx](nginx.md) mit HTTPS davor.
- **Prüfwerkzeug:** `mcp dev laden_server.py` startet den MCP Inspector, eine Weboberfläche zum Ausprobieren der Werkzeuge. Er braucht Node.js mit `npx`.
- **In Agenten-Frameworks:** [Pydantic AI](pydantic-ai.md), das [OpenAI Agents SDK](openai-agents.md), [LangGraph](langgraph.md) und andere können MCP-Server einbinden. So nutzt auch ein lokales Modell aus [Ollama](ollama.md) dieselben Werkzeuge.
- **Fertige Server:** Für Dateisystem, Git, Datenbanken und viele Webdienste gibt es fertige MCP-Server, eine Übersicht unter <https://github.com/modelcontextprotocol/servers>.
- **Dokumentation:** <https://modelcontextprotocol.io> und für das Python-SDK <https://py.sdk.modelcontextprotocol.io>

## Deinstallieren

### 1. Server bei Claude Code abmelden

Nur nötig, wenn du ihn in Schritt 11 angemeldet hast. Den Befehl im Projektordner ausführen, denn der Eintrag gilt nur dort.

```bash
claude mcp remove laden
```

### 2. Virtuelle Umgebung verlassen

```bash
deactivate
```

### 3. Projekt entfernen

Löscht den Projektordner samt virtueller Umgebung.

```bash
rm -rf ~/mcp-laden
```

### 4. Zwischenspeicher von pip leeren (optional)

`pip` bewahrt heruntergeladene Pakete in `~/.cache/pip` auf. Der Befehl leert den ganzen Speicher. Das betrifft alle Python-Projekte, die ihre Pakete dann beim nächsten Mal wieder aus dem Internet laden.

```bash
pip cache purge
```
