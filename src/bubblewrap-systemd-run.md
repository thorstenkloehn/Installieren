# bubblewrap und systemd-run

bubblewrap trennt Dateisystem und Netzwerk eines Prozesses; systemd-run ergänzt Ressourcenlimits für einen kleinen eigenen Python-Runner.

Für Ubuntu 26.04 LTS (amd64), direkt ohne Docker. Dies ist ein lokales Beispiel für selbst kontrollierte Aufgaben, keine fertige HTTP-API und keine Freigabe zum öffentlichen Ausführen beliebigen Fremdcodes. Python und die Bibliotheken unter /usr bleiben sichtbar, Home und Hostkonfiguration werden nicht eingebunden. Ein eigener Laufzeitbaum, Systemaufruffilter und eine Begrenzung der Ausgabemenge sind hier nicht enthalten.

## Installation

### 1. Paketlisten aktualisieren

Bereitet die Installation vor.

````bash
sudo apt update
````

### 2. Werkzeuge installieren

systemd-run gehört zu systemd. Der Rechner muss mit systemd gebootet sein und eine laufende Benutzersitzung besitzen.

````bash
sudo apt install bubblewrap systemd systemd-sysv python3 coreutils
````

### 3. bubblewrap prüfen

Zeigt die installierte Version.

````bash
bwrap --version
````

### 4. systemd prüfen

Die Ausgabe nennt den Stand des systemd-Werkzeugs.

````bash
systemd-run --version
````

### 5. cgroup v2 prüfen

Erwartet wird cgroup2fs.

````bash
stat -fc %T /sys/fs/cgroup
````

### 6. Benutzerdienst prüfen

Der Test muss erfolgreich enden. Bei fehlendem Benutzerbus melde dich regulär am Ubuntu-Rechner an; starte den Runner nicht ersatzweise als root.

````bash
systemd-run --user --wait --pipe --collect --property=MemoryMax=128M /usr/bin/true
````

### 7. Projektordner anlegen

Verwende einen neuen Ordner für die Beispiele.

````bash
mkdir ~/bubblewrap-lab
````

### 8. Projektordner öffnen

Die folgenden Dateien werden hier angelegt.

````bash
cd ~/bubblewrap-lab
````

### 9. Runner schreiben

Startet eine kurzlebige Benutzerservice-Unit. bubblewrap bindet nur die Programmdatei und Systemlaufzeiten ein; es teilt das Netzwerk des Hosts nicht.

````bash
cat > run-python <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo 'Aufruf: ./run-python DATEI.py' >&2
  exit 2
fi
runner_file=$(realpath -- "$1")
exec systemd-run --user --wait --pipe --collect --service-type=exec \
  --expand-environment=no \
  --property=MemoryMax=128M \
  --property=MemorySwapMax=0 \
  --property=TasksMax=32 \
  --property=CPUQuota=50% \
  --property=RuntimeMaxSec=5s \
  --property=TimeoutStopSec=1s \
  --property=KillMode=control-group \
  -- /usr/bin/bwrap \
  --unshare-all --die-with-parent --new-session --cap-drop ALL \
  --ro-bind /usr /usr \
  --symlink usr/bin /bin --symlink usr/sbin /sbin \
  --symlink usr/lib /lib --symlink usr/lib64 /lib64 \
  --proc /proc --dev /dev --tmpfs /tmp \
  --dir /work --ro-bind "$runner_file" /work/main.py --chdir /work \
  --clearenv --setenv PATH /usr/bin:/bin --setenv HOME /tmp \
  --setenv LANG C.UTF-8 \
  /usr/bin/python3 -I -B /work/main.py
EOF
````

### 10. Runner ausführbar machen

Erlaubt den direkten Aufruf des Skripts.

````bash
chmod +x run-python
````

### 11. Testprogramm schreiben

Prüft Ausgabe, fehlendes Home und Schreibrechte im eigenen temporären Verzeichnis.

````bash
cat > probe.py <<'EOF'
from pathlib import Path
print('Runner bereit')
assert not Path('/home').exists()
assert not Path('/etc/shadow').exists()
Path('/tmp/probe.txt').write_text('nur in dieser Sandbox')
print('Dateitrennung bestätigt')
EOF
````

