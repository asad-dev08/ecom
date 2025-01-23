import React, { useEffect, useState } from "react";
import { Menu, Layout, Card, Typography, Image } from "antd";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import * as AntdIcons from "@ant-design/icons";
import { FaIcons } from "react-icons/fa";

const { Title } = Typography;

function convertFlatToNested(items) {
  const map = {};
  const roots = [];

  // Create a mapping of id to item and find root items
  items.forEach((item) => {
    map[item.id] = { ...item, children: [], title: item.title };
    if (!item.parent_id) {
      roots.push(map[item.id]);
    }
  });

  // Link child items to their parent
  items.forEach((item) => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    }
  });

  return roots;
}
const Sidebar = ({ defaultOpenKeys, collapsed, isMediumScreen, menus }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [stateOpenKeys, setStateOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    // Convert flat items to nested structure
    const nestedItems = convertFlatToNested(menus);

    // Set converted items to state variable
    setMenuItems(nestedItems);
  }, [menus]);

  function CustomIcon(type, icon_library = "antd") {
    const AntdIcon = AntdIcons[type];

    return AntdIcon ? <AntdIcon /> : null;
  }
  function addKeyProperty(menuItem) {
    if (menuItem.children && menuItem.children.length > 0) {
      menuItem.key = menuItem.id;
      menuItem.children.forEach(addKeyProperty);
    } else {
      menuItem.key = menuItem.id;
    }
  }
  menuItems.forEach(addKeyProperty);
  function getItem(id, label, url, icon, icon_library, key, children, type) {
    return {
      id,
      key,
      children,
      label,
      url,
      icon: icon ? CustomIcon(icon, icon_library) : null,
      type,
    };
  }

  function convertMenuItem(menuItem) {
    const { id, title, url, icon, icon_library, children } = menuItem;
    const key = id.toString();
    const childrenItems =
      children.length > 0 ? children.flatMap(convertMenuItem) : undefined;
    return getItem(id, title, url, icon, icon_library, key, childrenItems);
  }

  function getLevelKeys(items1) {
    const key = {};
    const func = (items2, level = 1) => {
      items2.forEach((item) => {
        if (item.key) {
          key[item.key] = level;
        }
        if (item.children) {
          return func(item.children, level + 1);
        }
      });
    };
    func(items1);
    return key;
  }

  const items = menuItems.flatMap(convertMenuItem);

  const levelKeys = getLevelKeys(items);

  useEffect(() => {
    // Find the matching menu item based on the current route
    const findMenuItemByUrl = (items, url, pathIds = []) => {
      for (const item of items) {
        // Check if the current item's URL matches

        if (item.url && matchPath(location.pathname, item.url)) {
          // Return both the matched item and the path IDs
          return { item, pathIds: [...pathIds, item.key] };
        }
        // Check if the current item has children
        if (item.children && item.children.length > 0) {
          // Recursively search in the children
          const result = findMenuItemByUrl(item.children, url, [
            ...pathIds,
            item.key.toString(),
          ]);
          // If a match is found in the children, return the result
          if (result) {
            return result;
          }
        }
      }
      // No match found in this branch
      return null;
    };

    // Find the matching menu item based on the current route
    const selectedMenuItem = findMenuItemByUrl(items, location.pathname);
    // Set the key of the matching menu item as the selected key
    if (selectedMenuItem && selectedMenuItem.item) {
      setSelectedKeys([selectedMenuItem.item.id.toString()]);
      setStateOpenKeys(selectedMenuItem.pathIds);
    } else {
      setSelectedKeys([]);
      setStateOpenKeys([]);
    }
  }, [location, menuItems]);

  const onOpenChange = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1
    );
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);
      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };
  const findMenuItem = (items, key) => {
    for (const item of items) {
      if (item.key === key) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const child = findMenuItem(item.children, key);
        if (child) {
          return child;
        }
      }
    }
    return null;
  };
  const handleClick = (info) => {
    const { key } = info;
    const menuItem = findMenuItem(items, key);
    if (menuItem && menuItem.url) {
      navigate(menuItem.url);
    }
  };

  return (
    <div className="h-full">
      <Card
        style={{ borderRadius: 0, width: 280, height: 62 }}
        bodyStyle={{
          padding: "0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
        className="w-full flex items-center shadow-sm justify-between"
      >
        <Title
          level={4}
          style={{ marginBottom: 0, color: "#652B82", fontWeight: "bold" }}
        >
          LOGO
        </Title>
      </Card>
      <Menu
        style={{
          height: !isMediumScreen ? "calc(100vh - 62px)" : "",
          overflowY: "auto",
          width: "280px",
          padding: "0 5px",
          fontSize: 13,
          fontWeight: 500,
        }}
        mode="inline"
        onClick={handleClick}
        defaultSelectedKeys={selectedKeys}
        selectedKeys={selectedKeys}
        openKeys={stateOpenKeys}
        onOpenChange={onOpenChange}
        items={items}
      />
    </div>
  );
};
export default Sidebar;
