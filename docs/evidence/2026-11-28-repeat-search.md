# Mehrfachtipp bei laufender Suche · 28.11.2026

Ausgangsstand 1fe02c1. Ein zweiter Tipp während einer laufenden Suche brach den ersten Abruf ab und startete dieselbe Anfrage mit einer neuen Request-ID. Der serverseitige Wiederholschutz prüft die Request-ID. Vor der Änderung zählte der laufende isolierte HTTP-Dienst nach zwei Tipps zwei Anfragen für denselben Timeout-Fall.

Die gemeinsame App prüft jetzt vor dem Abbruch, ob Wunsch, Markt, Budget, Suchumfang und weitere Kriterien bereits in der laufenden Anfrage enthalten sind. Ein identischer zweiter Tipp lässt die laufende Suche samt Ladezustand und Abbruchaktion bestehen. Ein bewusst geänderter Wunsch und ein neuer Versuch nach Abbruch oder Timeout bleiben möglich.

Die Gegenprobe misst die tatsächlich am Loopback-Dienst ankommenden Anfragen. In DE bei 320px und EN bei 390px erzeugten dieselben zwei Tipps nach der Korrektur je genau eine Anfrage. Expliziter Abbruch, erneuter Versuch, geänderter Wunsch, Zurückweisen einer verspäteten Antwort und Sitzungswiederherstellung wurden im selben Browserablauf geprüft. 199 Tests, Typprüfung, neuer Build und vollständiger Chromium-Smoke bestanden. Die Gegenprobe verwendet simulierte Konten und Preise.
