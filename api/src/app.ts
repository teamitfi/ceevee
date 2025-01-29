import express from "express";
import privateRoutes from "./routes/private.js";

const app = express();
app.use(express.json());
app.use("/api/private", privateRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;