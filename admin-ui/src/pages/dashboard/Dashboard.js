import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Progress,
  Spin,
  Alert,
  Typography,
} from "antd";
import {
  ShoppingOutlined,
  AppstoreOutlined,
  TagsOutlined,
  UserOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardStats } from "../../store/dashboard/dashboardSlice";
import "./Dashboard.css";
import { BASE_DOC_URL } from "../../utils/actionTypes";

const { Column } = Table;

const { Title, Text } = Typography;
const COLORS = [
  "#1890ff",
  "#52c41a",
  "#faad14",
  "#eb2f96",
  "#722ed1",
  "#13c2c2",
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.is_admin;

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  const StatCard = ({ title, value = 0, prevValue = 0, icon, color }) => {
    const currentValue = Number(value) || 0;
    const previousValue = Number(prevValue) || 0;
    const growth =
      previousValue === 0
        ? 0
        : ((currentValue - previousValue) / previousValue) * 100;

    return (
      <Card className="stat-card" bordered={false}>
        <div className="stat-card-content">
          <div className="stat-card-header">
            <Text type="secondary">{title}</Text>
            <div
              className="stat-card-icon"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {icon}
            </div>
          </div>
          <Title level={3} className="stat-card-value">
            {currentValue.toLocaleString()}
          </Title>
          <div className="stat-card-footer">
            <Text
              className="growth-rate"
              type={growth >= 0 ? "success" : "danger"}
            >
              {growth >= 0 ? <RiseOutlined /> : <FallOutlined />}
              {Math.abs(growth).toFixed(1)}%
            </Text>
            <Text type="secondary">vs last month</Text>
          </div>
        </div>
      </Card>
    );
  };

  const recentProductColumns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="product-cell">
          <img
            src={`${BASE_DOC_URL}/${record.thumbnail}`}
            alt={text}
            className="product-thumbnail"
          />
          <div className="product-info">
            <Text strong>{text}</Text>
            <Text type="secondary" className="product-category">
              {record.category.name}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => <Text strong>${price.toLocaleString()}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          className="status-badge"
          status={status === "active" ? "success" : "default"}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
  ];

  const defaultStats = {
    counts: {
      orders: 0,
      previousOrders: 0,
      products: 0,
      previousProducts: 0,
      categories: 0,
      previousCategories: 0,
      brands: 0,
      previousBrands: 0,
      sellers: 0,
      previousSellers: 0,
    },
    ordersByDate: [],
    productsByCategory: [],
    recentProducts: [],
    lowStockProducts: [],
    recentOrders: [],
  };

  const currentStats = stats || defaultStats;

  if (error) {
    return (
      <div className="dashboard-error">
        <Alert
          message="Error Loading Dashboard"
          description={error.message || "Failed to load dashboard data"}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <Spin spinning={loading}>
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <Title level={2}>Dashboard Overview</Title>
          <Text type="secondary">
            Welcome back! Here's what's happening with your store today.
          </Text>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Orders"
              value={currentStats.counts?.orders}
              prevValue={currentStats.counts?.previousOrders}
              icon={<ShoppingCartOutlined />}
              color="#722ed1"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Products"
              value={currentStats.counts?.products}
              prevValue={currentStats.counts?.previousProducts}
              icon={<ShoppingOutlined />}
              color="#1890ff"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Categories"
              value={currentStats.counts?.categories}
              prevValue={currentStats.counts?.previousCategories}
              icon={<AppstoreOutlined />}
              color="#52c41a"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Brands"
              value={currentStats.counts?.brands}
              prevValue={currentStats.counts?.previousBrands}
              icon={<TagsOutlined />}
              color="#faad14"
            />
          </Col>
          {isAdmin && (
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Sellers"
                value={currentStats.counts?.sellers}
                prevValue={currentStats.counts?.previousSellers}
                icon={<UserOutlined />}
                color="#eb2f96"
              />
            </Col>
          )}
        </Row>

        {/* Charts Row */}
        <Row gutter={[16, 16]} className="charts-row">
          <Col xs={24} lg={16}>
            <Card
              title="Orders & Revenue Trend"
              bordered={false}
              className="chart-card"
            >
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={currentStats.ordersByDate || []}>
                  <defs>
                    <linearGradient
                      id="colorOrders"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#722ed1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#722ed1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="orderCount"
                    name="Orders"
                    stroke="#722ed1"
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#52c41a"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title="Products by Category"
              bordered={false}
              className="chart-card"
            >
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={currentStats.productsByCategory}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {currentStats.productsByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Tables Row */}
        <Row gutter={[16, 16]} className="tables-row my-6">
          <Col xs={24} lg={12}>
            <Card
              title="Recent Products"
              bordered={false}
              className="table-card"
            >
              <Table
                columns={recentProductColumns}
                dataSource={currentStats.recentProducts}
                pagination={false}
                size="middle"
                rowKey="id"
                className="dashboard-table"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="low-stock-header">
                  <span>Low Stock Products</span>
                  <WarningOutlined className="warning-icon" />
                </div>
              }
              bordered={false}
              className="table-card"
            >
              <Table
                columns={[
                  {
                    title: "Product",
                    dataIndex: "name",
                    key: "name",
                    render: (text, record) => (
                      <div className="product-cell">
                        <img
                          src={record.thumbnail}
                          alt={text}
                          className="product-thumbnail"
                        />
                        <Text strong>{text}</Text>
                      </div>
                    ),
                  },
                  {
                    title: "Stock",
                    dataIndex: "stock",
                    key: "stock",
                    render: (stock) => (
                      <div className="stock-cell">
                        <Progress
                          percent={(stock / 10) * 100}
                          size="small"
                          status={stock < 5 ? "exception" : "active"}
                          format={(percent) => `${stock} units`}
                        />
                      </div>
                    ),
                  },
                ]}
                dataSource={currentStats.lowStockProducts}
                pagination={false}
                size="middle"
                rowKey="id"
                className="dashboard-table"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Recent Orders" bordered={false} className="table-card">
              <Table
                columns={[
                  {
                    title: "Order ID",
                    dataIndex: "id",
                    key: "id",
                  },
                  {
                    title: "Customer",
                    dataIndex: "customer_name",
                    key: "customer_name",
                  },
                  {
                    title: "Amount",
                    dataIndex: "total_amount",
                    key: "total_amount",
                    render: (amount) => (
                      <Text strong>${amount.toLocaleString()}</Text>
                    ),
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (status) => (
                      <Badge
                        status={
                          status === "completed"
                            ? "success"
                            : status === "pending"
                            ? "processing"
                            : "default"
                        }
                        text={status.charAt(0).toUpperCase() + status.slice(1)}
                      />
                    ),
                  },
                ]}
                dataSource={currentStats.recentOrders}
                pagination={false}
                size="middle"
                rowKey="id"
                className="dashboard-table"
              />
            </Card>
          </Col>
        </Row>

        {/* Admin-specific company stats */}
        {isAdmin && currentStats.adminStats && (
          <>
            <Title level={3} className="section-title">
              Company Overview
            </Title>
            <Row gutter={[16, 16]} className="company-stats-row">
              <Col xs={24}>
                <Card bordered={false} className="company-stats-card">
                  <Table
                    columns={[
                      {
                        title: "Company Name",
                        dataIndex: "name",
                        key: "name",
                      },
                      {
                        title: "Registration",
                        dataIndex: "registrationNumber",
                        key: "registration",
                      },
                      {
                        title: "Seller Status",
                        dataIndex: "seller",
                        key: "seller",
                        render: (seller) => (
                          <Badge
                            status={seller ? "success" : "default"}
                            text={seller ? "Active Seller" : "No Seller"}
                          />
                        ),
                      },
                      {
                        title: "Status",
                        dataIndex: "isActive",
                        key: "status",
                        render: (isActive) => (
                          <Badge
                            status={isActive ? "success" : "error"}
                            text={isActive ? "Active" : "Inactive"}
                          />
                        ),
                      },
                    ]}
                    dataSource={currentStats.adminStats.companyStats}
                    pagination={false}
                    rowKey="id"
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Add company name to product tables for admin */}
        {isAdmin && (
          <Column title="Company" dataIndex="company_name" key="company_name" />
        )}
      </div>
    </Spin>
  );
};

export default Dashboard;
