import { Radio } from "antd";
import { CreditCard, Wallet } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useCartStore } from "../../store/useCartStore";
import { ShippingAddress } from "../../services/orderService";

interface PaymentStepProps {
  selectedMethod: string | null;
  onMethodSelect: (method: string) => void;
  items: any[];
  addressId: string | null;
  shippingAddress: ShippingAddress;
  guestInfo?: any;
  isAuthenticated?: boolean;
  appliedCoupon?: {
    code: string;
    discount: number;
    type: "percentage" | "fixed";
  } | null;
  selectedShippingCharge: any;
}

interface OrderResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
  };
}

export const PaymentStep = ({
  selectedMethod,
  onMethodSelect,
  items,
  addressId,
  shippingAddress,
  guestInfo,
  isAuthenticated = false,
  appliedCoupon,
  selectedShippingCharge,
}: PaymentStepProps) => {
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const calculateDiscount = (
    subtotal: number,
    coupon: { type: string; discount: number }
  ) => {
    if (coupon.type === "percentage") {
      return (subtotal * coupon.discount) / 100;
    }
    return coupon.discount;
  };

  const calculateTotal = (
    subtotal: number,
    shippingCost: number,
    coupon: { type: string; discount: number } | null
  ) => {
    const discount = coupon ? calculateDiscount(subtotal, coupon) : 0;
    return subtotal + shippingCost - discount;
  };

  const handlePayment = async () => {
    try {
      if (!selectedMethod) {
        toast.error("Please select a payment method");
        return;
      }

      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          selectedOptions: item.selectedOptions,
        })),
        addressId: isAuthenticated ? addressId : null,
        guestInfo: !isAuthenticated ? guestInfo : null,
        shippingAddress: isAuthenticated ? shippingAddress : null,
        paymentMethod: selectedMethod,
        couponCode: appliedCoupon?.code,
        subtotal,
        shippingChargeId:
          (selectedShippingCharge && selectedShippingCharge.id) || "",
        shippingCost: Number(
          (selectedShippingCharge && selectedShippingCharge.amount) || 0
        ),
        discount: appliedCoupon
          ? calculateDiscount(subtotal, appliedCoupon)
          : 0,
        total: calculateTotal(
          subtotal,
          Number(
            (selectedShippingCharge && selectedShippingCharge.amount) || 0
          ),
          appliedCoupon!
        ),
      };

      if (selectedMethod === "sslcommerz") {
        try {
          const response = await api.post(
            "/orders/create-sslcommerz",
            orderData
          );
          clearCart();
          localStorage.removeItem("cart");
          window.location.href = response.data.data.redirectUrl;
        } catch (error: any) {
          toast.dismiss();
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to create order"
          );
        }
      } else if (selectedMethod === "cod") {
        try {
          toast.loading("Processing your order...");
          const response = await api.post<OrderResponse>(
            "/orders/create-cod",
            orderData
          );
          toast.dismiss();

          if (response.data?.statusCode === 200) {
            toast.success(response.data.message);
            clearCart();
            localStorage.removeItem("cart");
            window.location.href = `/order-success/${response.data.data.orderNumber}`;
          }
        } catch (error: any) {
          toast.dismiss();
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to create order"
          );
        }
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error("Failed to process payment. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Select Payment Method</h3>
        <Radio.Group
          onChange={(e) => onMethodSelect(e.target.value)}
          value={selectedMethod}
          className="space-y-4 w-full"
        >
          <Radio
            value="sslcommerz"
            className="w-full [&_.ant-radio+span]:!w-full [&_.ant-radio+span]:!inline-block"
          >
            <div
              className={`w-full border p-4 rounded-lg hover:border-primary-500 transition-all duration-200 ${
                selectedMethod === "sslcommerz"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="font-medium">SSLCommerz</p>
                  <p className="text-sm text-gray-600">
                    Pay securely with your credit/debit card or mobile banking
                  </p>
                </div>
              </div>
            </div>
          </Radio>

          <Radio
            value="cod"
            className="w-full [&_.ant-radio+span]:!w-full [&_.ant-radio+span]:!inline-block"
          >
            <div
              className={`w-full border p-4 rounded-lg hover:border-primary-500 transition-all duration-200 ${
                selectedMethod === "cod"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">
                    Pay when you receive your order
                  </p>
                </div>
              </div>
            </div>
          </Radio>
        </Radio.Group>
      </div>

      <button
        onClick={handlePayment}
        disabled={!selectedMethod}
        className="w-full bg-secondary-600 text-white py-3 rounded-lg hover:bg-secondary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Proceed to Payment
      </button>
    </div>
  );
};
