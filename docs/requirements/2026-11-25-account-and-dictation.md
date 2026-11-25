# UDI – DEEP DIVE UND UMSETZUNG: KONTO, REGISTRIERUNG UND SPRACHEINGABE

## Mission

Prüfe und verbessere im bestehenden UDI-Projekt die Anmeldung, Kontonutzung und optionale Mikrofoneingabe auf iOS und Android.

Ziel ist ein einfacher, vertrauenswürdiger Ablauf:

- Nutzer verstehen UDI, bevor sie ein Konto anlegen.
- Ein Konto wird erst verlangt, wenn es für Live-Suche, Kontingent oder Speichern nötig ist.
- Texteingabe bleibt immer möglich.
- Spracheingabe ist eine optionale, gut sichtbare Alternative zur Tastatur.
- Gesprochener Text wird vor dem Absenden angezeigt und kann bearbeitet werden.
- Mikrofon und Audio werden nur verwendet, wenn der Nutzer aktiv auf das Mikrofonsymbol tippt.
- Es wird kein separates ChatGPT-, KI- oder Pro-Abo der Nutzer vorausgesetzt.

Arbeite im vorhandenen Code und prüfe zuerst den aktuellen Projektstand. Ersetze keine funktionierende Auth-, Backend- oder native Plattformintegration ohne belegten Vorteil. Wenn technische Zugänge oder notwendige Berechtigungen fehlen, dokumentiere den konkreten Blocker und arbeite an unabhängigen Teilen weiter.

---

## P0 – Bestand und Anforderungen prüfen

Untersuche vor Änderungen:

1. Plattformen, Frameworks, Mindestversionen und aktuelle Build-Konfiguration.
2. Vorhandene Konto-, Login-, Session-, Speicher- und Backend-Logik.
3. Suchablauf und aktuelle Stelle, an der eine Anmeldung verlangt wird.
4. Textfeld, Tastaturverhalten, Eingabezustände und Barrierefreiheit.
5. Vorhandene Mikrofon-, Diktier- oder Speech-to-Text-Integration.
6. Datenschutztexte, Berechtigungsbeschreibungen und Löschabläufe.
7. Bestehende Tests, Emulatoren und verfügbare Geräte.

Halte knapp fest, was wirklich implementiert ist, was nur geplant ist und welche Plattformen praktisch geprüft werden können.

## P1 – Konto und Anmeldezeitpunkt entscheiden

Prüfe den Anmeldeablauf anhand dieser Produktregel:

- App-Erklärung, Beispiele und Eingabe eines Suchwunsches sollen ohne Konto zugänglich sein.
- Ein Konto wird spätestens verlangt, bevor eine kostenverursachende Live-Suche startet.
- Ein Konto ist erforderlich, um gespeicherte Suchen, Verlauf, Nutzungsgrenzen oder Abozugriff geräteübergreifend zuverlässig zu verwalten.
- Der Grund für die Anmeldung wird knapp und verständlich erklärt.
- Kein Passwort, keine Telefonnummer und keine unnötigen Profildaten verlangen, sofern das bestehende System eine sichere, einfachere Lösung unterstützt.
- Bestehende unterstützte Anmeldewege verwenden. Apple-/Google-Anmeldung oder E-Mail-Magic-Link nur einführen, wenn Projektkonfiguration und Zugangsdaten vorhanden sind.
- Keine Anmeldung durch eine attraktive, aber nicht funktionierende Schaltfläche vortäuschen.

Prüfe Login, Logout, abgelaufene Sitzung, Wiederherstellung, Kontolöschung, Gerätewechsel und den Übergang von einer begonnenen Suche zur Anmeldung. Der Suchtext soll nach der Anmeldung erhalten bleiben, sofern das sicher und mit dem bestehenden Aufbau möglich ist.

## P2 – Mikrofonbedienung und Nutzerfluss

Die Mikrofoneingabe ist eine optionale Funktion direkt am Suchfeld. Sie darf die Texteingabe nicht ersetzen.

Implementiere einen klaren Ablauf:

1. Nutzer tippt bewusst auf das Mikrofonsymbol.
2. Erst dann wird die erforderliche Berechtigung angefragt.
3. Eine kurze Erklärung beschreibt vor der Systemabfrage, wozu das Mikrofon benötigt wird.
4. Während der Aufnahme zeigt UDI eindeutig an, dass zugehört wird, und bietet eine klare Stopp- oder Abbruchaktion.
5. Der erkannte Text erscheint im normalen Suchfeld.
6. Nutzer kann den Text ergänzen, korrigieren oder löschen.
7. Eine Suche beginnt erst nach einer ausdrücklichen Aktion des Nutzers.
8. Bei verweigerter Berechtigung bleibt Texteingabe vollständig nutzbar; UDI erklärt knapp, wie die Berechtigung bei Bedarf in den Systemeinstellungen geändert werden kann.

Verwende keine automatische Aufnahme, keine versteckte Hintergrundaufnahme und kein automatisches Absenden des erkannten Textes.

## P3 – Speech-to-Text: sicher und kostengünstig

Prüfe die aktuell für die Projekt-Mindestversionen verfügbaren offiziellen iOS- und Android-APIs. Nutze native Erkennung, wenn sie auf dem Gerät und für die gewählte Sprache verfügbar ist.

