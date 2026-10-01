# MariaDB

MariaDB ist ein freier Datenbankserver, der aus MySQL hervorgegangen und weitgehend mit ihm verträglich ist. Er speichert Daten in Tabellen und wird per SQL abgefragt. Viele Webanwendungen wie [WordPress](nginx-wordpress.md), [Joomla](joomla.md) oder [Contao](contao.md) setzen MariaDB oder MySQL voraus. Diese Anleitung richtet den Server ein und zeigt die wichtigsten Handgriffe: Datenbank und Benutzer anlegen, Tabellen abfragen und Sicherungen erstellen.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **MariaDB 11.8**. Mit dem Paket `mariadb-server` kommen 22 Pakete auf den Rechner.
- **Nur lokal erreichbar:** Der Server lauscht nach der Installation nur auf `127.0.0.1`, Port 3306. Andere Rechner im Netz erreichen ihn nicht.
- **Anmeldung als root ohne Passwort:** Der Datenbank-Benutzer `root` meldet sich über den Unix-Socket an. Wer `sudo` darf, kommt mit `sudo mariadb` hinein, alle anderen gar nicht. Das früher übliche Skript `mariadb-secure-installation` ist deshalb nicht nötig: Anonyme Benutzer und eine Testdatenbank legt Ubuntu gar nicht erst an.
- **Für Programme eigene Benutzer:** Anwendungen sollten nie als `root` arbeiten, sondern mit einem eigenen Benutzer, der nur seine Datenbank sieht.
- **Version:** Getestet mit MariaDB **11.8.6** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. MariaDB installieren

Installiert Server und Kommandozeilenprogramm. Der Dienst startet sofort und künftig bei jedem Hochfahren.

```bash
sudo apt install mariadb-server
```

### 3. Prüfen, ob der Dienst läuft

```bash
systemctl status mariadb
```

**Prüfen:** In der Ausgabe steht `active (running)`. Beende die Anzeige mit <kbd>q</kbd>.

### 4. Prüfen, dass der Server nur lokal lauscht

```bash
sudo ss -ltnp | grep 3306
```

**Prüfen:** Die Zeile beginnt mit `LISTEN` und nennt die Adresse `127.0.0.1:3306`.

## Datenbank und Benutzer anlegen

### 5. Als root anmelden

`sudo mariadb` öffnet die Konsole als Datenbank-Administrator. Die Eingabezeile lautet `MariaDB [(none)]>`.

```bash
sudo mariadb
```

### 6. Datenbank anlegen

Gib in der Konsole ein und drücke <kbd>Enter</kbd>. SQL-Befehle enden mit einem Semikolon. `utf8mb4` speichert alle Zeichen, auch Umlaute und Emojis.

```sql
CREATE DATABASE laden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 7. Benutzer anlegen

Ersetze `GEHEIMES-PASSWORT` durch ein eigenes Passwort. `'laden'@'localhost'` bedeutet: Der Benutzer `laden` darf sich nur vom eigenen Rechner aus anmelden.

```sql
CREATE USER 'laden'@'localhost' IDENTIFIED BY 'GEHEIMES-PASSWORT';
```

### 8. Rechte vergeben

Der Benutzer bekommt alle Rechte, aber nur an der Datenbank `laden`.

```sql
GRANT ALL PRIVILEGES ON laden.* TO 'laden'@'localhost';
```

**Prüfen:** Jeder der drei Befehle antwortet mit `Query OK`.

### 9. Konsole verlassen

```sql
exit
```

### 10. Als neuer Benutzer anmelden

`-u` nennt den Benutzer, `-p` fragt nach dem Passwort, das letzte Wort ist die Datenbank.

```bash
mariadb -u laden -p laden
```

**Prüfen:** Nach dem Passwort lautet die Eingabezeile `MariaDB [laden]>`. Verlasse die Konsole mit `exit`.

## Mit Tabellen arbeiten

### 11. Übungsordner anlegen

```bash
mkdir ~/mariadb-uebung
```

### 12. In den Ordner wechseln

```bash
cd ~/mariadb-uebung
```

### 13. SQL-Datei anlegen

Die Datei legt zwei Tabellen an, Modelle und Verkäufe, und füllt sie mit Beispieldaten.

```bash
nano laden.sql
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```sql
-- Tabellen für einen kleinen Fahrradladen

CREATE TABLE modell (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    name   VARCHAR(50) NOT NULL UNIQUE,
    preis  DECIMAL(8,2) NOT NULL,
    lager  INT NOT NULL DEFAULT 0
);

CREATE TABLE verkauf (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    modell_id  INT NOT NULL,
    anzahl     INT NOT NULL,
    datum      DATE NOT NULL,
    FOREIGN KEY (modell_id) REFERENCES modell(id)
);

INSERT INTO modell (name, preis, lager) VALUES
    ('Citybike', 699.00, 4),
    ('Trekkingrad', 899.00, 0),
    ('Lastenrad', 3490.00, 1);

INSERT INTO verkauf (modell_id, anzahl, datum) VALUES
    (1, 2, '2026-09-01'),
    (3, 1, '2026-09-02'),
    (1, 3, '2026-09-02'),
    (2, 1, '2026-09-05'),
    (1, 1, '2026-09-08');
```

