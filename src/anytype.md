# Anytype

Anytype ist eine Notiz- und Wissensanwendung, die nach dem Local-First-Prinzip arbeitet: Alle Daten liegen verschlüsselt auf dem eigenen Rechner. Abgleichen zwischen Geräten geht Ende-zu-Ende-verschlüsselt über ein Peer-to-Peer-Netz. Inhalte sind **Objekte** mit Typen wie Seite, Aufgabe oder Buch, die sich untereinander verknüpfen lassen.

> **Teilweise getestet:** Installation samt AppArmor-Profil und der Start wurden unter Ubuntu 26.04 geprüft. Die Einrichtung in der Oberfläche (ab Schritt 6) wurde **nicht** durchgeklickt.

## Vorbemerkungen

- **Installation als .deb-Paket:** Ubuntu hat Anytype nicht in seinen Paketquellen. Das Projekt stellt ein `.deb`-Paket auf GitHub bereit, das keine zusätzlichen Pakete nachzieht. Es gibt Anytype auch als AppImage und als Flatpak.
- **Version:** Getestet mit Anytype **0.57.0**. Auf der Release-Seite erscheinen oft neuere Versionen mit dem Zusatz `-beta` oder `-alpha`. Diese Anleitung verwendet die letzte Version ohne solchen Zusatz.
- **AppArmor:** Anytype basiert auf Electron und braucht unter Ubuntu ein AppArmor-Profil. Das Paket legt es bei der Installation selbst an (`/etc/apparmor.d/anytype`) und entfernt es beim Deinstallieren wieder.
- **Keine Prüfsumme:** Das Projekt veröffentlicht zu den Downloads keine Prüfsummen. Lade das Paket deshalb nur von der offiziellen GitHub-Seite.
- **Schlüssel:** Anytype hat kein Passwort und kein klassisches Konto. Zugang zu den Daten gibt eine Schlüsselphrase aus mehreren Wörtern, die beim ersten Start erzeugt wird. Wer sie verliert und den Rechner verliert, kommt nicht mehr an seine Daten.

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

Lädt Anytype 0.57.0 (etwa 230 MB). Die aktuelle Version steht auf <https://github.com/anyproto/anytype-ts/releases>. Bei einer neueren Version ersetzt du die Nummer an beiden Stellen im Befehl.

```bash
curl -L -o anytype.deb https://github.com/anyproto/anytype-ts/releases/download/v0.57.0/anytype_0.57.0_amd64.deb
```

### 4. Anytype installieren

Installiert das Paket. Das `./` vor dem Dateinamen sagt `apt`, dass es eine Datei im aktuellen Ordner installieren soll. Das Programm landet in `/opt/Anytype`, der Befehl `anytype` in `/usr/bin`, dazu kommen ein Eintrag im Anwendungsmenü und das AppArmor-Profil.

```bash
sudo apt install ./anytype.deb
```

Erscheint am Ende ein Hinweis, dass der Benutzer `_apt` nicht auf die Datei zugreifen konnte, ist das bei Paketen im Home-Ordner normal und harmlos.

**Prüfen:** Das AppArmor-Profil ist geladen.

```bash
sudo aa-status | grep anytype
```

### 5. Heruntergeladene Datei löschen

Das Paket wird nach der Installation nicht mehr gebraucht.

```bash
rm anytype.deb
```

## Erste Schritte (nicht getestet)

### 6. Anytype starten

Starte Anytype über das Anwendungsmenü (Suche nach „Anytype“) oder im Terminal:

```bash
anytype
```

Beim ersten Start legt Anytype seinen Datenordner `~/.config/anytype` an. Das hat der Test bestätigt.

### 7. Tresor anlegen und Schlüssel sichern

Wähle beim ersten Start, dass du einen neuen Tresor (Vault) anlegen willst. Anytype zeigt dann die **Schlüsselphrase** an. Schreibe sie auf oder speichere sie in einem Passwortmanager. Mit ihr meldest du dich auf weiteren Geräten an oder stellst die Daten wieder her.

### 8. Erstes Objekt anlegen

Lege mit **+** ein neues Objekt an und wähle einen Typ, z. B. **Page** für eine Textseite oder **Task** für eine Aufgabe. Mit `/` öffnest du im Text ein Menü für Überschriften, Listen, Tabellen und Verknüpfungen zu anderen Objekten. Die Oberfläche lässt sich in den Einstellungen auf Deutsch umstellen.

### 9. Abgleich über das Netz (optional)

Standardmäßig gleicht Anytype die verschlüsselten Daten über das Netz des Herstellers ab, damit sie auf weiteren Geräten erscheinen. Wer das nicht möchte, kann in den Einstellungen einen Modus nur für das lokale Netz wählen oder einen eigenen Server angeben. Die Daten sind in jedem Fall so verschlüsselt, dass der Betreiber des Netzes sie nicht lesen kann.

## Wo liegt was?

- `/opt/Anytype` – das Programm.
- `~/.config/anytype` – Einstellungen und alle Daten, verschlüsselt.
- `/etc/apparmor.d/anytype` – das AppArmor-Profil.

## Aktualisieren

### 1. Neue Version installieren

Lade das neue `.deb`-Paket wie in den Schritten 2 und 3 herunter und installiere es wie in Schritt 4. `apt` ersetzt dabei die alte Version, die Daten bleiben erhalten. Anytype meldet neue Versionen auch selbst.

```bash
sudo apt install ./anytype.deb
```

## Deinstallieren

### 1. Anytype beenden

Schließe das Fenster von Anytype.

### 2. Anytype entfernen

Entfernt das Programm, den Menüeintrag, den Befehl `anytype` und das AppArmor-Profil.

```bash
sudo apt purge anytype
```

### 3. Daten löschen (optional)

Löscht alle Objekte und Einstellungen auf diesem Rechner. **Achtung:** Ohne Schlüsselphrase und ohne Abgleich über das Netz sind die Daten danach unwiderruflich verloren.

```bash
rm -rf ~/.config/anytype
```

**Prüfen:** Das AppArmor-Profil ist nicht mehr geladen, die Ausgabe ist leer.

```bash
sudo aa-status | grep anytype
```
