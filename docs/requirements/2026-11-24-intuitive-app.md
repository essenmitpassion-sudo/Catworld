# UDI – EINE MODERNE, VERTRAUENSVOLLE UND INTUITIVE APP ENTWICKELN

## Mission

Überarbeite das bestehende UDI-Projekt zu einer modernen, verständlichen und vertrauenswürdigen App. Nutzer sollen sofort erkennen, wofür die App da ist, wie sie eine Suche starten und worauf die Ergebnisse beruhen.

Arbeite direkt im vorhandenen Projekt und entwickle es auf Basis des tatsächlichen Stands weiter. Prüfe zuerst Code, Dokumentation, aktuelle Screens und Funktionen. Erhalte funktionierende Arbeit und bestehende Produktentscheidungen, sofern die Prüfung keinen konkreten Grund für eine Änderung ergibt.

**Setze die Verbesserungen um. Liefere nicht nur Ideen oder einen Bericht.** Arbeite selbstständig, nutze verfügbare Werkzeuge und frage nur nach, wenn eine kritische Entscheidung, fehlende Berechtigung oder eine schwer rückgängig zu machende Aktion deine Arbeit tatsächlich stoppt.

## Erfolgskriterien

Die App ist auf einen Blick verständlich:

- Nutzer erkennen den Zweck der App und ihren Nutzen.
- Die wichtigste Handlung ist klar und leicht erreichbar.
- Texte, Gestaltung und Verhalten wirken konsistent und durchdacht.
- Suchergebnisse, Preise, Angebote und Gutscheine sind nachvollziehbar und ehrlich dargestellt.
- Leere, fehlerhafte oder noch nicht verfügbare Zustände sind verständlich.
- Die Bedienung funktioniert auf kleinen Smartphone-Bildschirmen und mit der Bildschirmtastatur.
- Android und iOS werden gleichwertig berücksichtigt, soweit beide Plattformen zum Projekt gehören.

## P0 – Bestand und zentrale Nutzerabläufe prüfen

- [ ] Lies Projektanweisungen, Git-Status und vorhandene Fortschrittsnotizen.
- [ ] Prüfe, was im Projekt tatsächlich implementiert ist und was nur geplant oder simuliert wird.
- [ ] Untersuche die wichtigsten vorhandenen Screens und Nutzerabläufe.
- [ ] Reproduziere den Zustand aus dem beigefügten Screenshot.
- [ ] Prüfe insbesondere den Ablauf: App öffnen → Suchanfrage eingeben → Suche starten → Ergebnis oder verständliche Rückmeldung erhalten.
- [ ] Ermittle, ob der Tastatur-Hinweis im Screenshot von der App, dem Framework, dem Browser, iOS oder der Tastatur stammt.

Behandle die Beobachtungen aus dem Screenshot als zu überprüfende Hinweise: Der Kopfbereich wirkt zu dominant, das Eingabefeld zu gross, der blaue Fokusrahmen nicht passend und der Tastatur-Hinweis unterbricht die Suche. Finde die tatsächliche Ursache, bevor du Änderungen auswählst.

## P1 – Nutzererlebnis vereinfachen

Gestalte die App aus Sicht einer Person, die sie zum ersten Mal öffnet:

- [ ] Formuliere den Nutzen in einem kurzen, konkreten Satz.
- [ ] Stelle die Suche als wichtigste Aufgabe in den Mittelpunkt.
- [ ] Verwende eine klare Hauptaktion und vermeide gleichrangige konkurrierende Buttons.
- [ ] Prüfe jede sichtbare Funktion: Unterstützt sie die Suche oder eine wichtige Entscheidung? Wenn nicht, entferne sie, verstecke sie sinnvoll oder vereinfache sie.
- [ ] Prüfe insbesondere, ob „Adjust buying criteria“ notwendig ist. Erweiterte Kriterien sollen die einfache Suche nicht erschweren.
- [ ] Halte Markt- und Spracheinstellungen verfügbar, aber kompakt. Sprache, Markt, Lieferland und Währung müssen getrennt behandelt werden.
- [ ] Verwende kurze, natürliche Texte in Deutsch und Englisch.
- [ ] Nutze Beispiele, die zu den tatsächlich unterstützten Suchmöglichkeiten passen.

