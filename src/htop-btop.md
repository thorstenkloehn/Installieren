# htop und btop

htop und btop zeigen im Terminal, welche Programme gerade wie viel Prozessorzeit und Arbeitsspeicher brauchen, und erlauben es, ein hängendes Programm direkt aus der Liste heraus zu beenden. htop ist schlicht, schnell und auf fast jedem Server zu finden. btop ist bunter, zeigt zusätzlich Verlaufskurven für Prozessor, Netzwerk und Festplatten und kann auch die Grafikkarte überwachen. Beide ersetzen den alten Befehl `top`. Für Werte im Browser oder über eine API eignet sich dagegen [Glances](glances.md).

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert htop **3.4.1** und btop **1.4.6**. Beide Pakete sind klein und ziehen keine weiteren Pakete nach. Du kannst auch nur eines der beiden installieren.
- **Sprache:** Beide Programme gibt es nur auf Englisch.
- **Funktionstasten:** Manche Terminals belegen <kbd>F1</kbd> oder <kbd>F10</kbd> selbst. Für alle Aktionen gibt es deshalb auch eine Buchstabentaste, die die Anleitung jeweils mit angibt.
- **Einstellungen:** Beide speichern Änderungen an der Anzeige automatisch in deinem Home-Ordner, htop in `~/.config/htop/htoprc`, btop in `~/.config/btop/btop.conf`.
- **Version:** Getestet mit htop **3.4.1** und btop **1.4.6** am 2. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. htop und btop installieren

```bash
sudo apt install htop btop
```

### 3. Versionen prüfen

```bash
htop --version
```

**Prüfen:** Die Ausgabe lautet `htop 3.4.1`.

```bash
btop --version
```

**Prüfen:** Die erste Zeile lautet `btop version: 1.4.6`.

## Teil 1: htop

### 4. htop starten

```bash
htop
```

**Prüfen:** Oben steht für jeden Prozessorkern ein Balken, darunter Balken für Arbeitsspeicher (**Mem**) und Auslagerungsspeicher (**Swp**). Rechts daneben stehen die Zahl der Prozesse (**Tasks**), die Auslastung (**Load average**) und die Laufzeit (**Uptime**). Den Rest füllt die Prozessliste. Ganz unten zeigt eine Leiste die Funktionstasten von **F1Help** bis **F10Quit**.

### 5. Farben der Balken verstehen

Die Balken sind in Farben unterteilt. Beim Prozessor steht Grün für normale Programme, Rot für Arbeit des Systemkerns und Blau für Programme mit niedriger Priorität. Beim Arbeitsspeicher steht Grün für den Speicher, den Programme wirklich belegen. Blau und Gelb zeigen Zwischenspeicher, den Linux bei Bedarf sofort wieder freigibt. Ein voller Balken mit viel Gelb ist also kein Grund zur Sorge.

### 6. Prozessliste sortieren

Drücke <kbd>F6</kbd> (oder <kbd>></kbd>), wähle mit den Pfeiltasten eine Spalte, etwa **PERCENT_MEM** für den Arbeitsspeicher, und bestätige mit <kbd>Enter</kbd>.

Schneller geht es mit diesen Tasten:

- <kbd>P</kbd> (groß) sortiert nach Prozessorlast.
- <kbd>M</kbd> (groß) sortiert nach Arbeitsspeicher.
- <kbd>T</kbd> (groß) sortiert nach der bisher verbrauchten Rechenzeit.

### 7. Programm suchen

Drücke <kbd>F3</kbd> (oder <kbd>/</kbd>) und tippe einen Teil des Namens, z. B. `nginx`. htop springt zum ersten Treffer, <kbd>F3</kbd> springt zum nächsten. <kbd>Esc</kbd> beendet die Suche.

Soll die Liste nur noch passende Prozesse zeigen, nimm stattdessen <kbd>F4</kbd> (oder <kbd>\\</kbd>). Ein leerer Filter mit <kbd>Enter</kbd> zeigt wieder alle.

### 8. Baumansicht einschalten

<kbd>F5</kbd> (oder <kbd>t</kbd>) zeigt, welches Programm welches andere gestartet hat. Ein zweiter Druck schaltet wieder auf die Liste um.

### 9. Programm beenden

Wähle den Prozess mit den Pfeiltasten aus und drücke <kbd>F9</kbd> (oder <kbd>k</kbd>). Links erscheint eine Liste von Signalen. Vorausgewählt ist **15 SIGTERM**: Es bittet das Programm, sich ordentlich zu beenden. Bestätige mit <kbd>Enter</kbd>. Nur wenn ein Programm darauf nicht reagiert, wähle **9 SIGKILL**, das es sofort abbricht.

> **Hinweis:** Ohne `sudo` kannst du nur deine eigenen Programme beenden. Für Systemdienste ist `sudo systemctl stop DIENST` der bessere Weg als ein Signal aus htop, sonst startet systemd den Dienst unter Umständen gleich wieder.

### 10. Anzeige einrichten

