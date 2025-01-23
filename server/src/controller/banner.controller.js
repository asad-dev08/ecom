import { prismaClient } from "../index.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";
import { uploadImage } from "../utils/uploadImage.js";
import { auditLog } from "../utils/audit.js";
import { logError } from "../utils/logger.js";
import fs from "fs/promises";
import path from "path";

export class BannerController {
  static async getBanners(req, res) {
    try {
      const banners = await prismaClient.banner.findMany({
        orderBy: { sequence_no: 'asc' }
      });
      return HttpResponse.success("Banners retrieved successfully", banners).send(res);
    } catch (error) {
      logError("Error fetching banners", error);
      return HttpResponse.internalError("Failed to fetch banners").send(res);
    }
  }

  static async createBanner(req, res) {
    try {
      const { title, subtitle, link, type, sequence_no, is_active, start_date, end_date } = req.body;
      
      let imageUrl = null;
      if (req.file) {
        imageUrl = await uploadImage(req.file, 'banners');
      }

      const banner = await prismaClient.banner.create({
        data: {
          title,
          subtitle,
          image: imageUrl,
          link,
          type,
          sequence_no: parseInt(sequence_no) || 0,
          is_active: is_active === 'true',
          start_date: start_date ? new Date(start_date) : null,
          end_date: end_date ? new Date(end_date) : null,
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
        }
      });

      await auditLog('banners', banner.id, 'CREATE', null, banner, req.user.id, req);

      return HttpResponse.created("Banner created successfully", banner).send(res);
    } catch (error) {
      logError("Error creating banner", error);
      return HttpResponse.internalError("Failed to create banner").send(res);
    }
  }

  static async updateBanner(req, res) {
    try {
      const { id } = req.params;
      const { title, subtitle, link, type, sequence_no, is_active, start_date, end_date } = req.body;

      const existingBanner = await prismaClient.banner.findUnique({
        where: { id }
      });

      if (!existingBanner) {
        return HttpResponse.notFound("Banner not found").send(res);
      }

      let imageUrl = existingBanner.image;
      if (req.file) {
        // Delete old image if exists
        if (existingBanner.image) {
          const oldImagePath = path.join(process.cwd(), existingBanner.image);
          await fs.unlink(oldImagePath).catch(() => {});
        }
        imageUrl = await uploadImage(req.file, 'banners');
      }

      const updatedBanner = await prismaClient.banner.update({
        where: { id },
        data: {
          title,
          subtitle,
          image: imageUrl,
          link,
          type,
          sequence_no: parseInt(sequence_no) || 0,
          is_active: is_active === 'true',
          start_date: start_date ? new Date(start_date) : null,
          end_date: end_date ? new Date(end_date) : null,
          updated_by: req.user.id,
          updated_ip: req.ip,
        }
      });

      await auditLog('banners', id, 'UPDATE', existingBanner, updatedBanner, req.user.id, req);

      return HttpResponse.success("Banner updated successfully", updatedBanner).send(res);
    } catch (error) {
      logError("Error updating banner", error);
      return HttpResponse.internalError("Failed to update banner").send(res);
    }
  }

  static async deleteBanner(req, res) {
    try {
      const { id } = req.params;

      const banner = await prismaClient.banner.findUnique({
        where: { id }
      });

      if (!banner) {
        return HttpResponse.notFound("Banner not found").send(res);
      }

      // Delete image file if exists
      if (banner.image) {
        const imagePath = path.join(process.cwd(), banner.image);
        await fs.unlink(imagePath).catch(() => {});
      }

      await prismaClient.banner.delete({
        where: { id }
      });

      await auditLog('banners', id, 'DELETE', banner, null, req.user.id, req);

      return HttpResponse.success("Banner deleted successfully").send(res);
    } catch (error) {
      logError("Error deleting banner", error);
      return HttpResponse.internalError("Failed to delete banner").send(res);
    }
  }

  static async getPaginatedBanners(req, res) {
    try {
      const data = await getPaginatedData({
        model: "banner",
        ...req.body,
        orderBy: { sequence_no: 'asc' }
      });
      return HttpResponse.success("Banners retrieved successfully", data).send(res);
    } catch (error) {
      logError("Error fetching paginated banners", error);
      return HttpResponse.internalError("Failed to fetch banners").send(res);
    }
  }

  static async getBanner(req, res) {
    try {
      const { id } = req.params;
      const banner = await prismaClient.banner.findUnique({
        where: { id },
      });

      if (!banner) {
        return HttpResponse.notFound("Banner not found").send(res);
      }

      return HttpResponse.success("Banner retrieved successfully", banner).send(res);
    } catch (error) {
      logError("Error fetching banner", error);
      return HttpResponse.internalError("Failed to fetch banner").send(res);
    }
  }
} 