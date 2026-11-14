# Terminals und Entwicklungsumgebungen im Browser

Diese Übersicht hilft bei der Auswahl eines Browserterminals, eines Editors oder eines gemeinsamen Notebook-Servers.

Stand: 14. November 2026. Zielsystem der lokalen Anleitungen: Ubuntu 26.04 LTS, amd64. Die Kapitel installieren keine Software auf dem Arbeitsrechner, sondern beschreiben die Schritte für deine spätere Einrichtung.

| Werkzeug | Wo läuft die Arbeit? | Einrichtung unter diesen Vorgaben |
|---|---|---|
| [xterm.js mit node-pty](xterm-node-pty.md) | Shell auf deinem Ubuntu-Rechner | Eigenes lokales Beispielprogramm |
| [ttyd](ttyd.md) | Shell auf deinem Ubuntu-Rechner | Direkt mit apt |
| [code-server](code-server.md) | Editor und Terminal auf deinem Ubuntu-Rechner | Offizielles DEB-Paket |
| [GitHub Codespaces](github-codespaces.md) | Bei GitHub | Browserzugang; Container beim Anbieter |
| [The Littlest JupyterHub](tljh.md) | Eigener Ubuntu-Server | Direktinstallation auf einem separaten System |
| [Zero to JupyterHub](zero-to-jupyterhub.md) | Kubernetes-Cluster | Benötigt Container und entfällt daher lokal |
| [vscode.dev](vscode-dev.md) | Editor im Browser | Ohne lokale Installation, ohne eigene Shell |

## Auswahl in drei Schritten

1. Entscheide, ob du nur Dateien bearbeiten oder auch Programme ausführen möchtest. Für Dateibearbeitung genügt vscode.dev; ein Terminal braucht zusätzlich eine Ausführungsumgebung.

2. Entscheide, ob die Ausführung auf deinem Rechner oder bei einem Anbieter stattfinden soll. Für einen unkomplizierten lokalen Terminalzugang eignet sich ttyd; code-server ergänzt einen vollständigen Editor. xterm.js ist für eigene Anwendungen gedacht.

3. Plane bei mehreren Personen getrennte Konten und ausreichend Rechenleistung. TLJH ist für kleinere Gruppen gedacht; rund 100 Personen sind ein Orientierungswert, keine Zusage für gleichzeitige rechenintensive Sitzungen.

Kostenlose Software verursacht gegebenenfalls Hardware-, Betriebs- und Administrationskosten. Kostenlose Webdienste unterliegen eigenen Nutzungsbedingungen. Lizenzangaben und offizielle Quellen stehen in den Einzelkapiteln.

## Prüfung und Entfernen

1. Prüfe im ausgewählten Einzelkapitel den vorgesehenen Funktionstest. Ein sichtbarer Editor allein belegt noch keine funktionierende Shell.

2. Verwende zum Entfernen die dortigen Schritte. Bei Cloud-Diensten müssen gespeicherte Umgebungen beim Anbieter gelöscht werden; ein geschlossener Browser-Tab reicht dafür nicht aus.
