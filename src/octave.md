# GNU Octave

GNU Octave ist eine Programmiersprache und Umgebung für numerische Berechnungen: Matrizen, Gleichungssysteme, Statistik, Signalverarbeitung und Diagramme. Die Sprache ist weitgehend mit MATLAB verträglich, sodass viele MATLAB-Skripte unverändert laufen. Octave ist frei und wird an Hochschulen gern als Ersatz für MATLAB verwendet.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **Octave 11.1**. Mit allen empfohlenen Paketen wären das 108 Pakete, darunter Java, gnuplot und die Dokumentation. Die Anleitung installiert mit `--no-install-recommends` nur den Kern samt grafischer Oberfläche, das sind 56 Pakete.
- **Schrift nicht vergessen:** Für Diagramme braucht Octave die Schrift FreeSans aus dem Paket `fonts-freefont-otf`. Ohne sie bricht jeder Versuch, ein Diagramm zu zeichnen, mit `unable to load font` ab. Weil sie nur empfohlen ist, wird sie hier ausdrücklich mitinstalliert.
- **Drei Startarten:** `octave` öffnet die grafische Oberfläche mit Editor, Variablenanzeige und Konsole. `octave --no-gui` startet ohne Oberfläche, kann aber Diagramme zeichnen. `octave-cli` ist die reine Kommandozeilenfassung ohne Grafik.
- **Version:** Getestet mit GNU Octave **11.1.0** aus Ubuntu 26.04. Die grafische Oberfläche wurde nicht geöffnet, getestet wurden Skripte im Terminal.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Octave und die Schrift installieren

```bash
sudo apt install --no-install-recommends octave fonts-freefont-otf
```

**Prüfen:** Die erste Zeile lautet `GNU Octave (x86_64-pc-linux-gnu) version 11.1.0`.

```bash
octave-cli --version
```

## Erste Schritte

### 3. Konsole starten

`octave-cli` startet die Konsole im Terminal. Die Eingabezeile lautet `>>`.

```bash
octave-cli
```

### 4. Mit Matrizen rechnen

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>:

```matlab
A = [1 2; 3 4]
```

```matlab
A * A
```

```matlab
A .* A
```

**Prüfen:** `A * A` ist das Matrixprodukt `[7 10; 15 22]`, `A .* A` multipliziert Element für Element und ergibt `[1 4; 9 16]`. Ein Semikolon am Zeilenende unterdrückt die Ausgabe. Beende die Konsole mit `exit`.

## Ein Gleichungssystem lösen

### 5. Übungsordner anlegen

```bash
mkdir ~/octave-uebung
```

### 6. In den Ordner wechseln

```bash
cd ~/octave-uebung
```

### 7. Skript anlegen

Octave-Skripte haben die Endung `.m`, wie bei MATLAB.

```bash
nano gleichung.m
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```matlab
% Ein Laden verkauft Citybikes und Lastenräder.
% Am Montag: 3 Citybikes und 1 Lastenrad für zusammen 5587 Euro.
% Am Dienstag: 1 Citybike und 2 Lastenräder für zusammen 7679 Euro.
% Welche Preise haben die beiden Räder?
A = [3 1;
     1 2];
b = [5587; 7679];
preise = A \ b;
printf("Citybike: %.0f Euro, Lastenrad: %.0f Euro\n", preise(1), preise(2));
```

- **Matrix** – Werte einer Zeile werden mit Leerzeichen getrennt, Zeilen mit `;` oder einem Zeilenumbruch. `b` ist ein Spaltenvektor.
- **`A \ b`** – löst das Gleichungssystem `A · x = b`. Der Rückstrich ist der übliche Weg in Octave und MATLAB und rechnet genauer als die Umkehrmatrix `inv(A) * b`.
- **`printf`** – gibt formatiert aus. `%.0f` ist eine Zahl ohne Nachkommastellen.
- **Kommentare** beginnen mit `%`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Skript ausführen

```bash
octave-cli gleichung.m
```

**Prüfen:** Die Ausgabe lautet `Citybike: 699 Euro, Lastenrad: 3490 Euro`.

## Daten auswerten und ein Diagramm zeichnen

### 9. Skript anlegen

```bash
nano verkauf.m
```

Füge diesen Inhalt ein:

```matlab
% Verkaufte Fahrräder im ersten Halbjahr (Beispielwerte)
monate = {"Jan", "Feb", "Mär", "Apr", "Mai", "Jun"};
citybike  = [12 15 24 31 38 41];
lastenrad = [ 3  4  6  9 11 10];

% Rechnen mit ganzen Vektoren
gesamt = citybike + lastenrad;
printf("Verkauft insgesamt: %d Räder\n", sum(gesamt));
printf("Durchschnitt Citybikes: %.1f pro Monat\n", mean(citybike));
[~, bester] = max(gesamt);
printf("Bester Monat: %s\n", monate{bester});

