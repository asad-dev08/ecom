import express from "express";
import { errorHandler } from "../handlers/errorHandler.js";
import { getOrders, getOrderDetails } from "../controller/order.controller.js";

const orderRoutes = express.Router();

// Get all orders for the current customer
orderRoutes.get("/", errorHandler(getOrders));

// Get single order details
orderRoutes.get("/:id", errorHandler(getOrderDetails));

export default orderRoutes;
