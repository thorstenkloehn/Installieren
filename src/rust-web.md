# Axum und Actix-web

Axum und Actix-web sind die beiden verbreitetsten Web-Frameworks für die Programmiersprache Rust. Mit ihnen baut man sehr schnelle und speichersichere Webserver und REST-Schnittstellen. Das Ergebnis ist ein einzelnes, eigenständiges Programm ohne Laufzeitumgebung.

## Vorbemerkungen

- **Die beiden Frameworks im Vergleich:**

  | | Axum | Actix-web |
  |---|---|---|
  | Lizenz | MIT | MIT oder Apache 2.0 (nach Wahl) |
  | Herkunft | Vom Tokio-Projekt, das auch die Grundlage für asynchrones Rust liefert | Eigenständiges Projekt, eines der ältesten Rust-Web-Frameworks |
  | Routen festlegen | Zentral im `Router`, Funktionen bleiben gewöhnliche `async fn` | Über Makros wie `#[get("/pfad")]` direkt an der Funktion |
  | Laufzeit | Tokio, gemeinsam für den ganzen Server | Eigenes System auf Tokio-Basis, ein Arbeitsbereich pro Prozessorkern |
  | Besonderheit | Passt nahtlos zu anderen Tokio- und Tower-Bausteinen | Sehr ausgereift, eigenes Ökosystem an Erweiterungen |

  Beide sind schnell genug für praktisch jeden Einsatz. Die Wahl ist vor allem eine Frage des Geschmacks.
- **Installation:** Den Rust-Compiler `rustc` und das Build-Werkzeug `cargo` liefert Ubuntu 26.04 in Version 1.93. Das genügt für beide Frameworks (Axum braucht mindestens 1.80, Actix-web mindestens 1.88). Die Frameworks selbst werden **pro Projekt** von `cargo` aus dem Paketverzeichnis crates.io geladen.
- **Gleiches Beispiel:** Beide Projekte bekommen dieselbe kleine Notiz-Schnittstelle wie in der [ASP.NET-Core-Anleitung](aspnet-core.md), damit man sie gut vergleichen kann.
- **Versionen:** Axum 0.8, Actix-web 4.15, Tokio 1.53.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen von Rust und Cargo aus den Ubuntu-Paketquellen kennt.

```bash
sudo apt update
```

### 2. Rust und Cargo installieren

Installiert den Compiler `rustc` und das Build-Werkzeug `cargo`, das Projekte anlegt, Abhängigkeiten lädt und übersetzt. Den C-Compiler `gcc`, den Rust zum Zusammenfügen (Linken) der Programme braucht, installiert `apt` automatisch mit.

```bash
sudo apt install rustc cargo
```

**Prüfen:** Die Ausgabe nennt die Version, z. B. `cargo 1.93.1`.

```bash
cargo --version
```

Hast du Rust zusätzlich über `rustup` installiert (Befehle im Ordner `~/.cargo/bin`), wird dessen neuere Version angezeigt. Das ist in Ordnung, beide Wege funktionieren.

## Axum

### 3. Projekt anlegen

`cargo new` legt ein neues Rust-Programm im Ordner `~/hallo-axum` an: die Projektbeschreibung `Cargo.toml` und den Quellcode `src/main.rs`.

```bash
cargo new ~/hallo-axum
```

### 4. In den Projektordner wechseln

Die Befehle bis Schritt 10 beziehen sich auf diesen Ordner.

```bash
cd ~/hallo-axum
```

### 5. Abhängigkeiten hinzufügen

`cargo add` trägt Bibliotheken (in Rust **Crates** genannt) in `Cargo.toml` ein:

- `axum` – das Web-Framework
- `tokio` mit allen Funktionen (`full`) – die Laufzeitumgebung für asynchrone Programme, auf der Axum aufbaut
- `serde` mit `derive` – wandelt eigene Datentypen in JSON um und zurück
- `serde_json` – für JSON-Werte ohne eigenen Datentyp

```bash
cargo add axum tokio serde serde_json --features tokio/full,serde/derive
```

**Prüfen:** Im Abschnitt `[dependencies]` stehen die vier Crates mit ihren Versionen.

