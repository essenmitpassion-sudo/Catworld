# UDI – SICHTBARER UI-DURCHBRUCH UND ECHTE PRODUKTVERBESSERUNG

## Mission

Die UDI-App wirkt derzeit austauschbar und „0815“. Frühere allgemeine Design-Prompts haben keinen ausreichenden Fortschritt gebracht. Behandle das als ungelöstes Produkt- und Designproblem – nicht als Auftrag, ein paar Farben oder Karten anzupassen.

Untersuche die bestehende App und setze eine eigenständige, moderne und intuitiv verständliche Benutzeroberfläche **direkt im vorhandenen Projekt** um. Das Ergebnis muss als echter Vorher-Nachher-Fortschritt erkennbar und in der verfügbaren App-Umgebung praktisch nachvollziehbar sein.

UDI soll vermitteln:

> **Ich beschreibe, was ich brauche. UDI denkt mit, findet passende reale Möglichkeiten und hilft mir, die beste davon zu wählen.**

Die App soll nicht wie ein gewöhnlicher Preisvergleich oder ein generisches KI-Dashboard wirken. Ihr Charakter entsteht aus der Verbindung von einfacher Eingabe, intelligenter Suche, nachvollziehbaren Ergebnissen und einer klaren nächsten Handlung.

Android und iOS sind gleich wichtig. Schweiz, Deutsch und Englisch bleiben aktiv. Bestehende Funktionen, Architektur und bereits getroffene Produktentscheidungen sind Ausgangspunkt. Erfinde keine Funktionen, Angebote, Daten oder bereits verfügbaren Fähigkeiten.

## Arbeitsregeln

- Arbeite selbstständig und warte nicht auf eine Freigabe für normale, reversible Design- und Implementierungsentscheidungen.
- Liefere keine reine Analyse, Präsentation, Konzeptgrafik oder To-do-Liste. Setze die wertvollste Verbesserung im Projekt um.
- Beginne mit dem kleinsten vollständigen Schritt, der einen grossen sichtbaren Nutzen bringt. Vermeide einen unnötigen Komplettumbau.
- Sichere den vorhandenen Arbeitsstand vor riskanten Änderungen und speichere Fortschritte nachvollziehbar.
- Ein lokaler Blocker stoppt nur die davon abhängigen Arbeiten. Erfinde keine erfolgreichen Prüfungen und umgehe keine Schutzmechanismen.
- Verursache keine Kosten, veröffentliche nichts und ändere keine externen Dienste.

## P0 – Den tatsächlichen Zustand aufnehmen

Prüfe vor Änderungen die Projektstruktur, den aktuellen Stand und den echten UI-Ablauf. Starte die App oder die vorhandene Vorschau, sofern die Umgebung es ermöglicht.

Erstelle intern eine vollständige Übersicht der vorhandenen Ansichten und Zustände. Prüfe mindestens:

- Einstieg und Hauptnavigation
- Sucheingabe und gegebenenfalls Spracheingabe
- Suchergebnisse und Angebotsdetails
- Lade-, Leer-, Fehler- und Offline-Zustände
- Anmeldung, Einstellungen und relevante Unterseiten, soweit vorhanden
- Deutsch/Englisch, Bildschirmgrössen und Plattformunterschiede

Dokumentiere konkrete Ursachen für den generischen Eindruck. Prüfe insbesondere Informationshierarchie, Hauptaktion, Orientierung, Wiedererkennbarkeit, Lesbarkeit, Abstände, Komponenten, leere Flächen und unnötige Reibung im Ablauf. Lies nicht nur den Quellcode: Nutze echte Screens oder Vorschauen, wenn verfügbar.

Erfasse ausserdem bestehende Fehler und unvollständige Funktionen, damit das Redesign sie nicht verdeckt oder fälschlich als fertig darstellt.

## P1 – Eine klare, eigenständige Designrichtung wählen

Entwickle intern drei deutlich unterschiedliche visuelle Richtungen. Beurteile sie nach:

- Wiedererkennbarkeit und Passung zu UDI
- Vertrauen und Verständlichkeit
- Einfachheit im täglichen Gebrauch
- guter Lesbarkeit auf kleinen Displays
- Umsetzbarkeit mit der vorhandenen Technik

Wähle die stärkste Richtung selbst und begründe die Entscheidung knapp. Warte nicht auf meine Auswahl.

Definiere eine erkennbare visuelle Signatur für UDI: bewusste Typografie, Farbrollen, Formensprache, Abstände, Icons, Bewegung und wiederverwendbare Komponenten. Sie soll durch konkrete Produktentscheidungen entstehen, nicht durch Dekoration. Vermeide austauschbare Standard-Dashboards, endlose gleichförmige Karten, beliebige Verläufe, übertriebene Schatten und Glas-Effekte.

## P2 – Den wichtigsten Nutzerweg neu gestalten

Setze zuerst den zusammenhängenden Kernablauf um:

