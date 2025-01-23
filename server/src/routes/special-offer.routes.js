import express from "express";
import { SpecialOfferController } from "../controller/special-offer.controller.js";
import multer from "multer";
import { errorHandler } from "../handlers/errorHandler.js";

const specialOfferRoutes = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
}).single("image");

// Special Offer routes
specialOfferRoutes.get(
  "/",
  errorHandler(SpecialOfferController.getSpecialOffers)
);
specialOfferRoutes.post(
  "/",
  upload,
  errorHandler(SpecialOfferController.createSpecialOffer)
);
specialOfferRoutes.put(
  "/:id",
  upload,
  errorHandler(SpecialOfferController.updateSpecialOffer)
);
specialOfferRoutes.delete(
  "/:id",
  errorHandler(SpecialOfferController.deleteSpecialOffer)
);
specialOfferRoutes.post(
  "/pagination",
  errorHandler(SpecialOfferController.getPaginatedSpecialOffers)
);
specialOfferRoutes.get(
  "/:id",
  errorHandler(SpecialOfferController.getSpecialOffer)
);

export default specialOfferRoutes;
