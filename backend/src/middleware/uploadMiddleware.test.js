const assert = require("node:assert/strict");
const test = require("node:test");

const { isAllowedMedicalReportFile } = require("./uploadMiddleware");

test("medical report upload accepts supported document and image files", () => {
  assert.equal(isAllowedMedicalReportFile({ originalname: "report.pdf", mimetype: "application/pdf" }), true);
  assert.equal(isAllowedMedicalReportFile({ originalname: "report.docx", mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), true);
  assert.equal(isAllowedMedicalReportFile({ originalname: "scan.jpg", mimetype: "image/jpeg" }), true);
  assert.equal(isAllowedMedicalReportFile({ originalname: "scan.png", mimetype: "image/png" }), true);
});

test("medical report upload rejects unsupported files", () => {
  assert.equal(isAllowedMedicalReportFile({ originalname: "script.js", mimetype: "application/javascript" }), false);
  assert.equal(isAllowedMedicalReportFile({ originalname: "fake.pdf", mimetype: "image/png" }), false);
});
