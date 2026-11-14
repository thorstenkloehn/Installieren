# Ausführbare Lernmaterialien

Diese Übersicht führt zu den Anleitungen für interaktive Kurse, Notizbücher und lokale Labs auf Ubuntu 26.04 LTS (amd64).

## Anleitung auswählen

1. Wähle die Art der Lernmaterialien. Die Kapitel enthalten Installation, ein Einstiegsbeispiel, Funktionsprüfung und Entfernung. Wo die Vorgabe ohne Container keinen belegten vollständigen Installationsweg zulässt, wird diese Grenze ausdrücklich beschrieben.

   | Werkzeug | Wo läuft der Beispielcode? | Anleitung |
   |---|---|---|
   | Judge0 | Server; offizieller Bereitstellungsweg mit Docker | [Stand der nativen Installation](judge0.md) |
   | Codapi | JavaScript im Browser; Cloud und Server gesondert erklärt | [Widget lokal einrichten](codapi.md) |
   | LiaScript | Kursdarstellung im Browser; Ausführung abhängig vom Kurs | [devserver](liascript.md) |
   | Hyperbook | Abhängig von der verwendeten interaktiven Komponente | [Arbeitsheft](hyperbook.md) |
   | Pyodide-MkDocs-Theme | Python im Browser | [MkDocs-Übungen](pyodide-mkdocs-theme.md) |
   | Slidev | Präsentation und unterstützte Demos im Browser | [Folien](slidev.md) |
   | marimo | Lokal auf Ubuntu; nach WASM-Export im Browser | [Python-Notizbuch](marimo.md) |
   | Runestone | Serververbund; offizieller Weg mit Docker Compose | [Installationsgrenze](runestone.md) |
   | Quarto Live | Python oder R im Browser | [Quarto-Erweiterung](quarto-live.md) |
   | Runme | Befehle direkt auf Ubuntu | [Lokales Lab](runme.md) |
   | Livebook | Elixir auf dem Ubuntu-Rechner | [Lokaler Server](livebook.md) |
   | MyST | Buchdarstellung; Rechnen benötigt zusätzliche Umgebung | [Dokumentationsprojekt](myst.md) |
   | Jupyter Book 2 | Lokales Jupyter; alternativ externer Notebookdienst | [Buch und Notebook](jupyter-book.md) |
   | Docusaurus Live Codeblock | React im Browser | [React-Demo](docusaurus-live-codeblock.md) |
   | Google Codelabs Tools | Schrittweise Anleitung; kein allgemeiner Rechenkernel | [Archivierte CLI](google-codelabs.md) |

2. Folge dem verlinkten Kapitel in einem eigenen Projektordner. Lokale Vorschauen beendest du mit **Strg + C**. Die Beispiele sollen zuerst auf dem eigenen Rechner funktionieren.

3. Prüfe das jeweilige Beispiel auch im Browser. Ein erfolgreicher Buchbau bestätigt die erzeugten Dateien, aber noch nicht die Ausführung von Python, React oder anderen Laufzeiten auf dem Lesergerät.

Bei Binder, JupyterHub und Colab ist der Dienst getrennt vom Buchgenerator zu betrachten. Die [Jupyter-Book-Anleitung](jupyter-book.md) erklärt die Übergabe einer Notebookdatei und setzt keinen externen Dienst auf.

Die Anleitungen veröffentlichen keine Inhalte und richten keine allgemein zugänglichen Ausführungsdienste ein. Für Judge0 bleibt die bereits dokumentierte fehlende belegte native Installation bestehen.
