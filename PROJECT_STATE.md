# PROJECT UNCHARTED V4 · KIPPWERK
Stand: 16.11.2026. Autorität: docs/directives/MASTER_V4.md. Die zweite vollständige Nutzerdatei ersetzt den abgeschnittenen ersten Upload; keine Produktänderung zwischen ihren gemeinsamen Abschnitten. Einzige aktive Fortsetzung hier; überprüfbare Anforderungen in REQUIREMENTS.md. docs/DESIGN.md ist die feste Konzeptentscheidung, keine zweite Roadmap.

## Spiel / Implementierung
KIPPWERK: zwei Leitungsachsen-Eingriffe lenken Druckketten zu vier Feuern. P0 vollständig implementiert: Kippen/Entlasten, zwei Eingriffe, exakte Vorschau, Randhülle, vier Feuer, zehn Fluten, Sieg/Verlust/Neustart. Vorgänger aus aktivem Baum nach Sicherung entfernt, weiterhin vollständig in Git erreichbar.

## Start / Prüfung
Befehle: npm ci; npm test; npm run build; npm run dev (Port 3000); npm run smoke; npm run balance. dist/KIPPWERK.html ist der portable Einzeldatei-Build. Alte Basis vor Ersatz: npm ci und 44/44 Tests erfolgreich; das beweist ausschließlich den Vorgänger.

## Nachweise / Schwächen
V4 vollständig gelesen, Anforderungsmatrix einmal semantisch gegen Abschnitte 1–17 geprüft. Kein Human-Feedback. AUTOMATED_TESTED: 9/9 Regeltests, Druckerhaltung auf 100 Seeds. PRACTICALLY_VERIFIED: Chromium klickte auf dem tatsächlichen Standalone-Build einen Sieg (MORGEN, 8 Fluten, 8 Hülle) und Verlust (4 Fluten, 0 Hülle), Vorschaugleichheit bei jeder Gewinnflut, Neustart; Layout 320/390/768/1440 ohne horizontalen Überlauf und ohne Runtimefehler. Screenshots work/preview. file:// durch Browser-Administrationsrichtlinie gesperrt; identische Einzeldatei über abgefangene HTTP-Testadresse geprüft, keine Hosted-Veröffentlichung. Erste Botstichprobe 12 Seeds: idle 0/12, balanced 12/12, safe 11/12, greedy 12/12. Keine Balance-/Spaßbehauptung. Hauptschwäche P0: sämtliche Kettenzellen leuchten gleichzeitig, Ursache/Wirkung schwer verfolgbar. Menschliches Verständnis, Timing und Spaß offen.

## Git
Branch development/uncharted im isolierten /workspace/work/uncharted. Ausgang e7c16bf83b803c973c5d0b053b06c657d0b32c2a. Archiv-Branch archive/catworld-final-v4-2026-11-16 und Tag archive/catworld-v4-baseline-2026-11-16 zeigen remote nachweislich auf denselben Ausgang. Git-Bundle /workspace/work/catworld-pre-v4.bundle vollständig verifiziert, enthält sämtliche verfügbaren Branch-Historien. Initiales Catworld war leere Checkout-Hülle ohne lokale Arbeit. Fremde Geräte nicht geprüft. Kein Force-Push; keine Veröffentlichung.

## Nächste Aktion
P1: Kettenanimation in echte Entladungsstufen aufteilen, UI-Gleichheit und Eingabesperre währenddessen prüfen; Strategiestichprobe ausweiten und Ein-Achsen-Exploits prüfen. Keine Hintergrundausführung eingerichtet.

## P0 Sicherung / gezielter Abgleich
Regeln/UI/Build und Browserbelege geprüft, Diffcheck vor Commit. Vorheriger gesicherter Designcommit e331972. Dieser P0-Commit wird anschließend auf origin development/uncharted gepusht und per SHA bestätigt. Archiv unverändert. P0 technischer/praktischer Kern erfüllt; zeitliche/menschliche Ziele und P1–P3 noch offen.
