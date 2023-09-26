---
title: "Vorbereitung"
date: 2023-08-18T09:45:03+02:00
draft: false
type: "page"
menu: 
  main:
    name: "Vorbereitung"
    weight: 2
    
---

# Vorbereitung

## Aktualisieren

- Öffne Sie das Terminal und auf ihrem Ubuntu-Desktop
- Führen Sie folgenden Befehl aus,um System zu aktualisieren.
```bash
sudo apt-get update 
sudo apt-get upgrade
```
## Googel Chrome Installieren
firefox starten und folgende Seite öffnen
- [Download Google Chrome](https://www.google.com/intl/de_de/chrome/)
- Klicken Sie auf Download Chrome.
- Klicken Sie auf Akzeptieren und installieren.
- Klicken Sie auf Ausführen oder Speichern.
- Wenn Sie auf Speichern geklickt haben, doppelklicken Sie auf die Download-Datei.
- Starten Sie Chrome:
- Ubuntu: Ein Fenster wird angezeigt, in dem Sie auf Chrome öffnen      klicken können.
- Wenn Sie aufgefordert werden, dass Chrome Standardbrowser wird oder ob Sie Benachrichtigungen von Chrome erhalten möchten, wählen Sie Ja aus.
- Fertig! Chrome ist auf Ihrem Desktop und in Ihrem Anwendungs-Menü verfügbar.




## Git Installieren
```bash
sudo apt-get install git  gh
git config --global user.email "you@example.com"
git config --global user.name "Your Name"

```
### gh Konfigurieren

```bash
gh auth login
```
## Programmiersprachen Installieren

### Rust Installieren
```bash
sudo apt  install curl 
sudo apt install build-essential
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
### Nodejs Installieren
```bash
sudo apt-get install nodejs
```
### Nodejs Konfigurieren
```bash
sudo apt-get install npm
```

### Go Installieren
```bash
wget https://golang.org/dl/go1.16.7.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.16.7.linux-amd64.tar.gz
nano ~/.bashrc
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin
source ~/.bashrc
```
### Python Installieren
```bash
sudo apt-get install python-is-python3
```
#### Python Konfigurieren
```bash
sudo apt-get install python3-pip
```
#### venv
```bash
sudo apt-get install python3-venv
```
### venv Konfigurieren
```bash

python3 -m venv venv
source venv/bin/activate
```
### venv Deaktivieren
```bash
deactivate
```







