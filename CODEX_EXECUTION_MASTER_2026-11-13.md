# CATWORLD — EXECUTION MASTER PROMPT · 2026-11-13
## Owner-Auftrag: sichtbar besseres Spiel, hochwertige Grafik, Charaktere, robustes Lernen

**Status:** Arbeitsauftrag für Codex, kein bereits erledigtes Feature und kein automatischer Prozessstart. Bei Konflikten haben tatsächlicher Git-/Teststand, Sicherheitsgrenzen und explizite jüngere Owner-Entscheidungen Vorrang.

### 0. Beginne mit Fakten, nicht mit Wiederholungen
Repo: essenmitpassion-sudo/Catworld; Entwicklungsbranch: `codex/masterplan-run-consistency`; bestätigter Ausgangscommit `a41ab0ae8c5a95606970f08af2e780b54fec0ac7` (13.11.2026). Prüf zuerst aktuellen HEAD, Remote, `git status`, offene PRs, Backups und vorhandene Builds; keine Annahme, dass die genannte SHA weiterhin HEAD ist. Lies `AGENTS.md`, `CURRENT.md`, `NEXT_TASK.md`, `CHARACTER_DIRECTION.md`, `PRODUCT_MASTER_PROMPT.md`, `SAFETY_AND_EXECUTION.md` und relevante Spiel-/Testdateien. Prüfe auch den aktiven Einstieg des AFTERLIGHT-Bezirks und den Legacy-Lernpfad. Unterbreche keine andere laufende Integration; nur ein Core-Writer.

**Nicht erneut implementieren:** Nox/Miso/Lumi/Pixel mit eigenen Sprites/Porträts; Nox Idle/Gang/Blinzeln/Richtung; gemalte Hafenstadt, drei Gebäude; Stromverteilung und veränderte Wege; unmittelbare, nicht-modale Reaktionen auf echte Code-Weltänderungen; 5-s-Anzeige, pausiert während Hilfe; Step/Run, Reset/Rewind, Auswahl-Erhalt. Ausgangsnachweis: 337 Tests PASS, SDL-Smoke und kuratierter Paket-Selbsttest PASS (Repo-Bericht; in deiner Sitzung erneut prüfen). Fehlendes Referenzbild blockiert ausschließlich die originalgetreue Bildanpassung, nicht übrige Verbesserungen. Keine Behauptung einer geprüften Windows-EXE; Workflowzugriff bisher Forbidden. Menschlicher Spaß/Lerntransfer noch unbewiesen.

### 1. Produktmaßstab (entscheidender als Testanzahl)
`Code schreiben → Katze handelt → Welt reagiert sofort → Spieler versteht Ursache → eigener neuer Plan / Entdeckung`. Das Erlebnis muss visuell attraktiv, unmittelbar lesbar und spielerisch eigenständig sein, statt einer Reihe linearer Coding-Lektionen. Maximiere sinnvoll kombinierbare Regeln und echte Wahlmöglichkeiten, nicht neue Syntax oder zusätzliche Dialoge. Beginner ohne Vorkenntnisse und erfahrener Nutzer müssen dieselbe Simulation nutzen können; freiwillige Hilfe und ein schneller freier Zugang. Behalte vorhandene Lernentwürfe und speichere kompatibel.

### 2. Neue Grafikrichtung: priorisierte, konkrete Arbeit
Erhalte die **vom Owner ausdrücklich gelobte** cute/adorable + cool + charismatische Katzenidentität:
- Nox: schwarze Katze, große türkisfarbene Augen, petrolfarbenes Halstuch, Mondanhänger, Ohrschmuck; neugierig/eigenwillig.
- Miso: rund, orange, gemütlich/humorvoll.
- Lumi: cremefarben, mutig/neugierig, eigenständige Tasche.
- Pixel: graulavendel, frech/erfinderisch, technische Accessoires.
Keine simplen Umfärbungen, keine erotische Anthropomorphisierung. **Keine völlig neue Bildserie auf Verdacht**. Verifiziere zuerst Asset-Provenienz, Auflösung, Transparenz, Silhouetten und Lesbarkeit im tatsächlichen Spiel. Falls neue Assets generiert werden können: nur originale, konsistente Dateien mit reproduzierbarer Build-Integration, klarer Dateizuordnung und überprüfter Lizenzlage; sonst bestehende Assets mit besseren Animationen/Kompositionen einsetzen.

