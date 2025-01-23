import { prismaClient } from "../index.js";
import { HttpResponse } from "../utils/httpResponse.js";

export const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.is_admin;

    // Base where clause
    const whereClause = isAdmin ? {} : { company_id: user.company_id };

    // Get previous month's data for comparison
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const previousWhereClause = {
      ...whereClause,
      created_at: {
        lt: new Date(),
        gte: lastMonth,
      },
    };

    const [
      // Current counts
      totalProducts,
      totalCategories,
      totalBrands,
      totalSellers,
      totalCompanies,
      totalOrders,

      // Previous month counts
      previousProducts,
      previousCategories,
      previousBrands,
      previousSellers,
      previousOrders,

      // Detailed data
      recentProducts,
      topSellingProducts,
      productsByCategory,
      salesByDate,
      lowStockProducts,
      productStatuses,
      companyStats,

      // Recent orders
      recentOrders,

      // Orders and revenue by date
      ordersByDate,
    ] = await Promise.all([
      // Current total counts
      prismaClient.product.count({ where: whereClause }),
      prismaClient.category.count({ where: whereClause }),
      prismaClient.brand.count({ where: whereClause }),
      prismaClient.seller.count({ where: whereClause }),
      prismaClient.company.count(
        isAdmin ? {} : { where: { id: user.company_id } }
      ),
      prismaClient.order.count({ where: whereClause }),

      // Previous month counts
      prismaClient.product.count({ where: previousWhereClause }),
      prismaClient.category.count({ where: previousWhereClause }),
      prismaClient.brand.count({ where: previousWhereClause }),
      prismaClient.seller.count({ where: previousWhereClause }),
      prismaClient.order.count({ where: previousWhereClause }),

      // Recent products
      prismaClient.product.findMany({
        where: whereClause,
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          category: true,
          seller: true,
          brand: true,
        },
      }),

      // Top selling products
      prismaClient.product.findMany({
        where: whereClause,
        take: 5,
        orderBy: { stock: "asc" },
        include: {
          category: true,
          seller: true,
          brand: true,
        },
      }),

      // Products by category
      prismaClient.category.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),

      // Sales by date
      prismaClient.product.groupBy({
        by: ["created_at"],
        where: whereClause,
        _count: true,
        take: 30,
        orderBy: {
          created_at: "asc",
        },
      }),

      // Low stock products
      prismaClient.product.findMany({
        where: {
          ...whereClause,
          stock: { lt: 10 },
        },
        take: 10,
        include: {
          category: true,
          seller: true,
          brand: true,
        },
      }),

      // Product status distribution
      prismaClient.product.groupBy({
        by: ["status"],
        where: whereClause,
        _count: true,
      }),

      // Company-wise stats (admin only)
      isAdmin
        ? prismaClient.company.findMany({
            include: {
              _count: {
                select: {
                  CompanyAdditionalInfo: true,
                },
              },
              seller: true,
            },
            take: 5,
            orderBy: {
              created_at: "desc",
            },
          })
        : null,

      // Recent orders
      prismaClient.order.findMany({
        where: whereClause,
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          customer: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
          orderItems: {
            // include: {
            //   productName: true,
            //   totalPrice: true,
            // },
          },
        },
      }),

      // Orders and revenue by date
      prismaClient.order.groupBy({
        by: ["created_at"],
        where: whereClause,
        _count: true,
        _sum: {
          finalAmount: true,
        },
        take: 30,
        orderBy: {
          created_at: "asc",
        },
      }),
    ]);

    const responseData = {
      counts: {
        products: totalProducts,
        previousProducts,
        categories: totalCategories,
        previousCategories,
        brands: totalBrands,
        previousBrands,
        sellers: totalSellers,
        previousSellers,
        companies: totalCompanies,
        orders: totalOrders,
        previousOrders,
      },
      recentProducts: recentProducts.map((product) => ({
        ...product,
        company_name: isAdmin
          ? product.seller?.company_name || "N/A"
          : undefined,
      })),
      topSellingProducts: topSellingProducts.map((product) => ({
        ...product,
        company_name: isAdmin
          ? product.seller?.company_name || "N/A"
          : undefined,
      })),
      productsByCategory: productsByCategory.map((cat) => ({
        name: cat.name,
        count: cat._count.products,
      })),
      salesByDate: salesByDate.map((item) => ({
        date: item.created_at,
        count: item._count,
      })),
      lowStockProducts: lowStockProducts.map((product) => ({
        ...product,
        company_name: isAdmin
          ? product.seller?.company_name || "N/A"
          : undefined,
      })),
      productStatuses: productStatuses.map((status) => ({
        status: status.status,
        count: status._count,
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer_name: `${
          (order.customer && order.customer.first_name) || ""
        } ${(order.customer && order.customer.last_name) || ""} ${
          (order.customer && order.customer.phone) || ""
        }`,
        total_amount: order.finalAmount,
        status: order.status,
        payment_status: order.paymentStatus,
        created_at: order.created_at,
      })),
      ordersByDate: ordersByDate.map((item) => ({
        date: item.created_at,
        orderCount: item._count,
        revenue: item._sum.finalAmount || 0,
      })),
    };

    // Add admin-specific data
    if (isAdmin && companyStats) {
      responseData.adminStats = {
        companyStats: companyStats.map((company) => ({
          id: company.id,
          name: company.company_name,
          additionalInfoCount: company._count.CompanyAdditionalInfo,
          seller: company.seller,
          registrationNumber: company.registration_number,
          isActive: company.is_active,
        })),
        // Add more admin-specific stats as needed
      };
    }

    return HttpResponse.success(
      "Dashboard stats fetched successfully",
      responseData
    ).send(res);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return HttpResponse.internalError(
      "Failed to fetch dashboard stats",
      error.message
    ).send(res);
  }
};
