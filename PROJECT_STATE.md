# PROJECT UNCHARTED V4 · KIPPWERK
Stand: 16.11.2026. Autorität: docs/directives/MASTER_V4.md. Die zweite vollständige Nutzerdatei ersetzt den abgeschnittenen ersten Upload; keine Produktänderung zwischen ihren gemeinsamen Abschnitten. Einzige aktive Fortsetzung hier; überprüfbare Anforderungen in REQUIREMENTS.md. docs/DESIGN.md ist die feste Konzeptentscheidung, keine zweite Roadmap.

## Spiel / Implementierung
KIPPWERK: zwei Leitungsachsen-Eingriffe lenken Druckketten zu vier Feuern. Noch kein neues Gameplay implementiert. Vorgänger aus aktivem Baum nach Sicherung entfernt, weiterhin vollständig in Git erreichbar.

## Start / Prüfung
Geplant: npm test, npm run build, npm run dev, npm run smoke, npm run balance. Alte Basis vor Ersatz: npm ci und 44/44 Tests erfolgreich; das beweist ausschließlich den Vorgänger.

## Nachweise / Schwächen
V4 vollständig gelesen, Anforderungsmatrix einmal semantisch gegen Abschnitte 1–17 geprüft. Kein erfundenes Human-Feedback. Hauptschwäche aktuell: neuer Kern noch nicht spielbar. Hypothesen zu Strategie, Timing und Spaß offen.

## Git
Branch development/uncharted im isolierten /workspace/work/uncharted. Ausgang e7c16bf83b803c973c5d0b053b06c657d0b32c2a. Archiv-Branch archive/catworld-final-v4-2026-11-16 und Tag archive/catworld-v4-baseline-2026-11-16 zeigen remote nachweislich auf denselben Ausgang. Git-Bundle /workspace/work/catworld-pre-v4.bundle vollständig verifiziert, enthält sämtliche verfügbaren Branch-Historien. Initiales Catworld war leere Checkout-Hülle ohne lokale Arbeit. Fremde Geräte nicht geprüft. Kein Force-Push; keine Veröffentlichung.

## Nächste Aktion
Regeltests schreiben, rot ausführen, Regeln implementieren; danach vollständige Browser-Partie, größte belegte Schwäche verbessern, sichern. Keine Hintergrundausführung eingerichtet.
