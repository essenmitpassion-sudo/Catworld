# USB-Gerätetest und Händlerprüfung · 28.11.2026

Erster USB-Build auf `35c088fd3309d000f33938b8a40a6dfc5b321c67`. Android-Update auf `34f16ba7ba684d1d31657289799336f6d253863f` einschliesslich der RAM-Korrektur `8e05816`. Beide Builds entstanden aus einem isolierten Arbeitsordner mit JDK 21, SDK 36 und demselben Android-Debug-Zertifikat. Der Nutzer hatte der Einrichtung des SDK zugestimmt.

| Abnahme | Aktueller Nachweis | Offen |
|---|---|---|
| P0 · Ausgangsstand | Branch vor Änderungen sauber. Erste APK kompiliert, signiert, per ADB auf physischem Android 17 installiert und gestartet. Nutzer meldete eine abgelehnte Codeanfrage, früh endendes Diktat, ungenaue RAM-Auswahl und zu viel Text. Der lokale Dienst lief, seine Zähler enthielten keinen akzeptierten OTP-Aufruf. | Ursache der ursprünglichen Ablehnung am Gerät nicht reproduziert. ADB meldete danach kein erreichbares USB-Gerät. |
| P1 · Sprache | Negativprobe für den fehlenden Fortsetzungsbutton. DE/EN-Chromium-Prüfung bestätigt Teiltext, Weiterdiktieren in derselben Sprache, spätes Ergebnis nach Abbruch und Texteingabe. Android kompiliert die segmentierte Anfrage mit Rückfall auf Einzelergebnis. | Ob die installierte Android-Erkennung längere Pausen akzeptiert, muss ein Diktat am Gerät zeigen. Physisches iOS-Diktat offen. |
| P2 · Suche und Preis | 199 Unit-Tests, Typprüfung, Build, Chromium-Standard und der persönliche DE/EN-Ablauf über den lokalen Dienst bestanden. RAM-Regression prüft 128 GB, DDR5-Kits und unveränderten Text bei «2x38 oder 128gb». Zwei aktuelle direkte Händlerprüfungen siehe unten. | Für Arbeitsspeicher fehlt eine belegte Händlerquelle im aktuellen Katalog. |
| P3 · Persönlicher Einstieg | Ein Tipp öffnet das Testkonto, erst danach erscheint das Suchfeld. DE und EN prüfen echte Aufrufe an den isolierten Dienst, separate Code-Eingabe, abgelaufene Sitzung, offenen und bestätigten Testpreis, Fehler und Speichern. Update-APK mit V2-Signatur, identischem Zertifikat und geprüften UI-Assets. | Aktualisierte APK auf physischem Android installieren. Der neue iOS-Simulatorlauf war bei Dokumentation offen. |
| P4 · Weitere Blocker | Geschützter Live-Einstieg beginnt mit Anmeldung. Öffentliche Vorbereitung des Entwurfs bleibt als Nebenaktion verfügbar. Verkürzter Testeinstieg, Entwurf bei abgelaufener Sitzung und getrennte Testmarkierung geprüft. | Der geschützte native Live-Pfad braucht einen getrennt freigegebenen UDI-HTTPS-Suchdienst, ein dafür vorgesehenes Auth-Projekt mit öffentlichem Client-Schlüssel und ein freigeschaltetes Konto. |

APK-Datei `UDI Android Test v2.apk`, 4’215’453 Bytes. SHA-256 `D025A330AA32442FE0C9C93F29A279CE7D028F8448522B2E9CBAF6B5D145C919`. Die APK liegt lokal im Ausgabeordner des Arbeitsauftrags. Das Update verwendet Paket `stream.soundweave.udi` und kann über die erste Testinstallation installiert werden. Der Testdienst bleibt für den nativen Zugriff auf Loopback und ADB-USB-Rückleitung angewiesen.

Auf `ffc1718` waren Android-Standard und beide iOS-Profile erfolgreich. Der ältere Android-Testprofillauf wurde abgebrochen. Die früheren Erfolge beschreiben ihre jeweiligen Quellstände. [Älterer Plattformlauf](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46131573691) · [Plattformlauf für das Update](https://github.com/essenmitpassion-sudo/Catworld/actions/runs/46134703350).

## Echte Händlerprüfung am PC

Die normale Quellprüfung rief in DE und EN die bereits zugelassenen Händlerseiten auf. Produkt und Hersteller-ID `MZ-V9P2T0BW` entsprachen der Samsung 990 PRO 2 TB. Beide Seiten waren erreichbar und meldeten ein aktives Angebot. Der Browser öffnete jeweils die passende Produktseite.

| Quelle | Prüfzeit UTC | Artikelpreis | Lieferkosten und Endpreis |
|---|---|---|---|
| [DQ Solutions](https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011) | 10:21:20 | CHF 439.00 | Schweizer Lieferziel, Versand und vollständiger Gesamtbetrag blieben im Beleg offen. |
| [MIXEL Shop](https://shop.mixel.ch/product/samsung-ssd-990-pro-m-2-2280-nvme-2000-gb-1425209) | 10:21:58 | CHF 450.90 | Schweizer Lieferziel, Versand, Zustand und vollständiger Gesamtbetrag blieben im Beleg offen. |

Beide Angebote blieben Teilbelege. Daraus folgt keine Endpreis-Empfehlung. Der PC-Lauf verwendete den bestehenden direkten Katalogweg ohne KI-Modellaufruf. Der nächste native Schritt ist das Update auf dem wieder verbundenen Android-Handy. Danach Ein-Tipp-Anmeldung, eine Suche und ein längeres Diktat mit Pausen praktisch prüfen. Der getrennte Testdienst und die Live-Anbindung haben eigene Abnahmen.
