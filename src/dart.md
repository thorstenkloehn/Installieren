# Dart

Dart ist eine Programmiersprache von Google mit einer Syntax, die an Java, C# und JavaScript erinnert. Sie ist typsicher und schützt vor dem häufigen Fehler, versehentlich mit `null` zu arbeiten (Null-Sicherheit). Dart-Programme laufen im Entwicklungsmodus sofort ohne Übersetzen und lassen sich für den Betrieb in eigenständige Programme übersetzen. Bekannt ist Dart vor allem als Sprache des Oberflächen-Frameworks Flutter.

## Vorbemerkungen

- **Keine Pakete von Ubuntu:** Dart ist nicht in den Ubuntu-Paketquellen enthalten. Diese Anleitung bindet das offizielle Paketarchiv von Google ein, das auf <https://dart.dev> genannt wird. Dart wird danach mit `apt` verwaltet und aktualisiert. Den Snap `flutter` gibt es auch, er enthält aber das ganze Flutter-Framework.
- **Das Dart SDK:** Das Paket `dart` bringt einen einzigen Befehl `dart` mit. Er startet Programme, legt Projekte an, verwaltet Pakete, prüft, formatiert, testet und übersetzt Code.
- **Pakete von pub.dev:** Bibliotheken kommen von <https://pub.dev> und landen in `~/.pub-cache`.
- **Nutzungsdaten:** Das SDK sendet ab Werk anonyme Nutzungsdaten an Google. Schritt 7 zeigt, wie man das abschaltet.
- **Version:** Getestet mit Dart **3.13.4** unter Ubuntu 26.04.

## Installation

### 1. Paketlisten aktualisieren

Damit `apt` die aktuellen Versionen der Hilfsprogramme für die nächsten Schritte kennt.

```bash
sudo apt update
```

### 2. Hilfsprogramm installieren

`wget` lädt Dateien aus dem Internet herunter. Es ist meist schon vorhanden, dann meldet `apt` das nur.

```bash
sudo apt install wget
```

### 3. Schlüssel von Google einrichten

Mit diesem Schlüssel prüft `apt`, dass die Pakete wirklich von Google stammen und nicht verändert wurden. Es ist derselbe Schlüssel, mit dem Google auch Chrome signiert. `wget` speichert ihn mit `-O` direkt im Ordner für Paketschlüssel. Der Schlüssel liegt als Text vor, `apt` liest ihn mit der Endung `.asc` ohne Umwandlung.

```bash
sudo wget -O /usr/share/keyrings/dart.asc https://dl-ssl.google.com/linux/linux_signing_key.pub
```

**Prüfen:** Die erste Zeile lautet `-----BEGIN PGP PUBLIC KEY BLOCK-----`.

```bash
head -n 1 /usr/share/keyrings/dart.asc
```

### 4. Paketarchiv eintragen

Legt eine Datei an, die `apt` mitteilt, wo die Dart-Pakete liegen und mit welchem Schlüssel sie geprüft werden.

```bash
sudo nano /etc/apt/sources.list.d/dart.sources
```

Füge diesen Inhalt ein (im Terminal mit <kbd>Strg</kbd>+<kbd>Umschalt</kbd>+<kbd>V</kbd>), speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>:

```text
Types: deb
URIs: https://storage.googleapis.com/download.dartlang.org/linux/debian
Suites: stable
Components: main
Architectures: amd64
Signed-By: /usr/share/keyrings/dart.asc
```

### 5. Paketlisten erneut aktualisieren

Jetzt liest `apt` auch das neue Paketarchiv ein.

```bash
sudo apt update
```

**Prüfen:** In der Ausgabe erscheinen Zeilen mit `storage.googleapis.com/download.dartlang.org`, ohne Fehlermeldung. Die Zeile `Ign: … stable InRelease` ist normal, `apt` holt stattdessen `Release` und `Release.gpg`.

### 6. Dart installieren

```bash
sudo apt install dart
```

**Prüfen:** Die Ausgabe beginnt mit `Dart SDK version: 3.13.4 (stable)` oder nennt eine neuere Version.

```bash
dart --version
```

### 7. Nutzungsdaten abschalten (optional)

Beim ersten Aufruf eines `dart`-Befehls weist das SDK darauf hin, dass es Nutzungsdaten sendet. Dieser Befehl schaltet das für deinen Benutzer ab.

```bash
dart --disable-analytics
```

**Prüfen:** Die Ausgabe lautet `Analytics reporting disabled. In order to enable it, run: dart --enable-analytics`.

## Erstes Projekt

### 8. In das Home-Verzeichnis wechseln

Das Projekt wird im aktuellen Ordner angelegt.

```bash
cd ~
```

### 9. Projekt anlegen

