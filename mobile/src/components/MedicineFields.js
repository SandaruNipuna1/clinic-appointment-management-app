import React from "react";
import { Text, View } from "react-native";

import FormInput from "./FormInput";
import PrimaryButton from "./PrimaryButton";

export default function MedicineFields({
  item,
  index,
  errors,
  onChange,
  onRemove,
  canRemove
}) {
  const getError = (field) => errors[`medicine_${index}_${field}`];

  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10 }}>Medicine {index + 1}</Text>
      <FormInput
        label="Medicine Name"
        value={item.medicineName}
        onChangeText={(value) => onChange(index, "medicineName", value)}
        error={getError("medicineName")}
      />
      <FormInput
        label="Dosage"
        value={item.dosage}
        onChangeText={(value) => onChange(index, "dosage", value)}
        error={getError("dosage")}
      />
      <FormInput
        label="Frequency"
        value={item.frequency}
        onChangeText={(value) => onChange(index, "frequency", value)}
        error={getError("frequency")}
      />
      <FormInput
        label="Duration"
        value={item.duration}
        onChangeText={(value) => onChange(index, "duration", value)}
        error={getError("duration")}
      />
      <FormInput
        label="Instructions"
        value={item.instructions}
        onChangeText={(value) => onChange(index, "instructions", value)}
        multiline
      />
      {canRemove ? <PrimaryButton title="Remove Medicine" onPress={() => onRemove(index)} variant="secondary" /> : null}
    </View>
  );
}
