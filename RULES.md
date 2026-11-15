# SIGNALBRUCH / Regeln 0.2

## Ziel und Karte

Die gegnerische Zentrale beginnt mit 6 Stabilität. Bringe sie durch ankommende gegnerische Signale auf 0. Fallen beide Zentralen im gleichen Netztakt aus, endet die Partie unentschieden. Ohne Ausfall gibt es nach 24 Netztakten ein Remis. Freundliche Signale zur eigenen Zentrale kehren wirkungslos zurück; sie reparieren nichts.

Neun öffentliche Knoten: zwei Zentralen, vier autonome Siedlungen und drei gemeinsame Relais. Verbindungen zeigen ihre feste Reisezeit von 1–3 Netztakten. Links/rechts sind gespiegelt; Seed-Varianten verändern wenige Laufzeiten und die anfängliche Mittelweiche, keine verborgenen Informationen.

## Eingriff und Netztakt

Beide Seiten führen je einen Eingriff aus, dann bewegt sich das gesamte Netz einen Takt. Danach wechselt das Startrecht. Dadurch kann eine Seite unmittelbar vor und nach einem Netztakt handeln; das sind zwei verschiedene Runden. Der Seed bestimmt die anfängliche Startseite. Ohne laufende Partie gibt es keine gültigen Aktionen.

- **Senden:** Wähle eine eigene Siedlung mit mindestens 2 Puffer und einen direkt verbundenen Nachbarn. Verbrauche 2 Puffer, starte ein Signal der Stärke 2 und setze gleichzeitig den dauerhaften Ausgang dieser Siedlung auf den gewählten Nachbarn.
- **Umleiten:** Stelle ein gemeinsames Relais auf einen anderen direkt verbundenen Ausgang. Diese Einstellung gilt für beide Seiten. Das Relais rastet bis nach dem nächsten Netztakt ein; der Gegner kann es in dieser Runde nicht sofort zurückstellen. Andere Relais bleiben verfügbar.
- **Übernehmen:** Signiere ein unversiegeltes gegnerisches Signal um, das gerade an einem Relais wartet. Das kostet 1 Stabilität deiner eigenen Zentrale; ihren letzten Punkt darfst du nicht ausgeben. Das Signal gehört danach dir und ist gegen jede weitere Übernahme versiegelt. Stärke, Restlebensdauer und physischer Ort bleiben gleich. Ein Signal unterwegs lässt sich nicht übernehmen.

## Physische Reise

Ein Signal benötigt pro Verbindung deren angezeigte Anzahl Netztakte. Unterwegs bleibt sein Ziel fest. Trifft es ein Relais, wartet es dort bis zum nächsten Netztakt; vor der Weiterreise erhalten beide Seiten ihr Eingriffsfenster. Beim Abflug gilt der dann aktuelle Relaisausgang. Mehrere Signale können gleichzeitig unterwegs sein und einander passieren.

Jedes Signal lebt höchstens 8 Netztakte. Schleifen verbrauchen diese Zeit. Eine Ankunft an Siedlung oder Zentrale im letzten Lebenstakt zählt noch; andernfalls verfällt das Signal. Prognosen nehmen die jetzigen Relaisstellungen an. Spätere Eingriffe können den vorhergesagten Weg verändern.

## Siedlungen handeln selbstständig

Einfluss reicht von −2 (Ost) bis +2 (West). Positive Werte bedeuten Westkontrolle, negative Ostkontrolle; 0 ist neutral. Alle gleichzeitig ankommenden Signale werden zuerst zusammengezählt: Weststärke erhöht Einfluss, Oststärke senkt ihn; begrenzt auf −2…+2. Freundliche Verstärkung einer voll gebundenen Siedlung hat deshalb keine Wirkung.

Eigene Siedlungen erhalten nach jedem Netztakt 1 Puffer. Bei 3 Puffer senden sie automatisch Stärke 1 über ihren gespeicherten Ausgang und setzen den Puffer auf 0. Anfangspuffer: 2. Neue automatische Signale reisen erst im folgenden Takt. Neutrale Siedlungen laden und senden nicht. Bei Wechsel des Eigentümers wird der Puffer auf 0 gesetzt; der physische Ausgang bleibt bestehen. Danach gilt die normale Aufladung. Ein manuelles Senden verschiebt somit auch den nächsten autonomen Impuls.

## Gegner, Speicherung und Verlauf

Alles auf der Karte ist öffentlich. Die KI sucht zwei Eingriffe voraus und bewertet zusätzlich eine bedingte Zweitaktprognose; sie benutzt die normalen legalen Aktionen. Ihre drei Profile gewichten Zentraldruck und Siedlungskontrolle verschieden. Sie kennt keine zukünftigen menschlichen Züge und ist kein optimaler Löser.

Der Browser speichert vollständige abgeschlossene Aktionen. Beim Laden wird die Partie aus Seed, anfänglicher Startseite und Verlauf neu berechnet und verglichen. Manipulierte oder unvollständige Zustände werden verworfen. Ohne verfügbaren Speicher bleibt das Spiel benutzbar. Der Verlauf zeigt vergangene Zustände, ohne die laufende Partie zu verändern.
