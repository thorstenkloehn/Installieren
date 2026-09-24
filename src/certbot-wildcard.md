# Wildcard-Zertifikat mit Certbot für nginx

Ein Wildcard-Zertifikat gilt für alle Subdomains einer Domain auf einmal, z. B. für `www.start.de`, `blog.start.de` und `wiki.start.de`. Neue Subdomains bekommen damit sofort HTTPS, ohne dass für jede ein eigenes Zertifikat nötig ist. Diese Anleitung holt ein kostenloses Wildcard-Zertifikat von Let's Encrypt mit Certbot und bindet es in nginx ein, am Beispiel `start.de`.

## Vorbemerkungen

- **Voraussetzung:** Ein Server, der aus dem Internet erreichbar ist, mit [nginx](nginx.md) und der Website aus der Anleitung [Statische Website mit nginx](nginx-statisch.md). Die Domain `start.de` gehört dir und zeigt per `A`-Eintrag auf den Server (dort Abschnitt „Im Internet veröffentlichen“, Schritte 1 bis 3).
- **Was `*.start.de` abdeckt:** Der Stern steht für genau **eine** Ebene. `blog.start.de` ist abgedeckt, `test.blog.start.de` nicht. Die Domain `start.de` selbst ist ebenfalls **nicht** enthalten. Deshalb beantragt diese Anleitung ein Zertifikat für beide Namen, `start.de` und `*.start.de`.
- **Nachweis über DNS:** Bei normalen Zertifikaten legt Certbot eine Datei auf den Webserver, die Let's Encrypt abruft. Für Wildcard-Zertifikate verlangt Let's Encrypt einen anderen Nachweis: einen `TXT`-Eintrag im DNS der Domain. Damit zeigst du, dass du die ganze Domain verwaltest und nicht nur einen Webserver.
- **Manueller Weg:** Diese Anleitung setzt den `TXT`-Eintrag von Hand in der Weboberfläche deines Domain-Anbieters. Das funktioniert bei jedem Anbieter. Der Nachteil: Das Zertifikat gilt derzeit 90 Tage, und auch die Verlängerung ist Handarbeit (Abschnitt „Verlängern“). Let's Encrypt verschickt keine Erinnerungs-E-Mails mehr. Trage dir den Termin deshalb selbst in den Kalender ein.
- **Automatisch geht es nur mit Plugin:** Für einige Anbieter gibt es Certbot-Plugins in apt, die den `TXT`-Eintrag selbst setzen und die Verlängerung automatisch erledigen, z. B. `python3-certbot-dns-netcup`, `python3-certbot-dns-cloudflare` oder `python3-certbot-dns-ovh`. Die ganze Liste zeigt `apt search certbot-dns`.

## Zertifikat beantragen

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Certbot und den DNS-Werkzeugen kennt.

```bash
sudo apt update
```

### 2. Certbot und DNS-Werkzeuge installieren

`certbot` beantragt das Zertifikat. `bind9-dnsutils` enthält den Befehl `dig`, mit dem du prüfst, ob der `TXT`-Eintrag schon im Internet sichtbar ist.

```bash
sudo apt install certbot bind9-dnsutils
```

**Prüfen:** Die Ausgabe nennt die Version, z. B. `certbot 4.0.0`.

```bash
certbot --version
```

### 3. Zertifikat anfordern

- `certonly` holt nur das Zertifikat und ändert nichts an nginx. Die Konfiguration schreibst du danach selbst.
- `--manual` mit `--preferred-challenges dns` wählt den Nachweis über einen `TXT`-Eintrag, den du von Hand setzt.
- `--cert-name start.de` legt den Namen fest, unter dem Certbot das Zertifikat ablegt: `/etc/letsencrypt/live/start.de/`.
- Die beiden `-d` nennen die Namen im Zertifikat. `'*.start.de'` steht in einfachen Anführungszeichen, damit die Shell den Stern nicht als Platzhalter für Dateinamen auswertet.

```bash
sudo certbot certonly --manual --preferred-challenges dns --cert-name start.de -d start.de -d '*.start.de'
```

Beim allerersten Aufruf fragt Certbot nach einer E-Mail-Adresse für wichtige Hinweise und nach den Nutzungsbedingungen von Let's Encrypt (mit <kbd>Y</kbd> zustimmen). Die Frage nach Werbe-E-Mails kannst du mit <kbd>N</kbd> beantworten.

### 4. Ersten TXT-Eintrag anlegen

Certbot zeigt jetzt einen Namen und einen Wert, etwa so:

