import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { corsOptions, PORT, NODE_ENV } from "./config";

const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors(corsOptions));
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
