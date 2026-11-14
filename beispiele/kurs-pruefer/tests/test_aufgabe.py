import unittest

from aufgabe import quadratsumme


class QuadratsummeTest(unittest.TestCase):
    def test_positive_zahlen(self):
        self.assertEqual(quadratsumme([2, 3, 4]), 29)

    def test_negative_zahlen(self):
        self.assertEqual(quadratsumme([-3, 2]), 13)

    def test_leere_eingabe(self):
        self.assertEqual(quadratsumme([]), 0)

    def test_generator(self):
        self.assertEqual(quadratsumme(x for x in [1, 2, 3]), 14)

    def test_eingabe_bleibt_erhalten(self):
        werte = [2, -5, 1]
        quadratsumme(werte)
        self.assertEqual(werte, [2, -5, 1])


if __name__ == "__main__":
    unittest.main()
