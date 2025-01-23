import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";

export const getSecurityGroups = async (req, res) => {
  const securityGroups = await prismaClient.securityGroup.findMany();
  return HttpResponse.success(
    "Security groups fetched successfully",
    securityGroups
  ).send(res);
};

export const getSecurityGroup = async (req, res) => {
  const securityGroup = await prismaClient.securityGroup.findUnique({
    where: { id: req.params.securityGroupId },
  });
  const ruleList = await prismaClient.$queryRawUnsafe(
    `SELECT g.*, r.name as rule_name FROM security_group_rule g
        left join security_rule r on g.rule_id = r.id
        where group_id=?`,
    req.params.securityGroupId
  );
  return HttpResponse.success("Security group fetched successfully", {
    ...securityGroup,
    ruleList,
  }).send(res);
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "securityGroup",
    ...req.body,
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
};

export const createSecurityGroup = async (req, res) => {
  const { name, description, ruleList = [] } = req.body;
  const loggedUser = req.user;

  try {
    const result = await prismaClient.$transaction(async (prisma) => {
      // Create security group with rules in a single query
      const securityGroup = await prisma.securityGroup.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          created_at: new Date(),
          created_by: loggedUser.id,
          created_ip: req.ip,
          company_id: loggedUser.company_id,
          SecurityGroupRules: {
            create: ruleList.map((rule) => ({
              rule_id: rule.rule_id,
              created_at: new Date(),
              created_by: loggedUser.id,
              created_ip: req.ip,
              company_id: loggedUser.company_id,
            })),
          },
        },
        include: {
          SecurityGroupRules: true,
        },
      });

      // Create audit log for security group
      await auditLog(
        "security_group",
        securityGroup.id,
        "CREATE",
        null,
        securityGroup,
        loggedUser.id,
        req
      );

      // Create audit log for rules
      await auditLog(
        "security_group_rule",
        securityGroup.id,
        "CREATE",
        null,
        securityGroup.SecurityGroupRules,
        loggedUser.id,
        req
      );

      return securityGroup;
    });

    return HttpResponse.created(
      "Security group created successfully",
      result
    ).send(res);
  } catch (error) {
    console.error("Transaction failed:", error);
    return HttpResponse.internalError(
      "Failed to create security group",
      error.message
    ).send(res);
  }
};

export const updateSecurityGroup = async (req, res) => {
  const { name, description, ruleList = {} } = req.body;
  const { securityGroupId } = req.params;
  const loggedUser = req.user;

  try {
    const result = await prismaClient.$transaction(async (prisma) => {
      // Get existing data for audit
      const existingSecurityGroup = await prisma.securityGroup.findUnique({
        where: { id: securityGroupId },
        include: {
          SecurityGroupRules: true,
        },
      });

      if (!existingSecurityGroup) {
        return HttpResponse.notFound("Security group not found").send(res);
      }

      // Update security group and rules
      const updatedSecurityGroup = await prisma.securityGroup.update({
        where: { id: securityGroupId },
        data: {
          name: name.trim(),
          description: description?.trim(),
          updated_at: new Date(),
          updated_by: loggedUser.id,
          updated_ip: req.ip,
          SecurityGroupRules: {
            deleteMany: {},
            create: ruleList.map((rule) => ({
              rule_id: rule.rule_id,
              created_at: new Date(),
              created_by: loggedUser.id,
              created_ip: req.ip,
              company_id: loggedUser.company_id,
            })),
          },
        },
        include: {
          SecurityGroupRules: true,
        },
      });

      // Create audit log for security group update
      await auditLog(
        "security_group",
        securityGroupId,
        "UPDATE",
        {
          ...existingSecurityGroup,
          SecurityGroupRules: undefined,
        },
        {
          ...updatedSecurityGroup,
          SecurityGroupRules: undefined,
        },
        loggedUser.id,
        req
      );

      // Create audit log for rules update
      await auditLog(
        "security_group_rule",
        securityGroupId,
        "UPDATE",
        existingSecurityGroup.SecurityGroupRules,
        updatedSecurityGroup.SecurityGroupRules,
        loggedUser.id,
        req
      );

      return updatedSecurityGroup;
    });

    return HttpResponse.success(
      "Security group updated successfully",
      result
    ).send(res);
  } catch (error) {
    console.error("Update transaction failed:", error);

    if (error.message === "Security group not found") {
      return HttpResponse.notFound("Security group not found").send(res);
    }

    if (error.code === "P2002") {
      return HttpResponse.conflict(
        "A security group with this name already exists"
      ).send(res);
    }

    return HttpResponse.internalError(
      "Failed to update security group",
      error.message
    ).send(res);
  }
};

export const deleteSecurityGroup = async (req, res) => {
  const { securityGroupId } = req.params;
  const loggedUser = req.user;
  const existingGroupRules = await prismaClient.securityGroupRule.findMany({
    where: { group_id: securityGroupId },
  });
  await prismaClient.securityGroupRule.deleteMany({
    where: { group_id: securityGroupId },
  });
  await auditLog(
    "security_group",
    securityGroupId,
    "DELETE",
    existingGroupRules,
    null,
    loggedUser.id,
    req
  );
  const securityGroup = await prismaClient.securityGroup.findUnique({
    where: { id: securityGroupId },
  });

  const deletedSecurityGroup = await prismaClient.securityGroup.delete({
    where: { id: securityGroupId },
  });
  return HttpResponse.success(
    "Security group deleted successfully",
    deletedSecurityGroup
  ).send(res);
};
