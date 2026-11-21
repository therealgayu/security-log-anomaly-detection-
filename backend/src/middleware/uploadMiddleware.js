const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

// Store files in memory buffer for immediate streaming & processing
const storage = multer.memoryStorage();

const allowedExtensions = ['.csv', '.log', '.txt'];
const allowedMimeTypes = [
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/csv',
  'application/x-csv',
  'text/x-csv',
  'text/comma-separated-values',
  'text/x-comma-separated-values'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = allowedExtensions.includes(ext);
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream';

  if (isAllowedExt || isAllowedMime) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file format: '${file.originalname}'. Only CSV (.csv) and Plain-Text (.log, .txt) files are supported.`,
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB max file size
  },
  fileFilter
});

module.exports = upload;
