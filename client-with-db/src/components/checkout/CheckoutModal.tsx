import { useState } from "react";
import { Modal, Steps, message } from "antd";
import { AddressStep } from "./AddressStep";
import { PaymentStep } from "./PaymentStep";
import { OrderSummary } from "./OrderSummary";
import { ShippingAddress } from "../../services/orderService";
import { useCustomerAuth } from "../../hooks/useCustomerAuth";
import { GuestShippingInfo } from "./AddressStep";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  items: any[];
}

export const CheckoutModal = ({ open, onClose, items }: CheckoutModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [selectedShippingAddress, setSelectedShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: "percentage" | "fixed";
  } | null>(null);

  const [shippingCharge, setShippingCharge] = useState<any>(null);

  const { isAuthenticated } = useCustomerAuth();

  const handleCouponApplied = (couponData: {
    code: string;
    discount: number;
    type: "percentage" | "fixed";
  }) => {
    setAppliedCoupon(couponData);
  };
  const handleShippingChargeApplied = (charge: any) => {
    setShippingCharge(charge);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (isAuthenticated) {
        if (!selectedAddress) {
          message.error("Please select a delivery address");
          return;
        }
      } else {
        // Validate guest information
        if (!guestInfo.phone) {
          message.error("Please provide a phone number");
          return;
        }
        // if (!guestInfo.address) {
        //   message.error("Please provide a delivery address");
        //   return;
        // }
        // if (!guestInfo.city || !guestInfo.state) {
        //   message.error("Please provide your city and state");
        //   return;
        // }

        // Create shipping address from guest info
        const shippingAddress: ShippingAddress = {
          fullName: `${guestInfo.firstName} ${guestInfo.lastName}`,
          phone: guestInfo.phone,
          address: `${guestInfo.address}${
            guestInfo.apartment ? `, ${guestInfo.apartment}` : ""
          }`,
          city: guestInfo.city,
          postalCode: guestInfo.postalCode,
        };
        setSelectedShippingAddress(shippingAddress);
      }
    }

    if (currentStep === 1 && !selectedPaymentMethod) {
      message.error("Please select a payment method");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: "Address",
      content: (
        <AddressStep
          selectedAddress={selectedAddress}
          onAddressSelect={setSelectedAddress}
          onShippingAddressSelect={setSelectedShippingAddress}
          isAuthenticated={isAuthenticated}
          onGuestInfoChange={setGuestInfo}
          guestInfo={guestInfo}
        />
      ),
    },
    {
      title: "Payment",
      content: (
        <PaymentStep
          selectedMethod={selectedPaymentMethod}
          onMethodSelect={setSelectedPaymentMethod}
          items={items}
          addressId={selectedAddress}
          shippingAddress={selectedShippingAddress!}
          guestInfo={guestInfo}
          isAuthenticated={isAuthenticated}
          appliedCoupon={appliedCoupon}
          selectedShippingCharge={shippingCharge}
        />
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Checkout"
      footer={null}
      width={1000}
    >
      <div className="py-4">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Steps
              current={currentStep}
              items={steps.map((item) => ({ title: item.title }))}
              className="mb-8"
            />
            <div className="mt-4">{steps[currentStep].content}</div>
            <div className="flex justify-between mt-8">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
              )}
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 ml-auto"
                >
                  Next
                </button>
              )}
            </div>
          </div>
          <div className="col-span-1">
            <OrderSummary
              items={items}
              onCouponApplied={handleCouponApplied}
              onShippingChargeApplied={handleShippingChargeApplied}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