Nächster Grafik-Pass: sichtbare Posen/Reaktionen (z.B. Ohren, Schwanz, Gesichtsausdruck) genau bei Codewirkung; einheitliche Größen/Anker/Perspektive; subtile Lighting-/Emissive- und Wetter-/Ambient-Details, kein grelles Dauerblinken. Die Wichtigkeit ist nicht Effektanzahl, sondern Ausdruck, sofortige Ursache/Wirkung, Lesbarkeit. Reaktionskarte und Spielwelt bei kleinen Fenstern/DPI/Resize prüfen; weder Editor noch Aktionsbuttons, Zielkacheln, Syntaxzeile oder Figuren verdecken. Kontraste und visuelle Alternativen zu Farbe sicherstellen; Option zur Reduktion von Bewegung prüfen, wenn verhältnismäßig. Keine unnötigen GPU-Anforderungen, keine großen Assets ohne Lade-/Performance-Prüfung.

### 3. Nächster spielbarer Loop (Pareto)
Wähle **genau ein** vertikales, innerhalb des aktuellen Bezirks testbares Inkrement:
A) Ein Bewohner zeigt eine **klar erkennbare, reversible** Emotion/Handlung, wenn der Spieler per Code zwischen zwei konkurrierenden Stromnutzungen wählt. Spieler erhält verständliche Rückmeldung zu Verzicht/Konsequenz, nicht bloß Pluspunkte oder kosmetische Farbwechsel.
B) Eine kleine optionale Entdeckung auf einer vorhandenen Route, die mit bekanntem Code auf mindestens zwei sinnvolle Arten erreichbar ist, eine Figur überrascht und zum weiteren Experimentieren anregt.
C) Eine bessere sichtbare Step/Run-Inszenierung (laufende Codezeile ↔ Katzenhandlung ↔ Weltzustand ↔ kurze Reaktion), falls ein realer UI-/Verständnisfehler den Loop derzeit blockiert.
Vergleiche die drei Optionen kritisch nach Spielerwert, visuellem Wow, Lerntransfer, Aufwand, Risiko und echter Entscheidung; wähle selbst die beste, **baue sie**, überprüfe zwei unterschiedliche Lösungen und eine plausible Fehlstrategie. Bei unklarem Nutzen nimm die kleinste saubere Option. Keine weiteren linearen Missionen, kein Questmassensystem, kein Stadt-/Engine-Rewrite, kein Meta-Grind.

### 4. Selbstkritischer Red-Team-Katalog vor Abnahme
Prüfe und repariere nach Priorität tatsächliche Repros, nicht nur hypothetische Listen:
1. Ausführen: Step einmal = eine Aktion, Run pausiert/fährt korrekt fort, Stop/Reset/Rewind konsistent; keine doppelte Ereignisreaktion, kein stale UI nach Reset, keine falsche Erfolgsmeldung durch Replay.
2. Interaktion: überlappende Sprechkarten, Hilfe, Charakterporträt, Editor, Buttons; Resize, niedrige Fenstergrößen, lange Texte und Syntaxfehler; Tastaturfokus, Scroll, Cursor, Undo/Redo und Shortcuts.
3. Simulation: deterministische Energieregeln/Transitions, verständliche Beschränkungen, keine dominante triviale Strategie; Randpositionen, unlösbare Aufgaben, falsche Befehle und Versuchsrücksetzung.
4. Sicherheit: Spielercode niemals via unbeschränktem `exec`/`eval`; AST-Allowlist/Limits, negative und extrem lange Eingaben, Schleifen-/Aktions-/Zeit-/Speichergrenzen, keine Imports/Datei/Netz/Prozessausführung. Kein „vollständiges Python“ behaupten.
5. Daten: persönliche Entwürfe niemals löschen/überschreiben; atomare Saves/Backup, korrupte Dateien, Schreibfehler, getrennte Test-Daten und Migration; Packaging ohne `.env`, private Daten, Git-Objekte oder Cache.
6. Assets/Performance: fehlende/defekte Grafik, Alpha-Halos, Flickern, Kanten, Ankerpunktwechsel, Bild-Cache, Framezeit, hohe DPI; klare Fallbacks statt Crash.
7. Distribution: Linux offscreen-SDL ist kein echter Windows-Test. Windows-BAT/Workflow/EXE nur bei nachgewiesenen Runs als grün markieren; andernfalls spielbares ZIP mit verständlichem Start bereitstellen.

