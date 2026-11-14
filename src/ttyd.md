# ttyd

ttyd stellt eine Shell über eine Webseite bereit.

Das Projekt steht unter [MIT](https://github.com/tsl0922/ttyd/blob/main/LICENSE). Ubuntu 26.04 führt ttyd in [Universe](https://packages.ubuntu.com/resolute/ttyd). Hier läuft es ausschließlich lokal und mit den Rechten deines normalen Benutzerkontos. Jede Person mit Zugriff auf diese Sitzung kann dessen Dateien und Programme verwenden.

## Einrichten

1. Aktualisiere die Paketlisten, damit apt die verfügbaren Versionen kennt.

   ```bash
   sudo apt update
   ```

2. Prüfe, ob ein Installationskandidat vorhanden ist.

   ```bash
   apt policy ttyd
   ```

   Falls kein Kandidat erscheint, aktiviere zuerst in „Anwendungen & Aktualisierungen“ die Paketquelle Universe und wiederhole Schritt 1.

3. Installiere das Ubuntu-Paket.

   ```bash
   sudo apt install ttyd
   ```

4. Prüfe die Programmversion.

   ```bash
   ttyd --version
   ```

5. Starte ein beschreibbares Browserterminal. Die Bindung an die Loopback-Adresse verhindert direkte Netzwerkzugriffe; die Origin-Prüfung erschwert Zugriffe aus fremden Webseiten. Starte diesen Befehl ohne sudo.

   ```bash
   ttyd -i 127.0.0.1 -p 7681 -O -W bash
   ```

   Die Optionen sind in der [Projektbeschreibung](https://github.com/tsl0922/ttyd) erläutert. Ohne `-W` bleibt das Terminal bei dieser Version schreibgeschützt.

6. Öffne die lokale Adresse im Browser desselben Rechners.

   ```text
   http://127.0.0.1:7681
   ```

## Prüfen

1. Führe im Browserterminal diesen Befehl aus. Die Ausgabe sollte deinen Ubuntu-Benutzernamen zeigen.

   ```bash
   whoami
   ```

2. Beende ttyd mit **Strg+C** im ursprünglichen Terminal. Die Browserverbindung soll abbrechen.

## Deinstallieren

1. Beende einen noch laufenden ttyd-Prozess mit **Strg+C** im Startterminal.

2. Entferne das Paket. Dateien, die du über die Shell angelegt hast, bleiben erhalten.

   ```bash
   sudo apt remove ttyd
   ```

3. Prüfe den Paketstatus. Eine Meldung über ein nicht installiertes Paket oder ein Status ohne „installed“ ist nach dem Entfernen zu erwarten.

   ```bash
   dpkg-query -W -f='${Status}\n' ttyd
   ```