```text
Please deploy a DNS TXT record under the name:

_acme-challenge.start.de.

with the following value:

<zufälliger Wert aus etwa 43 Zeichen>
```

**Noch nicht** <kbd>Enter</kbd> drücken. Öffne in der Weboberfläche deines Domain-Anbieters die DNS-Einstellungen von `start.de` und lege einen neuen Eintrag an:

| Feld | Eingabe |
|---|---|
| Typ | `TXT` |
| Name / Host | `_acme-challenge` (manche Anbieter wollen den vollen Namen `_acme-challenge.start.de`) |
| Wert / Inhalt | der Wert aus dem Terminal, genau abgeschrieben, am besten kopiert |
| TTL | der kleinste angebotene Wert, z. B. `300` Sekunden |

Speichere den Eintrag und drücke dann im Terminal <kbd>Enter</kbd>.

### 5. Zweiten TXT-Eintrag anlegen

Weil das Zertifikat zwei Namen enthält, zeigt Certbot einen **zweiten** Wert unter **demselben** Namen `_acme-challenge.start.de`. Lege dafür einen **weiteren** `TXT`-Eintrag an, mit gleichem Namen und dem neuen Wert. Den ersten Eintrag nicht ändern oder löschen, beide müssen gleichzeitig bestehen.

Drücke noch **nicht** <kbd>Enter</kbd>, sondern prüfe zuerst im nächsten Schritt, ob beide Einträge sichtbar sind.

### 6. TXT-Einträge prüfen

Öffne ein zweites Terminal. `dig` fragt hier gezielt einen öffentlichen DNS-Server (`1.1.1.1`) nach den `TXT`-Einträgen. So siehst du, was auch Let's Encrypt sehen wird.

```bash
dig +short TXT _acme-challenge.start.de @1.1.1.1
```

**Prüfen:** Die Ausgabe enthält **beide** Werte in Anführungszeichen. Erscheint nichts oder nur ein Wert, warte eine bis fünf Minuten und frage erneut. Manche Anbieter brauchen länger, bis Änderungen im Internet sichtbar sind.

### 7. Nachweis abschließen

Wechsle zurück ins erste Terminal und drücke <kbd>Enter</kbd>. Let's Encrypt prüft jetzt beide Einträge und stellt das Zertifikat aus.

**Prüfen:** Die Ausgabe enthält `Successfully received certificate.` und die Pfade `/etc/letsencrypt/live/start.de/fullchain.pem` und `privkey.pem`. Meldet Certbot `Incorrect TXT record` oder `No TXT record found`, war ein Eintrag noch nicht sichtbar oder falsch abgeschrieben. Dann Schritt 3 wiederholen. Certbot zeigt dabei neue Werte, die alten `TXT`-Einträge ersetzt du durch die neuen.

### 8. Zertifikat anzeigen

```bash
sudo certbot certificates
```

**Prüfen:** Beim Eintrag `Certificate Name: start.de` stehen `Domains: start.de *.start.de` und bei `Expiry Date` ein Datum in knapp 90 Tagen. Trage dir einen Termin etwa 30 Tage vorher für die Verlängerung ein.

### 9. TXT-Einträge entfernen

Die beiden `TXT`-Einträge werden nicht mehr gebraucht. Lösche sie in der Weboberfläche des Anbieters. Bei der Verlängerung verlangt Certbot ohnehin neue Werte.

## nginx einrichten

### 10. Bisherige Konfiguration sichern

Die folgenden Schritte ersetzen die Konfiguration von `start.de`. Die Kopie liegt außerhalb von `sites-enabled`, damit nginx sie nicht als zweite Website lädt.

```bash
sudo cp -p /etc/nginx/sites-available/start.de /root/start.de.vor-wildcard
```

### 11. Zertifikat als Baustein anlegen

Die beiden Zeilen, die auf das Zertifikat zeigen, kommen in eine eigene Datei. Jede Website unter `start.de` bindet sie mit einer `include`-Zeile ein. Das ist der eigentliche Vorteil des Wildcard-Zertifikats: Für eine neue Subdomain genügt diese eine Zeile.

- `fullchain.pem` – das Zertifikat samt Zwischenzertifikat von Let's Encrypt, das Browser zur Prüfung brauchen
- `privkey.pem` – der geheime Schlüssel. Er ist nur für `root` lesbar, nginx liest ihn beim Start mit Administratorrechten.

```bash
sudo nano /etc/nginx/snippets/ssl-start.de.conf
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
# Wildcard-Zertifikat für start.de und *.start.de
ssl_certificate     /etc/letsencrypt/live/start.de/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/start.de/privkey.pem;
```

