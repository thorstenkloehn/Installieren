# Nikola

Nikola ist ein Generator für statische Websites und Blogs in Python. Er bringt ein fertiges Design, Archiv, Kategorien, Schlagwörter, RSS-Feed, Bildergalerien und deutsche Beschriftungen mit und baut bei Änderungen nur die Seiten neu, die sich wirklich geändert haben.

## Vorbemerkungen

- **Kein apt-Paket:** Nikola ist nicht in den Ubuntu-Paketquellen enthalten. Diese Anleitung installiert es deshalb mit `pip` in eine **virtuelle Umgebung** (venv), einen eigenen Ordner nur für dieses Projekt, siehe [Python](python.md). Das System-Python bleibt so unverändert.
- **Version:** Getestet mit Nikola **8.3.3** und Python 3.14 aus Ubuntu 26.04.
- **Keine automatische Vorschau:** Der Befehl `nikola auto`, der die Website bei jeder Änderung neu baut, bricht in Version 8.3.3 unter Python 3.14 mit einem Fehler ab. Diese Anleitung verwendet deshalb `nikola build` zum Bauen und `nikola serve` für die Vorschau.
- **Port:** Die Vorschau läuft auf Port **8000**, nur vom eigenen Rechner aus erreichbar. Läuft dort schon ein anderes Programm, z. B. aus der [Pelican-Anleitung](pelican.md), hängst du an den Befehl in Schritt 12 `--port 8001` an.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version von `python3-venv` kennt.

```bash
sudo apt update
```

### 2. Werkzeug für virtuelle Umgebungen installieren

`python3-venv` enthält das Werkzeug, mit dem Python virtuelle Umgebungen anlegt. Python selbst ist unter Ubuntu schon installiert.

```bash
sudo apt install python3-venv
```

### 3. Projektordner anlegen

In diesem Ordner liegen später die virtuelle Umgebung, die Einstellungen und alle Beiträge.

```bash
mkdir ~/meinnikola
```

### 4. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/meinnikola
```

### 5. Virtuelle Umgebung anlegen

Legt die Umgebung im Unterordner `.venv` an.

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung einschalten

Danach verwenden `pip` und `nikola` in diesem Terminal die Programme aus `.venv`. In einem neuen Terminal wiederholst du die Schritte 4 und 6.

```bash
source .venv/bin/activate
```

**Prüfen:** Vor der Eingabeaufforderung steht jetzt `(.venv)`.

### 7. Nikola installieren

Installiert Nikola mit allem, was es für Markdown, das Standard-Design und die Vorschau braucht.

```bash
pip install Nikola
```

**Prüfen:** Die Ausgabe lautet `Nikola v8.3.3` (oder eine neuere Nummer).

```bash
nikola version
```

## Eine Website anlegen

### 8. Grundgerüst erzeugen

Der Punkt steht für den aktuellen Ordner. Der Assistent fragt einige Angaben ab, schreibt sie in die Einstellungsdatei `conf.py` und legt die Ordner `posts` (Blogbeiträge), `pages` (feste Seiten wie „Über mich“), `images`, `galleries`, `files` und `listings` an.

```bash
nikola init .
```

Beantworte die Fragen so:

| Frage | Eingabe |
|---|---|
| `Site title` | `Meine Website` |
| `Site author` | dein Name |
| `Site author's e-mail` | deine E-Mail-Adresse (erscheint im RSS-Feed) |
| `Site description` | ein kurzer Satz über die Website |
| `Site URL` | <kbd>Enter</kbd> (`https://example.com/`, später in `conf.py` änderbar) |
| `Enable pretty URLs …?` | <kbd>Enter</kbd> (ja, Adressen wie `/posts/titel/`) |
| `Language(s) to use` | `de` |
| `Time zone` | <kbd>Enter</kbd> (Nikola schlägt die Zeitzone des Rechners vor, z. B. `Europe/Berlin`) |
| `Use this time zone?` | <kbd>Enter</kbd> (ja) |
| `Comment system` | <kbd>Enter</kbd> (keine Kommentare) |

