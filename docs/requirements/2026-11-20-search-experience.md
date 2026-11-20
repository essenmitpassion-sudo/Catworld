# UDI – UI für Sprachsuche und intelligente Sucheingabe

## Auftrag

Gestalte und implementiere im bestehenden UDI-Projekt den zentralen Sucheinstieg: Nutzer sollen ihr Anliegen entweder **einsprechen** oder **als Text beschreiben** können.

UDI soll dabei nicht nur Eingaben entgegennehmen. Es soll Menschen helfen, ihre Suche so zu formulieren, dass sie schnell passende, vergleichbare und hilfreiche Ergebnisse erhalten – ohne sie mit Filtern und Formularen zu überfordern.

## Erst den tatsächlichen Produktkontext verstehen

Prüfe die vorhandene UDI-Oberfläche, den Projektstand und die tatsächlich unterstützten Suchbereiche. Entwickle die Lösung passend zu den vorhandenen Funktionen und zur Architektur.

Erfinde keine Funktionen, Datenquellen oder Fähigkeiten. Wenn ein Ablauf noch nicht umgesetzt ist, kennzeichne ihn intern als offen und baue keine vorgetäuschte Funktion.

## Zentrale UX-Aufgabe

Entwickle eine klare, moderne Eingabe, bei der Nutzer sofort verstehen:

- Ich kann sprechen oder tippen.
- UDI hilft mir, die Suche zu präzisieren.
- Ich sehe, was UDI aus meiner Eingabe verstanden hat.
- Ich kann die Suche einfach anpassen und starten.

Spracheingabe und Texteingabe sollen gleichwertige, leicht auffindbare Wege sein. Ein Wechsel zwischen ihnen darf bereits eingegebene Informationen nicht verlieren.

## UDI als Ideen- und Suchassistent

Finde eigenständig die einfachste und verständlichste Lösung, um unvollständige oder vage Suchanfragen zu verbessern.

Erkenne pro Suchbereich, welche Angaben die Ergebnisse stark beeinflussen. Frage nur nach Angaben, die wirklich wichtig sind. Stelle höchstens eine konkrete Rückfrage gleichzeitig und erkläre kurz, warum sie hilft. Unwichtige Details bleiben optional.

**Beispiel Produktsuche RAM:** Die benötigte Kapazität kann für die Suche entscheidend sein. UDI soll eine fehlende Angabe leicht ergänzbar machen, etwa mit einer kurzen Rückfrage oder passenden Auswahl. Technische Kriterien wie Kompatibilität sollen nur dann abgefragt oder hervorgehoben werden, wenn sie für die konkrete Suche relevant sind.

Übertrage dieses Prinzip auf weitere tatsächlich unterstützte Bereiche, etwa Tickets oder lokale Angebote: jeweils nur die Kriterien hervorheben, die für gute Treffer wichtig sind.

## Suchabsicht klar präsentieren

Zeige vor dem Start eine kompakte, leicht änderbare Zusammenfassung dessen, wonach UDI suchen wird. Zum Beispiel:

- Suchbegriff oder Anliegen
- wichtige Muss-Kriterien
- optionale Wünsche
- noch fehlende Angabe, falls sie die Suche wesentlich verbessert

Nutzer müssen erkennen können, welche Angaben von ihnen stammen und welche UDI vorgeschlagen hat. Nichts Wichtiges darf stillschweigend ergänzt oder verändert werden. Biete einen klaren Startknopf und eine einfache Möglichkeit zum Bearbeiten.

## Gestaltung und Wiedererkennung

Die Oberfläche soll eigenständig, modern und ruhig wirken – nicht wie ein generisches KI-Chatfenster oder eine überladene Filtermaske.

Entwickle ein wiedererkennbares UDI-Element für den Übergang von einer freien Idee zu einer klaren Suchabsicht. Es soll die Orientierung verbessern und einen echten Nutzen haben, nicht nur dekorativ sein.

Nutze klare Hierarchie, gut lesbare Texte, verständliche Symbole und eine Darstellung, die auf kleinen und großen Bildschirmen funktioniert. Vermeide unnötige Optionen, Fachjargon und lange Anleitungen.

## Vertrauen und Fehlerzustände

- Mikrofon erst nach bewusster Aktion aktivieren.
- Aufnahme, Dauer und Berechtigungsstatus klar anzeigen.
- Aufnahme vor dem Absenden anhörbar, wiederholbar und löschbar machen.
- Bei schlechter Erkennung die verstandene Eingabe bearbeitbar anzeigen.
- Keine Suche unbemerkt starten und keine Nutzereingabe verlieren.
- Datenschutz- und Speicherhinweise nur anzeigen, wenn sie technisch stimmen.
- Fehler in klarer Sprache erklären und einen nächsten Schritt anbieten.

## Umsetzung und Prüfung

Prüfe den bestehenden Ablauf und finde die wichtigste Schwäche. Setze dann die kleinste vollständige Verbesserung um, die Spracheingabe, Texteingabe und Präzisierung der Suche verständlicher macht.

Prüfe die tatsächlichen Abläufe mit:

- einer vollständigen Suche per Sprache
- einer vollständigen Suche per Texteingabe
- einer Suche mit fehlender wichtiger Angabe, etwa RAM-Kapazität
- Bearbeiten und Wechseln zwischen den Eingabearten
- Mikrofonverweigerung und fehlgeschlagener Spracherkennung
- einer vagen Anfrage, bei der keine unnötige Rückfrage gestellt werden sollte

Korrigiere die wichtigste belegte Schwäche, bevor du zusätzliche Funktionen ergänzt. Berichte anschließend knapp, was umgesetzt und tatsächlich geprüft wurde und was noch offen ist.

## Abnahmekriterien

- Nutzer verstehen den Sucheinstieg ohne Erklärung.
- Sprache und Text führen zu derselben klaren Suchabsicht.
- UDI fragt nur nach wirklich wichtigen fehlenden Angaben.
- Vorschläge und Nutzereingaben sind erkennbar und leicht bearbeitbar.
- Die Suchzusammenfassung ist kurz, übersichtlich und verständlich.
- Die Oberfläche wirkt eigenständig und funktioniert auf relevanten Bildschirmgrößen.
- Keine Eingabe geht beim Wechsel, Bearbeiten oder bei Fehlern verloren.

**Oberste Leitlinie:** Aus einer freien Frage wird mit möglichst wenig Aufwand eine gute Suche – und der Nutzer sieht jederzeit, wonach UDI tatsächlich sucht.