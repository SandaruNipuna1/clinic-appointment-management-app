// This middleware handles file uploads for medical reports.
// It uses multer to manage file storage and validation for different file types.

const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Define upload directories
const uploadsRoot = path.join(__dirname, "../../uploads");
const medicalReportUploads = path.join(uploadsRoot, "medical-reports");

// Define allowed file types for medical report attachments
const allowedAttachmentTypes = new Map([
  ["application/pdf", [".pdf"]],
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["application/msword", [".doc"]],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", [".docx"]]
]);

// Create upload directories if they don't exist
fs.mkdirSync(medicalReportUploads, { recursive: true });

// Function to clean up filenames by removing special characters
const sanitizeFileName = (value) =>
  value
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

// Configure multer storage settings
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

// Function to check if a file type is allowed for medical reports
const isAllowedMedicalReportFile = (file) => {
  const mimetype = String(file.mimetype || "").toLowerCase();
  const extension = path.extname(file.originalname || "").toLowerCase();
  const allowedExtensions = allowedAttachmentTypes.get(mimetype);

  return Boolean(allowedExtensions?.includes(extension));
};

// Multer file filter to reject unsupported file types
const fileFilter = (_req, file, cb) => {
  if (isAllowedMedicalReportFile(file)) {
    cb(null, true);
    return;
  }

  const error = new Error("Attachment must be a PDF, DOC, DOCX, JPG, or PNG file");
  error.statusCode = 400;
  cb(error);
};

// Configure multer with storage, file filter, and size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

module.exports = {
  upload,
  isAllowedMedicalReportFile
};
