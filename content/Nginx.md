---
title: "Nginx"
date: 2023-08-20T00:48:21+02:00
draft: false
type: "page"
menu: 
  main:
    name: "Nginx"
    weight: 7
    
---

# Was ist Nginx?
Nginx ist ein Webserver, der sich durch seine hohe Performance auszeichnet. Er ist für viele Betriebssysteme verfügbar und kann als Reverse Proxy, Load Balancer, Mail Proxy und HTTP Cache verwendet werden. Nginx ist Open Source und wird unter der BSD-Lizenz veröffentlicht.

## Installation Nginx
```bash
sudo apt install nginx
```

### cerbort Installation
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### Zertifikat erstellen
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl stop nginx
sudo certbot certonly --standalone -d ahrensburg.city -d www.ahrensburg.city
sudo certbot certonly --standalone -d ahrensburg-dev.de -d www.ahrensburg-dev.de
sudo certbot certonly --standalone -d doc.ahrensburg-dev.de 
sudo certbot certonly --standalone -d cplus.ahrensburg-dev.de
sudo certbot certonly --standalone -d rust.ahrensburg-dev.de
```

### Nginx Konfiguration
```bash
sudo nano /etc/nginx/conf.d/ahrensburg.conf
```
### Nginx Konfiguration
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name ahrensburg.city;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ahrensburg.city;
    ssl_certificate /etc/letsencrypt/live/ahrensburg.city/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ahrensburg.city/privkey.pem;
    root /root/Startseite/public;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ahrensburg-dev.de;
    ssl_certificate /etc/letsencrypt/live/ahrensburg-dev.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ahrensburg-dev.de/privkey.pem;
    root /root/Installieren/public;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ahrensburg-dev.de;
    ssl_certificate /etc/letsencrypt/live/doc.ahrensburg-dev.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/doc.ahrensburg-dev.de/privkey.pem;
    root /root/doc/public;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cplus.ahrensburg-dev.de;
    ssl_certificate /etc/letsencrypt/live/cplus.ahrensburg-dev.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cplus.ahrensburg-dev.de/privkey.pem;
    root /root/Cplus/public;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rust.ahrensburg-dev.de;
    ssl_certificate /etc/letsencrypt/live/rust.ahrensburg-dev.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rust.ahrensburg-dev.de/privkey.pem;
    root /root/Rust/public;

    location / {
        try_files $uri $uri/ =404;
    }
}

```
