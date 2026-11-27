# Einfache KI-Suche · erster Schweizer Kaufentscheid · 28.11.2026

## Eine Eingabe bis zum Beleg

Geprüfter Wunsch in DE und EN. «Ich suche eine Samsung 990 PRO 2 TB ohne Kühlkörper bis CHF 500.» Der direkte Katalogweg löst MZ-V9P2T0BW und das CHF-Budget auf. Er prüft die konfigurierte Varianten-URL und verarbeitet Bestand, Artikelpreis, zusätzliche Kosten und Aktualität getrennt. Für diese Variante laufen null Modell- und null kostenpflichtige Suchindex-Aufrufe. Die Betreiberkonfiguration entscheidet über erreichbare Quellen. Im lokalen Test verwendet die App ausschliesslich den isolierten Dienst mit Testanmeldung.

In der App steht über der ersten Karte jetzt die Antwort auf die Preisfrage. «Endpreis noch offen», «Endpreis laut Quelle» und «Endpreis bestätigt» verwenden die Belegstufe der sichtbaren Angebote. Bei gemischten Belegen nennt UDI bestätigte Anzahlen oder offene Gesamtkosten. Jede Karte zeigt ihren eigenen Status und gegebenenfalls ihr Lieferziel. Der Betrag und die offenen Bestandteile sind im 320-Pixel-Vorschaufenster direkt sichtbar. Keine Empfehlung aus einem Artikelpreis mit unbekanntem Versand.

Die vorherige UI-Gegenprobe fand nur «Testantwort». Mit der neuen Überschrift bestanden der isolierte DE/EN-Lauf und der vollständige Chromium-Smoke. Bei CHF 99.00 in der Testansicht bleibt der Endpreis offen. Die getrennte Testantwort für CHF 104.00 nennt eine simulierte Checkout-Bestätigung für 8000 CH. Beide sind sichtbar als Testdaten markiert und haben keinen Händlerlink. Der Fachtest des Antwortvertrags deckt auch Aktualität, unbekannte Kosten und widersprüchliche Endpreise ab.

## Vergleich ausgewählter Suchaufgaben

| Suchaufgabe | Manuelle Recherche | Von UDI tatsächlich übernommen | Grenze |
|---|---|---|---|
| 990 PRO, 2 TB, ohne Kühlkörper, bis CHF 500 | Varianten vergleichen, Hersteller-ID kontrollieren, passende Händler öffnen, Artikelpreis und Versand auseinanderhalten | Regulärer DE/EN-Abruf erreichte die konkrete MIXEL-Produktseite mit MZ-V9P2T0BW, aktivem Bestand und CHF 450.90. UDI fasst Artikelpreis und offenen Versand zusammen und gibt die Quelle weiter. | Abrufe um 00:34 MEZ. Lieferziel und Endpreis offen. Späterer Wiederholungslauf ohne frischen Seitenbeleg. |
| Gleiche SSD, nur mit vollständigen Kosten | Versand, Steuern und Gebühren für das Lieferziel zusammentragen, gegebenenfalls beim Händler erfragen | Bestehender Filter liess im belegten DE/EN-Lauf nur vollständige Angebote durch und meldete den fehlenden Gesamtpreis. In der Testansicht sind beide Preiszustände reproduzierbar. | Verbindlicher Check beim realen Händler bleibt offen. |
| Unbekannte Variante, Dienstleistung oder Reise | Relevante Fachquellen finden, Verfügbarkeit und aktuelle Bedingungen getrennt lesen | Eine unbekannte Produktanfrage führt zur belegten Quellenlücke oder zu einem leeren Ergebnis im isolierten Dienst. Die App hält den Suchwunsch zur Bearbeitung bereit. | Für Dienstleistungen, lokale Angebote, Tickets und Reisen fehlen derzeit für UDI nutzbare Quellen und eigene Abnahmesätze. |

