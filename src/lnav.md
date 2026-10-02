# lnav

lnav (*Logfile Navigator*) ist ein Betrachter für Protokolldateien im Terminal. Er erkennt gängige Formate wie Syslog, das systemd-Journal oder die Zugriffsprotokolle von [nginx](nginx.md) selbstständig, färbt Fehler rot und Warnungen gelb ein und mischt mehrere Dateien nach Uhrzeit zu einer gemeinsamen Ansicht. Mit einem Tastendruck springst du zum nächsten Fehler, blendest Zeilen per Filter aus oder zeigst ein Balkendiagramm, wann wie viele Meldungen auftraten. Wer mehr wissen will, fragt die Protokolle sogar mit SQL ab, etwa welche Adressen am häufigsten auf die Website zugreifen.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert lnav **0.13.2**. Es ist ein einzelnes Paket ohne weitere Abhängigkeiten.
- **Leserechte:** Die meisten Dateien unter `/var/log` gehören der Gruppe `adm`. Der erste Benutzer, der bei der Installation von Ubuntu angelegt wurde, gehört dieser Gruppe an und kann sie ohne `sudo` lesen. Ob das bei dir so ist, zeigt `id -nG`. Fehlt `adm` in der Liste, brauchst du `sudo lnav`.
- **Nur lesen:** lnav verändert die Protokolle nicht. Es merkt sich Filter und die zuletzt angesehene Stelle in `~/.config/lnav`.
- **Englische Oberfläche:** Hilfe, Statuszeilen und Befehle sind englisch.
- **Version:** Getestet mit lnav **0.13.2** am 3. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. lnav installieren

```bash
sudo apt install lnav
```

### 3. Version prüfen

```bash
lnav -V
```

**Prüfen:** Die Ausgabe lautet `lnav 0.13.2`.

## Protokolle ansehen

### 4. Systemprotokoll öffnen

Ohne Angabe öffnet lnav das Systemprotokoll `/var/log/syslog`.

```bash
lnav
```

**Prüfen:** Das Terminal zeigt die Meldungen mit Datum und Uhrzeit, Fehler rot, Warnungen gelb. Die Ansicht steht am Ende, also bei den neuesten Meldungen, und neue Zeilen erscheinen laufend. Oben stehen Uhrzeit und Statuszeile, unten Hinweise zur Bedienung.

### 5. Durch die Meldungen bewegen

| Taste | Wirkung |
|-------|---------|
| <kbd>↑</kbd> <kbd>↓</kbd> | eine Zeile hoch oder runter |
| <kbd>Bild↑</kbd> <kbd>Bild↓</kbd> | eine Seite hoch oder runter |
| <kbd>g</kbd> / <kbd>G</kbd> | zum Anfang / zum Ende |
| <kbd>E</kbd> / <kbd>e</kbd> | zum vorigen / nächsten Fehler |
| <kbd>W</kbd> / <kbd>w</kbd> | zur vorigen / nächsten Warnung |
| <kbd>D</kbd> / <kbd>d</kbd> | 24 Stunden zurück / vor |
| <kbd>←</kbd> | zeigt am Zeilenanfang, aus welcher Datei die Meldung stammt |

Drücke zum Ausprobieren <kbd>E</kbd>: lnav springt zur letzten Fehlermeldung über der aktuellen Stelle. Steht die Ansicht am Ende und du drückst <kbd>e</kbd>, meldet die untere Zeile, dass es danach keinen Fehler mehr gibt.

### 6. Text suchen

Drücke <kbd>/</kbd>, tippe einen Suchbegriff wie `nginx` und bestätige mit <kbd>Enter</kbd>. Schon während des Tippens werden Treffer hervorgehoben. <kbd>n</kbd> springt zum nächsten, <kbd>N</kbd> zum vorigen Treffer. Der Suchbegriff ist ein regulärer Ausdruck, `fail|error` findet also beide Wörter.

### 7. Meldungen über die Zeit anzeigen

Drücke <kbd>i</kbd>. lnav zeigt ein Balkendiagramm mit der Zahl der Meldungen je Zeitabschnitt, aufgeteilt in normale Meldungen, Fehler und Warnungen. So fällt auf, wann sich Fehler gehäuft haben. <kbd>z</kbd> und <kbd>Z</kbd> zoomen hinein und hinaus. Ein weiterer Druck auf <kbd>i</kbd> führt zurück zu den Meldungen.

### 8. Hilfe aufrufen

<kbd>?</kbd> öffnet die eingebaute Hilfe mit allen Tasten und Befehlen. <kbd>q</kbd> schließt sie wieder.

### 9. lnav beenden

Drücke <kbd>q</kbd>. In einer Unteransicht wie dem Balkendiagramm führt <kbd>q</kbd> zuerst zurück zu den Meldungen, ein weiteres <kbd>q</kbd> beendet lnav.

## Mehrere Protokolle zusammen

### 10. Dateien gemeinsam öffnen

Gibst du mehrere Dateien an, sortiert lnav ihre Meldungen nach der Uhrzeit ineinander. So siehst du zum Beispiel, was im Systemprotokoll geschah, kurz bevor sich jemand per `sudo` angemeldet hat.

```bash
lnav /var/log/syslog /var/log/auth.log
```

