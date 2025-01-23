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
import SecurityRuleListHeader from "./SecurityRuleListHeader";
import CreateSecurityRule from "../create-security-rule/CreateSecurityRule";
import {
  deleteSecurityRule,
  getSecurityRule,
  getSecurityRulesWithPagination,
} from "../../../store/security-rule/securityRuleSlice";
import { getPermissionsForMenu } from "../../../utils/helper";
import { getMenus } from "../../../store/menu/menuSlice";

const SecurityRuleList = () => {
  // Redux hooks
  const dispatch = useDispatch();
  const menus = useSelector((state) => state.menu.menus);
  const menusPermission = useSelector((state) => state.auth.menus);

  // Router hooks
  const location = useLocation();

  useEffect(() => {
    dispatch(getMenus());
  }, [dispatch]);

  // State management
  const [state, setState] = useState({
    deleteStatus: false,
    open: false,
    isAdd: false,
    isView: false,
    selectedRow: null,
    deleteModalVisible: false,
    refreshKey: 0,
  });

  // Permissions
  const permission = getPermissionsForMenu(menusPermission, location?.pathname);

  // Column definitions
  const defaultSorting = [{ field: "name", order: "asc" }];
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
      title: "Description",
      dataIndex: "description",
      key: "description",
      filterable: true,
      filterType: "search",
      sorter: true,
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
        const response = await dispatch(getSecurityRule(row.id));
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
      const response = await dispatch(deleteSecurityRule(state.selectedRow.id));
      if (response) {
        toast.success("SecurityRule deleted", { duration: 3000 });
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

  // Data fetching
  const fetchData = useCallback(
    async (page, pageSize, filters, sorting, globalSearch) => {
      const response = await dispatch(
        getSecurityRulesWithPagination({
          page,
          pageSize,
          filters,
          sorting,
          globalSearch,
        })
      );

      const data = response.payload?.data;
      return {
        data: data?.rows || [],
        total: data?.total?.total || 0,
      };
    },
    [dispatch]
  );

  // Effects
  useEffect(() => {
    if (state.deleteStatus) {
      fetchData(1);
      setState((prev) => ({ ...prev, deleteStatus: false }));
    }
  }, [state.deleteStatus, fetchData]);

  const handleSecurityRuleChange = useCallback(() => {
    setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  }, []);

  return (
    <div>
      <SecurityRuleListHeader
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
        <CreateSecurityRule
          onClose={drawerHandlers.onClose}
          open={state.open}
          data={state.selectedRow}
          isAdd={state.isAdd}
          isView={state.isView}
          permission={permission}
          menus={menus}
          onSecurityRuleChange={handleSecurityRuleChange}
        />
      )}
      <Modal
        title="Confirm Delete"
        visible={state.deleteModalVisible}
        onOk={actionHandlers.handleDeleteModalOk}
        onCancel={actionHandlers.handleDeleteModalCancel}
        maskClosable={false}
      >
        <p>Are you sure you want to delete this security rule?</p>
      </Modal>
    </div>
  );
};

export default SecurityRuleList;
