import { STRINGS, midiToFrequency } from './Note.js';

/**
 * Definitionen aller Tonarten und Modi für das Notentraining.
 * Jede Tonart definiert:
 * - id: Eindeutiger Bezeichner
 * - name: Name der Tonart (z. B. "G-Dur / E-Moll")
 * - label: Anzeige im Dropdown
 * - group: Zuordnung (Allgemein, Kreuz-Tonarten, B-Tonarten)
 * - notesMap: Zuordnung Semiton (0..11) -> { step, accidental, name }
 *     step: Diatonischer Schritt in der Oktave (0=C, 1=D, 2=E, 3=F, 4=G, 5=A, 6=H)
 *     accidental: '♯' | '♭' | null
 *     name: Deutscher Notenname
 */
export const KEY_DEFINITIONS = {
  // --- ALLGEMEIN & STAMMTÖNE ---
  'c_major': {
    id: 'c_major',
    name: 'C-Dur / A-Moll',
    label: 'Nur Stammtöne (ohne Vorzeichen / C-Dur & A-Moll)',
    group: 'Allgemein',
    pitchClasses: [0, 2, 4, 5, 7, 9, 11],
    notesList: [
      { semitone: 0, step: 0, accidental: null, name: 'C' },
      { semitone: 2, step: 1, accidental: null, name: 'D' },
      { semitone: 4, step: 2, accidental: null, name: 'E' },
      { semitone: 5, step: 3, accidental: null, name: 'F' },
      { semitone: 7, step: 4, accidental: null, name: 'G' },
      { semitone: 9, step: 5, accidental: null, name: 'A' },
      { semitone: 11, step: 6, accidental: null, name: 'H' }
    ]
  },

  'all_chromatic': {
    id: 'all_chromatic',
    name: 'Alle Noten (chromatisch)',
    label: 'Alle Noten (chromatisch mit ♯ und ♭)',
    group: 'Allgemein',
    pitchClasses: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    // Enthält Stammtöne sowie enharmonische Varianten mit ♯ und ♭
    notesList: [
      { semitone: 0, step: 0, accidental: null, name: 'C' },
      { semitone: 1, step: 0, accidental: '♯', name: 'C#' },
      { semitone: 1, step: 1, accidental: '♭', name: 'D♭' },
      { semitone: 2, step: 1, accidental: null, name: 'D' },
      { semitone: 3, step: 1, accidental: '♯', name: 'D#' },
      { semitone: 3, step: 2, accidental: '♭', name: 'E♭' },
      { semitone: 4, step: 2, accidental: null, name: 'E' },
      { semitone: 5, step: 3, accidental: null, name: 'F' },
      { semitone: 6, step: 3, accidental: '♯', name: 'F#' },
      { semitone: 6, step: 4, accidental: '♭', name: 'G♭' },
      { semitone: 7, step: 4, accidental: null, name: 'G' },
      { semitone: 8, step: 4, accidental: '♯', name: 'G#' },
      { semitone: 8, step: 5, accidental: '♭', name: 'A♭' },
      { semitone: 9, step: 5, accidental: null, name: 'A' },
      { semitone: 10, step: 5, accidental: '♯', name: 'A#' },
      { semitone: 10, step: 6, accidental: '♭', name: 'B♭' },
      { semitone: 11, step: 6, accidental: null, name: 'H' }
    ]
  },

  // --- KREUZ-TONARTEN (♯) ---
  'g_major': {
    id: 'g_major',
    name: 'G-Dur / E-Moll',
    label: 'G-Dur / E-Moll (1♯: F♯)',
    group: 'Kreuz-Tonarten (♯)',
    pitchClasses: [0, 2, 4, 6, 7, 9, 11],
    notesList: [
      { semitone: 0, step: 0, accidental: null, name: 'C' },
      { semitone: 2, step: 1, accidental: null, name: 'D' },
      { semitone: 4, step: 2, accidental: null, name: 'E' },
      { semitone: 6, step: 3, accidental: '♯', name: 'F#' },
      { semitone: 7, step: 4, accidental: null, name: 'G' },
      { semitone: 9, step: 5, accidental: null, name: 'A' },
      { semitone: 11, step: 6, accidental: null, name: 'H' }
    ]
  },

  'd_major': {
    id: 'd_major',
    name: 'D-Dur / H-Moll',
    label: 'D-Dur / H-Moll (2♯: F♯, C♯)',
    group: 'Kreuz-Tonarten (♯)',
    pitchClasses: [1, 2, 4, 6, 7, 9, 11],
    notesList: [
      { semitone: 1, step: 0, accidental: '♯', name: 'C#' },
      { semitone: 2, step: 1, accidental: null, name: 'D' },
      { semitone: 4, step: 2, accidental: null, name: 'E' },
      { semitone: 6, step: 3, accidental: '♯', name: 'F#' },
      { semitone: 7, step: 4, accidental: null, name: 'G' },
      { semitone: 9, step: 5, accidental: null, name: 'A' },
      { semitone: 11, step: 6, accidental: null, name: 'H' }
    ]
  },

  'a_major': {
    id: 'a_major',
    name: 'A-Dur / F♯-Moll',
    label: 'A-Dur / F♯-Moll (3♯: F♯, C♯, G♯)',
    group: 'Kreuz-Tonarten (♯)',
    pitchClasses: [1, 2, 4, 6, 8, 9, 11],
    notesList: [
      { semitone: 1, step: 0, accidental: '♯', name: 'C#' },
      { semitone: 2, step: 1, accidental: null, name: 'D' },
      { semitone: 4, step: 2, accidental: null, name: 'E' },
      { semitone: 6, step: 3, accidental: '♯', name: 'F#' },
      { semitone: 8, step: 4, accidental: '♯', name: 'G#' },
      { semitone: 9, step: 5, accidental: null, name: 'A' },
      { semitone: 11, step: 6, accidental: null, name: 'H' }
    ]
  },

  'e_major': {
    id: 'e_major',
    name: 'E-Dur / C♯-Moll',
    label: 'E-Dur / C♯-Moll (4♯: F♯, C♯, G♯, D♯)',
    group: 'Kreuz-Tonarten (♯)',
    pitchClasses: [1, 3, 4, 6, 8, 9, 11],
    notesList: [
      { semitone: 1, step: 0, accidental: '♯', name: 'C#' },
      { semitone: 3, step: 1, accidental: '♯', name: 'D#' },
      { semitone: 4, step: 2, accidental: null, name: 'E' },
      { semitone: 6, step: 3, accidental: '♯', name: 'F#' },
      { semitone: 8, step: 4, accidental: '♯', name: 'G#' },
      { semitone: 9, step: 5, accidental: null, name: 'A' },
      { semitone: 11, step: 6, accidental: null, name: 'H' }
    ]
  },

  'h_major': {
    id: 'h_major',
    name: 'H-Dur / G♯-Moll',
    label: 'H-Dur / G♯-Moll (5♯: F♯, C♯, G♯, D♯, A♯)',
    group: 'Kreuz-Tonarten (♯)',
    pitchClasses: [1, 3, 4, 6, 8, 10, 11],
    notesList: [
      { semitone: 1, step: 0, accidental: '♯', name: 'C#' },
      { semitone: 3, step: 1, accidental: '♯', name: 'D#' },
      { semitone: 4, step: 2, accidental: null, name: 'E' },
      { semitone: 6, step: 3, accidental: '♯', name: 'F#' },
      { semitone: 8, step: 4, accidental: '♯', name: 'G#' },
      { semitone: 10, step: 5, accidental: '♯', name: 'A#' },
      { semitone: 11, step: 6, accidental: null, name: 'H' }
    ]
  },

  // --- B-TONARTEN (♭) ---
  'f_major': {
    id: 'f_major',
    name: 'F-Dur / D-Moll',
    label: 'F-Dur / D-Moll (1♭: B♭)',
    group: 'B-Tonarten (♭)',
    pitchClasses: [0, 2, 4, 5, 7, 9, 10],
    notesList: [
      { semitone: 0, step: 0, accidental: null, name: 'C' },
      { semitone: 2, step: 1, accidental: null, name: 'D' },
      { semitone: 4, step: 2, accidental: null, name: 'E' },
      { semitone: 5, step: 3, accidental: null, name: 'F' },
      { semitone: 7, step: 4, accidental: null, name: 'G' },
      { semitone: 9, step: 5, accidental: null, name: 'A' },
      { semitone: 10, step: 6, accidental: '♭', name: 'B♭' }
    ]
  },

  'bb_major': {
    id: 'bb_major',
    name: 'B-Dur / G-Moll',
    label: 'B-Dur / G-Moll (2♭: B♭, E♭)',
    group: 'B-Tonarten (♭)',
    pitchClasses: [0, 2, 3, 5, 7, 9, 10],
    notesList: [
      { semitone: 0, step: 0, accidental: null, name: 'C' },
      { semitone: 2, step: 1, accidental: null, name: 'D' },
      { semitone: 3, step: 2, accidental: '♭', name: 'E♭' },
      { semitone: 5, step: 3, accidental: null, name: 'F' },
      { semitone: 7, step: 4, accidental: null, name: 'G' },
      { semitone: 9, step: 5, accidental: null, name: 'A' },
      { semitone: 10, step: 6, accidental: '♭', name: 'B♭' }
    ]
  },

  'eb_major': {
    id: 'eb_major',
    name: 'Es-Dur / C-Moll',
    label: 'Es-Dur / C-Moll (3♭: B♭, E♭, A♭)',
    group: 'B-Tonarten (♭)',
    pitchClasses: [0, 2, 3, 5, 7, 8, 10],
    notesList: [
      { semitone: 0, step: 0, accidental: null, name: 'C' },
      { semitone: 2, step: 1, accidental: null, name: 'D' },
      { semitone: 3, step: 2, accidental: '♭', name: 'E♭' },
      { semitone: 5, step: 3, accidental: null, name: 'F' },
      { semitone: 7, step: 4, accidental: null, name: 'G' },
      { semitone: 8, step: 5, accidental: '♭', name: 'A♭' },
      { semitone: 10, step: 6, accidental: '♭', name: 'B♭' }
    ]
  },

  'ab_major': {
    id: 'ab_major',
    name: 'As-Dur / F-Moll',
    label: 'As-Dur / F-Moll (4♭: B♭, E♭, A♭, D♭)',
    group: 'B-Tonarten (♭)',
    pitchClasses: [0, 1, 3, 5, 7, 8, 10],
    notesList: [
      { semitone: 0, step: 0, accidental: null, name: 'C' },
      { semitone: 1, step: 1, accidental: '♭', name: 'D♭' },
      { semitone: 3, step: 2, accidental: '♭', name: 'E♭' },
      { semitone: 5, step: 3, accidental: null, name: 'F' },
      { semitone: 7, step: 4, accidental: null, name: 'G' },
      { semitone: 8, step: 5, accidental: '♭', name: 'A♭' },
      { semitone: 10, step: 6, accidental: '♭', name: 'B♭' }
    ]
  }
};