Verwende keine Funktionsversprechen, die das Projekt noch nicht erfüllt. Wenn aktuelle Angebote noch nicht abrufbar sind, untersuche zuerst, ob die Ursache im Projekt behoben werden kann. Ist ein externer Dienst oder Zugang wirklich erforderlich, zeige einen knappen, ehrlichen und hilfreichen Zustand. Erfinde keine Angebote oder Preise, um eine fertige App vorzutäuschen.

## P2 – Gestaltung und Markenauftritt vereinheitlichen

Entwickle eine erkennbare, moderne Gestaltung, die ruhig, hochwertig und glaubwürdig wirkt:

- [ ] Lege ein konsistentes System für Farben, Typografie, Abstände, Buttons, Eingabefelder, Icons und Fokuszustände an.
- [ ] Prüfe, ob die bestehende Farbwelt zum Produkt passt. Verwende sie nur, wenn sie Lesbarkeit und Vertrauen unterstützt.
- [ ] Gestalte den Kopfbereich kompakter, damit die Suche auf Mobilgeräten mehr Platz erhält.
- [ ] Vermeide übergrosse Flächen, dekorative Elemente ohne Funktion und visuelle Unruhe.
- [ ] Sorge für eine klare Hierarchie: Überschrift, kurze Erklärung, Eingabe und Hauptaktion.
- [ ] Verwende sichtbare Fokuszustände, die zur Gestaltung passen und trotzdem gut erkennbar sind.
- [ ] Prüfe Kontrast, Schriftgrösse, Beschriftungen und Touch-Flächen auf gute Zugänglichkeit.
- [ ] Übertrage die Gestaltung konsistent auf die relevanten bestehenden Screens und Zustände, nicht nur auf den Screenshot.

Die App soll vertrauenswürdig durch klare Informationen und verlässliches Verhalten wirken. Nutze keine erfundenen Gütesiegel, Bewertungen, Nutzerzahlen, Garantien oder Werbeversprechen.

## P3 – Bildschirmtastatur und Eingabe richtig behandeln

- [ ] Baue keine eigene Tastatur oder zusätzliche Tippfunktion, wenn die native Tastatur die Eingabe bereits unterstützt.
- [ ] Entferne app-eigene Tastatur-Tutorials oder Bestätigungsschritte, wenn sie die Suche unterbrechen.
- [ ] Unterdrücke keine native Betriebssystemfunktion, die die App nicht kontrolliert.
- [ ] Halte Eingabe, Hauptaktion und relevante Rückmeldungen beim Öffnen der Tastatur gut erreichbar.
- [ ] Verhindere, dass die Tastatur Buttons verdeckt, den Inhalt unkontrolliert verschiebt oder den Eingabefokus verliert.
- [ ] Unterstütze eine passende Tastaturaktion wie „Suchen“, falls technisch sinnvoll.
- [ ] Prüfe langes Tippen, Einfügen, Löschen, Tastatur schliessen und wieder öffnen.
- [ ] Der eingegebene Suchtext darf bei einem Fehler nicht verloren gehen.

Passe das Layout an das Verhalten der Plattform an. Dokumentiere klar, wenn ein beobachteter Tastatur-Hinweis vom Betriebssystem stammt und nicht durch die App entfernt werden kann.

## P4 – Namen prüfen

Prüfe, ob „UDI“ als sichtbarer Produktname verständlich, merkbar und passend zum echten Nutzen ist:

