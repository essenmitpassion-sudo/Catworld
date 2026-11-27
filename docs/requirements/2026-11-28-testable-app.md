# UDI – App testbar machen und kritische Abläufe absichern

## Auftrag

Arbeite im bestehenden UDI-Projekt weiter. Ich konnte die App bisher noch nicht selbst testen. Dein wichtigstes Ergebnis ist deshalb eine **wirklich startbare und sinnvoll durchspielbare App**, die ich danach selbst prüfen kann.

Prüfe den tatsächlichen Projektstand, statt frühere Statusmeldungen ungeprüft zu übernehmen. Entwickle Bestehendes weiter und ändere nur, was für einen stabilen Test nötig ist.

## P0 – Ist-Zustand und Testblocker feststellen

1. Prüfe Repository, offene Änderungen, Projektanweisungen, Architektur, Android- und iOS-Builds, Konfigurationen und den isolierten Testdienst.
2. Stelle fest, welche Abläufe tatsächlich funktionieren und wo ich als Nutzer nicht weiterkomme.
3. Unterscheide klar zwischen:
   - automatisch getestet,
   - auf Simulator oder Emulator praktisch geprüft,
   - auf einem echten Gerät geprüft,
   - noch nicht geprüft.
4. Sichere den aktuellen Stand nachvollziehbar, bevor du grössere Änderungen machst.

## P1 – iOS-Diktatfehler beheben

Grenze den offenen iOS-Diktatfehler systematisch ein. Prüfe insbesondere Berechtigungen, Mikrofon- und Spracherkennung, App-Zustände, Fehlerbehandlung, Abbruch und erneuten Versuch.

Behebe die Ursache, sofern sie im Projekt liegt. Android darf dabei nicht regressieren. Wenn ein externer Anbieter, fehlende Berechtigung oder eine nicht verfügbare Plattformfunktion die Ursache ist, dokumentiere den konkreten Blocker und liefere den besten testbaren Fallback.

## P2 – Suche verlässlich und verständlich machen

Härte die Suche mit dem vorhandenen isolierten Testdienst ab. Prüfe den vollständigen Ablauf vom Absenden einer Suche bis zu verständlichen Ergebnissen oder einer klaren Fehlermeldung.

Berücksichtige mindestens:

- leere, unvollständige und ungewöhnliche Eingaben,
- Ladezustand, Zeitüberschreitung, keine Treffer und Dienstfehler,
- wiederholte Suche und Abbruch,
- fehlerhafte oder unvollständige Angebotsdaten,
- sichere und nachvollziehbare Händlerlinks,
- verständliche Darstellung auf Android und iOS.

Zeige keine Treffer, Preise, Gutscheine oder Verfügbarkeiten als echt an, wenn sie nur Testdaten oder nicht verifizierte Angaben sind. Kennzeichne Testdaten in der Oberfläche klar.

## P3 – Kleinsten vollständigen Nutzer-Test ermöglichen

Stelle einen einfachen Ablauf bereit, den ich ohne Entwicklerwissen ausprobieren kann. Er soll – soweit der aktuelle Stand es zulässt – mindestens Folgendes enthalten:

1. App starten und den ersten Bildschirm verstehen.
2. Eine Suche eingeben und ein Ergebnis oder einen klar erklärten Leer-/Fehlerzustand sehen.
3. Die Spracheingabe auf iOS ausprobieren oder den dokumentierten Fallback verwenden.
4. Zurückgehen, erneut suchen und die App erneut öffnen, ohne in einem kaputten Zustand zu landen.

Prüfe diesen Ablauf auf Android und iOS mit den vorhandenen Emulatoren oder Simulatoren. Wenn ein Schritt nur auf einem echten Gerät geprüft werden kann, kennzeichne ihn und mache ihn für meinen anschliessenden Test so einfach wie möglich.

## P4 – Übrige kritische Schwächen prüfen

Führe einen fokussierten Deep Dive auf weitere Fehler durch, die meinen Test oder die Kernabläufe verhindern könnten: Start, Navigation, Berechtigungen, Zustandswiederherstellung, Fehleranzeigen, Datenschutz, sichere Links und Plattformunterschiede.

Behebe die wichtigsten bestätigten Probleme. Erweitere den Umfang nicht um neue Funktionen, solange kritische Testblocker offen sind. Behaupte nicht, die App sei „perfekt“ oder vollständig verifiziert; belege jede Aussage mit dem tatsächlich ausgeführten Prüfschritt.

## HTTPS und Pilot-Abgrenzung

Für die aktuelle Entwicklungs- und Testphase genügt der isolierte Testdienst, sofern du bestätigst, dass er auf Android und iOS tatsächlich erreichbar ist und die benötigten Kernabläufe unterstützt.

Richte **jetzt keinen getrennten HTTPS-Testdienst und keine echten Testkonten** ein, solange die Kernabläufe noch nicht stabil sind. Halte aber als Freigabebedingung für einen geschützten Pilot fest:

- HTTPS-Testdienst,
- getrennte Testkonten,
- Anmeldung und Sitzungswiederherstellung,
- Händlersuche auf Android und iOS,
- Prüfung der Zugriffs- und Datenschutzgrenzen.

## Arbeitsweise und Abschluss

Arbeite eigenständig in kleinen, nachvollziehbaren Schritten. Triff reversible technische Entscheidungen selbst. Halte Änderungen und Wiederherstellungsmöglichkeiten fest. Vermeide unnötige Umbauten und Endlosschleifen; wenn ein Punkt blockiert ist, arbeite an unabhängigen Punkten weiter.

Am Ende liefere kurz und konkret:

- Was du geändert hast.
- Welche Kernabläufe jetzt funktionieren.
- Welche Builds, Tests und praktischen Prüfungen du wirklich ausgeführt hast.
- Was noch ungeprüft oder blockiert ist.
- Eine einfache Anleitung, wie ich die App selbst starten und testen kann.
- Den nächsten notwendigen Schritt vor einem geschützten Pilot.

**Oberste Leitlinie: Mach UDI zuerst für mich real testbar. Melde nur, was du tatsächlich belegt hast.**