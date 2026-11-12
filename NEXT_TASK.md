# Nächste Aufgabe: übersprungene Zweige sichtbar machen
Bedingungen und adaptive Lösung implementiert: 265 Tests, kompletter SDL-Smoke grün.
Nach bestätigtem Commit/Bundle/Push: übersprungene Aktionszeilen nach falscher
Bedingung am eigenen Code markieren. Kein automatisches Umschreiben; ein echter
Trace, der bei Edit/Undo/Reset/Neustart verschwindet. Maximal 64 Aktionen, kein
neuer Spielmodus. Begründung: kleinster Pareto-Hebel verbindet Entscheidung und
sichtbar ausgebliebene Wirkung. RED→GREEN, SDL, sichern, weiter.
Danach tatsächlichen Entscheidungsraum prüfen; neue Syntax/Content ist kein Selbstzweck.
