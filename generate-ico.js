const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'src-tauri/icons');
const inputPng = path.join(iconsDir, 'icon.png');
const outputIco = path.join(iconsDir, 'icon.ico');

pngToIco(inputPng)
  .then(buf => {
    fs.writeFileSync(outputIco, buf);
    console.log('icon.ico generated successfully');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
