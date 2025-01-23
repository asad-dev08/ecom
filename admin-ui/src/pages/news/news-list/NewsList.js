import React, { useCallback, useEffect, useState } from "react";
import { Button, Dropdown, Menu, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  MdDeleteOutline,
  MdMoreVert,
  MdOutlineModeEdit,
  MdOutlineRemoveRedEye,
} from "react-icons/md";
import { toast } from "react-hot-toast";
import moment from "moment";
import NewsListHeader from "./NewsListHeader";
import CreateNews from "../create-news/CreateNews";
import { useLocation } from "react-router-dom";
import { getPermissionsForMenu } from "../../../utils/helper";
import PaginatedDataGrid from "../../../components/datagrid/PaginatedDataGrid";
import {
  deleteNews,
  getNews,
  getNewsWithPagination,
} from "../../../store/news/newsSlice";
import { newsTypeList } from "../../../utils/actionTypes";

const NewsList = () => {
  const dispatch = useDispatch();
  const menus = useSelector((state) => state.auth.menus);
  const location = useLocation();
  const [state, setState] = useState({
    open: false,
    isAdd: true,
    isView: false,
    selectedRow: null,
    deleteModalVisible: false,
    deleteId: null,
    refreshKey: 0,
    deleteStatus: false,
  });

  const permission = getPermissionsForMenu(menus, location?.pathname);

  // Drawer handlers
  const drawerHandlers = {
    showDrawer: () => setState((prev) => ({ ...prev, open: true })),
    onClose: () => setState((prev) => ({ ...prev, open: false })),
    setAddOrEdit: (isAdd) => setState((prev) => ({ ...prev, isAdd })),
  };

  // Action handlers
  const actionHandlers = {
    handleMenuClick: async (e, row) => {
      if (e.key === "edit" || e.key === "view") {
        const response = await dispatch(getNews(row.id));
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
      const response = await dispatch(deleteNews(state.selectedRow.id));
      if (response) {
        toast.success("News deleted", { duration: 3000 });
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

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      filterable: true,
      filterType: "search",
      sorter: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filterable: true,
      filterType: "select",
      filterOptions: newsTypeList,
      sorter: true,
      render: (value) => {
        const status = newsTypeList.find((item) => item.value === value);
        return status?.label;
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      width: "30%",
      key: "description",
      render: (value) => {
        return <div className="line-clamp-2">{value}</div>;
      },
    },
    {
      title: "Publish Date",
      dataIndex: "publish_date",
      key: "publish_date",
      render: (value) => moment(value).format("DD MMM YYYY"),
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

  const fetchData = useCallback(
    async (page, pageSize, filters, sorting, globalSearch) => {
      const response = await dispatch(
        getNewsWithPagination({
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

  useEffect(() => {
    if (state.deleteStatus) {
      fetchData(1);
      setState((prev) => ({ ...prev, deleteStatus: false }));
    }
  }, [state.deleteStatus, fetchData]);

  const handleNewsChange = useCallback(() => {
    setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  }, []);

  return (
    <div>
      <NewsListHeader
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
        <CreateNews
          onClose={drawerHandlers.onClose}
          open={state.open}
          data={state.selectedRow}
          isAdd={state.isAdd}
          isView={state.isView}
          permission={permission}
          onNewsChange={handleNewsChange}
        />
      )}
      <Modal
        title="Confirm Delete"
        visible={state.deleteModalVisible}
        onOk={actionHandlers.handleDeleteModalOk}
        onCancel={actionHandlers.handleDeleteModalCancel}
        maskClosable={false}
      >
        <p>Are you sure you want to delete this news?</p>
      </Modal>
    </div>
  );
};

export default NewsList;