% Linearer Trend: Gerade durch die Citybike-Zahlen legen
nummer = 1:6;
koeff = polyfit(nummer, citybike, 1);
printf("Trend Citybikes: %+.1f pro Monat\n", koeff(1));
printf("Prognose Juli: %.0f Citybikes\n", polyval(koeff, 7));

% Diagramm als PNG speichern, ohne ein Fenster zu öffnen
h = figure("visible", "off");
bar(nummer, [citybike; lastenrad]');
hold on;
plot(nummer, polyval(koeff, nummer), "k--", "linewidth", 2);
set(gca, "xticklabel", monate);
legend("Citybike", "Lastenrad", "Trend Citybike", "location", "northwest");
title("Verkaufte Räder");
print(h, "-dpng", "verkauf.png");
printf("Diagramm gespeichert: verkauf.png\n");
```

- **Zellfeld** – `{"Jan", "Feb", …}` speichert Texte unterschiedlicher Länge. Ein Element liest man mit geschweiften Klammern: `monate{bester}`.
- **Rechnen mit Vektoren** – `citybike + lastenrad` addiert Monat für Monat, `sum` und `mean` gelten für den ganzen Vektor.
- **`[~, bester] = max(…)`** – `max` liefert den größten Wert und seine Position. `~` verwirft den Wert, gebraucht wird nur die Position.
- **`polyfit(x, y, 1)`** – legt eine Gerade durch die Punkte. `koeff(1)` ist die Steigung, `polyval` berechnet Werte auf der Geraden, hier die Prognose für Monat 7.
- **`figure("visible", "off")`** – zeichnet das Diagramm unsichtbar. `print(h, "-dpng", …)` speichert es als Bild.
- **`bar` und `plot`** – Balken für beide Modelle, dazu mit `hold on` die gestrichelte Trendlinie (`"k--"`: schwarz, gestrichelt).

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 10. Skript ausführen

Für Diagramme startet die Anleitung `octave --no-gui` statt `octave-cli`. Nur diese Fassung kann mit der Qt-Grafik zeichnen.

```bash
octave --no-gui verkauf.m
```

**Prüfen:** Die Ausgabe lautet:

```text
Verkauft insgesamt: 204 Räder
Durchschnitt Citybikes: 26.8 pro Monat
Bester Monat: Jun
Trend Citybikes: +6.3 pro Monat
Prognose Juli: 49 Citybikes
Diagramm gespeichert: verkauf.png
```

Davor kann die Meldung `qt.qpa.plugin: Could not find the Qt platform plugin "wayland"` stehen. Sie ist harmlos: Octave weicht dann auf die X11-Anbindung aus, die Ubuntu auch unter Wayland bereitstellt.

### 11. Diagramm ansehen

Öffne `verkauf.png` im Dateimanager. Es zeigt blaue und orangefarbene Balken für die beiden Modelle und eine gestrichelte Trendlinie über den Citybikes.

## Ohne Bildschirm, z. B. auf einem Server

`octave --no-gui` braucht für Diagramme eine grafische Sitzung. Ohne sie, etwa per SSH auf einem Server, zeichnet Octave nur mit gnuplot. Dafür installiert man `sudo apt install --no-install-recommends gnuplot-nox` und schreibt am Anfang des Skripts `graphics_toolkit("gnuplot");`. Octave warnt dann, dass gnuplot nicht mehr weiterentwickelt wird, das Bild entsteht aber trotzdem.

## Wie geht es weiter?

- **Grafische Oberfläche:** `octave` ohne weitere Angabe öffnet die Oberfläche mit Editor, Dateibrowser, Variablen und Befehlsverlauf.
- **Zusatzpakete:** Viele Pakete aus Octave Forge gibt es bei Ubuntu, z. B. `sudo apt install octave-statistics` für Statistik oder `octave-signal` für Signalverarbeitung. In Octave lädt `pkg load statistics` ein installiertes Paket.
- **Daten einlesen:** `csvread("datei.csv")` liest Zahlen aus einer CSV-Datei, `importdata` auch Dateien mit Überschriften.
- **Eigene Funktionen:** Eine Datei `quadrat.m` mit `function y = quadrat(x) … end` stellt die Funktion `quadrat` in allen Skripten desselben Ordners bereit.
- **Dokumentation:** In Octave zeigt `help polyfit` die Hilfe zu einer Funktion. Das Handbuch steht unter <https://docs.octave.org>.

## Deinstallieren

### 1. Übungsordner entfernen

```bash
rm -rf ~/octave-uebung
```

### 2. Octave entfernen

```bash
sudo apt purge octave fonts-freefont-otf
```

### 3. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Rechenbibliotheken und Qt-Pakete, die nur für Octave mitinstalliert wurden. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

### 4. Einstellungen entfernen (optional)

Octave speichert Einstellungen in `~/.config/octave` und den Befehlsverlauf in `~/.local/share/octave`.

```bash
rm -rf ~/.config/octave ~/.local/share/octave
```

**Prüfen:** Der Befehl `octave` wird nicht mehr gefunden.

```bash
octave --version
```
