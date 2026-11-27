# UDI-Oberfläche · Vorher und nachher · 28.11.2026

## Was sich für Nutzer ändert

Die [Bestandsaufnahme](2026-11-28-search-design-baseline.md) zeigte vor allem eine schwache Hierarchie. Nach der Suche lagen der Suchwunsch und «Suche speichern» vor dem eigentlichen Angebot. Auf 320 × 720 Pixeln lag die erste Preiszeile teilweise hinter der Navigation. Das Beispiel war vor der ersten Suche erst nach dem Scrollen erreichbar.

Der gewählte Sucharbeitsplatz verbindet den dunklen Einstieg, die Eingabe, den Suchknopf und das Beispiel. Nach dem Absenden erhält das Ergebnis eine feste Überschrift und einen direkten Rückweg zum ausgefüllten Wunsch. Ein Preisbeleg bündelt Händler, Variante, Preisstatus, CHF-Betrag, Zusatzkosten und Prüfzeit. Die nächste Handlung kommt aus dem Ergebnis. «Preisdetails und Quelle» öffnet die vorhandenen Kostenbestandteile. Die bestehende Speicherliste nutzt dieselbe Palette und die Anmeldefläche denselben optischen Einstieg. Navigation und Preisvertrag wurden weiterverwendet.

Im gleichen 320-Pixel-Test ist der erste Preis vor der Navigation vollständig sichtbar. Das Browserprotokoll prüft die Lage der Preiszeile im sichtbaren Hauptbereich und nicht nur ihre Anwesenheit im DOM. Die Vorher-Nachher-Bilder stammen aus Chromium und verwenden dieselbe klar markierte Testantwort. Die Vergleichsbilder zeigen CHF 99.00 Artikelpreis mit offenem Versand. Die getrennte Testantwort mit CHF 104.00 ist als Testdaten gekennzeichnet, nennt das geprüfte Test-Lieferziel 8000 (CH) und hat keinen Händlerlink.

## Abnahme

| Bereich | Nachweis |
|---|---|
| Praktisch in der Vorschau | Tatsächliche Browseroberfläche mit isoliertem Loopback-Dienst. DE bei 320 × 720, EN bei 390 × 820. Einstieg, Anmeldung, Ergebnis, Preisdetails, bearbeiteter Wunsch, Laden, Abbruch, Timeout, kaputte Antwort, Dienstfehler, leeres Ergebnis, Speichern und erneutes Öffnen. |
| Automatisierte Breiten- und Tastaturprüfung | Chromium-Smoke mit kleineren, mittleren und grossen Ansichten. Stabile Fokusposition bei asynchronen Ergebnissen, direkte Rückkehr zum vorhandenen Eingabetext, kein horizontaler Überlauf im lokalen DE/EN-Lauf bei 200 % Schriftgrösse. Mindestens 44 CSS-Pixel Höhe für die Angebotsaktion und 48 CSS-Pixel für den Suchknopf. |
| Kontrast | Aus den CSS-Farben berechnet. Heller Einstiegstext auf Waldgrün über 9:1, Sekundärtext auf Papier über 6:1 und Hinweis auf Testdaten über 7:1. Der Bediennachweis deckt Fokus und semantische Zustände ab. VoiceOver und TalkBack auf physischen Geräten stehen aus. |
| Aktuelle Quellenprüfung | MIXEL lieferte für die Produktvariante MZ-V9P2T0BW in DE und EN CHF 450.90. Beide Abrufe meldeten aktiven Bestand und führten zur echten Produktseite. Abrufe am 28.11.2026 um 00:34 MEZ. Lieferziel und Endpreis blieben offen. [MIXEL](https://shop.mixel.ch/product/samsung-ssd-990-pro-m-2-2280-nvme-2000-gb-1425209) |
| Systemtests | 199 Tests, Typprüfung und Build erfolgreich. Separate Nachweise für Android-Emulator und iOS-Simulator stehen beim [persönlichen Teststart](../UDI-TESTEN.md#native-prüfung) und in den CI-Läufen. |

Die Vorschau verwendet dieselbe Oberfläche wie beide nativen Profile. Der Windows-Start prüft die Tastatur, Suchzustände und Darstellung. Ein physisches Gerät steht für die Abnahme von Mikrofon, Spracherkennung, Bildschirmtastatur und Screenreader aus.