**Prüfen:** Die Ausgabe endet mit `That's it, Nikola is now configured.`

### 9. Einen Beitrag anlegen

`new_post` legt im Ordner `posts` eine neue Datei mit allen Metadaten und dem aktuellen Datum an. `-f markdown` wählt Markdown als Format, `-t` setzt den Titel. Aus dem Titel bildet Nikola den Dateinamen und die Adresse.

```bash
nikola new_post -f markdown -t "Mein erster Beitrag"
```

**Prüfen:** Die Datei `posts/mein-erster-beitrag.md` ist vorhanden.

```bash
ls posts
```

### 10. Beitrag schreiben

```bash
nano posts/mein-erster-beitrag.md
```

Oben in der Datei steht ein Kommentarblock (`<!--` bis `-->`) mit den Metadaten. Gehe in die Zeile `.. tags:` und schreibe dahinter `nikola, blog`. Ersetze ganz unten den Platzhaltertext `Schreibe hier deinen Eintrag hin.` durch deinen Text, zum Beispiel:

```markdown
Diese Seite wurde mit **Nikola** gebaut.
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 11. Website bauen

Liest Beiträge und Seiten und schreibt die fertige Website in den Ordner `output`. Beim ersten Mal kopiert Nikola auch das Design dorthin, jedes weitere Mal baut es nur die geänderten Seiten neu.

```bash
nikola build
```

**Prüfen:** Im Ordner `output` liegen unter anderem `index.html`, `archive.html`, `rss.xml` und der Ordner `posts`.

```bash
ls output
```

### 12. Vorschau starten

Startet einen kleinen Webserver für den Ordner `output`. Ohne `-a 127.0.0.1` wäre die Vorschau im ganzen Netzwerk erreichbar.

```bash
nikola serve -a 127.0.0.1
```

**Prüfen:** Die Ausgabe enthält `Serving on http://127.0.0.1:8000/`. Öffne <http://localhost:8000> im Browser. Oben steht „Meine Website“, darunter der Beitrag mit Datum und Schlagwörtern.

Beende die Vorschau mit <kbd>Strg</kbd>+<kbd>C</kbd>. Nach jeder Änderung an Beiträgen oder `conf.py` rufst du `nikola build` erneut auf und lädst die Seite im Browser neu.

### 13. Website für die Veröffentlichung vorbereiten

In `conf.py` stehen alle Einstellungen, gut kommentiert.

```bash
nano conf.py
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `SITE_URL =` und ersetze `https://example.com/` durch die echte Adresse deiner Website, sonst zeigen RSS-Feed und Sitemap auf `example.com`. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd>, beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd> und baue die Website mit `nikola build` neu.

Den Inhalt von `output` kann jeder Webserver ausliefern, zum Beispiel wie in [Statische Website mit nginx](nginx-statisch.md) beschrieben.

## Aktualisieren

### 1. In den Projektordner wechseln

```bash
cd ~/meinnikola
```

### 2. Virtuelle Umgebung einschalten

```bash
source .venv/bin/activate
```

### 3. Neue Version installieren

Einstellungen und Beiträge bleiben erhalten.

```bash
pip install --upgrade Nikola
```

**Prüfen:** `nikola version` zeigt die neue Versionsnummer. Danach mit `nikola build` neu bauen.

## Deinstallieren

### 1. Virtuelle Umgebung ausschalten

Falls sie im aktuellen Terminal noch eingeschaltet ist.

```bash
deactivate
```

### 2. Projektordner löschen

Entfernt Nikola, die Einstellungen, alle Beiträge und die gebaute Website. **Achtung:** Wer die Beiträge behalten will, kopiert vorher die Ordner `~/meinnikola/posts` und `~/meinnikola/pages`.

```bash
rm -r ~/meinnikola
```

**Prüfen:** Der Ordner ist verschwunden.

```bash
ls ~/meinnikola
```

`python3-venv` bleibt installiert, weil andere Anleitungen es ebenfalls verwenden.
