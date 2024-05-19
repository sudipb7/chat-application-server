import cors from "cors";
import http from "http";
import morgan from "morgan";
import express from "express";

import { NODE_ENV, PORT, corsOptions } from "./config";

const app = express();
const httpServer = http.createServer(app);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// Routes
import userRouter from "./routes/user";

app.use("/user", userRouter);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in '${NODE_ENV.toUpperCase()}' mode`);
});
