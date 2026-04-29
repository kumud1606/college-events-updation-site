import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import { AppError } from "./utils/errors.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.resolve(__dirname, "../../public");
const uploadsDirectory = path.resolve(__dirname, "../uploads");

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(publicDirectory, "assets")));
app.use("/uploads", express.static(uploadsDirectory));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "college-clubs-backend" });
});

app.use("/api", routes);

app.use((_request, _response, next) => {
  next(new AppError("Route not found.", 404));
});

app.use((error, _request, response, _next) => {
  const status = error.status || 500;
  response.status(status).json({
    message: error.message || "Something went wrong."
  });
});

export default app;
