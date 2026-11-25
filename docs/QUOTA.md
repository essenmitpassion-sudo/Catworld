# Kontoquote im Suchdienst

Stand 25.11.2026. Lokale Implementierung und synthetische HTTP-/SQLite-Tests; kein gestarteter Produktionsdienst, verifiziertes Store-Abo oder Abrechnungsnachweis. Keine Zahlung, Veröffentlichung oder Zugangsdaten eingerichtet.

`scripts/plan-policy.mjs` hält konfigurierbare CH-Zielwerte gemeinsam für Quote und Kostenrechnung: Free 3 Suchen, Plus 25 Suchen, Zielpreis CHF 3.90 (`priceRappen:390`). `planPolicy(overrides)` prüft explizite Betreiberkonfiguration. Diese Werte bestätigen weder einen Store-Preis noch eine tatsächliche Berechtigung. Der Produktionsdienst leitet kein Abo aus einem Clientfeld ab.

## Vertrauensgrenze und Einbindung

`createSearchService({authenticate,search,quota,resolveEntitlement,mode:'production'})` ist der Standard. Fehlen echte Authentifizierung, Suchadapter, dauerhafter Quotenadapter oder Berechtigungsresolver, antwortet die Suche mit 503 vor Quellenarbeit. Nur ausdrücklich gesetztes `mode:'pilot'` erlaubt den bisherigen lokalen, nicht monatlich abgerechneten Testbetrieb; die kurzen Missbrauchsgrenzen bleiben dort aktiv. Ein gesetztes vollständiges Quotenpaar wird auch im Pilotmodus benutzt.

`createAccountQuota({databasePath})` aus `scripts/account-quota.mjs` verlangt einen absoluten Betreiberpfad zu einer beschreibbaren SQLite-Datei; `:memory:` ist ausgeschlossen. Node 24 stellt SQLite eingebaut bereit und kennzeichnet es derzeit als experimentell. Es werden keine Pakete oder Verbindungen benötigt. SQLite benutzt WAL, `synchronous=FULL`, kurze Sperrwartezeit und `BEGIN IMMEDIATE`; getrennte Dienstinstanzen müssen dieselbe lokale Datenbank nutzen. Dies ist keine verteilte Quote über voneinander unabhängige Dateisysteme. Sperr-, Speicher- und Resolverfehler schließen den Suchweg mit 503.

`authenticate(token,{signal})` muss eine tatsächlich geprüfte stabile opake Kontoidentität als String liefern. `resolveEntitlement(subject,{signal})` muss diese Identität gegen vertrauenswürdige Kontodaten bzw. tatsächlich verifizierte Store-Berechtigungen auflösen und Folgendes liefern:

```js
{
  periodId: 'verified-store-cycle-opaque-id',
  startsAt: '2026-11-15T09:00:00.000Z',
  endsAt: '2026-12-15T09:00:00.000Z',
  limit: 25
}
```

Zeitangaben sind kanonische UTC-ISO-Zeitstempel mit Millisekunden. `startsAt <= Serverzeit < endsAt`, maximal 32 Tage und ein ganzzahliges nicht negatives Limit sind erforderlich. Perioden-ID und Grenzen müssen für denselben tatsächlichen Zeitraum stabil bleiben; veränderte Grenzen bei derselben ID werden abgewiesen. Plus folgt dem verifizierten Store-Abrechnungszeitraum: Ein Kalendermonatswechsel setzt das Kontingent nicht zurück. Verlängerung, Widerruf, Erstattung, Nutzerwechsel und gegebenenfalls niedrigere Limits müssen aus dem vertrauenswürdigen Adapter kommen; Store-Webhook-/Receiptprüfung ist noch nicht angebunden.

Für Free erzeugt `utcMonthlyEntitlement(limit = defaultPlanPolicy.freeSearches, now = Date.now())` ausdrücklich einen UTC-Kalendermonat. Diese Funktion ist kein Resolver für Plus. Der Client darf weder Zeitraum, Kontokennung, Tarif noch Limit vorgeben; der vorhandene Anfragenvertrag weist zusätzliche Felder ab.

## Reservierung und Fehler

Nach Authentifizierung und vollständiger Anfrageprüfung wird vor `search()` ein Platz atomar reserviert. Kontoidentitäten und normalisierte Suchanfragen werden nur als SHA-256-Werte im Quotenjournal gespeichert, Request-ID und Periodengrenzen als technische Werte. Token und Suchtext werden nicht gespeichert. Kurzzeitig wird die validierte Ergebnisantwort gespeichert; sie enthält konkrete Angebotsdaten, keine Anmeldedaten.

