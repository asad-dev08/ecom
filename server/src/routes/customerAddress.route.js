import express from "express";
import { errorHandler } from "../handlers/errorHandler.js";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controller/customerAddress.controller.js";
import { customerAuthMiddleware } from "../middleware/auth.js";

const customerAddressRoutes = express.Router();

// Apply customer auth middleware to all routes
customerAddressRoutes.use(customerAuthMiddleware);

// Get all addresses for the customer
customerAddressRoutes.get("/", errorHandler(getAddresses));

// Create new address
customerAddressRoutes.post("/", errorHandler(createAddress));

// Update address
customerAddressRoutes.put("/:id", errorHandler(updateAddress));

// Delete address
customerAddressRoutes.delete("/:id", errorHandler(deleteAddress));

export default customerAddressRoutes;
