# Geany

Geany ist ein kleiner, schneller Code-Editor mit Funktionen einer Entwicklungsumgebung. Er startet sofort, braucht wenig Speicher und kann Programme mit einem Tastendruck übersetzen und ausführen. Geany ist freie Software, verwendet dieselbe Grafikbibliothek (GTK) wie der Ubuntu-Desktop und fügt sich deshalb gut in die Oberfläche ein.

## Vorbemerkungen

- **Aus den Paketquellen:** Ubuntu 26.04 enthält Geany **2.1**. Die Installation ist klein: Außer Geany kommt nur das Paket `geany-common` mit Symbolen, Übersetzungen und Sprachdefinitionen dazu.
- **Deutsche Oberfläche:** Geany übernimmt die Sprache des Systems. Unter einem deutschen Ubuntu sind die Menüs sofort auf Deutsch.
- **Plugins einzeln:** Erweiterungen wie Git-Anzeige, Markdown-Vorschau oder ein LSP-Client stecken in eigenen Paketen `geany-plugin-…`. Das Sammelpaket `geany-plugins` würde über 50 Pakete auf einmal installieren. Diese Anleitung installiert nur einzelne.
- **Version:** Getestet mit Geany **2.1** (GTK 3.24) unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Geany installieren

```bash
sudo apt install geany
```

**Prüfen:** Die Ausgabe beginnt mit `geany 2.1`.

```bash
geany --version
```

## Erste Schritte

### 3. Geany starten

Öffnet Geany. Alternativ findest du das Programm im Anwendungsmenü unter „Geany“.

```bash
geany
```

Das Fenster hat drei Bereiche: links die Seitenleiste mit der Symbolliste (Funktionen, Überschriften) und den offenen Dateien, in der Mitte den Editor und unten das Meldungsfenster mit den Reitern „Status“, „Compiler“, „Meldungen“, „Notizen“ und „Terminal“.

### 4. Datei aus dem Terminal öffnen

`geany` mit Dateinamen öffnet die Dateien in Geany. Läuft Geany schon, öffnen sie sich als neue Tabs im vorhandenen Fenster.

```bash
geany ~/Installieren/src/geany.md
```

Mit `geany -l 12 datei.md` springt Geany direkt in Zeile 12.

### 5. Eingebautes Terminal für Programme verwenden

Geany startet Programme zum Ausprobieren standardmäßig in einem eigenen Terminalfenster. Bequemer ist das eingebaute Terminal im Reiter „Terminal“ unten.

1. Öffne **Bearbeiten → Einstellungen**.
2. Wähle links **Terminal**.
3. Setze den Haken bei **Führe Programme in der VTE aus** und klicke auf **OK**.

## Ein Programm übersetzen und ausführen

### 6. Compiler installieren (für das Beispiel)

Das Beispiel ist ein kleines C-Programm. Geany ruft zum Übersetzen den Compiler `gcc` auf. Ist er schon vorhanden, etwa aus der [C-Anleitung](c.md), meldet `apt` das nur.

```bash
sudo apt install build-essential
```

### 7. Beispieldatei anlegen

Wähle **Datei → Neu**, füge diesen Inhalt ein und speichere die Datei mit <kbd>Strg</kbd>+<kbd>S</kbd> als `hallo.c` in deinem Home-Ordner. Die Endung `.c` sagt Geany, dass es sich um C handelt. Erst danach färbt Geany den Code ein und kennt die passenden Befehle zum Übersetzen.

```c
#include <stdio.h>

int main(void)
{
    printf("Hallo aus Geany!\n");
    return 0;
}
```

**Prüfen:** In der Symbolliste links erscheint unter „Funktionen“ der Eintrag `main`.

### 8. Programm erstellen

Drücke <kbd>F9</kbd> (**Erstellen → Erstellen**). Geany führt dafür `gcc -Wall -o "hallo" "hallo.c"` aus und legt die Programmdatei `hallo` neben `hallo.c` ab.

**Prüfen:** Unten im Reiter „Compiler“ steht am Ende `Kompilierung erfolgreich beendet.` Bei Fehlern zeigt Geany sie dort mit Zeilennummer an, ein Doppelklick springt zur Stelle im Code.

