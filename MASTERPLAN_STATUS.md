# Masterplan — Bestandsaufnahme und Arbeitsentscheidungen

Stand: 2026-11-10. Auftrag: als verantwortlicher Lead den vollständigen Plan lesen,
vorhandene Arbeit prüfen, Entscheidungen treffen und eine kleine Verbesserung liefern.
Quelle: `PRODUCT_MASTER_PROMPT.md`, identisch mit dem heute hochgeladenen Text.
Ausgangscommit: `7175190acf5dec4c84bf00d1a1d22f36acb4c1d2`, am Remote bestätigt.
M = selbst gemessen/geprüft; G = aus bestehenden Unterlagen; V = Hypothese.

## Produktvision
Mit eigenem Code bringt der Spieler eine dunkle Katzenstadt zum Leben. Neue
Programmierfähigkeiten öffnen neue Handlungsmöglichkeiten: Wege planen, Systeme
verstehen, Fehler finden und später selbst gebaute Abläufe kombinieren. Sichtbare
Wirkung und eigene Ideen tragen das Spiel; Aufgabenabschluss allein beweist kein Lernen.

## Was tatsächlich schon vorhanden ist
M: 199 Tests am Ausgangsstand bestanden. Python/pygame-Desktopspiel, offline;
kein Webprojekt. Unveränderliche Weltzustände und deterministische Übergänge in
`core/world.py`; begrenzter AST-Interpreter in `code/runner.py`; Inhalte/Hilfen in
`content/levels.py`; Oberfläche in `ui/app.py`; Speicherung in `ui/drafts.py`.

| Teil des Masterplans | Nachweisbarer Stand | Fehlender Nachweis / nächste Lücke |
|---|---|---|
| §§1–4 Vision, Game First, kreative Mechaniken | G: Vision und drei Richtungen bereits in PRODUCT.md; M: eigene Programme verändern sichtbar Licht und Position | V: eigenständiger langfristiger Spielreiz; bisher schmaler, eindimensionaler Spielraum |
| §§5–6 Anfänger und echte Fähigkeiten | M: Aufrufe, Sequenzen, Schleifen; Transfer, leerer Abrufeditor und freiwillige Hilfen | Bedingungen, Variablen, Funktionen, Datenstrukturen und Prüfung fremden Codes noch nicht implementiert |
| §§7–8 Motivation und Schwierigkeit | M: freie Laternenreihenfolge, Rückwege, freiwilliger Heimweg; keine Zwangs-Streaks | Menschliche Flow-/Motivationsdaten und langfristige Meisterschaft fehlen |
| §9 kombinierbare Spielsysteme | M: gemeinsame Weltregeln für Bewegung und Batterie/Licht, parametrisierte Ziele | Szenariowechsel und mehrere Ziele noch von UI-Sonderfällen abhängig |
| §10 UI und Codeverständnis | M: Run/Step/Stop/Reset, Fehlerzeile, Schleifenfortschritt, Undo/Redo, Entwürfe | Inkonsistente neue Versuche im Einstieg in dieser Runde reproduziert; Tastatur-/DPI-Test auf Windows offen |
| §11 visuelle Identität | M: schwarze Pixelkatze, Neon-Gasse, Bewegung und sichtbare Lichtzustände | Keine menschliche Bewertung des Game Feel; Soundausbau nachrangig |
| §§12–13 Architektur und Ausführung | M: getrennte Simulation/Interpreter/Inhalte; kein exec/eval von Spielercode; begrenzte Aktionen und Syntax | Kein allgemeiner Python-Sandbox-Nachweis; beliebiges Python erfordert tatsächliche Isolation |
| §14 Qualität | M: vorhandene Suite in dieser Sitzung erneut ausgeführt | Automatisierte Funktion ist kein Beweis für Spielspass oder Lerntransfer |
| §§15–16 Autonomie und Priorität | M: vorhandene Arbeit gesichert; kleines reversibles Paket auf separatem Branch | Kein aktivierter autonomer Hintergrundprozess |
| §§17–18 Validierung und Umsetzung | G: Spieltestablauf in README; M: konkrete Neustartfehler reproduziert | Menschliche Tests durchführen; Ergebnisse offen dokumentieren |

## Drei Richtungen und Entscheidung
Die folgende Einschätzung ist V, keine erhobene Spielerpräferenz. Hohe Machbarkeit
bedeutet geringeren erwarteten Umbauaufwand, nicht bereits bewiesene Skalierbarkeit.

