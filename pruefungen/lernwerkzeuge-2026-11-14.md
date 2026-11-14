# Prüfung der Lernwerkzeuge und Eigenbauten

Stand: 14. November 2026. Geprüft wurden die beiden aufeinanderfolgenden Aufträge zu Lernwerkzeugen für Editor, Terminal, Browser und Wiederholung.

## Geprüfte Texte

Die Übersicht `src/lernwerkzeuge.md` und alle folgenden neuen Kapitel wurden einzeln auf erkennbare wörtliche Übernahmen, eng angelehnte Paraphrasen und übersetzte Fremdpassagen geprüft. Verglichen wurde jeweils mit den im Kapitel verlinkten offiziellen Quellen. Die Schrittbegründungen und eigenen Lernbeispiele wurden für dieses Buch geschrieben. Technisch vorgegebene Produktnamen, Befehle und API-Namen sind keine als eigener Erklärungstext ausgegebenen Fremdpassagen.

| Kapitel | Vergleichsgrundlage | Auffällige Textstellen |
|---|---|---|
| jetbrains-academy.md | Offizieller Marketplace und Educational-Plugin-Repository | Keine festgestellt |
| rustlings.md | Offizielle Einrichtung und Cargo.toml des Tags 6.5.0 | Keine festgestellt |
| exercism.md | Offizielles Release 3.5.9, CLI-Repository und Working Locally | Keine festgestellt |
| coderoad.md | Marketplace, Einrichtung und Repository | Keine festgestellt |
| codetour.md | README, Manifest und Tourformat | Keine festgestellt |
| github-skills.md | Skills-/Learn-Einstieg und offizieller Einführungskurs | Keine festgestellt |
| kurs-pruefer.md | Eigener Code; VS-Code-API, Paketierung und Python-unittest | Keine festgestellt |
| anki.md | Ubuntu-Paketsuche, Anki-Handbuch, FSRS-Optionen und offizielles Archiv | Keine festgestellt |
| execute-program.md | Offizielle Produkt- und Zugangsseite | Keine festgestellt |
| python-tutor.md | Offizielle Website und Visualizer | Keine festgestellt |
| js-parsons.md | Offizielles Repository, Beispiele und Einbindungsdokumentation | Keine festgestellt |
| roadmap-sh.md | Offizielle Roadmaps | Keine festgestellt |
| project-based-learning.md | Offizielles Repository und dessen Lizenzangabe | Keine festgestellt |
| build-your-own-x.md | Offizielles Repository, Abschnitt Origins & License | Keine festgestellt |
| kurs-lernen.md | Eigener Quellcode und eigene Lerninhalte | Keine festgestellt |
| lernwerkzeuge.md | Eigene Zusammenstellung der Einzelkapitel | Keine festgestellt |

Trefferliste: Keine auffälligen Textstellen im geprüften Umfang festgestellt. Daher keine Fundstellen mit vermuteter Quelle und Schweregrad zu melden. Dies ist eine begrenzte redaktionelle Prüfung, kein Nachweis vollständiger Rechtefreiheit gegenüber allen vorhandenen Quellen. Andere Buchkapitel wurden hier nicht vollständig geprüft. Eine Veröffentlichungsfreigabe für das gesamte Buch ist nicht erfolgt; es wurde nichts veröffentlicht.

## Lizenzeinordnung

- JetBrains-Academy-Quellcode: Apache-2.0; Plugin, IDE, Kurse und externe Dienste sind getrennt zu betrachten.
- Rustlings, Exercism-CLI, CodeTour und js-parsons: MIT; CodeRoad: AGPL-3.0.
- GitHub Skills: Die verlinkte Kursvorlage trägt MIT, der Dienst hat eigene Bedingungen.
- Anki Desktop: freie Software unter AGPL-3.0. FSRS ist in der beschriebenen Version eingebaut.
- project-based-learning nennt MIT. build-your-own-x nennt aktuell einen Rechteverzicht und wurde deshalb nicht pauschal als MIT bezeichnet. Rechte der verlinkten Materialien bleiben gesondert zu prüfen.
- Execute Program, Python Tutor und roadmap.sh: Kostenloser Zugang beziehungsweise frei erreichbare Inhalte sind keine allgemeine Erlaubnis, Kursinhalte zu übernehmen.
- Beide Eigenbauten enthalten eigene Texte und Beispiele. Eine Weitergabelizenz wurde nicht im Namen des Benutzers festgelegt. Das VSIX-Manifest kennzeichnet das lokale Paket als private und UNLICENSED; Paketierung ist keine Veröffentlichung.

