import { prismaClient } from "../index.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { logError, logInfo } from "../utils/logger.js";
import SSLCommerzPayment from "sslcommerz-lts";
import { config } from "../config/index.js";
import { Prisma } from "@prisma/client";
import { auditLog } from "../utils/audit.js";
import fs from "fs/promises";
import path from "path";

const store_id = "mycom67545812d0f2c";
const store_passwd = "mycom67545812d0f2c@ssl";
const is_live = false; //true for live, false for sandbox

const UPLOAD_DIR = "upload/sellers";

const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${baseName}_${timestamp}_${random}${extension}`;
};

// Helper function to check stock availability
async function getAvailableStock(productId, variantId = null) {
  // Get all stock movements for the product/variant
  const stockMovements = await prismaClient.stockMovement.findMany({
    where: {
      productId,
      variantId: variantId || null,
    },
  });

  // Calculate net stock from movements
  const availableStock = stockMovements.reduce((total, movement) => {
    const quantity = Number(movement.quantity);
    switch (movement.type) {
      case "PURCHASE":
        return total + quantity;
      case "SALE":
        return total - quantity;
      case "RETURN":
        return total + quantity;
      case "DAMAGE":
        return total - quantity;
      case "ADJUSTMENT":
        return total + quantity; // Positive for increase, negative for decrease
      default:
        return total;
    }
  }, 0);

  return availableStock;
}
async function validateStockAvailability(items) {
  for (const item of items) {
    const product = await prismaClient.product.findUnique({
      where: { id: item.productId },
      include: {
        variants: {
          where: item.variantId ? { id: item.variantId } : undefined,
        },
      },
    });

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    // Get available stock from stock movements
    const availableStock = await getAvailableStock(
      item.productId,
      item.variantId
    );

    // Check variant stock if variant exists
    if (item.variantId) {
      const variant = product.variants[0];
      if (!variant) {
        throw new Error(`Variant not found: ${item.variantId}`);
      }
      if (availableStock < item.quantity) {
        throw new Error(
          `Insufficient stock for variant ${variant.sku}. Available: ${availableStock}, Requested: ${item.quantity}`
        );
      }
    } else {
      // Check main product stock
      if (availableStock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`
        );
      }
    }
  }
  return true;
}

