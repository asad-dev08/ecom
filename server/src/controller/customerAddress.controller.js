import { prismaClient } from "../index.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { auditLog } from "../utils/audit.js";

export const getAddresses = async (req, res) => {
  const customerId = req.user.id;

  try {
    const addresses = await prismaClient.customerAddress.findMany({
      where: { customerId },
      orderBy: { created_at: "desc" },
    });

    return HttpResponse.success(
      "Addresses fetched successfully",
      addresses
    ).send(res);
  } catch (error) {
    return HttpResponse.internalError(
      "Failed to fetch addresses",
      error.message
    ).send(res);
  }
};

export const createAddress = async (req, res) => {
  const customerId = req.user.id;
  const addressData = req.body;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      // If this is set as default, remove default from other addresses
      if (addressData.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }

      const address = await tx.customerAddress.create({
        data: {
          ...addressData,
          customerId,
          created_by: customerId,
          created_ip: req.ip,
        },
      });

      await auditLog(
        "customer_addresses",
        address.id,
        "CREATE",
        null,
        address,
        customerId,
        req
      );

      return address;
    });

    return HttpResponse.created("Address created successfully", result).send(
      res
    );
  } catch (error) {
    return HttpResponse.internalError(
      "Failed to create address",
      error.message
    ).send(res);
  }
};

export const updateAddress = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const addressData = req.body;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const existingAddress = await tx.customerAddress.findFirst({
        where: { id, customerId },
      });

      if (!existingAddress) {
        throw new Error("Address not found");
      }

      // If this is set as default, remove default from other addresses
      if (addressData.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId, id: { not: id } },
          data: { isDefault: false },
        });
      }

      const updatedAddress = await tx.customerAddress.update({
        where: { id },
        data: {
          ...addressData,
          updated_by: customerId,
          updated_ip: req.ip,
        },
      });

      await auditLog(
        "customer_addresses",
        id,
        "UPDATE",
        existingAddress,
        updatedAddress,
        customerId,
        req
      );

      return updatedAddress;
    });

    return HttpResponse.success("Address updated successfully", result).send(
      res
    );
  } catch (error) {
    if (error.message === "Address not found") {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to update address",
      error.message
    ).send(res);
  }
};

export const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const address = await tx.customerAddress.findFirst({
        where: { id, customerId },
      });

      if (!address) {
        throw new Error("Address not found");
      }

      await tx.customerAddress.delete({
        where: { id },
      });

      await auditLog(
        "customer_addresses",
        id,
        "DELETE",
        address,
        null,
        customerId,
        req
      );

      return address;
    });

    return HttpResponse.success("Address deleted successfully").send(res);
  } catch (error) {
    if (error.message === "Address not found") {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to delete address",
      error.message
    ).send(res);
  }
};
