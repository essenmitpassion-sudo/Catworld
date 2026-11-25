# MASTERPROMPT – UDI: EINFACHES ABO, ANMELDUNG UND KOSTENKONTROLLE

## Mission

Setze im bestehenden UDI-Projekt das einfachste tragfähige Modell für Anmeldung, KI-Suche und Bezahlung um.

Zielmodell:

- UDI kostet im Schweizer Startmarkt CHF 3.90 pro Monat.
- Nutzer brauchen kein eigenes ChatGPT-, OpenAI-, Gemini- oder anderes KI-Abo.
- UDI bezahlt die API-Nutzung zentral und begrenzt sie zuverlässig.
- Ein Konto ist nötig, bevor eine echte Suche ausgeführt wird.
- Nutzer können sich vor der Anmeldung erklären lassen, was UDI macht, und Beispiele sehen.
- Das Geschäftsmodell darf bei normaler Nutzung nicht durch unkontrollierte KI- oder Suchkosten ins Minus laufen.

Arbeite direkt im bestehenden Repository. Prüfe zuerst den aktuellen Stand von App, Auth, Backend, Hosting, Zahlungsintegration, Suchdienst, Konfiguration, Tests und Git-Änderungen. Erfinde keine vorhandenen Funktionen und ersetze keine funktionierende Infrastruktur ohne belegten Grund.

## 1. Produkt- und Preisentscheidung

Setze für die erste wirtschaftliche Version dieses einfache Modell um:

### Kostenloses Konto

- Registrierung erforderlich, bevor eine echte Suche startet.
- 3 echte Suchen pro Abrechnungsmonat.
- Erklärung, Beispielanfragen und App-Vorschau vor der Anmeldung.
- Gespeicherte Suchen nur für angemeldete Nutzer.
- Keine Zahlungsdaten für den kostenlosen Tarif verlangen.

### UDI Plus

- Ein einziger kostenpflichtiger Tarif zum Start.
- Zielpreis im Schweizer Store: CHF 3.90 pro Monat.
- 25 abrechenbare Suchen pro Abrechnungsmonat.
- Keine unbegrenzten Suchen versprechen.
- Keine Jahres-, Familien- oder Zusatzpläne ergänzen, bis Nutzungsdaten den Mehrwert zeigen.

Behandle Preise und Kontingente als konfigurierbare Werte, nicht als verstreute Konstanten. Übernimm Store-Währungen und regionale Preisstufen korrekt. Verlasse dich nicht darauf, dass jeder Markt CHF verwendet.

## 2. Keine KI-Abos der Nutzer voraussetzen

UDI verwendet einen vom Projektbetreiber verwalteten API-Zugang. Nutzer müssen keinen eigenen KI-Anbieter einrichten und keine eigenen API-Schlüssel eintragen.

- API-Schlüssel ausschliesslich im geschützten Backend oder Secret Store verwahren.
- Niemals Geheimnisse in den App-Build, Quellcode, Logs, Analytics oder Fehlermeldungen einbetten.
- Das Modell nur dort aufrufen, wo es einen echten Nutzen hat: zum Beispiel für das Ableiten von Suchkriterien oder die Erklärung von Treffern.
- Preis-, Verfügbarkeits- und Gutscheindaten ausschliesslich aus tatsächlich verfügbaren Quellen beziehen.
- Niemals erfundene Angebote, Preise, Gutscheine oder Quellen als echt darstellen.
- Wenn der API-Zugang fehlt, die Ursache genau festhalten und den Rest der Arbeit fortsetzen.

## 3. Registrierung mit wenig Reibung

Prüfe die bereits vorhandene Authentifizierung und nutze sie, sofern sie sicher und für iOS sowie Android geeignet ist.

Falls noch keine Authentifizierung existiert:

1. Wähle die einfachste Lösung, die zum vorhandenen Stack passt.
2. Bevorzuge eine Anmeldung über E-Mail mit Magic Link oder Einmalcode, sofern das vorhandene System sie zuverlässig unterstützt.
3. Ergänze Apple- und Google-Anmeldung nur, wenn sie mit verfügbaren Projektzugängen und ohne falsche Versprechen eingerichtet werden können.
4. Verlange keine Telefonnummer, wenn sie für das Produkt nicht zwingend nötig ist.
5. Erkläre knapp, warum ein Konto nötig ist: Suchen, Kontingent, gespeicherte Wünsche und Wiederherstellung auf einem neuen Gerät.
6. Baue sinnvolle Fehler-, Abbruch-, E-Mail-nicht-erhalten- und Abmeldezustände.
7. Ermögliche die Wiederherstellung des Kontos sowie das Löschen des Kontos nach geltenden Plattformvorgaben.

