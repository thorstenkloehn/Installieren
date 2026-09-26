# Publii

Publii ist ein Desktop-Programm, mit dem man statische Websites und Blogs in einem Fenster schreibt und gestaltet, ohne Befehle oder Vorlagendateien. Es erzeugt fertiges HTML, zeigt eine Vorschau im Browser und kann die Website auf einen Server hochladen oder in einen Ordner schreiben.

## Vorbemerkungen

- **Kein apt- oder Snap-Paket:** Publii ist weder in den Ubuntu-Paketquellen noch im Snap Store enthalten. Die Anleitung verwendet die offizielle `.deb`-Datei von <https://getpublii.com/download/>.
- **Version:** Getestet mit Publii **0.47.9** unter Ubuntu 26.04.
- **Sprache:** Die Oberfläche gibt es nur auf Englisch (und Polnisch). Die Menünamen stehen deshalb hier auf Englisch. Die **Website** selbst kann trotzdem auf Deutsch eingestellt werden (Schritt 7).
- **Speicherort:** Publii legt alle Websites, Designs und Sicherungen im Ordner `~/Dokumente/Publii` ab. Die Programmeinstellungen liegen in `~/.config/Publii`.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Bibliotheken kennt, die Publii braucht.

```bash
sudo apt update
```

### 2. Publii herunterladen

Lädt das Paket (etwa 135 MB) in den Ordner `/tmp`. Die aktuelle Versionsnummer steht auf <https://getpublii.com/download/>. Bei einer neueren Version ersetzt du `0.47.9` im Befehl.

```bash
wget -O /tmp/publii.deb https://cdn.getpublii.com/Publii-0.47.9.deb
```

**Prüfen:** Die Datei ist rund 135 MB groß.

```bash
ls -lh /tmp/publii.deb
```

### 3. Publii installieren

Der Pfad mit `/` am Anfang sagt `apt`, dass es eine lokale Datei installieren soll. Fehlende Bibliotheken holt `apt` dabei aus den Ubuntu-Paketquellen. Das Paket legt das Programm nach `/opt/Publii`, den Befehl `Publii` nach `/usr/bin`, einen Eintrag ins Startmenü und ein AppArmor-Profil nach `/etc/apparmor.d/Publii`. Ohne dieses Profil würde Ubuntu die Sicherheits-Sandbox des Programms blockieren.

```bash
sudo apt install /tmp/publii.deb
```

**Prüfen:** Die Zeile beginnt mit `ii` und enthält `0.47.9`.

```bash
dpkg -l publii
```

### 4. Heruntergeladene Datei löschen

Das Paket ist installiert, die Datei wird nicht mehr gebraucht.

```bash
rm /tmp/publii.deb
```

## Erste Schritte

### 5. Publii starten

Starte Publii über das Startmenü (Suchbegriff „Publii“) oder im Terminal. Der Befehl beginnt mit einem großen `P`.

```bash
Publii
```

**Prüfen:** Das Fenster öffnet sich mit der Schaltfläche **Create your first website**. Meldungen im Terminal wie `vaInitialize failed` oder `DeprecationWarning` sind nur Hinweise und stören nicht.

### 6. Website anlegen

Klicke auf **Create your first website**. Trage unter **Website name** z. B. `Meine Website` und unter **Author name** deinen Namen ein. Lass das Design **Simple** ausgewählt und klicke auf **Create website**.

Links erscheint jetzt die Seitenleiste mit **Posts** (Beiträge), **Tags** (Schlagwörter), **Authors**, **Menus**, **Theme** (Design), **Settings** (Einstellungen), **Server** und **Tools & Plugins**.

### 7. Sprache der Website einstellen

Öffne links **Settings**. Wähle im Bereich **Basic settings** im Feld **Language** die Sprache Deutsch und klicke oben auf **Save Settings**. Diese Einstellung bestimmt die Sprache, in der das Design Datumsangaben und feste Beschriftungen ausgibt, und die Sprachangabe im HTML der Website.

