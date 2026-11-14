# xterm.js mit node-pty

xterm.js zeichnet ein Terminal im Browser; node-pty verbindet es mit einer echten Shell auf dem Ubuntu-Rechner.

Beide Bibliotheken sind freie Software unter MIT: [xterm.js](https://github.com/xtermjs/xterm.js) und [node-pty](https://github.com/microsoft/node-pty). Sie ergeben erst mit eigenem Verbindungscode eine Anwendung. Das folgende selbst geschriebene Beispiel ist ein lokaler Versuch mit einer festen Größe von 80 Spalten und 24 Zeilen.

Die Shell besitzt sämtliche Rechte deines Benutzerkontos. Starte das Beispiel ohne sudo. Loopback-Bindung, ein zufälliger Sitzungsschlüssel und die Prüfung des Browser-Ursprungs begrenzen den Zugang. Es ist kein Mehrbenutzerdienst und keine Sandbox. Für einen Kurs mit fremdem Code braucht es eine andere Betriebsarchitektur; beachte die [Sicherheitshinweise](https://xtermjs.org/docs/guides/security/).

## Einrichten

1. Aktualisiere die Paketlisten.

   ```bash
   sudo apt update
   ```

2. Installiere Node.js, npm und die Werkzeuge für native Erweiterungen.

   ```bash
   sudo apt install nodejs npm build-essential python3 nano
   ```

3. Prüfe die Node-Version. Verwende eine von node-pty unterstützte Node-LTS-Version; bei Ubuntu 26.04 ist Node 22 vorgesehen. Eine ungewöhnlich alte oder manuell installierte Version muss vorher korrigiert werden.

   ```bash
   node --version
   ```

4. Lege einen neuen Projektordner an. Der Name darf noch nicht für ein anderes Projekt verwendet werden.

   ```bash
   mkdir ~/browserterminal-lokal
   ```

5. Wechsle in den Projektordner.

   ```bash
   cd ~/browserterminal-lokal
   ```

6. Erzeuge die npm-Projektbeschreibung.

   ```bash
   npm init -y
   ```

7. Installiere die Bibliotheken im Benutzerprojekt. [xterm.js empfiehlt npm](https://xtermjs.org/docs/guides/download/); node-pty enthält native Bestandteile. Bewahre die entstehende package-lock.json auf, um die aufgelösten Versionen festzuhalten.

   ```bash
   npm install --save-exact @xterm/xterm node-pty ws
   ```

8. Öffne die neue Serverdatei und füge den folgenden eigenen Code ein. Speichere mit **Strg+O**, **Enter** und beende nano mit **Strg+X**.

   ```bash
   nano server.cjs
   ```

   ```javascript
   'use strict';
   const http = require('node:http');
   const fs = require('node:fs');
   const path = require('node:path');
   const { randomBytes } = require('node:crypto');
   const { WebSocketServer, WebSocket } = require('ws');
   const pty = require('node-pty');

   const origin = 'http://127.0.0.1:8090';
   const token = randomBytes(32).toString('hex');
   const assets = new Map([
     ['/', ['index.html', 'text/html; charset=utf-8']],
     ['/xterm.js', ['node_modules/@xterm/xterm/lib/xterm.js', 'text/javascript']],
     ['/xterm.css', ['node_modules/@xterm/xterm/css/xterm.css', 'text/css']]
   ]);
   const server = http.createServer((req, res) => {
     const asset = assets.get(req.url);
     if (req.headers.host !== '127.0.0.1:8090' || !asset || req.method !== 'GET') {
       res.writeHead(404).end();
       return;
     }
     res.setHeader('Content-Type', asset[1]);
     res.setHeader('Cache-Control', 'no-store');
     res.setHeader('X-Frame-Options', 'DENY');
     fs.createReadStream(path.join(__dirname, asset[0]))
       .on('error', () => res.destroy())
       .pipe(res);
   });
   const sockets = new WebSocketServer({ noServer: true, maxPayload: 16384 });
   server.on('upgrade', (req, socket, head) => {
     const url = new URL(req.url, origin);
     if (req.headers.host !== '127.0.0.1:8090' ||
         req.headers.origin !== origin ||
         url.pathname !== '/shell' || url.searchParams.get('token') !== token) {
       socket.destroy();
       return;
     }
     sockets.handleUpgrade(req, socket, head, ws => {
       sockets.emit('connection', ws);
     });
   });
   sockets.on('connection', ws => {
     let shell;
     try {
       shell = pty.spawn('/bin/bash', ['--noprofile', '--norc'], {
         name: 'xterm-256color', cols: 80, rows: 24,
         cwd: process.env.HOME, env: process.env
       });
     } catch {
       ws.close(1011, 'Shellstart fehlgeschlagen');
       return;
     }
     shell.onData(data => {
       if (ws.readyState === WebSocket.OPEN) ws.send(data);
     });
     ws.on('message', (data, binary) => {
       if (!binary) shell.write(data.toString());
     });
     const cleanup = () => { try { shell.kill(); } catch {} };
     ws.on('close', cleanup);
     ws.on('error', cleanup);
     shell.onExit(() => ws.close());
   });
   server.listen(8090, '127.0.0.1', () => {
     console.log(origin + '/#' + token);
   });
   ```

9. Öffne die neue Browserdatei und füge den folgenden Inhalt ein. Speichere die Datei anschließend in nano.

   ```bash
   nano index.html
   ```

   ```html
   <!doctype html>
   <html lang="de">
   <meta charset="utf-8">
   <title>Lokales Übungsterminal</title>
   <link rel="stylesheet" href="/xterm.css">
   <style>body { background: #181818; color: white; } #status { margin: 1em; }</style>
   <p id="status">Verbindung wird aufgebaut …</p>
   <div id="terminal"></div>
   <script src="/xterm.js"></script>
   <script>
   const token = location.hash.slice(1);
   history.replaceState(null, '', '/');
   const term = new Terminal({ cols: 80, rows: 24 });
   term.open(document.getElementById('terminal'));
   const status = document.getElementById('status');
   const ws = new WebSocket('ws://' + location.host + '/shell?token=' + encodeURIComponent(token));
   ws.onopen = () => { status.textContent = 'Verbunden'; term.focus(); };
   ws.onmessage = event => term.write(event.data);
   ws.onclose = () => { status.textContent = 'Verbindung beendet'; };
   ws.onerror = () => { status.textContent = 'Verbindungsfehler'; };
   term.onData(data => {
     if (ws.readyState === WebSocket.OPEN) ws.send(data);
   });
   </script>
   </html>
   ```

10. Starte das Programm im Vordergrund. Port 8090 muss frei sein.

    ```bash
    node server.cjs
    ```

11. Öffne die im Terminal ausgegebene vollständige Adresse im Browser desselben Rechners. Der Teil hinter dem Rautezeichen ist der zufällige Zugangsschlüssel. Teile diesen Link nicht; ein Neustart erzeugt einen neuen Schlüssel. Nach dem Laden entfernt die Seite ihn aus der Adresszeile.

## Prüfen

1. Gib im Browserterminal den folgenden Befehl ein. Er muss deinen normalen Benutzernamen ausgeben.

   ```bash
   whoami
   ```

2. Prüfe in einem zweiten Ubuntu-Terminal die Abhängigkeiten, damit ihre installierten Versionen dokumentiert sind.

   ```bash
   npm --prefix ~/browserterminal-lokal ls --depth=0
   ```

3. Beende den Server mit **Strg+C** im Startterminal. Die Browserseite soll anschließend „Verbindung beendet“ anzeigen. Ein Neuladen ohne neuen vollständigen Link erhält keine Shell.

## Deinstallieren

1. Beende den Server mit **Strg+C**, falls er noch läuft.

2. Sichere eigene Dateien aus dem Projektordner. In einer Shell gestartete Hintergrundprogramme sind gegebenenfalls gesondert zu beenden.

3. Lösche das Beispielprojekt einschließlich seiner lokalen npm-Pakete.

   ```bash
   rm -rf -- ~/browserterminal-lokal
   ```

4. Prüfe, ob der Projektordner entfernt wurde. Bei Erfolg bleibt die Ausgabe leer und der Rückgabestatus ist null.

   ```bash
   test ! -e ~/browserterminal-lokal
   ```

Node.js und Build-Werkzeuge bleiben für andere Projekte installiert.
