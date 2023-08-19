---
title: "Drogon ++"
date: 2023-08-19T10:11:53+02:00
draft: false
type: "page"
menu: 
  main:
    name: "Drogon ++"
    weight: 6
    
---

# Drogon ++ Ubuntu
## Umgebung
```bash
sudo apt install git
sudo apt install gcc
sudo apt install g++
sudo apt install cmake
```
### jsoncpp
```bash
sudo apt install libjsoncpp-dev
```
### uuid
```bash
sudo apt install uuid-dev
```
### zlib
```bash
sudo apt install zlib1g-dev
```
### openssl
```bash 
sudo apt install openssl
sudo apt install libssl-dev
```
### Drogon C++ Installation
```bash
git clone https://github.com/drogonframework/drogon
cd drogon
git submodule update --init
mkdir build
cd build
cmake ..
make 
sudo make install
