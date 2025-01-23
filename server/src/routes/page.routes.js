import express from "express";
import {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  paginatedData,
  getPageSections,
  createPageSection,
  updatePageSection,
  deletePageSection,
} from "../controller/page.controller.js";
import { errorHandler } from "../handlers/errorHandler.js";

const pageRoutes = express.Router();

// Page routes
pageRoutes.get("/", errorHandler(getPages));
pageRoutes.get("/:id", errorHandler(getPage));
pageRoutes.post("/", errorHandler(createPage));
pageRoutes.put("/:id", errorHandler(updatePage));
pageRoutes.delete("/:id", errorHandler(deletePage));
pageRoutes.post("/pagination", errorHandler(paginatedData));

// Page section routes
pageRoutes.get("/:pageId/sections", errorHandler(getPageSections));
pageRoutes.post("/:pageId/sections", errorHandler(createPageSection));
pageRoutes.put("/:pageId/sections/:sectionId", errorHandler(updatePageSection));
pageRoutes.delete(
  "/:pageId/sections/:sectionId",
  errorHandler(deletePageSection)
);

export default pageRoutes;
