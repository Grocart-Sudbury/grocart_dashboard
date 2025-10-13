"use client";

import React from "react";
import { Row, Col, Card, Typography } from "antd";

const { Title } = Typography;

const Statistics: React.FC = () => (
  <>
    <Title level={3}>Statistics</Title>
    <Row gutter={16}>
      <Col xs={24} sm={12} md={8}>
        <Card title="Total Orders" bordered={false}>
          120
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card title="Total Revenue" bordered={false}>
          $12,000
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card title="Active Users" bordered={false}>
          45
        </Card>
      </Col>
    </Row>
  </>
);

export default Statistics;
