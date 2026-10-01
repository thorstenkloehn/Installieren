# Perl

Perl ist eine Skriptsprache, die besonders stark im Bearbeiten von Text ist: Dateien durchsuchen, Daten umformen, Berichte erzeugen. Sie ist seit über 35 Jahren ein fester Bestandteil von Linux und steckt in vielen Systemwerkzeugen. Mit CPAN gibt es ein riesiges Archiv an Zusatzmodulen.

## Vorbemerkungen

- **Schon installiert:** Ubuntu 26.04 bringt **Perl 5.40** von Haus aus mit, weil viele Systemprogramme es brauchen. Diese Anleitung ergänzt die Dokumentation und Zusatzmodule.
- **Module auf zwei Wegen:** Viele Module von CPAN gibt es bei Ubuntu als Paket mit dem Namen `lib…-perl`, etwa `libtext-csv-perl` für das Modul `Text::CSV`. Sie werden mit `apt` installiert. Alle übrigen installiert das Werkzeug `cpanm` von CPAN in den Ordner `~/perl5`, ohne Administratorrechte.
- **Perl nicht entfernen:** Das Paket `perl` selbst darf nicht deinstalliert werden, sonst funktionieren grundlegende Teile von Ubuntu nicht mehr. Die Deinstallation am Ende entfernt nur, was diese Anleitung hinzufügt.
- **Version:** Getestet mit Perl **5.40.1** und cpanminus 1.7048 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Dokumentation und Module installieren

- `perl-doc` – die Dokumentation, aufrufbar mit `perldoc`
- `libtext-csv-perl` – liest und schreibt CSV-Dateien
- `cpanminus` – das Werkzeug `cpanm` zum Installieren von Modulen aus CPAN
- `liblocal-lib-perl` – richtet einen eigenen Modulordner im Home-Ordner ein

```bash
sudo apt install perl-doc libtext-csv-perl cpanminus liblocal-lib-perl
```

Im Test kamen dabei 67 Pakete auf den Rechner, fast alles kleine Perl-Module, die `cpanm` braucht. Für JSON ist kein Zusatzpaket nötig: Das Modul `JSON::PP` gehört schon zu Perl.

**Prüfen:** Die zweite Zeile beginnt mit `This is perl 5, version 40`.

```bash
perl -v
```

### 3. Dokumentation ausprobieren

`perldoc -f` erklärt eine eingebaute Funktion, hier `push`. Beende die Anzeige mit <kbd>q</kbd>.

```bash
perldoc -f push
```

## Ein Skript mit CSV und JSON

### 4. Übungsordner anlegen

```bash
mkdir ~/perl-uebung
```

### 5. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/perl-uebung
```

### 6. CSV-Datei anlegen

Ausgedachte Verkäufe eines Fahrradladens, mit Semikolon getrennt, wie es Tabellenprogramme mit deutschen Einstellungen schreiben.

```bash
nano verkauf.csv
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```text
datum;modell;anzahl;preis
2026-09-01;Citybike;2;699
2026-09-02;Lastenrad;1;3490
2026-09-02;Citybike;3;699
2026-09-05;Trekkingrad;1;899
2026-09-08;Citybike;1;649
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. Skript anlegen

Das Skript zählt Stück und Umsatz je Modell zusammen, gibt sie nach Umsatz sortiert aus und speichert die Umsätze als JSON.

```bash
nano auswertung.pl
```

Füge diesen Inhalt ein:

```perl
#!/usr/bin/perl
use strict;
use warnings;
use utf8;
use open qw(:std :encoding(UTF-8));

use Text::CSV;
use JSON::PP;

my $csv = Text::CSV->new({ sep_char => ';', binary => 1, auto_diag => 1 });
open(my $datei, '<:encoding(UTF-8)', 'verkauf.csv') or die "verkauf.csv: $!";
$csv->header($datei);

my (%stueck, %umsatz);
while (my $zeile = $csv->getline_hr($datei)) {
    $stueck{ $zeile->{modell} } += $zeile->{anzahl};
    $umsatz{ $zeile->{modell} } += $zeile->{anzahl} * $zeile->{preis};
}
close($datei);

