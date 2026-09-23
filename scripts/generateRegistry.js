const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const songsDir = path.join(projectRoot, 'songs');
const registryFile = path.join(songsDir, 'songRegistry.js');

console.log('--- Generiere songRegistry.js aus songs/*.json ---');

if (!fs.existsSync(songsDir)) {
  console.error(`Fehler: Ordner ${songsDir} existiert nicht!`);
  process.exit(1);
}

const files = fs.readdirSync(songsDir)
  .filter(f => f.endsWith('.json'))
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

console.log(`Gefundene JSON-Lieddateien: ${files.length}`);

const categoryPriority = [
  'Hochweber',
  'Rock',
  'Klassik',
  'Traditionals',
  'Übungsstücke'
];

function getCategoryRank(cat) {
  const idx = categoryPriority.indexOf(cat);
  return idx === -1 ? 999 : idx;
}

const songs = [];

for (const file of files) {
  const filePath = path.join(songsDir, file);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);

    const baseName = path.basename(file, '.json');
    let id = data.id;
    if (!id || id.startsWith('song_')) {
      id = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    }

    const song = {
      id: id,
      title: data.title || baseName,
      artist: data.artist || 'Unbekannt',
      category: data.category || 'Eigene Lieder',
      bpm: Number(data.bpm) || 100,
      timeSignature: Array.isArray(data.timeSignature) && data.timeSignature.length === 2
        ? data.timeSignature
        : [4, 4],
      description: data.description || '',
      notes: Array.isArray(data.notes) ? data.notes : []
    };

    songs.push(song);
  } catch (err) {
    console.error(`Fehler beim Einlesen von ${file}:`, err.message);
  }
}

// Sortierung: Zuerst nach bevorzugter Kategorie-Reihenfolge, dann Kategorie alphabetisch, dann Titel
songs.sort((a, b) => {
  const rankA = getCategoryRank(a.category);
  const rankB = getCategoryRank(b.category);
  if (rankA !== rankB) return rankA - rankB;
  const catCompare = a.category.localeCompare(b.category, 'de');
  if (catCompare !== 0) return catCompare;
  return a.title.localeCompare(b.title, 'de');
});

// Formatierung der Song-Objekte
function formatNote(n) {
  const parts = [];
  if (n.midi !== undefined && n.midi !== null) parts.push(`midi: ${n.midi}`);
  if (n.beat !== undefined && n.beat !== null) parts.push(`beat: ${n.beat}`);
  if (n.duration !== undefined && n.duration !== null) parts.push(`duration: ${n.duration}`);
  if (n.string !== undefined && n.string !== null) parts.push(`string: ${n.string}`);
  if (n.fret !== undefined && n.fret !== null) parts.push(`fret: ${n.fret}`);
  return `      { ${parts.join(', ')} }`;
}

function formatSong(song) {
  const noteLines = song.notes.map(formatNote).join(',\n');
  return `  {
    id: ${JSON.stringify(song.id)},
    title: ${JSON.stringify(song.title)},
    artist: ${JSON.stringify(song.artist)},
    category: ${JSON.stringify(song.category)},
    bpm: ${song.bpm},
    timeSignature: [${song.timeSignature.join(', ')}],
    description: ${JSON.stringify(song.description)},
    notes: [
${noteLines}
    ]
  }`;
}

const content = `/**
 * Song-Katalog mit allen vorinstallierten Liedern.
 * Automatisch generiert aus den JSON-Dateien im Ordner songs/.
 *
 * HINWEIS: Wird bei jedem Push einer neuen .json-Datei durch die
 * GitHub Action (.github/workflows/update-registry.yml) aktualisiert.
 */

export const BUILTIN_SONGS = [
${songs.map(formatSong).join(',\n')}
];

export function getBuiltinSong(id) {
  return BUILTIN_SONGS.find(s => s.id === id) || BUILTIN_SONGS[0];
}
`;

fs.writeFileSync(registryFile, content, 'utf8');

console.log(`Erfolgreich ${songs.length} Lieder in ${path.relative(projectRoot, registryFile)} geschrieben:`);
songs.forEach((s, idx) => {
  console.log(`  ${(idx + 1).toString().padStart(2, ' ')}. [${s.category}] ${s.title} (${s.artist}) -> id: ${s.id}`);
});
