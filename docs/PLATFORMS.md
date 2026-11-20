# UDI · Android und iOS gleich priorisieren

Verbindliche Entscheidung vom 20.11.2026. Bestehender Stack: modulare lokale HTML/CSS/JS-Oberfläche, gemeinsame Such-/Kosten-/Frischelogik, lokales Node-Backend und zulässiger DQ-Adapter. DE/EN und CH/CHF sind bereits getrennte Bedienungs- und Angebotsdimensionen; vollständige Marktmodellierung bleibt P2. Der alte PWA-Entscheid wird durch diese native Plattformstrategie ergänzt und als alleiniger Startweg abgelöst.

| Weg | Vorteil | Nachteil / Entscheidung |
|---|---|---|
| Capacitor, gemeinsame bestehende Oberfläche und native Android-/iOS-Projekte | Erhält geprüfte Produktlogik und UI; gezielte native Adapter möglich. | WebView ist kein Nachweis nativer Funktionsgleichheit. Mikrofon, externe Links, Speicherung, Lifecycle, Safe Areas, Teilen und API-Zugang brauchen je Plattform Abnahme. Gewählt für P0. |
| React Native / Flutter | Eigenständige native UI-Werkzeuge. | Grosser UI-Neubau und neue Komponenten-/Testwelt ohne belegten Nutzen für den aktuellen Engpass. Derzeit verworfen. |
| Zwei getrennte native Apps | Maximale jeweilige Plattformfreiheit. | Doppelter UI-/Integrationsaufwand; kein belegter Qualitätsgrund. Derzeit verworfen. |
| PWA allein | Vorhandener lokaler Prüfstand. | Erfüllt den neuen Auftrag gleichwertiger nativer Apps nicht. Bleibt QA-/Entwicklungsweg, kein Ersatz. |

## P0-Umfang und Grenzen

Gleichzeitig vorbereitete native Projektdateien verwenden dieselben gebauten UI-Assets. Lokaler Startcode wird mitgeliefert; keine per server.url nachgeladene Website und keine Domainumstellung. Geheimnisse, Journale und Backend gehören nicht ins native UI-Paket. Das Backend ist ein getrennter Dienst; ein relativer API-Aufruf im nativen Bundle startet keinen Node-Server. Bis ein sicherer Dienst existiert, native Live-Suche ausdrücklich nicht verbunden; keine Rückfälle auf irgendeine Domain oder ein CORS-Stern. Native Spracheingabe bleibt ungeprüft und deshalb nicht als vorhanden behauptet. Keine neuen Plugins mit sensiblen Berechtigungen nur zum Vorzeigen hinzufügen.

