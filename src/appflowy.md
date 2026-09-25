# AppFlowy

AppFlowy ist eine freie Alternative zu Notion: ein Arbeitsbereich für Notizen, Dokumente, Tabellen, Kanban-Boards und Kalender in einem Programm. Die Daten liegen zunächst auf dem eigenen Rechner. Mit einem Konto bei AppFlowy Cloud oder einem eigenen AppFlowy-Server lassen sie sich zwischen Geräten abgleichen.

> **Teilweise getestet:** Installation, Start und das Anlegen des Datenordners wurden unter Ubuntu 26.04 geprüft. Die ersten Schritte in der Oberfläche (ab Schritt 6) wurden **nicht** durchgeklickt.

## Vorbemerkungen

- **Installation als .deb-Paket:** Ubuntu hat AppFlowy nicht in seinen Paketquellen. Das Projekt stellt aber ein `.deb`-Paket bereit. `apt` installiert es wie ein normales Paket und holt die fehlende Abhängigkeit `libkeybinder-3.0-0` automatisch nach. Außerdem gibt es AppFlowy als AppImage, als Flatpak und als Snap.
- **Version:** Getestet mit AppFlowy **0.14.5**.
- **Keine Prüfsumme:** Das Projekt veröffentlicht zu den Downloads keine Prüfsummen. Lade das Paket deshalb nur von der offiziellen GitHub-Seite.
- **Cloud oder lokal:** Beim ersten Start bietet AppFlowy die Anmeldung bei AppFlowy Cloud an (`beta.appflowy.cloud`), z. B. per E-Mail, GitHub oder Google. Ohne Anmeldung bleiben alle Daten auf dem Rechner.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Abhängigkeiten kennt.

```bash
sudo apt update
```

### 2. In den Download-Ordner wechseln

Das Paket wird dort abgelegt und nach der Installation wieder gelöscht.

```bash
cd ~/Downloads
```

### 3. Paket herunterladen

Lädt AppFlowy 0.14.5 (etwa 140 MB). Die aktuelle Version steht auf <https://github.com/AppFlowy-IO/AppFlowy/releases>. Bei einer neueren Version ersetzt du die Nummer an allen drei Stellen im Befehl.

```bash
curl -L -o appflowy.deb https://github.com/AppFlowy-IO/AppFlowy/releases/download/0.14.5/AppFlowy-0.14.5-linux-x86_64.deb
```

### 4. AppFlowy installieren

Installiert das Paket. Das `./` vor dem Dateinamen ist wichtig: Es sagt `apt`, dass es eine Datei im aktuellen Ordner installieren soll und nicht nach einem Paket in den Paketquellen suchen. Das Programm landet in `/usr/lib/AppFlowy`, dazu kommt ein Eintrag im Anwendungsmenü.

```bash
sudo apt install ./appflowy.deb
```

Erscheint am Ende ein Hinweis, dass der Benutzer `_apt` nicht auf die Datei zugreifen konnte, ist das bei Paketen im Home-Ordner normal und harmlos.

**Prüfen:** Das Paket ist installiert.

```bash
dpkg -s appflowy | grep -E "^(Status|Version)"
```

### 5. Heruntergeladene Datei löschen

Das Paket wird nach der Installation nicht mehr gebraucht.

```bash
rm appflowy.deb
```

## Erste Schritte (nicht getestet)

### 6. AppFlowy starten

Starte AppFlowy über das Anwendungsmenü (Suche nach „AppFlowy“) oder im Terminal:

```bash
/usr/lib/AppFlowy/AppFlowy
```

Beim ersten Start legt AppFlowy seinen Datenordner `~/.local/share/io.appflowy.appflowy` an. Das hat der Test bestätigt.

### 7. Anmelden oder lokal arbeiten

Der Startbildschirm bietet die Anmeldung bei AppFlowy Cloud an. Mit einem Konto werden die Daten zwischen Geräten abgeglichen. Wer alles nur auf diesem Rechner behalten möchte, wählt die Möglichkeit, ohne Anmeldung fortzufahren. Wie sie heißt und wo sie steht, ändert sich zwischen den Versionen.

### 8. Erste Seite anlegen

Lege in der Seitenleiste mit **+** eine neue Seite an. AppFlowy fragt nach der Art:

- **Document** – ein Textdokument. Mit `/` öffnest du ein Menü mit Überschriften, Listen, Tabellen, Bildern und mehr.
- **Grid** – eine Tabelle, ähnlich einer einfachen Datenbank.
- **Board** – ein Kanban-Board mit Karten in Spalten.
- **Calendar** – ein Kalender, dessen Einträge ebenfalls Datensätze sind.

Die Oberfläche lässt sich in den Einstellungen unter **Language** auf Deutsch umstellen.

## Wo liegt was?

- `/usr/lib/AppFlowy` – das Programm.
- `~/.local/share/io.appflowy.appflowy` – Einstellungen und alle Daten, darunter die Datenbanken mit den Seiten.

## Aktualisieren

### 1. Neue Version installieren

Lade das neue `.deb`-Paket wie in den Schritten 2 und 3 herunter und installiere es wie in Schritt 4. `apt` ersetzt dabei die alte Version, die Daten bleiben erhalten.

```bash
sudo apt install ./appflowy.deb
```

## Deinstallieren

### 1. AppFlowy beenden

Schließe das Fenster von AppFlowy.

### 2. AppFlowy entfernen

Entfernt das Programm und den Menüeintrag.

```bash
sudo apt purge appflowy
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt die Bibliothek `libkeybinder-3.0-0`, die nur für AppFlowy installiert wurde.

```bash
sudo apt autoremove
```

### 4. Daten löschen (optional)

Löscht alle Seiten und Einstellungen von AppFlowy. **Achtung:** Nicht mit der Cloud abgeglichene Daten gehen dabei unwiderruflich verloren.

```bash
rm -rf ~/.local/share/io.appflowy.appflowy
```

**Prüfen:** Das Paket ist nicht mehr installiert.

```bash
dpkg -s appflowy
```

Die Ausgabe meldet, dass das Paket nicht installiert ist.
