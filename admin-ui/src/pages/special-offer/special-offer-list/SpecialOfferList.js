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
import SpecialOfferListHeader from "./SpecialOfferListHeader";
import CreateSpecialOffer from "../create-special-offer/CreateSpecialOffer";
import {
  deleteSpecialOffer,
  getSpecialOffer,
  getSpecialOffersWithPagination,
} from "../../../store/special-offer/specialOfferSlice";
import { getPermissionsForMenu } from "../../../utils/helper";
import { BASE_DOC_URL, BASE_URL } from "../../../utils/actionTypes";

const SpecialOfferList = () => {
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
            src={`${BASE_DOC_URL}${image}`}
            alt="Special Offer"
            style={{
              width: 200,
              height: 100,
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
      title: "Title",
      dataIndex: "title",
      key: "title",
      filterable: true,
      filterType: "search",
      sorter: true,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      width: 100,
      align: "center",
      sorter: true,
      render: (discount) => `${discount}%`,
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      align: "center",
      render: (isActive) => (isActive ? "Yes" : "No"),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      width: 150,
      sorter: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      width: 150,
      sorter: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, row) => (
        <Dropdown overlay={getActionMenu(row)} trigger={["click"]}>
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
    handleMenuClick: (e, row) => {
      if (e.key === "edit") {
        setState((prev) => ({
          ...prev,
          selectedRow: row,
          isAdd: false,
          open: true,
        }));
      } else if (e.key === "view") {
        setState((prev) => ({
          ...prev,
          selectedRow: row,
          isView: true,
          open: true,
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
      try {
        const response = await dispatch(
          deleteSpecialOffer(state.selectedRow.id)
        ).unwrap();
        if (response?.statusCode === 200) {
          toast.success(response.message || "Special offer deleted successfully");
          setState((prev) => ({
            ...prev,
            deleteModalVisible: false,
            selectedRow: null,
            refreshKey: prev.refreshKey + 1,
          }));
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete special offer");
      }
    },
    handleDeleteModalCancel: () => {
      setState((prev) => ({ ...prev, deleteModalVisible: false }));
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
          getSpecialOffersWithPagination({
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
        toast.error("Failed to fetch special offers");
        return {
          data: [],
          total: 0,
        };
      }
    },
    [dispatch]
  );

  return (
    <div>
      <SpecialOfferListHeader
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
        <CreateSpecialOffer
          onClose={drawerHandlers.onClose}
          open={state.open}
          data={state.selectedRow}
          isAdd={state.isAdd}
          isView={state.isView}
          permission={permission}
        />
      )}
      <Modal
        title="Confirm Delete"
        open={state.deleteModalVisible}
        onOk={actionHandlers.handleDeleteModalOk}
        onCancel={actionHandlers.handleDeleteModalCancel}
        maskClosable={false}
      >
        <p>Are you sure you want to delete this special offer?</p>
      </Modal>
    </div>
  );
};

export default SpecialOfferList; 