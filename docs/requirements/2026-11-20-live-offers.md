# UDI – CORE: Reale Angebote finden, prüfen und nutzbar machen

## Mission

Entwickle UDI zu einem verlässlichen Such- und Dealservice für Produkte, Tickets, lokale Angebote und weitere passende Gelegenheiten.

Der Kernnutzen ist nicht, möglichst viele Treffer anzuzeigen. UDI soll **reale, aktuell gültige und direkt nutzbare Angebote** finden und übersichtlich präsentieren – mit funktionierendem Link zur Quelle.

**Produktversprechen:** Ein Angebot erscheint nur dann als aktuell, wenn UDI belegen kann, dass es an der Quelle noch verfügbar oder aktiv ist.

## Der USP: geprüfte Handlungsfähigkeit

UDI hebt sich dadurch ab, dass Nutzer weniger Zeit mit veralteten Treffern, unklaren Rabatten und unbrauchbaren Links verlieren.

Prüfe für jedes Ergebnis – soweit die Quelle es zuverlässig ermöglicht:

- Ist das Angebot noch aktiv?
- Ist Preis, Verfügbarkeit oder Auktionsstatus aktuell?
- Funktioniert der Link und führt er direkt zum Angebot?
- Welche Zusatzkosten kommen dazu, etwa Versand oder Gebühren?
- Bis wann gilt das Angebot oder läuft die Auktion?
- Welche Bedingungen gelten für einen Gutschein?
- Wann und über welche Quelle wurde der Status zuletzt geprüft?

Zeige diese Informationen verständlich und knapp. Erfinde keine Verfügbarkeit, Preise, Rabattvorteile oder Gutscheinkonditionen.

## Was UDI finden soll

Berücksichtige die tatsächlich erreichbaren und zulässigen Quellen, darunter:

- reguläre Angebote und Preisaktionen
- gültige Gutscheine und Rabattcodes
- lokale und schweizweite Angebote sowie Tickets
- aktive Ricardo-Angebote, Sofortkäufe und laufende Auktionen
- aktuelle Gebote, Ablaufzeit und Verkäuferinformationen, sofern verlässlich abrufbar

Ein Rabattcode gilt nicht automatisch als funktionierend. Zeige ihn nur als **geprüft**, wenn Gültigkeit und Bedingungen anhand einer verlässlichen Quelle bestätigt werden können. Sonst kennzeichne ihn klar als unbestätigt oder lasse ihn aus der verifizierten Trefferliste weg.

Bei Ricardo muss klar erkennbar sein, ob es sich um einen Sofortkauf oder eine Auktion handelt. Zeige keine beendeten Auktionen als aktive Gelegenheiten.

## Wahrheits- und Aktualitätsregeln

1. Nutze bevorzugt offizielle, aktuelle und zulässige Quellen oder dokumentierte Schnittstellen.
2. Speichere Herkunft und Prüfzeit jedes Ergebnisses.
3. Prüfe Status und Link möglichst kurz vor der Anzeige erneut.
4. Ist eine aktuelle Prüfung nicht möglich, behaupte nicht, das Angebot sei geprüft oder noch verfügbar.
5. Entferne abgelaufene oder beendete Angebote aus der aktiven Liste.
6. Zeige bei Unsicherheit einen klaren Status statt einer Vermutung.
7. Vergleiche Preise nur mit nachvollziehbarer Grundlage. Behaupte keine Ersparnis durch ungeprüfte oder künstlich aufgeblähte Vergleichspreise.
8. Kennzeichne Werbung, Affiliate-Links und bezahlte Platzierungen transparent.
9. Erfinde niemals Ergebnisse, Verfügbarkeiten, Gutscheine oder Quellen.
10. Umgehe keine Zugangsbeschränkungen und missachte keine Nutzungsbedingungen.

Wenn eine Quelle nicht zuverlässig oder zulässig angebunden werden kann, dokumentiere die Einschränkung und entwickle eine realistische Alternative. Fülle die Oberfläche nicht mit Demo-Daten, die wie echte Angebote aussehen.

## Such- und Ergebnisdarstellung