### 5. Durchführung ohne Blockaden
- Beginne mit einem kurzen, nachweisbaren Vorher-Check und zwei bis fünf **konkreten** Defiziten, die du selbst reproduziert hast. Nicht tagelang beraten.
- Formuliere 2–3 Optionen, entscheide dich, erstelle maximal einen schlanken vertikalen Slice; prefer RED→GREEN→Refactor, danach integrierter SDL-Smoke, Screenshotvergleich, Paket-Selbsttest, frischer Paketstart.
- Spiele selbst eine zusammenhängende Strecke: Einstieg → eigener Code → Veränderung → Bewohnerreaktion → alternative Lösung → Reset/Rewind → Fehler → Neustart/Entwurferhalt. Erfasse tatsächliche Beobachtungen. Human Fun/Learning = **ungetestet**, bis echte Spieler es bestätigen.
- Unabhängiger Reviewer nur für klar getrennte Analyse/Testarbeit ohne parallele Kern-Schreibrechte. Keine Agenten-Koordination als Selbstzweck.
- Bei Limit-/Kontextsignalen **sofort** feature freeze, alles inklusive neuer untracked Grafiken prüfen und sichern: Commit, Remote-SHA-Verifikation, überprüftes Git-Bundle/Archiv und Build mit Manifest/Hashes; falls GitHub 403: LOCAL_ONLY eindeutig dokumentieren, kein Force-Push, niemals ungesichert abbrechen. `CURRENT.md` und `NEXT_TASK.md` mit exaktem Wiederaufnahmepunkt aktualisieren.
- Ein erfolgreicher Checkpoint ist innerhalb einer aktiven Arbeitssitzung kein Grund, vorzeitig aufzuhören: nächstes kleines, gedecktes Inkrement wählen. Keine Behauptung autonomer Hintergrundarbeit nach Sitzungsende.

### 6. Abnahmekriterien für das nächste Paket
1. Mindestens eine für Spieler **sichtbare** Verbesserung mit Vorher-/Nachher-Beleg, keine bloße Refaktorierung oder Konzepterweiterung.
2. Eine neue bedeutsame Handlungswahl oder klar besseres Code→Welt-Feedback; **kein Duplikat** vorhandener Reaktionen.
3. Figuren, Rückmeldungen und Code-UI bleiben bei getesteten Fenstergrößen lesbar und anklickbar; Prüfgröße und Nachweis nennen.
4. Bestehende Tests bleiben grün, passende neue Regressionstests und tatsächlicher SDL-Spielablauf grün; entpacktes Paket erfolgreich.
5. Eigene Skripte/Saves bleiben erhalten; Git/Build/Assets vollständig gesichert und Remote bzw. LOCAL_ONLY ehrlich dokumentiert.
6. Keine EXE-, Spaß-, Lern-, Performance- oder Spielbarkeitsbehauptung ohne passende Prüfung.

**Ausgabe an Owner:** Kurz auf Deutsch: Was war konkret schlecht? Was ist jetzt spürbar besser? Welche Datei/Feature? Welche Prüfungen mit Zahlen? Wo ist der echte spielbare Build? Commit/Remote-SHA? Bekannte Grenzen? Eine nächste aktive Priorität. Vermeide lange Selbstlob- und Governance-Berichte.

**Oberste Anweisung:** Ein schönes Katzen-Spiel ist noch kein gutes Coding-Spiel. Ein technisch korrektes Coding-Spiel ist noch kein spannendes Spiel. Verbinde **ausdrucksstarke Figuren, echten Code, echte Entscheidung, spürbare Weltwirkung** und verständliches Lernen in einem spielbaren, gesicherten Ergebnis.