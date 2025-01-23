import React from "react";
import * as AntdIcons from "@ant-design/icons";
import { Button, Input, Form, Layout, Card } from "antd";

const { Header, Footer, Sider, Content } = Layout;

const Preview = ({ elements }) => {
  const getIconComponent = (iconType) => {
    const IconComponent =
      AntdIcons[
        `${iconType.charAt(0).toUpperCase() + iconType.slice(1)}Outlined`
      ];
    return IconComponent ? <IconComponent /> : null;
  };

  const renderElement = (element) => {
    const childElements = elements.filter((el) => el.parentId === element.id);
    const columns = element.props?.columns || 1;

    switch (element.type) {
      case "container":
        return (
          <div
            style={{
              ...element.styles,
            }}
          >
            <div>
              {[...Array(columns)].map((_, columnIndex) => {
                const columnElements = childElements.filter(
                  (child) => child.columnIndex === columnIndex
                );
                const columnWrapperStyles =
                  element.styles?.columnWrapperStyles?.[columnIndex] || {};
                const columnStyles =
                  element.styles?.columnStyles?.[columnIndex] || {};
                const columnContentStyles =
                  element.styles?.columnContentStyles?.[columnIndex] || {};

                return (
                  <div
                    key={columnIndex}
                    style={{
                      ...columnWrapperStyles,
                    }}
                  >
                    <div
                      style={{
                        ...columnContentStyles,
                      }}
                    >
                      <div
                        style={{
                          ...columnStyles,
                        }}
                      >
                        {columnElements.map((child) => renderElement(child))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "text":
      case "paragraph":
        return (
          <p
            style={{
              ...element.styles,
            }}
          >
            {element.props?.content || "Text content"}
          </p>
        );

      case "heading":
        const HeadingTag = `h${element.props?.level || 1}`;
        return (
          <HeadingTag
            style={{
              ...element.styles,
            }}
          >
            {element.props?.content || "Heading"}
          </HeadingTag>
        );

      case "image":
        return (
          <img
            src={element.props?.src || "https://via.placeholder.com/150"}
            alt={element.props?.alt || "Preview image"}
            style={{
              maxWidth: "100%",
              height: "auto",
              ...element.styles,
            }}
          />
        );

      case "button":
        return (
          <button
            style={{
              ...element.styles,
            }}
          >
            {element.props?.text || "Button"}
          </button>
        );

      case "link":
        return (
          <a
            href={element.props?.href || "#"}
            target={element.props?.target || "_blank"}
            style={{
              ...element.styles,
            }}
          >
            {element.props?.text || "Link"}
          </a>
        );

      case "divider":
        return (
          <hr
            style={{
              ...element.styles,
            }}
          />
        );

      case "icon":
        return (
          <span
            style={{
              ...element.styles,
            }}
          >
            {getIconComponent(element.props?.iconType || "heart")}
          </span>
        );

      case "box":
        return (
          <div
            style={{
              ...element.styles,
            }}
          >
            {element.props?.content || "Box content"}
          </div>
        );

      case "input":
        return (
          <Input
            placeholder={element.props?.placeholder || "Enter text..."}
            style={{
              width: element.styles?.width || "200px",
              ...element.styles,
            }}
            {...element.props}
          />
        );

      case "card":
        return (
          <Card
            bordered={element.props?.bordered !== false}
            style={element.styles}
          >
            {element.props?.hasHeader && (
              <div style={element.styles?.header}>
                {elements
                  .filter(
                    (el) => el.parentId === element.id && el.columnIndex === 0
                  )
                  .map((childElement) => renderElement(childElement))}
              </div>
            )}
            {element.props?.hasContent && (
              <div style={element.styles?.content}>
                {elements
                  .filter(
                    (el) => el.parentId === element.id && el.columnIndex === 1
                  )
                  .map((childElement) => renderElement(childElement))}
              </div>
            )}
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="preview-container"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}
    >
      {elements
        .filter((element) => !element.parentId)
        .map((element) => (
          <div key={element.id}>{renderElement(element)}</div>
        ))}
    </div>
  );
};

export default Preview;