### 12. Website auf HTTPS umstellen

Die Datei bekommt zwei `server`-Blöcke:

- **Der erste** nimmt alle Anfragen auf Port 80 an, für `start.de` und jede Subdomain (`*.start.de`), und leitet sie dauerhaft auf HTTPS um. `$host` behält den aufgerufenen Namen bei, `$request_uri` den Pfad.
- **Der zweite** ist die Website auf Port 443. `ssl` schaltet die Verschlüsselung ein, `http2 on` das schnellere Protokoll HTTP/2. nginx 1.28 erlaubt ab Werk nur die sicheren Verfahren TLS 1.2 und 1.3. Eigene Einstellungen dafür sind nicht nötig.

```bash
sudo nano /etc/nginx/sites-available/start.de
```

Die Datei hat schon Inhalt, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
# HTTP: alles auf HTTPS umleiten
server {
    listen 80;
    listen [::]:80;
    server_name start.de *.start.de;

    return 301 https://$host$request_uri;
}

# HTTPS: die Website start.de
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name start.de www.start.de;

    include snippets/ssl-start.de.conf;

    root /var/www/start.de/html;
    index index.html;

    access_log /var/log/nginx/start.de.access.log;
    error_log  /var/log/nginx/start.de.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;

    location ~* \.(css|js|png|jpe?g|gif|svg|webp|ico|woff2?)$ {
        expires 7d;
    }
}
```

## Beispiel: eine weitere Subdomain

Als Beispiel bekommt `test.start.de` eine eigene kleine Website, die dasselbe Zertifikat nutzt.

### 13. DNS-Eintrag für die Subdomain anlegen

Lege beim Domain-Anbieter einen `A`-Eintrag mit dem Namen `test` und der IPv4-Adresse des Servers an (bei IPv6 zusätzlich `AAAA`). Alternativ ein `A`-Eintrag mit dem Namen `*`: Dann zeigt jede beliebige Subdomain auf den Server.

**Prüfen:** Nach einigen Minuten erscheint die Adresse des Servers.

```bash
dig +short test.start.de @1.1.1.1
```

### 14. Ordner für die Subdomain anlegen

Wie in der Anleitung [Statische Website mit nginx](nginx-statisch.md) gehört der Ordner deinem Benutzer, damit du ohne `sudo` Dateien ablegen kannst.

```bash
sudo mkdir -p /var/www/test.start.de/html
```

```bash
sudo chown -R "$USER":"$USER" /var/www/test.start.de
```

### 15. Startseite anlegen

```bash
nano /var/www/test.start.de/html/index.html
```

Füge diese Zeile ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```html
<h1>test.start.de mit Wildcard-Zertifikat</h1>
```

### 16. Konfiguration für die Subdomain anlegen

Nur ein HTTPS-Block ist nötig. Die Umleitung von HTTP erledigt schon der erste Block aus Schritt 12, weil er für `*.start.de` gilt. Das Zertifikat kommt über dieselbe `include`-Zeile.

```bash
sudo nano /etc/nginx/sites-available/test.start.de
```

Füge diesen Inhalt ein, speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name test.start.de;

    include snippets/ssl-start.de.conf;

    root /var/www/test.start.de/html;
    index index.html;
}
```

### 17. Subdomain einschalten

```bash
sudo ln -s /etc/nginx/sites-available/test.start.de /etc/nginx/sites-enabled/test.start.de
```

### 18. Konfiguration testen und nginx neu laden

`&&` sorgt dafür, dass nginx nur neu geladen wird, wenn der Test erfolgreich war.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**Prüfen:** Die Ausgabe enthält `test is successful`. Meldet nginx `cannot load certificate`, stimmt der Pfad in Schritt 11 nicht mit dem aus Schritt 7 überein.

### 19. Firewall für HTTPS öffnen

Nur nötig, wenn `ufw` eingeschaltet ist. Das Profil `Nginx Full` öffnet Port 80 und 443.

```bash
sudo ufw allow 'Nginx Full'
```

## Testen

### 20. Umleitung auf HTTPS prüfen

```bash
curl -sI http://start.de/ | grep -E '^HTTP|^Location'
```

**Prüfen:** Die Ausgabe lautet `HTTP/1.1 301 Moved Permanently` und `Location: https://start.de/`.

### 21. Beide Websites über HTTPS abrufen

`curl` prüft dabei das Zertifikat. Wäre es ungültig oder passte nicht zum Namen, bräche der Befehl mit einer Fehlermeldung ab.

```bash
curl -sI https://start.de/ | head -n 1
```

