#!/usr/bin/env python3
"""mdBook-Präprozessor: fügt den KI-Transparenzhinweis am Anfang (nach der
ersten Überschrift) und am Ende jedes Kapitels ein, am Ende zusätzlich den
Lizenzhinweis (CC BY-SA 4.0).

Die Hinweise tragen die Klasse "ki-hinweis-kapitel" und werden per CSS nur
auf der Gesamtdruck-Seite (print.html) angezeigt. Die Dateien in src/ bleiben
unverändert.
"""

import json
import sys

HINWEIS = (
    '<p class="ki-hinweis ki-hinweis-kapitel">Hinweis: Diese Inhalte wurden mit '
    "Unterstützung von Künstlicher Intelligenz erstellt und redaktionell "
    "überprüft (Transparenzhinweis gemäß Art. 50 EU AI Act).</p>"
)

LIZENZ = (
    '<p class="lizenz-hinweis ki-hinweis-kapitel">Open Knowledge (Freies '
    "Wissen): Alle Texte stehen unter der freien Lizenz "
    '<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.de">Creative '
    "Commons Namensnennung – Weitergabe unter gleichen Bedingungen 4.0 "
    "International (CC BY-SA 4.0)</a> und können frei gelesen, geteilt und "
    "weiterverarbeitet werden.</p>"
)


def hinweis_einfuegen(text):
    zeilen = text.split("\n")
    # Nach der ersten Überschrift einfügen, sonst ganz oben
    pos = 0
    for i, zeile in enumerate(zeilen):
        if zeile.startswith("# "):
            pos = i + 1
            break
    zeilen[pos:pos] = ["", HINWEIS, ""]
    return "\n".join(zeilen).rstrip("\n") + "\n\n" + HINWEIS + "\n\n" + LIZENZ + "\n"


def bearbeiten(eintraege):
    for eintrag in eintraege:
        kapitel = eintrag.get("Chapter") if isinstance(eintrag, dict) else None
        if not kapitel:
            continue
        if kapitel.get("path"):
            kapitel["content"] = hinweis_einfuegen(kapitel["content"])
        bearbeiten(kapitel.get("sub_items", []))


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "supports":
        sys.exit(0)
    _kontext, buch = json.load(sys.stdin)
    bearbeiten(buch.get("sections") or buch.get("items") or [])
    json.dump(buch, sys.stdout)


if __name__ == "__main__":
    main()
