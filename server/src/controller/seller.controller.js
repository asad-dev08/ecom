import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = "upload/sellers";

const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${baseName}_${timestamp}_${random}${extension}`;
};

export const getSellers = async (req, res) => {
  try {
    // Get the company_id from the logged-in user
    const company_id = req.user.company_id;

    // First get the company to find its seller_id
    const company = await prismaClient.company.findFirst({
      where: {
        id: company_id,
        is_seller: true,
        seller_id: {
          not: null,
        },
      },
    });

    if (!company || !company.seller_id) {
      return HttpResponse.success("No sellers found", []).send(res);
    }

    // Then get the seller with that ID
    const seller = await prismaClient.seller.findUnique({
      where: {
        id: company.seller_id,
      },
    });

    const sellers = seller ? [seller] : [];

    return HttpResponse.success("Sellers fetched successfully", sellers).send(
      res
    );
  } catch (error) {
    console.error("Get sellers error:", error);
    return HttpResponse.internalError(
      "Failed to fetch sellers",
      error.message
    ).send(res);
  }
};

export const getSeller = async (req, res) => {
  const { id } = req.params;
  const seller = await prismaClient.seller.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });

  if (!seller) {
    return HttpResponse.notFound("Seller not found").send(res);
  }

  return HttpResponse.success("Seller fetched successfully", seller).send(res);
};

export const createSeller = async (req, res) => {
  try {
    const sellerData = JSON.parse(req.body.data);
    const { id, products, ...formattedData } = sellerData;

    const result = await prismaClient.$transaction(async (tx) => {
      let logoUrl = null;

      // Handle logo upload
      if (req.files?.logo) {
        const logo = req.files.logo[0];
        const uniqueFileName = generateUniqueFileName(logo.originalname);
        const logoPath = path.join(process.cwd(), UPLOAD_DIR, uniqueFileName);

        await fs.mkdir(path.join(process.cwd(), UPLOAD_DIR), {
          recursive: true,
        });
        await fs.writeFile(logoPath, logo.buffer);
        logoUrl = `${UPLOAD_DIR}/${uniqueFileName}`;
      }

      const seller = await tx.seller.create({
        data: {
          ...formattedData,
          logo: logoUrl,

          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
        },
        include: {
          products: true,
        },
      });

      await auditLog(
        "sellers",
        seller.id,
        "CREATE",
        null,
        seller,
        req.user.id,
        req
      );

      return seller;
    });

    return HttpResponse.success("Seller created successfully", result).send(
      res
    );
  } catch (error) {
    console.error("Create seller error:", error);
    if (req.files) {
      await deleteUploadedFiles(req.files);
    }
    return HttpResponse.internalError(
      "Failed to create seller",
      error.message
    ).send(res);
  }
};

export const updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerData = JSON.parse(req.body.data);

    const result = await prismaClient.$transaction(async (tx) => {
      const existingSeller = await tx.seller.findUnique({
        where: { id },
      });

      if (!existingSeller) {
        throw new Error(`Seller not found with ID: ${id}`);
      }

      let logoUrl = existingSeller.logo;

      // Handle logo update
      if (req.files?.logo) {
        if (existingSeller.logo) {
          try {
            await fs.unlink(path.join(process.cwd(), existingSeller.logo));
          } catch (error) {
            console.error("Error deleting old logo:", error);
          }
        }

        const logo = req.files.logo[0];
        const uniqueFileName = generateUniqueFileName(logo.originalname);
        const logoPath = path.join(process.cwd(), UPLOAD_DIR, uniqueFileName);
        await fs.writeFile(logoPath, logo.buffer);
        logoUrl = `${UPLOAD_DIR}/${uniqueFileName}`;
      }

      const { products, ...restData } = sellerData;

      const updatedSeller = await tx.seller.update({
        where: { id },
        data: {
          ...restData,
          logo: logoUrl,
          updated_by: req.user.id,
          updated_ip: req.ip,
        },
        include: {
          products: true,
        },
      });

      await auditLog(
        "sellers",
        id,
        "UPDATE",
        existingSeller,
        updatedSeller,
        req.user.id,
        req
      );

      return updatedSeller;
    });

    return HttpResponse.success("Seller updated successfully", result).send(
      res
    );
  } catch (error) {
    console.error("Update seller error:", error);
    if (error.message.includes("Seller not found")) {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to update seller",
      error.message
    ).send(res);
  }
};

export const deleteSeller = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const seller = await tx.seller.findUnique({
        where: { id },
      });

      if (!seller) {
        throw new Error("Seller not found");
      }

      // Delete logo
      if (seller.logo) {
        await fs.unlink(path.join(process.cwd(), seller.logo));
      }

      await tx.seller.delete({
        where: { id },
      });

      await auditLog("sellers", id, "DELETE", seller, null, req.user.id, req);
      return seller;
    });

    return HttpResponse.success("Seller deleted successfully").send(res);
  } catch (error) {
    if (error.message === "Seller not found") {
      return HttpResponse.notFound("Seller not found").send(res);
    }
    return HttpResponse.internalError(
      "Failed to delete seller",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  try {
    const data = await getPaginatedData({
      model: "seller",
      ...req.body,
      include: {
        products: true,
        companies: {
          where: {
            seller_id: {
              not: null,
            },
            is_seller: true,
          },
          select: {
            id: true,
            company_name: true,
            company_code: true,
            email: true,
            phone: true,
            is_seller: true,
            is_verified: true,
            seller_id: true,
          },
        },
      },
    });

    // Log the first result to check the structure
    // if (data?.rows?.length > 0) {
    //   console.log("First seller data:", JSON.stringify(data.rows[0], null, 2));
    // }

    return HttpResponse.success("Data fetched successfully", data).send(res);
  } catch (error) {
    console.error("Pagination error:", error);
    return HttpResponse.internalError(
      "Failed to fetch paginated data",
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

export const updateSellerVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const result = await prismaClient.$transaction(async (tx) => {
      const existingSeller = await tx.seller.findUnique({
        where: { id },
      });

      if (!existingSeller) {
        throw new Error(`Seller not found with ID: ${id}`);
      }

      const updatedSeller = await tx.seller.update({
        where: { id },
        data: {
          verified,
          updated_by: req.user.id,
          updated_ip: req.ip,
        },
      });

      await auditLog(
        "sellers",
        id,
        "UPDATE",
        existingSeller,
        updatedSeller,
        req.user.id,
        req
      );

      return updatedSeller;
    });

    return HttpResponse.success(
      `Seller ${verified ? "verified" : "unverified"} successfully`,
      result
    ).send(res);
  } catch (error) {
    console.error("Update seller verification error:", error);
    if (error.message.includes("Seller not found")) {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to update seller verification",
      error.message
    ).send(res);
  }
};
