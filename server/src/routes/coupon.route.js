import express from "express";
import { errorHandler } from "../handlers/errorHandler.js";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCoupons,
  paginatedData,
  updateCoupon,
} from "../controller/coupon.controller.js";

const couponRoutes = express.Router();

// Get all coupons
couponRoutes.get("/", errorHandler(getCoupons));

// Get single coupon
couponRoutes.get("/:id", errorHandler(getCoupon));

// Create coupon
couponRoutes.post("/", errorHandler(createCoupon));

// Update coupon
couponRoutes.put("/:id", errorHandler(updateCoupon));

// Delete coupon
couponRoutes.delete("/:id", errorHandler(deleteCoupon));

// Paginated data
couponRoutes.post("/pagination", errorHandler(paginatedData));

export default couponRoutes;
