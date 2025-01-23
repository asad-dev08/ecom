import express from "express";
import multer from "multer";
import { validateRequest } from "../middleware/validateRequest.js";
import { categoryValidation } from "../validations/category.validation.js";
import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategories,
  paginatedData,
  updateCategory,
  getSubcategoriesByCategory,
} from "../controller/category.controller.js";
import { errorHandler } from "../handlers/errorHandler.js";
import path from "path";

const categoryRoutes = express.Router();

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

// Configure multiple file uploads for category
const categoryUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
]);

// Get all categories
categoryRoutes.get("/", errorHandler(getCategories));

// Get single category
categoryRoutes.get("/:id", errorHandler(getCategory));

// Create category with file upload
categoryRoutes.post(
  "/",
  categoryUpload,
  //validateRequest(categoryValidation.create),
  errorHandler(createCategory)
);

// Update category with file upload
categoryRoutes.put(
  "/:id",
  categoryUpload,
  //validateRequest(categoryValidation.update),
  errorHandler(updateCategory)
);

// Delete category
categoryRoutes.delete("/:id", errorHandler(deleteCategory));

// Paginated data
categoryRoutes.post("/pagination", errorHandler(paginatedData));

// Get subcategories by category ID
categoryRoutes.get("/:categoryId/subcategories", getSubcategoriesByCategory);

// Error handling middleware for multer
categoryRoutes.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    // if (error.code === "LIMIT_FILE_SIZE") {
    //   return res.status(400).json({
    //     message: "File size too large. Maximum size is 2MB",
    //   });
    // }
    return res.status(400).json({
      message: error.message,
    });
  }

  if (
    error.message ===
    "Invalid file type. Only JPEG, PNG and WebP files are allowed."
  ) {
    return res.status(400).json({
      message: error.message,
    });
  }

  next(error);
});

export default categoryRoutes;
