# Prüfung der Dokumentations- und Editoranleitungen

Stand: 14.11.2026. Gegenstand: `src/doku-editoren.md`, `src/marked.md`, `src/monaco.md`, `src/codemirror.md` sowie die ergänzten Stellen in `src/mdbook.md`, `src/starlight.md`, `src/docusaurus.md`, `src/vitepress.md` und `src/hugo.md`. Das bestehende Kapitel `src/judge0.md` wurde zur Einordnung gelesen und unverändert belassen.

## Textprüfung

Die neu geschriebenen Abschnitte wurden einzeln mit den jeweils im Kapitel verlinkten offiziellen Dokumentationen verglichen. Geprüft wurden die Einleitungen, Erklärungen zu den Schritten, Einschränkungen sowie die Beispiele. Es wurden keine auffälligen wörtlichen Übernahmen, eng angelehnten Paraphrasen oder übersetzten Passagen festgestellt. Die kurzen API-Aufrufe und Paketbefehle ergeben sich aus den verwendeten Schnittstellen. Die Beispielinhalte und der Ablauf wurden für diese Anleitungen zusammengestellt.

Trefferliste: keine auffälligen Textstellen im geprüften Umfang. Deshalb waren keine Überarbeitungen aufgrund eines konkreten Texttreffers erforderlich. Lizenzhinweise und Quellen stehen in den einzelnen Kapiteln. Für den eigenen Generator wird ausdrücklich zwischen der Lizenz von marked und einer vom Autor selbst zu vergebenden Lizenz unterschieden.

Diese begrenzte redaktionelle Prüfung belegt keine vollständige Rechtefreiheit gegenüber sämtlichen möglichen Quellen. Eine Prüfung aller übrigen Buchkapitel und eine Freigabe zur Veröffentlichung sind nicht erfolgt. Es wurde nichts veröffentlicht.

## Technische Prüfung

- mdBook baut das gesamte Buch erfolgreich; Warnung wegen des großen Suchindex.
- Die drei neuen JavaScript-Beispiele bestehen die Syntaxprüfung mit `node --check`.
- Installationsbefehle für das Ubuntu-System wurden nicht ausgeführt. Insbesondere wurde kein Judge0-Dienst installiert.
- Die interaktive Bedienung im Browser sowie Mobilgeräte wurden nicht geprüft.

- Die Beispiele wurden aus den Markdown-Codeblöcken in einen temporären Ordner übernommen: marked erzeugt erfolgreich `dist/index.html`; Monaco 0.57.0 und CodeMirror 6 bauen mit Vite 8.3.8 erfolgreich. Vite meldet große JavaScript-Dateien, jedoch keine Baufehler. Diese Prüfung lief mit Node.js 25.9.0 auf dem Arbeitsrechner, nicht auf einem frisch installierten Ubuntu 26.04.
