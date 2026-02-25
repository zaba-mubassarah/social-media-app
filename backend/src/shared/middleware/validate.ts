import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { StatusCodes } from "http-status-codes";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        errors: result.error.flatten()
      });
      return;
    }

    next();
  };
