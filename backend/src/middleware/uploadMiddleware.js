const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsRoot = path.join(__dirname, "../../uploads");
const medicalReportUploads = path.join(uploadsRoot, "medical-reports");

fs.mkdirSync(medicalReportUploads, { recursive: true });

const sanitizeFileName = (value) =>
  value
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, medicalReportUploads);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "");
    const baseName = path.basename(file.originalname || "attachment", extension);
    const nextName = `${Date.now()}-${sanitizeFileName(baseName)}${extension}`;
    cb(null, nextName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

module.exports = {
  upload
};
