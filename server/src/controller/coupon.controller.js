import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";

export const getCoupons = async (req, res) => {
  const coupons = await prismaClient.coupon.findMany({
    where: {
      company_id: req.user.is_admin ? {} : req.user.company_id,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return HttpResponse.success("Coupons fetched successfully", coupons).send(
    res
  );
};

export const getCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const coupon = await prismaClient.coupon.findUnique({
      where: { id, company_id: req.user.company_id },
    });

    if (!coupon) {
      return HttpResponse.notFound("Coupon not found").send(res);
    }

    return HttpResponse.success("Coupon fetched successfully", coupon).send(
      res
    );
  } catch (error) {
    return HttpResponse.internalError(
      "Failed to fetch coupon",
      error.message
    ).send(res);
  }
};

export const createCoupon = async (req, res) => {
  try {
    const result = await prismaClient.$transaction(async (tx) => {
      // Check if code already exists
      const existingCoupon = await tx.coupon.findFirst({
        where: { code: req.body.code },
      });

      if (existingCoupon) {
        throw new Error("A coupon with this code already exists");
      }

      const coupon = await tx.coupon.create({
        data: {
          ...req.body,
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
        },
      });

      await auditLog(
        "coupons",
        coupon.id,
        "CREATE",
        null,
        coupon,
        req.user.id,
        req
      );

      return coupon;
    });

    return HttpResponse.created("Coupon created successfully", result).send(
      res
    );
  } catch (error) {
    if (error.message === "A coupon with this code already exists") {
      return HttpResponse.conflict(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to create coupon",
      error.message
    ).send(res);
  }
};

export const updateCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const existingCoupon = await tx.coupon.findUnique({
        where: { id },
      });

      if (!existingCoupon) {
        throw new Error("Coupon not found");
      }

      // Check if code changed and already exists
      if (req.body.code !== existingCoupon.code) {
        const codeExists = await tx.coupon.findFirst({
          where: {
            code: req.body.code,
            id: { not: id },
          },
        });

        if (codeExists) {
          throw new Error("A coupon with this code already exists");
        }
      }

      const updatedCoupon = await tx.coupon.update({
        where: { id },
        data: {
          ...req.body,
          updated_by: req.user.id,
          updated_ip: req.ip,
        },
      });

      await auditLog(
        "coupons",
        id,
        "UPDATE",
        existingCoupon,
        updatedCoupon,
        req.user.id,
        req
      );

      return updatedCoupon;
    });

    return HttpResponse.success("Coupon updated successfully", result).send(
      res
    );
  } catch (error) {
    if (error.message === "Coupon not found") {
      return HttpResponse.notFound(error.message).send(res);
    }
    if (error.message === "A coupon with this code already exists") {
      return HttpResponse.conflict(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to update coupon",
      error.message
    ).send(res);
  }
};

export const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const coupon = await tx.coupon.findUnique({
        where: { id },
      });

      if (!coupon) {
        throw new Error("Coupon not found");
      }

      await tx.coupon.delete({
        where: { id },
      });

      await auditLog("coupons", id, "DELETE", coupon, null, req.user.id, req);

      return coupon;
    });

    return HttpResponse.success("Coupon deleted successfully").send(res);
  } catch (error) {
    if (error.message === "Coupon not found") {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to delete coupon",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  try {
    const data = await getPaginatedData({
      model: "coupon",
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
