import { RequestHandler } from "express";

import UserService from "../services/user.service";

export default class AuthController {
  public userService = new UserService();

  public signUp: RequestHandler = async (req, res) => {
    return res.status(200).send("Sign up successful");
  };
  public signIn: RequestHandler = async (req, res) => {
    return res.status(200).send("Sign in successful");
  };
}
