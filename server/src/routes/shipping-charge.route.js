import express from "express";
import { errorHandler } from "../handlers/errorHandler.js";
import {
  createShippingCharge,
  deleteShippingCharge,
  getShippingCharge,
  getShippingCharges,
  paginatedData,
  updateShippingCharge,
} from "../controller/shipping-charge.controller.js";

const shippingChargeRoutes = express.Router();

// Get all shipping charges
shippingChargeRoutes.get("/", errorHandler(getShippingCharges));

// Get single shipping charge
shippingChargeRoutes.get("/:id", errorHandler(getShippingCharge));

// Create shipping charge
shippingChargeRoutes.post("/", errorHandler(createShippingCharge));

// Update shipping charge
shippingChargeRoutes.put("/:id", errorHandler(updateShippingCharge));

// Delete shipping charge
shippingChargeRoutes.delete("/:id", errorHandler(deleteShippingCharge));

// Paginated data
shippingChargeRoutes.post("/pagination", errorHandler(paginatedData));

export default shippingChargeRoutes; 