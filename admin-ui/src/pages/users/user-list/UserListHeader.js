import React from "react";
import { Button, Typography } from "antd";
import { MdAdd } from "react-icons/md";
import PermittedButton from "../../../components/PermittedButton/PermittedButton.jsx";

const { Title } = Typography;

const UserListHeader = ({ showDrawer, setIsAdd, permission }) => {
  const handleClick = (e) => {
    e.preventDefault();
    showDrawer();
    setIsAdd(true);
  };
  return (
    <div className="w-full flex items-center justify-between mb-5">
      <Title level={5}>User List</Title>
      <div className="flex items-center flex-col lg:flex-row">
        {/* <Button
          type="primary"
          icon={<MdAdd />}
          className="flex items-center"
          onClick={handleClick}
        >
          Add User
        </Button> */}
        <PermittedButton
          text="Add User"
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

export default UserListHeader;
