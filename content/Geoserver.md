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
## Geoserver Konfiguration
```bash
sudo nano /opt/thorsten/geoserver-2.19.2/bin/startup.sh
```





