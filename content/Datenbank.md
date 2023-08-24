---
title: "Datenbank"
date: 2023-08-19T10:32:27+02:00
draft: false
type: "page"
menu: 
  main:
    name: "Datenbank"
    weight: 5
    
---

# Datenbank
## PostgreSQL
### Installation
```bash
sudo apt-get install postgresql-all
```
## PosgreSQL Version zeigen
```bash
psql --version
```

## Postgis Installation in Ubuntu 23.04
```bash
sudo apt install postgis postgresql-15-postgis-3 postgresql-15-postgis-3-scripts
```
## Installation von osm2pgsql
```bash
sudo apt-get install osm2pgsql
```

## Datenbank erstellen
```bash
## Neuen Benutzer anlegen
sudo adduser thorsten
sudo usermod -aG sudo thorsten

## Benutzer thorsten zu Gruppe postgres hinzufügen


sudo -u postgres -i
createuser thorsten
createdb -E UTF8 -O thorsten thorsten
psql
\c thorsten
CREATE EXTENSION postgis;
CREATE EXTENSION hstore;
ALTER TABLE geometry_columns OWNER TO thorsten;
ALTER TABLE spatial_ref_sys OWNER TO thorsten;
\q
exit
## Passwort für den Benutzer postgres setzen
\password thorsten
\q
exit

```
## Datenbank mit osm2pgsql befüllen
```bash
wget https://download.geofabrik.de/europe/germany/schleswig-holstein-latest.osm.pbf
osm2pgsql  -d thorsten --create  -G --hstore -S --tag-transform-script  schleswig-holstein-latest.osm.pbf
```


## Datenbank Löschen
```bash
sudo -u postgres -i
psql
GRANT ALL PRIVILEGES ON DATABASE thorsten TO postgres;
drop database thorsten;
\q
```
