# Diktateinstieg auf iOS · 28.11.2026

Ausgangscommit 5f8ae9d. Im vorherigen Standardlauf erkannte XCTest «Speak» als Switch. Nach dem Tipp war der Switch fokussiert und die Aktion «Start dictation» fehlte. Die Prüfkette hatte die iOS-Audio- und Spracherkennungsberechtigungen zu diesem Zeitpunkt noch nicht erreicht. [Ursprünglicher Befund](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46076078970/job/140763997299).

Die Eingangsaktion klappt die Erklärung und Sprachwahl auf. UDI verwendet dafür einen Button mit Zustandsangabe und Verweis auf die aufgeklappten Optionen. Die Aufnahme hat einen eigenen sichtbaren Status. [W3C-Muster für aufklappbare Inhalte](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

Die neue Browser-Gegenprobe schlug an der falschen Rolle und Zustandsangabe fehl. Danach bestanden Build und vollständiger Chromium-Smoke. Die Android-/DE- und iOS-/EN-Simulationen prüfen den Dialog vor der Berechtigung, Sprachwahl, Aufnahmeabbruch, verspätetes Transkript, erneute Eingabe und Fehlermeldungen bei verweigerter Berechtigung, fehlender lokaler Erkennung und leerem Diktat. Die Tests verwenden eine simulierte Sprachbrücke.

Der iOS-Adapter ruft den Erkenner erst bei ausdrücklichem Start auf und verlangt Unterstützung für lokale Erkennung. Die Textsuche ist in allen Fehlerfällen verfügbar. Der neue XCTest erwartet einen echten Button, schliesst die Erklärung ohne Erkennungsstart und prüft erneutes Öffnen. Die praktische Ausführung des aktualisierten XCTest und die Aufnahme auf physischen Geräten sind separat nachzuweisen. [Apple-Dokumentation zur lokalen Spracherkennung](https://developer.apple.com/documentation/speech/sfspeechrecognitionrequest/requiresondevicerecognition).