## Technische Prüfung

- Alle 16 neuen Kapitel stehen in SUMMARY.md. Alle lokalen Kapitel- und Downloadlinks sind vorhanden.
- Alle Bash-Codeblöcke der neuen Kapitel bestehen `bash -n`; `git diff --check` ist fehlerfrei.
- mdBook baut das gesamte Buch erfolgreich. Es gibt eine Warnung zur Größe des Suchindex.
- Rustlings 6.5.0 wurde mit Cargo und --locked nach /tmp kompiliert. Versionsaufruf und Initialisierung eines Übungssatzes funktionieren.
- Exercism 3.5.9: Downloadnamen und SHA-256-Prüfsumme wurden anhand des offiziellen Releases geprüft. Das entpackte Programm meldet Version 3.5.9. Kein Konto wurde konfiguriert, keine Aufgabe heruntergeladen und keine Lösung hochgeladen.
- CodeTour: Die Tour wurde anhand des offiziellen Schemas aufgebaut und verweist auf die beiden vorhandenen Zeilen des selbst geschriebenen Beispiels. Kein Test im echten VS-Code-Fenster.
- Kurs-Prüfer: Vier Python-Prüfungen bestätigen, dass die unfertige Aufgabe, eine falsche Summenlösung und eine eingabeverändernde Lösung scheitern und eine richtige Lösung alle fünf Kursfälle besteht. Vier Tests mit einem nachgebildeten VS-Code-API prüfen Taskargumente, Arbeitsordner mit Leerzeichen, Workspace-Vertrauen, fehlende Kursdateien und abgebrochenes Speichern.
- Die VSIX-Datei wurde mit @vscode/vsce gebaut. Ihr Erweiterungscode stimmt mit der Quelle überein. Die VSIX wurde nicht in das aktive VS-Code-Profil des Benutzers installiert.
- Anki 26.09.4: Das offizielle x86_64-Archiv wurde in /tmp geprüft. install.sh und uninstall.sh bestätigen /usr/local/share/anki und /usr/local/bin/anki. Der Installer selbst wurde nicht ausgeführt. Keine Prüfung der GUI oder des echten Wiederholungsverlaufs.
- js-parsons: Die im Kapitel erzeugte eigene HTML-Seite wurde mit den tatsächlich mitgelieferten Bibliotheken in jsdom geladen. Der Prüfknopf meldet für eine leere Lösung einen Fehler und für die korrekt eingeordneten Zeilen Erfolg. Die Maus-/Touch-Geste wurde nicht in einem realen Browser getestet.
- kurs-lernen.js: Fünf Tests in jsdom prüfen falsche/richtige Vorhersage, Reihenfolge und Freischaltung über die tatsächlichen Schaltflächen, Kartenbewertung, Speicherung, Neuladen, bestätigtes Zurücksetzen, Fälligkeiten sowie kaputten/gesperrten Speicher. Kein FSRS wird implementiert oder behauptet. Die visuelle Darstellung in einem echten Browser wurde nicht geprüft.
- Beide ZIP-Archive wurden auf Lesbarkeit geprüft; jede enthaltene Quelldatei stimmt mit der Datei unter beispiele/ überein. Keine temporären Abhängigkeiten oder Python-Bytecodeverzeichnisse sind enthalten.
- Webkonten, Abonnements, GitHub-Repositorys und IDE-Plugins wurden nicht angelegt, gebucht oder installiert. Zugriff auf konkrete kostenlose oder bezahlte Kurse wurde nicht mit einem Konto getestet.

Die Prüfungen liefen mit Python 3.14.8, Node.js 25.9.0 und einem vorhandenen neueren Rust auf dem Arbeitsrechner. Sie ersetzen keinen vollständigen Test auf einer frischen Ubuntu-26.04-Installation. Es wurden keine apt-Pakete installiert und keine dauerhaften Dienste eingerichtet.

## Prüfungen wiederholen

Die folgenden Befehle starten nur die lokalen Eigenbauprüfungen aus dem Repository-Hauptverzeichnis:

```bash
python3 pruefungen/test-kurs-pruefer.py
```

```bash
node pruefungen/test-kurs-pruefer.cjs
```

Für die Oberflächentests ist jsdom erforderlich. In dieser Sitzung wurde es ausschließlich unter /tmp/kurs-pruefer-tools installiert:

```bash
NODE_PATH=/tmp/kurs-pruefer-tools/node_modules node pruefungen/test-kurs-lernen.mjs
```
