# Prüfung der Code-Runner-Anleitungen

Stand: 14. November 2026.

Geprüft wurden die Änderungen an judge0.md, piston.md, jobe.md, isolate.md sowie die neuen Kapitel bubblewrap-systemd-run.md und code-runner.md. Die neuen Erklärungen und Beispiele wurden eigenständig verfasst und mit den jeweils verlinkten offiziellen Dokumentationen verglichen. Keine auffälligen Textübernahmen festgestellt; keine Fundstellen mit vermuteter Quelle und Schweregrad zu melden. Diese begrenzte redaktionelle Prüfung garantiert keine vollständige Rechtefreiheit gegenüber allen Quellen. Eine Veröffentlichung oder Freigabe des gesamten Buchs erfolgt nicht.

Die ausdrückliche neue Docker-Auswahl wurde für Judge0 und Piston übernommen. Judge0 CE 1.13.1 bleibt wegen cgroup v1 auf Ubuntu 26.04 unbestätigt; systemd 258 entfernte die Unterstützung, Ubuntu 26.04 verwendet systemd 259. Piston wurde anhand der offiziellen Compose-Konfiguration und Paket-/Ausführungs-API beschrieben. Die native Jobe-/Isolate-Anleitung wurde erhalten und um Lizenzangaben ergänzt.

Alle Bash-Codeblöcke der betroffenen Kapitel und das eigene Runner-Skript bestehen die Shellsyntaxprüfung. Der mdBook-Bau wird nach diesen Änderungen ausgeführt. Ein Docker-Start, die Installation von Paketen sowie ein echter Test von bubblewrap innerhalb eines systemd-Benutzerservice wurden hier nicht ausgeführt. Die im Kapitel beschriebenen Positiv- und Negativtests sind deshalb vor Nutzung auf dem Zielrechner notwendig. Es wurden keine Host-Bootparameter geändert, keine Docker-Container gestartet und keine Systemdienste installiert.

Nachprüfung: mdBook-Bau erfolgreich, nur die bekannte Suchindexgrößenwarnung. JSON-Nutzdaten der curl-Beispiele wurden zusätzlich geparst und die darin enthaltenen Python-Programme auf Syntax geprüft. Die Stop-Frist des eigenen Runners beträgt eine Sekunde nach Ablauf des Laufzeitlimits.