- [ ] Entwickle mehrere plausible Namensrichtungen für den Schweizer Markt und eine spätere internationale Nutzung.
- [ ] Bewerte sie nach Verständlichkeit, Aussprache auf Deutsch und Englisch, Merkfähigkeit und Verwechslungsrisiko.
- [ ] Nutze verfügbare Recherchewerkzeuge, um offensichtliche Namenskollisionen bei Apps, Firmen oder Produkten zu erkennen.
- [ ] Empfiehl selbstständig den stärksten Namen und begründe die Wahl kurz.
- [ ] Kennzeichne die Prüfung als vorläufig, wenn keine verlässliche Recherche möglich ist. Behaupte keine rechtliche Freigabe.
- [ ] Setze die Empfehlung im sichtbaren Produktauftritt konsistent um, sofern keine schwerwiegende Kollision erkennbar ist.
- [ ] Ändere technische Paket- oder Bundle-Kennungen nur, wenn es nötig und sicher möglich ist.

## P5 – Umsetzen und prüfen

Arbeite in kleinen, vollständigen Schritten:

1. Prüfe Projektstand und reproduziere das aktuelle Verhalten.
2. Behebe zuerst den grössten belegten Fehler im Such- und Tastaturablauf.
3. Vereinfache die Startansicht und setze ein konsistentes Design um.
4. Prüfe Name, Texte und sichtbare Produktversprechen.
5. Teste die zentralen Abläufe und Grenzfälle.
6. Behebe den wichtigsten gefundenen Fehler, bevor du weitere Funktionen ergänzt.
7. Sichere den Fortschritt und aktualisiere die Projektaufzeichnungen.

Nutze verfügbare Tests, Builds, Browser, Emulatoren und Simulatoren. Prüfe Android und iOS getrennt, wenn die Plattformen zum Projekt gehören und die nötigen Umgebungen verfügbar sind. Wenn ein Werkzeug fehlt, benenne die Blockade und setze unabhängige Arbeit fort.

Kennzeichne Nachweise präzise als **umgesetzt**, **automatisch getestet**, **praktisch geprüft** oder **offen**. Melde keine Prüfung als bestanden, die nicht tatsächlich ausgeführt wurde.

## Dauerhafte Sicherung und selbstständiges Weiterarbeiten

- Pflege eine zentrale Fortschrittsdatei im Projekt, falls noch keine passende existiert.
- Halte dort tatsächlichen Stand, Entscheidungen, Tests, Blockaden und den nächsten konkreten Schritt fest.
- Aktualisiere sie nach jedem abgeschlossenen Meilenstein und vor einer Unterbrechung.
- Sichere nachvollziehbare Git-Checkpoints nach den Projektregeln und prüfe vorher die Änderungen.
- Sichere keine Geheimnisse oder persönlichen Daten in Code, Logs oder Fortschrittsnotizen.
- Wenn ein Ansatz scheitert, diagnostiziere die Ursache und probiere eine sinnvolle Alternative. Wiederhole nicht endlos denselben Versuch.
- Warte nicht auf meine Zustimmung für normale, sichere Entwicklungsarbeit. Frage nur, wenn eine echte Entscheidung oder Berechtigung fehlt.
- Führe Veröffentlichungen, kostenpflichtige Aktionen und schwer rückgängig zu machende externe Änderungen nur mit entsprechender Berechtigung aus.

Arbeite innerhalb der Sitzung mit dem nächsten sinnvollen, umsetzbaren Schritt weiter. Behaupte keine Hintergrundarbeit, die nicht stattgefunden hat.

## Abschlussmeldung

Fasse knapp zusammen:

- Was wurde an Nutzerablauf, Gestaltung und Name geändert?
- Was wurde tatsächlich getestet oder praktisch geprüft?
- Wo wurde der aktuelle Stand dauerhaft festgehalten?
- Welche echten Blockaden bleiben offen?
- Was ist der nächste konkrete Schritt mit dem grössten Nutzen?

## Oberste Leitlinie

**Die App muss sich vom ersten Öffnen an verständlich, ruhig und vertrauenswürdig anfühlen – und die Suche muss ohne unnötige Hürden funktionieren.**