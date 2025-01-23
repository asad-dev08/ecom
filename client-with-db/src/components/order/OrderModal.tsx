import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  OrderData,
  ShippingAddress,
  orderService,
} from "../../services/orderService";
import { useCartStore } from "../../store/useCartStore";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: Partial<OrderData>;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  orderData,
}) => {
  const [step, setStep] = useState<"address" | "payment">("address");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const clearCart = useCartStore((state) => state.clearCart);

  const validateAddress = () => {
    const fields = Object.entries(shippingAddress);
    for (const [key, value] of fields) {
      if (!value.trim()) {
        toast.error(
          `Please enter your ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return false;
      }
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (validateAddress()) {
      setStep("payment");
    }
  };

  const handlePaymentMethod = async (paymentMethod: string) => {
    try {
      const finalOrderData: OrderData = {
        ...(orderData as OrderData),
        shippingAddress,
        paymentMethod,
      };

      // Create order
      const order = await orderService.createOrder(finalOrderData);

      // Process payment
      // const payment = await orderService.processPayment(
      //   order.id,
      //   paymentMethod
      // );

      // Clear cart and show success message
      clearCart();
      localStorage.removeItem("cart"); // Directly clear localStorage as well

      toast.success("Order placed successfully!");
      onClose();

      // Redirect to order confirmation page
      window.location.href = `/order-confirmation/${order.id}`;
    } catch (error) {
      toast.error("Failed to process order. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {step === "address" ? "Shipping Address" : "Select Payment Method"}
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === "address" ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              value={shippingAddress.fullName}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  fullName: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
            {/* Add other address fields */}
            <button
              onClick={handleProceedToPayment}
              className="w-full py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
            >
              Proceed to Payment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {["Cash on Delivery", "SSLCommerz", "Nagad", "bKash", "Card"].map(
              (method) => (
                <button
                  key={method}
                  onClick={() => handlePaymentMethod(method)}
                  className="w-full p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                >
                  <span>{method}</span>
                  <span className="text-gray-500">→</span>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
