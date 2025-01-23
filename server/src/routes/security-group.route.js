import { Router } from "express";
import { errorHandler } from "../handlers/errorHandler.js";
import {
  createSecurityGroup,
  deleteSecurityGroup,
  getSecurityGroup,
  paginatedData,
  updateSecurityGroup,
  getSecurityGroups,
} from "../controller/security-group.controller.js";

const securityGroupRoutes = Router();

securityGroupRoutes.post("/", errorHandler(createSecurityGroup));
securityGroupRoutes.get("/", errorHandler(getSecurityGroups));
securityGroupRoutes.post("/pagination", errorHandler(paginatedData));
securityGroupRoutes.get("/:securityGroupId", errorHandler(getSecurityGroup));
securityGroupRoutes.put("/:securityGroupId", errorHandler(updateSecurityGroup));
securityGroupRoutes.delete(
  "/:securityGroupId",
  errorHandler(deleteSecurityGroup)
);

export default securityGroupRoutes;
