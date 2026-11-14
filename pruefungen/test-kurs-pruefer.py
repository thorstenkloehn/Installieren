"""Prüft, dass der Übungssatz richtige und falsche Lösungen unterscheidet."""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[1] / 'beispiele' / 'kurs-pruefer'


class CheckerTest(unittest.TestCase):
    def run_solution(self, body):
        with tempfile.TemporaryDirectory(prefix='Kurs mit Leerzeichen ') as tmp:
            folder = Path(tmp)
            shutil.copytree(SOURCE / 'tests', folder / 'tests')
            (folder / 'aufgabe.py').write_text(body, encoding='utf8')
            return subprocess.run(
                [sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_aufgabe.py', '-v'],
                cwd=folder, text=True, capture_output=True, timeout=10,
            )

    def test_unfertige_aufgabe_scheitert(self):
        result = self.run_solution((SOURCE / 'aufgabe.py').read_text())
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('NotImplementedError', result.stderr)

    def test_richtige_loesung_besteht(self):
        result = self.run_solution('def quadratsumme(werte):\n    return sum(x * x for x in werte)\n')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('Ran 5 tests', result.stderr)

    def test_blosse_summe_scheitert(self):
        result = self.run_solution('def quadratsumme(werte):\n    return sum(werte)\n')
        self.assertNotEqual(result.returncode, 0)

    def test_veraenderung_der_eingabe_scheitert(self):
        result = self.run_solution('def quadratsumme(werte):\n    zahlen = list(werte)\n    if isinstance(werte, list):\n        werte.clear()\n    return sum(x*x for x in zahlen)\n')
        self.assertNotEqual(result.returncode, 0)


if __name__ == '__main__':
    unittest.main()
