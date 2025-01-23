import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";

export const getSubcategories = async (req, res) => {
  const subcategories = await prismaClient.subcategory.findMany({
    include: {
      category: true,
      products: true,
    },
  });

  return HttpResponse.success(
    "Subcategories fetched successfully",
    subcategories
  ).send(res);
};

export const getSubcategory = async (req, res) => {
  const { id } = req.params;
  const subcategory = await prismaClient.subcategory.findUnique({
    where: { id },
    include: {
      category: true,
      products: true,
    },
  });

  if (!subcategory) {
    return HttpResponse.notFound("Subcategory not found").send(res);
  }

  return HttpResponse.success(
    "Subcategory fetched successfully",
    subcategory
  ).send(res);
};

export const createSubcategory = async (req, res) => {
  try {
    const { id, products, ...subcategoryData } = req.body;

    const result = await prismaClient.$transaction(async (tx) => {
      const subcategory = await tx.subcategory.create({
        data: {
          ...subcategoryData,
          productCount: 0,
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
        },
        include: {
          category: true,
        },
      });

      await auditLog(
        "subcategories",
        subcategory.id,
        "CREATE",
        null,
        subcategory,
        req.user.id,
        req
      );

      return subcategory;
    });

    return HttpResponse.created(
      "Subcategory created successfully",
      result
    ).send(res);
  } catch (error) {
    console.error("Create subcategory error:", error);
    return HttpResponse.internalError(
      "Failed to create subcategory",
      error.message
    ).send(res);
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { products, ...subcategoryData } = req.body;

    const result = await prismaClient.$transaction(async (tx) => {
      const existingSubcategory = await tx.subcategory.findUnique({
        where: { id },
      });

      if (!existingSubcategory) {
        throw new Error(`Subcategory not found with ID: ${id}`);
      }

      const updatedSubcategory = await tx.subcategory.update({
        where: { id },
        data: {
          ...subcategoryData,
          updated_by: req.user.id,
          updated_ip: req.ip,
        },
        include: {
          category: true,
        },
      });

      await auditLog(
        "subcategories",
        id,
        "UPDATE",
        existingSubcategory,
        updatedSubcategory,
        req.user.id,
        req
      );

      return updatedSubcategory;
    });

    return HttpResponse.success(
      "Subcategory updated successfully",
      result
    ).send(res);
  } catch (error) {
    console.error("Update subcategory error:", error);
    if (error.message.includes("Subcategory not found")) {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to update subcategory",
      error.message
    ).send(res);
  }
};

export const deleteSubcategory = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const subcategory = await tx.subcategory.findUnique({
        where: { id },
      });

      if (!subcategory) {
        throw new Error("Subcategory not found");
      }

      await tx.subcategory.delete({
        where: { id },
      });

      await auditLog(
        "subcategories",
        id,
        "DELETE",
        subcategory,
        null,
        req.user.id,
        req
      );
      return subcategory;
    });

    return HttpResponse.success("Subcategory deleted successfully").send(res);
  } catch (error) {
    if (error.message === "Subcategory not found") {
      return HttpResponse.notFound("Subcategory not found").send(res);
    }
    return HttpResponse.internalError(
      "Failed to delete subcategory",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "Subcategory",
    ...req.body,
    include: {
      category: true,
      products: true,
    },
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
};