`dart create` legt ein Projekt aus einer Vorlage an und lädt die benötigten Pakete. `-t console` wählt die Vorlage für ein Kommandozeilenprogramm. Dart erwartet Projektnamen in Kleinbuchstaben mit Unterstrich, deshalb `hallo_dart`.

```bash
dart create -t console hallo_dart
```

**Prüfen:** Die Ausgabe endet mit `Created project hallo_dart in hallo_dart!` und dem Hinweis auf `dart run`.

### 10. In den Projektordner wechseln

Alle weiteren Befehle werden hier ausgeführt.

```bash
cd ~/hallo_dart
```

Die wichtigsten Dateien: `pubspec.yaml` beschreibt das Projekt und seine Pakete, `bin/hallo_dart.dart` ist das Hauptprogramm, `lib/hallo_dart.dart` enthält Funktionen, die andere Dateien verwenden, und `test/hallo_dart_test.dart` die Tests.

### 11. Funktionen schreiben

```bash
nano lib/hallo_dart.dart
```

Ersetze den ganzen Inhalt: Drücke <kbd>Alt</kbd>+<kbd>\\</kbd> (an den Anfang), <kbd>Alt</kbd>+<kbd>A</kbd> (Markierung beginnen), <kbd>Alt</kbd>+<kbd>/</kbd> (ans Ende) und <kbd>Strg</kbd>+<kbd>K</kbd> (Markiertes löschen). Füge dann diesen Inhalt ein:

```dart
/// Liefert eine Begrüßung für [name].
String begruessung(String name) => 'Hallo $name!';

/// Berechnet den Durchschnitt oder `null` bei einer leeren Liste.
double? durchschnitt(List<int> zahlen) {
  if (zahlen.isEmpty) {
    return null;
  }
  final summe = zahlen.reduce((a, b) => a + b);
  return summe / zahlen.length;
}
```

- **Typen** stehen vor dem Namen: `String begruessung(String name)` nimmt einen Text und gibt einen Text zurück. `=>` ist die Kurzform für eine Funktion, die nur einen Wert zurückgibt.
- **`$name`** setzt einen Wert in einen Text ein.
- **`double?`** – das Fragezeichen erlaubt `null` als Ergebnis. Ohne `?` würde Dart `return null;` beim Prüfen ablehnen. So sieht jeder, der die Funktion benutzt, dass er mit „kein Ergebnis“ rechnen muss.
- **`final`** – eine Variable, die nach der ersten Zuweisung nicht mehr geändert wird. Den Typ ermittelt Dart selbst.
- Kommentare mit `///` sind Dokumentation, die Editoren beim Überfahren mit der Maus anzeigen.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 12. Hauptprogramm schreiben

```bash
nano bin/hallo_dart.dart
```

Ersetze den ganzen Inhalt wie in Schritt 11 und füge ein:

```dart
import 'package:hallo_dart/hallo_dart.dart';

void main(List<String> arguments) {
  // Erster Wert nach dem Programmnamen oder "Welt"
  final name = arguments.isNotEmpty ? arguments.first : 'Welt';
  print(begruessung(name));

  final zahlen = [2, 4, 9];
  final ergebnis = durchschnitt(zahlen);
  print('Durchschnitt von $zahlen: $ergebnis');

  // ?? nimmt den rechten Wert, wenn links null steht
  print('Durchschnitt von []: ${durchschnitt([]) ?? 'keiner'}');
}
```

`import 'package:hallo_dart/…'` lädt die Funktionen aus dem Ordner `lib`. `main` ist der Startpunkt, `arguments` enthält die Werte vom Aufruf. `${…}` setzt einen ganzen Ausdruck in einen Text ein.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 13. Programm ausführen

`dart run` startet das Hauptprogramm aus `bin`, ohne es vorher in eine Datei zu übersetzen.

```bash
dart run
```

**Prüfen:** Die Ausgabe lautet:

```text
Hallo Welt!
Durchschnitt von [2, 4, 9]: 5.0
Durchschnitt von []: keiner
```

Mit `dart run bin/hallo_dart.dart Thorsten` lautet die erste Zeile `Hallo Thorsten!`.

### 14. Code prüfen

`dart analyze` prüft das ganze Projekt auf Fehler, Warnungen und Stilregeln aus `analysis_options.yaml`, ohne es auszuführen.

```bash
dart analyze
```

**Prüfen:** Die Ausgabe endet mit `No issues found!`. `dart format .` bringt alle Dateien in die übliche Schreibweise.

### 15. Tests anpassen

Der Test aus der Vorlage prüft eine Funktion, die es nach Schritt 11 nicht mehr gibt.

```bash
nano test/hallo_dart_test.dart
```

Ersetze den ganzen Inhalt wie in Schritt 11 und füge ein:

