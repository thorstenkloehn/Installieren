# Docusaurus Live Codeblock

Docusaurus Live Codeblock zeigt bearbeitbaren React-Code mit unmittelbarer Vorschau.

Für Ubuntu 26.04 LTS auf amd64.  Verwende einen neuen Projektordner; bestehende Dateien werden bei den Beispielen teilweise überschrieben.

## Installation

### 1. Paketlisten aktualisieren

Lädt die Paketinformationen für die Installation.

````bash
sudo apt update
````

### 2. Grundwerkzeuge installieren

Installiert die Laufzeit und deren Paketwerkzeuge aus Ubuntu.

````bash
sudo apt install nodejs npm
````

### 3. Projektordner anlegen

Hält Dateien und Abhängigkeiten dieses Beispiels zusammen.

````bash
mkdir ~/docusaurus-live-lab
````

### 4. Projektordner öffnen

Die weiteren Befehle beziehen sich auf diesen Ordner.

````bash
cd ~/docusaurus-live-lab
````

### 5. Node.js prüfen

Ubuntu 26.04 liefert Node.js 22.22.1. Für diese Beispiele mindestens 22.12 verwenden; bei einer älteren aktiven Installation hier anhalten.

````bash
node --version
````

### 6. Paketverwaltung vorbereiten

Erzeugt die Liste der Projektabhängigkeiten. npm-Befehle ohne sudo ausführen.

````bash
npm init -y
````

### 7. Docusaurus-Pakete installieren

Verwendet für alle Docusaurus-Pakete denselben veröffentlichten Stand.

````bash
npm install @docusaurus/core@3.10.2 @docusaurus/preset-classic@3.10.2 @docusaurus/theme-live-codeblock@3.10.2 react@19 react-dom@19
````

### 8. Seitenordner anlegen

Eine eigene MDX-Seite genügt für die Demo.

````bash
mkdir -p src/pages
````

### 9. Konfiguration schreiben

Schaltet Dokumentation und Blog für diese reine Demoseite ab und aktiviert das Live-Theme.

````bash
cat > docusaurus.config.js <<'EOF'
module.exports = {
  title: 'React-Labor',
  url: 'https://example.org',
  baseUrl: '/',
  presets: [['classic', { docs: false, blog: false }]],
  themes: ['@docusaurus/theme-live-codeblock'],
  i18n: { defaultLocale: 'de', locales: ['de'] }
};
EOF
````

### 10. Live-Seite schreiben

Die Markierung live aktiviert die React-Vorschau. Das Beispiel benötigt keinen eigenen Ausführungsserver.

````bash
cat > src/pages/index.mdx <<'EOF'
import Layout from '@theme/Layout';

<Layout title="React ausprobieren">

# Mein React-Labor

Ändere den Text oder den Farbwert.

```jsx live
<button style={{ background: '#176b45', color: 'white', padding: 16 }}>
  Mein erster Versuch
</button>
```

</Layout>
EOF
````

### 11. Vorschau starten

Öffne http://127.0.0.1:3000. Ändere den Text im Live-Editor: die Schaltfläche soll sich sofort ändern. Strg + C beendet die Vorschau.

````bash
npx docusaurus start --host 127.0.0.1 --no-open
````

## Installation prüfen

### 1. Seite bauen

Erzeugt build/. Das bestätigt den MDX- und React-Bau; prüfe die Interaktion zusätzlich in der Vorschau.

````bash
npx docusaurus build
````

### 2. Paketstände prüfen

Die drei Docusaurus-Pakete sollen dieselbe Version haben.

````bash
npm ls @docusaurus/core @docusaurus/preset-classic @docusaurus/theme-live-codeblock
````

## Deinstallieren

Beende eine laufende Vorschau mit **Strg + C**. Sichere eigene Inhalte vor dem Löschen. Die über apt installierten Grundwerkzeuge bleiben für andere Programme erhalten.

### 1. Projekt entfernen

Löscht alle Dateien dieses Beispielprojekts einschließlich seiner Abhängigkeiten.

````bash
rm -rf -- ~/docusaurus-live-lab
````

### 2. Entfernung prüfen

Die Bestätigung erscheint nur, wenn der Ordner entfernt wurde.

````bash
test ! -e ~/docusaurus-live-lab && echo 'Projekt entfernt'
````

## Quellen und Lizenz

[Live-Theme](https://docusaurus.io/docs/api/themes/@docusaurus/theme-live-codeblock) und [interaktive Codeblöcke](https://docusaurus.io/docs/markdown-features/code-blocks#interactive-code-editor). Lizenz: MIT. Für ein vollständiges Dokumentationsprojekt siehe [Docusaurus](docusaurus.md).
