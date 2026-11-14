# nbgrader

nbgrader hilft dabei, Aufgaben in Jupyter-Notebooks zu erstellen, Abgaben zu prüfen und Bewertungen zu verwalten.

## Voraussetzungen und Aufbau

Diese Anleitung richtet nbgrader auf Ubuntu 26.04 LTS (amd64) für die lokale Arbeit im eigenen Benutzerkonto ein. JupyterLab liefert die Oberfläche im Browser. Ein eigener Datenbankserver und Container sind nicht erforderlich.

Die Systemwerkzeuge kommen aus `apt`. nbgrader wird nach dem [offiziellen Installationsweg](https://nbgrader.readthedocs.io/en/stable/user_guide/installation.html) mit `pip` in eine eigene virtuelle Python-Umgebung installiert. So bleiben Ubuntu-Pakete und die Pakete dieser Anwendung getrennt. Eine virtuelle Python-Umgebung ist kein Container.

Stand November 2026 ist [nbgrader 0.9.6](https://pypi.org/project/nbgrader/) verfügbar und verlangt Python ab 3.11. Diese Anleitung verwendet diese Version mit JupyterLab 4 und dem Python von Ubuntu. Die vollständige Installation auf Ubuntu 26.04 wurde hier nicht praktisch getestet.

**Bei der Bewertung beachten:** Notebook-Code läuft mit den Rechten des Benutzerkontos, das den Kernel startet. Die virtuelle Python-Umgebung schützt weder deine Dateien noch dein Netzwerk vor fremdem Code. Führe fremde Abgaben deshalb ausschließlich in einer dafür vorgesehenen, getrennten Ausführungsumgebung aus. Die folgenden Schritte dienen zunächst der Arbeit mit eigenen Beispielen.

## Installation

### 1. Paketlisten aktualisieren

Damit Ubuntu die verfügbaren Paketversionen kennt.

```bash
sudo apt update
```

### 2. Python-Werkzeuge installieren

`python3-venv` stellt die getrennte Python-Umgebung bereit. `python3-pip` liefert den Paketmanager; der Browser wird später nur zur Bedienung verwendet.

```bash
sudo apt install python3 python3-venv python3-pip
```

**Prüfen:** Auf Ubuntu 26.04 sollte Python 3.14 angezeigt werden.

```bash
python3 --version
```

### 3. Arbeitsordner anlegen

Hier werden die Python-Umgebung und später deine Kursordner gespeichert.

```bash
mkdir -p ~/nbgrader-arbeitsplatz
```

### 4. In den Arbeitsordner wechseln

Alle folgenden relativen Pfade beziehen sich zunächst auf diesen Ordner.

```bash
cd ~/nbgrader-arbeitsplatz
```

### 5. Python-Umgebung erstellen

Erzeugt `.venv` mit eigenen Paketverzeichnissen. Verwende einen neuen Arbeitsordner, falls dort bereits eine Umgebung für einen anderen Zweck liegt.

```bash
python3 -m venv .venv
```

### 6. Python-Umgebung aktivieren

Die Befehle `python`, `pip`, `jupyter` und später `nbgrader` werden in diesem Terminal aus der Umgebung verwendet.

```bash
source .venv/bin/activate
```

**Prüfen:** Der Pfad muss auf `.venv/bin/python` im Arbeitsordner zeigen.

```bash
command -v python
```

### 7. pip innerhalb der Umgebung aktualisieren

Eine aktuelle Version verbessert die Erkennung passender Paketdateien für das Python von Ubuntu.

```bash
python -m pip install --upgrade pip
```

### 8. nbgrader und Notebook-Werkzeuge installieren

Installiert die festgelegte nbgrader-Version, JupyterLab 4 und einen Python-Kernel. Alle Pakete landen in `.venv`; `sudo` ist hier nicht erforderlich. Die nbgrader-Erweiterungen werden automatisch mit eingerichtet. Ein separates Node.js oder ein manueller JavaScript-Build ist für diesen Installationsweg nicht nötig.

```bash
python -m pip install 'nbgrader==0.9.6' 'jupyterlab>=4.2,<5' ipykernel
```

### 9. Paketabhängigkeiten prüfen

Die Ausgabe soll `No broken requirements found` lauten. Bei Konflikten behebe zuerst die gemeldeten Abhängigkeiten, bevor du einen Kurs anlegst.

```bash
python -m pip check
```

### 10. nbgrader-Version prüfen

Damit lässt sich feststellen, ob der Programmaufruf aus der neuen Umgebung funktioniert. Erwartet wird Version 0.9.6.

```bash
nbgrader --version
```

### 11. JupyterLab-Erweiterung prüfen

Die Ausgabe soll die Erweiterung `@jupyter/nbgrader` als aktiviert und ohne Kompatibilitätsfehler aufführen.

```bash
jupyter labextension list
```

### 12. Server-Erweiterungen prüfen

Kontrolliert die nbgrader-Komponenten auf der Serverseite. Die Einträge unter `nbgrader.server_extensions` sollen aktiviert sein und die Validierung bestehen.

```bash
jupyter server extension list
```

## Einen Beispielkurs öffnen

### 13. Beispielkurs erzeugen

`quickstart` legt einen Kursordner mit Beispieldateien und einer Kurskonfiguration an. Der Name `uebungskurs` darf im Arbeitsordner noch nicht als Kursverzeichnis existieren.

```bash
nbgrader quickstart uebungskurs
```

### 14. In den Kursordner wechseln

nbgrader findet seine Kurskonfiguration über das aktuelle Arbeitsverzeichnis. Starte JupyterLab deshalb für diesen Versuch von hier aus.

```bash
cd ~/nbgrader-arbeitsplatz/uebungskurs
```

**Prüfen:** Im Verzeichnis sollten unter anderem `nbgrader_config.py` und der Ordner `source` liegen. `source` enthält die Lehrendenfassung der Aufgaben; gib diesen Ordner nicht als Studierendenfassung weiter.

```bash
ls
```

### 15. JupyterLab starten

Der Server lauscht nur auf dem eigenen Rechner. Die Anmeldung über den automatisch erzeugten Token bleibt eingeschaltet. Das Terminal bleibt während des Betriebs belegt.

```bash
jupyter lab --ip=127.0.0.1 --port=8888 --no-browser
```

### 16. Oberfläche im Browser öffnen

Kopiere die im Terminal ausgegebene vollständige lokale URL einschließlich `token=…` in den Browser. Der Token gewährt Zugang zu dieser Sitzung; teile ihn nicht mit anderen Personen.

### 17. Aufgabenverwaltung prüfen

Öffne in JupyterLab über **View → Activate Command Palette** die Befehlssuche, suche nach `formgrader` und öffne den entsprechenden nbgrader-Befehl. Die Aufgabenverwaltung soll als zusätzlicher Tab erscheinen. Diesen Einstieg beschreibt auch die [offizielle Anleitung zur Aufgabenbearbeitung](https://nbgrader.readthedocs.io/en/stable/user_guide/creating_and_grading_assignments.html).

### 18. Ein Beispielnotebook öffnen

Öffne im Dateibrowser unter `source` einen Aufgabenordner und darin ein Notebook. Verwende bei Bedarf den Kernel **Python 3 (ipykernel)**. Die nbgrader-Seitenleiste **Create Assignment** dient zum Kennzeichnen von Antwort- und Testzellen. Für einen ersten Funktionstest genügen die eigenen Beispieldateien.

### 19. JupyterLab beenden

Drücke im Serverterminal **Strg+C** und bestätige die Beendigung, falls Jupyter nachfragt. Das Schließen des Browserfensters allein beendet den Server nicht.

## Später erneut starten

### 1. Umgebung aktivieren

In einem neuen Terminal muss die Umgebung erneut ausgewählt werden.

```bash
source ~/nbgrader-arbeitsplatz/.venv/bin/activate
```

### 2. Kursordner öffnen

Damit die richtige Kurskonfiguration verwendet wird.

```bash
cd ~/nbgrader-arbeitsplatz/uebungskurs
```

### 3. JupyterLab starten

Verwende anschließend wieder die im Terminal ausgegebene URL mit Token.

```bash
jupyter lab --ip=127.0.0.1 --port=8888 --no-browser
```

## Typische Probleme

- **`externally-managed-environment`:** Aktiviere die Umgebung aus Schritt 6. Verwende kein `sudo pip` und kein `--break-system-packages`.
- **Erweiterung fehlt:** Beende JupyterLab und starte es aus derselben aktivierten Umgebung, in der nbgrader installiert ist. Wiederhole die beiden Erweiterungsprüfungen und lade die Browserseite neu. Alte Befehle mit `jupyter nbextension` betreffen die klassische Notebook-Oberfläche und passen nicht zu diesem Aufbau.
- **Kernel fehlt oder startet nicht:** Prüfe mit dem folgenden Befehl die verfügbaren Kernel. Der Kernel muss auf ein noch vorhandenes Python zeigen.

```bash
jupyter kernelspec list
```

- **Port 8888 ist belegt:** Jupyter kann einen anderen freien Port verwenden. Maßgeblich ist die tatsächlich im Terminal ausgegebene URL.
- **Paketinstallation scheitert:** Lies die erste konkrete Fehlermeldung. Eine Mindestanforderung wie Python ab 3.11 garantiert nicht, dass jede Abhängigkeit mit jeder neueren Python-Version funktioniert.

Für mehrere Lehrende und Studierende ist eine zusätzliche Benutzer- und Austauschkonfiguration erforderlich. Die lokale Einzelplatzinstallation richtet weder JupyterHub noch einen gemeinsamen Abgabedienst ein. Hinweise dazu stehen in der [Dokumentation zu JupyterHub](https://nbgrader.readthedocs.io/en/stable/configuration/jupyterhub_config.html).

## Deinstallieren

### 1. JupyterLab beenden

Drücke im Serverterminal **Strg+C** und bestätige gegebenenfalls die Rückfrage, damit keine Kursdateien mehr geschrieben werden.

### 2. Python-Umgebung verlassen

Führe dies in einem Terminal mit aktivierter Umgebung aus. Dadurch verwendet das Terminal wieder die normalen Systembefehle.

```bash
deactivate
```

### 3. Python-Umgebung entfernen

Löscht nbgrader, JupyterLab und alle zusätzlich in dieser Umgebung installierten Pakete. Die Kursordner bleiben erhalten. Es wurde kein Kernel mit `--user` registriert, der zusätzlich entfernt werden müsste.

```bash
rm -rf -- ~/nbgrader-arbeitsplatz/.venv
```

### 4. Optional: Arbeitsordner samt Kursdaten löschen

**Achtung:** Dabei gehen auch Aufgaben, Lösungen, Abgaben und die Bewertungsdatenbank in diesem Ordner verloren. Sichere benötigte Kursdaten vorher.

```bash
rm -rf -- ~/nbgrader-arbeitsplatz
```

### 5. Entfernung der Umgebung prüfen

Die Ausgabe soll `nbgrader-Umgebung entfernt` lauten. Das System-Python und seine Ubuntu-Werkzeuge bleiben installiert.

```bash
test ! -e ~/nbgrader-arbeitsplatz/.venv && echo 'nbgrader-Umgebung entfernt'
```
