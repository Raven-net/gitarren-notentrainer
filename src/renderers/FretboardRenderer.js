import { STRINGS } from '../models/Note.js';

export class FretboardRenderer {
  constructor(containerEl, onNoteClick = null) {
    this.container = containerEl;
    this.onNoteClick = onNoteClick;
    this.fretButtons = {};
    this.targetElements = {};
    this.maxFrets = 15;

    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.fretButtons = {};
    this.targetElements = {};

    for (let f = 0; f <= this.maxFrets; f++) {
      const col = document.createElement('div');
      col.className = 'fret-column';
      col.dataset.fret = f;

      const header = document.createElement('div');
      header.className = 'fret-header';
      header.innerText = f === 0 ? '0' : `${f}`;
      col.appendChild(header);

      // Authentische Gitarren-Bundmarkierungen (Inlays)
      if ([3, 5, 7, 9, 15].includes(f)) {
        const marker = document.createElement('div');
        marker.className = 'fret-marker single';
        col.appendChild(marker);
      } else if (f === 12) {
        // Bund 12: Doppelpunkt-Markierung (Oktave)
        const markerTop = document.createElement('div');
        markerTop.className = 'fret-marker double-top';
        col.appendChild(markerTop);

        const markerBottom = document.createElement('div');
        markerBottom.className = 'fret-marker double-bottom';
        col.appendChild(markerBottom);
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
    let scrollToEl = null;
    for (let s = 0; s < STRINGS.length; s++) {
      for (let f = 0; f <= this.maxFrets; f++) {
        const target = this.targetElements[`${s}-${f}`];
        if (!target) continue;
        if (targetMidi !== null && STRINGS[s].baseMidi + f === targetMidi) {
          target.classList.add('target-hint');
          if (!scrollToEl && f > 4) {
            scrollToEl = target;
          }
        } else {
          target.classList.remove('target-hint');
        }
      }
    }

    if (scrollToEl && this.container.parentElement) {
      const card = this.container.parentElement;
      const targetLeft = scrollToEl.offsetLeft;
      // Sanftes Nachführen im sichtbaren Bereich
      if (targetLeft > card.scrollLeft + card.clientWidth - 100 || targetLeft < card.scrollLeft) {
        card.scrollTo({ left: Math.max(0, targetLeft - 180), behavior: 'smooth' });
      }
    }
  }

  clearHints() {
    this.setTargetHint(null);
  }
}
