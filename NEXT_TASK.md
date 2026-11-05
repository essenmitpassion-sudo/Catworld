# Nächster kleiner Schritt: Befehlsfolge übertragen

G0 technisch abgeschlossen in 442cddc; G1-Batterie-Loop implementiert in 24d644e,
45 Tests grün. Keine weitere G0-Audit-Schleife. Menschliche Lern-/Spassprüfung bleibt offen.

Kleinste sinnvolle Fortsetzung: Nach dem ersten Erfolg eine überschaubare Variante,
in der die Batterie genau ein Feld weiter liegt. Spieler passt die Befehlsfolge
selbst an; keine automatische Lösung, noch keine Schleifen oder neuen Aktionen.
Zuerst echten HEAD und vorhandene Tests prüfen. Vor Umsetzung die feste Zielmarkierung
und Weltkonfiguration gemeinsam betrachten, damit Anzeige und Regel dieselbe Position
verwenden. Relevante Fehler zuerst reproduzieren; vorhandenes Level bleibt spielbar.

Abnahme: Transferziel erreichbar, collect nur am tatsächlichen Batteriefeld,
Reset reproduzierbar, Run/Step/Stop unverändert, sichtbare Reaktion und SDL-Smoke.
Ein kurzer Menschentest kann Aha-Moment, Verwirrung und Wunsch nach nächster Handlung
festhalten; fehlende Tester blockieren gemäss AGENTS nicht die technische Entwicklung.
Kein weiterer Scope in dieser Etappe.
