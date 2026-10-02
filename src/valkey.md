# Valkey

Valkey ist ein sehr schneller Datenspeicher, der seine Daten im Arbeitsspeicher hält und unter einem Schlüssel ablegt. Webanwendungen nutzen ihn vor allem als Zwischenspeicher (Cache), für Anmeldesitzungen, Zähler und Warteschlangen. Valkey ist ein freier Nachfolger von Redis: Es spricht dasselbe Protokoll und versteht dieselben Befehle, deshalb funktionieren Programme und Bibliotheken für Redis auch mit Valkey. Diese Anleitung richtet den Dienst ein, zeigt die wichtigsten Befehle und sichert ihn mit einem Passwort ab.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **Valkey 9.0**. Mit dem Paket `valkey-server` kommen nur zwei Pakete auf den Rechner: der Server und die Werkzeuge wie `valkey-cli`.
- **Warum nicht Redis?** Ubuntu bietet auch das Paket `redis-server` an. Als Redis 2024 mit Version 7.4 seine freie Lizenz aufgab, wurde der bis dahin freie Code als Valkey unter dem Dach der Linux Foundation weitergeführt. Seit Version 8 gibt es Redis zwar wieder unter einer freien Lizenz (AGPL), Valkey ist aber als eigenständiges, gemeinschaftlich entwickeltes Projekt geblieben. Für die meisten Zwecke sind beide austauschbar.
- **Nur lokal erreichbar:** Der Dienst lauscht nach der Installation nur auf `127.0.0.1` und `::1`, Port 6379. Andere Rechner im Netz erreichen ihn nicht.
- **Ohne Passwort:** Zunächst darf jeder Benutzer dieses Rechners alle Daten lesen und ändern. Abschnitt „Mit einem Passwort schützen“ ändert das.
- **Daten im Arbeitsspeicher:** Valkey schreibt den Inhalt in regelmäßigen Abständen und beim Beenden in die Datei `/var/lib/valkey/dump.rdb`. Nach einem Absturz können die Änderungen der letzten Minuten fehlen. Für Daten, die auf keinen Fall verloren gehen dürfen, ist eine Datenbank wie [PostgreSQL](postgresql.md) besser geeignet.
- **Version:** Getestet mit Valkey **9.0.4** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Valkey installieren

Installiert den Server und das Kommandozeilenprogramm `valkey-cli`. Der Dienst startet sofort und künftig bei jedem Hochfahren.

```bash
sudo apt install valkey-server
```

### 3. Prüfen, ob der Dienst läuft

```bash
systemctl status valkey-server
```

**Prüfen:** In der Ausgabe steht `active (running)`. Beende die Anzeige mit <kbd>q</kbd>.

### 4. Prüfen, dass Valkey nur lokal lauscht

```bash
sudo ss -ltnp | grep 6379
```

**Prüfen:** Es erscheinen zwei Zeilen mit `LISTEN`, eine mit `127.0.0.1:6379` und eine mit `[::1]:6379`.

### 5. Verbindung testen

`PING` ist ein einfacher Lebenszeichen-Befehl.

```bash
valkey-cli ping
```

**Prüfen:** Valkey antwortet mit `PONG`.

## Die wichtigsten Befehle

### 6. Konsole öffnen

```bash
valkey-cli
```

**Prüfen:** Die Eingabezeile lautet `127.0.0.1:6379>`. Die Groß- und Kleinschreibung der Befehle spielt keine Rolle, die der Schlüssel schon.

### 7. Einen Wert speichern

`SET` legt unter dem Schlüssel `gruss` einen Text ab. Enthält der Wert Leerzeichen, gehört er in Anführungszeichen.

```text
SET gruss "Hallo Welt"
```

**Prüfen:** Valkey antwortet mit `OK`.

### 8. Den Wert lesen

```text
GET gruss
```

**Prüfen:** Die Ausgabe lautet `"Hallo Welt"`. Bei einem Schlüssel, den es nicht gibt, erscheint `(nil)`.

### 9. Einen Wert mit Ablaufzeit speichern

`EX 60` lässt den Eintrag nach 60 Sekunden von selbst verschwinden. So arbeiten Zwischenspeicher und Anmeldesitzungen: Alte Einträge räumen sich selbst weg.

```text
SET sitzung:42 angemeldet EX 60
```

Der Doppelpunkt im Schlüssel hat für Valkey keine Bedeutung. Er ist nur eine übliche Art, Schlüssel zu ordnen, ähnlich wie Ordner.

### 10. Restlaufzeit abfragen

```text
TTL sitzung:42
```

**Prüfen:** Die Ausgabe nennt die verbleibenden Sekunden, zum Beispiel `(integer) 54`. Ist der Schlüssel abgelaufen, erscheint `(integer) -2`.

### 11. Einen Zähler erhöhen

`INCR` zählt den Wert um eins hoch und legt den Schlüssel an, wenn es ihn noch nicht gibt. Das geschieht in einem Schritt. Greifen zwei Programme gleichzeitig zu, geht deshalb kein Besuch verloren.

