# Portabler Windows-Test · 28.11.2026

Ausgangsstand a50dce4. Die früher ausgegebene CMD-Datei verweist auf einen absoluten Projektpfad. Der Quellstarter erwartete Node.js im Systempfad. In einem neuen Ordner mit reinem Windows-Systempfad ignorierte der alte Starter ein nebenliegendes Node.js und brach ab.

Der neue lokale ZIP-Builder verwendet die vorhandene App-Dateiliste und nur die Module des Loopback-Testdienstes. Der Starter verwendet bevorzugt die beiliegende Windows-x64-Laufzeit. Sie stammt aus dem offiziellen Node.js-Archiv 24.22.3. Die SHA-256 des Laufzeit-ZIP wurde vor dem Entpacken mit der veröffentlichten Prüfsumme verglichen. Die Lizenzhinweise sind enthalten. [Node.js-Archiv](https://nodejs.org/en/download/archive/v24.22.3).

Die ausgelieferte Startlogik wurde aus einem neu entpackten Ordner mit Leerzeichen und ohne Node.js im Systempfad gestartet. Der lokale Dienst lieferte die gekennzeichnete Oberfläche mit HTTP 200. Mit dem Node.js aus der ZIP-Datei und der entpackten App bestanden die deutschen und englischen Browserabläufe vom Konto bis zur Wiederherstellung. 199 Tests, Typprüfung, Build und allgemeiner Chromium-Smoke bestanden zusätzlich im Projekt. Die Adresse zum manuellen Öffnen wird unabhängig vom Standardbrowser angezeigt. Der persönliche Doppelklick auf dem Bildschirm des Nutzers bleibt eine eigene Abnahme.

Endpaket aus ffc1718. Der frisch entpackte Starter lieferte mit reinem Systempfad die Testansicht (HTTP 200). DE/EN mit dem gebündelten Node.js bestanden einschliesslich Wiederanmeldung nach HTTP 401. ZIP-SHA-256: 1558ffb340e04388afdd3049a6e37d25e2ed78f45f4ff7d2ecf53da0a2f65318.
