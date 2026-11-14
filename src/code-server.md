# code-server

code-server bietet einen auf VS Code basierenden Editor samt Terminal im Browser.

Der Quellcode steht unter [MIT](https://github.com/coder/code-server/blob/main/LICENSE). Die Anleitung verwendet das offizielle amd64-DEB und bindet den Dienst lokal. Erweiterungen haben eigene Lizenzen; das Erweiterungsangebot entspricht nicht vollständig dem Microsoft Marketplace.

## Einrichten

1. Aktualisiere die Paketlisten für die Paketinstallation.

   ```bash
   sudo apt update
   ```

2. Öffne die [offiziellen Veröffentlichungen](https://github.com/coder/code-server/releases) im Browser. Wähle eine stabile Veröffentlichung, um eine Vorabversion zu vermeiden.

3. Lade deren Datei `code-server_<VERSION>_amd64.deb` in deinen Downloadordner. Verwende das DEB für amd64, nicht das ARM-Paket.

4. Installiere genau diese Datei mit apt. Ersetze `<VERSION>` durch die tatsächlich heruntergeladene Versionsnummer; passe den Ordner an, falls dein Browser anders speichert.

   ```bash
   sudo apt install "$HOME/Downloads/code-server_<VERSION>_amd64.deb"
   ```

   Dieser Weg folgt der [Herstelleranleitung](https://coder.com/docs/code-server/install), verwendet aber apt zur Auflösung der Paketabhängigkeiten. Das einzelne DEB richtet keine automatische Versorgung mit künftigen Hersteller-Releases ein; installiere Aktualisierungen auf demselben Weg.

5. Prüfe die installierte Version.

   ```bash
   code-server --version
   ```

6. Starte den Editor zunächst im Vordergrund. Der erste Start erzeugt auch die Konfiguration.

   ```bash
   code-server --bind-addr 127.0.0.1:8080
   ```

7. Lies in einem zweiten Terminal das erzeugte Anmeldepasswort ab. Gib den Inhalt nicht weiter.

   ```bash
   cat ~/.config/code-server/config.yaml
   ```

   Die Konfiguration sollte `auth: password` enthalten. Für den lokalen Einstieg bleibt `cert: false` möglich; die Verbindung verlässt dabei den Rechner nicht. Öffentliche Bereitstellung braucht zusätzlich HTTPS und Zugangsschutz, siehe [sicherer Zugriff](https://coder.com/docs/code-server/guide).

8. Öffne die Adresse im Browser und melde dich mit dem angezeigten Passwort an.

   ```text
   http://127.0.0.1:8080
   ```

## Prüfen

1. Öffne im Editor über **Terminal → Neues Terminal** eine Shell.

2. Prüfe dort, welches Konto die Befehle ausführt.

   ```bash
   whoami
   ```

3. Beende den Vordergrundprozess im ursprünglichen Terminal mit **Strg+C**.

## Optional dauerhaft starten

1. Aktiviere nach dem erfolgreichen Test den Systemdienst für dein Benutzerkonto. Die erzeugte Konfiguration muss weiterhin an `127.0.0.1:8080` binden und Passwortauthentifizierung nutzen.

   ```bash
   sudo systemctl enable --now "code-server@$USER"
   ```

2. Prüfe den Dienstzustand. Erwartet wird „active“.

   ```bash
   systemctl is-active "code-server@$USER"
   ```

## Deinstallieren

1. Deaktiviere den Dienst, sofern du ihn eingerichtet hast.

   ```bash
   sudo systemctl disable --now "code-server@$USER"
   ```

2. Beende einen noch laufenden Vordergrundprozess mit **Strg+C**.

3. Entferne das Paket.

   ```bash
   sudo apt remove code-server
   ```

4. Entferne bei Bedarf nach einer Sicherung die benutzerspezifischen Einstellungen und Erweiterungen. Eigene Projekte außerhalb dieser Ordner bleiben erhalten.

   ```bash
   rm -rf -- ~/.config/code-server ~/.local/share/code-server
   ```
