# MySQL

MySQL ist ein weit verbreiteter relationaler Datenbankserver von Oracle, den man per SQL abfragt. Viele Webanwendungen und Frameworks wie [WordPress](nginx-wordpress.md), [Laravel](laravel.md) oder [Ruby on Rails](rails.md) unterstützen ihn direkt. In dieser Anleitung wird der Server installiert, eine eigene Datenbank mit Benutzer eingerichtet, mit Tabellen gearbeitet und eine Sicherung angelegt.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 bringt **MySQL 8.4** mit, eine Version mit Langzeitpflege (LTS). Das Paket `mysql-server` installiert insgesamt 15 Pakete.
- **MySQL oder MariaDB:** Beide Server teilen sich Port 3306, den Ordner `/var/lib/mysql` und viele Dateinamen. Auf einem Rechner läuft deshalb nur einer von beiden. Ist [MariaDB](mariadb.md) schon installiert, will `apt` es beim Installieren von MySQL entfernen. Lies in diesem Fall die Liste in Schritt 2 genau und brich mit <kbd>n</kbd> ab, wenn du MariaDB behalten willst.
- **Nur vom eigenen Rechner erreichbar:** Nach der Installation nimmt MySQL nur Verbindungen über `127.0.0.1` an. Neben dem gewohnten Port 3306 öffnet es zusätzlich Port 33060 für das neuere X-Protokoll (genutzt etwa von MySQL Shell).
- **root ohne Passwort, aber nur mit sudo:** Der Datenbank-Benutzer `root` wird über den Unix-Socket geprüft. Nur wer `sudo` verwenden darf, kommt mit `sudo mysql` hinein. Anonyme Benutzer und eine Testdatenbank richtet Ubuntu nicht ein, daher ist `mysql_secure_installation` hier nicht erforderlich.
- **Zeichensatz:** MySQL 8.4 verwendet von Haus aus `utf8mb4`. Umlaute und Emojis werden also ohne weitere Einstellung richtig gespeichert.
- **Version:** Getestet mit MySQL **8.4.11** aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

So kennt `apt` die neuesten Paketversionen.

```bash
sudo apt update
```

### 2. MySQL installieren

Das Paket bringt den Server und das Kommandozeilenprogramm `mysql` mit. Der Dienst wird gleich gestartet und läuft künftig nach jedem Neustart.

```bash
sudo apt install mysql-server
```

**Prüfen:** Die Versionsnummer wird angezeigt.

```bash
mysql --version
```

### 3. Dienst prüfen

```bash
systemctl status mysql
```

**Prüfen:** Die Ausgabe enthält `active (running)`. Mit <kbd>q</kbd> kommst du zurück zur Eingabezeile.

### 4. Offene Ports prüfen

Zeigt, auf welchen Adressen MySQL Verbindungen annimmt.

```bash
sudo ss -ltnp | grep mysqld
```

**Prüfen:** Es erscheinen zwei Zeilen mit `127.0.0.1:3306` und `127.0.0.1:33060`. Steht dort `0.0.0.0` oder `*`, wäre der Server aus dem Netz erreichbar.

## Datenbank und Benutzer einrichten

### 5. Als Administrator anmelden

Öffnet die MySQL-Konsole als Benutzer `root`. Die Eingabezeile wechselt zu `mysql>`.

```bash
sudo mysql
```

### 6. Datenbank anlegen

Tippe den Befehl in die Konsole und bestätige mit <kbd>Enter</kbd>. Jeder SQL-Befehl wird mit einem Semikolon abgeschlossen. Ein eigener Zeichensatz ist nicht nötig, weil `utf8mb4` schon voreingestellt ist.

```sql
CREATE DATABASE buecherei;
```

### 7. Benutzer anlegen

Setze statt `GEHEIMES-PASSWORT` ein eigenes Passwort ein. Der Zusatz `@'localhost'` legt fest, dass sich dieser Benutzer nur vom selben Rechner aus verbinden darf.

