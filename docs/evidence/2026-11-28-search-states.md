# Kritische Suchzustände · 28.11.2026

Ausgangscommit 703cc82. Die rote HTTP-Gegenprobe zeigte, dass der Testdienst bei einer Timeout-Eingabe eine Rückfrage statt einer Zeitüberschreitung lieferte. Jetzt deckt derselbe isolierte Dienst die folgenden Zustände ab. Echte Händler- und Modellaufrufe bleiben ausserhalb dieses Tests.

| Eingabe oder Aktion | Erwarteter Zustand |
|---|---|
| Leere Eingabe, Kunden-URL | Der Suchclient weist sie vor der Authentifizierung am Angebotsdienst ab. |
| Mehr Speicher oder More storage ohne Suchumfang | Der Testdienst erlaubt eine gezielte Rückfrage ohne verbrauchtes Kontingent. |
| Unbekannter Suchwunsch | Geprüfte Testantwort ohne Treffer. |
| UDI fixture timeout | Sichtbarer Ladezustand, danach HTTP 504. Die App erklärt die Zeitüberschreitung. |
| UDI fixture unavailable | HTTP 503 mit sichtbarer Fehlermeldung. |
| UDI fixture invalid | Kontrollierter Widerspruch im synthetischen Gesamtpreis. Der Client verwirft die Aussage und zeigt kein Angebot. |
| Suche abbrechen, neue Suche oder Ansicht wechseln | Der vorige Aufruf wird aus Sicht der App beendet. Ein verspätetes Ergebnis kann die Ansicht nicht ersetzen. Der Entwurf bleibt erhalten. |

Der geschützte Client wurde gegen den echten lokalen Fixture-HTTP-Dienst geprüft. Die Chromium-Gegenprobe klickte «Suche abbrechen» in der authentifizierten UI in DE und EN, löste danach die verzögerte alte Antwort aus und bestätigte, dass der Nutzerentwurf erhalten bleibt und die nächste Suche ausführbar ist. Build und vollständiger Chromium-Smoke bestanden. Die native Testansicht sperrt den Produktvergleich und direkte Vergleichsrouten, damit synthetische Suchläufe keine Händlerlinks öffnen. Die gezielten UI-Fälle werden beim persönlichen Teststart nochmals gegen denselben Testdienst ausgeführt.
