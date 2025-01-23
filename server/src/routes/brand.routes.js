import express from "express";
import {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  paginatedData,
} from "../controller/brand.controller.js";
import { errorHandler } from "../handlers/errorHandler.js";

const brandRoutes = express.Router();

brandRoutes.get("/", errorHandler(getBrands));
brandRoutes.get("/:id", errorHandler(getBrand));
brandRoutes.post("/", errorHandler(createBrand));
brandRoutes.put("/:id", errorHandler(updateBrand));
brandRoutes.delete("/:id", errorHandler(deleteBrand));
brandRoutes.post("/pagination", errorHandler(paginatedData));

export default brandRoutes;
