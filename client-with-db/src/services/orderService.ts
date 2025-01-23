import axios from "axios";

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  selectedOptions?: Record<string, string>;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface OrderData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponCode?: string;
}

export const orderService = {
  createOrder: async (orderData: OrderData) => {
    const response = await axios.post("/orders", orderData);
    return response.data;
  },

  processPayment: async (orderId: string, paymentMethod: string) => {
    const response = await axios.post(`/orders/${orderId}/payment`, {
      paymentMethod,
    });
    return response.data;
  },
};
