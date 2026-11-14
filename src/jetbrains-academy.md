# JetBrains Academy Plugin

Das JetBrains Academy Plugin bindet Lernaufgaben und deren Prüfungen in JetBrains-IDEs ein.

Die Anleitung gilt für Ubuntu 26.04 LTS (amd64). Voraussetzung ist eine kompatible IDE, beispielsweise nach der [IntelliJ-IDEA-Anleitung](intellij-idea.md). Das Plugin ist kostenlos; IDE-Lizenz, einzelne Kurse und externe Angebote können andere Bedingungen haben.

## Installation

### 1. Paketlisten aktualisieren

Aktualisiert Ubuntu-Paketinformationen. Das Plugin selbst wird anschließend über den IDE-Marketplace installiert.

````bash
sudo apt update
````

### 2. IDE starten

Öffne die bereits installierte JetBrains-IDE über das Ubuntu-Anwendungsmenü.

### 3. Pluginverwaltung öffnen

Öffne Settings → Plugins. Dort verwaltet die IDE zusätzliche Funktionen.

### 4. Plugin suchen

Wechsle zu Marketplace und suche JetBrains Academy. Prüfe JetBrains als Anbieter und die Kennung com.jetbrains.edu. Ähnlich benannte Erweiterungen sind andere Produkte.

### 5. Plugin installieren

Klicke Install. Die IDE wählt eine passende Pluginversion; falls keine angeboten wird, prüfe zunächst die Kompatibilitätsliste im Marketplace.

### 6. IDE neu starten

Starte die IDE neu, wenn sie dazu auffordert, damit das Plugin geladen wird.

### 7. Kurs auswählen

Öffne den Lernbereich der IDE, je nach Version unter Learn beziehungsweise My Courses. Wähle einen passenden kostenlosen Kurs oder importiere einen eigenen Kurs. Für dessen Aufgaben muss die jeweilige Sprache eingerichtet sein; das Plugin ersetzt keinen Python-, Java- oder Rust-Compiler.

## Installation prüfen

### 1. Pluginstatus kontrollieren

Unter Settings → Plugins → Installed muss JetBrains Academy mit Versionsnummer und aktiviertem Status erscheinen.

### 2. Aufgabe prüfen

Öffne eine Aufgabe des ausgewählten Kurses und starte deren Prüfung. Kontrolliere, ob eine verständliche Rückmeldung erscheint. Ein angemeldetes Konto allein bestätigt keine funktionierende lokale Kurslaufzeit.

## Deinstallieren

### 1. Plugin entfernen

Wähle unter Settings → Plugins → Installed bei JetBrains Academy die Aktion Uninstall. Gespeicherte Kursprojekte bleiben als Dateien erhalten.

### 2. IDE neu starten

Damit wird das Plugin entladen.

### 3. Entfernung prüfen

Kontrolliere, dass JetBrains Academy nicht mehr in der Liste der installierten Plugins steht.

## Quellen und Lizenz

[Offizieller Marketplace-Eintrag](https://plugins.jetbrains.com/plugin/10081-jetbrains-academy) und [Quellcode](https://github.com/JetBrains/educational-plugin). Der veröffentlichte Quellcode steht unter Apache-2.0; Marketplace-Distribution und Dienste haben zusätzliche Nutzungsbedingungen.