Dieser Windows-Rechner hat Java 17, aber kein nachgewiesenes Android-SDK/adb/Gradle, kein Xcode und keinen iOS-Simulator. Quellenprojekte sind ohne diese Werkzeuge vorbereitbar; APK/IPA, Start, Berechtigungen und tatsächliche Plattformfunktion sind damit nicht abgenommen. Capacitor 8 setzt für iOS mindestens iOS 15 und Xcode 26 voraus; Android benötigt Android Studio/SDK. [Umgebung](https://capacitorjs.com/docs/getting-started/environment-setup), [iOS](https://capacitorjs.com/docs/ios). Die offizielle Konfiguration bezeichnet server.url und Cleartext als Entwicklungsoptionen; sie werden nicht für Produktion freigeschaltet. [Konfiguration](https://capacitorjs.com/docs/config).

## Gleichwertige Abnahmematrix

| Ablauf | Android | iOS |
|---|---|---|
| Projektdateien / gebaute lokale Assets | Vorbereitet; Dateiprüfung erfolgreich | Vorbereitet; Dateiprüfung erfolgreich |
| Nativer Debug-/Simulationsbuild und Start | Offen: SDK/Emulator | Offen: Mac/Xcode/Simulator |
| Geschützter gemeinsamer Live-Dienst | Offen | Offen |
| Textsuche → echtes aktuelles Angebot → externer Anbieter | Offen auf Gerät | Offen auf Gerät |
| Sprachsuche, Aufnahmeprüfung, Verweigerung, Fehler | Offen: nativer Adapter | Offen: nativer Adapter |
| Favoriten/Suchen nach Neustart, Update, Hintergrundwechsel | Offen | Offen |
| Implementierte Links/Teilen und Empfängerinhalt | Offen | Offen |
| Meldungen / monetarisierte Vorteile | Noch nicht umgesetzt | Noch nicht umgesetzt |
| Datenschutz, Kostenumfang, Unsicherheit und DE/EN | Gemeinsame Logik geprüft; Gerät offen | Gemeinsame Logik geprüft; Gerät offen |

Vor Store- oder öffentlicher Testverteilung aktuelle offizielle Regeln, Identitäten, Datenschutz-/Berechtigungsangaben, Signierung und Budget konkret prüfen. Keine Konten, Cloud-Build-Abos oder macOS-CI-Kosten aktivieren. Eine Hülle garantiert keine Store-Zulassung. Erst nach gleichem Kernnachweis beide Plattformen als unterstützt bezeichnen.

## Reproduzierbare Vorbereitung

`npm ci`, `npm run native:prepare`, `npm run native:check`, `npm run native:doctor`. Die Vorbereitung erstellt `native-dist/` aus der gemeinsamen positiven Assetliste, ohne Beobachtungssnapshots, Backend oder Schlüssel. Markierung und CSP sperren Netzwerkzugriffe, selbst wenn eine native Brücke fehlt. Anschliessend kopiert Capacitor in beide Projekte. 23 gemeinsame UI-Dateien pro Plattform werden gegen dieselben Hashes geprüft. Originales UDI-App-Symbol für beide Plattformen erzeugt; iOS-Symbol 1024 × 1024 RGB ohne Alphakanal. Start-/Plattformdarstellung auf tatsächlichen Geräten noch offen. Die Kennung `stream.soundweave.udi` ist lokal vorläufig; keine Registrierung, Signierung oder Domainzuordnung behaupten.

Android: Projekt `android/` in geeignetem Android Studio mit JDK 21 und SDK 36 öffnen; Gradle-Konfiguration fordert Java 21, vorhandenes Java 17 genügt nicht. Nach Einrichtung im Ordner `android/` mit `./gradlew assembleDebug` bzw. `gradlew.bat assembleDebug`; keinen Release-/Store-Schritt ableiten. iOS: `ios/App/App.xcodeproj` auf einem Mac mit Xcode 26+ öffnen, Swift-Pakete auflösen und erst im Simulator starten. SPM-Abhängigkeit exakt auf dieselbe Capacitor-Version wie NPM gesetzt. Signierung/Testgerät erst nach Prüfung der eigenen Berechtigungen. Framework-Mindestversionen sind noch keine UDI-Unterstützungszusage; JavaScript-/WebView-Versionen und sämtliche Kernabläufe gehören zur Geräteabnahme.

Wichtigster Reviewbefund: Reines `cap copy` hätte nach frischem Checkout ignorierte Gradle-Eingaben nicht erzeugt. Vorbereitung führt deshalb `cap sync` für beide Plattformen aus; Check prüft die erforderlichen Cordova-Kompatibilitäts-Gradle-Dateien auch ohne installierte Plugins. Der Fehler wurde mit fehlender generierter Datei reproduziert. Betreiberpakete enthalten nun beide Quellprojekte und die Konfiguration; ihr Prüfer installiert isoliert und führt Vorbereitung/Check erneut aus. Dies ist eine Quell-/Paketprüfung, keine native Kompilierung. Generierte triviale Android-Beispieltests mit fremder Paketkennung wurden entfernt.

Aktueller automatischer Nachweis: 58 Fachtests, bestehende DE/EN-Chromium-Abläufe und zusätzliche Grenzsimulationen für Android/iOS/fehlerhafte Brücke. Diese Simulationen zeigen verständliche native Zustände, gesperrte APIs/Snapshots, deaktivierte Spracheingabe und Wiederfinden gespeicherter Wünsche. Sie laufen im Desktop-Browser, ausdrücklich nicht in Android- oder iOS-Emulatoren. Die native Build-/Device-Gates bleiben offen.

## Internationalisierung und Fortsetzung

UI-Sprache, Formatlocale, Markt/Liefergebiet, Währung, Zeitzone, Quelle/Verfügbarkeit und Kostenbedingungen bleiben getrennt. CH/CHF ist bewusste aktive Konfiguration, kein universeller Standard für fremde Angebote. Keine implizite Umrechnung. Vor zweitem Markt Beobachtungen und gespeicherte/geteilte Suchaufträge explizit an Markt und Lieferregion binden und Schema migrieren. Alle eigenen UI-Texte einschliesslich neuer nativer Fehler brauchen vollständige Kataloge; rohe Anbietertexte bleiben Originaldaten. Heutige deutsche Quellenstrings als UI-Schlüssel sind noch keine vollständig von Code getrennten stabilen Sprach-IDs. Weitere Sprachen erst nach Vollständigkeits-/Geräteprüfung freigeben. Ausbau folgt docs/INTERNATIONAL.md.
