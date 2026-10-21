const fs = require('fs');
const path = require('path');

function createWavHeader(dataLength, sampleRate = 44100, numChannels = 1, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

const sampleRate = 44100;

// 1. Classic School Bell (Electric ringer sound, 7 seconds)
function generateClassicBell() {
  const duration = 6.0;
  const numSamples = Math.floor(sampleRate * duration);
  const data = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Ringer hammer speed (~18 Hz modulation)
    const hammer = Math.sin(2 * Math.PI * 18 * t) > 0 ? 1 : 0.2;
    // Metallic bell harmonics
    const f1 = Math.sin(2 * Math.PI * 1180 * t);
    const f2 = Math.sin(2 * Math.PI * 1230 * t) * 0.8;
    const f3 = Math.sin(2 * Math.PI * 2360 * t) * 0.4;
    const f4 = Math.sin(2 * Math.PI * 3540 * t) * 0.2;

    // Decay at the end
    let env = 1.0;
    if (t > 4.5) {
      env = Math.max(0, 1 - (t - 4.5) / 1.5);
    }

    const sample = (f1 + f2 + f3 + f4) * 0.25 * hammer * env;
    const val = Math.floor(Math.max(-1, Math.min(1, sample)) * 32767);
    data.writeInt16LE(val, i * 2);
  }

  const header = createWavHeader(data.length, sampleRate);
  fs.writeFileSync(path.join(soundsDir, 'classic_bell.wav'), Buffer.concat([header, data]));
}

// 2. Melodic School Chime (Westminster 4-notes: E5, C5, D5, G4, ~5 seconds)
function generateMelodicChime() {
  const notes = [
    { freq: 659.25, start: 0.0, dur: 1.1 }, // E5
    { freq: 523.25, start: 1.1, dur: 1.1 }, // C5
    { freq: 587.33, start: 2.2, dur: 1.1 }, // D5
    { freq: 392.00, start: 3.3, dur: 1.8 }  // G4
  ];

  const totalDuration = 5.2;
  const numSamples = Math.floor(sampleRate * totalDuration);
  const data = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const note of notes) {
      if (t >= note.start && t < note.start + note.dur) {
        const localT = t - note.start;
        // Exponential bell strike decay
        const env = Math.exp(-3.2 * localT);
        // Rich tubular bell chime harmonics
        const s1 = Math.sin(2 * Math.PI * note.freq * localT);
        const s2 = Math.sin(2 * Math.PI * note.freq * 2.76 * localT) * 0.35;
        const s3 = Math.sin(2 * Math.PI * note.freq * 5.4 * localT) * 0.15;
        sample += (s1 + s2 + s3) * env * 0.7;
      }
    }

    const val = Math.floor(Math.max(-1, Math.min(1, sample)) * 32767);
    data.writeInt16LE(val, i * 2);
  }

  const header = createWavHeader(data.length, sampleRate);
  fs.writeFileSync(path.join(soundsDir, 'melodic_chime.wav'), Buffer.concat([header, data]));
}

// 3. Gentle Gong (Deep warm resonant school chime, ~5 seconds)
function generateGentleGong() {
  const duration = 5.0;
  const numSamples = Math.floor(sampleRate * duration);
  const data = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-1.5 * t);
    const f1 = Math.sin(2 * Math.PI * 440 * t);
    const f2 = Math.sin(2 * Math.PI * 880 * t) * 0.4;
    const f3 = Math.sin(2 * Math.PI * 1320 * t) * 0.2;
    const f4 = Math.sin(2 * Math.PI * 220 * t) * 0.5;

    const sample = (f1 + f2 + f3 + f4) * 0.45 * env;
    const val = Math.floor(Math.max(-1, Math.min(1, sample)) * 32767);
    data.writeInt16LE(val, i * 2);
  }

  const header = createWavHeader(data.length, sampleRate);
  fs.writeFileSync(path.join(soundsDir, 'gentle_gong.wav'), Buffer.concat([header, data]));
}

// 4. Upbeat Marimba (Cheerful modern bell, ~4.5 seconds)
function generateUpbeatMelody() {
  const notes = [
    { freq: 523.25, start: 0.0, dur: 0.5 }, // C5
    { freq: 659.25, start: 0.5, dur: 0.5 }, // E5
    { freq: 783.99, start: 1.0, dur: 0.5 }, // G5
    { freq: 1046.50, start: 1.5, dur: 1.8 } // C6
  ];

  const totalDuration = 3.6;
  const numSamples = Math.floor(sampleRate * totalDuration);
  const data = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const note of notes) {
      if (t >= note.start && t < note.start + note.dur) {
        const localT = t - note.start;
        const env = Math.exp(-4.5 * localT);
        const s1 = Math.sin(2 * Math.PI * note.freq * localT);
        const s2 = Math.sin(2 * Math.PI * note.freq * 2 * localT) * 0.25;
        sample += (s1 + s2) * env * 0.7;
      }
    }

    const val = Math.floor(Math.max(-1, Math.min(1, sample)) * 32767);
    data.writeInt16LE(val, i * 2);
  }

  const header = createWavHeader(data.length, sampleRate);
  fs.writeFileSync(path.join(soundsDir, 'upbeat_marimba.wav'), Buffer.concat([header, data]));
}

generateClassicBell();
generateMelodicChime();
generateGentleGong();
generateUpbeatMelody();
console.log('✅ Generated 4 built-in school ringtones in assets/sounds/');
