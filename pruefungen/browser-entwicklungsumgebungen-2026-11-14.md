# Prüfung: Browserterminals und Entwicklungsumgebungen

Stand: 14. November 2026.

## Umfang und Quellenvergleich

Die acht folgenden Kapitel wurden einzeln redaktionell auf erkennbare wörtliche Übernahmen, enge Paraphrasen und übersetzte Fremdpassagen mit den jeweils im Kapitel verlinkten offiziellen Quellen verglichen.

| Datei | Vergleichsgrundlage | Auffällige Passagen |
|---|---|---|
| src/browser-entwicklungsumgebungen.md | Eigene Zusammenstellung der sieben Einzelkapitel | Keine festgestellt |
| src/xterm-node-pty.md | xterm.js Download und Sicherheit; node-pty README | Keine festgestellt |
| src/ttyd.md | ttyd README und MIT-Lizenz; Ubuntu Resolute-Paketseite | Keine festgestellt |
| src/code-server.md | Coder Installation, sicherer Zugriff und MIT-Lizenz | Keine festgestellt |
| src/github-codespaces.md | GitHub Übersicht und Codespaces-Abrechnung | Keine festgestellt |
| src/tljh.md | TLJH Systemanforderungen, Custom Server, Konfiguration, FirstUse, HTTPS und Installer-Eingriffe | Keine festgestellt |
| src/zero-to-jupyterhub.md | Offizielle Z2JH-Dokumentation und Projekt-Repository | Keine festgestellt |
| src/vscode-dev.md | Microsoft VS Code for the Web | Keine festgestellt |

Erklärungen, Gliederung, Vergleichstabelle und Terminal-Beispiel wurden eigenständig erstellt. Technisch notwendige Befehle und API-Bezeichner sind als solche gekennzeichnet.

Trefferliste: Im genannten Umfang keine auffälligen Textstellen festgestellt; keine Fundstellen mit vermuteter Quelle und Schweregrad zu melden. Eine vollständige Rechtefreiheit gegenüber allen fremden Werken kann diese begrenzte Prüfung nicht beweisen. Bestehende andere Kapitel sind von dieser Prüfung nicht erfasst. Keine Freigabe für das gesamte Buch und keine Veröffentlichung.

## Technische Grenzen

Die offiziellen Quellen wurden am genannten Datum geprüft. ttyd ist als Universe-Paket für Ubuntu 26.04/Resolute nachgewiesen. TLJH nennt aktuelle Ubuntu-LTS-Systeme als Ziel; daraus wird keine erfolgreich getestete Installation abgeleitet.

Die Anleitungen installieren keine Software auf dem Arbeitsrechner. apt-Installationen, native npm-Builds, echte Browserinteraktion, die TLJH-Erstinstallation, TLS-Ausstellung und Cloud-Kontovorgänge wurden nicht ausgeführt. Die Schritte für Zero to JupyterHub erklären die Unvereinbarkeit mit der Container-Vorgabe; sie installieren keinen Cluster.

Die Ergebnisse der lokalen Struktur-, Syntax- und mdBook-Prüfung werden nach Ausführung ergänzt.

## Lokale Prüfergebnisse

- Alle acht neuen Kapitel sind in SUMMARY.md eingetragen.
- Bash-Codeblöcke bestehen bash -n; der eigene Servercode besteht node --check.
- git diff --check ist erfolgreich.
- mdbook build ist erfolgreich; Ausgabe unter book/.
