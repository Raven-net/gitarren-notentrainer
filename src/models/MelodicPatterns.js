import { KEY_DEFINITIONS, generatePoolForKey } from './KeySignatures.js';

/**
 * Repertoire an archetypischen Melodiebausteinen (Motiven),
 * ausgedrückt in relativen diatonischen Tonleiter-Schritten (Scale Steps):
 *  0 = Grundton (Tonika, Stufe 1)
 *  1 = Sekunde (Stufe 2)
 *  2 = Terz (Stufe 3)
 *  3 = Quarte (Stufe 4)
 *  4 = Quinte (Dominante, Stufe 5)
 *  5 = Sexte (Stufe 6)
 *  6 = Septime (Leitton, Stufe 7)
 *  7 = Oktave (Stufe 8)
 * -1 = Untere Septime (Stufe 7 tief)
 * -2 = Untere Sexte (Stufe 6 tief)
 * -3 = Untere Quinte (Stufe 5 tief)
 */

export const MOTIF_LIBRARY = {
  // Eröffnungsmotive (Kopfmotive)
  openings: [
    { name: 'Skala aufwärts 1-2-3', steps: [0, 1, 2] },
    { name: 'Skala aufwärts 1-2-3-4-5', steps: [0, 1, 2, 3, 4] },
    { name: 'Dreiklang aufwärts 1-3-5', steps: [0, 2, 4] },
    { name: 'Auftakt-Quart 5-1-2-3', steps: [-3, 0, 1, 2] },
    { name: 'Auftakt-Quart 5-1-3-5', steps: [-3, 0, 2, 4] },
    { name: 'Terzaufschwung 3-4-5', steps: [2, 3, 4] },
    { name: 'Dreiklang abwärts 5-3-1', steps: [4, 2, 0] },
    { name: 'Kuckuck 5-3-5-3', steps: [4, 2, 4, 2] },
    { name: 'Dreiklang-Oktave 1-3-5-8', steps: [0, 2, 4, 7] },
    { name: 'Tonwiederholung 1-1-2-3', steps: [0, 0, 1, 2] }
  ],

  // Fortspinnung & Bewegung (Mittelteil)
  continuations: [
    { name: 'Obere Wechselnote', steps: [0, 1, 0] },
    { name: 'Untere Wechselnote', steps: [0, -1, 0] },
    { name: 'Terzwechsel 2-3-2', steps: [1, 2, 1] },
    { name: 'Quintenwechsel 4-5-4', steps: [3, 4, 3] },
    { name: 'Gebrochene Terzen aufwärts', steps: [0, 2, 1, 3] },
    { name: 'Gebrochene Terzen abwärts', steps: [4, 2, 3, 1] },
    { name: 'Doppel-Umspielung (Cambiata)', steps: [1, 0, -1, 0] },
    { name: 'Skalenlauf abwärts 5-4-3-2', steps: [4, 3, 2, 1] },
    { name: 'Wiegende Terzen', steps: [2, 0, 2, 0] },
    { name: 'Sekund-Pendel', steps: [0, 1, 0, 1] }
  ],

  // Kadenzen & Schlüsse (Abschluss einer Phrase)
  cadences: [
    { name: 'Klassischer Ganzschluss 3-2-1', steps: [2, 1, 0] },
    { name: 'Leitton-Schluss 2-7-1', steps: [1, -1, 0] },
    { name: 'Pentachord-Schluss 4-3-2-1', steps: [3, 2, 1, 0] },
    { name: 'Dreiklang-Schluss 5-3-1', steps: [4, 2, 0] },
    { name: 'Halbschluss auf Quinte', steps: [0, 1, 2, 3] },
    { name: 'Beruhigender Terzschluss 2-1-0', steps: [1, 0, -1, 0] }
  ]
};

/**
 * Rhythmus-Vorlagen (Notenwerte in Beats):
 * 4 = Ganze Note (1 voller Takt in 4/4)
 * 2 = Halbe Note (halber Takt)
 * 1 = Viertelnote
 * 0.5 = Achtelnote
 */
