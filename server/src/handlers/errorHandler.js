import { ZodError } from "zod";
import { HttpResponse } from "../utils/httpResponse.js";
import { HttpException } from "../exceptions/http-exception.js";
import { Prisma } from "@prisma/client";

export const errorHandler = (method) => {
  return async (req, res, next) => {
    try {
      await method(req, res, next);
    } catch (error) {
      console.log("error", error);
      let exception;

      if (error instanceof HttpException) {
        exception = error;
      } else {
        if (error instanceof ZodError) {
          // Format Zod validation errors
          const formattedErrors = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
          exception = HttpResponse.badRequest({
            message: "Validation error",
            errors: formattedErrors,
          }).send(res);
        } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Handle known Prisma errors
          switch (error.code) {
            case "P2002": {
              // Unique constraint violation
              const field = error.meta?.target || "unknown field";
              exception = HttpResponse.conflict({
                message: "Unique constraint violation",
                field: field,
                detail: `A record with this ${field} already exists`,
              }).send(res);
              break;
            }
            case "P2014": {
              // Invalid ID
              const field = error.meta?.target || "ID";
              exception = HttpResponse.badRequest({
                message: "Invalid ID provided",
                field: field,
              }).send(res);
              break;
            }
            case "P2003": {
              // Foreign key constraint failed
              const field = error.meta?.field_name || "unknown field";
              exception = HttpResponse.badRequest({
                message: "Related record not found",
                field: field,
                detail: `Foreign key constraint failed on field: ${field}`,
              }).send(res);
              break;
            }
            case "P2025": {
              // Record not found
              const details = error.meta?.cause || "Record not found";
              exception = HttpResponse.notFound({
                message: "Record not found",
                detail: details,
              }).send(res);
              break;
            }
            case "P2021": {
              // Table does not exist
              const table = error.meta?.table || "unknown table";
              exception = HttpResponse.internalError({
                message: "Database error",
                detail: `Table ${table} does not exist`,
              }).send(res);
              break;
            }
            case "P2016": {
              // Query interpretation error
              const details = error.meta?.reason || error.message;
              exception = HttpResponse.badRequest({
                message: "Invalid query",
                detail: details,
              }).send(res);
              break;
            }
            default:
              exception = HttpResponse.badRequest({
                message: "Database error",
                code: error.code,
                detail: error.message,
              }).send(res);
          }
        } else if (error instanceof Prisma.PrismaClientValidationError) {
          // Extract field information from validation error
          const errorMessage = error.message;
          const fieldMatch = errorMessage.match(
            /Invalid value for field `(\w+)`/
          );
          const field = fieldMatch ? fieldMatch[1] : "unknown field";

          exception = HttpResponse.badRequest({
            message: "Validation error",
            field: field,
            detail: error.message,
          }).send(res);
        } else if (error instanceof Prisma.PrismaClientInitializationError) {
          exception = HttpResponse.internalError({
            message: "Database connection error",
            detail: error.message,
          }).send(res);
        } else if (error instanceof Prisma.PrismaClientRustPanicError) {
          exception = HttpResponse.internalError({
            message: "Critical database error",
            detail: error.message,
          }).send(res);
        } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
          exception = HttpResponse.internalError({
            message: "Unknown database error",
            detail: error.message,
          }).send(res);
        } else {
          // Handle all other errors
          exception = HttpResponse.internalError({
            message: "Internal server error",
            detail: error.message,
          }).send(res);
        }
      }

      next(exception);
    }
  };
};
