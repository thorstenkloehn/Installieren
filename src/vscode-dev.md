# vscode.dev

vscode.dev ist ein kostenlos nutzbarer Browsereditor für lokale Dateien und entfernte Repositorys.

Eine lokale Serverinstallation entfällt. Die reine Weboberfläche hat keine eigene Betriebssystem-Shell und ersetzt daher keine Ausführungsumgebung. Remote-Verbindungen sind zusätzliche Betriebsarten. Einzelne Web-Erweiterungen können Vorschauen oder Ausführung im Browser ermöglichen. Details erläutert [Visual Studio Code for the Web](https://code.visualstudio.com/docs/remote/vscode-web); für den Dienst gelten die Microsoft-Nutzungsbedingungen.

## Verwenden

1. Öffne die Adresse in einem aktuellen Browser auf Ubuntu.

   ```text
   https://vscode.dev
   ```

2. Wähle **Datei → Datei öffnen** und öffne eine lokale Übungsdatei. Ein Konto ist für diesen lokalen Einstieg nicht nötig.

3. Erlaube dem Browser den Zugriff auf diese Datei. Nur so kann der Editor ihren Inhalt lesen und gegebenenfalls zurückschreiben.

4. Ändere eine Zeile und speichere über **Datei → Speichern**. Falls dein Browser keinen direkten Schreibzugriff unterstützt, lade die Datei herunter und wähle bewusst den Zielpfad. Ordnerzugriff hängt ebenfalls vom Browser ab.

## Prüfen

1. Öffne die gespeicherte beziehungsweise heruntergeladene Datei mit einem lokalen Editor. Die geänderte Zeile muss dort sichtbar sein.

2. Prüfe vor der Auswahl einer Erweiterung, ob sie als Web-Erweiterung nutzbar ist. Eine für Desktop-VS-Code entwickelte Erweiterung muss hier nicht funktionieren.

## Entfernen

1. Sichere noch offene Änderungen als Dateien. Nicht gespeicherte Editorinhalte sind keine Datensicherung.

2. Entferne gegebenenfalls die installierte Web-App über das App-Menü deines Browsers. Das betrifft nur eine zuvor als App eingerichtete Verknüpfung.

3. Lösche bei Bedarf die Websitedaten von `vscode.dev` in den Browsereinstellungen. Dabei gehen dort gespeicherte Einstellungen verloren; gesicherte lokale Dateien bleiben bestehen.

4. Prüfe im Browser die Liste installierter Web-Apps. Bei Nutzung als gewöhnlicher Tab ist keine Ubuntu-Deinstallation nötig.
