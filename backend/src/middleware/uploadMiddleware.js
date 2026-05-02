const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsRoot = path.join(__dirname, "../../uploads");
const medicalReportUploads = path.join(uploadsRoot, "medical-reports");
const allowedAttachmentTypes = new Map([
  ["application/pdf", [".pdf"]],
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["application/msword", [".doc"]],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", [".docx"]]
]);

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

const isAllowedMedicalReportFile = (file) => {
  const mimetype = String(file.mimetype || "").toLowerCase();
  const extension = path.extname(file.originalname || "").toLowerCase();
  const allowedExtensions = allowedAttachmentTypes.get(mimetype);

  return Boolean(allowedExtensions?.includes(extension));
};

const fileFilter = (_req, file, cb) => {
  if (isAllowedMedicalReportFile(file)) {
    cb(null, true);
    return;
  }

  const error = new Error("Attachment must be a PDF, DOC, DOCX, JPG, or PNG file");
  error.statusCode = 400;
  cb(error);
};

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