```sql
CREATE USER 'buecherei'@'localhost' IDENTIFIED BY 'GEHEIMES-PASSWORT';
```

### 8. Rechte vergeben

`buecherei.*` steht für alle Tabellen der Datenbank `buecherei`. Auf andere Datenbanken hat der Benutzer keinen Zugriff.

```sql
GRANT ALL PRIVILEGES ON buecherei.* TO 'buecherei'@'localhost';
```

**Prüfen:** MySQL bestätigt jeden der drei Befehle mit `Query OK`.

### 9. Konsole beenden

```sql
exit
```

### 10. Mit dem neuen Benutzer verbinden

`-u` gibt den Benutzernamen an, `-p` lässt MySQL nach dem Passwort fragen. Am Ende steht der Name der Datenbank.

```bash
mysql -u buecherei -p buecherei
```

**Prüfen:** Die Anmeldung gelingt und die Eingabezeile lautet `mysql>`. Gib zur Kontrolle ein:

```sql
SELECT CURRENT_USER(), DATABASE();
```

Die Antwort nennt `buecherei@localhost` und `buecherei`. Beende die Konsole mit `exit`.

## Tabellen anlegen und abfragen

### 11. Arbeitsordner anlegen

```bash
mkdir ~/mysql-uebung
```

### 12. In den Ordner wechseln

```bash
cd ~/mysql-uebung
```

### 13. SQL-Datei schreiben

Die Datei beschreibt eine kleine Bücherei: eine Tabelle mit Büchern und eine mit Ausleihen. Beide werden gleich mit Beispielen gefüllt.

```bash
nano buecherei.sql
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```sql
-- Tabellen für eine kleine Bücherei

CREATE TABLE buch (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    titel   VARCHAR(100) NOT NULL,
    autor   VARCHAR(60) NOT NULL,
    jahr    SMALLINT NOT NULL,
    CHECK (jahr BETWEEN 1450 AND 2100)
);

CREATE TABLE ausleihe (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    buch_id    INT NOT NULL,
    leser      VARCHAR(40) NOT NULL,
    von        DATE NOT NULL,
    bis        DATE,
    FOREIGN KEY (buch_id) REFERENCES buch(id)
);

INSERT INTO buch (titel, autor, jahr) VALUES
    ('Der Schimmelreiter', 'Theodor Storm', 1888),
    ('Effi Briest', 'Theodor Fontane', 1896),
    ('Die Blechtrommel', 'Günter Grass', 1959),
    ('Der Process', 'Franz Kafka', 1925);

INSERT INTO ausleihe (buch_id, leser, von, bis) VALUES
    (1, 'Anna', '2026-09-01', '2026-09-15'),
    (2, 'Ben',  '2026-09-03', NULL),
    (1, 'Carla','2026-09-16', NULL),
    (3, 'Anna', '2026-09-20', '2026-09-28'),
    (1, 'Ben',  '2026-08-10', '2026-08-24');
