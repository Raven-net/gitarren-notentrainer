import { STRINGS } from '../models/Note.js';

export class FretboardRenderer {
  constructor(containerEl, onNoteClick = null) {
    this.container = containerEl;
    this.onNoteClick = onNoteClick;
    this.fretButtons = {};
    this.targetElements = {};
    this.maxFrets = 4;

    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.fretButtons = {};
    this.targetElements = {};

    for (let f = 0; f <= this.maxFrets; f++) {
      const col = document.createElement('div');
      col.className = 'fret-column';

      const header = document.createElement('div');
      header.className = 'fret-header';
      header.innerText = f === 0 ? 'Offen (0)' : `Bund ${f}`;
      col.appendChild(header);

      // Fret Marker Dot auf Bund 3
      if (f === 3) {
        const marker = document.createElement('div');
        marker.className = 'fret-marker';
        col.appendChild(marker);
      }

      // 6 Saiten: Von hoher e (Index 0) bis tiefer E (Index 5)
      for (let s = 0; s < STRINGS.length; s++) {
        const target = document.createElement('div');
        target.className = 'note-target';

        const line = document.createElement('div');
        line.className = 'string-line';
        line.style.height = `${STRINGS[s].gauge}px`;
        target.appendChild(line);

        if (f === 0) {
          const lbl = document.createElement('span');
          lbl.className = 'string-label';
          lbl.innerText = STRINGS[s].name;
          target.appendChild(lbl);
        }

        const btn = document.createElement('div');
        btn.className = 'note-btn';
        target.appendChild(btn);

        const midi = STRINGS[s].baseMidi + f;
        const key = `${s}-${f}`;
        this.fretButtons[key] = btn;
        this.targetElements[key] = target;

        target.addEventListener('mousedown', (e) => {
          e.preventDefault();
          if (this.onNoteClick) {
            this.onNoteClick(midi, s, f, btn);
          }
        });

        col.appendChild(target);
      }

      this.container.appendChild(col);
    }
  }

  highlightMidi(midi, className = 'correct-flash', durationMs = 280) {
    for (let s = 0; s < STRINGS.length; s++) {
      for (let f = 0; f <= this.maxFrets; f++) {
        if (STRINGS[s].baseMidi + f === midi) {
          const btn = this.fretButtons[`${s}-${f}`];
          if (btn) {
            btn.classList.add(className);
            setTimeout(() => btn.classList.remove(className), durationMs);
          }
        }
      }
    }
  }

  flashButton(btn, className = 'wrong-flash', durationMs = 280) {
    if (!btn) return;
    btn.classList.add(className);
    setTimeout(() => btn.classList.remove(className), durationMs);
  }

  setTargetHint(targetMidi) {
    for (let s = 0; s < STRINGS.length; s++) {
      for (let f = 0; f <= this.maxFrets; f++) {
        const target = this.targetElements[`${s}-${f}`];
        if (!target) continue;
        if (targetMidi !== null && STRINGS[s].baseMidi + f === targetMidi) {
          target.classList.add('target-hint');
        } else {
          target.classList.remove('target-hint');
        }
      }
    }
  }

  clearHints() {
    this.setTargetHint(null);
  }
}