Die Tabelle vergleicht Arbeitsschritte. Zeitersparnis und Präferenz gegenüber einer Suchmaschine wurden noch nicht mit Nutzern gemessen. Quellenlage und Preisprüfung sind separat datiert. [MIXEL-Angebot](https://shop.mixel.ch/product/samsung-ssd-990-pro-m-2-2280-nvme-2000-gb-1425209) · [Bestehende Endpreisfilterprüfung](2026-11-27-endprice-filter.md) · [Suchdesign-Prüfung](2026-11-28-search-design.md).

## Anbieter und Aufwand

| Weg | Entscheidung für den Pilot |
|---|---|
| UDI-betriebener geschützter Dienst | Gewählt für den normalen Ablauf. Insbesondere bekannte Katalogabfragen benötigen keine Modellwahl. Für spätere komplexere Anfragen existiert im Entwicklungsdienst ein Anbieteradapter. Geschützter echter Dienst, Abrechnung und Providergrenzen bleiben separat zu belegen. |
| Direkte Anbieterintegration | OpenAI und Gemini erfordern separate API-Projekte und Policys. Ausgewählte ChatGPT-Abos bieten dafür API-Guthaben in einer verknüpften Organisation. Das ist kein genereller Zugriff mit dem App-Login. Bei Gemini prüft UDI Projektabrechnung und Datenverwendung des gewählten Tiers vor dem Einsatz. [OpenAI](https://developers.openai.com/api/docs/guides/chatgpt-api-credits) · [Google](https://aistudio.google.com/docs/billing) · [Gemini-Regeln](https://ai.google.dev/gemini-api/terms) |
| Nutzerkonten bei Anbietern | Anthropic ermöglicht in einer Beta die Verknüpfung bestimmter Claude-Console-Organisationen per OAuth samt möglicher Direktabrechnung. Kein Startpfad für UDI. Pro Anbieter sind Zulassung, Einwilligung, Abrechnungsgrenze und Rückfall eigens zu belegen. [Claude Linked Billing](https://support.claude.com/en/articles/18467110-offer-linked-billing-in-your-platform) |
| Installierte Apps und plattformvermittelte Übergaben | Offizielle Sharesheets übergeben mit einer Nutzeraktion Inhalt an ein ausgewähltes Ziel. Das belegt keine für UDI verfügbare Modellantwort. [Android Sharesheet](https://developer.android.com/training/sharing/send) · [iOS ShareLink](https://developer.apple.com/documentation/swiftui/sharelink) |

Der erneut ausgeführte Modell-Replay erreichte 11/11 sichere Nutzentscheidungen sowohl im Einzelmodell als auch mit Gegenprüfung. Die Gegenprüfung benötigte neun statt sieben synthetische Modellaufrufe. Null externe Anfragen und null reale Modellkosten. Ohne gemessenen Zusatznutzen bleibt die standardmässige Gegenprüfung deaktiviert. Ein echter Vergleich benötigt zwei autorisierte unabhängige Anbieter, ein gleiches Kosten-/Informationsbudget, echte Laufzeiten und gemessene Abrechnung. [Vergleich](2026-11-27-multi-ai-replay.md).

Der vorhandene Rechner modelliert CHF 0.0106, 0.0213 und 0.0319 je Suche mit einem, zwei und drei Aufrufpaketen inklusive Suchindex, Schätzwerten und Reserve. Bei 1 000 monatlich Aktiven, 5 % Plus, voller Nutzung von 3/25 Suchen und den eingetragenen Betriebsannahmen ergibt sich folgende Sensitivität.

| Planungspreis pro Monat | 1 Aufrufpaket | 2 Aufrufpakete | 3 Aufrufpakete |
|---:|---:|---:|---:|
| CHF 3.00 | CHF 28.21 | −CHF 15.43 | −CHF 59.08 |
| CHF 3.90 | CHF 56.52 | CHF 12.88 | −CHF 30.77 |
| CHF 4.00 | CHF 59.67 | CHF 16.02 | −CHF 27.62 |

Die Werte sind modellierte monatliche Betriebsergebnisse. Authentifizierung, Quellenlizenzen, Mehrverbrauch beim Hosting, Missbrauch, Support und weitere Betriebskosten sind noch offen. Die native Spracheingabe fordert lokale Erkennung an und verursacht in diesem Pfad keinen UDI-Modellaufruf. Weitere Medien sind kein Bestandteil dieser Rechnung und benötigen einen eigenen Budgetnachweis. CHF 3.90 und 3/25 Suchen bleiben Planungswerte. Das persönliche Testkonto verwendet drei Test-Suchen pro Dienststart. Ein produktives Abo oder eine kostenpflichtige Fortsetzung wird dadurch nicht aktiviert. [Kostenmodell](../ECONOMICS.md).