```bash
cat Cargo.toml
```

### 6. Programmcode schreiben

Ersetzt `src/main.rs`. Die wichtigsten Bausteine:

- `#[derive(Serialize, Deserialize)]` – erzeugt automatisch den Code zum Umwandeln in und aus JSON
- **Handler** – gewöhnliche `async fn`. Was sie brauchen, geben sie als Parameter an: `Query` liest Werte aus der Adresse, `Json` aus dem mitgeschickten Inhalt, `State` greift auf gemeinsame Daten zu.
- `Arc<Mutex<…>>` – eine Liste, die sich alle gleichzeitig laufenden Anfragen sicher teilen können
- `Router` – legt zentral fest, welcher Handler welche Adresse und Methode beantwortet
- `TcpListener::bind("127.0.0.1:3000")` – der Server ist nur vom eigenen Rechner aus erreichbar, auf Port 3000

```bash
nano src/main.rs
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```rust
use std::sync::{Arc, Mutex};

use axum::{
    extract::{Query, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};

// Datentypen: Serialize/Deserialize wandeln automatisch in JSON um und zurück
#[derive(Clone, Serialize)]
struct Notiz {
    id: usize,
    titel: String,
}

#[derive(Deserialize)]
struct NeueNotiz {
    titel: String,
}

#[derive(Deserialize)]
struct Name {
    name: Option<String>,
}

// Gemeinsamer Zustand: die Notizliste, sicher für gleichzeitige Zugriffe
type Notizen = Arc<Mutex<Vec<Notiz>>>;

// GET /hallo?name=... liefert eine Begrüßung als JSON
async fn hallo(Query(abfrage): Query<Name>) -> Json<serde_json::Value> {
    let name = abfrage.name.unwrap_or_else(|| "Welt".to_string());
    Json(serde_json::json!({ "gruss": format!("Hallo {name}!") }))
}

// GET /notizen liefert alle Notizen
async fn liste(State(notizen): State<Notizen>) -> Json<Vec<Notiz>> {
    Json(notizen.lock().unwrap().clone())
}

// POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
async fn anlegen(
    State(notizen): State<Notizen>,
    Json(eingabe): Json<NeueNotiz>,
) -> (StatusCode, Json<Notiz>) {
    let mut liste = notizen.lock().unwrap();
    let notiz = Notiz { id: liste.len() + 1, titel: eingabe.titel };
    liste.push(notiz.clone());
    (StatusCode::CREATED, Json(notiz))
}

#[tokio::main]
async fn main() {
    let notizen: Notizen = Arc::new(Mutex::new(Vec::new()));

    // Router: welche Funktion beantwortet welche Adresse und Methode
    let app = Router::new()
        .route("/hallo", get(hallo))
        .route("/notizen", get(liste).post(anlegen))
        .with_state(notizen);

    // Nur vom eigenen Rechner aus erreichbar, Port 3000
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();
    println!("Axum läuft auf http://127.0.0.1:3000");
    axum::serve(listener, app).await.unwrap();
}
```

### 7. Übersetzen und starten

`cargo run` lädt beim ersten Mal alle Crates herunter (nach `~/.cargo/registry`), übersetzt sie und startet das Programm. Das dauert beim ersten Mal etwa eine halbe Minute, danach nur noch Sekunden. Das Terminal bleibt belegt, solange der Server läuft.

```bash
cargo run
```

**Prüfen:** Die letzte Zeile lautet `Axum läuft auf http://127.0.0.1:3000`.

### 8. Schnittstelle testen

Öffne ein zweites Terminal und lege eine Notiz an.

```bash
curl -i -X POST http://localhost:3000/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die erste Zeile lautet `HTTP/1.1 201 Created`, die letzte `{"id":1,"titel":"Erste Notiz"}`. Außerdem liefern:

- `curl http://localhost:3000/notizen` → `[{"id":1,"titel":"Erste Notiz"}]`
- `curl "http://localhost:3000/hallo?name=Thorsten"` → `{"gruss":"Hallo Thorsten!"}`

Fehlt beim Anlegen die Angabe `Content-Type: application/json`, antwortet Axum mit `415 Unsupported Media Type`.

### 9. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

### 10. Fertiges Programm erstellen

`--release` übersetzt mit allen Optimierungen. Das Ergebnis ist ein einzelnes Programm von etwa 2 MB, das ohne Rust oder weitere Dateien auf jedem vergleichbaren Linux-System läuft.

```bash
cargo build --release
```

**Prüfen:** Das Programm liegt unter `target/release/hallo-axum` und lässt sich direkt starten:

```bash
./target/release/hallo-axum
```

Mit <kbd>Strg</kbd>+<kbd>C</kbd> beendest du es wieder.

## Actix-web

### 11. Projekt anlegen

Legt das zweite Projekt im Ordner `~/hallo-actix` an.

```bash
cargo new ~/hallo-actix
```

### 12. In den Projektordner wechseln

Die Befehle bis Schritt 18 beziehen sich auf diesen Ordner.

```bash
cd ~/hallo-actix
```

### 13. Abhängigkeiten hinzufügen

Actix-web bringt seine Laufzeitumgebung selbst mit, deshalb ist `tokio` hier nicht nötig.

```bash
cargo add actix-web serde serde_json --features serde/derive
```

### 14. Programmcode schreiben

Ersetzt `src/main.rs`. Die Unterschiede zu Axum:

- `#[get("/hallo")]`, `#[post("/notizen")]` – die Adresse steht als Makro direkt über der Funktion
- `web::Query`, `web::Json`, `web::Data` – entsprechen `Query`, `Json` und `State` bei Axum
- `impl Responder` – die Funktion gibt „irgendetwas Beantwortbares“ zurück, hier eine `HttpResponse` mit Status und JSON
- `HttpServer::new(move || App::new() …)` – Actix-web startet mehrere Arbeitsbereiche (einen pro Prozessorkern) und baut für jeden eine eigene `App`. Die gemeinsame Notizliste reicht `web::Data` an alle weiter.
- `bind(("127.0.0.1", 8081))` – nur vom eigenen Rechner aus erreichbar, auf Port 8081

**Hinweis:** Das Makro `#[get("/notizen")]` macht aus der Funktion `liste` einen gleichnamigen Datentyp. Eine Variable darf deshalb im selben Programm nicht ebenfalls `liste` heißen. Im Code unten heißt sie darum `alle`.

```bash
nano src/main.rs
```

Die Datei hat schon Inhalt aus der Vorlage, der vollständig ersetzt wird. Lösche ihn zuerst: <kbd>Alt</kbd>+<kbd>\\</kbd> springt an den Anfang, <kbd>Alt</kbd>+<kbd>A</kbd> beginnt eine Markierung, <kbd>Alt</kbd>+<kbd>/</kbd> springt ans Ende, <kbd>Strg</kbd>+<kbd>K</kbd> schneidet alles Markierte aus. Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```rust
use std::sync::Mutex;

use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};

// Datentypen: Serialize/Deserialize wandeln automatisch in JSON um und zurück
#[derive(Clone, Serialize)]
struct Notiz {
    id: usize,
    titel: String,
}

#[derive(Deserialize)]
struct NeueNotiz {
    titel: String,
}

#[derive(Deserialize)]
struct Name {
    name: Option<String>,
}

// Gemeinsamer Zustand: die Notizliste, sicher für gleichzeitige Zugriffe
struct Notizen(Mutex<Vec<Notiz>>);

// GET /hallo?name=... liefert eine Begrüßung als JSON
#[get("/hallo")]
async fn hallo(abfrage: web::Query<Name>) -> impl Responder {
    let name = abfrage.name.clone().unwrap_or_else(|| "Welt".to_string());
    HttpResponse::Ok().json(serde_json::json!({ "gruss": format!("Hallo {name}!") }))
}

// GET /notizen liefert alle Notizen
#[get("/notizen")]
async fn liste(notizen: web::Data<Notizen>) -> impl Responder {
    HttpResponse::Ok().json(notizen.0.lock().unwrap().clone())
}

// POST /notizen legt eine Notiz an; der Inhalt kommt als JSON
#[post("/notizen")]
async fn anlegen(notizen: web::Data<Notizen>, eingabe: web::Json<NeueNotiz>) -> impl Responder {
    let mut alle = notizen.0.lock().unwrap();
    let notiz = Notiz { id: alle.len() + 1, titel: eingabe.titel.clone() };
    alle.push(notiz.clone());
    HttpResponse::Created().json(notiz)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let notizen = web::Data::new(Notizen(Mutex::new(Vec::new())));

    println!("Actix-web läuft auf http://127.0.0.1:8081");

    // Für jeden Arbeits-Thread wird eine App mit denselben Routen gebaut;
    // die Notizliste teilen sich alle über web::Data
    HttpServer::new(move || {
        App::new()
            .app_data(notizen.clone())
            .service(hallo)
            .service(liste)
            .service(anlegen)
    })
    // Nur vom eigenen Rechner aus erreichbar, Port 8081
    .bind(("127.0.0.1", 8081))?
    .run()
    .await
}
```

### 15. Übersetzen und starten

Lädt die Crates, übersetzt und startet den Server. Crates, die schon für Axum geladen wurden, holt `cargo` aus dem Zwischenspeicher.

```bash
cargo run
```

**Prüfen:** Die letzte Zeile lautet `Actix-web läuft auf http://127.0.0.1:8081`.

### 16. Schnittstelle testen

Im zweiten Terminal dieselbe Anfrage wie bei Axum, nur mit Port 8081.

```bash
curl -i -X POST http://localhost:8081/notizen -H "Content-Type: application/json" -d '{"titel": "Erste Notiz"}'
```

**Prüfen:** Die Antworten sind identisch mit denen von Axum: `HTTP/1.1 201 Created` und `{"id":1,"titel":"Erste Notiz"}`. Auch `/notizen` und `/hallo?name=…` verhalten sich gleich.

### 17. Server beenden

Wechsle in das erste Terminal und drücke <kbd>Strg</kbd>+<kbd>C</kbd>.

### 18. Fertiges Programm erstellen

Übersetzt mit allen Optimierungen. Das Programm ist mit etwa 7 MB etwas größer als bei Axum, weil Actix-web mehr Funktionen fest einbaut (z. B. Komprimierung).

```bash
cargo build --release
```

**Prüfen:** Das Programm liegt unter `target/release/hallo-actix`.

```bash
ls -lh target/release/hallo-actix
```

## Wie geht es weiter?

- **Datenbank:** Die Crate `sqlx` greift asynchron auf [PostgreSQL](postgresql.md) oder SQLite zu und prüft SQL-Abfragen schon beim Übersetzen.
- **Betrieb:** Das fertige Programm lässt sich als systemd-Dienst starten (siehe die Dienstdatei in der [Qdrant-Anleitung](qdrant.md) als Vorlage). Davor setzt man [nginx](nginx.md), der auch HTTPS übernimmt.
- **Entwicklungsumgebung:** [VS Code](vscode.md) mit der Erweiterung „rust-analyzer“, [Neovim](neovim.md) mit rust-analyzer oder JetBrains RustRover.

## Deinstallieren

### 1. Projekte entfernen

Löscht beide Projektordner samt übersetzter Programme.

```bash
rm -rf ~/hallo-axum ~/hallo-actix
```

### 2. Heruntergeladene Crates entfernen

`cargo` hat die Crates in `~/.cargo/registry` zwischengespeichert. **Achtung:** Hast du Rust über `rustup` installiert, liegt in `~/.cargo` auch die Rust-Installation selbst. Lösche dann nur diesen Unterordner, nicht ganz `~/.cargo`.

```bash
rm -rf ~/.cargo/registry
```

### 3. Optional: Rust und Cargo entfernen

Nur ausführen, wenn du Rust aus den Ubuntu-Paketen nicht mehr brauchst.

```bash
sudo apt purge rustc cargo
```

```bash
sudo apt autoremove
```

**Prüfen:** Die Projektordner existieren nicht mehr.

```bash
ls ~/hallo-axum ~/hallo-actix
```
