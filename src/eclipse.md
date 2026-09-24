# Eclipse IDE

Eclipse ist eine kostenlose, quelloffene Entwicklungsumgebung (IDE), die vor allem für Java genutzt wird. Über Erweiterungen (Plugins) lässt sie sich auch für viele andere Sprachen und Aufgaben einsetzen, etwa C/C++, PHP oder Webentwicklung.

## Vorbemerkungen

- **Kein apt-Paket:** Eclipse ist in den aktuellen Ubuntu-Paketquellen nicht enthalten. Diese Anleitung installiert Eclipse deshalb als Snap. Das Snap wird von der Eclipse Foundation selbst veröffentlicht und enthält die Variante „Eclipse IDE for Java Developers“.
- **Versionsnamen:** Eclipse erscheint viermal im Jahr. Die Versionen heißen nach Jahr und Monat, z. B. `2026-09`.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuelle Version des Java-Entwicklungspakets im nächsten Schritt kennt.

```bash
sudo apt update
```

### 2. Java-Entwicklungspaket (JDK) installieren

Eclipse braucht ein JDK, um deine Java-Programme zu übersetzen und auszuführen. `default-jdk` installiert die aktuelle Java-Version mit Langzeitunterstützung aus den Ubuntu-Paketquellen (derzeit Java 25). Ist es schon vorhanden (z. B. aus der [IntelliJ-IDEA-Anleitung](intellij-idea.md)), meldet `apt` das nur.

```bash
sudo apt install default-jdk
```

**Prüfen:** Die Ausgabe nennt die Java-Version, z. B. `javac 25`.

```bash
javac -version
```

### 3. Eclipse installieren

Installiert Eclipse als Snap. `--classic` ist nötig, weil eine IDE uneingeschränkt auf deine Dateien, das JDK und andere Programme zugreifen muss.

```bash
sudo snap install eclipse --classic
```

**Prüfen:** Die Ausgabe zeigt Name, Version (z. B. `2026-09`) und als Herausgeber `eclipsefoundation`.

```bash
snap list eclipse
```

## Erste Schritte

### 4. Eclipse starten

Startet Eclipse. Alternativ findest du das Programm im Anwendungsmenü unter „Eclipse“.

```bash
eclipse &
```

### 5. Arbeitsbereich (Workspace) festlegen

Beim Start fragt Eclipse nach einem Ordner für den **Workspace**. Darin liegen deine Projekte und die Einstellungen, die nur für diesen Arbeitsbereich gelten. Der Vorschlag `~/eclipse-workspace` ist in Ordnung. Setze einen Haken bei **Use this as the default and do not ask again**, wenn die Frage nicht bei jedem Start erscheinen soll, und klicke auf **Launch**.

**Prüfen:** Es erscheint die Willkommensseite von Eclipse. Sie lässt sich über das **×** auf ihrem Reiter schließen.

### 6. JDK in Eclipse auswählen

Damit Eclipse das in Schritt 2 installierte JDK verwendet. Öffne **Window → Preferences → Java → Installed JREs**. Klicke auf **Search…**, wähle den Ordner `/usr/lib/jvm` und bestätige. Setze anschließend den Haken beim gefundenen Eintrag (z. B. `java-25-openjdk-amd64`) und klicke auf **Apply and Close**.

### 7. Erstes Projekt anlegen

Wähle **File → New → Java Project**, gib einen Projektnamen ein (z. B. `Hallo`) und klicke auf **Finish**. Lege danach mit einem Rechtsklick auf den Ordner `src` → **New → Class** eine Klasse `Main` an und setze dabei den Haken bei `public static void main(String[] args)`. Schreibe in die `main`-Methode:

```java
System.out.println("Hallo Eclipse");
```

**Prüfen:** Mit <kbd>Strg</kbd>+<kbd>F11</kbd> startest du das Programm. Unten im Fenster **Console** erscheint `Hallo Eclipse`.

### 8. Die wichtigsten Tastenkürzel kennenlernen

| Tasten | Wirkung |
|---|---|
| <kbd>Strg</kbd>+<kbd>3</kbd> | Schnellzugriff: Befehle, Ansichten und Einstellungen über ihren Namen suchen |
| <kbd>Strg</kbd>+<kbd>Leertaste</kbd> | Codevervollständigung |
| <kbd>Strg</kbd>+<kbd>1</kbd> | Lösungsvorschläge für die markierte Stelle anzeigen |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>R</kbd> | Datei im Workspace schnell öffnen |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>T</kbd> | Java-Klasse schnell öffnen |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>F</kbd> | Code formatieren |
| <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>O</kbd> | Imports aufräumen |
| <kbd>Alt</kbd>+<kbd>Umschalt</kbd>+<kbd>R</kbd> | Umbenennen (überall im Projekt) |
| <kbd>Strg</kbd>+<kbd>F11</kbd> | Programm ausführen |
| <kbd>F11</kbd> | Programm im Debugger ausführen |

## Optional: Deutsche Oberfläche

Eclipse selbst ist nur auf Englisch. Deutsche Übersetzungen liefert das Projekt **Eclipse Babel** als Erweiterung. Die Übersetzung ist allerdings nicht vollständig, einige Menüs und Meldungen bleiben englisch.

### 9. Sprachpaket installieren

Öffne **Help → Install New Software…**. Trage bei **Work with** die folgende Adresse ein und drücke <kbd>Enter</kbd>:

```text
https://download.eclipse.org/technology/babel/update-site/latest/
```

Klappe in der Liste den Eintrag **Babel Language Packs in German** auf, setze den Haken bei **Babel Language Pack for eclipse in German** und klicke auf **Next**, dann **Finish**. Eclipse fragt nach dem Vertrauen in die Quelle und die Lizenz: beides bestätigen. Zum Schluss Eclipse neu starten.

**Prüfen:** Das Menü **File** heißt jetzt **Datei**.

## Aktualisieren

Snaps aktualisieren sich automatisch im Hintergrund. Sofort aktualisieren kannst du mit:

```bash
sudo snap refresh eclipse
```

## Deinstallieren

### 1. Eclipse entfernen

Entfernt das Snap. `--purge` verhindert, dass Snap vorher eine Sicherungskopie der Snap-Daten anlegt.

```bash
sudo snap remove --purge eclipse
```

### 2. Einstellungen und installierte Erweiterungen entfernen

Eclipse speichert programmweite Einstellungen und nachinstallierte Erweiterungen (z. B. das Sprachpaket) in `~/.eclipse` und `~/snap/eclipse`.

```bash
rm -rf ~/.eclipse ~/snap/eclipse
```

### 3. Optional: Workspace entfernen

**Achtung:** Der Workspace enthält deine Projekte. Nur löschen, wenn du sie nicht mehr brauchst oder vorher gesichert hast.

```bash
rm -rf ~/eclipse-workspace
```

### 4. Optional: JDK entfernen

Nur ausführen, wenn kein anderes Programm (z. B. IntelliJ IDEA) Java braucht.

```bash
sudo apt purge default-jdk
```

```bash
sudo apt autoremove
```

**Prüfen:** Die Ausgabe meldet, dass kein Snap namens `eclipse` installiert ist.

```bash
snap list eclipse
```
