# Munin

Munin zeichnet alle fünf Minuten Dutzende Messwerte eines Rechners auf, etwa Prozessorlast, Arbeitsspeicher, Plattenbelegung, Netzverkehr oder die Zahl der Prozesse, und macht daraus fertige Verlaufsgrafiken für Tag, Woche, Monat und Jahr. Die Grafiken liegen als einfache Webseiten vor, die ein Webserver wie [nginx](nginx.md) ausliefert. Munin ist damit schnell eingerichtet und eignet sich gut, um im Nachhinein zu sehen, wann und wie sich ein Rechner verändert hat. Für Live-Werte eignet sich dagegen [Cockpit](cockpit.md) oder [btop](htop-btop.md), für eine umfangreiche Überwachung mit Benachrichtigungen [Zabbix](zabbix.md).

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert Munin **2.0.76**. Mit `--no-install-recommends` kommen 20 Pakete hinzu, mit den Empfehlungen wären es über 80, darunter viele zusätzliche Messskripte, die für einen einzelnen Rechner nicht nötig sind.
- **Zwei Teile:** Der *Node* (`munin-node`) liefert die Messwerte des Rechners. Der *Master* (`munin`) holt sie per Cron-Job alle fünf Minuten ab, speichert sie in RRD-Dateien unter `/var/lib/munin` und erzeugt daraus Grafiken und HTML-Seiten unter `/var/cache/munin/www`.
- **Voraussetzung:** [nginx](nginx.md) muss installiert sein. Es liefert die fertigen Seiten unter `http://127.0.0.1:8082` aus.
- **Nur lokal:** Der Node nimmt zwar nur Anfragen von `127.0.0.1` an, lauscht aber zunächst auf Port **4949** an allen Schnittstellen. Schritt 5 beschränkt ihn ganz auf den eigenen Rechner.
- **Englische Oberfläche:** Seiten und Grafiktitel sind englisch, nur die Wochentage an den Achsen erscheinen deutsch.
- **Plugins:** Jede Grafik stammt von einem kleinen Messskript (*Plugin*). Bei der Installation prüft Munin, welche Plugins auf dem Rechner sinnvoll sind, und schaltet etwa 30 davon ein.
- **Version:** Getestet mit Munin **2.0.76** am 2. Oktober 2026.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Munin installieren

Installiert Master und Node. Der Node startet sofort, der Cron-Job des Masters läuft ab jetzt alle fünf Minuten.

```bash
sudo apt install --no-install-recommends munin munin-node
```

### 3. Prüfen, ob der Node läuft

```bash
systemctl is-active munin-node
```

**Prüfen:** Die Ausgabe lautet `active`.

### 4. Einen Messwert direkt abfragen

`munin-run` führt ein einzelnes Plugin aus und zeigt, was es an den Master liefern würde, hier die Systemlast.

```bash
sudo munin-run load
```

**Prüfen:** Die Ausgabe lautet z. B. `load.value 0.32`.

## Node einrichten

### 5. Node auf den eigenen Rechner beschränken

```bash
sudo nano /etc/munin/munin-node.conf
```

Suche mit <kbd>Strg</kbd>+<kbd>W</kbd> die Zeile

```text
host *
```

und ändere sie in

```text
host 127.0.0.1
```

Damit lauscht der Node nur noch auf der lokalen Adresse. Die Zeilen `allow ^127\.0\.0\.1$` und `allow ^::1$` darüber legen fest, wer Werte abholen darf. Sie bleiben unverändert. Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und schließe nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 6. Node neu starten

```bash
sudo systemctl restart munin-node
```

**Prüfen:** Die Zeile enthält `127.0.0.1:4949`.

```bash
ss -ltn | grep 4949
```

## Master einrichten

### 7. Rechner einen Namen geben

Ab Werk führt Munin den Rechner als `localhost.localdomain` in der Gruppe `localdomain`. Ein eigener Name macht die Seiten übersichtlicher.

