---
title: "Jupyter book"
date: 2023-11-14T23:40:03+01:00
draft: false
type: "page"
menu: 
  main:
    name: "Jupyter book"
    weight: 25
    
---
# Jupyter book
Jupyter book ist ein Statischer Website Generator für Bücher. Jupyter book erstellt aus Jupyter Notebooks eine HTML-Datei.

## Jupyter book installieren bei Ubuntu
Installieren Sie Jupyter book mit folgendem Befehl.
```bash
sudo apt-get install python3 python3-pip python3-venv
```
## Venv erstellen thorsten
```bash
python3 -m venv thorsten // erstellt ein venv mit dem Namen thorsten
source thorsten/bin/activate // aktiviert das venv
```
## Jupyter book installieren
Installieren Sie Jupyter book mit folgendem Befehl.
```bash
pip3 install jupyter-book
```
## Jupyter book Erstellen
Erstellen Sie ein neues Projekt mit folgendem Befehl.
```bash
jupyter-book create jupyterbook
```
## Jupyter book starten
Starten Sie Jupyter book mit folgendem Befehl.
```bash
jupyter-book build jupyterbook
```
## Weblinks

- [Jupyter book](https://jupyterbook.org/)

