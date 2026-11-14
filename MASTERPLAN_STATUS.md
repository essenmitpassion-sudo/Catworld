# Priorisierte Roadmap — 2026-11-14

Verbindlicher Einstieg: AGENTS.md. Frühere Einträge darunter sind historische Abgleiche.
1. P0 Sicherung: offenen Figurenstand und aktuellen Audit verifizieren, committen,
   Bundle prüfen, Push und Remote-SHA bestätigen; kuratierten Build neu erzeugen.
2. P1 Spieltestzugang: Crew-Nahansicht auch im ausgelieferten Paket prüfen,
   Pause/Schliessen/Wiederaufnahme mit echtem Programm sichern.
3. P1 Figuren/Game Feel: Originalcharme erhalten, Reaktionen direkt an eigene
   Stromentscheidungen koppeln; Owner-Bewertung und Überlagerungen beachten.
4. P2 Lernverständlichkeit: freiwilligen Planungs-/Vorhersageanlass prüfen,
   ohne freie Wege durch eine Musterlösung zu ersetzen. Menschliche Daten fehlen.
5. P3 spätere Tiefe: Variablen/Funktionen/kombinierbare Systeme erst bei klarer
   Spielhandlung und begrenzter sicherer Ausführung; kein grosser Neustart.

# Aktueller Abgleich — 2026-11-13

Neuer vollständiger Auftrag: AUTONOMOUS_MASTER_EXECUTION_2026-11-13.md.
Basis tatsächlich geprüft: 438e7aa4, 337 Tests, spielbarer AFTERLIGHT-Build.
Kein Neustart der Architektur. Bestätigte Figurenrichtung erhalten.

| Beobachtetes Problem | Spielerwert / Aufwand / Risiko (V) | Entscheidung und Ergebnis (M) |
|---|---|---|
| Miso bleibt bei versorgter Zuflucht am Kai | hoch / mittel / gering | Reversibler Einzug, Rückweg, vier Posen umgesetzt |
| Figuren werden bei unpassendem Fensterformat verzerrt | mittel / gering / gering | Proportionale Darstellung und gemeinsame Eingabekoordinaten umgesetzt |
| Misos Text behauptet Ankunft während des Hinwegs | mittel / gering / gering | Text folgt sichtbarem Weg und Ankunft |
| Weltentscheidung hat wenig langfristige Tiefe | hoch / hoch / mittel | Keine neue Regel ohne zusammenhängenden Spielnutzen; nächste produktbezogene Prüfung |
| Kleine Figuren/Schilder überlagern sich | mittel / gering / gering | Werkstattschild versetzt; weitere Lesbarkeit im menschlichen Test prüfen |

Verglichene Wege: Bewohnerhandlungen, zusätzliche Kanalentdeckung, reine UI-
Inszenierung. Bewohnerhandlung zuerst: verbindet bestätigte Charakterpriorität
mit bestehender Energieentscheidung ohne neue Syntax oder zusätzliche Währung.
Danach nachgewiesene Resize-/Dialogprobleme behoben. Geprüfte Zwischenstände:
ffc3526 und e34ff35, jeweils Commit/Bundle/Remote. Keine Erfolgsbehauptung über
menschlichen Spielspaß, Langzeitmotivation oder Lerntransfer.

Der folgende ältere Bericht bleibt als historischer Entscheidungsstand erhalten.

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

## Korrektur nach Owner-Rückmeldung — 2026-11-12
Abschnitte 14 und 17 sind noch nicht erfüllt: kein menschlicher Spieltest belegt.
Weitere technische Features hätten diese Lücke nicht geschlossen. Erster Test
jetzt über PLAYER_TEST.md mit Startweg und Beobachtungskriterien vorbereitet.
Keine weitere Mechanik vor dem Test erforderlich. Pareto: zuerst den realen
Zugangs-/Verständnisengpass und freiwillige Neugier beobachten. Kein Anspruch
vollständiger Masterprompt-Erfüllung; Fun/Learning bleiben Hypothesen.

## Owner-Befund und Richtungswechsel — 2026-11-12
O: „super langweilig,..nicht schön“. Kontext: bisheriger Build; konkrete Spielzeit,
Gerät und betrachteter Abschnitt unbekannt. Kein erfundenes Testprotokoll.
Masterprompt vollständig erneut gelesen. Abweichung: viele lineare Aufgaben und
Bedienverbesserungen, wenig Weltentdeckung, Zielkonflikte und visuelle Qualität.
Der Steg ist ein technisches Routenexperiment, keine Lösung dieses Produktbefunds.
Nächster Prototyp: zusammenhängender Bezirk mit umverteilbarer knapper Energie,
Gebäudefunktionen und freier Reihenfolge; neue räumliche Darstellung. Bestehenden
Build erhalten, keine Fortschrittsdaten migrieren oder ersetzen. Details im neuen
Prototypplan. Wirkung auf Spielspass bleibt zu prüfen.

## Konkrete Antwort auf den Befund — AFTERLIGHT
M: separater spielbarer Bezirk umgesetzt, keine sieben Lektionen als Zugang.
Umverteilbare Energie und zwei Gebäude öffnen zwei Wege; Akku erlaubt Ausbau;
Zuflucht bringt Bewohner. Zusammenhängender Zustand zwischen Programmen,
Rücknahme erleichtert Experimente. Neue isometrische Darstellung mit Kanal,
Gebäuden, Gartenwachstum, Licht und Katzen. Alter Build bleibt lauffähig.
M:327 Tests, beide SDL-Abläufe PASS; unabhängige Weltprüfung ohne Softlock.
V: bessere Neugier, visuelle Attraktivität und Spieltiefe. Diese Hypothesen sind
nach dem negativen Owner-Feedback erneut zu testen, nicht als erfüllt zu markieren.
Nicht gelöst: langfristige Automatisierung, Wiederverwendung mehrerer Routinen,
Lerntransfernachweis, abwechslungsreiche spätere Entdeckung.

## Bestätigte visuelle/Charakterrichtung — 2026-11-12
O: Charaktere höchste Priorität, cute/adorable/cool; neue Richtung „ist super“.
Verbindliche Details und erworbenes Wissen: CHARACTER_DIRECTION.md. M:4 Figuren,
Porträts, Nox-Posen, Weltreaktionen und hochwertige Assets tatsächlich eingebaut.
§7 wird über Bewohner, eigene Entscheidungen und sichtbare Bedeutung adressiert,
nicht über Retention-Tricks. Positive Richtung bestätigt; Langzeit-/Lernwirkung offen.
