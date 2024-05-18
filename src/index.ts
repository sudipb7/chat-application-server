import cors from "cors";
import http from "http";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { NODE_ENV, PORT, corsOptions } from "./config";
import userRouter from "./routes/user";

const app = express();
const httpServer = http.createServer(app);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// Routes
app.use("/user", userRouter);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in '${NODE_ENV}' mode`);
});
