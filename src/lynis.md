# Lynis

Lynis prüft, wie gut ein Linux-System abgesichert ist. Es geht in wenigen Minuten rund 270 Punkte durch: Startvorgang, Benutzerkonten, Dateirechte, Firewall, Webserver, Datenbanken, Kernel-Einstellungen und vieles mehr. Am Ende stehen eine Liste mit Warnungen und Vorschlägen und eine Kennzahl, mit der sich der Fortschritt verfolgen lässt. Lynis ändert dabei nichts am System. Es zeigt nur, wo du selbst nachbessern kannst.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Lynis **3.1.6**. Das empfohlene Zusatzpaket `menu` ist ein altes Menüsystem, das niemand braucht. Schritt 2 lässt es mit `--no-install-recommends` weg.
- **Täglicher Lauf ab Werk:** Das Paket schaltet einen Timer ein, der Lynis jede Nacht kurz nach Mitternacht unbemerkt laufen lässt und das Ergebnis in `/var/log` ablegt. Wer nur gelegentlich von Hand prüfen will, schaltet ihn in Schritt 4 ab.
- **Mit `sudo`:** Ohne `sudo` läuft Lynis in einer eingeschränkten Betriebsart, überspringt viele Prüfungen und legt seine Dateien im Home-Ordner ab.
- **Vorschläge, keine Vorschriften:** Viele Hinweise zielen auf Server mit hohen Anforderungen. Auf einem Arbeitsplatzrechner sind manche übertrieben, etwa ein Passwort für den Bootloader. Lies jeden Vorschlag und entscheide selbst.
- **Hinweis auf veraltete Version:** Lynis meldet am Anfang und am Ende, es sei älter als sechs Monate. Das bezieht sich auf die Fassung im Ubuntu-Paket und ist kein Fehler.
- **Sprache:** Überschriften und Statusangaben sind deutsch, Warnungen und Vorschläge englisch.
- **Version:** Getestet mit Lynis **3.1.6** am 4. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Lynis installieren

```bash
sudo apt install --no-install-recommends lynis
```

### 3. Version prüfen

```bash
lynis show version
```

**Prüfen:** Die Ausgabe lautet `3.1.6`.

### 4. Optional: Täglichen Lauf abschalten

```bash
sudo systemctl disable --now lynis.timer
```

**Prüfen:** Der Timer ist nicht mehr aktiv.

```bash
systemctl is-active lynis.timer
```

Die Ausgabe lautet `inactive`.

## System prüfen

### 5. Prüflauf starten

`--quick` lässt die Pausen zwischen den Abschnitten weg. Ohne die Option wartet Lynis nach jedem Abschnitt auf <kbd>Enter</kbd>.

```bash
sudo lynis audit system --quick
```

Der Lauf dauerte auf dem Testrechner zwei Minuten. Die Ausgabe ist rund 900 Zeilen lang, scrolle im Terminal zurück oder leite sie in ein Blätterprogramm:

```bash
sudo lynis audit system --quick | less -R
```

**Prüfen:** Zuerst erscheint ein Kopf mit Version, Betriebssystem und Rechnername. Danach folgen die Abschnitte, jeder mit `[+]` eingeleitet, z. B. `[+] Systemstart und Dienste`, `[+] Benutzer, Gruppen und Authentifizierung` oder `[+] Software: Webserver`.

### 6. Die Prüfzeilen lesen

Jede Zeile nennt einen Prüfpunkt und rechts in eckigen Klammern das Ergebnis. Die Farbe zeigt die Bewertung:

| Farbe | Bedeutung |
|-------|-----------|
| Grün | in Ordnung oder vorhanden |
| Gelb | Vorschlag, hier lässt sich etwas verbessern |
| Rot | Warnung, das solltest du dir ansehen |
| Weiß | reine Information, etwa `NICHT GEFUNDEN` für ein nicht installiertes Programm |

### 7. Das Ergebnis lesen

Am Ende steht der Abschnitt `Lynis 3.1.6 Results` mit zwei Listen. `Warnings` sind die dringenden Punkte, `Suggestions` die Vorschläge. Im Test waren es 5 Warnungen und 46 Vorschläge. Ein Eintrag sieht so aus:

```text
  * Install fail2ban to automatically ban hosts that commit multiple authentication errors. [DEB-0880]
    - Related resources
      * Website: https://cisofy.com/lynis/controls/DEB-0880/
```

Das Kürzel in eckigen Klammern ist die Kennung des Prüfpunkts. Unter der genannten Adresse erklärt das Projekt, was geprüft wird und wie man es behebt.

Ganz unten folgt die Zusammenfassung:

```text
  Hardening index : 62 [############        ]
  Tests performed : 269
```

Der *Hardening index* ist eine Kennzahl von 0 bis 100. Sie ist kein Zeugnis: Ein Wert um 60 ist für ein frisch installiertes Ubuntu üblich. Nützlich ist sie zum Vergleich, wenn du nach Änderungen erneut prüfst.

### 8. Einzelheiten zu einem Prüfpunkt ansehen

Dieser Befehl zeigt, was Lynis beim letzten Lauf zu einem Prüfpunkt festgestellt hat, hier zum Begrüßungstext des Mailservers:

```bash
sudo lynis show details MAIL-8818
```

**Prüfen:** Es erscheinen einige Zeilen mit Uhrzeit: was geprüft wurde, das Ergebnis und der Vorschlag. Bleibt die Ausgabe leer, kam der Prüfpunkt im letzten Lauf nicht vor.

