import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = "upload/categories";

const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${baseName}_${timestamp}_${random}${extension}`;
};

export const getCategories = async (req, res) => {
  const categories = await prismaClient.category.findMany({
    where: {
      company_id: req.user.is_admin ? {} : req.user.company_id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return HttpResponse.success(
    "Categories fetched successfully",
    categories
  ).send(res);
};

export const getCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prismaClient.category.findUnique({
      where: { id, company_id: req.user.company_id },
    });

    if (!category) {
      return HttpResponse.notFound("Category not found").send(res);
    }

    return HttpResponse.success("Category fetched successfully", category).send(
      res
    );
  } catch (error) {
    return HttpResponse.internalError(
      "Failed to fetch category",
      error.message
    ).send(res);
  }
};

export const createCategory = async (req, res) => {
  try {
    const categoryData = JSON.parse(req.body.data);
    const { id, ...formattedData } = categoryData;

    const result = await prismaClient.$transaction(async (tx) => {
      let imageUrl = null;
      let iconUrl = null;

      // Handle image upload
      if (req.files?.image) {
        const image = req.files.image[0];
        const uniqueFileName = generateUniqueFileName(image.originalname);
        const imagePath = path.join(process.cwd(), UPLOAD_DIR, uniqueFileName);

        await fs.mkdir(path.join(process.cwd(), UPLOAD_DIR), {
          recursive: true,
        });
        await fs.writeFile(imagePath, image.buffer);
        imageUrl = `${UPLOAD_DIR}/${uniqueFileName}`;
      }

      // Handle icon upload
      if (req.files?.icon) {
        const icon = req.files.icon[0];
        const uniqueFileName = generateUniqueFileName(icon.originalname);
        const iconPath = path.join(process.cwd(), UPLOAD_DIR, uniqueFileName);

        await fs.mkdir(path.join(process.cwd(), UPLOAD_DIR), {
          recursive: true,
        });
        await fs.writeFile(iconPath, icon.buffer);
        iconUrl = `${UPLOAD_DIR}/${uniqueFileName}`;
      }

      // Check if slug already exists
      const existingCategory = await tx.category.findFirst({
        where: { slug: formattedData.slug },
      });

      if (existingCategory) {
        throw new Error("A category with this slug already exists");
      }

      const category = await tx.category.create({
        data: {
          ...formattedData,
          image: imageUrl,
          icon: iconUrl,
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
        },
      });

      await auditLog(
        "categories",
        category.id,
        "CREATE",
        null,
        category,
        req.user.id,
        req
      );

      return category;
    });

    return HttpResponse.created("Category created successfully", result).send(
      res
    );
  } catch (error) {
    // Delete uploaded files if there's an error
    if (req.files) {
      await deleteUploadedFiles(req.files);
    }
    if (error.message === "A category with this slug already exists") {
      return HttpResponse.conflict(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to create category",
      error.message
    ).send(res);
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const categoryData = JSON.parse(req.body.data);

    const result = await prismaClient.$transaction(async (tx) => {
      const existingCategory = await tx.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new Error("Category not found");
      }

      // Check if slug changed and already exists
      if (categoryData.slug !== existingCategory.slug) {
        const slugExists = await tx.category.findFirst({
          where: {
            slug: categoryData.slug,
            id: { not: id },
          },
        });

        if (slugExists) {
          throw new Error("A category with this slug already exists");
        }
      }

      let imageUrl = existingCategory.image;
      let iconUrl = existingCategory.icon;

      // Handle image upload
      if (req.files?.image) {
        // Delete old image if exists
        if (existingCategory.image) {
          try {
            await fs.unlink(path.join(process.cwd(), existingCategory.image));
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }

        const image = req.files.image[0];
        const uniqueFileName = generateUniqueFileName(image.originalname);
        const imagePath = path.join(process.cwd(), UPLOAD_DIR, uniqueFileName);
        await fs.writeFile(imagePath, image.buffer);
        imageUrl = `${UPLOAD_DIR}/${uniqueFileName}`;
      }

      // Handle icon upload
      if (req.files?.icon) {
        // Delete old icon if exists
        if (existingCategory.icon) {
          try {
            await fs.unlink(path.join(process.cwd(), existingCategory.icon));
          } catch (error) {
            console.error("Error deleting old icon:", error);
          }
        }

        const icon = req.files.icon[0];
        const uniqueFileName = generateUniqueFileName(icon.originalname);
        const iconPath = path.join(process.cwd(), UPLOAD_DIR, uniqueFileName);
        await fs.writeFile(iconPath, icon.buffer);
        iconUrl = `${UPLOAD_DIR}/${uniqueFileName}`;
      }

      const updatedCategory = await tx.category.update({
        where: { id },
        data: {
          ...categoryData,
          image: imageUrl,
          icon: iconUrl,
          updated_by: req.user.id,
          updated_ip: req.ip,
        },
      });

      await auditLog(
        "categories",
        id,
        "UPDATE",
        existingCategory,
        updatedCategory,
        req.user.id,
        req
      );

      return updatedCategory;
    });

    return HttpResponse.success("Category updated successfully", result).send(
      res
    );
  } catch (error) {
    if (error.message === "Category not found") {
      return HttpResponse.notFound(error.message).send(res);
    }
    if (error.message === "A category with this slug already exists") {
      return HttpResponse.conflict(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to update category",
      error.message
    ).send(res);
  }
};

// Utility function to delete uploaded files
const deleteUploadedFiles = async (files) => {
  try {
    for (const fileType in files) {
      for (const file of files[fileType]) {
        if (file && file.originalname) {
          const uniqueFileName = generateUniqueFileName(file.originalname);
          const filePath = path.join(process.cwd(), UPLOAD_DIR, uniqueFileName);
          try {
            await fs.unlink(filePath);
          } catch (unlinkError) {
            console.error(`Error deleting file ${filePath}:`, unlinkError);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in deleteUploadedFiles:", error);
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      // Check if category has related projects or news

      await tx.category.delete({
        where: { id },
      });

      await auditLog(
        "categories",
        id,
        "DELETE",
        category,
        null,
        req.user.id,
        req
      );

      return category;
    });

    return HttpResponse.success("Category deleted successfully").send(res);
  } catch (error) {
    if (error.message === "Category not found") {
      return HttpResponse.notFound("Category not found").send(res);
    }
    if (error.message.includes("associated projects or news")) {
      return HttpResponse.badRequest(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to delete category",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  try {
    const data = await getPaginatedData({
      model: "category",
      ...req.body,
    });
    return HttpResponse.success("Data fetched successfully", data).send(res);
  } catch (error) {
    return HttpResponse.internalError(
      "Failed to fetch paginated data",
      error.message
    ).send(res);
  }
};

export const getSubcategoriesByCategory = async (req, res) => {
  const { categoryId } = req.params;

  const data = await prismaClient.subcategory.findMany({
    where: {
      categoryId: categoryId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      // Add other fields you need
    },
  });

  return HttpResponse.success("Data fetched successfully", data).send(res);
};
