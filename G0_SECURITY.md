# G0: Sicherheitsgrenze und technische Entscheidungen

Der Runner interpretiert ausschliesslich vollständig validierte AST-Formen
`Expr(Call(Name('move_right'), args=[], keywords=[]))`. Aus dem AST werden nur
Zeilennummern übernommen, keine ausführbaren Python-Objekte. Es gibt weder eval,
exec, compile-Ausführung, dynamische Imports noch Spielercode-I/O.
Python wird mit ast.parse gelesen; Grammatik, Kommentare und Reihenfolge entsprechen
der ausdrücklich unterstützten Teilmenge. Alle anderen Konstrukte werden abgewiesen.

Budgets: 4096 Zeichen vor dem Parser, 320 AST-Knoten, Tiefe 16, 64 Befehle,
64 Ausführungsschritte. Konstanten/Container/Schleifen/Rekursion werden nicht
interpretiert. Ein Tick verarbeitet höchstens einen Befehl, auch nach langen Frames.
Stop wird vor dem nächsten Tick verarbeitet. Ein ungültiges Programm wird vollständig
abgewiesen, bevor irgendeine seiner Aktionen ausgeführt wird. Weltzustand ist immutable.

Bedrohungsmodell: lokal eingegebene Programme im G0-Editor. Die kleine Eingabegrenze
begrenzt Parserarbeit; es gibt kein hartes OS-Zeit-/Speicherlimit. Dies ist keine
allgemeine Sandbox für externen Python-Code. Fremdskript-Import und allgemeines Python
sind nicht implementiert. Vor einer Erweiterung: neue Negativtests, Ressourcenbudgets
und separate Sicherheitsprüfung; bei externen Skripten zusätzlich Prozessisolation.

Designentscheidungen: pygame-ce gemäss ARCHITECTURE; eine unveränderliche Welt,
ein kooperativer Runner, deklarative G0-Texte und ein SDL-UI. Kein Server, keine
Framework-Schicht, keine Assets fremder Spiele. Pixelgrafik wird aus eigenen Formen
gezeichnet. Die fünf Modulbereiche bleiben core/code/content/ui/tests.

Prüfgrenzen: automatisierte State- und SDL-Ereignistests, visuell inspizierte Screenshots.
Kein unabhängiger Security-Audit, kein menschlicher Lern-/Spassnachweis, kein Windows-Test.
