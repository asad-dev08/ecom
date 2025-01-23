import express from "express";
import multer from "multer";
import path from "path";
import { errorHandler } from "../handlers/errorHandler.js";
import {
  createNews,
  deleteNews,
  getNews,
  getNewsById,
  paginatedData,
  updateNews,
} from "../controller/news.controller.js";

const newsRoutes = express.Router();

// Configure multer storage and file filter
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed!"));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "gallery", maxCount: 50 },
]);

// Routes
newsRoutes.get("/", errorHandler(getNews));
newsRoutes.post("/", upload, errorHandler(createNews));
newsRoutes.put("/:id", upload, errorHandler(updateNews));
newsRoutes.delete("/:id", errorHandler(deleteNews));
newsRoutes.get("/:id", errorHandler(getNewsById));
newsRoutes.post("/pagination", errorHandler(paginatedData));

export default newsRoutes;