```dart
import 'package:hallo_dart/hallo_dart.dart';
import 'package:test/test.dart';

void main() {
  test('begruessung', () {
    expect(begruessung('Dart'), 'Hallo Dart!');
  });

  test('durchschnitt', () {
    expect(durchschnitt([2, 4, 9]), 5.0);
    expect(durchschnitt([]), isNull);
  });
}
```

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

### 16. Tests ausführen

```bash
dart test
```

**Prüfen:** Die letzte Zeile lautet `00:00 +2: All tests passed!`.

## Pakete und eigenständiges Programm

### 17. Paket hinzufügen

`dart pub add` trägt ein Paket in `pubspec.yaml` ein und lädt es herunter. `intl` formatiert Datum, Uhrzeit und Zahlen für verschiedene Sprachen.

```bash
dart pub add intl
```

**Prüfen:** Die Ausgabe enthält `+ intl 0.20.3` (oder eine neuere Version) und endet mit `Changed 2 dependencies!`. Das zweite Paket `clock` braucht `intl` selbst.

### 18. Datum auf Deutsch ausgeben

Eine zweite Programmdatei im Ordner `bin`:

```bash
nano bin/datum.dart
```

Füge diesen Inhalt ein:

```dart
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';

Future<void> main() async {
  // Deutsche Monats- und Tagesnamen laden
  await initializeDateFormatting('de_DE');
  final jetzt = DateTime(2026, 9, 27, 11, 30);
  print(DateFormat.yMMMMEEEEd('de_DE').format(jetzt));
  print(DateFormat('dd.MM.yyyy HH:mm', 'de_DE').format(jetzt));
}
```

`initializeDateFormatting` lädt die deutschen Namen. Die Funktion arbeitet asynchron, deshalb wartet `await` auf sie und `main` ist mit `async` markiert. Für die aktuelle Zeit schreibt man `DateTime.now()`.

Speichere mit <kbd>Strg</kbd>+<kbd>O</kbd> und <kbd>Enter</kbd> und beende nano mit <kbd>Strg</kbd>+<kbd>X</kbd>.

```bash
dart run bin/datum.dart
```

**Prüfen:** Die Ausgabe lautet:

```text
Sonntag, 27. September 2026
27.09.2026 11:30
```

### 19. Eigenständiges Programm erzeugen

`dart compile exe` übersetzt das Hauptprogramm in Maschinencode. Die Datei `hallo` läuft danach auch auf Rechnern ohne Dart SDK.

```bash
dart compile exe bin/hallo_dart.dart -o hallo
```

**Prüfen:** Die Ausgabe lautet `Generated: /home/…/hallo_dart/hallo`. Die Datei ist rund 6 MB groß und startet ohne `dart`:

```bash
./hallo Ubuntu
```

Die erste Zeile lautet `Hallo Ubuntu!`.

## Wie geht es weiter?

- **Klassen:** Dart ist objektorientiert. Eine Klasse mit Konstruktor schreibt man kurz als `class Notiz { final String titel; Notiz(this.titel); }`.
- **Webserver:** `dart create -t server-shelf meinserver` legt ein Projekt mit dem Webserver-Paket `shelf` an.
- **Oberflächen:** Flutter baut mit Dart Oberflächen für Android, iOS, Web und Desktop. Es bringt ein eigenes Dart SDK mit.
- **Editor:** Für [Visual Studio Code](vscode.md) und [VSCodium](vscodium.md) gibt es die Erweiterung „Dart“ (`Dart-Code.dart-code`), die Vervollständigung, Fehleranzeige und Debugger nachrüstet.

## Deinstallieren

### 1. Projekt entfernen

Löscht den Projektordner samt Programmdatei.

```bash
rm -rf ~/hallo_dart
```

### 2. Dart entfernen

```bash
sudo apt purge dart
```

### 3. Paketarchiv und Schlüssel entfernen

Ohne diese Dateien sucht `apt` nicht mehr bei Google nach Dart-Updates.

```bash
sudo rm /etc/apt/sources.list.d/dart.sources /usr/share/keyrings/dart.asc
```

### 4. Paketlisten aktualisieren

Damit `apt` das entfernte Paketarchiv auch aus seinen Listen streicht.

```bash
sudo apt update
```

### 5. Heruntergeladene Pakete und Einstellungen entfernen

Dart legt Pakete von pub.dev in `~/.pub-cache` ab (für dieses Projekt rund 90 MB), die Einstellung zu den Nutzungsdaten in `~/.dart-tool` und Daten des Analysewerkzeugs in `~/.dartServer`.

```bash
rm -rf ~/.pub-cache ~/.dart-tool ~/.dartServer
```

**Prüfen:** Die Shell meldet, dass der Befehl `dart` nicht gefunden wurde.

```bash
dart --version
```