export const RHYTHM_TEMPLATES = {
  2: [
    [1, 1],       // 2 Viertel (2 Beats)
    [2, 2],       // 2 Halbe (4 Beats = 1 Takt)
    [1, 2],       // Viertel, Halbe (3 Beats)
    [2, 1],       // Halbe, Viertel (3 Beats)
    [0.5, 0.5]    // 2 Achtel (1 Beat)
  ],
  3: [
    [1, 1, 2],       // 2 Viertel, Halbe (4 Beats = 1 Takt)
    [2, 1, 1],       // Halbe, 2 Viertel (4 Beats = 1 Takt)
    [1, 2, 1],       // Viertel, Halbe, Viertel (4 Beats = 1 Takt)
    [0.5, 0.5, 1],   // 2 Achtel, Viertel (2 Beats)
    [1, 0.5, 0.5],   // Viertel, 2 Achtel (2 Beats)
    [0.5, 0.5, 2],   // 2 Achtel, Halbe (3 Beats)
    [1, 1, 1]        // 3 Viertel (3 Beats)
  ],
  4: [
    [1, 1, 1, 1],          // 4 Viertel (4 Beats = 1 Takt)
    [0.5, 0.5, 0.5, 0.5],  // 4 Achtel (2 Beats)
    [0.5, 0.5, 1, 2],      // 2 Achtel, Viertel, Halbe (4 Beats = 1 Takt)
    [1, 0.5, 0.5, 2],      // Viertel, 2 Achtel, Halbe (4 Beats = 1 Takt)
    [2, 1, 0.5, 0.5],      // Halbe, Viertel, 2 Achtel (4 Beats = 1 Takt)
    [1, 1, 0.5, 0.5],      // 2 Viertel, 2 Achtel (3 Beats)
    [0.5, 0.5, 1, 1]       // 2 Achtel, 2 Viertel (3 Beats)
  ],
  5: [
    [0.5, 0.5, 0.5, 0.5, 2], // 4 Achtel, Halbe (4 Beats = 1 Takt)
    [0.5, 0.5, 0.5, 0.5, 1], // 4 Achtel, Viertel (3 Beats)
    [1, 0.5, 0.5, 1, 1],     // 4 Beats = 1 Takt
    [1, 1, 1, 0.5, 0.5],     // 4 Beats = 1 Takt
    [0.5, 0.5, 1, 1, 1]      // 4 Beats = 1 Takt
  ]
};

export const CADENCE_RHYTHM_TEMPLATES = {
  3: [
    [1, 1, 2],       // Viertel, Viertel, Halbe (4 Beats = 1 Takt)
    [1, 1, 4],       // Viertel, Viertel, Ganze Note (6 Beats, langer Schlusston)
    [0.5, 0.5, 2],   // 2 Achtel, Halbe (3 Beats)
    [0.5, 0.5, 4],   // 2 Achtel, Ganze Note (5 Beats)
    [2, 2, 4]        // 2 Halbe, Ganze Note (8 Beats = 2 Takte)
  ],
  4: [
    [0.5, 0.5, 1, 2],   // 2 Achtel, Viertel, Halbe (4 Beats = 1 Takt)
    [1, 1, 1, 2],       // 3 Viertel, Halbe (5 Beats)
    [0.5, 0.5, 1, 4],   // 2 Achtel, Viertel, Ganze Note (6 Beats)
    [1, 1, 2, 4]        // 2 Viertel, Halbe, Ganze (8 Beats = 2 Takte)
  ]
};

/**
 * Generator für unendlich fortlaufende, melodisch zusammenhängende Notenfolgen
 * mit musikalischen Rhythmen (Ganze, Halbe, Viertel, Achtel).
 */
export class MelodicPatternGenerator {
  constructor(keyId = 'c_major') {
    this.keyId = keyId;
    this.buffer = [];
    this.lastMidi = null;
    this.lastString = 2; // Start auf G-Saite
    this.currentPhraseTotalBeats = 0;
    this.initKey(keyId);
  }

  setKey(keyId) {
    this.keyId = keyId;
    this.buffer = [];
    this.lastMidi = null;
    this.currentPhraseTotalBeats = 0;
    this.initKey(keyId);
  }

  initKey(keyId) {
    // 1. Alle Noten des Pools für die Tonart laden (Bünde 0 bis 4)
    const rawPool = generatePoolForKey(keyId, 4);

    // 2. Noten nach MIDI-Tonhöhe sortieren und eindeutige Töne aufbereiten
    const noteMapByMidi = new Map();
    for (const note of rawPool) {
      if (!noteMapByMidi.has(note.midi)) {
        noteMapByMidi.set(note.midi, []);
      }
      noteMapByMidi.get(note.midi).push(note);
    }

    const uniqueMidis = Array.from(noteMapByMidi.keys()).sort((a, b) => a - b);
    this.scaleNotes = uniqueMidis.map(midi => {
      const variants = noteMapByMidi.get(midi);
      return {
        midi,
        variants
      };
    });

    // 3. Grundton (Tonika) der Tonart ermitteln
    this.rootPitchClass = this.getRootPitchClass(keyId);

    // 4. Alle Indizes in this.scaleNotes finden, die dem Grundton entsprechen
    this.rootIndices = [];
    this.scaleNotes.forEach((entry, idx) => {
      if (entry.midi % 12 === this.rootPitchClass) {
        this.rootIndices.push(idx);
      }
    });

    if (this.rootIndices.length === 0) {
      this.rootIndices = [Math.floor(this.scaleNotes.length / 2)];
    }
  }

  getRootPitchClass(keyId) {
    switch (keyId) {
      case 'c_major': return 0;  // C
      case 'g_major': return 7;  // G
      case 'd_major': return 2;  // D
      case 'a_major': return 9;  // A
      case 'e_major': return 4;  // E
      case 'h_major': return 11; // H
      case 'f_major': return 5;  // F
      case 'bb_major': return 10; // Bb
      case 'eb_major': return 3;  // Eb
      case 'ab_major': return 8;  // Ab
      case 'all_chromatic':
      default:
        const commonRoots = [0, 7, 2, 9, 4, 5];
        return commonRoots[Math.floor(Math.random() * commonRoots.length)];
    }
  }

