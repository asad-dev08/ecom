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
import CategoryListHeader from "./CategoryListHeader";
import CreateCategory from "../create-category/CreateCategory";
import {
  deleteCategory,
  getCategory,
  getCategorysWithPagination,
} from "../../../store/category/categorySlice";
import { getPermissionsForMenu } from "../../../utils/helper";
import { BASE_DOC_URL } from "../../../utils/actionTypes";

const CategoryList = () => {
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
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 200,
      render: (image) =>
        image ? (
          <img
            src={`${BASE_DOC_URL}/${image}`}
            alt="Category"
            style={{
              width: 150,
              height: 150,
              objectFit: "cover",
              borderRadius: "4px",
            }}
            onError={(e) => {
              console.log("Error loading image", e);
            }}
          />
        ) : null,
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 100,
      render: (icon) =>
        icon ? (
          <img
            src={`${BASE_DOC_URL}/${icon}`}
            alt="Icon"
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: "4px",
            }}
            onError={(e) => {
              console.log("Error loading icon", e);
            }}
          />
        ) : null,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filterable: true,
      filterType: "search",
      sorter: true,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      filterable: true,
      filterType: "search",
      sorter: true,
    },
    {
      title: "Featured",
      dataIndex: "featured",
      key: "featured",
      width: 100,
      render: (featured) => (
        <span
          style={{
            color: featured ? "#52c41a" : "#ff4d4f",
            fontWeight: 500,
          }}
        >
          {featured ? "Yes" : "No"}
        </span>
      ),
      filterable: true,
      filterType: "boolean",
      sorter: true,
    },
    {
      title: "Product Count",
      dataIndex: "productCount",
      key: "productCount",
      width: 120,
      align: "center",
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
          const response = await dispatch(getCategory(row.id)).unwrap();
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
          toast.error("Failed to fetch category details");
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
          deleteCategory(state.selectedRow.id)
        ).unwrap();
        if (response?.statusCode === 200) {
          toast.success(response.message || "Category deleted successfully");
          setState((prev) => ({
            ...prev,
            deleteModalVisible: false,
            selectedRow: null,
            refreshKey: prev.refreshKey + 1,
          }));
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete category");
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
          getCategorysWithPagination({
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
        toast.error("Failed to fetch categories");
        return {
          data: [],
          total: 0,
        };
      }
    },
    [dispatch]
  );

  const handleCategoryChange = useCallback(() => {
    setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  }, []);

  return (
    <div>
      <CategoryListHeader
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
        <CreateCategory
          onClose={drawerHandlers.onClose}
          open={state.open}
          data={state.selectedRow}
          isAdd={state.isAdd}
          isView={state.isView}
          permission={permission}
          onCategoryChange={handleCategoryChange}
        />
      )}
      <Modal
        title="Confirm Delete"
        open={state.deleteModalVisible}
        onOk={actionHandlers.handleDeleteModalOk}
        onCancel={actionHandlers.handleDeleteModalCancel}
        maskClosable={false}
      >
        <p>Are you sure you want to delete this category?</p>
      </Modal>
    </div>
  );
};

export default CategoryList;
