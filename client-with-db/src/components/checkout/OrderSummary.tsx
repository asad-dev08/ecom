import { Divider, Select } from "antd";
import { BASE_URL } from "../../utils/actionTypes";
import api from "../../services/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  thumbnail: string;
  selectedOptions?: Record<string, string>;
}

interface OrderSummaryProps {
  items: OrderItem[];
  className?: string;
  onCouponApplied?: (couponData: {
    code: string;
    discount: number;
    type: "percentage" | "fixed";
  }) => void;
  onShippingChargeApplied?: (shippingCharge: any) => void;
}

export const OrderSummary = ({
  items,
  className = "",
  onCouponApplied,onShippingChargeApplied
}: OrderSummaryProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [selectedShippingCharge, setSelectedShippingCharge] =
    useState<any>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: "percentage" | "fixed";
  } | null>(null);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Fetch shipping charges
  const { data: shippingCharges = [] } = useQuery({
    queryKey: ["shipping-charges"],
    queryFn: async () => {
      const response = await api.get("/shipping-charges");
      return response.data.data;
    },
  });
  const subtotal = calculateSubtotal();

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.type === "percentage"
      ? (subtotal * appliedCoupon.discount) / 100
      : appliedCoupon.discount;
  };

  const shippingCost = selectedShippingCharge
  ? Number(selectedShippingCharge.amount)
  : shippingCharges[0]?.amount || 0;
  const discount = calculateDiscount();
  const total = subtotal + parseFloat(shippingCost) - discount;

  
  useEffect(() => {
    if (total > 0) {
      const shippingCharge = shippingCharges && shippingCharges.length > 0&&
      shippingCharges.find((charge: any) => (total >= parseFloat(charge.min_amount) && total <= parseFloat(charge.max_amount)));
      if (shippingCharge) {
        setSelectedShippingCharge(shippingCharge);
        onShippingChargeApplied?.(shippingCharge);
      }
    }
  }, [total]);

  const handleApplyCoupon = async () => {
    try {
      const response = await api.post("/coupons/validate", {
        code: couponCode,
      });

      const couponData = {
        code: couponCode,
        discount: response.data.data.discount,
        type: response.data.data.type,
      };

      setAppliedCoupon(couponData);
      onCouponApplied?.(couponData);
      toast.success("Coupon applied successfully!");
    } catch (error) {
      toast.error("Invalid coupon code");
    }
  };

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>

      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId}`}
            className="flex space-x-4"
          >
            <div className="relative w-20 h-20 flex-shrink-0">
              <img
                src={`${BASE_URL}/${item.thumbnail}`}
                alt={item.name}
                className="object-cover rounded-md w-full h-full"
              />
            </div>
            <div className="flex-grow">
              <h4 className="font-medium">{item.name}</h4>
              {item.selectedOptions &&
                Object.entries(item.selectedOptions).length > 0 && (
                  <p className="text-sm text-gray-600">
                    {Object.entries(item.selectedOptions).map(
                      ([key, option]: [string, any]) => (
                        <div key={key}>
                          {option.name}:{" "}
                          <span className="font-medium">{option.value}</span>
                        </div>
                      )
                    )}
                  </p>
                )}
              <div className="flex justify-between mt-1">
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                <p className="font-medium">
                  $ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      {/* Coupon Code */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleApplyCoupon}
            className="px-4 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700"
          >
            Apply
          </button>
        </div>
      </div>
{/* Shipping Method Selection */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Shipping Method</h3>
              <Select
              disabled
                className="w-full"
                placeholder="Select shipping method"
                value={selectedShippingCharge?.id }
                onChange={(value) =>
                  setSelectedShippingCharge(
                    shippingCharges.find((charge: any) => charge.id === value)
                  )
                }
              >
                {shippingCharges.map((charge: any) => (
                  <Select.Option key={charge.id} value={charge.id}>
                    {charge.name} - ${Number(charge.amount).toFixed(2)}
                  </Select.Option>
                ))}
              </Select>
            </div>
      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>$ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>${parseFloat(shippingCost).toFixed(2)}</span>
        </div>
        {appliedCoupon && discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <Divider />
        <div className="flex justify-between font-medium text-lg">
          <span>Total</span>
          <span>$ {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery Information */}
      {/* <div className="mt-6 bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium mb-2">Delivery Information</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Delivery within 3-7 business days</li>
          <li>• Free shipping for orders over ৳1000</li>
          <li>• Standard shipping fee: ৳60</li>
        </ul>
      </div> */}

      {/* Return Policy */}
      {/* <div className="mt-4 text-sm text-gray-500">
        <p>
          7 days easy return policy.{" "}
          <a
            href="/return-policy"
            className="text-primary-600 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              // Handle return policy click - maybe open a modal or navigate
            }}
          >
            See our return policy
          </a>
        </p>
      </div> */}

      {/* Secure Payment */}
      <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500 bg-secondary-100 py-3 rounded">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>Secure Checkout</span>
      </div>
    </div>
  );
};
