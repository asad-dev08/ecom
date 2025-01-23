import express from "express";
import { BannerController } from "../controller/banner.controller.js";
import multer from "multer";
import { errorHandler } from "../handlers/errorHandler.js";

const bannerRoutes = express.Router();

// Configure multer for banner image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
}).single('image');

// Banner routes
bannerRoutes.get("/", errorHandler(BannerController.getBanners));
bannerRoutes.post("/", upload, errorHandler(BannerController.createBanner));
bannerRoutes.put("/:id", upload, errorHandler(BannerController.updateBanner));
bannerRoutes.delete("/:id", errorHandler(BannerController.deleteBanner));
bannerRoutes.post("/pagination", errorHandler(BannerController.getPaginatedBanners));
bannerRoutes.get("/:id", BannerController.getBanner);

export default bannerRoutes; 