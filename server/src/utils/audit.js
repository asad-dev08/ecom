import { PrismaClient } from "@prisma/client";
import logger from "./logger.js";

const prisma = new PrismaClient();

export const auditLog = async (
  tableName,
  recordId,
  action,
  previousData,
  newData,
  userId,
  req
) => {
  try {
    await prisma.auditLog.create({
      data: {
        table_name: tableName,
        record_id: recordId,
        action,
        previous_data:
          typeof previousData === "string"
            ? previousData
            : JSON.stringify(previousData),
        new_data:
          typeof newData === "string" ? newData : JSON.stringify(newData),
        changed_by: userId,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    logger.error("Failed to create audit log", { error });
  }
};