```bash
curl -s https://test.start.de/
```

**Prüfen:** Die erste Ausgabe lautet `HTTP/2 200`, die zweite `<h1>test.start.de mit Wildcard-Zertifikat</h1>`.

### 22. Namen im Zertifikat anzeigen

`openssl s_client` baut eine Verbindung auf wie ein Browser, `openssl x509` zeigt die Namen, für die das gelieferte Zertifikat gilt.

```bash
openssl s_client -connect test.start.de:443 -servername test.start.de < /dev/null 2>/dev/null | openssl x509 -noout -ext subjectAltName
```

**Prüfen:** Die Ausgabe enthält `DNS:*.start.de` und `DNS:start.de`.

## Verlängern

Das Zertifikat gilt derzeit 90 Tage. Certbot schlägt die Verlängerung ab 30 Tage vor Ablauf vor, früher ist sie auch möglich. `sudo certbot renew` funktioniert bei manuell beantragten Zertifikaten **nicht**, weil Certbot den `TXT`-Eintrag nicht selbst setzen kann. Der automatische Verlängerungsdienst von Certbot meldet deshalb im Log für dieses Zertifikat einen Fehler. Das ist bei diesem Weg normal.

### 1. Ablaufdatum prüfen

```bash
sudo certbot certificates
```

**Prüfen:** Bei `Expiry Date` steht, wie viele Tage das Zertifikat noch gilt (`VALID: … days`).

### 2. Zertifikat neu anfordern

Derselbe Befehl wie in Schritt 3. Certbot erkennt das vorhandene Zertifikat und fragt, ob es erneuert werden soll: Wähle **Renew & replace the certificate**. Danach folgen wieder zwei `TXT`-Einträge mit neuen Werten. Gehe dabei wie in den Schritten 4 bis 7 vor und lösche danach die Einträge (Schritt 9).

```bash
sudo certbot certonly --manual --preferred-challenges dns --cert-name start.de -d start.de -d '*.start.de'
```

### 3. nginx neu laden

nginx liest das neue Zertifikat erst beim Neuladen. Die Pfade bleiben gleich, die Konfiguration muss nicht geändert werden.

```bash
sudo systemctl reload nginx
```

**Prüfen:** Das neue Ablaufdatum liegt wieder knapp 90 Tage in der Zukunft.

```bash
echo | openssl s_client -connect start.de:443 -servername start.de 2>/dev/null | openssl x509 -noout -enddate
```

## Prüfen der Installation

```bash
certbot --version
```

```bash
sudo nginx -T 2>/dev/null | grep 'include snippets/ssl-start.de.conf'
```

**Prüfen:** Der erste Befehl zeigt die Version von Certbot, der zweite zwei `include`-Zeilen, je eine pro Website.

## Deinstallieren

### 1. Subdomain ausschalten und löschen

```bash
sudo rm /etc/nginx/sites-enabled/test.start.de /etc/nginx/sites-available/test.start.de
```

**Achtung:** Löscht auch die Dateien der Test-Website.

```bash
sudo rm -r /var/www/test.start.de
```

### 2. Alte Konfiguration von start.de zurückholen

Stellt die HTTP-Konfiguration aus Schritt 10 wieder her.

```bash
sudo cp -p /root/start.de.vor-wildcard /etc/nginx/sites-available/start.de
```

### 3. Zertifikats-Baustein löschen

```bash
sudo rm /etc/nginx/snippets/ssl-start.de.conf
```

### 4. nginx testen und neu laden

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Zertifikat löschen

Entfernt Zertifikat, Schlüssel und Verlängerungseinstellungen unter `/etc/letsencrypt`. Certbot fragt zur Sicherheit nach.

```bash
sudo certbot delete --cert-name start.de
```

### 6. Sicherung löschen

```bash
sudo rm /root/start.de.vor-wildcard
```

### 7. DNS-Einträge aufräumen

Lösche beim Domain-Anbieter den `A`-Eintrag für `test` (oder `*`) aus Schritt 13 und eventuell noch vorhandene `TXT`-Einträge `_acme-challenge`.

### 8. Optional: Certbot entfernen

Nur ausführen, wenn keine andere Website ein Zertifikat von Certbot nutzt. `bind9-dnsutils` bleibt installiert, weil `dig` auch sonst nützlich ist.

```bash
sudo apt purge certbot
```

```bash
sudo apt autoremove
```

**Prüfen:** Es wird kein Zertifikat mehr angezeigt, bzw. der Befehl wird nicht mehr gefunden.

```bash
sudo certbot certificates
```
