# 🎸 Gitarren-Notentrainer Pro

Ein moderner, modularer Gitarren-Notentrainer zum Erlernen von Noten, Songs und Rhythmusgefühl. Unterstützt sowohl direkte Audio-Interfaces (z. B. **IK Multimedia iRig HD 2**) als auch das integrierte **Laptop-Mikrofon** für Akustikgitarren.

---

## 🌟 Features

- **Modulare Song-Architektur**: Lieder liegen als übersichtliche JSON-Dateien im Ordner `songs/` vor und können beliebig erweitert werden.
- **Vier flexible Spiel- und Lernmodi**:
  1. **🎯 Üben (Warte auf Note)**: Das Notenband pausiert bei jeder Note, bis der richtige Ton auf der Gitarre (oder per Klick) gespielt wird. Ideal zum Notenlernen ohne Zeitdruck.
  2. **⏱ Rhythmus (BPM-Timing)**: Die Noten wandern synchron zum Metronom (BPM einstellbar). Im Trefferfenster gespielte Noten leuchten **grün** auf, verpasste Töne **rot**. Am Ende gibt es eine detailreiche **Treffer- und Genauigkeitsauswertung** (in %).
  3. **∞ Endlos-Training**: Fortlaufendes Vom-Blatt-Spiel-Training mit zufälligen Noten aus Bund 0 bis 4.
  4. **✏️ Song-Editor**: Eigene Liedstücke interaktiv per Klick auf Notenlinien oder Griffbrett erstellen, Tondauern wählen, per Synthesizer Probehören und direkt als `.json` exportieren/laden.
- **Audio-Eingang & Live-Pegelanzeige**:
  - **iRig HD 2**: Saubere, direkte Tonerkennung ohne Umgebungslärm.
  - **Laptop-Mikrofon**: Integrierte Filter (Highpass 75 Hz + Lowpass 750 Hz) für Nebengeräusch-Unterdrückung bei Akustikgitarren.
  - **VU-Meter (Pegelanzeige)**: Zeigt die Lautstärke des Eingangssignals in Echtzeit.
- **MIDI-Import**: Drag-and-Drop von Standard-MIDI-Dateien (`.mid`), die automatisch in Gitarrennoten quantisiert werden.
- **Modernes Dark-UI**: Flüssiges 60 FPS Canvas-Rendering mit HiDPI/Retina-Unterstützung und interaktivem Holz-Griffbrett.

---

## 📁 Projektstruktur

```text
Gitarren_Noten_Lernen/
├── index.html                 # Haupt-Webanwendung
├── README.md                  # Dokumentation & Anleitung
├── .gitignore                 # Git-Ausschlussregeln
├── css/
│   ├── main.css               # Basiskomponenten & Themes
│   ├── controls.css           # Bedienfeld & Pegel-Meter
│   ├── notation.css           # Notenblatt-Canvas
│   ├── fretboard.css          # Griffbrett (Bund 0-4, Saiten, Trefferfarben)
│   ├── editor.css             # Toolbar für den Song-Editor
│   └── modal.css              # Auswertungs- & Statistikdialog
├── songs/                     # Auslagerung aller Songdateien
│   ├── songRegistry.js        # Zentraler Katalog & Fallback
│   ├── smoke_on_the_water.json
│   ├── seven_nation_army.json
│   ├── nothing_else_matters.json
│   ├── ode_an_die_freude.json
│   ├── frere_jacques.json
│   └── haenschen_klein.json
└── src/
    ├── app.js                 # Hauptcontroller & Event-Dispatcher
    ├── audio/
    │   ├── AudioEngine.js     # Web Audio API (iRig & Mic)
    │   ├── PitchDetector.js   # Autokorrelation & Frequenzerkennung
    │   └── SynthFeedback.js   # Sounds & Metronom
    ├── models/
    │   ├── Note.js            # Noten, Saiten & Frequenzen
    │   └── Song.js            # Song-Datenmodell
    ├── renderers/
    │   ├── StaffRenderer.js   # Notensystem & Noten-Zeichnung
    │   └── FretboardRenderer.js # Griffbrett-Interaktion
    ├── modes/
    │   ├── PracticeMode.js    # Modus "Warten auf Note"
    │   ├── RhythmGameMode.js  # BPM-Timing-Modus
    │   ├── EndlessMode.js     # Endlos-Modus
    │   └── SongEditorMode.js  # Song-Editor
    └── midi/
        └── MidiImporter.js    # .mid-Parser & Quantisierer
```

---

## 🚀 Starten der Anwendung

Da die Anwendung moderne **ES-Module** nutzt, öffnest du sie am besten über einen einfachen lokalen Webserver (damit der Browser Dateien ohne CORS-Beschränkungen laden kann):

### Option 1: Mit Python (bereits auf deinem System vorhanden)
Im Projektordner in der Konsole/PowerShell ausführen:
```powershell
python -m http.server 8000
```
Danach im Browser öffnen: **`http://localhost:8000`**

### Option 2: Mit Node / npx
```powershell
npx serve
```

---

## ➕ Eigene Lieder hinzufügen

Du kannst ganz einfach neue Songs hinzufügen:

1. **Über den integrierten Song-Editor**:
   - Wähle oben im Dropdown den Modus **✏️ Song-Editor**.
   - Klicke die Noten auf dem Griffbrett oder den Notenlinien an.
   - Klicke auf **💾 Als JSON exportieren**. Die Datei kann sofort im Programm verwendet werden.
2. **Per Drag & Drop**:
   - Ziehe eine beliebige `.json`-Songdatei oder eine `.mid`-MIDI-Datei einfach mit der Maus in das Browserfenster!
3. **Manuell im Ordner `songs/`**:
   - Erstelle eine Datei wie `songs/mein_song.json`:
   ```json
   {
     "id": "mein_song",
     "title": "Mein Song",
     "artist": "Ich",
     "bpm": 100,
     "notes": [
       { "midi": 60, "duration": 1 },
       { "midi": 62, "duration": 1 },
       { "midi": 64, "duration": 2 }
     ]
   }
   ```

---

## 🌐 Auf GitHub hochladen & als GitHub Page veröffentlichen

Um das Projekt in deinem GitHub-Konto zu speichern:

1. **Erstelle ein neues Repository auf GitHub** (z. B. mit dem Namen `gitarren-notentrainer`).
2. **Repository verbinden und pushen**:
   ```bash
   git add .
   git commit -m "Initial commit: Modulare Gitarren-Lernanwendung mit Song-Editor und BPM-Modus"
   git branch -M main
   git remote add origin https://github.com/DEIN-BENUTZERNAME/gitarren-notentrainer.git
   git push -u origin main
   ```
3. **Kostenlos im Web hosten (GitHub Pages)**:
   - Gehe in deinem GitHub-Repository auf **Settings** -> **Pages**.
   - Wähle unter *Branch* den Branch `main` und Ordner `/ (root)`.
   - Nach wenigen Sekunden ist deine Gitarren-Lern-App unter `https://DEIN-BENUTZERNAME.github.io/gitarren-notentrainer/` online verfügbar!
