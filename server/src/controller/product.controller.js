import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = "upload/products";

const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${baseName}_${timestamp}_${random}${extension}`;
};

export const getProducts = async (req, res) => {
  const products = await prismaClient.product.findMany({
    include: {
      category: true,
      subcategory: true,
      brand: true,
      seller: true,
      attributes: true,
      variants: true,
      reviews: true,
    },
  });

  return HttpResponse.success("Products fetched successfully", products).send(
    res
  );
};

export const getProductsForDropdown = async (req, res) => {
  const products = await prismaClient.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return HttpResponse.success("Products fetched successfully", products).send(
    res
  );
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  const product = await prismaClient.product.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      seller: true,
      attributes: true,
      variants: {
        orderBy: {
          sequence_no: "asc",
        },
      },
      reviews: true,
    },
  });

  if (!product) {
    return HttpResponse.notFound("Product not found").send(res);
  }

  return HttpResponse.success("Product fetched successfully", product).send(
    res
  );
};

export const createProduct = async (req, res) => {
  try {
    let productData;
    try {
      if (!req.body.data) {
        throw new Error("Product data is missing");
      }

      if (typeof req.body.data !== "string") {
        console.log("Data type:", typeof req.body.data);
        console.log("Raw data:", req.body.data);
        throw new Error("Product data must be a string");
      }

      productData = JSON.parse(req.body.data);
      console.log("Successfully parsed product data:", productData);
    } catch (parseError) {
      console.error("JSON Parse Error Details:", {
        error: parseError.message,
        name: parseError.name,
        stack: parseError.stack,
      });

      if (req.body.data) {
        const dataString = req.body.data.toString();
        console.error(
          "First 200 characters of data:",
          dataString.substring(0, 200)
        );
        console.error(
          "Last 200 characters of data:",
          dataString.substring(dataString.length - 200)
        );
      }

      return HttpResponse.badRequest(
        "Invalid product data format",
        parseError.message
      ).send(res);
    }

    let variantImageMeta = [];
    try {
      if (req.body.variantImageMeta) {
        if (Array.isArray(req.body.variantImageMeta)) {
          variantImageMeta = req.body.variantImageMeta.map((meta) =>
            typeof meta === "string" ? JSON.parse(meta) : meta
          );
        } else if (typeof req.body.variantImageMeta === "string") {
          variantImageMeta = [JSON.parse(req.body.variantImageMeta)];
        }
      }
      console.log("Parsed variant image metadata:", variantImageMeta);
    } catch (metaError) {
      console.error("Variant metadata parse error:", metaError);
      console.error("Raw variant metadata:", req.body.variantImageMeta);
    }

    const {
      id,
      attributes,
      variants,
      reviews,
      category,
      subcategory,
      brand,
      seller,
      sale_price,
      meta_keywords,
      stock,
      hasVariants,
      price,
      ...formattedData
    } = productData;

    const result = await prismaClient.$transaction(async (tx) => {
      let thumbnailUrl = null;

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

      // Handle product images
      let productImages = [];
      if (req.files?.images) {
        for (const image of req.files.images) {
          const uniqueFileName = generateUniqueFileName(image.originalname);
          const imagePath = path.join(
            process.cwd(),
            UPLOAD_DIR,
            uniqueFileName
          );
          await fs.writeFile(imagePath, image.buffer);
          productImages.push(`${UPLOAD_DIR}/${uniqueFileName}`);
        }
      }

      // Handle variant images
      const variantImages = {};
      if (req.files?.variantImages) {
        for (let i = 0; i < req.files.variantImages.length; i++) {
          const file = req.files.variantImages[i];
          const meta = variantImageMeta[i];

          if (meta && typeof meta.variantIndex === "number") {
            try {
              const uniqueFileName = generateUniqueFileName(file.originalname);
              const imagePath = path.join(
                process.cwd(),
                UPLOAD_DIR,
                uniqueFileName
              );
              await fs.mkdir(path.join(process.cwd(), UPLOAD_DIR), {
                recursive: true,
              });
              await fs.writeFile(imagePath, file.buffer);

              if (!variantImages[meta.variantIndex]) {
                variantImages[meta.variantIndex] = [];
              }
              variantImages[meta.variantIndex].push(
                `${UPLOAD_DIR}/${uniqueFileName}`
              );
            } catch (fileError) {
              console.error(`Error processing variant image ${i}:`, fileError);
            }
          }
        }
      }

      // Create attributes data
      const attributesCreate = attributes?.map((item) => ({
        name: item.name,
        type: item.type,
        value: item.value,
        unit: item.unit,
        displayValue: item.displayValue,
        options: item.options,
      }));

      // Calculate totals from variants if hasVariants is true
      let totalStock = 0;
      let minPrice = Infinity;
      let maxPrice = 0;

      const variantsCreate = variants?.map((item, index) => {
        const variantImagesList = variantImages[index] || item.images || [];
        const variantStock = parseFloat(item.stock) || 0;
        const variantPrice = parseFloat(item.price) || 0;

        if (hasVariants) {
          totalStock += variantStock;
          minPrice = Math.min(minPrice, variantPrice);
          maxPrice = Math.max(maxPrice, variantPrice);
        }

        return {
          sku: item.sku,
          price: variantPrice,
          stock: variantStock,
          attributes: item.attributes || {},
          images: variantImagesList,
          sequence_no: parseInt(item.sequence_no) || index,
        };
      });

      // Set final values based on variants or direct input
      const finalStock = hasVariants ? totalStock : parseFloat(stock) || 0;
      const finalPrice = hasVariants ? minPrice : parseFloat(price) || 0;
      const priceRange = hasVariants && maxPrice > minPrice ? maxPrice : null;

      const product = await tx.product.create({
        data: {
          ...formattedData,
          hasVariants: Boolean(hasVariants),
          stock: finalStock,
          price: finalPrice,
          priceRange: priceRange,
          thumbnail: thumbnailUrl,
          images: productImages,
          rating: 0,
          reviewCount: 0,
          categoryId: category?.id || null,
          subcategoryId: subcategory?.id || null,
          brandId: brand?.id || null,
          sellerId: seller?.id || null,
          attributes: {
            create: attributesCreate,
          },
          variants: hasVariants
            ? {
                create: variantsCreate,
              }
            : undefined, // Don't create variants if hasVariants is false
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
          saleStartDate: formattedData.saleStartDate
            ? new Date(formattedData.saleStartDate)
            : null,
          saleEndDate: formattedData.saleEndDate
            ? new Date(formattedData.saleEndDate)
            : null,
        },
        include: {
          category: true,
          subcategory: true,
          brand: true,
          seller: true,
          attributes: true,
          variants: true,
          reviews: true,
        },
      });

      // Create initial stock movement record
      const stockMovement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: finalStock,
          type: "PURCHASE", // Initial stock entry
          reference: "Initial Stock",
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
        },
      });
      await auditLog(
        "stock_movements",
        stockMovement.id,
        "CREATE",
        null,
        stockMovement,
        req.user.id,
        req
      );

      await auditLog(
        "products",
        product.id,
        "CREATE",
        null,
        product,
        req.user.id,
        req
      );

      return product;
    });

    return HttpResponse.success("Product created successfully", result).send(
      res
    );
  } catch (error) {
    console.error("Create product error:", error);
    if (req.files) {
      await deleteUploadedFiles(req.files);
    }
    return HttpResponse.internalError(
      "Failed to create product",
      error.message
    ).send(res);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let productData;
    try {
      productData = JSON.parse(req.body.data);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return HttpResponse.badRequest(
        "Invalid product data format",
        parseError.message
      ).send(res);
    }

    let variantImageMeta = [];
    try {
      if (req.body.variantImageMeta) {
        if (Array.isArray(req.body.variantImageMeta)) {
          variantImageMeta = req.body.variantImageMeta.map((meta) =>
            typeof meta === "string" ? JSON.parse(meta) : meta
          );
        } else if (typeof req.body.variantImageMeta === "string") {
          variantImageMeta = [JSON.parse(req.body.variantImageMeta)];
        }
      }
    } catch (metaError) {
      console.error("Variant metadata parse error:", metaError);
      console.error("Raw variant metadata:", req.body.variantImageMeta);
    }

    const {
      attributes,
      variants,
      reviews,
      category,
      subcategory,
      brand,
      seller,
      sale_price,
      meta_keywords,
      stock,
      hasVariants,
      price,
      onSale,
      salePrice,
      saleStartDate,
      saleEndDate,
      ...formattedData
    } = productData;

    const result = await prismaClient.$transaction(async (tx) => {
      const existingProduct = await tx.product.findUnique({
        where: { id },
        include: {
          attributes: true,
          variants: true,
        },
      });

      if (!existingProduct) {
        throw new Error(`Product not found with ID: ${id}`);
      }

      // Calculate totals from variants if hasVariants is true
      let totalStock = 0;
      let minPrice = Infinity;
      let maxPrice = 0;

      // Handle variant images
      const variantImages = {};
      if (req.files?.variantImages) {
        for (let i = 0; i < req.files.variantImages.length; i++) {
          const file = req.files.variantImages[i];
          const meta = variantImageMeta[i];

          if (meta && typeof meta.variantIndex === "number") {
            try {
              const uniqueFileName = generateUniqueFileName(file.originalname);
              const imagePath = path.join(
                process.cwd(),
                UPLOAD_DIR,
                uniqueFileName
              );
              await fs.mkdir(path.join(process.cwd(), UPLOAD_DIR), {
                recursive: true,
              });
              await fs.writeFile(imagePath, file.buffer);

              if (!variantImages[meta.variantIndex]) {
                variantImages[meta.variantIndex] = [];
              }
              variantImages[meta.variantIndex].push(
                `${UPLOAD_DIR}/${uniqueFileName}`
              );
            } catch (fileError) {
              console.error(`Error processing variant image ${i}:`, fileError);
            }
          }
        }
      }

      const variantsCreate = variants?.map((item, index) => {
        const variantImagesList = variantImages[index] || item.images || [];
        const variantStock = parseFloat(item.stock) || 0;
        const variantPrice = parseFloat(item.price) || 0;

        if (hasVariants) {
          totalStock += variantStock;
          minPrice = Math.min(minPrice, variantPrice);
          maxPrice = Math.max(maxPrice, variantPrice);
        }

        return {
          sku: item.sku,
          price: variantPrice,
          stock: variantStock,
          attributes: item.attributes || {},
          images: variantImagesList,
          sequence_no: parseInt(item.sequence_no) || index,
        };
      });

      // Set final values based on variants or direct input
      const finalStock = hasVariants ? totalStock : parseFloat(stock) || 0;
      const finalPrice = hasVariants ? minPrice : parseFloat(price) || 0;
      const priceRange = hasVariants && maxPrice > minPrice ? maxPrice : null;

      // Calculate stock difference here
      const stockDifference = finalStock - existingProduct.stock;

      let thumbnailUrl = existingProduct.thumbnail;

      // Handle thumbnail update
      if (req.files?.thumbnail) {
        if (existingProduct.thumbnail) {
          try {
            await fs.unlink(
              path.join(process.cwd(), existingProduct.thumbnail)
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

      // Handle product images update
      let productImages = existingProduct.images || [];
      if (req.files?.images) {
        // Delete existing images
        for (const imageUrl of existingProduct.images) {
          try {
            await fs.unlink(path.join(process.cwd(), imageUrl));
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }

        // Upload new images
        productImages = [];
        for (const image of req.files.images) {
          const uniqueFileName = generateUniqueFileName(image.originalname);
          const imagePath = path.join(
            process.cwd(),
            UPLOAD_DIR,
            uniqueFileName
          );
          await fs.writeFile(imagePath, image.buffer);
          productImages.push(`${UPLOAD_DIR}/${uniqueFileName}`);
        }
      }

      // Create attributes data
      const attributesCreate = attributes?.map((item) => ({
        name: item.name,
        type: item.type,
        value: item.value,
        unit: item.unit,
        displayValue: item.displayValue,
        options: item.options,
      }));
      console.log("sd:", saleStartDate, saleEndDate);

      const saleData = onSale
        ? {
            salePrice: parseFloat(salePrice) || 0,
            saleStartDate,
            saleEndDate,
            onSale: true,
          }
        : {
            salePrice: 0,
            salePercentage: 0,
            saleStartDate: null,
            saleEndDate: null,
            onSale: false,
          };

      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          ...formattedData,
          ...saleData,
          hasVariants: Boolean(hasVariants),
          stock: finalStock,
          price: finalPrice,
          priceRange: priceRange,
          thumbnail: thumbnailUrl || existingProduct.thumbnail,
          images: productImages,
          categoryId: category?.id || null,
          subcategoryId: subcategory?.id || null,
          brandId: brand?.id || null,
          sellerId: seller?.id || null,
          attributes: {
            deleteMany: {},
            create: attributesCreate,
          },
          variants: hasVariants
            ? {
                deleteMany: {},
                create: variantsCreate,
              }
            : {
                deleteMany: {}, // Remove any existing variants if switching to non-variant product
              },
          updated_by: req.user.id,
          updated_ip: req.ip,
          // saleStartDate: formattedData.saleStartDate
          //   ? new Date(formattedData.saleStartDate)
          //   : null,
          // saleEndDate: formattedData.saleEndDate
          //   ? new Date(formattedData.saleEndDate)
          //   : null,
        },
        include: {
          category: true,
          subcategory: true,
          brand: true,
          seller: true,
          attributes: true,
          variants: {
            orderBy: {
              sequence_no: "asc",
            },
          },
          reviews: true,
        },
      });

      // Create stock movement record if stock has changed
      if (stockDifference !== 0) {
        const stockMovement = await tx.stockMovement.create({
          data: {
            productId: updatedProduct.id,
            quantity: stockDifference, // Use absolute value for quantity
            type: stockDifference > 0 ? "PURCHASE" : "SALE",
            reference: "Stock Update",
            created_by: req.user.id,
            created_ip: req.ip,
            company_id: req.user.company_id,
          },
        });
        await auditLog(
          "stock_movements",
          stockMovement.id,
          "CREATE",
          null,
          stockMovement,
          req.user.id,
          req
        );
      }

      await auditLog(
        "products",
        id,
        "UPDATE",
        existingProduct,
        updatedProduct,
        req.user.id,
        req
      );

      return updatedProduct;
    });

    return HttpResponse.success("Product updated successfully", result).send(
      res
    );
  } catch (error) {
    console.error("Update product error:", error);
    if (req.files) {
      await deleteUploadedFiles(req.files);
    }
    return HttpResponse.internalError(
      "Failed to update product",
      error.message
    ).send(res);
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      // Get the product with all its variants
      const product = await tx.product.findUnique({
        where: { id },
        include: {
          variants: true,
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Delete all image files
      try {
        // Delete thumbnail
        if (product.thumbnail) {
          try {
            await fs.unlink(path.join(process.cwd(), product.thumbnail));
          } catch (error) {
            console.error(
              `Error deleting thumbnail: ${product.thumbnail}`,
              error
            );
          }
        }

        // Delete product images
        if (Array.isArray(product.images)) {
          for (const imageUrl of product.images) {
            try {
              await fs.unlink(path.join(process.cwd(), imageUrl));
            } catch (error) {
              console.error(`Error deleting product image: ${imageUrl}`, error);
            }
          }
        }

        // Delete variant images
        if (product.variants) {
          for (const variant of product.variants) {
            if (Array.isArray(variant.images)) {
              for (const imageUrl of variant.images) {
                try {
                  await fs.unlink(path.join(process.cwd(), imageUrl));
                } catch (error) {
                  console.error(
                    `Error deleting variant image: ${imageUrl}`,
                    error
                  );
                }
              }
            }
          }
        }
      } catch (fileError) {
        console.error("Error while deleting product files:", fileError);
        // Continue with product deletion even if file deletion fails
      }

      // Delete the product and all related data (Prisma will handle relations)
      await tx.product.delete({
        where: { id },
      });

      // Log the deletion
      await auditLog("products", id, "DELETE", product, null, req.user.id, req);

      return product;
    });

    return HttpResponse.success(
      "Product and all associated files deleted successfully"
    ).send(res);
  } catch (error) {
    console.error("Delete product error:", error);

    if (error.message === "Product not found") {
      return HttpResponse.notFound("Product not found").send(res);
    }

    return HttpResponse.internalError(
      "Failed to delete product",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "product",
    ...req.body,
    include: {
      category: true,
      subcategory: true,
      brand: true,
      seller: true,
      attributes: true,
      variants: true,
      reviews: true,
    },
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
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
