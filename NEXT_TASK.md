# Nächster kleiner Schritt: eigene Programme behalten

Abruf aus leerem Editor ist implementiert und geprüft: 58 Tests sowie SDL-Smoke.
Nicht noch einmal bauen. Die Eigenlösung und der Abrufentwurf bleiben bisher nur
während einer Sitzung erhalten; nach dem Schliessen fehlen sie.

Kleinste sinnvolle Fortsetzung: beide selbst geschriebenen Texte lokal speichern
und beim nächsten Start wieder bereitstellen. Keine Cloud, Accounts oder neue
Sprachsyntax. Vorhandene Entwürfe nicht blind überschreiben; atomar schreiben,
Format/Länge beim Lesen begrenzen, beschädigte Daten verständlich melden und
Wiederherstellung ermöglichen. Geladener Text darf niemals automatisch laufen.
Keine allgemeine Spielstand-/Migrationsengine bauen.

RED zuerst für Speichern, Neustart/Wiederherstellen, defekte Daten und fehlende
Schreibrechte; bestehende Run/Step/Stop/Reset- und Abruf-Tests erhalten. SDL-Smoke
mit Neustart und wiedergefundenem Text. Persönliche Testdaten nicht committen.
Menschlicher Lernwert weiterhin offen markieren; echte neue Reviews priorisieren.

Bei Kapazitätsgrenze vor neuer Arbeit Commit + geprüftes Bundle + CURRENT sichern.
Keine behauptete tägliche Automation: hier derzeit nicht verfügbar.
