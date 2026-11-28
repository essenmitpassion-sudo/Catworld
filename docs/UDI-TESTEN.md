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

## Android-Test-APK per USB

1. Auf einem Rechner mit JDK 21, Android-SDK 36 und ADB im Projektverzeichnis UDI_NATIVE_FIXTURE auf 1 setzen. Danach npm run native:prepare und npm run native:check ausführen.
2. Im Ordner android mit .\gradlew.bat :app:assembleDebug -PudiNativeFixture=1 bauen. Der Ausgabepfad ist android/app/build/outputs/apk/debug/app-debug.apk. Für den Gerätetest ein Android-Gerät ohne bestehende UDI-Installation verwenden, weil das Testprofil dieselbe Paket-ID hat.
3. In einem eigenen Terminal npm run native:fixture:service starten. Das Gerät per USB verbinden, Debugging für diesen Rechner bestätigen und das gewünschte Gerät mit adb devices -l auswählen. Die APK mit adb -s SERIENNUMMER install PFAD_ZUR_APK installieren. Danach adb -s SERIENNUMMER reverse --no-rebind tcp:4175 tcp:4175 setzen. Der Testdienst bleibt auf dem Rechner an 127.0.0.1 gebunden.
4. UDI auf dem Gerät öffnen. Die Testkennzeichnung kontrollieren, mit plus@udi.test und 123456 anmelden und die Suche bewusst starten. Geöffnete Tastatur, beide Preiszustände, Zeitüberschreitung, Speichern und Sitzungswiederherstellung prüfen. Zum Schluss die selbst eingerichtete Rückleitung mit adb -s SERIENNUMMER reverse --remove tcp:4175 entfernen und den Testdienst beenden.

Auf dem aktuellen Windows-Rechner wurden die Android- und iOS-Assets beider Profile vorbereitet und geprüft. Der lokale Build und die Installation der APK bleiben offen. Die Prüfung fand Java 17 und keine Android-SDK-/ADB-Toolchain. Die CI baut die Debug-APK für den isolierten Emulatorlauf. [Android-Tools](https://developer.android.com/tools) · [ADB-Befehle](https://android.googlesource.com/platform/packages/modules/adb/+/refs/heads/master/docs/user/adb.1.md).

## Native Prüfung

Die gleiche App-Oberfläche und der gleiche lokale Testdienst werden in getrennten Android-Emulator- und iOS-Simulatorläufen geprüft. Der Windows-Start ist die persönliche Browser-Testansicht. Für einen nativen Start benötigt Android einen Emulator oder ein Gerät mit der vorbereiteten Debug-App. Die iOS-Simulator-App braucht einen Mac mit Xcode. Der technische [Aufbau des isolierten nativen Profils](SERVICE.md#lokaler-nativer-testdienst) steht im Dienstprotokoll.

Native Nachweise zu cec80a5 und 28c48ca. Android startete die Standard-App im Emulator. Mikrofon-Erklärung, gespeicherte Suche und Sprachauswahl nach Neustart bestanden. Der Android-Testdienstlauf auf cec80a5 stoppte beim Laden der Gradle-Abhängigkeiten mit HTTP 429 von Maven Central. iOS kompilierte beide Profile. Die Standard-App war im Simulator sichtbar. XCTest erhielt den Accessibility-Baum zu spät für die erste Prüfaktion. Der frühere Diktat-Nachweis auf 703cc82 bleibt separat datiert. Die lokale Paketprüfung bestätigt für den Designstand 34 Standard- und 35 Testdateien pro Plattform mit identischer UI und getrennten Netzwerkprofilen. [Native CI auf cec80a5](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46082564799) · [Native CI auf 28c48ca](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46083728626).

Auf 28c48ca erreichte der Android-Testdienst Anmeldung mit Code, offenen Versand, bestätigten Test-Endpreis und Speichern. Beim nächsten Suchwunsch erreichte das emulierte Mausereignis den Suchknopf mit offener Tastatur nicht. Der erneute Prüfschritt verwendet eine Touch-Geste und zeichnet ihr Ziel beim Fehlschlag auf. Die identische CDP-Geste erreichte den Knopf im DE/EN-Browsertest. Der separate Android-Standardbuild auf 28c48ca erhielt HTTP 429 von Maven Central. [Android-Testdienstlauf](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46083728626/job/140789624521) · [Android-Standardbuild](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46083728626/job/140789624876).

Auf cec80a5 stoppten die iOS-Testdienstaktionen bei der Sprachauswahl, vor dem ersten Dienstaufruf. Der iOS-Test wartet beim Start begrenzt auf die tatsächliche Bedienaktion und öffnet die Sprachauswahl nur bei nötigem Wechsel. Die unabhängige Prüfung beider Sprachen bleibt im Standardprofil erhalten. XCTest-Nachweise nach der Anpassung und die Geräteprüfung stehen aus. [iOS-Testdienstlauf](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46082564799/job/140785976704).

## Aktueller Abnahmestand

| Plattform | Praktischer Nachweis | Offene Stelle |
|---|---|---|
| Android-Emulator | Standard- und Testprofil auf 8493cc2 bestanden. Im Testprofil sind Anmeldung mit Code, beide Preiszustände, Zeitüberschreitung, widersprüchliche Antwort, Dienstfehler, Speichern und Wiederherstellung nach Prozessende belegt. | Physisches Gerät und lokal verfügbare APK stehen aus. |
| iOS-Simulator | Standardprofil auf 8493cc2 bestand Diktatdialog, Textsuche DE/EN, Speichern und Neustart. Auf 65103db erreichte das Testprofil zusätzlich Anmeldung und beide Preiszustände. | Das Testprofil auf 8493cc2 scheiterte vor dem ersten Dienstaufruf beim Tastaturfokus des Textfelds im XCTest. Der Suchfix wird separat geprüft. |
| Windows-Vorschau | Die ausgelieferte CMD-Datei startete beim kontrollierten Aufruf den markierten lokalen Dienst. Die App antwortete mit HTTP 200. Der DE/EN-Ablauf bis zur Suche wurde separat in Chromium geprüft. | Persönlicher Doppelklick und automatisches Öffnen im Standardbrowser offen. |

Die Android-Codebestätigung bei eingeblendeter Tastatur war der erste gezielte Schritt. Für den nächsten Nachweis ist die gleiche App auf einem physischen Gerät vorgesehen. Der Prüflog auf 65103db meldet das Formular als Klickziel und null Verifikationsaufrufe. Die Gegenprobe auf 8493cc2 zeigte die anschliessend erfolgreiche Codebestätigung. [Aktuelle native Läufe](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46084789235) · [iOS-Designlauf](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46083728626/job/140789624845) · [Standard-CI](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46084789339).

Auf einem iPhone führt «Einsprechen» zur Erklärung und zur Wahl der Erkennungssprache. Tippe bewusst auf «Diktat starten», erlaube gegebenenfalls Mikrofon und Spracherkennung und kontrolliere den bearbeitbaren Text. Falls die lokale Erkennung fehlt oder ein Zugriff abgelehnt ist, gib den Wunsch per Tastatur ein. Beende ein laufendes Diktat vor der Suche. Die App-Prüfung auf physischen Geräten steht aus.
