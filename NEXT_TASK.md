# Nächste Aufgabe: mehrere Ziele mit einem eigenen Plan

Dachtransfer ist implementiert und gerettet (7d4675c), 134 Tests grün; der neue
SDL-Smoke prüft auch F8, falschen Plan, eigene Korrektur und dauerhaften Entwurfserhalt.
Nicht nochmals entwickeln. CURRENT.md enthält den Wiederaufnahmebefehl.

Nächster ausführbarer Produktschritt: vorhandene World/collect-Regeln lesen und
einen RED-Test für zwei nacheinander erreichbare Laternen im selben Programm
formulieren. Ziel: Bewegungen und collect kombinieren; kein neuer Python-Befehl.
Vor Umsetzung die einfachste Darstellung wählen und bisherigen Ein-Ziel-Code samt
Entwürfen unverändert lauffähig halten. Kein generisches Inventar/Level-Framework.

Vor jedem neuen Batch Git-/Prozessstand prüfen, lokale Arbeit sichern und Remote
vergleichen. Nach kleinem getestetem Paket committen, Bundle prüfen, pushen und
Remote bestätigen. Bei Limitzeichen sofort retten. Keine parallelen Writer,
Auto-Merges oder Scheduler. Menschlicher Lernwert bleibt bis zum Spieltest offen.
