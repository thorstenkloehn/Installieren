# Prüfung: interaktive Lernmaterialien

Prüfdatum: 14. November 2026.

## Umfang

Einzeln geprüft wurden die neu angelegten Kapitel `src/interaktive-lernmaterialien.md`, `src/codapi.md`, `src/liascript.md`, `src/hyperbook.md`, `src/pyodide-mkdocs-theme.md`, `src/slidev.md`, `src/marimo.md`, `src/runestone.md`, `src/quarto-live.md`, `src/runme.md`, `src/livebook.md`, `src/myst.md`, `src/jupyter-book.md`, `src/docusaurus-live-codeblock.md` und `src/google-codelabs.md`. Das bestehende Judge0-Kapitel wurde zur Einordnung gelesen, nicht geändert. Vorhandene Änderungen an anderen Kapiteln wurden erhalten.

## Text- und Quellenprüfung

Pro Kapitel wurden die Einleitung, die Schrittbegründungen, das Beispiel und die Einschränkungen mit den im jeweiligen Kapitel verlinkten offiziellen Quellen abgeglichen. Die Formulierungen und eigenen kleinen Lernbeispiele wurden für dieses Buch geschrieben. Technisch vorgegebene Paketnamen, CLI-Befehle und API-Bezeichner sind entsprechend erkennbar. Lizenztexte wurden nicht in die Kapitel kopiert. Von Werkzeugen erzeugte fremde Vorlagen lagen nur in temporären Prüfordnern; sie sind nicht als eigene Buchtexte übernommen worden.

| Kapitel | Vergleichsgrundlage | Auffällige Textstellen |
|---|---|---|
| Übersicht | Eigene Zusammenstellung der verlinkten Kapitel | Keine festgestellt |
| Codapi | Widget-Dokumentation, JavaScript-Beispiel, Serverinstallation | Keine festgestellt |
| LiaScript | devserver-README, Lizenzdatei des Interpreters | Keine festgestellt |
| Hyperbook | Offizieller Einstieg, CLI und Paketmetadaten | Keine festgestellt |
| Pyodide-MkDocs-Theme | Installation, Projektgenerator und Paketmetadaten | Keine festgestellt |
| Slidev | Einstieg und CLI | Keine festgestellt |
| marimo | Installation und WebAssembly-Export | Keine festgestellt |
| Runestone | Betrieb und Bau des Serververbunds | Keine festgestellt |
| Quarto Live | Installation und Paketunterstützung | Keine festgestellt |
| Runme | CLI-Installation, README und Go-Modul | Keine festgestellt |
| Livebook | Direkte Elixir-Installation und Ubuntu-Paketdaten | Keine festgestellt |
| MyST | Einstieg und CLI | Keine festgestellt |
| Jupyter Book | Installation v2, Website-Einstieg, Binder-, Hub- und Colab-Dokumentation | Keine festgestellt |
| Docusaurus Live Codeblock | Theme-Referenz und interaktive Codeblöcke | Keine festgestellt |
| Google Codelabs Tools | Archivstatus, claat-README und Formatbeispiel | Keine festgestellt |

Trefferliste: Im geprüften Umfang keine auffälligen Übernahmen festgestellt; deshalb keine Fundstellen mit vermuteter Quelle und Schweregrad zu melden. Dies ist eine begrenzte redaktionelle Prüfung, kein Nachweis vollständiger Rechtefreiheit gegenüber allen existierenden Quellen. Eine Prüfung und Veröffentlichungsfreigabe des gesamten Buchs ist damit nicht erfolgt. Es wurde nichts veröffentlicht.

Die Lizenz des Werkzeugs bestimmt nicht automatisch die Lizenz eigener Kursinhalte. Besonders die von Pyodide-MkDocs-Theme und Hyperbook erzeugten Rechteangaben müssen vom Autor geprüft werden; darauf weisen die Kapitel hin. Bei LiaScript sind Interpreter (BSD-3-Clause) und devserver (MIT) getrennt bezeichnet. Pyodide-MkDocs-Theme meldet GPL-3.0-or-later.

## Technische Prüfung

- Alle 15 neuen Kapitel stehen in SUMMARY.md; die lokalen Kapitellinks sind vorhanden.
- Sämtliche Bash-Codeblöcke der neuen Kapitel bestehen `bash -n`.
- mdBook baut das Buch. Es warnt wegen des großen Suchindex.
- Codapi 0.20.0: Die verwendeten CSS- und JavaScript-Dateien sind im installierten Paket vorhanden. Keine Browser-Ausführungsprüfung.
- LiaScript-devserver 1.2.23--2.6.3: Der Versionsaufruf funktioniert.
- Hyperbook 0.123.2: CLI-Assistent und Bau der erzeugten Vorlage erfolgreich, Ausgabe unter `.hyperbook/out`.
- Pyodide-MkDocs-Theme 5.7.2: Projektgenerator und MkDocs-Bau erfolgreich. Die drei beschriebenen Konfigurationswerte wurden gesetzt. Das Theme warnt über seine Bindung an MkDocs 1; die Vorlage verwendet außerdem eigene Rechteangaben.
- Slidev 53.1.0: Die im Kapitel enthaltenen Folien bauen erfolgreich.
- marimo 0.25.2 mit uv 0.13.8: WebAssembly-Export eines Notizbuchs mit der beschriebenen Summenrechnung erfolgreich. uv musste als zusätzliche Voraussetzung ergänzt werden.
- MyST 1.13.0: Die im Kapitel enthaltene Startseite und Konfiguration bauen zu HTML. Die Anforderung npm >=10 wurde durch eine lokale npm-11-Installation im Anleitungstext berücksichtigt, da Ubuntu 26.04 npm 9 liefert.
- Jupyter Book 2.1.7: Notebook aus dem Kapitel wird mit nbformat erzeugt; HTML-Bau erfolgreich. Das verwendete Buchdesign erzeugt eine Warnung über einen ignorierten Schlüssel. Kein Test eines externen Notebookdienstes.
- Docusaurus 3.10.2 mit React 19: Der Client- und Serverbau der beschriebenen MDX-Live-Seite ist erfolgreich.
- Runme, Livebook, Google Codelabs Tools und Quarto Live: Quellen- und Befehlsprüfung; kein vollständiger Installations- oder Laufzeittest, da die benötigten Laufzeiten beziehungsweise Quarto hier nicht eingerichtet wurden.
- Judge0 und Runestone: Keine Serverinstallation. Die Grenze des offiziellen Containerwegs ist dokumentiert.

Die Prüfungen verwendeten temporäre npm- und Python-Umgebungen mit Node.js 25.9.0 und Python 3.14.8 auf dem Arbeitsrechner. Node.js 25 erzeugte bei einer Abhängigkeit eine Warnung, weil nur gerade LTS-Versionen unterstützt werden; Ubuntu 26.04 verwendet Node.js 22. Die Ergebnisse sind kein vollständiger Test auf einer frischen Ubuntu-26.04-Installation. Interaktive Browserbedienung und Mobilgeräte wurden nicht getestet. Auf dem Arbeitsrechner wurden keine apt-Pakete installiert und keine dauerhaften Server eingerichtet.
