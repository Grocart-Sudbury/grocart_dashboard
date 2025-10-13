"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Typography, Spin, message, Modal, Form, Input, InputNumber, Select } from "antd";
import { API_BASE_URL, apiFetch } from "../api/config";

const { Title } = Typography;
const { Option } = Select;

interface Product {
  id: number;
  product: string;
  originalPrice: number;
  offerPrice: number;
  description: string;
  stock: number;
  quantity: string;
  imageUrl: string;
  category?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
  products: Product[];
}

const Inventory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState<Product[]>([]);
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");

  useEffect(() => {
    fetchInventoryAndCategories();
  }, []);

  useEffect(() => {
    // Apply category filter
    if (selectedCategory === "all") {
      setFilteredData(inventoryData);
    } else {
      setFilteredData(inventoryData.filter(p => p.category?.id === selectedCategory));
    }
  }, [selectedCategory, inventoryData]);

  const fetchInventoryAndCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to fetch categories and inventory");

      const categoriesData: Category[] = await res.json();
      setCategories(categoriesData);

      // Flatten products with category info
      const allProducts = categoriesData.flatMap(cat =>
        cat.products.map(p => ({ ...p, category: { id: cat.id, name: cat.name } }))
      );
      setInventoryData(allProducts);
      setFilteredData(allProducts);
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Error fetching inventory");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      product: product.product,
      offerPrice: product.offerPrice,
      originalPrice: product.originalPrice,
      stock: product.stock,
      quantity: product.quantity,
      description: product.description,
      imageUrl: product.imageUrl,
      categoryId: product.category?.id,
    });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (!editingProduct) return;

      const payload = {
        ...editingProduct,
        ...values,
        category: { id: values.categoryId },
      };

      console.log("PUT request payload:", payload);

      await apiFetch(`/products/${editingProduct.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      message.success("Product updated successfully");
      setModalVisible(false);
      setEditingProduct(null);
      fetchInventoryAndCategories();
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Error updating product");
    }
  };

  const inventoryColumns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "image",
      render: (url: string) => (
        <img src={url} alt="Product" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }} />
      ),
    },
    { title: "Product Name", dataIndex: "product", key: "product" },
    { title: "Category", dataIndex: ["category", "name"], key: "category" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Price",
      dataIndex: "offerPrice",
      key: "offerPrice",
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Product) => (
        <Button type="primary" onClick={() => openEditModal(record)}>
          Edit
        </Button>
      ),
    },
  ];

  if (loading) return <Spin tip="Loading inventory..." />;

  return (
    <>
      <Title level={3}>Inventory Management</Title>

      {/* Category Filter */}
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value)}
        >
          <Option value="all">All Categories</Option>
          {categories.map((cat) => (
            <Option key={cat.id} value={cat.id}>
              {cat.name}
            </Option>
          ))}
        </Select>
      </div>

      <Table
        dataSource={filteredData.map((item) => ({ ...item, key: item.id }))}
        columns={inventoryColumns}
        pagination={false}
      />

      <Modal
        title="Edit Product"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleUpdate}
        okText="Update"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="product" label="Product Name" rules={[{ required: true, message: "Enter product name" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="offerPrice" label="Offer Price" rules={[{ required: true, message: "Enter price" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="originalPrice" label="Original Price" rules={[{ required: true, message: "Enter original price" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="stock" label="Stock" rules={[{ required: true, message: "Enter stock" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: "Enter quantity" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true, message: "Enter image URL" }]}>
            <Input onChange={(e) => form.setFieldsValue({ imageUrl: e.target.value })} />
          </Form.Item>

          {form.getFieldValue("imageUrl") && (
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <img src={form.getFieldValue("imageUrl")} alt="Preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 4 }} />
            </div>
          )}

          <Form.Item name="categoryId" label="Category" rules={[{ required: true, message: "Select a category" }]}>
            <Select placeholder="Select category">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Inventory;
