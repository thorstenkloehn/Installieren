# Clojure

Clojure ist ein moderner Lisp-Dialekt, der auf der virtuellen Maschine von [Java](java.md) läuft. Programme bestehen aus Ausdrücken in Klammern und arbeiten bevorzugt mit unveränderlichen Daten wie Listen, Vektoren und Wörterbüchern. Weil Clojure alle Java-Bibliotheken nutzen kann, wird es gern für Datenverarbeitung und Serverdienste eingesetzt.

## Vorbemerkungen

- **Installation über apt:** Ubuntu 26.04 liefert **Clojure 1.12** im Paket `clojure` und das Bauwerkzeug **Leiningen** im Paket `leiningen`. Beide brauchen Java. Ist noch keines installiert, bringt `apt` das Standard-Java von Ubuntu mit.
- **Zwei Wege:** Der Befehl `clojure` von Ubuntu startet Skripte und eine Konsole. Bibliotheken nimmt er aus Ubuntu-Paketen wie `libdata-json-clojure`. Leiningen verwaltet dagegen Projekte und lädt Bibliotheken samt Clojure selbst aus den Online-Archiven Maven Central und Clojars.
- **Nicht die offizielle CLI:** Auf <https://clojure.org> wird ein eigenes Werkzeug `clj` mit Projektdateien namens `deps.edn` beschrieben. Der Befehl `clojure` von Ubuntu ist ein einfacheres Startskript und kennt `deps.edn` nicht.
- **Ordner `~/.m2`:** Leiningen speichert heruntergeladene Bibliotheken in `~/.m2/repository`. Den Ordner verwendet auch Maven, das Bauwerkzeug für Java.
- **Version:** Getestet mit Clojure **1.12.0**, Leiningen 2.11.2 und OpenJDK 26 unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Clojure, Leiningen und die JSON-Bibliothek installieren

- `clojure` – die Sprache und der Befehl `clojure`
- `leiningen` – das Bauwerkzeug `lein`
- `libdata-json-clojure` – die Bibliothek clojure.data.json zum Lesen und Schreiben von JSON

```bash
sudo apt install clojure leiningen libdata-json-clojure
```

**Prüfen:** Die Ausgabe beginnt mit `Leiningen 2.11.2 on Java`.

```bash
lein version
```

## Erste Schritte

### 3. Einen Ausdruck auswerten

`-e` wertet einen Ausdruck aus und gibt das Ergebnis aus. In Clojure steht die Funktion am Anfang der Klammer: `(inc 1)` ergibt 2.

```bash
clojure -e '(map inc [1 2 3])'
```

**Prüfen:** Die Ausgabe lautet `(2 3 4)`. `map` hat `inc` (um eins erhöhen) auf jedes Element des Vektors angewendet.

### 4. Konsole ausprobieren (optional)

`clojure` ohne weitere Angabe startet eine Konsole mit der Eingabezeile `user=>`. Beende sie mit <kbd>Strg</kbd>+<kbd>D</kbd>.

```bash
clojure
```

## Ein Programm mit Namensraum

### 5. Ordner anlegen

Clojure sucht den Namensraum `laden.lager` in der Datei `laden/lager.clj`. Der Ordner `src` nimmt alle Quelldateien auf.

```bash
mkdir -p ~/clojure-uebung/src/laden
```

### 6. In den Übungsordner wechseln

```bash
cd ~/clojure-uebung
```

### 7. Quelltext anlegen

```bash
nano src/laden/lager.clj
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```clojure
(ns laden.lager
  (:require [clojure.string :as str]
            [clojure.data.json :as json]))

(def bestand
  [{:modell "Citybike" :preis 699 :anzahl 4}
   {:modell "Trekkingrad" :preis 899 :anzahl 0}
   {:modell "Lastenrad" :preis 3490 :anzahl 1}])

(defn status [{:keys [anzahl]}]
  (if (pos? anzahl)
    (str anzahl " auf Lager")
    "ausverkauft"))

