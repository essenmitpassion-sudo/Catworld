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