```

Was die einzelnen Angaben bedeuten:

- **`AUTO_INCREMENT PRIMARY KEY`** – MySQL zählt die Nummer für jede neue Zeile selbst hoch. Über diese Nummer lässt sich jede Zeile eindeutig ansprechen.
- **`VARCHAR(100)`** – Text mit höchstens 100 Zeichen.
- **`CHECK (…)`** – eine Regel für gültige Werte. Ein Buch mit dem Jahr 2300 wird abgewiesen.
- **`bis DATE` ohne `NOT NULL`** – das Feld darf leer bleiben (`NULL`). Ein leeres Rückgabedatum heißt hier: Das Buch ist noch ausgeliehen.
- **`FOREIGN KEY`** – jede Ausleihe muss zu einem Buch gehören, das es in der Tabelle `buch` wirklich gibt.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. SQL-Datei ausführen

Das Zeichen `<` leitet den Inhalt der Datei an `mysql` weiter.

```bash
mysql -u buecherei -p buecherei < buecherei.sql
```

**Prüfen:** Nach der Passworteingabe kommt keine Ausgabe. Das ist hier das Zeichen für Erfolg; eine Fehlermeldung würde mit `ERROR` beginnen.

### 15. Konsole öffnen

```bash
mysql -u buecherei -p buecherei
```

### 16. Ausgeliehene Bücher anzeigen

`JOIN` holt zu jeder Ausleihe den Buchtitel dazu. `IS NULL` findet die Ausleihen ohne Rückgabedatum.

```sql
SELECT b.titel, a.leser, a.von
FROM ausleihe a JOIN buch b ON b.id = a.buch_id
WHERE a.bis IS NULL ORDER BY a.von;
```

**Prüfen:** Die Ausgabe lautet:

```text
+--------------------+-------+------------+
| titel              | leser | von        |
+--------------------+-------+------------+
| Effi Briest        | Ben   | 2026-09-03 |
| Der Schimmelreiter | Carla | 2026-09-16 |
+--------------------+-------+------------+
```

### 17. Ausleihen je Buch zählen

`LEFT JOIN` nimmt auch Bücher mit, die nie ausgeliehen wurden. `COUNT` zählt die Ausleihen, `GROUP BY` bildet eine Zeile pro Buch.

```sql
SELECT b.titel, COUNT(a.id) AS ausleihen
FROM buch b LEFT JOIN ausleihe a ON a.buch_id = b.id
GROUP BY b.id, b.titel ORDER BY ausleihen DESC, b.titel;
```

**Prüfen:** Die Ausgabe lautet:

```text
+--------------------+-----------+
| titel              | ausleihen |
+--------------------+-----------+
| Der Schimmelreiter |         3 |
| Die Blechtrommel   |         1 |
| Effi Briest        |         1 |
| Der Process        |         0 |
+--------------------+-----------+
```

### 18. Prüfregel testen

Versuche, ein Buch mit einem unmöglichen Erscheinungsjahr einzutragen:

```sql
INSERT INTO buch (titel, autor, jahr) VALUES ('Zukunftsroman', 'Niemand', 2300);
```

**Prüfen:** MySQL antwortet mit `ERROR 3819 (HY000): Check constraint 'buch_chk_1' is violated.` und speichert nichts.

### 19. Fremdschlüssel testen

Versuche, ein Buch mit der Nummer 99 auszuleihen, die es nicht gibt:

```sql
INSERT INTO ausleihe (buch_id, leser, von) VALUES (99, 'Dora', '2026-10-01');
```

**Prüfen:** Die Antwort beginnt mit `ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails`. Verlasse die Konsole anschließend mit `exit`.

## Passwort in einer Datei hinterlegen (optional)

Statt das Passwort jedes Mal einzutippen, kann MySQL es aus der Datei `~/.my.cnf` im Home-Ordner lesen.

### 20. Datei anlegen

```bash
nano ~/.my.cnf
```

Füge diesen Inhalt ein und setze statt `GEHEIMES-PASSWORT` dein Passwort ein:

```ini
[client]
user = buecherei
password = GEHEIMES-PASSWORT

[mysql]
database = buecherei

