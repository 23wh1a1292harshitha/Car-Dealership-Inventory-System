import express from "express";
import authRoutes from "./routes/auth.routes";
import vehicleRoutes from "./routes/vehicle.routes";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

export default app;