for my $modell (sort { $umsatz{$b} <=> $umsatz{$a} } keys %umsatz) {
    printf "%-12s %2d Stück %6d Euro\n", $modell, $stueck{$modell}, $umsatz{$modell};
}

my $json = JSON::PP->new->canonical->pretty;
open(my $aus, '>', 'umsatz.json') or die "umsatz.json: $!";
print {$aus} $json->encode(\%umsatz);
close($aus);
print "Gespeichert: umsatz.json\n";
```

- **`use strict; use warnings;`** – verlangen, dass jede Variable mit `my` angelegt wird, und melden verdächtige Stellen. Diese zwei Zeilen gehören an den Anfang jedes Skripts.
- **`use utf8` und `use open …`** – der Quelltext und alle Ein- und Ausgaben verwenden UTF-8. Ohne diese Zeilen würde das „ü“ in „Stück“ falsch ausgegeben.
- **Sigillen** – das Zeichen vor dem Namen zeigt die Art der Variablen: `$` für einen einzelnen Wert, `@` für eine Liste, `%` für ein Wörterbuch (Hash).
- **`$csv->header`** – liest die Kopfzeile, `getline_hr` danach jede Zeile als Hash mit den Spaltennamen als Schlüssel.
- **`+=`** – ein Hash-Eintrag, den es noch nicht gibt, zählt als 0. Deshalb kann man ohne Vorbereitung aufaddieren.
- **`sort { $umsatz{$b} <=> $umsatz{$a} }`** – sortiert die Modelle absteigend nach Umsatz. `<=>` vergleicht Zahlen.
- **`JSON::PP`** – gehört zum Lieferumfang von Perl. `canonical` sortiert die Schlüssel, `pretty` rückt ein.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Syntax prüfen

`perl -c` übersetzt das Skript nur zur Probe, ohne es auszuführen.

```bash
perl -c auswertung.pl
```

**Prüfen:** Die Ausgabe lautet `auswertung.pl syntax OK`.

### 9. Skript ausführen

```bash
perl auswertung.pl
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike      6 Stück   4144 Euro
Lastenrad     1 Stück   3490 Euro
Trekkingrad   1 Stück    899 Euro
Gespeichert: umsatz.json
```

### 10. JSON-Datei ansehen

```bash
cat umsatz.json
```

**Prüfen:** Die Datei enthält die drei Modelle alphabetisch sortiert, z. B. `"Citybike" : 4144`.

## Module von CPAN

Als Beispiel dient `Text::Table::Tiny`, das Tabellen mit Rahmen im Terminal zeichnet. Es ist nicht als Ubuntu-Paket erhältlich.

### 11. Eigenen Modulordner einrichten

`perl -Mlocal::lib` gibt Befehle aus, die Perl und `cpanm` auf den Ordner `~/perl5` umstellen. Damit das in jedem neuen Terminal gilt, kommt der Aufruf in die Datei `~/.bashrc`.

```bash
nano ~/.bashrc
```

Gehe mit <kbd>Strg</kbd>+<kbd>End</kbd> ans Ende der Datei und füge diese Zeile hinzu:

```bash
eval "$(perl -Mlocal::lib)"
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Einstellungen im aktuellen Terminal laden

`source` liest die geänderte Datei sofort ein. Beim ersten Mal legt `local::lib` den Ordner `~/perl5` an und meldet `Attempting to create directory /home/…/perl5`.

```bash
source ~/.bashrc
```

**Prüfen:** Die Ausgabe beginnt mit `/home/` und endet mit `/perl5/lib/perl5`.

```bash
echo $PERL5LIB
```

### 13. Modul von CPAN installieren

`cpanm` lädt das Modul samt allen Abhängigkeiten von CPAN, führt deren Tests aus und installiert sie nach `~/perl5`.

```bash
cpanm Text::Table::Tiny
```

