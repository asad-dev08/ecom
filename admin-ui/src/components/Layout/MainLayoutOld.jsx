import React, { useState, useMemo } from "react";
import { Layout, Menu, Button, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import * as Icons from "@ant-design/icons";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { routes } from "../../routes/routeConfig";
import { useAuth } from "../Auth/AuthContext";

const { Header, Sider, Content } = Layout;

const MainLayoutOld = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // const authorizedMenuItems = useMemo(() => {
  //   return routes
  //     .filter(
  //       (route) =>
  //         !route.permission || user?.permissions?.includes(route.permission)
  //     )
  //     .map((route) => {
  //       const IconComponent = Icons[route.menu.icon];
  //       return {
  //         key: route.path,
  //         icon: IconComponent ? <IconComponent /> : null,
  //         label: route.menu.label,
  //         onClick: () => navigate(route.path),
  //       };
  //     });
  // }, [user?.permissions, navigate]);
  const authorizedMenuItems =routes;

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="80"
        className="h-screen fixed left-0 top-0 bottom-0"
      >
        <div className="p-4 h-16 flex items-center justify-center">
          <h1
            className={`text-white text-xl font-bold ${
              collapsed ? "hidden" : "block"
            }`}
          >
            {user?.company || "App Name"}
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={authorizedMenuItems}
        />
      </Sider>
      <Layout
        className={`transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-[200px]"
        }`}
      >
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
          className="fixed top-0 right-0 left-0 z-10 flex items-center justify-between px-4"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-xl"
          />
          <div className="flex items-center gap-4">
            <span className="mr-4">{user?.name}</span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              className="text-xl"
            />
          </div>
        </Header>
        <Content
          style={{
            margin: "88px 16px 24px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayoutOld;
