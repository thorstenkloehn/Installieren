# Ruby

Ruby ist eine Skriptsprache, die auf gut lesbaren Code ausgelegt ist: Alles ist ein Objekt, Blöcke mit `do … end` machen Schleifen und Rückrufe kurz, und vieles liest sich fast wie englischer Text. Bekannt wurde Ruby vor allem durch das Webframework [Ruby on Rails](rails.md). Ruby wird aber auch für Werkzeuge wie [Jekyll](jekyll.md) und [Asciidoctor](asciidoctor.md) und für kleine Skripte verwendet.

## Vorbemerkungen

- **Aus den Paketquellen:** Ubuntu 26.04 enthält Ruby **3.3** im Paket `ruby`. Es bringt den Interpreter `ruby`, die interaktive Konsole `irb` und den Paketmanager `gem` mit.
- **Gems und Bundler:** Bibliotheken heißen in Ruby **Gems** und kommen von <https://rubygems.org>. In Projekten legt man die benötigten Gems in einer Datei `Gemfile` fest und installiert sie mit **Bundler**. Bundler steckt im eigenen Paket `bundler`, das auch die Dateien zum Übersetzen von Gems mit C-Anteilen mitbringt.
- **Gems im Projektordner:** Ohne `sudo` darf `gem` nicht in die Systemordner schreiben. Diese Anleitung installiert Gems deshalb in den Projektordner. So bleibt das System sauber, und jedes Projekt hat genau seine Versionen.
- **Neuere Ruby-Versionen:** Wer Ruby 3.4 oder neuer braucht, kann es mit Versionsverwaltern wie `rbenv` oder `mise` im Home-Ordner übersetzen. Für den Einstieg reicht die Version von Ubuntu.
- **Version:** Getestet mit Ruby **3.3.8**, RubyGems 3.6 und Bundler 2.6 unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen kennt.

```bash
sudo apt update
```

### 2. Ruby installieren

Installiert Ruby mit `irb`, `gem` und den mitgelieferten Standardbibliotheken.

```bash
sudo apt install ruby
```

**Prüfen:** Die Ausgabe beginnt mit `ruby 3.3.8`.

```bash
ruby --version
```

### 3. Bundler installieren

Installiert Bundler für Projekte mit eigenen Gems. `apt` zieht dabei `ruby-dev` mit, die Dateien zum Übersetzen von Gems mit C-Anteilen.

```bash
sudo apt install bundler
```

**Prüfen:** Die Ausgabe lautet `Bundler version 2.6.7` oder nennt eine neuere Version.

```bash
bundle --version
```

## Erstes Programm

### 4. Arbeitsordner anlegen

Ein eigener Ordner für die Übungen.

```bash
mkdir ~/hallo-ruby
```

### 5. In den Ordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/hallo-ruby
```

### 6. Skript anlegen

```bash
nano hallo.rb
```

Füge diesen Inhalt ein (<kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>):

```ruby
# Ein kleines Ruby-Programm: Begrüßung und eine Liste
name = ARGV.first || "Welt"
puts "Hallo #{name}!"

sprachen = ["Ruby", "Python", "Go"]
sprachen.each_with_index do |sprache, i|
  puts "#{i + 1}. #{sprache} hat #{sprache.length} Buchstaben"
end
```

- `ARGV` enthält die Werte, die man beim Aufruf hinter den Dateinamen schreibt. `|| "Welt"` nimmt `"Welt"`, wenn keiner angegeben ist.
- `#{…}` setzt einen Wert in einen Text ein. Das funktioniert nur in doppelten Anführungszeichen.
- `each_with_index do |sprache, i| … end` ist ein **Block**: Ruby führt ihn für jedes Element der Liste einmal aus und übergibt Element und Position.
- `sprache.length` zeigt, dass auch ein Text ein Objekt mit Methoden ist.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 7. Skript ausführen

```bash
ruby hallo.rb
```

**Prüfen:** Die Ausgabe lautet:

```text
Hallo Welt!
1. Ruby hat 4 Buchstaben
2. Python hat 6 Buchstaben
3. Go hat 2 Buchstaben
```

Mit `ruby hallo.rb Thorsten` lautet die erste Zeile `Hallo Thorsten!`.

### 8. Interaktive Konsole ausprobieren

`irb` (Interactive Ruby) führt jede eingegebene Zeile sofort aus und zeigt das Ergebnis. Das eignet sich zum Ausprobieren von Methoden.

```bash
irb
```

Gib nacheinander ein und drücke jeweils <kbd>Enter</kbd>:

```ruby
"ruby".upcase
```

```ruby
[3, 1, 2].sort
```

