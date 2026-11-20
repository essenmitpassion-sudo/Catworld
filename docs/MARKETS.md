# UDI · Markt, Lieferwunsch und Beleg getrennt

Aktiv ist ausschliesslich der Schweizer Pilot. Die gemeinsame Datei `src/markets.mjs` definiert CH, CHF, Europe/Zurich und DE/EN-Formatlocales unabhängig von Oberfläche und Plattform. Unbekannte Märkte, Lieferländer und Budgetwährungen werden zurückgewiesen; sie fallen nicht auf CH zurück. Es gibt keinen Länderumschalter, Wechselkurs oder zusätzlichen Markt.

| Feld | Bedeutung | Kein Nachweis für |
|---|---|---|
| UI-Sprache | Deutsche/englische Bedienung | Angebotsland, andere Währung oder neue Quelle |
| marketId | Deklarierter Angebots-/Suchmarkt der freigegebenen Quellenkonfiguration | Händlerstandort, Steuerdomizil oder tatsächliche Lieferung |
| deliveryCountry im Suchauftrag | Gewünschtes Lieferland, derzeit CH | Dass ein Anbieter dorthin liefert oder Versand bereits enthalten ist |
| currency im Suchauftrag | Budgetwährung, derzeit CHF | Wechselkurs oder Import-Endpreis |
| sourceId | Stabile Kennung der kuratierten Quelle, derzeit Domain | Konkreter Verkäufer eines Marktplatzinserats |
| seller | Verkäufer laut Angebotsquelle | Unabhängige Prüfung seiner Seriosität |
| currency / Preis im Check | Aus konkreter Quelle gelesene Angaben im unterstützten CHF-Pfad | Vollständige Kosten oder bestätigte Ersparnis |
| deliveryDestination im Check | Nur ausdrücklich belegtes Lieferziel | Wird nicht aus CH oder der Sprache ergänzt; derzeit im Live-DQ-Pfad null |
| checkedAt / availability | Eigenständiger Prüfzeitpunkt und gemeldeter Aktivstatus | Dauerhaft garantierter Bestand |

Quellenregister und Katalog deklarieren ihren Schweizer Markt ausdrücklich. Discovery begrenzt die Quellen auf den Suchkontext; Verifier und Scan prüfen Markt-/Quellenidentität. Cache-Schlüssel enthalten Markt und Quelle. Vergleich und Passport akzeptieren nur passende Herkunft; ältere Beobachtungen ohne Kennung brauchen neue Prüfung. CHF allein ist keine Marktzuordnung. Versand, Gebühren, Steuern und Import bleiben eigenständige Fakten; offene Kosten verhindern eine Kaufempfehlung. Zustand und belegter Lieferort müssen für einen Preisvorteil weiterhin passen.

## Gespeicherte und geteilte Aufträge

Neue lokale Aufträge stehen unter `udi.searches.v2`, mit `schemaVersion: 2`, `marketId`, `deliveryCountry`, `currency` und vollständigen bisherigen Kriterien. Lesen verwendet v2, andernfalls den alten v1-Speicher. Unversionierte alte Schweizer Aufträge werden im Speicher des Programms ausdrücklich auf das historische CH/CHF-Modell abgebildet, ohne beim Lesen auf dem Gerät umzuschreiben. Ein späterer Schreibvorgang sichert v2. Das Original bleibt als v1-Kopie erhalten; bewusstes Entfernen löscht denselben Auftrag aus beiden Versionen. Andere ältere Einträge werden dabei bewahrt. Ein vorhandenes leeres v2 darf alte Einträge nicht wiederherstellen. Unbekannte Felder, fehlende Kriterien oder fremde Kontexte werden bei v2 zurückgewiesen, nicht durch Standardwerte ersetzt.

Neue Links haben `v:2` und dieselben Kontextfelder. Alte v1-Links bleiben ausdrücklich CH/CHF, unabhängig von Sprachwahl oder späterer aktiver Region. v2 braucht vollständige Kontextfelder und bekannte Schlüssel. Empfang prüft Format/Kontext, zeigt editierbare Kriterien und startet keinen Abruf. Links enthalten weiterhin keine Preise, Prüfsnapshots, Aufnahmen, Watchlists oder Schlüssel.

## Grenzen und nächster Ausbau

Beide nativen Projekte bekommen dieselbe Marktlogik und Assetliste. Automatische Bündel-/Browser-Grenztests sind keine native Geräteabnahme. Der native Angebotsdienst und die tatsächlichen Android-/iOS-Abläufe bleiben offen. Der Schweizer Pilot ist ebenfalls noch nicht vollständig validiert: vollständiger DQ-Endpreis und eine zweite unabhängige Quelle fehlen.

Vor einem weiteren Markt sind unterstützte Währung/Einheiten, Post-/Lieferregeln, Quellenrechte, Identität, Verkäufer, Kosten und echte Nutzer-/Geräteabnahme gesondert zu erweitern. Gemeinsame Beobachtungen und Vergleiche müssen je Markt/Lieferkontext getrennt bleiben. Keine Umrechnung oder globale Lieferbarkeit aus dieser Grundlage ableiten. Reihenfolge und weitere Sprachen bleiben in docs/INTERNATIONAL.md; Plattformgates in docs/PLATFORMS.md.
