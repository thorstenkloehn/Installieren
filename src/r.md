# R

R ist eine Programmiersprache für Statistik und Datenanalyse. Sie bringt Funktionen für Tabellen, Kennzahlen, statistische Tests und Diagramme schon mit und wird in Wissenschaft, Marktforschung und Datenjournalismus viel verwendet. Mehr als 20 000 Zusatzpakete auf CRAN, dem zentralen Paketarchiv von R, erweitern sie für fast jedes Fachgebiet.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **R 4.5** im Paket `r-base`. Es enthält den Interpreter, die wichtigsten Standardpakete und die Compiler, die manche Pakete von CRAN beim Installieren brauchen. Zusammen sind das rund 40 Pakete.
- **Zusatzpakete auf zwei Wegen:** Viele beliebte Pakete gibt es als Ubuntu-Paket mit dem Namen `r-cran-…`, etwa `r-cran-ggplot2`. Sie werden mit `apt` installiert und aktualisiert. Alle übrigen installiert R selbst von CRAN in eine **persönliche Bibliothek** im Home-Ordner.
- **Empfohlene Pakete weglassen:** `r-cran-ggplot2` empfiehlt sehr viele weitere Pakete. Im Test kamen dadurch rund 875 Pakete zusätzlich auf den Rechner. Mit `--no-install-recommends` sind es nur 17.
- **Version:** Getestet mit R **4.5.2** und ggplot2 4.0.2 aus Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. R installieren

```bash
sudo apt install r-base
```

**Prüfen:** Die erste Zeile lautet `R version 4.5.2 …`.

```bash
R --version
```

## Erste Schritte

### 3. R im Terminal starten

Startet die interaktive Konsole von R. Die Eingabezeile beginnt mit `>`.

```bash
R
```

### 4. Etwas ausrechnen

Gib in der Konsole nacheinander ein und drücke jeweils <kbd>Enter</kbd>:

```r
mean(c(12, 15, 24, 31, 38, 41))
```

```r
summary(c(12, 15, 24, 31, 38, 41))
```

**Prüfen:** Der Mittelwert lautet `26.83333`. `summary` zeigt Kleinstwert, Quartile, Mittelwert und Größtwert. R schreibt Kommazahlen mit Punkt.

### 5. Konsole beenden

`q()` beendet R. Auf die Frage `Save workspace image? [y/n/c]:` antwortest du mit <kbd>n</kbd>. Bei <kbd>y</kbd> legt R die Dateien `.RData` und `.Rhistory` im aktuellen Ordner an und lädt beim nächsten Start dort alle alten Variablen wieder.

```r
q()
```

## Ein Skript auswerten

### 6. Übungsordner anlegen

```bash
mkdir ~/r-uebung
```

### 7. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/r-uebung
```

### 8. Skript anlegen

Das Skript wertet ausgedachte Verkaufszahlen eines Fahrradladens aus und zeichnet ein Balkendiagramm.

```bash
nano auswertung.R
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```r
# Verkaufte Fahrräder pro Monat (Beispielwerte)
monate <- c("Jan", "Feb", "Mär", "Apr", "Mai", "Jun")
verkauf <- data.frame(
  monat = factor(monate, levels = monate),
  citybike = c(12, 15, 24, 31, 38, 41),
  lastenrad = c(3, 4, 6, 9, 11, 10)
)

print(verkauf)
cat("\nDurchschnitt Citybikes:", mean(verkauf$citybike), "\n")
cat("Summe Lastenräder:", sum(verkauf$lastenrad), "\n")
cat("Bester Monat Citybikes:", as.character(verkauf$monat[which.max(verkauf$citybike)]), "\n\n")

# Linearer Trend: Wie viele Citybikes kommen pro Monat hinzu?
verkauf$nummer <- seq_len(nrow(verkauf))
trend <- lm(citybike ~ nummer, data = verkauf)
cat("Zuwachs pro Monat:", round(coef(trend)[["nummer"]], 1), "\n")

# Diagramm als PNG-Datei
png("verkauf.png", width = 800, height = 500)
barplot(t(as.matrix(verkauf[, c("citybike", "lastenrad")])), names.arg = verkauf$monat,
        beside = TRUE, legend.text = c("Citybike", "Lastenrad"), args.legend = list(x = "topleft"),
        main = "Verkaufte Räder")
invisible(dev.off())
```