**Prüfen:** Nach `=>` zeigt `irb` die Ergebnisse `"RUBY"` und `[1, 2, 3]`. Beende `irb` mit `exit`.

## Projekt mit Gems

### 9. Gemfile anlegen

`bundle init` legt eine leere Datei `Gemfile` an. Darin stehen später alle Gems des Projekts.

```bash
bundle init
```

**Prüfen:** Die Ausgabe lautet `Writing new Gemfile to /home/…/hallo-ruby/Gemfile`.

### 10. Gems im Projektordner ablegen

Stellt Bundler für dieses Projekt so ein, dass es Gems in den Unterordner `vendor/bundle` installiert. `--local` speichert die Einstellung in `.bundle/config` im Projektordner, sie gilt also nur hier.

```bash
bundle config set --local path vendor/bundle
```

### 11. Gem hinzufügen

`bundle add` trägt das Gem `rainbow` in das `Gemfile` ein und installiert es. Rainbow färbt Text im Terminal ein.

```bash
bundle add rainbow
```

**Prüfen:** Die Ausgabe enthält `Installing rainbow 3.1.1` oder eine neuere Version. Im `Gemfile` steht jetzt die Zeile `gem "rainbow", "~> 3.1"`, und die Datei `Gemfile.lock` hält die genaue Version fest.

```bash
cat Gemfile
```

### 12. Skript mit dem Gem anlegen

```bash
nano farbe.rb
```

Füge diesen Inhalt ein:

```ruby
require "rainbow"

puts Rainbow("Hallo in Grün!").green
puts Rainbow("Und fett in Rot").red.bright
```

`require` lädt das Gem. Die Methoden `green`, `red` und `bright` hängt man aneinander, jede gibt wieder einen Text zurück.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Skript mit Bundler ausführen

`bundle exec` startet das Skript so, dass Ruby die Gems aus `vendor/bundle` findet, und zwar genau in den Versionen aus `Gemfile.lock`. Ein einfaches `ruby farbe.rb` würde mit `cannot load such file -- rainbow` abbrechen.

```bash
bundle exec ruby farbe.rb
```

**Prüfen:** Die erste Zeile erscheint grün, die zweite hell in Rot. Leitet man die Ausgabe in eine Datei um, lässt Rainbow die Farben weg.

## Wie geht es weiter?

- **Formatieren und Prüfen:** Das Gem `rubocop` prüft Ruby-Code auf Fehler und Stil. Man fügt es mit `bundle add rubocop --group development` hinzu und startet es mit `bundle exec rubocop`.
- **Tests:** Ruby bringt `minitest` mit. Beliebt ist auch `rspec`, das Tests fast wie Sätze formuliert.
- **Webanwendungen:** [Ruby on Rails](rails.md) ist das große Framework für Webanwendungen. Kleiner ist Sinatra, bei dem eine Route nur eine Zeile braucht.
- **Dokumentation:** `ri String#upcase` zeigt die Beschreibung einer Methode im Terminal an, wenn das Paket `ri` installiert ist.

## Deinstallieren

### 1. Übungsordner entfernen

Löscht den Übungsordner samt der Gems in `vendor/bundle`.

```bash
rm -rf ~/hallo-ruby
```

### 2. Ruby und Bundler entfernen

Nur ausführen, wenn kein anderes Programm Ruby braucht, z. B. [Jekyll](jekyll.md), [Asciidoctor](asciidoctor.md) oder [Ruby on Rails](rails.md).

```bash
sudo apt purge ruby bundler
```

### 3. Nicht mehr benötigte Pakete entfernen

Entfernt die Pakete, die nur für Ruby und Bundler mitinstalliert wurden, z. B. `ruby3.3` und `ruby-dev`. Der Befehl entfernt aber auch alle anderen nicht mehr benötigten Pakete, auch solche von früheren Installationen. Lies daher die Liste, bevor du mit <kbd>J</kbd> bestätigst. Stehen dort Pakete, die du noch brauchst, brich mit <kbd>N</kbd> ab.

```bash
sudo apt autoremove --purge
```

### 4. Zwischenspeicher von Bundler entfernen (optional)

Bundler speichert in `~/.bundle/cache` das Verzeichnis der verfügbaren Gems von rubygems.org, damit spätere Aufrufe schneller sind. Der Befehl löscht den Ordner `~/.bundle`. Bundler legt ihn beim nächsten Aufruf in einem Projekt neu an.

```bash
rm -rf ~/.bundle
```

**Prüfen:** Die Shell meldet, dass der Befehl `ruby` nicht gefunden wurde.

```bash
ruby --version
```