### 9. Programm ausführen

Drücke <kbd>F5</kbd> (**Erstellen → Ausführen**).

**Prüfen:** Im Reiter „Terminal“ erscheint `Hallo aus Geany!`.

Die Befehle hinter <kbd>F8</kbd> (Kompilieren), <kbd>F9</kbd> (Erstellen) und <kbd>F5</kbd> (Ausführen) legt Geany je Sprache fest. Unter **Erstellen → Kommandos zum Erstellen konfigurieren** lassen sie sich ändern. Die Platzhalter `%f` und `%e` stehen dort für den Dateinamen mit und ohne Endung.

### 10. Python-Befehl anpassen (bei Bedarf)

Für Python-Dateien führt <kbd>F5</kbd> ab Werk den Befehl `python "%f"` aus. Unter Ubuntu heißt der Befehl aber `python3`. Ein `python` gibt es nur, wenn das Paket `python-is-python3` installiert ist. Öffne deshalb eine Python-Datei, wähle **Erstellen → Kommandos zum Erstellen konfigurieren** und ändere im unteren Bereich beim Eintrag **Ausführen** den Befehl in:

```text
python3 "%f"
```

## Plugins

### 11. Nützliche Plugins installieren

Drei einzelne Plugins als Beispiel:

- `geany-plugin-git-changebar` – zeigt am Rand, welche Zeilen seit dem letzten Git-Commit geändert wurden
- `geany-plugin-markdown` – zeigt eine Vorschau von Markdown-Dateien
- `geany-plugin-lsp` – verbindet Geany mit Sprachservern für Vervollständigung und Fehleranzeige, z. B. `python3-pylsp` für Python oder `clangd` für C

```bash
sudo apt install geany-plugin-git-changebar geany-plugin-markdown geany-plugin-lsp
```

### 12. Plugins einschalten

Installierte Plugins sind zunächst aus. Öffne in Geany **Werkzeuge → Plugin-Verwaltung**, setze bei den gewünschten Plugins den Haken und klicke auf **OK**. Über die Schaltfläche **Einstellungen** in der Plugin-Verwaltung lassen sich die Plugins einrichten.

## Die wichtigsten Tastenkürzel

| Tasten | Wirkung |
|---|---|
| <kbd>F8</kbd> | Aktuelle Datei kompilieren |
| <kbd>F9</kbd> | Programm erstellen |
| <kbd>F5</kbd> | Programm ausführen |
| <kbd>Strg</kbd>+<kbd>F</kbd> | In der Datei suchen |
| <kbd>Strg</kbd>+<kbd>H</kbd> | Ersetzen |
| <kbd>Strg</kbd>+<kbd>L</kbd> | Zu einer Zeile springen |
| <kbd>Strg</kbd>+<kbd>E</kbd> | Zeile oder Auswahl aus- oder einkommentieren |
| <kbd>Strg</kbd>+<kbd>Leertaste</kbd> | Wortvervollständigung anzeigen |

Unter **Bearbeiten → Einstellungen → Tastenkürzel** lassen sich alle Tastenkürzel ansehen und ändern.

## Aktualisieren

Geany wird zusammen mit den anderen Paketen aktualisiert:

```bash
sudo apt update
```

```bash
sudo apt upgrade
```

## Deinstallieren

### 1. Beispiel entfernen

Löscht die Beispieldatei und das daraus erstellte Programm, falls du Schritt 7 bis 9 ausgeführt hast.

```bash
rm -f ~/hallo.c ~/hallo
```

### 2. Geany und Plugins entfernen

Entfernt Geany und die Plugins aus Schritt 11. Nicht installierte Pakete meldet `apt` nur.

```bash
sudo apt purge geany geany-plugin-git-changebar geany-plugin-markdown geany-plugin-lsp
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt `geany-common` und die Bibliotheken der Plugins. Der Befehl entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

### 4. Eigene Einstellungen entfernen

Geany speichert Einstellungen, Sitzung und eigene Befehle zum Erstellen im Ordner `~/.config/geany`. **Achtung:** Deine Einstellungen gehen dabei verloren.

```bash
rm -rf ~/.config/geany
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
geany --version
```
