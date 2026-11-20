# UDI · erster verantwortbarer App-Start

Entscheidung vom 20.11.2026: enger, zunächst betreuter Pilot als installierbare Web-App (PWA) aus dem vorhandenen Stack. Keine neue Produktoberfläche und kein zweites Repository. Das ist kein nativer Android-/iOS-Build und kein bereits veröffentlichter Dienst.

## Ist-Zustand und gewählter Weg

Node.js 24, modulare JavaScript-Oberfläche, drei kleine Backend-Abhängigkeiten und lokales Prüfjournal. Ein konkreter Samsung-990-PRO-2-TB-Auftrag wird ohne KI-Schlüssel bei DQ geprüft. Preis, MPN, aktiver Status und Direktlink sind praktisch belegt. Gesamtkosten bleiben offen; kein marktweiter Bestpreis. Watchlists liegen ausschliesslich im jeweiligen Browser. Breite KI-Suche, zweite zuverlässige Quelle, automatische Benachrichtigungen und native Geräteabnahme fehlen.

| Realistischer Weg | Nutzen und Aufwand | Entscheidung |
|---|---|---|
| PWA mit derselben Oberfläche | Manifest und lokale Symbole ergänzen den bestehenden Stack. Installation hängt vom Browser und einer geeigneten Adresse ab. Kein Store-Eintrag für diesen Weg erforderlich; tatsächliche Gerätefunktion muss geprüft werden. | Schnellster vorbereitbarer Pilot. Internet erforderlich; keine Offline-Angebotsliste und keine zwischengespeicherten Live-Preise. |
| Native Hülle um den vorhandenen Code | Kann später vorhandene UI wiederverwenden; benötigt native Projekte, SDKs, Signierung und Tests. Browser-Spracherkennung ist damit nicht automatisch verlässlich verfügbar. | Erst bei belegtem Geräte-/Store-Bedarf. Auf diesem Rechner wurde Java gefunden, aber kein adb/Gradle im Suchpfad; Android- und Apple-Builds sind nicht nachgewiesen. |
| Store-Verteilung | Liefert Auffindbarkeit und vertraute Installation, schafft aber keinen Daten- oder Produktnutzen allein. Konten, Regeln und Prüfung kommen hinzu. | Nach Kern-/Geräteabnahme. Kein vorhandenes Entwicklerkonto, Store-Build oder Zulassung behaupten. |

