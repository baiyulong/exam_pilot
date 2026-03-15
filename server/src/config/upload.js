const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const dir = path.join(uploadDir, 'docs', String(now.getFullYear()), String(now.getMonth() + 1));
    const fs = require('fs');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${uuidv4().slice(0, 8)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件格式，仅支持PDF、DOCX、TXT'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize },
});

module.exports = { upload, uploadDir, maxFileSize };
