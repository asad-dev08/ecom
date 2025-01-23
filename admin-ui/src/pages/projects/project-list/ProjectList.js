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
import ProjectListHeader from "./ProjectListHeader";
import CreateProject from "../create-project/CreateProject";
import {
  deleteProject,
  getProject,
  getProjectsWithPagination,
} from "../../../store/project/projectSlice";
import { getPermissionsForMenu } from "../../../utils/helper";
import {
  ProjectStatusList,
  ProjectStatusColors,
} from "../../../utils/actionTypes";
import moment from "moment";

const ProjectList = () => {
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
        const response = await dispatch(getProject(row.id));
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
      const response = await dispatch(deleteProject(state.selectedRow.id));
      if (response) {
        toast.success("Project deleted", { duration: 3000 });
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
      title: "Project Title",
      dataIndex: "title",
      key: "title",
      filterable: true,
      filterType: "search",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (value) => {
        return <div className="line-clamp-2">{value}</div>;
      },
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      sorter: true,
      render: (value) => {
        return <div className="">{moment(value).format("DD-MM-YYYY")}</div>;
      },
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      sorter: true,
      render: (value) => {
        return <div className="">{moment(value).format("DD-MM-YYYY")}</div>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filterable: true,
      filterType: "select",
      filterOptions: ProjectStatusList,
      render: (value) => {
        const status = ProjectStatusList.find((item) => item.value === value);
        return (
          <Tag color={ProjectStatusColors[value]} key={value}>
            {status?.label}
          </Tag>
        );
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
      const response = await dispatch(
        getProjectsWithPagination({
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

  const handleProjectChange = useCallback(() => {
    setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  }, []);

  return (
    <div>
      <ProjectListHeader
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
        <CreateProject
          onClose={drawerHandlers.onClose}
          open={state.open}
          data={state.selectedRow}
          isAdd={state.isAdd}
          isView={state.isView}
          permission={permission}
          onProjectChange={handleProjectChange}
        />
      )}
      <Modal
        title="Confirm Delete"
        visible={state.deleteModalVisible}
        onOk={actionHandlers.handleDeleteModalOk}
        onCancel={actionHandlers.handleDeleteModalCancel}
        maskClosable={false}
      >
        <p>Are you sure you want to delete this project?</p>
      </Modal>
    </div>
  );
};

export default ProjectList;
