import { createNote } from './Note.js';

export class Song {
  constructor(data) {
    this.id = data.id || 'custom_' + Date.now();
    this.title = data.title || 'Unbenanntes Stück';
    this.artist = data.artist || 'Unbekannt';
    this.category = data.category || 'Eigene Lieder';
    this.bpm = data.bpm || 100;
    this.timeSignature = data.timeSignature || [4, 4];
    this.description = data.description || '';
    
    // Noten aufbereiten mit IDs und Berechnungen (beat-Unterstützung und Fallback)
    let runningBeat = 0;
    this.notes = (data.notes || []).map((n, idx) => {
      const beat = (n.beat !== undefined && n.beat !== null) ? Number(n.beat) : runningBeat;
      const duration = n.duration !== undefined ? Number(n.duration) : 1;
      if (n.beat === undefined || n.beat === null) {
        runningBeat += duration;
      }
      const noteObj = createNote(n.midi, duration, n.string, n.fret);
      return {
        ...noteObj,
        beat: beat,
        id: idx
      };
    });

    // Chronologisch nach Startzeit (beat) sortieren, bei gleichem Beat nach Tonhöhe
    this.notes.sort((a, b) => a.beat - b.beat || a.midi - b.midi);
    this.notes.forEach((n, idx) => { n.id = idx; });
  }

  getTotalBeats() {
    if (this.notes.length === 0) return 0;
    return this.notes.reduce((max, n) => Math.max(max, (n.beat || 0) + (n.duration || 1)), 0);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      category: this.category,
      bpm: this.bpm,
      timeSignature: this.timeSignature,
      description: this.description,
      notes: this.notes.map(n => ({
        midi: n.midi,
        beat: n.beat,
        duration: n.duration,
        ...(n.string !== undefined && n.string !== null ? { string: n.string } : {}),
        ...(n.fret !== undefined && n.fret !== null ? { fret: n.fret } : {})
      }))
    };
  }
}