```bash
sudo nano /etc/munin/munin.conf
```

Suche ganz unten den Block

```ini
[localhost.localdomain]
    address 127.0.0.1
    use_node_name yes
```

und ändere die erste Zeile z. B. in

```ini
[Zuhause;meinrechner]
```

Vor dem Semikolon steht die Gruppe, dahinter der Name des Rechners. Leerzeichen sind nicht erlaubt. `address` bleibt `127.0.0.1`, denn dort läuft der Node. Speichere und schließe nano.

### 8. Daten unter dem alten Namen löschen

Hat der Cron-Job seit der Installation schon gelaufen, liegen Daten unter dem alten Namen vor. Sie würden sonst als Reste liegen bleiben.

```bash
sudo rm -rf /var/lib/munin/localdomain /var/cache/munin/www/localdomain /var/lib/munin/state-localdomain-localhost.localdomain.storable
```

### 9. Ersten Durchlauf von Hand starten

Statt bis zu fünf Minuten auf den Cron-Job zu warten, startest du ihn einmal selbst. Er muss als Benutzer `munin` laufen, dem die Daten gehören. Der Durchlauf dauert etwa zehn Sekunden.

```bash
sudo -u munin munin-cron
```

**Prüfen:** Im Ordner der Webseiten liegt nun ein Unterordner mit dem Gruppennamen, z. B. `Zuhause`, neben vielen HTML-Dateien.

```bash
ls /var/cache/munin/www
```

## Webseiten ausliefern

### 10. nginx-Seite für Munin anlegen

Die Seiten sind fertiges HTML mit PNG-Grafiken. nginx muss sie nur ausliefern, PHP oder Ähnliches ist nicht nötig.

```bash
sudo nano /etc/nginx/sites-available/munin
```

Trage Folgendes ein:

```nginx
server {
    listen 127.0.0.1:8082;
    server_name localhost;

    root /var/cache/munin/www;
    index index.html;
}
```

Speichere und schließe nano.

### 11. Seite einschalten

```bash
sudo ln -s /etc/nginx/sites-available/munin /etc/nginx/sites-enabled/munin
```

### 12. Konfiguration prüfen

```bash
sudo nginx -t
```

**Prüfen:** Die Ausgabe endet mit `test is successful`.

### 13. nginx neu laden

```bash
sudo systemctl reload nginx
```

### 14. Seiten im Browser öffnen

```bash
xdg-open http://127.0.0.1:8082
```

**Prüfen:** Die Übersichtsseite zeigt links **Problems** mit **Critical (0)**, **Warning (0)** und **Unknown (0)**, darunter die Gruppe und die Kategorien wie **disk**, **network**, **processes** und **system**. Rechts steht deine Gruppe mit dem Rechnernamen.

## Grafiken ansehen

### 15. Rechner öffnen

Klicke auf den Rechnernamen, z. B. **meinrechner**. Die Seite zeigt alle Grafiken nach Kategorien geordnet, jeweils für den Tag und die Woche. Ein Klick auf eine Grafik öffnet sie zusätzlich für Monat und Jahr.

Kurz nach der Installation zeigen die Grafiken nur einen kurzen Strich am rechten Rand. Mit jedem Durchlauf alle fünf Minuten wächst die Linie, nach einigen Stunden ergibt sich ein aussagekräftiger Verlauf. Unter jeder Grafik stehen der aktuelle Wert (**Cur**) sowie Minimum, Durchschnitt und Maximum des Zeitraums.

### 16. Kategorien vergleichen

Die Links **d w m y** neben einer Kategorie in der linken Spalte zeigen eine Grafik aller Rechner für Tag, Woche, Monat oder Jahr. Bei nur einem Rechner ist das eine schnelle Möglichkeit, z. B. alle Netzwerkgrafiken der letzten Woche untereinander zu sehen.

## Plugins verwalten (optional)

### 17. Vorschläge ansehen

