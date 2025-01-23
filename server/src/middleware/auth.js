import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { logError } from "../utils/logger.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return HttpResponse.unauthorized("No token provided").send(res);
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      return HttpResponse.unauthorized("Invalid token format").send(res);
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          company_id: true,
          username: true,
          is_admin: true,
        },
      });

      if (!user) {
        return HttpResponse.unauthorized("User no longer exists").send(res);
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return HttpResponse.unauthorized("Token expired").send(res);
      }
      throw error;
    }
  } catch (error) {
    logError("Authentication failed", error);
    return HttpResponse.unauthorized("Authentication failed").send(res);
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return HttpResponse.unauthorized().send(res);
    }

    if (roles.length && !roles.includes(req.user.role)) {
      logError("Authorization failed", {
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.role,
      });
      return HttpResponse.forbidden("Insufficient privileges").send(res);
    }

    next();
  };
};
