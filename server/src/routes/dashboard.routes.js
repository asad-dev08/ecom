import express from "express";
import { getDashboardStats } from "../controller/dashboard.controller.js";
import { errorHandler } from "../handlers/errorHandler.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/stats", errorHandler(getDashboardStats));

export default dashboardRoutes;
