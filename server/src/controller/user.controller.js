import bcrypt from "bcryptjs";
import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";

const DEFAULT_USER_SETTINGS = {
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
    colorPrimary: "#2563eb",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f8fafc",
    colorText: "#1e293b",
    controlItemBgActive: "#eff6ff",
    controlItemBgActiveHover: "#e0f2fe",
    colorSuccessBg: "#ecfdf5",
    colorSuccessText: "#047857",
    colorSuccessBorder: "#10b981",
    colorWarningBg: "#fffbeb",
    colorWarningText: "#b45309",
    colorWarningBorder: "#f59e0b",
    colorErrorBg: "#fef2f2",
    colorErrorText: "#b91c1c",
    colorErrorBorder: "#ef4444",
    colorInfoBg: "#eff6ff",
    colorInfoText: "#1d4ed8",
    colorInfoBorder: "#3b82f6",
    colorBgElevated: "#ffffff",
    colorTextSecondary: "#475569",
    colorTextTertiary: "#64748b",
    colorBorder: "#e2e8f0",
    colorBorderSecondary: "#f1f5f9",
  },
};

export const getUsers = async (req, res) => {
  const users = await prismaClient.user.findMany();

  return HttpResponse.success("Users fetched successfully", users).send(res);
};

export const checkAvailableUsername = async (req, res) => {
  const { name } = req.body;

  const user = await prismaClient.$queryRawUnsafe(
    `SELECT * FROM users where LOWER(username)=LOWER(?)`,
    name
  );
  let isAvailable = user.length > 0 ? false : true;
  return HttpResponse.success("Username available", isAvailable).send(res);
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  const user = await prismaClient.user.findUnique({
    where: {
      id,
    },
    include: {
      UserGroups: true,
    },
  });
  return HttpResponse.success("User fetched successfully", user).send(res);
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const previousData = await prismaClient.user.findUnique({
    where: {
      id,
    },
    include: {
      UserGroups: true,
    },
  });
  await prismaClient.userGroup.deleteMany({
    where: { user_id: id },
  });
  await prismaClient.user.delete({
    where: {
      id,
    },
  });
  await auditLog("users", id, "DELETE", previousData, null, req.user.id, req);
  return HttpResponse.success("User deleted successfully").send(res);
};

export const createUser = async (req, res) => {
  const {
    email,
    password,
    fullname,
    address,
    username,
    phone,
    is_active,
    is_admin,
    is_password_reset,
    user_type,
    company_id,
    UserGroups,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const loggedUser = req.user;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          fullname,
          username,
          email,
          password: hashedPassword,
          address,
          phone,
          is_active,
          is_admin,
          is_password_reset,
          user_type,
          created_by: loggedUser.id,
          created_ip: req.ip || "",
          company_id,
          UserGroups: {
            create: UserGroups.map((group) => ({
              group_id: group.group_id,
              created_at: new Date(),
              created_by: loggedUser.id,
              created_ip: req.ip,
              company_id: loggedUser.company_id,
            })),
          },
        },
        include: {
          UserGroups: true,
        },
      });

      // Create default user settings
      await tx.userSettings.create({
        data: {
          user_id: user.id,
          settings: DEFAULT_USER_SETTINGS,
          created_by: loggedUser.id,
          created_ip: req.ip,
          updated_by: loggedUser.id,
          updated_ip: req.ip,
          company_id: loggedUser.company_id,
        },
      });

      await auditLog(
        "users",
        user.id,
        "CREATE",
        null,
        user,
        loggedUser.id,
        req
      );

      return user;
    });

    return HttpResponse.created("User created successfully", result).send(res);
  } catch (error) {
    console.error("Create user error:", error);
    return HttpResponse.internalError(
      "Failed to create user",
      error.message
    ).send(res);
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    email,
    password,
    fullname,
    address,
    username,
    phone,
    is_active,
    is_admin,
    is_password_reset,
    user_type,
    company_id,
    UserGroups = [],
  } = req.body;
  const loggedUser = req.user;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      // Get existing user data for audit
      const existingUser = await tx.user.findUnique({
        where: { id },
        include: {
          UserGroups: true,
        },
      });

      if (!existingUser) {
        return HttpResponse.notFound("User not found").send(res);
      }

      // Check if user has settings, if not create default
      const existingSettings = await tx.userSettings.findFirst({
        where: { user_id: id },
      });

      if (!existingSettings) {
        await tx.userSettings.create({
          data: {
            user_id: id,
            settings: DEFAULT_USER_SETTINGS,
            created_by: loggedUser.id,
            created_ip: req.ip,
            updated_by: loggedUser.id,
            updated_ip: req.ip,
            company_id: loggedUser.company_id,
          },
        });
      }

      // First delete existing user groups
      await tx.userGroup.deleteMany({
        where: { user_id: id },
      });

      // Update user and create new user groups
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          email,
          fullname,
          address,
          username,
          phone,
          is_active,
          is_admin,
          is_password_reset,
          user_type,
          company_id,
          updated_at: new Date(),
          updated_by: loggedUser.id,
          updated_ip: req.ip,
          UserGroups: {
            create: UserGroups.map((group) => ({
              group_id: group.group_id,
              created_at: new Date(),
              created_by: loggedUser.id,
              created_ip: req.ip,
              company_id: loggedUser.company_id,
            })),
          },
        },
        include: {
          UserGroups: true,
        },
      });

      // Create audit logs
      await auditLog(
        "users",
        id,
        "UPDATE",
        existingUser,
        updatedUser,
        loggedUser.id,
        req
      );

      return updatedUser;
    });

    return HttpResponse.success("User updated successfully", result).send(res);
  } catch (error) {
    console.error("Update user error:", error);
    if (error.message === "User not found") {
      return HttpResponse.notFound("User not found").send(res);
    }
    return HttpResponse.internalError(
      "Failed to update user",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "user",
    ...req.body,
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
};
