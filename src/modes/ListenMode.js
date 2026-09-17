/**
 * ListenMode: Spielt das ausgewählte Lied automatisch ab (Playback),
 * damit der Benutzer die Melodie und das Timing mit authentischen Beep-Tönen
 * in der richtigen Tonhöhe verinnerlichen kann.
 */
export class ListenMode {
  constructor(options = {}) {
    this.staffRenderer = options.staffRenderer;
    this.fretboardRenderer = options.fretboardRenderer;
    this.synth = options.synth;
    this.audioEngine = options.audioEngine;
    this.onProgressUpdate = options.onProgressUpdate;
    this.onNotePlay = options.onNotePlay;
    this.onComplete = options.onComplete;

    this.currentSong = null;
    this.bpm = 100;
    this.pixelsPerBeat = 90;
    this.hitLineX = this.staffRenderer.hitLineX;

    this.isPlaying = false;
    this.songTime = 0; // Sekunden
    this.countInBeats = 4; // Fester vorgeschalteter 4/4-Takt zum Einzählen (1, 2, 3, 4)
    this.startDelay = this.getStartDelay();

    this.notesState = []; // [{ id, note, targetTime, durationSeconds, played: boolean }]
    this.playedCount = 0;
    this.lastBeatNumber = null;
    this.metronomeEnabled = true;
  }

  getCountInBeats() {
    return 4;
  }

  getStartDelay() {
    const secondsPerBeat = 60 / (this.bpm || 100);
    return this.getCountInBeats() * secondsPerBeat;
  }

  setBpm(bpm) {
    if (this.bpm === bpm) return;
    const oldSecondsPerBeat = 60 / this.bpm;
    this.bpm = bpm;
    this.startDelay = this.getStartDelay();
    const newSecondsPerBeat = 60 / this.bpm;

    // Zeitposition anpassen, damit das Playback nicht springt
    if (this.isPlaying && this.currentSong) {
      const currentBeat = this.songTime / oldSecondsPerBeat;
      this.songTime = currentBeat * newSecondsPerBeat;
    }

    if (this.currentSong) {
      this.notesState.forEach(n => {
        n.targetTime = (n.note.beat !== undefined ? n.note.beat : 0) * newSecondsPerBeat;
        n.durationSeconds = (n.note.duration || 1) * newSecondsPerBeat;
      });
    }
  }

  setMetronome(enabled) {
    this.metronomeEnabled = enabled;
  }

  loadSong(song, customBpm = null) {
    this.currentSong = song;
    this.bpm = customBpm || song.bpm || 100;
    this.stop();
    this.prepareTimeline();
    this.notifyProgress("Bereit – Klicke auf Start");
  }

  prepareTimeline() {
    if (!this.currentSong) {
      this.notesState = [];
      return;
    }

    const secondsPerBeat = 60 / this.bpm;
    this.startDelay = this.getStartDelay();

    this.notesState = this.currentSong.notes.map((n, idx) => {
      const noteStartTime = (n.beat !== undefined ? n.beat : 0) * secondsPerBeat;
      return {
        id: idx,
        note: n,
        targetTime: noteStartTime,
        durationSeconds: (n.duration || 1) * secondsPerBeat,
        played: false
      };
    });

    this.songTime = 0;
    this.playedCount = 0;
    if (this.notesState.length > 0) {
      const firstTarget = this.notesState[0].targetTime;
      const firstGroup = this.notesState.filter(n => Math.abs(n.targetTime - firstTarget) < 0.05);
      this.fretboardRenderer.setTargetHint(firstGroup.map(g => g.note.midi));
    }
  }

  async start() {
    if (!this.currentSong) return;
    if (this.audioEngine && this.audioEngine.initAudioContext) {
      await this.audioEngine.initAudioContext();
    }
    this.prepareTimeline();
    this.startDelay = this.getStartDelay();
    this.songTime = -this.startDelay;
    this.isPlaying = true;
    this.playedCount = 0;
    this.lastBeatNumber = null;
    this.notifyProgress();
  }

  stop() {
    this.isPlaying = false;
    this.songTime = 0;
    this.fretboardRenderer.clearHints();
    if (this.notesState) {
      this.notesState.forEach(n => { n.played = false; });
    }
    this.notifyProgress("Gestoppt – Klicke auf Start");
  }

