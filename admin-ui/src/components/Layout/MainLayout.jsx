import React, { useEffect } from "react";
import { Card, Drawer, Layout, Space, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import PageHeader from "./PageHeader";
import { useMediaQuery } from "react-responsive";
import clsx from "clsx";
import { useAuth } from "../Auth/AuthContext";

const { Header, Content, Footer, Sider } = Layout;

const MainLayout = () => {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [isInvalid, setIsInvalid] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const menus = useSelector((state) => state.auth.menus);
  const isMediumScreen = useMediaQuery({ maxWidth: 1023 });

  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("left");
  const { logout } = useAuth();

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setCollapsed(isMediumScreen);
  }, [isMediumScreen]);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(isMediumScreen);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMediumScreen]);

  const toggleSider = () => {
    setCollapsed(!collapsed);
  };

  // Render main content if authenticated
  return (
    <Layout>
      <div>
        {isMediumScreen ? (
          <Drawer
            style={{ width: 280, height: "calc(100vh)" }}
            bodyStyle={{ padding: 0, overflowX: "hidden", overflowY: "auto" }}
            headerStyle={{ padding: 5 }}
            placement={placement}
            width={280}
            onClose={onClose}
            open={open}
          >
            <Sidebar
              defaultOpenKeys={[]}
              collapsed={collapsed}
              isMediumScreen={isMediumScreen}
              menus={menus}
            />
          </Drawer>
        ) : (
          <Sider
            // className="fixed bottom-0 left-0 top-0"
            width={280}
            collapsible
            collapsed={collapsed}
            collapsedWidth={0}
            // trigger={null}
            style={{
              overflow: "hidden",
              height: "100vh",
              position: "sticky",
              top: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <Sidebar
              defaultOpenKeys={[]}
              collapsed={collapsed}
              isMediumScreen={isMediumScreen}
              menus={menus}
            />
          </Sider>
        )}
      </div>
      <Layout>
        <Card
          className={clsx(
            "rounded-none fixed top-0 right-0  shadow-sm z-[999]",
            !collapsed ? " left-[280px]" : " left-0"
          )}
          bodyStyle={{ padding: "0 12px 0 0", height: 60 }}
        >
          <PageHeader
            toggleSider={toggleSider}
            collapsed={collapsed}
            isMediumScreen={isMediumScreen}
            showDrawer={showDrawer}
            user={user}
          />
        </Card>
        <Content style={{ margin: "70px 8px 0", overflow: "auto" }}>
          <div style={{ textAlign: "center" }} className="p-2">
            <Outlet />
          </div>
        </Content>
        <Footer className="text-center text-sm font-semibold">
          &copy;{new Date().getFullYear()} | Aasdullah Sarker
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
