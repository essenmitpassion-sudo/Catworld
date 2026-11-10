# G0/G1: Sicherheitsgrenze und technische Entscheidungen

Der Runner interpretiert ausschliesslich vollständig validierte AST-Formen
`Expr(Call(Name(action), args=[], keywords=[]))` mit action aus der festen Menge
`move_right`, `move_left`, `collect`, zusätzlich begrenzte Top-Level-For-Schleifen. Aus dem AST werden nur
Zeilennummern und validierte Aktionsnamen übernommen, keine ausführbaren Python-Objekte. Es gibt weder eval,
exec, compile-Ausführung, dynamische Imports noch Spielercode-I/O.
Python wird mit ast.parse gelesen; Grammatik, Kommentare und Reihenfolge entsprechen
der ausdrücklich unterstützten Teilmenge. Alle anderen Konstrukte werden abgewiesen.

Budgets: 4096 Zeichen vor dem Parser, 320 AST-Knoten, Tiefe 16, 64 Befehle,
64 Ausführungsschritte. For-Schleifen erlauben nur `range` mit 1–3 vorzeichenbehafteten
ganzzahligen Literalen (Betrag höchstens 64, kein bool, keine Ausdrücke, Schrittweite
ungleich null). Python-range-Semantik, auch leere und absteigende Bereiche. Höchstens
64 Durchläufe insgesamt und 64 expandierte Aktionen, vor Expansion geprüft.
Schleifenvariable nur einfacher Name, ohne Überschreiben von range oder Aktionsnamen;
keine Verwendung der Variable im Rumpf. Keine Verschachtelung, for-else, break oder
continue. Auch leere Schleifenrümpfe werden vollständig statisch validiert.
Container, Rekursion und allgemeine Ausdrucksauswertung bleiben ausgeschlossen. Ein Tick verarbeitet höchstens einen Befehl, auch nach langen Frames.
Stop wird vor dem nächsten Tick verarbeitet. Ein ungültiges Programm wird vollständig
abgewiesen, bevor irgendeine seiner Aktionen ausgeführt wird. Weltzustand ist immutable.

Bedrohungsmodell: lokal eingegebene Programme im Editor. Die kleine Eingabegrenze
begrenzt Parserarbeit; es gibt kein hartes OS-Zeit-/Speicherlimit. Dies ist keine
allgemeine Sandbox für externen Python-Code. Fremdskript-Import und allgemeines Python
sind nicht implementiert. Vor einer Erweiterung: neue Negativtests, Ressourcenbudgets
und separate Sicherheitsprüfung; bei externen Skripten zusätzlich Prozessisolation.

Designentscheidungen: pygame-ce gemäss ARCHITECTURE; eine unveränderliche Welt,
ein kooperativer Runner, deklarative Einstiegstexte und ein SDL-UI. Kein Server, keine
Framework-Schicht, keine Assets fremder Spiele. Pixelgrafik wird aus eigenen Formen
gezeichnet. Die fünf Modulbereiche bleiben core/code/content/ui/tests.

Prüfgrenzen: automatisierte State- und SDL-Ereignistests, visuell inspizierte Screenshots.
Kein unabhängiger Security-Audit, kein menschlicher Lern-/Spassnachweis, kein Windows-Test.

G1 erweitert nur den Aktionsnamen, nicht die AST-Formen oder Budgets. collect
ändert auf dem Batteriefeld atomar den powered-Zustand: Batterie wird eingesetzt,
Automat eingeschaltet; es gibt noch kein allgemeines Inventar. Erneutes Aufnehmen
oder falsche Position ist ein Weltfehler. Die interne Parserdarstellung enthält
nun (Zeile, Aktion), damit Runner und UI dieselbe geprüfte Sequenz ausführen.

Lokale Entwurfsspeicherung: ausschliesslich begrenztes JSON mit festem Schema,
maximal 65536 Datei-Bytes und 4096 Zeichen je Programm. Typen/Version/Szenario/Unicode
werden geprüft, unbekannte Felder abgewiesen. Laden rekonstruiert nur Text und
Editorzustand; Runner bleibt idle. Erst explizites Run/Step verwendet dieselbe
AST-Prüfung. Keine Ausführung von JSON, keine Pfade aus gespeicherten Daten.
Temporärdatei + fsync + atomarer Ersatz sichern gültige Schreibvorgänge; vorherige
Fassung als Backup. Beschädigte Originale bleiben zur Wiederherstellung erhalten.
Dies bleibt keine allgemeine Sandbox für fremde Python-Programme.

Dachweg-Speicherformat: Version 2 ergänzt einen separaten Dachentwurf; Version 1
bleibt lesbar. Alle drei Programme teilen die Dateigröße von höchstens 65536 Bytes;
diese Grenze wird auch vor dem Schreiben der UTF-8-JSON-Datei geprüft.

Zwei-Laternen-Abschnitt: World ergänzt nur ein optionales zweites Ziel und einen
Teilerfolgsstatus. Der Parser und alle Aktionsbudgets bleiben unverändert. Erst beide
Aktivierungen setzen powered. Neue Versuche starten ohne akkumulierten Fortschritt.
Speicherversion 4 ergänzt den fünften Editor; Versionen 1–3 werden weiterhin validiert
und verlustfrei geladen. Gesamtdateigrenze bleibt 65536 Bytes, je Text 4096 Zeichen.

2026-11-10: move_left ergänzt nur einen erlaubten Aktionsnamen und die negative
Bewegungsrichtung. Keine neue AST-Form, keine veränderten Limits. Kartenrand links
und rechts geprüft; Schleifenvariable darf auch move_left nicht überschreiben.

2026-11-10: Im Laternenpaar ist die Reihenfolge frei. Zwei unabhängige boolesche
Weltzustände bilden die Aktivierungen ab; powered verlangt beide. Doppelte Aufnahme
bleibt ein Fehler. Keine neue Parserform, kein Speicherformatwechsel; Weltzustände
werden weiterhin nicht mit Spielerentwürfen geladen.
