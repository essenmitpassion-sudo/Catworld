# Einzige nächste Aufgabe: G0-Abnahme

G0 ist implementiert; keine G1-Erweiterung beginnen.

1. Aktuellen Branch/HEAD und CURRENT gegen Git prüfen; Tests mit `.venv/bin/python -m pytest -q` reproduzieren.
2. Unabhängiger Review von `neonpaw/code/runner.py`, Welt und SDL-Steuerung; keine behauptete bereits erfolgte ChatGPT-Prüfung.
3. Menschlicher Kurztest: Run bewegt Katze; zweiten Befehl eingeben, Step/Stop/Reset nutzen; absichtlich `bad()` eingeben und Fehler selbst beheben. Verständlichkeit und Lust auf Weiterspielen separat protokollieren, ohne Mikrofreigaben für technische Fixes.
4. Nur reproduzierte G0-Blocker beheben. Windows-Start bei verfügbarer Plattform prüfen.

GitHub-Branch ist veröffentlicht. PR-Erstellung bleibt ohne bestätigten API-Zugriff und separaten Basisbranch offen; keine automatischen Merges oder Branchschutzänderungen.
