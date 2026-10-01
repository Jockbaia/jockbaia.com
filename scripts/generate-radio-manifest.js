const fs = require('fs');
const path = require('path');

const RADIO_DIR = path.join(process.cwd(), 'public', 'radio');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'radio-tracks.json');

function formatDate(rawDate) {
  const day = rawDate.slice(4, 6);
  const month = parseInt(rawDate.slice(2, 4), 10);
  const year = `20${rawDate.slice(0, 2)}`;
  const date = new Date(
    `${year}-${String(month).padStart(2, '0')}-${day}T00:00:00`
  );
  const monthName = date.toLocaleDateString('en-GB', { month: 'long' });
  return `${parseInt(day, 10)} ${monthName} ${year}`;
}

function parseTrack(file) {
  const base = path.basename(file, path.extname(file));
  const match = base.match(/^\[(\d{6})\]\s*(.+)$/);
  if (match) {
    return {
      src: `/radio/${encodeURIComponent(file)}`,
      title: match[2].replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim(),
      date: formatDate(match[1]),
    };
  }
  return {
    src: `/radio/${encodeURIComponent(file)}`,
    title: base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim(),
    date: null,
  };
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateRadioManifest() {
  if (!fs.existsSync(RADIO_DIR)) {
    fs.mkdirSync(RADIO_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(RADIO_DIR)
    .filter((file) => file.toLowerCase().endsWith('.mp3'))
    .sort();

  const tracks = shuffle(files.map(parseTrack));

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(tracks, null, 2));
  console.log(`Radio manifest generated with ${tracks.length} track(s).`);
}

generateRadioManifest();
