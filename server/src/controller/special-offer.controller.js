import { prismaClient } from "../index.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";
import { uploadImage } from "../utils/uploadImage.js";
import { auditLog } from "../utils/audit.js";
import { logError } from "../utils/logger.js";
import fs from "fs/promises";
import path from "path";

export class SpecialOfferController {
  static async getSpecialOffers(req, res) {
    try {
      const offers = await prismaClient.specialOffer.findMany({
        include: {
          products: true,
        },
      });
      return HttpResponse.success(
        "Special offers retrieved successfully",
        offers
      ).send(res);
    } catch (error) {
      logError("Error fetching special offers", error);
      return HttpResponse.internalError("Failed to fetch special offers").send(
        res
      );
    }
  }

  static async createSpecialOffer(req, res) {
    try {
      const {
        title,
        subtitle,
        discount,
        start_date,
        end_date,
        is_active,
        productIds,
      } = req.body;

      let imageUrl = null;
      if (req.file) {
        imageUrl = await uploadImage(req.file, "special-offers");
      }

      const parsedProductIds = productIds ? JSON.parse(productIds) : [];
      const productsConnect =
        parsedProductIds.length > 0
          ? { connect: parsedProductIds.map((id) => ({ id })) }
          : undefined;

      const offer = await prismaClient.specialOffer.create({
        data: {
          title,
          subtitle,
          image: imageUrl,
          discount: parseFloat(discount),
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          is_active: is_active === true || is_active === "true",
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
          products: productsConnect,
        },
        include: {
          products: true,
        },
      });

      await auditLog(
        "special_offers",
        offer.id,
        "CREATE",
        null,
        offer,
        req.user.id,
        req
      );

      return HttpResponse.created(
        "Special offer created successfully",
        offer
      ).send(res);
    } catch (error) {
      logError("Error creating special offer", error);
      return HttpResponse.internalError("Failed to create special offer").send(
        res
      );
    }
  }

  static async updateSpecialOffer(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        subtitle,
        discount,
        start_date,
        end_date,
        is_active,
        productIds,
      } = req.body;

      const existingOffer = await prismaClient.specialOffer.findUnique({
        where: { id },
        include: { products: true },
      });

      if (!existingOffer) {
        return HttpResponse.notFound("Special offer not found").send(res);
      }

      let imageUrl = existingOffer.image;
      if (req.file) {
        if (existingOffer.image) {
          const oldImagePath = path.join(process.cwd(), existingOffer.image);
          await fs.unlink(oldImagePath).catch(() => {});
        }
        imageUrl = await uploadImage(req.file, "special-offers");
      }

      const parsedProductIds = productIds ? JSON.parse(productIds) : [];
      const productsSet =
        parsedProductIds.length > 0
          ? { set: parsedProductIds.map((id) => ({ id })) }
          : { set: [] };

      const updatedOffer = await prismaClient.$transaction(async (tx) => {
        const offer = await tx.specialOffer.update({
          where: { id },
          data: {
            title,
            subtitle,
            image: imageUrl,
            discount: parseFloat(discount),
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            is_active: is_active === true || is_active === "true",
            updated_by: req.user.id,
            updated_ip: req.ip,
            products: productsSet,
          },
          include: {
            products: true,
          },
        });

        if (existingOffer.is_active && !offer.is_active) {
          const affectedProductIds = existingOffer.products.map((p) => p.id);

          if (affectedProductIds.length > 0) {
            await tx.product.updateMany({
              where: {
                id: {
                  in: affectedProductIds,
                },
                company_id: existingOffer.company_id,
              },
              data: {
                specialOfferId: null,
                updated_at: new Date(),
                updated_by: req.user.id,
                updated_ip: req.ip,
              },
            });
          }
        }

        return offer;
      });

      await auditLog(
        "special_offers",
        id,
        "UPDATE",
        existingOffer,
        updatedOffer,
        req.user.id,
        req
      );

      return HttpResponse.success(
        "Special offer updated successfully",
        updatedOffer
      ).send(res);
    } catch (error) {
      logError("Error updating special offer", error);
      return HttpResponse.internalError("Failed to update special offer").send(
        res
      );
    }
  }

  static async deleteSpecialOffer(req, res) {
    try {
      const { id } = req.params;

      const offer = await prismaClient.specialOffer.findUnique({
        where: { id },
      });

      if (!offer) {
        return HttpResponse.notFound("Special offer not found").send(res);
      }

      if (offer.image) {
        const imagePath = path.join(process.cwd(), offer.image);
        await fs.unlink(imagePath).catch(() => {});
      }

      await prismaClient.specialOffer.delete({
        where: { id },
      });

      await auditLog(
        "special_offers",
        id,
        "DELETE",
        offer,
        null,
        req.user.id,
        req
      );

      return HttpResponse.success("Special offer deleted successfully").send(
        res
      );
    } catch (error) {
      logError("Error deleting special offer", error);
      return HttpResponse.internalError("Failed to delete special offer").send(
        res
      );
    }
  }

  static async getPaginatedSpecialOffers(req, res) {
    try {
      const data = await getPaginatedData({
        model: "specialOffer",
        ...req.body,
        include: {
          products: true,
        },
      });
      return HttpResponse.success(
        "Special offers retrieved successfully",
        data
      ).send(res);
    } catch (error) {
      logError("Error fetching paginated special offers", error);
      return HttpResponse.internalError("Failed to fetch special offers").send(
        res
      );
    }
  }

  static async getSpecialOffer(req, res) {
    try {
      const { id } = req.params;
      const offer = await prismaClient.specialOffer.findUnique({
        where: { id },
        include: { products: true },
      });

      if (!offer) {
        return HttpResponse.notFound("Special offer not found").send(res);
      }

      return HttpResponse.success(
        "Special offer retrieved successfully",
        offer
      ).send(res);
    } catch (error) {
      logError("Error fetching special offer", error);
      return HttpResponse.internalError("Failed to fetch special offer").send(
        res
      );
    }
  }
}
