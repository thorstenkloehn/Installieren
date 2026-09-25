# Pywikibot

Mit Pywikibot schreibst du in Python kleine Programme („Bots“), die in einem MediaWiki ohne Klicken im Browser Seiten lesen, anlegen und ändern. Für häufige Aufgaben wie Suchen und Ersetzen über viele Seiten oder das Einsortieren in Kategorien bringt es fertige Skripte mit. Die Wikipedia-Bots arbeiten seit vielen Jahren damit.

## Vorbemerkungen

- **Voraussetzung:** Ein laufendes MediaWiki, auf dem du ein Benutzerkonto hast. Die Anleitung verwendet das Wiki aus der [MediaWiki-Anleitung](mediawiki.md) unter `http://localhost:8085` mit dem Konto `WikiAdmin`. Für ein anderes Wiki ersetzt du Adresse und Benutzernamen.
- **Installation über pip:** Ubuntu hat kein Paket für Pywikibot. Es wird mit `pip` in eine **virtuelle Umgebung** (venv) installiert, einen eigenen Ordner nur für dieses Projekt. Ubuntu verhindert absichtlich, dass `pip` Pakete systemweit installiert, siehe [Python](python.md).
- **Version:** Getestet mit Pywikibot **11.7.0**, Python 3.14 aus Ubuntu 26.04 und MediaWiki 1.43.
- **Fremde Wikis:** Auf Wikipedia und anderen öffentlichen Wikis darf ein Bot erst nach Genehmigung durch die jeweilige Gemeinschaft schreiben. Probiere Bots deshalb im eigenen Wiki aus.
- **Passwort:** Der Bot meldet sich nicht mit deinem normalen Passwort an, sondern mit einem **Bot-Passwort**. Das erlaubt nur ausgewählte Rechte und lässt sich jederzeit einzeln löschen.

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

In diesem Ordner liegen später die virtuelle Umgebung, die Einstellungen des Bots und deine eigenen Skripte.

```bash
mkdir ~/pywikibot
```

### 4. In den Projektordner wechseln

Pywikibot sucht seine Einstellungsdateien im aktuellen Ordner. Alle weiteren Befehle werden deshalb hier ausgeführt.

```bash
cd ~/pywikibot
```

### 5. Virtuelle Umgebung anlegen

Legt die Umgebung im Unterordner `.venv` an. Dort landen alle Python-Pakete dieses Projekts.

```bash
python3 -m venv .venv
```

### 6. Virtuelle Umgebung einschalten

Danach verwenden `python`, `pip` und `pwb` in diesem Terminal die Programme aus `.venv`. Das gilt nur für das aktuelle Terminal. In einem neuen Terminal wiederholst du die Schritte 4 und 6.

```bash
source .venv/bin/activate
```

**Prüfen:** Vor der Eingabeaufforderung steht jetzt `(.venv)`.

### 7. Pywikibot installieren

`pywikibot` ist die Bibliothek mit dem Startprogramm `pwb`. `pywikibot-scripts` enthält die fertigen Bot-Skripte, z. B. zum Ergänzen von Text oder Ersetzen von Begriffen.

```bash
pip install pywikibot pywikibot-scripts
```

**Prüfen:** Die Ausgabe enthält `Release version: 11.7.0` (oder eine neuere Nummer).

```bash
pwb version
```

## Bot-Passwort im Wiki anlegen

### 8. Seite für Bot-Passwörter öffnen

Öffne <http://localhost:8085/Spezial:BotPasswords> im Browser und melde dich mit `WikiAdmin` an. Die Seite heißt auf Deutsch „Botpasswörter“.

### 9. Bot-Passwort erstellen

Trage bei **Name des Bots** `Pywikibot` ein und klicke auf **Erstellen**. Hake auf der nächsten Seite unter **Anwendbare Berechtigungen** diese Punkte an:

- **(Bot-)Massenbearbeitungen**
- **Vorhandene Seiten bearbeiten**
- **Seiten erstellen, bearbeiten und verschieben**

Klicke unten erneut auf **Erstellen**. Nur diese Rechte stehen dem Bot später zur Verfügung, auch wenn dein Konto mehr darf.

**Prüfen:** Es erscheint „Botpasswort erstellt“ mit einem 32 Zeichen langen Passwort. Kopiere es jetzt, denn das Wiki zeigt es nur dieses eine Mal an.

## Pywikibot einrichten

### 10. Wiki bei Pywikibot bekannt machen

Pywikibot kennt Wikipedia und die anderen Wikimedia-Projekte bereits. Für ein eigenes Wiki braucht es eine sogenannte **Familien-Datei**. Der Befehl liest die nötigen Angaben über die Schnittstelle des Wikis aus und nennt die Familie `meinwiki`. Das `n` am Ende beantwortet die Frage nach weiteren Sprachversionen des Wikis mit Nein.

```bash
pwb generate_family_file http://localhost:8085/Hauptseite meinwiki n
```

**Prüfen:** Die Ausgabe zeigt `API url: http://localhost:8085/api.php` und die MediaWiki-Version und endet mit `Writing …/families/meinwiki_family.py`.

### 11. Benutzereinstellungen erzeugen

Der Befehl fragt nacheinander alles ab, was Pywikibot über dich und dein Wiki wissen muss, und schreibt daraus die Dateien `user-config.py` und `user-password.cfg`.

