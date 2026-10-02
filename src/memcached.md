# Memcached

Memcached ist ein Zwischenspeicher (Cache) im Arbeitsspeicher. Programme legen dort Ergebnisse ab, deren Berechnung oder Abfrage lange dauert, und holen sie beim nächsten Mal in Sekundenbruchteilen wieder heraus. Webanwendungen wie [MediaWiki](mediawiki.md), [Drupal](drupal.md) oder [WordPress](nginx-wordpress.md) entlasten so ihre Datenbank. Diese Anleitung installiert den Dienst, zeigt die Grundbefehle und nutzt den Cache aus einem kleinen Python-Programm.

## Vorbemerkungen

- **Nur ein Cache, keine Datenbank:** Memcached speichert nichts auf der Festplatte. Nach einem Neustart des Dienstes ist alles weg, und wenn der Speicher voll ist, wirft Memcached die am längsten nicht genutzten Einträge hinaus. Ablegen sollte man dort deshalb nur Daten, die sich jederzeit neu erzeugen lassen.
- **Unterschied zu Valkey:** [Valkey](valkey.md) kann Daten auf die Festplatte schreiben und kennt Listen, Mengen und Warteschlangen. Memcached kennt nur Schlüssel mit einem Wert, ist dafür sehr einfach und braucht kaum Einstellungen.
- **Keine Anmeldung:** Wer den Port erreicht, kann alles lesen und löschen. Ubuntu lässt Memcached deshalb nur auf `127.0.0.1` und `::1` lauschen, also nur auf dem eigenen Rechner. Das sollte man ohne Firewall nicht ändern.
- **Pakete:** `memcached` ist der Dienst, `libmemcached-tools` bringt kleine Befehle zum Ausprobieren mit (`memcstat`, `memccp`, `memccat` und weitere). Zusammen kommen 6 Pakete auf den Rechner.
- **Version:** Getestet mit Memcached **1.6.40** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

So kennt `apt` die neuesten Paketversionen.

```bash
sudo apt update
```

### 2. Memcached und Werkzeuge installieren

Der Dienst startet sofort nach der Installation und künftig bei jedem Hochfahren.

```bash
sudo apt install memcached libmemcached-tools
```

**Prüfen:** Die Versionsnummer wird ausgegeben.

```bash
memcached --version
```

### 3. Dienst prüfen

```bash
systemctl status memcached
```

**Prüfen:** In der Ausgabe steht `active (running)`. Mit <kbd>q</kbd> kommst du zurück.

### 4. Offene Ports prüfen

```bash
sudo ss -ltnp | grep memcached
```

**Prüfen:** Es erscheinen zwei Zeilen mit `127.0.0.1:11211` und `[::1]:11211`. 11211 ist der Standardport von Memcached.

### 5. Kennzahlen abrufen

`memcstat` fragt den laufenden Dienst nach seinen Zahlen. `--servers=localhost` gibt an, mit welchem Memcached es sprechen soll.

```bash
memcstat --servers=localhost
```

**Prüfen:** Die Liste beginnt mit `Server: localhost (11211)`. Weiter unten zeigt `limit_maxbytes: 67108864`, dass der Cache höchstens 64 MB belegt, und `curr_items: 0`, dass er noch leer ist.

## Mit den Werkzeugen ausprobieren

### 6. Übungsordner anlegen

```bash
mkdir ~/memcached-uebung
```

### 7. In den Ordner wechseln

```bash
cd ~/memcached-uebung
```

### 8. Kleine Textdatei anlegen

```bash
nano gruss.txt
```

Schreibe eine Zeile hinein, zum Beispiel:

