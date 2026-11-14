#!/usr/bin/env python3
"""
Automatisiertes Prüfwerkzeug für Urheberrechts- und Lizenzkonformität im mdBook.
Wird vom Skill 'urheberrechtspruefung' für agy cli, Claude Code und Codex verwendet.
"""

import os
import re
import sys
from pathlib import Path

SRC_DIR = Path("src")

COMMON_EN_WORDS = {
    "the", "and", "is", "in", "to", "of", "it", "you", "that", "he", "was",
    "for", "on", "are", "as", "with", "they", "at", "be", "this", "have",
    "from", "or", "one", "had", "by", "word", "but", "not", "what", "all",
    "were", "we", "when", "your", "can", "said", "there", "use", "an", "each"
}

def analyze_chapter(filepath: Path):
    content = filepath.read_text(encoding="utf-8")
    lines = content.splitlines()
    findings = []

    # 1. Check for foreign English paragraphs in prose
    clean = re.sub(r'```.*?```', '', content, flags=re.DOTALL)
    clean = re.sub(r'`[^`\n]+`', '', clean)
    clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean)

    for idx, line in enumerate(clean.splitlines(), 1):
        words = re.findall(r'\b[a-zA-Z]+\b', line)
        if len(words) >= 8:
            en_count = sum(1 for w in words if w.lower() in COMMON_EN_WORDS)
            if en_count / len(words) > 0.4:
                findings.append({
                    "line": idx,
                    "type": "englischer_fliesstext",
                    "text": line.strip()[:100],
                    "severity": "mittel"
                })

    # 2. Check for explicit third-party attribution words without proper section
    for idx, line in enumerate(lines, 1):
        if re.search(r'\b(?:basiert auf|entlehnt|übernommen von|Vorlage von|Quelle:)\b', line, re.IGNORECASE):
            # check if it's not a generic technical phrase
            if not re.search(r'basiert auf (?:Node\.js|Electron|Vite|Vue|Python|PHP)', line):
                findings.append({
                    "line": idx,
                    "type": "quellenbezug_pruefen",
                    "text": line.strip()[:100],
                    "severity": "gering"
                })

    # 3. Check for existence of 'Quellen und Lizenz' section
    has_license_section = bool(re.search(r'^##\s+(?:Quellen|Lizenz|Quellen und Lizenz)\b', content, re.MULTILINE))

    return findings, has_license_section

def main():
    if not SRC_DIR.exists():
        print(f"Fehler: Verzeichnis '{SRC_DIR}' nicht gefunden.")
        sys.exit(1)

    all_files = sorted([p for p in SRC_DIR.glob("*.md") if p.name != "SUMMARY.md"])
    total_findings = 0
    missing_licenses = []

    print(f"=== Prüfe {len(all_files)} Kapitel auf Urheberrechtskonformität ===\n")

    for f in all_files:
        findings, has_license = analyze_chapter(f)
        if not has_license and f.name not in ["impressum.md", "datenschutz.md", "einleitung.md"]:
            missing_licenses.append(f.name)
        if findings:
            total_findings += len(findings)
            print(f"Auffälligkeiten in {f.name}:")
            for item in findings:
                print(f"  Zeile {item['line']} [{item['severity'].upper()}]: {item['type']} -> {item['text']}")

    print("\n=== Zusammenfassung ===")
    print(f"Geprüfte Dateien: {len(all_files)}")
    print(f"Meldungen zu Textstellen: {total_findings}")
    print(f"Kapitel ohne 'Quellen und Lizenz'-Abschnitt: {len(missing_licenses)}")

    if total_findings == 0:
        print("\nErgebnis: Keine urheberrechtlich bedenklichen Textstellen gefunden.")
        sys.exit(0)
    else:
        print(f"\nErgebnis: {total_findings} Stellen zur manuellen redaktionellen Prüfung vorgemerkt.")
        sys.exit(1)

if __name__ == "__main__":
    main()
