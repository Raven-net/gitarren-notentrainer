export class PracticeMode {
  constructor(options = {}) {
    this.staffRenderer = options.staffRenderer;
    this.fretboardRenderer = options.fretboardRenderer;
    this.synth = options.synth;
    this.onProgressUpdate = options.onProgressUpdate;
    this.onComplete = options.onComplete;

    this.currentSong = null;
    this.currentIndex = 0;
    this.scrollOffset = 0;
    this.noteSpacingUnit = 80;
    this.hitLineX = this.staffRenderer.hitLineX;
    this.showHints = true;
  }

  loadSong(song) {
    this.currentSong = song;
    this.currentIndex = 0;
    this.scrollOffset = 0;
    if (this.currentSong) {
      this.currentSong.notes.forEach(n => { n.isHit = false; });
    }
    this.updateHints();
    this.notifyProgress();
  }

  getCurrentChordNotes() {
    if (!this.currentSong || this.currentIndex >= this.currentSong.notes.length) return [];
    const currentBeat = this.currentSong.notes[this.currentIndex].beat;
    return this.currentSong.notes.filter(
      n => Math.abs(n.beat - currentBeat) < 0.05 && !n.isHit
    );
  }

  updateHints() {
    if (!this.currentSong || this.currentIndex >= this.currentSong.notes.length) {
      this.fretboardRenderer.clearHints();
      return;
    }
    const currentChord = this.getCurrentChordNotes();
    if (this.showHints && currentChord.length > 0) {
      this.fretboardRenderer.setTargetHint(currentChord.map(n => n.midi));
    } else {
      this.fretboardRenderer.clearHints();
    }
  }

  notifyProgress() {
    if (this.onProgressUpdate && this.currentSong) {
      this.onProgressUpdate({
        index: this.currentIndex,
        total: this.currentSong.notes.length,
        scoreText: `${this.currentIndex} / ${this.currentSong.notes.length}`
      });
    }
  }

  evaluateNote(playedMidi, btnElement = null) {
    if (!this.currentSong || this.currentIndex >= this.currentSong.notes.length) return;

    // Prüfen, ob der gespielte Ton zur aktuellen Zählzeit (Gruppe / Akkord) gehört
    const currentBeat = this.currentSong.notes[this.currentIndex].beat;
    const match = this.currentSong.notes.find(
      n => Math.abs(n.beat - currentBeat) < 0.05 && !n.isHit && n.midi === playedMidi
    );

    if (match) {
      // Treffer! Kurzer Ton wie bisher (kein Dauerton)
      match.isHit = true;
      this.synth.playTone(match.freq, true);
      this.fretboardRenderer.highlightMidi(playedMidi, 'correct-flash');

      // Vorrücken, bis alle getroffenen Noten übersprungen sind
      while (
        this.currentIndex < this.currentSong.notes.length &&
        this.currentSong.notes[this.currentIndex].isHit
      ) {
        this.currentIndex++;
      }

      this.updateHints();
      this.notifyProgress();

      if (this.currentIndex >= this.currentSong.notes.length) {
        if (this.onComplete) {
          this.onComplete({
            mode: 'practice',
            song: this.currentSong,
            total: this.currentSong.notes.length,
            hits: this.currentSong.notes.length,
            accuracy: 100
          });
        }
      }
    } else {
      // Fehlversuch
      this.synth.playTone(0, false);
      if (btnElement) {
        this.fretboardRenderer.flashButton(btnElement, 'wrong-flash');
      } else {
        this.fretboardRenderer.highlightMidi(playedMidi, 'wrong-flash');
      }
    }
  }

  update(dt) {
    if (!this.currentSong) return;

    // Zielposition weich anhand des aktuellen Beats anfahren
    let targetScroll = 0;
    if (this.currentIndex < this.currentSong.notes.length) {
      targetScroll = (this.currentSong.notes[this.currentIndex].beat || 0) * this.noteSpacingUnit;
    } else {
      targetScroll = this.currentSong.getTotalBeats() * this.noteSpacingUnit;
    }

    this.scrollOffset += (targetScroll - this.scrollOffset) * Math.min(dt * 10, 1);
  }

  render() {
    this.staffRenderer.drawStaff();
    if (!this.currentSong) return;

    const totalBeats = this.currentSong.getTotalBeats();
    const currentBeat = this.currentIndex < this.currentSong.notes.length
      ? this.currentSong.notes[this.currentIndex].beat
      : -1;

    // 1. Taktstriche an festen Taktgrenzen zeichnen (alle 4 Zählzeiten)
    for (let b = 0; b <= totalBeats + 4; b += 4) {
      const barLineX = this.hitLineX + (b * this.noteSpacingUnit) - this.scrollOffset;
      this.staffRenderer.drawBarLine(barLineX);
    }

    // 2. Notenköpfe zeichnen
    for (let i = 0; i < this.currentSong.notes.length; i++) {
      const note = this.currentSong.notes[i];
      const noteX = this.hitLineX + (note.beat * this.noteSpacingUnit) - this.scrollOffset;

      if (noteX >= 40 && noteX <= this.staffRenderer.width + 40) {
        let status = 'normal';
        if (note.isHit) {
          status = 'hit';
        } else if (Math.abs(note.beat - currentBeat) < 0.05) {
          status = 'target';
        }

        const isSharp = [1, 3, 6, 8, 10].includes(note.midi % 12);
        const accidental = isSharp ? '♯' : null;

        this.staffRenderer.drawNote(noteX, note.diatonicStep, note.duration, status, accidental);
      }
    }
  }
}
