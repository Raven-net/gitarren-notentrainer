export class RhythmGameMode {
  constructor(options = {}) {
    this.staffRenderer = options.staffRenderer;
    this.fretboardRenderer = options.fretboardRenderer;
    this.synth = options.synth;
    this.onProgressUpdate = options.onProgressUpdate;
    this.onComplete = options.onComplete;

    this.currentSong = null;
    this.bpm = 100;
    this.pixelsPerBeat = 90; // Pixelabstand pro Viertelnote
    this.hitLineX = this.staffRenderer.hitLineX;

    this.isPlaying = false;
    this.songTime = 0; // Verstrichene Zeit in Sekunden
    this.startDelay = 2.0; // 2 Sekunden Einzähler / Vorlauf
    this.hitWindowSeconds = 0.22; // +/- 220ms Trefferfenster

    this.notesState = []; // [{ note, targetTime, state: 'pending'|'hit'|'miss' }]
    this.hits = 0;
    this.misses = 0;
    this.streak = 0;
    this.maxStreak = 0;

    this.lastBeatNumber = -1;
    this.metronomeEnabled = true;
  }

  setBpm(bpm) {
    this.bpm = bpm;
  }

  setMetronome(enabled) {
    this.metronomeEnabled = enabled;
  }

  loadSong(song, customBpm = null) {
    this.currentSong = song;
    this.bpm = customBpm || song.bpm || 100;
    this.reset();
  }

  reset() {
    this.songTime = -this.startDelay;
    this.isPlaying = true;
    this.hits = 0;
    this.misses = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.lastBeatNumber = -1;

    if (!this.currentSong) {
      this.notesState = [];
      return;
    }

    // Noten auf Zeitachse abbilden
    const secondsPerBeat = 60 / this.bpm;
    let accumulatedBeats = 0;

    this.notesState = this.currentSong.notes.map((n, idx) => {
      const noteStartTime = accumulatedBeats * secondsPerBeat;
      accumulatedBeats += (n.duration || 1);
      return {
        id: idx,
        note: n,
        targetTime: noteStartTime,
        durationSeconds: (n.duration || 1) * secondsPerBeat,
        state: 'pending' // 'pending' | 'hit' | 'miss'
      };
    });

    this.notifyProgress();
  }

  stop() {
    this.isPlaying = false;
    this.fretboardRenderer.clearHints();
  }

  notifyProgress() {
    if (this.onProgressUpdate && this.notesState.length > 0) {
      const total = this.notesState.length;
      const completed = this.hits + this.misses;
      const accuracy = completed > 0 ? Math.round((this.hits / completed) * 100) : 100;
      this.onProgressUpdate({
        hits: this.hits,
        misses: this.misses,
        total: total,
        streak: this.streak,
        accuracy: accuracy,
        scoreText: `Hits: ${this.hits}/${total} (${accuracy}%)`
      });
    }
  }

  evaluateNote(playedMidi, btnElement = null) {
    if (!this.isPlaying || this.notesState.length === 0) return;

    // Finde die Note, die der Ziellinie am nächsten ist und noch "pending" ist
    let closestCandidate = null;
    let minTimeDiff = Infinity;

    for (let item of this.notesState) {
      if (item.state !== 'pending') continue;

      const diff = item.targetTime - this.songTime;
      // Liegt innerhalb des Trefferfensters
      if (Math.abs(diff) <= this.hitWindowSeconds) {
        if (Math.abs(diff) < minTimeDiff) {
          minTimeDiff = Math.abs(diff);
          closestCandidate = item;
        }
      }
    }

    if (closestCandidate) {
      if (playedMidi === closestCandidate.note.midi) {
        // PERFEKTER / GUTER TREFFER (GRÜN)
        closestCandidate.state = 'hit';
        this.hits++;
        this.streak++;
        if (this.streak > this.maxStreak) this.maxStreak = this.streak;

        this.synth.playTone(closestCandidate.note.freq, true);
        this.fretboardRenderer.highlightMidi(playedMidi, 'correct-flash');
        this.notifyProgress();
      } else {
        // FALSCHER TON GESPIELT (ROT)
        this.synth.playTone(0, false);
        if (btnElement) {
          this.fretboardRenderer.flashButton(btnElement, 'wrong-flash');
        } else {
          this.fretboardRenderer.highlightMidi(playedMidi, 'wrong-flash');
        }
      }
    } else {
      // Zu früh oder kein Ziel im Trefferfenster
      if (btnElement) {
        this.fretboardRenderer.flashButton(btnElement, 'wrong-flash');
      }
    }
  }

  update(dt) {
    if (!this.isPlaying || !this.currentSong) return;

    this.songTime += dt;

    // Metronom-Klick berechnen
    const secondsPerBeat = 60 / this.bpm;
    if (this.songTime >= -this.startDelay) {
      const currentBeat = Math.floor(this.songTime / secondsPerBeat);
      if (currentBeat !== this.lastBeatNumber) {
        this.lastBeatNumber = currentBeat;
        if (this.metronomeEnabled) {
          const isMeasureStart = ((currentBeat % 4) + 4) % 4 === 0;
          this.synth.playClick(isMeasureStart);
        }
      }
    }

    // Prüfen, ob Noten das Trefferfenster ungespielt verpasst haben
    for (let item of this.notesState) {
      if (item.state === 'pending') {
        // Wenn Note mehr als hitWindowSeconds hinter der Ziellinie liegt
        if (this.songTime - item.targetTime > this.hitWindowSeconds) {
          item.state = 'miss'; // ROT
          this.misses++;
          this.streak = 0;
          this.fretboardRenderer.highlightMidi(item.note.midi, 'wrong-flash', 220);
          this.notifyProgress();
        }
      }
    }

    // Nächste erwartete Note auf Griffbrett anzeigen
    const upcoming = this.notesState.find(n => n.state === 'pending' && n.targetTime - this.songTime > -0.1);
    if (upcoming) {
      this.fretboardRenderer.setTargetHint(upcoming.note.midi);
    } else {
      this.fretboardRenderer.clearHints();
    }

    // Prüfen, ob das Lied zu Ende ist
    const lastNote = this.notesState[this.notesState.length - 1];
    if (lastNote && this.songTime > lastNote.targetTime + lastNote.durationSeconds + 1.2) {
      this.isPlaying = false;
      if (this.onComplete) {
        const total = this.notesState.length;
        const accuracy = total > 0 ? Math.round((this.hits / total) * 100) : 0;
        this.onComplete({
          mode: 'rhythm',
          song: this.currentSong,
          bpm: this.bpm,
          total: total,
          hits: this.hits,
          misses: this.misses,
          accuracy: accuracy,
          maxStreak: this.maxStreak
        });
      }
    }
  }

  render() {
    this.staffRenderer.drawStaff();
    if (!this.currentSong) return;

    const secondsPerBeat = 60 / this.bpm;
    const pixelsPerSecond = (this.pixelsPerBeat / secondsPerBeat);

    // Takte zeichnen
    const totalBeats = this.currentSong.getTotalBeats();
    for (let b = 0; b <= totalBeats + 4; b += 4) {
      const beatTime = b * secondsPerBeat;
      const barX = this.hitLineX + (beatTime - this.songTime) * pixelsPerSecond;
      this.staffRenderer.drawBarLine(barX);
    }

    // Noten zeichnen
    for (let item of this.notesState) {
      const timeDiff = item.targetTime - this.songTime;
      const noteX = this.hitLineX + (timeDiff * pixelsPerSecond);

      if (noteX >= 40 && noteX <= this.staffRenderer.width + 40) {
        const isSharp = [1, 3, 6, 8, 10].includes(item.note.midi % 12);
        const accidental = isSharp ? '♯' : null;

        this.staffRenderer.drawNote(
          noteX,
          item.note.diatonicStep,
          item.note.duration,
          item.state, // 'pending'/'normal', 'hit', 'miss'
          accidental
        );
      }
    }

    // Einzähler-Hinweis auf Canvas anzeigen, wenn im Vorlauf
    if (this.songTime < 0) {
      const count = Math.ceil(-this.songTime);
      this.staffRenderer.ctx.save();
      this.staffRenderer.ctx.fillStyle = 'rgba(234, 88, 12, 0.9)';
      this.staffRenderer.ctx.font = 'bold 36px system-ui, sans-serif';
      this.staffRenderer.ctx.textAlign = 'center';
      this.staffRenderer.ctx.fillText(`Start in: ${count}`, this.staffRenderer.width / 2, 50);
      this.staffRenderer.ctx.restore();
    }
  }
}
