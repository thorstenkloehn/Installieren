---
title: "Erstellen Hugo Website"
date: 2023-08-20T02:19:54+02:00
draft: false
type: "page"
menu: 
  main:
    name: "Hugo Website erstellen"
    weight: 8
    
---

# Hugo Website neu erstellen
```bash
hugo new site Testseite
cd Testseite
hugo mod init Testseite
hugo mod get github.com/thorstenkloehn/ahrensburg-themen
code .
```
## Konfiguration
```bash
nano hugo.toml
baseURL = "https://www.ahrensburg.city/"
theme = ["ahrensburg-themen"]

```
## Hugo Module aktualisieren
```bash
hugo mod get -u
```


## Hugo Themen mit Examples

```bash
hugo site new site TestseiteThorsten
git clone https://github.com/thorstenkloehn/ahrensburg-themen.git
cd themes/ahrensburg-themen
code .
```

## Hugo Themen erstellen
```bash
hugo new theme Testtheme
cd themes/Testtheme
code .
```



