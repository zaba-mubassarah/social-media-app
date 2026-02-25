import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { verifyAccessToken } from "../utils/jwt";

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing bearer token" });
    return;
  }

  try {
    const token = auth.split(" ")[1];
    const payload = verifyAccessToken(token);
    req.user = {
      id: new Types.ObjectId(payload.sub),
      email: payload.email
    };
    next();
  } catch {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired token" });
  }
};
