# Phase2 · aktive Züge und Tempo-Kontrolle

Ausgangspunkt34a7e57, Auftrag PHASE_2_DIRECTIVE.md. Neue Regelversion v2, serialisierte Spielstände3. Keine neue Figur, Ressource oder zusätzliche Produkt-Spielart. Standardaufstellung und Bewertungsfunktion bleiben unverändert.

## Konkreter Fehler

In den aufgezeichneten Mehrfiguren-Schleifen26/27/30 konnten Spieler eine Figur horizontal bewegen und durch entgegengesetzten Versatz zum Ausgangspunkt zurückbringen, ohne irgendeine andere Figur zu verändern. Das war ein versteckter Pass trotz „keine Pass-Züge“. Dasselbe Brett wurde unmittelbar erneut angeboten.

Nicht jeder solche Wartezug ist strategisch sinnlos. Deshalb wurden Varianten als echte Regelmodelle mit jeweils passender Legalität, Suche und Endspiellösung verglichen, nicht eine angepasste KI gegen eine regelunkundige alte KI. Der kontrollierte Umfang bleibt klein; menschlicher Spielspaß und perfekte Eröffnungsbalance sind ungeprüft.

## Drei Ansätze und Entscheidung

| Ansatz | Erwarteter Nutzen | Kosten / Befund |
|---|---|---|
| Evolution: aktiver Zug | Brett muss sich verändern oder sofort gewinnen; erzwungene Bewegung schafft Tempo-Fallen | Kleine Zusatzregel; echte Warteverteidigung entfällt. Ausgewählt nach Tests und konkretem exaktem Gegenspielnachweis. |
| Innovation: Resonanz | Eine nach dem Schritt gemischt besetzte Reihe verschiebt sich zwei statt ein Feld | Neue Interaktion, aber zusätzliche Bedingung und mehr Torrennen. In14 nativen Proben10 Starter-/2 Nachziehersiege,2 Remis; nur28 Schläge statt50/51. Nicht übernommen; kein allgemeiner Unfairnessbeweis aus dieser kleinen Stichprobe. |
| Radical: gegnerische Steuerung | Aktiver Spieler setzt den Schritt, Gegner wählt den Versatz; robuste Doppelbedrohungen würden wichtig | Zwei Entscheidungen pro Zug, schwächere Einzelstein-Torattacken, anderer Such-/UI-Ablauf. Wegen des klaren Konflikts mit schnellen einfachen Zügen nicht als erster Umbau prototypiert. Keine erfundenen Vergleichsresultate. |

Nur der aktive Zug wurde ins Produkt übernommen. Der bekannte Rückkehrzug bleibt gültig, wenn andere Figuren mitreisen oder ein Gegner geschlagen wird. Der sofortige Gewinn bleibt als Ausnahme erlaubt, damit ein zuvor ins Tor transportierter Stein nicht zum Verlassen des Tores gezwungen wird.

## Kontrollierte Vergleiche

`phase2-comparison.json`:60 vollständige Partien, getrennt nach42 nativen Eröffnungen und18 ausdrücklich frischen Vergleichs-Zwischenstellungen. Gespiegelte Starts/Farben, alternative Renn-/Materialbewertung, Tiefe3/4 und vorhandener exakter1v1-Löser. Paare und gleiche Spuren sind korreliert;60 Partien sind keine60 unabhängigen Startstellungen.

| Native Eröffnungen, jeweils14 | v1 | Aktiver Zug | Resonanz |
|---|---:|---:|---:|
| Starter / Nachziehender / Remis |7 /5 /2 |9 /4 /1 |10 /2 /2 |
| Mittlere Halbzüge |24,57 |24,21 |19,57 |
| Leere Züge |17 |0 |13 |
| Schläge |51 |50 |28 |
| Züge mit mindestens2 tatsächlich mitreisenden Figuren |166 |175 |122 |

Die sechs frischen Mehrfiguren-Stellungen bleiben unter v1 und aktivem Zug remis. v1 endet nach durchschnittlich4 Halbzügen ohne Schlag oder gemeinsamen Transport. Aktiv dauert es17,33 Halbzüge mit4 Schlägen und30 gemeinsamen Transporten insgesamt. Es entstehen wieder räumliche Entscheidungen; die Stellungen sind dadurch nicht nachweislich gewonnen. Die Resonanz gewinnt4/6 dieser frischen Stellungen, teils sofort – das sind Gegenproben auf identischen Brettern, keine Starterquote aus nativen Partien.

