import express from "express";
import { ClientController } from "../controller/client.controller.js";
import multer from "multer";

const clientRoutes = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 2 * 1024 * 1024, // 2MB limit
  // },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG and WebP files are allowed."
        )
      );
    }
  },
});

// Configure multiple file uploads for SellerRegistration
const SellerRegUp = upload.fields([{ name: "logo", maxCount: 1 }]);

// Add this route for fetching orders
clientRoutes.get("/order-history", ClientController.getOrders);
// Categories
clientRoutes.get("/categories", ClientController.getCategories);
clientRoutes.get(
  "/categories/featured",
  ClientController.getFeaturedCategories
);

// Products
clientRoutes.get("/products/search", ClientController.searchProducts);
clientRoutes.get(
  "/products/related/:productId/:categoryId",
  ClientController.getRelatedProducts
);
clientRoutes.get("/products/:id", ClientController.getProductDetails);
clientRoutes.get("/products", ClientController.getProducts);

// Customer Addresses (Protected Routes)
clientRoutes.get(
  "/addresses",

  ClientController.getAddresses
);
clientRoutes.post(
  "/addresses",

  ClientController.createAddress
);
clientRoutes.put(
  "/addresses/:id",

  ClientController.updateAddress
);
clientRoutes.delete(
  "/addresses/:id",

  ClientController.deleteAddress
);

// SSLCommerz Routes
clientRoutes.post(
  "/orders/create-sslcommerz",
  ClientController.createSSLCommerzOrder
);

clientRoutes.post(
  "/orders/sslcommerz-success",
  ClientController.sslCommerzSuccess
);
clientRoutes.post("/orders/sslcommerz-fail", ClientController.sslCommerzFail);
clientRoutes.post(
  "/orders/sslcommerz-cancel",
  ClientController.sslCommerzCancel
);

// Add this route for updating COD payment status
clientRoutes.post(
  "/orders/cod-payment-confirm/:orderId",
  ClientController.confirmCodPayment
);

// Add this route
clientRoutes.post("/orders/create-cod", ClientController.createCodOrder);

// Wishlist
clientRoutes.get("/wishlist", ClientController.getWishlist);
clientRoutes.post("/wishlist", ClientController.addToWishlist);
clientRoutes.delete(
  "/wishlist/:productId",
  ClientController.removeFromWishlist
);

// Add this route for updating customer profile
clientRoutes.put("/profile", ClientController.updateProfile);

// Add this route for getting customer profile
clientRoutes.get("/profile", ClientController.getProfile);

// Add these routes
clientRoutes.get("/banners", ClientController.getBanners);
clientRoutes.get("/special-offers", ClientController.getSpecialOffers);
clientRoutes.get(
  "/featured-categories",
  ClientController.getFeaturedCategories
);
clientRoutes.get("/top-selling", ClientController.getTopSellingProducts);
clientRoutes.get("/trending", ClientController.getTrendingProducts);
clientRoutes.get("/recent", ClientController.getRecentProducts);
clientRoutes.get("/offered-products", ClientController.getOfferedProducts);

// Add this route
clientRoutes.post("/coupons/validate", ClientController.validateCoupon);

// Add this route
clientRoutes.get("/shipping-charges", ClientController.getShippingCharges);
clientRoutes.get("/coupon", ClientController.getCoupon);
clientRoutes.post(
  "/seller-reg",
  SellerRegUp,
  ClientController.SellerRegistration
);
clientRoutes.post("/submit-review", ClientController.SubmitReview);

// Add this route for getting company information
clientRoutes.get("/company-info", ClientController.getCompanyInfo);

// Add these routes
clientRoutes.get("/pages/:slug", ClientController.getPageBySlug);
clientRoutes.get("/faqs", ClientController.getFaqs);

export default clientRoutes;
