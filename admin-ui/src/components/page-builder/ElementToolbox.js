import React from "react";
import { Card } from "antd";
import DraggableElement from "./DraggableElement";
import {
  ContainerOutlined,
  FontSizeOutlined,
  FormOutlined,
  PictureOutlined,
  LayoutOutlined,
  CreditCardOutlined,
  LinkOutlined,
  BarsOutlined,
  BorderOuterOutlined,
  TableOutlined,
  FileTextOutlined,
  MenuOutlined,
  AppstoreOutlined,
  DragOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { MdOutlineSmartButton } from "react-icons/md";

const getDefaultHeadingStyles = (level = 1) => {
  const sizes = {
    1: "32px",
    2: "24px",
    3: "20px",
    4: "18px",
    5: "16px",
    6: "14px",
  };

  const weights = {
    1: 600,
    2: 600,
    3: 500,
    4: 500,
    5: 500,
    6: 500,
  };

  return {
    fontSize: sizes[level],
    fontWeight: weights[level],
    margin: "0",
    color: "#000000",
  };
};

const getDefaultColumnStyles = () => ({
  display: "flex",
  flexDirection: "column",
  flex: "1",
  minWidth: 0,
  padding: "8px",
  // Layout properties
  flexWrap: "nowrap",
  justifyContent: "flex-start",
  alignItems: "stretch",
  gap: "8px",

  // Dimensions
  width: "auto",
  height: "auto",
  minHeight: "50px",

  // Spacing
  marginTop: "0px",
  marginRight: "0px",
  marginBottom: "8px",
  marginLeft: "0px",
  paddingTop: "8px",
  paddingRight: "8px",
  paddingBottom: "8px",
  paddingLeft: "8px",

  // Border
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#f0f0f0",
  borderRadius: "4px",

  // Background
  backgroundColor: "#fafafa",
});

const getDefaultStyles = (type, existingStyles = {}) => {
  const commonStyles = {
    position: "static",
    ...existingStyles,
  };
  return commonStyles;
};

const elements = [
  {
    type: "container",
    label: "Container",
    icon: <ContainerOutlined />,
    defaultProps: {
      columns: 1,
      columnStyles: {
        0: getDefaultColumnStyles(),
      },
      columnWrapperStyles: {
        0: {
          flex: "1",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        },
      },
      style: getDefaultStyles("container", {
        padding: "16px",
        minHeight: "100px",
        width: "100%",
        backgroundColor: "#ffffff",
      }),
    },
  },
  {
    type: "text",
    label: "Text",
    icon: <FontSizeOutlined />,
    defaultProps: { content: "Click to edit text" },
    defaultStyles: getDefaultStyles("text"),
  },
  {
    type: "button",
    label: "Button",
    icon: <MdOutlineSmartButton />,
    defaultProps: { text: "Click Me" },
    defaultStyles: getDefaultStyles("button"),
  },
  {
    type: "input",
    label: "Input Field",
    icon: <FormOutlined />,
    defaultProps: {
      placeholder: "Enter text...",
      allowClear: true,
    },
    defaultStyles: getDefaultStyles("input", {
      width: "100%",
      margin: "4px 0",
    }),
  },
  {
    type: "image",
    label: "Image",
    icon: <PictureOutlined />,
    defaultProps: {
      src: "https://images.unsplash.com/photo-1527427337751-fdca2f128ce5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXwyMzY5ODc4fHxlbnwwfHx8fHw%3D",
      alt: "Placeholder Image",
      width: "150px",
      height: "150px",
    },
    defaultStyles: getDefaultStyles("image"),
  },
  {
    type: "header",
    label: "Header",
    icon: <MenuOutlined />,
    defaultProps: {},
    defaultStyles: getDefaultStyles("header"),
  },
  {
    type: "footer",
    label: "Footer",
    icon: <BarsOutlined />,
    defaultProps: {},
    defaultStyles: getDefaultStyles("footer"),
  },
  {
    type: "sidebar",
    label: "Sidebar",
    icon: <LayoutOutlined />,
    defaultProps: {},
    defaultStyles: getDefaultStyles("sidebar"),
  },
  {
    type: "form",
    label: "Form",
    icon: <FormOutlined />,
    defaultProps: {},
    defaultStyles: getDefaultStyles("form"),
  },
  {
    type: "heading",
    label: "Heading",
    icon: <FileTextOutlined />,
    defaultProps: {
      content: "New Heading",
      level: 1,
    },
    defaultStyles: getDefaultStyles("heading", getDefaultHeadingStyles(1)),
  },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: <FileTextOutlined />,
    defaultProps: {
      content: "Enter your paragraph text here",
    },
    defaultStyles: getDefaultStyles("paragraph", {
      fontSize: "16px",
      lineHeight: "1.5",
      color: "#333333",
      margin: "0 0 1em 0",
    }),
  },
  {
    type: "link",
    label: "Link",
    icon: <LinkOutlined />,
    defaultProps: {
      text: "Click here",
      href: "#",
      target: "_self",
    },
    defaultStyles: getDefaultStyles("link", {
      color: "#1890ff",
      textDecoration: "none",
      fontSize: "16px",
    }),
  },
  {
    type: "divider",
    label: "Divider",
    icon: <DragOutlined />,
    defaultProps: {},
    defaultStyles: getDefaultStyles("divider", {
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#d9d9d9",
      margin: "16px 0",
    }),
  },
  {
    type: "card",
    label: "Card",
    icon: <CreditCardOutlined />,
    defaultProps: {
      title: "Card Title",
      content: "Card content goes here",
      bordered: true,
      hasHeader: true,
      hasContent: true,
    },
    defaultStyles: getDefaultStyles("card", {
      width: "100%",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      header: {
        padding: "16px",
        backgroundColor: "#fafafa",
        borderBottom: "1px solid #f0f0f0",
      },
      content: {
        padding: "16px",
      },
    }),
  },
  {
    type: "grid",
    label: "Grid Layout",
    icon: <AppstoreOutlined />,
    defaultProps: { columns: 2, gutter: 16 },
    defaultStyles: getDefaultStyles("grid"),
  },
  {
    type: "table",
    label: "Table",
    icon: <TableOutlined />,
    defaultProps: { columns: [], dataSource: [] },
    defaultStyles: getDefaultStyles("table"),
  },
  {
    type: "box",
    label: "Box",
    icon: <BorderOuterOutlined />,
    defaultProps: {
      content: "Box content",
    },
    defaultStyles: getDefaultStyles("box", {
      padding: "16px",
      border: "1px solid #d9d9d9",
      borderRadius: "4px",
      backgroundColor: "#ffffff",
    }),
  },
  {
    type: "icon",
    label: "Icon",
    icon: <HeartOutlined />,
    defaultProps: {
      iconType: "heart",
    },
    defaultStyles: getDefaultStyles("icon", {
      fontSize: "24px",
      color: "#000000",
    }),
  },
];

const ElementToolbox = () => {
  return (
    <Card title="Elements" style={{ width: 300 }}>
      <div className="grid grid-cols-2 gap-4">
        {elements.map((element, index) => (
          <DraggableElement
            key={index}
            type={element.type}
            label={element.label}
            icon={element.icon}
            defaultProps={element.defaultProps}
          />
        ))}
      </div>
    </Card>
  );
};
export default ElementToolbox;
