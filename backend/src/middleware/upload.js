const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter - only allow PDF and DOCX
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const allowedExts = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.originalname}. Only PDF and DOCX files are allowed.`), false);
  }
};

// Multer upload config
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 10 // Max 10 files at once
  }
});

module.exports = { upload };
