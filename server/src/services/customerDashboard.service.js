import { prismaClient } from "../index.js";

export class CustomerDashboardService {
  static async getDashboardData(customerId) {
    const [cartItems, compareList, orders] = await Promise.all([
      // prismaClient.cartItem.count({
      //   where: { customer_id: customerId },
      // }),
      // prismaClient.compareList.count({
      //   where: { customer_id: customerId },
      // }),
      prismaClient.order.count({
        where: { customerId: customerId },
      }),
    ]);

    return {
      cartItemsCount: [], // cartItems,
      compareListCount: [], // compareList,
      orderCount: orders,
    };
  }
}