Prüfe, ob vorhandene gespeicherte Suchen beim Anmelden, Abmelden oder Wechseln des Geräts korrekt dem Konto zugeordnet bleiben.

## 4. Käufe und Aboverwaltung

Für native iOS- und Android-Apps ist der bevorzugte Startweg:

- Apple StoreKit und Google Play Billing für Käufe und Verlängerungen.
- RevenueCat als gemeinsame Schicht für Abostatus und Berechtigungen, sofern es zum vorhandenen Projekt passt.
- Vorhandene Abo-Lösungen nicht doppelt integrieren.

Backend und App müssen folgende Zustände zuverlässig behandeln:

- kostenlos;
- Plus aktiv;
- Abo gekündigt, aber noch gültig;
- abgelaufen;
- Rückerstattung oder Zahlungsproblem;
- Kauf noch nicht synchronisiert;
- Wiederherstellung früherer Käufe;
- App-Neuinstallation oder Gerätewechsel.

Zugriff auf Plus-Funktionen nicht allein anhand eines lokalen App-Werts gewähren. Prüfe den Abozustand mit der gewählten verlässlichen Entitlement- oder Backend-Lösung. Behandle Webhooks idempotent und prüfe Ereignissignaturen, soweit der Anbieter dies unterstützt.

Keine externen Zahlungswege einbauen, um Store-Gebühren zu umgehen. Halte dich an die aktuellen Regeln von Apple und Google. Veröffentliche keine Preise oder Kaufabläufe, die noch nicht korrekt konfiguriert sind.

## 5. Serverseitige Suchkontingente und Missbrauchsschutz

Alle Kontingente und kostenverursachenden Limits müssen serverseitig durchgesetzt werden.

- Monatliches Kontingent pro Nutzerkonto speichern und zuverlässig zurücksetzen.
- Gleichzeitige Anfragen dürfen das Kontingent nicht mehrfach verbrauchen oder umgehen.
- Pro Suche die Anzahl externer Suchaufrufe begrenzen.
- Sinnvolle Rate Limits je Konto und, wo datenschutzgerecht, je technischer Quelle setzen.
- Mehrfachanfragen, automatische Wiederholungen und offensichtlichen Missbrauch erkennen.
- Bereits vorhandene Ergebnisse kurzfristig wiederverwenden, sofern Quelle und Aktualität das erlauben.
- Fehlgeschlagene Suchläufe nicht stillschweigend als erfolgreiche Ergebnisse zählen.
- Klar definieren, wann ein Suchkontingent verbraucht wird und dies verständlich anzeigen.

Nutze eine Kostenobergrenze für den Anbieter, wenn verfügbar. Richte Warnschwellen und einen sicheren Ausfallmodus ein. Erzeuge keine automatische, unbegrenzte Wiederaufladung von API-Guthaben.

## 6. Suche wirtschaftlich aufbauen

Prüfe zuerst, welche echten Such- und Angebotsquellen im Projekt vorhanden, erreichbar und rechtmässig nutzbar sind.

Für jede Quelle festhalten:

- Kosten pro Anfrage oder Nutzung;
- verfügbare Länder und Währungen;
- Datenaktualität;
- Nutzungs- und Weitergaberechte;
- Antwortqualität und Ausfallverhalten;
- benötigte Zugangsdaten und Hosting.

Vergleiche den echten Preis pro vollständiger UDI-Suche, nicht nur den Grundpreis eines KI-Modells. Eine UDI-Suche kann mehrere externe Aufrufe auslösen; rechne diese in die Kontingente und Kosten ein.

Wenn noch kein verlässlicher Angebotsdienst erreichbar ist:

- prüfe den bekannten Hosting- und Zugangszustand erneut;
- arbeite an unabhängigen Teilen weiter;
- bereite die Integration über eine klare Provider-Schnittstelle vor;
- kennzeichne Testdaten sichtbar als Demo;
- stelle keine Demo-Angebote als live oder aktuell dar.

Keine Zugangskontrollen umgehen und keine Shopsysteme entgegen ihren Bedingungen automatisiert abfragen.

## 7. Kostenrechnung und Entscheidung dokumentieren

Erstelle eine nachvollziehbare, konfigurierbare Kostenrechnung mit mindestens diesen Szenarien:

- 3 kostenlose Suchen pro Nutzer und Monat;
- 25 Plus-Suchen pro Nutzer und Monat;
- durchschnittlich 1 externer Suchaufruf pro UDI-Suche;
- durchschnittlich 2 und 3 externe Aufrufe pro Suche;
- 100, 1’000 und 10’000 monatlich aktive Nutzer;
- unterschiedliche Plus-Anteile;
- Provider-, Hosting-, Store-, Erstattungs- und Zahlungsgebühren, soweit bekannt.

