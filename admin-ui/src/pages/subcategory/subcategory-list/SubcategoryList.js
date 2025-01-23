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
import SubcategoryListHeader from "./SubcategoryListHeader";
import CreateSubcategory from "../create-subcategory/CreateSubcategory";
import {
  deleteSubcategory,
  getSubcategory,
  getSubcategoriesWithPagination,
} from "../../../store/subcategory/subcategorySlice";
import { getPermissionsForMenu } from "../../../utils/helper";

const SubcategoryList = () => {
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
      title: "Category",
      dataIndex: "category",
      key: "category",
      filterable: true,
      filterType: "search",
      sorter: true,
      render: (category) => category?.name || "-",
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

  const actionHandlers = {
    handleMenuClick: async (e, row) => {
      if (e.key === "edit" || e.key === "view") {
        try {
          const response = await dispatch(getSubcategory(row.id)).unwrap();
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
          toast.error("Failed to fetch subcategory details");
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
          deleteSubcategory(state.selectedRow.id)
        ).unwrap();
        if (response?.statusCode === 200) {
          toast.success(response.message || "Subcategory deleted successfully");
          setState((prev) => ({
            ...prev,
            deleteModalVisible: false,
            selectedRow: null,
            refreshKey: prev.refreshKey + 1,
          }));
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete subcategory");
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

  const drawerHandlers = {
    showDrawer: () => {
      setState((prev) => ({ ...prev, open: true }));
    },
    onClose: () => {
      setState((prev) => ({
        ...prev,
        open: false,
        selectedRow: null,
        isAdd: false,
        isView: false,
      }));
    },
    setAddOrEdit: (isAdd) => {
      setState((prev) => ({ ...prev, isAdd, isView: false }));
    },
  };

  const fetchData = useCallback(
    async (page, pageSize, filters, sorting, globalSearch) => {
      try {
        const response = await dispatch(
          getSubcategoriesWithPagination({
            page,
            pageSize,
            filters,
            sorting: sorting || defaultSorting,
            globalSearch,
          })
        ).unwrap();

        const data = response?.data;
        return {
          data: data?.rows || [],
          total: data?.total?.total || 0,
        };
      } catch (error) {
        toast.error(error.message || "Failed to fetch subcategories");
        return {
          data: [],
          total: 0,
        };
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (state.deleteStatus) {
      fetchData(1);
      setState((prev) => ({ ...prev, deleteStatus: false }));
    }
  }, [state.deleteStatus, fetchData]);

  const handleSubcategoryChange = useCallback(() => {
    setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  }, []);

  return (
    <div>
      <SubcategoryListHeader
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
        <CreateSubcategory
          onClose={drawerHandlers.onClose}
          open={state.open}
          data={state.selectedRow}
          isAdd={state.isAdd}
          isView={state.isView}
          permission={permission}
          onSubcategoryChange={handleSubcategoryChange}
        />
      )}
      <Modal
        title="Confirm Delete"
        open={state.deleteModalVisible}
        onOk={actionHandlers.handleDeleteModalOk}
        onCancel={actionHandlers.handleDeleteModalCancel}
        maskClosable={false}
      >
        <p>Are you sure you want to delete this subcategory?</p>
      </Modal>
    </div>
  );
};

export default SubcategoryList;
