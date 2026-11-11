# Nächste Aufgabe: eigener Plan für beide Torzustände
Werkstatt und Startvariation fertig; 237 Tests, voller SDL-Smoke, Review ohne Befund.
Nach bestätigtem Commit/Bundle/Remote weiter: gate_open() als begrenzten booleschen
Sensor und oberste if gate_open()/if not gate_open()-Blöcke mit Aktionsaufrufen
prüfen. Bedingung muss beim Erreichen gegen aktuellen Weltzustand ausgewertet werden,
nicht beim Laden. Step höchstens eine Weltaktion, Stop/Reset weiter zuverlässig.
Keine else/nested if, keine Variablen, kein exec/eval. F1 optional erklärt das
Prinzip; derselbe eigene Plan soll beide F11-Varianten lösen können. Testen, sichern,
weiter. Menschlicher Lernnachweis bleibt offen.
