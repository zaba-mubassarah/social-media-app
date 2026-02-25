import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../shared/utils/async-handler";
import { login, logout, refresh, register } from "./auth.service";

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const result = await register({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    userAgent: req.headers["user-agent"],
    ip: req.ip
  });
  res.status(StatusCodes.CREATED).json(result);
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const result = await login({
    email: req.body.email,
    password: req.body.password,
    userAgent: req.headers["user-agent"],
    ip: req.ip
  });
  res.status(StatusCodes.OK).json(result);
});

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
  const result = await refresh(req.body.refreshToken, {
    userAgent: req.headers["user-agent"],
    ip: req.ip
  });
  res.status(StatusCodes.OK).json(result);
});

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  await logout(req.body.refreshToken, req.user?.id);
  res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
});
