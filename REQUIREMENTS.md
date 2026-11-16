# PROJECT UNCHARTED V5 · Anforderungen
Initial einmal vollständig gegen MASTER_V5 §§1–20 abgeglichen, 16.11.2026. Status: OPEN, IN_PROGRESS, IMPLEMENTED, VERIFIED, BLOCKED. Evidenz wird gezielt nach Meilensteinen aktualisiert. Menschlicher Erlebnisnachweis separat offen.

| ID | Priorität | Akzeptanzkriterium | Abhängigkeit | Status | Nachweis |
|---|---|---|---|---|---|
| R1.1 | P0 | Fantasie, Handlung, Strategie als eigenständiger spielbarer Zusammenhang | R4.2,R7.1 | IMPLEMENTED | Spielbarer Zusammenhang; Browser-Sieg/Verlust, DESIGN und docs/evidence |
| R1.2 | P1 | Verschiedene sinnvolle Spielweisen und systemische Folgen | R7.1 | IMPLEMENTED | Planend mit/ohne Eilen gewinnt 12/12 bzw. 10/12; Langzeitwirkung offen |
| R1.3 | P2 | Langfristige Faszination und Wiederholung durch Menschen | R8.4 | OPEN | Keine Testpersonen |
| R2.1 | P0 | V5 alleinige Direktive; alte Produktziele historisch | — | VERIFIED | MASTER_V5 gesichert; AGENTS/Status/Design ersetzt |
| R2.2 | P0 | Nur REQUIREMENTS/PROJECT_STATE aktiv planen; keine alten Issues | R2.1 | VERIFIED | IMPLEMENTATION historisch; keine Issues übernommen |
| R2.3 | P0 | Technische Regeln/fremde Daten respektieren | — | VERIFIED | Technische AGENTS-Regeln bewahrt, Hosting unverändert, keine fremden Daten entfernt |
| R3.1 | P0 | Identität/Branch/HEAD/Remote/Arbeitsbaum prüfen | — | VERIFIED | git status/remote/ls-remote, Ausgang 09ef38f |
| R3.2 | P0 | Archivbranches/Tag mit SHA erreichbar/wiederherstellbar | R3.1 | VERIFIED | ls-remote und gefetchte Bäume; PROJECT_STATE GIT |
| R3.3 | P0 | Bundle sofern vorhanden prüfen, sonst Nichtverfügbarkeit melden | R3.1 | VERIFIED | Suche /workspace und /tmp ohne .bundle |
| R3.4 | P0 | KIPPWERK vor Ersatz sichern, auf geeignetem development/uncharted | R3.2 | VERIFIED | 09ef38f remote und lokaler Archivbranch |
| R3.5 | P0 | Funktionierende Commits/Push/SHA-Readback ohne Force | R8.1 | VERIFIED | 10f5c1f und 525c2c8 gepusht/per ls-remote bestätigt, Archive unverändert, kein Force |
| R4.1 | P0 | Referenzprinzipien/Belege/Berichte unterscheiden | — | VERIFIED | DESIGN; Catworld DECISION gelesen, V4 9 Tests neu |
| R4.2 | P0 | 3 radikal andere Konzepte nach 8 Kriterien, selbst wählen | R4.1 | VERIFIED | DESIGN Vergleichsmatrix |
| R4.3 | P0 | Originalitätsfilter und KIPPWERK tatsächlich verwerfen | R4.2 | VERIFIED | Körper/Schutz/Familien statt Netz oder Raster |
| R5.1 | P0 | Nutzen/Kosten/Zukunftsfolgen zentraler Aktionen | R7.1 | VERIFIED | Atemkosten/Schutz/Umwege/Wegkonflikte im Engine- und Browserlauf |
| R5.2 | P1 | Gegenstrategien/Erholung/kein trivialer Universalplan | R5.1 | IN_PROGRESS | 60 Läufe; triviales Geradeaus verliert, Eilen nur 5/12; universelle Strategie nicht ausgeschlossen |
| R5.3 | P2 | Variierende reproduzierbare Partien ohne Grind | R7.2 | VERIFIED | Seed-Replay 40 Testläufe; 12 verschiedene Karten, keine Metawährungen |
| R6.1 | P0 | Bewusste Komposition/Material/Farbe/Typografie; Welt statt Dashboard | R4.2 | VERIFIED | Tatsächliche Screenshotprüfung; docs/evidence, subjektives Autorenurteil |
| R6.2 | P0 | Unmittelbares Feedback, lesbare Vorschau/Folgen | R7.1 | VERIFIED | Reale Bewegung/Feedback; Ankunftsfolge und Warnfarbe rot→grün im Browser |
| R6.3 | P0 | Tatsächliche Bildprüfung mehrerer Zustände/kleiner Fenster | R6.1,R7.1 | VERIFIED | 320/390/768/1440; Einstieg/Mitte/Sieg/390/1440 angesehen |
| R6.4 | P3 | Tastatur/Touch/reduzierte Bewegung; nicht nur Farbe | R6.2 | IMPLEMENTED | Maus/Tastatur, native Regler, Touch-Emulation, reduzierte und volle Animation; kein Hardwaretest |
| R7.1 | P0 | Welt/Einstieg/Handlung/Konflikt/Druck/kompletter Loop/Sieg/Verlust/Neustart | R4.3 | VERIFIED | Chromium Sieg17/9Tiden, Verlust0/6, Neustarts, sichtbare Welt/Handlung/Druck |
| R7.2 | P0 | Zustand/Regeln/Render/Input getrennt, robuste deterministische Übergänge | R7.1 | VERIFIED | engine/scene/main getrennt; 14 Tests +40Seeds; volle Browserzustände verglichen |
| R7.3 | P0 | Einfach ausführbares Produkt/Standalone ohne Laufzeitnetz | R7.2 | VERIFIED | npm build/dev; play/SAUM.html, identische Datei HTTP/offline; file:// administrativ blockiert |
| R8.1 | P0 | Gezielte Regeln/Input/Neustart/Regression automatisch | R7.2 | VERIFIED | 14 Regeltests, Input/Feedback/Layout/Touch-Regressionen; Wiederholung nach Reviewfixes |
| R8.2 | P0 | Wirklich starten, ganzer Loop mit Erfolg/Verlust praktisch | R7.3 | VERIFIED | Vollständiger neuer Chromium-Sieg/Verlust/Neustart und Animation; docs/evidence/verification.json |
| R8.3 | P1 | Reproduzierbare adversariale Strategie/Exploitstichprobe | R8.1 | IMPLEMENTED | 60 Strategiepartien/5 Politiken +500 Fahrweisen zur Kapazitätsgrenze; kein Balancebeweis |
| R8.4 | P0 | Implementiert/automatisch/praktisch/subjektiv/menschlich trennen | — | VERIFIED | Status evidenzgebunden; keine erfundenen Playtests |
| R9.1 | P0 | Kurze Zyklen; wichtigste belegte Schwäche korrigieren/nachprüfen | R8.2 | VERIFIED | Überlauf, Ankunftsfeedback, Reviewfehler und erreichbarer Kapazitäts-Gegenfall jeweils rot→grün |
| R9.2 | P1 | Gates mit Belegen, Kern vor Metasystem, kein Bloat | R8.2 | VERIFIED | P0/P1-Nachweise getrennt; menschliches Gate/Balance offen; keine Metasysteme |
| R9.3 | P0 | Ohne Warte-OK; Blocker begrenzt diagnostizieren/Alternative/weiter | — | VERIFIED | Konzept selbst gewählt; Bundle blockiert nicht |
| R10.1 | P0 | VISION/IMPLEMENTATION/VERIFICATION/GIT/NEXT aktuell | R3.1 | VERIFIED | PROJECT_STATE aktuell, geprüfter Code-Checkpoint525c2c8 mit Remote-Readback und konkretem NEXT |
| R10.2 | P0 | Knappe Übergabe: Spiel/USP/Bild/Gameplay/Qualität/Schwäche/Git/Nächstes | R10.1 | IMPLEMENTED | Spiel/Download/Qualität/Git/Nächstes in README/PROJECT_STATE; knappe Chat-Übergabe |
| R10.3 | P0 | Keine behauptete Hintergrundarbeit; Fortsetzung ohne Neustart | — | VERIFIED | Keine Automatisierung; feste Konzeptentscheidung |