- Eine erfolgreich validierte `results`-Antwort zählt einmal, auch bei leerem Ergebnis: Die angeforderte Suche ist abgeschlossen. Fehlende Kosten werden dadurch nicht bestätigt.
- Eine Rückfrage wird nicht berechnet. Ungültige Eingaben, Testdaten, abgelehnte Ergebnisse und tatsächlich beendete Fehler geben den Platz frei.
- Timeout oder Verbindungsabbruch signalisieren Abbruch. Ignoriert ein Adapter das Signal, bleiben Arbeitsslot und Monatsreservierung bis zu seinem tatsächlichen Ende belegt. Bei einem Neustart bleiben ungeklärte Reservierungen vorsorglich belegt; es gibt keine automatische Wiederholung oder Freigabe. Eine spätere Betreiberabstimmung benötigt echten Ausführungsnachweis und ist nicht automatisiert.
- Dieselbe Konto-/Request-ID-Kombination darf keine zweite Suche auslösen. Andere Eingaben mit derselben ID ergeben 409. Erfolgreiche Ergebnisse und Rückfragen sind höchstens 60 Sekunden und höchstens bis zur ursprünglichen Angebots-/Antwortfrist identisch wiederholbar; Zeitstempel werden nicht erneuert. Danach und nach Fehlern ergibt Wiederverwendung 409; ein bewusst neuer Auftrag benötigt eine neue ID.
- Standardmäßig höchstens 10'000 Auftragskennungen pro Konto und Zeitraum, auch wenn Fehler zurückerstattet wurden. Dies begrenzt Fehlversuche und Replay-Speicher; `maxEntriesPerPeriod` ist kontrolliert konfigurierbar. Abgelaufene Antwortinhalte werden beim nächsten Reservierungsversuch gelöscht. Technische Kennungen und reservierte/verwendete Plätze bleiben erhalten, damit ein Neustart oder eine alte ID die Quote nicht zurücksetzt. Betreiber müssen Datenbankzugang, Sicherung, Datenträgergrenzen und Lösch-/Aufbewahrungskonzept vor realem Betrieb abnehmen; kein dauerhaftes unbegrenztes Antwortarchiv.

Monatserschöpfung ergibt HTTP 429, `X-UDI-Limit: monthly` und `Retry-After` bis zum bestätigten Periodenende. Zugelassene native Origins dürfen beide Header über CORS lesen. Die bestehenden kurzen Missbrauchsgrenzen ergeben weiterhin 429 ohne Monatsmarker und 60 Sekunden Wartehinweis. Nutzerkennung und Kontostand werden nicht in der Antwort offengelegt.

Optional kann ein separat authentifizierter `dailyUpdates`-Handler exakt `/api/v1/preferences/daily-update` bedienen. Diese Präferenzroute führt keine Suche aus und verbraucht keine Monatsplätze; Versand, Zeitplanung und verifizierte Store-Anbindung sind davon getrennt.

Ein anderer Periodenschlüssel für dieselben Grenzen wird abgewiesen. `prune()` und die Reservierung entfernen technische Kennungen und Perioden sieben Tage nach Periodenende. Antwortinhalte verfallen bereits nach höchstens 60 Sekunden. Rufe `prune()` auch bei inaktiven Diensten periodisch auf. Vor `deleteAccount(subject)` muss der Betreiber die Identität und alle Sitzungen widerrufen und laufende authentifizierte Anfragen in allen Instanzen abarbeiten. Die Löschung verweigert sich bei noch offenen Reservierungen und entfernt anschliessend nur die Zeilen dieses Kontos. Datenbankdatei, WAL und Sicherungen brauchen eigene Aufbewahrungs- und Löschregeln.

## Nachweise und Grenzen

`tests/account-quota.test.mjs` prüft zwei SQLite-Verbindungen, Wiederöffnen, eindeutige IDs, kurze unverjüngte Wiederholung, Fehlerfreigabe, Free-UTC-Grenze und einen Plus-Zeitraum über einen Kalendermonatswechsel. `tests/search-service.test.mjs` prüft Produktionssperre, echten lokalen HTTP-Vertrag, zwei Dienstinstanzen, ausstehende Arbeit nach Timeout, Rückfragen/Testdaten/Fehler, Monatsmarker und die getrennte Präferenzroute. Daten und Identitäten sind ausschließlich Testfixtures; diese Tests beweisen keine echte Anmeldung, Bezahlung, Geräteinstallation oder veröffentlichte Erreichbarkeit.
