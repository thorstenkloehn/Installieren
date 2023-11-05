---
title: "PythonhC"
date: 2023-10-19T13:49:43+02:00
draft: false
type: "page"
menu: 
  main:
    name: "PythonhC"
    weight: 11
    
---
# PythonhC
## Ubuntu Installation
```bash
sudo apt install python-is-python3 python3-dev
```
## Cmake 
```cmake
cmake_minimum_required(VERSION 3.27) # Für Python3 3.11
project(python_example) # Projektname
find_package(Python3 3.12 EXACT REQUIRED COMPONENTS Interpreter Development) # finden Python3 3.11
add_executable(python_example main.c) # Erstellen ausführbare Datei
target_include_directories(python_example PRIVATE ${Python3_INCLUDE_DIRS}) # include Python3 
target_link_libraries(python_example PRIVATE ${Python3_LIBRARIES}) # Linken Python3
```
```bash
# Abhängigkeiten installieren
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev \
xz-utils tk-dev libffi-dev liblzma-dev python3-openssl git

# Python 3.12 herunterladen
wget https://www.python.org/ftp/python/3.12.0/Python-3.12.0.tgz

# Archiv entpacken
tar -xvf Python-3.12.0.tgz

# In das Verzeichnis wechseln
cd Python-3.12.0

# Python konfigurieren und kompilieren
./configure
./configure --enable-optimizations
make
# Python installieren
sudo make altinstall
``
## 








