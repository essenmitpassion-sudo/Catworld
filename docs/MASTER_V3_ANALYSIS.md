# Master V3 – schrittweise Analyse und ausführbare Konsequenzen

16.11.2026. Quelle: directives/MASTER_V3.md plus aktuelles Verständnis-/Kontinuitätsprotokoll. Jüngste Klarstellung: VERSATZ wird ersetzt. Diese Analyse ist noch kein Konzept und kein spielbarer Meilenstein.

## 1. Mission und Verantwortung → R1

Das Ergebnis soll ein gutes kleines Strategiespiel sein. Umfang ist kein Erfolgskriterium. Einfache Regeln müssen Abwägungen und überraschende Wechselwirkungen erzeugen. Handlung: ein zentrales Prinzip und einen vollständigen Entscheidungsloop festlegen. Nachweis: gespielte konkrete Situationen; Verständlichkeit, Spannung und Wiederholungswunsch brauchen menschliche Bewertung.

## 2. Anforderungen verstehen → R8, R10

Vor Änderungen Original, Repository, Projektinformationen, Tests und verfügbare Erfahrungen lesen. Handlung: Original erhalten, alle Forderungen in REQUIREMENTS.md auf überprüfbare Bedingungen abbilden und Status in PROJECT_STATE.md zusammenfassen. Nachweis: reale Dateien/Git-Ausgaben, keine bloße Rückerzählung. Erfassung ist umgesetzt; Produktanforderungen bleiben offen.

## 3. Catworld ersetzen → R8, R9

Ersatz ist ausdrücklich erlaubt, aber nur nach vollständiger separater Sicherung und Remote-Bestätigung. Handlung: Identität/Änderungen prüfen, Original und unmittelbaren Vorgänger archivieren, Entwicklungsbranch nutzen, Historie erhalten. Nachweis: zwei gepushte Archiv-Refs mit exakten SHA-Readbacks. Vorhandene lokale unveröffentlichte Arbeit wurde im frischen Clone nicht vorgefunden. Sicherungsbedingung erfüllt; neue Produktdateien noch nicht geschrieben.

## 4. Reverse Engineering und Entscheidung → R2

Wirkung statt Oberfläche übernehmen: RimWorld interagierende Systeme/Geschichten; Factorio Rückkopplung/Optimierung; Into the Breach kompakte überschaubare Folgen; Balatro Kombinationen; Slay the Spire Risiko/Synergien; Noita konsistente experimentierbare Regeln; Farmer Beobachtung und Verbesserung selbstlaufender Systeme. Das verpflichtet nicht dazu, alle Mechaniken zu verbauen.

Handlung: drei wirklich verschiedene Kernideen entwickeln, nach allen sieben Kriterien vergleichen, selbstständig eine auswählen. Projekterfahrungen übersetzen in: Technik nicht mit Spielgefühl verwechseln; Langeweile trotz vollständigem Loop prüfen; kleine sichere Schritte; Wechselwirkungen statt Regelmenge; keine Prozessüberlastung. Tatsächlich gelesene VERSATZ-/SOG-/SIGNALBRUCH-Berichte zeigen zusätzlich Risiken abstrakter Einstiege, kurzer dominanter Rennen und irreführender Bot-Balance. Keine menschlichen Tests daraus erfinden. Auswahl offen.

## 5. Tiefe statt Feature-Menge → R4

Jede Kernaktion braucht Nutzen, Kosten/Nachteil, sichtbaren Effekt, Regelwechselwirkung und Einfluss auf später. Handlung: dies für jede Aktion in einer Zeile beschreiben und an kontrastierenden Stellungen prüfen. Nachweis: unterschiedliche sinnvolle Entscheidungen, Gegenstrategien, kontrollierbare Kettenreaktionen. Varianten/Statistiken allein beweisen weder Tiefe noch Wiederspielwert. Spannung und Erholung bewusst prüfen; unnötige Mechaniken entfernen.

## 6. P0 Micro-Run zuerst → R3

Neun Pflichtteile: begrenzte Welt, klare Ausgangslage, origineller Kern, 1–3 Aktionen, Druck, Ursache/Wirkung, Sieg, Niederlage, Neustart; verständliche Bedienung integriert. Handlung: kleinsten vollständigen neuen Ablauf implementieren und im gebauten Spiel bedienen. Ziele 60–120 Sekunden bis zum Entscheidungszyklus, 3–8 Minuten pro früher Partie sind Richtwerte. Nachweis: vollständiger praktischer Loop und gemessene Dauer, keine bloße Simulation. Neue P0-Prüfung offen.

## 7. Game Feel und Identität → R5

Darstellung muss die Mechanik sichtbar machen: klare Formen, konsistente Symbole/Farben, räumliche Beziehungen, unmittelbares Feedback und hilfreiche Bewegung. Handlung: eine eigene visuelle Idee am Kern ausrichten, tatsächliche Darstellung ansehen und Eingabereaktionen prüfen. Nachweis: Bilder plus reale Bedienung; technische Geometrie allein beweist keine Attraktivität. Grafikproduktion folgt einem überzeugenden Kern.

## 8. Technik dient dem Spiel → R6