- **`<-`** – weist einen Wert zu, wie `=` in anderen Sprachen.
- **`c(…)`** – fasst Werte zu einem Vektor zusammen. Rechnungen wie `mean` oder `sum` gelten dann für alle Werte auf einmal.
- **`data.frame`** – eine Tabelle mit benannten Spalten. `verkauf$citybike` ist die Spalte `citybike`.
- **`factor(…, levels = monate)`** – legt die Reihenfolge der Monate fest. Ohne diese Angabe sortiert R sie alphabetisch.
- **`lm`** – berechnet eine Regressionsgerade. `citybike ~ nummer` heißt: Citybikes in Abhängigkeit von der Monatsnummer.
- **`png` … `dev.off()`** – leitet das Diagramm in eine Datei um und schließt sie am Ende. `invisible` unterdrückt eine Meldung von `dev.off`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 9. Skript ausführen

`Rscript` führt ein Skript aus, ohne die Konsole zu öffnen.

```bash
Rscript auswertung.R
```

**Prüfen:** Die Ausgabe lautet:

```text
  monat citybike lastenrad
1   Jan       12         3
2   Feb       15         4
3   Mär       24         6
4   Apr       31         9
5   Mai       38        11
6   Jun       41        10

Durchschnitt Citybikes: 26.83333 
Summe Lastenräder: 43 
Bester Monat Citybikes: Jun 

Zuwachs pro Monat: 6.3 
```

Im Ordner liegt jetzt `verkauf.png` mit dem Balkendiagramm. Öffne es zum Ansehen im Dateimanager.

## Diagramme mit ggplot2

### 10. ggplot2 installieren

ggplot2 ist das bekannteste Paket für Diagramme in R. `--no-install-recommends` lässt die vielen empfohlenen Zusatzpakete weg, siehe Vorbemerkungen.

```bash
sudo apt install --no-install-recommends r-cran-ggplot2
```

### 11. Skript anlegen

```bash
nano diagramm.R
```

Füge diesen Inhalt ein:

```r
library(ggplot2)

monate <- c("Jan", "Feb", "Mär", "Apr", "Mai", "Jun")
verkauf <- data.frame(
  monat = factor(rep(monate, 2), levels = monate),
  modell = rep(c("Citybike", "Lastenrad"), each = 6),
  anzahl = c(12, 15, 24, 31, 38, 41, 3, 4, 6, 9, 11, 10)
)

diagramm <- ggplot(verkauf, aes(x = monat, y = anzahl, fill = modell)) +
  geom_col(position = "dodge") +
  labs(title = "Verkaufte Räder im ersten Halbjahr", x = "Monat", y = "Anzahl", fill = "Modell") +
  theme_minimal()

ggsave("verkauf-ggplot.png", diagramm, width = 8, height = 5, dpi = 100)
cat("Gespeichert: verkauf-ggplot.png\n")
```

- **Lange Form:** ggplot2 erwartet eine Zeile pro Wert. Statt zweier Spalten `citybike` und `lastenrad` gibt es deshalb eine Spalte `modell`. `rep` wiederholt Werte, damit die Tabelle zwölf Zeilen bekommt.
- **`aes(…)`** – ordnet Spalten den Teilen des Diagramms zu: Monat nach rechts, Anzahl nach oben, Modell als Farbe.
- **`+`** – baut das Diagramm schichtweise auf: Balken (`geom_col`, `dodge` stellt sie nebeneinander), Beschriftungen (`labs`) und Gestaltung (`theme_minimal`).
- **`ggsave`** – speichert das Diagramm, hier 8 × 5 Zoll mit 100 Punkten je Zoll, also 800 × 500 Pixel.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Skript ausführen

