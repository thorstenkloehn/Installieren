# Zed

Zed ist ein junger, sehr schneller Code-Editor, geschrieben in Rust von den Entwicklern, die früher den Editor Atom gebaut haben. Er zeichnet seine Oberfläche direkt mit der Grafikkarte, bringt Sprachserver (LSP) für viele Sprachen, ein Terminal und Git-Anzeige schon mit und hat eingebaute Funktionen für Zusammenarbeit in Echtzeit und für KI-Assistenten.

## Vorbemerkungen

- **Keine Pakete von Ubuntu:** Zed gibt es weder in den Ubuntu-Paketquellen noch als Snap, und der Hersteller betreibt kein Paketarchiv. Diese Anleitung verwendet deshalb das offizielle Installationsskript von <https://zed.dev>. Es lädt ein Archiv herunter und entpackt es in den eigenen Home-Ordner. `sudo` ist dafür nicht nötig.
- **Wohin Zed installiert wird:** Das Programm liegt danach in `~/.local/zed.app` (rund 330 MB). Dazu kommen der Befehl `~/.local/bin/zed` als Verknüpfung und ein Eintrag im Anwendungsmenü. Ubuntu nimmt `~/.local/bin` beim Anmelden selbst in den Suchpfad auf, wenn der Ordner existiert.
- **Updates:** Zed aktualisiert sich selbst. Eine neue Version lädt es im Hintergrund und bietet den Neustart an. Über `apt upgrade` wird Zed nicht aktualisiert.
- **Grafikkarte:** Zed braucht eine Grafikkarte mit Vulkan-Unterstützung. Das ist bei aktuellen Rechnern mit Intel-, AMD- oder NVIDIA-Grafik der Normalfall. In virtuellen Maschinen ohne Grafikbeschleunigung startet Zed unter Umständen nicht.
- **Nur Englisch:** Die Oberfläche von Zed gibt es nur auf Englisch.
- **Telemetrie:** Zed sendet ab Werk Fehlerberichte und anonyme Nutzungsdaten an den Hersteller. Schritt 8 zeigt, wie man das abschaltet.
- **Version:** Getestet mit Zed **1.21.0** unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. curl installieren

`curl` lädt das Installationsskript und danach Zed selbst herunter. Ist es schon vorhanden, meldet `apt` das nur.

```bash
sudo apt install curl
```

### 3. Installationsskript herunterladen

Speichert das Skript zuerst als Datei. So kannst du vor dem Ausführen nachsehen, was es tut, statt es ungesehen aus dem Internet zu starten.

```bash
curl -fsSL -o ~/zed-install.sh https://zed.dev/install.sh
```

### 4. Skript ansehen (optional)

Zeigt das Skript seitenweise an. Mit den Pfeiltasten blätterst du, mit <kbd>Q</kbd> beendest du die Anzeige. Der Teil `linux()` lädt das Archiv von `cloud.zed.dev`, entpackt es nach `~/.local`, legt die Verknüpfung `~/.local/bin/zed` an und kopiert den Menüeintrag nach `~/.local/share/applications`.

```bash
less ~/zed-install.sh
```

### 5. Skript ausführen

Lädt Zed (rund 125 MB) herunter und installiert es für deinen Benutzer.

```bash
sh ~/zed-install.sh
```

**Prüfen:** Die letzte Zeile lautet `Zed has been installed. Run with 'zed'`. Steht dort stattdessen `To run Zed from your terminal, you must add ~/.local/bin to your PATH`, gab es den Ordner `~/.local/bin` vorher noch nicht. Melde dich dann einmal ab und wieder an, danach findet die Shell den Befehl.

### 6. Skript löschen

Das Skript wird nicht mehr gebraucht.

```bash
rm ~/zed-install.sh
```

**Prüfen:** Die Ausgabe beginnt mit `Zed 1.21.0` oder nennt eine neuere Version.

```bash
zed --version
```

## Erste Schritte

### 7. Projektordner öffnen

