# CURRENT — 2026-11-13 — Miso zieht zur warmen Zuflucht

Basis 438e7aa4 (Remote-Masterauftrag übernommen). Vollständiger neuer Upload:
AUTONOMOUS_MASTER_EXECUTION_2026-11-13.md. Umsetzung statt Neustart.
M: 341 Tests bestanden; 4 neue Verhaltenstests zuerst rot, danach grün.
M: SDL-Spielablauf mit Zuflucht, Rückweg, Gartenroute, Akku, Vollversorgung,
Rewind/Reset und Draft-Neustart bestanden; Paket-Selbsttest bestanden.
M: Miso läuft reversibel mit 2 Feldern/s zwischen Kai und Zuflucht, vier eigene
Posen, passende Blickrichtung und mitbewegte Trefferfläche. Hilfe pausiert.
Unveränderte Welt-/Runnerregeln; Originalporträts erhalten. Screenshots in evidence/miso-*.
Neue Posen: image_gen aus bestehendem characters.png; unverändertes Original
als assets/miso-poses.png gespeichert. Kein Ersatz für fehlende Owner-Bildvorlage.
G: unabhängiger Review: 12 relevante Tests PASS; einziges Minor behoben:
Werkstattschild unter das Gebäude versetzt, damit Miso es nicht verdeckt. O: Figuren haben höchste Priorität.
V: sichtbare Bewohnerhandlung dürfte Codewirkung verständlicher machen.
Offen: menschlicher Spiel-/Lerntest und native Windows-Ausführung.
Nächste Arbeit nach Sicherung: Fensterseitenverhältnisse prüfen; Figuren dürfen
beim Resize nicht gestaucht werden. Kein Scheduler oder Hintergrundlauf eingerichtet.

Fortsetzung nach gesichertem Commit ffc3526: proportionale Fensterdarstellung
statt Streckung. Gemeinsame Koordinatenabbildung für Katzen, Editor und Hilfe;
Randflächen nehmen keine Klicks an. 344 Tests PASS, vollständiger SDL-Ablauf PASS.
Unabhängiger Review: 22 relevante Tests plus vier Fenstergrößen, keine Befunde.
Screenshots wide/tall und korrigierte Schilder aktualisiert, visuell angesehen.

Dritte Fortsetzung: Misos Gespräch unterscheidet Hinweg, Ankunft und Rückweg;
keine vorzeitige Ankunftsbehauptung mehr. 345 Tests PASS und Selbsttest PASS.
Unabhängiger Review: 9 relevante Tests PASS, keine Befunde. Dialog-Screenshot
geprüft. MASTERPLAN_STATUS.md enthält den aktuellen Vergleich der fünf Probleme.
Paket e34ff35 zuvor entpackt gestartet und alle26 Dateihashes geprüft; nach dem
aktuellen Commit wird der finale Build ebenso neu gebaut und verifiziert.
