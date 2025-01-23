import express from "express";
import multer from "multer";
import path from "path";
import { validateRequest } from "../middleware/validateRequest.js";
import { projectValidation } from "../validations/project.validation.js";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  paginatedData,
  updateProject,
} from "../controller/project.controller.js";
import { errorHandler } from "../handlers/errorHandler.js";

const projectRoutes = express.Router();

// Configure multer storage and file filter
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  // Accept images only
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

// Configure multer upload
const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 5 * 1024 * 1024, // 5MB limit
  // },
  fileFilter: fileFilter,
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "gallery", maxCount: 50 },
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
projectRoutes.get("/", errorHandler(getProjects));

projectRoutes.post("/", upload, errorHandler(createProject));

projectRoutes.put("/:id", upload, errorHandler(updateProject));

projectRoutes.delete("/:id", errorHandler(deleteProject));

projectRoutes.get("/:id", errorHandler(getProject));

projectRoutes.post("/pagination", errorHandler(paginatedData));

export default projectRoutes;
