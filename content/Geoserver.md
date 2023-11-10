---
title: "Geoserver"
date: 2023-11-09T20:49:29+01:00
draft: false
type: "page"
menu: 
  main:
    name: "Geoserver"
    weight: 12
    
---
# Geoserver
## Installation bei Ubuntu Server 20.04
```bash
sudo apt install openjdk-11-jdk
sudo apt install unzip

wget https://sourceforge.net/projects/geoserver/files/GeoServer/2.19.2/geoserver-2.19.2-bin.zip
unzip geoserver-2.19.2-bin.zip -d geoserver-2.19.2
sudo mv geoserver-2.19.2 /opt/thorsten 

sudo nano /etc/systemd/system/geoserver.service
```
## Geoserver.service
```bash
[Unit]
Description=Geoserver
After=network.target

[Service]
Type=simple
User=thorsten
WorkingDirectory=/opt/thorsten/bin
ExecStart=/opt/thorsten/bin/startup.sh
ExecStop=/opt/thorsten/bin/shutdown.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
## Geoserver starten
```bash
sudo systemctl daemon-reload
sudo systemctl enable geoserver.service
sudo systemctl start geoserver.service
sudo systemctl status geoserver.service
```
## Geoserver stoppen
```bash
sudo systemctl stop geoserver.service
```
## Geoserver deinstallieren
```bash
sudo systemctl stop geoserver.service
sudo systemctl disable geoserver.service
sudo rm /etc/systemd/system/geoserver.service
sudo systemctl daemon-reload
sudo rm -r /opt/thorsten/geoserver-2.19.2
```
## Nginx
```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d geoserver.ahrensburg.city
sudo nano /etc/nginx/conf.d/geoserver.conf
```
## Geoserver.conf
```bash
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name geoserver.ahrensburg.city;
    ssl_certificate /etc/letsencrypt/live/geoserver.ahrensburg.city/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/geoserver.ahrensburg.city/privkey.pem;
    location / {
        proxy_pass http://localhost:8080;
    }
}
```

## Geoserver konfigurieren
```bash
sudo nano /opt/thorsten/webapps/geoserver/WEB-INF/web.xml
```
## web.xml
### Was ist CSRF?
Cross-Site Request Forgery (CSRF) ist eine Art von Angriff, bei dem ein böswilliger Webanwendungsbetreiber versucht, Aktionen im Namen eines anderen Benutzers auszuführen, ohne dass dieser Benutzer dies beabsichtigt oder weiß. Dieser Angriff tritt auf, wenn eine böswillige Website einen Link, ein Bild oder ein Skript in eine vertrauenswürdige Website einfügt. Wenn ein Benutzer die vertrauenswürdige Website besucht, wird die böswillige Website ausgeführt, und die Aktionen für die vertrauenswürdige Website werden ausgeführt, ohne dass der Benutzer dies weiß. CSRF-Angriffe können auch über E-Mail-Nachrichten oder andere Formen von Nachrichten durchgeführt werden.

```bash
<context-param>
   <param-name>GEOSERVER_CSRF_WHITELIST</param-name>
   <param-value>geoserver.ahrensburg.city,karten.ahrensburg.city</param-value>
</context-param>



<context-param>
    <param-name>proxyBaseUrl</param-name>
    <param-value>https://geoserver.ahrensburg.city/geoserver</param-value>
</context-param>
```

## Alles Backup erstellen alle Daten
```bash
sudo systemctl stop geoserver.service
sudo tar -czvf geoserver.tar.gz /opt/thorsten
sudo systemctl start geoserver.service
```
## Alles Backup wiederherstellen
```bash
sudo systemctl stop geoserver.service
sudo rm -r /opt/thorsten
sudo tar -xzvf geoserver.tar.gz -C /
sudo systemctl start geoserver.service
```
### Kann man Leatflet mit Geoserver verbinden?
Ja, das geht. Hier ein Beispiel:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Leaflet GeoServer Beispiel</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
</head>
<body>
    <div id="mapid" style="width: 800px; height: 600px;"></div>
    <script>
        var map = L.map('mapid').setView([51.505, -0.09], 13);

        var wmsLayer = L.tileLayer.wms('http://localhost:8080/geoserver/wms', {
            layers: 'nurc:Arc_Sample'
        }).addTo(map);
    </script>
</body>
</html>
    
```