```bash
Rscript diagramm.R
```

**Prüfen:** Die Ausgabe lautet `Gespeichert: verkauf-ggplot.png`. Das Bild zeigt farbige Balken für beide Modelle nebeneinander und rechts eine Legende.

## Pakete von CRAN installieren

Nicht jedes Paket gibt es bei Ubuntu. Solche Pakete installiert R selbst in die persönliche Bibliothek. Als Beispiel dient `fortunes`, eine Sammlung von Zitaten aus der R-Gemeinschaft.

### 13. Persönliche Bibliothek anlegen

Legt den Ordner `~/R/x86_64-pc-linux-gnu-library/4.5` an. R verwendet ihn nur, wenn er beim Start schon existiert. Deshalb ist das ein eigener Schritt vor der Installation.

```bash
Rscript -e 'dir.create(Sys.getenv("R_LIBS_USER"), recursive = TRUE)'
```

### 14. Paket installieren

R lädt das Paket von `cloud.r-project.org`, einem weltweiten Spiegel von CRAN, und installiert es in die persönliche Bibliothek. Dafür sind keine Administratorrechte nötig.

```bash
Rscript -e 'install.packages("fortunes")'
```

**Prüfen:** Die letzten Zeilen nennen den Ordner `downloaded_packages`. Der nächste Befehl gibt ein zufälliges Zitat aus.

```bash
Rscript -e 'library(fortunes); fortune()'
```

## Wie geht es weiter?

- **Daten einlesen:** `read.csv("datei.csv")` liest eine CSV-Datei als Tabelle ein. Für Dateien aus deutschen Programmen mit Semikolon und Komma als Dezimalzeichen gibt es `read.csv2`.
- **tidyverse:** Die Pakete `r-cran-dplyr`, `r-cran-tidyr` und `r-cran-readr` machen das Umformen und Filtern von Tabellen bequemer. Auch hier lohnt `--no-install-recommends`.
- **Berichte:** Mit [Quarto](quarto.md) mischt man Text und R-Code in einem Dokument und erzeugt daraus HTML oder PDF samt Diagrammen.
- **Entwicklungsumgebung:** RStudio (Posit) ist die verbreitetste Oberfläche für R. Alternativ gibt es eine R-Erweiterung für [Visual Studio Code](vscode.md).
- **Dokumentation:** In der Konsole öffnet `?mean` die Hilfe zu einer Funktion. Handbücher gibt es unter <https://cran.r-project.org/manuals.html>.

## Deinstallieren

### 1. Übungsordner entfernen

```bash
rm -rf ~/r-uebung
```

### 2. Persönliche Bibliothek entfernen

Löscht alle Pakete, die R selbst von CRAN installiert hat.

```bash
rm -rf ~/R
```

### 3. R und ggplot2 entfernen

`r-base-core` ist der eigentliche Interpreter. Mit ihm werden auch alle `r-cran-…`-Pakete entfernt, die ihn brauchen.

```bash
sudo apt purge r-base r-base-core r-cran-ggplot2
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Pakete, die nur für R mitinstalliert wurden, z. B. die Compiler und Bibliotheken für Fortran. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

### 5. Verlauf und Arbeitsbereich löschen (optional)

Nur nötig, wenn du beim Beenden der Konsole mit <kbd>y</kbd> geantwortet hast. Dann liegen `.Rhistory` und `.RData` in dem Ordner, in dem du R gestartet hast. Der Befehl löscht sie im Home-Ordner.

```bash
rm -f ~/.Rhistory ~/.RData
```

**Prüfen:** Der Befehl `R` wird nicht mehr gefunden.

```bash
R --version
```
