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


### Ubuntu 20.04 Lts gh installieren
```bash
type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
&& sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y
```
#### Webadresse ist
- [Download gh](https://cli.github.com/)

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






