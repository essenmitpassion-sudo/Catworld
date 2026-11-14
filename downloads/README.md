# AFTERLIGHT herunterladen und spielen

[Spiel-ZIP herunterladen](https://github.com/essenmitpassion-sudo/Catworld/raw/refs/heads/codex/masterplan-run-consistency/downloads/AFTERLIGHT-playtest.zip)

Falls der Direktlink nicht startet: AFTERLIGHT-playtest.zip in diesem Ordner öffnen
und rechts oben **Download raw file** anklicken. Bei privatem Repository zuerst
mit dem GitHub-Konto anmelden, das Zugriff auf Catworld hat.

1. ZIP vollständig entpacken.
2. Windows: Python3.12 oder neuer installieren, dann im Ordner AFTERLIGHT
   `start_afterlight_windows.bat` doppelklicken.
3. Linux/macOS: grafischer Desktop, Python3.12+, `sh start_afterlight.sh`.

Beim ersten Start wird pygame-ce installiert (Internet erforderlich). Danach
läuft das Spiel offline. F1 erklärt die Befehle, F2 zeigt die Katzencrew.
Dies ist ein Quellpaket mit Starter, keine Windows-EXE. Native Windows-Ausführung
ist noch nicht bestätigt. Code wird lokal gespeichert, die Welt startet frisch.

Buildgrundlage: `f2d9f4493c8f5821fc340eb0cc460fe4116ff0ab`.
SHA-256: `d01178b0481acd9146bfb1dcbf35853d3d3b8907577756b2c88b0da8d3adc7fa`.
Alle31 Paketdateihashes und das entpackte Paket werden geprüft.
Beim Aktualisieren das Paket erst bei sauberem Gitstand nach /workspace/work
bauen, dort prüfen und anschliessend samt Prüfsumme in diesen Ordner kopieren.