Verwende aktuelle Anbieterpreise aus offiziellen Dokumentationen. Kennzeichne Annahmen deutlich und rechne mit Sicherheitsmarge. Wenn eine Kostenposition unbekannt ist, gib keine Scheingenauigkeit vor.

Leite aus den Zahlen ab:

- geschätzte Kosten pro kostenloser und bezahlter Suche;
- Kosten pro Plus-Nutzer;
- Deckungsbeitrag des CHF-3.90-Tarifs;
- Nutzerzahl zum Decken fester Hosting-Kosten;
- welche Kontingente geändert werden müssten, falls das Modell nicht tragfähig ist.

## 8. Datenschutz, Speicherung und Kontinuität

Speichere nur die Daten, die für Konto, Suchhistorie, Abozustand, Kontingent und Produktbetrieb nötig sind.

- Keine vollständigen KI-Prompts oder sensiblen Suchinhalte dauerhaft protokollieren, wenn sie nicht benötigt werden.
- Geheimnisse niemals in Git einchecken.
- Sichere Datenbankschemas, Migrationen, Konfiguration und Entscheidungsnotizen im Projekt.
- Prüfe vorhandene Backups und Wiederherstellungswege.
- Lege keine unnötigen parallelen Datenspeicher an.
- Halte Nutzer über gespeicherte Suchhistorie und Kontolöschung verständlich auf dem Laufenden.

## 9. Prioritäten

### P0 – Ist-Zustand und Risiken

- Projekt und Git-Änderungen prüfen.
- Vorhandene Auth-, Backend-, Such- und Zahlungsarchitektur erfassen.
- Bekannte offene Blocker aus früheren Projektständen verifizieren.
- Aktuelle reale Kostenquellen und Zugangsdatenlage feststellen.
- Vorhandene Änderungen sichern.

### P1 – Sicherer Kernablauf

- Anmeldung;
- kostenloses Kontingent;
- serverseitige Suche und Limits;
- echtes Abo-Entitlement;
- Statusanzeige für kostenlos und Plus;
- Wiederherstellen und Kündigungsinformation.

### P2 – Wirtschaftlichkeit

- Kostenmessung je Suche;
- Anbieterlimits und Warnungen;
- Deduplizierung und Caching;
- Kostenrechnung für 1, 2 und 3 Aufrufe je Suche;
- Empfehlungen zu Kontingent und Preis bei untragbaren Kosten.

### P3 – Plattformprüfung

Teste den Ablauf auf Android und iOS, soweit Projekt und Zugang es ermöglichen:

- Registrierung;
- kostenlose Suche;
- Kontingent erreicht;
- Plus-Kauf im Sandbox-Modus;
- Abo-Wiederherstellung;
- Kündigung und Ablauf;
- Offline- und API-Fehler;
- parallele Suchanfragen und Ratenlimits.

Ergänze oder passe Tests nur dort an, wo sie diese konkreten Abläufe absichern. Melde klar, was automatisch geprüft wurde und was praktisch auf Geräten oder Emulatoren lief.

## Arbeitsregeln

- Keine Genehmigungsstopps bei reversiblen Routineentscheidungen.
- Bei fehlenden Zugangsdaten nur den betroffenen Teil als blockiert markieren und unabhängig weiterarbeiten.
- Höchstens wenige gezielte Fehlversuche pro Blocker; danach Ursache analysieren und Alternative dokumentieren.
- Bestehende Architektur nur ändern, wenn ein klarer technischer oder wirtschaftlicher Vorteil belegt ist.
- Keine unbegrenzten Tarife, erfundenen Suchergebnisse oder ungesicherten Client-Schlüssel.
- Nach jedem abgeschlossenen Schritt Stand, Änderungen und offene Punkte dokumentieren.
- Git-Commits als nachvollziehbare Checkpoints nutzen. Push, Deployment, Veröffentlichung oder Kosten auslösende Aktionen nur durchführen, wenn bereits autorisiert und verfügbar.

## Abschlussbericht

Melde knapp:

1. Was im Code tatsächlich umgesetzt wurde.
2. Was auf Android und iOS geprüft wurde.
3. Aktuelle Kostenannahmen und geschätzte Kosten pro Plus-Nutzer.
4. Verbleibende Blocker und deren konkrete Ursache.
5. Ob CHF 3.90 mit den gefundenen Datenquellen tragfähig erscheint.
6. Die nächste wertvollste Aufgabe.

## Oberste Leitlinie

UDI verlangt kein separates KI-Abo von seinen Nutzern. UDI übernimmt die KI-Kosten, begrenzt jede Suche serverseitig und verspricht nur, was die echten Datenquellen belegen.