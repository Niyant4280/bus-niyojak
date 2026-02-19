import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Welcome to Bus नियोजक API!",
  };
  res.status(200).json(response);
};
