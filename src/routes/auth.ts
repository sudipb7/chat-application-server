import { Router } from "express";

import AuthController from "../controllers/auth";
import { Routes } from "../types";

export default class AuthRoutes implements Routes {
  public path: string;
  public router: Router = Router();
  public authController = new AuthController();

  constructor() {
    this.path = "/auth";
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/sign-up`, this.authController.signUp);
    this.router.post(`${this.path}/sign-in`, this.authController.signIn);
  }
}
