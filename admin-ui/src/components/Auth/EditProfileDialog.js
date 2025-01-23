import React, { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { UserOutlined, PhoneOutlined, HomeOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const EditProfileDialog = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const user = useSelector((state) => state.auth.user);

  // Set initial values when dialog opens or user data changes
  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        fullname: user.fullname || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [visible, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-primary">
          <UserOutlined className="text-xl" />
          <span>Edit Profile</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      className="edit-profile-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          name="fullname"
          label="Full Name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Enter your full name"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: "Please enter your phone number" },
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="text-gray-400" />}
            placeholder="Enter your phone number"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item name="address" label="Address">
          <Input.TextArea
            placeholder="Enter your address"
            className="rounded-md"
            rows={4}
          />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<UserOutlined />}
          >
            Update Profile
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProfileDialog;
