import { NOTE_NAMES } from '../models/Note.js';

export class PitchDetector {
  constructor(options = {}) {
    this.rmsThreshold = options.rmsThreshold || 0.015;
    this.minFreq = options.minFreq || 70;    // Tiefes E Gitarre ist ca. 82.4 Hz
    this.maxFreq = options.maxFreq || 1100; // Bis über Bund 15 auf hoher e-Saite (G5 = 784 Hz, C6 = 1046 Hz)
    this.centsTolerance = options.centsTolerance || 42;
    this.requiredStreak = options.requiredStreak || 2;
    this.cooldownMs = options.cooldownMs || 280;

    this.streakCount = 0;
    this.detectedMidiStreak = -1;
    this.lastDetectedMidi = -1;
    this.lastHitTime = 0;
  }

  setRmsThreshold(val) {
    this.rmsThreshold = val;
  }

  /**
   * YIN/Autokorrelation auf Float32-Audio-Buffer
   */
  autoCorrelate(buf, sampleRate) {
    let rms = 0;
    for (let i = 0; i < buf.length; i++) {
      rms += buf[i] * buf[i];
    }
    rms = Math.sqrt(rms / buf.length);

    // RMS Pegel für VU-Meter zurückgeben
    this.lastRms = rms;

    if (rms < this.rmsThreshold) return -1;

    let r1 = 0, r2 = buf.length - 1;
    const thres = 0.2;
    for (let i = 0; i < buf.length / 2; i++) {
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < buf.length / 2; i++) {
      if (Math.abs(buf[buf.length - i]) < thres) { r2 = buf.length - i; break; }
    }
    const trimmed = buf.slice(r1, r2);
    if (trimmed.length < 32) return -1;

    const c = new Float32Array(trimmed.length).fill(0);
    for (let lag = 0; lag < trimmed.length; lag++) {
      for (let i = 0; i < trimmed.length - lag; i++) {
        c[lag] += trimmed[i] * trimmed[i + lag];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < trimmed.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    // Parabolische Interpolation für feinere Frequenzauflösung
    if (T0 > 0 && T0 < trimmed.length - 1) {
      const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
      const a = (x1 + x3 - 2 * x2) / 2;
      const b = (x3 - x1) / 2;
      if (a) T0 = T0 - b / (2 * a);
    }

    return sampleRate / T0;
  }

  /**
   * Verarbeitet einen Audio-Frame und meldet erkannte Note
   */
  process(audioBuffer, sampleRate, now, onValidNote) {
    const freq = this.autoCorrelate(audioBuffer, sampleRate);
    let result = {
      detected: false,
      midi: null,
      noteName: "--",
      freq: freq,
      rms: this.lastRms || 0
    };

    if (freq >= this.minFreq && freq <= this.maxFreq) {
      const midiExact = 69 + 12 * Math.log2(freq / 440);
      const midiRounded = Math.round(midiExact);
      const centsOff = Math.floor((midiExact - midiRounded) * 100);

      if (Math.abs(centsOff) <= this.centsTolerance) {
        const noteName = NOTE_NAMES[midiRounded % 12];
        const oct = Math.floor(midiRounded / 12) - 1;
        result.detected = true;
        result.midi = midiRounded;
        result.noteName = `${noteName}${oct}`;

        if (midiRounded === this.detectedMidiStreak) {
          this.streakCount++;
          if (
            this.streakCount === this.requiredStreak &&
            (now - this.lastHitTime > this.cooldownMs || this.lastDetectedMidi !== midiRounded)
          ) {
            this.lastDetectedMidi = midiRounded;
            this.lastHitTime = now;
            if (onValidNote) onValidNote(midiRounded, result.noteName);
          }
        } else {
          this.detectedMidiStreak = midiRounded;
          this.streakCount = 1;
        }
      }
    } else {
      this.detectedMidiStreak = -1;
      this.streakCount = 0;
    }

    return result;
  }
}
