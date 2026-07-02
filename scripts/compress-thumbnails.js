const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/i');
const outputDirSm = path.join(inputDir, 'sm');
const outputDirMd = path.join(inputDir, 'md');
const ignoreDirs = new Set(['sm', 'md']);
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png']);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function isOutputCurrent(outputFile, sourceMtime) {
  return (
    fs.existsSync(outputFile) && fs.statSync(outputFile).mtimeMs >= sourceMtime
  );
}

async function compressFile(inputFile, relativePath) {
  const ext = path.extname(inputFile);
  const outputRelative = relativePath.replace(
    new RegExp(`${ext}$`, 'i'),
    '.webp'
  );
  const outputFileSm = path.join(outputDirSm, outputRelative);
  const outputFileMd = path.join(outputDirMd, outputRelative);

  ensureDir(path.dirname(outputFileSm));
  ensureDir(path.dirname(outputFileMd));

  const sourceMtime = fs.statSync(inputFile).mtimeMs;

  // Skip thumbnails regen if they are up-to-date
  const smUpToDate = isOutputCurrent(outputFileSm, sourceMtime);
  const mdUpToDate = isOutputCurrent(outputFileMd, sourceMtime);

  if (smUpToDate && mdUpToDate) {
    console.log(`Skipped (up-to-date): ${inputFile}`);
    return;
  }

  if (!smUpToDate) {
    await sharp(inputFile)
      .resize({ width: 600 })
      .webp({ quality: 80 })
      .toFile(outputFileSm);
    console.log(`Compressed (600px): ${inputFile} -> ${outputFileSm}`);
  }

  if (!mdUpToDate) {
    await sharp(inputFile)
      .resize({ width: 1000 })
      .webp({ quality: 80 })
      .toFile(outputFileMd);
    console.log(`Compressed (1000px): ${inputFile} -> ${outputFileMd}`);
  }
}

async function processDirectory(dir) {
  const entries = fs.readdirSync(dir);
  const tasks = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry);
    const stat = fs.lstatSync(entryPath);
    const relativePath = path.relative(inputDir, entryPath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.has(entry)) {
        tasks.push(processDirectory(entryPath));
      }
      continue;
    }

    const ext = path.extname(entry).toLowerCase();
    if (!supportedExtensions.has(ext)) {
      continue;
    }

    tasks.push(compressFile(entryPath, relativePath));
  }

  await Promise.all(tasks);
}

(async function run() {
  ensureDir(outputDirSm);
  ensureDir(outputDirMd);

  try {
    await processDirectory(inputDir);
    console.log('Image compression complete.');
  } catch (err) {
    console.error('Compression failed:', err);
    process.exit(1);
  }
})();
