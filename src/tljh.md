# The Littlest JupyterHub

The Littlest JupyterHub (TLJH) stellt mehreren Personen eigene Jupyter-Notebook-Sitzungen auf einem Server bereit.

TLJH ist freie Software unter [BSD-3-Clause](https://github.com/jupyterhub/the-littlest-jupyterhub). Ein einzelner Server trägt alle Sitzungen; „bis etwa 100 Personen“ ist ein Planungsrahmen und hängt von gleichzeitiger Nutzung, RAM, CPU und Aufgaben ab. Für hundert rechenintensive Sitzungen genügt kein kleiner Standardrechner.

Die [Systemanforderungen](https://tljh.jupyter.org/en/latest/topic/requirements.html) nennen aktuelle Ubuntu-/Debian-LTS-Systeme und amd64. Ubuntu 26.04 LTS passt zu diesem Rahmen; ein vollständiger Installationstest auf diesem System wurde für dieses Kapitel nicht durchgeführt.

## Voraussetzungen

1. Stelle einen eigenen, frischen Ubuntu-26.04-Server mit sudo-Zugang bereit. Die [Projektanleitung](https://tljh.jupyter.org/en/latest/install/custom-server.html) rät vom persönlichen Arbeitsplatzrechner ab. TLJH verändert unter anderem Konten und Systemdienste.

2. Erstelle vorab ein vollständiges Systemabbild oder einen Snapshot, den du wiederherstellen kannst. Dieser Wiederherstellungspunkt ist auch der vollständige Deinstallationsweg dieser Anleitung.

3. Begrenze eingehende Verbindungen zunächst mit der vorhandenen Router- oder Anbieter-Firewall auf deinen SSH-Zugang. Die Webports dürfen während der Einrichtung noch nicht öffentlich erreichbar sein, weil der Installer zunächst einen Webzugang ohne TLS bereitstellt.

4. Verbinde dich per SSH mit dem Server. Ersetze Benutzer und Adresse durch deine tatsächlichen Angaben. Die folgenden Installationsbefehle laufen dort.

   ```bash
   ssh BENUTZER@SERVER
   ```

## Installieren

1. Aktualisiere die Paketlisten.

   ```bash
   sudo apt update
   ```

2. Installiere die Werkzeuge für den Python-basierten Installer.

   ```bash
   sudo apt install python3 python3-dev python3-venv git curl ca-certificates
   ```

3. Lade den offiziellen Installer als Datei herunter, damit du ihn vor der Ausführung ansehen kannst.

   ```bash
   curl --fail --location --output tljh-bootstrap.py https://tljh.jupyter.org/bootstrap.py
   ```

4. Prüfe die heruntergeladene Datei vor der Ausführung mit Administratorrechten.

   ```bash
   less tljh-bootstrap.py
   ```

5. Installiere TLJH mit dem vorgesehenen Hub-Administratornamen. Ersetze `kursadmin` bei Bedarf durch deinen gewünschten neuen Hub-Namen. Die Installation benötigt Internetzugang und kann mehrere Minuten dauern.

   ```bash
   sudo python3 tljh-bootstrap.py --admin kursadmin
   ```

6. Beschränke den HTTP-Zugang für den ersten Test auf die Loopback-Adresse des Servers.

   ```bash
   sudo /opt/tljh/hub/bin/tljh-config set http.address 127.0.0.1
   ```

7. Lade die Proxy-Konfiguration neu, damit die Bindung wirksam wird.

   ```bash
   sudo /opt/tljh/hub/bin/tljh-config reload proxy
   ```

   Grundlage ist die [Adresskonfiguration](https://tljh.jupyter.org/en/latest/topic/tljh-config.html). Die externe Firewall bleibt zunächst geschlossen.

8. Öffne auf deinem Ubuntu-Arbeitsrechner ein zweites Terminal und starte einen SSH-Tunnel. Er leitet den lokalen Port 8000 verschlüsselt zum Webzugang auf dem Server weiter.

   ```bash
   ssh -N -L 127.0.0.1:8000:127.0.0.1:80 BENUTZER@SERVER
   ```

9. Öffne auf dem Arbeitsrechner die weitergeleitete Adresse.

   ```text
   http://127.0.0.1:8000
   ```

10. Melde dich mit dem beim Installer angegebenen Hub-Namen an. Beim üblichen FirstUseAuthenticator legst du bei der ersten Anmeldung ein neues starkes Passwort fest. Wähle es selbst, bevor andere Personen Zugriff erhalten; siehe [Anmeldung bei der ersten Nutzung](https://tljh.jupyter.org/en/latest/howto/auth/firstuse.html).

## Prüfen

1. Prüfe auf dem Server beide Kerndienste. Beide sollen „active“ melden.

   ```bash
   systemctl is-active jupyterhub traefik
   ```

2. Erstelle in JupyterLab ein Python-Notebook. Dadurch testest du auch den Start einer Benutzersitzung.

3. Führe in einer Notebook-Zelle das eigene Beispiel aus. Erwartet wird 42.

   ```python
   sum([12, 14, 16])
   ```

4. Füge weitere Personen gezielt über die Hub-Administration hinzu. Vermeide für einen Kurs eine unkontrolliert offene Registrierung.

## HTTPS für gemeinsamen Zugriff

Für den öffentlichen Gruppenbetrieb brauchst du einen Domainnamen mit passendem DNS-Eintrag und erreichbare Ports 80 und 443. Bei einem ausschließlich internen Server sind stattdessen passende interne Zertifikate nötig. Die folgenden Schritte verwenden [Let's Encrypt über TLJH](https://tljh.jupyter.org/en/latest/howto/admin/https.html). Führe die Befehle auf dem Server aus; ersetze die Beispieldaten vorher.

1. Aktiviere HTTPS in der Konfiguration.

   ```bash
   sudo /opt/tljh/hub/bin/tljh-config set https.enabled true
   ```

2. Hinterlege deine echte Kontaktadresse für Zertifikatsmeldungen.

   ```bash
   sudo /opt/tljh/hub/bin/tljh-config set https.letsencrypt.email admin@example.org
   ```

3. Trage deine tatsächlich auf diesen Server zeigende Domain ein.

   ```bash
   sudo /opt/tljh/hub/bin/tljh-config add-item https.letsencrypt.domains hub.example.org
   ```

4. Hebe die HTTP-Beschränkung auf Loopback auf, damit auch die Zertifikatsprüfung den vorgesehenen Endpunkt erreichen kann.

   ```bash
   sudo /opt/tljh/hub/bin/tljh-config unset http.address
   ```

5. Lade den Proxy mit den neuen Einstellungen neu.

   ```bash
   sudo /opt/tljh/hub/bin/tljh-config reload proxy
   ```

6. Erlaube in deiner vorhandenen Netzwerk-Firewall die eingehenden Ports 80 und 443 zum Server. Das ist für Erreichbarkeit und Zertifikatsausstellung nötig.

7. Öffne deine echte HTTPS-Adresse und prüfe das gültige Zertifikat vor einer Anmeldung. Bei Zertifikatsfehlern keine Zugangsdaten eingeben.

   ```text
   https://hub.example.org
   ```

## Deinstallieren

TLJH wird nicht als einzelnes apt-Paket verwaltet. Der Installer legt Umgebungen unter `/opt/tljh`, Dienste, Benutzergruppen und weitere Systemdateien an; das [Installer-Verzeichnis der Änderungen](https://tljh.jupyter.org/en/latest/topic/installer-actions.html) beschreibt diese Eingriffe. Nur den Ordner zu löschen wäre unvollständig.

1. Sichere alle seit der Installation entstandenen benötigten Notebooks und Daten außerhalb des Servers. Eine Wiederherstellung verwirft spätere Änderungen am ganzen System.

2. Stelle den vor der Installation erstellten Snapshot beziehungsweise das Systemabbild über deine Serververwaltung wieder her. Auf einem ausschließlich für TLJH eingerichteten Server ist alternativ eine frische Ubuntu-Installation möglich.

3. Prüfe nach der Wiederherstellung, dass die TLJH-Dienste fehlen. Erwartet wird eine Meldung über nicht vorhandene Units.

   ```bash
   systemctl status jupyterhub.service traefik.service
   ```

4. Entferne nicht mehr benötigte DNS- und Firewall-Einträge in den jeweiligen Verwaltungsoberflächen.
