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
    
    // Noten aufbereiten mit IDs und Berechnungen
    this.notes = (data.notes || []).map((n, idx) => {
      const noteObj = createNote(n.midi, n.duration || 1, n.string, n.fret);
      return {
        ...noteObj,
        id: idx
      };
    });
  }

  getTotalBeats() {
    return this.notes.reduce((sum, n) => sum + (n.duration || 1), 0);
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
        duration: n.duration,
        ...(n.string !== undefined && n.string !== null ? { string: n.string } : {}),
        ...(n.fret !== undefined && n.fret !== null ? { fret: n.fret } : {})
      }))
    };
  }
}
