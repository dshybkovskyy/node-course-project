import express from "express";
import cors from "cors";
import path from "path";
import userRoutes from "./routes/users.ts";
import exerciseRoutes from "./routes/exercises.ts";
import { errorHandler } from "./middleware/errorHandler.ts";

const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/users", exerciseRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.resolve("views", "index.html"));
});

app.use(errorHandler);

export default app;
