const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/i');
const outputDirSm = path.join(__dirname, '../public/i/sm');
const outputDirMd = path.join(__dirname, '../public/i/md');

// Ensure the output directories exist
if (!fs.existsSync(outputDirSm)) {
  fs.mkdirSync(outputDirSm, { recursive: true });
}
if (!fs.existsSync(outputDirMd)) {
  fs.mkdirSync(outputDirMd, { recursive: true });
}

fs.readdirSync(inputDir).forEach((folder) => {
  const folderPath = path.join(inputDir, folder);
  const outputFolderPathSm = path.join(outputDirSm, folder);
  const outputFolderPathMd = path.join(outputDirMd, folder);

  if (fs.lstatSync(folderPath).isDirectory()) {
    if (!fs.existsSync(outputFolderPathSm)) {
      fs.mkdirSync(outputFolderPathSm, { recursive: true });
    }
    if (!fs.existsSync(outputFolderPathMd)) {
      fs.mkdirSync(outputFolderPathMd, { recursive: true });
    }

    fs.readdirSync(folderPath).forEach((file) => {
      const inputFile = path.join(folderPath, file);
      const outputFileSm = path.join(outputFolderPathSm, file);
      const outputFileMd = path.join(outputFolderPathMd, file);

      if (path.extname(file).match(/\.(jpg|jpeg|png)$/i)) {
        // Create 600px version (i/sm)
        sharp(inputFile)
          .resize({ width: 600 })
          .webp({ quality: 80 })
          .toFile(outputFileSm.replace(path.extname(file), '.webp'))
          .then(() =>
            console.log(`Compressed (600px): ${inputFile} -> ${outputFileSm}`)
          )
          .catch((err) =>
            console.error(`Error compressing ${inputFile} (600px):`, err)
          );

        // Create 1000px version (i/md)
        sharp(inputFile)
          .resize({ width: 1000 })
          .webp({ quality: 80 })
          .toFile(outputFileMd.replace(path.extname(file), '.webp'))
          .then(() =>
            console.log(`Compressed (1000px): ${inputFile} -> ${outputFileMd}`)
          )
          .catch((err) =>
            console.error(`Error compressing ${inputFile} (1000px):`, err)
          );
      }
    });
  }
});
