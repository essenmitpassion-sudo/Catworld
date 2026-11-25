# Gerätesprache und Konto im UDI-Pilot

## Bestand und Entscheidung am 25.11.2026

UDI verwendet Capacitor 8.6.2 mit gemeinsamem JavaScript und separaten nativen Projekten. Android hat Minimum API 24 und Ziel API 36. Das iOS-Projekt setzt iOS 15 als Minimum. Die bestehende Desktop-Prüfoberfläche hat Browserdiktat und eine flüchtige Hörprobe. Im nativen Stand vor dieser Arbeit fehlten Mikrofonberechtigungen und die Erkennung. Der Rechner hat Java 17. Die nativen Builds werden auf GitHub mit Android-Emulator und iOS-Simulator geprüft. Ein physisches Testgerät mit nachgewiesenem lokalem Sprachmodell ist hier nicht verbunden.

Die bestehende Anmeldegrenze bleibt der erste echte Suchstart. Freier Entwurf, Beispiele und Diktat brauchen kein Konto. Der ausdrücklich konfigurierte Pilot verwendet E-Mail-Einmalcode für eingeladene Konten und hält die Test-Sitzung im Arbeitsspeicher. Unter Konto und dauerhaften Wünschen folgen echte Mailzustellung, geschützte Sitzungsablage, Löschung und geräteübergreifende Abnahme gemäss [PLAN](../PLAN.md). Eine eigene KI-Mitgliedschaft ist entbehrlich.

Die App-Mindestversion allein reicht für den Anmeldepilot nicht aus. Die WebView muss modale Dialoge und die AbortSignal-Funktionen unterstützen. Bei fehlenden Funktionen bleibt der Entwurf nutzbar und die App erklärt den Aktualisierungsbedarf. [WebKit beschreibt Dialogunterstützung ab iOS 15.4.](https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/)

## Verarbeitung

- Android prüft den auf dem Gerät installierten Erkennungsdienst und die installierte Sprache mit `checkRecognitionSupport` ab API 33. Verwendet wird ausschliesslich `createOnDeviceSpeechRecognizer`. API 24–32 und fehlende installierte Modelle bleiben bei Tastatureingabe. [Android-Spracherkennung](https://developer.android.com/reference/android/speech/SpeechRecognizer) · [Installierte Gerätesprachen](https://developer.android.com/reference/android/speech/RecognitionSupport)
- iOS verwendet `SFSpeechRecognizer` und einen flüchtigen Audiopuffer. Aufnahme startet nur bei `supportsOnDeviceRecognition` mit erzwungenem `requiresOnDeviceRecognition`. iOS fordert die Mikrofon- und die Spracherkennungsberechtigung an. [Lokale Erkennung auf iOS](https://developer.apple.com/documentation/speech/sfspeechrecognitionrequest/requiresondevicerecognition) · [Apple-Berechtigungsablauf](https://developer.apple.com/documentation/speech/asking-permission-to-use-speech-recognition)
- Die App bietet eine ausdrücklich auswählbare Erkennungssprache an. Deutsch (Deutschland, `de-DE`) und Englisch (Grossbritannien, `en-GB`) sind Kandidaten. Die tatsächliche Unterstützung hängt von Gerät und Modellpaket ab. Schweizerdeutsch und weitere Sprachen sind keine geprüften Erkennungspfade. Die Wahl ändert weder UI-Sprache noch Schweizer Markt.
- Die native Oberfläche gibt nur Text weiter. UDI speichert die Audiopuffer nicht als Datei und sendet Audio nicht an einen Dienst. Ein Stopp schliesst die Erkennung ab. Abbruch, Hintergrund und Zeitlimit geben Ressourcen frei und ignorieren späte Rückmeldungen. Der erhaltene Text bleibt bearbeitbar im Suchfeld.
- Vor dem Anmeldedialog wartet UDI auf die Bestätigung, dass ein laufendes Diktat beendet wurde. Abmelden und Wegnavigieren brechen die Aufnahme ab. Die Eingabefelder für Konto und Code bleiben während einer unbestätigten Aufnahme geschlossen.

## Abnahme

Vor einer Nutzerfreigabe braucht es auf beiden Plattformen ein Gerät mit installiertem Sprachmodell. Je Sprache zuerst verfügbare lokale Erkennung, dann erteilte und verweigerte Berechtigung, Aufnahme ohne Netz, Stille, Abbruch, Hintergrundwechsel und Bearbeitung des Transkripts nachvollziehen. VoiceOver und TalkBack sowie die reale Tastatur auf einem kleinen Gerät durchspielen. Android unter API 33 und ein Gerät ohne Modell müssen bei Tastatureingabe bleiben. GitHub-Starttests, die gemeinsame Oberfläche und simulierte Antworten belegen weder Mikrofonaufnahme noch tatsächliche Modellverfügbarkeit. Die genauen Prüfstände stehen in STATUS.

| Geräteprobe | Erwartetes Verhalten |
|---|---|
| Neu installieren, Suchfeld öffnen, auf das Mikrofon tippen | Beim App-Start und beim Öffnen der Erklärung erscheint keine Systemberechtigung. Erst «Diktat starten» darf die Erkennung anstossen. |
| Lokale Sprache wählen, Freigabe erlauben, Flugmodus aktivieren | Eine kurze Passage diktieren, stoppen, im Feld korrigieren. Die lokale Erkennung benötigt bei verfügbarer Sprachunterstützung keine Verbindung. Live-Suche wartet auf einen ausdrücklichen Tipp und erhält im Flugmodus den Offlinezustand. |
| Ablehnen und dauerhaft verweigern | Textfeld bleibt nutzbar. Die Anleitung verweist auf die jeweiligen Systemeinstellungen. Bei erneuter Freigabe erst bewusst neu starten. |
| Stille, Abbruch, Hintergrund, Wechsel zur Anmeldung | Entwurf bleibt erhalten. Ein spät zurückgegebener Text verändert ihn nicht. Konto- und Codefelder erscheinen erst nach bestätigtem Ende der Aufnahme. |
| Gerät ohne Sprachmodell und Android unter API 33 | Die App erklärt die fehlende lokale Erkennung. Es erfolgt keine Netzwerkerkennung und kein automatischer Modelldownload. |
| VoiceOver oder TalkBack, grosse Schrift und kleine Höhe | Mikrofon, Sprache, Status, Stopp und Abbruch sind benannt und erreichbar. Das Transkript lässt sich mit der regulären Tastatur bearbeiten. |
