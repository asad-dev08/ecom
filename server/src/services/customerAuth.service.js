import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";

const prisma = new PrismaClient();

export class CustomerAuthService {
  static async generateTokens(customer) {
    const accessToken = jwt.sign(
      {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        type: "customer",
      },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiration }
    );

    const refreshToken = jwt.sign(
      { id: customer.id, type: "customer" },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiration }
    );

    // Save refresh token
    await prisma.customerRefreshToken.create({
      data: {
        token: refreshToken,
        customerId: customer.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(email, password) {
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw new Error("Invalid credentials");
    }

    if (!customer.is_active) {
      throw new Error("Account is inactive");
    }

    const isValidPassword = await bcrypt.compare(
      password.trim(),
      customer.password
    );

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    return this.generateTokens(customer);
  }

  static async register(userData) {
    // Validate email uniqueness
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: userData.email },
    });

    if (existingCustomer) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password.trim(), 10);

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        is_active: true,
        created_by: "self-registration",
        created_ip: userData.created_ip,
      },
    });

    return this.generateTokens(customer);
  }

  static async refreshToken(token) {
    const refreshTokenData = await prisma.customerRefreshToken.findUnique({
      where: { token },
      include: { customer: true },
    });

    if (!refreshTokenData || refreshTokenData.isRevoked) {
      throw new Error("Invalid refresh token");
    }

    if (new Date() > refreshTokenData.expiresAt) {
      throw new Error("Refresh token expired");
    }

    // Revoke the old refresh token
    await prisma.customerRefreshToken.update({
      where: { id: refreshTokenData.id },
      data: { isRevoked: true },
    });

    return this.generateTokens(refreshTokenData.customer);
  }

  static async logout(refreshToken) {
    await prisma.customerRefreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });

    return true;
  }
}