| Richtung | Spielspass / Langzeitmotivation | Lerntransfer | Originalität | Erweiterbarkeit | Machbarkeit |
|---|---|---|---|---|---|
| A: Nox verbindet Geräte und plant freie Hin-/Rückwege | Direkte Wirkung; langfristig Gefahr repetitiver Strecken | Gut für Planen, Schleifen und Debugging | Mittel | Neue Regeln kombinierbar; UI-Sonderfälle begrenzen | Hoch, bestehende Systeme nutzen |
| B: Eine lebendige Werkstatt mit unterschiedlichen Gerätefunktionen und knappen Ressourcen | Echte Zielkonflikte und eigene Automatisierungen; Balance offen | Hoch für Zustand, Bedingungen, Tests und Funktionen | Mittel bis hoch | Stark, wenn wenige Regeln kombinierbar bleiben | Mittel; neue Weltregeln nötig |
| C: Spieler programmieren lokale Weltregeln und bauen eigene Herausforderungen | Sehr viel Freiheit; hohe Einstiegshürde | Potenziell hoch für Schnittstellen und Systemdenken | Hoch | Sehr hoch, aber schwer fair zu validieren | Niedrig im jetzigen Stand |

Entscheidung: A zuverlässig und verständlich machen, anschließend genau eine
Mechanik aus B prüfen. Beispiel: Ein Gerät öffnet einen Weg, ein anderes versorgt
einen Verbraucher; der Spieler entscheidet, was er wann aktiviert. Unterschiedliche
Lichtfarben allein reichen nicht. C bleibt langfristiges Experiment. Kein Rebuild.

Überprüfbare USP-Hypothesen:
1. Eigener Code verändert eine zusammenhängende Welt so sichtbar, dass Spieler
   freiwillig eine zweite Lösung ausprobieren. Prüfen durch freie Nachspielphase.
2. Step und Lichtzustände helfen Anfängern, einen bisher unbekannten Fehler selbst
   zu erklären. Prüfen durch neue Fehlersituation ohne vorgezeigte Lösung.
3. Eigene Programme werden als persönliche Werkzeuge weiterverwendet. Prüfen durch
   Rückkehr zu einer gespeicherten Lösung unter geänderten Bedingungen.

## Referenzen als Designprüfung
G: `REFERENCE_ANALYSIS.md` behandelt bisher vor allem The Farmer Was Replaced.
Die folgenden Einordnungen beruhen auf allgemeinem Designwissen, nicht auf neuen
Hands-on-Tests oder einer aktuellen Marktstudie. Stärken und Risiken sind Hinweise
für unsere Prototypen, keine gemessene Überlegenheit gegenüber diesen Spielen.

| Referenz | Nützliche Stärke | Risiko für unseren Anfängerpfad / Konsequenz |
|---|---|---|
| The Farmer Was Replaced | Programmierung erzeugt wachsende Automatisierung | Wiederholung kann Arbeit werden; neue Entscheidungen statt Ertragsgrind |
| Human Resource Machine | Konkrete Darstellung abstrakter Abläufe | Modelltransfer zu Python braucht explizite Brücken |
| 7 Billion Humans | Viele Akteure machen einfache Regeln überraschend | Gleichzeitigkeit erst nach sicherem Verständnis einzelner Abläufe |
| SHENZHEN I/O | Systeme aus begrenzten Bausteinen, offene Optimierung | Dichte Dokumentation und Technik-Einstieg für Anfänger reduzieren |
| TIS-100 | Lokale Programme und Schnittstellen erzeugen Tiefe | Kommunikations-/Syntaxlast nicht in den ersten Minuten |
| Baba Is You | Regeln selbst werden erforschbar und veränderbar | Regelrätsel allein lehren kein Python; Transfer gesondert prüfen |
| Autonauts | Selbst gebaute Routinen verändern eine sichtbare Welt | Automatisierung muss Denken fördern; Umfang nicht durch Arbeit strecken |
| Zachtronics allgemein | Mehrere Lösungen und freiwillige Optimierung | Keine Pflicht zur kürzesten Lösung, keine Ranglisten als Lernnachweis |

## Lern- und Systempfad
1. Bestehend: Sequenzen → verändertes Ziel → selbst rekonstruieren → Schleifen →
   veränderte Distanz → Teilziele kombinieren → eigene Rückwege. Frühere Begriffe
   später erneut abrufen; nicht jedes neue Gebiet führt Syntax ein.
2. Nächster Ausbau: ein sichtbarer Sensor und eine Bedingung an einem veränderlichen
   Hindernis. Erst die Weltentscheidung belegen, dann minimale Syntax hinzufügen.
