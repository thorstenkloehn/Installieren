# Joplin

Joplin ist ein Notizprogramm, das Notizen in Markdown schreibt und in Notizbüchern und mit Schlagwörtern ordnet. Es synchronisiert auf Wunsch verschlüsselt zwischen Rechner und Smartphone, auch über einen eigenen Speicherort statt einer Cloud. Joplin eignet sich gut als Ersatz für Evernote oder OneNote.

## Vorbemerkungen

- **Kein apt-Paket:** Joplin ist nicht in den Ubuntu-Paketquellen enthalten. Den Snap im Snap Store pflegt nicht das Joplin-Projekt, sondern ein Dritter. Diese Anleitung installiert deshalb die offizielle `.deb`-Datei von der Release-Seite des Projekts mit `apt`.
- **Version:** Getestet mit Joplin **3.7.21** unter Ubuntu 26.04.
- **Wo die Notizen liegen:** Anders als Obsidian oder Zettlr speichert Joplin die Notizen nicht als einzelne Dateien, sondern in einer SQLite-Datenbank im Ordner `~/.config/joplin-desktop`. Über **Alles exportieren** bekommst du sie jederzeit als Markdown-Dateien heraus, siehe Schritt 9.
- **Sandbox:** Joplin baut auf Electron auf, das Programme in einer abgeschotteten Umgebung ausführt. Ubuntu erlaubt das seit Version 24.04 nur Programmen mit einem AppArmor-Profil. Das Paket richtet dieses Profil bei der Installation selbst ein.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Abhängigkeiten kennt.

```bash
sudo apt update
```

### 2. Joplin herunterladen

Lädt das Paket (etwa 160 MB) in den Ordner `/tmp`. Die aktuelle Versionsnummer steht auf <https://github.com/laurent22/joplin/releases/latest>. Bei einer neueren Version ersetzt du die Nummer an beiden Stellen im Befehl.

```bash
wget -O /tmp/joplin.deb https://github.com/laurent22/joplin/releases/download/v3.7.21/Joplin-3.7.21.deb
```

### 3. Download prüfen

Vergleicht die Prüfsumme der Datei mit dem Wert, den GitHub für diese Datei anzeigt. So fällt auf, wenn der Download beschädigt oder verändert wurde. Bei einer anderen Version steht die Prüfsumme auf der Release-Seite neben dem Dateinamen (`sha256:…`).

```bash
echo "14de2d5524e45341de5f0b68a1e78191b796a6c9817949c49b80afe5cd6ab965  /tmp/joplin.deb" | sha256sum -c
```

**Prüfen:** Die Ausgabe lautet `/tmp/joplin.deb: OK`.

### 4. Joplin installieren

Der Pfad mit `/` am Anfang sagt `apt`, dass es eine lokale Datei installieren soll. Das Paket legt das Programm nach `/opt/Joplin`, den Befehl `joplin` nach `/usr/bin` und das AppArmor-Profil nach `/etc/apparmor.d/joplin`.

```bash
sudo apt install /tmp/joplin.deb
```

**Prüfen:** Die Zeile beginnt mit `ii` und enthält `3.7.21`.

```bash
dpkg -l joplin
```

## Erste Schritte

### 5. Joplin starten

Starte Joplin über das Startmenü (Suchbegriff „Joplin“) oder im Terminal:

```bash
joplin
```

**Prüfen:** Das Fenster öffnet sich mit deutscher Oberfläche. Links steht das Notizbuch **Willkommen!** mit fünf englischen Einführungsnotizen. Meldungen im Terminal wie `vaInitialize failed` oder `DeprecationWarning` sind nur Hinweise und stören nicht.

### 6. Notizbuch anlegen

Wähle **Datei → Neues Notizbuch**, gib einen Namen ein, z. B. `Garten`, und bestätige. Notizbücher sind wie Ordner. Sie lassen sich per Ziehen auch ineinander schachteln.

### 7. Notiz schreiben

Markiere das Notizbuch und klicke auf **Neue Notiz**. Gib oben einen Titel ein und schreibe darunter Markdown, zum Beispiel:

```markdown
## Beete

- [ ] Kompost ausbringen
- [ ] Tomaten vorziehen

**Wichtig:** Erst nach den Eisheiligen auspflanzen.
```

Joplin zeigt links den Text und rechts die fertige Ansicht. Es speichert automatisch.

### 8. Schlagwort vergeben

Klicke unten in der Notiz auf das Etikett-Symbol, gib ein Schlagwort ein, z. B. `planung`, und bestätige. Links unter **Schlagwörter** findest du danach alle Notizen mit diesem Schlagwort.

### 9. Notizen als Markdown exportieren

Wähle **Datei → Alles exportieren → MD - Markdown** und dann einen leeren Ordner, z. B. `~/Dokumente/Joplin-Export`. Joplin legt pro Notizbuch einen Ordner und pro Notiz eine `.md`-Datei an. So kommst du jederzeit ohne Joplin an deine Notizen.

**Prüfen:** Im Ordner liegen die Notizbücher als Unterordner.

```bash
ls ~/Dokumente/Joplin-Export
```

### 10. Mit einem Ordner synchronisieren (optional)

Joplin kann mit Joplin Cloud, Nextcloud, WebDAV und anderen Speichern synchronisieren. Am einfachsten ist ein Ordner, z. B. einer, den ein anderes Programm sichert oder auf andere Rechner kopiert. Wähle **Werkzeuge → Optionen → Synchronisation**, setze **Synchronisationsziel** auf **Dateisystem** und trage bei **Verzeichnis, mit dem synchronisiert werden soll (absoluter Pfad)** einen vollständigen Pfad ein, z. B. `/home/DEINNAME/JoplinSync`. Mit **Überprüfen der Synchronisationseinstellungen** testest du die Einstellung. Klicke danach auf **OK** und dann links unten auf **Synchronisieren**.

## Aktualisieren

Joplin meldet neue Versionen beim Start. Lade die neue `.deb`-Datei wie in Schritt 2 herunter, prüfe sie wie in Schritt 3 mit der Prüfsumme von der Release-Seite und installiere sie wie in Schritt 4. `apt` ersetzt dabei die alte Version. Notizen und Einstellungen bleiben erhalten.

## Deinstallieren

### 1. Joplin entfernen

`purge` entfernt das Programm, den Befehl `joplin` und das AppArmor-Profil.

```bash
sudo apt purge joplin
```

### 2. Notizen und Einstellungen löschen

**Achtung:** In diesen Ordnern liegen alle Notizen. Wer sie behalten will, exportiert sie vorher wie in Schritt 9.

```bash
rm -r ~/.config/joplin-desktop ~/.config/Joplin
```

### 3. Heruntergeladene Datei löschen

```bash
rm /tmp/joplin.deb
```

**Prüfen:** Das Paket ist nicht mehr installiert.

```bash
dpkg -l joplin
```
