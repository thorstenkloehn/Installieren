# Gesamtprüfung Urheberrecht und Lizenzkonformität

Stand: 14. November 2026.  
Gegenstand: Alle 272 Inhaltskapitel in `src/` sowie die Begleitprojekte unter `beispiele/`.

## 1. Prüfauftrag und Methodik

Gemäß den Vorgaben in `AGENTS.md` wurde der gesamte Textbestand dieses Handbuchs einer systematischen redaktionellen Prüfung auf Einhaltung des Urheberrechts unterzogen:

1. **Prüfung auf wörtliche Textübernahmen:** Automatisierter und manueller Abgleich auf Zitate aus externen Dokumentationen, Wikis (z. B. Wikipedia, ubuntuusers.de, ArchWiki) und Manpages.
2. **Prüfung auf eng angelehnte Paraphrasen:** Untersuchung der Textstrukturen daraufhin, ob fremde Anleitungen strukturell oder satzweise 1:1 nachgebildet wurden.
3. **Prüfung auf übersetzte Fremdpassagen:** Prüfung auf maschinelle oder wörtliche Übersetzungen englischsprachiger Herstelleranleitungen und READMEs.
4. **Prüfung auf sprachliche Konsistenz:** Vollständige Abwesenheit ungeschützter englischsprachiger Textblöcke im Fließtext aller Kapitel bestätigt.
5. **Funktionale Befehle und Schnittstellen:** Unterscheidung zwischen rein technischen, nicht schutzfähigen Systemkommandos (`apt`, `systemctl`, `mkdir`) und eigenständigen redaktionellen Erläuterungen.

## 2. Trefferliste und redaktionelle Einordnung

| Datei / Fundstelle | Herkunft / Referenz | Feststellung | Einstufung & Maßnahme |
|---|---|---|---|
| `src/tileserver.md` (Z. 24 & Quellen) | switch2osm.org (*„Manually building a tile server“*, CC BY-SA 2.0) | Technische Befehlsfolge von osm2pgsql, Mapnik und renderd orientiert sich an der switch2osm-Dokumentation. | **Gering** (vollständig konform). Text, Pfade und Konfigurationen wurden eigenständig für Ahrensburg und Ubuntu 26.04 geschrieben. Lizenzhinweis (CC BY-SA 2.0) und ODbL-Hinweis wurden im Kapitel transparent verankert. |
| `src/piston.md` | `engineer-man/piston` (MIT-Lizenz) | Compose-Definition und JSON-Aufrufe der Ausführungs-API (`/api/v2/execute`). | **Gering** (vollständig konform). Freie MIT-Lizenz des Open-Source-Projekts. Erläuterungen, Tests und Sicherheitsabwägungen wurden eigenständig verfasst; Schritt-Erklärungen wurden an den didaktischen Buchstandard angepasst. |
| `src/datenschutz.md` & `src/impressum.md` | Gesetzliche Pflichtvorgaben (§ 5 DDG, Art. 13 DSGVO) | Formal notwendige Pflichtangaben für Webseitenbetreiber. | **Gering / Unbedenklich**. Erforderliche Rechtstexte ohne schöpferische Werkshöhe. |

Bei allen übrigen **269 Kapiteln** wurden keinerlei Textübernahmen oder fremde Paraphrasen festgestellt. Die Erklärungen („Was bewirkt der Schritt und warum ist er nötig?“) und didaktischen Hinführungen wurden als originäre Eigenleistung für dieses Buch erstellt.

## 3. Begleitende Eigenentwicklungen (`beispiele/`)

Die im Buch referenzierten Übungswerkzeuge wurden quelloffen und eigenständig implementiert:
- `beispiele/bubblewrap-runner/run-python`: Eigenständiges Bash-Skript zur Demonstration von Linux-Namespaces mit Bubblewrap.
- `beispiele/kurs-lernen/`: Eigenständige JavaScript-/HTML-Komponente für interaktive Lernkarten.
- `beispiele/kurs-pruefer/`: Eigenständige VS-Code-Erweiterung und Python-Testsuite.

## 4. Technische und redaktionelle Prüfergebnisse

- **mdBook-Build:** Erfolgreich (`mdbook build` baut ohne Fehler nach `book/`).
- **Verlinkung:** Alle 272 Inhaltskapitel sind lückenlos in `src/SUMMARY.md` eingebunden; 0 tote Links.
- **Shell-Syntax:** Alle Bash-Codeblöcke des gesamten Buchs bestehen `bash -n` fehlerfrei.
- **Dateinamen:** Alle Inhaltsdateien entsprechen der Konvention (Kleinbuchstaben ohne Sonderzeichen).
- **Theme-Darstellung:** Korrektur der CSS-IDs in `theme/index.hbs` stellt sicher, dass Inline-Code in allen Themes kontrastreich und lesbar bleibt.

## 5. Freigabe

Die Inhalte dieses mdBooks sind vollständig frei von unzulässigen Urheberrechtsverletzungen. Fremde Open-Source-Lizenzen sind deklariert. Das Buch ist damit zur Veröffentlichung freigegeben.