[mysqldump]
no-tablespaces
```

- **`[client]`** – Angaben für alle MySQL-Programme, also auch für `mysqldump`.
- **`[mysql]`** – Angaben nur für die Konsole `mysql`. Die Datenbank muss hier stehen: Unter `[client]` würde `mysqldump` mit `unknown variable 'database=buecherei'` abbrechen.
- **`[mysqldump]`** – `no-tablespaces` verhindert die Fehlermeldung `you need (at least one of) the PROCESS privilege(s)`. Dieses Recht hat ein gewöhnlicher Benutzer nicht, und für eine Sicherung einzelner Datenbanken braucht man es auch nicht.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 21. Datei schützen

`chmod 600` sorgt dafür, dass nur du die Datei lesen und ändern kannst. Das ist wichtig, weil darin ein Passwort steht.

```bash
chmod 600 ~/.my.cnf
```

**Prüfen:** Die Konsole verbindet sich jetzt ohne Passwortabfrage.

```bash
mysql -e "SELECT CURRENT_USER(), DATABASE();"
```

## Sichern und wiederherstellen

### 22. Sicherung anlegen

`mysqldump` schreibt Aufbau und Inhalt aller Tabellen als SQL-Befehle in eine Datei. Wer keine `~/.my.cnf` angelegt hat, ergänzt `-u buecherei -p --no-tablespaces`.

```bash
mysqldump buecherei > sicherung.sql
```

**Prüfen:** Die Datei enthält für jede der zwei Tabellen einen Befehl `INSERT INTO`.

```bash
grep -c "INSERT INTO" sicherung.sql
```

Die Ausgabe lautet `2`.

### 23. Sicherung zurückspielen

Liest die Sicherung wieder in die Datenbank `buecherei` ein. Gleichnamige Tabellen werden dabei gelöscht und neu angelegt.

```bash
mysql buecherei < sicherung.sql
```

## Optional: Nicht automatisch starten

Wer MySQL nur gelegentlich braucht, kann den Start beim Hochfahren abschalten. Bei Bedarf startet `sudo systemctl start mysql` den Dienst wieder.

```bash
sudo systemctl disable --now mysql
```

## Wie geht es weiter?

- **Zugriff aus Programmen:** [PHP](php.md) verbindet sich über `php-mysql`, [Python](python.md) zum Beispiel über `python3-pymysql` und [Java](java.md) über den Treiber MySQL Connector/J.
- **Grafische Oberflächen:** Mit [DBeaver](dbeaver.md) oder Adminer lassen sich Tabellen ansehen und Abfragen bequem ausführen.
- **Zugriff aus dem Netz:** Dafür muss `bind-address` in `/etc/mysql/mysql.conf.d/mysqld.cnf` geändert und ein Benutzer mit passendem Host angelegt werden. Port 3306 sollte dann per Firewall nur für bekannte Rechner offen sein.
- **Dokumentation:** Das Referenzhandbuch zu MySQL 8.4 findest du unter <https://dev.mysql.com/doc/refman/8.4/en/>.

## Deinstallieren

### 1. Arbeitsordner löschen

```bash
rm -rf ~/mysql-uebung
```

### 2. Passwortdatei löschen (falls angelegt)

```bash
rm -f ~/.my.cnf
```

### 3. Dienst anhalten

```bash
sudo systemctl stop mysql
```

### 4. MySQL entfernen

```bash
sudo apt purge mysql-server mysql-client
```

Beim Entfernen öffnet sich ein Dialog mit der Frage **„Alle MySQL-Datenbanken entfernen?“**. Er weist darauf hin, dass dabei `/var/lib/mysql`, `/var/lib/mysql-files` und `/var/lib/mysql-keyring` gelöscht würden. Voreingestellt ist **Nein**: Die Daten bleiben dann liegen und stehen bei einer erneuten Installation wieder zur Verfügung. Wer alles löschen will, wählt mit den Pfeiltasten **Ja** und bestätigt mit <kbd>Enter</kbd>. Wichtige Daten vorher mit `mysqldump` sichern.

### 5. Übrige Abhängigkeiten entfernen

`apt` listet die Pakete auf und fragt vor dem Löschen nach. Ist ein Paket dabei, das du noch brauchst, brich mit <kbd>n</kbd> ab.

```bash
sudo apt autoremove --purge
```

### 6. Datenordner später löschen (optional)

Nur nötig, wenn du in Schritt 4 **Nein** gewählt hast und die Daten jetzt doch nicht mehr brauchst. **Achtung:** Alle Datenbanken sind danach unwiderruflich weg.

```bash
sudo rm -rf /var/lib/mysql /var/lib/mysql-files /var/lib/mysql-keyring
```

Der Ordner `/etc/mysql` bleibt bestehen. Er gehört zum Paket `mysql-common`, das meist schon vor MySQL installiert war, weil andere Programme es nutzen.

**Prüfen:** Der Befehl `mysql` ist nicht mehr vorhanden.

```bash
mysql --version
```
