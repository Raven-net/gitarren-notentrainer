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
    allNotes.sort((a, b) => a.startTick - b.startTick);

    // In Viertelnoten-Dauern quantisieren
    const quantizedNotes = allNotes.map(n => {
      const quarterUnits = n.durationTicks / ticksPerQuarter;
      let dur = 1;
      if (quarterUnits >= 3.2) dur = 4;
      else if (quarterUnits >= 1.6) dur = 2;
      else if (quarterUnits >= 0.75) dur = 1;
      else dur = 0.5;

      return {
        midi: n.midi,
        duration: dur
      };
    });

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
      notes: quantizedNotes.slice(0, 120) // Auf 120 Noten begrenzen
    };
  }
}
