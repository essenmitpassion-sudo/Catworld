# Nächster Abschnitt: ein Plan für viele Schritte

„Licht für Nox“ ist technisch als zusammenhängender Abschnitt umgesetzt in d5081fd:
84 Tests plus vollständiger SDL-Smoke. Tippfehlerdiagnose ist ebenfalls fertig.
Keine Doppelimplementierung; aktuelle Reviews zuerst prüfen.

Nächster sinnvoller kleiner Spielschritt: ein längerer Dachweg motiviert Wiederholung.
Erst die bestehende Bewegungsfolge ausführbar halten, dann genau eine neue Sprachidee:
ein eng begrenztes `for ... in range(...)` für die bestehenden Aktionsaufrufe.
Kein allgemeiner Python-Interpreter, keine Variablen-/Funktions-/Flottenengine.

Vor Implementierung die erlaubten AST-Formen und Laufzeitbudgets festlegen; echtes
Python-Verhalten für die unterstützte Teilmenge, Ressourcen vor Ausführung begrenzen,
keine uneingeschränkte Auswertung. Negative Schleifen-/Grössenfälle und Stop/Reset
zuerst RED testen. Alte Programme, beide gespeicherten Entwürfe und freie Einstiege
erhalten. Neue Zielposition aus derselben Szenariokonfiguration rendern.

Eine beobachtbare Weltreaktion und eine optionale Hilfe statt ungefragter Komplettlösung.
Bestehenden Abschnitt weiterhin spielbar halten, vollständiger Regressionstest und
SDL-Smoke, Checkpoint vor Erweiterung. Menschliche Klarheit/Freude bleiben ohne
Beobachtung offen; reale Owner-Rückmeldung hat Vorrang vor dieser nächsten Idee.
