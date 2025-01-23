import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  Upload,
  InputNumber,
  Switch,
  message,
} from "antd";
import {
  InboxOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  saveProject,
  updateProject,
} from "../../../store/project/projectSlice";
import { getCategories } from "../../../store/category/categorySlice";
import toast from "react-hot-toast";
import moment from "moment";
import { getImageUrl } from "../../../utils/imageUtils";
import {
  ProjectStatusList,
  ProjectStatusColors,
} from "../../../utils/actionTypes";

const { TextArea } = Input;

const CreateProject = ({ onClose, open, data, isAdd, isView, permission }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const categories = useSelector((state) => state.category.categories);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailList, setThumbnailList] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState({});

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (data && !isAdd) {
      if (data.thumbnail_url) {
        setThumbnailList([
          {
            uid: "-1",
            name: data.thumbnail_url.split("/").pop(),
            status: "done",
            url: data.thumbnail_url,
          },
        ]);
      }

      form.setFieldsValue({
        title: data.title || "",
        subtitle: data.subtitle || "",
        description: data.description || "",
        start_date: data.start_date ? moment(data.start_date) : null,
        end_date: data.end_date ? moment(data.end_date) : null,
        city: data.city || "",
        country: data.country || "",
        address: data.address || "",
        client_name: data.client_name || "",
        category_id: data.category_id || null,
        area: data.area || null,
        budget: data.budget || null,
        is_featured: data.is_featured || false,
        tags: data.tags ? JSON.parse(data.tags) : [],
        gallery:
          data.gallery?.map((item) => ({
            id: item.id,
            title: item.title || "",
            subtitle: item.subtitle || "",
            image_url: item.image_url || "",
            sequence_no: item.sequence_no || 0,
            isDeleted: false,
            isNew: false,
          })) || [],
        key_features:
          data.key_features?.map((item) => ({
            id: item.id,
            feature: item.feature,
            isDeleted: false,
          })) || [],
        services:
          data.services?.map((item) => ({
            id: item.id,
            service: item.service,
            isDeleted: false,
          })) || [],
        status: data.status || "NOT_STARTED",
      });
    }
  }, [data, isAdd, form]);

  const handleSaveClick = (e) => {
    e.preventDefault();
    form.submit();
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }
    // const isLt5M = file.size / 1024 / 1024 < 5;
    // if (!isLt5M) {
    //   message.error("Image must be smaller than 5MB!");
    //   return Upload.LIST_IGNORE;
    // }
    return false;
  };

  const handleThumbnailChange = (info) => {
    const { file, fileList } = info;

    // Store the complete file object
    if (file.status !== "removed") {
      setThumbnailFile(file.originFileObj || file);
      setThumbnailList([
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: file instanceof File ? URL.createObjectURL(file) : file.url,
        },
      ]);
    } else {
      setThumbnailFile(null);
      setThumbnailList([]);
    }
  };

  const handleGalleryChange = (info, index) => {
    const { file } = info;

    if (file.status !== "removed") {
      setGalleryFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = file.originFileObj || file;
        return newFiles;
      });

      // Update the form's gallery field to include the file information
      const currentGallery = form.getFieldValue("gallery") || [];
      currentGallery[index] = {
        ...currentGallery[index],
        isNew: true,
        file: file.originFileObj || file,
        // Preserve the existing ID if it exists
        id: currentGallery[index]?.id || null,
        isDeleted: false, // Ensure it's not marked as deleted
      };
      form.setFieldValue("gallery", currentGallery);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Prepare gallery data
      const galleryData = values.gallery
        ?.map((item, index) => {
          //if (!item || item.isDeleted) return null;

          const existingGallery = data?.gallery?.find((g) => g.id === item.id);
          return {
            id: existingGallery?.id,
            title: item.title || "",
            subtitle: item.subtitle || "",
            sequence_no: item.sequence_no || index + 1,
            image_url: existingGallery?.image_url || "",
            isNew: !existingGallery,
            isDeleted: item.isDeleted || false,
          };
        })
        .filter(Boolean); // Remove null entries

      const projectData = {
        ...values,
        id: data?.id,
        start_date: values.start_date ? moment(values.start_date) : null,
        end_date: values.end_date ? moment(values.end_date) : null,
        tags: JSON.stringify(values.tags || []),
        area: values.area ? parseFloat(values.area) : null,
        budget: values.budget ? parseFloat(values.budget) : null,
        gallery: galleryData,
      };

      formData.append("data", JSON.stringify(projectData));

      // Add thumbnail if it exists and is a new file
      if (thumbnailFile instanceof File) {
        formData.append("thumbnail", thumbnailFile);
      }

      // Add gallery files
      values.gallery?.forEach((item, index) => {
        if (item?.file instanceof File && !item.isDeleted) {
          formData.append("gallery", item.file);
        }
      });

      // Log FormData contents
      for (let pair of formData.entries()) {
        console.log("FormData Entry:", pair[0], pair[1]);
      }

      if (isAdd) {
        await dispatch(saveProject(formData)).unwrap();
        toast.success("Project created successfully");
      } else {
        await dispatch(updateProject({ id: data.id, formData })).unwrap();
        toast.success("Project updated successfully");
      }

      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (url) => {
    window.open(url, "_blank");
  };

  // Add these styles
  const imagePreviewStyle = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "8px",
  };

  const thumbnailStyle = {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #d9d9d9",
    cursor: "pointer",
    transition: "transform 0.2s",
    ":hover": {
      transform: "scale(1.05)",
      cursor: "pointer",
    },
  };

  const imageContainerStyle = {
    position: "relative",
    width: "fit-content",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s",
    borderRadius: "8px",
    cursor: "pointer",
    ":hover": {
      opacity: 1,
    },
  };

  const statusOptionRender = (option) => ({
    label: (
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: ProjectStatusColors[option.value] }}
        />
        <span>{option.label}</span>
      </div>
    ),
    value: option.value,
  });

  // Add this style for deleted images
  const deletedImageStyle = {
    border: "2px solid red",
    opacity: "0.6",
    filter: "grayscale(50%)",
    transition: "all 0.3s ease",
  };

  // Add these styles at the top of your component
  const deletedItemStyle = {
    backgroundColor: "rgba(254, 226, 226, 0.5)", // light red background
    border: "1px solid rgb(252, 165, 165)", // red border
    borderRadius: "4px",
    padding: "4px",
    transition: "all 0.3s ease",
  };

  return (
    <Drawer
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} Project`}
      width="100%"
      onClose={onClose}
      open={open}
      maskClosable={false}
      extra={
        <Space>
          {permission &&
            (permission.can_create || permission.can_update) &&
            !isView && (
              <Button
                type="primary"
                onClick={handleSaveClick}
                loading={loading}
              >
                Save
              </Button>
            )}
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={isView}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item name="subtitle" label="Subtitle">
            <Input placeholder="Enter subtitle" />
          </Form.Item>
        </div>
        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Enter description" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="start_date"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="end_date" label="End Date">
            <DatePicker className="w-full" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="city" label="City">
            <Input placeholder="Enter city" />
          </Form.Item>

          <Form.Item name="country" label="Country">
            <Input placeholder="Enter country" />
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input placeholder="Enter address" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="client_name" label="Client Name">
            <Input placeholder="Enter client name" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select
              placeholder="Select category"
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="NOT_STARTED"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select
              placeholder="Select status"
              options={ProjectStatusList.map(statusOptionRender)}
              optionRender={(option) => (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: ProjectStatusColors[option.data.value],
                    }}
                  />
                  <span>{option.data.label}</span>
                </div>
              )}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="area" label="Area">
            <InputNumber
              className="w-full"
              placeholder="Enter area"
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item name="budget" label="Budget">
            <InputNumber
              className="w-full"
              placeholder="Enter budget"
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="is_featured"
            label="Featured"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <Form.Item
          name="tags"
          label="Tags"
          tooltip="Press enter to add new tag"
        >
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="Add tags"
            open={false}
            tokenSeparators={[","]}
          />
        </Form.Item>

        <Form.Item
          label="Thumbnail"
          required={isAdd}
          tooltip="Upload project thumbnail image"
        >
          <div className="space-y-4">
            <Upload.Dragger
              accept="image/*"
              beforeUpload={beforeUpload}
              onChange={handleThumbnailChange}
              maxCount={1}
              fileList={thumbnailList}
              showUploadList={true}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag thumbnail to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single image upload
              </p>
            </Upload.Dragger>

            {!isAdd && data?.thumbnail_url && (
              <div style={imagePreviewStyle}>
                <span className="text-gray-600 font-medium">
                  Current Thumbnail:
                </span>
                <div style={imageContainerStyle}>
                  <img
                    className="cursor-pointer"
                    src={getImageUrl(data.thumbnail_url)}
                    alt="Thumbnail"
                    style={thumbnailStyle}
                    onClick={() =>
                      handlePreview(getImageUrl(data.thumbnail_url))
                    }
                  />
                  <div
                    style={overlayStyle}
                    onClick={() =>
                      handlePreview(getImageUrl(data.thumbnail_url))
                    }
                  >
                    <EyeOutlined style={{ color: "white", fontSize: "20px" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Form.Item>

        <Form.List name="gallery">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="border p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Form.Item
                      {...restField}
                      name={[name, "title"]}
                      label="Image Title"
                    >
                      <Input placeholder="Image title" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "subtitle"]}
                      label="Image Subtitle"
                    >
                      <Input placeholder="Image subtitle" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "sequence_no"]}
                      label="Sequence No"
                      rules={[
                        {
                          required: true,
                          message: "Please enter sequence number",
                        },
                      ]}
                    >
                      <InputNumber className="w-full" min={1} />
                    </Form.Item>
                  </div>

                  {/* Show existing image if available */}
                  {!isAdd && data?.gallery?.[name]?.image_url && (
                    <div className="mb-4">
                      <span className="text-gray-600 font-medium">
                        Current Image:
                      </span>
                      <div className="relative group">
                        <img
                          src={getImageUrl(data.gallery[name].image_url)}
                          alt={`Gallery ${name + 1}`}
                          className="w-32 h-32 object-cover rounded transition-all duration-300"
                          style={
                            form.getFieldValue(["gallery", name, "isDeleted"])
                              ? deletedImageStyle
                              : {}
                          }
                        />
                        {form.getFieldValue(["gallery", name, "isDeleted"]) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-20 rounded">
                            <span className="text-red-600 font-medium">
                              Marked for deletion
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show upload only for new images or when editing */}
                  {(!data?.gallery?.[name]?.image_url ||
                    !data?.gallery?.[name]?.id) && (
                    <Form.Item
                      label="Upload Image"
                      required={!data?.gallery?.[name]?.image_url}
                    >
                      <Upload.Dragger
                        accept="image/*"
                        beforeUpload={beforeUpload}
                        onChange={(info) => handleGalleryChange(info, name)}
                        maxCount={1}
                        showUploadList={true}
                        fileList={
                          form.getFieldValue(["gallery", name, "file"])
                            ? [form.getFieldValue(["gallery", name, "file"])]
                            : []
                        }
                      >
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                          Click or drag image to upload
                        </p>
                      </Upload.Dragger>
                    </Form.Item>
                  )}

                  <Button
                    type="text"
                    className={`mt-2 ${
                      form.getFieldValue(["gallery", name, "isDeleted"])
                        ? "text-red-700 bg-red-50"
                        : "text-red-500 hover:text-red-700"
                    }`}
                    onClick={() => {
                      const currentGallery =
                        form.getFieldValue("gallery") || [];
                      const currentItem = currentGallery[name];

                      if (currentItem?.id) {
                        // For existing images, mark as deleted but keep in form
                        currentGallery[name] = {
                          ...currentItem,
                          isDeleted: true,
                        };
                        form.setFieldValue("gallery", currentGallery);

                        // Force a re-render to update the UI
                        form.validateFields(["gallery"]);
                      } else {
                        // For new images, remove from form fields
                        remove(name);
                        // Remove from gallery files
                        setGalleryFiles((prev) => {
                          const newFiles = [...prev];
                          newFiles[name] = null;
                          return newFiles;
                        });
                      }
                    }}
                    icon={<MinusCircleOutlined />}
                  >
                    {form.getFieldValue(["gallery", name, "isDeleted"])
                      ? "Marked for deletion"
                      : "Remove this image"}
                  </Button>

                  {form.getFieldValue(["gallery", name, "isDeleted"]) && (
                    <Button
                      type="text"
                      className="mt-2 ml-2 text-green-500 hover:text-green-700"
                      onClick={() => {
                        const currentGallery =
                          form.getFieldValue("gallery") || [];
                        const currentItem = currentGallery[name];

                        currentGallery[name] = {
                          ...currentItem,
                          isDeleted: false,
                        };
                        form.setFieldValue("gallery", currentGallery);

                        // Force a re-render to update the UI
                        form.validateFields(["gallery"]);
                      }}
                      icon={<UndoOutlined />}
                    >
                      Undo deletion
                    </Button>
                  )}
                </div>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Gallery Image
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.List name="key_features">
          {(fields, { add, remove }) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {fields.map(({ key, name, ...restField }) => {
                  const isDeleted = form.getFieldValue([
                    "key_features",
                    name,
                    "isDeleted",
                  ]);
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1"
                      style={isDeleted ? deletedItemStyle : {}}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "feature"]}
                        rules={[{ required: true, message: "Missing feature" }]}
                        className="flex-1 mb-0"
                      >
                        <Input placeholder="Key feature" disabled={isDeleted} />
                      </Form.Item>
                      {isDeleted ? (
                        <Button
                          type="text"
                          className="text-green-500 hover:text-green-700"
                          onClick={() => {
                            const currentFeatures =
                              form.getFieldValue("key_features") || [];
                            currentFeatures[name] = {
                              ...currentFeatures[name],
                              isDeleted: false,
                            };
                            form.setFieldValue("key_features", currentFeatures);
                          }}
                          icon={<UndoOutlined />}
                        />
                      ) : (
                        <MinusCircleOutlined
                          onClick={() => {
                            const currentFeatures =
                              form.getFieldValue("key_features") || [];
                            const currentItem = currentFeatures[name];

                            if (currentItem?.id) {
                              currentFeatures[name] = {
                                ...currentItem,
                                isDeleted: true,
                              };
                              form.setFieldValue(
                                "key_features",
                                currentFeatures
                              );
                            } else {
                              remove(name);
                            }
                          }}
                          className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                          style={{ padding: "8px" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  className="mt-4"
                  icon={<PlusOutlined />}
                >
                  Add Key Feature
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.List name="services">
          {(fields, { add, remove }) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {fields.map(({ key, name, ...restField }) => {
                  const isDeleted = form.getFieldValue([
                    "services",
                    name,
                    "isDeleted",
                  ]);
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-3 w-full"
                      style={isDeleted ? deletedItemStyle : {}}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "service"]}
                        rules={[{ required: true, message: "Missing service" }]}
                        className="flex-1 mb-0"
                      >
                        <Input placeholder="Service" disabled={isDeleted} />
                      </Form.Item>
                      {isDeleted ? (
                        <Button
                          type="text"
                          className="text-green-500 hover:text-green-700"
                          onClick={() => {
                            const currentServices =
                              form.getFieldValue("services") || [];
                            currentServices[name] = {
                              ...currentServices[name],
                              isDeleted: false,
                            };
                            form.setFieldValue("services", currentServices);
                          }}
                          icon={<UndoOutlined />}
                        />
                      ) : (
                        <MinusCircleOutlined
                          onClick={() => {
                            const currentServices =
                              form.getFieldValue("services") || [];
                            const currentItem = currentServices[name];

                            if (currentItem?.id) {
                              currentServices[name] = {
                                ...currentItem,
                                isDeleted: true,
                              };
                              form.setFieldValue("services", currentServices);
                            } else {
                              remove(name);
                            }
                          }}
                          className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                          style={{ padding: "8px" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  className="mt-4"
                  icon={<PlusOutlined />}
                >
                  Add Service
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Drawer>
  );
};

export default CreateProject;
