import React from "react";
import { Form, Input, Button } from "antd";
import api from "../../services/api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  first_name: string | undefined;
  last_name: string | undefined;
  email: string;
  phone?: string | undefined;
}

interface ProfileInfoProps {
  user: Customer;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const response = await api.put("/profile", values);

      if (response.data.statusCode === 200) {
        toast.success("Profile updated successfully!");
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ["user"] });
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while updating profile"
      );
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || "",
      }}
      onFinish={onFinish}
      className="max-w-lg"
    >
      <Form.Item
        label="First Name"
        name="first_name"
        rules={[{ required: true, message: "Please input your first name!" }]}
      >
        <Input size="large" />
      </Form.Item>

      <Form.Item
        label="Last Name"
        name="last_name"
        rules={[{ required: true, message: "Please input your last name!" }]}
      >
        <Input size="large" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input size="large" />
      </Form.Item>

      <Form.Item
        label="Phone"
        name="phone"
        rules={[{ required: true, message: "Please input your phone number!" }]}
      >
        <Input size="large" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="bg-secondary-600"
        >
          Update Profile
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProfileInfo;
