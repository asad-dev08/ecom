import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = "upload/news";

const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${baseName}_${timestamp}_${random}${extension}`;
};

export const getNews = async (req, res) => {
  const news = await prismaClient.news.findMany({
    include: {
      gallery: true,
      category: true,
    },
  });

  return HttpResponse.success("News fetched successfully", news).send(res);
};

export const getNewsById = async (req, res) => {
  const { id } = req.params;
  const news = await prismaClient.news.findUnique({
    where: { id },
    include: {
      gallery: true,
      category: true,
    },
  });

  if (!news) {
    return HttpResponse.notFound("News not found").send(res);
  }

  return HttpResponse.success("News fetched successfully", news).send(res);
};

export const createNews = async (req, res) => {
  try {
    const newsData = JSON.parse(req.body.data);
    const { id, gallery, ...formattedData } = newsData;

    const result = await prismaClient.$transaction(async (tx) => {
      let thumbnailUrl = newsData.thumbnail_url || null;

      // Handle thumbnail upload
      if (req.files?.thumbnail) {
        const thumbnail = req.files.thumbnail[0];
        const uniqueFileName = generateUniqueFileName(thumbnail.originalname);
        const thumbnailPath = path.join(
          process.cwd(),
          UPLOAD_DIR,
          uniqueFileName
        );

        await fs.mkdir(path.join(process.cwd(), UPLOAD_DIR), {
          recursive: true,
        });
        await fs.writeFile(thumbnailPath, thumbnail.buffer);
        thumbnailUrl = `${UPLOAD_DIR}/${uniqueFileName}`;
      }

      // Handle gallery images
      const galleryCreate = [];
      if (newsData.gallery) {
        const newGalleryItems = newsData.gallery.filter(
          (item) => !item.isDeleted
        );

        for (let i = 0; i < newGalleryItems.length; i++) {
          const item = newGalleryItems[i];
          const file = req.files?.gallery?.[i];

          if (file) {
            const uniqueFileName = generateUniqueFileName(file.originalname);
            const filePath = path.join(
              process.cwd(),
              UPLOAD_DIR,
              uniqueFileName
            );
            await fs.writeFile(filePath, file.buffer);

            galleryCreate.push({
              image_url: `${UPLOAD_DIR}/${uniqueFileName}`,
              title: item.title,
              subtitle: item.subtitle,
              sequence_no: item.sequence_no || i + 1,
              created_by: req.user.id,
              created_ip: req.ip,
              company_id: req.user.company_id,
            });
          }
        }
      }

      const news = await tx.news.create({
        data: {
          ...formattedData,
          thumbnail_url: thumbnailUrl,
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
          gallery: {
            create: galleryCreate,
          },
        },
        include: {
          gallery: true,
          category: true,
        },
      });

      await auditLog("news", news.id, "CREATE", null, news, req.user.id, req);

      return news;
    });

    return HttpResponse.success("News created successfully", result).send(res);
  } catch (error) {
    console.error("Create news error:", error);
    return HttpResponse.internalError(
      "Failed to create news",
      error.message
    ).send(res);
  }
};

export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const newsData = JSON.parse(req.body.data);

    const result = await prismaClient.$transaction(async (tx) => {
      const existingNews = await tx.news.findUnique({
        where: { id },
        include: {
          gallery: true,
        },
      });

      if (!existingNews) {
        throw new Error(`News not found with ID: ${id}`);
      }

      let thumbnailUrl = existingNews.thumbnail_url;

      // Handle thumbnail update
      if (req.files?.thumbnail) {
        if (existingNews.thumbnail_url) {
          try {
            await fs.unlink(
              path.join(process.cwd(), existingNews.thumbnail_url)
            );
          } catch (error) {
            console.error("Error deleting old thumbnail:", error);
          }
        }

        const thumbnail = req.files.thumbnail[0];
        const uniqueFileName = generateUniqueFileName(thumbnail.originalname);
        const thumbnailPath = path.join(
          process.cwd(),
          UPLOAD_DIR,
          uniqueFileName
        );
        await fs.writeFile(thumbnailPath, thumbnail.buffer);
        thumbnailUrl = `${UPLOAD_DIR}/${uniqueFileName}`;
      }

      const { gallery, ...restData } = newsData;

      // Handle deleted gallery images
      const deletedGalleryItems =
        newsData.gallery?.filter((item) => item.id && item.isDeleted) || [];

      for (const deletedItem of deletedGalleryItems) {
        const existingGalleryItem = existingNews.gallery.find(
          (g) => g.id === deletedItem.id
        );
        if (existingGalleryItem?.image_url) {
          try {
            await fs.unlink(
              path.join(process.cwd(), existingGalleryItem.image_url)
            );
          } catch (error) {
            console.error(
              `Error deleting gallery image: ${existingGalleryItem.image_url}`,
              error
            );
          }
        }
      }

      // Handle new gallery images
      const galleryCreate = [];
      const newGalleryItems =
        newsData.gallery?.filter((item) => !item.id && !item.isDeleted) || [];

      for (let i = 0; i < newGalleryItems.length; i++) {
        const item = newGalleryItems[i];
        const file = req.files?.gallery?.[i];

        if (file) {
          const uniqueFileName = generateUniqueFileName(file.originalname);
          const filePath = path.join(process.cwd(), UPLOAD_DIR, uniqueFileName);
          await fs.writeFile(filePath, file.buffer);

          galleryCreate.push({
            image_url: `${UPLOAD_DIR}/${uniqueFileName}`,
            title: item.title,
            subtitle: item.subtitle,
            sequence_no: item.sequence_no || i + 1,
            created_by: req.user?.id,
            created_ip: req.ip,
            company_id: req.user?.company_id,
          });
        }
      }

      const updatedNews = await tx.news.update({
        where: { id },
        data: {
          ...restData,
          thumbnail_url: thumbnailUrl,
          updated_by: req.user?.id,
          updated_ip: req.ip,
          gallery: {
            deleteMany: {
              id: {
                in: deletedGalleryItems.map((item) => item.id),
              },
            },
            create: galleryCreate,
            update:
              newsData.gallery
                ?.filter((item) => item.id && !item.isDeleted)
                ?.map((item) => ({
                  where: { id: item.id },
                  data: {
                    title: item.title,
                    subtitle: item.subtitle,
                    sequence_no: item.sequence_no,
                    updated_by: req.user?.id,
                    updated_ip: req.ip,
                  },
                })) || [],
          },
        },
        include: {
          gallery: true,
          category: true,
        },
      });

      return updatedNews;
    });

    return HttpResponse.success("News updated successfully", result).send(res);
  } catch (error) {
    console.error("Update news error:", error);
    if (error.message.includes("News not found")) {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to update news",
      error.message
    ).send(res);
  }
};

export const deleteNews = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const news = await tx.news.findUnique({
        where: { id },
        include: {
          gallery: true,
        },
      });

      if (!news) {
        throw new Error("News not found");
      }

      // Delete thumbnail
      if (news.thumbnail_url) {
        await fs.unlink(path.join(process.cwd(), news.thumbnail_url));
      }

      // Delete gallery images
      for (const gallery of news.gallery) {
        await fs.unlink(path.join(process.cwd(), gallery.image_url));
      }

      await tx.news.delete({
        where: { id },
      });

      await auditLog("news", id, "DELETE", news, null, req.user.id, req);
      return news;
    });

    return HttpResponse.success("News deleted successfully").send(res);
  } catch (error) {
    if (error.message === "News not found") {
      return HttpResponse.notFound("News not found").send(res);
    }
    return HttpResponse.internalError(
      "Failed to delete news",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "news",
    ...req.body,
    include: {
      gallery: true,
      category: true,
    },
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
};
