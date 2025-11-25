const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/i');
const outputDir = path.join(__dirname, '../public/t');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach((folder) => {
  const folderPath = path.join(inputDir, folder);
  const outputFolderPath = path.join(outputDir, folder);

  if (fs.lstatSync(folderPath).isDirectory()) {
    if (!fs.existsSync(outputFolderPath)) {
      fs.mkdirSync(outputFolderPath, { recursive: true });
    }

    fs.readdirSync(folderPath).forEach((file) => {
      const inputFile = path.join(folderPath, file);
      const outputFile = path.join(outputFolderPath, file);

      if (path.extname(file).match(/\.(jpg|jpeg|png)$/i)) {
        sharp(inputFile)
          .resize(600)
          .toFormat('webp')
          .toFile(outputFile.replace(path.extname(file), '.webp'))
          .then(() => console.log(`Compressed: ${inputFile} -> ${outputFile}`))
          .catch((err) =>
            console.error(`Error compressing ${inputFile}:`, err)
          );
      }
    });
  }
});
