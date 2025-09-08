const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Storage específico para exámenes (incluye PDF además de imágenes)
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';
    const original = file.originalname || 'archivo';
    const baseName = original.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const publicId = `${Date.now()}_${baseName}`;
    return {
      folder: 'examenes',
      resource_type: isPdf ? 'raw' : 'image',
      type: 'private', // activa modo privado (requiere URL firmada)
      format: isPdf ? 'pdf' : undefined,
      public_id: publicId,
      use_filename: false,
      unique_filename: false,
      overwrite: false,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf'
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Formato no permitido (solo jpg, png, jpeg, pdf)'));
  }
  cb(null, true);
};

const uploadExamenes = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB por archivo
});

// Debug: solo activar temporalmente si se necesita
// uploadExamenes._cloudinaryDebug = true;

module.exports = uploadExamenes;
