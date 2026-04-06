const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const validateAppointmentInputs = ({ appointmentDate, appointmentTime, reason, requireReason = true }) => {
  if (!DATE_PATTERN.test(appointmentDate)) {
    return "Appointment date must use YYYY-MM-DD format.";
  }

  if (!TIME_PATTERN.test(appointmentTime)) {
    return "Appointment time must use HH:MM 24-hour format.";
  }

  if (requireReason && !reason?.trim()) {
    return "Please add a reason for the visit.";
  }

  return "";
};
