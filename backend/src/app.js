import cors from "cors";
import express from "express";
import morgan from "morgan";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Clinic Appointment API is running"
  });
});

app.use("/api/appointments", appointmentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
