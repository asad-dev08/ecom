import React from "react";
import { Modal, Form, Input, Button, Typography } from "antd";
import {
  LockOutlined,
  KeyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";

const { Text } = Typography;

const ChangePasswordDialog = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-primary">
          <KeyOutlined className="text-xl" />
          <span>Change Password</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      className="change-password-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[
            { required: true, message: "Please enter your current password" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter your current password"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Please enter your new password" },
            {
              pattern:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
              message:
                "Password must contain uppercase, lowercase, number and special character",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter your new password"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<CheckCircleOutlined className="text-gray-400" />}
            placeholder="Confirm your new password"
            className="rounded-md"
          />
        </Form.Item>

        <div className="password-requirements mb-4">
          <Text type="secondary" className="text-sm">
            Password Requirements:
          </Text>
          <ul className="text-xs text-gray-500 list-disc ml-4 mt-1">
            <li>Must contain at least one uppercase letter</li>
            <li>Must contain at least one lowercase letter</li>
            <li>Must contain at least one number</li>
            <li>Must contain at least one special character (@$!%*?&)</li>
          </ul>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<KeyOutlined />}
          >
            Change Password
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ChangePasswordDialog;