Engine/Stack sind frei nach Bedarf. Handlung: Regeln von Darstellung trennen, Zustandsübergänge testbar halten, reproduzierbare Starts nutzen, Eingaben robust behandeln. Wenige Abhängigkeiten, keine spekulative Architektur. Vorhandenes JS/esbuild kann Aufwand sparen, ist aber noch keine Konzeptentscheidung. Kein Pflicht-KI-System, Backend, Mehrspieler oder Frameworkwechsel aus dem Prompt ableitbar.

## 9. Kontinuierliche Verbesserung → R6

Nach funktionierendem Schritt: wichtigste belegte Schwäche benennen, Hypothese formulieren, klein ändern, vorher/nachher und Regression prüfen, nur nachvollziehbare Verbesserung behalten, sichern. Handlung: technische, strategische, visuelle und menschliche Ergebnisse separat protokollieren. Nachweis: reproduzierbarer Vergleich mit benannten Grenzen. Grüne Tests beweisen keinen Spielspaß.

## 10. Autonomie → R7

Der Nutzer delegiert sichere reversible Entscheidungen und autorisierte Git-Aktionen. Handlung: ohne gewöhnliche Wartefreigaben arbeiten; bei lokalem Fehler sichere unabhängige Aufgabe bearbeiten. Stopps nur bei echten Berechtigungs-/Sicherheitsblockern oder Ausführungsgrenzen. Die jüngste Bitte verlangt zunächst diese schrittweise Analyse; keine zusätzliche Konzeptfreigabe daraus ableiten. Keine nicht eingerichtete Hintergrundfortsetzung behaupten.

## 11. Kontinuität und Sicherung → R8, R10

Handlung: PROJECT_STATE.md enthält VISION, IMPLEMENTATION, VERIFICATION, GIT, NEXT; REQUIREMENTS.md wird nach jedem funktionierenden Schritt gepflegt. Reale Commits, autorisierte Pushes mit Readback, eindeutiger nächster Schritt. Neue Sitzung liest diese Dateien und prüft Code/Git statt Gespräch zu erraten. Noch nicht gepushte Änderungen niemals als remote gesichert ausgeben.

## 12. Qualitätsgates → R3, R4, R5, R6

P0 spielbar; P1 strategisch interessant; P2 eigenständig/fesselnd; P3 robust/produktreif. Handlung: jedes Gate mit eigener Evidenz bewerten; bei Fehlschlag die konkrete wichtigste Schwäche beheben. Ein P0-Build ist weder bestandene UI-Prüfung noch ein P1-/P2-Beweis. Alle neuen Gates offen.

## 13. Ausführungsreihenfolge → R2–R10

A Bestandsaufnahme/Anforderungen → B Sicherung → C drei Konzepte/eine Wahl → D vollständiger Kern → E praktische Partie → F größte Schwäche verbessern → G Tests/Commit/Push/Status → H nächste Priorität. A/B weitgehend ausgeführt; die aktuelle Analyse schließt die Anforderungserfassung ab. C–H für das neue Spiel offen. Abgeschlossene Archivierung nicht grundlos wiederholen; Konzeptwahl einmal gezielt durchführen.

## 14. Selbstcheck → R1–R10

Handlung: tatsächliche Spielbarkeit, Verständnis, Entscheidungen, Ursache/Wirkung, USP, bearbeitete Schwäche, korrekte Nachweise, alte/neue Sicherung und Fortsetzbarkeit prüfen. Nachweis: Matrix gegen Original, Code, Tests und Status vergleichen. Abschließender Bericht nennt Ergebnisse, Grenzen, gesicherten Commit und nächste Priorität. Kein pauschales „fertig“.

## Ergänzendes verbindliches Protokoll

Die sechs Tabellenspalten und fünf Statuswerte sind verbindlich. Codeexistenz reicht nur für IMPLEMENTED, nicht VERIFIED. VERIFIED setzt die jeweils relevante nachgewiesene Wirkung voraus. A/P/H unterscheiden. Nach jedem Meilenstein Original → Matrix → Code → Testergebnis → Status abgleichen; wichtigste Abweichung zuerst beheben. Kleine nützliche Automatisierung ist erlaubt, großes Prüf-Framework ohne Produktnutzen nicht. Am Ende keine offene Anforderung verschweigen.

## Konflikte und Entscheidungen

1. Alte AGENTS.md und CURRENT.md verlangten VERSATZ-Fortsetzung. Die aktuelle ausdrückliche Nutzerkorrektur hat Vorrang. AGENTS wird berichtigt; historische Produktnachweise gelten nur für den Vorgänger.
2. „Neues Spiel“ bedeutet nicht neue Technik um ihrer selbst willen. Technische Infrastruktur darf wiederverwendet werden, das verworfene Spielprinzip nicht.
3. Autonomie hebt die Sicherungsbedingung nicht auf. Beide Archivierungen sind vor Produktersatz erfüllt.
4. Vollständige abstrakte Gameplay-Loops und Botquoten früherer Spiele sind kein Qualitätsbeweis für den neuen Kern.
5. Menschlicher Spielspaß, Einstieg und Wiederholungswunsch bleiben bis zu realen menschlichen Tests offen; keine künstliche VERIFIED-Markierung.

## Nächste konkrete Aufgabe

Drei neue Kernideen in einem kurzen Vergleich bewerten und genau eine wählen. Dann direkt den vollständigen Micro-Run bauen. Keine weitere Untersuchung von VERSATZ-Remis als Fortsetzungsaufgabe.
