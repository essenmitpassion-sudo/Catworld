# PROJECT UNCHARTED V5 · Anforderungen
Initial einmal vollständig gegen MASTER_V5 §§1–20 abgeglichen, 16.11.2026. Status: OPEN, IN_PROGRESS, IMPLEMENTED, VERIFIED, BLOCKED. Evidenz wird gezielt nach Meilensteinen aktualisiert. Menschlicher Erlebnisnachweis separat offen.

| ID | Priorität | Akzeptanzkriterium | Abhängigkeit | Status | Nachweis |
|---|---|---|---|---|---|
| R1.1 | P0 | Fantasie, Handlung, Strategie als eigenständiger spielbarer Zusammenhang | R4.2,R7.1 | IN_PROGRESS | SAUM-Konzept in DESIGN.md |
| R1.2 | P1 | Verschiedene sinnvolle Spielweisen und systemische Folgen | R7.1 | OPEN | Strategiestichprobe ausstehend |
| R1.3 | P2 | Langfristige Faszination und Wiederholung durch Menschen | R8.4 | OPEN | Keine Testpersonen |
| R2.1 | P0 | V5 alleinige Direktive; alte Produktziele historisch | — | VERIFIED | MASTER_V5 gesichert; AGENTS/Status/Design ersetzt |
| R2.2 | P0 | Nur REQUIREMENTS/PROJECT_STATE aktiv planen; keine alten Issues | R2.1 | VERIFIED | IMPLEMENTATION historisch; keine Issues übernommen |
| R2.3 | P0 | Technische Regeln/fremde Daten respektieren | — | IN_PROGRESS | AGENTS gelesen; Hosting belassen; kein Clean |
| R3.1 | P0 | Identität/Branch/HEAD/Remote/Arbeitsbaum prüfen | — | VERIFIED | git status/remote/ls-remote, Ausgang 09ef38f |
| R3.2 | P0 | Archivbranches/Tag mit SHA erreichbar/wiederherstellbar | R3.1 | VERIFIED | ls-remote und gefetchte Bäume; PROJECT_STATE GIT |
| R3.3 | P0 | Bundle sofern vorhanden prüfen, sonst Nichtverfügbarkeit melden | R3.1 | VERIFIED | Suche /workspace und /tmp ohne .bundle |
| R3.4 | P0 | KIPPWERK vor Ersatz sichern, auf geeignetem development/uncharted | R3.2 | VERIFIED | 09ef38f remote und lokaler Archivbranch |
| R3.5 | P0 | Funktionierende Commits/Push/SHA-Readback ohne Force | R8.1 | OPEN | Ausgang unverändert |
| R4.1 | P0 | Referenzprinzipien/Belege/Berichte unterscheiden | — | VERIFIED | DESIGN; Catworld DECISION gelesen, V4 9 Tests neu |
| R4.2 | P0 | 3 radikal andere Konzepte nach 8 Kriterien, selbst wählen | R4.1 | VERIFIED | DESIGN Vergleichsmatrix |
| R4.3 | P0 | Originalitätsfilter und KIPPWERK tatsächlich verwerfen | R4.2 | VERIFIED | Körper/Schutz/Familien statt Netz oder Raster |
| R5.1 | P0 | Nutzen/Kosten/Zukunftsfolgen zentraler Aktionen | R7.1 | IN_PROGRESS | Kurs/Ruhe/Eile/Formation definiert |
| R5.2 | P1 | Gegenstrategien/Erholung/kein trivialer Universalplan | R5.1 | OPEN | Strategieprüfung ausstehend |
| R5.3 | P2 | Variierende reproduzierbare Partien ohne Grind | R7.2 | IN_PROGRESS | Seed-Karten geplant |
| R6.1 | P0 | Bewusste Komposition/Material/Farbe/Typografie; Welt statt Dashboard | R4.2 | IN_PROGRESS | DESIGN Art Direction |
| R6.2 | P0 | Unmittelbares Feedback, lesbare Vorschau/Folgen | R7.1 | OPEN | Browserbeleg ausstehend |
| R6.3 | P0 | Tatsächliche Bildprüfung mehrerer Zustände/kleiner Fenster | R6.1,R7.1 | OPEN | Screenshots ausstehend |
| R6.4 | P3 | Tastatur/Touch/reduzierte Bewegung; nicht nur Farbe | R6.2 | OPEN | Inputprüfung ausstehend |
| R7.1 | P0 | Welt/Einstieg/Handlung/Konflikt/Druck/kompletter Loop/Sieg/Verlust/Neustart | R4.3 | IN_PROGRESS | Regeln fixiert |
| R7.2 | P0 | Zustand/Regeln/Render/Input getrennt, robuste deterministische Übergänge | R7.1 | OPEN | engine/scene/main vorgesehen |
| R7.3 | P0 | Einfach ausführbares Produkt/Standalone ohne Laufzeitnetz | R7.2 | OPEN | esbuild wiederverwendet |
| R8.1 | P0 | Gezielte Regeln/Input/Neustart/Regression automatisch | R7.2 | OPEN | SAUM-Suite ausstehend |
| R8.2 | P0 | Wirklich starten, ganzer Loop mit Erfolg/Verlust praktisch | R7.3 | OPEN | Browserlauf ausstehend |
| R8.3 | P1 | Reproduzierbare adversariale Strategie/Exploitstichprobe | R8.1 | OPEN | Keine Balance behauptet |
| R8.4 | P0 | Implementiert/automatisch/praktisch/subjektiv/menschlich trennen | — | VERIFIED | Status evidenzgebunden; keine erfundenen Playtests |
| R9.1 | P0 | Kurze Zyklen; wichtigste belegte Schwäche korrigieren/nachprüfen | R8.2 | OPEN | Erster SAUM-Zyklus läuft |
| R9.2 | P1 | Gates mit Belegen, Kern vor Metasystem, kein Bloat | R8.2 | IN_PROGRESS | P0 begrenzt, menschliches Gate offen |
| R9.3 | P0 | Ohne Warte-OK; Blocker begrenzt diagnostizieren/Alternative/weiter | — | VERIFIED | Konzept selbst gewählt; Bundle blockiert nicht |
| R10.1 | P0 | VISION/IMPLEMENTATION/VERIFICATION/GIT/NEXT aktuell | R3.1 | IN_PROGRESS | PROJECT_STATE mit einziger Folge |
| R10.2 | P0 | Knappe Übergabe: Spiel/USP/Bild/Gameplay/Qualität/Schwäche/Git/Nächstes | R10.1 | OPEN | Nach echter Prüfung |
| R10.3 | P0 | Keine behauptete Hintergrundarbeit; Fortsetzung ohne Neustart | — | VERIFIED | Keine Automatisierung; feste Konzeptentscheidung |