```text
INCR besucher
```

**Prüfen:** Beim ersten Aufruf lautet die Ausgabe `(integer) 1`, beim nächsten `(integer) 2`.

### 12. Mehrere Felder unter einem Schlüssel speichern

Ein Hash fasst zusammengehörige Felder zusammen, ähnlich wie eine Tabellenzeile.

```text
HSET modell:1 name Citybike preis 699 lager 4
```

**Prüfen:** Die Ausgabe `(integer) 3` nennt die Zahl der neu angelegten Felder.

### 13. Alle Felder lesen

```text
HGETALL modell:1
```

**Prüfen:** Die Ausgabe zeigt abwechselnd Feldname und Wert:

```text
1) "name"
2) "Citybike"
3) "preis"
4) "699"
5) "lager"
6) "4"
```

### 14. Eine Warteschlange füllen

`RPUSH` hängt Einträge hinten an eine Liste an.

```text
RPUSH aufgaben "Kette schmieren" "Licht testen"
```

### 15. Den ersten Eintrag abholen

`LPOP` nimmt den vordersten Eintrag heraus. So kann ein Programm Aufträge in die Liste stellen und ein anderes sie der Reihe nach abarbeiten.

```text
LPOP aufgaben
```

**Prüfen:** Die Ausgabe lautet `"Kette schmieren"`. Mit `LRANGE aufgaben 0 -1` siehst du, was noch in der Liste steht.

### 16. Vorhandene Schlüssel auflisten

```text
SCAN 0
```

**Prüfen:** Unter `2)` stehen die Schlüssel, die du angelegt hast. `sitzung:42` fehlt, wenn die 60 Sekunden um sind. `SCAN` liefert bei vielen Schlüsseln nur einen Teil und unter `1)` eine Zahl zum Weiterblättern. Der ältere Befehl `KEYS *` zeigt alles auf einmal, blockiert dabei aber den Server und ist für große Datenbestände ungeeignet.

### 17. Einen Schlüssel löschen

```text
DEL gruss
```

**Prüfen:** Die Ausgabe `(integer) 1` zeigt, dass ein Schlüssel gelöscht wurde.

### 18. Konsole verlassen

```text
quit
```

> **Umlaute:** In der Konsole erscheint ein gespeichertes „ö“ als `\xc3\xb6`. Das ist nur eine Frage der Anzeige, die Daten sind richtig gespeichert. Mit `valkey-cli --raw` werden Umlaute normal angezeigt.

## Mit einem Passwort schützen

Ohne Passwort kann jedes Programm auf diesem Rechner die Daten lesen und löschen. Ein Passwort verhindert das.

### 19. Konfigurationsdatei öffnen

Die Datei gehört dem Benutzer `valkey` und lässt sich nur mit `sudo` bearbeiten.

```bash
sudo nano /etc/valkey/valkey.conf
```

### 20. Passwort eintragen

Die Datei ist sehr lang. Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `# requirepass` und drücke <kbd>Enter</kbd>. Füge unter der gefundenen Zeile `# requirepass foobared` eine neue Zeile ein und ersetze `GEHEIMES-PASSWORT` durch ein eigenes, langes Passwort:

```text
requirepass GEHEIMES-PASSWORT
```

Valkey prüft Passwörter sehr schnell. Ein Angreifer kann deshalb viele Passwörter in kurzer Zeit durchprobieren. Wähle also ein langes Passwort, zum Beispiel aus `openssl rand -base64 32`.

### 21. Speichergrenze festlegen (empfohlen)

Ohne Grenze wächst Valkey, bis der Arbeitsspeicher voll ist. Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `# maxmemory <bytes>`. Füge darunter diese Zeile ein:

```text
maxmemory 256mb
```

Suche dann nach `# maxmemory-policy noeviction` und füge darunter ein:

```text
maxmemory-policy allkeys-lru
```

- **`maxmemory 256mb`** – Valkey belegt höchstens 256 Megabyte für Daten.
- **`allkeys-lru`** – ist die Grenze erreicht, löscht Valkey die Schlüssel, die am längsten nicht benutzt wurden. Das passt für einen Zwischenspeicher. Werden in Valkey Daten abgelegt, die nicht verloren gehen dürfen, die Zeile weglassen: Dann lehnt Valkey beim Erreichen der Grenze neue Schreibbefehle mit einer Fehlermeldung ab.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 22. Dienst neu starten

Valkey liest die Konfiguration nur beim Start.

```bash
sudo systemctl restart valkey-server
```

### 23. Prüfen, dass das Passwort verlangt wird

```bash
valkey-cli ping
```

**Prüfen:** Statt `PONG` erscheint jetzt `NOAUTH Authentication required.`

### 24. Mit Passwort anmelden

`--askpass` fragt das Passwort ab, ohne es anzuzeigen. Anders als bei `-a PASSWORT` landet es so nicht im Befehlsverlauf der Shell.