/**
 * Erzeugt den Vorrat an Noten (Pool) für eine gegebene Tonart in den ersten 4 Bünden.
 * Gibt ein Array von Notenobjekten zurück mit:
 * { midi, string, fret, duration, freq, diatonicStep, name, accidental }
 */
export function generatePoolForKey(keyId = 'c_major', maxFret = 4) {
  const def = KEY_DEFINITIONS[keyId] || KEY_DEFINITIONS['c_major'];
  const pool = [];

  for (let s = 0; s < STRINGS.length; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const midi = STRINGS[s].baseMidi + f;
      const semitone = midi % 12;

      // Alle passenden Noten-Templates aus der Tonart finden
      // (bei all_chromatic kann ein Semiton sowohl mit # als auch mit ♭ vorkommen)
      const matchingDefs = def.notesList.filter(n => n.semitone === semitone);

      for (const noteInfo of matchingDefs) {
        const octave = Math.floor(midi / 12) - 1;
        // Diatonischer Schritt relativ zu E3 (unterste Linie Violinschlüssel):
        // E3 = Oktave 3, Schritt 2 (E) => 3 * 7 + 2 = 23
        const diatonicStep = (octave * 7 + noteInfo.step) - 23;
        const freq = midiToFrequency(midi);
        const fullName = `${noteInfo.name}${octave}`;

        pool.push({
          midi,
          string: s,
          fret: f,
          duration: 1,
          freq,
          diatonicStep,
          name: fullName,
          accidental: noteInfo.accidental
        });
      }
    }
  }

  return pool;
}
