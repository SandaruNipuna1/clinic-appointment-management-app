import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient"
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Doctor"
    },
    appointmentDate: {
      type: String,
      required: true
    },
    appointmentTime: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["booked", "completed", "cancelled"],
      default: "booked"
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.index({
  doctorId: 1,
  appointmentDate: 1,
  appointmentTime: 1
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
