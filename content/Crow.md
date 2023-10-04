---
title: "Crow"
date: 2023-08-28T22:47:54+02:00
draft: false
type: "page"
menu: 
  main:
    name: "Crow"
    weight: 9
    
---

# Crow
## Vorbereitung
### Aktualisieren
- Öffne Sie das Terminal und auf ihrem Ubuntu-Desktop
- Führen Sie folgenden Befehl aus,um System zu aktualisieren.
```bash
sudo apt-get update
sudo apt-get upgrade
```
### Bibliotheken Installieren
```bash
sudo apt install build-essential cmake git libboost-all-dev libssl-dev 
sudo apt-get install libasio-dev
```
### Crow Installieren
```bash
git clone https://github.com/CrowCpp/Crow.git
cd Crow
mkdir build
cd build
cmake ..
make
sudo make install
```
### cmake Konfigur für Crow
```bash
find_package(crow CONFIG REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE crow::crow)
```









