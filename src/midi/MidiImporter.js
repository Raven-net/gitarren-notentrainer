/**
 * Schlanker MIDI-File-Parser (.mid) zur Konvertierung in das Gitarren-Songformat
 */

export class MidiImporter {
  static async parseMidiFile(file) {
    const buffer = await file.arrayBuffer();
    const data = new DataView(buffer);
    let offset = 0;

    // Header Chunk prüfen: "MThd"
    const headerTag = String.fromCharCode(
      data.getUint8(offset++),
      data.getUint8(offset++),
      data.getUint8(offset++),
      data.getUint8(offset++)
    );

    if (headerTag !== 'MThd') {
      throw new Error("Ungültiges MIDI-Dateiformat: MThd-Header fehlt.");
    }

    const headerLength = data.getUint32(offset);
    offset += 4;
    const formatType = data.getUint16(offset);
    offset += 2;
    const trackCount = data.getUint16(offset);
    offset += 2;
    const timeDivision = data.getUint16(offset);
    offset += 2;

    const ticksPerQuarter = (timeDivision & 0x8000) === 0 ? timeDivision : 480;

    // Durch Tracks navigieren
    let allNotes = [];
    let detectedBpm = 120;

    for (let t = 0; t < trackCount; t++) {
      if (offset >= data.byteLength) break;

      const trackTag = String.fromCharCode(
        data.getUint8(offset++),
        data.getUint8(offset++),
        data.getUint8(offset++),
        data.getUint8(offset++)
      );

      const trackLength = data.getUint32(offset);
      offset += 4;

      if (trackTag !== 'MTrk') {
        offset += trackLength;
        continue;
      }

      const trackEnd = offset + trackLength;
      let currentTick = 0;
      let lastStatus = 0;
      let activeNotes = {}; // midi -> startTick

      while (offset < trackEnd) {
        // Delta Time (Variable Length Quantity)
        let delta = 0;
        let b = 0;
        do {
          b = data.getUint8(offset++);
          delta = (delta << 7) | (b & 0x7f);
        } while (b & 0x80);

        currentTick += delta;

        let status = data.getUint8(offset);
        if (status & 0x80) {
          offset++;
          lastStatus = status;
        } else {
          status = lastStatus; // Running status
        }

        const eventType = status >> 4;
        const channel = status & 0x0f;

        if (eventType === 0x09) {
          // Note On
          const noteMidi = data.getUint8(offset++);
          const velocity = data.getUint8(offset++);
          if (velocity > 0) {
            activeNotes[noteMidi] = currentTick;
          } else if (activeNotes[noteMidi] !== undefined) {
            // Velocity 0 ist Note Off
            const start = activeNotes[noteMidi];
            const durTicks = currentTick - start;
            delete activeNotes[noteMidi];
            allNotes.push({
              midi: noteMidi,
              startTick: start,
              durationTicks: durTicks
            });
          }
        } else if (eventType === 0x08) {
          // Note Off
          const noteMidi = data.getUint8(offset++);
          offset++; // velocity ignorieren
          if (activeNotes[noteMidi] !== undefined) {
            const start = activeNotes[noteMidi];
            const durTicks = currentTick - start;
            delete activeNotes[noteMidi];
            allNotes.push({
              midi: noteMidi,
              startTick: start,
              durationTicks: durTicks
            });
          }
        } else if (eventType === 0x0a || eventType === 0x0b || eventType === 0x0e) {
          offset += 2;
        } else if (eventType === 0x0c || eventType === 0x0d) {
          offset += 1;
        } else if (status === 0xff) {
          // Meta Event
          const metaType = data.getUint8(offset++);
          let len = 0;
          do {
            b = data.getUint8(offset++);
            len = (len << 7) | (b & 0x7f);
          } while (b & 0x80);

          if (metaType === 0x51 && len === 3) {
            // Set Tempo (Microseconds per Quarter Note)
            const mpqn = (data.getUint8(offset) << 16) | (data.getUint8(offset + 1) << 8) | data.getUint8(offset + 2);
            detectedBpm = Math.round(60000000 / mpqn);
          }
          offset += len;
        }
      }
    }

    // Nach Start-Tick sortieren
    allNotes.sort((a, b) => a.startTick - b.startTick || a.midi - b.midi);

    // Intelligente Quantisierung auf musikalische Zählzeiten (Viertel, Achtel, 16tel, Triolen, Swing)
    function quantizeBeat(rawBeat) {
      const intBeat = Math.floor(rawBeat);
      const frac = rawBeat - intBeat;
      const subdivisions = [0.0, 0.25, 1 / 3, 0.5, 0.625, 2 / 3, 0.75, 1.0];

      let closest = subdivisions[0];
      let minDiff = Infinity;
      for (const s of subdivisions) {
        const diff = Math.abs(frac - s);
        if (diff < minDiff) {
          minDiff = diff;
          closest = s;
        }
      }

      if (minDiff < 0.13) {
        return Math.round((intBeat + closest) * 1000) / 1000;
      }
      return Math.round(rawBeat * 100) / 100;
    }

    function quantizeDuration(rawDur) {
      if (rawDur >= 3.2) return 4;
      if (rawDur >= 1.6) return 2;
      if (rawDur >= 0.75) return 1;
      return 0.5;
    }

    // Noten aufbereiten und Duplikate auf gleicher Zählzeit filtern
    const noteMap = new Map(); // key -> { midi, beat, duration }

    for (const n of allNotes) {
      const rawBeat = n.startTick / ticksPerQuarter;
      const rawDur = n.durationTicks / ticksPerQuarter;
      const beat = quantizeBeat(rawBeat);
      const dur = quantizeDuration(rawDur);

      const key = `${beat}_${n.midi}`;
      if (noteMap.has(key)) {
        // Bei Mehrfach-Events auf gleichem Beat die längere Dauer behalten
        const existing = noteMap.get(key);
        if (dur > existing.duration) {
          existing.duration = dur;
        }
      } else {
        noteMap.set(key, {
          midi: n.midi,
          beat: beat,
          duration: dur
        });
      }
    }

    const quantizedNotes = Array.from(noteMap.values());
    quantizedNotes.sort((a, b) => a.beat - b.beat || a.midi - b.midi);

    // Titel aus Dateiname ableiten
    const rawTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

    return {
      id: "midi_" + Date.now(),
      title: title,
      artist: "MIDI Import",
      bpm: detectedBpm || 120,
      timeSignature: [4, 4],
      description: "Importiert aus Datei " + file.name,
      notes: quantizedNotes.slice(0, 250) // Ausreichend für vollständige Stücke
    };
  }
}
