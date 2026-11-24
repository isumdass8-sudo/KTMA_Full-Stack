/**
 * Compresses an image File or Blob to a Base64 data URL.
 * Resizes large dimensions to keep storage efficient while preserving crisp visual quality.
 */
export async function fileToBase64(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = {}) {
  if (!file) return null;

  // If it's not an image type we can process on canvas (e.g. svg or gif), read as raw data URL
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if decoding fails
        resolve(reader.result);
      };
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fallback to jpeg
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          if (dataUrl.startsWith('data:image/webp')) {
            resolve(dataUrl);
            return;
          }
        } catch {
          // Ignore and fallback to jpeg
        }

        const fallbackUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(fallbackUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

