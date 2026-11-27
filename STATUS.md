# Status · 28.11.2026

## Einfache KI-Suche

Die Antwort auf die Preisfrage steht oberhalb der Angebote. Die lokale DE/EN-Vorschau belegt offene und bestätigte Testpreise samt Lieferziel. Der direkte, tatsächlich geprüfte CH-Katalogweg zur Samsung 990 PRO 2 TB braucht keinen Modellaufruf. MIXEL lieferte einen Teilbeleg. Endpreis und späterer Wiederholungsabruf blieben offen. Der simulierte Modellvergleich und die CHF-3.00/3.90/4.00-Sensitivität sind reproduziert. [Suchbeleg, Anbieter und Kosten](docs/evidence/2026-11-28-simple-ai-search.md).

## Sucharbeitsplatz und Preisbeleg

Eingabe, Hauptaktion und Beispiel sind im Einstieg zusammengefasst. Nach der Suche ist der erste Artikelpreis im 320-Pixel-Vorschaufenster vollständig sichtbar. Anbieter, Preisstatus, offene Kosten und Prüfzeit liegen im Preisbeleg. Der bearbeitbare Wunsch ist vom Ergebnis aus direkt erreichbar. Zwei praktische Browserläufe in DE/EN sowie 199 Tests, Typprüfung, Build und Chromium-Smoke bestanden. [Vorher-Nachher-Nachweis](docs/evidence/2026-11-28-search-design.md).

## Persönlicher Teststart

UDI lässt sich auf Windows über «UDI testen.cmd» im lokalen Browserfenster öffnen. Der Starter verbindet die bestehende Oberfläche mit dem isolierten Testdienst. Der DE/EN-Lauf bei 320/390px prüfte Testanmeldung, Suche, offenen Preis, Speichern, Zeitüberschreitung, Abbruch, Fehler, leeres Ergebnis und Wiederöffnen. 199 Tests, Typprüfung, Build und Chromium-Smoke bestanden. [Anleitung](docs/UDI-TESTEN.md) · [Suchzustände](docs/evidence/2026-11-28-search-states.md) · [Diktatprüfung](docs/evidence/2026-11-28-ios-dictation.md).


## Abschlusscheck P0–P3 · 27.11.2026

Die [Abnahmematrix](docs/evidence/2026-11-27-abschlusscheck.md) belegt Preiszustände, Modellvergleich, Kontoschutz, Spracheingabe, Kosten und beide nativen Profile. Android-Emulator und iOS-Simulator bestanden den isolierten Testdienst-Ablauf auf fb32932. Der separate iOS-Standardlauf erreichte die Aktion «Diktat starten» nach dem Tippen auf die Mikrofontaste nicht. Die echten Live-Gates und physische Geräte bleiben offen.

## Isolierter nativer Testdienst · 27.11.2026

