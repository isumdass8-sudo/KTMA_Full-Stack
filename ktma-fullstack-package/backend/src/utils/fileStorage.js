const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Saves a base64 image data URL to the uploads directory.
 * If the string is already a URL or relative path, returns it unchanged.
 */
function saveBase64Image(dataString) {
  if (!dataString || typeof dataString !== 'string') {
    return '';
  }

  // If it's already a saved path or external URL, return as-is
  if (
    !dataString.startsWith('data:image/') ||
    !dataString.includes(';base64,')
  ) {
    return dataString;
  }

  try {
    const matches = dataString.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return dataString;
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `img_${Date.now()}_${Math.floor(Math.random() * 100000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error saving base64 image:', err);
    return dataString;
  }
}

/**
 * Deletes a file from the uploads directory if it exists.
 */
function deleteUploadFile(relativeUrl) {
  if (!relativeUrl || typeof relativeUrl !== 'string') return;
  if (!relativeUrl.startsWith('/uploads/')) return;

  try {
    const filename = path.basename(relativeUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('Failed to delete file:', relativeUrl, err.message);
  }
}

module.exports = {
  UPLOADS_DIR,
  saveBase64Image,
  deleteUploadFile,
};
