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
    { name: 'Gebrochene Terzen aufwärts', steps: [0, 2, 1, 3, 2] },
    { name: 'Gebrochene Terzen abwärts', steps: [4, 2, 3, 1, 2] },
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
    { name: 'Halbschluss auf Quinte', steps: [0, 1, 2, 3, 4] },
    { name: 'Beruhigender Terzschluss 2-1-0', steps: [1, 0, -1, 0] }
  ]
};

/**
 * Generator für unendlich fortlaufende, melodisch zusammenhängende Notenfolgen.
 */
export class MelodicPatternGenerator {
  constructor(keyId = 'c_major') {
    this.keyId = keyId;
    this.buffer = [];
    this.lastMidi = null;
    this.lastString = 2; // Start auf G-Saite
    this.initKey(keyId);
  }

  setKey(keyId) {
    this.keyId = keyId;
    this.buffer = [];
    this.lastMidi = null;
    this.initKey(keyId);
  }

  initKey(keyId) {
    // 1. Alle Noten des Pools für die Tonart laden (Bünde 0 bis 4)
    const rawPool = generatePoolForKey(keyId, 4);

    // 2. Noten nach MIDI-Tonhöhe sortieren
    // und eindeutige Töne für die Skala aufbereiten
    const noteMapByMidi = new Map();
    for (const note of rawPool) {
      if (!noteMapByMidi.has(note.midi)) {
        noteMapByMidi.set(note.midi, []);
      }
      noteMapByMidi.get(note.midi).push(note);
    }

    const uniqueMidis = Array.from(noteMapByMidi.keys()).sort((a, b) => a - b);
    this.scaleNotes = uniqueMidis.map(midi => {
      // Bevorzuge offene Saiten oder ergonomische Bünde
      const variants = noteMapByMidi.get(midi);
      return {
        midi,
        variants
      };
    });

    // 3. Grundton (Tonika) der Tonart ermitteln
    // Standardmäßig: Tonika-Pitch-Class
    this.rootPitchClass = this.getRootPitchClass(keyId);

    // 4. Alle Indizes in this.scaleNotes finden, die dem Grundton entsprechen
    this.rootIndices = [];
    this.scaleNotes.forEach((entry, idx) => {
      if (entry.midi % 12 === this.rootPitchClass) {
        this.rootIndices.push(idx);
      }
    });

    // Fallback falls kein exakter Grundton (z.B. bei rein chromatisch)
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
        // Bei chromatisch: Zufälliger Grundton unter den häufigsten Tonarten
        const commonRoots = [0, 7, 2, 9, 4, 5];
        return commonRoots[Math.floor(Math.random() * commonRoots.length)];
    }
  }

  /**
   * Erzeugt eine vollständige musikalische Phrase
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
    const useSecondContinuation = Math.random() < 0.4;
    const continuation2 = useSecondContinuation ? this.pickRandom(MOTIF_LIBRARY.continuations) : null;

    // 3. Aus Stufen konkrete Noten-Indizes in this.scaleNotes erzeugen
    const phraseNotes = [];

    // Eröffnung anwenden
    let currentBaseIndex = rootIndex;
    this.appendMotifToPhrase(phraseNotes, opening.steps, currentBaseIndex);

    // Letzter Notenindex dient als Stimmführungs-Anker
    if (phraseNotes.length > 0) {
      currentBaseIndex = phraseNotes[phraseNotes.length - 1].scaleIndex;
    }

    // Fortspinnung anfügen
    this.appendMotifToPhrase(phraseNotes, continuation.steps, currentBaseIndex);

    if (continuation2 && phraseNotes.length > 0) {
      currentBaseIndex = phraseNotes[phraseNotes.length - 1].scaleIndex;
      this.appendMotifToPhrase(phraseNotes, continuation2.steps, currentBaseIndex);
    }

    // Zur Tonika hin auflösen mit Kadenz
    // Wähle den Grundton-Index, der der aktuellen Position am nächsten ist
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
    this.appendMotifToPhrase(phraseNotes, cadence.steps, closestRoot);

    return phraseNotes;
  }

  appendMotifToPhrase(phraseNotes, steps, baseIndex) {
    for (const step of steps) {
      const targetIndex = baseIndex + step;
      // Sicherstellen, dass der Index innerhalb der Gitarrenbünde (0..4) liegt
      const clampedIndex = Math.max(0, Math.min(this.scaleNotes.length - 1, targetIndex));
      const scaleEntry = this.scaleNotes[clampedIndex];

      // Beste Saiten-/Bund-Variante wählen (möglichst nah an der vorherigen Saite)
      const noteVariant = this.pickBestVariant(scaleEntry.variants);

      this.lastMidi = noteVariant.midi;
      this.lastString = noteVariant.string;

      phraseNotes.push({
        ...noteVariant,
        scaleIndex: clampedIndex
      });
    }
  }

  pickBestVariant(variants) {
    if (!variants || variants.length === 0) return null;
    if (variants.length === 1) return variants[0];

    // Bevorzuge Saiten, die nah an der zuletzt gespielten Saite liegen
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

  /**
   * Liefert die nächste Note der Melodielinie.
   * Wenn der Puffer leer ist, wird automatisch eine neue Phrase generiert.
   */
  getNextNote() {
    if (this.buffer.length === 0) {
      const newPhrase = this.generatePhrase();
      this.buffer.push(...newPhrase);
    }

    if (this.buffer.length === 0) {
      // Sicherheits-Fallback
      return null;
    }

    return this.buffer.shift();
  }

  reset() {
    this.buffer = [];
    this.lastMidi = null;
  }
}
