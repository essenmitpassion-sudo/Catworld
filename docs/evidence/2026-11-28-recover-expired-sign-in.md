# Suche nach abgelaufener Anmeldung fortsetzen · 28.11.2026

Ausgangsstand 1e1386b. Eine ersetzte Sitzung liess die geschützte Suche mit HTTP 401 scheitern. Die Ergebnisansicht meldete das Problem, bot aber nur Text. Die Speicheraktion blieb stehen. Die rote DE-Gegenprobe erreichte den Fehlerzustand und fand keine direkte Anschlussaktion.

Bei fehlender oder abgelaufener Sitzung bietet das Suchergebnis «Erneut anmelden» an. Der Klick führt in den vorhandenen Anmeldedialog. Die alte Speicheraktion wird entfernt. Der Entwurf bleibt erhalten. Schliessen bringt den Fokus zum Knopf zurück. Nach der Anmeldung kann die Suche durch einen ausdrücklichen Klick erneut gestartet werden.

Der isolierte HTTP-Dienst ersetzte das Browser-Testtoken tatsächlich durch die Anmeldung einer zweiten Instanz. Danach bestanden in DE bei 320px und EN bei 390px die Kette aus HTTP 401, Wiederanmeldung, Abbrechen/Wiederöffnen, erhaltenem Suchwunsch und erfolgreicher Suche. Der Dienstzähler bestätigt null Angebotsanfragen während der Wiederanmeldung. 199 Projekttests, Typprüfung, neuer Build und vollständiger Chromium-Smoke bestanden. Der Lauf verwendet Testkonten und das gemeinsame WebView-Frontend.
