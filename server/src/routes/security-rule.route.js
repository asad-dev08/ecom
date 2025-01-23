import { Router } from "express";
import { errorHandler } from "../handlers/errorHandler.js";
import {
  createSecurityRule,
  deleteSecurityRule,
  getSecurityRule,
  paginatedData,
  updateSecurityRule,
  getSecurityRules,
} from "../controller/security-rule.controller.js";

const securityRuleRoutes = Router();

securityRuleRoutes.post("/", errorHandler(createSecurityRule));
securityRuleRoutes.get("/", errorHandler(getSecurityRules));
securityRuleRoutes.post("/pagination", errorHandler(paginatedData));
securityRuleRoutes.get("/:securityRuleId", errorHandler(getSecurityRule));
securityRuleRoutes.put("/:securityRuleId", errorHandler(updateSecurityRule));
securityRuleRoutes.delete("/:securityRuleId", errorHandler(deleteSecurityRule));

export default securityRuleRoutes;
