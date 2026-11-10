# Nächste Aufgabe: Einstieg und eigene Routen unabhängig prüfen
Aktuell auf codex/masterplan-run-consistency: Masterplan bestätigt und abgeglichen;
neue Versuche in allen Aufgaben konsistent, 209 Tests und SDL-Smoke PASS.
Zuerst Git-Stand/Checkpoint prüfen; nicht versehentlich auf dem älteren
g0/first-cat-action dieselbe Änderung erneut bauen.

Produktpriorität: README-Spieltest mit einem Anfänger durchführen. Ohne Musterlösung
den ersten Code ergänzen, Ergebnis vor Step vorhersagen, eine eigene alternative
Laternenroute schreiben und nach Neustart den Entwurf wiederfinden lassen.
Hilfestufe, Missverständnisse und freiwillige zweite Versuche protokollieren.
Menschliche Teilnahme lässt sich nicht durch agentische Tests ersetzen.

Nächster unabhängig ausführbarer Technikschritt: Szenario-/Entwurfswechsel in
App.draft_snapshot/restore_drafts, toggle_roof, toggle_roof_transfer und toggle_pair
gegen vorhandene Tests lesen. Prüfen, ob wiederholtes Wechseln nach Stop/Fehler und
anschliessendes Speichern/Laden den jeweils eigenen Code und Fortschritt erhält.
Nur eine tatsächlich reproduzierte Lücke korrigieren. Kein pauschaler UI-Rewrite.
Danach kleinste Geräteentscheidung aus MASTERPLAN_STATUS.md konkretisieren;
keine neue Syntax oder Stadtarchitektur nur wegen des langen Masterplans.