```bash
pwb generate_user_files
```

Beantworte die Fragen so:

| Frage | Eingabe |
|---|---|
| `Select family of sites we are working on` | `meinwiki` |
| `The site code of the site we're working on (default: de)` | <kbd>Enter</kbd> |
| `Username on de:meinwiki` | `WikiAdmin` |
| `Do you want to add any other projects?` | `n` |
| `Do you want to add a BotPassword for WikiAdmin?` | `y` |
| `BotPassword's "bot name" for WikiAdmin` | `Pywikibot` |
| `BotPassword's "password" for "Pywikibot"` | das Passwort aus Schritt 9 (die Eingabe bleibt unsichtbar) |
| `Do you want to select framework setting sections?` | <kbd>Enter</kbd> |
| `Do you want to select scripts setting sections?` | <kbd>Enter</kbd> |

**Prüfen:** Die Ausgabe endet mit `user-config.py' written.` und `user-password.cfg' written.`. Die Passwortdatei darf nur dein Benutzer lesen, `ls` zeigt deshalb `-rw-------`.

```bash
ls -l user-config.py user-password.cfg
```

### 12. Anmeldung testen

Meldet den Bot mit dem Bot-Passwort am Wiki an.

```bash
pwb login
```

**Prüfen:** Die Ausgabe lautet `Logged in on meinwiki:de as WikiAdmin.`

## Erste Schritte

### 13. Mit einem fertigen Skript eine Seite schreiben

Das Skript `add_text` hängt Text an eine Seite an. Die Angaben bedeuten:

- `-page:Spielwiese` – die Seite, die bearbeitet wird
- `-text:…` – der Text, der angehängt wird
- `-summary:…` – die Zusammenfassung, die in der Versionsgeschichte steht
- `-create` – die Seite anlegen, falls es sie noch nicht gibt
- `-always` – nicht vor jeder Änderung nachfragen

```bash
pwb add_text -page:Spielwiese -text:"Diese Zeile hat Pywikibot geschrieben." -summary:"Test mit Pywikibot" -create -always
```

**Prüfen:** Die Ausgabe endet mit `Script terminated successfully.` Die Seite <http://localhost:8085/Spielwiese> enthält den Satz. In ihrer Versionsgeschichte steht `WikiAdmin` mit der Zusammenfassung „Test mit Pywikibot“.

Pywikibot wartet zwischen zwei Schreibvorgängen absichtlich etwa zehn Sekunden, um das Wiki nicht zu überlasten. Eine einzelne Änderung dauert deshalb spürbar länger als ein Lesezugriff.

Die mitgelieferten Skripte liegen als Python-Dateien in der virtuellen Umgebung. Dieser Befehl listet sie auf:

```bash
ls .venv/lib/python3*/site-packages/pywikibot_scripts
```

Was ein Skript kann und welche Angaben es versteht, zeigt `-help`, z. B.:

```bash
pwb replace -help
```

### 14. Ein eigenes Skript schreiben

Ein eigener Bot ist eine kurze Python-Datei. Lege sie im Projektordner an:

```bash
nano seitenliste.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```python
import pywikibot

site = pywikibot.Site()
for page in site.allpages():
    print(page.title(), len(page.text), "Zeichen")
```

`pywikibot.Site()` verbindet sich mit dem Wiki aus `user-config.py`. `allpages()` liefert nacheinander alle Seiten, `page.text` den Wikitext der Seite.

### 15. Eigenes Skript ausführen

`pwb` findet Skripte im aktuellen Ordner. Der Name wird ohne `.py` angegeben.

```bash
pwb seitenliste
```

**Prüfen:** Jede Seite des Wikis erscheint mit ihrer Länge, z. B. `Spielwiese 38 Zeichen`.

## Aktualisieren

### 1. In den Projektordner wechseln

```bash
cd ~/pywikibot
```

### 2. Virtuelle Umgebung einschalten

```bash
source .venv/bin/activate
```

### 3. Neue Version installieren

`--upgrade` ersetzt beide Pakete durch die neueste Version. Einstellungen, Familien-Datei und eigene Skripte bleiben erhalten.

```bash
pip install --upgrade pywikibot pywikibot-scripts
```

**Prüfen:** `pwb version` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Virtuelle Umgebung ausschalten

Falls sie im aktuellen Terminal noch eingeschaltet ist. `(.venv)` verschwindet aus der Eingabeaufforderung.

```bash
deactivate
```

### 2. Projektordner löschen

Entfernt Pywikibot, die Einstellungen mit dem Bot-Passwort und die eigenen Skripte. **Achtung:** Wer eigene Skripte behalten will, kopiert sie vorher an einen anderen Ort.

```bash
rm -r ~/pywikibot
```

### 3. Bot-Passwort im Wiki löschen

Öffne <http://localhost:8085/Spezial:BotPasswords>, klicke unter **Vorhandene Botpasswörter** auf `Pywikibot` und dann auf **Löschen**. Danach kann sich niemand mehr mit diesem Passwort anmelden, auch wenn es noch irgendwo gespeichert ist.

`python3-venv` bleibt installiert, weil andere Anleitungen es ebenfalls verwenden.

**Prüfen:** Der Ordner ist verschwunden.

```bash
ls ~/pywikibot
```
