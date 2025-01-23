import express from "express";
import {
  getSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  paginatedData,
} from "../controller/subcategory.controller.js";
import { errorHandler } from "../handlers/errorHandler.js";

const subcategoryRoutes = express.Router();

subcategoryRoutes.get("/", errorHandler(getSubcategories));
subcategoryRoutes.get("/:id", errorHandler(getSubcategory));
subcategoryRoutes.post("/", errorHandler(createSubcategory));
subcategoryRoutes.put("/:id", errorHandler(updateSubcategory));
subcategoryRoutes.delete("/:id", errorHandler(deleteSubcategory));
subcategoryRoutes.post("/pagination", errorHandler(paginatedData));

export default subcategoryRoutes;
