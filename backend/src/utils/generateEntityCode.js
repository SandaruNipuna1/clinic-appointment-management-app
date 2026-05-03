// This utility function generates unique codes for entities like doctors, patients, etc.
// It creates codes in the format PREFIX-XXXX (e.g., DOC-0001, PAT-0002).
// Each time it's called, it finds the highest existing number and increments it.

const generateEntityCode = async (Model, fieldName, prefix) => {
  // Find the record with the highest numbered code for this prefix
  const latestRecord = await Model.findOne({
    [fieldName]: new RegExp(`^${prefix}-\\d+$`)
  })
    .sort({ [fieldName]: -1 })
    .select(fieldName)
    .lean();

  // Get the latest code or use a default starting point
  const latestCode = latestRecord?.[fieldName] || `${prefix}-0000`;
  // Extract the number part and increment it
  const latestNumber = Number(String(latestCode).replace(`${prefix}-`, ""));
  const nextNumber = Number.isNaN(latestNumber) ? 1 : latestNumber + 1;

  // Return the new code with zero padding
  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
};

module.exports = generateEntityCode;