Mit <kbd>←</kbd> blendest du am linken Rand ein, aus welcher Datei jede Zeile stammt. Auch Ordner lassen sich angeben, z. B. `lnav /var/log/nginx`. Gepackte ältere Dateien wie `access.log.2.gz` liest lnav ebenfalls.

### 11. systemd-Journal ansehen

Viele Dienste schreiben nur ins systemd-Journal. `journalctl` gibt es im JSON-Format aus, und lnav liest es über eine Pipe. Dieser Befehl zeigt alle Meldungen seit dem letzten Systemstart:

```bash
journalctl -b -o json | lnav
```

Auf einen Dienst beschränkt, z. B. nginx:

```bash
journalctl -u nginx -o json | lnav
```

## Filtern

### 12. Nur passende Zeilen zeigen

Befehle beginnen in lnav mit einem Doppelpunkt. Tippe in der laufenden Ansicht:

```text
:filter-in sudo
```

und bestätige mit <kbd>Enter</kbd>. Nun erscheinen nur noch Zeilen, die `sudo` enthalten. Die Statuszeile nennt, wie viele Zeilen ausgeblendet sind.

### 13. Zeilen ausblenden

Umgekehrt blendet `:filter-out` passende Zeilen aus, etwa die vielen Meldungen eines gesprächigen Programms:

```text
:filter-out google-chrome
```

Mehrere Filter wirken gleichzeitig.

### 14. Nur Fehler zeigen

```text
:set-min-log-level error
```

Damit erscheinen nur noch Meldungen der Stufe Fehler und schlimmer. `:set-min-log-level warning` lässt auch Warnungen durch.

### 15. Filter verwalten

<kbd>Tab</kbd> öffnet unten die Liste der Filter. Mit <kbd>↑</kbd> und <kbd>↓</kbd> wählst du einen aus, <kbd>Leertaste</kbd> schaltet ihn aus und ein, <kbd>D</kbd> löscht ihn. <kbd>Tab</kbd> oder <kbd>q</kbd> führt zurück zu den Meldungen. lnav merkt sich die Filter für das nächste Öffnen derselben Dateien.

## Mit SQL auswerten

### 16. SQL-Abfrage stellen

Abfragen beginnen mit einem Semikolon. Jedes erkannte Format ist eine Tabelle, das Systemprotokoll heißt `syslog_log`. Diese Abfrage zählt die Meldungen je Stufe:

```text
;SELECT log_level, count(*) AS anzahl FROM syslog_log GROUP BY log_level
```

Nach <kbd>Enter</kbd> erscheint das Ergebnis als Tabelle, z. B. mit den Zeilen `info`, `warning` und `error`. <kbd>q</kbd> führt zurück zu den Meldungen, <kbd>v</kbd> wieder zum Ergebnis.

### 17. Zugriffe auf nginx auswerten

Die Zugriffsprotokolle von nginx und Apache erscheinen als Tabelle `access_log` mit Spalten wie `c_ip` (Adresse des Besuchers), `cs_uri_stem` (aufgerufene Seite) und `sc_status` (Antwortcode). Weil die Datei nur für die Gruppe `adm` lesbar ist, gilt dasselbe wie bei Syslog.

```bash
lnav /var/log/nginx/access.log
```

```text
;SELECT c_ip, count(*) AS anzahl FROM access_log GROUP BY c_ip ORDER BY anzahl DESC LIMIT 10
```

Das Ergebnis listet die zehn Adressen mit den meisten Zugriffen.

### 18. Ohne Oberfläche auswerten

Mit `-n` läuft lnav ohne Bildschirmoberfläche und gibt das Ergebnis direkt aus. Das eignet sich für Skripte. `-c` übergibt den Befehl.

```bash
lnav -n -c ';SELECT log_level, count(*) AS anzahl FROM syslog_log GROUP BY log_level' /var/log/syslog
```

**Prüfen:** Es erscheint eine kleine Tabelle mit den Spalten **log_level** und **anzahl**.

Genauso funktionieren Filter. Dieser Befehl gibt nur die Fehlermeldungen aus:

```bash
lnav -n -c ':set-min-log-level error' /var/log/syslog
```

## Wie geht es weiter?

- **Weitere Formate:** `lnav -i extra` installiert zusätzliche Formatbeschreibungen aus dem Projekt, eigene Formate lassen sich als JSON-Datei hinzufügen.
- **Entfernte Rechner:** lnav öffnet Protokolle auch über SSH, z. B. `lnav benutzer@server:/var/log/syslog`. Auf dem anderen Rechner muss dafür nichts installiert sein.
- **Webzugriffe als Bericht:** Für eine Übersicht über die Besucher einer Website eignet sich [GoAccess](goaccess.md).
- **Dokumentation:** <https://docs.lnav.org> sowie die Hilfe mit <kbd>?</kbd> in lnav

## Deinstallieren

### 1. lnav entfernen

```bash
sudo apt purge lnav
```

### 2. Eigene Einstellungen löschen

lnav legt Einstellungen, gespeicherte Filter und den Verlauf in deinem Home-Ordner ab. Diese Dateien gehören zu keinem Paket.

```bash
rm -rf ~/.config/lnav
```

**Prüfen:** Der Befehl wird nicht mehr gefunden.

```bash
lnav -V
```
