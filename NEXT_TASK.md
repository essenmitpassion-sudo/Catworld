# Nächste Aufgabe: echte Routenwahl statt mehr linearer Aufgaben
F12-Planvergleich fertig: 282 Tests, voller SDL-Smoke, unabhängiger Review ohne Befund.
Zuerst Checkpoint/Bundle/Remote und lokale Änderungen prüfen; keine Doppelimplementierung.

Pareto-Prüfung: Werkstatt derzeit linear. Ein kleiner oberer Steg von Feld2 bis6
könnte das Tor umgehen: mehr Schritte und neue räumliche Entscheidungen, dafür keine
Schalterbedingung. Torweg mit if bleibt kürzer. Prüfen, ob dies mit kleinen,
datengetriebenen Weltregeln und vorhandener Darstellung möglich ist. Nicht sofort
komplettes Grid/ECS bauen. Nur umsetzen, wenn zwei spielerisch unterscheidbare,
gültige Routen und eine nachvollziehbare Lern-/Entscheidungswirkung entstehen.
Vor grösserem Umbau vorhandenen Stand sichern. Eigene Programme/Altsaves erhalten.
Menschliche Spieltests bleiben offen; Technik eigenständig fortsetzen.
