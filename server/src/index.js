import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createNamespace } from "cls-hooked";

import path from "path";
import { config } from "./config/index.js";
import authRoutes from "./routes/auth.routes.js";
import logger from "./utils/logger.js";
import { PrismaClient } from "@prisma/client";
import userRoutes from "./routes/user.route.js";
import { verifyToken } from "./middleware/auth.js";
import companyRoutes from "./routes/company.route.js";
import securityGroupRoutes from "./routes/security-group.route.js";
import securityRuleRoutes from "./routes/security-rule.route.js";
import menuRoutes from "./routes/menu.route.js";
import projectRoutes from "./routes/project.route.js";
import categoryRoutes from "./routes/category.route.js";
import newsRoutes from "./routes/news.route.js";
import productRoutes from "./routes/product.route.js";
import brandRoutes from "./routes/brand.routes.js";
import subcategoryRoutes from "./routes/subcategory.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import orderRoutes from "./routes/order.route.js";
import settingsRoutes from "./routes/userSettings.routes.js";
import customerAuthRoutes from "./routes/customerAuth.routes.js";
import customerDashboardRoutes from "./routes/customerDashboard.routes.js";
import clientRoutes from "./routes/client.routes.js";
import { verifyCustomerToken } from "./middleware/customerAuth.js";
import bannerRoutes from "./routes/banner.routes.js";
import specialOfferRoutes from "./routes/special-offer.routes.js";
import couponRoutes from "./routes/coupon.route.js";
import shippingChargeRoutes from "./routes/shipping-charge.route.js";
import pageRoutes from "./routes/page.routes.js";

const CONTEXT_PATH = "api";
const ADMIN_CONTEXT_PATH = "admin";
const CUSTOMER_CONTEXT_PATH = "customer";
const app = express();
const namespace = createNamespace("app");

// Middleware order is important!
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

// Add namespace middleware BEFORE verifyToken
app.use((req, res, next) => {
  namespace.run(() => {
    next();
  });
});

// Middleware for admin routes
app.use(`/${CONTEXT_PATH}/admin/*`, (req, res, next) => {
  if (req._parsedUrl.pathname.startsWith(`/${CONTEXT_PATH}/admin/auth`)) {
    return next();
  }
  verifyToken(req, res, () => {
    namespace.set("user", req.user);
    next();
  });
});

// Middleware for customer routes
app.use(`/${CONTEXT_PATH}/customer/*`, (req, res, next) => {
  if (
    req._parsedUrl.pathname.startsWith(`/${CONTEXT_PATH}/customer/auth`) ||
    req._parsedUrl.pathname.startsWith(`/${CONTEXT_PATH}/customer/products`) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/orders/sslcommerz-success`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/orders/sslcommerz-fail`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/orders/sslcommerz-cancel`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/orders/sslcommerz-ipn`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/categories`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/special-offers`
    ) ||
    req._parsedUrl.pathname.startsWith(`/${CONTEXT_PATH}/customer/banners`) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/featured-categories`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/top-selling`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/special-offers`
    ) ||
    req._parsedUrl.pathname.startsWith(`/${CONTEXT_PATH}/customer/recent`) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/offered-products`
    ) ||
    req._parsedUrl.pathname.startsWith(`/${CONTEXT_PATH}/customer/coupon`) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/seller-reg`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/submit-review`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/orders/create-cod`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/orders/create-sslcommerz`
    ) ||
    req._parsedUrl.pathname.startsWith(
      `/${CONTEXT_PATH}/customer/company-info`
    ) ||
    req._parsedUrl.pathname.startsWith(`/${CONTEXT_PATH}/customer/pages`) ||
    req._parsedUrl.pathname.startsWith(`/${CONTEXT_PATH}/customer/faqs`)
  ) {
    if (
      req._parsedUrl.pathname.startsWith(
        `/${CONTEXT_PATH}/customer/submit-review`
      ) ||
      req._parsedUrl.pathname.startsWith(
        `/${CONTEXT_PATH}/customer/orders/create-cod`
      ) ||
      req._parsedUrl.pathname.startsWith(
        `/${CONTEXT_PATH}/customer/orders/create-sslcommerz`
      )
    ) {
      const token = req.headers.authorization?.split(" ")[1];

      if (token) {
        try {
          verifyCustomerToken(req, res, () => {
            namespace.set("customer", req.customer);
            next();
          });
        } catch (error) {
          next();
        }
      } else {
        next();
      }
    } else {
      return next();
    }
    return;
  }
  verifyCustomerToken(req, res, () => {
    namespace.set("customer", req.customer);
    next();
  });
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// Define routes WITHOUT verifyToken since we're handling it above
app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/auth`, authRoutes);
app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/users`, userRoutes);
app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/companies`, companyRoutes);
app.use(
  `/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/security-groups`,
  securityGroupRoutes
);
app.use(
  `/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/security-rules`,
  securityRuleRoutes
);
app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/menus`, menuRoutes);
app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/projects`, projectRoutes);
app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/category`, categoryRoutes);
app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/products`, productRoutes);
app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/brands`, brandRoutes);
app.use(
  `/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/subcategories`,
  subcategoryRoutes
);
app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/sellers`, sellerRoutes);

app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/dashboard`, dashboardRoutes);

app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/banners`, bannerRoutes);
app.use(
  `/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/special-offers`,
  specialOfferRoutes
);
app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/user-settings`, settingsRoutes);

app.use(`/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/coupons`, couponRoutes);

app.use(
  `/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/shipping-charges`,
  shippingChargeRoutes
);
app.use(
  `/${CONTEXT_PATH}/${ADMIN_CONTEXT_PATH}/pages`,
  pageRoutes
);

app.use(`/${CONTEXT_PATH}/${CUSTOMER_CONTEXT_PATH}/orders`, orderRoutes);
// app.use(
//   `/${CONTEXT_PATH}/${CUSTOMER_CONTEXT_PATH}/user-settings`,
//   settingsRoutes
// );
app.use(`/${CONTEXT_PATH}/${CUSTOMER_CONTEXT_PATH}/auth`, customerAuthRoutes);
app.use(
  `/${CONTEXT_PATH}/${CUSTOMER_CONTEXT_PATH}/dashboard`,
  customerDashboardRoutes
);
app.use(
  `/${CONTEXT_PATH}/${CUSTOMER_CONTEXT_PATH}/customer-dashboard`,
  customerDashboardRoutes
);
app.use(`/${CONTEXT_PATH}/${CUSTOMER_CONTEXT_PATH}/`, clientRoutes);

export const prismaClient = new PrismaClient({
  log: ["query"],
});

app.use(express.static("uploads"));
app.use(
  "/upload",
  express.static(path.join(process.cwd(), "upload"), {
    setHeaders: (res, path) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);
// Error handling
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ message: "Internal server error" });
});

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
