const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const env = require('../config/env');

const sanitizeFileName = (value) => value.replace(/[^a-zA-Z0-9._-]/g, '_');

const uploadToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `house-rent/${folder}`,
        resource_type: resourceType,
        public_id: `${Date.now()}-${sanitizeFileName(file.originalname)}`,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          size: result.bytes,
          mimeType: file.mimetype,
        });
      },
    );

    stream.end(file.buffer);
  });

const uploadToLocal = async (file, folder) => {
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.originalname)}`;
  const relativePath = path.join('public', 'uploads', folder, fileName);
  const fullPath = path.join(process.cwd(), relativePath);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, file.buffer);

  return {
    url: `${env.appBaseUrl}/${relativePath.replace(/\\/g, '/')}`,
    publicId: relativePath.replace(/\\/g, '/'),
    resourceType: file.mimetype.startsWith('image/') ? 'image' : 'raw',
    size: file.size,
    mimeType: file.mimetype,
  };
};

const uploadFile = async (file, folder) => {
  if (env.storageDriver === 'cloudinary' || (env.storageDriver === 'auto' && isCloudinaryConfigured)) {
    return uploadToCloudinary(file, folder);
  }

  return uploadToLocal(file, folder);
};

module.exports = {
  uploadFile,
};
