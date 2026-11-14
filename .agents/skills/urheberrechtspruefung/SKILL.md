---
name: urheberrechtspruefung
description: >-
  Überprüft alle Inhalte dieses mdBooks systematisch auf Verletzungen fremden Urheberrechts
  (wörtliche Übernahmen, eng angelehnte Paraphrasen, übersetzte Passagen). Erstellt eine strukturierte
  Trefferliste (Fundstelle, vermutete Quelle, Schweregrad) und leitet die iterative Überarbeitung
  bzw. das Neuschreiben auffälliger Kapitel an.
---

# Urheberrechts- und Inhaltsprüfung für mdBook

Verwende diese Anleitung, wenn Inhalte, Kapitel oder das gesamte Handbuch auf die Einhaltung des Urheberrechts, Plagiatsfreiheit und Lizenzkonformität geprüft oder nach Beanstandungen überarbeitet werden sollen.

Dieses Verfahren gilt gleichermaßen für **agy cli**, **Claude Code** und **Codex**.

---

## 1. Grundregeln und Leitlinien

- **Eigenständige Texte:** Alle Anleitungen, Einleitungen, Begründungen („Was bewirkt der Schritt und warum ist er nötig?“) und Beispiele müssen eigenständig in deutscher Sprache verfasst sein.
- **Keine wörtlichen Übernahmen:** Keine Textkopien aus Wikis (Wikipedia, ubuntuusers.de, ArchWiki), Manpages, Hersteller-Tutorials oder Blogbeiträgen.
- **Keine engen Paraphrasen:** Satzstrukturen und Gedankengänge fremder Texte dürfen nicht einfach Satz für Satz umformuliert werden.
- **Keine unautorisierten Übersetzungen:** Englische Dokumentationen dürfen nicht einfach ins Deutsche übersetzt werden.
- **Befehle und Schnittstellen:** Funktionale Befehle (`sudo apt install ...`, API-Parameter) sind frei nutzbar, müssen jedoch immer in eigene, didaktische Schritte eingebettet sein.
- **Offene Quellen ausweisen:** Basiert eine Befehlsabfolge auf frei lizenzierten Vorlagen (z. B. CC BY-SA, MIT), muss am Ende des Kapitels ein eigener Abschnitt `## Quellen und Lizenz` stehen.

---

## 2. Ablauf der Prüfung

### Schritt 1: Automatisierte Vorprüfung ausführen

Führe das Prüfskript im Terminal aus:

```bash
python3 .agents/skills/urheberrechtspruefung/scripts/check_copyright.py
```

Das Skript scannt:
- Englische Textabschnitte im deutschen Fließtext.
- Auffällige Schlüsselwörter zu externen Vorlagen.
- Fehlende `## Quellen und Lizenz`-Abschnitte.

### Schritt 2: Redaktionelle Textprüfung durchführen

Prüfe die Kapitel systematisch anhand folgender Fragen:
1. **Einleitung:** Ist der erste Satz nach `# <Programm>` eine eigenständige Definition des praktischen Nutzens auf dem lokalen Ubuntu-System?
2. **Schritte:** Sind die Begründungen zu den Befehlen in eigenen Worten verfasst?
3. **Beispielcode:** Sind die Code- und Konfigurationsbeispiele auf das Notwendigste reduziert und für dieses Handbuch erstellt worden?
4. **Verlinkte Quellen:** Wurden fremde Dokumentationen nur als externe Links angegeben, ohne deren Textkörper zu übernehmen?

---

## 3. Trefferliste erstellen

Werden bei der Prüfung auffällige Stellen gefunden, ist vor jeder Bearbeitung eine tabellarische Trefferliste mit folgenden Angaben auszugeben:

| Spalte | Beschreibung |
|---|---|
| **Fundstelle** | Dateipfad und Zeilennummer (z. B. `src/beispiel.md#L45`) |
| **Auffällige Passage** | Zitat der beanstandeten Textstelle |
| **Vermutete Quelle** | Ursprüngliche Quelle (z. B. URL, Wikipedia, man-page) |
| **Schweregrad** | `gering` (z. B. unklare Quellenangabe), `mittel` (enge Paraphrase), `schwer` (wörtliche Textübernahme) |

Beispiel:
```markdown
| Fundstelle | Auffällige Passage | Vermutete Quelle | Schweregrad |
|---|---|---|---|
| `src/beispiel.md#L12` | „...wörtlich übernommener Satz...“ | man-page beispiel(1) | **schwer** |
| `src/demo.md#L34` | „...nahe am Originaltext übersetzt...“ | https://example.com/docs | **mittel** |
```

---

## 4. Iterative Überarbeitung und Neuschreiben

Arbeite die gemeldeten Treffer einzeln und Schritt für Schritt ab:

1. **Vollständiges Neuschreiben:**
   - Auffällige Passagen restlos löschen.
   - Den Sachverhalt aus didaktischer Sicht für den Ubuntu-26.04-Benutzer mit komplett eigenen Worten neu verfassen.
2. **Quellendeklaration ergänzen:**
   - Wurden funktionale Befehlsfolgen aus offen lizenzierten Werken adaptiert (z. B. CC BY-SA 2.0 / MIT), am Kapitelende den Abschnitt `## Quellen und Lizenz` mit Angabe von Originalquelle und Lizenz anfügen.
3. **Nachkontrolle:**
   - Die überarbeitete Datei erneut gegen die Quelltexte prüfen, bis keinerlei Ähnlichkeit im Wortlaut mehr besteht.
4. **Technische Verifikation:**
   - Mit `bash -n` alle Shell-Befehle prüfen.
   - Mit `mdbook build` sicherstellen, dass das Buch fehlerfrei baut.

---

## 5. Dokumentation und Veröffentlichung

1. Die Prüfergebnisse und vorgenommenen Korrekturen in einem Prüfbericht unter `pruefungen/urheberrechtspruefung-<JJJJ-MM-TT>.md` dokumentieren.
2. **Freigabe:** Erst wenn die Trefferliste leer ist und alle Kapitel vollständig beanstandungsfrei sind, erfolgt der Git-Commit und die Veröffentlichung.
