import { Router } from "express";
import { errorHandler } from "../handlers/errorHandler.js";
import { getMenus } from "../controller/menu.controller.js";

const menuRoutes = Router();

menuRoutes.get("/", errorHandler(getMenus));

export default menuRoutes;
