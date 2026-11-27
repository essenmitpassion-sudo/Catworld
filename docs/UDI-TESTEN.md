# UDI selbst testen · 28.11.2026

## Auf diesem Windows-Rechner

1. Doppelklick auf **UDI testen.cmd**. Im Browser öffnet sich die lokale UDI-Testansicht. Lass das Startfenster geöffnet.
2. Tippe bei «Suche» den Beispielwunsch **Samsung 990 PRO 2 TB** ein oder wähle das Beispiel. Drücke auf «Angebote suchen».
3. Melde dich im Test mit **plus@udi.test** und dem Code **123456** an. Der bisherige Suchwunsch bleibt stehen. Drücke erneut auf «Angebote suchen».
4. Du siehst **CHF 99.00** als Test-Artikelpreis mit offenem Versand. Öffne die Preisdetails. Speichere den Wunsch, gehe zu «Gespeichert» und lade die App im Browser neu. Der gespeicherte Testwunsch erscheint wieder, solange das Startfenster läuft.
5. Gehe zurück zur Suche und probiere einen der Fälle unten. Die lokale Vorschau verwendet die Tastatur. Das Diktat ist Gegenstand des nativen Gerätetests.

| Eingabe | Erwartetes Ergebnis |
|---|---|
| Samsung 990 PRO 2 TB confirmed | CHF 104.00 · vollständig bestätigter Betrag im Test |
| UDI fixture unavailable | Klarer Dienstfehler, Suchwunsch bleibt erhalten |
| UDI fixture timeout | Ladezustand mit «Suche abbrechen», danach Zeitüberschreitung |
| UDI fixture invalid | Widersprüchlicher Preis wird zurückgewiesen |
| Ein ungewöhnlicher Wunsch, z. B. Reparatur für eine alte Uhr | Keine passenden Testtreffer |

Das Testkonto verfügt pro Start über drei abgeschlossene Suchen. Die vorgesehenen Fehler verbrauchen keine. Wenn du von vorne beginnen willst, schliesse das Startfenster und öffne die Startdatei wieder. Der Dienst läuft nur auf diesem Rechner und löscht Testkonten und gespeicherte Testwünsche beim Beenden des Prozesses. Die Preise sind simuliert. Verwende die angezeigten Testzugänge.

## Native Prüfung

Die gleiche App-Oberfläche und der gleiche lokale Testdienst werden in getrennten Android-Emulator- und iOS-Simulatorläufen geprüft. Der Windows-Start ist die persönliche Browser-Testansicht. Für einen nativen Start benötigt Android einen Emulator oder ein Gerät mit der vorbereiteten Debug-App. Die iOS-Simulator-App braucht einen Mac mit Xcode. Der technische [Aufbau des isolierten nativen Profils](SERVICE.md#lokaler-nativer-testdienst) steht im Dienstprotokoll.

Auf einem iPhone führt «Einsprechen» zur Erklärung und zur Wahl der Erkennungssprache. Tippe bewusst auf «Diktat starten», erlaube gegebenenfalls Mikrofon und Spracherkennung und kontrolliere den bearbeitbaren Text. Falls die lokale Erkennung fehlt oder ein Zugriff abgelehnt ist, gib den Wunsch per Tastatur ein. Beende ein laufendes Diktat vor der Suche. Die App-Prüfung auf physischen Geräten steht aus.