Der lokale Dienst und ein separat vorbereiteter Testbuild decken Anmeldung, Sitzungswiederherstellung, Suche, Preisstatus, Free/Plus-Kontingente und Dienstfehler mit eindeutig gekennzeichneten Testdaten ab. Der normale Build verwendet weiterhin seine bisherige Netzwerk- und Sitzungsgrenze. 198 Tests, Typprüfung, Build und Chromium-Smoke bestanden. Der Build- und Transportnachweis steht in der [Dienstbeschreibung](docs/SERVICE.md#isolierter-nativer-testdienst). Android-Emulator und iOS-Simulator haben eigene CI-Prüfpfade. Der kontogeschützte Live-Dienst bleibt eine getrennte Freigabe.

## Simulierter Vergleich der Modellwege · 27.11.2026

Der reproduzierbare DE/EN-Vergleich verarbeitet zwölf Fälle über den bestehenden Suchkern und Clientvertrag. In den elf Qualitätsfällen lag die Einzelmodellvariante bei 11/11 erwarteten sicheren Entscheidungen. Die simulierte Gegenprüfung erreichte ebenfalls 11/11 mit zwei zusätzlichen Aufrufen und ohne zusätzlichen gelösten Fall. Der separate Ausfalltest bestätigte den begrenzten Ersatzversuch und die Stopps bei Budgetmangel und Abbruch. Zweiter tatsächlich unabhängiger Anbieter, Live-Kosten und echter Qualitätsgewinn bleiben offen. [Vergleichsprotokoll](docs/evidence/2026-11-27-multi-ai-replay.md).

## Preiszustände und Quellen · 27.11.2026

Die Suche und der Deal Passport zeigen vier getrennte Preiszustände. Der Antwortvertrag prüft vollständige Kosten, angerechneten Rabatt, Betrag und Lieferziel. Die erneute Live-Prüfung fand bei DQ Solutions CHF 439.00 und bei MIXEL CHF 450.90 mit verfügbarem Bestand. Beide Endpreise bleiben unvollständig. Der bestätigte Zustand wurde im synthetischen Vertragstest ausgeführt. [Quellen- und Prüfnachweis](docs/evidence/2026-11-27-price-states.md).

## Qualitätsvergleich für Multi-KI · 27.11.2026

Zwölf Abnahmefälle mit erwarteten Ergebnissen sind festgelegt. Der erste Test mit simulierten Modellergebnissen deckte einen falschen 1-TB-Treffer für den Händlerlink der 2-TB-Variante auf. UDI schliesst bei bekannten Angeboten ausdrücklich unpassende Kapazitäten vor dem Händlerabruf aus und verwendet die Katalogbezeichnung. Die flexible Auswahl zwischen 1 TB und 2 TB akzeptiert weiterhin den korrekt bezeichneten 2-TB-Teilbeleg. 192 Tests, Typprüfung, Build und Chromium-Smoke bestanden. Der Live-Qualitätsvergleich ist offen. [Vergleichssatz und Regression](docs/evidence/2026-11-27-multi-ai-quality-baseline.md).

## Multi-KI-Suche · 27.11.2026

Der [Abnahmeplan](PLAN.md#universal-multi-ai-collaboration--27112026) staffelt Einzelmodell, Ausfallsicherheit, messbare Zusammenarbeit und weitere Zugänge. Im lokalen Entwicklungsdienst ist ein zweites Modell für ausgewählte vorübergehende Gateway-Fehler konfigurierbar. Tests mit dem echten SDK und simulierten Gateway-Antworten belegen Aufrufzahl, getrennte Budgetreservierung und Abbruch. 191 Tests, Typprüfung, Build und Chromium-Smoke bestanden. Anbieterzugang im geschützten Pilot, gemessener Mehrwert der Zusammenarbeit und native Live-Abnahme bleiben offen. [Machbarkeit und Nachweis](docs/evidence/2026-11-27-multi-ai-routing.md).

## Endpreisfilter · 27.11.2026

Für die Samsung 990 PRO 2 TB wurden im geschützten lokalen Pilot zwei passende Angebote mit offenem Endpreis nachgewiesen. Beim engeren Budget von CHF 200 war keines der beiden sonst passend. Mit Neuwarefilter blieb ein passender Teilbeleg. Die deutsche und englische Oberfläche führt bei fehlender Preisbestätigung zu den bestehenden Suchkriterien zurück. Verbindliche Gesamtkosten und native Live-Abnahme bleiben offen. 186 Tests, Typprüfung, Build und Chromium-Smoke bestanden. [Nachweis](docs/evidence/2026-11-27-endprice-filter.md).

## Zweite Schweizer Händlerquelle · 27.11.2026

MIXEL Shop und DQ Solutions wurden für dieselbe Samsung 990 PRO 2 TB ohne Kühlkörper im geschützten lokalen Pilot geprüft. Beide meldeten aktiven Bestand und einen CHF-Artikelpreis. Bei MIXEL bleiben der Produktzustand und der verbindliche Lieferpreis offen. Die App zeigt beide als Teilbelege. Vollständige Endpreise und native Live-Abnahme bleiben offen. [Quellen- und Prüfnachweis](docs/evidence/2026-11-27-mixel-second-source.md).

## Aktualität im Deal Passport · 27.11.2026

Ein bestätigter negativer Händlerbeleg entfernt den vorherigen Bestand und Preis aus dem Passport. Ein frischer über Budget liegender Preis kann ebenfalls keinen älteren günstigeren Preis stehen lassen. Verspätete Antworten wurden als Gegenprobe geprüft. Der normale positive Ablauf wurde erneut am realen Händler bestätigt. 179 Tests, Typprüfung, Build und Chromium-Smoke bestanden. [Nachweis](docs/evidence/2026-11-27-offer-freshness.md).

## Budgetgrenzen · 27.11.2026

Suchtext und Formular setzen zusammen das engere Gesamtbudget durch. Beim realen Händlerabruf für CHF 439 verschwanden zwei zuvor fälschlich angezeigte Angebote. Zwei Kontrollfälle blieben als Teilbelege mit offenen Gesamtkosten sichtbar. 174 Tests, Typprüfung, Build und Chromium-Smoke bestanden. [Vorher-Nachher-Beleg](docs/evidence/2026-11-27-budget-bounds.md).

## Suche nach Merkmalen · 27.11.2026

Die Pilotabdeckung wächst von einer auf drei konkrete Varianten. UDI findet die externe 1-TB-SSD mit USB-C ohne Modellnamen in DE/EN und prüft regionale Herstellernummern vollständig. Vier bisher leere passende Anfragen lieferten frische Teilbelege. Gegenproben für falsche Kapazität, falschen Anschluss oder zu wenig Angaben verursachten keinen Händlerabruf. 172 Tests und beide Live-Browserabläufe bestanden. Händler-Endpreise und ein breiterer Quellenzugang bleiben offen. [Vergleich](docs/evidence/2026-11-27-catalog-intent.md).

Wenn keine Quelle zum Wunsch passt, führt «Suchwunsch bearbeiten» zurück zur ausgefüllten Eingabe. Die Gegenprobe im geschützten Suchablauf bei 320 px bestätigte auf DE/EN, dass Suchtext, CHF 350, Zustand und Kostenfilter erhalten bleiben. Eine neue Anfrage startet erst bei erneutem Suchklick. Der frühere Beispielknopf setzte diese Daten zurück. [Dienstvertrag](docs/SERVICE.md#kontogeschützter-lokaler-pilot--25112026).

## One-Touch-Suche · 27.11.2026

Die gemeinsame Suche findet die bekannte Schweizer Pilotvariante auch in vollständigen deutschen und englischen Kaufwünschen. Der Vorher-Nachher-Vergleich mit acht Aufgaben zeigte 1 → 3 passende Teilbelege bei drei passenden Anfragen und 2 → 0 falsche Zuordnungen bei zwei Gegenproben. Ein frischer DQ-Abruf pro Durchlauf, null Modellaufrufe. Artikelpreis zur Prüfung CHF 439, Gesamtkosten und Lieferziel offen. Beide Browserabläufe führten vom sichtbaren Suchknopf über den Deal Passport zur realen Händlerseite. 168 Tests, Typprüfung, Build und Chromium-Smoke bestanden. Native Live-Abnahme, breitere Abdeckung und externer Wettbewerbsvergleich stehen aus. [Messprotokoll](docs/evidence/2026-11-27-one-touch-search.md).


Bei vollständig gescheiterter Quellenprüfung meldet der geschützte Dienst «vorübergehend nicht verfügbar» und erhält das Suchkontingent. Im lokalen HTTP-Vergleich führten vier Abrufe bei fehlender DNS-Auflösung zuvor zu drei leeren Resultaten und einer Kontingentsperre, danach zu vier Verfügbarkeitsfehlern ohne Verbrauch. Belegte leere Resultate werden weiterhin gezählt. 170 Tests, Typprüfung, Build und Chromium-Smoke bestanden. [Gegenprobe](docs/evidence/2026-11-27-one-touch-search.md#quellenausfälle).

**Konto und Diktat** · Der [Vertiefungsauftrag](docs/requirements/2026-11-25-account-and-dictation.md) ist in PLAN verankert. Entwurf und optionale Spracheingabe bleiben vor Anmeldung nutzbar. Der geschützte Testbuild fragt erst beim Live-Suchstart nach dem E-Mail-Code. Die neue Mikrofonbedienung zeigt Verarbeitung und Sprachwahl vor der Freigabe. Android nutzt den lokalen SpeechRecognizer ab API 33 bei installiertem Sprachmodell. iOS verlangt lokale SFSpeech-Erkennung. Kein Audioartefakt wird angelegt. Deutsch (Deutschland) und Englisch (Grossbritannien) werden einzeln auf Verfügbarkeit geprüft.

**Diktat geprüft** · 162 Tests, Typprüfung, App-Build und gemeinsamer Browserablauf grün. Bei 320 px in beiden Plattformzweigen mit synthetischer Brücke geprüft: Erklärung vor Aufruf, Sprachwahl, Aufnahmestatus, Stopp, bearbeitbarer Text, explizite Suche, Abbruch/späte Antwort, keine Freigabe, nicht verfügbare Sprache und leeres Ergebnis. Native Projektvorbereitung und Berechtigungsdateien stimmen. Kompilierung und Starttest mit der neuen Brücke laufen anschliessend auf GitHub. Tatsächliche Aufnahme, Flugmodus, Systemberechtigungen, VoiceOver und TalkBack sind offen. [Architektur und Geräteabnahme](docs/DICTATION.md).

**Diktat gesichert** · Anforderungen in `0516cbd`, Implementierung in `ef3a3f7`. Remote zurückgelesen. Paket mit 337 Dateien und frischer Abhängigkeitsinstallation separat wiederhergestellt. [Wiederherstellung](docs/evidence/2026-11-25-on-device-dictation-recovery.json) und [nativer Build](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/45652217855).

Android und iOS kompilierten die Sprachmodule auf GitHub. Android bestand Installation, Mikrofonerklärung vor der Berechtigung, Textsuche, Speichern und Neustart im Emulator. iOS öffnete und schloss die Mikrofonerklärung erfolgreich, verfehlte danach mit eingeblendeter Tastatur den Suchknopf. `f3bde83` schliesst die Erklärung ohne Restfläche, hält den Eingabefokus bis zum Klick stabil und prüft den Abstand des Suchknopfs zur Tastatur. 165 Tests und Chromium grün. Der Korrekturstand mit 341 Dateien wurde isoliert wiederhergestellt. [Wiederherstellung und nativer Folgelauf](docs/evidence/2026-11-25-dictation-keyboard-recovery.json).

**Kontospeicher** · Der geschützte Pilot speichert Suchwünsche mit Kriterien für das bestätigte Konto. In echter lokaler HTTP-Prüfung mit zwei synthetischen Konten belegt: getrennt lesen, wiederholt speichern, entfernen, zwischen Sitzungen trennen und ohne Quellenaufruf betreiben. SQLite-Wiederöffnung bestätigt den dauerhaften Speicher. Der Testbuild zeigt die persönliche Liste nach Anmeldung und leert die Anzeige beim Abmelden. Alte gerätelokale Wünsche bleiben ausserhalb des Kontos.

**Kontospeicher gesichert** · `72e56e7` auf GitHub zurückgelesen. 164 automatisierte Tests, Typen, Build und Chromium grün. Das Paket mit 339 Dateien wurde separat wiederhergestellt. Sechs Tests zum Kontodienst bestanden aus dieser Kopie. [Nachweis](docs/evidence/2026-11-25-account-saved-searches-recovery.json).

**Datenschutzkorrektur** · Die Gegenprobe zeigte, dass der Anmeldedialog während eines Diktats aufgehen konnte. In `fd2fddb` bleibt er bis zur Bestätigung des nativen Abbruchs geschlossen. Ein verspätetes Transkript verändert den Entwurf nicht. Die kombinierte Browserprüfung prüft beides auf Android- und iOS-Zweig. Das Paket mit 340 Dateien wurde separat wiederhergestellt. Browserabfolge und sechs Tests des Kontodienstes bestanden aus dieser Kopie. [Nachweis](docs/evidence/2026-11-25-dictation-account-boundary.json).

**Umgesetzt** · Die austauschbare Arbeitsmarke `udi.` ist im Android-/iOS-Quellstand hinterlegt. Der [Originalauftrag zu Konto, Plus und Kosten](docs/requirements/2026-11-25-account-plus-costs.md) ist bytegenau gesichert. [PLAN](PLAN.md) führt Reihenfolge und Abnahmen. Unter «Gespeichert» ist «Tägliches Update» in DE/EN sichtbar. Der Schalter ist im ausgelieferten Entwicklungsstand gesperrt, bis Konto und Versand verbunden sind. [Tagesupdate](docs/DAILY-UPDATES.md), [Suchkontingente](docs/QUOTA.md) und [Kostenmodell](docs/ECONOMICS.md) beschreiben Implementierung und Betriebsvoraussetzungen.

**Geprüft** · 154 automatisierte Tests, Typprüfung, Build und vollständiger Chromium-Ablauf in DE/EN grün. Der geschützte lokale Pilotdienst wurde über beide tatsächlichen HTTP-Routen mit zwei synthetischen Konten geprüft. Unbestätigte Konten, ungültige Tokens und eine ausgefallene Auth-Gegenstelle führen zu keiner Quellenprüfung. Das ausgeschöpfte Kontingent und die Tagesupdate-Einstellung eines Kontos wirken sich nicht auf das andere aus.

**E-Mail-Sitzung** · Einmalcode, erneute Zustellung, Ablehnung und Abmeldung sind im gemeinsamen Client umgesetzt. Die Sitzung bleibt für den Pilot im Arbeitsspeicher. Der Anmeldecode führt über den normalen Suchclient zu den geschützten lokalen HTTP-Routen. Die Gegenprobe deckte einen Abbruch bei gleichzeitiger Neuanmeldung und abgelaufener Sitzung auf. Die alte Sitzung wird jetzt vor dem erneuten Codeabruf beendet. 161 Tests, Typprüfung, Build und Chromium grün. Auth- und Quellenantworten sind in diesem Ablauf synthetisch. Anbieterziel, Mailversand, sichtbare Anmeldung und sichere dauerhafte Sitzungsablage stehen aus.

**Anmeldeoberfläche** · Der ausdrücklich konfigurierte native Pilot zeigt die E-Mail-Anmeldung auf DE/EN. Ein falscher Code, erneutes Anfordern und Abbrechen sind bedienbar. Nach Bestätigung bleibt der Entwurf erhalten und die Suche startet erst auf erneuten Tipp. Abmelden entfernt vorläufige Eingaben und Ergebnisse. Alte lokale Suchwünsche werden im Kontopilot weder geladen noch übernommen. Chromium prüft beide Plattformzweige bei 320 px mit synthetischer Auth-Antwort. Standard- und Pilotbuild wurden für beide Plattformen mit 33 identischen UI-Dateien und der jeweils erwarteten Netzfreigabe geprüft.

**Quellenlücke** · Ein Suchwunsch ausserhalb des Pilots löste vorher HTTP 502 aus. Jetzt erklärt die App die eingeschränkte Quellenabdeckung und bietet ein Beispiel zur Übernahme an. Der echte lokale Dienst gab dabei HTTP 422 zurück, rief keine Quelle auf und liess alle drei kostenlosen Suchen verfügbar. Die Beispielübernahme startet im geprüften Browserablauf keine Suche.

**Wichtigste Korrektur** · Ein gespeichertes Briefing wird bei neuer widersprechender Angebotsprüfung sofort entwertet. Opt-out entfernt den Inhalt. Die Tagesgrenze folgt Europe/Zurich, auch bei konkurrierenden Aufrufen und Neustart. Das Plus-Kontingent folgt der bestätigten Laufzeit. Zahlungen werden durch die App noch nicht entgegengenommen. Der lokale Providerpfad verlangt eine atomare Budgetreservierung. Eine wirksame Anbieterobergrenze mit realem Abrechnungsnachweis bleibt offen.

**Layout-Folgeprüfung** · Der [GitHub-Lauf für den gesicherten Stand](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/45623307930) deckte bei 768 px Breite und 200 Prozent Schrift auf, dass in einem kurzen Browserfenster nur 21 px für den Inhalt übrig blieben. `d121310` lässt in kurzen Browserfenstern die ganze Seite scrollen. Eingabe und Hauptaktion sind bei 360, 390, 768 und 1365 px wieder erreichbar. [Korrektur und isoliert wiederhergestelltes Paket mit 315 Dateien](docs/evidence/2026-11-25-large-text-recovery.json). [GitHub-Qualitätslauf am Korrekturcommit](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/45623887271) grün.

**Nativer Folgeversuch** · Der korrigierte Stand `a26fe23` ist auf Android und iOS grün. Beide Plattformen wurden installiert und gestartet. Der iOS-Simulator bestätigte Textsuche, echten Zustand ohne Angebotsdienst und Speichern auf Deutsch und Englisch sowie Neustart mit erhaltener deutscher Sprache und Suchwünschen. Der Android-Emulator bestätigte gespeicherte Wünsche, Sprache und CH-Kontext nach Neustart. [Native Nachweise](docs/evidence/2026-11-25-native-language-retest.json).

Am Pilotdienst-Commit `5ee76d7` waren die Qualitätsprüfung und iOS grün. Android brach bei der Abhängigkeitsauflösung ab, weil Maven Central mehrfach HTTP 429 zurückgab. [Prüflauf](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/45637960044)

**Sicherung** · Pilotdienst `5ee76d7` nach `development/udi` gepusht und Remote-Commit zurückgelesen. Das lokale Paket mit 319 Dateien wurde mit frischer Abhängigkeitsinstallation isoliert wiederhergestellt. Alle drei gezielten Tests des geschützten Dienstes liefen auch aus dem Paket. [Prüfnachweis und Build-IDs](docs/evidence/2026-11-25-protected-pilot-recovery.json).

Die E-Mail-Sitzung ist im Remote-Commit `dcc2ed3` gesichert. Das zugehörige Paket mit 322 Dateien wurde separat wiederhergestellt. Alle zehn Anmelde- und Pilotdiensttests bestanden aus dieser Kopie. [Prüfnachweis und Build-IDs](docs/evidence/2026-11-25-email-session-recovery.json).

Die Anmeldeoberfläche ist in `7646223` auf GitHub gesichert. Das Paket mit 327 Dateien wurde separat wiederhergestellt. [Prüfnachweis](docs/evidence/2026-11-25-pilot-sign-in-ui-recovery.json)

Die Katalogkorrektur ist in `f3ff43e` auf GitHub gesichert. Die Wiederherstellung des Pakets mit 328 Dateien und die neun Suchdienst- und Pilottests daraus sind bestätigt. [Prüfnachweis](docs/evidence/2026-11-25-catalog-coverage-recovery.json)

**Offen** · Echte E-Mail-Anmeldung, betriebliche Abnahme des UDI-Diensts mit dauerhafter Datenbank, sicherer Sitzungswiederherstellung und Kontolöschung, Store-Sandbox und tatsächliche Store-Berechtigung. Ein Produktpreis von CHF 3.90 ist Zielwert. Die geschätzten Providerkosten bei 25 Suchen liegen je nach Aufrufzahl zwischen CHF 0.27 und 0.80 pro Plus-Konto. Zahlungs-, Auth-, Hosting- und weitere Anbieter-/Quellenkosten sind teilweise unbeziffert. Versand und zugehörige Geräteeinwilligung sind offen.

**Nächster Schritt** · Das [Diktat auf Geräten](docs/DICTATION.md) mit installierter deutscher und englischer Sprache, Erlaubniswechsel, Flugmodus und Screenreader prüfen. Für die [Kontoabnahme](docs/SERVICE.md#anmeldeoberfläche-im-nativen-testbuild) braucht es das getrennte UDI-Supabase-Testprojekt, zwei bestätigte Testkonten und das freigegebene HTTPS-Ziel. Danach E-Mail-Zustellung, geschützte Suche, geräteübergreifende Kontotrennung, sichere Wiederherstellung und Kontolöschung prüfen. Tagesupdate-Zustellung, Anbieterbudget und Store-Sandbox folgen als eigene Abnahmen.