3. Variablen und Funktionen: wirklicher veränderlicher Zustand und wiederkehrende
   Teilaufträge motivieren Speicher und Wiederverwendung. Step zeigt Werte.
4. Datenstrukturen, Schnittstellen und Tests: mehrere Aufträge, eigene Routinen,
   reproduzierbare Störungen; erfolgreiche Lösung an unbekannter Variation prüfen.
5. Später: fremden und KI-generierten Code vorhersagen, testen und korrigieren.
   KI optional; eigenständige Lösung und Erklärung bleiben überprüfbar.

Scaffolding: Beobachtung → Denkhinweis → ausdrücklich angefordertes Beispiel.
Retrieval/Spacing: bekannte Regel nach einer anderen Aufgabe wieder selbst anwenden.
Mastery: Verhalten erklären und auf eine Variation übertragen; keine reine Punktehürde.
Zeitbänder aus LONG_TERM_DESIGN.md sind Hypothesen, keine garantierte Spieldauer.

## Architekturstrategie und Roadmap
P0 diese Runde: neue Run-/Step-Versuche vereinheitlichen; dieselbe Lösung darf
beim zweiten Start nicht wegen des vorherigen Erfolgs scheitern. Nachweis:
Tests vor/nach Änderung, SDL-Ereignis-Smoke, unveränderter Spielercode/Undo.

P1: kurzen unabhängigen Anfänger-/Fortgeschrittenentest des vorhandenen Abschnitts
durchführen. Beobachten: erste selbst bewirkte Weltänderung, falsche Vorhersagen,
verwendete Hilfestufe, Korrektur eines neuen Fehlers, freiwillige zweite Lösung.
Keine starre Zeitgrenze als Bestehensregel; jedes Ergebnis als Beobachtung erfassen.
Clarity = Bedienung verstanden; Learning = neue Situation erklärt/gelöst;
Creativity = eigenständige Alternative; Fun = geäusserte und beobachtete Motivation.

P2: vorhandene Sonderfälle vor der nächsten Weltmechanik begrenzen. `app.py` hat
822 Zeilen am Ausgangsstand und verwaltet mehrere Modusflags. Nur den tatsächlich
benötigten Szenariozustand/Wechsel isolieren, bestehende Save-Daten und Entwürfe
erhalten. Keine ECS-, Eventbus- oder Stadt-Neuarchitektur auf Vorrat.

P3: ein kleiner Werkstatt-Prototyp mit zwei funktional unterschiedlichen Wirkungen,
zwei gültigen Strategien und einer Transferaufgabe. Depth = vorhandene Regeln
kombinieren sich nachvollziehbar; Progression = Herausforderung ohne bloss längeren
Code. Verwerfen, wenn eine dominante triviale Lösung alle Entscheidungen beseitigt.

P4: robustes Wiederverwenden eigener Programme, Tests/Diagnostik und spätere offene
Spielsysteme. Erst dann breitere Inhalte, Sound und visuelle Verfeinerung.
Scalability = nächste Inhaltsvariante ohne neue Renderer-/Runner-Sonderfälle;
Reliability = reproduzierbare Ausführung, Stop/Reset und intakte Speicherung.

Keine gegenwärtige Zusage für Multiplayer, echte beliebige Python-Ausführung,
automatische Levelgenerierung oder eine vollständige Stadt. Der nächste technische
Arbeitsstand und die ausgeführten Checks stehen in CURRENT.md, nicht als Prognose hier.

## Pareto-Abgleich 2026-11-12
Werkstatt, veränderter Startzustand und begrenzter Sensor/if bauen auf einem kleinen
Regelsatz auf: Code verändert den Zugang, liest Zustand und passt das Verhalten an.
Erkenntnis: Bedienkorrekturen waren sinnvoll, dürfen aber nicht den Spielausbau
ersetzen. Noch zu schmal: eindimensionaler Weg, vorgegebene Hauptziele, keine echte
Ressourcenwahl. Die neue Syntax allein ist kein Beleg für langfristige Spieltiefe.
Nächster kleiner Hebel: Nichtausführung eines if-Zweigs unmittelbar am eigenen Code
zeigen; dann vorhandene Systeme auf einen echten Zielkonflikt prüfen, statt weitere
Streckenlängen oder kosmetische Geräte als Innovation zu zählen. Kein kompletter
Rebuild ohne Befund. Hypothesen weiter offen: Verständnis ohne Beispiel, freiwillige
zweite Lösung, selbstständiger Transfer und Freude am erneuten Spielen.
