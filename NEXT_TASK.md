# Nächster kleiner Schritt: Tippfehler selbst beheben

Abruf und wiederherstellbare eigene Entwürfe sind fertig (a15b644 / 95032c5),
76 Tests und SDL-Smoke grün. Nicht erneut implementieren.

Kleinste sinnvolle Verbesserung: konkrete Fehlermeldungen für falsch geschriebene
bekannte Befehle, z.B. move_rigth(), und unerlaubte Argumente unterscheiden.
Zeile und verständliche Ursache zeigen; gegebenenfalls den bekannten Befehlsnamen
als Hinweis anbieten. Nie Code ersetzen oder automatisch starten, keine Komplettlösung
für eine Mission einblenden. AST-Allowlist und Budgets unverändert streng halten.

RED mit echten Eingaben; Core- und SDL-Tests für Fehlermeldung, Korrektur durch eigene
Texteingabe und erfolgreichen erneuten Run. Bestehende Anfänger-/Transfer-/Abruf-
und Speicherfunktionen erhalten. Neue Review- oder Owner-Befunde zuerst prüfen.

Kein Warten auf menschliche Mikrofreigaben; Lernwert/Spass bleiben ohne Menschentest
offen. Bei Kapazitätsgrenze erst Commit/Backup/Status sichern. Keine aktive Automation
behaupten: in dieser Sitzung kein Zeitplan-Werkzeug verfügbar.
