# AFFiNE

AFFiNE verbindet Dokumente, Whiteboard und Datenbanktabellen in einem Programm. Jede Seite lässt sich als Text schreiben oder als unendliche Zeichenfläche („Edgeless“) mit Notizzetteln, Formen und Verbindungen bearbeiten. Die Desktop-Version arbeitet lokal: Ohne Anmeldung liegen alle Daten auf dem eigenen Rechner.

> **Teilweise getestet:** Prüfsumme, Installation, Start und das Anlegen des lokalen Arbeitsbereichs wurden unter Ubuntu 26.04 geprüft. Die Arbeit in der Oberfläche (ab Schritt 7) wurde **nicht** durchgeklickt.

## Vorbemerkungen

- **Installation als .deb-Paket:** Ubuntu hat AFFiNE nicht in seinen Paketquellen. Das Projekt stellt ein `.deb`-Paket auf GitHub bereit, das keine zusätzlichen Pakete nachzieht. Es gibt AFFiNE auch als AppImage und als Flatpak.
- **Version:** Getestet mit AFFiNE **0.27.4**. Auf der Release-Seite erscheinen fast täglich Versionen mit dem Zusatz `canary`. Das sind Vorabversionen zum Testen. Diese Anleitung verwendet die als „Latest“ markierte stabile Version.
- **Keine AppArmor-Einrichtung nötig:** Anders als bei manchen anderen Electron-Programmen bringt das Paket eine Sandbox-Hilfe mit Sonderrechten mit (`chrome-sandbox` mit SUID-Bit). Ein eigenes AppArmor-Profil braucht es deshalb nicht.
- **Lokal oder Cloud:** Ohne Anmeldung legt AFFiNE einen lokalen Arbeitsbereich an. Mit einem Konto bei AFFiNE Cloud oder auf einem eigenen AFFiNE-Server lassen sich Arbeitsbereiche zusätzlich abgleichen und teilen. Ein eigener Server ist ohne Docker aufwendig und nicht Teil dieser Anleitung.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Paketstände kennt.

```bash
sudo apt update
```

### 2. In den Download-Ordner wechseln

Das Paket wird dort abgelegt und nach der Installation wieder gelöscht.

```bash
cd ~/Downloads
```

### 3. Paket herunterladen

Lädt AFFiNE 0.27.4 (etwa 165 MB). Die aktuelle stabile Version steht auf <https://github.com/toeverything/AFFiNE/releases/latest>. Bei einer neueren Version ersetzt du die Nummer an allen drei Stellen im Befehl.

```bash
curl -L -o affine.deb https://github.com/toeverything/AFFiNE/releases/download/v0.27.4/affine-0.27.4-stable-linux-x64.deb
```

### 4. Prüfsumme kontrollieren

Das Projekt veröffentlicht die Prüfsummen in der Datei `latest-linux.yml`, im Format SHA-512, geschrieben in Base64. Der erste Befehl zeigt die veröffentlichte Prüfsumme für das `.deb`-Paket, der zweite berechnet sie für die heruntergeladene Datei im selben Format.

```bash
curl -sL https://github.com/toeverything/AFFiNE/releases/download/v0.27.4/latest-linux.yml | grep -A1 "linux-x64.deb"
```

```bash
openssl dgst -sha512 -binary affine.deb | base64 -w0; echo
```

**Prüfen:** Die Zeichenfolge hinter `sha512:` stimmt mit der zweiten Ausgabe überein. Bei Version 0.27.4 beginnen beide mit `kSc2O7cLAXYmUuV/`.

### 5. AFFiNE installieren

Installiert das Paket. Das `./` vor dem Dateinamen sagt `apt`, dass es eine Datei im aktuellen Ordner installieren soll. Das Programm landet in `/usr/lib/affine`, der Befehl `affine` in `/usr/bin`, dazu kommt ein Eintrag im Anwendungsmenü.

```bash
sudo apt install ./affine.deb
```

Erscheint am Ende ein Hinweis, dass der Benutzer `_apt` nicht auf die Datei zugreifen konnte, ist das bei Paketen im Home-Ordner normal und harmlos.

**Prüfen:** Das Paket ist installiert.

```bash
dpkg -s affine | grep -E "^(Status|Version)"
```

### 6. Heruntergeladene Datei löschen

Das Paket wird nach der Installation nicht mehr gebraucht.

```bash
rm affine.deb
```

## Erste Schritte (nicht getestet)

### 7. AFFiNE starten

Starte AFFiNE über das Anwendungsmenü (Suche nach „AFFiNE“) oder im Terminal:

```bash
affine
```

Beim ersten Start legt AFFiNE seinen Datenordner `~/.config/AFFiNE` und darin einen lokalen Arbeitsbereich an. Das hat der Test bestätigt.

### 8. Seite schreiben

Lege mit **New Page** eine neue Seite an und schreibe los. Mit `/` öffnest du ein Menü mit Überschriften, Listen, Tabellen, Code-Blöcken und Verknüpfungen zu anderen Seiten.

### 9. Auf das Whiteboard wechseln

Oben auf der Seite schaltest du zwischen **Page** (Dokument) und **Edgeless** (Whiteboard) um. Im Whiteboard erscheinen die Textblöcke der Seite als Notizen, dazu kommen Formen, Pfeile, freies Zeichnen und Verbindungen. Beide Ansichten zeigen denselben Inhalt.

### 10. Sprache umstellen

Die Oberfläche lässt sich in den Einstellungen auf Deutsch umstellen.

## Wo liegt was?

- `/usr/lib/affine` – das Programm.
- `~/.config/AFFiNE` – Einstellungen.
- `~/.config/AFFiNE/workspaces/local` – die lokalen Arbeitsbereiche, je einer pro Unterordner mit einer SQLite-Datenbank `storage.db`.

## Aktualisieren

### 1. Neue Version installieren

Lade das neue `.deb`-Paket wie in den Schritten 2 bis 4 herunter, prüfe es und installiere es wie in Schritt 5. `apt` ersetzt dabei die alte Version, die Daten bleiben erhalten.

```bash
sudo apt install ./affine.deb
```

## Deinstallieren

### 1. AFFiNE beenden

Schließe das Fenster von AFFiNE.

### 2. AFFiNE entfernen

Entfernt das Programm, den Befehl `affine` und den Menüeintrag.

```bash
sudo apt purge affine
```

### 3. Daten löschen (optional)

Löscht Einstellungen und alle lokalen Arbeitsbereiche. **Achtung:** Nicht abgeglichene Seiten gehen dabei unwiderruflich verloren.

```bash
rm -rf ~/.config/AFFiNE
```

**Prüfen:** Das Paket ist nicht mehr installiert.

```bash
dpkg -s affine
```

Die Ausgabe meldet, dass das Paket nicht installiert ist.
