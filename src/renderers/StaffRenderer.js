export class StaffRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.lineSpacing = options.lineSpacing || 13;
    this.staffTop = options.staffTop || 85;
    this.hitLineX = options.hitLineX || 150;
    this.noteSpacingUnit = options.noteSpacingUnit || 80;

    this.initHiDPI();
  }

  initHiDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || 920;
    const h = rect.height || 190;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.width = w;
    this.height = h;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
  }

  getYForStep(step) {
    const bottomLineY = this.staffTop + 4 * this.lineSpacing;
    return bottomLineY - (step * (this.lineSpacing / 2));
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawStaff() {
    this.clear();

    // 5 Notenlinien
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1.6;
    for (let i = 0; i < 5; i++) {
      const y = this.staffTop + i * this.lineSpacing;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Violinschlüssel
    this.ctx.fillStyle = '#1e293b';
    this.ctx.font = '56px "Times New Roman", Georgia, serif';
    this.ctx.fillText('𝄞', 16, this.staffTop + 3.85 * this.lineSpacing);

    // Taktart (4/4)
    this.ctx.font = 'bold 22px "Times New Roman", Georgia, serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('4', 74, this.staffTop + 1.8 * this.lineSpacing);
    this.ctx.fillText('4', 74, this.staffTop + 3.8 * this.lineSpacing);
    this.ctx.textAlign = 'left';

    // Ziellinie (Hit-Line)
    this.ctx.strokeStyle = 'rgba(34, 197, 94, 0.65)';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.hitLineX, 15);
    this.ctx.lineTo(this.hitLineX, this.height - 15);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawBarLine(x) {
    if (x < 85 || x > this.width + 20) return;
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 1.8;
    this.ctx.beginPath();
    this.ctx.moveTo(x, this.staffTop);
    this.ctx.lineTo(x, this.staffTop + 4 * this.lineSpacing);
    this.ctx.stroke();
  }

  /**
   * status: 'normal' | 'target' | 'hit' | 'miss'
   */
  drawNote(x, diatonicStep, duration = 1, status = 'normal', accidental = null) {
    const y = this.getYForStep(diatonicStep);

    // Hilfslinien (Ledger Lines)
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 1.6;
    if (diatonicStep <= -2) {
      for (let s = -2; s >= diatonicStep; s -= 2) {
        const ly = this.getYForStep(s);
        this.ctx.beginPath();
        this.ctx.moveTo(x - 13, ly);
        this.ctx.lineTo(x + 13, ly);
        this.ctx.stroke();
      }
    }
    if (diatonicStep >= 10) {
      for (let s = 10; s <= diatonicStep; s += 2) {
        const ly = this.getYForStep(s);
        this.ctx.beginPath();
        this.ctx.moveTo(x - 13, ly);
        this.ctx.lineTo(x + 13, ly);
        this.ctx.stroke();
      }
    }

    // Farbcodierung
    let noteColor = '#0f172a';
    if (status === 'target') {
      noteColor = '#f59e0b'; // Gold-Gelb für aktuelle Note
    } else if (status === 'hit') {
      noteColor = '#16a34a'; // Grün für erfolgreich getroffene Note
    } else if (status === 'miss') {
      noteColor = '#dc2626'; // Rot für verpasste Note
    }

    // Vorzeichen (z. B. Kreuz #)
    if (accidental) {
      this.ctx.fillStyle = noteColor;
      this.ctx.font = 'bold 20px "Times New Roman", serif';
      this.ctx.fillText(accidental, x - 18, y + 6);
    }

    // Notenkopf (leicht schräg)
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(-0.24);

    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 8.8, 6.2, 0, 0, Math.PI * 2);

    if (duration >= 2) {
      // Ganze oder Halbe Note: Hohler Notenkopf
      this.ctx.strokeStyle = noteColor;
      this.ctx.lineWidth = 2.6;
      this.ctx.stroke();
    } else {
      // Viertel oder Achtel: Ausgefüllter Notenkopf
      this.ctx.fillStyle = noteColor;
      this.ctx.fill();
    }
    this.ctx.restore();

    // Notenhals (bei allen Noten außer Ganzen)
    if (duration < 4) {
      this.ctx.strokeStyle = noteColor;
      this.ctx.lineWidth = 2.0;
      this.ctx.beginPath();
      if (diatonicStep < 4) {
        this.ctx.moveTo(x + 7, y - 2);
        this.ctx.lineTo(x + 7, y - 36);
      } else {
        this.ctx.moveTo(x - 7, y + 2);
        this.ctx.lineTo(x - 7, y + 36);
      }
      this.ctx.stroke();

      // Fähnchen für Achtelnoten (duration = 0.5)
      if (duration <= 0.5) {
        this.ctx.beginPath();
        if (diatonicStep < 4) {
          this.ctx.moveTo(x + 7, y - 36);
          this.ctx.bezierCurveTo(x + 18, y - 30, x + 18, y - 20, x + 8, y - 16);
        } else {
          this.ctx.moveTo(x - 7, y + 36);
          this.ctx.bezierCurveTo(x + 4, y + 30, x + 4, y + 20, x - 6, y + 16);
        }
        this.ctx.stroke();
      }
    }
  }
}
