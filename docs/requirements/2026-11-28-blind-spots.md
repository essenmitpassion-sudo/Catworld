# UDI – LAUFENDE ARBEIT FORTSETZEN UND BLINDE FLECKEN FINDEN

Setze die bereits begonnene Arbeit am aktuellen UDI-Projektstand fort. **Nicht neu starten, zurücksetzen oder abgeschlossene Arbeit wiederholen.** Prüfe zuerst den aktuellen Code, letzte Änderungen, Projektentscheidungen, Tests und die tatsächlich verfügbaren App- und Testumgebungen.

## Ziel

UDI soll eine einfache, vertrauenswürdige KI-Suche werden: Der Nutzer beschreibt einmal, was er braucht, und erhält ein nützliches, nachvollziehbares Ergebnis. UDI soll den Rechercheaufwand gegenüber einer klassischen Suche spürbar senken. Die technische Komplexität gehört in die App, nicht in Einrichtung und Bedienung.

Bewahre den UDI-USP. Der Nutzer soll für die normale Nutzung keine API-Schlüssel oder zusätzlichen KI-Abos einrichten müssen. Erfinde keine Funktionen, Angebote, Quellen oder erfolgreichen Prüfungen.

## Zuerst: Auch unbesprochene Probleme aufdecken

Behandle die bisher genannten offenen Punkte **nicht als vollständige Problemliste**. Prüfe den gesamten Weg vom ersten Öffnen bis zum brauchbaren Ergebnis und suche selbstständig nach übersehenen Risiken, Abhängigkeiten und Produktlücken.

Untersuche, soweit für den aktuellen Projektstand relevant:

- Verständlichkeit der App für jemanden, der sie zum ersten Mal öffnet
- Sucheingabe, Spracheingabe, tatsächliche Suchabdeckung und Qualität der Ergebnisse
- Aktualität, Herkunft und Überprüfbarkeit von Angeboten, Preisen, Links und Gutscheinen
- Lade-, Leer-, Fehler-, Offline- und Wiederherstellungszustände
- Anmeldung, Kontowiederherstellung, gespeicherte Suchen und möglicher Login-Zwang
- Datenschutz, Berechtigungen, Zugangsdaten, Link-Sicherheit und Umgang mit KI-Antworten
- Kosten pro Suche, Nutzungsgrenzen, mögliche Drittanbietergebühren und Schutz vor unerwarteten Kosten
- Abhängigkeit von PC, lokalem Entwicklungsserver, Testdienst, Hosting oder einzelnen Anbietern
- Android-/iOS-Unterschiede, Bildschirmgrössen, Bedienbarkeit und Barrierefreiheit
- APK-Erstellung, Signierung, Updateweg und Wartbarkeit, sofern sie für die nächste Phase relevant sind
- fehlende Protokollierung, Fehlerdiagnose, Wiederherstellung oder andere Betriebsrisiken

Suche nach konkreten Hinweisen in Code, Konfiguration, App-Vorschau und Tests. Keine generischen Checklisten als Ersatz für Prüfung. Halte Findings knapp fest und ordne sie danach ein, ob sie **die erste echte Nutzung**, **einen geschützten Pilot** oder erst **einen späteren Ausbau** betreffen.

## Danach: Pareto-priorisiert umsetzen

Wähle die wichtigste belegte Schwäche, die aktuell echten Nutzwert oder eine spätere sichere Weiterarbeit verhindert. Behebe sie direkt im bestehenden Projekt. Ändere nicht mehrere grosse Bereiche gleichzeitig.

Bevorzuge diese Reihenfolge, sofern deine Prüfung keine dringendere Abhängigkeit zeigt:

1. **Stimmiger Kern:** App öffnen → Suchwunsch eingeben → verständliches, nachvollziehbares Ergebnis erhalten.
2. **Vertrauen und Bedienbarkeit:** echte Quellen, klare Unsicherheiten, hilfreiche Zustände, einfache UI.
3. **Anmeldung:** Prüfe, ob ein Konto jetzt tatsächlich nötig ist oder erst für Synchronisierung, gespeicherte Suchen, Ersparnis-Tracking und Abos. Vermeide einen Login-Zwang vor der ersten sinnvollen Nutzung, sofern er nicht technisch oder geschäftlich erforderlich ist.
4. **PC-unabhängiger Betrieb:** Nutze zunächst vorhandene lokale und isolierte Testmöglichkeiten. Bereite dauerhaft erreichbares Hosting vor, sobald der Kern stabil genug ist. Behaupte keinen Betrieb bei ausgeschaltetem PC, bevor er geprüft wurde.
5. **APK und Updates:** Baue einen installierbaren APK- und Updateweg erst auf einem stimmigen Grundgerüst auf. Unterscheide Such-/Datenaktualisierungen von neuen App-Versionen.

Wenn du eine wichtigere Abhängigkeit findest, ändere diese Reihenfolge mit kurzer Begründung. Warte nicht auf Hosting oder externe Zugänge, wenn unabhängige Arbeit möglich ist.

## Arbeitsweise

- Arbeite selbstständig an sicheren, reversiblen Aufgaben und warte nicht auf unnötige Freigaben.
- Bei einem Blocker höchstens drei gezielte Lösungsversuche; dann Ursache feststellen, sichere Alternative wählen und unabhängige Arbeit fortsetzen.
- Prüfe `git status` vor Änderungen und bewahre fremde oder ungesicherte Änderungen.
- Speichere nach jedem sinnvollen Meilenstein. Erstelle im vorhandenen Git-Projekt nachvollziehbare lokale Checkpoints/Commits und stage nur eigene Änderungen.
- Push nur, wenn das bereits autorisiert und das Ziel verifiziert ist.
- Keine unnötigen Konzeptschleifen, Komplettumbauten, Veröffentlichung oder unerwarteten Kosten.

## Abschluss

Berichte knapp und belegbar:

- Welchen unbesprochenen blinden Fleck du gefunden hast.
- Was du konkret geändert und gesichert hast.
- Was automatisch und praktisch geprüft wurde.
- Was noch blockiert und warum.
- Was als Nächstes den grössten Nutzwert bringt.

**Leitlinie: Nicht nur bekannte Aufgaben abarbeiten. Selbst nach den Problemen suchen, die den Nutzer später überraschen würden – und zuerst die wichtigste davon tatsächlich lösen.**