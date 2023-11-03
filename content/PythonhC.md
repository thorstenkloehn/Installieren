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

