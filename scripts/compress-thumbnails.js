const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const publicDir = path.join(__dirname, '..', 'public', 'i');
const outputDirSm = path.join(publicDir, 'sm');
const outputDirMd = path.join(publicDir, 'md');
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

function createSymlinks() {
  const postsDir = path.join(contentDir, 'posts');
  if (!fs.existsSync(postsDir)) return;

  for (const entry of fs.readdirSync(postsDir)) {
    const contentPath = path.join(postsDir, entry);
    if (!fs.statSync(contentPath).isDirectory()) continue;

    const linkPath = path.join(publicDir, entry);
    try {
      fs.lstatSync(linkPath);
      continue; // already exists (file, dir, or symlink)
    } catch {
      // path doesn't exist, create symlink
    }

    const relativeTarget = path.relative(publicDir, contentPath);
    fs.symlinkSync(relativeTarget, linkPath);
    console.log(`Symlinked: ${linkPath} -> ${relativeTarget}`);
  }
}

async function compressFile(inputFile, sourceRelPath, sourceMtime) {
  const ext = path.extname(inputFile);
  const webpName = path
    .basename(inputFile)
    .replace(new RegExp(`${ext}$`, 'i'), '.webp');
  const parts = sourceRelPath.split(path.sep);
  const contentType = parts[0]; // 'posts' or 'scuderia'
  const id = parts[1];

  let outputFileSm, outputFileMd;
  if (contentType === 'posts') {
    outputFileSm = path.join(outputDirSm, id, webpName);
    const mdFileName = parts
      .slice(2)
      .join(path.sep)
      .replace(new RegExp(`${ext}$`, 'i'), '.webp');
    outputFileMd = path.join(outputDirMd, id, mdFileName);
  } else {
    outputFileSm = path.join(outputDirSm, 'scuderia', `${id}.webp`);
    outputFileMd = path.join(outputDirMd, 'scuderia', `${id}.webp`);
  }

  ensureDir(path.dirname(outputFileSm));
  ensureDir(path.dirname(outputFileMd));

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
    const relativePath = path.relative(contentDir, entryPath);

    if (stat.isDirectory()) {
      tasks.push(processDirectory(entryPath));
      continue;
    }

    const ext = path.extname(entry).toLowerCase();
    if (!supportedExtensions.has(ext)) {
      continue;
    }

    const sourceMtime = fs.statSync(entryPath).mtimeMs;
    tasks.push(compressFile(entryPath, relativePath, sourceMtime));
  }

  await Promise.all(tasks);
}

async function compressStaticDirectory(srcDir, smDir, mdDir) {
  if (!fs.existsSync(srcDir)) return;

  for (const entry of fs.readdirSync(srcDir)) {
    const entryPath = path.join(srcDir, entry);
    const stat = fs.lstatSync(entryPath);
    if (stat.isDirectory()) continue;

    const ext = path.extname(entry).toLowerCase();
    if (!supportedExtensions.has(ext)) continue;

    const webpName = entry.replace(new RegExp(`${ext}$`, 'i'), '.webp');
    const smOut = path.join(smDir, webpName);
    const mdOut = path.join(mdDir, webpName);
    const sourceMtime = stat.mtimeMs;

    ensureDir(smDir);
    ensureDir(mdDir);

    const smUpToDate = isOutputCurrent(smOut, sourceMtime);
    const mdUpToDate = isOutputCurrent(mdOut, sourceMtime);

    if (smUpToDate && mdUpToDate) {
      console.log(`Skipped (up-to-date): ${entryPath}`);
      continue;
    }

    if (!smUpToDate) {
      await sharp(entryPath)
        .resize({ width: 600 })
        .webp({ quality: 80 })
        .toFile(smOut);
      console.log(`Compressed (600px): ${entryPath} -> ${smOut}`);
    }

    if (!mdUpToDate) {
      await sharp(entryPath)
        .resize({ width: 1000 })
        .webp({ quality: 80 })
        .toFile(mdOut);
      console.log(`Compressed (1000px): ${entryPath} -> ${mdOut}`);
    }
  }
}

(async function run() {
  ensureDir(outputDirSm);
  ensureDir(outputDirMd);

  try {
    createSymlinks();

    const postsDir = path.join(contentDir, 'posts');
    const scuderiaDir = path.join(contentDir, 'scuderia');
    const headerSrc = path.join(__dirname, '..', 'public', 'assets', 'header');
    const headerSm = path.join(
      __dirname,
      '..',
      'public',
      'assets',
      'sm',
      'header'
    );
    const headerMd = path.join(
      __dirname,
      '..',
      'public',
      'assets',
      'md',
      'header'
    );

    if (fs.existsSync(postsDir)) {
      await processDirectory(postsDir);
    }
    if (fs.existsSync(scuderiaDir)) {
      await processDirectory(scuderiaDir);
    }
    await compressStaticDirectory(headerSrc, headerSm, headerMd);
    console.log('Image compression complete.');
  } catch (err) {
    console.error('Compression failed:', err);
    process.exit(1);
  }
})();
