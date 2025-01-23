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
import CompanyListHeader from "./CompanyListHeader";
import CreateCompany from "../create-company/CreateCompany";
import {
  deleteCompany,
  getCompany,
  getCompanysWithPagination,
} from "../../../store/company/companySlice";
import { getPermissionsForMenu } from "../../../utils/helper";

const CompanyList = () => {
  // Redux hooks
  const dispatch = useDispatch();
  const menus = useSelector((state) => state.auth.menus);

  // Router hooks
  const location = useLocation();

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
  const permission = getPermissionsForMenu(menus, location?.pathname);

  // Column definitions
  const defaultSorting = [{ field: "company_name", order: "asc" }];
  const columns = [
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
      filterable: true,
      filterType: "search",
      sorter: true,
    },
    {
      title: "Registration No",
      dataIndex: "registration_number",
      key: "registration_number",
      filterable: true,
      filterType: "search",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      filterable: true,
      filterType: "search",
      sorter: true,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      filterable: true,
      filterType: "select",
      filterOptions: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      render: (value) =>
        value ? (
          <p className="text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1 max-w-min">
            Active
          </p>
        ) : (
          <p className="text-red-600 bg-red-50 rounded-lg px-2 py-1 max-w-min">
            Inactive
          </p>
        ),
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
        const response = await dispatch(getCompany(row.id));
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
      const response = await dispatch(deleteCompany(state.selectedRow.id));
      if (response) {
        toast.success("Company deleted", { duration: 3000 });
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
        getCompanysWithPagination({
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

  const handleCompanyChange = useCallback(() => {
    setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  }, []);

  return (
    <div>
      <CompanyListHeader
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
        <CreateCompany
          onClose={drawerHandlers.onClose}
          open={state.open}
          data={state.selectedRow}
          isAdd={state.isAdd}
          isView={state.isView}
          permission={permission}
          onCompanyChange={handleCompanyChange}
        />
      )}
      <Modal
        title="Confirm Delete"
        visible={state.deleteModalVisible}
        onOk={actionHandlers.handleDeleteModalOk}
        onCancel={actionHandlers.handleDeleteModalCancel}
        maskClosable={false}
      >
        <p>Are you sure you want to delete this company?</p>
      </Modal>
    </div>
  );
};

export default CompanyList;
