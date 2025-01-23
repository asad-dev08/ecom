import { prismaClient } from "../index.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";

export const getOrders = async (req, res) => {
  try {
    
    const orders = await prismaClient.order.findMany({
      where: {
        customerId: req.user.id, // Assuming we have the customer ID in the request
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.orderNumber,
      date: order.created_at,
      total: Number(order.finalAmount),
      status: order.status,
      items: order.orderItems.length,
    }));

    return HttpResponse.success(
      "Orders fetched successfully",
      formattedOrders
    ).send(res);
  } catch (error) {
    return HttpResponse.internalError(
      "Failed to fetch orders",
      error.message
    ).send(res);
  }
};

export const getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prismaClient.order.findUnique({
      where: { orderNumber: id },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return HttpResponse.notFound("Order not found").send(res);
    }

    return HttpResponse.success("Order fetched successfully", order).send(res);
  } catch (error) {
    return HttpResponse.internalError(
      "Failed to fetch order details",
      error.message
    ).send(res);
  }
};
