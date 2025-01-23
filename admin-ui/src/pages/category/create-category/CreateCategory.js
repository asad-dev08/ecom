import { Button, Drawer, Form, Input, Space, Switch, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import {
  saveCategory,
  updateCategory,
} from "../../../store/category/categorySlice";
import toast from "react-hot-toast";
import { BASE_DOC_URL } from "../../../utils/actionTypes";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const CreateCategory = ({ onClose, open, data, isAdd, isView, permission }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [iconUrl, setIconUrl] = useState(null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  useEffect(() => {
    if (data && !isAdd) {
      form.setFieldsValue({
        name: data.name,
        slug: data.slug,
        featured: data.featured,
        productCount: data.productCount,
      });

      if (data.image) {
        setImageUrl(`${BASE_DOC_URL}/${data.image}`);
      }
      if (data.icon) {
        setIconUrl(`${BASE_DOC_URL}/${data.icon}`);
      }
    }
  }, [data, isAdd, form]);

  const validateImage = (file) => {
    const isAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type);
    if (!isAllowedType) {
      toast.error("You can only upload JPG/PNG/WebP files!");
      return false;
    }

    // const isLt2M = file.size <= MAX_IMAGE_SIZE;
    // if (!isLt2M) {
    //   toast.error("Image must be smaller than 2MB!");
    //   return false;
    // }

    return true;
  };

  const handleImageChange = (info) => {
    if (info.file.status === "removed") {
      setImageFile(null);
      setImageUrl(null);
      return;
    }

    const file = info.file;
    if (file && validateImage(file)) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
    }
  };

  const handleIconChange = (info) => {
    if (info.file.status === "removed") {
      setIconFile(null);
      setIconUrl(null);
      return;
    }

    const file = info.file;
    if (file && validateImage(file)) {
      setIconFile(file);
      const previewUrl = URL.createObjectURL(file);
      setIconUrl(previewUrl);
    }
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    form.submit();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      const categoryData = {
        ...values,
        id: isAdd ? 0 : data.id,
        productCount: values.productCount || 0,
      };

      formData.append("data", JSON.stringify(categoryData));

      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (iconFile) {
        formData.append("icon", iconFile);
      }

      if (isAdd) {
        await dispatch(saveCategory(formData)).then((response) => {
          if (response?.payload?.statusCode === 201) {
            toast.success(response?.payload?.message);
            form.resetFields();
            setImageFile(null);
            setImageUrl(null);
            setIconFile(null);
            setIconUrl(null);
            setAutoGenerateSlug(true);
          } else if (response?.payload?.message) {
            // Handle error message from API
            toast.error(response.payload.message);
          }
        });
      } else {
        console.log(formData);
        await dispatch(updateCategory({ id: data.id, formData })).then(
          (response) => {
            if (response?.payload?.statusCode === 200) {
              toast.success(response?.payload?.message);
            } else if (response?.payload?.message) {
              // Handle error message from API
              toast.error(response.payload.message);
            }
          }
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error object properly
      const errorMessage =
        error?.message || "An error occurred while saving the category";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const SubmitButton = ({ form }) => {
    const [submittable, setSubmittable] = React.useState(false);
    const values = Form.useWatch([], form);

    React.useEffect(() => {
      form
        .validateFields({ validateOnly: true })
        .then(() => setSubmittable(true))
        .catch(() => setSubmittable(false));
    }, [form, values]);

    return (
      <Button
        type="primary"
        onClick={handleSaveClick}
        disabled={!submittable}
        loading={loading}
      >
        Save
      </Button>
    );
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setFieldsValue({ name });

    if (autoGenerateSlug) {
      form.setFieldsValue({ slug: generateSlug(name) });
    }
  };

  // useEffect(() => {
  //   return () => {
  //     if (imageUrl && !imageUrl.startsWith("http")) {
  //       URL.revokeObjectURL(imageUrl);
  //     }
  //     if (iconUrl && !iconUrl.startsWith("http")) {
  //       URL.revokeObjectURL(iconUrl);
  //     }
  //   };
  // }, [imageUrl, iconUrl]);

  return (
    <Drawer
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} Category`}
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      maskClosable={false}
      extra={
        <Space>
          {permission &&
          (permission.can_create || permission.can_update) &&
          !isView ? (
            <SubmitButton form={form} />
          ) : null}
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={isView}
        initialValues={{
          name: data?.name || "",
          featured: data?.featured || false,
          productCount: data?.productCount || 0,
        }}
      >
        <Form.Item
          name="name"
          label="Category Name"
          rules={[{ required: true, message: "Please enter category name" }]}
        >
          <Input onChange={handleNameChange} />
        </Form.Item>

        <Form.Item
          name="slug"
          label={
            <Space>
              <span>Slug</span>
              <Switch
                checked={autoGenerateSlug}
                onChange={(checked) => setAutoGenerateSlug(checked)}
                size="small"
                checkedChildren="Auto"
                unCheckedChildren="Manual"
              />
            </Space>
          }
          rules={[
            { required: true, message: "Please enter slug" },
            {
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message:
                "Slug can only contain lowercase letters, numbers, and hyphens",
            },
          ]}
          extra="URL-friendly version of the name. Must be unique."
        >
          <Input
            disabled={autoGenerateSlug}
            placeholder="example-category-name"
          />
        </Form.Item>

        <Form.Item name="image" label="Category Image">
          <Upload.Dragger
            accept=".jpg,.jpeg,.png,.webp"
            maxCount={1}
            beforeUpload={() => false}
            onChange={handleImageChange}
            showUploadList={false}
          >
            {imageUrl ? (
              <div style={{ padding: "20px" }}>
                <img
                  src={imageUrl}
                  alt="category"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag image to upload</p>
                <p className="ant-upload-hint">
                  Support for JPG, PNG, WebP. Max size: 2MB
                </p>
              </>
            )}
          </Upload.Dragger>
          {imageUrl && (
            <Button
              type="text"
              danger
              onClick={() => {
                setImageFile(null);
                setImageUrl(null);
                form.setFieldsValue({ image: null });
              }}
              icon={<DeleteOutlined />}
              style={{ marginTop: 8 }}
            >
              Remove Image
            </Button>
          )}
        </Form.Item>

        <Form.Item name="icon" label="Category Icon">
          <Upload.Dragger
            accept=".jpg,.jpeg,.png,.webp"
            maxCount={1}
            beforeUpload={() => false}
            onChange={handleIconChange}
            showUploadList={false}
          >
            {iconUrl ? (
              <div style={{ padding: "20px" }}>
                <img
                  src={iconUrl}
                  alt="icon"
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag icon to upload</p>
                <p className="ant-upload-hint">
                  Support for JPG, PNG, WebP. Max size: 2MB
                </p>
              </>
            )}
          </Upload.Dragger>
          {iconUrl && (
            <Button
              type="text"
              danger
              onClick={() => {
                setIconFile(null);
                setIconUrl(null);
                form.setFieldsValue({ icon: null });
              }}
              icon={<DeleteOutlined />}
              style={{ marginTop: 8 }}
            >
              Remove Icon
            </Button>
          )}
        </Form.Item>

        <Form.Item name="featured" label="Featured" valuePropName="checked">
          <Switch />
        </Form.Item>

        {!isAdd && (
          <Form.Item name="productCount" label="Product Count">
            <Input disabled />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default CreateCategory;
