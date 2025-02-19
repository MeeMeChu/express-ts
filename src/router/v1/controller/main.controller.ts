import { Request, Response } from "express";

export const Hello = (req: Request, res: Response) => {
  res.send("Hello World");
}