`munin-node-configure` prüft alle mitgelieferten Plugins. Die Spalte **Used** zeigt, ob ein Plugin eingeschaltet ist, **Suggestions**, ob es auf diesem Rechner funktionieren würde.

```bash
sudo munin-node-configure --suggest
```

Bei Plugins mit `no` steht in eckigen Klammern der Grund, z. B. dass ein Dienst nicht läuft.

### 18. Unnötiges Plugin abschalten

Eingeschaltete Plugins sind Verknüpfungen in `/etc/munin/plugins`. Nutzt der Rechner z. B. kein WLAN, entfernst du die beiden Grafiken der WLAN-Schnittstelle. Ersetze `wlp0s20f3` durch den Namen aus `ls /etc/munin/plugins`.

```bash
sudo rm /etc/munin/plugins/if_wlp0s20f3 /etc/munin/plugins/if_err_wlp0s20f3
```

### 19. Node neu starten

Der Node liest die Plugins nur beim Start ein.

```bash
sudo systemctl restart munin-node
```

**Prüfen:** Die beiden Plugins tauchen nicht mehr auf.

```bash
ls /etc/munin/plugins
```

## Wie geht es weiter?

- **nginx überwachen:** Die Plugins `nginx_request` und `nginx_status` zeigen Anfragen und Verbindungen von nginx. Sie brauchen in nginx eine lokale Statusseite mit `stub_status` unter `http://localhost/nginx_status`.
- **Weitere Rechner:** Auf dem anderen Rechner nur `munin-node` installieren, dort in `/etc/munin/munin-node.conf` die Adresse des Munin-Masters mit einer weiteren `allow`-Zeile erlauben und Port 4949 in der Firewall nur für diesen Master öffnen. Im Master bekommt jeder Rechner in `munin.conf` einen eigenen Block mit seiner `address`.
- **Grenzwerte:** In `munin.conf` lassen sich für einzelne Werte `warning`- und `critical`-Grenzen setzen. Überschreitungen erscheinen links unter **Problems**.
- **Dokumentation:** <https://guide.munin-monitoring.org> sowie `/usr/share/doc/munin/README.Debian.gz`

## Deinstallieren

### 1. nginx-Seite löschen

```bash
sudo rm /etc/nginx/sites-enabled/munin /etc/nginx/sites-available/munin
```

### 2. nginx neu laden

```bash
sudo systemctl reload nginx
```

### 3. Munin entfernen

Entfernt Master, Node und die mitinstallierten Pakete, darunter `rrdtool` und einige Perl-Bibliotheken. Prüfe vor dem Bestätigen die Liste, die `apt` anzeigt: Steht dort ein Paket, das du für etwas anderes brauchst, brich mit <kbd>n</kbd> ab und lass es im Befehl weg.

```bash
sudo apt purge munin munin-node munin-common munin-plugins-core rrdtool librrds-perl librrd8t64 libdbi1t64 liblog-log4perl-perl libhtml-template-perl libcgi-pm-perl libfile-copy-recursive-perl libio-socket-inet6-perl libsocket6-perl liblist-moreutils-perl liblist-moreutils-xs-perl libexporter-tiny-perl libnet-server-perl libnet-cidr-perl libio-multiplex-perl
```

`apt` meldet dabei, dass mehrere Ordner nicht leer sind. Sie enthalten die gesammelten Daten und werden im nächsten Schritt gelöscht.

### 4. Übrige Dateien löschen

Löscht Einstellungen, Messdaten, Webseiten und Protokolle. **Achtung:** Alle aufgezeichneten Verläufe sind danach unwiderruflich weg.

```bash
sudo rm -rf /etc/munin /var/lib/munin /var/cache/munin /var/log/munin /run/munin
```

### 5. Systembenutzer entfernen

Die Installation hat den Benutzer `munin` und eine gleichnamige Gruppe angelegt.

```bash
sudo deluser munin
```

**Prüfen:** Port 4949 ist frei, der Befehl gibt nichts aus.

```bash
ss -ltn | grep 4949
```