**Prüfen:** Die Ausgabe endet mit `Successfully installed Text-Table-Tiny-1.03` und `4 distributions installed`. Die drei weiteren sind Abhängigkeiten.

### 14. Skript mit dem neuen Modul anlegen

```bash
nano tabelle.pl
```

Füge diesen Inhalt ein:

```perl
#!/usr/bin/perl
use strict;
use warnings;
use utf8;
use open qw(:std :encoding(UTF-8));

use Text::Table::Tiny qw(generate_table);

my @zeilen = (
    [ 'Modell', 'Preis', 'Auf Lager' ],
    [ 'Citybike', 699, 4 ],
    [ 'Trekkingrad', 899, 0 ],
    [ 'Lastenrad', 3490, 1 ],
);

print generate_table(rows => \@zeilen, header_row => 1, style => 'boxrule'), "\n";
```

- **`[ … ]`** – eine Liste in eckigen Klammern ist eine Referenz auf eine Liste. So entsteht eine Liste von Zeilen.
- **`\@zeilen`** – übergibt eine Referenz auf die Liste, nicht ihre Kopie.
- **`header_row => 1`** – die erste Zeile ist die Überschrift. `style => 'boxrule'` zeichnet Rahmen aus Linienzeichen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 15. Skript ausführen

```bash
perl tabelle.pl
```

**Prüfen:** Die Ausgabe lautet:

```text
┌─────────────┬───────┬───────────┐
│ Modell      │ Preis │ Auf Lager │
├─────────────┼───────┼───────────┤
│ Citybike    │ 699   │ 4         │
│ Trekkingrad │ 899   │ 0         │
│ Lastenrad   │ 3490  │ 1         │
└─────────────┴───────┴───────────┘
```

## Wie geht es weiter?

- **Einzeiler:** Perl ist im Terminal sehr nützlich. `perl -ne 'print if /Citybike/' verkauf.csv` gibt alle Zeilen mit „Citybike“ aus, `perl -pi -e 's/Citybike/Stadtrad/g' datei.txt` ersetzt ein Wort direkt in einer Datei.
- **Module suchen:** `apt search` mit dem Modulnamen findet Ubuntu-Pakete, z. B. `apt search libdatetime`. Alle Module von CPAN sind unter <https://metacpan.org> beschrieben.
- **Code aufräumen:** `sudo apt install perltidy` formatiert Skripte einheitlich, `libperl-critic-perl` bringt `perlcritic` mit, das Verbesserungen vorschlägt.
- **Webanwendungen:** Die Frameworks Mojolicious (`libmojolicious-perl`) und Dancer2 (`libdancer2-perl`) gibt es als Ubuntu-Pakete.
- **Dokumentation:** `perldoc perlintro` ist eine kurze Einführung, `perldoc perlfunc` listet alle eingebauten Funktionen.

## Deinstallieren

### 1. Übungsordner entfernen

```bash
rm -rf ~/perl-uebung
```

### 2. Eintrag in `~/.bashrc` entfernen

```bash
nano ~/.bashrc
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> nach `local::lib` und drücke <kbd>Enter</kbd>. Lösche die Zeile `eval "$(perl -Mlocal::lib)"` mit <kbd>Strg</kbd>+<kbd>K</kbd>. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>. Öffne danach ein neues Terminal.

### 3. Module von CPAN und Zwischenspeicher entfernen

`~/perl5` enthält die mit `cpanm` installierten Module, `~/.cpanm` heruntergeladene Dateien und Protokolle.

```bash
rm -rf ~/perl5 ~/.cpanm
```

### 4. Zusätzliche Pakete entfernen

Entfernt nur die Pakete aus Schritt 2 der Installation. Perl selbst bleibt erhalten.

```bash
sudo apt purge perl-doc libtext-csv-perl cpanminus liblocal-lib-perl
```

### 5. Nicht mehr benötigte Abhängigkeiten entfernen

`apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `cpanm` wird nicht mehr gefunden, `perl -v` funktioniert weiterhin.

```bash
cpanm --version
```