Gestalte den Weg von der freien Suche zum brauchbaren Ergebnis so einfach wie möglich. Nutzer sollen sprechen oder tippen können. UDI darf fehlende wichtige Kriterien erkennen, soll aber nur dann nachfragen, wenn die Antwort die Ergebnisse deutlich verbessert.

Zeige Ergebnisse kompakt mit:

- Angebot und Anbieter
- aktuellem Preis oder aktuellem Gebot
- nachvollziehbarer Ersparnis, falls belegbar
- Angebotsart und Ablaufzeit
- Versand, Gebühren oder wichtigen Bedingungen, soweit bekannt
- Prüfstatus und Zeitpunkt der letzten Prüfung
- einem direkten, funktionierenden Link

Sortiere nach tatsächlichem Nutzen für die Suchabsicht – nicht allein nach dem höchsten Rabatt oder einer bezahlten Platzierung. Erkläre knapp, warum ein Ergebnis passt. Vermeide überladene Filter und unklare Statussymbole.

## Priorisierte Meilensteine

### M0 – Quellenrealität belegen

Untersuche die vorhandene UDI-Implementierung und prüfe, welche realen Quellen für Angebote, Gutscheine und Ricardo tatsächlich erreichbar und zulässig sind.

Erstelle eine kurze Quellenübersicht mit:

- unterstützter Angebotsart
- erreichbaren Daten
- Aktualisierbarkeit
- bekannten Einschränkungen
- sinnvoller technischer Anbindung

Belege die Prüfung mit konkreten Beispielen aus den Quellen. Eine geplante oder mögliche Anbindung gilt nicht als umgesetzt.

### M1 – Kleinster vollständiger Live-Nutzen

Baue einen durchgängigen Ablauf für eine klar begrenzte Auswahl realer Quellen: Suche, Trefferabruf, Statusprüfung, verständliche Anzeige und direkter Link.

Wähle den Umfang nach der tatsächlich verfügbaren Datenqualität. Ein kleiner Bestand verlässlicher Treffer ist wertvoller als eine breite Liste ungeprüfter Ergebnisse.

### M2 – Gutscheine und Ricardo ergänzen

Ergänze Gutscheine und Ricardo-Auktionen als eigene Angebotsarten. Stelle ihre unterschiedlichen Bedingungen und Status klar dar. Prüfe insbesondere Ablauf, aktive Gebote, Versand und Gebühren, soweit die Quellen diese Informationen liefern.

### M3 – Abdeckung und Aktualisierung ausbauen

Erweitere Kategorien und Regionen schrittweise, wenn neue Quellen die Aktualitäts- und Qualitätsregeln erfüllen. Verhindere doppelte Treffer, abgelaufene Angebote und unnötige Benachrichtigungen. Nutzer sollen Regionen, Kategorien und relevante Kriterien steuern können.

## Technische und produktbezogene Qualität

Trenne Quellzugriff, Normalisierung, Aktualitätsprüfung und Darstellung so, dass zusätzliche Quellen später gezielt ergänzt werden können. Behandle Ausfälle, Rate Limits und unvollständige Daten zuverlässig. Speichere nur Daten, die für Suche, Aktualität und Nutzerpräferenzen erforderlich sind.

Setze den wertvollsten real funktionierenden Schritt zuerst um. Ein fehlender Zugang zu einer Quelle blockiert nicht die unabhängigen Teile der Arbeit; dokumentiere den konkreten Blocker und arbeite mit verifizierbaren Quellen weiter.

## Abnahme

Der Kern gilt erst als geliefert, wenn ein Nutzer mindestens einen realen Treffer öffnen und dessen Aktualitätsstatus nachvollziehen kann. Prüfe zusätzlich abgelaufene Angebote, ungültige Links, unbekannte Gutscheinkonditionen, doppelte Treffer und beendete Ricardo-Auktionen.

Berichte am Ende knapp:

- welche realen Quellen angebunden und tatsächlich geprüft wurden
- welche Angebotsarten funktionieren
- welche Qualitätsprüfungen durchgeführt wurden
- welche Einschränkungen bestehen
- was als nächster Meilenstein den größten echten Nutzen bringt

**Oberste Leitlinie:** Lieber wenige echte Angebote, die jetzt funktionieren, als viele Treffer, denen der Nutzer nicht vertrauen kann.