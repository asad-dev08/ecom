import express from "express";
import {
  getUserSettings,
  updateUserSettings,
} from "../controller/userSettings.controller.js";

const settingsRoutes = express.Router();

settingsRoutes.get(
  "/",

  getUserSettings
);
settingsRoutes.post(
  "/",

  updateUserSettings
);

export default settingsRoutes;
