# GitHub Codespaces

GitHub Codespaces stellt eine entfernte Entwicklungsumgebung mit Editor und Terminal bereit.

Auf Ubuntu wird dafür kein Server installiert. Die Umgebung läuft bei GitHub und verwendet dort [Development Container](https://docs.github.com/en/codespaces/overview). Wenn deine Container-Vorgabe auch entfernte Dienste ausschließt, überspringe dieses Angebot.

Persönliche GitHub-Free-Konten enthalten laut [Abrechnungsdokumentation](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces) monatlich 120 Kernstunden und 15 GB-Monate Speicher. Zwei Kerne verbrauchen somit das Zeitkontingent nach etwa 60 Laufzeitstunden. Nach Verbrauch ist weitere Nutzung kostenpflichtig, sofern Zahlungsart und Budget dies erlauben; ohne Zahlungsart wird sie gesperrt. Organisationskonten haben andere Regeln. Stand: 14. November 2026; prüfe vor dem Anlegen die aktuellen Angaben in deinem Konto.

## Einrichten

1. Melde dich im Browser bei GitHub an. Du brauchst ein eigenes Konto, weil Umgebung und Abrechnung einem Konto zugeordnet werden.

2. Prüfe in deinen Kontoeinstellungen den Bereich **Billing and licensing** und die Codespaces-Budgets. Richte eine Ausgabensperre ein, falls du keine kostenpflichtige Nutzung möchtest; eine reine Benachrichtigung ist keine Sperre.

3. Öffne ein Repository, auf das du Zugriff hast. Für den Einstieg eignet sich ein kleines eigenes Lernprojekt.

4. Öffne **Code → Codespaces → Create codespace** für den gewünschten Branch. Verwende eine kleine Maschine, um das Freikontingent zu schonen.

5. Warte, bis der Webeditor und das Terminal bereitstehen. Pakete werden in dieser entfernten Umgebung installiert, nicht auf deinem Ubuntu-Rechner.

## Prüfen

1. Führe im Codespaces-Terminal den folgenden Befehl aus. Die Ausgabe beschreibt die entfernte Linux-Umgebung.

   ```bash
   cat /etc/os-release
   ```

2. Prüfe auf der [Codespaces-Seite](https://github.com/codespaces), ob deine Umgebung als laufend erscheint.

3. Stoppe die Umgebung dort über deren Menü, sobald du sie nicht mehr verwendest. Das Schließen des Tabs garantiert keinen sofortigen Stopp; gespeicherte Umgebungen belegen weiter Speicher.

## Entfernen

1. Sichere Änderungen durch Commit und Push oder durch einen Download. Ungesicherte Dateien gehen beim Löschen verloren.

2. Lösche den Codespace auf der Codespaces-Seite über sein Menü. Dadurch wird die entfernte Umgebung entfernt.

3. Prüfe, dass sie aus der Liste verschwunden ist. Bereits entstandener Verbrauch wird dadurch nicht rückwirkend aufgehoben; weitere Codespaces und Prebuilds sind getrennt zu prüfen.

Eine lokale Deinstallation ist bei reinem Browserzugang nicht erforderlich.
