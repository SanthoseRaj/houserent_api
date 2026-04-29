const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

const supportedMimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jpe': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.avif': 'image/avif',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

const allowedMimeTypes = new Set(Object.values(supportedMimeTypes));
const mimeAliases = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
};

const resolveMimeType = (file) => {
  const reportedMimeType = String(file.mimetype || '').toLowerCase();
  if (mimeAliases[reportedMimeType]) {
    return mimeAliases[reportedMimeType];
  }

  if (allowedMimeTypes.has(reportedMimeType)) {
    return reportedMimeType;
  }

  if (reportedMimeType.startsWith('image/')) {
    return reportedMimeType;
  }

  const extension = path.extname(file.originalname || '').toLowerCase();
  return supportedMimeTypes[extension] || null;
};

const uploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const resolvedMimeType = resolveMimeType(file);
    if (!resolvedMimeType) {
      return cb(
        new ApiError(
          400,
          `Unsupported file type: ${file.mimetype || file.originalname}`,
        ),
      );
    }

    file.mimetype = resolvedMimeType;
    return cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = uploader;
