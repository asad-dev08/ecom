import React, { useEffect, useState } from "react";
import { Table, Tag, message } from "antd";
import api from "../../services/api";

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/order-history");

        setOrders(response.data.data);
      } catch (error) {
        message.error("Failed to fetch orders");
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) => `$${total}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          DELIVERED: "green",
          PROCESSING: "blue",
          PENDING: "orange",
          SHIPPED: "cyan",
          CANCELLED: "red",
          RETURNED: "purple",
        };

        return (
          <Tag color={colorMap[status] || "default"}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Tag>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      loading={loading}
    />
  );
};

export default OrderHistory;
