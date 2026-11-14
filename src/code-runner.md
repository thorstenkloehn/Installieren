# Code-Ausführungsdienste und Sandboxes

Diese Übersicht führt zu den Anleitungen für Ubuntu 26.04 LTS (amd64).

1. Wähle einen HTTP-Ausführungsdienst oder eine lokale Sandbox.

   | Werkzeug | Betriebsart | Anleitung |
   |---|---|---|
   | Judge0, GPL-3.0 | Offiziell Docker; CE 1.13.1 benötigt cgroup v1 und ist auf dem vorgesehenen Host nicht als funktionierende Installation belegt | [Kompatibilitätsgrenze](judge0.md) |
   | Piston, MIT | Docker mit cgroup v2; lokal gebundene API | [Piston](piston.md) |
   | Jobe, MIT | Apache/PHP direkt auf Ubuntu; Docker nicht erforderlich | [Jobe](jobe.md) |
   | Isolate, GPL-2.0-or-later | Direkte Sandboxinstallation über APT | [Isolate](isolate.md) |
   | bubblewrap und systemd-run | Eigener lokaler Python-Runner ohne Docker | [Runner](bubblewrap-systemd-run.md) |

2. Folge der jeweiligen Anleitung. Die dortigen Ausführungstests sind nötig, weil ein gestarteter Server noch keine funktionierenden Sandboxlimits beweist.

3. Entferne den Aufbau bei Bedarf mit den Deinstallationsschritten des jeweiligen Kapitels. Entferne systemd nicht von Ubuntu.

Die ausdrückliche Docker-Auswahl gilt hier für Judge0 und Piston. Die nativen Wege für Jobe und Isolate bleiben erhalten. Keiner der lokalen Einstiege richtet eine öffentliche, authentifizierte Mehrbenutzerplattform ein.
