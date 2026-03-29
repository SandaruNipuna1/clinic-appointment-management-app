import { jest } from "@jest/globals";

const AppointmentMock = {
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn()
};

jest.unstable_mockModule("../src/models/Appointment.js", () => ({
  default: AppointmentMock
}));

const {
  cancelAppointment,
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointments,
  getAppointmentsByPatient,
  updateAppointment
} = await import("../src/controllers/appointmentController.js");

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createNext = () => jest.fn();

describe("Appointment controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an appointment when the payload is valid and slot is free", async () => {
    const req = {
      body: {
        patientId: "661111111111111111111111",
        doctorId: "662222222222222222222221",
        appointmentDate: "2026-04-10",
        appointmentTime: "10:30",
        reason: "General checkup"
      }
    };
    const res = createResponse();
    const next = createNext();
    const createdAppointment = { _id: "appt-1", ...req.body, status: "booked" };

    AppointmentMock.findOne.mockResolvedValue(null);
    AppointmentMock.create.mockResolvedValue(createdAppointment);

    await createAppointment(req, res, next);

    expect(AppointmentMock.findOne).toHaveBeenCalled();
    expect(AppointmentMock.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: createdAppointment
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects create when required fields are missing", async () => {
    const req = {
      body: {
        patientId: "",
        doctorId: "662222222222222222222221",
        appointmentDate: "2026-04-10",
        appointmentTime: "10:30",
        reason: ""
      }
    };
    const res = createResponse();
    const next = createNext();

    await createAppointment(req, res, next);

    expect(AppointmentMock.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 400,
      message: "patientId, doctorId, appointmentDate, appointmentTime, and reason are required"
    }));
  });

  it("rejects create when the doctor slot is already booked", async () => {
    const req = {
      body: {
        patientId: "661111111111111111111111",
        doctorId: "662222222222222222222221",
        appointmentDate: "2026-04-10",
        appointmentTime: "10:30",
        reason: "Urgent visit"
      }
    };
    const res = createResponse();
    const next = createNext();

    AppointmentMock.findOne.mockResolvedValue({ _id: "existing-appt" });

    await createAppointment(req, res, next);

    expect(AppointmentMock.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 409,
      message: "Doctor already has an appointment at this date and time"
    }));
  });

  it("returns all appointments in sorted order", async () => {
    const req = {};
    const res = createResponse();
    const next = createNext();
    const appointments = [{ _id: "1" }, { _id: "2" }];
    const sort = jest.fn().mockResolvedValue(appointments);

    AppointmentMock.find.mockReturnValue({ sort });

    await getAppointments(req, res, next);

    expect(sort).toHaveBeenCalledWith({ appointmentDate: 1, appointmentTime: 1 });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 2,
      data: appointments
    });
  });

  it("returns appointments for a single patient", async () => {
    const req = {
      params: {
        patientId: "661111111111111111111111"
      }
    };
    const res = createResponse();
    const next = createNext();
    const appointments = [{ _id: "1", patientId: req.params.patientId }];
    const sort = jest.fn().mockResolvedValue(appointments);

    AppointmentMock.find.mockReturnValue({ sort });

    await getAppointmentsByPatient(req, res, next);

    expect(AppointmentMock.find).toHaveBeenCalledWith({
      patientId: req.params.patientId
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 1,
      data: appointments
    });
  });

  it("returns one appointment by id", async () => {
    const req = {
      params: {
        id: "appt-1"
      }
    };
    const res = createResponse();
    const next = createNext();
    const appointment = { _id: "appt-1" };

    AppointmentMock.findById.mockResolvedValue(appointment);

    await getAppointmentById(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: appointment
    });
  });

  it("updates an appointment when the new slot is valid", async () => {
    const appointment = {
      _id: "appt-1",
      doctorId: { toString: () => "662222222222222222222221" },
      appointmentDate: "2026-04-10",
      appointmentTime: "10:30",
      reason: "General checkup",
      status: "booked",
      save: jest.fn().mockResolvedValue(true)
    };
    const req = {
      params: {
        id: "appt-1"
      },
      body: {
        appointmentDate: "2026-04-11",
        appointmentTime: "11:30"
      }
    };
    const res = createResponse();
    const next = createNext();

    AppointmentMock.findById.mockResolvedValue(appointment);
    AppointmentMock.findOne.mockResolvedValue(null);

    await updateAppointment(req, res, next);

    expect(appointment.appointmentDate).toBe("2026-04-11");
    expect(appointment.appointmentTime).toBe("11:30");
    expect(appointment.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: appointment
    });
  });

  it("rejects update when the requested slot is already booked", async () => {
    const appointment = {
      _id: "appt-1",
      doctorId: { toString: () => "662222222222222222222221" },
      appointmentDate: "2026-04-10",
      appointmentTime: "10:30",
      save: jest.fn()
    };
    const req = {
      params: {
        id: "appt-1"
      },
      body: {
        appointmentDate: "2026-04-11",
        appointmentTime: "11:30"
      }
    };
    const res = createResponse();
    const next = createNext();

    AppointmentMock.findById.mockResolvedValue(appointment);
    AppointmentMock.findOne.mockResolvedValue({ _id: "appt-2" });

    await updateAppointment(req, res, next);

    expect(appointment.save).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 409,
      message: "Requested slot is already booked for this doctor"
    }));
  });

  it("cancels an appointment when it is still active", async () => {
    const appointment = {
      _id: "appt-1",
      status: "booked",
      save: jest.fn().mockResolvedValue(true)
    };
    const req = {
      params: {
        id: "appt-1"
      }
    };
    const res = createResponse();
    const next = createNext();

    AppointmentMock.findById.mockResolvedValue(appointment);

    await cancelAppointment(req, res, next);

    expect(appointment.status).toBe("cancelled");
    expect(appointment.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment
    });
  });

  it("rejects cancel when the appointment is already cancelled", async () => {
    const appointment = {
      _id: "appt-1",
      status: "cancelled",
      save: jest.fn()
    };
    const req = {
      params: {
        id: "appt-1"
      }
    };
    const res = createResponse();
    const next = createNext();

    AppointmentMock.findById.mockResolvedValue(appointment);

    await cancelAppointment(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 400,
      message: "Appointment is already cancelled"
    }));
  });

  it("deletes an appointment when it exists", async () => {
    const appointment = {
      _id: "appt-1",
      deleteOne: jest.fn().mockResolvedValue(true)
    };
    const req = {
      params: {
        id: "appt-1"
      }
    };
    const res = createResponse();
    const next = createNext();

    AppointmentMock.findById.mockResolvedValue(appointment);

    await deleteAppointment(req, res, next);

    expect(appointment.deleteOne).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Appointment deleted successfully"
    });
  });
});
