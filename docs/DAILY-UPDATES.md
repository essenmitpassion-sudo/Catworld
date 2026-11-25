# Tägliche Updates · lokaler Serververtrag

`scripts/daily-updates.mjs` verwaltet eine ausdrückliche Zustimmung pro authentifiziertem Konto und höchstens ein lokales Briefing pro Konto und Kalendertag in `Europe/Zurich`. Ohne gespeicherte Zustimmung bleibt die Einstellung aus. Es gibt keinen Versanddienst, Zustellkanal, Zeitplan oder automatischen Quellenabruf. Ein Briefing ist kein Zustellnachweis und keine bestätigte Ersparnis.

## Konto und Speicherung

`createDailyUpdates({databasePath, now})` verwendet das eingebaute `node:sqlite`. Für dauerhaften Betrieb muss der Betreiber einen geschützten SQLite-Dateipfad bereitstellen; der Standard `:memory:` ist flüchtig. Konto-IDs müssen ausschliesslich aus tatsächlich geprüfter Authentifizierung stammen. Weder E-Mail-Adressen, Empfängeradressen, Zugangstoken noch Suchtexte werden als Kontometadaten gespeichert.

- `getPreference(accountId)` liest `{enabled, updatedAt}`, ohne Zustimmung anzulegen.
- `setPreference(accountId, boolean)` ändert die Einstellung atomar. Wiederholtes Schreiben derselben Einstellung verändert den Bestätigungszeitpunkt nicht.
- Ausschalten entfernt vorhandene Briefing-Inhalte sofort. Eine inhaltslose Konto-/Tagesmarkierung verhindert, dass erneutes Einschalten am selben Tag ein zweites Briefing erzeugt.
- `deleteAccount(accountId)` entfernt Einstellung und sämtliche lokalen Briefing-Daten atomar. Das Widerrufen von Anmeldung und anderen Kontodaten bleibt Aufgabe des tatsächlichen Kontodienstes.

## Belege und Tagesgrenze

`eligibleDeals(accountId, {previous, current})` ist ein Kandidatenfilter, keine Tagesreservierung und kein Versand. Die beiden Rohbeobachtungs-Snapshots muss ein vertrauenswürdiger Aufrufer bereits dem richtigen Konto und dessen gespeicherten Wünschen zugeordnet haben. Ohne historischen Vergleich wird keine Änderung behauptet. Der aktuelle Beleg muss die vorhandene Katalogprüfung bestehen: richtige MPN, konkrete Quelle, Verkäufer und direkte Ziel-URL, höchstens fünf Minuten alt, verfügbar und vollständig in CHF bepreist. Zustand und ausdrücklich belegtes Schweizer Lieferziel müssen mit dem historischen Beleg übereinstimmen. Testdaten, Mehrdeutigkeit und unvollständige Kosten scheiden aus. Relevant sind nur ein tieferer Gesamtpreis oder erneut verfügbare Ware ohne höheren Gesamtpreis.

`getDailyBriefing(accountId, {previous, current})` erzeugt daraus beim ersten geeigneten Abruf ein lokales Briefing `{date, createdAt, items}`. Ein leerer oder ungeprüfter Befund verbraucht den Tag nicht. SQLite-Transaktion und eindeutiger Konto-/Tagesschlüssel verhindern zwei Briefings bei gleichzeitigen Aufrufen und nach Neustart. Ein vorhandenes Briefing bekommt keine neuen Angebote; jeder erneute Abruf prüft die Frische nochmals. Wird ein aktueller Snapshot mitgegeben, müssen dessen passende Belege die gespeicherten Fakten weiterhin bestätigen. Ausverkauf, geänderter Gesamtpreis, fehlende Identität oder widersprüchliche Quelle entfernen den betroffenen Inhalt dauerhaft. Ein späterer Abruf ohne Snapshot darf ihn nicht wiederherstellen. Sind alle Belege abgelaufen oder widersprochen, lautet das Ergebnis `null` und es wird am selben Tag kein neues Briefing erzeugt. Am nächsten Zürcher Kalendertag sind neue frische Belege erforderlich. Es entsteht keine zusätzliche Recherche durch das Modul.

Ein späterer Versandprozess muss Zustimmung, Frische, neuere widersprechende Beobachtungen und Tagesübergabe unmittelbar vor jeder externen Aktion erneut prüfen, besonders nach asynchroner Arbeit. Bereits an einen Aufrufer zurückgegebene Daten sind keine unverfallbare Versandfreigabe. Ein solcher Prozess oder Kanal ist hier nicht implementiert.

## Optionaler HTTP-Handler

`createDailyUpdateHandler({store, authenticate, timeoutMs})` liefert einen ausdrücklich zu montierenden Handler für exakt `/api/v1/preferences/daily-update`. Es wird kein Server gestartet. `authenticate(token, {signal})` muss wie beim Suchdienst einen tatsächlich authentifizierten Konto-Subject oder `null` zurückgeben. Ohne diese Funktion oder Speicheranbindung bleibt der Handler geschlossen.

GET liest die Einstellung. PUT akzeptiert ausschliesslich `{"enabled": true}` beziehungsweise `false`, maximal 256 Byte. Die Antwort enthält `{schemaVersion: 1, enabled, updatedAt}`, keine Konto-ID oder Zugangsdaten. Kontoauswahl aus dem Request-Body, Cookie-Anmeldung und unbekannte Felder sind gesperrt. Browser-Origins sind fest auf `https://localhost` und `capacitor://localhost` begrenzt; authentifizierte Aufrufe ohne Origin bleiben für Server-/Betreiberprogramme möglich. Fremde Origins werden nicht reflektiert. Tokenbezug und Body-Lesen haben ein begrenztes Zeitfenster; verspätete Authentifizierung nach Ablauf verändert keine Einstellung. Die tatsächliche Authentifizierung, Bereitstellung, Kontolöschung sowie eine App-Anbindung sind getrennte Integrationsschritte.

## Prüfung und Grenzen

Eine neuere widersprechende Beobachtung entfernt den betroffenen Inhalt sofort. Der Tagesplatz bleibt belegt. Beim nächsten Abruf an einem neuen Zürcher Tag wird die alte Tageskopie dieses Kontos entfernt. Für inaktive Konten braucht der Betrieb eine regelmässige Löschroutine. Der vollständige Versandweg benötigt zusätzlich die kontogebundene Zuordnung zu gespeicherten Wünschen, einen ausgewählten Kanal und einen abschliessenden Einwilligungs- und Frischecheck.

`node --test tests/daily-updates.test.mjs` prüft echte SQLite-Dateien und echte lokale HTTP-Anfragen ohne Anbieterzugriff. Zwei getrennte Worker und SQLite-Verbindungen prüfen den konkurrierenden Briefing-Aufbau. Weitere Gegenproben decken Standard aus, Kontotrennung, wiederholte Änderungen, Neustart, Zürcher Tageswechsel, Opt-out, Kontolöschung, falsche Authentifizierung/Origins/Bodydaten und verspätete Anmeldung ab. Diese automatischen Prüfungen belegen weder einen bereitgestellten Dienst noch eine gesendete Nachricht oder menschliche Nutzerabnahme.
