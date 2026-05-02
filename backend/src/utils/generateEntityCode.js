const generateEntityCode = async (Model, fieldName, prefix) => {
  const latestRecord = await Model.findOne({
    [fieldName]: new RegExp(`^${prefix}-\\d+$`)
  })
    .sort({ [fieldName]: -1 })
    .select(fieldName)
    .lean();

  const latestCode = latestRecord?.[fieldName] || `${prefix}-0000`;
  const latestNumber = Number(String(latestCode).replace(`${prefix}-`, ""));
  const nextNumber = Number.isNaN(latestNumber) ? 1 : latestNumber + 1;

  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
};

module.exports = generateEntityCode;
