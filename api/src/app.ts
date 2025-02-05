import express, { NextFunction, Request, Response } from "express";
import routes from "./routes/index.js";

const logIncomingRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
}

const app = express();
app.use(express.json());
app.use("/api/v1", logIncomingRequest, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;