## Ergebnisse weiterverwenden

Jeder Lauf schreibt zwei Dateien und überschreibt dabei die des vorigen Laufs.

### 9. Warnungen und Vorschläge aus dem Bericht holen

`/var/log/lynis-report.dat` enthält das Ergebnis in einer Form, die sich leicht auswerten lässt, je Zeile ein Wert.

```bash
sudo grep -E '^(warning|suggestion)\[\]=' /var/log/lynis-report.dat
```

**Prüfen:** Jede Zeile beginnt mit `warning[]=` oder `suggestion[]=`, gefolgt von Kennung und Text, getrennt durch senkrechte Striche.

Die Kennzahl allein liefert:

```bash
sudo grep '^hardening_index=' /var/log/lynis-report.dat
```

### 10. Das ausführliche Protokoll durchsuchen

`/var/log/lynis.log` hält jeden einzelnen Schritt fest. Hier findest du, warum Lynis zu einem Ergebnis kam.

```bash
sudo grep 'Warning:' /var/log/lynis.log
```

### 11. Kennzahl über die Zeit festhalten

Weil der Bericht bei jedem Lauf überschrieben wird, hängst du das Ergebnis mit Datum an eine eigene Datei an:

```bash
echo "$(date +%F) $(sudo grep '^hardening_index=' /var/log/lynis-report.dat)" >> ~/lynis-verlauf.txt
```

**Prüfen:** Die Datei enthält eine Zeile wie `2026-10-04 hardening_index=62`.

```bash
cat ~/lynis-verlauf.txt
```

## Gezielt prüfen und anpassen

### 12. Nur einzelne Prüfpunkte ausführen

Nach einer Änderung musst du nicht den ganzen Lauf wiederholen. `--tests` nimmt eine oder mehrere Kennungen in Anführungszeichen.

```bash
sudo lynis audit system --quick --tests "MAIL-8818 DEB-0880"
```

**Prüfen:** Die Zusammenfassung nennt bei `Tests performed` die Zahl der ausgeführten Prüfpunkte. Die Kennzahl ist bei einem solchen Teillauf ohne Aussage, und der Bericht aus Schritt 9 enthält danach nur noch diesen Teillauf.

Ganze Themen wählst du mit `--tests-from-group`, z. B. `--tests-from-group "firewalls ssh"`. Die Namen aller Gruppen zeigt `lynis show groups`.

### 13. Prüfpunkte dauerhaft überspringen

Vorschläge, die du bewusst nicht umsetzt, sollen nicht bei jedem Lauf wieder erscheinen. Eigene Einstellungen kommen in die Datei `custom.prf`. Sie ergänzt die mitgelieferte `default.prf`, die bei Updates überschrieben wird.

```bash
sudo nano /etc/lynis/custom.prf
```

Je Zeile ein Prüfpunkt, hier das Passwort für den Bootloader und ein Vorschlag für ein Zusatzpaket:

```text
skip-test=BOOT-5122
skip-test=DEB-0810
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

**Prüfen:** Lynis kennt jetzt zwei Profile.

```bash
sudo lynis show profiles
```

Die Ausgabe nennt `/etc/lynis/default.prf` und `/etc/lynis/custom.prf`. Beim nächsten Lauf fehlen die beiden Prüfpunkte in der Liste der Vorschläge.

### 14. Typische Vorschläge einordnen

Einige Hinweise tauchen auf fast jedem Ubuntu auf:

| Kennung | Vorschlag | Einordnung |
|---------|-----------|------------|
| `DEB-0880` | Fail2ban installieren | sinnvoll auf Servern, siehe [Fail2ban](fail2ban.md) |
| `BOOT-5122` | Passwort für den Bootloader GRUB | nur nötig, wenn Fremde an den Rechner kommen |
| `PKGS-7392` | angreifbare Pakete gefunden | Updates einspielen: `sudo apt update` und `sudo apt upgrade` |
| `MAIL-8818` | Mailserver nennt Programm und System im Begrüßungstext | geringe Bedeutung bei einem Mailserver, der nur lokal zustellt |
| `DEB-0810`, `DEB-0811` | Zusatzpakete, die vor Updates Hinweise anzeigen | Geschmackssache |

## Wie geht es weiter?

- **Lücken schließen:** Die drei wirksamsten Maßnahmen beschreiben [unattended-upgrades](unattended-upgrades.md), [UFW](ufw.md) und [Fail2ban](fail2ban.md). Prüfe danach erneut und vergleiche die Kennzahl.
- **Alle Einstellungen:** `/etc/lynis/default.prf` enthält jede Option mit Erklärung. `sudo lynis show settings` zeigt die wirksamen Werte.
- **Neuere Fassung:** Das Projekt bietet unter <https://packages.cisofy.com> eine eigene Paketquelle mit der jeweils aktuellen Version an. Nicht selbst getestet.
- **Dokumentation:** `man lynis` sowie <https://cisofy.com/documentation/lynis/>

## Deinstallieren

### 1. Lynis entfernen

`purge` schaltet auch den Timer ab und löscht `/etc/lynis` samt eigener `custom.prf` sowie Bericht und Protokoll in `/var/log`.

```bash
sudo apt purge lynis
```

### 2. Eigene Dateien löschen

Nur nötig, wenn du Schritt 11 ausgeführt hast.

```bash
rm -f ~/lynis-verlauf.txt
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
lynis show version
```
