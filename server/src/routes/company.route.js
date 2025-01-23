import { Router } from "express";
import { errorHandler } from "../handlers/errorHandler.js";
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompany,
  paginatedData,
  updateCompany,
} from "../controller/company.controller.js";

const companyRoutes = Router();

companyRoutes.post("/", errorHandler(createCompany));
companyRoutes.get("/", errorHandler(getCompanies));
companyRoutes.post("/pagination", errorHandler(paginatedData));
companyRoutes.get("/:id", errorHandler(getCompany));
companyRoutes.put("/:id", errorHandler(updateCompany));
companyRoutes.delete("/:id", errorHandler(deleteCompany));

export default companyRoutes;