  pickRhythm(length, isCadence = false) {
    if (isCadence && CADENCE_RHYTHM_TEMPLATES[length]) {
      return this.pickRandom(CADENCE_RHYTHM_TEMPLATES[length]);
    }
    if (RHYTHM_TEMPLATES[length]) {
      return this.pickRandom(RHYTHM_TEMPLATES[length]);
    }
    // Fallback: alle Viertelnoten
    return new Array(length).fill(1);
  }

  /**
   * Erzeugt eine vollständige musikalische Phrase mit Rhythmen
   * bestehend aus: Eröffnung -> Fortspinnung (1-2x) -> Kadenz
   */
  generatePhrase() {
    if (this.scaleNotes.length === 0) return [];

    // 1. Register / Lage wählen (tief, mittel oder hoch)
    const rootIndex = this.rootIndices[Math.floor(Math.random() * this.rootIndices.length)];

    // 2. Zufällige Bausteine auswählen
    const opening = this.pickRandom(MOTIF_LIBRARY.openings);
    const continuation = this.pickRandom(MOTIF_LIBRARY.continuations);
    const cadence = this.pickRandom(MOTIF_LIBRARY.cadences);

    // Manchmal eine zweite Fortspinnung einbauen für längere Phrasen
    const useSecondContinuation = Math.random() < 0.35;
    const continuation2 = useSecondContinuation ? this.pickRandom(MOTIF_LIBRARY.continuations) : null;

    const phraseNotes = [];

    // Eröffnung anwenden
    let currentBaseIndex = rootIndex;
    this.appendMotifToPhrase(phraseNotes, opening.steps, currentBaseIndex, false);

    if (phraseNotes.length > 0) {
      currentBaseIndex = phraseNotes[phraseNotes.length - 1].scaleIndex;
    }

    // Fortspinnung anfügen
    this.appendMotifToPhrase(phraseNotes, continuation.steps, currentBaseIndex, false);

    if (continuation2 && phraseNotes.length > 0) {
      currentBaseIndex = phraseNotes[phraseNotes.length - 1].scaleIndex;
      this.appendMotifToPhrase(phraseNotes, continuation2.steps, currentBaseIndex, false);
    }

    // Kadenz zum Schließen der Phrase
    let closestRoot = this.rootIndices[0];
    if (phraseNotes.length > 0) {
      const lastIdx = phraseNotes[phraseNotes.length - 1].scaleIndex;
      let minDiff = Infinity;
      for (const r of this.rootIndices) {
        const diff = Math.abs(r - lastIdx);
        if (diff < minDiff) {
          minDiff = diff;
          closestRoot = r;
        }
      }
    }
    this.appendMotifToPhrase(phraseNotes, cadence.steps, closestRoot, true);

    // Periodenbau: Phrasenlänge zur nächsten geraden Zählzeit / Taktgrenze runden
    const totalPhraseBeats = phraseNotes.reduce((sum, n) => sum + (n.duration || 1), 0);
    const remainder = totalPhraseBeats % 4;
    if (remainder > 0 && phraseNotes.length > 0) {
      const lastNote = phraseNotes[phraseNotes.length - 1];
      const neededBeats = 4 - remainder;
      const targetDuration = lastNote.duration + neededBeats;
      if (targetDuration === 2 || targetDuration === 4) {
        lastNote.duration = targetDuration;
      }
    }

    return phraseNotes;
  }

  appendMotifToPhrase(phraseNotes, steps, baseIndex, isCadence = false) {
    const rhythms = this.pickRhythm(steps.length, isCadence);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const targetIndex = baseIndex + step;
      const clampedIndex = Math.max(0, Math.min(this.scaleNotes.length - 1, targetIndex));
      const scaleEntry = this.scaleNotes[clampedIndex];

      const noteVariant = this.pickBestVariant(scaleEntry.variants);
      const duration = (rhythms && rhythms[i]) ? rhythms[i] : 1;

      this.lastMidi = noteVariant.midi;
      this.lastString = noteVariant.string;

      phraseNotes.push({
        ...noteVariant,
        duration: duration,
        scaleIndex: clampedIndex
      });
    }
  }

  pickBestVariant(variants) {
    if (!variants || variants.length === 0) return null;
    if (variants.length === 1) return variants[0];

    let best = variants[0];
    let bestDist = Math.abs(variants[0].string - this.lastString);

    for (let i = 1; i < variants.length; i++) {
      const dist = Math.abs(variants[i].string - this.lastString);
      if (dist < bestDist) {
        bestDist = dist;
        best = variants[i];
      }
    }
    return best;
  }

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getNextNote() {
    if (this.buffer.length === 0) {
      const newPhrase = this.generatePhrase();
      this.buffer.push(...newPhrase);
    }

    if (this.buffer.length === 0) {
      return null;
    }

    return this.buffer.shift();
  }

  reset() {
    this.buffer = [];
    this.lastMidi = null;
    this.currentPhraseTotalBeats = 0;
  }
}
