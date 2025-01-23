import { Avatar, Button, Dropdown, Menu, Typography, theme } from "antd";
import React, { useState } from "react";
import {
  UserOutlined,
  KeyOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../Auth/AuthContext";
import ChangePasswordDialog from "../Auth/ChangePasswordDialog";
import { changePassword, updateProfile } from "../../store/auth/authSlice";
import EditProfileDialog from "../Auth/EditProfileDialog";
import SettingsDialog from "../Settings/SettingsDialog";
import { useTheme } from "../../contexts/ThemeContext";

const PageHeader = ({
  toggleSider,
  collapsed,
  isMediumScreen,
  showDrawer,
  user,
}) => {
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  const [profileDialogVisible, setProfileDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsDialogVisible, setSettingsDialogVisible] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { settings } = useTheme();
  const { useToken } = theme;
  const { token } = useToken();

  const handleLogoutFromApp = async () => {
    toast.success("Logged Out", { duration: 4000 });
    logout();
  };

  const handleEditProfile = async (values) => {
    try {
      setLoading(true);
      const response = await updateProfile(values);
      if (response.statusCode === 200) {
        toast.success("Profile updated successfully!");
        setProfileDialogVisible(false);
        window.location.reload();
        // Update user state if needed
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      await changePassword(values);
      toast.success("Password changed successfully!");
      setPasswordDialogVisible(false);
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSave = async (values) => {
    try {
      setLoading(true);
      // The settings are now handled by the ThemeContext
      toast.success("Settings updated successfully!");
      setSettingsDialogVisible(false);
    } catch (error) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const menu = (
    <Menu
      style={{
        width: "220px",
        padding: "8px",
        marginRight: "15px",
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgElevated,
      }}
    >
      {/* User Info Section */}
      <div className="px-3 py-2 mb-2">
        <Typography.Text strong style={{ fontSize: "16px" }}>
          {user?.fullname || user?.username}
        </Typography.Text>
        <Typography.Paragraph type="secondary" style={{ margin: "0" }}>
          {user?.email}
        </Typography.Paragraph>
        {user?.is_admin && (
          <Typography.Text type="success" style={{ fontSize: "12px" }}>
            Administrator
          </Typography.Text>
        )}
      </div>

      <Menu.Divider />

      {/* Menu Items */}
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => setProfileDialogVisible(true)}
        className="rounded-md"
      >
        Edit Profile
      </Menu.Item>

      <Menu.Item
        key="password"
        icon={<KeyOutlined />}
        onClick={() => setPasswordDialogVisible(true)}
        className="rounded-md"
      >
        Change Password
      </Menu.Item>

      <Menu.Item
        key="settings"
        icon={<SettingOutlined />}
        onClick={() => setSettingsDialogVisible(true)}
        className="rounded-md"
      >
        Settings
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        danger
        onClick={handleLogoutFromApp}
        className="rounded-md"
      >
        Sign Out
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <div className="w-full h-full flex items-center justify-between">
        <Button
          type="text"
          className="ml-3 rounded-full h-10 w-10 flex items-center justify-center"
          onClick={!isMediumScreen ? toggleSider : showDrawer}
        >
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined
          )}
        </Button>

        <Dropdown
          overlay={menu}
          trigger={["click"]}
          placement="bottom"
          arrow={{ pointAtCenter: false }}
        >
          <div
            style={{
              backgroundColor: token.colorBgTextHover,
              padding: `${token.paddingXS}px ${token.paddingLG}px`,
              borderRadius: token.borderRadius,
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            className="flex items-center gap-3 justify-between hover:opacity-90"
          >
            <div className="flex flex-col items-start">
              <Typography.Text strong>Hi, {user?.username}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                {user?.is_admin ? "Administrator" : "User"}
              </Typography.Text>
            </div>
            <Avatar
              style={{
                backgroundColor: token.colorPrimary,
              }}
              icon={<UserOutlined />}
              size="large"
            />
          </div>
        </Dropdown>
      </div>

      <ChangePasswordDialog
        visible={passwordDialogVisible}
        onCancel={() => setPasswordDialogVisible(false)}
        onSubmit={handleChangePassword}
        loading={loading}
      />

      <EditProfileDialog
        visible={profileDialogVisible}
        onCancel={() => setProfileDialogVisible(false)}
        onSubmit={handleEditProfile}
        loading={loading}
        initialValues={{
          fullname: user?.fullname || "",
          phone: user?.phone || "",
          address: user?.address || "",
        }}
      />

      <SettingsDialog
        visible={settingsDialogVisible}
        onCancel={() => setSettingsDialogVisible(false)}
        loading={loading}
      />
    </>
  );
};

export default PageHeader;
