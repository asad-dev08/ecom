import React from "react";
import { Button } from "antd";
import clsx from "clsx";
import { isAllowed, isAllowedIcon } from "../../utils/helper";

const PermittedButton = ({
  text,
  type,
  className,
  handleClick,
  permission,
  permissionType,
}) => {
  if (isAllowed(permissionType, permission)) {
    return (
      <div>
        <Button
          type={type}
          icon={isAllowedIcon(permissionType)}
          className={clsx(className, "flex items-center")}
          style={{ backgroundColor: "none" }} // Add this line
          onClick={handleClick}
        >
          {text}
        </Button>
      </div>
    );
  }

  return null;
};

export default PermittedButton;
