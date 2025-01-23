import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";
import { PERMITTED_MENU_QUERY } from "../query/menu.query.js";
import { prismaClient } from "../index.js";

const prisma = new PrismaClient();

export class AuthService {
  static async generateTokens(user, menus) {
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        company_id: user.company_id,
        username: user.username,
        is_admin: user.is_admin || false,
        fullname: user.fullname,
        phone: user.phone,
        address: user.address,
      },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiration }
    );

    let refreshToken = null;
    if (config.jwt.useRefreshToken) {
      refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiration,
      });

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
    }
    const loggedUser = {
      id: user.id,
      email: user.email,
      company_id: user.company_id,
      username: user.username,
      is_admin: user.is_admin || false,
      fullname: user.fullname,
      phone: user.phone,
      address: user.address,
    };

    // Fetch user settings
    const userSettings = await prisma.userSettings.findFirst({
      where: { user_id: user.id },
    });

    // Default settings if none exist
    const defaultSettings = {
      mode: "light",
      scheme: "normal",
      settings: {
        navigationStyle: "sidebar",
        contentWidth: "fluid",
        fixedHeader: true,
        fixedSidebar: true,
        sidebarCollapsed: false,
        fontSize: "base",
        fontFamily: "inter",
        borderRadius: 6,
        buttonShape: "default",
        tableSize: "middle",
        animations: true,
        pageTransitions: true,
      },
    };

    const data = {
      user: loggedUser,
      token: accessToken,
      menus,
      refreshToken,
      settings: userSettings?.settings || defaultSettings,
    };

    return data;
  }

  static async refreshToken(token) {
    if (!config.jwt.useRefreshToken) {
      throw new Error("Refresh token functionality is disabled");
    }

    const refreshTokenData = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshTokenData || refreshTokenData.isRevoked) {
      throw new Error("Invalid refresh token");
    }

    if (new Date() > refreshTokenData.expiresAt) {
      throw new Error("Refresh token expired");
    }

    return this.generateTokens(refreshTokenData.user);
  }

  static async register(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return this.generateTokens(user);
  }

  static async login(username, password) {
    const user = await prisma.user.findFirst({
      where: { email: username },
      select: {
        id: true,
        email: true,
        password: true,
        company_id: true,
        username: true,
        is_admin: true,
        is_active: true,
        user_type: true,
        fullname: true,
        phone: true,
        address: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(
      password.trim(),
      user.password
    );

    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    let menus = [];
    if (user.is_admin) {
      menus = await prismaClient.$queryRawUnsafe(
        PERMITTED_MENU_QUERY.GET_ALL_MENU_FOR_ADMIN
      );
    } else {
      menus = await prismaClient.$queryRawUnsafe(
        PERMITTED_MENU_QUERY.GET_PERMITTED_MENU_FROM_RULE,
        user.id
      );
    }

    menus = menus.map((menu) => ({
      ...menu,
      can_view: Boolean(menu.can_view),
      can_create: Boolean(menu.can_create),
      can_update: Boolean(menu.can_update),
      can_delete: Boolean(menu.can_delete),
      can_report: Boolean(menu.can_report),
      menu_id: Number(menu.menu_id),
    }));

    return this.generateTokens(user, menus);
  }

  static async verifyToken(req, res) {
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
          is_active: true,
          user_type: true,
          fullname: true,
          phone: true,
          address: true,
        },
      });

      if (!user) {
        return HttpResponse.unauthorized("User no longer exists").send(res);
      }

      let menus = [];
      if (user.is_admin) {
        menus = await prismaClient.$queryRawUnsafe(
          PERMITTED_MENU_QUERY.GET_ALL_MENU_FOR_ADMIN
        );
      } else {
        menus = await prismaClient.$queryRawUnsafe(
          PERMITTED_MENU_QUERY.GET_PERMITTED_MENU_FROM_RULE,
          user.id
        );
      }

      menus = menus.map((menu) => ({
        ...menu,
        can_view: Boolean(menu.can_view),
        can_create: Boolean(menu.can_create),
        can_update: Boolean(menu.can_update),
        can_delete: Boolean(menu.can_delete),
        can_report: Boolean(menu.can_report),
        menu_id: Number(menu.menu_id),
      }));

      const loggedUser = {
        id: user.id,
        email: user.email,
        company_id: user.company_id,
        username: user.username,
        is_admin: user.is_admin || false,
        fullname: user.fullname,
        phone: user.phone,
        address: user.address,
      };
      const data = {
        user: loggedUser,
        menus,
      };

      return data;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return HttpResponse.unauthorized("Token expired").send(res);
      }
      throw error;
    }
  }

  static async logout(refreshToken) {
    if (!config.jwt.useRefreshToken) {
      return true;
    }

    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });

    return true;
  }

  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          password: true,
          email: true,
          is_active: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.is_active) {
        throw new Error("User account is inactive");
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword.trim(),
        user.password
      );

      if (!isValidPassword) {
        throw new Error("Current password is incorrect");
      }

      // Password complexity validation
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(newPassword)) {
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }

      // Check if new password is same as current
      const isSamePassword = await bcrypt.compare(
        newPassword.trim(),
        user.password
      );
      if (isSamePassword) {
        throw new Error("New password must be different from current password");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          updated_at: new Date(),
          is_password_reset: false,
        },
      });

      // Log password change
      await prisma.applicationLog.create({
        data: {
          level: "INFO",
          message: "Password changed successfully",
          meta: {
            userId: userId,
            action: "CHANGE_PASSWORD",
            timestamp: new Date(),
          },
          timestamp: new Date(),
        },
      });

      // Revoke all refresh tokens for security
      if (config.jwt.useRefreshToken) {
        await prisma.refreshToken.updateMany({
          where: { userId: userId },
          data: { isRevoked: true },
        });
      }

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      // Log error
      await prisma.applicationLog.create({
        data: {
          level: "ERROR",
          message: "Password change failed",
          meta: {
            userId: userId,
            error: error.message,
            timestamp: new Date(),
          },
          timestamp: new Date(),
        },
      });

      throw error;
    }
  }

  static async updateProfile(userId, userData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          is_active: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.is_active) {
        throw new Error("User account is inactive");
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          fullname: userData.fullname,
          phone: userData.phone,
          address: userData.address,
          updated_at: new Date(),
        },
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
          address: true,
          username: true,
          is_admin: true,
          company_id: true,
        },
      });

      // Log the update
      await prisma.applicationLog.create({
        data: {
          level: "INFO",
          message: "Profile updated successfully",
          meta: {
            userId: userId,
            action: "UPDATE_PROFILE",
            timestamp: new Date(),
          },
          timestamp: new Date(),
        },
      });

      return {
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      };
    } catch (error) {
      // Log error
      await prisma.applicationLog.create({
        data: {
          level: "ERROR",
          message: "Profile update failed",
          meta: {
            userId: userId,
            error: error.message,
            timestamp: new Date(),
          },
          timestamp: new Date(),
        },
      });

      throw error;
    }
  }
}
