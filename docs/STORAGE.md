# Speicherpflege

Ziel: Erzeugte Dateien begrenzen, ohne Projektarbeit oder die aktuelle spielbare Vorschau zu verlieren. Die Bereinigung arbeitet ausschließlich im `work/` dieses Projekts. Keine zusätzlichen Abhängigkeiten und kein Hintergrunddienst.

Einmaliges Aufräumen allein würde neue Caches nicht begrenzen; pauschales Löschen von `work/` würde die Chat-Vorschau und Wiederherstellungsdaten entfernen. Deshalb: gezielte Bereinigung bekannter Testausgaben plus automatische Pflege vor Tests und Builds.

- `npm run clean:check`: zeigt nur den Löschplan.
- `npm run clean`: entfernt Paketcache, Protokolle (`.log`) direkt unter `work/`, `work/intelligence/` und `work/phase2/` sowie ausdrücklich aufgelistete erzeugte Berichte/Screenshots. Andere JSON-/Bilddateien bleiben erhalten.
- Vor Tests/Builds werden solche Ausgaben nach sieben Tagen entfernt; bei mehr als 16 MiB in `work/` zusätzlich die ältesten erkannten Ausgaben. Der lokale npm-Cache wird bei mehr als 16 MiB geleert. Geschützte oder unbekannte Dateien können die Zielgröße überschreiten; sie werden gemeldet, nicht blind gelöscht.
- Erhalten bleiben immer: `work/preview/`, `work/versatz-final.bundle`, `work/remote-receipt.json`, `work/match-examples.json`, unbekannte Dateien und Skripte. Symlinks werden nicht verfolgt. Quellcode, `docs/`, `.git/`, `dist/` und `node_modules/` liegen außerhalb der Bereinigung.
- npm nutzt projektlokalen Cache und höchstens drei npm-Protokolle. Testberichte und Screenshots verwenden feste Dateinamen und überschreiben ihren vorherigen Lauf.
- Nur ein Wiederherstellungsbundle mit festem Namen behalten. Kein zusätzliches Archiv pro Commit. Das alte `pre-rebirth.bundle` darf erst nach geprüftem Erhalt aller enthaltenen Commits entfernt werden.
- CI-Artefakte laufen nach sieben Tagen ab. Kein Löschen bestehender Freigaben oder fremder Projektdateien.

Die Grenzen gelten bei den genannten Pflegeaufrufen, nicht als Betriebssystem-Quota. Der Prüfbefehl zeigt verbleibenden Platzbedarf und eine Überschreitung durch geschützte Dateien an. Es gibt keine Überwachung fremder Festplatten oder Benutzerordner.

## Geprüfter Ausgangsstand

Bei der Einrichtung wurden17.392 KiB freigegeben (Projekt66.012 →48.620 KiB, vor erneut erzeugten kleinen Browsernachweisen). Das alte redundante Bundle und41 bekannte Ausgaben/Cachepfade wurden entfernt.93 geschützte Dateien einschließlich Vorschau/Backup/Quellbestand waren vorher und nachher inhaltsgleich. Das aktuelle Bundle bleibt als einziges Backup erhalten.44 Tests bestehen, darunter sechs echte Dateisystemtests für Vorschau-Schutz, unbekannte Dateien, Symlinks, Dry-run und Größen-/Altersgrenzen. Build, Vorschau und beide betroffenen Browser-Suiten sind geprüft; die unabhängige lesende Prüfung fand keine wichtigen Probleme.