  async togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      await this.start();
    }
    return this.isPlaying;
  }

  notifyProgress(customText = null) {
    if (this.onProgressUpdate && this.notesState.length > 0) {
      const total = this.notesState.length;
      this.onProgressUpdate({
        played: this.playedCount,
        total: total,
        scoreText: customText || `Vorspielen: ${this.playedCount} / ${total} Noten`
      });
    }
  }

  update(dt) {
    if (!this.isPlaying || !this.currentSong) return;

    this.songTime += dt;
    const secondsPerBeat = 60 / this.bpm;

    // Metronom-Klick
    if (this.songTime >= -this.startDelay - 0.05) {
      const currentBeat = Math.floor(this.songTime / secondsPerBeat);
      if (currentBeat !== this.lastBeatNumber) {
        this.lastBeatNumber = currentBeat;
        if (this.songTime < 0 || this.metronomeEnabled) {
          const isMeasureStart = ((currentBeat % 4) + 4) % 4 === 0;
          this.synth.playClick(isMeasureStart);
        }
      }
    }

    // Noten abspielen, deren Zielzeitpunkt erreicht ist
    let notesPlayedThisFrame = [];
    for (let item of this.notesState) {
      if (!item.played && item.targetTime <= this.songTime) {
        item.played = true;
        this.playedCount++;
        notesPlayedThisFrame.push(item);

        // Beep-Ton in der richtigen Tonhöhe abspielen
        this.synth.playTone(item.note.freq, true);

        // Griffbrett synchron zur Note aufleuchten lassen
        this.fretboardRenderer.highlightMidi(
          item.note.midi,
          'correct-flash',
          Math.max(item.durationSeconds * 900, 260)
        );

        if (this.onNotePlay) {
          this.onNotePlay(item.note.name);
        }
      }
    }

    if (notesPlayedThisFrame.length > 0) {
      this.notifyProgress();
    }

    // Nächste anstehende Note(n) als Vorschau-Hinweis auf dem Griffbrett markieren
    const nextUnplayed = this.notesState.find(n => !n.played);
    if (nextUnplayed) {
      const chord = this.notesState.filter(
        n => !n.played && Math.abs(n.targetTime - nextUnplayed.targetTime) < 0.05
      );
      this.fretboardRenderer.setTargetHint(chord.map(c => c.note.midi));
    } else {
      this.fretboardRenderer.clearHints();
    }

    // Prüfen, ob das Lied zu Ende ist
    const lastNote = this.notesState[this.notesState.length - 1];
    if (lastNote && this.songTime > lastNote.targetTime + lastNote.durationSeconds + 0.8) {
      this.stop();
      this.notifyProgress("Wiedergabe beendet ✓");
      if (this.onComplete) {
        this.onComplete();
      }
    }
  }

  render() {
    this.staffRenderer.drawStaff();
    if (!this.currentSong) return;

    const secondsPerBeat = 60 / this.bpm;
    const pixelsPerSecond = (this.pixelsPerBeat / secondsPerBeat);

    // Taktstriche zeichnen (inklusive vorgeschaltetem 4/4-Einzähl-Takt bei -4)
    const totalBeats = this.currentSong.getTotalBeats();
    for (let b = -4; b <= totalBeats + 4; b += 4) {
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

        // Sobald abgespielt, leuchtet die Note grün ('hit')
        const noteStatus = item.played ? 'hit' : 'normal';

        this.staffRenderer.drawNote(
          noteX,
          item.note.diatonicStep,
          item.note.duration,
          noteStatus,
          accidental
        );
      }
    }

    // Einzähler-Hinweis auf Canvas anzeigen, wenn im Vorlauf (1 bis 4)
    if (this.isPlaying && this.songTime < 0) {
      const currentBeat = Math.floor(this.songTime / secondsPerBeat);
      const count = Math.min(4, Math.max(1, currentBeat + 5));
      const ctx = this.staffRenderer.ctx;

      ctx.save();
      const badgeWidth = 260;
      const badgeHeight = 56;
      const badgeX = (this.staffRenderer.width - badgeWidth) / 2;
      const badgeY = 20;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 12);
        ctx.fill();
        ctx.strokeStyle = count === 1 ? 'rgba(234, 179, 8, 0.9)' : 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
      }

      ctx.fillStyle = count === 1 ? '#facc15' : '#38bdf8';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Einzählen: ${count}`, this.staffRenderer.width / 2, badgeY + badgeHeight / 2);
      ctx.restore();
    } else if (!this.isPlaying) {
      this.staffRenderer.ctx.save();
      this.staffRenderer.ctx.fillStyle = 'rgba(59, 130, 246, 0.85)';
      this.staffRenderer.ctx.font = 'bold 20px system-ui, sans-serif';
      this.staffRenderer.ctx.textAlign = 'center';
      this.staffRenderer.ctx.fillText('🎧 Klicke auf "Start" zum Anhören (oder Leertaste)', this.staffRenderer.width / 2, 45);
      this.staffRenderer.ctx.restore();
    }
  }
}
