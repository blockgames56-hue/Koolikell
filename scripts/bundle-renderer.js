const fs = require('fs');
const path = require('path');

const tsDir = path.join(__dirname, '..', 'dist', 'renderer', 'ts');
const outputFile = path.join(__dirname, '..', 'dist', 'renderer', 'bundle.js');

const files = [
  'player.js',
  'clock.js',
  'library.js',
  'bells.js',
  'settings.js',
  'app.js'
];

let bundleContent = `
(function() {
  const modules = {};

  function defineModule(id, factory) {
    const mod = { exports: {} };
    modules[id] = mod;
    factory(mod.exports, requireModule);
  }

  function requireModule(id) {
    // Normalize relative path
    const norm = id.replace(/^\\.\\//, '').replace(/\\.js$/, '');
    if (modules[norm]) {
      return modules[norm].exports;
    }
    // Also check with .js
    if (modules[norm + '.js']) {
      return modules[norm + '.js'].exports;
    }
    console.warn('Module requested but not found:', id);
    return {};
  }
`;

for (const file of files) {
  const filePath = path.join(tsDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found for bundling: ${filePath}`);
    continue;
  }

  const rawCode = fs.readFileSync(filePath, 'utf-8');
  const modId = file.replace(/\.js$/, '');

  bundleContent += `
  // Module: ${modId}
  defineModule('${modId}', function(exports, require) {
${rawCode}
  });
`;
}

bundleContent += `
  // Execute entry point
  requireModule('app');
})();
`;

fs.writeFileSync(outputFile, bundleContent, 'utf-8');
console.log('✅ Successfully bundled renderer scripts into dist/renderer/bundle.js');