**Start → Suchwunsch eingeben → Ergebnisse verstehen → sinnvoll weiterhandeln**

Dieser Ablauf muss innerhalb weniger Sekunden vermitteln, was UDI leistet und wo der Nutzer beginnen soll. Die Eingabe soll einfache Suchbegriffe und natürlich formulierte Wünsche unterstützen, soweit das bestehende Produkt dies ermöglicht.

Ergebnisse sollen – sofern die vorhandenen Daten es hergeben – auf einen Blick zeigen:

- warum ein Ergebnis zum Wunsch passt
- den tatsächlich verfügbaren Preis und relevante Zusatzkosten
- Händler, Quelle und Verifizierungsstatus
- Voucher oder andere real nutzbare Vorteile
- den wichtigsten Unterschied zwischen den passenden Optionen
- die sinnvollste nächste Handlung

Wenn Daten oder Funktionen dafür fehlen, stelle die Grenze ehrlich und klar dar. Erzeuge keine Beispielangebote, Fake-Voucher, erfundenen Prüfzeichen oder leeren Versprechen, um die Oberfläche überzeugender wirken zu lassen.

Reduziere unnötige Entscheidungen. Nutze gute Standardwerte, klare Beschriftungen, verständliche Rückmeldungen und gezielte Hilfen. Mikroanimationen dürfen Orientierung und Status verbessern, aber niemals die Bedienung verlangsamen oder die Hauptaktion verstecken.

## P3 – Das Redesign konsistent in der App verankern

Baue die ausgewählte Richtung als belastbare, wiederverwendbare UI-Grundlage in die bestehende Architektur ein. Übertrage sie anschliessend auf die übrigen vorhandenen Ansichten, soweit das ohne unverhältnismässigen Umbau möglich ist. Die App muss auch ausserhalb des Startbildschirms wie ein zusammenhängendes Produkt wirken.

Prüfe dabei:

- konsistente Navigation, Komponenten und Zustände
- Deutsch und Englisch, einschliesslich längerer Texte
- kleine und grössere Displays sowie Tastaturverhalten
- Kontrast, Schriftgrössen, Touch-Ziele und Screenreader-Grundlagen
- Plattformbesonderheiten von Android und iOS
- bestehende Funktionen und Datenflüsse, die durch UI-Änderungen berührt werden

Ändere keine Geschäftslogik oder Produktfunktion ohne konkreten Grund. Wenn eine UI-Schwäche durch einen funktionalen Engpass entsteht, behebe den kleinsten sinnvollen Teil mit und erkläre die Auswirkung.

## P4 – Kritisch prüfen und verbessern

Prüfe das Ergebnis selbstständig aus Sicht eines neuen Nutzers:

1. Ist der Zweck der App ohne Erklärung verständlich?
2. Ist der erste sinnvolle Schritt sofort erkennbar?
3. Kann man den Kernablauf ohne Rätselraten durchlaufen?
4. Wirkt UDI eigenständig oder könnte die Oberfläche zu einer beliebigen Vergleichs-App gehören?
5. Sind Preis, Quelle, Nutzen und nächste Handlung glaubwürdig und verständlich?
6. Funktionieren die Ansichten in Deutsch und Englisch sowie auf beiden Plattformen?
7. Gibt es abgeschnittene Texte, Sackgassen, falsche Zustände oder nur dekorative Bedienelemente?

Wenn eine zentrale Ansicht nach einem Standard-Template aussieht oder der Ablauf noch unnötig kompliziert ist, überarbeite sie vor Abschluss. Ergänze keine neuen Funktionen, bevor die wichtigste belegte Schwäche des Redesigns behoben ist.

## Abnahme und Bericht

Zeige die tatsächlich umgesetzte Oberfläche mit den verfügbaren Emulator-, Simulator- oder App-Vorschauen. Liefere, wenn vorhanden, einen aussagekräftigen Vorher-Nachher-Vergleich des Kernablaufs.

Berichte knapp und konkret:

- die wichtigste gefundene Ursache des „0815“-Eindrucks
- die gewählte Designrichtung und ihr UDI-spezifischer Wiedererkennungswert
- die tatsächlich geänderten Ansichten und Komponenten
- welche Abläufe und Plattformen du praktisch geprüft hast
- welche Prüfungen nicht möglich waren und warum
- die nächste wertvollste Verbesserung, falls noch eine wesentliche Lücke bleibt

Trenne klar zwischen **implementiert**, **automatisch geprüft** und **praktisch auf Gerät oder Vorschau verifiziert**. Ein erfolgreicher Build allein belegt keine gute Bedienbarkeit. Behaupte keine Prüfung, die nicht stattgefunden hat.

**Oberste Leitlinie:** Baue keinen weiteren Designvorschlag. Mache UDI sichtbar eigenständiger, spürbar einfacher und praktisch überprüfbar – mit dem kleinsten Umbau, der einen grossen echten Fortschritt liefert.