`zed` mit einem Ordner öffnet ihn als Projekt. Links erscheint die Dateiliste. Beim ersten Start fragt Zed nach Farbschema, Tastenbelegung (z. B. wie in VS Code oder mit Vim-Modus) und ob du dich anmelden möchtest. Für den Editor selbst ist keine Anmeldung nötig, nur für Zusammenarbeit und die KI-Dienste von Zed. Hier als Beispiel dieser Ordner mit den Anleitungen:

```bash
zed ~/Installieren
```

Mit `zed datei.md:12` öffnet Zed eine Datei direkt in Zeile 12. Alternativ startest du Zed über das Anwendungsmenü unter „Zed“.

### 8. Telemetrie abschalten

Einstellungen stehen in Zed in der Datei `~/.config/zed/settings.json`. Drücke in Zed <kbd>Strg</kbd>+<kbd>,</kbd> und wähle, falls Zed eine Oberfläche mit Schaltern zeigt, oben **Edit in settings.json**. Ergänze zwischen den äußeren geschweiften Klammern:

```json
  "telemetry": {
    "diagnostics": false,
    "metrics": false
  },
```

`diagnostics` sind Absturz- und Fehlerberichte, `metrics` anonyme Nutzungsdaten. Speichere mit <kbd>Strg</kbd>+<kbd>S</kbd>. Zed übernimmt Einstellungen sofort, ohne Neustart. Fehler in der Datei, etwa ein fehlendes Komma, zeigt Zed unten in der Statusleiste an.

### 9. Die wichtigsten Tastenkürzel kennenlernen

In der Voreinstellung verwendet Zed dieselben Tastenkürzel wie VS Code:

| Tasten | Wirkung |
|---|---|
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>P</kbd> | Befehlspalette: jeden Befehl über seinen Namen suchen |
| <kbd>Strg</kbd>+<kbd>P</kbd> | Datei im Projekt schnell öffnen |
| <kbd>Strg</kbd>+<kbd>,</kbd> | Einstellungen öffnen |
| <kbd>Strg</kbd>+<kbd>F</kbd> | In der Datei suchen |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>F</kbd> | Im ganzen Projekt suchen |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>X</kbd> | Erweiterungen anzeigen und installieren |

Das Terminal öffnest du über die Befehlspalette mit `terminal panel: toggle`. Dort steht auch das Tastenkürzel, das Zed für deine Tastatur verwendet.

### 10. Sprachunterstützung

Öffnest du eine Datei in einer Sprache wie Python, Rust, Go oder TypeScript, lädt Zed den passenden Sprachserver meist selbst herunter und zeigt danach Vervollständigung und Fehler an. Für weitere Sprachen und Farbschemata gibt es Erweiterungen, die du über <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>X</kbd> suchst und installierst. Sprachserver und Erweiterungen landen in `~/.local/share/zed`.

## Optional: Zed für Git verwenden

### 11. Zed als Editor für Git festlegen

Git öffnet für Commit-Nachrichten einen Editor. Mit dieser Einstellung ist das Zed. `--wait` sorgt dafür, dass Git wartet, bis du den Tab mit der Nachricht schließt.

```bash
git config --global core.editor "zed --wait"
```

**Prüfen:** Die Ausgabe lautet `zed --wait`.

```bash
git config --global core.editor
```

## Deinstallieren

### 1. Git-Einstellung zurücksetzen

Entfernt Zed als Git-Editor, falls du Schritt 11 ausgeführt hast. Git nutzt danach wieder den Standard-Editor des Systems.

```bash
git config --global --unset core.editor
```

### 2. Zed entfernen

Zed bringt eine eigene Deinstallation mit. Sie entfernt `~/.local/zed.app`, die Verknüpfung `~/.local/bin/zed` und den Menüeintrag. Danach fragt sie `Do you want to keep your Zed preferences? [Y/n]`. <kbd>Enter</kbd> behält deine Einstellungen, <kbd>n</kbd> und <kbd>Enter</kbd> löscht auch `~/.config/zed` und `~/.local/share/zed` samt Erweiterungen und Sprachservern.

```bash
zed --uninstall
```

**Prüfen:** Die Ausgabe endet mit `Zed has been uninstalled`. Die Shell meldet danach, dass der Befehl `zed` nicht gefunden wurde.

```bash
zed --version
```
