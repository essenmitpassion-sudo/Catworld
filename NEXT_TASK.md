# Nächste Aufgabe: versehentliche Codeänderungen rückgängig machen
Zwei-Laternen-Abschnitt ist fertig, 148 Tests und voller SDL-Smoke grün.
Nicht erneut implementieren. Zuerst Git/Remote und neue Reviews prüfen.

Nächster ausführbarer Schritt: RED-UI-Test für Strg+A → Texteingabe → Strg+Z:
die eigene Lösung muss zurückkommen, Ausführung bleibt gestoppt. Eine kleine,
begrenzte Undo-Historie je Editor; Rücknahme darf keine fremden Entwürfe einmischen.
Backspace/Delete und Einrückung berücksichtigen. Kein neues Framework, kein Cloudsync.
Danach Regression/SDL, Checkpoint und Remote-Verifikation. Menschlichen Nutzen offenlassen.