[Chrome dokumentiert Manifest, Symbole, HTTPS und weitere Kriterien](https://web.dev/articles/install-criteria); eine vorhandene Manifestdatei garantiert keine Installationsaufforderung. [Apple erklärt die Installation über Safari und den Home-Bildschirm](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios). Apple nennt für sein Developer Program grundsätzlich 99 USD jährlich, regional abweichend; TestFlight gehört zum Programm. Kein Beitrag wurde bezahlt. [Apple](https://developer.apple.com/help/account/membership/program-enrollment/)

Bei neuen persönlichen Google-Play-Konten gelten vor Produktionszugang zusätzliche Testvoraussetzungen, derzeit unter anderem zwölf kontinuierlich angemeldete Tester über vierzehn Tage. Dies ist keine allgemeine Pflicht für die PWA oder für alle Kontotypen. [Google Play](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)

## P0 · Vorbereitung und echte Freigabe

Im Repository vorbereiten: App-Manifest, lokale Symbole, verständliche Installations-/Pilothilfe, Backend samt Lockdatei im Testpaket, sichere teilbare Suchaufträge und reproduzierbare Prüfungen. Das Paket ist ein Entwickler-/Betreiberpaket; die Teilnehmer installieren später über eine freigegebene Adresse, kein Node.js auf dem Telefon.

Betreiberpaket aus einem sauberen, geprüften Git-Stand: `npm ci`, `npm test`, `npm run build`, `npm run smoke`, danach `npm run pilot:package`. Das erzeugt unter `artifacts/` ein TAR.GZ mit freigegebenen Projektdateien, gebauter App, Backend und Lockdatei sowie einen JSON-Nachweis mit Commit und SHA-256 je Datei/Archiv. Kein APK/IPA und keine veröffentlichte Testadresse. Entpacken in einen leeren Ordner, dort `npm ci` und `npm run dev`; `http://127.0.0.1:4173` ist nur auf diesem Computer erreichbar. Keine Schlüssel, `.env`, `.udi` oder `node_modules` aus dem Arbeitsverzeichnis beilegen. Für die spätere HTTPS-Bereitstellung gelten die folgenden Freigaben.

Prüfung eines eigenen erzeugten Pakets: `npm run pilot:verify -- artifacts/udi-pilot-<commit>.json`. Das prüft Archiv-/Dateihashes, entpackt isoliert, installiert mit der Lockdatei und ohne Lifecycle-Skripte und startet das enthaltene Backend auf einem zufälligen lokalen Port. Manifest und Katalog-API müssen funktionieren; ohne Verifier dürfen keine Angebote entstehen. Der Prüfer ist kein Upload-Endpunkt für fremde Archive. Am Sicherungspunkt c9b1154 wurden 76 Dateien, Abhängigkeiten und beide Backend-Antworten erfolgreich geprüft. Noch keine echte mobile Installation oder öffentliche Auslieferung.

Der Server lauscht weiterhin nur auf 127.0.0.1 und akzeptiert seine lokale Origin. Deshalb ist weder `dist/` allein noch eine Tunnel-/Static-Hosting-Adresse ein funktionierender Mehrnutzerstart. Für eine Testadresse fehlen: bewusst gewählte UDI-Hostingumgebung mit HTTPS, geeignete Origin-Konfiguration, Zugriffsschutz, geprüfte Trennung persönlicher Daten, durchgesetzte gemeinsame Limits und ein benannter Betreiber mit Budget/Abschaltung. Keine vorhandene Sicherheitsprüfung nur für eine schnelle Demo lockern.

Die verbundene Vercel-Abfrage lieferte am 20.11. HTTP 403 und verwies auf den SOUNDWEAVE-Scope. Dieser Bereich wird weder freigeschaltet noch verändert. Eine vorhandene zulässige UDI-Umgebung ist dadurch nicht nachgewiesen. Hosting-Freigabe bzw. passende UDI-Berechtigung bleibt ein konkreter externer Schritt, der die lokale Vorbereitung nicht blockiert.

Freigabe vor Einladungen: reale Installation und erster passender Treffer auf mindestens einem Android-/Chrome- und einem iPhone-/Safari-Gerät; Textsuche, echte Sprachaufnahme, Stopp/Anhören/Löschen, Mikrofonverweigerung, Angebot abgelaufen, Offline-/Quellenausfall und Watchlist nach erneutem Start. Die Gerätebezeichnungen sind geplante Abnahmekandidaten, keine bereits unterstützten/geprüften Plattformen. Text bleibt der Rückfallweg. Ohne passende App-Adresse keine mobile Installierbarkeit behaupten.

## P1 · fünf passende freiwillige Tester

Kanal: bestehende persönliche Kontakte zu Schweizer PC-Interessierten mit konkretem SSD-Kauf-/Upgradebedarf. Zunächst fünf betreute Einzeltests, um Quellenabdeckung, Last und Rückmeldungen zu kontrollieren. Kein Zugang als «Auserwählte», keine künstliche Knappheit. Geschlossenheit dient Feedback und Betriebsbegrenzung. Einladung erst nach P0-Freigabe; keine automatisierten Nachrichten oder neuen Kontakte.

Kurzer App-Text: «UDI hilft dir, einen konkreten Kaufwunsch zu prüfen. Im ersten Schweizer SSD-Pilot siehst du Preis, Quelle, Prüfzeit und offene Kosten und öffnest das passende Angebot direkt. Speichere deine Suche, um später erneut zu prüfen. Noch kein umfassender Marktvergleich.»

Einladungsentwurf: «Ich teste UDI mit wenigen PC-Interessierten. Möchtest du in fünf Minuten ausprobieren, ob du eine konkrete SSD findest, den Preis und offene Kosten verstehst und das richtige Angebot öffnen kannst? Teilnahme ist freiwillig; es gibt keine Kaufpflicht. Ich brauche ehrliche Rückmeldung, keine positive Bewertung. [Freigegebene Testadresse nach Geräteabnahme einsetzen.]» Dieser Text ist ein Entwurf, keine gesendete Einladung.

Test in fünf Minuten: App über die Testadresse zum Home-Bildschirm hinzufügen → «Samsung 990 PRO 2 TB bis CHF 500» schreiben oder einsprechen → Wunsch prüfen und Suche bewusst starten → Prüfzeit und offene Kosten erklären lassen → Händler öffnen → zurückkehren, Suche speichern und App erneut starten. Erwartetes Ergebnis: richtiger konkreter Link oder ehrlicher Quellenfehler; kein erzwungener Kauf. Stimme, Rohsuchtext und genaue Adresse nicht für die Auswertung sammeln.

Feedback: freiwilliger strukturierter Bericht nach docs/PILOT-TEST.md; in der App ein vorbereiteter GitHub-Feedbackweg, der ein eigenes Konto voraussetzen kann. Keine automatische Meldung oder Übertragung von Text, Aufnahme, Watchlist oder Diagnoseprotokollen. Wer keinen GitHub-Account nutzen möchte, gibt dem Testbetreuer persönlich Rückmeldung. Betreiber-/Supportadresse ist noch nicht festgelegt; keine Adresse erfinden.

## P2 · hilfreiche Weitergabe statt QR-Zwang

Primär eine Suche mit ihren Kriterien teilen, keine Preis-/Bestandsmomentaufnahme als aktuelle Wahrheit. Der Empfänger sieht eine bearbeitbare Zusammenfassung und startet selbst eine neue Prüfung. Links dürfen keine Sprachaufnahme, Schlüssel oder Zugangstoken enthalten. Suchtext kann persönlich sein; vor Freigabe sichtbar machen und bewusst bestätigen. Ein QR-Code ist später lediglich ein zusätzlicher Transport desselben Links, etwa auf einem zweiten Bildschirm. Auf einem einzelnen Telefon schafft ein QR-only-Einstieg zusätzliche Reibung.

Im Projekt umgesetzt: «Diese Suche teilen» → Link zur Prüfung vorbereiten → bewusst kopieren oder bei geeigneter Adresse das native Teilen nutzen. Die Suchabsicht liegt im URL-Fragment, wird nicht als Query an den Server geschickt und enthält keine Angebotsdaten. Änderungen machen die vorbereitete Vorschau ungültig. Beim Empfang wird eine ältere Suche abgebrochen; es erscheinen Wunsch und Kriterien, keine automatisch angefragten Angebote. Lokale Links werden ausdrücklich als Testlinks für denselben Computer bezeichnet. Es gibt noch keinen allgemein verwendbaren UDI-Host und keinen eingebauten QR-Generator.

Es gibt keinen belegten plattformübergreifenden Deferred-Deep-Link-Dienst. Die App verspricht nicht, den Inhalt nach einer Neuinstallation automatisch wiederherzustellen. Sicherer Rückfall: Original-Link behalten und nach Installation erneut öffnen. Ohne freigegebene mobile Adresse keine allgemein nutzbaren Freigabelinks erzeugen; lokale Links als solche erklären. Keine Empfehlungscodes, Prämien, Kontaktbuchimporte oder Kampagnenmechanik im ersten Pilot.

## P3 · nur anhand tatsächlicher Nutzung

Erst wiederkehrende Nutzung und echte passende Angebote rechtfertigen zusätzliche Quellen, gemeinsame Datenbank/Worker, persönliche Konten, individuelle Quoten, dauerhafte Überwachung und Store-Verteilung. Die bisherige Prozessbegrenzung ist kein verteiltes Produktionslimit. DQ-Regeln und Betriebserlaubnis vor Ausweitung erneut prüfen. Keine Kosten- oder Hostingzusagen ohne konkretes Angebot. Kosten je brauchbarem Scan sowie tatsächlichen Quellen-/Supportaufwand im Pilot messen; bekannte Katalogaufträge lösen keine KI-Kosten aus, Infrastruktur ist dadurch nicht automatisch kostenlos.
