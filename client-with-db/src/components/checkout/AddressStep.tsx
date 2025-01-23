import { useEffect, useState } from "react";
import { Radio, message } from "antd";
import api from "../../services/api";
import { ShippingAddress } from "../../services/orderService";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface GuestShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface AddressStepProps {
  selectedAddress: string | null;
  onAddressSelect: (id: string) => void;
  onShippingAddressSelect: (address: ShippingAddress) => void;
  isAuthenticated?: boolean;
  onGuestInfoChange?: (info: GuestShippingInfo) => void;
  guestInfo?: GuestShippingInfo;
}

export const AddressStep = ({
  selectedAddress,
  onAddressSelect,
  onShippingAddressSelect,
  isAuthenticated = false,
  onGuestInfoChange,
  guestInfo = {
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
  },
}: AddressStepProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get("/addresses");
      setAddresses(response.data.data);

      // Select default address if none selected
      if (!selectedAddress && response.data.data.length > 0) {
        const defaultAddress = response.data.data.find(
          (addr: Address) => addr.isDefault
        );
        if (defaultAddress) {
          onAddressSelect(defaultAddress.id);
          // Create shipping address from default address
          const shippingAddress: ShippingAddress = {
            fullName: defaultAddress.fullName,
            phone: defaultAddress.phone,
            address: defaultAddress.address,
            city: defaultAddress.city,
            postalCode: defaultAddress.postalCode,
          };
          onShippingAddressSelect(shippingAddress);
        }
      }
    } catch (error) {
      message.error("Failed to fetch addresses");
    }
  };

  const handleAddressSelect = (address: any) => {
    onAddressSelect(address.id);
    // Create shipping address object from selected address
    const shippingAddress: ShippingAddress = {
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
    };
    onShippingAddressSelect(shippingAddress);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Shipping Information</h3>
        {isAuthenticated ? (
          <Radio.Group
            onChange={(e) =>
              handleAddressSelect(
                addresses.find((a) => a.id === e.target.value)
              )
            }
            value={selectedAddress}
            className="w-full space-y-4"
          >
            {addresses.map((address) => (
              <Radio
                key={address.id}
                value={address.id}
                className="!w-full [&_.ant-radio+span]:!w-full [&_.ant-radio+span]:!inline-block"
              >
                <div
                  className={`w-full border-2 p-5 rounded-xl hover:border-primary-500 transition-all duration-200 relative ${
                    selectedAddress === address.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="w-full">
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600">
                      {address.address}, {address.city}, {address.state}{" "}
                      {address.zipCode}
                    </p>
                  </div>
                  {address.isDefault && (
                    <span className="text-primary-600 text-sm absolute right-4 top-4">
                      Default
                    </span>
                  )}
                </div>
              </Radio>
            ))}
          </Radio.Group>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="First Name"
                value={guestInfo.firstName}
                onChange={(e) =>
                  onGuestInfoChange?.({
                    ...guestInfo,
                    firstName: e.target.value,
                  })
                }
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={guestInfo.lastName}
                onChange={(e) =>
                  onGuestInfoChange?.({
                    ...guestInfo,
                    lastName: e.target.value,
                  })
                }
                className="px-3 py-2 border rounded"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={guestInfo.email}
              onChange={(e) =>
                onGuestInfoChange?.({
                  ...guestInfo,
                  email: e.target.value,
                })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="tel"
              placeholder="Phone *"
              value={guestInfo.phone}
              onChange={(e) =>
                onGuestInfoChange?.({
                  ...guestInfo,
                  phone: e.target.value,
                })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={guestInfo.address}
              onChange={(e) =>
                onGuestInfoChange?.({
                  ...guestInfo,
                  address: e.target.value,
                })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Apartment (optional)"
              value={guestInfo.apartment}
              onChange={(e) =>
                onGuestInfoChange?.({
                  ...guestInfo,
                  apartment: e.target.value,
                })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={guestInfo.city}
                onChange={(e) =>
                  onGuestInfoChange?.({
                    ...guestInfo,
                    city: e.target.value,
                  })
                }
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="State"
                value={guestInfo.state}
                onChange={(e) =>
                  onGuestInfoChange?.({
                    ...guestInfo,
                    state: e.target.value,
                  })
                }
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Country"
                value={guestInfo.country}
                onChange={(e) =>
                  onGuestInfoChange?.({
                    ...guestInfo,
                    country: e.target.value,
                  })
                }
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={guestInfo.postalCode}
                onChange={(e) =>
                  onGuestInfoChange?.({
                    ...guestInfo,
                    postalCode: e.target.value,
                  })
                }
                className="px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
