# Cockpit

Cockpit ist eine Verwaltungsoberfläche für Linux-Rechner im Browser. Sie zeigt Prozessor-, Speicher-, Platten- und Netzauslastung live an, durchsucht die Systemprotokolle, startet und stoppt Dienste, spielt Updates ein, verwaltet Benutzerkonten und Festplatten und öffnet bei Bedarf ein Terminal, alles ohne zusätzliche Software auf dem eigenen Rechner. Cockpit läuft nur, solange jemand angemeldet ist, und arbeitet direkt mit den Werkzeugen des Systems. Was du dort änderst, ist also dasselbe, als hättest du es im Terminal getan. Für dauerhafte Überwachung mit Alarmen eignet sich dagegen [Zabbix](zabbix.md) oder [Prometheus](prometheus.md).

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Cockpit **360** in den eigenen Paketquellen. Zusammen mit den empfohlenen Modulen für Speicher, Netzwerk und Updates kommen 8 kleine Pakete hinzu. Die Dienste dahinter (udisks2, NetworkManager, PackageKit) sind auf einem Ubuntu-Desktop bereits vorhanden.
- **Anmeldung mit dem eigenen Konto:** Cockpit hat keine eigenen Benutzer. Du meldest dich mit deinem normalen Ubuntu-Benutzernamen und -Passwort an. Die direkte Anmeldung als `root` ist gesperrt. Wer zur Gruppe `sudo` gehört, kann in der Oberfläche den administrativen Zugang einschalten.
- **Sofort erreichbar:** Cockpit lauscht direkt nach der Installation auf Port **9090** an allen Netzwerkschnittstellen. Damit könnte jeder im Netz die Anmeldeseite erreichen. Die Schritte 4 bis 8 beschränken das auf `127.0.0.1`. Erledige sie daher gleich nach der Installation.
- **Port 9090:** Auch [Prometheus](prometheus.md) verwendet Port 9090. Läuft es auf dem Rechner, nimmst du in Schritt 5 eine andere Zahl wie `9091` und ersetzt `9090` in den folgenden Schritten entsprechend.
- **Kein Verlauf:** Cockpit zeigt die Auslastung nur live. Für den Verlauf über Stunden und Tage bräuchte es das Paket `cockpit-pcp`, das es für Ubuntu 26.04 nicht gibt.
- **Sprache:** Die Oberfläche richtet sich nach der Sprache des Browsers und erscheint auf einem deutschen System deutsch.
- **Version:** Installation, Beschränkung auf `127.0.0.1` und Anmeldeseite getestet mit Cockpit **360** am 2. Oktober 2026. Die Bedienung nach der Anmeldung ab Schritt 12 ist nicht selbst durchgeklickt. Die Menünamen stammen aus den deutschen Sprachdateien des Pakets.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Cockpit installieren

Installiert Cockpit samt den empfohlenen Modulen für Speicher, Netzwerk und Software-Updates.

```bash
sudo apt install cockpit
```

### 3. Version prüfen

```bash
cockpit-bridge --version
```

**Prüfen:** Die erste Zeile lautet `Version: 360`.

## Nur lokal erreichbar machen

Cockpit wird von systemd über einen sogenannten *Socket* gestartet: systemd hält den Port offen und startet Cockpit erst, wenn sich jemand verbindet. Die Adresse, auf der gelauscht wird, steht deshalb in der Socket-Einheit `cockpit.socket`. Eine kleine Ergänzungsdatei ändert sie, ohne die Datei des Pakets anzufassen.

### 4. Ordner für die Ergänzung anlegen

```bash
sudo mkdir -p /etc/systemd/system/cockpit.socket.d
```

### 5. Ergänzungsdatei anlegen

```bash
sudo nano /etc/systemd/system/cockpit.socket.d/lokal.conf
```

Trage Folgendes ein:

```ini
[Socket]
ListenStream=
ListenStream=127.0.0.1:9090
```

Die erste Zeile `ListenStream=` ohne Wert löscht die Vorgabe des Pakets (Port 9090 an allen Schnittstellen). Die zweite legt die neue Adresse fest. Ohne die leere Zeile würde Cockpit zusätzlich auf beiden Adressen lauschen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. systemd die Änderung mitteilen

```bash
sudo systemctl daemon-reload
```

### 7. Socket neu starten

Erst damit übernimmt systemd die neue Adresse.

```bash
sudo systemctl restart cockpit.socket
```

### 8. Prüfen, dass Cockpit nur lokal lauscht

```bash
ss -ltn | grep 9090
```

**Prüfen:** Es erscheint genau eine Zeile, und sie enthält `127.0.0.1:9090`. Steht dort `*:9090`, stimmt die Ergänzungsdatei nicht.

## Erste Anmeldung

### 9. Cockpit im Browser öffnen

Bei Verbindungen vom eigenen Rechner erlaubt Cockpit einfaches `http`. Von anderen Rechnern aus würde es auf `https` umleiten.

```bash
xdg-open http://127.0.0.1:9090
```

**Prüfen:** Die Anmeldeseite zeigt den Namen des Rechners, darunter „Melden Sie sich mit dem Server-Benutzerkonto an.“ und die Felder **Benutzername** und **Passwort**.

### 10. Anmelden

Gib deinen Ubuntu-Benutzernamen und dein Passwort ein und klicke auf **Anmelden**.

### 11. Administrativen Zugang einschalten