- **`AUTO_INCREMENT PRIMARY KEY`** – eine Nummer, die MariaDB für jede neue Zeile selbst vergibt und die jede Zeile eindeutig kennzeichnet.
- **`DECIMAL(8,2)`** – eine Zahl mit zwei Nachkommastellen, genau gerechnet. Für Geldbeträge besser als Kommazahlen vom Typ `FLOAT`.
- **`NOT NULL`, `UNIQUE`, `DEFAULT`** – das Feld muss gefüllt sein, darf nicht doppelt vorkommen bzw. hat einen Vorgabewert.
- **`FOREIGN KEY`** – jeder Verkauf muss auf ein vorhandenes Modell verweisen. Einen Verkauf zu einem Modell, das es nicht gibt, lehnt MariaDB ab.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. SQL-Datei einlesen

`<` gibt die Datei als Eingabe an MariaDB weiter.

```bash
mariadb -u laden -p laden < laden.sql
```

**Prüfen:** Nach dem Passwort erscheint keine Meldung. Das bedeutet, alles hat geklappt.

### 15. Konsole öffnen

```bash
mariadb -u laden -p laden
```

### 16. Lieferbare Modelle abfragen

```sql
SELECT name, preis, lager FROM modell WHERE lager > 0 ORDER BY preis;
```

**Prüfen:** Die Tabelle nennt Citybike (699.00, 4) und Lastenrad (3490.00, 1).

### 17. Umsatz je Modell berechnen

`JOIN` verbindet die Verkäufe mit den Modellen, `GROUP BY` fasst die Zeilen je Modell zusammen.

```sql
SELECT m.name, SUM(v.anzahl) AS stueck, SUM(v.anzahl * m.preis) AS umsatz
FROM verkauf v JOIN modell m ON m.id = v.modell_id
GROUP BY m.name ORDER BY umsatz DESC;
```

**Prüfen:** Die Ausgabe lautet:

```text
+-------------+--------+---------+
| name        | stueck | umsatz  |
+-------------+--------+---------+
| Citybike    |      6 | 4194.00 |
| Lastenrad   |      1 | 3490.00 |
| Trekkingrad |      1 |  899.00 |
+-------------+--------+---------+
```

### 18. Fremdschlüssel ausprobieren

Ein Verkauf zu einem Modell mit der Nummer 99, das es nicht gibt:

```sql
INSERT INTO verkauf (modell_id, anzahl, datum) VALUES (99, 1, '2026-09-10');
```

**Prüfen:** MariaDB lehnt ab mit `ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails`. Verlasse die Konsole danach mit `exit`.

## Passwort in einer Datei hinterlegen (optional)

Damit man das Passwort nicht bei jedem Aufruf eintippen muss, liest MariaDB es aus der Datei `~/.my.cnf`.

### 19. Datei anlegen

```bash
nano ~/.my.cnf
```

Füge diesen Inhalt ein und ersetze `GEHEIMES-PASSWORT` durch dein Passwort:

```ini
[client]
user = laden
password = GEHEIMES-PASSWORT

[mariadb-client]
database = laden
```

