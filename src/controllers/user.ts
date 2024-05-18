import { RequestHandler } from "express";

export const createUser: RequestHandler = async (req, res) => {
  return res.status(200).send("Created user successfully");
};
