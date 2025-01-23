import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Button, Dropdown, Menu, Modal } from "antd";
import {
  MdDeleteOutline,
  MdMoreVert,
  MdOutlineModeEdit,
  MdOutlineRemoveRedEye,
} from "react-icons/md";
import toast from "react-hot-toast";

import PaginatedDataGrid from "../../../components/datagrid/PaginatedDataGrid";
import CouponListHeader from "./CouponListHeader";
import CreateCoupon from "../create-coupon/CreateCoupon";
import {
  deleteCoupon,
  getCoupon,
  getCouponsWithPagination,
} from "../../../store/coupon/couponSlice";
import { getPermissionsForMenu } from "../../../utils/helper";

const CouponList = () => {
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

  const defaultSorting = [{ field: "created_at", order: "desc" }];
  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      filterable: true,
      filterType: "search",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      filterable: true,
      filterType: "search",
      sorter: true,
    },
    {
      title: "Discount Type",
      dataIndex: "discount_type",
      key: "discount_type",
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "percentage", label: "Percentage" },
        { value: "fixed", label: "Fixed Amount" },
      ],
      sorter: true,
      render: (type) => (type === "percentage" ? "Percentage" : "Fixed Amount"),
    },
    {
      title: "Discount Amount",
      dataIndex: "discount_amount",
      key: "discount_amount",
      sorter: true,
      render: (amount, record) =>
        record.discount_type === "percentage"
          ? `${amount}%`
          : `$${Number(amount).toFixed(2)}`,
    },
    {
      title: "Min. Purchase",
      dataIndex: "minimum_purchase",
      key: "minimum_purchase",
      sorter: true,
      render: (amount) => (amount ? `$${Number(amount).toFixed(2)}` : "-"),
    },
    {
      title: "Usage / Limit",
      dataIndex: "used_count",
      key: "used_count",
      sorter: true,
      render: (used, record) =>
        `${used} / ${record.usage_limit || "∞"}`,
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (active) => (
        <span
          style={{
            color: active ? "#52c41a" : "#ff4d4f",
            fontWeight: 500,
          }}
        >
          {active ? "Active" : "Inactive"}
        </span>
      ),
      filterable: true,
      filterType: "boolean",
      sorter: true,
    },
    {
      title: "Actions",
      width: 80,
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
        selectedRow: null,
        isAdd: false,
        refreshKey: prev.refreshKey + 1,
      }));
    }, []),
  };

  const actionHandlers = {
    handleMenuClick: async (e, row) => {
      if (e.key === "edit" || e.key === "view") {
        try {
          const response = await dispatch(getCoupon(row.id)).unwrap();
          if (response?.data) {
            setState((prev) => ({
              ...prev,
              selectedRow: response.data,
              open: true,
              isView: e.key === "view",
              isAdd: false,
            }));
          }
        } catch (error) {
          toast.error("Failed to fetch coupon details");
        }
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
      try {
        const response = await dispatch(
          deleteCoupon(state.selectedRow.id)
        ).unwrap();
        if (response?.statusCode === 200) {
          toast.success(response.message || "Coupon deleted successfully");
          setState((prev) => ({
            ...prev,
            deleteModalVisible: false,
            selectedRow: null,
            refreshKey: prev.refreshKey + 1,
          }));
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete coupon");
      }
    },
    handleDeleteModalCancel: () => {
      setState((prev) => ({
        ...prev,
        deleteModalVisible: false,
        selectedRow: null,
      }));
    },
  };

  const getActionMenu = useCallback(
    (row) => (
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
    ),
    [permission, actionHandlers]
  );

  const fetchData = useCallback(
    async (page, pageSize, filters, sorting, globalSearch) => {
      try {
        const response = await dispatch(
          getCouponsWithPagination({
            page,
            pageSize,
            filters,
            sorting,
            globalSearch,
          })
        ).unwrap();

        return {
          data: response?.data?.rows || [],
          total: response?.data?.total?.total || 0,
        };
      } catch (error) {
        toast.error("Failed to fetch coupons");
        return {
          data: [],
          total: 0,
        };
      }
    },
    [dispatch]
  );

  const handleCouponChange = useCallback(() => {
    setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  }, []);

  return (
    <div>
      <CouponListHeader
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
        <CreateCoupon
          onClose={drawerHandlers.onClose}
          open={state.open}
          data={state.selectedRow}
          isAdd={state.isAdd}
          isView={state.isView}
          permission={permission}
          onCouponChange={handleCouponChange}
        />
      )}
      <Modal
        title="Confirm Delete"
        open={state.deleteModalVisible}
        onOk={actionHandlers.handleDeleteModalOk}
        onCancel={actionHandlers.handleDeleteModalCancel}
        maskClosable={false}
      >
        <p>Are you sure you want to delete this coupon?</p>
      </Modal>
    </div>
  );
};

export default CouponList; 