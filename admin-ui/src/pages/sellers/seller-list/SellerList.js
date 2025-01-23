import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Avatar, Button, Dropdown, Menu, Modal, Rate, Tag, Switch } from "antd";
import {
  MdDeleteOutline,
  MdMoreVert,
  MdOutlineModeEdit,
  MdOutlineRemoveRedEye,
  MdBusinessCenter,
} from "react-icons/md";
import toast from "react-hot-toast";

import PaginatedDataGrid from "../../../components/datagrid/PaginatedDataGrid";
import SellerListHeader from "./SellerListHeader";
import CreateSeller from "../create-seller/CreateSeller";
import CreateCompany from "../../company/create-company/CreateCompany";
import {
  deleteSeller,
  getSeller,
  getSellersWithPagination,
  updateSeller,
  updateSellerVerification,
} from "../../../store/seller/sellerSlice";
import { getPermissionsForMenu } from "../../../utils/helper";
import { formatDate } from "../../../utils/dateUtils";
import { BASE_DOC_URL } from "../../../utils/actionTypes";

const SellerList = () => {
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

  const [companyDrawerOpen, setCompanyDrawerOpen] = useState(false);
  const [selectedSellerForCompany, setSelectedSellerForCompany] =
    useState(null);

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
        const response = await dispatch(getSeller(row.id));
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
      const response = await dispatch(deleteSeller(state.selectedRow.id));
      if (response) {
        toast.success("Seller deleted", { duration: 3000 });
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
      {permission?.can_create && !row?.companies?.length > 0 && (
        <Menu.Item key="createCompany" onClick={() => handleCreateCompany(row)}>
          <div className="flex items-center gap-2">
            <MdBusinessCenter /> Create Company
          </div>
        </Menu.Item>
      )}
    </Menu>
  );

  const defaultSorting = [{ field: "created_at", order: "desc" }];
  const columns = [
    // {
    //   title: "Logo",
    //   dataIndex: "logo",
    //   key: "logo",
    //   width: 200,
    //   render: (logo) =>
    //     logo ? (
    //       <img
    //         src={`${BASE_DOC_URL}/${logo}`}
    //         alt="Seller Logo"
    //         style={{
    //           width: 100,
    //           height: 100,
    //           objectFit: "cover",
    //           borderRadius: "4px",
    //         }}
    //         onError={(e) => {
    //           console.log("Error loading logo", e);
    //         }}
    //       />
    //     ) : null,
    // },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      filterable: true,
      filterType: "search",
      render: (name, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-sm text-gray-500">{record.slug}</span>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      filterable: true,
      filterType: "search",
      sorter: true,
      render: (_, record) => (
        <div className="flex flex-col">
          <span>{record.email}</span>
          {record.phone && (
            <span className="text-sm text-gray-500">{record.phone}</span>
          )}
        </div>
      ),
    },
    {
      title: "Rating",
      key: "rating",
      dataIndex: "rating",
      sorter: true,
      filterable: true,
      filterType: "number",
      render: (_, record) => (
        <div className="flex flex-col">
          <Rate disabled allowHalf defaultValue={record.rating} />
          <span className="text-sm text-gray-500">
            ({record.reviewCount} reviews)
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      key: "verified",
      dataIndex: "verified",
      sorter: true,
      filterable: true,
      filterType: "boolean",
      render: (_, record) => (
        <Tag color={record.verified ? "success" : "default"}>
          {record.verified ? "Verified" : "Unverified"}
        </Tag>
      ),
    },
    {
      title: "Verified",
      dataIndex: "verified",
      key: "verified",
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.verified}
          onChange={(checked) => handleVerificationChange(checked, record)}
          disabled={!permission?.can_update}
          checkedChildren="Yes"
          unCheckedChildren="No"
        />
      ),
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

  // Data fetching
  const fetchData = useCallback(
    async (page, pageSize, filters, sorting, globalSearch) => {
      const response = await dispatch(
        getSellersWithPagination({
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

  const handleSellerChange = useCallback(() => {
    setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  }, []);

  const handleCreateCompany = async (seller) => {
    setSelectedSellerForCompany(seller);
    setCompanyDrawerOpen(true);
  };

  const handleCompanyCreated = async (companyData) => {
    setCompanyDrawerOpen(false);
    setSelectedSellerForCompany(null);
    setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
  };

  const handleVerificationChange = async (checked, record) => {
    try {
      const response = await dispatch(
        updateSellerVerification({
          id: record.id,
          verified: checked,
        })
      );

      if (response?.payload?.statusCode === 200) {
        toast.success(response?.payload?.message);
        setState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 })); // Refresh the list
      }
    } catch (error) {
      toast.error("Failed to update seller verification");
    }
  };

  return (
    <div>
      <SellerListHeader
        showDrawer={drawerHandlers.showDrawer}
        setIsAdd={drawerHandlers.setAddOrEdit}
        permission={permission}
      />
      <PaginatedDataGrid
        columns={columns}
        fetchData={fetchData}
        defaultSorting={[{ field: "created_at", order: "desc" }]}
        key={state.refreshKey}
      />
      {state.open && (
        <CreateSeller
          onClose={drawerHandlers.onClose}
          open={state.open}
          data={state.selectedRow}
          isAdd={state.isAdd}
          isView={state.isView}
          permission={permission}
          onSellerChange={handleSellerChange}
        />
      )}
      <Modal
        title="Confirm Delete"
        visible={state.deleteModalVisible}
        onOk={actionHandlers.handleDeleteModalOk}
        onCancel={actionHandlers.handleDeleteModalCancel}
        maskClosable={false}
      >
        <p>Are you sure you want to delete this seller?</p>
      </Modal>
      {companyDrawerOpen && (
        <CreateCompany
          onClose={() => {
            setCompanyDrawerOpen(false);
            setSelectedSellerForCompany(null);
          }}
          open={companyDrawerOpen}
          isAdd={true}
          permission={permission}
          onCompanyChange={handleCompanyCreated}
          initialData={{
            seller_id: selectedSellerForCompany?.id,
            company_name: selectedSellerForCompany?.name,
            email: selectedSellerForCompany?.email,
            phone: selectedSellerForCompany?.phone,
            is_seller: true,
            is_active: true,
          }}
        />
      )}
    </div>
  );
};

export default SellerList;