## Installation prüfen

### 1. Dateitrennung testen

Erwartet werden Runner bereit und Dateitrennung bestätigt. Die Datei in /tmp verschwindet mit dem Lauf.

````bash
./run-python probe.py
````

### 2. Netzwerktest anlegen

Verwendet eine numerische Zieladresse, damit kein DNS-Test mit dem Netzwerktest verwechselt wird.

````bash
cat > netz.py <<'EOF'
import socket
try:
    socket.create_connection(('1.1.1.1', 443), timeout=1)
except OSError:
    print('Keine externe Verbindung möglich')
else:
    raise SystemExit('FEHLER: externe Verbindung gelang')
EOF
````

### 3. Netztrennung prüfen

Die Verbindung muss scheitern. Dieser einzelne Test ersetzt keine vollständige Netzprüfung.

````bash
./run-python netz.py
````

### 4. Zeitprüfung anlegen

Enthält ausschließlich eine Endlosschleife.

````bash
cat > endlos.py <<'EOF'
while True:
    pass
EOF
````

### 5. Laufzeitgrenze prüfen

Der Lauf muss nach ungefähr fünf Sekunden beendet werden; nach einer zusätzlichen Sekunde Stop-Frist wird nötigenfalls hart abgebrochen und einen Fehlerstatus liefern. CPUQuota begrenzt den CPU-Anteil, nicht die aufsummierte CPU-Zeit.

````bash
./run-python endlos.py
````

### 6. Speichertest anlegen

Fordert mehr Speicher als die erlaubten 128 MiB an.

````bash
cat > speicher.py <<'EOF'
puffer = bytearray(512 * 1024 * 1024)
print(len(puffer))
EOF
````

### 7. Speichergrenze prüfen

Der Lauf muss scheitern; er darf die große Allokation nicht erfolgreich ausgeben.

````bash
./run-python speicher.py
````

MemoryMax und TasksMax gelten für die gesamte Service-cgroup. Der Runner begrenzt den Speicher auf 128 MiB, deaktiviert Swap für den Job und erlaubt höchstens 32 Tasks einschließlich Threads. Er bindet keine Host-Sockets und keine Benutzerdateien außer der ausgewählten Datei ein. Python -I ignoriert benutzerspezifische Importpfade; eigene Zusatzmodule werden nicht automatisch mitgeladen.

Bei namespace- oder AppArmor-Fehlern ist die Sandbox nicht einsatzbereit. Prüfe die Ubuntu-Paketprofile und die Systemmeldungen; schalte weder AppArmor noch die globale User-Namespace-Beschränkung pauschal ab. Fahre nur fort, wenn die Limits und Trennung tatsächlich funktionieren. Ausgabemengen werden nicht begrenzt; dieser Einstieg darf deshalb nicht unverändert als fremd erreichbarer Runner eingesetzt werden.

## Deinstallieren

### 1. Laufende Prüfung beenden

Warte auf das Laufzeitlimit oder beende den eigenen Test im Terminal. --collect räumt beendete Service-Units auf.

### 2. Projektordner entfernen

Sichere eigene Aufgaben vorher.

````bash
rm -rf -- ~/bubblewrap-lab
````

### 3. bubblewrap optional entfernen

Nur wenn keine anderen Programme bubblewrap benötigen. systemd wird nicht entfernt: Es ist der Systemmanager von Ubuntu.

````bash
sudo apt purge bubblewrap
````

### 4. Projektentfernung prüfen

Die Bestätigung erscheint nach dem Löschen des Beispielordners.

````bash
test ! -e ~/bubblewrap-lab && echo 'Runner entfernt'
````

## Quellen und Lizenz

[bubblewrap](https://github.com/containers/bubblewrap), [systemd-run](https://www.freedesktop.org/software/systemd/man/latest/systemd-run.html), [Ressourcenlimits](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html). bubblewrap: LGPL-2.1-or-later; systemd enthält überwiegend LGPL-2.1-or-later-Komponenten. Das Shellskript ist ein eigenes Beispiel; es wird keine Weitergabelizenz im Namen des Benutzers festgelegt.
