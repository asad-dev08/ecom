import express from "express";
import { CustomerDashboardService } from "../services/customerDashboard.service.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { verifyCustomerToken } from "../middleware/customerAuth.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/", verifyCustomerToken, async (req, res) => {
  try {
    const customerId = req.customer.id;
    const dashboardData = await CustomerDashboardService.getDashboardData(
      customerId
    );
    return HttpResponse.success(
      "Dashboard data retrieved successfully",
      dashboardData
    ).send(res);
  } catch (error) {
    console.log("error: ", error);
    return HttpResponse.internalError("Failed to fetch dashboard data").send(
      res
    );
  }
});

export default dashboardRoutes;
