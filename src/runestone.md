# Runestone

Runestone stellt interaktive Lehrbücher, Aufgaben und Kursverwaltung bereit.

Für Ubuntu 26.04 LTS auf amd64. Der aktuelle offizielle Serverweg verwendet Docker Compose. Er widerspricht der Vorgabe dieses Buchs, direkt ohne Container zu installieren. Deshalb wird hier kein vollständiger Runestone-Server eingerichtet.

## Installation

### 1. Offiziellen Betriebsweg prüfen

Die [Serveranleitung](https://docs.runestone.academy/en/latest/running.html) beschreibt mehrere gemeinsam betriebene Dienste und eine Datenbank. Ein einzelnes Python-Paket ersetzt diesen Verbund nicht.

### 2. Native Voraussetzungen bewerten

Für einen eigenen nativen Aufbau müssten Datenbank, Webanwendungen, Hintergrundaufgaben, Proxy und Verwaltung zusammen portiert und unter Ubuntu 26.04 getestet werden. Eine belegte vollständige Anleitung liegt hier dafür nicht vor. Die [Entwicklerdokumentation](https://docs.runestone.academy/en/latest/building_servers.html) zeigt die beteiligten Komponenten.

## Installation prüfen

Es wurden keine Programme, Dienste oder Datenbanken eingerichtet. Eine spätere echte Inbetriebnahme müsste Anmeldung, Buchbau, Kurszuordnung, Aufgabenbearbeitung und Speicherung der Ergebnisse gemeinsam prüfen.

## Deinstallieren

Es gibt aus diesem Kapitel nichts zu entfernen. Insbesondere werden keine bestehenden Python-Umgebungen oder Datenbanken verändert.

## Quellen und Lizenz

[Runestone-Dokumentation](https://docs.runestone.academy/en/latest/running.html). Runestone besteht aus mehreren Open-Source-Komponenten; prüfe die Lizenz der konkret verwendeten Repositorys und die gesonderten Rechte an den Lehrbuchinhalten.
