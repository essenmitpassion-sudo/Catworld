# Universal Deal Intelligence

**Entwicklungsstand 24.11.2026:** Android-Text-/Fehler-/Speicher-/Neustartablauf praktisch geprüft; vollständiger iOS-Ablauf noch in Abnahme. Der lokale Angebotskern liefert echte, zeitlich begrenzte DQ-Teilbelege; HTTP-Hülle und Auftragsadapter sind vorbereitet. Reale persönliche Anmeldung, Hosting und sichere native Tokenablage fehlen. **Die nativen Apps haben noch keine Live-Angebotssuche oder eigene Spracheingabe.** Aktueller Fortsetzungspunkt: [STATUS.md](STATUS.md), Dienstgrenzen: [SERVICE.md](docs/SERVICE.md). Kein veröffentlichter Testbuild oder bestandener Erstnutzertest.

Markt und Sprache sind getrennt: Suchaufträge binden CH, gewünschtes Lieferland CH und CHF-Budget ausdrücklich. Quellen-/Marktkennungen werden vor aktiven Treffern und Preisempfehlungen geprüft. V2-Suchen und -Freigaben behalten diesen Kontext; alte Schweizer Suchen bleiben lesbar, ohne beim Lesen überschrieben zu werden. Gewünschte Lieferung ist kein Liefernachweis. Weitere Länder oder Währungen sind nicht aktiviert. [Datenvertrag und Migration](docs/MARKETS.md).

Android und iOS haben dieselbe Priorität. Die nativen Projekte unter `android/` und `ios/` nutzen dieselbe UDI-Oberfläche. Beide wurden tatsächlich kompiliert, in Android-Emulator/iPhone-Simulator installiert und gestartet; Suche, Watchlist, Dienstwarnung und ehrliche Textführung sind praktisch nachgewiesen. [Beide nativen Prüfungen erfolgreich](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/44794327630). Dies belegt noch keinen vollständigen Nutzerablauf oder Test auf physischen Telefonen. Native Live-Suche, Sprache und Teilen bleiben bis zur passenden Dienst-/Adapter-/Geräteabnahme offen. `npm run native:prepare`, `npm run native:check` und `npm run native:doctor` reproduzieren lokale Assetvorbereitung und Werkzeugdiagnose; die nativen Compiler laufen auf kostenlosen Standard-CI-Runnern ohne Binärveröffentlichung. [Plattformentscheidung und gleiche Abnahmekriterien](docs/PLATFORMS.md).

Die gemeinsame Oberfläche hat deutsche und englische Texte. Die Sprachwahl erhält Suchtext und Kriterien und steuert Zeit-/Geldformat und Hinweise. Die native direkte Sprachwahl wird auf beiden Plattformen separat praktisch abgenommen; der Mikrofon-/Diktieradapter gehört bisher nur zur Browser-QA. Die Angebotsregion bleibt ausdrücklich Schweiz/CHF; Benutzer- und Quelltexte werden nicht automatisch übersetzt. Englische Wünsche wie «Samsung 990 PRO 2 TB up to CHF 500» nutzen denselben Fachvertrag. Budgets mit ausdrücklich fremder Währung werden abgewiesen. [Weitere Sprachen und Märkte](docs/INTERNATIONAL.md) sind getrennt geplant.

English: choose **English** in the app header. This is a Swiss CHF pilot, with local saved searches and clearly marked unknown costs. Run the commands below with Node.js 24, then open the local address. This operator package is not a native Android/iOS installer; phone installation and microphone recognition still need a separate device acceptance test. `npm run live -- --english` checks the English flow against the permitted real source without making a purchase.

Im lokalen Entwicklungs-/Quellenprüfstand lässt sich die Samsung 990 PRO 2 TB ohne Kühlkörper bei DQ Solutions tatsächlich prüfen. Für bekannte konkrete Katalogprodukte wird keine KI-Suche benötigt. Beispiele sind «Samsung 990 PRO 2 TB» oder «Samsung 990 PRO 2 TB bis CHF 500». Preis, gemeldeter Aktivstatus und Herstellernummer stammen aus der konkreten Produktseite; nicht belegte Kosten bleiben offen. Das ist eine Quellenprüfung über die vorhandene QA-Oberfläche, keine native Live-Abnahme oder zusätzliche Browser-Produktversion. Vergleich und Empfehlung verlangen weitere passende, vollständige Belege.

