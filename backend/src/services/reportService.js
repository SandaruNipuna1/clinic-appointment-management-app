const buildPrescriptionSummary = (medicines = []) => {
  if (!medicines.length) {
    return "No medicines added";
  }

  return medicines
    .map((medicine, index) => {
      return `${index + 1}. ${medicine.medicineName} - ${medicine.dosage}, ${medicine.frequency}, ${medicine.duration}${
        medicine.instructions ? `, ${medicine.instructions}` : ""
      }`;
    })
    .join("\n");
};

module.exports = {
  buildPrescriptionSummary
};
