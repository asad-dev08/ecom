import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import api from "../services/api";
import { Spin } from "antd";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  productName: string;
  variantAttributes: Record<string, any>;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  finalAmount: string;
  created_at: string;
  orderItems: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: string;
  shippingCost: string;
  discount: string | null;
  paymentStatus: string;
  paymentMetadata: {
    subtotal: number;
    shippingCost: number;
  };
}

export const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/${orderNumber}`);
        setOrder(response.data.data);
      } catch (error) {
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || "Order not found"}</p>
          <Link
            to="/"
            className="text-secondary-600 hover:text-secondary-700 font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 text-secondary-600" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for your order. We'll send you a confirmation email
            shortly.
          </p>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Order Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Order Number</p>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Date Placed</p>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium capitalize">
                  {order.status.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Payment Status</p>
                <p className="font-medium capitalize">
                  {order.paymentStatus.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
            <p className="font-medium">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p className="text-gray-600">{order.shippingAddress.email}</p>
            <p className="text-gray-600">{order.shippingAddress.phone}</p>
            <p className="text-gray-600">
              {order.shippingAddress.address}
              {order.shippingAddress.apartment &&
                `, ${order.shippingAddress.apartment}`}
            </p>
            <p className="text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-gray-600">{order.shippingAddress.country}</p>
          </div>

          {/* Order Items */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    {Object.entries(item.variantAttributes || {}).map(
                      ([key, value]) => (
                        <p key={key} className="text-sm text-gray-600">
                          {key}:{" "}
                          {typeof value === "object"
                            ? value.name || value.value
                            : value}
                        </p>
                      )
                    )}
                  </div>
                  <p className="font-medium">
                    ${Number(item.totalPrice).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.paymentMetadata.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${Number(order.shippingCost).toFixed(2)}</span>
              </div>
              {order.discount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>${Number(order.finalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-x-4 text-center">
          <Link
            to="/profile?tab=orders"
            className="inline-block px-6 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
          >
            View All Orders
          </Link>
          <Link
            to="/products"
            className="inline-block px-6 py-2 border border-secondary-600 text-secondary-600 rounded-lg hover:bg-secondary-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};
