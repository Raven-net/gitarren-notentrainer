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
    this.countInBeats = 4; // Fester vorgeschalteter 4/4-Takt zum Einzählen (1, 2, 3, 4)
    this.startDelay = this.getStartDelay();
    this.hitWindowSeconds = 0.22; // +/- 220ms Trefferfenster

    this.notesState = []; // [{ note, targetTime, state: 'pending'|'hit'|'miss' }]
    this.hits = 0;
    this.misses = 0;
    this.streak = 0;
    this.maxStreak = 0;

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
    this.bpm = bpm;
    this.startDelay = this.getStartDelay();
    if (!this.isPlaying && this.currentSong) {
      this.prepareTimeline();
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
        state: 'pending'
      };
    });

    this.songTime = 0;
    if (this.notesState.length > 0) {
      const firstTarget = this.notesState[0].targetTime;
      const firstGroup = this.notesState.filter(n => Math.abs(n.targetTime - firstTarget) < 0.05);
      this.fretboardRenderer.setTargetHint(firstGroup.map(g => g.note.midi));
    }
  }

  start() {
    if (!this.currentSong) return;
    this.prepareTimeline();
    this.startDelay = this.getStartDelay();
    this.songTime = -this.startDelay;
    this.isPlaying = true;
    this.hits = 0;
    this.misses = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.lastBeatNumber = null;
    this.notifyProgress();
  }

  stop() {
    this.isPlaying = false;
    this.songTime = 0;
    this.fretboardRenderer.clearHints();
    if (this.notesState) {
      this.notesState.forEach(n => { n.state = 'pending'; });
    }
    this.notifyProgress("Gestoppt – Klicke auf Start");
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  notifyProgress(customText = null) {
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
        scoreText: customText || `Hits: ${this.hits}/${total} (${accuracy}%)`
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
    if (this.songTime >= -this.startDelay - 0.05) {
      const currentBeat = Math.floor(this.songTime / secondsPerBeat);
      if (currentBeat !== this.lastBeatNumber) {
        this.lastBeatNumber = currentBeat;
        // Beim vorgeschalteten Einzähler (songTime < 0) immer hörbar klicken, danach nach Einstellung
        if (this.songTime < 0 || this.metronomeEnabled) {
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

    // Nächste erwartete Note(n) auf Griffbrett anzeigen (auch Akkorde/Mehrklänge)
    const upcomingActive = this.notesState.filter(
      n => n.state === 'pending' && Math.abs(n.targetTime - this.songTime) <= this.hitWindowSeconds + 0.05
    );
    if (upcomingActive.length > 0) {
      this.fretboardRenderer.setTargetHint(upcomingActive.map(u => u.note.midi));
    } else {
      const nextOne = this.notesState.find(n => n.state === 'pending' && n.targetTime - this.songTime > -0.1);
      if (nextOne) {
        const chord = this.notesState.filter(
          n => n.state === 'pending' && Math.abs(n.targetTime - nextOne.targetTime) < 0.05
        );
        this.fretboardRenderer.setTargetHint(chord.map(c => c.note.midi));
      } else {
        this.fretboardRenderer.clearHints();
      }
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

    // Takte zeichnen (inklusive vorgeschaltetem 4/4-Einzähl-Takt bei -4)
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

        this.staffRenderer.drawNote(
          noteX,
          item.note.diatonicStep,
          item.note.duration,
          item.state, // 'pending'/'normal', 'hit', 'miss'
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
      this.staffRenderer.ctx.fillText('▶ Klicke auf "Start" (oder Leertaste)', this.staffRenderer.width / 2, 45);
      this.staffRenderer.ctx.restore();
    }
  }
}
