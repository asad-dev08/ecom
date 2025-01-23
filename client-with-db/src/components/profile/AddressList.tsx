import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../services/api";

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export const AddressList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch addresses
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await api.get("/addresses");
      return response.data.data;
    },
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (values: Partial<Address>) => {
      if (editingAddress) {
        // Update existing address
        const response = await api.put(
          `/addresses/${editingAddress.id}`,
          values
        );
        return response.data;
      } else {
        // Create new address
        const response = await api.post("/addresses", values);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      message.success(
        `Address ${editingAddress ? "updated" : "created"} successfully`
      );
      handleCancel();
    },
    onError: (error: any) => {
      message.error(error.message || "Something went wrong");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/addresses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      message.success("Address deleted successfully");
    },
    onError: (error: any) => {
      message.error(error.message || "Failed to delete address");
    },
  });

  const handleSubmit = (values: any) => {
    mutation.mutate(values);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    form.resetFields();
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    form.setFieldsValue(address);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this address?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  if (isLoading) {
    return <div>Loading addresses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Addresses</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address: Address) => (
          <Card key={address.id} className="relative">
            {address.isDefault && (
              <span className="absolute top-2 right-2 bg-secondary-600 text-white px-2 py-1 rounded-full text-xs">
                Default
              </span>
            )}
            <div className="space-y-2">
              <p className="font-medium">{address.label}</p>
              <p>
                {address.firstName} {address.lastName}
              </p>
              <p>{address.phone}</p>
              {address.email && <p>{address.email}</p>}
              <p>
                {address.address}
                {address.apartment && `, ${address.apartment}`}
              </p>
              <p>
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p>{address.country}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(address)}
              >
                Edit
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(address.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={`${editingAddress ? "Edit" : "Add New"} Address`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isDefault: false }}
        >
          <Form.Item
            name="label"
            label="Address Label"
            rules={[
              { required: true, message: "Please select an address label" },
            ]}
          >
            <Select>
              <Select.Option value="Home">Home</Select.Option>
              <Select.Option value="Office">Office</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          {/* <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input />
            </Form.Item>
          </div> */}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="email" label="Email">
              <Input type="email" />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Street Address"
            rules={[{ required: true, message: "Please enter street address" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="apartment" label="Apartment, suite, etc.">
            <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: "Please enter city" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: "Please enter state" }]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: "Please enter country" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="postalCode"
              label="Postal Code"
              rules={[{ required: true, message: "Please enter postal code" }]}
            >
              <Input />
            </Form.Item>
          </div>

          <Form.Item name="isDefault" valuePropName="checked">
            <Switch checkedChildren="Default" unCheckedChildren="Not Default" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
            >
              {editingAddress ? "Update" : "Add"} Address
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
