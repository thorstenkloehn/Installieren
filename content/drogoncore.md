---
title: "Drogon core"
date: 2023-08-28T22:47:54+02:00
draft: false
type: "page"
menu: 
  main:
    name: "Drogon Core"
    weight: 9
    
---

# Drogon Core

## Voraussetzungen

```bash
sudo apt install git
sudo apt install gcc
sudo apt install g++
sudo apt install cmake

```
## jsoncpp
"Jsoncpp" ist eine C++ Bibliothek zum lesen und schreiben von JSON-Dateien.
```bash
sudo apt install libjsoncpp-dev
```
## uuid
uuid ist eine Bibliothek zum erzeugen von UUIDs.
```bash
sudo apt install uuid-dev
```
## zlib
zlib ist eine Bibliothek zum komprimieren von Daten.
```bash
sudo apt install zlib1g-dev
```
## OpenSSL (Optional, if you want to support HTTPS)
OpenSSL ist eine Bibliothek zum verschlüsseln von Daten.
```bash
sudo apt install openssl
sudo apt install libssl-dev
```

## Drogon Installieren

```bash
git clone https://github.com/drogonframework/drogon
cd drogon
git submodule update --init
mkdir build
cd build
cmake ..
make 
sudo make install
```
## Drogon Cmake Einstellungen
### CMakeLists.txt herstellen
```bash
cmake_minimum_required(VERSION 3.5)

project(drogon-core)

set(CMAKE_CXX_STANDARD 17)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Wpedantic")

add_executable(drogon-core main.cpp)

find_package(Drogon CONFIG REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE Drogon::Drogon)
```





