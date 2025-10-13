"use client";

import React, { useState } from "react";
import { Layout, Menu, Drawer, Button } from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

interface SidebarProps {
  selectedKey: string;
  onMenuClick: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedKey, onMenuClick }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleCollapsed = () => setCollapsed(!collapsed);
  const toggleDrawer = () => setDrawerVisible(!drawerVisible);

  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: "Statistics" },
    { key: "2", icon: <AppstoreOutlined />, label: "Inventory" },
    { key: "3", icon: <ShoppingCartOutlined />, label: "Active Orders" },
  ];

  // Desktop sidebar
  const desktopSider = (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      collapsedWidth={80}
      style={{ minHeight: "100vh" }}
    >
      <div
        style={{
          height: 32,
          margin: 16,
          background: "rgba(255,255,255,0.2)",
          textAlign: "center",
          color: "#fff",
          lineHeight: "32px",
        }}
      >
        Logo
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={(e) => onMenuClick(e.key)}
        items={menuItems}
      />
    </Sider>
  );

  // Mobile drawer
  const mobileDrawer = (
    <>
      <Button
        type="text"
        onClick={toggleDrawer}
        style={{ fontSize: 20, margin: 16 }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
      <Drawer
        title="Menu"
        placement="left"
        closable
        onClose={toggleDrawer}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => {
            onMenuClick(e.key);
            setDrawerVisible(false);
          }}
          items={menuItems}
        />
      </Drawer>
    </>
  );

  return (
    <>
      <div className="desktop">{desktopSider}</div>
      <div className="mobile">{mobileDrawer}</div>

      <style jsx>{`
        .desktop {
          display: none;
        }
        .mobile {
          display: block;
        }
        @media (min-width: 992px) {
          .desktop {
            display: block;
          }
          .mobile {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