```bash
valkey-cli --askpass
```

**Prüfen:** In der Konsole antwortet `PING` mit `PONG` und `CONFIG GET maxmemory` mit `268435456` (256 MB in Byte). Verlasse die Konsole mit `quit`.

In einer bereits geöffneten Konsole meldet man sich alternativ mit `AUTH GEHEIMES-PASSWORT` an.

## Aus Python zugreifen

### 25. Python-Bibliothek installieren

Die Bibliothek heißt `redis`, funktioniert aber genauso mit Valkey.

```bash
sudo apt install python3-redis
```

### 26. Übungsordner anlegen

```bash
mkdir ~/valkey-uebung
```

### 27. In den Ordner wechseln

```bash
cd ~/valkey-uebung
```

### 28. Programm anlegen

Das Programm zählt bei jedem Aufruf einen Besuch hoch und speichert einen Text für fünf Minuten.

```bash
nano zaehler.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
import getpass
import redis

passwort = getpass.getpass("Valkey-Passwort: ")
db = redis.Redis(host="localhost", port=6379, password=passwort, decode_responses=True)

anzahl = db.incr("besuche")
db.set("letzter_gruss", "Schön, dass du da bist!", ex=300)

print("Besuch Nummer", anzahl)
print(db.get("letzter_gruss"))
```

- **`decode_responses=True`** – liefert Texte als Python-Zeichenketten statt als Bytes. Umlaute erscheinen dadurch richtig.
- **`ex=300`** – entspricht `EX 300` in der Konsole: Der Eintrag verschwindet nach fünf Minuten.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 29. Programm ausführen

```bash
python3 zaehler.py
```

**Prüfen:** Nach dem Passwort erscheinen `Besuch Nummer 1` und `Schön, dass du da bist!`. Bei jedem weiteren Aufruf steigt die Nummer um eins.

## Sichern

### 30. Sofort auf die Festplatte schreiben

Valkey speichert von selbst in Abständen. `BGSAVE` stößt das Speichern sofort an, zum Beispiel vor einer Sicherung. Gib das Passwort ein, wenn danach gefragt wird.

```bash
valkey-cli --askpass BGSAVE
```

**Prüfen:** Die Antwort lautet `Background saving started`.

### 31. Sicherungsdatei kopieren

Die Datei `dump.rdb` enthält den gesamten Datenbestand. Eine Kopie davon ist die Sicherung.

```bash
sudo cp /var/lib/valkey/dump.rdb ~/valkey-sicherung.rdb
```

Zum Wiederherstellen den Dienst mit `sudo systemctl stop valkey-server` anhalten, die Kopie zurück nach `/var/lib/valkey/dump.rdb` legen, mit `sudo chown valkey:valkey /var/lib/valkey/dump.rdb` dem Benutzer `valkey` übergeben und den Dienst wieder starten.

## Optional: Autostart ausschalten

Wer Valkey nur ab und zu braucht, kann den Dienst beim Hochfahren weglassen und bei Bedarf mit `sudo systemctl start valkey-server` starten.

```bash
sudo systemctl disable --now valkey-server
```

## Wie geht es weiter?

- **Aus PHP zugreifen:** Das Paket `php-redis` bringt die Erweiterung für [PHP](php.md) mit. Viele PHP-Anwendungen können darüber Sitzungen und Zwischenergebnisse in Valkey ablegen.
- **Mehrere Benutzer:** Statt eines gemeinsamen Passworts lassen sich mit `ACL SETUSER` eigene Benutzer anlegen, die nur bestimmte Befehle und Schlüssel verwenden dürfen.
- **Mehr Schutz vor Datenverlust:** Mit `appendonly yes` in `/etc/valkey/valkey.conf` schreibt Valkey jede Änderung zusätzlich in ein Protokoll. Nach einem Absturz fehlt dann höchstens die letzte Sekunde.
- **Dokumentation:** Alle Befehle mit Erklärung unter <https://valkey.io/commands/>.

## Deinstallieren

### 1. Übungsordner und Sicherung entfernen

```bash
rm -rf ~/valkey-uebung ~/valkey-sicherung.rdb
```

### 2. Python-Bibliothek entfernen (falls installiert)

```bash
sudo apt purge python3-redis
```

### 3. Valkey entfernen

**Achtung:** `purge` löscht neben der Konfiguration in `/etc/valkey` auch die gespeicherten Daten in `/var/lib/valkey` und das Protokoll in `/var/log/valkey`, und zwar ohne Nachfrage. Wer die Daten noch braucht, kopiert vorher die Datei `dump.rdb` wie in Schritt 31 an einen anderen Ort, aber nicht in einen der Ordner aus Schritt 1, die dort gelöscht werden.

```bash
sudo apt purge valkey-server valkey-tools
```

**Prüfen:** Der Befehl `valkey-cli` wird nicht mehr gefunden.

```bash
valkey-cli --version
```
