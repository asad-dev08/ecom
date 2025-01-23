import React, { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  Upload,
  Switch,
  Rate,
  InputNumber,
  message,
  Space,
} from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { saveSeller, updateSeller } from "../../../store/seller/sellerSlice";
import toast from "react-hot-toast";
import { BASE_DOC_URL } from "../../../utils/actionTypes";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const CreateSeller = ({
  onClose,
  open,
  data,
  isAdd,
  isView,
  permission,
  onSellerChange,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  // Validation helper
  const validateImage = (file) => {
    const isAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type);
    if (!isAllowedType) {
      message.error("You can only upload JPG/PNG/WebP files!");
      return false;
    }

    // const isLt2M = file.size <= MAX_IMAGE_SIZE;
    // if (!isLt2M) {
    //   message.error("Image must be smaller than 2MB!");
    //   return false;
    // }

    return true;
  };

  // Add useEffect to handle initial logo
  useEffect(() => {
    if (data && !isAdd) {
      form.setFieldsValue({
        name: data.name,
        slug: data.slug,
        email: data.email,
        phone: data.phone,
        rating: data.rating,
        reviewCount: data.reviewCount,
        verified: data.verified,
        rating: data.rating || 0,
      });

      if (data.logo) {
        setLogoUrl(`${BASE_DOC_URL}/${data.logo}`);
      }
    }
  }, [data, isAdd, form]);

  // Update logo change handler
  const handleLogoChange = (info) => {
    if (info.file.status === "removed") {
      setLogoFile(null);
      setLogoUrl(null);
      return;
    }

    const file = info.file;
    if (file && validateImage(file)) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoUrl(previewUrl);
    }
  };

  // Add slug generation helper
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Add name change handler
  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setFieldsValue({ name });

    if (autoGenerateSlug) {
      form.setFieldsValue({ slug: generateSlug(name) });
    }
  };

  // Form submit handler
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const sellerData = {
        ...values,
        rating: values.rating || 0,
        reviewCount: values.reviewCount || 0,
      };

      formData.append("data", JSON.stringify(sellerData));

      if (isAdd) {
        await dispatch(saveSeller(formData)).unwrap();
        toast.success("Seller created successfully");
      } else {
        await dispatch(updateSeller({ id: data.id, formData })).unwrap();
        toast.success("Seller updated successfully");
      }

      onSellerChange();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to save seller");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} Seller`}
      width={720}
      onClose={onClose}
      open={open}
      maskClosable={false}
      extra={
        <Space>
          {permission &&
          (permission.can_create || permission.can_update) &&
          !isView ? (
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
            >
              {isAdd ? "Create Seller" : "Update Seller"}
            </Button>
          ) : null}
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={isView}>
        {/* Logo Upload */}
        <Form.Item label="Logo" tooltip="Upload seller logo">
          <div className="space-y-4">
            {logoUrl && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
                {!isView && (
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white/100"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoUrl(null);
                    }}
                  />
                )}
              </div>
            )}

            {!logoUrl && (
              <Upload.Dragger
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                beforeUpload={() => false}
                onChange={handleLogoChange}
                maxCount={1}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag logo to upload</p>
              </Upload.Dragger>
            )}
          </div>
        </Form.Item>

        {/* Basic Information */}
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter seller name" }]}
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
            placeholder="example-seller-name"
          />
        </Form.Item>

        {/* Contact Information */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>

        {/* Rating & Reviews (read-only in edit mode) */}
        {!isAdd && (
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="rating" label="Rating">
              <Rate allowHalf />
            </Form.Item>

            <Form.Item name="reviewCount" label="Review Count">
              <InputNumber disabled />
            </Form.Item>
          </div>
        )}

        {/* Verification Status - only show in edit mode */}

        <Form.Item name="verified" label="Verified" valuePropName="checked">
          <Switch disabled={true} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateSeller;
