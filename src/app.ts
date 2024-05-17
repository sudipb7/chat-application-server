import cors from "cors";
import morgan from "morgan";
import express from "express";

import type { Routes } from "./types";
import { NODE_ENV, corsOptions } from "./config";

export default class App {
  public app: express.Application;
  public env = NODE_ENV;

  constructor(routes: Routes[]) {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  private initializeMiddlewares() {
    this.app.use(express.static("public"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors(corsOptions));
    this.app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));
  }

  get expressApp() {
    return this.app;
  }

  get environment() {
    return this.env;
  }
}
