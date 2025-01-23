import express from "express";
import { errorHandler } from "../handlers/errorHandler.js";
import {
  checkAvailableUsername,
  createUser,
  deleteUser,
  getUser,
  getUsers,
  paginatedData,
  updateUser,
} from "../controller/user.controller.js";
const userRoutes = express.Router();

userRoutes.get("/", errorHandler(getUsers));
userRoutes.post("/", errorHandler(createUser));
userRoutes.post(
  "/check-available-username",
  errorHandler(checkAvailableUsername)
);
userRoutes.put("/:id", errorHandler(updateUser));
userRoutes.delete("/:id", errorHandler(deleteUser));
userRoutes.get("/:id", errorHandler(getUser));
userRoutes.post("/pagination", errorHandler(paginatedData));

export default userRoutes;
