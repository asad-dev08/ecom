import express from "express";
import { AuthService } from "../services/auth.service.js";
import { auditLog } from "../utils/audit.js";
import { logError, logInfo } from "../utils/logger.js";
import { verifyToken } from "../middleware/auth.js";
import { HttpResponse } from "../utils/httpResponse.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const tokens = await AuthService.login(username, password);

    // await auditLog("users", tokens.id, "LOGIN", null, tokens, req.user.id, req);
    logInfo("User logged in successfully", { username });

    return HttpResponse.success("Login successful", tokens).send(res);
  } catch (error) {
    logError("Login failed", error, { email: req.body.username });
    return HttpResponse.unauthorized(error.message).send(res);
  }
});

router.post("/verify-token", async (req, res) => {
  try {
    const data = await AuthService.verifyToken(req, res);
    return HttpResponse.success("Login successful", data).send(res);
  } catch (error) {
    logError("Authentication failed", error);
    return HttpResponse.unauthorized("Authentication failed").send(res);
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshToken(refreshToken);
    logInfo("Token refreshed successfully");
    return HttpResponse.success("Token refreshed successfully", tokens).send(
      res
    );
  } catch (error) {
    logError("Token refresh failed", error);
    return HttpResponse.unauthorized(error.message).send(res);
  }
});

router.post("/logout", verifyToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await AuthService.logout(refreshToken);
    // await auditLog("users", req.user.id, "LOGOUT", null, null, req.user.id, req);
    logInfo("User logged out successfully", { userId: req.user.id });
    return HttpResponse.success("Logged out successfully").send(res);
  } catch (error) {
    logError("Logout failed", error);
    return HttpResponse.badRequest(error.message).send(res);
  }
});

router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return HttpResponse.badRequest(
        "Current password and new password are required"
      ).send(res);
    }

    const result = await AuthService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    logInfo("Password changed successfully", { userId: req.user.id });

    // Optional: Log the password change in audit logs
    await auditLog(
      "users",
      req.user.id,
      "CHANGE_PASSWORD",
      null,
      { success: true },
      req.user.id,
      req
    );

    return HttpResponse.success("Password changed successfully", result).send(
      res
    );
  } catch (error) {
    logError("Password change failed", error, { userId: req.user.id });

    if (
      error.message.includes("Password must") ||
      error.message.includes("Current password is incorrect") ||
      error.message.includes("New password must be different")
    ) {
      return HttpResponse.badRequest(error.message).send(res);
    }

    return HttpResponse.internalError(
      "Failed to change password",
      error.message
    ).send(res);
  }
});

router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const { fullname, phone, address } = req.body;

    if (!fullname || !phone) {
      return HttpResponse.badRequest(
        "Full name and phone number are required"
      ).send(res);
    }

    const result = await AuthService.updateProfile(req.user.id, {
      fullname,
      phone,
      address,
    });

    logInfo("Profile updated successfully", { userId: req.user.id });

    // Log the profile update in audit logs
    await auditLog(
      "users",
      req.user.id,
      "UPDATE_PROFILE",
      null,
      { success: true },
      req.user.id,
      req
    );

    return HttpResponse.success("Profile updated successfully", result).send(
      res
    );
  } catch (error) {
    logError("Profile update failed", error, { userId: req.user.id });
    return HttpResponse.internalError(
      "Failed to update profile",
      error.message
    ).send(res);
  }
});

export default router;
