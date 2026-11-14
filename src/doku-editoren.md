# Dokumentation und Browsereditoren

Diese Übersicht führt zu den Installationsanleitungen für Dokumentationsgeneratoren, Browsereditoren und einen Dienst zur Programmausführung auf Ubuntu 26.04 LTS (amd64).

## Passende Anleitung öffnen

1. Wähle einen Generator für deine Dokumentation. Jeder Link führt zu einer eigenen Anleitung mit Installation, Vorschau, Prüfung und Entfernung.

   | Werkzeug | Zweck | Anleitung |
   |---|---|---|
   | mdBook | Markdown als Buch mit Kapitelstruktur | [mdBook](mdbook.md) |
   | Astro mit Starlight | Dokumentationswebsite mit fertiger Oberfläche | [Starlight](starlight.md) |
   | Eigener Generator mit marked | Kleiner eigener Bauablauf für eine HTML-Seite | [marked](marked.md) |
   | Docusaurus | Dokumentation mit React-Komponenten | [Docusaurus](docusaurus.md) |
   | VitePress | Dokumentation auf Basis von Vue und Vite | [VitePress](vitepress.md) |
   | Hugo | Statische Website mit separat gewähltem Theme | [Hugo](hugo.md) |

2. Wähle bei Bedarf einen Browsereditor. Die Beispiele richten eigenständige lokale Demo-Projekte ein. Die Einbindung in den gewählten Generator ist ein weiterer Entwicklungsschritt.

   | Editor | Einsatz | Anleitung |
   |---|---|---|
   | Monaco | Quelltexteditor für Desktopbrowser; Mobilbrowser werden nicht unterstützt | [Monaco](monaco.md) |
   | CodeMirror 6 | Erweiterbarer Editor; Bedienung auch auf Zielmobilgeräten prüfen | [CodeMirror 6](codemirror.md) |

3. Lies für die Ausführung von Quellcode das Kapitel [Judge0](judge0.md). Es dokumentiert die fehlende belegte native Installation für Ubuntu 26.04. Der offizielle Weg verwendet Docker und erfüllt damit die Vorgabe dieses Buchs nicht. Ein Editor allein führt keinen Code aus.

Die Programme werden direkt auf dem Rechner beziehungsweise als npm-Pakete im Benutzerprojekt eingerichtet. Die lokalen Vorschauen sind zum Prüfen vorgesehen. Eine öffentliche Bereitstellung und die Kopplung von Editor, Dokumentation und Ausführungsdienst sind in diesen Einzelanleitungen nicht eingerichtet.
