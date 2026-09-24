# AGENTS.md

## Zweck

Dieser Ordner enthält Installationsanleitungen für einen Ubuntu-Rechner.

- System: Ubuntu 26.04 LTS, x86_64 (amd64)
- Anleitungen auf dieses System zuschneiden: Pakete bevorzugt über `apt` installieren, erst danach Alternativen (z. B. Snap, offizielles Repository des Herstellers, `.deb`-Datei).
- Programme nicht über Docker (oder andere Container wie Podman) installieren, sondern direkt auf dem System.
- Befehle, die Administratorrechte brauchen, mit `sudo` schreiben.
- Vor einer Installation die Paketlisten aktualisieren (`sudo apt update`).
- Am Ende jeder Anleitung zeigen, wie man die Installation prüft (z. B. `programm --version`) und wie man das Programm wieder deinstalliert.

## Ausgabe als mdBook

Die Anleitungen werden als mdBook ausgegeben (mdbook ist unter `~/.cargo/bin/mdbook` installiert).

- Aufbau:
  - `book.toml` – Konfiguration des Buchs (`language = "de"`)
  - `src/SUMMARY.md` – Inhaltsverzeichnis
  - `src/<programm>.md` – eine Anleitung pro Programm, Dateiname klein und ohne Leerzeichen (z. B. `src/vscode.md`)
- Jede neue Anleitung in `src/SUMMARY.md` eintragen, sonst erscheint sie nicht im Buch.
- Jede Anleitung beginnt mit einer Überschrift `# <Programm>` und einem kurzen Satz, wofür das Programm gut ist.
- Nach Änderungen mit `mdbook build` prüfen, dass das Buch ohne Fehler gebaut wird. Die Ausgabe landet in `book/`.
- Zum Ansehen im Browser: `mdbook serve --open`.

## Antwortstil

- Antworte auf Deutsch.
- Erkläre alles Schritt für Schritt:
  - Nummeriere die Schritte (1., 2., 3., …).
  - Pro Schritt nur eine Aktion.
  - Zu jedem Schritt kurz erklären, was er bewirkt und warum er nötig ist.
  - Befehle immer in einem eigenen Codeblock angeben, damit sie direkt kopiert werden können.
  - Wenn sinnvoll, nach einem Schritt angeben, wie man prüft, ob er erfolgreich war.

## Urheberrechtsprüfung und Veröffentlichung

Vor der Veröffentlichung müssen alle Texte auf die Einhaltung des Urheberrechts geprüft werden:

- **Eigenständige Texte:** Keine wörtlichen Übernahmen, keine eng angelehnten Paraphrasen und keine übersetzten Passagen aus fremden Quellen.
- **Prüfung:** Einzelne Artikel systematisch daraufhin überprüfen, ob sie fremdes Urheberrecht verletzen.
- **Trefferliste:** Werden auffällige Stellen gefunden, ist eine Liste der auffälligen Seiten auszugeben mit:
  - Fundstelle (Datei und Textstelle/Zeile)
  - Vermuteter Quelle
  - Schweregrad (z. B. gering, mittel, schwer)
- **Iterative Überarbeitung:** Die gemeldeten Treffer werden anschließend einzeln abgearbeitet. Auffällige Artikel bzw. Passagen werden so lange neu geschrieben, bis keinerlei Urheberrechtsverletzungen mehr vorliegen.
- **Veröffentlichung:** Erst wenn alle Texte vollständig frei von Urheberrechtsverletzungen und Beanstandungen sind, erfolgt die Freigabe und Veröffentlichung.
