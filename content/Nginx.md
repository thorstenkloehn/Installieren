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

*  [Nginx Installieren](https://nginx.org/en/linux_packages.html#Ubuntu/) 
```bash
sudo apt install nginx
nginx -v # Version anzeigen

```
## Website Installieren
```bash
git clone https://github.com/thorstenkloehn/ahrensburg.city.git
git clone https://github.com/thorstenkloehn/Installieren.git
git clone https://github.com/thorstenkloehn/doc.git
git clone https://github.com/thorstenkloehn/Cplus.git
git clone https://github.com/thorstenkloehn/Rust.git
git clone https://github.com/thorstenkloehn/C.git
git clone https://github.com/thorstenkloehn/PostgreSql.git
git clone https://github.com/thorstenkloehn/Python.git
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
sudo certbot certonly --standalone -d c.ahrensburg-dev.de
sudo certbot certonly --standalone -d postgresql.ahrensburg-dev.de
sudo certbot certonly --standalone -d python.ahrensburg-dev.de
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
    root /home/thorsten/ahrensburg.city/public;

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
    root /home/thorsten/Installieren/public;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name doc.ahrensburg-dev.de;
    ssl_certificate /etc/letsencrypt/live/doc.ahrensburg-dev.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/doc.ahrensburg-dev.de/privkey.pem;
    root /home/thorsten/doc/public;

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
    root /home/thorsten/Cplus/public;

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
    root /home/thorsten/Rust/public;

    location / {
        try_files $uri $uri/ =404;
    }
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name c.ahrensburg-dev.de;
    ssl_certificate /etc/letsencrypt/live/c.ahrensburg-dev.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/c.ahrensburg-dev.de/privkey.pem;
    root /home/thorsten/C/public;

    location / {
        try_files $uri $uri/ =404;
    }
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name postgresql.ahrensburg-dev.de;
    ssl_certificate /etc/letsencrypt/live/postgresql.ahrensburg-dev.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/postgresql.ahrensburg-dev.de/privkey.pem;
    root /home/thorsten/PostgreSql/public;

    location / {
        try_files $uri $uri/ =404;
    }
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name python.ahrensburg-dev.de;
    ssl_certificate /etc/letsencrypt/live/python.ahrensburg-dev.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/python.ahrensburg-dev.de/privkey.pem;
    root /home/thorsten/Python/public;

    location / {
        try_files $uri $uri/ =404;
    }
}
```
## Start 