- **`[client]`** – gilt für alle Programme von MariaDB, auch für `mariadb-dump`.
- **`[mariadb-client]`** – gilt nur für die Konsole `mariadb`. Die Angabe `database` gehört hierher, weil `mariadb-dump` sie sonst falsch versteht und eine Warnung ausgibt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 20. Datei vor anderen Benutzern schützen

`chmod 600` erlaubt nur dir selbst, die Datei zu lesen.

```bash
chmod 600 ~/.my.cnf
```

**Prüfen:** `mariadb` öffnet die Datenbank `laden` jetzt ohne Nachfrage.

```bash
mariadb -e "SELECT CURRENT_USER();"
```

## Sichern und wiederherstellen

### 21. Sicherung erstellen

`mariadb-dump` schreibt alle Tabellen samt Inhalt als SQL-Befehle in eine Datei. Ohne `~/.my.cnf` kommen `-u laden -p` dazu.

```bash
mariadb-dump laden > sicherung.sql
```

**Prüfen:** Die Datei enthält für jede Tabelle einen Befehl `INSERT INTO`.

```bash
grep -c "INSERT INTO" sicherung.sql
```

Die Ausgabe lautet `2`.

### 22. Sicherung wiederherstellen

Spielt die Sicherung in die Datenbank `laden` ein. Vorhandene Tabellen mit gleichem Namen werden dabei ersetzt.

```bash
mariadb laden < sicherung.sql
```

## Optional: Autostart ausschalten

Wer MariaDB nur ab und zu braucht, kann den Dienst beim Hochfahren weglassen und bei Bedarf mit `sudo systemctl start mariadb` starten.

```bash
sudo systemctl disable --now mariadb
```

## Wie geht es weiter?

- **Aus Programmen zugreifen:** Für [PHP](php.md) gibt es `php-mysql`, für [Python](python.md) das Paket `python3-pymysql`, für [Java](java.md) den Treiber MariaDB Connector/J.
- **Grafische Werkzeuge:** DBeaver oder Adminer zeigen Tabellen und Abfragen im Fenster bzw. im Browser.
- **Zugriff aus dem Netz:** Soll ein anderer Rechner zugreifen, muss in `/etc/mysql/mariadb.conf.d/50-server.cnf` die Zeile `bind-address` angepasst und ein Benutzer mit passendem Host angelegt werden. Den Port 3306 sollte man dann mit einer Firewall auf bekannte Rechner beschränken.
- **Dokumentation:** Handbuch und SQL-Referenz unter <https://mariadb.com/docs/>.

## Deinstallieren

### 1. Übungsordner entfernen

```bash
rm -rf ~/mariadb-uebung
```

### 2. Passwortdatei entfernen (falls angelegt)

```bash
rm -f ~/.my.cnf
```

### 3. Dienst beenden

```bash
sudo systemctl stop mariadb
```

### 4. MariaDB entfernen

```bash
sudo apt purge mariadb-server mariadb-client
```

Während des Entfernens erscheint ein blauer Dialog: **„Das Verzeichnis /var/lib/mysql mit den MariaDB-Datenbanken soll entfernt werden. … Alle MariaDB-Datenbanken entfernen?“** Voreingestellt ist **Nein**. Dann bleiben die Datenbanken erhalten, etwa für eine spätere Neuinstallation. Wähle **Ja** mit den Pfeiltasten und <kbd>Enter</kbd>, wenn alle Daten gelöscht werden sollen. Vorher wichtige Daten mit `mariadb-dump` sichern.

### 5. Nicht mehr benötigte Abhängigkeiten entfernen

`apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

### 6. Datenbankdateien nachträglich löschen (optional)

Nur nötig, wenn du im Dialog aus Schritt 4 **Nein** gewählt hast und die Daten jetzt doch loswerden willst. **Achtung:** Löscht alle Datenbanken endgültig.

```bash
sudo rm -rf /var/lib/mysql
```

Der Ordner `/etc/mysql` gehört zum Paket `mysql-common`, das oft schon vorher installiert war, weil andere Programme es brauchen. Er bleibt deshalb stehen.

**Prüfen:** Der Befehl `mariadb` wird nicht mehr gefunden.

```bash
mariadb --version
```