<kbd>F2</kbd> (oder <kbd>S</kbd>, groß) öffnet die Einstellungen. Links wählst du einen Bereich, etwa **Meters** für die Balken oben oder **Columns** für die Spalten der Prozessliste, und änderst ihn mit den Tasten, die die untere Leiste anzeigt. <kbd>F10</kbd> oder <kbd>Esc</kbd> schließt die Einstellungen.

### 11. htop beenden

Drücke <kbd>q</kbd> (oder <kbd>F10</kbd>). Dabei schreibt htop deine Einstellungen nach `~/.config/htop/htoprc`.

## Teil 2: btop

### 12. btop starten

```bash
btop
```

**Prüfen:** Das Fenster ist in vier Kästen geteilt: **cpu** oben mit einer Verlaufskurve und einem Balken je Kern, darunter links **mem** mit Arbeitsspeicher und **disks** mit den Dateisystemen, darunter **net** mit dem Netzverkehr und rechts **proc** mit der Prozessliste.

### 13. Kästen ein- und ausblenden

Die Zifferntasten schalten die Kästen um:

- <kbd>1</kbd> Prozessor, <kbd>2</kbd> Arbeitsspeicher, <kbd>3</kbd> Netzwerk, <kbd>4</kbd> Prozesse.
- <kbd>5</kbd> blendet einen Kasten für die Grafikkarte ein. Bei NVIDIA-Karten klappt das, sobald der proprietäre Treiber installiert ist. Auf dem Testrechner erschien so die **GeForce GTX 1660** mit Auslastung, Grafikspeicher und Temperatur.
- <kbd>d</kbd> blendet die Dateisysteme im Arbeitsspeicher-Kasten aus und wieder ein.

btop merkt sich die Auswahl für den nächsten Start.

### 14. Prozessliste sortieren

Mit <kbd>←</kbd> und <kbd>→</kbd> wechselst du die Spalte, nach der sortiert wird. Rechts oben im Kasten **proc** steht, welche gerade gilt, z. B. **cpu lazy**. <kbd>r</kbd> dreht die Reihenfolge um.

### 15. Prozesse filtern

Drücke <kbd>f</kbd> (oder <kbd>/</kbd>) und tippe einen Teil des Namens. Die Liste zeigt sofort nur noch passende Prozesse. <kbd>Enter</kbd> behält den Filter, <kbd>Esc</kbd> verwirft ihn.

### 16. Baumansicht einschalten

<kbd>e</kbd> zeigt, welches Programm welches andere gestartet hat. Ein zweiter Druck schaltet zurück.

### 17. Einzelnen Prozess genauer ansehen

Wähle einen Prozess mit <kbd>↑</kbd> und <kbd>↓</kbd> aus und drücke <kbd>Enter</kbd>. Über der Liste erscheinen Befehlszeile, Laufzeit, Speicherverbrauch und Lese- und Schreibmenge dieses Prozesses. Ein weiteres <kbd>Enter</kbd> schließt die Ansicht.

### 18. Programm beenden

Wähle den Prozess aus und drücke <kbd>t</kbd>. btop fragt nach, ob es das Signal **SIGTERM** senden soll. Bestätige mit <kbd>Enter</kbd>. <kbd>k</kbd> sendet stattdessen **SIGKILL**, <kbd>s</kbd> öffnet eine Liste aller Signale.

### 19. Farbschema wechseln

<kbd>Esc</kbd> (oder <kbd>m</kbd>) öffnet das Menü, darin führt **Options** zu den Einstellungen. Unter **Color theme** wählst du mit <kbd>←</kbd> und <kbd>→</kbd> eines der über 30 mitgelieferten Farbschemata, etwa `adwaita` für helle Terminals. <kbd>Esc</kbd> schließt das Menü wieder. Die Einstellungen öffnen sich auch direkt mit <kbd>o</kbd>.

### 20. btop beenden

Drücke <kbd>q</kbd>.

## Wie geht es weiter?

- **Prozesse anderer Benutzer beenden:** Mit `sudo htop` oder `sudo btop` gilt das für alle Prozesse. Dann ist Vorsicht geboten, denn ein Signal an einen falschen Prozess kann das System stören.
- **Aktualisierungsrate:** `htop -d 10` erneuert die Anzeige jede Sekunde (Angabe in Zehntelsekunden, Vorgabe 1,5 Sekunden). In btop steht die Rate unter **Options** bei **Update ms**.
- **Nur einen Benutzer zeigen:** `htop -u www-data` zeigt nur die Prozesse des Webservers.
- **Dokumentation:** `man htop` und `btop --help`, ausführlich unter <https://htop.dev> und <https://github.com/aristocratos/btop>

## Deinstallieren

### 1. htop und btop entfernen

```bash
sudo apt purge htop btop
```

### 2. Eigene Einstellungen löschen

Die Einstellungsdateien liegen in deinem Home-Ordner und gehören zu keinem Paket.

```bash
rm -rf ~/.config/htop ~/.config/btop
```

**Prüfen:** Beide Befehle werden nicht mehr gefunden.

```bash
htop --version
```

```bash
btop --version
```
