"use client";

import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  Card,
  Spin,
  message,
  DatePicker,
  Tag,
  Divider,
  Select,
  Row,
  Col,
  Button,
  Space,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { apiFetch } from "../api/config";

const { Title, Text } = Typography;
const { Option } = Select;

interface OrderItem {
  id: number;
  quantity: number;
  priceAtPurchase: number;
  productName: string;
}

interface Order {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  Pending: "orange",
  Approved: "blue",
  Completed: "green",
  Cancelled: "red",
};

const ActiveOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchOrders = async (selectedDate: Dayjs) => {
    setLoading(true);
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      let data: Order[] = await apiFetch(
        `/orders/by-date?date=${formattedDate}`,
        { method: "GET" }
      );
      // Sort orders by total descending
      data.sort((a, b) => b.total - a.total);
      setOrders(data);
    } catch (error: any) {
      message.error(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(date);
  }, [date]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      message.success(`Order #${orderId} marked as ${newStatus}`);
      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error: any) {
      message.error(error.message || "Failed to update status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filter orders based on status dropdown
  const filteredOrders = statusFilter
    ? orders.filter((order) => order.status === statusFilter)
    : orders;

  return (
    <>
      <Title level={3}>Active Orders</Title>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col>
          <DatePicker
            value={date}
            onChange={(newDate) => newDate && setDate(newDate)}
          />
        </Col>
        <Col>
          <Select
            placeholder="Filter by status"
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value)}
            allowClear
            style={{ width: 200 }}
          >
            <Option value="Pending">Pending</Option>
            <Option value="Approved">Approved</Option>
            <Option value="Completed">Completed</Option>
          </Select>
        </Col>
      </Row>

      {loading ? (
        <Spin tip="Loading orders..." />
      ) : filteredOrders.length === 0 ? (
        <p>No active orders for this date/status.</p>
      ) : (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={filteredOrders}
          renderItem={(order) => (
            <List.Item key={order.id}>
              <Card
                title={
                  <>
                    Order #{order.id}{" "}
                    <Tag color={statusColors[order.status] || "blue"}>
                      {order.status}
                    </Tag>
                  </>
                }
                bordered
                style={{
                  borderLeft: `5px solid ${
                    statusColors[order.status] || "blue"
                  }`,
                }}
              >
                <Text>
                  <strong>Name:</strong> {order.firstName} {order.lastName}
                </Text>
                <br />
                <Text>
                  <strong>Email:</strong> {order.email}
                </Text>
                <br />
                <Text>
                  <strong>Phone:</strong> {order.phone}
                </Text>
                <br />
                <Text>
                  <strong>Address:</strong> {order.address}, {order.city},{" "}
                  {order.province} - {order.postalCode}
                </Text>
                <br />
                <Text>
                  <strong>Total:</strong> ${order.total.toFixed(2)}
                </Text>

                <Divider />

                <Text strong>Items:</Text>
                <List
                  size="small"
                  dataSource={order.items}
                  renderItem={(item) => (
                    <List.Item>
                      <Tag color="cyan">
                        {item.quantity} x {item.productName}
                      </Tag>{" "}
                      @ ${item.priceAtPurchase.toFixed(2)}
                    </List.Item>
                  )}
                />

                <Divider />

                <Space>
                  {order.status === "Pending" && (
                    <Button
                      type="primary"
                      loading={updatingOrderId === order.id}
                      onClick={() => updateOrderStatus(order.id, "Approved")}
                    >
                      Approve
                    </Button>
                  )}
                  {order.status !== "Completed" && (
                    <Button
                      type="default"
                      loading={updatingOrderId === order.id}
                      onClick={() => updateOrderStatus(order.id, "Completed")}
                    >
                      Complete
                    </Button>
                  )}
                </Space>
              </Card>
            </List.Item>
          )}
        />
      )}
    </>
  );
};

export default ActiveOrders;