Nach der Anmeldung läuft Cockpit mit den Rechten deines Benutzers. Oben steht dann **Eingeschränkter Zugang**, und manche Bereiche lassen sich nur ansehen. Gehörst du zur Gruppe `sudo`, klicke auf **Eingeschränkter Zugang** und dann auf **Authentifiziere**. Nach Eingabe deines Passworts steht dort **Administrativer Zugang**, und Cockpit darf so viel wie `sudo` im Terminal.

> **Hinweis:** Mit administrativem Zugang wirken Klicks auf **Neustart**, **Stoppen** oder **Alle Aktualisierungen installieren** sofort und ohne weitere Rückfrage auf das System. Schalte den Zugang über denselben Knopf wieder ab, wenn du nur nachsehen willst.

## Rundgang

### 12. Überblick ansehen

Die Seite **Überblick** ist in vier Kästen geteilt:

- **Meldungen** zeigt, ob Updates anstehen oder Dienste ausgefallen sind.
- **Nutzung** zeigt die aktuelle Auslastung von **CPU** und **Speicher**. Ein Klick auf **Metriken und Verlauf ansehen** öffnet eine genauere Ansicht mit **Last**, **Festplatten-E/A**, **Netzwerk** und den Diensten, die gerade am meisten Rechenzeit und Speicher brauchen.
- **Systeminformationen** nennt Hardware, Betriebssystem und Laufzeit.
- **Konfiguration** zeigt Rechnername, Systemzeit und weitere Grundeinstellungen.

### 13. Protokolle durchsuchen

Öffne links **Protokolle**. Cockpit zeigt die Einträge des systemd-Journals, die neuesten zuerst. Über **Priorität** schränkst du auf wichtige Meldungen ein, z. B. **Fehler und höher**. Ein Klick auf eine Zeile zeigt alle Angaben zu diesem Eintrag.

Im Terminal entspricht das ungefähr diesem Befehl:

```bash
journalctl -p err -b
```

### 14. Dienste ansehen

Öffne links **Dienste**. Die Liste zeigt alle systemd-Dienste mit ihrem Zustand, etwa **Läuft** oder **Läuft nicht**. Oben wechselst du zu **Ziele**, **Sockets** und **Timer**. Ein Klick auf einen Dienst zeigt seine letzten Protokollzeilen. Mit administrativem Zugang stehen dort auch **Neustarten** und **Stoppen** zur Verfügung.

### 15. Updates prüfen

Öffne links **Aktualisierungen**. Cockpit fragt über PackageKit dieselben Paketquellen ab wie `apt` und listet anstehende Updates, Sicherheitsupdates werden eigens markiert. **Alle Aktualisierungen installieren** spielt sie ein. Danach schlägt Cockpit gegebenenfalls vor, betroffene **Dienste neu starten** oder den Rechner neu zu starten.

### 16. Weitere Bereiche

- **Speicher** zeigt Festplatten, Partitionen und Dateisysteme samt Belegung und kann neue Laufwerke einrichten.
- **Netzwerk** zeigt die Schnittstellen mit ihrem Datenverkehr und verwaltet die Verbindungen von NetworkManager.
- **Konten** legt Benutzer an, setzt Passwörter mit **Passwort setzen** und sperrt Konten mit **Konto sperren**.
- **Terminal** öffnet eine Shell als dein Benutzer direkt im Browser.

### 17. Abmelden

Klicke oben rechts auf deinen Benutzernamen und dann auf **Abmelden**. Ohne angemeldete Sitzung beendet sich Cockpit nach kurzer Zeit von selbst und belegt keinen Arbeitsspeicher mehr. Nur systemd hält den Port weiter offen.

## Wie geht es weiter?

- **Dateien verwalten:** Das Zusatzmodul `cockpit-files` bringt einen einfachen Dateimanager in die Oberfläche: `sudo apt install cockpit-files`. Danach erscheint links der Eintrag **Dateien**.
- **Virtuelle Maschinen:** `cockpit-machines` verwaltet virtuelle Maschinen mit KVM und libvirt. Es zieht diese Virtualisierungspakete mit.
- **Von anderen Rechnern aus:** Statt den Port im Netz freizugeben, kannst du von einem anderen Rechner aus einen SSH-Tunnel aufbauen: `ssh -L 9090:127.0.0.1:9090 BENUTZER@RECHNER` und dann dort `http://127.0.0.1:9090` öffnen.
- **Dokumentation:** <https://cockpit-project.org/documentation.html> sowie `man cockpit.conf` und `man cockpit-ws`

## Deinstallieren

### 1. Socket anhalten

```bash
sudo systemctl stop cockpit.socket cockpit.service
```

### 2. Cockpit entfernen

Entfernt Cockpit und die mitinstallierten Module samt Einstellungen. `libpwquality-tools` ist ein Hilfspaket für Passwortprüfungen, das nur Cockpit nachgezogen hat. `apt` meldet, dass der Ordner `/etc/cockpit/ws-certs.d` nicht leer ist. Darin liegt das selbst erzeugte Zertifikat für `https`. Den Ordner löscht Schritt 3.

```bash
sudo apt purge cockpit cockpit-bridge cockpit-ws cockpit-system cockpit-networkmanager cockpit-packagekit cockpit-storaged libpwquality-tools
```

### 3. Übrige Dateien löschen

Löscht das Zertifikat und die eigene Ergänzungsdatei aus Schritt 5.

```bash
sudo rm -r /etc/cockpit /etc/systemd/system/cockpit.socket.d
```

### 4. systemd die Änderung mitteilen

```bash
sudo systemctl daemon-reload
```

**Prüfen:** Port 9090 ist frei, der Befehl gibt nichts aus.

```bash
ss -ltn | grep 9090
```
