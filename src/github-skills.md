# GitHub Skills

GitHub Skills vermittelt GitHub-Arbeitsabläufe in Übungsrepositorys mit automatischen Rückmeldungen.

Die Anleitung gilt für Ubuntu 26.04 LTS (amd64). Es handelt sich um ein GitHub-Angebot, nicht um ein lokal installierbares Ubuntu-Programm. Ein Browser und ein GitHub-Konto reichen für den Einstieg. Die Adresse skills.github.com leitet derzeit zu GitHub Learn weiter.

## Installation

### 1. Konto öffnen

Melde dich im Browser bei GitHub an. Es werden hier keine Zugangsdaten in Terminalbefehlen benötigt.

### 2. Übung auswählen

Öffne das offizielle Repository [Introduction to GitHub](https://github.com/skills/introduction-to-github). Es eignet sich als erster Kurs.

### 3. Eigene Übungskopie anlegen

Verwende Copy Exercise in der Kursbeschreibung. Wähle dein eigenes Konto als Eigentümer und prüfe den Repositorynamen und die Sichtbarkeit, bevor du die Kopie auf GitHub erstellst. Eine öffentliche Kopie ist öffentlich lesbar; private Repositorys können Actions-Kontingente verbrauchen.

### 4. Kursstart kontrollieren

Öffne in deiner Kopie den Reiter Actions. Der vorbereitende Workflow muss erfolgreich enden; lade danach die Kursseite neu.

### 5. Ersten Kursschritt bearbeiten

Folge der Anleitung in deiner Kopie. Die Schritte werden durch Änderungen im Repository und passende Workflowläufe ausgewertet; bloßes Klonen aktiviert keinen eigenen Kurs.

## Optional lokal arbeiten

### 1. Paketlisten aktualisieren

Nur für die optionale lokale Git-Nutzung erforderlich.

````bash
sudo apt update
````

### 2. Git installieren

Stellt das Werkzeug für eine lokale Arbeitskopie bereit.

````bash
sudo apt install git
````

### 3. Klonadresse übernehmen

Öffne in deinem eigenen Übungsrepository Code und kopiere die HTTPS-Adresse. Klone deine Kopie, nicht nur die ursprüngliche Vorlage. Für ein öffentliches Repository ist zum Lesen keine Anmeldung nötig.

Der zu verwendende Befehl hat diese Form; ersetze DEIN-KONTO und DEIN-KURS vor dem Ausführen:

````bash
git clone https://github.com/DEIN-KONTO/DEIN-KURS.git
````

## Einrichtung prüfen

### 1. Kursfortschritt kontrollieren

In deiner Repositorykopie sollen die Kursanweisungen fortgeschrieben werden und passende Actions-Läufe erfolgreich sein. Für die optionale lokale Nutzung prüft der folgende Befehl zusätzlich Git.

````bash
git --version
````

## Entfernen

### 1. Kursautomatik bei Bedarf stoppen

Deaktiviere in der eigenen Repositorykopie die Kursworkflows unter Actions, wenn sie nicht weiterlaufen sollen.

### 2. Übungsrepository optional löschen

Öffne Settings → General → Danger Zone deiner eigenen Kopie und verwende Delete this repository nur nach einer Sicherung. Dies entfernt Repository und Kursfortschritt auf GitHub; prüfe die angezeigte Repositorykennung vor der Bestätigung.

### 3. Entfernung prüfen

Kontrolliere im eigenen GitHub-Konto, dass die Übungskopie entfernt beziehungsweise ihre Workflows deaktiviert sind. Lokale Klone bleiben bestehen und können separat gelöscht werden.

## Quellen und Lizenz

[GitHub Skills](https://skills.github.com/) und [offizieller Einstiegskurs](https://github.com/skills/introduction-to-github). Die Kursvorlage steht unter MIT. Für den GitHub-Dienst gelten dessen eigene Nutzungsbedingungen. Diese Anleitung legt selbst kein Repository an.
