import React from "react";
import { Modal, Form, Input, Tabs, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useCustomerAuth } from "../../hooks/useCustomerAuth";

const { TabPane } = Tabs;

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  activeTab?: "login" | "register";
  onLoginSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, activeTab }) => {
  const [form] = Form.useForm();
  const { login, register, loading, error, clearAuthError } = useCustomerAuth();

  // Clear form and errors when modal closes
  const handleClose = () => {
    form.resetFields();
    clearAuthError();
    onClose();
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values)
        .unwrap()
        .then((res) => {
          if (res.accessToken) {
            message.success("Login successful!");

            handleClose();
          }
        });
    } catch (error: any) {
      // Error handling is managed by the Redux slice
      message.error("Login failed: " + error);
    }
  };

  const handleRegister = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      // Split full name into first and last name

      await register({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email: values.email,
        phone: values.phone,
        password: values.password,
      })
        .unwrap()
        .then(() => {
          message.success("Registration successful!");
          handleClose();
        });
    } catch (error) {
      // Error handling is managed by the Redux slice
      message.error("Registration failed: " + error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={420}
      className="auth-modal"
      centered
    >
      <div className="p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === "login" ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-gray-500 mt-2">
            {activeTab === "login"
              ? "Please enter your details to sign in"
              : "Fill in the form to create your account"}
          </p>
        </div>

        {/* Social Login Buttons */}
        {/* <div className="space-y-3 mb-6">
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => message.info("Google login coming soon!")}
          >
            <FcGoogle className="text-xl" />
            <span className="text-gray-600">Continue with Google</span>
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => message.info("Facebook login coming soon!")}
          >
            <FaFacebook className="text-xl text-blue-600" />
            <span className="text-gray-600">Continue with Facebook</span>
          </button>
        </div>

        <div className="relative mb-6">
          <Divider className="text-gray-400">or continue with email</Divider>
        </div> */}

        {/* Show error message if exists */}
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}

        <Tabs activeKey={activeTab} className="auth-tabs" centered>
          <TabPane tab="Login" key="login">
            <Form
              form={form}
              onFinish={handleLogin}
              layout="vertical"
              className="space-y-4"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Email"
                  size="large"
                  className="auth-input"
                  disabled={loading}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Password"
                  size="large"
                  className="auth-input"
                  disabled={loading}
                />
              </Form.Item>

              {/* <div className="flex justify-between items-center mb-4">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-secondary-600"
                    />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                </Form.Item>
                <a
                  href="#"
                  className="text-secondary-600 hover:text-secondary-700"
                >
                  Forgot password?
                </a>
              </div> */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </Form>
          </TabPane>

          <TabPane tab="Register" key="register">
            <Form
              form={form}
              onFinish={handleRegister}
              layout="vertical"
              className="space-y-4"
            >
              <Form.Item
                name="firstName"
                rules={[
                  { required: true, message: "Please input your first name!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="First Name"
                  size="large"
                  className="auth-input"
                  disabled={loading}
                />
              </Form.Item>
              <Form.Item
                name="lastName"
                rules={[
                  { required: true, message: "Please input your last name!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Last Name"
                  size="large"
                  className="auth-input"
                  disabled={loading}
                />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Email"
                  size="large"
                  className="auth-input"
                  disabled={loading}
                />
              </Form.Item>
              <Form.Item
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Please input your phone number!",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="Phone Number"
                  size="large"
                  className="auth-input"
                  disabled={loading}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Password"
                  size="large"
                  className="auth-input"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                name="terms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            "Please accept the Terms of Service and Privacy Policy"
                          ),
                  },
                ]}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-secondary-600"
                  />
                  <span className="text-gray-600">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-secondary-600 hover:text-secondary-700"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-secondary-600 hover:text-secondary-700"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </Form.Item>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </Form>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default AuthModal;