### 8. Einen Beitrag schreiben

Öffne links **Posts** und klicke auf **Add new post**. Publii fragt, mit welchem Editor du schreiben möchtest:

- **WYSIWYG editor** – wie in einem Textverarbeitungsprogramm.
- **Block editor** – der Text besteht aus Blöcken (Absatz, Überschrift, Bild …).
- **Markdown editor** – für alle, die Markdown gewohnt sind.

Wähle einen Editor, gib oben einen Titel ein, z. B. `Mein erster Beitrag`, und schreibe darunter einen Text. Klicke dann auf **Publish post**.

**Prüfen:** Der Beitrag steht in der Liste unter **Posts**. Beiträge, die nur gespeichert, aber nicht veröffentlicht sind, führt Publii als **Drafts** (Entwürfe).

### 9. Vorschau ansehen

Klicke links unten auf **Preview your changes**. Publii baut die Website und öffnet sie im Standardbrowser.

**Prüfen:** Der Browser zeigt die Website mit dem Titel „Meine Website“ und deinem Beitrag.

### 10. Website in einen Ordner ausgeben

Um die fertigen HTML-Dateien selbst auf einen Webserver zu kopieren, stellst du Publii auf „manuelle Ausgabe“ um. Öffne links **Server** und wähle als Übertragungsart **Manual deployment**. Stelle **Output type** auf **Non-compressed catalog** und wähle unter **Output directory** einen leeren Ordner, z. B. `~/meine-website`. Trage bei **Website URL** die spätere echte Adresse ein und klicke auf **Save Settings**.

Klicke danach links unten auf **Sync your website**. Publii schreibt die komplette Website in den gewählten Ordner. Den Inhalt kann jeder Webserver ausliefern, zum Beispiel wie in [Statische Website mit nginx](nginx-statisch.md) beschrieben. Unter **Server** kann Publii die Website stattdessen auch direkt hochladen, z. B. per SFTP oder FTP, zu GitHub Pages, GitLab Pages, Netlify oder Google Cloud.

## Aktualisieren

Publii aktualisiert sich nicht selbst, weil es aus einer `.deb`-Datei ohne Paketquelle stammt. Zum Aktualisieren wiederholst du die Schritte 2 bis 4 mit der neuen Versionsnummer. `apt` ersetzt dabei die alte Version. Websites und Einstellungen in `~/Dokumente/Publii` bleiben erhalten.

**Prüfen:** `dpkg -l publii` zeigt die neue Versionsnummer.

## Deinstallieren

### 1. Publii beenden

Schließe das Publii-Fenster, damit keine Dateien mehr geöffnet sind.

### 2. Paket entfernen

Entfernt das Programm, den Startmenü-Eintrag, das AppArmor-Profil und den Befehl `Publii`.

```bash
sudo apt purge publii
```

**Prüfen:** Die Ausgabe meldet, dass kein Paket `publii` gefunden wurde.

```bash
dpkg -l publii
```

### 3. Programmeinstellungen löschen

Entfernt Zwischenspeicher und Fenstereinstellungen von Publii. Deine Websites sind davon nicht betroffen.

```bash
rm -r ~/.config/Publii
```

### 4. Websites löschen (optional)

Entfernt alle mit Publii angelegten Websites samt Beiträgen, Bildern und Sicherungen. **Achtung:** Das lässt sich nicht rückgängig machen. Wer die Websites behalten will, überspringt diesen Schritt oder kopiert den Ordner vorher.

```bash
rm -r ~/Dokumente/Publii
```

### 5. Nicht mehr benötigte Bibliotheken entfernen

Entfernt Pakete, die nur für Publii mitinstalliert wurden. Lies vor dem Bestätigen die Liste: Es sollten nur Bibliotheken darin stehen, keine Programme, die du selbst nutzt.

```bash
sudo apt autoremove
```
