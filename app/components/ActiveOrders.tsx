"use client";

import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

const ActiveOrders: React.FC = () => (
  <>
    <Title level={3}>Active Orders</Title>
    <p>No active orders yet.</p>
  </>
);

export default ActiveOrders;
