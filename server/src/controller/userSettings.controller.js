import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";

const DEFAULT_SETTINGS = {
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

export const getUserSettings = async (req, res) => {
  try {
    const userSettings = await prismaClient.userSettings.findFirst({
      where: {
        user_id: req.user.id,
      },
    });

    if (!userSettings) {
      // Create default settings for the user
      const newSettings = await prismaClient.userSettings.create({
        data: {
          user_id: req.user.id,
          settings: DEFAULT_SETTINGS,
          created_by: req.user.id,
          created_ip: req.ip,
          updated_by: req.user.id,
          updated_ip: req.ip,
          company_id: req.user.company_id,
        },
      });

      return HttpResponse.success(
        "Default settings created successfully",
        newSettings.settings
      ).send(res);
    }

    return HttpResponse.success(
      "User settings fetched successfully",
      userSettings.settings
    ).send(res);
  } catch (error) {
    console.error("Get user settings error:", error);
    return HttpResponse.internalError(
      "Failed to fetch user settings",
      error.message
    ).send(res);
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const result = await prismaClient.$transaction(async (tx) => {
      // Get previous settings for audit log
      const previousSettings = await tx.userSettings.findFirst({
        where: { user_id: req.user.id },
      });

      // Prepare the new settings object
      const newSettings = {
        mode:
          req.body.mode ||
          previousSettings?.settings?.mode ||
          DEFAULT_SETTINGS.mode,
        scheme:
          req.body.scheme ||
          previousSettings?.settings?.scheme ||
          DEFAULT_SETTINGS.scheme,
        settings: {
          ...DEFAULT_SETTINGS.settings,
          ...(previousSettings?.settings?.settings || {}),
          ...(req.body.settings || {}),
        },
      };

      let userSettings;

      if (previousSettings) {
        // Update existing settings
        userSettings = await tx.userSettings.update({
          where: {
            id: previousSettings.id,
          },
          data: {
            settings: newSettings,
            updated_by: req.user.id,
            updated_ip: req.ip,
          },
        });
      } else {
        // Create new settings
        userSettings = await tx.userSettings.create({
          data: {
            user_id: req.user.id,
            settings: newSettings,
            created_by: req.user.id,
            created_ip: req.ip,
            updated_by: req.user.id,
            updated_ip: req.ip,
            company_id: req.user.company_id,
          },
        });
      }

      // Create audit log
      await auditLog(
        "user_settings",
        userSettings.id,
        previousSettings ? "UPDATE" : "CREATE",
        previousSettings?.settings || null,
        userSettings.settings,
        req.user.id,
        req
      );

      return userSettings;
    });

    return HttpResponse.success(
      "Settings updated successfully",
      result.settings
    ).send(res);
  } catch (error) {
    console.error("Update user settings error:", error);
    return HttpResponse.internalError(
      "Failed to update user settings",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "userSettings",
    ...req.body,
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
};
