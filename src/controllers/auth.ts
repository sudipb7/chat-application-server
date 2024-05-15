import { RequestHandler } from "express";

export const signUp: RequestHandler = (req, res) => {
  return res.status(200).send("Ok");
};
