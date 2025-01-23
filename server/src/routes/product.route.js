import express from "express";
import multer from "multer";
import path from "path";
import { validateRequest } from "../middleware/validateRequest.js";
import { productValidation } from "../validations/product.validation.js";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  getProductsForDropdown,
  paginatedData,
  updateProduct,
} from "../controller/product.controller.js";
import { errorHandler } from "../handlers/errorHandler.js";

const productRoutes = express.Router();

// Configure multer storage and file filter
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed!"));
};

// Configure multer upload
const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 5 * 1024 * 1024, // 5MB limit
  // },
  fileFilter: fileFilter,
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 10 }, // Allow up to 10 product images
  { name: "variantImages", maxCount: 20 }, // Add this line for variant images
]);

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "File size cannot be larger than 5MB",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        status: "error",
        message: "Too many files uploaded",
      });
    }
  }
  if (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
  next();
};

// Routes
productRoutes.get("/", errorHandler(getProducts));
productRoutes.get("/dropdown", errorHandler(getProductsForDropdown));

productRoutes.post(
  "/",
  upload,
  handleMulterError,
  // validateRequest(productValidation.create), // Uncomment after creating validation
  errorHandler(createProduct)
);

productRoutes.put(
  "/:id",
  upload,
  handleMulterError,
  // validateRequest(productValidation.update), // Uncomment after creating validation
  errorHandler(updateProduct)
);

productRoutes.delete(
  "/:id",
  // validateRequest(productValidation.delete), // Uncomment after creating validation
  errorHandler(deleteProduct)
);

productRoutes.get(
  "/:id",
  // validateRequest(productValidation.getById), // Uncomment after creating validation
  errorHandler(getProduct)
);

productRoutes.post("/pagination", errorHandler(paginatedData));

export default productRoutes;
