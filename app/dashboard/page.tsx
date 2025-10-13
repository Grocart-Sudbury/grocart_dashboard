"use client";

import React, { useState } from "react";
import { Layout, Typography } from "antd";
import Sidebar from "../components/Sidebar";
import Statistics from "../components/Statistics";
import Inventory from "../components/Inventory";
import ActiveOrders from "../components/ActiveOrders";

const { Header, Content } = Layout;
const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState("1");

  const renderContent = () => {
    switch (selectedMenu) {
      case "1":
        return <Statistics />;
      case "2":
        return <Inventory />;
      case "3":
        return <ActiveOrders />;
      default:
        return <Statistics />;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar selectedKey={selectedMenu} onMenuClick={setSelectedMenu} />
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Dashboard
          </Title>
        </Header>
        <Content style={{ margin: 16 }}>{renderContent()}</Content>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
