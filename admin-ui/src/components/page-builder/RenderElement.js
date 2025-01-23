import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { Button, Input, Form, Layout, Tooltip, Card } from "antd";
import DropZone from "./DropZone";
import {
  setSelectedElement,
  deleteElement,
  updateElement,
} from "../../store/page-bulider/pageBuilderSlice";
import {
  DeleteOutlined,
  EditOutlined,
  SwapOutlined,
  HeartOutlined,
  StarOutlined,
  UserOutlined,
  SettingOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  LinkOutlined,
  SearchOutlined,
  BellOutlined,
  CalendarOutlined,
  FileOutlined,
  FolderOutlined,
  PictureOutlined,
  TeamOutlined,
  ShoppingOutlined,
  MessageOutlined,
  LikeOutlined,
  CloudOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoOutlined,
  WarningOutlined,
  QuestionOutlined,
  LockOutlined,
  UnlockOutlined,
  PrinterOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
  WifiOutlined,
  CarOutlined,
  CompassOutlined,
  DashboardOutlined,
  GiftOutlined,
  TrophyOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import "./RenderElement.css";

const { Header, Footer, Sider, Content } = Layout;

const iconComponents = {
  heart: HeartOutlined,
  star: StarOutlined,
  user: UserOutlined,
  setting: SettingOutlined,
  home: HomeOutlined,
  phone: PhoneOutlined,
  mail: MailOutlined,
  link: LinkOutlined,
  search: SearchOutlined,
  bell: BellOutlined,
  calendar: CalendarOutlined,
  file: FileOutlined,
  folder: FolderOutlined,
  picture: PictureOutlined,
  team: TeamOutlined,
  shopping: ShoppingOutlined,
  message: MessageOutlined,
  like: LikeOutlined,
  cloud: CloudOutlined,
  check: CheckOutlined,
  close: CloseOutlined,
  info: InfoOutlined,
  warning: WarningOutlined,
  question: QuestionOutlined,
  lock: LockOutlined,
  unlock: UnlockOutlined,
  printer: PrinterOutlined,
  camera: CameraOutlined,
  videoCamera: VideoCameraOutlined,
  audio: AudioOutlined,
  customerService: CustomerServiceOutlined,
  global: GlobalOutlined,
  wifi: WifiOutlined,
  car: CarOutlined,
  compass: CompassOutlined,
  dashboard: DashboardOutlined,
  gift: GiftOutlined,
  trophy: TrophyOutlined,
  rocket: RocketOutlined,
};

const RenderElement = ({ element, elements }) => {
  const dispatch = useDispatch();
  const selectedElement = useSelector(
    (state) => state.pageBuilder.selectedElement
  );
  const isSelected = selectedElement?.id === element.id;
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    dispatch(setSelectedElement(element));
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteElement(element.id));
  };

  const renderContainer = () => {
    const childElements = elements.filter((el) => el.parentId === element.id);
    const columns = element.props?.columns || 1;

    const handleColumnClick = (e, columnIndex) => {
      e.stopPropagation();
      dispatch(
        setSelectedElement({
          ...element,
          id: `${element.id}-column-${columnIndex}`,
          isColumn: true,
          columnIndex,
          parentElement: element,
        })
      );
    };

    const handleColumnDelete = (e, columnIndex) => {
      e.stopPropagation();
      // Delete all elements in this column
      const columnElements = childElements.filter(
        (child) => child.columnIndex === columnIndex
      );
      columnElements.forEach((element) => {
        dispatch(deleteElement(element.id));
      });

      // Update remaining elements' columnIndex
      const remainingElements = childElements.filter(
        (child) => child.columnIndex > columnIndex
      );
      remainingElements.forEach((element) => {
        dispatch(
          updateElement({
            id: element.id,
            updates: {
              columnIndex: element.columnIndex - 1,
            },
          })
        );
      });

      // Reduce the number of columns
      dispatch(
        updateElement({
          id: element.id,
          updates: {
            props: {
              ...element.props,
              columns: columns - 1,
            },
          },
        })
      );
    };

    const handleColumnWrapperClick = (e, columnIndex) => {
      e.stopPropagation();
      dispatch(
        setSelectedElement({
          ...element,
          id: `${element.id}-column-wrapper-${columnIndex}`,
          isColumnWrapper: true,
          columnIndex,
          parentElement: element,
        })
      );
    };

    const handleColumnContentClick = (e, columnIndex) => {
      e.stopPropagation();
      dispatch(
        setSelectedElement({
          ...element,
          id: `${element.id}-column-content-${columnIndex}`,
          isColumnContent: true,
          columnIndex,
          parentElement: element,
        })
      );
    };

    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`container-element ${isSelected ? "selected" : ""} ${
          isHovered ? "hovered" : ""
        }`}
        style={{
          position: "relative",
          border: "1px dashed #d9d9d9",
          borderColor: isSelected
            ? "#1890ff"
            : isHovered
            ? "#40a9ff"
            : "#d9d9d9",
          padding: "8px",
          margin: "4px 0",
          minHeight: "50px",
          borderRadius: "4px",
          ...element.styles,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "stretch",
            gap: "8px",
            minHeight: "inherit",
          }}
        >
          {[...Array(columns)].map((_, columnIndex) => {
            const columnElements = childElements.filter(
              (child) => child.columnIndex === columnIndex
            );
            const isColumnSelected =
              selectedElement?.isColumn &&
              selectedElement?.parentElement?.id === element.id &&
              selectedElement?.columnIndex === columnIndex;
            const isColumnWrapperSelected =
              selectedElement?.isColumnWrapper &&
              selectedElement?.parentElement?.id === element.id &&
              selectedElement?.columnIndex === columnIndex;
            const isColumnHovered = isHovered;

            const columnStyles =
              element.styles?.columnStyles?.[columnIndex] || {};
            const columnWrapperStyles =
              element.styles?.columnWrapperStyles?.[columnIndex] || {};

            return (
              <div
                key={columnIndex}
                onClick={(e) => handleColumnWrapperClick(e, columnIndex)}
                className={`column-wrapper ${
                  isColumnWrapperSelected ? "selected" : ""
                } hover:border hover:border-dashed hover:border-blue-500`}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  flex: columnWrapperStyles.flex || "1",
                  minWidth: 0,
                  ...columnWrapperStyles,
                }}
              >
                {isColumnWrapperSelected && (
                  <div
                    className="element-type-label"
                    style={{ top: "-20px", left: "0" }}
                  >
                    Column Wrapper {columnIndex + 1}
                  </div>
                )}

                {/* Column Controls */}
                {(isColumnWrapperSelected || isColumnHovered) && (
                  <div
                    className="element-controls"
                    style={{ top: "-20px", right: "0" }}
                  >
                    <Button
                      icon={<EditOutlined />}
                      size="small"
                      onClick={(e) => handleColumnWrapperClick(e, columnIndex)}
                      style={{ background: "#fff", marginRight: "4px" }}
                    />
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={(e) => handleColumnDelete(e, columnIndex)}
                      style={{ background: "#fff" }}
                      disabled={columns <= 1}
                    />
                  </div>
                )}

                {/* Content Container */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    marginTop: 10,
                  }}
                >
                  {/* Inner column container */}
                  <div
                    onClick={(e) => handleColumnContentClick(e, columnIndex)}
                    className={`column-content ${
                      selectedElement?.isColumnContent &&
                      selectedElement?.parentElement?.id === element.id &&
                      selectedElement?.columnIndex === columnIndex
                        ? "selected"
                        : ""
                    } hover:border hover:border-dashed hover:border-blue-500`}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      ...element.styles?.columnContentStyles?.[columnIndex],
                    }}
                  >
                    {selectedElement?.isColumnContent &&
                      selectedElement?.parentElement?.id === element.id &&
                      selectedElement?.columnIndex === columnIndex && (
                        <div
                          className="element-type-label"
                          style={{ top: "-20px", left: "0" }}
                        >
                          Column Content {columnIndex + 1}
                        </div>
                      )}

                    {/* Inner column container */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColumnClick(e, columnIndex);
                      }}
                      style={{
                        paddingTop: "10px",
                        position: "relative",
                        flex: 1,
                        ...columnStyles,
                      }}
                    >
                      {isColumnSelected && (
                        <div
                          className="element-type-label"
                          style={{ top: "-20px", left: "0" }}
                        >
                          Column {columnIndex + 1}
                        </div>
                      )}

                      {/* Column Content */}
                      {columnElements.map((child) => (
                        <RenderElement
                          key={child.id}
                          element={child}
                          elements={elements}
                        />
                      ))}
                    </div>

                    {/* DropZone */}
                    <div style={{ marginTop: "8px" }}>
                      <DropZone
                        parentId={element.id}
                        columnIndex={columnIndex}
                        index={columnElements.length}
                        isEmpty={columnElements.length === 0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(isSelected || isHovered) && (
          <div className="element-controls">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              onClick={handleDelete}
              style={{ background: "#fff" }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderElement = () => {
    switch (element.type) {
      // case "button":
      //   return (
      //     <div
      //       onClick={handleClick}
      //       onMouseEnter={() => setIsHovered(true)}
      //       onMouseLeave={() => setIsHovered(false)}
      //       className={`element-wrapper ${isSelected ? "selected" : ""} ${
      //         isHovered ? "hovered" : ""
      //       }`}
      //       style={{ position: "relative" }}
      //     >
      //       {isHovered && <div className="element-type-label">Button</div>}

      //       <Button {...element.props} style={element.styles}>
      //         {element.props?.text || "Button"}
      //       </Button>

      //       {(isSelected || isHovered) && (
      //         <div className="element-controls">
      //           <Button
      //             icon={<DeleteOutlined />}
      //             size="small"
      //             onClick={handleDelete}
      //             style={{ background: "#fff" }}
      //           />
      //         </div>
      //       )}
      //     </div>
      //   );
      case "button":
        return (
          <Button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`${isSelected ? "selected" : ""} ${
              isHovered ? "hovered" : ""
            }`}
            {...element.props}
            style={{
              position: "relative",
              ...element.styles,
            }}
          >
            {isHovered && <div className="element-type-label">Button</div>}
            {element.props?.text || "Button"}
            {(isSelected || isHovered) && (
              <div className="element-controls">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                  style={{ background: "#fff" }}
                />
              </div>
            )}
          </Button>
        );

      // case "text":
      //   return (
      //     <div
      //       onClick={handleClick}
      //       onMouseEnter={() => setIsHovered(true)}
      //       onMouseLeave={() => setIsHovered(false)}
      //       className={`element-wrapper ${isSelected ? "selected" : ""} ${
      //         isHovered ? "hovered" : ""
      //       }`}
      //       style={{ position: "relative" }}
      //     >
      //       {isHovered && <div className="element-type-label">Text</div>}

      //       <div style={element.styles}>{element.props?.content || "Text"}</div>

      //       {(isSelected || isHovered) && (
      //         <div className="element-controls">
      //           <Button
      //             icon={<DeleteOutlined />}
      //             size="small"
      //             onClick={handleDelete}
      //             style={{ background: "#fff" }}
      //           />
      //         </div>
      //       )}
      //     </div>
      //   );
      case "text":
        return (
          <span
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`${isSelected ? "selected" : ""} ${
              isHovered ? "hovered" : ""
            }`}
            style={{
              position: "relative",
              display: "inline-block",
              ...element.styles,
            }}
          >
            {isHovered && <div className="element-type-label">Text</div>}
            {element.props?.content || "Text"}
            {(isSelected || isHovered) && (
              <div className="element-controls">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                  style={{ background: "#fff" }}
                />
              </div>
            )}
          </span>
        );

      // case "input":
      //   return (
      //     <div
      //       onClick={handleClick}
      //       onMouseEnter={() => setIsHovered(true)}
      //       onMouseLeave={() => setIsHovered(false)}
      //       className={`element-wrapper ${isSelected ? "selected" : ""} ${
      //         isHovered ? "hovered" : ""
      //       }`}
      //       style={{ position: "relative" }}
      //     >
      //       {isHovered && <div className="element-type-label">Input</div>}

      //       <Input
      //         placeholder={element.props?.placeholder || "Enter text..."}
      //         style={{
      //           width: element.styles?.width || "200px",
      //           ...element.styles,
      //         }}
      //         {...element.props}
      //       />

      //       {(isSelected || isHovered) && (
      //         <div className="element-controls">
      //           <Button
      //             icon={<DeleteOutlined />}
      //             size="small"
      //             onClick={handleDelete}
      //             style={{ background: "#fff" }}
      //           />
      //         </div>
      //       )}
      //     </div>
      //   );

      case "input":
        return (
          <Input
            onClick={handleClick}
            placeholder={element.props?.placeholder || "Enter text..."}
            style={{
              width: element.styles?.width || "200px",
              ...element.styles,
            }}
            {...element.props}
          />
        );

      case "image":
        return (
          <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`element-wrapper ${isSelected ? "selected" : ""} ${
              isHovered ? "hovered" : ""
            }`}
            style={{ position: "relative" }}
          >
            {isHovered && <div className="element-type-label">Image</div>}

            <img
              src={element.props?.src || ""}
              alt={element.props?.alt || ""}
              style={{
                maxWidth: "100%",
                height: "auto",
                ...element.styles,
              }}
            />

            {(isSelected || isHovered) && (
              <div className="element-controls">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                  style={{ background: "#fff" }}
                />
              </div>
            )}
          </div>
        );

      case "heading":
        const HeadingTag = `h${element.props?.level || 1}`;
        return (
          <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`element-wrapper ${isSelected ? "selected" : ""} ${
              isHovered ? "hovered" : ""
            }`}
            style={{ position: "relative" }}
          >
            {isHovered && <div className="element-type-label">Heading</div>}

            <HeadingTag style={element.styles}>
              {element.props?.content || "Heading"}
            </HeadingTag>

            {(isSelected || isHovered) && (
              <div className="element-controls">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                  style={{ background: "#fff" }}
                />
              </div>
            )}
          </div>
        );

      case "paragraph":
        return (
          <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`element-wrapper ${isSelected ? "selected" : ""} ${
              isHovered ? "hovered" : ""
            }`}
            style={{ position: "relative" }}
          >
            {isHovered && <div className="element-type-label">Paragraph</div>}

            <p style={element.styles}>
              {element.props?.content || "Paragraph text"}
            </p>

            {(isSelected || isHovered) && (
              <div className="element-controls">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                  style={{ background: "#fff" }}
                />
              </div>
            )}
          </div>
        );

      case "link":
        return (
          <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`element-wrapper ${isSelected ? "selected" : ""} ${
              isHovered ? "hovered" : ""
            }`}
            style={{ position: "relative" }}
          >
            {isHovered && <div className="element-type-label">Link</div>}

            <a
              href={element.props?.href || "#"}
              target={element.props?.target || "_self"}
              style={element.styles}
            >
              {element.props?.text || "Link"}
            </a>

            {(isSelected || isHovered) && (
              <div className="element-controls">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                  style={{ background: "#fff" }}
                />
              </div>
            )}
          </div>
        );

      case "divider":
        return (
          <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`element-wrapper ${isSelected ? "selected" : ""} ${
              isHovered ? "hovered" : ""
            }`}
            style={{ position: "relative" }}
          >
            {isHovered && <div className="element-type-label">Divider</div>}

            <div
              style={{
                width: "100%",
                borderTop: `${element.styles?.borderWidth || "1px"} ${
                  element.styles?.borderStyle || "solid"
                } ${element.styles?.borderColor || "#d9d9d9"}`,
                margin: element.styles?.margin || "16px 0",
                ...element.styles,
              }}
            />

            {(isSelected || isHovered) && (
              <div className="element-controls">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                  style={{ background: "#fff" }}
                />
              </div>
            )}
          </div>
        );

      case "card":
        return (
          <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`element-wrapper ${isSelected ? "selected" : ""} ${
              isHovered ? "hovered" : ""
            }`}
            style={{ position: "relative" }}
          >
            {isHovered && <div className="element-type-label">Card</div>}

            <Card
              bordered={element.props?.bordered !== false}
              style={element.styles}
            >
              {element.props?.hasHeader && (
                <div style={element.styles?.header}>
                  {/* Render header elements */}
                  {elements
                    .filter(
                      (el) => el.parentId === element.id && el.columnIndex === 0
                    )
                    .map((childElement) => (
                      <RenderElement
                        key={childElement.id}
                        element={childElement}
                        elements={elements}
                      />
                    ))}
                  <DropZone
                    parentId={element.id}
                    columnIndex={0}
                    index={
                      elements.filter(
                        (el) =>
                          el.parentId === element.id && el.columnIndex === 0
                      ).length
                    }
                    isEmpty={
                      !elements.find(
                        (el) =>
                          el.parentId === element.id && el.columnIndex === 0
                      )
                    }
                  />
                </div>
              )}
              {element.props?.hasContent && (
                <div style={element.styles?.content}>
                  {/* Render content elements */}
                  {elements
                    .filter(
                      (el) => el.parentId === element.id && el.columnIndex === 1
                    )
                    .map((childElement) => (
                      <RenderElement
                        key={childElement.id}
                        element={childElement}
                        elements={elements}
                      />
                    ))}
                  <DropZone
                    parentId={element.id}
                    columnIndex={1}
                    index={
                      elements.filter(
                        (el) =>
                          el.parentId === element.id && el.columnIndex === 1
                      ).length
                    }
                    isEmpty={
                      !elements.find(
                        (el) =>
                          el.parentId === element.id && el.columnIndex === 1
                      )
                    }
                  />
                </div>
              )}
            </Card>

            {(isSelected || isHovered) && (
              <div className="element-controls">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                  style={{ background: "#fff" }}
                />
              </div>
            )}
          </div>
        );

      case "box":
        return (
          <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`element-wrapper ${isSelected ? "selected" : ""} ${
              isHovered ? "hovered" : ""
            }`}
            style={{ position: "relative" }}
          >
            {isHovered && <div className="element-type-label">Box</div>}

            <div
              style={{
                padding: element.styles?.padding || "16px",
                border: element.styles?.border || "1px solid #d9d9d9",
                borderRadius: element.styles?.borderRadius || "4px",
                backgroundColor: element.styles?.backgroundColor || "#ffffff",
                ...element.styles,
              }}
            >
              {element.props?.content || "Box content"}
            </div>

            {(isSelected || isHovered) && (
              <div className="element-controls">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                  style={{ background: "#fff" }}
                />
              </div>
            )}
          </div>
        );

      case "icon":
        const IconComponent =
          iconComponents[element.props?.iconType] || HeartOutlined;
        return (
          <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`element-wrapper ${isSelected ? "selected" : ""} ${
              isHovered ? "hovered" : ""
            }`}
            style={{ position: "relative" }}
          >
            {isHovered && <div className="element-type-label">Icon</div>}

            <IconComponent
              style={{
                fontSize: element.styles?.fontSize || "24px",
                color: element.styles?.color || "#000000",
                ...element.styles,
              }}
            />

            {(isSelected || isHovered) && (
              <div className="element-controls">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDelete}
                  style={{ background: "#fff" }}
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return element.type === "container" ? renderContainer() : renderElement();
};

export default RenderElement;
