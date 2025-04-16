import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validateRequest =
    (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            res.status(400).json({
                error: "Validation failed",
                details:
                    error instanceof ZodError
                        ? error.errors
                        : "Unknown validation error",
            });
        }
    };
