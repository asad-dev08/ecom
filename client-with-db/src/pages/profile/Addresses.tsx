import React from "react";
import { Card, Button, Empty } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const DUMMY_ADDRESSES = [
  {
    id: "1",
    type: "Home",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
    isDefault: true,
  },
  // Add more dummy addresses as needed
];

const Addresses: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Saved Addresses</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-secondary-600"
        >
          Add New Address
        </Button>
      </div>

      {DUMMY_ADDRESSES.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {DUMMY_ADDRESSES.map((address) => (
            <Card key={address.id} className="relative">
              {address.isDefault && (
                <span className="absolute top-2 right-2 text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded">
                  Default
                </span>
              )}
              <h4 className="font-medium">{address.type}</h4>
              <p className="text-gray-600">{address.address}</p>
              <p className="text-gray-600">
                {address.city}, {address.state} {address.zip}
              </p>
              <div className="mt-4 space-x-2">
                <Button size="small">Edit</Button>
                <Button size="small" danger>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="No addresses found" />
      )}
    </div>
  );
};

export default Addresses;
