# Jobe

Jobe führt kleine Programmieraufgaben über eine HTTP-Schnittstelle aus und dient unter anderem als Ausführungsdienst für Moodle CodeRunner.

## Voraussetzungen und Grenzen

Diese Anleitung beschreibt eine native Installation auf Ubuntu 26.04 LTS (amd64) mit Apache und PHP, ohne Docker. Für den Einstieg werden Python 3, C und C++ eingerichtet. Weitere Sprachen können später ergänzt werden.

Die [offizielle Anleitung](https://github.com/trampgeek/jobe#installation) behandelt vor allem Ubuntu 22.04. Die hier beschriebenen Anpassungen für Ubuntu 26.04 wurden anhand des [Quellstands bfca53c](https://github.com/trampgeek/jobe/tree/bfca53c0a449815d5c228353260c37b9f6e57f3d) vorbereitet, aber nicht vollständig auf dem Zielsystem ausgeführt. Die HTTP- und Ausführungstests am Ende sind deshalb erforderlich, bevor du diesen Aufbau verwendest.

**Rechnerwahl:** Verwende einen eigenen Testrechner oder eine separate Ubuntu-VM ohne persönliche Daten. Jobe legt Systembenutzer und privilegierte sudo-Regeln an. Sein `runguard` begrenzt Prozesse und Ressourcen, ersetzt aber keine vollständig abgeschottete virtuelle Maschine. Die API wird hier nur über `127.0.0.1:8081` bereitgestellt. Vor einem späteren Einsatz mit Moodle sind eigene Zugriffsregeln und eine Prüfung der Netzwerktrennung erforderlich.

Die Anleitung setzt voraus, dass noch keine Jobe-Installation und keine gleichnamigen Systembenutzer vorhanden sind. Apache muss eingerichtet werden können; auf einem Rechner mit bestehendem nginx, Apache oder PHP-FPM ist die Webserverkonfiguration vorher abzustimmen. Insbesondere darf Apache nicht ungeplant einen bereits belegten Port 80 übernehmen.

## Pakete installieren

### 1. Paketlisten aktualisieren

Damit Ubuntu die aktuellen Paketversionen kennt.

```bash
sudo apt update
```

### 2. Webserver und Werkzeuge installieren

Installiert PHP für Apache, die von Jobe benötigten PHP-Module und Werkzeuge zum Bauen des Ausführungshelfers. Ein Datenbankserver ist für diesen Aufbau nicht erforderlich.

```bash
sudo apt install apache2 libapache2-mod-php php-cli php-mbstring php-intl php-xml php-curl acl git build-essential libcgroup-dev python3 curl ca-certificates sudo nano
```

### 3. PHP-Erweiterungen prüfen

Alle ausgegebenen Werte müssen `true` sein. Besonders die Funktionen für gemeinsamen Speicher und Semaphoren werden für die Jobverwaltung benötigt.

```bash
php -r 'var_dump(extension_loaded("intl"), extension_loaded("mbstring"), function_exists("sem_get"), function_exists("shm_attach"));'
```

## Apache vor dem Download absichern

### 4. Zugriff auf den künftigen Quellordner sperren

Öffne diese neue Apache-Konfiguration und füge den folgenden Inhalt ein. Sie verhindert, dass der standardmäßige DocumentRoot den Quellcode über Port 80 ausliefert. Nur das öffentliche Verzeichnis erhält später einen lokalen Zugang.

```bash
sudo nano /etc/apache2/conf-available/jobe-local-access.conf
```

```apache
<Directory /var/www/html/jobe>
    AllowOverride None
    Require all denied
</Directory>

<Directory /var/www/html/jobe/public>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require local
</Directory>
```

Speichere mit **Strg+O**, bestätige mit **Enter** und beende nano mit **Strg+X**. Verwende dieselben Tasten auch bei den späteren Konfigurationsdateien.

### 5. Zugriffskonfiguration aktivieren

Macht die neuen Verzeichnisregeln für Apache verfügbar.

```bash
sudo a2enconf jobe-local-access
```

### 6. Rewrite-Modul aktivieren

Jobe bringt im öffentlichen Verzeichnis Regeln für seine URLs mit.

```bash
sudo a2enmod rewrite
```

### 7. Lokalen API-Endpunkt anlegen

Öffne die neue Site-Datei und trage den nachfolgenden Inhalt ein. Der zusätzliche Port wird ausschließlich an Loopback gebunden. Der Alias erhält den von den Jobe-Testwerkzeugen erwarteten Pfad `/jobe/`.

```bash
sudo nano /etc/apache2/sites-available/jobe-local.conf
```

```apache
Listen 127.0.0.1:8081

<VirtualHost 127.0.0.1:8081>
    ServerName localhost
    DocumentRoot /var/www/html/jobe/public
    Alias /jobe/ /var/www/html/jobe/public/

    ErrorLog ${APACHE_LOG_DIR}/jobe-error.log
    CustomLog ${APACHE_LOG_DIR}/jobe-access.log combined
</VirtualHost>
```

### 8. Lokale Site aktivieren

Nimmt die zusätzliche Site in die Apache-Konfiguration auf.

```bash
sudo a2ensite jobe-local
```

### 9. Apache-Konfiguration prüfen

Die Ausgabe muss `Syntax OK` enthalten. Behebe Fehler, bevor du fortfährst.

```bash
sudo apache2ctl configtest
```

### 10. Apache-Einstellungen übernehmen

Aktiviert die Zugriffssperre und den lokalen Port, bevor Jobe heruntergeladen wird.

```bash
sudo systemctl restart apache2
```

## Jobe einrichten

### 11. Quellcode in den vorgesehenen Ordner laden

Der Installer erwartet Jobe unter `/var/www/jobe` oder `/var/www/html/jobe`. Verwende keinen symbolischen Link aus einem anderen Verzeichnis. Der Zielordner darf noch nicht existieren.

```bash
sudo git clone https://github.com/trampgeek/jobe.git /var/www/html/jobe
```

### 12. Geprüften Stand auswählen

Verwendet den oben genannten Commit einschließlich der Sicherheitskorrekturen aus September 2026. Die veraltete Versionszeile am Anfang der README ist hierfür nicht maßgeblich.

```bash
sudo git -C /var/www/html/jobe checkout --detach bfca53c0a449815d5c228353260c37b9f6e57f3d
```

### 13. Anzahl gleichzeitiger Jobs begrenzen

Öffne die Jobe-Konfiguration und ändere die vorhandene Zeile für `$jobe_max_users` auf den folgenden Wert. Zwei gleichzeitige Jobs reichen für den lokalen Einstieg und begrenzen den anfänglichen Ressourcenbedarf. Lass `debugging` ausgeschaltet. Die Schlüsselprüfung bleibt für diesen ausschließlich lokalen Test im voreingestellten Zustand deaktiviert.

```bash
sudo nano /var/www/html/jobe/app/Config/Jobe.php
```

```php
public int $jobe_max_users = 2;
```

### 14. Installationsordner öffnen

Das Installationsskript verwendet das aktuelle Verzeichnis für seine Pfade.

```bash
cd /var/www/html/jobe
```

### 15. Nativen Installer ausführen

Das Skript erzeugt die Jobe-Benutzer, Arbeitsverzeichnisse und sudo-Regeln und übersetzt `runguard` sowie den Aufräumhelfer. Es benötigt einen laufenden Apache zur Erkennung des Webserverbenutzers. Fahre nur fort, wenn die Installation ohne Fehler abgeschlossen wird.

```bash
sudo ./install
```

### 16. Programmdateien root zuordnen

Der Installer macht zunächst große Teile des Projektbaums für den Webserver schreibbar. Für diesen Aufbau wird der Code anschließend root zugeordnet. Auch die über sudo gestarteten Helfer und ihre übergeordneten Verzeichnisse müssen gegen Austausch durch den Webserver geschützt sein.

```bash
sudo chown -R root:root /var/www/html/jobe
```

### 17. Schreibrechte für Code beschränken

Verhindert Änderungen am Programmbaum durch Gruppe und andere Benutzer. Die Ausführungsrechte der vom Installer gebauten Helfer bleiben erhalten.

```bash
sudo chmod -R go-w /var/www/html/jobe
```

### 18. Webserver-Leserechte einrichten

Eine ACL erlaubt Apache das Lesen und Durchqueren des Programmbaums. Sie gibt ihm keine Schreibrechte auf Code oder privilegierte Helfer. Die root-eigenen Verzeichnisse verhindern deren Austausch.

```bash
sudo setfacl -R -m u:www-data:r-X /var/www/html/jobe
```

### 19. Laufzeitverzeichnis dem Webserver zuordnen

Nur `writable` innerhalb des Projektbaums muss für Logs und Framework-Caches beschreibbar bleiben. Die vom Installer eingerichteten Verzeichnisse unter `/home/jobe` und `/var/log/jobe` behalten ihre gesonderten Rechte.

```bash
sudo chown -R www-data:www-data /var/www/html/jobe/writable
```

### 20. UTF-8 für Apache einstellen

Öffne die Umgebungsdatei. Ersetze die vorhandene Einstellung für `LANG` durch die folgende Zeile, damit Programmausgaben mit Umlauten korrekt verarbeitet werden.

```bash
sudo nano /etc/apache2/envvars
```

```bash
export LANG=C.UTF-8
```

### 21. sudo-Regeln prüfen

Die Ausgabe darf keine Syntaxfehler enthalten. Die Jobe-Regeln müssen auf die Helfer im tatsächlichen Installationsordner zeigen.

```bash
sudo visudo -c
```

### 22. Apache neu starten

Übernimmt die UTF-8-Umgebung und startet die Anwendung mit den endgültigen Dateirechten.

```bash
sudo systemctl restart apache2
```

## Installation prüfen

### 23. Sprachliste abrufen

Die Antwort soll eine JSON-Liste mit den verfügbaren Sprachen enthalten. Beim ersten Aufruf muss Jobe die vorhandenen Interpreter und Compiler erkennen; das kann länger dauern.

```bash
curl --fail --show-error http://127.0.0.1:8081/jobe/index.php/restapi/languages
```

### 24. Eigenen Python-Code ausführen

Dieser Test prüft zusätzlich die Jobvergabe und Programmausführung. Erwartet werden `outcome` mit dem Wert `15` und die Ausgabe `Jobe funktioniert` in `stdout`.

```bash
curl --fail --show-error \
  --header 'Content-Type: application/json' \
  --data '{"run_spec":{"language_id":"python3","sourcecode":"print(\"Jobe funktioniert\")","sourcefilename":"probe.py"}}' \
  http://127.0.0.1:8081/jobe/index.php/restapi/runs
```

### 25. Bind-Adresse prüfen

Port 8081 muss an `127.0.0.1` gebunden sein. Andere Apache-Ports gehören zur allgemeinen Apache-Konfiguration und werden durch die zusätzliche Site nicht entfernt.

```bash
sudo ss -ltnp 'sport = :8081'
```

Bei HTTP-Fehlern prüfe das Jobe-Fehlerprotokoll. Eine erfolgreiche Sprachliste allein reicht nicht: Auch der Ausführungstest muss funktionieren. Werden Sandbox- oder PHP-Fehler gemeldet, ist der Aufbau noch nicht einsatzbereit.

```bash
sudo tail -n 50 /var/log/apache2/jobe-error.log
```

Für eine spätere Anbindung von Moodle müssen der lokale Listener und die Zugriffsregel bewusst auf den vorgesehenen Client angepasst werden. Richte dabei eine eigene API-Schlüsselkonfiguration und Netzbeschränkung ein; öffne diesen Dienst nicht allgemein für das Internet. Die Details der Jobe-Schnittstelle stehen im [offiziellen Repository](https://github.com/trampgeek/jobe).

## Deinstallieren

Die folgenden Schritte sind nur für die in dieser Anleitung neu eingerichtete Instanz bestimmt. Sie löschen deren Benutzer, Cache und Arbeitsdaten. Sichere benötigte Daten vorher und warte, bis alle Jobs beendet sind.

### 1. Lokale Site deaktivieren

Entfernt den zusätzlichen Listener aus der aktiven Konfiguration.

```bash
sudo a2dissite jobe-local
```

### 2. Apache neu starten

Beendet die bisherigen Webprozesse und übernimmt die deaktivierte Site.

```bash
sudo systemctl restart apache2
```

### 3. Privilegierte Jobe-Freigaben entfernen

Entzieht dem Webserver die Jobe-spezifischen sudo-Berechtigungen. Der Deinstaller entfernt diese Datei nicht selbst.

```bash
sudo rm -- /etc/sudoers.d/jobe-sudoers
```

### 4. Installationsordner öffnen

Der Deinstaller benötigt dieses Arbeitsverzeichnis.

```bash
cd /var/www/html/jobe
```

### 5. Jobe-Systemkonten und Arbeitsdaten entfernen

Das Projektskript entfernt die Jobe-Workerbenutzer sowie unter anderem `/home/jobe` und `/var/log/jobe`. Verwende es nicht, wenn diese Benutzer noch für eine andere Jobe-Instanz gebraucht werden.

```bash
sudo ./install --uninstall
```

### 6. Ins Home-Verzeichnis wechseln

Verlässt den Ordner, der anschließend gelöscht wird.

```bash
cd ~
```

### 7. Programmordner löschen

Entfernt den Jobe-Quellcode samt lokaler Einstellungen und Framework-Caches.

```bash
sudo rm -rf -- /var/www/html/jobe
```

### 8. Zugriffskonfiguration deaktivieren

Die Sperre für den inzwischen entfernten Ordner wird nicht mehr benötigt.

```bash
sudo a2disconf jobe-local-access
```

### 9. Site-Datei entfernen

Entfernt die von dieser Anleitung angelegte Listener-Konfiguration.

```bash
sudo rm -- /etc/apache2/sites-available/jobe-local.conf
```

### 10. Zugriffskonfiguration entfernen

Löscht ausschließlich die zusätzliche Jobe-Konfiguration.

```bash
sudo rm -- /etc/apache2/conf-available/jobe-local-access.conf
```

### 11. Apache-Konfiguration übernehmen

Apache, PHP und Compiler bleiben für andere Anwendungen installiert.

```bash
sudo systemctl reload apache2
```

**Prüfen:** Für Port 8081 soll keine Jobe-Listenerzeile mehr erscheinen. Kontrolliere außerdem mit `sudo visudo -c`, dass die verbleibenden sudo-Regeln gültig sind.

```bash
sudo ss -ltnp 'sport = :8081'
```

## Lizenz und Betriebsart

Jobe steht unter MIT. Docker ist optional; dieses Kapitel verwendet weiterhin die native Installation.
