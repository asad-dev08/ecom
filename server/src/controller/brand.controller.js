import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";

export const getBrands = async (req, res) => {
  const brands = await prismaClient.brand.findMany({
    where: {
      company_id: req.user.is_admin ? {} : req.user.company_id,
    },
    include: {
      products: true,
    },
  });

  return HttpResponse.success("Brands fetched successfully", brands).send(res);
};

export const getBrand = async (req, res) => {
  const { id } = req.params;
  const brand = await prismaClient.brand.findUnique({
    where: { id, company_id: req.user.company_id },
    include: {
      products: true,
    },
  });

  if (!brand) {
    return HttpResponse.notFound("Brand not found").send(res);
  }

  return HttpResponse.success("Brand fetched successfully", brand).send(res);
};

export const createBrand = async (req, res) => {
  try {
    const { id, products, ...brandData } = req.body;

    const result = await prismaClient.$transaction(async (tx) => {
      const brand = await tx.brand.create({
        data: {
          ...brandData,
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
        },
        include: {
          products: true,
        },
      });

      await auditLog(
        "brands",
        brand.id,
        "CREATE",
        null,
        brand,
        req.user.id,
        req
      );

      return brand;
    });

    return HttpResponse.created("Brand created successfully", result).send(res);
  } catch (error) {
    console.error("Create brand error:", error);
    return HttpResponse.internalError(
      "Failed to create brand",
      error.message
    ).send(res);
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { products, ...brandData } = req.body;

    const result = await prismaClient.$transaction(async (tx) => {
      const existingBrand = await tx.brand.findUnique({
        where: { id },
      });

      if (!existingBrand) {
        throw new Error(`Brand not found with ID: ${id}`);
      }

      const updatedBrand = await tx.brand.update({
        where: { id },
        data: { ...brandData, updated_by: req.user.id, updated_ip: req.ip },
        include: {
          products: true,
        },
      });

      await auditLog(
        "brands",
        id,
        "UPDATE",
        existingBrand,
        updatedBrand,
        req.user.id,
        req
      );

      return updatedBrand;
    });

    return HttpResponse.success("Brand updated successfully", result).send(res);
  } catch (error) {
    console.error("Update brand error:", error);
    if (error.message.includes("Brand not found")) {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to update brand",
      error.message
    ).send(res);
  }
};

export const deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const brand = await tx.brand.findUnique({
        where: { id },
      });

      if (!brand) {
        throw new Error("Brand not found");
      }

      await tx.brand.delete({
        where: { id },
      });

      await auditLog("brands", id, "DELETE", brand, null, req.user.id, req);
      return brand;
    });

    return HttpResponse.success("Brand deleted successfully").send(res);
  } catch (error) {
    if (error.message === "Brand not found") {
      return HttpResponse.notFound("Brand not found").send(res);
    }
    return HttpResponse.internalError(
      "Failed to delete brand",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "brand",
    ...req.body,
    // include: {
    //   products: true,
    // },
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
};
