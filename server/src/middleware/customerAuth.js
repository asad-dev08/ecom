import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { HttpResponse } from "../utils/httpResponse.js";

export const verifyCustomerToken = (req, res, next) => {
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

    // Verify this is a customer token
    if (decoded.type !== "customer") {
      return HttpResponse.unauthorized("Invalid token type").send(res);
    }

    req.customer = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return HttpResponse.unauthorized("Token expired").send(res);
    }
    return HttpResponse.unauthorized("Invalid token").send(res);
  }
};
