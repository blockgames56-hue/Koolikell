const fs = require('fs');
const path = require('path');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Compile winvolume.cs as windowless winexe if csc is available
const winVolumeCs = path.join(__dirname, 'winvolume.cs');
const winVolumeExe = path.join(__dirname, '..', 'assets', 'winvolume.exe');
const csc = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
if (fs.existsSync(winVolumeCs) && fs.existsSync(csc)) {
  const { execSync } = require('child_process');
  try {
    execSync(`"${csc}" /nologo /out:"${winVolumeExe}" /target:winexe "${winVolumeCs}"`);
  } catch (e) {
    console.warn('Could not compile winvolume.exe:', e);
  }
}

// Copy assets to dist/assets and dist/renderer/assets
copyDirRecursive(path.join(__dirname, '..', 'assets'), path.join(distDir, 'assets'));
copyDirRecursive(path.join(__dirname, '..', 'assets'), path.join(distDir, 'renderer', 'assets'));

console.log('✅ Assets copied successfully to dist/');