- Bevorzuge On-Device-Transkription, sofern Gerät, Betriebssystem und Sprache sie unterstützen.
- Prüfe Verfügbarkeit zur Laufzeit. Behaupte keine Offline-Funktion, wenn sie auf dem Gerät nicht verfügbar ist.
- Wenn eine native Erkennung Audio zur Verarbeitung an einen externen Dienst senden kann, erkläre das ehrlich, bevor der Nutzer diese Variante nutzt.
- Lade Audio niemals automatisch zu UDIs eigenem KI-Backend hoch.
- Verwende keinen Cloud-Speech-Anbieter ohne konkrete Prüfung von Preis, Datenschutz, Datenaufbewahrung, unterstützten Sprachen und erforderlicher Konfiguration.
- Wenn keine sichere oder verfügbare Erkennung existiert, biete manuelle Texteingabe an, statt den Ablauf zu blockieren.
- Speichere keine Audioaufnahme dauerhaft. Halte erkannte Texte nur entsprechend der bestehenden Such- und Speicherlogik vor.
- Falls die Plattform Aufnahmen oder Transkripte temporär puffert, begrenze Lebensdauer und Speicherort.

Erstelle eine klare Abstraktion zwischen UI und plattformspezifischer Erkennung, falls das zur vorhandenen Architektur passt. Vermeide eine grosse Speech-Framework-Umstrukturierung, wenn eine kleine native Integration ausreicht.

## P4 – Berechtigungen und Datenschutz

Prüfe für jede Plattform:

- erforderliche Laufzeitberechtigungen;
- korrekte Einträge und verständliche Begründungen in nativen Konfigurationen;
- Verhalten bei „nicht gefragt“, „erlaubt“, „abgelehnt“ und „dauerhaft abgelehnt“;
- verständliche Reaktion, wenn die Sprache nicht unterstützt wird;
- Verhalten ohne Internet, wenn die gewählte Erkennung eine Verbindung benötigt;
- Umgang mit Sprachdaten durch Betriebssystem oder externen Anbieter.

Frage Berechtigungen erst in dem Moment an, in dem der Nutzer das Mikrofon tatsächlich verwenden möchte. Keine Berechtigung beim App-Start, Onboarding oder bei bloss sichtbarem Suchfeld anfragen.

Passe Datenschutz- und In-App-Texte nur an, wenn die implementierte technische Verarbeitung klar bekannt ist. Schreibe nicht, dass Audio das Gerät nie verlässt, solange die verwendete Plattformoption das nicht garantiert.

## P5 – Bedienbarkeit, Tastatur und Barrierefreiheit

Prüfe den vollständigen Ablauf auf kleinen und grossen Displays:

- Mikrofon und Texteingabe sind gut erreichbar, aber visuell nicht überladen.
- Das Öffnen der Tastatur verdeckt weder Suchfeld noch wichtige Aktionen.
- Der Nutzer kann zwischen Tippen und Sprechen wechseln, ohne seine Eingabe zu verlieren.
- Aufnahmestatus ist nicht nur durch Farbe erkennbar.
- Schaltflächen haben zugängliche Namen, geeignete Touch-Flächen und klare Fokuszustände.
- VoiceOver und TalkBack können Eingabefeld, Mikrofonstatus, Abbruch und Ergebnistext sinnvoll vorlesen.
- Fehler, Stille, zu kurze Aufnahme, Abbruch und leere Transkription haben verständliche Zustände.
- Unterstützte UI-Sprachen und erkannte Sprache werden nicht ungeprüft miteinander verwechselt.

## P6 – Prüfungen und Nachweise

Teste – passend zum vorhandenen Projekt – mindestens:

1. Konto erstellen und anmelden.
2. Suchwunsch eingeben, Anmeldung abschliessen und Suche fortsetzen.
3. Bestehende Anmeldung wiederherstellen und abmelden.
4. Mikrofonberechtigung beim ersten bewussten Tippen.
5. Berechtigung erlauben, verweigern und dauerhaft verweigern.
6. Spracheingabe erfolgreich in bearbeitbaren Text umwandeln.
7. Aufnahme abbrechen und leere oder unklare Transkription behandeln.
8. Tastatur öffnen, Text korrigieren und Suche absenden.
9. Unterstützte und nicht unterstützte Sprache sowie Offline-Verhalten.
10. VoiceOver oder TalkBack auf dem zentralen Eingabeablauf.

Unterscheide im Bericht klar zwischen automatisch getestet, auf Emulator geprüft und praktisch auf einem Gerät geprüft. Behaupte keine Geräteprüfung, wenn sie nicht stattgefunden hat.

## Arbeitsweise und Abschluss

Arbeite in kleinen Schritten:

**Ist-Zustand → wichtigste belegte Schwäche → kleinste sinnvolle Änderung → passende Prüfung → Korrektur → Sicherung → nächste Priorität.**

Keine unnötigen Rückfragen oder Warte-OKs bei reversiblen Entscheidungen. Begrenze Fehlversuche bei lokalen Blockern, dokumentiere Ursache und arbeite unabhängig weiter. Sichere Nutzeränderungen und verwende nachvollziehbare Git-Checkpoints. Keine Veröffentlichung, kostenpflichtige Dienste oder externen Datenübertragungen ohne vorhandene Berechtigung und notwendige Zugangsdaten.

Berichte am Ende knapp:

- getroffene Entscheidung zum Anmeldezeitpunkt;
- vorhandene und ergänzte Loginwege;
- verwendete Speech-API je Plattform;
- ob Audio das Gerät verlassen kann;
- unterstützte und nicht unterstützte Sprachen;
- durchgeführte Prüfungen;
- offene Blocker und nächste Priorität.

## Oberste Leitlinie

**Erst erklären, dann um Erlaubnis bitten, Sprache in bearbeitbaren Text verwandeln und niemals ohne ausdrückliche Aktion suchen.**
