import { EyeOutlined } from "@ant-design/icons";
import {
  MdAddCircleOutline,
  MdDeleteOutline,
  MdOutlineFileCopy,
  MdOutlineModeEdit,
} from "react-icons/md";

export const getPermissionsForMenu = (menus, path) => {
  const menu = menus.find((menu) => menu.url === path);
  if (menu)
    return {
      ...menu,
    };
};

export const isAllowed = (permissionType, permission) => {
  switch (permissionType) {
    case "view":
      return permission && permission.can_view;
    case "add":
      return permission && permission.can_create;
    case "edit":
      return permission && permission.can_update;
    case "delete":
      return permission && permission.can_delete;
    case "report":
      return permission && permission.can_report;
    default:
      return false;
  }
};

export const isAllowedIcon = (permissionType) => {
  switch (permissionType) {
    case "view":
      return <EyeOutlined />;
    case "add":
      return <MdAddCircleOutline />;
    case "edit":
      return <MdOutlineModeEdit />;
    case "delete":
      return <MdDeleteOutline />;
    case "report":
      return <MdOutlineFileCopy />;
    default:
      return false;
  }
};
