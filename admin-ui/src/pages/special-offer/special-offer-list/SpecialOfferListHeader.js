import React from "react";
import { Typography } from "antd";
import { MdAdd } from "react-icons/md";
import PermittedButton from "../../../components/PermittedButton/PermittedButton.jsx";

const { Title } = Typography;

const SpecialOfferListHeader = ({ showDrawer, setIsAdd, permission }) => {
  const handleClick = (e) => {
    e.preventDefault();
    showDrawer();
    setIsAdd(true);
  };

  return (
    <div className="w-full flex items-center justify-between mb-5">
      <Title level={5}>Special Offers</Title>
      <div className="flex items-center flex-col lg:flex-row">
        <PermittedButton
          text="Add Special Offer"
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

export default SpecialOfferListHeader; 