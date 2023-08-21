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
sudo -u postgres -i
psql 
CREATE DATABASE osm;
\c osm
CREATE EXTENSION postgis
## Passwort für den Benutzer postgres setzen
\password postgres
\q
exit

```
## Datenbank mit osm2pgsql befüllen
```bash
osm2pgsql -c -d osm --slim -C 2000 --number-processes 2 path/to/osm/file.osm.pbf
```


