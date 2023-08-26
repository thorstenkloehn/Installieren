---
title: "PgAdmin"
date: 2023-08-27T00:30:41+02:00
draft: false
type: "page"
menu: 
  main:
    name: "Pgadmin"
    weight: 9
    
---

# Pgadmin
Pgadmin ist ein Tool um Datenbanken zu verwalten. Es ist eine grafische Oberfläche für die Datenbank. Es ist möglich Datenbanken zu erstellen, zu löschen, zu bearbeiten und vieles mehr.

## Installation von Pgadmin

### Ubuntu

Dieser Befehl lädt den Schlüssel herunter, der zum Signieren der Pakete verwendet wird.

```bash
curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg
```

Dieser Befehl fügt die Paketquelle hinzu.
  
  ```bash
  sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list && apt update'
```
Dieser Befehl installiert pgadmin4.

```bash
sudo apt install pgadmin4-desktop
```
