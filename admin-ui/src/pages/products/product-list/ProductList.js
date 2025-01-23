import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Button, Dropdown, Menu, Modal, Tag } from "antd";
import {
  MdDeleteOutline,
  MdMoreVert,
  MdOutlineModeEdit,
  MdOutlineRemoveRedEye,
} from "react-icons/md";
import toast from "react-hot-toast";

import PaginatedDataGrid from "../../../components/datagrid/PaginatedDataGrid";
import ProductListHeader from "./ProductListHeader";
import CreateProduct from "../create-product/CreateProduct";
import {
  deleteProduct,
  getProduct,
  getProductsWithPagination,
} from "../../../store/product/productSlice";
import { getPermissionsForMenu } from "../../../utils/helper";
import { formatNumber, formatCurrency } from "../../../utils/numberFormat";

const ProductList = () => {
  const dispatch = useDispatch();
  const menus = useSelector((state) => state.auth.menus);
  const location = useLocation();

  const [state, setState] = useState({
    deleteStatus: false,
    open: false,
    isAdd: false,
    isView: false,
    selectedRow: null,
    deleteModalVisible: false,
    refreshKey: 0,
  });

  const permission = getPermissionsForMenu(menus, location?.pathname);

  // Drawer handlers
  const drawerHandlers = {
    showDrawer: () => setState((prev) => ({ ...prev, open: true })),
    setViewOpen: () => setState((prev) => ({ ...prev, isView: true })),
    setAddOrEdit: (data) => {
      setState((prev) => ({
        ...prev,
        isAdd: data,
        selectedRow: data ? null : prev.selectedRow,
      }));
    },
    onClose: useCallback(() => {
      setState((prev) => ({
        ...prev,
        open: false,
        isView: false,
        refreshKey: prev.refreshKey + 1,
      }));
    }, []),
  };

  // Action menu handlers
  const actionHandlers = {
    handleMenuClick: async (e, row) => {
      if (e.key === "edit" || e.key === "view") {
        const response = await dispatch(getProduct(row.id));
        const data = response?.payload?.data;
        setState((prev) => ({
          ...prev,
          selectedRow: data,
          open: true,
          isView: e.key === "view",
          isAdd: false,
        }));
      }
    },
    showDeleteModal: (e, row) => {
      setState((prev) => ({
        ...prev,
        selectedRow: row,
        deleteModalVisible: true,
      }));
    },
    handleDeleteModalOk: async () => {
      const response = await dispatch(deleteProduct(state.selectedRow.id));
      if (response) {
        toast.success("Product deleted", { duration: 3000 });
        setState((prev) => ({
          ...prev,
          deleteStatus: true,
          deleteModalVisible: false,
          refreshKey: prev.refreshKey + 1,
        }));
      }
    },
    handleDeleteModalCancel: () => {
      setState((prev) => ({ ...prev, deleteModalVisible: false }));
    },
  };

  // Action menu component
  const getActionMenu = (row) => (
    <Menu onClick={(e) => actionHandlers.handleMenuClick(e, row)}>
      {permission?.can_update && (
        <Menu.Item key="edit">
          <div className="flex items-center gap-2">
            <MdOutlineModeEdit /> Edit
          </div>
        </Menu.Item>
      )}
      {permission?.can_delete && (
        <Menu.Item
          key="delete"
          onClick={(e) => actionHandlers.showDeleteModal(e, row)}
        >
          <div className="flex items-center gap-2">
            <MdDeleteOutline /> Delete
          </div>
        </Menu.Item>
      )}
      {permission?.can_view && (
        <Menu.Item key="view">
          <div className="flex items-center gap-2">
            <MdOutlineRemoveRedEye /> View
          </div>
        </Menu.Item>
      )}
    </Menu>
  );

  const defaultSorting = [{ field: "created_at", order: "desc" }];
  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      filterable: true,
      filterType: "search",
      sorter: true,
      width: "20%",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (_, record) => record.category?.name,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: true,
      render: (value) =>
        formatCurrency(value, {
          currencyCode: "BDT",
          useSymbol: true,
        }),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: true,
      render: (value) => (
        <Tag color={value > 0 ? "green" : "red"}>
          {formatNumber(value, { decimals: 2 })}
        </Tag>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (value) => formatNumber(value, { decimals: 1 }),
    },
    {
      title: "Featured",
      dataIndex: "isFeatured",
      key: "isFeatured",
      render: (value) => (
        <Tag color={value ? "green" : "default"}>{value ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => {
        const statusConfig = {
          active: { color: "green", text: "Active" },
          inactive: { color: "red", text: "Inactive" },
          draft: { color: "orange", text: "Draft" },
        };
        const config = statusConfig[value.toLowerCase()] || statusConfig.draft;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Actions",
      render: (row) => (
        <Dropdown
          overlay={getActionMenu(row)}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button icon={<MdMoreVert />} />
        </Dropdown>
      ),
    },
  ];

  // Data fetching
  const fetchData = useCallback(
    async (page, pageSize, filters, sorting, globalSearch) => {
      try {
        const response = await dispatch(
          getProductsWithPagination({
            page,
            pageSize,
            filters,
            sorting,
            globalSearch,
          })
        ).unwrap();

        const data = response?.data;
        return {
          data: data?.rows || [],
          total: data?.total?.total || 0,
        };
      } catch (error) {
        console.error("Error fetching products:", error);
        return {
          data: [],
          total: 0,
        };
      }
    },
    [dispatch]
  );

  // Effects
  useEffect(() => {
    if (state.deleteStatus) {
      setState((prev) => ({
        ...prev,
        deleteStatus: false,
        refreshKey: prev.refreshKey + 1,
      }));
    }
  }, [state.deleteStatus]);

  const handleProductChange = useCallback(() => {
    setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  }, []);

  return (
    <div>
      <ProductListHeader
        showDrawer={drawerHandlers.showDrawer}
        setIsAdd={drawerHandlers.setAddOrEdit}
        permission={permission}
      />
      <PaginatedDataGrid
        columns={columns}
        fetchData={fetchData}
        defaultSorting={defaultSorting}
        key={state.refreshKey}
      />
      {state.open && (
        <CreateProduct
          onClose={drawerHandlers.onClose}
          open={state.open}
          data={state.selectedRow}
          isAdd={state.isAdd}
          isView={state.isView}
          permission={permission}
          onProductChange={handleProductChange}
        />
      )}
      <Modal
        title="Confirm Delete"
        visible={state.deleteModalVisible}
        onOk={actionHandlers.handleDeleteModalOk}
        onCancel={actionHandlers.handleDeleteModalCancel}
        maskClosable={false}
      >
        <p>Are you sure you want to delete this product?</p>
      </Modal>
    </div>
  );
};

export default ProductList;