Ein unabhängiger Reviewer fand einen Messfehler beim gemeinsamen Transport: Vorher wurde die Reihenbelegung vor dem Schritt gezählt. Eine vertikale Ankunft wurde übersehen, ein Schlag auf eine von zwei Figuren fälschlich mitgezählt. Zwei gezielte Regressionen wurden rot/grün geprüft, der Zähler nutzt jetzt die überlebenden Figuren nach dem Schritt. Alle60 Partieverläufe blieben beim erneuten Lauf identisch; nur die korrigierten Messwerte änderten sich.

Eine vollständige beschränkte Siegsuche findet weder kompakt noch versetzt einen erzwungenen Startersieg innerhalb von7 Halbzügen (25.747 bzw.28.742 Knoten). Längere erzwungene Eröffnungen sind offen.

## Neue taktische Möglichkeiten, nicht bloß andere Statistiken

`phase2-tactics.json` enthält zwei native, unter beiden Modellen legal erreichte Historien:

- Nach16 Halbzügen ist die konkrete1v1-Stellung unter v1 bei perfektem Spiel remis. Mit aktiven Zügen ist sie in13 weiteren Halbzügen gewonnen. Exakte Controller erreichen unter v1 das Remis bei34, unter v2 den korrekten Sieg bei29. Dies ist ein konkreter Spielwertwechsel, kein heuristisches Plus und keine Aussage zur ganzen Eröffnung.
- Eine zweite Stellung erlaubt eine Tempo-Falle: Nach dem vorbereitenden Zug hat der Verteidiger genau3 legale Antworten. Jede ermöglicht danach Tor- oder Eliminationssieg. Der alte Leerzug hätte die unmittelbare Drohung verzögert. Der kürzeste erzwungene Sieg verkürzt sich von5 auf3 Halbzüge. Der Verteidiger war dort vorher bereits verloren; es wird kein neuer Gewinn aus Remis behauptet.

Beide1v1-Regelmodelle wurden getrennt vollständig berechnet. Bei vollem120-Halbzug-Limit und ohne frühere Wiederholungen hat die geometrische Aufzählung1.200 Anordnungen: v1 ergibt696 Gewinne/282 Verluste/222 Remis für die ziehende Seite, v2 ergibt762/326/112.110 Einstufungen ändern sich. Das ist keine Eröffnungsbalance-Statistik und enthält auch nicht als lebender Anfangszustand erreichbare Anordnungen.

## Produkt und Prüfung

Richtungsspezifische Legalität, unveränderte Siegzeitpunkte, Gate-Gewinnausnahme, unabhängige Koordinatenprüfungen sowie neu berechneter1v1-Graph. Serialisierung3 und eigener Browser-Schlüssel für neue Partien: Der alte v1-Spielstand wird unverändert erhalten; gültige Einstellungen können übernommen werden. Der Versionswechsel wird angezeigt. Ungültiges gespeichertes JSON verhindert weder Spiel noch weiteres Speichern.

Ist eine Richtung ein Leerzug, bleibt sie deaktiviert und wird erklärt. Die erste tatsächlich legale Richtung wird gewählt, auch bei Tastaturbedienung. Synthetische Klicks auf deaktivierte Richtungen können den Plan nicht ändern. Rücknahme, Replay, vollständige Vorschau, echter Schlag, linke/rechte Randumwicklung, schrittweise Animation und mobile Sichtbarkeit bleiben geprüft.

Die aktuelle800-Profil-Stichprobe aus `playtest-current.json` hat41 Remis statt76 im früheren v1-Pool; Wiederholungsremis13 statt48, Limitremis unverändert28. Mittlere Dauer45,67 statt48,80 Halbzüge. Regeln und damit die Auswahl gleich gesäter Zufallszüge ändern sich; das ist keine isolierte Humanstudie. Gleich starke taktische Bots gewinnen37/48 als Starter über vier Formationen; auf der Standardformation8/12. Ein fairer50/50-Nachweis liegt ausdrücklich nicht vor. Die Formation wird nicht nach dieser einen KI-Zahl neu ausgewählt.

Reproduktion: `npm run research` (60 Modelle), `npm run research:endgames` (konkrete v1/v2-Beweise), `npm run simulate` (aktuelle800 Profile), alle Browser-Suiten. Historische reine Kontrollmodule liegen ausschließlich unter `research/rules-v1`, werden nicht in die Browser-App importiert und erhalten keine alte Produktoberfläche.

Offen: Mehrfiguren-Zyklen mit tatsächlicher Bewegung, längere erzwungene Eröffnungen, Robustheit gegen stärkere/anders bewertende Politiken und menschliche Erstpartien. Tempo-Kontrolle ist bewiesen verfügbar; Spielspaß und Wiederholungswunsch sind weiterhin ungemessen.
