import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";
import { PrismaClient } from "@prisma/client";

export const getSecurityRules = async (req, res) => {
  const securityRules = await prismaClient.securityRule.findMany();
  return HttpResponse.success(
    "Security rules fetched successfully",
    securityRules
  ).send(res);
};

export const getSecurityRule = async (req, res) => {
  const securityRule = await prismaClient.securityRule.findUnique({
    where: { id: req.params.securityRuleId },
    include: {
      SecurityRuleWiseMenuPermissions: true,
    },
  });
  return HttpResponse.success(
    "Security rule fetched successfully",
    securityRule
  ).send(res);
};

export const updateSecurityRule = async (req, res) => {
  const { name, description, menuPermissionList = {} } = req.body;
  const { securityRuleId } = req.params;
  const loggedUser = req.user;

  try {
    const result = await prismaClient.$transaction(
      async (prisma) => {
        // Get existing data for audit
        const existingSecurityRule = await prisma.securityRule.findUnique({
          where: { id: securityRuleId },
          include: {
            SecurityRuleWiseMenuPermissions: true,
          },
        });

        if (!existingSecurityRule) {
          return HttpResponse.notFound("Security rule not found").send(res);
        }

        // Update security rule and permissions
        const updatedSecurityRule = await prisma.securityRule.update({
          where: { id: securityRuleId },
          data: {
            name: name.trim(),
            description: description?.trim(),
            updated_at: new Date(),
            updated_by: loggedUser.id,
            updated_ip: req.ip,
            SecurityRuleWiseMenuPermissions: {
              deleteMany: {},
              create: Object.entries(menuPermissionList).map(
                ([menuId, permissions]) => ({
                  menu_id: parseInt(menuId),
                  can_view: permissions.can_view ?? false,
                  can_create: permissions.can_create ?? false,
                  can_update: permissions.can_update ?? false,
                  can_delete: permissions.can_delete ?? false,
                  can_report: permissions.can_report ?? false,
                  created_at: new Date(),
                  created_by: loggedUser.id,
                  created_ip: req.ip,
                  company_id: loggedUser.company_id,
                })
              ),
            },
          },
          include: {
            SecurityRuleWiseMenuPermissions: true,
          },
        });

        // Create audit log for security rule update
        await auditLog(
          "security_rule",
          securityRuleId,
          "UPDATE",
          {
            ...existingSecurityRule,
            SecurityRuleWiseMenuPermissions: undefined,
          },
          {
            ...updatedSecurityRule,
            SecurityRuleWiseMenuPermissions: undefined,
          },
          loggedUser.id,
          req
        );
        // Create audit log for permissions update
        await auditLog(
          "security_rule_wise_menu_permission",
          securityRuleId,
          "UPDATE",
          existingSecurityRule.SecurityRuleWiseMenuPermissions,
          updatedSecurityRule.SecurityRuleWiseMenuPermissions,
          loggedUser.id,
          req
        );

        return updatedSecurityRule;
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: "Serializable",
      }
    );

    return HttpResponse.success(
      "Security rule updated successfully",
      result
    ).send(res);
  } catch (error) {
    console.error("Update transaction failed:", error);

    if (error.message === "Security rule not found") {
      return HttpResponse.notFound("Security rule not found").send(res);
    }

    if (error.code === "P2002") {
      return HttpResponse.conflict(
        "A security rule with this name already exists"
      ).send(res);
    }

    return HttpResponse.error(
      "Failed to update security rule",
      error.message
    ).send(res);
  }
};

export const deleteSecurityRule = async (req, res) => {
  const { securityRuleId } = req.params;
  const result = await prismaClient.$transaction(async (tx) => {
    const existingSecurityRule = await tx.securityRule.findUnique({
      where: { id: securityRuleId },
    });
    const menuPermissions = await tx.securityRuleWiseMenuPermission.findMany({
      where: { rule_id: securityRuleId },
    });
    for (const menuPermission of menuPermissions) {
      await tx.securityRuleWiseMenuPermission.delete({
        where: { id: menuPermission.id },
      });
      await auditLog(
        "security_rule_wise_menu_permission",
        menuPermission.id,
        "DELETE",
        menuPermission,
        null,
        loggedUser.id,
        req
      );
    }
    const securityRule = await tx.securityRule.delete({
      where: { id: securityRuleId },
    });
    await auditLog(
      "security_rule",
      securityRule.id,
      "DELETE",
      existingSecurityRule,
      securityRule,
      loggedUser.id,
      req
    );
  });
  return HttpResponse.success("Security rule deleted successfully", {}).send(
    res
  );
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "securityRule",
    ...req.body,
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
};

export const createSecurityRule = async (req, res) => {
  const { name, description, menuPermissionList = {} } = req.body;
  const loggedUser = req.user;

  try {
    const result = await prismaClient.$transaction(async (prisma) => {
      // Create parent and children in a single query
      const securityRule = await prisma.securityRule.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          created_at: new Date(),
          created_by: loggedUser.id,
          created_ip: req.ip,
          company_id: loggedUser.company_id,
          SecurityRuleWiseMenuPermissions: {
            create: Object.entries(menuPermissionList).map(
              ([menuId, permissions]) => ({
                menu_id: parseInt(menuId),
                can_view: permissions.can_view ?? false,
                can_create: permissions.can_create ?? false,
                can_update: permissions.can_update ?? false,
                can_delete: permissions.can_delete ?? false,
                can_report: permissions.can_report ?? false,
                created_at: new Date(),
                created_by: loggedUser.id,
                created_ip: req.ip,
                company_id: loggedUser.company_id,
              })
            ),
          },
        },
        include: {
          SecurityRuleWiseMenuPermissions: true,
        },
      });

      // Create audit log for security rule
      await auditLog(
        "security_rule",
        securityRule.id,
        "CREATE",
        null,
        securityRule,
        loggedUser.id,
        req
      );

      // Create audit log for permissions
      await auditLog(
        "security_rule_wise_menu_permission",
        securityRule.id,
        "CREATE",
        null,
        securityRule.SecurityRuleWiseMenuPermissions,
        loggedUser.id,
        req
      );

      return securityRule;
    });

    return HttpResponse.created(
      "Security rule created successfully",
      result
    ).send(res);
  } catch (error) {
    console.error("Transaction failed:", error);
    return HttpResponse.error(
      "Failed to create security rule",
      error.message
    ).send(res);
  }
};
