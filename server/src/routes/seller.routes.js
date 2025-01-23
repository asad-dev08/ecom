import express from "express";
import multer from "multer";
import {
  getSellers,
  getSeller,
  createSeller,
  updateSeller,
  deleteSeller,
  paginatedData,
  updateSellerVerification,
} from "../controller/seller.controller.js";
import { errorHandler } from "../handlers/errorHandler.js";

const sellerRoutes = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
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

sellerRoutes.get("/", errorHandler(getSellers));
sellerRoutes.get("/:id", errorHandler(getSeller));
sellerRoutes.post(
  "/",

  upload.fields([{ name: "logo", maxCount: 1 }]),
  createSeller
);
sellerRoutes.put(
  "/:id",

  upload.fields([{ name: "logo", maxCount: 1 }]),
  errorHandler(updateSeller)
);
sellerRoutes.delete("/:id", errorHandler(deleteSeller));
sellerRoutes.post("/pagination", errorHandler(paginatedData));
sellerRoutes.post("/:id/verify", errorHandler(updateSellerVerification));

// Error handling middleware for multer
sellerRoutes.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
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

export default sellerRoutes;
