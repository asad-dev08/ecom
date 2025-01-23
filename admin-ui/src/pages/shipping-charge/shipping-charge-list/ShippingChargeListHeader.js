import React from "react";
import { Typography } from "antd";
import { MdAdd } from "react-icons/md";
import PermittedButton from "../../../components/PermittedButton/PermittedButton.jsx";

const { Title } = Typography;

const ShippingChargeListHeader = ({ showDrawer, setIsAdd, permission }) => {
  const handleClick = (e) => {
    e.preventDefault();
    showDrawer();
    setIsAdd(true);
  };

  return (
    <div className="w-full flex items-center justify-between mb-5">
      <Title level={5}>Shipping Charge List</Title>
      <div className="flex items-center flex-col lg:flex-row">
        <PermittedButton
          text="Add Shipping Charge"
          type="primary"
          icon={<MdAdd />}
          handleClick={handleClick}
          permission={permission}
          permissionType="add"
        />
      </div>
    </div>
  );
};

export default ShippingChargeListHeader; 