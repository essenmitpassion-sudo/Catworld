# Nächste Aufgabe: konsistente Wiederholbarkeit von Run prüfen
Lange Programme/Editorpadding fertig, 199 Tests plus voller SDL-Smoke grün.
Nach Git-Abgleich untersuchen: Im Einstieg startet neuer Run derzeit an der letzten
Position, später immer am Szenariostart. Prüfen, ob das gültige Pläne beim zweiten
Run scheitern lässt. Bei reproduzierbarer Verwirrung kleinste Vereinheitlichung mit
RED/GREEN; Step→Run muss weiterhin fortsetzen, Stop behält die Position bis zum neuen
Versuch, Code und Undo bleiben erhalten. Keine allgemeine Runner-Neuarchitektur.