```text
Hallo aus dem Zwischenspeicher
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Datei in den Cache legen

`memccp` speichert den Inhalt der Datei. Als Schlüssel dient der Dateiname, hier also `gruss.txt`.

```bash
memccp --servers=localhost gruss.txt
```

### 10. Eintrag wieder auslesen

```bash
memccat --servers=localhost gruss.txt
```

**Prüfen:** Der Satz aus der Datei erscheint.

### 11. Eintrag mit Ablaufzeit speichern

`--expire=10` legt fest, dass Memcached den Eintrag nach 10 Sekunden vergisst. Der vorige Eintrag mit gleichem Schlüssel wird dabei ersetzt.

```bash
memccp --servers=localhost --expire=10 gruss.txt
```

### 12. Nach Ablauf erneut lesen

Warte gut 10 Sekunden und frage dann noch einmal ab.

```bash
memccat --servers=localhost gruss.txt
```

**Prüfen:** Diesmal kommt keine Ausgabe, denn der Eintrag ist abgelaufen.

## Direkt mit dem Dienst sprechen

Memcached versteht einfache Textbefehle. Mit `nc` (Netcat, auf Ubuntu vorinstalliert) lassen sie sich von Hand eintippen. So sieht man, was Programme im Hintergrund tun.

### 13. Verbindung öffnen

`-C` sorgt dafür, dass jede Zeile so abgeschlossen wird, wie Memcached es erwartet (Wagenrücklauf und Zeilenvorschub). Ohne diese Angabe meldet Memcached `bad data chunk`. Es erscheint keine Eingabeaufforderung; tippe einfach los.

```bash
nc -C localhost 11211
```

### 14. Wert speichern

Ein `set`-Befehl besteht aus zwei Zeilen. Die erste nennt Schlüssel, eine Kennzahl für Programme (hier `0`), die Lebensdauer in Sekunden (`300`) und die Länge des Werts in Bytes. Die zweite Zeile ist der Wert selbst. `Ahrensburg` hat 10 Zeichen.

```text
set stadt 0 300 10
Ahrensburg
```

**Prüfen:** Memcached antwortet mit `STORED`. Stimmt die Länge nicht, kommt `CLIENT_ERROR bad data chunk`.

### 15. Wert lesen

```text
get stadt
```

**Prüfen:** Die Antwort lautet:

```text
VALUE stadt 0 10
Ahrensburg
END
```

### 16. Zähler hochzählen

Zuerst einen Zähler mit dem Wert `0` anlegen (Länge 1), dann mit `incr` erhöhen. `incr` gibt sofort den neuen Stand zurück.

```text
set besucher 0 0 1
0
incr besucher 1
incr besucher 5
```

**Prüfen:** Nach `STORED` erscheinen `1` und `6`. Eine Lebensdauer von `0` bedeutet: Der Eintrag läuft nie ab.

### 17. Eintrag löschen

```text
delete stadt
```

**Prüfen:** Die Antwort lautet `DELETED`. Ein folgendes `get stadt` liefert nur noch `END`.

### 18. Verbindung beenden

```text
quit
```

Memcached trennt dann die Verbindung. Kehrt die Eingabezeile nicht von selbst zurück, beende `nc` mit <kbd>Strg</kbd>+<kbd>C</kbd>.

## Aus Python nutzen

Das folgende Beispiel zeigt den typischen Ablauf: zuerst im Cache nachsehen, nur bei einem Fehlschlag die langsame Abfrage ausführen und das Ergebnis für später ablegen.

### 19. Python-Bibliothek installieren

`pymemcache` ist eine Bibliothek, mit der Python-Programme Memcached ansprechen.

```bash
sudo apt install python3-pymemcache
```

### 20. Programm anlegen

```bash
nano wetter.py
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```python
import time
from pymemcache.client.base import Client

cache = Client(("localhost", 11211))


def langsame_abfrage(stadt):
    """Tut so, als würde ein entfernter Dienst zwei Sekunden brauchen."""
    time.sleep(2)
    return f"Sonnig in {stadt}"


def wetter(stadt):
    schluessel = "wetter:" + stadt.lower()
    treffer = cache.get(schluessel)
    if treffer is not None:
        return treffer.decode(), "aus dem Cache"
    ergebnis = langsame_abfrage(stadt)
    cache.set(schluessel, ergebnis, expire=60)
    return ergebnis, "neu abgefragt"


for runde in (1, 2):
    start = time.perf_counter()
    text, herkunft = wetter("Ahrensburg")
    dauer = time.perf_counter() - start
    print(f"Runde {runde}: {text} ({herkunft}, {dauer:.2f} s)")
```

