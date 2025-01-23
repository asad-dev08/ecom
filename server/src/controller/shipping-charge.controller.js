import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";

export const getShippingCharges = async (req, res) => {
  const charges = await prismaClient.shippingCharge.findMany({
    where: {
      company_id: req.user.is_admin ? {} : req.user.company_id,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return HttpResponse.success("Shipping charges fetched successfully", charges).send(res);
};

export const getShippingCharge = async (req, res) => {
  const { id } = req.params;

  try {
    const charge = await prismaClient.shippingCharge.findUnique({
      where: { id, company_id: req.user.company_id },
    });

    if (!charge) {
      return HttpResponse.notFound("Shipping charge not found").send(res);
    }

    return HttpResponse.success("Shipping charge fetched successfully", charge).send(res);
  } catch (error) {
    return HttpResponse.internalError("Failed to fetch shipping charge", error.message).send(res);
  }
};

export const createShippingCharge = async (req, res) => {
  try {
    const result = await prismaClient.$transaction(async (tx) => {
      // If this is set as default, remove default from others
      if (req.body.is_default) {
        await tx.shippingCharge.updateMany({
          where: { is_default: true },
          data: { is_default: false },
        });
      }

      const charge = await tx.shippingCharge.create({
        data: {
          ...req.body,
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
        },
      });

      await auditLog(
        "shipping_charges",
        charge.id,
        "CREATE",
        null,
        charge,
        req.user.id,
        req
      );

      return charge;
    });

    return HttpResponse.created("Shipping charge created successfully", result).send(res);
  } catch (error) {
    return HttpResponse.internalError("Failed to create shipping charge", error.message).send(res);
  }
};

export const updateShippingCharge = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const existingCharge = await tx.shippingCharge.findUnique({
        where: { id },
      });

      if (!existingCharge) {
        throw new Error("Shipping charge not found");
      }

      // If this is set as default, remove default from others
      if (req.body.is_default) {
        await tx.shippingCharge.updateMany({
          where: { 
            id: { not: id },
            is_default: true 
          },
          data: { is_default: false },
        });
      }

      const updatedCharge = await tx.shippingCharge.update({
        where: { id },
        data: {
          ...req.body,
          updated_by: req.user.id,
          updated_ip: req.ip,
        },
      });

      await auditLog(
        "shipping_charges",
        id,
        "UPDATE",
        existingCharge,
        updatedCharge,
        req.user.id,
        req
      );

      return updatedCharge;
    });

    return HttpResponse.success("Shipping charge updated successfully", result).send(res);
  } catch (error) {
    if (error.message === "Shipping charge not found") {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError("Failed to update shipping charge", error.message).send(res);
  }
};

export const deleteShippingCharge = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const charge = await tx.shippingCharge.findUnique({
        where: { id },
      });

      if (!charge) {
        throw new Error("Shipping charge not found");
      }

      await tx.shippingCharge.delete({
        where: { id },
      });

      await auditLog("shipping_charges", id, "DELETE", charge, null, req.user.id, req);

      return charge;
    });

    return HttpResponse.success("Shipping charge deleted successfully").send(res);
  } catch (error) {
    if (error.message === "Shipping charge not found") {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError("Failed to delete shipping charge", error.message).send(res);
  }
};

export const paginatedData = async (req, res) => {
  try {
    const data = await getPaginatedData({
      model: "shippingCharge",
      ...req.body,
    });
    return HttpResponse.success("Data fetched successfully", data).send(res);
  } catch (error) {
    return HttpResponse.internalError("Failed to fetch paginated data", error.message).send(res);
  }
}; 