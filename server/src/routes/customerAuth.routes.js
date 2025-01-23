import express from "express";
import { CustomerAuthService } from "../services/customerAuth.service.js";
import { logError, logInfo } from "../utils/logger.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { verifyCustomerToken } from "../middleware/customerAuth.js";

const customerAuthRoutes = express.Router();

customerAuthRoutes.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return HttpResponse.badRequest("Missing required fields").send(res);
    }

    const result = await CustomerAuthService.register({
      first_name,
      last_name,
      email,
      phone,
      password,
      created_ip: req.ip,
    });

    logInfo("Customer registered successfully", { email });
    return HttpResponse.success("Registration successful", result).send(res);
  } catch (error) {
    logError("Registration failed", error, { email: req.body.email });
    return HttpResponse.badRequest(error.message).send(res);
  }
});

customerAuthRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await CustomerAuthService.login(email, password);

    logInfo("Customer logged in successfully", { email });
    return HttpResponse.success("Login successful", result).send(res);
  } catch (error) {
    logError("Login failed", error, { email: req.body.email });
    return HttpResponse.unauthorized(error.message).send(res);
  }
});

customerAuthRoutes.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await CustomerAuthService.refreshToken(refreshToken);
    return HttpResponse.success("Token refreshed successfully", result).send(
      res
    );
  } catch (error) {
    logError("Token refresh failed", error);
    return HttpResponse.unauthorized(error.message).send(res);
  }
});

customerAuthRoutes.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return HttpResponse.badRequest("Refresh token is required").send(res);
    }

    const customer = req.customer;
    await CustomerAuthService.logout(refreshToken);

    // logInfo("Customer logged out successfully", {
    //   customerId: customer.id,
    // });

    return HttpResponse.success("Logged out successfully").send(res);
  } catch (error) {
    logError("Logout failed", error);
    return HttpResponse.badRequest(error.message).send(res);
  }
});

export default customerAuthRoutes;
