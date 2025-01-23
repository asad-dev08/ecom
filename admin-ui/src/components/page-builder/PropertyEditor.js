import React from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Divider,
  Space,
  ColorPicker,
  Button,
  Switch,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  updateElement,
  deleteElement,
} from "../../store/page-bulider/pageBuilderSlice";

const iconOptions = [
  { label: "Heart", value: "heart" },
  { label: "Star", value: "star" },
  { label: "User", value: "user" },
  { label: "Setting", value: "setting" },
  { label: "Home", value: "home" },
  { label: "Phone", value: "phone" },
  { label: "Mail", value: "mail" },
  { label: "Link", value: "link" },
  { label: "Search", value: "search" },
  { label: "Bell", value: "bell" },
  { label: "Calendar", value: "calendar" },
  { label: "File", value: "file" },
  { label: "Folder", value: "folder" },
  { label: "Picture", value: "picture" },
  { label: "Team", value: "team" },
  { label: "Shopping", value: "shopping" },
  { label: "Message", value: "message" },
  { label: "Like", value: "like" },
  { label: "Cloud", value: "cloud" },
  { label: "Check", value: "check" },
  { label: "Close", value: "close" },
  { label: "Info", value: "info" },
  { label: "Warning", value: "warning" },
  { label: "Question", value: "question" },
  { label: "Lock", value: "lock" },
  { label: "Unlock", value: "unlock" },
  { label: "Printer", value: "printer" },
  { label: "Camera", value: "camera" },
  { label: "Video Camera", value: "videoCamera" },
  { label: "Audio", value: "audio" },
  { label: "Customer Service", value: "customerService" },
  { label: "Global", value: "global" },
  { label: "Wifi", value: "wifi" },
  { label: "Car", value: "car" },
  { label: "Compass", value: "compass" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Gift", value: "gift" },
  { label: "Trophy", value: "trophy" },
  { label: "Rocket", value: "rocket" },
];

const PropertyEditor = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const selectedElement = useSelector(
    (state) => state.pageBuilder.selectedElement
  );
  const elements = useSelector((state) => state.pageBuilder.elements);

  const getDefaultHeadingStyles = (level) => {
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
    };
  };

  const handleDelete = () => {
    if (selectedElement) {
      dispatch(deleteElement(selectedElement.id));
    }
  };

  const handleStyleChange = (
    property,
    value,
    isColumn = false,
    isColumnWrapper = false
  ) => {
    if (!selectedElement) return;

    if (isColumnWrapper) {
      const parentElement = elements.find(
        (el) => el.id === selectedElement.parentElement.id
      );
      const currentStyles = parentElement?.styles || {};
      const columnWrapperStyles = currentStyles.columnWrapperStyles || {};
      const currentWrapperStyle =
        columnWrapperStyles[selectedElement.columnIndex] || {};

      const updatedWrapperStyles = {
        ...columnWrapperStyles,
        [selectedElement.columnIndex]: {
          ...currentWrapperStyle,
          [property]: value,
        },
      };

      const update = {
        id: selectedElement.parentElement.id,
        updates: {
          styles: {
            ...currentStyles,
            columnWrapperStyles: updatedWrapperStyles,
          },
        },
      };

      dispatch(updateElement(update));
    } else if (isColumn) {
      handleColumnStyleChange(property, value);
    } else {
      const currentElement = elements.find(
        (el) => el.id === selectedElement.id
      );
      const currentStyles = currentElement?.styles || {};

      const update = {
        id: selectedElement.id,
        updates: {
          styles: {
            ...currentStyles,
            [property]: value,
          },
        },
      };

      dispatch(updateElement(update));

      form.setFieldsValue({
        [property]: value,
      });
    }
  };

  const handleColumnStyleChange = (property, value) => {
    if (selectedElement.isColumn && selectedElement.parentElement) {
      const parentElement = elements.find(
        (el) => el.id === selectedElement.parentElement.id
      );
      const currentStyles = parentElement?.styles || {};
      const columnStyles = currentStyles.columnStyles || {};
      const currentColumnStyle =
        columnStyles[selectedElement.columnIndex] || {};

      const updatedColumnStyles = {
        ...columnStyles,
        [selectedElement.columnIndex]: {
          ...currentColumnStyle,
          [property]: value,
        },
      };

      const update = {
        id: selectedElement.parentElement.id,
        updates: {
          styles: {
            ...currentStyles,
            columnStyles: updatedColumnStyles,
          },
        },
      };

      dispatch(updateElement(update));

      form.setFieldsValue({
        [property]: value,
      });
    }
  };

  const renderLayoutControls = (isColumn, isColumnWrapper) => {
    let styles = {};

    if (isColumnWrapper && selectedElement?.parentElement?.id) {
      const parentElement = elements.find(
        (el) => el.id === selectedElement.parentElement.id
      );
      styles =
        parentElement?.styles?.columnWrapperStyles?.[
          selectedElement.columnIndex
        ] || {};
    } else if (isColumn && selectedElement?.parentElement?.id) {
      const parentElement = elements.find(
        (el) => el.id === selectedElement.parentElement.id
      );
      styles =
        parentElement?.styles?.columnStyles?.[selectedElement.columnIndex] ||
        {};
    } else {
      styles = selectedElement?.styles || {};
    }

    return (
      <>
        <Divider>Layout</Divider>
        <Form.Item label="Display">
          <Select
            value={styles.display || "block"}
            onChange={(value) =>
              handleStyleChange("display", value, isColumn, isColumnWrapper)
            }
          >
            <Select.Option value="block">Block</Select.Option>
            <Select.Option value="flex">Flex</Select.Option>
            <Select.Option value="grid">Grid</Select.Option>
            <Select.Option value="inline-flex">Inline Flex</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Text Align">
          <Select
            value={styles.textAlign || "left"}
            onChange={(value) =>
              handleStyleChange("textAlign", value, isColumn, isColumnWrapper)
            }
          >
            <Select.Option value="left">Left</Select.Option>
            <Select.Option value="center">Center</Select.Option>
            <Select.Option value="right">Right</Select.Option>
            <Select.Option value="justify">Justify</Select.Option>
          </Select>
        </Form.Item>

        {styles.display?.includes("flex") && (
          <>
            <Form.Item label="Flex Direction">
              <Select
                value={styles?.flexDirection || "row"}
                onChange={(value) =>
                  handleStyleChange(
                    "flexDirection",
                    value,
                    isColumn,
                    isColumnWrapper
                  )
                }
              >
                <Select.Option value="row">Row</Select.Option>
                <Select.Option value="column">Column</Select.Option>
                <Select.Option value="row-reverse">Row Reverse</Select.Option>
                <Select.Option value="column-reverse">
                  Column Reverse
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Flex Wrap">
              <Select
                value={styles?.flexWrap || "nowrap"}
                onChange={(value) =>
                  handleStyleChange(
                    "flexWrap",
                    value,
                    isColumn,
                    isColumnWrapper
                  )
                }
              >
                <Select.Option value="nowrap">No Wrap</Select.Option>
                <Select.Option value="wrap">Wrap</Select.Option>
                <Select.Option value="wrap-reverse">Wrap Reverse</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Justify Content">
              <Select
                value={styles?.justifyContent || "flex-start"}
                onChange={(value) =>
                  handleStyleChange(
                    "justifyContent",
                    value,
                    isColumn,
                    isColumnWrapper
                  )
                }
              >
                <Select.Option value="flex-start">Start</Select.Option>
                <Select.Option value="center">Center</Select.Option>
                <Select.Option value="flex-end">End</Select.Option>
                <Select.Option value="space-between">
                  Space Between
                </Select.Option>
                <Select.Option value="space-around">Space Around</Select.Option>
                <Select.Option value="space-evenly">Space Evenly</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Align Items">
              <Select
                value={styles?.alignItems || "stretch"}
                onChange={(value) =>
                  handleStyleChange(
                    "alignItems",
                    value,
                    isColumn,
                    isColumnWrapper
                  )
                }
              >
                <Select.Option value="stretch">Stretch</Select.Option>
                <Select.Option value="flex-start">Start</Select.Option>
                <Select.Option value="center">Center</Select.Option>
                <Select.Option value="flex-end">End</Select.Option>
                <Select.Option value="baseline">Baseline</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}
      </>
    );
  };

  const renderSpacingControls = (isColumn, isColumnWrapper) => {
    let styles = {};

    if (isColumn && selectedElement?.parentElement?.id) {
      const parentElement = elements.find(
        (el) => el.id === selectedElement.parentElement.id
      );
      styles =
        parentElement?.styles?.columnStyles?.[selectedElement.columnIndex] ||
        {};
    } else if (selectedElement) {
      const currentElement = elements.find(
        (el) => el.id === selectedElement.id
      );
      styles = currentElement?.styles || {};
    }

    return (
      <>
        <Divider>Spacing</Divider>
        <Form.Item label="Margin">
          <Space>
            {["Top", "Right", "Bottom", "Left"].map((side) => (
              <Input
                key={side}
                value={styles[`margin${side}`] || ""}
                onChange={(e) =>
                  handleStyleChange(
                    `margin${side}`,
                    e.target.value,
                    isColumn,
                    isColumnWrapper
                  )
                }
                placeholder={side}
                style={{ width: 70 }}
              />
            ))}
          </Space>
        </Form.Item>

        <Form.Item label="Padding">
          <Space>
            {["Top", "Right", "Bottom", "Left"].map((side) => (
              <Input
                key={side}
                value={styles[`padding${side}`] || ""}
                onChange={(e) =>
                  handleStyleChange(
                    `padding${side}`,
                    e.target.value,
                    isColumn,
                    isColumnWrapper
                  )
                }
                placeholder={side}
                style={{ width: 70 }}
              />
            ))}
          </Space>
        </Form.Item>

        <Form.Item label="Gap">
          <Input
            value={styles?.gap || ""}
            onChange={(e) =>
              handleStyleChange(
                "gap",
                e.target.value,
                isColumn,
                isColumnWrapper
              )
            }
            placeholder="e.g., 8px, 1rem"
          />
        </Form.Item>
      </>
    );
  };

  const renderDimensionControls = (isColumn, isColumnWrapper) => {
    let styles = {};

    if (isColumn && selectedElement?.parentElement?.id) {
      const parentElement = elements.find(
        (el) => el.id === selectedElement.parentElement.id
      );
      styles =
        parentElement?.styles?.columnStyles?.[selectedElement.columnIndex] ||
        {};
    } else if (selectedElement) {
      const currentElement = elements.find(
        (el) => el.id === selectedElement.id
      );
      styles = currentElement?.styles || {};
    }

    return (
      <>
        <Divider>Dimensions</Divider>
        <Space style={{ display: "flex", marginBottom: 16 }}>
          <Form.Item label="Width">
            <Input
              value={styles?.width || ""}
              onChange={(e) =>
                handleStyleChange(
                  "width",
                  e.target.value,
                  isColumn,
                  isColumnWrapper
                )
              }
              placeholder="e.g., 100px, 50%"
            />
          </Form.Item>
          <Form.Item label="Height">
            <Input
              value={styles?.height || ""}
              onChange={(e) =>
                handleStyleChange(
                  "height",
                  e.target.value,
                  isColumn,
                  isColumnWrapper
                )
              }
              placeholder="e.g., 100px, 50%"
            />
          </Form.Item>
        </Space>
        <Form.Item label="Min Height">
          <Input
            value={styles?.minHeight || ""}
            onChange={(e) =>
              handleStyleChange(
                "minHeight",
                e.target.value,
                isColumn,
                isColumnWrapper
              )
            }
            placeholder="e.g., 100px"
          />
        </Form.Item>
      </>
    );
  };

  const renderStylingControls = (isColumn, isColumnWrapper) => {
    const styles = isColumn
      ? selectedElement.parentElement?.styles?.columnStyles?.[
          selectedElement.columnIndex
        ]
      : selectedElement.styles;

    return (
      <>
        <Divider>Styling</Divider>

        <Form.Item label="Background Color">
          <ColorPicker
            value={styles?.backgroundColor}
            onChange={(color) =>
              handleStyleChange(
                "backgroundColor",
                color.toHexString(),
                isColumn,
                isColumnWrapper
              )
            }
          />
        </Form.Item>

        <Form.Item label="Border">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              value={styles?.borderWidth}
              onChange={(e) =>
                handleStyleChange(
                  "borderWidth",
                  e.target.value,
                  isColumn,
                  isColumnWrapper
                )
              }
              placeholder="Border Width (e.g., 1px)"
            />
            <Select
              value={styles?.borderStyle || "solid"}
              onChange={(value) =>
                handleStyleChange(
                  "borderStyle",
                  value,
                  isColumn,
                  isColumnWrapper
                )
              }
              style={{ width: "100%" }}
            >
              <Select.Option value="none">None</Select.Option>
              <Select.Option value="solid">Solid</Select.Option>
              <Select.Option value="dashed">Dashed</Select.Option>
              <Select.Option value="dotted">Dotted</Select.Option>
            </Select>
            <ColorPicker
              value={styles?.borderColor}
              onChange={(color) =>
                handleStyleChange(
                  "borderColor",
                  color.toHexString(),
                  isColumn,
                  isColumnWrapper
                )
              }
            />
          </Space>
        </Form.Item>

        <Form.Item label="Border Radius">
          <Input
            value={styles?.borderRadius}
            onChange={(e) =>
              handleStyleChange(
                "borderRadius",
                e.target.value,
                isColumn,
                isColumnWrapper
              )
            }
            placeholder="e.g., 4px"
          />
        </Form.Item>

        <Form.Item label="Box Shadow">
          <Input
            value={styles?.boxShadow}
            onChange={(e) =>
              handleStyleChange(
                "boxShadow",
                e.target.value,
                isColumn,
                isColumnWrapper
              )
            }
            placeholder="e.g., 0 2px 4px rgba(0,0,0,0.1)"
          />
        </Form.Item>
      </>
    );
  };

  const renderElementSpecificProperties = () => {
    switch (selectedElement?.type) {
      case "container":
        return (
          <>
            <Form.Item label="Columns">
              <Select
                value={selectedElement.props?.columns || 1}
                onChange={(value) => {
                  // First ensure we have the latest state
                  const currentElement = elements.find(
                    (el) => el.id === selectedElement.id
                  );
                  if (!currentElement) return;

                  const currentColumnStyles =
                    currentElement.styles?.columnStyles || {};
                  const newColumnStyles = { ...currentColumnStyles };

                  // Ensure we have styles for all columns
                  for (let i = 0; i < value; i++) {
                    if (!newColumnStyles[i]) {
                      newColumnStyles[i] = {
                        display: "flex",
                        flexDirection: "column",
                        //flex: 1,
                        // padding: "8px",
                        // minHeight: "50px",
                      };
                    }
                  }

                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...currentElement.props,
                          columns: value,
                        },
                        styles: {
                          ...currentElement.styles,
                          columnStyles: newColumnStyles,
                        },
                      },
                    })
                  );
                }}
              >
                {[1, 2, 3, 4, 6].map((num) => (
                  <Select.Option key={num} value={num}>
                    {num} Column{num > 1 ? "s" : ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );

      case "image":
        return (
          <>
            <Form.Item label="Image Source">
              <Input
                value={selectedElement.props?.src}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          src: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter image URL"
              />
            </Form.Item>
            <Form.Item label="Alt Text">
              <Input
                value={selectedElement.props?.alt}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          alt: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter alt text"
              />
            </Form.Item>
            <Form.Item label="Object Fit">
              <Select
                value={selectedElement.styles?.objectFit || "cover"}
                onChange={(value) => handleStyleChange("objectFit", value)}
              >
                <Select.Option value="cover">Cover</Select.Option>
                <Select.Option value="contain">Contain</Select.Option>
                <Select.Option value="fill">Fill</Select.Option>
                <Select.Option value="none">None</Select.Option>
              </Select>
            </Form.Item>
          </>
        );

      case "heading":
        return (
          <>
            <Form.Item label="Heading Text">
              <Input
                value={selectedElement.props?.content}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          content: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter heading text"
              />
            </Form.Item>
            <Form.Item label="Heading Level">
              <Select
                value={selectedElement.props?.level || 1}
                onChange={(value) => {
                  const defaultStyles = getDefaultHeadingStyles(value);
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: { ...selectedElement.props, level: value },
                        styles: {
                          ...selectedElement.styles,
                          fontSize: defaultStyles.fontSize,
                          fontWeight: defaultStyles.fontWeight,
                        },
                      },
                    })
                  );

                  // Update the form fields to reflect new values
                  form.setFieldsValue({
                    fontSize: defaultStyles.fontSize,
                    fontWeight: defaultStyles.fontWeight,
                  });
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <Select.Option key={level} value={level}>
                    H{level}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Font Size" name="fontSize">
              <Input
                value={selectedElement.styles?.fontSize}
                onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                placeholder="e.g., 24px, 1.5rem"
                suffix="px"
              />
            </Form.Item>
            <Form.Item label="Font Weight" name="fontWeight">
              <Select
                value={selectedElement.styles?.fontWeight || "normal"}
                onChange={(value) => handleStyleChange("fontWeight", value)}
              >
                <Select.Option value="normal">Normal</Select.Option>
                <Select.Option value="bold">Bold</Select.Option>
                <Select.Option value="lighter">Lighter</Select.Option>
                {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                  <Select.Option key={weight} value={weight}>
                    {weight}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );

      case "paragraph":
        return (
          <>
            <Form.Item label="Paragraph Text">
              <Input.TextArea
                value={selectedElement.props?.content}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          content: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter paragraph text"
                rows={4}
              />
            </Form.Item>
            <Form.Item label="Font Size">
              <Input
                value={selectedElement.styles?.fontSize}
                onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                placeholder="e.g., 16px, 1rem"
                suffix="px"
              />
            </Form.Item>
            <Form.Item label="Line Height">
              <Input
                value={selectedElement.styles?.lineHeight}
                onChange={(e) =>
                  handleStyleChange("lineHeight", e.target.value)
                }
                placeholder="e.g., 1.5"
              />
            </Form.Item>
            <Form.Item label="Font Weight">
              <Select
                value={selectedElement.styles?.fontWeight || "normal"}
                onChange={(value) => handleStyleChange("fontWeight", value)}
              >
                <Select.Option value="normal">Normal</Select.Option>
                <Select.Option value="bold">Bold</Select.Option>
                {[300, 400, 500, 600, 700].map((weight) => (
                  <Select.Option key={weight} value={weight}>
                    {weight}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );

      case "link":
        return (
          <>
            <Form.Item label="Link Text">
              <Input
                value={selectedElement.props?.text}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          text: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter link text"
              />
            </Form.Item>
            <Form.Item label="URL">
              <Input
                value={selectedElement.props?.href}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          href: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter URL"
              />
            </Form.Item>
            <Form.Item label="Font Size">
              <Input
                value={selectedElement.styles?.fontSize}
                onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                placeholder="e.g., 16px, 1rem"
                suffix="px"
              />
            </Form.Item>
            <Form.Item label="Target">
              <Select
                value={selectedElement.props?.target || "_self"}
                onChange={(value) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: { ...selectedElement.props, target: value },
                      },
                    })
                  )
                }
              >
                <Select.Option value="_self">Same Window</Select.Option>
                <Select.Option value="_blank">New Window</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Text Decoration">
              <Select
                value={selectedElement.styles?.textDecoration || "none"}
                onChange={(value) => handleStyleChange("textDecoration", value)}
              >
                <Select.Option value="none">None</Select.Option>
                <Select.Option value="underline">Underline</Select.Option>
                <Select.Option value="overline">Overline</Select.Option>
                <Select.Option value="line-through">Line Through</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Font Weight">
              <Select
                value={selectedElement.styles?.fontWeight || "normal"}
                onChange={(value) => handleStyleChange("fontWeight", value)}
              >
                <Select.Option value="normal">Normal</Select.Option>
                <Select.Option value="bold">Bold</Select.Option>
                {[300, 400, 500, 600, 700].map((weight) => (
                  <Select.Option key={weight} value={weight}>
                    {weight}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );

      case "divider":
        return (
          <>
            <Form.Item label="Border Style">
              <Select
                value={selectedElement.styles?.borderStyle || "solid"}
                onChange={(value) => handleStyleChange("borderStyle", value)}
              >
                <Select.Option value="solid">Solid</Select.Option>
                <Select.Option value="dashed">Dashed</Select.Option>
                <Select.Option value="dotted">Dotted</Select.Option>
                <Select.Option value="double">Double</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Border Width">
              <Input
                value={selectedElement.styles?.borderWidth}
                onChange={(e) =>
                  handleStyleChange("borderWidth", e.target.value)
                }
                placeholder="e.g., 1px"
                suffix="px"
              />
            </Form.Item>
            <Form.Item label="Border Color">
              <ColorPicker
                value={selectedElement.styles?.borderColor}
                onChange={(color) =>
                  handleStyleChange("borderColor", color.toHexString())
                }
              />
            </Form.Item>
            <Form.Item label="Margin">
              <Input
                value={selectedElement.styles?.margin}
                onChange={(e) => handleStyleChange("margin", e.target.value)}
                placeholder="e.g., 16px 0"
              />
            </Form.Item>
          </>
        );

      case "card":
        return (
          <>
            <Form.Item label="Card Title">
              <Input
                value={selectedElement.props?.title}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          title: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter card title"
              />
            </Form.Item>

            <Form.Item label="Card Content">
              <Input.TextArea
                value={selectedElement.props?.content}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          content: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter card content"
                rows={4}
              />
            </Form.Item>

            <Divider>Card Structure</Divider>
            <Form.Item label="Show Header">
              <Switch
                checked={selectedElement.props?.hasHeader}
                onChange={(checked) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: { ...selectedElement.props, hasHeader: checked },
                      },
                    })
                  )
                }
              />
            </Form.Item>

            <Form.Item label="Show Content">
              <Switch
                checked={selectedElement.props?.hasContent}
                onChange={(checked) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          hasContent: checked,
                        },
                      },
                    })
                  )
                }
              />
            </Form.Item>

            <Form.Item label="Card Border">
              <Switch
                checked={selectedElement.props?.bordered !== false}
                onChange={(checked) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: { ...selectedElement.props, bordered: checked },
                      },
                    })
                  )
                }
              />
            </Form.Item>

            <Divider>Card Styles</Divider>

            <Form.Item label="Card Padding">
              <Space>
                {["Top", "Right", "Bottom", "Left"].map((side) => (
                  <Input
                    key={side}
                    value={selectedElement.styles?.[`padding${side}`]}
                    onChange={(e) =>
                      handleStyleChange(`padding${side}`, e.target.value)
                    }
                    placeholder={side}
                    style={{ width: 70 }}
                  />
                ))}
              </Space>
            </Form.Item>

            <Form.Item label="Card Background">
              <ColorPicker
                value={selectedElement.styles?.backgroundColor}
                onChange={(color) =>
                  handleStyleChange("backgroundColor", color.toHexString())
                }
              />
            </Form.Item>

            <Form.Item label="Card Border Radius">
              <Input
                value={selectedElement.styles?.borderRadius}
                onChange={(e) =>
                  handleStyleChange("borderRadius", e.target.value)
                }
                placeholder="e.g., 8px"
                suffix="px"
              />
            </Form.Item>

            <Form.Item label="Card Shadow">
              <Select
                value={selectedElement.styles?.boxShadow || "none"}
                onChange={(value) => handleStyleChange("boxShadow", value)}
              >
                <Select.Option value="none">None</Select.Option>
                <Select.Option value="0 2px 8px rgba(0,0,0,0.1)">
                  Light
                </Select.Option>
                <Select.Option value="0 4px 12px rgba(0,0,0,0.15)">
                  Medium
                </Select.Option>
                <Select.Option value="0 8px 16px rgba(0,0,0,0.2)">
                  Heavy
                </Select.Option>
              </Select>
            </Form.Item>

            <Divider>Header Styles</Divider>

            <Form.Item label="Header Padding">
              <Space>
                {["Top", "Right", "Bottom", "Left"].map((side) => (
                  <Input
                    key={side}
                    value={selectedElement.styles?.header?.[`padding${side}`]}
                    onChange={(e) =>
                      dispatch(
                        updateElement({
                          id: selectedElement.id,
                          updates: {
                            styles: {
                              ...selectedElement.styles,
                              header: {
                                ...selectedElement.styles?.header,
                                [`padding${side}`]: e.target.value,
                              },
                            },
                          },
                        })
                      )
                    }
                    placeholder={side}
                    style={{ width: 70 }}
                  />
                ))}
              </Space>
            </Form.Item>

            <Form.Item label="Header Background">
              <ColorPicker
                value={selectedElement.styles?.header?.backgroundColor}
                onChange={(color) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        styles: {
                          ...selectedElement.styles,
                          header: {
                            ...selectedElement.styles?.header,
                            backgroundColor: color.toHexString(),
                          },
                        },
                      },
                    })
                  )
                }
              />
            </Form.Item>

            <Form.Item label="Header Border">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                  value={selectedElement.styles?.header?.borderBottomWidth}
                  onChange={(e) =>
                    dispatch(
                      updateElement({
                        id: selectedElement.id,
                        updates: {
                          styles: {
                            ...selectedElement.styles,
                            header: {
                              ...selectedElement.styles?.header,
                              borderBottomWidth: e.target.value,
                            },
                          },
                        },
                      })
                    )
                  }
                  placeholder="Border Width (e.g., 1px)"
                />
                <Select
                  value={
                    selectedElement.styles?.header?.borderBottomStyle || "solid"
                  }
                  onChange={(value) =>
                    dispatch(
                      updateElement({
                        id: selectedElement.id,
                        updates: {
                          styles: {
                            ...selectedElement.styles,
                            header: {
                              ...selectedElement.styles?.header,
                              borderBottomStyle: value,
                            },
                          },
                        },
                      })
                    )
                  }
                >
                  <Select.Option value="none">None</Select.Option>
                  <Select.Option value="solid">Solid</Select.Option>
                  <Select.Option value="dashed">Dashed</Select.Option>
                  <Select.Option value="dotted">Dotted</Select.Option>
                </Select>
                <ColorPicker
                  value={selectedElement.styles?.header?.borderBottomColor}
                  onChange={(color) =>
                    dispatch(
                      updateElement({
                        id: selectedElement.id,
                        updates: {
                          styles: {
                            ...selectedElement.styles,
                            header: {
                              ...selectedElement.styles?.header,
                              borderBottomColor: color.toHexString(),
                            },
                          },
                        },
                      })
                    )
                  }
                />
              </Space>
            </Form.Item>

            <Divider>Content Styles</Divider>

            <Form.Item label="Content Padding">
              <Space>
                {["Top", "Right", "Bottom", "Left"].map((side) => (
                  <Input
                    key={side}
                    value={selectedElement.styles?.content?.[`padding${side}`]}
                    onChange={(e) =>
                      dispatch(
                        updateElement({
                          id: selectedElement.id,
                          updates: {
                            styles: {
                              ...selectedElement.styles,
                              content: {
                                ...selectedElement.styles?.content,
                                [`padding${side}`]: e.target.value,
                              },
                            },
                          },
                        })
                      )
                    }
                    placeholder={side}
                    style={{ width: 70 }}
                  />
                ))}
              </Space>
            </Form.Item>

            <Form.Item label="Content Background">
              <ColorPicker
                value={selectedElement.styles?.content?.backgroundColor}
                onChange={(color) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        styles: {
                          ...selectedElement.styles,
                          content: {
                            ...selectedElement.styles?.content,
                            backgroundColor: color.toHexString(),
                          },
                        },
                      },
                    })
                  )
                }
              />
            </Form.Item>
          </>
        );

      case "box":
        return (
          <>
            <Form.Item label="Box Content">
              <Input.TextArea
                value={selectedElement.props?.content}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          content: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter box content"
                rows={4}
              />
            </Form.Item>
            <Form.Item label="Border Radius">
              <Input
                value={selectedElement.styles?.borderRadius}
                onChange={(e) =>
                  handleStyleChange("borderRadius", e.target.value)
                }
                placeholder="e.g., 4px"
                suffix="px"
              />
            </Form.Item>
            <Form.Item label="Border">
              <Input
                value={selectedElement.styles?.border}
                onChange={(e) => handleStyleChange("border", e.target.value)}
                placeholder="e.g., 1px solid #d9d9d9"
              />
            </Form.Item>
            <Form.Item label="Background Color">
              <ColorPicker
                value={selectedElement.styles?.backgroundColor}
                onChange={(color) =>
                  handleStyleChange("backgroundColor", color.toHexString())
                }
              />
            </Form.Item>
          </>
        );

      case "icon":
        return (
          <>
            <Form.Item label="Icon Type">
              <Select
                value={selectedElement.props?.iconType || "heart"}
                onChange={(value) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: { ...selectedElement.props, iconType: value },
                      },
                    })
                  )
                }
                showSearch
                placeholder="Select an icon"
                optionFilterProp="children"
              >
                {iconOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Icon Size">
              <Input
                value={selectedElement.styles?.fontSize}
                onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                placeholder="e.g., 24px"
                suffix="px"
              />
            </Form.Item>
            <Form.Item label="Icon Color">
              <ColorPicker
                value={selectedElement.styles?.color}
                onChange={(color) =>
                  handleStyleChange("color", color.toHexString())
                }
              />
            </Form.Item>
            <Form.Item label="Rotate">
              <Input
                value={selectedElement.styles?.transform}
                onChange={(e) =>
                  handleStyleChange("transform", `rotate(${e.target.value}deg)`)
                }
                placeholder="e.g., 45"
                suffix="deg"
              />
            </Form.Item>
          </>
        );

      case "text":
        return (
          <>
            <Form.Item label="Text Content">
              <Input.TextArea
                value={selectedElement.props?.content}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          content: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter text content"
                rows={4}
              />
            </Form.Item>
          </>
        );

      case "button":
        return (
          <>
            <Form.Item label="Button Text">
              <Input
                value={selectedElement.props?.text}
                onChange={(e) =>
                  dispatch(
                    updateElement({
                      id: selectedElement.id,
                      updates: {
                        props: {
                          ...selectedElement.props,
                          text: e.target.value,
                        },
                      },
                    })
                  )
                }
                placeholder="Enter button text"
              />
            </Form.Item>
          </>
        );
    }
  };

  const renderPositionControls = () => {
    return (
      <>
        <Divider orientation="left">Position</Divider>
        <Form.Item label="Position Type">
          <Select
            value={selectedElement.styles?.position || "static"}
            onChange={(value) => handleStyleChange("position", value)}
          >
            <Select.Option value="static">Static</Select.Option>
            <Select.Option value="relative">Relative</Select.Option>
            <Select.Option value="absolute">Absolute</Select.Option>
            <Select.Option value="fixed">Fixed</Select.Option>
            <Select.Option value="sticky">Sticky</Select.Option>
          </Select>
        </Form.Item>

        {selectedElement.styles?.position !== "static" && (
          <>
            <Form.Item label="Top">
              <Input
                value={selectedElement.styles?.top}
                onChange={(e) => handleStyleChange("top", e.target.value)}
                placeholder="e.g., 0px"
                suffix="px"
              />
            </Form.Item>
            <Form.Item label="Right">
              <Input
                value={selectedElement.styles?.right}
                onChange={(e) => handleStyleChange("right", e.target.value)}
                placeholder="e.g., 0px"
                suffix="px"
              />
            </Form.Item>
            <Form.Item label="Bottom">
              <Input
                value={selectedElement.styles?.bottom}
                onChange={(e) => handleStyleChange("bottom", e.target.value)}
                placeholder="e.g., 0px"
                suffix="px"
              />
            </Form.Item>
            <Form.Item label="Left">
              <Input
                value={selectedElement.styles?.left}
                onChange={(e) => handleStyleChange("left", e.target.value)}
                placeholder="e.g., 0px"
                suffix="px"
              />
            </Form.Item>
            {(selectedElement.styles?.position === "absolute" ||
              selectedElement.styles?.position === "fixed") && (
              <Form.Item label="Z-Index">
                <Input
                  type="number"
                  value={selectedElement.styles?.zIndex}
                  onChange={(e) => handleStyleChange("zIndex", e.target.value)}
                  placeholder="e.g., 1"
                />
              </Form.Item>
            )}
          </>
        )}

        {selectedElement.styles?.position === "sticky" && (
          <Form.Item label="Sticky Offset">
            <Input
              value={selectedElement.styles?.top}
              onChange={(e) => handleStyleChange("top", e.target.value)}
              placeholder="e.g., 0px"
              suffix="px"
            />
          </Form.Item>
        )}
      </>
    );
  };

  const handleCustomCssChange = (cssText) => {
    if (!selectedElement) return;

    try {
      // Convert CSS text to object
      const cssObject = cssText
        .split(";")
        .filter((style) => style.trim())
        .reduce((acc, style) => {
          const [property, value] = style.split(":").map((s) => s.trim());
          if (property && value) {
            // Convert kebab-case to camelCase
            const camelProperty = property.replace(/-([a-z])/g, (g) =>
              g[1].toUpperCase()
            );
            acc[camelProperty] = value;
          }
          return acc;
        }, {});

      if (selectedElement.isColumnWrapper) {
        // Handle column wrapper styles
        const parentElement = elements.find(
          (el) => el.id === selectedElement.parentElement.id
        );
        const currentStyles = parentElement?.styles || {};
        const columnWrapperStyles = currentStyles.columnWrapperStyles || {};

        const updatedWrapperStyles = {
          ...columnWrapperStyles,
          [selectedElement.columnIndex]: {
            ...(columnWrapperStyles[selectedElement.columnIndex] || {}),
            ...cssObject,
          },
        };

        dispatch(
          updateElement({
            id: selectedElement.parentElement.id,
            updates: {
              styles: {
                ...currentStyles,
                columnWrapperStyles: updatedWrapperStyles,
              },
            },
          })
        );
      } else if (selectedElement.isColumn) {
        // Handle column styles
        const parentElement = elements.find(
          (el) => el.id === selectedElement.parentElement.id
        );
        const currentStyles = parentElement?.styles || {};
        const columnStyles = currentStyles.columnStyles || {};

        const updatedColumnStyles = {
          ...columnStyles,
          [selectedElement.columnIndex]: {
            ...(columnStyles[selectedElement.columnIndex] || {}),
            ...cssObject,
          },
        };

        dispatch(
          updateElement({
            id: selectedElement.parentElement.id,
            updates: {
              styles: {
                ...currentStyles,
                columnStyles: updatedColumnStyles,
              },
            },
          })
        );
      } else {
        // Handle regular element styles
        dispatch(
          updateElement({
            id: selectedElement.id,
            updates: {
              styles: {
                ...selectedElement.styles,
                ...cssObject,
              },
            },
          })
        );
      }
    } catch (error) {
      console.error("Invalid CSS:", error);
    }
  };

  const renderCustomCssInput = () => {
    // Get current styles for the selected element
    let currentStyles = {};

    if (selectedElement.isColumnWrapper) {
      const parentElement = elements.find(
        (el) => el.id === selectedElement.parentElement.id
      );
      currentStyles =
        parentElement?.styles?.columnWrapperStyles?.[
          selectedElement.columnIndex
        ] || {};
    } else if (selectedElement.isColumn) {
      const parentElement = elements.find(
        (el) => el.id === selectedElement.parentElement.id
      );
      currentStyles =
        parentElement?.styles?.columnStyles?.[selectedElement.columnIndex] ||
        {};
    } else {
      currentStyles = selectedElement?.styles || {};
    }

    // Don't convert the styles to CSS string - let user manage their own CSS text
    return (
      <>
        <Divider>Custom CSS</Divider>
        <Form.Item
          label="Raw CSS"
          help="Enter CSS properties (one per line) e.g., color: red;"
        >
          <Input.TextArea
            placeholder="Enter custom CSS..."
            rows={6}
            style={{ fontFamily: "monospace" }}
            onChange={(e) => handleCustomCssChange(e.target.value)}
          />
        </Form.Item>
      </>
    );
  };

  if (!selectedElement) {
    return (
      <Card title="Properties">
        <div style={{ textAlign: "center", color: "#999" }}>
          Select an element to edit its properties
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        selectedElement.isColumnWrapper
          ? `Column Wrapper ${selectedElement.columnIndex + 1} Properties`
          : selectedElement.isColumn
          ? `Column ${selectedElement.columnIndex + 1} Properties`
          : `${
              selectedElement.type.charAt(0).toUpperCase() +
              selectedElement.type.slice(1)
            } Properties`
      }
      extra={<Button icon={<DeleteOutlined />} onClick={handleDelete} danger />}
    >
      <Form layout="vertical" form={form}>
        {/* Element-specific properties */}
        {renderElementSpecificProperties()}

        {/* Common styling sections */}
        {renderPositionControls()}
        {renderLayoutControls(
          selectedElement.isColumn,
          selectedElement.isColumnWrapper
        )}
        {renderSpacingControls(
          selectedElement.isColumn,
          selectedElement.isColumnWrapper
        )}
        {renderDimensionControls(
          selectedElement.isColumn,
          selectedElement.isColumnWrapper
        )}
        {renderStylingControls(
          selectedElement.isColumn,
          selectedElement.isColumnWrapper
        )}

        {/* Add Custom CSS section */}
        {renderCustomCssInput()}
      </Form>
    </Card>
  );
};

export default PropertyEditor;
