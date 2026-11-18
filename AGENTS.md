# Universal Deal Intelligence

- Produktauftrag und Abnahmekriterien stehen in PLAN.md. STATUS.md hält Nachweise und den nächsten ausführbaren Schritt fest.
- Ein Git-Integrator sichert verifizierte Änderungen mit normalen Commits und liest Remote-Referenzen zurück. Historische Referenzen erhalten. Ein Wechsel des Standardbranches setzt die Produktabnahme voraus.
- Schweizer Produktdaten nur aus nachweislich zulässig zugänglichen Quellen. MPN, Variante, konkreter Verkäufer, Ziel-URL, Prüfzeit, Bestand und vollständige CHF-Kosten als getrennte Fakten behandeln.
- Unbekannte Gebühren bleiben unbekannt. Stale, abweichende oder unvollständige Beobachtungen dürfen keine Kaufempfehlung oder Meldung begründen. Weiterleitungen an jeder Stufe begrenzen, sobald ein zugelassener Abrufdienst existiert.
- Keine Benutzer-URLs serverseitig abrufen. Externe Felder als Text rendern. Schlüssel lokal oder über die Betriebsumgebung verwalten und aus Builds, Logs und Git heraushalten. Mehrbenutzerbetrieb erfordert Authentifizierung und Zugriffstrennung.
- Nach substanziellen Änderungen Build, Tests und den Browser-Ablauf mit Chromium ausführen. Echte Quellen- und UX-Abnahmen sind eigene Nachweise. Keine Schutzmechanismen umgehen und keine Ausgaben auslösen.
