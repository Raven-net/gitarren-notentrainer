/**
 * Noten- und Saiten-Modell für Gitarre (Standard-Stimmung E-A-D-g-h-e)
 */

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "H"];

export const STRINGS = [
  { name: "e", baseMidi: 64, gauge: 1.0 },
  { name: "h", baseMidi: 59, gauge: 1.4 },
  { name: "g", baseMidi: 55, gauge: 1.9 },
  { name: "d", baseMidi: 50, gauge: 2.4 },
  { name: "A", baseMidi: 45, gauge: 3.0 },
  { name: "E", baseMidi: 40, gauge: 3.8 }
];

const SEMITONE_TO_STEP = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

/**
 * Wandelt eine MIDI-Nummer in den diatonischen Tonschritt (für Notenlinien im Violinschlüssel) um.
 * Basis 52 = E3 (unterste Linie im Violinschlüssel = E4 (64), aber Gitarre klingt eine Oktave tiefer transponiert).
 */
export function midiToDiatonicStep(midi) {
  const octave = Math.floor(midi / 12) - 1;
  const noteInOct = midi % 12;
  return octave * 7 + SEMITONE_TO_STEP[noteInOct];
}

export function getNoteName(midi) {
  const name = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Erstellt ein standardisiertes Noten-Objekt
 * duration: 4 = Ganze, 2 = Halbe, 1 = Viertel, 0.5 = Achtel
 */
export function createNote(midi, duration = 1, preferredString = null, preferredFret = null) {
  return {
    midi: midi,
    duration: duration,
    freq: midiToFrequency(midi),
    diatonicStep: midiToDiatonicStep(midi) - midiToDiatonicStep(52),
    name: getNoteName(midi),
    string: preferredString,
    fret: preferredFret
  };
}

/**
 * Erzeugt den Vorrat an möglichen Tönen im Bereich Bund 0 bis 4
 */
export const DIATONIC_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

export function generateFretboardPool(maxFret = 4) {
  const pool = [];
  for (let s = 0; s < STRINGS.length; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const midi = STRINGS[s].baseMidi + f;
      if (DIATONIC_SEMITONES.includes(midi % 12)) {
        pool.push({
          string: s,
          fret: f,
          ...createNote(midi, 1, s, f)
        });
      }
    }
  }
  return pool;
}
