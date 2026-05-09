const fs = require('fs');
const https = require('https');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
];

const downloadFile = (filename) => {
  return new Promise((resolve, reject) => {
    const dest = path.join(modelsDir, filename);
    if (fs.existsSync(dest)) {
      console.log(`Skipping ${filename}, already exists.`);
      resolve();
      return;
    }
    console.log(`Downloading ${filename}...`);
    const file = fs.createWriteStream(dest);
    https.get(baseUrl + filename, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
};

async function downloadAll() {
  for (const file of files) {
    try {
      await downloadFile(file);
    } catch (e) {
      console.error(`Failed to download ${file}:`, e);
    }
  }
  console.log('All models downloaded successfully!');
}

downloadAll();