export class ClientController {
  static async getCategories(req, res) {
    try {
      const categories = await prismaClient.category.findMany({
        where: {
          is_active: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          featured: true,
          _count: {
            select: { products: true },
          },
          subcategories: {
            select: {
              id: true,
              name: true,
              slug: true,
              _count: {
                select: { products: true },
              },
            },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });

      const transformedCategories = categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        featured: category.featured,
        productCount: category._count.products,
        subcategories: category.subcategories.map((sub) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          productCount: sub._count.products,
        })),
      }));

      logInfo("Categories fetched successfully", { count: categories.length });
      return HttpResponse.success(
        "Categories retrieved successfully",
        transformedCategories
      ).send(res);
    } catch (error) {
      logError("Error fetching categories", error);
      return HttpResponse.internalError("Failed to fetch categories").send(res);
    }
  }

  static async searchProducts(req, res) {
    try {
      const { query, limit = 5 } = req.query;

      const products = await prismaClient.product.findMany({
        where: {
          status: "active",
          OR: [
            {
              name: {
                contains: query,
              },
            },
            {
              name: {
                contains: query.toLowerCase(),
              },
            },
            {
              name: {
                contains: query.toUpperCase(),
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          price: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        take: Number(limit),
        orderBy: {
          name: "asc",
        },
      });

      return HttpResponse.success("Products retrieved successfully", {
        products,
      }).send(res);
    } catch (error) {
      logError("Error searching products", error);
      return HttpResponse.internalError("Failed to search products").send(res);
    }
  }

  static async getFeaturedCategories(req, res) {
    try {
      const categories = await prismaClient.category.findMany({
        where: {
          is_active: true,
          featured: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          image: true,
          _count: {
            select: { products: true },
          },
        },
        // take: 6,
        orderBy: { created_at: "desc" },
      });

      logInfo("Featured categories fetched successfully", {
        count: categories.length,
      });
      return HttpResponse.success(
        "Featured categories retrieved successfully",
        categories
      ).send(res);
    } catch (error) {
      logError("Error fetching featured categories", error);
      return HttpResponse.internalError(
        "Failed to fetch featured categories"
      ).send(res);
    }
  }

  static async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        minPrice,
        maxPrice,
        sort = "newest",
        search,
        inStock,
        onSale,
        category,
        subcategory,
        rating,
        brand,
        variantAttributes,
        ...restParams
      } = req.query;

      // Split categories and subcategories into arrays
      const categorySlugs = category ? category.split(",") : [];
      const subcategorySlugs = subcategory ? subcategory.split(",") : [];

      // Find category IDs from slugs
      let categoryIds = [];
      if (categorySlugs.length > 0) {
        const categoryData = await prismaClient.category.findMany({
          where: {
            slug: {
              in: categorySlugs,
            },
            is_active: true,
          },
          select: { id: true },
        });

        if (categoryData.length === 0) {
          return HttpResponse.notFound("Categories not found").send(res);
        }

        categoryIds = categoryData.map((cat) => cat.id);
      }

      // Find subcategory IDs from slugs
      let subcategoryIds = [];
      if (subcategorySlugs.length > 0) {
        const subcategoryData = await prismaClient.subcategory.findMany({
          where: {
            slug: {
              in: subcategorySlugs,
            },
            categoryId:
              categoryIds.length > 0 ? { in: categoryIds } : undefined,
          },
          select: { id: true },
        });

        if (subcategoryData.length === 0) {
          return HttpResponse.notFound("Subcategories not found").send(res);
        }

        subcategoryIds = subcategoryData.map((sub) => sub.id);
      }

      // Handle attribute filters
      const attributeFilters = Object.entries(restParams)
        .filter(([key]) => key.startsWith("attr_"))
        .reduce((acc, [key, value]) => {
          const attributeName = key.replace("attr_", "");
          const values = Array.isArray(value) ? value : [value];
          acc.push({
            name: attributeName,
            value: {
              in: values,
            },
          });
          return acc;
        }, []);

      // Handle multiple brands - Modified to work with brand names
      const brandNames = brand ? brand.split(",") : [];

      // Find brand IDs from names if brands are specified
      let brandIds = [];
      if (brandNames.length > 0) {
        const brandData = await prismaClient.brand.findMany({
          where: {
            slug: {
              in: brandNames,
            },
          },
          select: { id: true },
        });

        brandIds = brandData.map((brand) => brand.id);
      }

      // Parse variant attribute filters
      const variantFilters = variantAttributes
        ? JSON.parse(variantAttributes)
        : {};

      // Build where clause
      const whereClause = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(categoryIds.length > 0 && {
          categoryId: {
            in: categoryIds,
          },
        }),
        ...(subcategoryIds.length > 0 && {
          subcategoryId: {
            in: subcategoryIds,
          },
        }),
        ...(brandIds.length > 0 && {
          brandId: {
            in: brandIds,
          },
        }),
        ...((minPrice || maxPrice) && {
          price: {
            ...(minPrice && { gte: Number(minPrice) }),
            ...(maxPrice && { lte: Number(maxPrice) }),
          },
        }),
        ...(inStock === "true" && { stock: { gt: 0 } }),
        ...(onSale === "true" && { onSale: true }),
        ...(rating && { rating: { gte: Number(rating) } }),
        ...(attributeFilters.length > 0 && {
          attributes: {
            some: {
              OR: attributeFilters,
            },
          },
        }),
        ...(Object.keys(variantFilters).length > 0 && {
          variants: {
            some: {
              attributes: {
                path: Object.entries(variantFilters).map(([key, value]) => ({
                  [key]: value,
                })),
              },
            },
          },
        }),
      };

      // Get total count
      const total = await prismaClient.product.count({
        where: whereClause,
      });

      // Get products with their company's special offers
      const products = await prismaClient.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          thumbnail: true,
          rating: true,
          stock: true,
          company_id: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: true,
          attributes: {
            select: {
              name: true,
              type: true,
              value: true,
              unit: true,
              displayValue: true,
              options: true,
            },
          },
          hasVariants: true,
          variants: {
            where:
              Object.keys(variantFilters).length > 0
                ? {
                    attributes: {
                      path: Object.entries(variantFilters).map(
                        ([key, value]) => ({
                          [key]: value,
                        })
                      ),
                    },
                  }
                : {}, // Empty where clause to get all variants
            select: {
              id: true,
              price: true,
              stock: true,
              sku: true,
              sequence_no: true,
              attributes: true,
              images: true,
            },
            // Remove the take limit completely as it's not needed
          },
          seller: {
            select: {
              id: true,
              company_id: true,
            },
          },
          SpecialOffer: true, // Include specific product offers
        },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
        orderBy: (() => {
          switch (sort) {
            case "price_asc":
              return { price: "asc" };
            case "price_desc":
              return { price: "desc" };
            case "rating_desc":
              return { rating: "desc" };
            default:
              return { created_at: "desc" };
          }
        })(),
      });

      // Process products to calculate offer prices
      const processedProducts = await Promise.all(
        products.map(async (product) => {
          // Check for company-wide offers
          const companyOffers = await prismaClient.specialOffer.findMany({
            where: {
              AND: [
                {
                  company_id: {
                    in: await prismaClient.company
                      .findMany({
                        where: {
                          seller_id: product?.seller?.id,
                        },
                        select: {
                          id: true,
                        },
                      })
                      .then((companies) => companies.map((c) => c.id)),
                  },
                },
                { is_active: true },
                { start_date: { lte: new Date() } },
                { end_date: { gte: new Date() } },
                {
                  OR: [
                    { products: { none: {} } }, // Company-wide offer
                    { products: { some: { id: product.id } } }, // Product-specific offer
                  ],
                },
              ],
            },
            orderBy: {
              discount: "desc", // Get highest discount first
            },
          });

          // Calculate the best offer
          let bestDiscount = 0;

          let finalPrice = Number(product.price);

          if (companyOffers.length > 0) {
            const highestDiscount = companyOffers[0].discount;
            bestDiscount = Number(highestDiscount);
            finalPrice = Number(product.price) * (1 - bestDiscount / 100);
          }

          return {
            ...product,
            salePrice:
              companyOffers.length > 0 ? finalPrice : product.salePrice,
            discount:
              companyOffers.length > 0 ? bestDiscount : product.salePercentage,
            hasOffer:
              companyOffers.length > 0 ? bestDiscount > 0 : product.onSale,
          };
        })
      );

      return HttpResponse.success("Products retrieved successfully", {
        products: processedProducts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        filters: {
          categories: categorySlugs,
          subcategories: subcategorySlugs,
        },
      }).send(res);
    } catch (error) {
      logError("Error fetching products", error);
      return HttpResponse.internalError("Failed to fetch products").send(res);
    }
  }

  static async getProductDetails(req, res) {
    try {
      const { id } = req.params;
      const product = await prismaClient.product.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          compareAtPrice: true,
          images: true,
          thumbnail: true,
          hasVariants: true,
          stock: true,
          tags: true,
          rating: true,
          reviewCount: true,
          status: true,
          isFeatured: true,
          company_id: true,
          isNew: true,
          onSale: true,
          salePrice: true,
          salePercentage: true,
          saleStartDate: true,
          saleEndDate: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              logo: true,
              rating: true,
              verified: true,
              reviewCount: true,
              company_id: true,
            },
          },
          attributes: {
            select: {
              id: true,
              name: true,
              type: true,
              value: true,
              unit: true,
              displayValue: true,
              options: true,
            },
          },
          variants: true,
          reviews: {
            select: {
              id: true,
              rating: true,
              title: true,
              comment: true,
              helpful: true,
              createdAt: true,
              userName: true,
              userAvatar: true,
            },
            take: 5,
            orderBy: {
              createdAt: "desc",
            },
          },
          SpecialOffer: true,
        },
      });

      if (!product) {
        return HttpResponse.notFound("Product not found").send(res);
      }

      // Check for company-wide offers
      const companyOffers = await prismaClient.specialOffer.findMany({
        where: {
          AND: [
            {
              company_id: {
                in: await prismaClient.company
                  .findMany({
                    where: {
                      seller_id: product.seller.id,
                    },
                    select: {
                      id: true,
                    },
                  })
                  .then((companies) => companies.map((c) => c.id)),
              },
            },
            { is_active: true },
            { start_date: { lte: new Date() } },
            { end_date: { gte: new Date() } },
            {
              OR: [
                { products: { none: {} } }, // Company-wide offer
                { products: { some: { id: product.id } } }, // Product-specific offer
              ],
            },
          ],
        },
        orderBy: {
          discount: "desc",
        },
      });

      // Calculate the best offer
      let bestDiscount = 0;
      let finalPrice = Number(product.price);

      if (companyOffers.length > 0) {
        const highestDiscount = companyOffers[0].discount;
        bestDiscount = Number(highestDiscount);
        finalPrice = Number(product.price) * (1 - bestDiscount / 100);
      }

      const processedProduct = {
        ...product,
        variants: product.variants.map((variant) => {
          let variantFinalPrice = Number(variant.price);
          let variantDiscount = 0;

          if (companyOffers.length > 0) {
            const highestDiscount = companyOffers[0].discount;
            variantDiscount = Number(highestDiscount);
            variantFinalPrice =
              Number(variant.price) * (1 - variantDiscount / 100);
          }

          return {
            ...variant,
            originalPrice: variant.price,
            salePrice: variantFinalPrice,
            discount: variantDiscount,
            hasOffer: variantDiscount > 0,
          };
        }),
        // Calculate base product price discount only if no variants exist
        ...((!product.hasVariants || product.variants.length === 0) && {
          salePrice: companyOffers.length > 0 ? finalPrice : product.salePrice,
          discount:
            companyOffers.length > 0 ? bestDiscount : product.salePercentage,
          hasOffer:
            companyOffers.length > 0 ? bestDiscount > 0 : product.onSale,
        }),
        activeOffers: companyOffers,
        hasVariants: product.hasVariants,
      };

      return HttpResponse.success(
        "Product details retrieved successfully",
        processedProduct
      ).send(res);
    } catch (error) {
      logError("Error fetching product details", error);
      return HttpResponse.internalError("Failed to fetch product details").send(
        res
      );
    }
  }

  static async getRelatedProducts(req, res) {
    try {
      const { productId, categoryId } = req.params;

      const relatedProducts = await prismaClient.product.findMany({
        where: {
          categoryId: categoryId,
          id: { not: productId },
          // Add any other conditions like active status if needed
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          thumbnail: true,
          rating: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        take: 4,
        orderBy: { rating: "desc" },
      });

      return HttpResponse.success(
        "Related products retrieved successfully",
        relatedProducts
      ).send(res);
    } catch (error) {
      logError("Error fetching related products", error);
      return HttpResponse.internalError(
        "Failed to fetch related products"
      ).send(res);
    }
  }

  // Get all addresses for a customer
  static async getAddresses(req, res) {
    try {
      const customerId = req.customer.id;

      const addresses = await prismaClient.customerAddress.findMany({
        where: {
          customerId: customerId,
        },
        orderBy: {
          isDefault: "desc",
        },
      });

      return HttpResponse.success(
        "Addresses retrieved successfully",
        addresses
      ).send(res);
    } catch (error) {
      logError("Error fetching addresses", error);
      return HttpResponse.internalError("Failed to fetch addresses").send(res);
    }
  }

  // Create a new address
  static async createAddress(req, res) {
    try {
      const customerId = req.customer.id;
      const addressData = req.body;

      // If this is the first address or marked as default, handle default status
      if (addressData.isDefault) {
        await prismaClient.customerAddress.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }

      const address = await prismaClient.customerAddress.create({
        data: {
          ...addressData,
          customerId,
          firstName: addressData.firstName || "",
          lastName: addressData.lastName || "",
          // If this is the first address, make it default
          isDefault: addressData.isDefault || false,
          created_by: req.customer.id || "customer",
          created_ip: req.ip || "",
        },
      });

      return HttpResponse.created("Address created successfully", address).send(
        res
      );
    } catch (error) {
      logError("Error creating address", error);
      return HttpResponse.internalError("Failed to create address").send(res);
    }
  }

  // Update an address
  static async updateAddress(req, res) {
    try {
      const { id } = req.params;
      const customerId = req.customer.id;
      const addressData = req.body;

      // Verify address belongs to customer
      const existingAddress = await prismaClient.customerAddress.findFirst({
        where: {
          id,
          customerId,
        },
      });

      if (!existingAddress) {
        return HttpResponse.notFound("Address not found").send(res);
      }

      // If setting as default, remove default from other addresses
      if (addressData.isDefault) {
        await prismaClient.customerAddress.updateMany({
          where: {
            customerId,
            id: { not: id },
          },
          data: { isDefault: false },
        });
      }

      const address = await prismaClient.customerAddress.update({
        where: { id },
        data: {
          ...addressData,
          updated_by: req.customer.id || "customer", // Add updated_by field
          updated_ip: req.ip || "", // Optional: Add IP address
        },
      });

      return HttpResponse.success("Address updated successfully", address).send(
        res
      );
    } catch (error) {
      logError("Error updating address", error);
      return HttpResponse.internalError("Failed to update address").send(res);
    }
  }

  // Delete an address
  static async deleteAddress(req, res) {
    try {
      const { id } = req.params;
      const customerId = req.customer.id;

      // Verify address belongs to customer
      const address = await prismaClient.customerAddress.findFirst({
        where: {
          id,
          customerId,
        },
      });

      if (!address) {
        return HttpResponse.notFound("Address not found").send(res);
      }

      await prismaClient.customerAddress.delete({
        where: { id },
      });

      // If deleted address was default and other addresses exist, make the first one default
      if (address.isDefault) {
        const remainingAddress = await prismaClient.customerAddress.findFirst({
          where: { customerId },
        });

        if (remainingAddress) {
          await prismaClient.customerAddress.update({
            where: { id: remainingAddress.id },
            data: { isDefault: true },
          });
        }
      }

      return HttpResponse.success("Address deleted successfully").send(res);
    } catch (error) {
      logError("Error deleting address", error);
      return HttpResponse.internalError("Failed to delete address").send(res);
    }
  }

  static async createSSLCommerzOrder(req, res) {
    try {
      const { items, addressId, couponCode, shippingChargeId, guestInfo } =
        req.body;
      const customerId = req.customer?.id; // Make it optional

      // Check stock availability
      try {
        await validateStockAvailability(items);
      } catch (error) {
        return HttpResponse.badRequest(error.message).send(res);
      }

      // Validate shipping charge
      const shippingCharge = await prismaClient.shippingCharge.findFirst({
        where: { id: shippingChargeId, is_active: true },
      });

      // Get shipping address based on whether it's a guest or logged-in user
      let shippingAddress;
      if (customerId) {
        const address = await prismaClient.customerAddress.findUnique({
          where: { id: addressId },
        });
        if (!address) {
          return HttpResponse.badRequest("Invalid shipping address").send(res);
        }
        shippingAddress = address;
      } else {
        // Use guest shipping information
        shippingAddress = guestInfo;
      }

      // Calculate order total
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shippingCost = Number(
        (shippingCharge && shippingCharge.amount) || 0
      );
      let discount = 0;
      let appliedCoupon = null;

      // Apply coupon if provided
      if (couponCode) {
        const coupon = await prismaClient.coupon.findFirst({
          where: {
            code: couponCode,
            is_active: true,
            start_date: { lte: new Date() },
            end_date: { gte: new Date() },
            minimum_purchase: { lte: subtotal },
          },
        });

        if (!coupon) {
          return HttpResponse.badRequest("Invalid or expired coupon").send(res);
        }
        if (
          coupon.usage_limit !== null &&
          coupon.used_count >= coupon.usage_limit
        ) {
          return HttpResponse.badRequest("Coupon usage limit exceeded").send(
            res
          );
        }

        // Calculate discount based on type
        if (coupon.discount_type === "percentage") {
          discount = (subtotal * coupon.discount_amount) / 100;
          if (coupon.maximum_discount) {
            discount = Math.min(discount, coupon.maximum_discount);
          }
        } else {
          discount = Number(coupon.discount_amount);
        }
        appliedCoupon = coupon;
      }

      const total = subtotal + shippingCost - discount;
      const transactionId = `T_${Date.now()}_${Math.floor(
        Math.random() * 1000
      )}`;

      // Store order details in pending order
      const pendingOrder = await prismaClient.pendingOrder.create({
        data: {
          transactionId,
          customerId: customerId || null, // Make it null for guest checkout
          addressId: addressId || "guest",
          items,
          subtotal,
          shippingCost,
          discount,
          total,
          status: "pending",
          couponId: appliedCoupon?.id || null,
          couponCode: appliedCoupon?.code || null,
          created_by: customerId || "guest",
          created_ip: req.ip || "",
          shippingChargeId,
        },
      });

      // If coupon is applied, increment the used_count
      if (appliedCoupon) {
        await prismaClient.coupon.update({
          where: { id: appliedCoupon.id },
          data: {
            used_count: {
              increment: 1,
            },
          },
        });
      }

      const data = {
        total_amount: total,
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${config.apiUrl}/api/customer/orders/sslcommerz-success`,
        fail_url: `${config.apiUrl}/api/customer/orders/sslcommerz-fail`,
        cancel_url: `${config.apiUrl}/api/customer/orders/sslcommerz-cancel`,
        ipn_url: `${config.apiUrl}/api/customer/orders/sslcommerz-ipn`,
        shipping_method: "Courier",
        product_name: items
          .map((item) => item.productId + "-" + item.variantId)
          .join(", "),
        product_category: "General",
        product_profile: "general",
        cus_name: customerId || "guest",
        cus_email: req.customer?.email || guestInfo.email,
        cus_add1: shippingAddress.address,
        cus_add2: shippingAddress.apartment || "",
        cus_city: shippingAddress.city,
        cus_state: shippingAddress.state,
        cus_postcode: shippingAddress.postalCode,
        cus_country: shippingAddress.country,
        cus_phone: shippingAddress.phone,
        ship_name: shippingAddress.address || "guest",
        ship_add1: shippingAddress.address || "guest",
        ship_add2: shippingAddress.apartment || "",
        ship_city: shippingAddress.city || "guest",
        ship_state: shippingAddress.state || "guest",
        ship_postcode: shippingAddress.postalCode || "guest",
        ship_country: shippingAddress.country || "guest",
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const apiResponse = await sslcz.init(data);

      return HttpResponse.success("SSLCommerz payment session created", {
        redirectUrl: apiResponse.GatewayPageURL,
      }).send(res);
    } catch (error) {
      logError("Error creating SSLCommerz order", error);
      return HttpResponse.internalError(
        "Failed to create payment session"
      ).send(res);
    }
  }

  // Handle SSLCommerz success
  static async sslCommerzSuccess(req, res) {
    try {
      const { tran_id, status } = req.body;

      if (!tran_id || status !== "VALID") {
        logError("Invalid SSLCommerz transaction", { body: req.body });
        return res.redirect(`${config.frontendUrl}/payment-failed`);
      }

      // Get pending order with coupon details
      const pendingOrder = await prismaClient.pendingOrder.findUnique({
        where: { transactionId: tran_id },
        include: {
          coupon: true,
        },
      });

      if (!pendingOrder) {
        logError("Pending order not found", { transactionId: tran_id });
        return res.redirect(`${config.frontendUrl}/payment-failed`);
      }

      const address = await prismaClient.customerAddress.findFirst({
        where: {
          id: pendingOrder.addressId,
          customerId: pendingOrder.customerId,
        },
      });

      if (!address && pendingOrder.addressId != "guest") {
        return HttpResponse.badRequest("Invalid shipping address").send(res);
      }

      // Create actual order with coupon information
      const order = await prismaClient.order.create({
        data: {
          orderNumber: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
          customerId: pendingOrder.customerId || null, // Set to null for guest checkout
          status: "PROCESSING",
          totalAmount: pendingOrder.subtotal,
          shippingCost: pendingOrder.shippingCost,
          tax: 0,
          discount: pendingOrder.discount,
          finalAmount: pendingOrder.total,
          coupon_id: pendingOrder.couponId,
          discount_amount: pendingOrder.discount,
          shippingAddress: {
            firstName: (address && address.firstName) || "",
            lastName: (address && address.lastName) || "",
            phone: address?.phone || "",
            email: (address && address.email) || "",
            address: (address && address.address) || "",
            apartment: (address && address.apartment) || "",
            city: (address && address.city) || "",
            state: (address && address.state) || "",
            country: (address && address.country) || "",
            postalCode: (address && address.postalCode) || "",
          },
          billingAddress: {
            firstName: (address && address.firstName) || "",
            lastName: (address && address.lastName) || "",
            phone: address?.phone || "",
            email: (address && address.email) || "",
            address: (address && address.address) || "",
            apartment: (address && address.apartment) || "",
            city: (address && address.city) || "",
            state: (address && address.state) || "",
            country: (address && address.country) || "",
            postalCode: (address && address.postalCode) || "",
          },
          orderItems: {
            create: pendingOrder.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              unitPrice: Number(item.price),
              totalPrice: Number(item.price * item.quantity),
              productName: item.name || "Product Name",
              variantAttributes: item.selectedOptions || {},
              created_by: pendingOrder.customerId || "guest", // Set created_by
              created_ip: req.ip || "",
              company_id: "1",
            })),
          },
          paymentMethod: "sslcommerz",
          paymentStatus: "PAID",
          paymentGateway: "sslcommerz",
          sslcommerzTransactionId: tran_id,
          paymentMetadata: req.body,
          created_by: pendingOrder.customerId || "guest", // Changed from "guest" to "guest"
          created_ip: req.ip || "",
          company_id: "1",
          userId: pendingOrder.customerId || null, // Set to null for guest checkout
        },
      });

      await auditLog(
        "orders",
        order.id,
        "CREATE",
        null,
        order,
        pendingOrder.customerId || "guest",
        req
      );

      // Create payment transaction record
      const paymentTransaction = await prismaClient.paymentTransaction.create({
        data: {
          orderId: order.id,
          transactionId: tran_id,
          gateway: "sslcommerz",
          amount: pendingOrder.total,
          currency: "BDT",
          status: "success",
          metadata: req.body,
          created_by: pendingOrder.customerId || "guest",
          created_ip: req.ip || "",
        },
      });

      await auditLog(
        "payment_transactions",
        paymentTransaction.id,
        "CREATE",
        null,
        paymentTransaction,
        pendingOrder.customerId || "guest",
        req
      );

      // Update stock
      for (const item of pendingOrder.items) {
        const stock = await prismaClient.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || null,
            type: "SALE",
            reference: order.id,
            created_by: pendingOrder.customerId || "guest",
            created_ip: req.ip || "",
            company_id: "1",
          },
        });
        await auditLog(
          "stock_movements",
          stock.id,
          "CREATE",
          null,
          stock,
          pendingOrder.customerId || "guest",
          req
        );
      }

      // Delete pending order only after successful order creation
      await prismaClient.pendingOrder.delete({
        where: { transactionId: tran_id },
      });

      return res.redirect(
        `${config.frontendUrl}/payment-success?orderId=${order.id}`
      );
    } catch (error) {
      logError("Error processing SSLCommerz success", error);

      // Update pending order status to failed if there's an error
      if (req.body.tran_id) {
        await prismaClient.pendingOrder
          .update({
            where: { transactionId: req.body.tran_id },
            data: {
              status: "failed",
              updated_by: "guest",
              updated_ip: req.ip || "",
            },
          })
          .catch(() => {});
      }

      return res.redirect(`${config.frontendUrl}/payment-failed`);
    }
  }

  // Handle SSLCommerz failure
  static async sslCommerzFail(req, res) {
    try {
      const { tran_id } = req.body;

      if (tran_id) {
        // Update pending order status to failed
        await prismaClient.pendingOrder.update({
          where: { transactionId: tran_id },
          data: {
            status: "failed",
            updated_by: "guest",
            updated_ip: req.ip || "",
          },
        });

        // Create failed payment transaction record
        await prismaClient.paymentTransaction.create({
          data: {
            transactionId: tran_id,
            gateway: "sslcommerz",
            status: "failed",
            metadata: req.body,
            created_by: "guest",
            created_ip: req.ip || "",
          },
        });

        // Delete pending order
        await prismaClient.pendingOrder.delete({
          where: { transactionId: tran_id },
        });
      }

      return res.redirect(`${config.frontendUrl}/payment-failed`);
    } catch (error) {
      logError("Error processing SSLCommerz failure", error);
      return res.redirect(`${config.frontendUrl}/payment-failed`);
    }
  }

  // Handle SSLCommerz cancel
  static async sslCommerzCancel(req, res) {
    try {
      const { tran_id } = req.body;

      if (tran_id) {
        // Update pending order status to cancelled
        await prismaClient.pendingOrder.update({
          where: { transactionId: tran_id },
          data: {
            status: "cancelled",
            updated_by: "guest",
            updated_ip: req.ip || "",
          },
        });

        // Create cancelled payment transaction record
        await prismaClient.paymentTransaction.create({
          data: {
            transactionId: tran_id,
            gateway: "sslcommerz",
            status: "cancelled",
            metadata: req.body,
            created_by: "guest",
            created_ip: req.ip || "",
          },
        });

        // Delete pending order
        await prismaClient.pendingOrder.delete({
          where: { transactionId: tran_id },
        });
      }

      return res.redirect(`${config.frontendUrl}/payment-cancelled`);
    } catch (error) {
      logError("Error processing SSLCommerz cancellation", error);
      return res.redirect(`${config.frontendUrl}/payment-cancelled`);
    }
  }

  static async createCodOrder(req, res) {
    try {
      const { items, addressId, guestInfo, couponCode, shippingChargeId } =
        req.body;
      let customerId = req.customer?.id; // Make it optional for guest checkout

      // Check stock availability
      try {
        await validateStockAvailability(items);
      } catch (error) {
        return HttpResponse.badRequest(error.message).send(res);
      }

      // Validate shipping charge
      const shippingCharge = await prismaClient.shippingCharge.findFirst({
        where: { id: shippingChargeId, is_active: true },
      });

      // if (!shippingCharge) {
      //   return HttpResponse.badRequest("Invalid shipping method").send(res);
      // }

      // Get shipping address based on whether it's a guest or logged-in user
      let shippingAddress;
      if (customerId) {
        const address = await prismaClient.customerAddress.findUnique({
          where: { id: addressId },
        });
        if (!address) {
          return HttpResponse.badRequest("Invalid shipping address").send(res);
        }
        shippingAddress = address;
      } else {
        // Use guest shipping information
        shippingAddress = guestInfo;
      }

      if (!customerId) customerId = "guest";

      // Calculate subtotal
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Apply coupon if provided
      let appliedCoupon = null;

      if (couponCode) {
        const coupon = await prismaClient.coupon.findFirst({
          where: {
            code: couponCode,
            is_active: true,
            start_date: { lte: new Date() },
            end_date: { gte: new Date() },
            minimum_purchase: { lte: subtotal },
          },
        });

        if (!coupon) {
          return HttpResponse.badRequest("Invalid or expired coupon").send(res);
        }

        // Manual check for usage limit
        if (
          coupon.usage_limit !== null &&
          coupon.used_count >= coupon.usage_limit
        ) {
          return HttpResponse.badRequest("Coupon usage limit exceeded").send(
            res
          );
        }

        appliedCoupon = coupon;

        // Increment coupon usage
        await prismaClient.coupon.update({
          where: { id: coupon.id },
          data: {
            used_count: { increment: 1 },
          },
        });
      }

      // Generate unique order and transaction IDs
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const transactionId = `COD_${Date.now()}_${Math.floor(
        Math.random() * 1000
      )}`;

      // Create the order with coupon, shipping, and items
      const order = await prismaClient.order.create({
        data: {
          orderNumber,
          customerId: req.customer?.id,
          status: "PENDING",
          totalAmount: subtotal,
          shippingCost: Number((shippingCharge && shippingCharge.amount) || 0),
          tax: 0,
          discount: 0,
          finalAmount:
            subtotal + Number((shippingCharge && shippingCharge.amount) || 0),
          coupon_id: appliedCoupon?.id || null,
          discount_amount: 0,
          shippingAddress: {
            firstName: (shippingAddress && shippingAddress.firstName) || "",
            lastName: (shippingAddress && shippingAddress.lastName) || "",
            phone: (shippingAddress && shippingAddress.phone) || "",
            email: (shippingAddress && shippingAddress.email) || "",
            address: (shippingAddress && shippingAddress.address) || "",
            apartment: (shippingAddress && shippingAddress.apartment) || "",
            city: (shippingAddress && shippingAddress.city) || "",
            state: (shippingAddress && shippingAddress.state) || "",
            country: (shippingAddress && shippingAddress.country) || "",
            postalCode: (shippingAddress && shippingAddress.postalCode) || "",
          },
          billingAddress: {
            firstName: (shippingAddress && shippingAddress.firstName) || "",
            lastName: (shippingAddress && shippingAddress.lastName) || "",
            phone: (shippingAddress && shippingAddress.phone) || "",
            email: (shippingAddress && shippingAddress.email) || "",
            address: (shippingAddress && shippingAddress.address) || "",
            apartment: (shippingAddress && shippingAddress.apartment) || "",
            city: (shippingAddress && shippingAddress.city) || "",
            state: (shippingAddress && shippingAddress.state) || "",
            country: (shippingAddress && shippingAddress.country) || "",
            postalCode: (shippingAddress && shippingAddress.postalCode) || "",
          },
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: Number(item.price),
              totalPrice: Number(item.price * item.quantity),
              productName: item.name || "Product Name",
              variantAttributes: item.selectedOptions,
              created_by: req.customer?.id || "guest",
              created_ip: req.ip || "",
              company_id: "1",
            })),
          },
          paymentMethod: "cod",
          paymentStatus: "PENDING",
          paymentGateway: "cod",
          sslcommerzTransactionId: null,
          paymentMetadata: {
            ...req.body,
            couponCode: appliedCoupon?.code || null,
            couponDiscount: 0,
          },
          coupon: appliedCoupon || undefined,
          coupon_id: appliedCoupon?.id || undefined,
          created_by: req.customer?.id || "guest",
          created_ip: req.ip || "",
          company_id: "1",
          userId: req.customer?.id || null, // Only set if customer exists, otherwise null
        },
      });

      await auditLog(
        "orders",
        order.id,
        "CREATE",
        null,
        order,
        req.customer?.id || "guest",
        req
      );

      // Create a payment transaction record
      const transaction = await prismaClient.paymentTransaction.create({
        data: {
          orderId: order.id,
          transactionId,
          gateway: "cod",
          amount:
            subtotal + Number((shippingCharge && shippingCharge.amount) || 0),
          currency: "BDT",
          status: "pending",
          metadata: {
            paymentMethod: "cod",
            orderNumber: order.orderNumber,
            couponCode: appliedCoupon?.code || null,
            couponDiscount: 0,
          },
          created_by: req.customer?.id || "guest",
          created_ip: req.ip || "",
        },
      });

      await auditLog(
        "payment_transactions",
        transaction.id,
        "CREATE",
        null,
        transaction,
        req.customer?.id || "guest",
        req
      );

      // Update stock
      for (const item of items) {
        const stock = await prismaClient.stockMovement.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            type: "SALE",
            reference: order.id,
            created_by: req.customer?.id || "guest",
            created_ip: req.ip || "",
            company_id: "1",
          },
        });
        await auditLog(
          "stock_movements",
          stock.id,
          "CREATE",
          null,
          stock,
          req.customer?.id || "guest",
          req
        );
      }

      // Success response
      return HttpResponse.success("Order created successfully", order).send(
        res
      );
    } catch (error) {
      // Log the error for debugging
      logError("Error creating COD order", error);
      return HttpResponse.internalError("Failed to create order").send(res);
    }
  }

  static async confirmCodPayment(req, res) {
    try {
      const { orderId } = req.params;
      const customerId = req.customer.id;

      // Update order payment status
      const order = await prismaClient.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "COMPLETED",
          updated_by: customerId,
          updated_ip: req.ip || "",
        },
      });

      // Update transaction status
      await prismaClient.paymentTransaction.updateMany({
        where: { orderId },
        data: {
          status: "success",
          updated_by: customerId,
          updated_ip: req.ip || "",
        },
      });

      return HttpResponse.success("Payment confirmed successfully", order).send(
        res
      );
    } catch (error) {
      logError("Error confirming COD payment", error);
      return HttpResponse.internalError("Failed to confirm payment").send(res);
    }
  }

  static async getOrders(req, res) {
    try {
      const customerId = req.customer.id;

      const orders = await prismaClient.order.findMany({
        where: { customerId },
        select: {
          id: true,
          created_at: true,
          finalAmount: true,
          status: true,
          orderItems: {
            select: {
              quantity: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      const transformedOrders = orders.map((order) => ({
        id: order.id,
        date: order.created_at,
        total: order.finalAmount,
        status: order.status,
        items: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      }));

      return HttpResponse.success(
        "Orders retrieved successfully",
        transformedOrders
      ).send(res);
    } catch (error) {
      logError("Error fetching orders", error);
      return HttpResponse.internalError("Failed to fetch orders").send(res);
    }
  }

  static async getWishlist(req, res) {
    try {
      const userId = req.customer.id; // Assuming user is authenticated
      const wishlist = await prismaClient.wishlist.findMany({
        where: { userId },
        include: { product: true },
      });
      return HttpResponse.success(
        "Wishlist retrieved successfully",
        wishlist
      ).send(res);
    } catch (error) {
      logError("Error fetching wishlist", error);
      return HttpResponse.internalError("Failed to fetch wishlist").send(res);
    }
  }

  static async addToWishlist(req, res) {
    try {
      const userId = req.customer.id;
      const { productId } = req.body;
      const wishlistItem = await prismaClient.wishlist.create({
        data: { userId, productId },
      });
      return HttpResponse.success(
        "Product added to wishlist",
        wishlistItem
      ).send(res);
    } catch (error) {
      logError("Error adding to wishlist", error);
      return HttpResponse.internalError("Failed to add to wishlist").send(res);
    }
  }

  static async removeFromWishlist(req, res) {
    try {
      const userId = req.customer.id;
      const { productId } = req.params;
      await prismaClient.wishlist.deleteMany({
        where: { userId, productId },
      });
      return HttpResponse.success("Product removed from wishlist").send(res);
    } catch (error) {
      logError("Error removing from wishlist", error);
      return HttpResponse.internalError("Failed to remove from wishlist").send(
        res
      );
    }
  }

  static async updateProfile(req, res) {
    try {
      const customerId = req.customer.id;
      const { first_name, last_name, email, phone } = req.body;

      // Check if email is already taken by another user
      if (email) {
        const existingCustomer = await prismaClient.customer.findFirst({
          where: {
            email,
            id: { not: customerId },
          },
        });

        if (existingCustomer) {
          return HttpResponse.conflict("Email already in use").send(res);
        }
      }

      const updatedCustomer = await prismaClient.customer.update({
        where: { id: customerId },
        data: {
          first_name,
          last_name,
          email,
          phone,
          updated_by: customerId,
          updated_ip: req.ip || "",
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
        },
      });

      return HttpResponse.success(
        "Profile updated successfully",
        updatedCustomer
      ).send(res);
    } catch (error) {
      logError("Error updating profile", error);
      return HttpResponse.internalError("Failed to update profile").send(res);
    }
  }

  static async getProfile(req, res) {
    try {
      const customerId = req.customer.id;

      const customer = await prismaClient.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
        },
      });

      if (!customer) {
        return HttpResponse.notFound("Customer not found").send(res);
      }

      return HttpResponse.success(
        "Profile retrieved successfully",
        customer
      ).send(res);
    } catch (error) {
      logError("Error fetching profile", error);
      return HttpResponse.internalError("Failed to fetch profile").send(res);
    }
  }

  static async getBanners(req, res) {
    try {
      const banners = await prismaClient.banner.findMany({
        where: {
          is_active: true,
          OR: [
            {
              AND: [
                { start_date: { lte: new Date() } },
                { end_date: { gte: new Date() } },
              ],
            },
            {
              start_date: null,
              end_date: null,
            },
          ],
        },
        orderBy: { sequence_no: "asc" },
      });

      return HttpResponse.success("Banners fetched successfully", banners).send(
        res
      );
    } catch (error) {
      logError("Error fetching banners", error);
      return HttpResponse.internalError("Failed to fetch banners").send(res);
    }
  }

  static async getSpecialOffers(req, res) {
    try {
      const offers = await prismaClient.specialOffer.findMany({
        where: {
          is_active: true,
          start_date: { lte: new Date() },
          end_date: { gte: new Date() },
        },
        include: {
          products: true,
        },
      });

      return HttpResponse.success(
        "Special offers fetched successfully",
        offers
      ).send(res);
    } catch (error) {
      logError("Error fetching special offers", error);
      return HttpResponse.internalError("Failed to fetch special offers").send(
        res
      );
    }
  }

  static async getTopSellingProducts(req, res) {
    try {
      // First get products with their order counts
      const productsWithSales = await prismaClient.orderItem.groupBy({
        by: ["productId"],
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 8,
      });

      // Get the product IDs in order of most sales
      const topProductIds = productsWithSales.map((item) => item.productId);

      // Fetch full product details for these IDs
      const products = await prismaClient.product.findMany({
        where: {
          id: {
            in: topProductIds,
          },
          status: "active",
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              rating: true,
              verified: true,
              companies: {
                select: {
                  id: true,
                  company_name: true,
                },
              },
            },
          },
        },
      });

      // Sort products to match the original sales order
      const sortedProducts = topProductIds
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean);

      // Process products to include offer prices
      const processedProducts = await Promise.all(
        sortedProducts.map(async (product) => {
          const companyOffers = await prismaClient.specialOffer.findMany({
            where: {
              AND: [
                {
                  company_id: {
                    in: product.seller.companies.map((company) => company.id),
                  },
                },
                { is_active: true },
                { start_date: { lte: new Date() } },
                { end_date: { gte: new Date() } },
                {
                  OR: [
                    { products: { none: {} } },
                    { products: { some: { id: product.id } } },
                  ],
                },
              ],
            },
            orderBy: {
              discount: "desc",
            },
          });

          let bestDiscount = 0;
          let finalPrice = Number(product.price);

          if (companyOffers.length > 0) {
            bestDiscount = Number(companyOffers[0].discount);
            finalPrice = Number(product.price) * (1 - bestDiscount / 100);
          }

          return {
            ...product,
            salePrice:
              companyOffers.length > 0 ? finalPrice : product.salePrice,
            discount:
              companyOffers.length > 0 ? bestDiscount : product.salePercentage,
            hasOffer:
              companyOffers.length > 0 ? bestDiscount > 0 : product.onSale,
          };
        })
      );

      return HttpResponse.success(
        "Top selling products retrieved successfully",
        processedProducts
      ).send(res);
    } catch (error) {
      logError("Error fetching top selling products", error);
      return HttpResponse.internalError(
        "Failed to fetch top selling products"
      ).send(res);
    }
  }

  static async getTrendingProducts(req, res) {
    try {
      const products = await prismaClient.product.findMany({
        where: {
          is_active: true,
          rating: { gte: 4.0 }, // Products with high ratings
          reviewCount: { gte: 5 }, // With minimum number of reviews
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          reviews: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
        take: 8,
      });

      return HttpResponse.success(
        "Trending products retrieved successfully",
        products
      ).send(res);
    } catch (error) {
      logError("Error fetching trending products", error);
      return HttpResponse.internalError(
        "Failed to fetch trending products"
      ).send(res);
    }
  }

  static async getRecentProducts(req, res) {
    try {
      // Get most recent active products
      const products = await prismaClient.product.findMany({
        where: {
          status: "active",
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              rating: true,
              verified: true,
              companies: {
                select: {
                  id: true,
                  company_name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc", // Most recent first
        },
        take: 8, // Limit to 8 products
      });

      // Process products to include offer prices
      const processedProducts = await Promise.all(
        products.map(async (product) => {
          // Get all active special offers for the product's seller companies
          const companyOffers = await prismaClient.specialOffer.findMany({
            where: {
              AND: [
                {
                  company_id: {
                    in: product.seller.companies.map((company) => company.id),
                  },
                },
                { is_active: true },
                { start_date: { lte: new Date() } },
                { end_date: { gte: new Date() } },
                {
                  OR: [
                    { products: { none: {} } }, // Global offers
                    { products: { some: { id: product.id } } }, // Product-specific offers
                  ],
                },
              ],
            },
            orderBy: {
              discount: "desc", // Get highest discount first
            },
          });

          // Calculate best discount and final price
          let bestDiscount = 0;
          let finalPrice = Number(product.price);

          if (companyOffers.length > 0) {
            bestDiscount = Number(companyOffers[0].discount);
            finalPrice = Number(product.price) * (1 - bestDiscount / 100);
          }

          // Return product with offer information
          return {
            ...product,
            salePrice:
              companyOffers.length > 0 ? finalPrice : product.salePrice,
            discount:
              companyOffers.length > 0 ? bestDiscount : product.salePercentage,
            hasOffer:
              companyOffers.length > 0 ? bestDiscount > 0 : product.onSale,
          };
        })
      );

      return HttpResponse.success(
        "Recent products retrieved successfully",
        processedProducts
      ).send(res);
    } catch (error) {
      logError("Error fetching recent products", error);
      return HttpResponse.internalError("Failed to fetch recent products").send(
        res
      );
    }
  }

  static async getOfferedProducts(req, res) {
    try {
      const products = await prismaClient.product.findMany({
        where: {
          status: "active",
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              rating: true,
              verified: true,
              companies: {
                select: {
                  id: true,
                  company_name: true,
                },
              },
            },
          },
        },
        take: 8,
      });

      // Process products and filter those with active offers
      const processedProducts = await Promise.all(
        products.map(async (product) => {
          const companyOffers = await prismaClient.specialOffer.findMany({
            where: {
              AND: [
                {
                  company_id: {
                    in: product.seller.companies.map((company) => company.id),
                  },
                },
                { is_active: true },
                { start_date: { lte: new Date() } },
                { end_date: { gte: new Date() } },
                {
                  OR: [
                    { products: { none: {} } },
                    { products: { some: { id: product.id } } },
                  ],
                },
              ],
            },
            orderBy: {
              discount: "desc",
            },
          });

          let bestDiscount = 0;
          let finalPrice = Number(product.price);

          if (companyOffers.length > 0) {
            bestDiscount = Number(companyOffers[0].discount);
            finalPrice = Number(product.price) * (1 - bestDiscount / 100);
          }

          return {
            ...product,
            salePrice:
              companyOffers.length > 0 ? finalPrice : product.salePrice,
            discount:
              companyOffers.length > 0 ? bestDiscount : product.salePercentage,
            hasOffer:
              companyOffers.length > 0 ? bestDiscount > 0 : product.onSale,
          };
        })
      );

      // Filter only products with active offers
      const offeredProducts = processedProducts.filter(
        (product) => product.hasOffer
      );

      return HttpResponse.success(
        "Offered products fetched successfully",
        offeredProducts
      ).send(res);
    } catch (error) {
      logError("Error fetching offered products", error);
      return HttpResponse.internalError(
        "Failed to fetch offered products"
      ).send(res);
    }
  }

  static async validateCoupon(req, res) {
    try {
      const { code } = req.body;

      const coupon = await prismaClient.coupon.findFirst({
        where: {
          code: code,
          is_active: true,
          start_date: {
            lte: new Date(),
          },
          end_date: {
            gte: new Date(),
          },
        },
      });

      if (!coupon) {
        return HttpResponse.notFound("Invalid or expired coupon code").send(
          res
        );
      }

      return HttpResponse.success("Coupon validated successfully", {
        discount: coupon.discount_amount,
        type: coupon.discount_type,
        minimumPurchase: coupon.minimum_purchase,
      }).send(res);
    } catch (error) {
      return HttpResponse.internalError("Failed to validate coupon").send(res);
    }
  }

  static async getShippingCharges(req, res) {
    try {
      const charges = await prismaClient.shippingCharge.findMany({
        where: {
          is_active: true,
        },
        orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
      });

      return HttpResponse.success(
        "Shipping charges retrieved successfully",
        charges
      ).send(res);
    } catch (error) {
      logError("Error fetching shipping charges", error);
      return HttpResponse.internalError(
        "Failed to fetch shipping charges"
      ).send(res);
    }
  }

  static async getCoupon(req, res) {
    try {
      const coupon = await prismaClient.coupon.findFirst({
        where: {
          is_active: true,
        },
      });

      return HttpResponse.success(
        "Coupon Code retrieved successfully",
        coupon
      ).send(res);
    } catch (error) {
      logError("Error fetching coupon code", error);
      return HttpResponse.internalError("Failed to fetch coupon code").send(
        res
      );
    }
  }

  static async SellerRegistration(req, res) {
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
            slug: formattedData.name,
            logo: logoUrl,

            created_by: "seller-reg",
            created_ip: req.ip,
            company_id: "1",
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
          "seller-reg",
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
  }

  static async SubmitReview(req, res) {
    try {
      const { rating, review, productId, variantId } = req.body;
      const result = await prismaClient.$transaction(async (tx) => {
        const reviewTx = await tx.review.create({
          data: {
            rating: rating,
            comment: review,
            userId: (req.customer && req.customer.id) || "Annonymous",
            userName: req.customer
              ? req.customer.firstName +
                (req.lastName ? " " + req.lastName : "")
              : "Anonymous",
            helpful: 1,
            productId: productId,
            variantId: variantId,
          },
        });

        await auditLog(
          "reviews",
          reviewTx.id,
          "CREATE",
          null,
          reviewTx,
          (req.customer && req.customer.id) || "Annonymous",
          req
        );

        return reviewTx;
      });

      return HttpResponse.success(
        "Review submitteed successfully",
        result
      ).send(res);
    } catch (error) {
      console.error("Submit review error:", error);
      if (req.files) {
        await deleteUploadedFiles(req.files);
      }
      return HttpResponse.internalError(
        "Failed to create review",
        error.message
      ).send(res);
    }
  }

  static async getCompanyInfo(req, res) {
    try {
      const companyInfo = await prismaClient.company.findFirst({
        where: {
          is_active: true,
        },
        include: {
          CompanyAdditionalInfo: true,
        },
      });

      if (!companyInfo) {
        return HttpResponse.notFound("Company information not found").send(res);
      }

      return HttpResponse.success(
        "Company information retrieved successfully",
        companyInfo
      ).send(res);
    } catch (error) {
      logError("Error fetching company information", error);
      return HttpResponse.internalError(
        "Failed to fetch company information"
      ).send(res);
    }
  }

  static async getPageBySlug(req, res) {
    try {
      const { slug } = req.params;
      const page = await prismaClient.page.findUnique({
        where: {
          slug: slug,
          is_active: true,
        },
        include: {
          sections: {
            where: {
              is_active: true,
            },
            orderBy: {
              sequence_no: "asc",
            },
          },
        },
      });

      if (!page) {
        return HttpResponse.notFound("Page not found").send(res);
      }

      return HttpResponse.success("Page retrieved successfully", page).send(
        res
      );
    } catch (error) {
      logError("Error fetching page", error);
      return HttpResponse.internalError("Failed to fetch page").send(res);
    }
  }

  static async getFaqs(req, res) {
    try {
      const faqs = await prismaClient.faq.findMany({
        where: {
          is_active: true,
        },
        orderBy: [{ category: "asc" }, { sequence_no: "asc" }],
      });

      return HttpResponse.success("FAQs retrieved successfully", faqs).send(
        res
      );
    } catch (error) {
      logError("Error fetching FAQs", error);
      return HttpResponse.internalError("Failed to fetch FAQs").send(res);
    }
  }
}