(defn lagerwert [raeder]
  (reduce + (map #(* (:preis %) (:anzahl %)) raeder)))

(defn -main [& _args]
  (doseq [rad bestand]
    (println (format "%-12s %5d Euro, %s" (:modell rad) (:preis rad) (status rad))))
  (println "Sofort lieferbar:" (str/join ", " (->> bestand (filter #(pos? (:anzahl %))) (map :modell))))
  (println "Lagerwert:" (lagerwert bestand) "Euro")
  (spit "bestand.json" (json/write-str bestand))
  (println "Gespeichert: bestand.json"))
```

- **`ns`** – legt den Namensraum fest und lädt andere mit `:require`. `:as str` gibt ihnen einen kurzen Namen.
- **Datenstrukturen** – `[…]` ist ein Vektor, `{…}` ein Wörterbuch (Map). `:modell` ist ein Schlüsselwort, das man auch als Funktion verwenden kann: `(:preis rad)` liefert den Preis.
- **`defn`** – definiert eine Funktion. `{:keys [anzahl]}` nimmt das übergebene Wörterbuch auseinander und holt `anzahl` heraus.
- **`#(* (:preis %) (:anzahl %))`** – eine kurze namenlose Funktion. `%` ist ihr Parameter.
- **`->>`** – reicht ein Ergebnis von Schritt zu Schritt weiter: erst filtern, dann die Modellnamen herausziehen.
- **`-main`** – der Startpunkt, wenn das Programm mit `-m` gestartet wird. `spit` schreibt einen Text in eine Datei.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 8. Programm starten

`-cp` nennt die Orte, an denen Clojure nach Quelltexten und Bibliotheken sucht, getrennt durch Doppelpunkte: den Ordner `src` und die JSON-Bibliothek aus dem Ubuntu-Paket. `-m laden.lager` startet die Funktion `-main` dieses Namensraums.

```bash
clojure -cp src:/usr/share/java/data.json.jar -m laden.lager
```

**Prüfen:** Die Ausgabe lautet:

```text
Citybike       699 Euro, 4 auf Lager
Trekkingrad    899 Euro, ausverkauft
Lastenrad     3490 Euro, 1 auf Lager
Sofort lieferbar: Citybike, Lastenrad
Lagerwert: 6286 Euro
Gespeichert: bestand.json
```

Die Datei `bestand.json` enthält den Bestand als JSON-Liste.

## Ein Projekt mit Leiningen

### 9. In das Home-Verzeichnis wechseln

```bash
cd ~
```

### 10. Projekt anlegen

Legt den Ordner `lager-clj` aus der Vorlage `app` an: die Projektdatei `project.clj`, das Programm in `src/lager_clj/core.clj` und einen Test in `test`. Bindestriche im Namen werden in Ordnernamen zu Unterstrichen.

```bash
lein new app lager-clj
```

**Prüfen:** Die Meldung lautet `Generating a project called lager-clj based on the 'app' template.`

### 11. In den Projektordner wechseln

```bash
cd ~/lager-clj
```

### 12. Abhängigkeiten eintragen

Die Vorlage trägt noch Clojure 1.11.1 ein. Leiningen lädt die angegebenen Versionen selbst herunter, unabhängig vom Clojure aus Ubuntu.

```bash
nano project.clj
```

Ersetze die Zeile, die mit `:dependencies` beginnt, durch diese zwei Zeilen:

```clojure
  :dependencies [[org.clojure/clojure "1.12.0"]
                 [org.clojure/data.json "2.5.1"]]
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Programm schreiben

```bash
nano src/lager_clj/core.clj
```

Lösche den bisherigen Inhalt (mehrmals <kbd>Strg</kbd>+<kbd>K</kbd>) und füge diesen ein:

```clojure
(ns lager-clj.core
  (:require [clojure.data.json :as json])
  (:gen-class))

(defn umsatz-je-modell
  "Zählt den Umsatz je Modell zusammen."
  [verkaeufe]
  (reduce (fn [summen {:keys [modell anzahl preis]}]
            (update summen modell (fnil + 0) (* anzahl preis)))
          {}
          verkaeufe))

(def verkaeufe
  [{:modell "Citybike" :anzahl 2 :preis 699}
   {:modell "Lastenrad" :anzahl 1 :preis 3490}
   {:modell "Citybike" :anzahl 3 :preis 699}
   {:modell "Trekkingrad" :anzahl 1 :preis 899}
   {:modell "Citybike" :anzahl 1 :preis 649}])

(defn -main [& _args]
  (let [summen (umsatz-je-modell verkaeufe)]
    (doseq [[modell betrag] (sort-by val > summen)]
      (println (format "%-12s %5d Euro" modell betrag)))
    (spit "umsatz.json" (json/write-str summen))
    (println "Gespeichert: umsatz.json")))
```

- **`reduce`** – geht die Verkäufe durch und baut dabei ein Wörterbuch der Summen auf, beginnend mit `{}`.
- **`update … (fnil + 0) …`** – erhöht den Eintrag eines Modells. `fnil` setzt 0 ein, wenn es den Eintrag noch nicht gibt.
- **Unveränderliche Daten** – `update` verändert das Wörterbuch nicht, sondern liefert ein neues. `reduce` gibt es an den nächsten Schritt weiter.
- **`(:gen-class)`** – nötig, damit Leiningen später eine eigenständige JAR-Datei mit Startpunkt erzeugen kann.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 14. Programm starten

Beim ersten Mal lädt Leiningen Clojure 1.12.0, data.json und weitere Bibliotheken nach `~/.m2` und meldet das mit `Retrieving …`.

```bash
lein run
```

**Prüfen:** Die Ausgabe endet mit:

```text
Citybike      4144 Euro
Lastenrad     3490 Euro
Trekkingrad    899 Euro
Gespeichert: umsatz.json
```

### 15. Test schreiben

```bash
nano test/lager_clj/core_test.clj
```

Lösche den bisherigen Inhalt und füge diesen ein:

```clojure
(ns lager-clj.core-test
  (:require [clojure.test :refer [deftest is]]
            [lager-clj.core :refer [umsatz-je-modell]]))

(deftest zusammenzaehlen
  (is (= {"A" 30 "B" 50}
         (umsatz-je-modell [{:modell "A" :anzahl 2 :preis 10}
                            {:modell "B" :anzahl 1 :preis 50}
                            {:modell "A" :anzahl 1 :preis 10}]))))
```

`deftest` legt einen Test an, `is` prüft eine Bedingung. Wörterbücher vergleicht `=` nach Inhalt, die Reihenfolge der Einträge spielt keine Rolle.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Tests ausführen

```bash
lein test
```

**Prüfen:** Die Ausgabe endet mit `Ran 1 tests containing 1 assertions.` und `0 failures, 0 errors.`

### 17. Eigenständige JAR-Datei erzeugen

`lein uberjar` packt das Programm samt Clojure und allen Bibliotheken in eine einzige Datei. Sie läuft auf jedem Rechner mit Java, auch ohne Clojure.

```bash
lein uberjar
```

### 18. JAR-Datei starten

```bash
java -jar target/uberjar/lager-clj-0.1.0-SNAPSHOT-standalone.jar
```

**Prüfen:** Die Ausgabe gleicht der aus Schritt 14. Die Datei ist rund 5 MB groß.

## Wie geht es weiter?

- **Weitere Bibliotheken:** `apt search clojure` listet die Clojure-Bibliotheken von Ubuntu. In Leiningen-Projekten trägt man Bibliotheken von <https://clojars.org> oder Maven Central unter `:dependencies` ein.
- **Interaktiv entwickeln:** `lein repl` startet eine Konsole, in der der Projektcode geladen ist. Editoren verbinden sich damit, etwa [Visual Studio Code](vscode.md) mit der Erweiterung „Calva“ oder [Emacs](emacs.md) mit CIDER.
- **Java nutzen:** Java-Klassen ruft man direkt auf, z. B. `(java.time.LocalDate/now)` für das heutige Datum.
- **Dokumentation:** Einführung und Referenz unter <https://clojure.org/guides/getting_started>, Beispiele zu jeder Funktion unter <https://clojuredocs.org>.

## Deinstallieren

### 1. Übungsordner und Projekt entfernen

```bash
rm -rf ~/clojure-uebung ~/lager-clj
```

### 2. Heruntergeladene Bibliotheken entfernen

Leiningen hat Clojure und die Bibliotheken unter `~/.m2/repository` abgelegt, vor allem in `org/clojure` und `nrepl`. Verwendest du Maven für Java-Projekte, lass den Ordner stehen, sonst lädt Maven seine Bibliotheken erneut herunter. Andernfalls entfernt dieser Befehl ihn ganz:

```bash
rm -rf ~/.m2
```

### 3. Clojure und Leiningen entfernen

```bash
sudo apt purge clojure leiningen libdata-json-clojure
```

### 4. Nicht mehr benötigte Abhängigkeiten entfernen

Entfernt die Pakete, die nur für Clojure und Leiningen mitinstalliert wurden. War vorher kein Java installiert, gehört auch das mitgebrachte Java dazu. `apt` zeigt vorher die Liste an und fragt nach. Stehen dort Pakete, die du noch brauchst, mit <kbd>n</kbd> abbrechen.

```bash
sudo apt autoremove --purge
```

**Prüfen:** Der Befehl `lein` wird nicht mehr gefunden.

```bash
lein version
```