- **`"wetter:" + stadt.lower()`** – ein Schlüssel mit Vorsilbe. So kommen sich Einträge verschiedener Programmteile nicht in die Quere.
- **`cache.get(…)`** – liefert den gespeicherten Wert als Bytes oder `None`, wenn es keinen Eintrag gibt. `.decode()` macht daraus wieder Text.
- **`expire=60`** – das Ergebnis bleibt eine Minute gültig. Danach wird neu abgefragt, damit keine veralteten Daten ausgeliefert werden.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 21. Programm ausführen

```bash
python3 wetter.py
```

**Prüfen:** Die erste Runde dauert etwa 2 Sekunden und meldet `neu abgefragt`, die zweite kommt in Sekundenbruchteilen `aus dem Cache`. Startest du das Programm innerhalb einer Minute erneut, kommen beide Runden aus dem Cache.

## Einstellungen anpassen

Die Einstellungen stehen in `/etc/memcached.conf`. Als Beispiel wird der Speicher von 64 auf 256 MB vergrößert.

### 22. Einstellungsdatei öffnen

```bash
sudo nano /etc/memcached.conf
```

### 23. Speichergröße ändern

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `-m 64` und ändere die Zeile in:

```text
-m 256
```

Weitere Zeilen in dieser Datei:

- **`-p 11211`** – der Port.
- **`-l 127.0.0.1` und `-l ::1`** – die Adressen, auf denen Memcached lauscht.
- **`# -c 1024`** – die Höchstzahl gleichzeitiger Verbindungen. Die Raute davor bedeutet, dass der Vorgabewert 1024 gilt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 24. Dienst neu starten

Die neue Einstellung gilt erst nach einem Neustart. Dabei wird der Cache geleert.

```bash
sudo systemctl restart memcached
```

**Prüfen:** Der Wert lautet jetzt `268435456` (256 MB in Bytes).

```bash
memcstat --servers=localhost | grep limit_maxbytes
```

### 25. Cache leeren (bei Bedarf)

`memcflush` macht alle Einträge ungültig, ohne den Dienst neu zu starten. Das ist praktisch, wenn eine Anwendung veraltete Daten anzeigt.

```bash
memcflush --servers=localhost
```

## Optional: Nicht automatisch starten

Wer Memcached nur gelegentlich braucht, schaltet den Start beim Hochfahren ab. Mit `sudo systemctl start memcached` läuft der Dienst bei Bedarf wieder.

```bash
sudo systemctl disable --now memcached
```

## Wie geht es weiter?

- **PHP-Anwendungen:** Das Paket `php-memcached` bringt die Erweiterung für [PHP](php.md) mit. MediaWiki nutzt sie zum Beispiel über die Einstellung `$wgMainCacheType = CACHE_MEMCACHED;` in `LocalSettings.php`, Drupal über das Modul „Memcache API and Integration“.
- **Andere Sprachen:** Für fast jede Sprache gibt es Bibliotheken, etwa für [Java](java.md), [Go](go.md) oder [Node.js](javascript.md).
- **Dokumentation:** Projektseite und Wiki unter <https://memcached.org/> und <https://github.com/memcached/memcached/wiki>.

## Deinstallieren

### 1. Übungsordner löschen

```bash
rm -rf ~/memcached-uebung
```

### 2. Python-Bibliothek entfernen (falls installiert)

```bash
sudo apt purge python3-pymemcache
```

### 3. Memcached und Werkzeuge entfernen

`purge` löscht auch `/etc/memcached.conf` samt deinen Änderungen.

```bash
sudo apt purge memcached libmemcached-tools
```

### 4. Übrige Abhängigkeiten entfernen

`apt` zeigt vorher an, welche Pakete gelöscht werden, und fragt nach. Ist eines dabei, das du noch brauchst, brich mit <kbd>n</kbd> ab.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `memcached` wird nicht mehr gefunden.

```bash
memcached --version
```