Die Suche berücksichtigt Budget und Zustand aus dem Kaufwunsch oder den aufklappbaren Kaufkriterien. Bekannte Kosten oberhalb des Budgets führen zum Ausschluss. Solange Gebühren offen sind, bleibt die Budgetpassung unbestätigt. Mit «Nur Angebote mit bestätigten Gesamtkosten» lassen sich solche Treffer ausblenden. Dieselben Kriterien gelten im Katalogvergleich und im Deal Passport.

«Suche speichern» behält Auftrag, Budget, Zustand und Gebrauchtoption lokal. Native Apps nutzen bestätigte Preferences-Schreibvorgänge; Android-Neustart ist praktisch geprüft, iOS bleibt separat offen. Der Browser-Prüfstand nutzt den bisherigen Speicher und Web Locks. Bis zu 20 Suchen werden behalten; Fehler angezeigt und bestehende Daten bei Lesefehlern erhalten. «Erneut prüfen» übernimmt die Kriterien, zeigt in der noch unverbundenen nativen Version jedoch weiterhin den tatsächlichen Dienstfehler.

## Lokal starten

Node.js 24 und für den Browsertest Chromium, Chrome oder Edge.

```sh
npm ci
npm test
npm run build
npm run dev
```

Öffne [UDI im Browser](http://127.0.0.1:4173). Mit `npm run smoke` prüfst du die gebaute App in einem isolierten Chromium-Profil. Bei einem abweichenden Installationspfad setze `UDI_BROWSER` auf die Browserdatei.

`npm run live` prüft die echte Suche im Browser und öffnet den Direktlink bis zur passenden Händlerseite. Der Test braucht Internetzugang. Er führt keine Bestellung aus und verwendet keine KI-API.

`npm run test:layout` prüft zusätzlich den sichtbaren Suchstart bei 360/390/768/1365 × 780 Pixeln, die Trennung von Inhalt und Navigation, tatsächliche Zeigeraktionen und Erreichbarkeit bei 200 Prozent Schrift in einem 520 Pixel hohen Bereich. Screenshots und Layoutmesswerte lassen sich über `UDI_SCREENSHOT_DIR` ablegen. Das ist eine praktische Chromium-Prüfung der bestehenden App, keine physische Geräteabnahme.

## Optionale Websuche

Der lokale Server verwendet Vercel AI Gateway für die Suche nach konkreten Schweizer Händler- und Inseratsseiten. Setze serverseitig `AI_GATEWAY_API_KEY` und `UDI_SEARCH_MODEL` mit einer im Gateway verfügbaren Modell-ID aus `openai/`, `anthropic/` oder `google/`. Starte den Server danach neu. Die Aktivierung kann Gebühren auslösen. Setze das gewünschte Budget im Gateway und übermittle den Schlüssel über die lokale Umgebung oder einen Secret Store.

Ohne KI-Konfiguration bleiben die Live-Prüfung bekannter Katalogprodukte und die Watchlist nutzbar. Breite Web- und Gebrauchtmarktsuchen erfordern den Gateway-Zugang. Frei formulierte Suchen können eine Rückfrage zur Gebrauchtoption auslösen. Im Browser unterstütztes Diktat füllt das Suchfeld, der Nutzer prüft den Text und sendet ihn selbst. Je nach Browser verarbeitet dessen Spracherkennungsdienst Audio ausserhalb von UDI.

Die Suchansicht zeigt höchstens drei Angebote aus einer frischen Detailseitenprüfung. Noch offene Gesamtkosten bleiben gekennzeichnet. Für Suchergebnisse und Radar gilt eine gemeinsame Frischegrenze von fünf Minuten. Für Kaufempfehlungen müssen ausserdem vollständige Angebotsbeobachtungen vorliegen.

Der lokale Prüfer verwendet standardmässig `dq-solutions.ch`. Mit `UDI_VERIFY_DOMAINS` kann die Quellenliste angepasst werden. Die Adapter unterstützen zusätzlich `ricardo.ch` und `tutti.ch`. Eine Freigabe setzt die Prüfung der aktuellen Nutzungs- und Abrufbedingungen für den jeweiligen Betrieb voraus. Der Prüfer ruft ausschliesslich konkrete Adressen aus der serverseitigen Suche oder dem Katalog ab. Er folgt keinen Weiterleitungen, validiert und bindet öffentliche DNS-Adressen, begrenzt Zeit und Antwortgrösse und wertet eindeutige Schema.org-Angebotsdaten aus. DQ-Abrufe werden mindestens zehn Sekunden auseinandergehalten. Wiederholte identische Prüfungen innerhalb dieser Pause nutzen das vorherige Ergebnis mit unverändertem Prüfzeitpunkt. Zugriffssperren und fehlende Belege führen zum Ausschluss. Abgerufene Texte werden nicht gespeichert.

Prüfergebnisse werden lokal in `.udi/checks.json` mit URL, Prüfzeit, HTTP-Status und extrahierten Fakten gespeichert. Das Journal umfasst höchstens 200 Scans mit jeweils drei Prüfungen. Suchtexte und Schlüssel sind darin nicht enthalten. Gleichzeitige Schreibvorgänge laufen serialisiert mit atomarem Dateiaustausch. Sichere dieses Verzeichnis für eine Wiederherstellung des Einzelbetriebs.

Der Suchserver lauscht lokal auf `127.0.0.1` und begrenzt externe Suchanfragen auf sechs Suchläufe pro Minute. Ein Suchlauf prüft höchstens drei Detailseiten mit jeweils 2,5 Sekunden Zeitlimit. Für öffentlichen Mehrbenutzerbetrieb braucht es Authentifizierung und gemeinsam durchgesetzte Anfrage- und Budgetlimits.

## Angebotsdaten

Ein Preisvorteil oder eine Empfehlung benötigt zusätzlich einen expliziten Zustand und dasselbe belegte Lieferziel: `deliveryDestination: {"country":"CH","postalCode":"8000"}` ist das Schema-Beispiel, keine gesetzte Nutzeradresse. Nur vertrauenswürdig freigegebene Beobachtungen dürfen diese Angaben enthalten. Es werden im Pilot keine Lieferadressen gesammelt oder aus dem Standort erraten. Fehlende oder abweichende Angaben verhindern die Empfehlung; Angebotsfakten bleiben sichtbar. Bei erfüllter Grundlage zeigt der Vergleich eine mögliche CHF-Differenz zur konkret benannten nächstgünstigen Alternative, Zustand, Lieferziel und ältesten Prüfzeitpunkt. Dies bestätigt keinen Kauf und füllt keinen persönlichen Ersparniszähler. Provisionen und UVP gehen nicht in die Berechnung ein. Noch fehlende Preisbestandteile werden unmittelbar am Angebot aufgeführt.

Der Katalog enthält drei redaktionell zugeordnete Produktseiten. Die DQ-Seite wird beim Suchauftrag live geprüft. Der mitgelieferte Datensatz für vollständige Angebotsbeobachtungen ist leer. Kaufempfehlungen erfordern weiterhin vollständige, frische Daten und einen Vergleich mit passenden Alternativen.

`public/observations.json` ist die vertrauenswürdige Publikationsgrenze für freigegebene, nachvollziehbare Beobachtungen. Jede Zeile beschreibt genau eine Anbieter-URL und Variante mit `mpn`, `seller`, `url`, `finalUrl`, `checkedAt` in UTC mit Z, `currency` als CHF, `stock` als `in-stock` oder `out-of-stock`, `delivery` und den Kostenfeldern `price`, `shipping`, `taxes`, `imports`, `fees` in Rappen. Ein bereits enthaltener oder nachweislich entfallender Zuschlag zählt als 0. Unbekannte Beträge bleiben null. Der Import muss die Identität der Zielseite, Verkäufer, Preisumfang und Datenherkunft unabhängig belegen und eine spätere Abweichung oder einen fehlgeschlagenen Linkcheck publizieren können.

Das Frontend nutzt für Beobachtungen und Websuche nur seine eigene Origin. Die Watchlist speichert Produktnummern lokal. Es gibt keine Konten, Tracking-Einbindungen oder automatisierten Nachrichten.

## Projektauftrag wieder aufnehmen

Fortsetzung: **«UDI fortsetzen: AGENTS.md, PLAN.md und STATUS.md lesen und beim dortigen nächsten Schritt weiterarbeiten.»** Der [Schnäppchenjäger-Auftrag](docs/requirements/2026-11-23-intelligent-bargain-hunter.md) ist unverändert versioniert; die Pareto-Reihenfolge und offenen USP-Abnahmen stehen in PLAN.md. Git-Historie von STATUS.md erhält frühere Erkenntnisse und Meilensteine, statt neue parallele Pläne zu erzeugen.

Geprüfter Wiederaufnahmepunkt: Tag `milestone/udi-client-contract-2026-11-23`, Commit `c0f4b38`. Der [Meilensteinnachweis](docs/evidence/2026-11-23-8780d584969c.json) verknüpft Quellstand, tatsächliche Prüfungen, Grenzen und Paket-Prüfsumme dauerhaft. Ein Meilenstein bestätigt nur seinen dokumentierten Umfang; Live-Dienst und native Sprache sind damit nicht abgenommen. Neue erfolgreiche Meilensteine erhalten eigene Nachweise und Tags. Paketarchive liegen lokal unter `artifacts/`; der Remote-Branch und Tags sichern Code/Dokumentation, laden diese Archive aber nicht extern hoch.

`npm run pilot:package` erstellt pro sauberem Commit ein eigenes Paket mit Quellen, nativen Projekten, Typvertrag und CI-Definitionen. Ein vorhandenes Paket wird nach Integritätsprüfung wiederverwendet und niemals still überschrieben. `npm run pilot:verify -- artifacts/udi-pilot-<commit>.json` entpackt isoliert, installiert die Lockdatei, prüft Typen und native Quellen und startet das enthaltene Backend. Erst nach Erfolg entsteht ein dauerhafter `.verified.json`-Nachweis mit Commit, Prüfsumme, Datum und tatsächlichen Prüfergebnissen. Native Kompilierung/Geräteprüfung und Quellenabnahme bleiben getrennte Nachweise.

Der [App-Startplan](docs/LAUNCH.md) bewahrt den früheren PWA-Pilot als Entwicklungsnachweis; verbindlich sind jetzt gleichwertige native Android-/iOS-Apps. Manifest, App-Symbole und Pilothilfe werden weiterhin mitgebaut. `npm run pilot:package` bereitet aus einem sauberen Git-Stand ein Betreiberpaket mit Backend, nativen Quellen, Lockdatei und Prüfsummen vor. Geschützter HTTPS-Dienst, echte Geräteabnahme und Testverteilung bleiben offen; noch kein IPA oder Store-Release. Die Pilothilfe ist in der App unter «Installation & Pilothilfe» erreichbar; der [freiwillige Testbogen](docs/PILOT-TEST.md) ersetzt eine vorzeitige Analytics-Integration.

«Diese Suche teilen» erstellt erst nach bewusster Aktion eine prüfbare Linkvorschau mit Suchtext und wirksamen Kriterien. Empfangene Links werden bearbeitbar übernommen und starten keine Suche. Der Fragment-Link enthält weder Preis-/Bestandsdaten noch Aufnahme, Watchlist oder Zugangstoken. Lokale Links funktionieren nur auf demselben Computer; native Weitergabe wird dafür nicht angeboten. Keine garantierte automatische Übergabe nach einer Installation: Original-Link erneut öffnen. `npm run pilot:verify -- artifacts/udi-pilot-<commit>.json` prüft ein erzeugtes Betreiberpaket bis zum isoliert gestarteten Backend. Der Paketprüfer benötigt Internet für `npm ci`, löst aber keine Händler- oder KI-Abfrage aus.

Der [Monetarisierungsauftrag](docs/requirements/2026-11-20-monetization.md) ist ebenfalls dauerhaft verankert. Die [Machbarkeitsprüfung](docs/MONETIZATION.md) trennt öffentliche Partnerprogramme von tatsächlich vorhandenen UDI-Zugängen. Es gibt derzeit keine aktivierten Affiliate-Links, Cashback-Zusagen, bezahlten Platzierungen oder bestätigten Sparsummen.

Aktuelle Priorität: [App-first](docs/requirements/2026-11-20-app-first.md). Android- und iOS-Projekte wurden tatsächlich kompiliert und im Emulator/Simulator gestartet. Der gemeinsame typisierte [Angebots-Client](docs/SERVICE.md) ist für einen geschützten Dienst vorbereitet; ohne freigegebenen Endpunkt bleibt die native Suche ausdrücklich unverbunden. Browserprüfungen sind QA derselben Oberfläche; physische Geräte, positive native Spracheingabe und Live-Dienstablauf brauchen eigene Abnahmen.

Die verbindlichen Arbeitsregeln stehen in [AGENTS.md](AGENTS.md), Anforderungen und Abnahmen in [PLAN.md](PLAN.md), tatsächlicher Fortschritt, Nachweise und Fortsetzungspunkt in [STATUS.md](STATUS.md). Die Originalaufträge zur [Suchoberfläche](docs/requirements/2026-11-20-search-experience.md) und zu [echten Angeboten](docs/requirements/2026-11-20-live-offers.md) bleiben mit der Git-Historie erhalten. Sie sind Produktanforderungen, keine Behauptung bereits vorhandener Fähigkeiten.

Öffne dieses Repository auf `development/udi` und starte eine neue Codex-Aufgabe mit:

> Arbeite an UDI weiter. Lies AGENTS.md, PLAN.md und STATUS.md sowie die dort für die nächste Aufgabe verlinkten Originalaufträge. Setze die nächste offene Priorität um, prüfe den echten Nutzerablauf und sichere den verifizierten Stand mit Commit und Push. Kein Force-Push und keine Änderungen an SOUNDWEAVE.

Der bisherige Standardbranch enthält noch das archivierte Vorgängerprodukt. Bis zur UDI-Produktabnahme deshalb ausdrücklich den UDI-Branch auswählen. Die Fortsetzung benötigt keinen Zugriff auf den früheren Chat.

## Texteingabe und Aufnahme

Der Suchkompass zeigt den unveränderten Suchtext und wirksame Kaufkriterien vor dem Start. Bei ausdrücklich gewünschtem RAM oder SSD ohne Kapazität kann eine einzelne Rückfrage erscheinen. Auswahlvorschläge werden erst durch bewusste Auswahl in den Text übernommen und als solche bezeichnet. Die Kapazität kann offenbleiben. Die vorhandene Websuche wird dadurch nicht automatisch aktiviert; der konkrete Live-Pilot bleibt auf den dokumentierten Katalog beschränkt.

Das Mikrofon startet nur durch den Nutzer. Unterstützte Browser zeichnen mit MediaRecorder eine vorübergehende Aufnahme zum Anhören auf und verwenden ihre native Spracherkennung für den bearbeitbaren Text. Diktat wird an vorhandenen Text angehängt. UDI erhält beim Suchauftrag ausschliesslich Text und Kriterien. Browser-Spracherkennung kann Audio an den Dienst des Browsers senden. Die Aufnahme wird von UDI weder hochgeladen noch dauerhaft gespeichert. Mikrofon-, Berechtigungs- und Erkennungsfehler lassen die Texteingabe nutzbar.

Die Schrift Manrope wird samt OFL-Lizenz lokal ausgeliefert; es gibt keine Font-Anfragen an Dritte. Die Symbole sind Teil des lokalen Codes.
